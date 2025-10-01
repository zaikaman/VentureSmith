
import { action } from "./_generated/server";
import Scorecard from "scorecard-ai";

export const setupInterviewScriptsEvaluation = action({
  args: {},
  handler: async () => {
    console.log("--- Starting Scorecard.ai Interview Scripts Evaluation Setup ---");

    const scorecardApiKey = process.env.SCORECARD_API_KEY;
    if (!scorecardApiKey) {
      const errorMsg = "SCORECARD_API_KEY is not set. Please add it to your Convex environment variables.";
      console.error(errorMsg);
      return { success: false, error: errorMsg };
    }

    try {
      const client = new Scorecard({ apiKey: scorecardApiKey });

      // 1. Create a new Project
      console.log("Creating new project for Interview Scripts...");
      const project = await client.projects.create({
        name: "VentureSmith Interview Scripts Evaluation",
        description: "Automated evaluation for the Generate Interview Scripts feature."
      });
      console.log(`Project created with ID: ${project.id}`);

      // 2. Create Metrics
      console.log("Creating metrics for Interview Scripts...");
      const metricsToCreate = [
        { name: "Clarity", description: "Are the questions clear, concise, and easy for the user to understand?" },
        { name: "Relevance", description: "Are the questions relevant to validating the core problem and solution?" },
        { name: "Open-endedness", description: "Do the questions encourage detailed, open-ended responses rather than simple yes/no answers?" },
      ];

      const createdMetrics = await Promise.all(
        metricsToCreate.map(metric => 
          client.metrics.create(project.id, {
            name: metric.name,
            description: metric.description,
            evalType: 'ai',
            outputType: 'boolean',
            promptTemplate: `Is the following interview script output good in terms of ${metric.name}? Answer with only 'true' or 'false'. Content: {{outputs.output}}`,
          })
        )
      );
      const metricIds = createdMetrics.map(m => m.id);
      console.log(`Metrics created with IDs: ${metricIds.join(", ")}`);

      // 3. Create Testset
      console.log("Creating testset for Interview Scripts...");
      const testsetSchema = {
        type: "object",
        properties: {
          startup_name: { type: "string" },
          refined_idea: { type: "string" },
          personas: { type: "string" },
        },
        required: ["startup_name", "refined_idea", "personas"],
      };

      const testset = await client.testsets.create(project.id, {
        name: "Interview Scripts",
        description: "Test cases for the interview script generation feature.",
        jsonSchema: testsetSchema,
        fieldMapping: {
            inputs: ["startup_name", "refined_idea", "personas"],
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
                    startup_name: "RecipeAI",
                    refined_idea: "An app that suggests recipes based on leftover ingredients.",
                    personas: "[Persona 1: Busy professional who wants to reduce food waste. Persona 2: Student on a budget.]",
                }
            }
        ]
      });
      console.log("Dummy testcase created.");

      // 5. Log the config snippet to add
      const configSnippet = `
  interviewScripts: {
    projectId: "${project.id}",
    testsetId: "${testset.id}",
    metricIds: [${metricIds.map(id => `"${id}"`).join(",")}],
  },
`;

      console.log("\n--- ✅ Interview Scripts Setup Complete! ---");
      console.log("Please copy the following code snippet and add it inside the `SCORECARD_CONFIG` object in your `convex/scorecard.config.ts` file:");
      console.log("--------------------------------------------------");
      console.log(configSnippet);
      console.log("--------------------------------------------------");

    } catch (error: any) {
      console.error("Failed to setup Scorecard.ai Interview Scripts evaluation.", error.message);
      return { success: false, error: error.message };
    }
  },
});
