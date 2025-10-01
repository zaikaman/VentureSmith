
import { action } from "./_generated/server";
import Scorecard from "scorecard-ai";
import { v } from "convex/values";

export const setupMissionVision = action({
  args: {},
  handler: async () => {
    console.log("--- Starting Scorecard.ai Mission & Vision Evaluation Setup ---");

    const scorecardApiKey = process.env.SCORECARD_API_KEY;
    if (!scorecardApiKey) {
      const errorMsg = "SCORECARD_API_KEY is not set. Please add it to your Convex environment variables.";
      console.error(errorMsg);
      return { success: false, error: errorMsg };
    }

    try {
      const client = new Scorecard({ apiKey: scorecardApiKey });

      // 1. Create a new Project
      console.log("Creating new project for Mission & Vision...");
      const project = await client.projects.create({
        name: "VentureSmith Mission & Vision Evaluation",
        description: "Automated evaluation for the Define Mission & Vision feature."
      });
      console.log(`Project created with ID: ${project.id}`);

      // 2. Create Metrics
      console.log("Creating metrics...");
      const metricsToCreate = [
        { name: "Inspirational", description: "Is the statement inspiring and motivating?" },
        { name: "Clarity", description: "Is it clear, concise, and easy to remember?" },
        { name: "Alignment", description: "Does it align well with the provided startup idea?" },
      ];

      const createdMetrics = await Promise.all(
        metricsToCreate.map(metric => 
          client.metrics.create(project.id, {
            name: metric.name,
            description: metric.description,
            evalType: 'ai',
            outputType: 'boolean',
            promptTemplate: `Is the following Mission/Vision statement good in terms of ${metric.name}? Answer with only 'true' or 'false'. Content: {{outputs.output}}`,
          })
        )
      );
      const metricIds = createdMetrics.map(m => m.id);
      console.log(`Metrics created with IDs: ${metricIds.join(", ")}`);

      // 3. Create Testset
      console.log("Creating testset...");
      const testsetSchema = {
        type: "object",
        properties: {
          name: { type: "string" },
          refinedIdea: { type: "string" },
        },
        required: ["name", "refinedIdea"],
      };

      const testset = await client.testsets.create(project.id, {
        name: "Define Mission & Vision",
        description: "Test cases for the mission & vision generation feature.",
        jsonSchema: testsetSchema,
        fieldMapping: {
            inputs: ["name", "refinedIdea"],
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
                    name: "Aura",
                    refinedIdea: "A smart home system that adjusts lighting and sound based on user's mood."
                }
            }
        ]
      });
      console.log("Dummy testcase created.");

      // 5. Log the config snippet to add
      const configSnippet = `
  missionVision: {
    projectId: "${project.id}",
    testsetId: "${testset.id}",
    metricIds: [${metricIds.map(id => `"${id}"`).join(", ")}],
  },
`;

      console.log("\n--- ✅ Mission & Vision Setup Complete! ---");
      console.log("Please copy the following code snippet and add it inside the `SCORECARD_CONFIG` object in your `convex/scorecard.config.ts` file:");
      console.log("--------------------------------------------------");
      console.log(configSnippet);
      console.log("--------------------------------------------------");

      return { success: true };

    } catch (error: any) {
      console.error("Failed to setup Scorecard.ai evaluation.", error.message);
      return { success: false, error: error.message };
    }
  },
});
