

import { action } from "./_generated/server";
import Scorecard from "scorecard-ai";

export const setupPricingStrategyEvaluation = action({
  args: {},
  handler: async () => {
    console.log("--- Starting Scorecard.ai Pricing Strategy Evaluation Setup ---");

    const scorecardApiKey = process.env.SCORECARD_API_KEY;
    if (!scorecardApiKey) {
      const errorMsg = "SCORECARD_API_KEY is not set. Please add it to your Convex environment variables.";
      console.error(errorMsg);
      return { success: false, error: errorMsg };
    }

    try {
      const client = new Scorecard({ apiKey: scorecardApiKey });

      // 1. Create a new Project
      console.log("Creating new project for Pricing Strategy...");
      const project = await client.projects.create({
        name: "VentureSmith Pricing Strategy Evaluation",
        description: "Automated evaluation for the AI Pricing Strategy feature."
      });
      console.log(`Project created with ID: ${project.id}`);

      // 2. Create Metrics
      console.log("Creating metrics for Pricing Strategy...");
      const metricsToCreate = [
        { name: "ValueAlignment", description: "Does the pricing strategy align with the value provided to the customer personas?" },
        { name: "MarketFit", description: "Is the pricing competitive and appropriate for the target market, considering the competitor matrix?" },
        { name: "Clarity", description: "Are the pricing tiers and options clear, simple, and easy to understand?" },
      ];

      const createdMetrics = await Promise.all(
        metricsToCreate.map(metric => 
          client.metrics.create(project.id, {
            name: metric.name,
            description: metric.description,
            evalType: 'ai',
            outputType: 'boolean',
            promptTemplate: `Is the following pricing strategy good in terms of ${metric.name}? Answer with only 'true' or 'false'. Content: {{outputs.output}}`,
          })
        )
      );
      const metricIds = createdMetrics.map(m => m.id);
      console.log(`Metrics created with IDs: ${metricIds.join(", ")}`);

      // 3. Create Testset
      console.log("Creating testset for Pricing Strategy...");
      const testsetSchema = {
        type: "object",
        properties: {
          full_context: { type: "string" },
        },
        required: ["full_context"],
      };

      const testset = await client.testsets.create(project.id, {
        name: "Pricing Strategy Generation",
        description: "Test cases for the AI pricing strategy generation feature.",
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
                    full_context: "Full context including business plan, customer personas, and competitor matrix.",
                }
            }
        ]
      });
      console.log("Dummy testcase created.");

      // 5. Log the config snippet to add
      const configSnippet = `
  pricingStrategy: {
    projectId: "${project.id}",
    testsetId: "${testset.id}",
    metricIds: [${metricIds.map(id => `"${id}"`).join(",")}],
  },
`;

      console.log("\n--- ✅ Pricing Strategy Setup Complete! ---");
      console.log("Please copy the following code snippet and add it inside the `SCORECARD_CONFIG` object in your `convex/scorecard.config.ts` file:");
      console.log("--------------------------------------------------");
      console.log(configSnippet);
      console.log("--------------------------------------------------");

    } catch (error: any) {
      console.error("Failed to setup Scorecard.ai Pricing Strategy evaluation.", error.message);
      return { success: false, error: error.message };
    }
  },
});
