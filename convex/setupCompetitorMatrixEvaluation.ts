
import { action } from "./_generated/server";
import Scorecard from "scorecard-ai";

export const setupCompetitorMatrixEvaluation = action({
  args: {},
  handler: async () => {
    console.log("--- Starting Scorecard.ai Competitor Matrix Evaluation Setup ---");

    const scorecardApiKey = process.env.SCORECARD_API_KEY;
    if (!scorecardApiKey) {
      const errorMsg = "SCORECARD_API_KEY is not set. Please add it to your Convex environment variables.";
      console.error(errorMsg);
      return { success: false, error: errorMsg };
    }

    try {
      const client = new Scorecard({ apiKey: scorecardApiKey });

      // 1. Create a new Project
      console.log("Creating new project for Competitor Matrix...");
      const project = await client.projects.create({
        name: "VentureSmith Competitor Matrix Evaluation",
        description: "Automated evaluation for the Competitor Matrix feature."
      });
      console.log(`Project created with ID: ${project.id}`);

      // 2. Create Metrics
      console.log("Creating metrics for Competitor Matrix...");
      const metricsToCreate = [
        { name: "Completeness", description: "Does the matrix include all key competitors and relevant comparison criteria?" },
        { name: "Accuracy", description: "Is the information presented in the matrix accurate and verifiable?" },
        { name: "Actionability", description: "Does the matrix provide clear strategic insights that can inform business decisions?" },
      ];

      const createdMetrics = await Promise.all(
        metricsToCreate.map(metric => 
          client.metrics.create(project.id, {
            name: metric.name,
            description: metric.description,
            evalType: 'ai',
            outputType: 'boolean',
            promptTemplate: `Is the following competitor matrix output good in terms of ${metric.name}? Answer with only 'true' or 'false'. Content: {{outputs.output}}`,
          })
        )
      );
      const metricIds = createdMetrics.map(m => m.id);
      console.log(`Metrics created with IDs: ${metricIds.join(", ")}`);

      // 3. Create Testset
      console.log("Creating testset for Competitor Matrix...");
      const testsetSchema = {
        type: "object",
        properties: {
          startup_name: { type: "string" },
          market_research_summary: { type: "string" },
        },
        required: ["startup_name", "market_research_summary"],
      };

      const testset = await client.testsets.create(project.id, {
        name: "Competitor Matrix",
        description: "Test cases for the competitor matrix generation feature.",
        jsonSchema: testsetSchema,
        fieldMapping: {
            inputs: ["startup_name", "market_research_summary"],
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
                    startup_name: "Innovatech",
                    market_research_summary: "The market for AI-driven project management tools is growing rapidly, with key players like Asana, Jira, and Monday.com dominating the space.",
                }
            }
        ]
      });
      console.log("Dummy testcase created.");

      // 5. Log the config snippet to add
      const configSnippet = `
  competitorMatrix: {
    projectId: "${project.id}",
    testsetId: "${testset.id}",
    metricIds: [${metricIds.map(id => `"${id}"`).join(", ")}],
  },
`;

      console.log("\n--- ✅ Competitor Matrix Setup Complete! ---");
      console.log("Please copy the following code snippet and add it inside the `SCORECARD_CONFIG` object in your `convex/scorecard.config.ts` file:");
      console.log("--------------------------------------------------");
      console.log(configSnippet);
      console.log("--------------------------------------------------");

    } catch (error: any) {
      console.error("Failed to setup Scorecard.ai Competitor Matrix evaluation.", error.message);
      return { success: false, error: error.message };
    }
  },
});
