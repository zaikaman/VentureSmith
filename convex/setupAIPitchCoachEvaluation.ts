
import { action } from "./_generated/server";
import Scorecard from "scorecard-ai";

export const setupAIPitchCoach = action({
  args: {},
  handler: async () => {
    console.log("--- Starting Scorecard.ai AI Pitch Coach Evaluation Setup ---");

    const scorecardApiKey = process.env.SCORECARD_API_KEY;
    if (!scorecardApiKey) {
      const errorMsg = "SCORECARD_API_KEY is not set. Please add it to your Convex environment variables.";
      console.error(errorMsg);
      return { success: false, error: errorMsg };
    }

    try {
      const client = new Scorecard({ apiKey: scorecardApiKey });

      // 1. Create a new Project
      console.log("Creating new project for AI Pitch Coach...");
      const project = await client.projects.create({
        name: "VentureSmith AI Pitch Coach Evaluation",
        description: "Automated evaluation for the AI Pitch Coach feature."
      });
      console.log(`Project created with ID: ${project.id}`);

      // 2. Create Metrics
      console.log("Creating metrics...");
      const metricsToCreate = [
        { name: "Clarity and Narrative", description: "Does the feedback clearly address the pitch's narrative and clarity?" },
        { name: "Completeness of Content", description: "Does the feedback cover all key aspects of the pitch (problem, solution, market, etc.)?" },
        { name: "Overall Score", description: "Is the overall score a fair reflection of the detailed feedback?" },
      ];

      const createdMetrics = await Promise.all(
        metricsToCreate.map(metric => 
          client.metrics.create(project.id, {
            name: metric.name,
            description: metric.description,
            evalType: 'ai',
            outputType: 'boolean',
            promptTemplate: `Is the following AI pitch coach analysis good in terms of ${metric.name}? Answer with only 'true' or 'false'. Content: {{outputs.output}}`,
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
        name: "AI Pitch Coach",
        description: "Test cases for the AI pitch coach analysis feature.",
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
                    fullContext: "{\"name\":\"Test B2B SaaS\",\"businessPlan\":\"A plan to sell software to businesses.\"}",
                }
            }
        ]
      });
      console.log("Dummy testcase created.");

      // 5. Log the config snippet to add
      const configSnippet = `
  aiPitchCoach: {
    projectId: "${project.id}",
    testsetId: "${testset.id}",
    metricIds: [${metricIds.map(id => `"${id}"`).join(", ")}],
  },
`;

      console.log("\n--- ✅ AI Pitch Coach Setup Complete! ---");
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
