
import { action } from "./_generated/server";

export const runNetworkTest = action({
  args: {},
  handler: async () => {
    console.log("--- Starting Network Diagnostic Test ---");
    const results = { google: 'pending', scorecard: 'pending' };

    // Test 1: Fetch a common, reliable URL
    try {
      console.log("Attempting to fetch https://www.google.com...");
      const googleResponse = await fetch('https://www.google.com');
      results.google = `Success, status: ${googleResponse.status}`;
      console.log(`Google fetch successful with status: ${googleResponse.status}`);
    } catch (error: any) {
      results.google = `Failed: ${error.message}`;
      console.error("Google fetch failed:", error.message);
    }

    // Test 2: Fetch the Scorecard API
    const scorecardApiKey = process.env.SCORECARD_API_KEY;
    if (!scorecardApiKey) {
      const msg = "SCORECARD_API_KEY is not set. Skipping Scorecard API test.";
      results.scorecard = msg;
      console.error(msg);
    } else {
      try {
        console.log("Attempting to fetch https://api.scorecard.ai...");
        const scorecardResponse = await fetch('https://api.scorecard.ai/v1/projects', {
          headers: { Authorization: `Bearer ${scorecardApiKey}` },
        });
        results.scorecard = `Success, status: ${scorecardResponse.status}`;
        console.log(`Scorecard API fetch successful with status: ${scorecardResponse.status}`);
      } catch (error: any) {
        results.scorecard = `Failed: ${error.message}`;
        console.error("Scorecard API fetch failed:", error.message);
      }
    }

    console.log("--- Network Diagnostic Test Complete ---");
    return results;
  },
});
