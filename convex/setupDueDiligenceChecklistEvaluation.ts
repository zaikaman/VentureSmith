
import { action } from "./_generated/server";
import Scorecard from "scorecard-ai";

export const setupDueDiligenceChecklist = action({
  args: {},
  handler: async () => {
    console.log("--- Starting Scorecard.ai Due Diligence Checklist Evaluation Setup ---");

    const scorecardApiKey = process.env.SCORECARD_API_KEY;
    if (!scorecardApiKey) {
      const errorMsg = "SCORECARD_API_KEY is not set. Please add it to your Convex environment variables.";
      console.error(errorMsg);
      return { success: false, error: errorMsg };
    }

    try {
      const client = new Scorecard({ apiKey: scorecardApiKey });

      // 1. Create a new Project
      console.log("Creating new project for Due Diligence Checklist...");
      const project = await client.projects.create({
        name: "VentureSmith Due Diligence Checklist Evaluation",
        description: "Automated evaluation for the Due Diligence Checklist feature."
      });
      console.log(`Project created with ID: ${project.id}`);

      // 2. Create Metrics
      console.log("Creating metrics...");
      const metricsToCreate = [
        { name: "Comprehensiveness", description: "Does the checklist cover all major areas of due diligence (Financial, Legal, Technical, Team, Product, etc.)?" },
        { name: "Clarity and Actionability", description: "Are the checklist items clear, specific, and actionable?" },
        { name: "Relevance to Startup", description: "Is the checklist tailored to the specific context of the startup (e.g., its industry, stage, and business model)?" },
      ];

      const createdMetrics = await Promise.all(
        metricsToCreate.map(metric => 
          client.metrics.create(project.id, {
            name: metric.name,
            description: metric.description,
            evalType: 'ai',
            outputType: 'boolean',
            promptTemplate: `Is the following due diligence checklist good in terms of ${metric.name}? Answer with only 'true' or 'false'. Content: {{outputs.output}}`,
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
          fullContext: { type: "string" }, // Stringified context
        },
        required: ["fullContext"],
      };

      const testset = await client.testsets.create(project.id, {
        name: "Due Diligence Checklist",
        description: "Test cases for the due diligence checklist generation feature.",
        jsonSchema: testsetSchema,
        fieldMapping: {
            inputs: ["fullContext"],
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
                    fullContext: "{\"name\":\"Test Hardware Startup\",\"businessPlan\":\"A plan to build a new IoT device.\"}",
                }
            }
        ]
      });
      console.log("Dummy testcase created.");

      // 5. Log the config snippet to add
      const configSnippet = `
  dueDiligenceChecklist: {
    projectId: "${project.id}",
    testsetId: "${testset.id}",
    metricIds: [${metricIds.map(id => `"${id}"`).join(", ")}],
  },
`;

      console.log("\n--- ✅ Due Diligence Checklist Setup Complete! ---");
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
