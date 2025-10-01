
import { action } from "./_generated/server";
import Scorecard from "scorecard-ai";

export const setupDraftPressRelease = action({
  args: {},
  handler: async () => {
    console.log("--- Starting Scorecard.ai Draft Press Release Evaluation Setup ---");

    const scorecardApiKey = process.env.SCORECARD_API_KEY;
    if (!scorecardApiKey) {
      const errorMsg = "SCORECARD_API_KEY is not set. Please add it to your Convex environment variables.";
      console.error(errorMsg);
      return { success: false, error: errorMsg };
    }

    try {
      const client = new Scorecard({ apiKey: scorecardApiKey });

      // 1. Create a new Project
      console.log("Creating new project for Draft Press Release...");
      const project = await client.projects.create({
        name: "VentureSmith Draft Press Release Evaluation",
        description: "Automated evaluation for the Draft Press Release feature."
      });
      console.log(`Project created with ID: ${project.id}`);

      // 2. Create Metrics
      console.log("Creating metrics...");
      const metricsToCreate = [
        { name: "Newsworthiness", description: "Is the headline and story angle compelling and newsworthy?" },
        { name: "Clarity and Conciseness", description: "Is the press release clearly written, concise, and free of jargon?" },
        { name: "Structure and Formatting", description: "Does the press release follow the standard format (headline, dateline, intro, body, boilerplate, media contact)?" },
        { name: "Quote Quality", description: "Is the included quote impactful and attributed correctly?" },
      ];

      const createdMetrics = await Promise.all(
        metricsToCreate.map(metric => 
          client.metrics.create(project.id, {
            name: metric.name,
            description: metric.description,
            evalType: 'ai',
            outputType: 'boolean',
            promptTemplate: `Is the following press release good in terms of ${metric.name}? Answer with only 'true' or 'false'. Content: {{outputs.output}}`,
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
        name: "Draft Press Release",
        description: "Test cases for the press release generation feature.",
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
                    fullContext: "{\"name\":\"Test Startup\",\"refinedIdea\":\"A test idea for a press release.\",\"targetAudience\":\"Tech journalists\"}",
                }
            }
        ]
      });
      console.log("Dummy testcase created.");

      // 5. Log the config snippet to add
      const configSnippet = `
  draftPressRelease: {
    projectId: "${project.id}",
    testsetId: "${testset.id}",
    metricIds: [${metricIds.map(id => `"${id}"`).join(", ")}],
  },
`;

      console.log("\n--- ✅ Draft Press Release Setup Complete! ---");
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
