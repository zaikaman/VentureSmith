import { action } from "./_generated/server";
import { internal, api } from "./_generated/api";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

export const getCustomerValidation = action({
  args: {
    startupId: v.id("startups"),
    startupName: v.string(),
    startupDescription: v.string(),
  },
  handler: async (ctx, { startupId, startupName, startupDescription }) => {
    const result = await ctx.runAction(internal.openai.validateProblemWithAI, {
      startupName,
      startupDescription,
    });

    await ctx.runMutation(api.startups.updateCustomerValidation, {
      startupId,
      customerValidation: JSON.stringify(result),
    });

    return result;
  },
});

export const generateScorecard = action({
  args: { startupId: v.id("startups") },
  handler: async (ctx, { startupId }) => {
    const startup = await ctx.runQuery(api.startups.getStartupById, { id: startupId });
    if (!startup || !startup.brainstormResult || !startup.marketPulse || !startup.missionVision || !startup.brandIdentity) {
      throw new Error("Previous steps must be completed to generate a scorecard.");
    }

    const fullContext = {
      name: startup.name,
      refinedIdea: JSON.parse(startup.brainstormResult).refinedIdea,
      marketPulse: JSON.parse(startup.marketPulse),
      missionVision: JSON.parse(startup.missionVision),
      brandIdentity: JSON.parse(startup.brandIdentity),
    };

    const result = await ctx.runAction(internal.openai.generateScorecardWithAI, {
      fullContext,
    });

    await ctx.runMutation(api.startups.updateScorecard, {
      startupId,
      scorecard: JSON.stringify(result),
    });

    // Add Scorecard evaluation
    const url = await ctx.runAction(internal.scorecard.evaluateScorecardFeature, { scorecardResult: result });
    if (url) {
      await ctx.runMutation(api.startups.updateScorecardEvaluationUrl, {
        startupId,
        url: url,
      });
    }

    return result;
  },
});

export const generateBusinessPlan = action({
  args: { startupId: v.id("startups") },
  handler: async (ctx, { startupId }) => {
    const startup = await ctx.runQuery(api.startups.getStartupById, { id: startupId });
    if (!startup || !startup.brainstormResult || !startup.marketPulse || !startup.missionVision || !startup.brandIdentity) {
      throw new Error("Previous steps must be completed to generate a business plan.");
    }

    const fullContext = {
      name: startup.name,
      refinedIdea: JSON.parse(startup.brainstormResult).refinedIdea,
      marketPulse: JSON.parse(startup.marketPulse),
      missionVision: JSON.parse(startup.missionVision),
      brandIdentity: JSON.parse(startup.brandIdentity),
    };

    const businessPlanResult = await ctx.runAction(internal.openai.generateBusinessPlanWithAI, {
      fullContext,
    });

    await ctx.runMutation(api.startups.updateBusinessPlan, {
      startupId,
      businessPlan: JSON.stringify(businessPlanResult),
    });

    const url = await ctx.runAction(internal.scorecard.evaluateBusinessPlan, { businessPlan: businessPlanResult });
    if (url) {
      await ctx.runMutation(api.startups.updateBusinessPlanEvaluationUrl, {
        startupId,
        url: url,
      });
    }

    return businessPlanResult;
  },
});

export const generatePitchDeck = action({
  args: { startupId: v.id("startups") },
  handler: async (ctx, { startupId }) => {
    const startup = await ctx.runQuery(api.startups.getStartupById, { id: startupId });
    if (!startup || !startup.brainstormResult || !startup.marketPulse || !startup.missionVision ||
!startup.brandIdentity) {
      throw new Error("Previous steps must be completed to generate a pitch deck.");
    }

    const fullContext = {
      name: startup.name,
      refinedIdea: JSON.parse(startup.brainstormResult).refinedIdea,
      marketPulse: JSON.parse(startup.marketPulse),
      missionVision: JSON.parse(startup.missionVision),
      brandIdentity: JSON.parse(startup.brandIdentity),
    };

    const result = await ctx.runAction(internal.openai.generatePitchDeckWithAI, {
      fullContext,
    });

    await ctx.runMutation(api.startups.updatePitchDeck, {
      startupId,
      pitchDeck: JSON.stringify(result),
    });

    // Add Scorecard evaluation
    const url = await ctx.runAction(internal.scorecard.evaluatePitchDeck, { pitchDeckResult: result });
    if (url) {
      await ctx.runMutation(api.startups.updatePitchDeckEvaluationUrl, {
        startupId,
        url: url,
      });
    }

    return result;
  },
});

export const generateMarketResearch = action({
  args: { startupId: v.id("startups") },
  handler: async (ctx, { startupId }) => {
    const startup = await ctx.runQuery(api.startups.getStartupById, { id: startupId });
    if (!startup || !startup.brainstormResult) {
      throw new Error("Brainstorm step must be completed first.");
    }

    const brainstormData = JSON.parse(startup.brainstormResult);
    const refinedIdea = brainstormData.brainstorm?.refinedIdea;

    if (!refinedIdea || typeof refinedIdea !== 'string') {
      throw new Error("Could not find a 'refinedIdea' in the brainstorm result. Please complete the brainstorm step again.");
    }

    const result = await ctx.runAction(api.firecrawl.performMarketAnalysis, {
      keyword: refinedIdea,
    });

    await ctx.runMutation(api.startups.updateMarketResearch, {
      startupId,
      marketResearch: JSON.stringify(result),
    });

    // Add Scorecard evaluation
    const url = await ctx.runAction(internal.scorecard.evaluateDeepDiveMarketAnalysis, { deepDiveMarketAnalysisResult: result });
    if (url) {
      await ctx.runMutation(api.startups.updateDeepDiveMarketAnalysisEvaluationUrl, {
        startupId,
        url: url,
      });
    }

    return result;
  },
});
export const generateBrainstormIdea = action({
  args: {
    startupId: v.id("startups"),
    idea: v.string(),
  },
  handler: async (ctx, { startupId, idea }) => {
    const result = await ctx.runAction(internal.openai.brainstormIdeaWithAI, {
      idea,
    });

    await ctx.runMutation(api.startups.updateBrainstormResult, {
      startupId,
      brainstormResult: JSON.stringify(result),
    });

    const url = await ctx.runAction(internal.scorecard.evaluateBrainstormIdea, { brainstormResult: result });
    if (url) {
      await ctx.runMutation(api.startups.updateBrainstormEvaluationUrl, {
        startupId,
        url: url,
      });
    }

    return result;
  },
});

export const getMarketPulse = action({
  args: {
    startupId: v.id("startups"),
    idea: v.string(),
  },
  handler: async (ctx, { startupId, idea }) => {
    const result = await ctx.runAction(internal.openai.getMarketPulseWithAI, {
      idea,
    });

    await ctx.runMutation(api.startups.updateMarketPulse, {
      startupId,
      marketPulse: JSON.stringify(result),
    });

    const url = await ctx.runAction(internal.scorecard.evaluateMarketPulse, { marketPulseResult: result });
    if (url) {
      await ctx.runMutation(api.startups.updateMarketPulseEvaluationUrl, {
        startupId,
        url: url,
      });
    }

    return result;
  },
});

export const defineMissionVision = action({
  args: { startupId: v.id("startups") },
  handler: async (ctx, { startupId }) => {
    const startup = await ctx.runQuery(api.startups.getStartupById, { id: startupId });
    if (!startup || !startup.brainstormResult || !startup.marketPulse) {
      throw new Error("Previous steps are not completed.");
    }

    const refinedIdea = JSON.parse(startup.brainstormResult).refinedIdea;
    const marketPulse = JSON.parse(startup.marketPulse);

    const result = await ctx.runAction(internal.openai.defineMissionVisionWithAI, {
      name: startup.name,
      refinedIdea,
      marketPulse,
    });

    await ctx.runMutation(api.startups.updateMissionVision, {
      startupId,
      missionVision: JSON.stringify(result),
    });

    // Add Scorecard evaluation
    const url = await ctx.runAction(internal.scorecard.evaluateMissionVision, { missionVisionResult: result });
    if (url) {
      await ctx.runMutation(api.startups.updateMissionVisionEvaluationUrl, {
        startupId,
        url: url,
      });
    }

    return result;
  },
});

export const generateBrandIdentity = action({
  args: { startupId: v.id("startups") },
  handler: async (ctx, { startupId }) => {
    const startup = await ctx.runQuery(api.startups.getStartupById, { id: startupId });
    if (!startup || !startup.brainstormResult || !startup.marketPulse || !startup.missionVision) {
      throw new Error("Previous steps must be completed to generate a brand identity.");
    }

    const refinedIdea = JSON.parse(startup.brainstormResult).refinedIdea;
    const keywords = JSON.parse(startup.marketPulse).relatedKeywords;
    const { mission, vision } = JSON.parse(startup.missionVision);

    const result = await ctx.runAction(internal.openai.generateBrandIdentityWithAI, {
      refinedIdea,
      keywords,
      mission,
      vision,
    });

    await ctx.runMutation(api.startups.updateBrandIdentity, {
      startupId,
      brandIdentity: JSON.stringify(result),
    });

    // Add Scorecard evaluation
    const url = await ctx.runAction(internal.scorecard.evaluateBrandIdentity, { brandIdentityResult: result });
    if (url) {
      await ctx.runMutation(api.startups.updateBrandIdentityEvaluationUrl, {
        startupId,
        url: url,
      });
    }

    return result;
  },
});

export const generateCompetitorMatrix = action({
  args: { startupId: v.id("startups") },
  handler: async (ctx, { startupId }) => {
    const startup = await ctx.runQuery(api.startups.getStartupById, { id: startupId });
    if (!startup || !startup.marketResearch) {
      throw new Error("Market Research step must be completed first.");
    }

    const marketResearchSummary = JSON.parse(startup.marketResearch).summary;

    const result = await ctx.runAction(internal.openai.generateCompetitorMatrixWithAI, {
      startupName: startup.name,
      marketResearchSummary,
    });

    await ctx.runMutation(api.startups.updateCompetitorMatrix, {
      startupId,
      competitorMatrix: JSON.stringify(result),
    });

    // Add Scorecard evaluation
    const url = await ctx.runAction(internal.scorecard.evaluateCompetitorMatrix, { competitorMatrixResult: result });
    if (url) {
      await ctx.runMutation(api.startups.updateCompetitorMatrixEvaluationUrl, {
        startupId,
        url: url,
      });
    }

    return result;
  },
});

export const generateCustomerPersonas = action({
  args: { startupId: v.id("startups") },
  handler: async (ctx, { startupId }) => {
    const startup = await ctx.runQuery(api.startups.getStartupById, { id: startupId });
    if (!startup || !startup.brainstormResult || !startup.marketResearch || !startup.missionVision || !startup.brandIdentity) {
      throw new Error("Previous steps must be completed to generate customer personas.");
    }

    const fullContext = {
      name: startup.name,
      refinedIdea: JSON.parse(startup.brainstormResult).refinedIdea,
      marketResearch: JSON.parse(startup.marketResearch),
      missionVision: JSON.parse(startup.missionVision),
      brandIdentity: JSON.parse(startup.brandIdentity),
    };

    const result = await ctx.runAction(internal.openai.generateCustomerPersonasWithAI, {
      fullContext,
    });

    await ctx.runMutation(api.startups.updateCustomerPersonas, {
      startupId,
      customerPersonas: JSON.stringify(result),
    });

    // Add Scorecard evaluation
    const url = await ctx.runAction(internal.scorecard.evaluateCustomerPersonas, { customerPersonasResult: result });
    if (url) {
      await ctx.runMutation(api.startups.updateCustomerPersonasEvaluationUrl, {
        startupId,
        url: url,
      });
    }

    return result;
  },
});

export const generateInterviewScripts = action({
  args: { startupId: v.id("startups") },
  handler: async (ctx, { startupId }) => {
    const startup = await ctx.runQuery(api.startups.getStartupById, { id: startupId });
    if (!startup || !startup.brainstormResult || !startup.customerPersonas) {
      throw new Error("Customer Personas must be generated first.");
    }

    const refinedIdea = JSON.parse(startup.brainstormResult).refinedIdea;
    const personas = JSON.parse(startup.customerPersonas).personas;

    const result = await ctx.runAction(internal.openai.generateInterviewScriptsWithAI, {
      startupName: startup.name,
      refinedIdea,
      personas,
    });

    await ctx.runMutation(api.startups.updateInterviewScripts, {
      startupId,
      interviewScripts: JSON.stringify(result),
    });

    // Add Scorecard evaluation
    const url = await ctx.runAction(internal.scorecard.evaluateInterviewScripts, { interviewScriptsResult: result });
    if (url) {
      await ctx.runMutation(api.startups.updateInterviewScriptsEvaluationUrl, {
        startupId,
        url: url,
      });
    }

    return result;
  },
});

export const runInterviewSimulations = action({
  args: { startupId: v.id("startups") },
  handler: async (ctx, { startupId }) => {
    const startup = await ctx.runQuery(api.startups.getStartupById, { id: startupId });
    if (!startup || !startup.brainstormResult || !startup.marketPulse || !startup.missionVision || !startup.brandIdentity || !startup.customerPersonas || !startup.interviewScripts) {
      throw new Error("All previous steps must be completed to run interview simulations.");
    }

    const fullContext = {
      name: startup.name,
      refinedIdea: JSON.parse(startup.brainstormResult).refinedIdea,
      marketPulse: JSON.parse(startup.marketPulse),
      missionVision: JSON.parse(startup.missionVision),
      brandIdentity: JSON.parse(startup.brandIdentity),
      customerPersonas: JSON.parse(startup.customerPersonas),
      interviewScripts: JSON.parse(startup.interviewScripts),
    };

    const result = await ctx.runAction(internal.openai.runInterviewSimulationsWithAI, {
      fullContext,
    });

    await ctx.runMutation(api.startups.updateCustomerValidation, {
      startupId,
      customerValidation: JSON.stringify(result),
    });

    // Add Scorecard evaluation
    const url = await ctx.runAction(internal.scorecard.evaluateCustomerValidation, { customerValidationResult: result });
    if (url) {
      await ctx.runMutation(api.startups.updateCustomerValidationEvaluationUrl, {
        startupId,
        url: url,
      });
    }

    return result;
  },
});

export const getMentorFeedback = action({
  args: { startupId: v.id("startups") },
  handler: async (ctx, { startupId }) => {
    const startup = await ctx.runQuery(api.startups.getStartupById, { id: startupId });
    if (!startup || !startup.businessPlan) {
      throw new Error("Business Plan must be completed to get mentor feedback.");
    }

    const fullContext = {
      name: startup.name,
      brainstormResult: startup.brainstormResult ? JSON.parse(startup.brainstormResult) : undefined,
      marketPulse: startup.marketPulse ? JSON.parse(startup.marketPulse) : undefined,
      missionVision: startup.missionVision ? JSON.parse(startup.missionVision) : undefined,
      brandIdentity: startup.brandIdentity ? JSON.parse(startup.brandIdentity) : undefined,
      scorecard: startup.dashboard ? JSON.parse(startup.dashboard) : undefined,
      businessPlan: startup.businessPlan ? JSON.parse(startup.businessPlan) : undefined,
      pitchDeck: startup.pitchDeck ? JSON.parse(startup.pitchDeck) : undefined,
      marketResearch: startup.marketResearch ? JSON.parse(startup.marketResearch) : undefined,
      competitorMatrix: startup.competitorMatrix ? JSON.parse(startup.competitorMatrix) : undefined,
      customerPersonas: startup.customerPersonas ? JSON.parse(startup.customerPersonas) : undefined,
    };

    const result = await ctx.runAction(internal.openai.getMentorFeedbackWithAI, {
      fullContext,
    });

    await ctx.runMutation(api.startups.updateMentorFeedback, {
      startupId,
      feedback: JSON.stringify(result),
    });

    // Add Scorecard evaluation
    const url = await ctx.runAction(internal.scorecard.evaluateAIMentor, { aiMentorResult: result });
    if (url) {
      await ctx.runMutation(api.startups.updateAIMentorEvaluationUrl, {
        startupId,
        url: url,
      });
    }

    return result;
  },
});

export const generateUserFlow = action({
  args: { startupId: v.id("startups") },
  handler: async (ctx, { startupId }) => {
    const startup = await ctx.runQuery(api.startups.getStartupById, { id: startupId });
    if (!startup || !startup.brainstormResult || !startup.customerPersonas) {
      throw new Error("Brainstorming and Customer Personas must be completed first.");
    }

    const fullContext = {
      name: startup.name,
      refinedIdea: JSON.parse(startup.brainstormResult).refinedIdea,
      personas: JSON.parse(startup.customerPersonas).personas,
    };

    const result = await ctx.runAction(internal.openai.generateUserFlowWithAI, {
      fullContext,
    });

    await ctx.runMutation(api.startups.updateUserFlowDiagram, {
      startupId,
      userFlowDiagram: JSON.stringify(result),
    });

    // Add Scorecard evaluation
    const url = await ctx.runAction(internal.scorecard.evaluateUserFlowDiagram, { userFlowDiagramResult: result });
    if (url) {
      await ctx.runMutation(api.startups.updateUserFlowDiagramEvaluationUrl, {
        startupId,
        url: url,
      });
    }

    return result;
  },
});

export const generateAIWireframe = action({
  args: { startupId: v.id("startups") },
  handler: async (ctx, { startupId }) => {
    const startup = await ctx.runQuery(api.startups.getStartupById, { id: startupId });

    if (
      !startup ||
      !startup.brainstormResult ||
      !startup.brandIdentity ||
      !startup.missionVision ||
      !startup.customerPersonas ||
      !startup.userFlowDiagram
    ) {
      throw new Error("Not all prerequisite steps have been completed. Please generate the Idea, Brand Identity, Mission/Vision, Customer Personas, and User Flow Diagram first.");
    }

    const fullContext = {
      name: startup.name,
      refinedIdea: JSON.parse(startup.brainstormResult).refinedIdea,
      brandIdentity: JSON.parse(startup.brandIdentity),
      missionVision: JSON.parse(startup.missionVision),
      customerPersonas: JSON.parse(startup.customerPersonas).personas,
      userFlow: JSON.parse(startup.userFlowDiagram),
    };

    const result = await ctx.runAction(internal.openai.generateAIWireframeWithAI, {
      fullContext,
    });

    await ctx.runMutation(api.startups.updateAIWireframe, {
      startupId,
      aiWireframe: JSON.stringify(result),
    });

    // Add Scorecard evaluation
    const url = await ctx.runAction(internal.scorecard.evaluateAIWireframe, { aiWireframeResult: result });
    if (url) {
      await ctx.runMutation(api.startups.updateAIWireframeEvaluationUrl, {
        startupId,
        url: url,
      });
    }

    return result;
  },
});

export const generateTechStack = action({
  args: { startupId: v.id("startups") },
  handler: async (ctx, { startupId }) => {
    const startup = await ctx.runQuery(api.startups.getStartupById, { id: startupId });

    // Consolidate all necessary data into fullContext
    const fullContext = {
      name: startup?.name,
      idea: startup?.idea,
      brainstormResult: startup?.brainstormResult ? JSON.parse(startup.brainstormResult) : undefined,
      marketPulse: startup?.marketPulse ? JSON.parse(startup.marketPulse) : undefined,
      missionVision: startup?.missionVision ? JSON.parse(startup.missionVision) : undefined,
      brandIdentity: startup?.brandIdentity ? JSON.parse(startup.brandIdentity) : undefined,
      customerPersonas: startup?.customerPersonas ? JSON.parse(startup.customerPersonas) : undefined,
      userFlow: startup?.userFlowDiagram ? JSON.parse(startup.userFlowDiagram) : undefined,
      aiWireframe: startup?.aiWireframe ? JSON.parse(startup.aiWireframe).code : undefined,
    };

    if (!fullContext.brainstormResult) {
      throw new Error("Please complete the initial brainstorming step first.");
    }

    const result = await ctx.runAction(internal.openai.generateTechStackWithAI, {
      fullContext,
    });

    await ctx.runMutation(api.startups.updateTechStack, {
      startupId,
      techStack: JSON.stringify(result),
    });

    // Add Scorecard evaluation
    const url = await ctx.runAction(internal.scorecard.evaluateTechStack, { techStackResult: result });
    if (url) {
      await ctx.runMutation(api.startups.updateTechStackEvaluationUrl, {
        startupId,
        url: url,
      });
    }

    return result;
  },
});

export const createDatabaseSchema = action({
  args: { startupId: v.id("startups") },
  handler: async (ctx, { startupId }) => {
    const startup = await ctx.runQuery(api.startups.getStartupById, { id: startupId });
    if (!startup || !startup.brainstormResult || !startup.userFlowDiagram) {
      throw new Error("Brainstorming and User Flow must be completed first.");
    }

    const fullContext = {
      name: startup.name,
      brainstormResult: JSON.parse(startup.brainstormResult),
      userFlowDiagram: JSON.parse(startup.userFlowDiagram),
    };

    const result = await ctx.runAction(internal.openai.generateDatabaseSchema, {
      fullContext,
    });

    await ctx.runMutation(api.startups.updateDatabaseSchema, {
      startupId,
      databaseSchema: JSON.stringify(result),
    });

    // Add Scorecard evaluation
    const url = await ctx.runAction(internal.scorecard.evaluateDatabaseSchema, { databaseSchemaResult: result });
    if (url) {
      await ctx.runMutation(api.startups.updateDatabaseSchemaEvaluationUrl, {
        startupId,
        url: url,
      });
    }

    return result;
  },
});

export const generateWebsitePrototype = action({
  args: { startupId: v.id("startups") },
  handler: async (ctx, { startupId }) => {
    const startup = await ctx.runQuery(api.startups.getStartupById, { id: startupId });

    if (
      !startup ||
      !startup.brainstormResult ||
      !startup.brandIdentity ||
      !startup.missionVision ||
      !startup.customerPersonas ||
      !startup.userFlowDiagram ||
      !startup.aiWireframe
    ) {
      throw new Error("Not all prerequisite steps have been completed. Please ensure all previous generation steps, including the AI Wireframe, are complete.");
    }

    const fullContext = {
      name: startup.name,
      refinedIdea: JSON.parse(startup.brainstormResult).refinedIdea,
      brandIdentity: JSON.parse(startup.brandIdentity),
      missionVision: JSON.parse(startup.missionVision),
      customerPersonas: JSON.parse(startup.customerPersonas).personas,
      userFlow: JSON.parse(startup.userFlowDiagram),
      aiWireframe: JSON.parse(startup.aiWireframe).code,
    };

    const result = await ctx.runAction(internal.openai.generateWebsitePrototypeWithAI, {
      fullContext,
    });

    await ctx.runMutation(api.startups.updateWebsitePrototype, {
      startupId,
      website: JSON.stringify(result),
    });

    // Add Scorecard evaluation
    const url = await ctx.runAction(internal.scorecard.evaluateWebsitePrototype, { websitePrototypeResult: result });
    if (url) {
      await ctx.runMutation(api.startups.updateWebsitePrototypeEvaluationUrl, {
        startupId,
        url: url,
      });
    }

    return result;
  },
});

export const generateApiEndpoints = action({
  args: { startupId: v.id("startups") },
  handler: async (ctx, { startupId }) => {
    const startup = await ctx.runQuery(api.startups.getStartupById, { id: startupId });
    if (!startup || !startup.brainstormResult || !startup.userFlowDiagram || !startup.databaseSchema) {
      throw new Error("Brainstorming, User Flow, and Database Schema must be completed first.");
    }

    const fullContext = {
      name: startup.name,
      brainstormResult: JSON.parse(startup.brainstormResult),
      userFlowDiagram: JSON.parse(startup.userFlowDiagram),
      databaseSchema: JSON.parse(startup.databaseSchema),
    };

    const result = await ctx.runAction(internal.openai.generateApiEndpointsWithAI, {
      fullContext,
    });

    await ctx.runMutation(api.startups.updateApiEndpoints, {
      startupId,
      apiEndpoints: result,
    });

    // Add Scorecard evaluation
    const url = await ctx.runAction(internal.scorecard.evaluateApiEndpoints, { apiEndpointsResult: result });
    if (url) {
      await ctx.runMutation(api.startups.updateApiEndpointsEvaluationUrl, {
        startupId,
        url: url,
      });
    }

    return result;
  },
});

export const generateDevelopmentRoadmap = action({
  args: { startupId: v.id("startups") },
  handler: async (ctx, { startupId }) => {
    const startup = await ctx.runQuery(api.startups.getStartupById, { id: startupId });
    if (!startup || !startup.brainstormResult || !startup.techStack || !startup.databaseSchema || !startup.apiEndpoints) {
      throw new Error("Brainstorming, Tech Stack, Database Schema, and API Endpoints must be completed first.");
    }

    const fullContext = {
      name: startup.name,
      brainstormResult: JSON.parse(startup.brainstormResult),
      techStack: JSON.parse(startup.techStack),
      databaseSchema: JSON.parse(startup.databaseSchema),
      apiEndpoints: startup.apiEndpoints,
    };

    const result = await ctx.runAction(internal.openai.generateDevelopmentRoadmapWithAI, {
      fullContext,
    });

    await ctx.runMutation(api.startups.updateDevelopmentRoadmap, {
      startupId,
      developmentRoadmap: JSON.stringify(result),
    });

    // Add Scorecard evaluation
    const url = await ctx.runAction(internal.scorecard.evaluateDevelopmentRoadmap, { developmentRoadmapResult: result });
    if (url) {
      await ctx.runMutation(api.startups.updateDevelopmentRoadmapEvaluationUrl, {
        startupId,
        url: url,
      });
    }

    return result;
  },
});

export const estimateCloudCosts = action({
  args: { startupId: v.id("startups") },
  handler: async (ctx, { startupId }) => {
    const startup = await ctx.runQuery(api.startups.getStartupById, { id: startupId });
    if (!startup || !startup.techStack || !startup.databaseSchema || !startup.apiEndpoints) {
      throw new Error("Tech Stack, Database Schema, and API Endpoints must be completed first.");
    }

    const fullContext = {
      name: startup.name,
      techStack: JSON.parse(startup.techStack),
      databaseSchema: JSON.parse(startup.databaseSchema),
      apiEndpoints: startup.apiEndpoints,
    };

    const result = await ctx.runAction(internal.openai.estimateCloudCostsWithAI, {
      fullContext,
    });

    await ctx.runMutation(api.startups.updateCostEstimate, {
      startupId,
      costEstimate: JSON.stringify(result),
    });

    // Add Scorecard evaluation
    const url = await ctx.runAction(internal.scorecard.evaluateCostEstimate, { costEstimateResult: result });
    if (url) {
      await ctx.runMutation(api.startups.updateCostEstimateEvaluationUrl, {
        startupId,
        url: url,
      });
    }

    return result;
  },
});

export const generatePricingStrategy = action({
  args: { startupId: v.id("startups") },
  handler: async (ctx, { startupId }) => {
    const startup = await ctx.runQuery(api.startups.getStartupById, { id: startupId });
    if (!startup || !startup.businessPlan || !startup.customerPersonas || !startup.competitorMatrix) {
      throw new Error("Business Plan, Customer Personas, and Competitor Matrix must be completed first.");
    }

    const fullContext = {
      name: startup.name,
      businessPlan: JSON.parse(startup.businessPlan),
      customerPersonas: JSON.parse(startup.customerPersonas),
      competitorMatrix: JSON.parse(startup.competitorMatrix),
    };

    const result = await ctx.runAction(internal.openai.generatePricingStrategyWithAI, {
      fullContext,
    });

    await ctx.runMutation(api.startups.updatePricingStrategy, {
      startupId,
      pricingStrategy: JSON.stringify(result),
    });

    // Add Scorecard evaluation
    const url = await ctx.runAction(internal.scorecard.evaluatePricingStrategy, { pricingStrategyResult: result });
    if (url) {
      await ctx.runMutation(api.startups.updatePricingStrategyEvaluationUrl, {
        startupId,
        url: url,
      });
    }

    return result;
  },
});

export const generateMarketingCopy = action({
  args: { startupId: v.id("startups") },
  handler: async (ctx, { startupId }) => {
    const startup = await ctx.runQuery(api.startups.getStartupById, { id: startupId });
    if (!startup || !startup.brandIdentity || !startup.missionVision || !startup.customerPersonas || !startup.pricingStrategy) {
      throw new Error("Brand Identity, Mission/Vision, Customer Personas, and Pricing Strategy must be completed first.");
    }

    const fullContext = {
      name: startup.name,
      brandIdentity: JSON.parse(startup.brandIdentity),
      missionVision: JSON.parse(startup.missionVision),
      customerPersonas: JSON.parse(startup.customerPersonas),
      pricingStrategy: JSON.parse(startup.pricingStrategy),
    };

    const result = await ctx.runAction(internal.openai.generateMarketingCopyWithAI, {
      fullContext,
    });

    await ctx.runMutation(api.startups.updateMarketingCopy, {
      startupId,
      marketingCopy: JSON.stringify(result),
    });

    // Add Scorecard evaluation
    const url = await ctx.runAction(internal.scorecard.evaluateMarketingCopy, { marketingCopyResult: result });
    if (url) {
      await ctx.runMutation(api.startups.updateMarketingCopyEvaluationUrl, {
        startupId,
        url: url,
      });
    }

    return result;
  },
});

export const generateWaitlistPage = action({
  args: { startupId: v.id("startups") },
  handler: async (ctx, { startupId }) => {
    const startup = await ctx.runQuery(api.startups.getStartupById, { id: startupId });
    if (!startup || !startup.brandIdentity || !startup.missionVision || !startup.marketingCopy) {
      throw new Error("Brand Identity, Mission/Vision, and Marketing Copy must be completed first.");
    }

    const fullContext = {
      name: startup.name,
      brandIdentity: JSON.parse(startup.brandIdentity),
      missionVision: JSON.parse(startup.missionVision),
      marketingCopy: JSON.parse(startup.marketingCopy),
    };

    const result = await ctx.runAction(internal.openai.generateWaitlistPageWithAI, {
      fullContext,
    });

    await ctx.runMutation(api.startups.updatePreLaunchWaitlist, {
      startupId,
      preLaunchWaitlist: JSON.stringify(result),
    });

    // Add Scorecard evaluation
    const url = await ctx.runAction(internal.scorecard.evaluatePreLaunchWaitlist, { preLaunchWaitlistResult: result });
    if (url) {
      await ctx.runMutation(api.startups.updatePreLaunchWaitlistEvaluationUrl, {
        startupId,
        url: url,
      });
    }

    return result;
  },
});

export const generateProductHuntKit = action({
  args: { startupId: v.id("startups") },
  handler: async (ctx, { startupId }) => {
    const startup = await ctx.runQuery(api.startups.getStartupById, { id: startupId });
    if (!startup || !startup.businessPlan || !startup.marketingCopy || !startup.brandIdentity || !startup.missionVision) {
      throw new Error("Business Plan, Marketing Copy, Brand Identity, and Mission/Vision must be completed first.");
    }

    const fullContext = {
      name: startup.name,
      idea: startup.idea,
      businessPlan: JSON.parse(startup.businessPlan),
      marketingCopy: JSON.parse(startup.marketingCopy),
      brandIdentity: JSON.parse(startup.brandIdentity),
      missionVision: JSON.parse(startup.missionVision),
    };

    const result = await ctx.runAction(internal.openai.generateProductHuntKitWithAI, {
      fullContext,
    });

    await ctx.runMutation(api.startups.updateProductHuntKit, {
      startupId,
      productHuntKit: JSON.stringify(result),
    });

    // Add Scorecard evaluation
    const url = await ctx.runAction(internal.scorecard.evaluateProductHuntKit, { productHuntKitResult: result });
    if (url) {
      await ctx.runMutation(api.startups.updateProductHuntKitEvaluationUrl, {
        startupId,
        url: url,
      });
    }

    return result;
  },
});

export const generatePressRelease = action({
  args: { startupId: v.id("startups") },
  handler: async (ctx, { startupId }) => {
    const startup = await ctx.runQuery(api.startups.getStartupById, { id: startupId });
    if (!startup || !startup.businessPlan || !startup.brandIdentity) {
      throw new Error("Business Plan and Brand Identity must be completed first.");
    }

    const fullContext = {
      name: startup.name,
      idea: startup.idea,
      businessPlan: JSON.parse(startup.businessPlan),
      brandIdentity: JSON.parse(startup.brandIdentity),
    };

    const result = await ctx.runAction(internal.openai.generatePressReleaseWithAI, {
      fullContext,
    });

    await ctx.runMutation(api.startups.updatePressRelease, {
      startupId,
      pressRelease: JSON.stringify(result),
    });

    return result;
  },
});

export const generateGrowthMetrics = action({
  args: { startupId: v.id("startups") },
  handler: async (ctx, { startupId }) => {
    const startup = await ctx.runQuery(api.startups.getStartupById, { id: startupId });
    if (!startup || !startup.brainstormResult || !startup.marketPulse) {
      throw new Error("Brainstorming and Market Pulse must be completed first.");
    }

    const fullContext = {
      name: startup.name,
      refinedIdea: JSON.parse(startup.brainstormResult).refinedIdea,
      marketPulse: JSON.parse(startup.marketPulse),
    };

    const result = await ctx.runAction(internal.openai.generateGrowthMetricsWithAI, {
      fullContext,
    });

    await ctx.runMutation(api.startups.updateGrowthMetrics, {
      startupId,
      growthMetrics: JSON.stringify(result),
    });

    return { success: true };
  },
});

export const generateABTestIdeas = action({
  args: { startupId: v.id("startups") },
  handler: async (ctx, { startupId }) => {
    const startup = await ctx.runQuery(api.startups.getStartupById, { id: startupId });
    if (!startup || !startup.brainstormResult || !startup.customerPersonas) {
      throw new Error("Brainstorming and Customer Personas must be completed first.");
    }

    const brainstormObject = JSON.parse(startup.brainstormResult);

    if (!brainstormObject || !brainstormObject.brainstorm) {
      throw new Error("Could not find the 'brainstorm' object in the brainstorm result. Please complete the brainstorm step again.");
    }

    const brainstormData = brainstormObject.brainstorm;

    const fullContext = {
      name: startup.name,
      refinedIdea: brainstormData.refinedIdea,
      keyFeatures: brainstormData.keyFeatures,
      customerPersonas: JSON.parse(startup.customerPersonas).personas,
    };

    const result = await ctx.runAction(internal.openai.generateABTestIdeasWithAI, {
      fullContext,
    });

    await ctx.runMutation(api.startups.updateABTestIdeas, {
      startupId,
      abTestIdeas: JSON.stringify(result),
    });

    return result;
  },
});



export const generateSeoStrategy = action({
  args: { startupId: v.id("startups") },
  handler: async (ctx, { startupId }) => {
    const startup = await ctx.runQuery(api.startups.getStartupById, { id: startupId });
    if (!startup || !startup.brainstormResult || !startup.marketingCopy || !startup.customerPersonas) {
      throw new Error("Brainstorm, Marketing Copy, and Customer Personas must be completed first.");
    }

    const fullContext = {
      name: startup.name,
      refinedIdea: JSON.parse(startup.brainstormResult).refinedIdea,
      marketingCopy: JSON.parse(startup.marketingCopy),
      customerPersonas: JSON.parse(startup.customerPersonas).personas,
    };

    const result = await ctx.runAction(internal.openai.generateSeoStrategyWithAI, {
      fullContext,
    });

    await ctx.runMutation(api.startups.updateSeoStrategy, {
      startupId,
      seoStrategy: JSON.stringify(result),
    });

    return result;
  },
});

export const generateProcessMap = action({
  args: { startupId: v.id("startups") },
  handler: async (ctx, { startupId }) => {
    const startup = await ctx.runQuery(api.startups.getStartupById, { id: startupId });
    if (!startup || !startup.businessPlan || !startup.developmentRoadmap) {
      throw new Error("Business Plan and Development Roadmap must be completed first.");
    }

    const fullContext = {
      name: startup.name,
      businessPlan: JSON.parse(startup.businessPlan),
      developmentRoadmap: JSON.parse(startup.developmentRoadmap),
    };

    const result = await ctx.runAction(internal.openai.generateProcessMapWithAI, {
      fullContext,
    });

    await ctx.runMutation(api.startups.updateProcessAutomation, {
      startupId,
      processAutomation: JSON.stringify(result),
    });

    return result;
  },
});

export const generateJobDescriptions = action({
  args: { startupId: v.id("startups") },
  handler: async (ctx, { startupId }) => {
    const startup = await ctx.runQuery(api.startups.getStartupById, { id: startupId });
    if (!startup || !startup.businessPlan || !startup.developmentRoadmap) {
      throw new Error("Business Plan and Development Roadmap must be completed first.");
    }

    const fullContext = {
      name: startup.name,
      businessPlan: JSON.parse(startup.businessPlan),
      developmentRoadmap: JSON.parse(startup.developmentRoadmap),
    };

    const result = await ctx.runAction(internal.openai.generateJobDescriptionsWithAI, {
      fullContext,
    });

    await ctx.runMutation(api.startups.updateDraftJobDescriptions, {
      startupId,
      draftJobDescriptions: JSON.stringify(result),
    });

    return result;
  },
});

export const generateInvestorMatches = action({
  args: { startupId: v.id("startups") },
  handler: async (ctx, { startupId }) => {
    const startup = await ctx.runQuery(api.startups.getStartupById, { id: startupId });
    if (!startup || !startup.businessPlan || !startup.pitchDeck) {
      throw new Error("Business Plan and Pitch Deck must be completed first.");
    }

    const fullContext = {
      name: startup.name,
      businessPlan: JSON.parse(startup.businessPlan),
      pitchDeck: JSON.parse(startup.pitchDeck),
    };

    // 1. Generate search queries
    const { queries } = await ctx.runAction(internal.openai.generateInvestorSearchQueries, {
      fullContext,
    });

    // 2. Search for URLs and then scrape content for each query
    const allScrapedData: any[] = [];
    for (const query of queries) {
      try {
        // Step 1: Search for URLs. `search` action returns an array of search results.
        const searchResults = await ctx.runAction(api.firecrawl.search, { keyword: query });
        
        if (searchResults && searchResults.length > 0) {
          // Take top 2 URLs from the search results for this query
          const urlsToScrape = searchResults.slice(0, 2).map((res: any) => res.url);

          // Step 2: Scrape each URL in parallel
          const scrapePromises = urlsToScrape.map((url: string) => ctx.runAction(api.firecrawl.scrape, { url }));
          const scrapedPages = await Promise.all(scrapePromises);
          
          scrapedPages.forEach((scrapedPage) => {
            if (scrapedPage) {
              allScrapedData.push(scrapedPage);
            }
          });
        }
      } catch (error) {
        // This will catch errors from the search action itself
        console.warn(`Could not perform search for query: "${query}". Skipping.`, error);
      }
    }

    if (allScrapedData.length === 0) {
      throw new Error(`Could not find or scrape any information for the generated investor search queries.`);
    }

    // 3. Analyze scraped data and find matches
    const result = await ctx.runAction(internal.openai.findInvestorsWithAI, {
      fullContext,
      scrapedData: allScrapedData,
    });

    // 4. Save the result
    await ctx.runMutation(api.startups.updateInvestorMatching, {
      startupId,
      investorMatching: JSON.stringify(result),
    });

    return result;
  },
});

export const generateDueDiligenceChecklist = action({
    args: {
        startupId: v.id("startups"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }

        const startup = await ctx.runQuery(api.startups.getStartupById, { id: args.startupId });
        if (!startup) {
            throw new Error("Startup not found");
        }

        const { idea, businessPlan, marketResearch, techStack } = startup;

        const jsonPrompt = `
        Based on the following details for a startup named "${startup.name}", generate a comprehensive Due Diligence Checklist for potential investors.

        **Core Idea:**
        ${idea || 'Not provided.'}

        **Business Plan Summary:**
        ${businessPlan || 'Not provided.'}

        **Market Research Summary:**
        ${marketResearch || 'Not provided.'}

        **Proposed Tech Stack:**
        ${techStack || 'Not provided.'}

        **CRITICAL INSTRUCTION:** Your output MUST be a single, valid JSON object. Do not include any text or markdown before or after the JSON object.
        The JSON object should have a single root key "checklist", which is an array of objects.
        Each object in the array represents a category and must have two keys:
        1. "category": A string for the category name (e.g., "Financial", "Legal", "Technical", "Team", "Product").
        2. "items": An array of strings, where each string is a specific, actionable checklist item.

        **Example JSON output:**
        {
          "checklist": [
            {
              "category": "Financial",
              "items": [
                "Review of 3-year financial projections.",
                "Analysis of cash flow statements for the last 12 months.",
                "Verification of current capitalization table (cap table)."
              ]
            },
            {
              "category": "Legal",
              "items": [
                "Review of company incorporation documents.",
                "Inspection of all intellectual property (IP) filings and ownership.",
                "Analysis of all major customer and supplier contracts."
              ]
            }
          ]
        }
        `;

        const resultJson = await ctx.runAction(api.openai.generateContent, {
            prompt: jsonPrompt,
            responseMimeType: "application/json"
        });

        let originalData: any;

        try {
            if (typeof resultJson === 'string') {
                const match = resultJson.match(/\{[\s\S]*\}/);
                if (!match) {
                    throw new Error("AI response string did not contain a valid JSON object. Raw: " + resultJson);
                }
                originalData = JSON.parse(match[0]);
            } else if (typeof resultJson === 'object' && resultJson !== null) {
                originalData = resultJson;
            } else {
                throw new Error("Unexpected response type from AI: " + typeof resultJson);
            }

            const transformedData = {
                ...originalData,
                checklist: originalData.checklist.map((category: any) => ({
                    ...category,
                    items: category.items.map((itemText: string) => ({
                        text: itemText,
                        completed: false
                    }))
                }))
            };

            await ctx.runMutation(api.startups.updateDueDiligenceChecklist, {
                startupId: args.startupId,
                dueDiligenceChecklist: JSON.stringify(transformedData),
            });
        } catch (e: any) {
            console.error("Failed to process JSON response from AI. Error:", e.message);
            console.error("Original AI response was:", JSON.stringify(resultJson, null, 2));
            throw new Error("Failed to process JSON response from AI.");
        }

        return { success: true };
    },
});

export const chatWithVentureContext = action({
  args: {
    startupId: v.id("startups"),
    messageHistory: v.string(),
  },
  handler: async (ctx, { startupId, messageHistory }) => {
    const startup = await ctx.runQuery(api.startups.getStartupById, { id: startupId });
    if (!startup) {
      throw new Error("Startup not found");
    }

    // Create a comprehensive context object
    const fullContext: { [key: string]: any } = {};

    // Iterate over all startup fields and parse JSON strings
    for (const [key, value] of Object.entries(startup)) {
      if (typeof value === 'string') {
        try {
          fullContext[key] = JSON.parse(value);
        } catch (e) {
          // Not a JSON string, use the value as is
          fullContext[key] = value;
        }
      } else {
        fullContext[key] = value;
      }
    }

    const startupContext = `Here is the full context for the venture:\n${JSON.stringify(fullContext, null, 2)}`;

    const prompt = `
      You are a helpful AI assistant for an entrepreneur building a new venture called "${startup.name}".
      Your goal is to provide support, answer questions, and help them think through their business ideas based on the context provided.
      Be encouraging, insightful, and concise.

      Here is the current context for the venture:
      ${startupContext}

      Here is the recent conversation history:
      ${messageHistory}

      Based on all of this, provide a helpful response to the latest user message.
    `;

    const responseText = await ctx.runAction(internal.openai.generateContent, {
      prompt,
      responseMimeType: "text/plain",
    });

    return responseText;
  },
});

export const generatePitchCoachAnalysis = action({
  args: { startupId: v.id("startups") },
  handler: async (ctx, { startupId }) => {
    const startup = await ctx.runQuery(api.startups.getStartupById, { id: startupId });
    if (!startup || !startup.businessPlan || !startup.pitchDeck) {
      throw new Error("Business Plan and Pitch Deck must be completed first to use the AI Pitch Coach.");
    }

    const fullContext = {
      name: startup.name,
      businessPlan: JSON.parse(startup.businessPlan),
      pitchDeck: JSON.parse(startup.pitchDeck),
    };

    const result = await ctx.runAction(internal.openai.generatePitchCoachAnalysisWithAI, {
      fullContext,
    });

    await ctx.runMutation(api.startups.updateAIPitchCoach, {
      startupId,
      aiPitchCoach: JSON.stringify(result),
    });

    return result;
  },
});

export const smithBuild = action({
  args: {
    prompt: v.string(),
    history: v.string(),
  },
  handler: async (ctx, { prompt, history }) => {
    const result = await ctx.runAction(internal.openai.smithBuildWithAI, {
      prompt,
      history,
    });
    return result;
  },
});

export const generateInitialFiles = action({
  args: { prompt: v.string() },
  handler: async (ctx, { prompt }) => {
    const result = await ctx.runAction(internal.openai.generateInitialFiles, { prompt });
    return result;
  },
});

export const generateTaskResult = action({
  args: {
    startupId: v.id("startups"),
    taskId: v.string(),
    force: v.optional(v.boolean()),
  },
  handler: async (ctx, { startupId, taskId, force }) => {
    const startup = await ctx.runQuery(api.startups.getStartupById, { id: startupId });
    if (!startup) {
      throw new Error("Startup not found");
    }

    // Prevent re-running completed tasks
    const taskToResultField: Record<string, keyof typeof startup> = {
      brainstormIdea: "brainstormResult",
      marketPulseCheck: "marketPulse",
      defineMissionVision: "missionVision",
      generateNameIdentity: "brandIdentity",
      scorecard: "dashboard",
      businessPlan: "businessPlan",
      pitchDeck: "pitchDeck",
      marketResearch: "marketResearch",
      competitorMatrix: "competitorMatrix",
      generateCustomerPersonas: "customerPersonas",
      generateInterviewScripts: "interviewScripts",
      validateProblem: "customerValidation",
      aiMentor: "aiMentor",
      userFlowDiagrams: "userFlowDiagram",
      aiWireframing: "aiWireframe",
      website: "website",
      generateTechStack: "techStack",
      generateDatabaseSchema: "databaseSchema",
      generateAPIEndpoints: "apiEndpoints",
      generateDevelopmentRoadmap: "developmentRoadmap",
      estimateCosts: "costEstimate",
      pricingStrategy: "pricingStrategy",
      marketingCopy: "marketingCopy",
      preLaunchWaitlist: "preLaunchWaitlist",
      productHuntKit: "productHuntKit",
      pressRelease: "pressRelease",
      growthMetrics: "growthMetrics",
      abTestIdeas: "abTestIdeas",
      seoStrategy: "seoStrategy",
      processAutomation: "processAutomation",
      draftJobDescriptions: "draftJobDescriptions",
      investorMatching: "investorMatching",
      dueDiligenceChecklist: "dueDiligenceChecklist",
      aiPitchCoach: "aiPitchCoach",
    };

    const resultField = taskToResultField[taskId];
    if (!force && resultField && startup[resultField]) {
      console.log(`Skipping task ${taskId} as it is already completed.`);
      return { success: true, message: "Task already completed." };
    }

    console.log(`Generating result for task: ${taskId}`);

    try {
      switch (taskId) {
        case "brainstormIdea":
          return await ctx.runAction(api.actions.generateBrainstormIdea, { startupId, idea: startup.idea! });
        case "marketPulseCheck":
          return await ctx.runAction(api.actions.getMarketPulse, { startupId, idea: startup.idea! });
        case "defineMissionVision":
          return await ctx.runAction(api.actions.defineMissionVision, { startupId });
        case "generateNameIdentity":
          return await ctx.runAction(api.actions.generateBrandIdentity, { startupId });
        case "scorecard":
          return await ctx.runAction(api.actions.generateScorecard, { startupId });
        case "businessPlan":
          return await ctx.runAction(api.actions.generateBusinessPlan, { startupId });
        case "pitchDeck":
          return await ctx.runAction(api.actions.generatePitchDeck, { startupId });
        case "marketResearch":
          return await ctx.runAction(api.actions.generateMarketResearch, { startupId });
        case "competitorMatrix":
          return await ctx.runAction(api.actions.generateCompetitorMatrix, { startupId });
        case "generateCustomerPersonas":
          return await ctx.runAction(api.actions.generateCustomerPersonas, { startupId });
        case "generateInterviewScripts":
          return await ctx.runAction(api.actions.generateInterviewScripts, { startupId });
        case "validateProblem":
          return await ctx.runAction(api.actions.runInterviewSimulations, { startupId });
        case "aiMentor":
          return await ctx.runAction(api.actions.getMentorFeedback, { startupId });
        case "userFlowDiagrams":
          return await ctx.runAction(api.actions.generateUserFlow, { startupId });
        case "aiWireframing":
          return await ctx.runAction(api.actions.generateAIWireframe, { startupId });
        case "website":
          return await ctx.runAction(api.actions.generateWebsitePrototype, { startupId });
        case "generateTechStack":
          return await ctx.runAction(api.actions.generateTechStack, { startupId });
        case "generateDatabaseSchema":
          return await ctx.runAction(api.actions.createDatabaseSchema, { startupId });
        case "generateAPIEndpoints":
          return await ctx.runAction(api.actions.generateApiEndpoints, { startupId });
        case "generateDevelopmentRoadmap":
          return await ctx.runAction(api.actions.generateDevelopmentRoadmap, { startupId });
        case "estimateCosts":
          return await ctx.runAction(api.actions.estimateCloudCosts, { startupId });
        case "pricingStrategy":
          return await ctx.runAction(api.actions.generatePricingStrategy, { startupId });
        case "marketingCopy":
          return await ctx.runAction(api.actions.generateMarketingCopy, { startupId });
        case "preLaunchWaitlist":
          return await ctx.runAction(api.actions.generateWaitlistPage, { startupId });
        case "productHuntKit":
          return await ctx.runAction(api.actions.generateProductHuntKit, { startupId });
        case "pressRelease":
          return await ctx.runAction(api.actions.generatePressRelease, { startupId });
        case "growthMetrics":
          return await ctx.runAction(api.actions.generateGrowthMetrics, { startupId });
        case "abTestIdeas":
          return await ctx.runAction(api.actions.generateABTestIdeas, { startupId });
        case "seoStrategy":
          return await ctx.runAction(api.actions.generateSeoStrategy, { startupId });
        case "processAutomation":
          return await ctx.runAction(api.actions.generateProcessMap, { startupId });
        case "draftJobDescriptions":
          return await ctx.runAction(api.actions.generateJobDescriptions, { startupId });
        case "investorMatching":
          return await ctx.runAction(api.actions.generateInvestorMatches, { startupId });
        case "dueDiligenceChecklist":
          return await ctx.runAction(api.actions.generateDueDiligenceChecklist, { startupId });
        case "aiPitchCoach":
          return await ctx.runAction(api.actions.generatePitchCoachAnalysis, { startupId });
        // Omitting 'growthMetrics' as it seems to be handled differently.
        default:
          console.warn(`No generation logic defined for task: ${taskId}`);
          return { success: false, message: "No generation logic defined for task." };
      }
    } catch (error: any) {
      console.error(`Error generating result for task ${taskId}:`, error);
      // Don't re-throw, just return a failure to allow the preload sequence to continue
      return { success: false, message: `Failed to generate result for ${taskId}.`, error: error.message };
    }
  },
});
