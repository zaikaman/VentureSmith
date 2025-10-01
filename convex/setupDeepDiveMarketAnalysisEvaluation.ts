
import { action } from "./_generated/server";
import Scorecard from "scorecard-ai";

export const setupDeepDiveMarketAnalysis = action({
  args: {},
  handler: async () => {
    console.log("--- Starting Scorecard.ai Deep Dive Market Analysis Evaluation Setup ---");

    const scorecardApiKey = process.env.SCORECARD_API_KEY;
    if (!scorecardApiKey) {
      const errorMsg = "SCORECARD_API_KEY is not set. Please add it to your Convex environment variables.";
      console.error(errorMsg);
      return { success: false, error: errorMsg };
    }

    try {
      const client = new Scorecard({ apiKey: scorecardApiKey });

      // 1. Create a new Project
      console.log("Creating new project for Deep Dive Market Analysis...");
      const project = await client.projects.create({
        name: "VentureSmith Deep Dive Market Analysis Evaluation",
        description: "Automated evaluation for the Deep Dive Market Analysis feature."
      });
      console.log(`Project created with ID: ${project.id}`);

      // 2. Create Metrics
      console.log("Creating metrics for Deep Dive Market Analysis...");
      const metricsToCreate = [
        { name: "Depth", description: "How comprehensive and in-depth is the analysis?" },
        { name: "Insightfulness", description: "Does the analysis provide valuable, non-obvious insights?" },
        { name: "DataRelevance", description: "Is the data used relevant and up-to-date for the market analysis?" },
      ];

      const createdMetrics = await Promise.all(
        metricsToCreate.map(metric => 
          client.metrics.create(project.id, {
            name: metric.name,
            description: metric.description,
            evalType: 'ai',
            outputType: 'boolean',
            promptTemplate: `Is the following market analysis output good in terms of ${metric.name}? Answer with only 'true' or 'false'. Content: {{outputs.output}}`,
          })
        )
      );
      const metricIds = createdMetrics.map(m => m.id);
      console.log(`Metrics created with IDs: ${metricIds.join(", ")}`);

      // 3. Create Testset
      console.log("Creating testset for Deep Dive Market Analysis...");
      const testsetSchema = {
        type: "object",
        properties: {
          business_idea: { type: "string" },
          target_market: { type: "string" },
        },
        required: ["business_idea", "target_market"],
      };

      const testset = await client.testsets.create(project.id, {
        name: "Deep Dive Market Analysis",
        description: "Test cases for the deep dive market analysis feature.",
        jsonSchema: testsetSchema,
        fieldMapping: {
            inputs: ["business_idea", "target_market"],
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
                    business_idea: "A platform for local artists to sell their work.",
                    target_market: "Art collectors and enthusiasts in urban areas.",
                }
            }
        ]
      });
      console.log("Dummy testcase created.");

      // 5. Log the config snippet to add
      const configSnippet = `
  deepDiveMarketAnalysis: {
    projectId: "${project.id}",
    testsetId: "${testset.id}",
    metricIds: [${metricIds.map(id => `"${id}"`).join(", ")}],
  },
`;

      console.log("\n--- ✅ Deep Dive Market Analysis Setup Complete! ---");
      console.log("Please copy the following code snippet and add it inside the `SCORECARD_CONFIG` object in your `convex/scorecard.config.ts` file:");
      console.log("--------------------------------------------------");
      console.log(configSnippet);
      console.log("--------------------------------------------------");

    } catch (error: any) {
      console.error("Failed to setup Scorecard.ai Deep Dive Market Analysis evaluation.", error.message);
      return { success: false, error: error.message };
    }
  },
});
