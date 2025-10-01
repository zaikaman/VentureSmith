
import { internalAction } from "./_generated/server";
import Scorecard, { runAndEvaluate } from "scorecard-ai";
import { v } from "convex/values";
import { SCORECARD_CONFIG } from "./scorecard.config";

// Helper function to stringify the object being evaluated
async function runSystem(data: any) {
  return {
    output: JSON.stringify(data, null, 2),
  };
}

export const evaluateBusinessPlan = internalAction({
  args: { businessPlan: v.any() },
  handler: async (_, { businessPlan }) => {
    console.log("--- Kicking off Business Plan evaluation ---");
    const scorecardApiKey = process.env.SCORECARD_API_KEY;
    if (!scorecardApiKey) {
      console.error("SCORECARD_API_KEY is not set. Skipping evaluation.");
      return null;
    }

    const { businessPlan: config } = SCORECARD_CONFIG;
    if (!config || !config.projectId || !config.testsetId || !config.metricIds?.length) {
        console.error("Scorecard configuration for 'businessPlan' is missing.");
        return null;
    }

    try {
      const client = new Scorecard({ apiKey: scorecardApiKey });
      const run = await runAndEvaluate(client, {
        projectId: config.projectId,
        testsetId: config.testsetId,
        metricIds: config.metricIds,
        system: () => runSystem(businessPlan),
      });

      console.log(`--- Scorecard.ai Run Started (URL: ${run.url}) ---`);
      return run.url;

    } catch (error: any) {
      console.error("Failed to start Scorecard.ai evaluation.", error.message);
      return null;
    }
  },
});

export const evaluateBrainstormIdea = internalAction({
  args: { brainstormResult: v.any() },
  handler: async (_, { brainstormResult }) => {
    console.log("--- Kicking off Brainstorm Idea evaluation ---");
    const scorecardApiKey = process.env.SCORECARD_API_KEY;
    if (!scorecardApiKey) {
      console.error("SCORECARD_API_KEY is not set. Skipping evaluation.");
      return null;
    }

    const { brainstorm: config } = SCORECARD_CONFIG;
    if (!config || !config.projectId || !config.testsetId || !config.metricIds?.length) {
        console.error("Scorecard configuration for 'brainstorm' is missing.");
        return null;
    }

    try {
      const client = new Scorecard({ apiKey: scorecardApiKey });
      const run = await runAndEvaluate(client, {
        projectId: config.projectId,
        testsetId: config.testsetId,
        metricIds: config.metricIds,
        system: () => runSystem(brainstormResult),
      });

      console.log(`--- Scorecard.ai Run Started (URL: ${run.url}) ---`);
      return run.url;

    } catch (error: any) {
      console.error("Failed to start Scorecard.ai brainstorm evaluation.", error.message);
      return null;
    }
  },
});

export const evaluateMarketPulse = internalAction({
  args: { marketPulseResult: v.any() },
  handler: async (_, { marketPulseResult }) => {
    console.log("--- Kicking off Market Pulse evaluation ---");
    const scorecardApiKey = process.env.SCORECARD_API_KEY;
    if (!scorecardApiKey) {
      console.error("SCORECARD_API_KEY is not set. Skipping evaluation.");
      return null;
    }

    const { marketPulseCheck: config } = SCORECARD_CONFIG;
    if (!config || !config.projectId || !config.testsetId || !config.metricIds?.length) {
        console.error("Scorecard configuration for 'marketPulseCheck' is missing.");
        return null;
    }

    try {
      const client = new Scorecard({ apiKey: scorecardApiKey });
      const run = await runAndEvaluate(client, {
        projectId: config.projectId,
        testsetId: config.testsetId,
        metricIds: config.metricIds,
        system: () => runSystem(marketPulseResult),
      });

      console.log(`--- Scorecard.ai Run Started (URL: ${run.url}) ---`);
      return run.url;

    } catch (error: any) {
      console.error("Failed to start Scorecard.ai evaluation.", error.message);
      return null;
    }
  },
});

export const evaluateMissionVision = internalAction({
  args: { missionVisionResult: v.any() },
  handler: async (_, { missionVisionResult }) => {
    console.log("--- Kicking off Mission & Vision evaluation ---");
    const scorecardApiKey = process.env.SCORECARD_API_KEY;
    if (!scorecardApiKey) {
      console.error("SCORECARD_API_KEY is not set. Skipping evaluation.");
      return null;
    }

    const { missionVision: config } = SCORECARD_CONFIG;
    if (!config || !config.projectId || !config.testsetId || !config.metricIds?.length) {
        console.error("Scorecard configuration for 'missionVision' is missing.");
        return null;
    }

    try {
      const client = new Scorecard({ apiKey: scorecardApiKey });
      const run = await runAndEvaluate(client, {
        projectId: config.projectId,
        testsetId: config.testsetId,
        metricIds: config.metricIds,
        system: () => runSystem(missionVisionResult),
      });

      console.log(`--- Scorecard.ai Run Started (URL: ${run.url}) ---`);
      return run.url;

    } catch (error: any) {
      console.error("Failed to start Scorecard.ai evaluation.", error.message);
      return null;
    }
  },
});
