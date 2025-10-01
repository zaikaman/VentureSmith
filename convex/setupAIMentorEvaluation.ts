

import { action } from "./_generated/server";
import Scorecard from "scorecard-ai";

export const setupAIMentorEvaluation = action({
  args: {},
  handler: async () => {
    console.log("--- Starting Scorecard.ai AI Mentor Evaluation Setup ---");

    const scorecardApiKey = process.env.SCORECARD_API_KEY;
    if (!scorecardApiKey) {
      const errorMsg = "SCORECARD_API_KEY is not set. Please add it to your Convex environment variables.";
      console.error(errorMsg);
      return { success: false, error: errorMsg };
    }

    try {
      const client = new Scorecard({ apiKey: scorecardApiKey });

      // 1. Create a new Project
      console.log("Creating new project for AI Mentor Feedback...");
      const project = await client.projects.create({
        name: "VentureSmith AI Mentor Evaluation",
        description: "Automated evaluation for the Get Feedback from AI Mentor feature."
      });
      console.log(`Project created with ID: ${project.id}`);

      // 2. Create Metrics
      console.log("Creating metrics for AI Mentor Feedback...");
      const metricsToCreate = [
        { name: "Actionability", description: "Is the feedback provided by the AI mentor concrete and actionable?" },
        { name: "Constructiveness", description: "Is the feedback constructive, providing clear reasons and suggestions for improvement?" },
        { name: "Comprehensiveness", description: "Does the feedback cover all critical aspects of the startup's progress and documents?" },
      ];

      const createdMetrics = await Promise.all(
        metricsToCreate.map(metric => 
          client.metrics.create(project.id, {
            name: metric.name,
            description: metric.description,
            evalType: 'ai',
            outputType: 'boolean',
            promptTemplate: `Is the following AI Mentor feedback good in terms of ${metric.name}? Answer with only 'true' or 'false'. Content: {{outputs.output}}`,
          })
        )
      );
      const metricIds = createdMetrics.map(m => m.id);
      console.log(`Metrics created with IDs: ${metricIds.join(", ")}`);

      // 3. Create Testset
      console.log("Creating testset for AI Mentor Feedback...");
      const testsetSchema = {
        type: "object",
        properties: {
          full_startup_context: { type: "string" },
        },
        required: ["full_startup_context"],
      };

      const testset = await client.testsets.create(project.id, {
        name: "AI Mentor Feedback",
        description: "Test cases for the AI mentor feedback feature.",
        jsonSchema: testsetSchema,
        fieldMapping: {
            inputs: ["full_startup_context"],
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
                    full_startup_context: "Full context of the startup including business plan, pitch deck, etc.",
                }
            }
        ]
      });
      console.log("Dummy testcase created.");

      // 5. Log the config snippet to add
      const configSnippet = `
  aiMentor: {
    projectId: "${project.id}",
    testsetId: "${testset.id}",
    metricIds: [${metricIds.map(id => `"${id}"`).join(",")}],
  },
`;

      console.log("\n--- ✅ AI Mentor Feedback Setup Complete! ---");
      console.log("Please copy the following code snippet and add it inside the `SCORECARD_CONFIG` object in your `convex/scorecard.config.ts` file:");
      console.log("--------------------------------------------------");
      console.log(configSnippet);
      console.log("--------------------------------------------------");

    } catch (error: any) {
      console.error("Failed to setup Scorecard.ai AI Mentor evaluation.", error.message);
      return { success: false, error: error.message };
    }
  },
});
