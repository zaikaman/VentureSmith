
import { action } from "./_generated/server";
import Scorecard from "scorecard-ai";

export const setupCustomerPersonasEvaluation = action({
  args: {},
  handler: async () => {
    console.log("--- Starting Scorecard.ai Customer Personas Evaluation Setup ---");

    const scorecardApiKey = process.env.SCORECARD_API_KEY;
    if (!scorecardApiKey) {
      const errorMsg = "SCORECARD_API_KEY is not set. Please add it to your Convex environment variables.";
      console.error(errorMsg);
      return { success: false, error: errorMsg };
    }

    try {
      const client = new Scorecard({ apiKey: scorecardApiKey });

      // 1. Create a new Project
      console.log("Creating new project for Customer Personas...");
      const project = await client.projects.create({
        name: "VentureSmith Customer Personas Evaluation",
        description: "Automated evaluation for the Generate Customer Personas feature."
      });
      console.log(`Project created with ID: ${project.id}`);

      // 2. Create Metrics
      console.log("Creating metrics for Customer Personas...");
      const metricsToCreate = [
        { name: "Detailing", description: "Are the personas well-described with relevant demographic, psychographic, and behavioral details?" },
        { name: "Relevance", description: "Are the created personas directly relevant to the business idea and target market?" },
        { name: "Empathy", description: "Does the persona description evoke empathy and a clear understanding of the user's needs and pain points?" },
      ];

      const createdMetrics = await Promise.all(
        metricsToCreate.map(metric => 
          client.metrics.create(project.id, {
            name: metric.name,
            description: metric.description,
            evalType: 'ai',
            outputType: 'boolean',
            promptTemplate: `Is the following customer persona output good in terms of ${metric.name}? Answer with only 'true' or 'false'. Content: {{outputs.output}}`,
          })
        )
      );
      const metricIds = createdMetrics.map(m => m.id);
      console.log(`Metrics created with IDs: ${metricIds.join(", ")}`);

      // 3. Create Testset
      console.log("Creating testset for Customer Personas...");
      const testsetSchema = {
        type: "object",
        properties: {
          business_idea: { type: "string" },
          market_research: { type: "string" },
        },
        required: ["business_idea", "market_research"],
      };

      const testset = await client.testsets.create(project.id, {
        name: "Customer Personas",
        description: "Test cases for the customer persona generation feature.",
        jsonSchema: testsetSchema,
        fieldMapping: {
            inputs: ["business_idea", "market_research"],
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
                    business_idea: "A subscription box for eco-friendly cleaning products.",
                    market_research: "Consumers are increasingly looking for sustainable and non-toxic home products. The target audience is environmentally conscious millennials.",
                }
            }
        ]
      });
      console.log("Dummy testcase created.");

      // 5. Log the config snippet to add
      const configSnippet = `
  customerPersonas: {
    projectId: "${project.id}",
    testsetId: "${testset.id}",
    metricIds: [${metricIds.map(id => `"${id}"`).join(", ")}],
  },
`;

      console.log("\n--- ✅ Customer Personas Setup Complete! ---");
      console.log("Please copy the following code snippet and add it inside the `SCORECARD_CONFIG` object in your `convex/scorecard.config.ts` file:");
      console.log("--------------------------------------------------");
      console.log(configSnippet);
      console.log("--------------------------------------------------");

    } catch (error: any) {
      console.error("Failed to setup Scorecard.ai Customer Personas evaluation.", error.message);
      return { success: false, error: error.message };
    }
  },
});
