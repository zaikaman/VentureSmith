
import { action } from "./_generated/server";
import Scorecard from "scorecard-ai";

export const setupBrainstormABTestIdeas = action({
  args: {},
  handler: async () => {
    console.log("--- Starting Scorecard.ai Brainstorm A/B Test Ideas Evaluation Setup ---");

    const scorecardApiKey = process.env.SCORECARD_API_KEY;
    if (!scorecardApiKey) {
      const errorMsg = "SCORECARD_API_KEY is not set. Please add it to your Convex environment variables.";
      console.error(errorMsg);
      return { success: false, error: errorMsg };
    }

    try {
      const client = new Scorecard({ apiKey: scorecardApiKey });

      // 1. Create a new Project
      console.log("Creating new project for Brainstorm A/B Test Ideas...");
      const project = await client.projects.create({
        name: "VentureSmith Brainstorm A/B Test Ideas Evaluation",
        description: "Automated evaluation for the Brainstorm A/B Test Ideas feature."
      });
      console.log(`Project created with ID: ${project.id}`);

      // 2. Create Metrics
      console.log("Creating metrics...");
      const metricsToCreate = [
        { name: "Clarity of Hypothesis", description: "Is the hypothesis for each A/B test idea clear and well-defined?" },
        { name: "Testability", description: "Is the proposed A/B test practical and easy to implement?" },
        { name: "Potential Impact", description: "Does the A/B test have the potential to significantly impact key business metrics?" },
      ];

      const createdMetrics = await Promise.all(
        metricsToCreate.map(metric => 
          client.metrics.create(project.id, {
            name: metric.name,
            description: metric.description,
            evalType: 'ai',
            outputType: 'boolean',
            promptTemplate: `Is the following set of A/B test ideas good in terms of ${metric.name}? Answer with only 'true' or 'false'. Content: {{outputs.output}}`,
          })
        )
      );
      const metricIds = createdMetrics.map(m => m.id);
      console.log(`Metrics created with IDs: ${metricIds.join(", ")}`);

      // 3. Create Testset
      console.log("Creating testset...");
      const testsetSchema = {
        type: "object",
        properties: {
          fullContext: { type: "string" }, // Stringified context
        },
        required: ["fullContext"],
      };

      const testset = await client.testsets.create(project.id, {
        name: "Brainstorm A/B Test Ideas",
        description: "Test cases for the A/B test ideas generation feature.",
        jsonSchema: testsetSchema,
        fieldMapping: {
            inputs: ["fullContext"],
            expected: [],
            metadata: [],
        }
      });
      console.log(`Testset created with ID: ${testset.id}`);

      // 4. Create a dummy Testcase
      console.log("Creating dummy testcase...");
      await client.testcases.create(testset.id, {
        items: [
            {
                jsonData: {
                    fullContext: "{\"name\":\"Test E-commerce Site\",\"refinedIdea\":\"A site that sells custom t-shirts.\"}",
                }
            }
        ]
      });
      console.log("Dummy testcase created.");

      // 5. Log the config snippet to add
      const configSnippet = `
  brainstormABTestIdeas: {
    projectId: "${project.id}",
    testsetId: "${testset.id}",
    metricIds: [${metricIds.map(id => `"${id}"`).join(", ")}],
  },
`;

      console.log("\n--- ✅ Brainstorm A/B Test Ideas Setup Complete! ---");
      console.log("Please copy the following code snippet and add it inside the `SCORECARD_CONFIG` object in your `convex/scorecard.config.ts` file:");
      console.log("--------------------------------------------------");
      console.log(configSnippet);
      console.log("--------------------------------------------------");

      return { success: true };

    } catch (error: any) {
      console.error("Failed to setup Scorecard.ai evaluation.", error.message);
      return { success: false, error: error.message };
    }
  },
});
