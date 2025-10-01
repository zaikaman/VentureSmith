
import { action } from "./_generated/server";
import Scorecard from "scorecard-ai";

export const setupMarketingCopyEvaluation = action({
  args: {},
  handler: async () => {
    console.log("--- Starting Scorecard.ai Marketing Copy Evaluation Setup ---");

    const scorecardApiKey = process.env.SCORECARD_API_KEY;
    if (!scorecardApiKey) {
      const errorMsg = "SCORECARD_API_KEY is not set. Please add it to your Convex environment variables.";
      console.error(errorMsg);
      return { success: false, error: errorMsg };
    }

    try {
      const client = new Scorecard({ apiKey: scorecardApiKey });

      // 1. Create a new Project
      console.log("Creating new project for Marketing Copy...");
      const project = await client.projects.create({
        name: "VentureSmith Marketing Copy Evaluation",
        description: "Automated evaluation for the Generate Marketing Copy feature."
      });
      console.log(`Project created with ID: ${project.id}`);

      // 2. Create Metrics
      console.log("Creating metrics for Marketing Copy...");
      const metricsToCreate = [
        { name: "Persuasiveness", description: "Is the copy persuasive and compelling to the target audience?" },
        { name: "Clarity", description: "Is the message clear, concise, and easy to understand?" },
        { name: "BrandVoice", description: "Does the copy consistently reflect the defined brand voice and tone?" },
      ];

      const createdMetrics = await Promise.all(
        metricsToCreate.map(metric => 
          client.metrics.create(project.id, {
            name: metric.name,
            description: metric.description,
            evalType: 'ai',
            outputType: 'boolean',
            promptTemplate: `Is the following marketing copy good in terms of ${metric.name}? Answer with only 'true' or 'false'. Content: {{outputs.output}}`,
          })
        )
      );
      const metricIds = createdMetrics.map(m => m.id);
      console.log(`Metrics created with IDs: ${metricIds.join(", ")}`);

      // 3. Create Testset
      console.log("Creating testset for Marketing Copy...");
      const testsetSchema = {
        type: "object",
        properties: {
          full_context: { type: "string" },
        },
        required: ["full_context"],
      };

      const testset = await client.testsets.create(project.id, {
        name: "Marketing Copy Generation",
        description: "Test cases for the marketing copy generation feature.",
        jsonSchema: testsetSchema,
        fieldMapping: {
            inputs: ["full_context"],
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
                    full_context: "Full context including brand identity, personas, and pricing strategy.",
                }
            }
        ]
      });
      console.log("Dummy testcase created.");

      // 5. Log the config snippet to add
      const configSnippet = `
  marketingCopy: {
    projectId: "${project.id}",
    testsetId: "${testset.id}",
    metricIds: [${metricIds.map(id => `"${id}"`).join(", ")}],
  },
`;

      console.log("\n--- ✅ Marketing Copy Setup Complete! ---");
      console.log("Please copy the following code snippet and add it inside the `SCORECARD_CONFIG` object in your `convex/scorecard.config.ts` file:");
      console.log("--------------------------------------------------");
      console.log(configSnippet);
      console.log("--------------------------------------------------");

    } catch (error: any) {
      console.error("Failed to setup Scorecard.ai Marketing Copy evaluation.", error.message);
      return { success: false, error: error.message };
    }
  },
});
