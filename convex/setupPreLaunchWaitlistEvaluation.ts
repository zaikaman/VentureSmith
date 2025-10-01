
import { action } from "./_generated/server";
import Scorecard from "scorecard-ai";

export const setupPreLaunchWaitlistEvaluation = action({
  args: {},
  handler: async () => {
    console.log("--- Starting Scorecard.ai Pre-Launch Waitlist Evaluation Setup ---");

    const scorecardApiKey = process.env.SCORECARD_API_KEY;
    if (!scorecardApiKey) {
      const errorMsg = "SCORECARD_API_KEY is not set. Please add it to your Convex environment variables.";
      console.error(errorMsg);
      return { success: false, error: errorMsg };
    }

    try {
      const client = new Scorecard({ apiKey: scorecardApiKey });

      // 1. Create a new Project
      console.log("Creating new project for Pre-Launch Waitlist...");
      const project = await client.projects.create({
        name: "VentureSmith Pre-Launch Waitlist Evaluation",
        description: "Automated evaluation for the Build Waitlist Page feature."
      });
      console.log(`Project created with ID: ${project.id}`);

      // 2. Create Metrics
      console.log("Creating metrics for Pre-Launch Waitlist...");
      const metricsToCreate = [
        { name: "Clarity", description: "Is the value proposition on the waitlist page clear and compelling?" },
        { name: "Effectiveness", description: "Is the call-to-action (CTA) for signing up effective and prominently displayed?" },
        { name: "Design", description: "Is the design of the page visually appealing and consistent with the brand identity?" },
      ];

      const createdMetrics = await Promise.all(
        metricsToCreate.map(metric => 
          client.metrics.create(project.id, {
            name: metric.name,
            description: metric.description,
            evalType: 'ai',
            outputType: 'boolean',
            promptTemplate: `Is the following waitlist page code good in terms of ${metric.name}? Answer with only 'true' or 'false'. Content: {{outputs.output}}`,
          })
        )
      );
      const metricIds = createdMetrics.map(m => m.id);
      console.log(`Metrics created with IDs: ${metricIds.join(", ")}`);

      // 3. Create Testset
      console.log("Creating testset for Pre-Launch Waitlist...");
      const testsetSchema = {
        type: "object",
        properties: {
          full_context: { type: "string" },
        },
        required: ["full_context"],
      };

      const testset = await client.testsets.create(project.id, {
        name: "Pre-Launch Waitlist Generation",
        description: "Test cases for the pre-launch waitlist page generation feature.",
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
                    full_context: "Full context including brand identity, mission/vision, and marketing copy.",
                }
            }
        ]
      });
      console.log("Dummy testcase created.");

      // 5. Log the config snippet to add
      const configSnippet = `
  preLaunchWaitlist: {
    projectId: "${project.id}",
    testsetId: "${testset.id}",
    metricIds: [${metricIds.map(id => `"${id}"`).join(", ")}],
  },
`;

      console.log("\n--- ✅ Pre-Launch Waitlist Setup Complete! ---");
      console.log("Please copy the following code snippet and add it inside the `SCORECARD_CONFIG` object in your `convex/scorecard.config.ts` file:");
      console.log("--------------------------------------------------");
      console.log(configSnippet);
      console.log("--------------------------------------------------");

    } catch (error: any) {
      console.error("Failed to setup Scorecard.ai Pre-Launch Waitlist evaluation.", error.message);
      return { success: false, error: error.message };
    }
  },
});
