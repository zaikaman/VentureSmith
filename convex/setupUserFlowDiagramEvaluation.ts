
import { action } from "./_generated/server";
import Scorecard from "scorecard-ai";

export const setupUserFlowDiagramEvaluation = action({
  args: {},
  handler: async () => {
    console.log("--- Starting Scorecard.ai User Flow Diagram Evaluation Setup ---");

    const scorecardApiKey = process.env.SCORECARD_API_KEY;
    if (!scorecardApiKey) {
      const errorMsg = "SCORECARD_API_KEY is not set. Please add it to your Convex environment variables.";
      console.error(errorMsg);
      return { success: false, error: errorMsg };
    }

    try {
      const client = new Scorecard({ apiKey: scorecardApiKey });

      // 1. Create a new Project
      console.log("Creating new project for User Flow Diagram...");
      const project = await client.projects.create({
        name: "VentureSmith User Flow Diagram Evaluation",
        description: "Automated evaluation for the Generate User Flow Diagram feature."
      });
      console.log(`Project created with ID: ${project.id}`);

      // 2. Create Metrics
      console.log("Creating metrics for User Flow Diagram...");
      const metricsToCreate = [
        { name: "Clarity", description: "Is the user flow diagram clear and easy to understand?" },
        { name: "Completeness", description: "Does the diagram cover all critical user paths and interactions?" },
        { name: "LogicalFlow", description: "Is the flow of steps logical and intuitive for the user?" },
      ];

      const createdMetrics = await Promise.all(
        metricsToCreate.map(metric => 
          client.metrics.create(project.id, {
            name: metric.name,
            description: metric.description,
            evalType: 'ai',
            outputType: 'boolean',
            promptTemplate: `Is the following user flow diagram (in MermaidJS format) good in terms of ${metric.name}? Answer with only 'true' or 'false'. Content: {{outputs.output}}`,
          })
        )
      );
      const metricIds = createdMetrics.map(m => m.id);
      console.log(`Metrics created with IDs: ${metricIds.join(", ")}`);

      // 3. Create Testset
      console.log("Creating testset for User Flow Diagram...");
      const testsetSchema = {
        type: "object",
        properties: {
          refined_idea: { type: "string" },
          personas: { type: "string" },
        },
        required: ["refined_idea", "personas"],
      };

      const testset = await client.testsets.create(project.id, {
        name: "User Flow Diagram",
        description: "Test cases for the user flow diagram generation feature.",
        jsonSchema: testsetSchema,
        fieldMapping: {
            inputs: ["refined_idea", "personas"],
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
                    refined_idea: "An app for booking local dog walkers.",
                    personas: "[Persona 1: Busy dog owner. Persona 2: Professional dog walker.]",
                }
            }
        ]
      });
      console.log("Dummy testcase created.");

      // 5. Log the config snippet to add
      const configSnippet = `
  userFlowDiagram: {
    projectId: "${project.id}",
    testsetId: "${testset.id}",
    metricIds: [${metricIds.map(id => `"${id}"`).join(", ")}],
  },
`;

      console.log("\n--- ✅ User Flow Diagram Setup Complete! ---");
      console.log("Please copy the following code snippet and add it inside the `SCORECARD_CONFIG` object in your `convex/scorecard.config.ts` file:");
      console.log("--------------------------------------------------");
      console.log(configSnippet);
      console.log("--------------------------------------------------");

    } catch (error: any) {
      console.error("Failed to setup Scorecard.ai User Flow Diagram evaluation.", error.message);
      return { success: false, error: error.message };
    }
  },
});
