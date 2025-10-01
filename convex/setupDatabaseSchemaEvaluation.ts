
import { action } from "./_generated/server";
import Scorecard from "scorecard-ai";

export const setupDatabaseSchemaEvaluation = action({
  args: {},
  handler: async () => {
    console.log("--- Starting Scorecard.ai Database Schema Evaluation Setup ---");

    const scorecardApiKey = process.env.SCORECARD_API_KEY;
    if (!scorecardApiKey) {
      const errorMsg = "SCORECARD_API_KEY is not set. Please add it to your Convex environment variables.";
      console.error(errorMsg);
      return { success: false, error: errorMsg };
    }

    try {
      const client = new Scorecard({ apiKey: scorecardApiKey });

      // 1. Create a new Project
      console.log("Creating new project for Database Schema...");
      const project = await client.projects.create({
        name: "VentureSmith Database Schema Evaluation",
        description: "Automated evaluation for the Generate Database Schema feature."
      });
      console.log(`Project created with ID: ${project.id}`);

      // 2. Create Metrics
      console.log("Creating metrics for Database Schema...");
      const metricsToCreate = [
        { name: "Normalization", description: "Is the database schema well-normalized to reduce data redundancy?" },
        { name: "Completeness", description: "Does the schema include all necessary tables and fields to support the application's features?" },
        { name: "Clarity", description: "Are table and column names clear, consistent, and easy to understand?" },
      ];

      const createdMetrics = await Promise.all(
        metricsToCreate.map(metric => 
          client.metrics.create(project.id, {
            name: metric.name,
            description: metric.description,
            evalType: 'ai',
            outputType: 'boolean',
            promptTemplate: `Is the following database schema good in terms of ${metric.name}? Answer with only 'true' or 'false'. Content: {{outputs.output}}`,
          })
        )
      );
      const metricIds = createdMetrics.map(m => m.id);
      console.log(`Metrics created with IDs: ${metricIds.join(", ")}`);

      // 3. Create Testset
      console.log("Creating testset for Database Schema...");
      const testsetSchema = {
        type: "object",
        properties: {
          full_context: { type: "string" },
        },
        required: ["full_context"],
      };

      const testset = await client.testsets.create(project.id, {
        name: "Database Schema Generation",
        description: "Test cases for the database schema generation feature.",
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
                    full_context: "Full context including brainstorm results and user flow diagram.",
                }
            }
        ]
      });
      console.log("Dummy testcase created.");

      // 5. Log the config snippet to add
      const configSnippet = `
  databaseSchema: {
    projectId: "${project.id}",
    testsetId: "${testset.id}",
    metricIds: [${metricIds.map(id => `"${id}"`).join(", ")}],
  },
`;

      console.log("\n--- ✅ Database Schema Setup Complete! ---");
      console.log("Please copy the following code snippet and add it inside the `SCORECARD_CONFIG` object in your `convex/scorecard.config.ts` file:");
      console.log("--------------------------------------------------");
      console.log(configSnippet);
      console.log("--------------------------------------------------");

    } catch (error: any) {
      console.error("Failed to setup Scorecard.ai Database Schema evaluation.", error.message);
      return { success: false, error: error.message };
    }
  },
});
