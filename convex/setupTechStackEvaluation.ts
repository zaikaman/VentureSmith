
import { action } from "./_generated/server";
import Scorecard from "scorecard-ai";

export const setupTechStackEvaluation = action({
  args: {},
  handler: async () => {
    console.log("--- Starting Scorecard.ai Tech Stack Evaluation Setup ---");

    const scorecardApiKey = process.env.SCORECARD_API_KEY;
    if (!scorecardApiKey) {
      const errorMsg = "SCORECARD_API_KEY is not set. Please add it to your Convex environment variables.";
      console.error(errorMsg);
      return { success: false, error: errorMsg };
    }

    try {
      const client = new Scorecard({ apiKey: scorecardApiKey });

      // 1. Create a new Project
      console.log("Creating new project for Tech Stack...");
      const project = await client.projects.create({
        name: "VentureSmith Tech Stack Evaluation",
        description: "Automated evaluation for the Generate Technology Stack feature."
      });
      console.log(`Project created with ID: ${project.id}`);

      // 2. Create Metrics
      console.log("Creating metrics for Tech Stack...");
      const metricsToCreate = [
        { name: "Appropriateness", description: "Is the suggested technology stack appropriate for the project's requirements and scale?" },
        { name: "Justification", description: "Is the reasoning for each technology choice clear, logical, and well-justified?" },
        { name: "Completeness", description: "Does the stack cover all necessary components (frontend, backend, database, etc.)?" },
      ];

      const createdMetrics = await Promise.all(
        metricsToCreate.map(metric => 
          client.metrics.create(project.id, {
            name: metric.name,
            description: metric.description,
            evalType: 'ai',
            outputType: 'boolean',
            promptTemplate: `Is the following technology stack suggestion good in terms of ${metric.name}? Answer with only 'true' or 'false'. Content: {{outputs.output}}`,
          })
        )
      );
      const metricIds = createdMetrics.map(m => m.id);
      console.log(`Metrics created with IDs: ${metricIds.join(", ")}`);

      // 3. Create Testset
      console.log("Creating testset for Tech Stack...");
      const testsetSchema = {
        type: "object",
        properties: {
          full_context: { type: "string" },
        },
        required: ["full_context"],
      };

      const testset = await client.testsets.create(project.id, {
        name: "Tech Stack Generation",
        description: "Test cases for the technology stack generation feature.",
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
                    full_context: "Full context including idea, features, and user flow.",
                }
            }
        ]
      });
      console.log("Dummy testcase created.");

      // 5. Log the config snippet to add
      const configSnippet = `
  techStack: {
    projectId: "${project.id}",
    testsetId: "${testset.id}",
    metricIds: [${metricIds.map(id => `"${id}"`).join(", ")}],
  },
`;

      console.log("\n--- ✅ Tech Stack Setup Complete! ---");
      console.log("Please copy the following code snippet and add it inside the `SCORECARD_CONFIG` object in your `convex/scorecard.config.ts` file:");
      console.log("--------------------------------------------------");
      console.log(configSnippet);
      console.log("--------------------------------------------------");

    } catch (error: any) {
      console.error("Failed to setup Scorecard.ai Tech Stack evaluation.", error.message);
      return { success: false, error: error.message };
    }
  },
});
