
import { action } from "./_generated/server";
import Scorecard from "scorecard-ai";
import { v } from "convex/values";

export const setupScorecardFeature = action({
  args: {},
  handler: async () => {
    console.log("--- Starting Scorecard.ai Feature Scorecard Evaluation Setup ---");

    const scorecardApiKey = process.env.SCORECARD_API_KEY;
    if (!scorecardApiKey) {
      const errorMsg = "SCORECARD_API_KEY is not set. Please add it to your Convex environment variables.";
      console.error(errorMsg);
      return { success: false, error: errorMsg };
    }

    try {
      const client = new Scorecard({ apiKey: scorecardApiKey });

      // 1. Create a new Project
      console.log("Creating new project for Scorecard Feature...");
      const project = await client.projects.create({
        name: "VentureSmith Feature Scorecard Evaluation",
        description: "Automated evaluation for the AI-generated Scorecard feature."
      });
      console.log(`Project created with ID: ${project.id}`);

      // 2. Create Metrics
      console.log("Creating metrics...");
      const metricsToCreate = [
        { name: "Justification Quality", description: "Are the justifications for each score logical and well-explained?" },
        { name: "Score Accuracy", description: "Do the scores (0-100) seem reasonable based on the input data?" },
        { name: "Completeness", description: "Does the output contain all required fields?" },
      ];

      const createdMetrics = await Promise.all(
        metricsToCreate.map(metric => 
          client.metrics.create(project.id, {
            name: metric.name,
            description: metric.description,
            evalType: 'ai',
            outputType: 'boolean',
            promptTemplate: `Is the following AI-generated scorecard good in terms of ${metric.name}? Answer with only 'true' or 'false'. Content: {{outputs.output}}`,
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
        name: "AI Scorecard Generation",
        description: "Test cases for the AI-generated scorecard feature.",
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
                    fullContext: "{\"name\":\"Test Startup\",\"refinedIdea\":\"A test idea\"}",
                }
            }
        ]
      });
      console.log("Dummy testcase created.");

      // 5. Log the config snippet to add
      const configSnippet = `
  scorecard: {
    projectId: "${project.id}",
    testsetId: "${testset.id}",
    metricIds: [${metricIds.map(id => `"${id}"`).join(", ")}],
  },
`;

      console.log("\n--- ✅ AI Scorecard Setup Complete! ---");
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
