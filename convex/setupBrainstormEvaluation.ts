

import { action } from "./_generated/server";
import Scorecard from "scorecard-ai";
import { v } from "convex/values";

export const setupBrainstorm = action({
  args: {},
  handler: async () => {
    console.log("--- Starting Scorecard.ai Brainstorm Evaluation Setup ---");

    const scorecardApiKey = process.env.SCORECARD_API_KEY;
    if (!scorecardApiKey) {
      const errorMsg = "SCORECARD_API_KEY is not set. Please add it to your Convex environment variables.";
      console.error(errorMsg);
      return { success: false, error: errorMsg };
    }

    try {
      const client = new Scorecard({ apiKey: scorecardApiKey });

      // 1. Create a new Project for Brainstorming
      console.log("Creating new project for brainstorming...");
      const project = await client.projects.create({
        name: "VentureSmith Brainstorm Evaluation",
        description: "Automated evaluation for the Brainstorm & Refine Idea feature."
      });
      console.log(`Project created with ID: ${project.id}`);

      // 2. Create Metrics for Brainstorming
      console.log("Creating metrics for brainstorming...");
      const metricsToCreate = [
        { name: "Creativity", description: "How novel or innovative is the refined idea?" },
        { name: "Actionability", description: "How easy is it to start acting on the proposed features and angles?" },
        { name: "Clarity", description: "Is the refined idea clear and easy to understand?" },
      ];

      const createdMetrics = await Promise.all(
        metricsToCreate.map(metric => 
          client.metrics.create(project.id, {
            name: metric.name,
            description: metric.description,
            evalType: 'ai',
            outputType: 'boolean',
            promptTemplate: `Is the following brainstorm output good in terms of ${metric.name}? Answer with only 'true' or 'false'. Content: {{outputs.output}}`,
          })
        )
      );
      const metricIds = createdMetrics.map(m => m.id);
      console.log(`Metrics created with IDs: ${metricIds.join(", ")}`);

      // 3. Create Testset for Brainstorming
      console.log("Creating testset for brainstorming...");
      const testsetSchema = {
        type: "object",
        properties: {
          raw_idea: { type: "string" },
        },
        required: ["raw_idea"],
      };

      const testset = await client.testsets.create(project.id, {
        name: "Brainstorm & Refine Idea",
        description: "Test cases for the brainstorming and idea refinement feature.",
        jsonSchema: testsetSchema,
        fieldMapping: {
            inputs: ["raw_idea"],
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
                    raw_idea: "An app that uses AI to suggest recipes based on leftover ingredients.",
                }
            }
        ]
      });
      console.log("Dummy testcase created.");

      // 5. Log the config snippet to add
      const configSnippet = `
  brainstorm: {
    projectId: "${project.id}",
    testsetId: "${testset.id}",
    metricIds: [${metricIds.map(id => `"${id}"`).join(", ")}],
  },
`;

      console.log("\n--- ✅ Brainstorm Setup Complete! ---");
      console.log("Please copy the following code snippet and add it inside the `SCORECARD_CONFIG` object in your `convex/scorecard.config.ts` file:");
      console.log("--------------------------------------------------");
      console.log(configSnippet);
      console.log("--------------------------------------------------");

    } catch (error: any) {
      console.error("Failed to setup Scorecard.ai brainstorm evaluation.", error.message);
      return { success: false, error: error.message };
    }
  },
});
