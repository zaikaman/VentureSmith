
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

export const evaluateDeepDiveMarketAnalysis = internalAction({
  args: { deepDiveMarketAnalysisResult: v.any() },
  handler: async (_, { deepDiveMarketAnalysisResult }) => {
    console.log("--- Kicking off Deep Dive Market Analysis evaluation ---");
    const scorecardApiKey = process.env.SCORECARD_API_KEY;
    if (!scorecardApiKey) {
      console.error("SCORECARD_API_KEY is not set. Skipping evaluation.");
      return null;
    }

    const { deepDiveMarketAnalysis: config } = SCORECARD_CONFIG;
    if (!config || !config.projectId || !config.testsetId || !config.metricIds?.length) {
        console.error("Scorecard configuration for 'deepDiveMarketAnalysis' is missing.");
        return null;
    }

    try {
      const client = new Scorecard({ apiKey: scorecardApiKey });
      const run = await runAndEvaluate(client, {
        projectId: config.projectId,
        testsetId: config.testsetId,
        metricIds: config.metricIds,
        system: () => runSystem(deepDiveMarketAnalysisResult),
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

export const evaluateBrandIdentity = internalAction({
  args: { brandIdentityResult: v.any() },
  handler: async (_, { brandIdentityResult }) => {
    console.log("--- Kicking off Brand Identity evaluation ---");
    const scorecardApiKey = process.env.SCORECARD_API_KEY;
    if (!scorecardApiKey) {
      console.error("SCORECARD_API_KEY is not set. Skipping evaluation.");
      return null;
    }

    const { brandIdentity: config } = SCORECARD_CONFIG;
    if (!config || !config.projectId || !config.testsetId || !config.metricIds?.length) {
        console.error("Scorecard configuration for 'brandIdentity' is missing.");
        return null;
    }

    try {
      const client = new Scorecard({ apiKey: scorecardApiKey });
      const run = await runAndEvaluate(client, {
        projectId: config.projectId,
        testsetId: config.testsetId,
        metricIds: config.metricIds,
        system: () => runSystem(brandIdentityResult),
      });

      console.log(`--- Scorecard.ai Run Started (URL: ${run.url}) ---`);
      return run.url;

    } catch (error: any) {
      // Fail silently in the background if there's a network issue.
      console.error("Failed to start Scorecard.ai evaluation.", error.message);
      return null;
    }
  },
});

export const evaluateScorecardFeature = internalAction({
  args: { scorecardResult: v.any() },
  handler: async (_, { scorecardResult }) => {
    console.log("--- Kicking off Scorecard Feature evaluation ---");
    const scorecardApiKey = process.env.SCORECARD_API_KEY;
    if (!scorecardApiKey) {
      console.error("SCORECARD_API_KEY is not set. Skipping evaluation.");
      return null;
    }

    const { scorecard: config } = SCORECARD_CONFIG;
    if (!config || !config.projectId || !config.testsetId || !config.metricIds?.length) {
        console.error("Scorecard configuration for 'scorecard' is missing.");
        return null;
    }

    try {
      const client = new Scorecard({ apiKey: scorecardApiKey });
      const run = await runAndEvaluate(client, {
        projectId: config.projectId,
        testsetId: config.testsetId,
        metricIds: config.metricIds,
        system: () => runSystem(scorecardResult),
      });

      console.log(`--- Scorecard.ai Run Started (URL: ${run.url}) ---`);
      return run.url;

    } catch (error: any) {
      // Fail silently in the background if there's a network issue.
      console.error("Failed to start Scorecard.ai evaluation.", error.message);
      return null;
    }
  },
});

export const evaluatePitchDeck = internalAction({
  args: { pitchDeckResult: v.any() },
  handler: async (_, { pitchDeckResult }) => {
    console.log("--- Kicking off Pitch Deck evaluation ---");
    const scorecardApiKey = process.env.SCORECARD_API_KEY;
    if (!scorecardApiKey) {
      console.error("SCORECARD_API_KEY is not set. Skipping evaluation.");
      return null;
    }

    const { pitchDeck: config } = SCORECARD_CONFIG;
    if (!config || !config.projectId || !config.testsetId || !config.metricIds?.length) {
        console.error("Scorecard configuration for 'pitchDeck' is missing.");
        return null;
    }

    try {
      const client = new Scorecard({ apiKey: scorecardApiKey });
      const run = await runAndEvaluate(client, {
        projectId: config.projectId,
        testsetId: config.testsetId,
        metricIds: config.metricIds,
        system: () => runSystem(pitchDeckResult),
      });

      console.log(`--- Scorecard.ai Run Started (URL: ${run.url}) ---`);
      return run.url;

    } catch (error: any) {
      // Fail silently in the background if there's a network issue.
      console.error("Failed to start Scorecard.ai evaluation.", error.message);
      return null;
    }
  },
});

export const evaluateCompetitorMatrix = internalAction({
  args: { competitorMatrixResult: v.any() },
  handler: async (_, { competitorMatrixResult }) => {
    console.log("--- Kicking off Competitor Matrix evaluation ---");
    const scorecardApiKey = process.env.SCORECARD_API_KEY;
    if (!scorecardApiKey) {
      console.error("SCORECARD_API_KEY is not set. Skipping evaluation.");
      return null;
    }

    const { competitorMatrix: config } = SCORECARD_CONFIG;
    if (!config || !config.projectId || !config.testsetId || !config.metricIds?.length) {
        console.error("Scorecard configuration for 'competitorMatrix' is missing.");
        return null;
    }

    try {
      const client = new Scorecard({ apiKey: scorecardApiKey });
      const run = await runAndEvaluate(client, {
        projectId: config.projectId,
        testsetId: config.testsetId,
        metricIds: config.metricIds,
        system: () => runSystem(competitorMatrixResult),
      });

      console.log(`--- Scorecard.ai Run Started (URL: ${run.url}) ---`);
      return run.url;

    } catch (error: any) {
      console.error("Failed to start Scorecard.ai evaluation.", error.message);
      return null;
    }
  },
});

export const evaluateCustomerPersonas = internalAction({
  args: { customerPersonasResult: v.any() },
  handler: async (_, { customerPersonasResult }) => {
    console.log("--- Kicking off Customer Personas evaluation ---");
    const scorecardApiKey = process.env.SCORECARD_API_KEY;
    if (!scorecardApiKey) {
      console.error("SCORECARD_API_KEY is not set. Skipping evaluation.");
      return null;
    }

    const { customerPersonas: config } = SCORECARD_CONFIG;
    if (!config || !config.projectId || !config.testsetId || !config.metricIds?.length) {
        console.error("Scorecard configuration for 'customerPersonas' is missing.");
        return null;
    }

    try {
      const client = new Scorecard({ apiKey: scorecardApiKey });
      const run = await runAndEvaluate(client, {
        projectId: config.projectId,
        testsetId: config.testsetId,
        metricIds: config.metricIds,
        system: () => runSystem(customerPersonasResult),
      });

      console.log(`--- Scorecard.ai Run Started (URL: ${run.url}) ---`);
      return run.url;

    } catch (error: any) {
      console.error("Failed to start Scorecard.ai evaluation.", error.message);
      return null;
    }
  },
});

export const evaluateInterviewScripts = internalAction({
  args: { interviewScriptsResult: v.any() },
  handler: async (_, { interviewScriptsResult }) => {
    console.log("--- Kicking off Interview Scripts evaluation ---");
    const scorecardApiKey = process.env.SCORECARD_API_KEY;
    if (!scorecardApiKey) {
      console.error("SCORECARD_API_KEY is not set. Skipping evaluation.");
      return null;
    }

    const { interviewScripts: config } = SCORECARD_CONFIG;
    if (!config || !config.projectId || !config.testsetId || !config.metricIds?.length) {
        console.error("Scorecard configuration for 'interviewScripts' is missing.");
        return null;
    }

    try {
      const client = new Scorecard({ apiKey: scorecardApiKey });
      const run = await runAndEvaluate(client, {
        projectId: config.projectId,
        testsetId: config.testsetId,
        metricIds: config.metricIds,
        system: () => runSystem(interviewScriptsResult),
      });

      console.log(`--- Scorecard.ai Run Started (URL: ${run.url}) ---`);
      return run.url;

    } catch (error: any) {
      console.error("Failed to start Scorecard.ai evaluation.", error.message);
      return null;
    }
  },
});

export const evaluateCustomerValidation = internalAction({
  args: { customerValidationResult: v.any() },
  handler: async (_, { customerValidationResult }) => {
    console.log("--- Kicking off Customer Validation evaluation ---");
    const scorecardApiKey = process.env.SCORECARD_API_KEY;
    if (!scorecardApiKey) {
      console.error("SCORECARD_API_KEY is not set. Skipping evaluation.");
      return null;
    }

    const { customerValidation: config } = SCORECARD_CONFIG;
    if (!config || !config.projectId || !config.testsetId || !config.metricIds?.length) {
        console.error("Scorecard configuration for 'customerValidation' is missing.");
        return null;
    }

    try {
      const client = new Scorecard({ apiKey: scorecardApiKey });
      const run = await runAndEvaluate(client, {
        projectId: config.projectId,
        testsetId: config.testsetId,
        metricIds: config.metricIds,
        system: () => runSystem(customerValidationResult),
      });

      console.log(`--- Scorecard.ai Run Started (URL: ${run.url}) ---`);
      return run.url;

    } catch (error: any) {
      console.error("Failed to start Scorecard.ai evaluation.", error.message);
      return null;
    }
  },
});

export const evaluateAIMentor = internalAction({
  args: { aiMentorResult: v.any() },
  handler: async (_, { aiMentorResult }) => {
    console.log("--- Kicking off AI Mentor evaluation ---");
    const scorecardApiKey = process.env.SCORECARD_API_KEY;
    if (!scorecardApiKey) {
      console.error("SCORECARD_API_KEY is not set. Skipping evaluation.");
      return null;
    }

    const { aiMentor: config } = SCORECARD_CONFIG;
    if (!config || !config.projectId || !config.testsetId || !config.metricIds?.length) {
        console.error("Scorecard configuration for 'aiMentor' is missing.");
        return null;
    }

    try {
      const client = new Scorecard({ apiKey: scorecardApiKey });
      const run = await runAndEvaluate(client, {
        projectId: config.projectId,
        testsetId: config.testsetId,
        metricIds: config.metricIds,
        system: () => runSystem(aiMentorResult),
      });

      console.log(`--- Scorecard.ai Run Started (URL: ${run.url}) ---`);
      return run.url;

    } catch (error: any) {
      console.error("Failed to start Scorecard.ai evaluation.", error.message);
      return null;
    }
  },
});

export const evaluateUserFlowDiagram = internalAction({
  args: { userFlowDiagramResult: v.any() },
  handler: async (_, { userFlowDiagramResult }) => {
    console.log("--- Kicking off User Flow Diagram evaluation ---");
    const scorecardApiKey = process.env.SCORECARD_API_KEY;
    if (!scorecardApiKey) {
      console.error("SCORECARD_API_KEY is not set. Skipping evaluation.");
      return null;
    }

    const { userFlowDiagram: config } = SCORECARD_CONFIG;
    if (!config || !config.projectId || !config.testsetId || !config.metricIds?.length) {
        console.error("Scorecard configuration for 'userFlowDiagram' is missing.");
        return null;
    }

    try {
      const client = new Scorecard({ apiKey: scorecardApiKey });
      const run = await runAndEvaluate(client, {
        projectId: config.projectId,
        testsetId: config.testsetId,
        metricIds: config.metricIds,
        system: () => runSystem(userFlowDiagramResult),
      });

      console.log(`--- Scorecard.ai Run Started (URL: ${run.url}) ---`);
      return run.url;

    } catch (error: any) {
      console.error("Failed to start Scorecard.ai evaluation.", error.message);
      return null;
    }
  },
});

export const evaluateAIWireframe = internalAction({
  args: { aiWireframeResult: v.any() },
  handler: async (_, { aiWireframeResult }) => {
    console.log("--- Kicking off AI Wireframe evaluation ---");
    const scorecardApiKey = process.env.SCORECARD_API_KEY;
    if (!scorecardApiKey) {
      console.error("SCORECARD_API_KEY is not set. Skipping evaluation.");
      return null;
    }

    const { aiWireframe: config } = SCORECARD_CONFIG;
    if (!config || !config.projectId || !config.testsetId || !config.metricIds?.length) {
        console.error("Scorecard configuration for 'aiWireframe' is missing.");
        return null;
    }

    try {
      const client = new Scorecard({ apiKey: scorecardApiKey });
      const run = await runAndEvaluate(client, {
        projectId: config.projectId,
        testsetId: config.testsetId,
        metricIds: config.metricIds,
        system: () => runSystem(aiWireframeResult),
      });

      console.log(`--- Scorecard.ai Run Started (URL: ${run.url}) ---`);
      return run.url;

    } catch (error: any) {
      console.error("Failed to start Scorecard.ai evaluation.", error.message);
      return null;
    }
  },
});

export const evaluateWebsitePrototype = internalAction({
  args: { websitePrototypeResult: v.any() },
  handler: async (_, { websitePrototypeResult }) => {
    console.log("--- Kicking off Website Prototype evaluation ---");
    const scorecardApiKey = process.env.SCORECARD_API_KEY;
    if (!scorecardApiKey) {
      console.error("SCORECARD_API_KEY is not set. Skipping evaluation.");
      return null;
    }

    const { websitePrototype: config } = SCORECARD_CONFIG;
    if (!config || !config.projectId || !config.testsetId || !config.metricIds?.length) {
        console.error("Scorecard configuration for 'websitePrototype' is missing.");
        return null;
    }

    try {
      const client = new Scorecard({ apiKey: scorecardApiKey });
      const run = await runAndEvaluate(client, {
        projectId: config.projectId,
        testsetId: config.testsetId,
        metricIds: config.metricIds,
        system: () => runSystem(websitePrototypeResult),
      });

      console.log(`--- Scorecard.ai Run Started (URL: ${run.url}) ---`);
      return run.url;

    } catch (error: any) {
      console.error("Failed to start Scorecard.ai evaluation.", error.message);
      return null;
    }
  },
});

export const evaluateTechStack = internalAction({
  args: { techStackResult: v.any() },
  handler: async (_, { techStackResult }) => {
    console.log("--- Kicking off Tech Stack evaluation ---");
    const scorecardApiKey = process.env.SCORECARD_API_KEY;
    if (!scorecardApiKey) {
      console.error("SCORECARD_API_KEY is not set. Skipping evaluation.");
      return null;
    }

    const { techStack: config } = SCORECARD_CONFIG;
    if (!config || !config.projectId || !config.testsetId || !config.metricIds?.length) {
        console.error("Scorecard configuration for 'techStack' is missing.");
        return null;
    }

    try {
      const client = new Scorecard({ apiKey: scorecardApiKey });
      const run = await runAndEvaluate(client, {
        projectId: config.projectId,
        testsetId: config.testsetId,
        metricIds: config.metricIds,
        system: () => runSystem(techStackResult),
      });

      console.log(`--- Scorecard.ai Run Started (URL: ${run.url}) ---`);
      return run.url;

    } catch (error: any) {
      console.error("Failed to start Scorecard.ai evaluation.", error.message);
      return null;
    }
  },
});

export const evaluateDatabaseSchema = internalAction({
  args: { databaseSchemaResult: v.any() },
  handler: async (_, { databaseSchemaResult }) => {
    console.log("--- Kicking off Database Schema evaluation ---");
    const scorecardApiKey = process.env.SCORECARD_API_KEY;
    if (!scorecardApiKey) {
      console.error("SCORECARD_API_KEY is not set. Skipping evaluation.");
      return null;
    }

    const { databaseSchema: config } = SCORECARD_CONFIG;
    if (!config || !config.projectId || !config.testsetId || !config.metricIds?.length) {
        console.error("Scorecard configuration for 'databaseSchema' is missing.");
        return null;
    }

    try {
      const client = new Scorecard({ apiKey: scorecardApiKey });
      const run = await runAndEvaluate(client, {
        projectId: config.projectId,
        testsetId: config.testsetId,
        metricIds: config.metricIds,
        system: () => runSystem(databaseSchemaResult),
      });

      console.log(`--- Scorecard.ai Run Started (URL: ${run.url}) ---`);
      return run.url;

    } catch (error: any) {
      console.error("Failed to start Scorecard.ai evaluation.", error.message);
      return null;
    }
  },
});

export const evaluateApiEndpoints = internalAction({
  args: { apiEndpointsResult: v.any() },
  handler: async (_, { apiEndpointsResult }) => {
    console.log("--- Kicking off API Endpoints evaluation ---");
    const scorecardApiKey = process.env.SCORECARD_API_KEY;
    if (!scorecardApiKey) {
      console.error("SCORECARD_API_KEY is not set. Skipping evaluation.");
      return null;
    }

    const { apiEndpoints: config } = SCORECARD_CONFIG;
    if (!config || !config.projectId || !config.testsetId || !config.metricIds?.length) {
        console.error("Scorecard configuration for 'apiEndpoints' is missing.");
        return null;
    }

    try {
      const client = new Scorecard({ apiKey: scorecardApiKey });
      const run = await runAndEvaluate(client, {
        projectId: config.projectId,
        testsetId: config.testsetId,
        metricIds: config.metricIds,
        system: () => runSystem(apiEndpointsResult),
      });

      console.log(`--- Scorecard.ai Run Started (URL: ${run.url}) ---`);
      return run.url;

    } catch (error: any) {
      console.error("Failed to start Scorecard.ai evaluation.", error.message);
      return null;
    }
  },
});

export const evaluateDevelopmentRoadmap = internalAction({
  args: { developmentRoadmapResult: v.any() },
  handler: async (_, { developmentRoadmapResult }) => {
    console.log("--- Kicking off Development Roadmap evaluation ---");
    const scorecardApiKey = process.env.SCORECARD_API_KEY;
    if (!scorecardApiKey) {
      console.error("SCORECARD_API_KEY is not set. Skipping evaluation.");
      return null;
    }

    const { developmentRoadmap: config } = SCORECARD_CONFIG;
    if (!config || !config.projectId || !config.testsetId || !config.metricIds?.length) {
        console.error("Scorecard configuration for 'developmentRoadmap' is missing.");
        return null;
    }

    try {
      const client = new Scorecard({ apiKey: scorecardApiKey });
      const run = await runAndEvaluate(client, {
        projectId: config.projectId,
        testsetId: config.testsetId,
        metricIds: config.metricIds,
        system: () => runSystem(developmentRoadmapResult),
      });

      console.log(`--- Scorecard.ai Run Started (URL: ${run.url}) ---`);
      return run.url;

    } catch (error: any) {
      console.error("Failed to start Scorecard.ai evaluation.", error.message);
      return null;
    }
  },
});

export const evaluateCostEstimate = internalAction({
  args: { costEstimateResult: v.any() },
  handler: async (_, { costEstimateResult }) => {
    console.log("--- Kicking off Cost Estimate evaluation ---");
    const scorecardApiKey = process.env.SCORECARD_API_KEY;
    if (!scorecardApiKey) {
      console.error("SCORECARD_API_KEY is not set. Skipping evaluation.");
      return null;
    }

    const { costEstimate: config } = SCORECARD_CONFIG;
    if (!config || !config.projectId || !config.testsetId || !config.metricIds?.length) {
        console.error("Scorecard configuration for 'costEstimate' is missing.");
        return null;
    }

    try {
      const client = new Scorecard({ apiKey: scorecardApiKey });
      const run = await runAndEvaluate(client, {
        projectId: config.projectId,
        testsetId: config.testsetId,
        metricIds: config.metricIds,
        system: () => runSystem(costEstimateResult),
      });

      console.log(`--- Scorecard.ai Run Started (URL: ${run.url}) ---`);
      return run.url;

    } catch (error: any) {
      console.error("Failed to start Scorecard.ai evaluation.", error.message);
      return null;
    }
  },
});

export const evaluatePricingStrategy = internalAction({
  args: { pricingStrategyResult: v.any() },
  handler: async (_, { pricingStrategyResult }) => {
    console.log("--- Kicking off Pricing Strategy evaluation ---");
    const scorecardApiKey = process.env.SCORECARD_API_KEY;
    if (!scorecardApiKey) {
      console.error("SCORECARD_API_KEY is not set. Skipping evaluation.");
      return null;
    }

    const { pricingStrategy: config } = SCORECARD_CONFIG;
    if (!config || !config.projectId || !config.testsetId || !config.metricIds?.length) {
        console.error("Scorecard configuration for 'pricingStrategy' is missing.");
        return null;
    }

    try {
      const client = new Scorecard({ apiKey: scorecardApiKey });
      const run = await runAndEvaluate(client, {
        projectId: config.projectId,
        testsetId: config.testsetId,
        metricIds: config.metricIds,
        system: () => runSystem(pricingStrategyResult),
      });

      console.log(`--- Scorecard.ai Run Started (URL: ${run.url}) ---`);
      return run.url;

    } catch (error: any) {
      console.error("Failed to start Scorecard.ai evaluation.", error.message);
      return null;
    }
  },
});

export const evaluateMarketingCopy = internalAction({
  args: { marketingCopyResult: v.any() },
  handler: async (_, { marketingCopyResult }) => {
    console.log("--- Kicking off Marketing Copy evaluation ---");
    const scorecardApiKey = process.env.SCORECARD_API_KEY;
    if (!scorecardApiKey) {
      console.error("SCORECARD_API_KEY is not set. Skipping evaluation.");
      return null;
    }

    const { marketingCopy: config } = SCORECARD_CONFIG;
    if (!config || !config.projectId || !config.testsetId || !config.metricIds?.length) {
        console.error("Scorecard configuration for 'marketingCopy' is missing.");
        return null;
    }

    try {
      const client = new Scorecard({ apiKey: scorecardApiKey });
      const run = await runAndEvaluate(client, {
        projectId: config.projectId,
        testsetId: config.testsetId,
        metricIds: config.metricIds,
        system: () => runSystem(marketingCopyResult),
      });

      console.log(`--- Scorecard.ai Run Started (URL: ${run.url}) ---`);
      return run.url;

    } catch (error: any) {
      console.error("Failed to start Scorecard.ai evaluation.", error.message);
      return null;
    }
  },
});

export const evaluatePreLaunchWaitlist = internalAction({
  args: { preLaunchWaitlistResult: v.any() },
  handler: async (_, { preLaunchWaitlistResult }) => {
    console.log("--- Kicking off Pre-Launch Waitlist evaluation ---");
    const scorecardApiKey = process.env.SCORECARD_API_KEY;
    if (!scorecardApiKey) {
      console.error("SCORECARD_API_KEY is not set. Skipping evaluation.");
      return null;
    }

    const { preLaunchWaitlist: config } = SCORECARD_CONFIG;
    if (!config || !config.projectId || !config.testsetId || !config.metricIds?.length) {
        console.error("Scorecard configuration for 'preLaunchWaitlist' is missing.");
        return null;
    }

    try {
      const client = new Scorecard({ apiKey: scorecardApiKey });
      const run = await runAndEvaluate(client, {
        projectId: config.projectId,
        testsetId: config.testsetId,
        metricIds: config.metricIds,
        system: () => runSystem(preLaunchWaitlistResult),
      });

      console.log(`--- Scorecard.ai Run Started (URL: ${run.url}) ---`);
      return run.url;

    } catch (error: any) {
      console.error("Failed to start Scorecard.ai evaluation.", error.message);
      return null;
    }
  },
});

export const evaluateProductHuntKit = internalAction({
  args: { productHuntKitResult: v.any() },
  handler: async (_, { productHuntKitResult }) => {
    console.log("--- Kicking off Product Hunt Kit evaluation ---");
    const scorecardApiKey = process.env.SCORECARD_API_KEY;
    if (!scorecardApiKey) {
      console.error("SCORECARD_API_KEY is not set. Skipping evaluation.");
      return null;
    }

    const { productHuntKit: config } = SCORECARD_CONFIG;
    if (!config || !config.projectId || !config.testsetId || !config.metricIds?.length) {
        console.error("Scorecard configuration for 'productHuntKit' is missing.");
        return null;
    }

    try {
      const client = new Scorecard({ apiKey: scorecardApiKey });
      const run = await runAndEvaluate(client, {
        projectId: config.projectId,
        testsetId: config.testsetId,
        metricIds: config.metricIds,
        system: () => runSystem(productHuntKitResult),
      });

      console.log(`--- Scorecard.ai Run Started (URL: ${run.url}) ---`);
      return run.url;

    } catch (error: any) {
      console.error("Failed to start Scorecard.ai evaluation.", error.message);
      return null;
    }
  },
});

export const evaluateDraftPressRelease = internalAction({
  args: { pressReleaseResult: v.any() },
  handler: async (_, { pressReleaseResult }) => {
    console.log("--- Kicking off Draft Press Release evaluation ---");
    const scorecardApiKey = process.env.SCORECARD_API_KEY;
    if (!scorecardApiKey) {
      console.error("SCORECARD_API_KEY is not set. Skipping evaluation.");
      return null;
    }

    const { draftPressRelease: config } = SCORECARD_CONFIG;
    if (!config || !config.projectId || !config.testsetId || !config.metricIds?.length) {
        console.error("Scorecard configuration for 'draftPressRelease' is missing.");
        return null;
    }

    try {
      const client = new Scorecard({ apiKey: scorecardApiKey });
      const run = await runAndEvaluate(client, {
        projectId: config.projectId,
        testsetId: config.testsetId,
        metricIds: config.metricIds,
        system: () => runSystem(pressReleaseResult),
      });

      console.log(`--- Scorecard.ai Run Started (URL: ${run.url}) ---`);
      return run.url;

    } catch (error: any) {
      console.error("Failed to start Scorecard.ai evaluation.", error.message);
      return null;
    }
  },
});

export const evaluateIdentifyGrowthMetrics = internalAction({
  args: { growthMetricsResult: v.any() },
  handler: async (_, { growthMetricsResult }) => {
    console.log("--- Kicking off Identify Growth Metrics evaluation ---");
    const scorecardApiKey = process.env.SCORECARD_API_KEY;
    if (!scorecardApiKey) {
      console.error("SCORECARD_API_KEY is not set. Skipping evaluation.");
      return null;
    }

    const { identifyGrowthMetrics: config } = SCORECARD_CONFIG;
    if (!config || !config.projectId || !config.testsetId || !config.metricIds?.length) {
        console.error("Scorecard configuration for 'identifyGrowthMetrics' is missing.");
        return null;
    }

    try {
      const client = new Scorecard({ apiKey: scorecardApiKey });
      const run = await runAndEvaluate(client, {
        projectId: config.projectId,
        testsetId: config.testsetId,
        metricIds: config.metricIds,
        system: () => runSystem(growthMetricsResult),
      });

      console.log(`--- Scorecard.ai Run Started (URL: ${run.url}) ---`);
      return run.url;

    } catch (error: any) {
      console.error("Failed to start Scorecard.ai evaluation.", error.message);
      return null;
    }
  },
});