
import { action } from "./_generated/server";
import Scorecard from "scorecard-ai";

export const setupProductHuntKitEvaluation = action({
  args: {},
  handler: async () => {
    console.log("--- Starting Scorecard.ai Product Hunt Kit Evaluation Setup ---");

    const scorecardApiKey = process.env.SCORECARD_API_KEY;
    if (!scorecardApiKey) {
      const errorMsg = "SCORECARD_API_KEY is not set. Please add it to your Convex environment variables.";
      console.error(errorMsg);
      return { success: false, error: errorMsg };
    }

    try {
      const client = new Scorecard({ apiKey: scorecardApiKey });

      // 1. Create a new Project
      console.log("Creating new project for Product Hunt Kit...");
      const project = await client.projects.create({
        name: "VentureSmith Product Hunt Kit Evaluation",
        description: "Automated evaluation for the Product Hunt Launch Kit feature."
      });
      console.log(`Project created with ID: ${project.id}`);

      // 2. Create Metrics
      console.log("Creating metrics for Product Hunt Kit...");
      const metricsToCreate = [
        { name: "Completeness", description: "Does the kit include all essential elements for a Product Hunt launch (e.g., tagline, description, media assets)?" },
        { name: "Compellingness", description: "Is the messaging compelling and likely to attract upvotes and interest?" },
        { name: "Clarity", description: "Are all components of the launch kit clear, concise, and well-written?" },
      ];

      const createdMetrics = await Promise.all(
        metricsToCreate.map(metric => 
          client.metrics.create(project.id, {
            name: metric.name,
            description: metric.description,
            evalType: 'ai',
            outputType: 'boolean',
            promptTemplate: `Is the following Product Hunt launch kit good in terms of ${metric.name}? Answer with only 'true' or 'false'. Content: {{outputs.output}}`,
          })
        )
      );
      const metricIds = createdMetrics.map(m => m.id);
      console.log(`Metrics created with IDs: ${metricIds.join(", ")}`);

      // 3. Create Testset
      console.log("Creating testset for Product Hunt Kit...");
      const testsetSchema = {
        type: "object",
        properties: {
          full_context: { type: "string" },
        },
        required: ["full_context"],
      };

      const testset = await client.testsets.create(project.id, {
        name: "Product Hunt Launch Kit Generation",
        description: "Test cases for the Product Hunt launch kit generation feature.",
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
                    full_context: "Full context including business plan, marketing copy, and brand identity.",
                }
            }
        ]
      });
      console.log("Dummy testcase created.");

      // 5. Log the config snippet to add
      const configSnippet = `
  productHuntKit: {
    projectId: "${project.id}",
    testsetId: "${testset.id}",
    metricIds: [${metricIds.map(id => `"${id}"`).join(", ")}],
  },
`;

      console.log("\n--- ✅ Product Hunt Kit Setup Complete! ---");
      console.log("Please copy the following code snippet and add it inside the `SCORECARD_CONFIG` object in your `convex/scorecard.config.ts` file:");
      console.log("--------------------------------------------------");
      console.log(configSnippet);
      console.log("--------------------------------------------------");

    } catch (error: any) {
      console.error("Failed to setup Scorecard.ai Product Hunt Kit evaluation.", error.message);
      return { success: false, error: error.message };
    }
  },
});
