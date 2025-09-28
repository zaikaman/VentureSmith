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
    const result = await ctx.runAction(internal.gemini.validateProblemWithAI, {
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

    const result = await ctx.runAction(internal.gemini.generateScorecardWithAI, {
      fullContext,
    });

    await ctx.runMutation(api.startups.updateScorecard, {
      startupId,
      scorecard: JSON.stringify(result),
    });

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

    const result = await ctx.runAction(internal.gemini.generateBusinessPlanWithAI, {
      fullContext,
    });

    await ctx.runMutation(api.startups.updateBusinessPlan, {
      startupId,
      businessPlan: JSON.stringify(result),
    });

    return result;
  },
});

export const generatePitchDeck = action({
  args: { startupId: v.id("startups") },
  handler: async (ctx, { startupId }) => {
    const startup = await ctx.runQuery(api.startups.getStartupById, { id: startupId });
    if (!startup || !startup.brainstormResult || !startup.marketPulse || !startup.missionVision || !startup.brandIdentity) {
      throw new Error("Previous steps must be completed to generate a pitch deck.");
    }

    const fullContext = {
      name: startup.name,
      refinedIdea: JSON.parse(startup.brainstormResult).refinedIdea,
      marketPulse: JSON.parse(startup.marketPulse),
      missionVision: JSON.parse(startup.missionVision),
      brandIdentity: JSON.parse(startup.brandIdentity),
    };

    const result = await ctx.runAction(internal.gemini.generatePitchDeckWithAI, {
      fullContext,
    });

    await ctx.runMutation(api.startups.updatePitchDeck, {
      startupId,
      pitchDeck: JSON.stringify(result),
    });

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

    const refinedIdea = JSON.parse(startup.brainstormResult).refinedIdea;

    const result = await ctx.runAction(api.firecrawl.performMarketAnalysis, {
      keyword: refinedIdea,
    });

    await ctx.runMutation(api.startups.updateMarketResearch, {
      startupId,
      marketResearch: JSON.stringify(result),
    });

    return result;
  },
});
export const generateBrainstormIdea = action({
  args: {
    startupId: v.id("startups"),
    idea: v.string(),
  },
  handler: async (ctx, { startupId, idea }) => {
    const result = await ctx.runAction(internal.gemini.brainstormIdeaWithAI, {
      idea,
    });

    await ctx.runMutation(api.startups.updateBrainstormResult, {
      startupId,
      brainstormResult: JSON.stringify(result),
    });

    return result;
  },
});

export const getMarketPulse = action({
  args: {
    startupId: v.id("startups"),
    idea: v.string(),
  },
  handler: async (ctx, { startupId, idea }) => {
    const result = await ctx.runAction(internal.gemini.getMarketPulseWithAI, {
      idea,
    });

    await ctx.runMutation(api.startups.updateMarketPulse, {
      startupId,
      marketPulse: JSON.stringify(result),
    });

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

    const result = await ctx.runAction(internal.gemini.defineMissionVisionWithAI, {
      name: startup.name,
      refinedIdea,
      marketPulse,
    });

    await ctx.runMutation(api.startups.updateMissionVision, {
      startupId,
      missionVision: JSON.stringify(result),
    });

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

    const result = await ctx.runAction(internal.gemini.generateBrandIdentityWithAI, {
      refinedIdea,
      keywords,
      mission,
      vision,
    });

    await ctx.runMutation(api.startups.updateBrandIdentity, {
      startupId,
      brandIdentity: JSON.stringify(result),
    });

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

    const result = await ctx.runAction(internal.gemini.generateCompetitorMatrixWithAI, {
      startupName: startup.name,
      marketResearchSummary,
    });

    await ctx.runMutation(api.startups.updateCompetitorMatrix, {
      startupId,
      competitorMatrix: JSON.stringify(result),
    });

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

    const result = await ctx.runAction(internal.gemini.generateCustomerPersonasWithAI, {
      fullContext,
    });

    await ctx.runMutation(api.startups.updateCustomerPersonas, {
      startupId,
      customerPersonas: JSON.stringify(result),
    });

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

    const result = await ctx.runAction(internal.gemini.generateInterviewScriptsWithAI, {
      startupName: startup.name,
      refinedIdea,
      personas,
    });

    await ctx.runMutation(api.startups.updateInterviewScripts, {
      startupId,
      interviewScripts: JSON.stringify(result),
    });

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

    const result = await ctx.runAction(internal.gemini.runInterviewSimulationsWithAI, {
      fullContext,
    });

    await ctx.runMutation(api.startups.updateCustomerValidation, {
      startupId,
      customerValidation: JSON.stringify(result),
    });

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

    const result = await ctx.runAction(internal.gemini.getMentorFeedbackWithAI, {
      fullContext,
    });

    await ctx.runMutation(api.startups.updateMentorFeedback, {
      startupId,
      feedback: JSON.stringify(result),
    });

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

    const result = await ctx.runAction(internal.gemini.generateUserFlowWithAI, {
      fullContext,
    });

    await ctx.runMutation(api.startups.updateUserFlowDiagram, {
      startupId,
      userFlowDiagram: JSON.stringify(result),
    });

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

    const result = await ctx.runAction(internal.gemini.generateAIWireframeWithAI, {
      fullContext,
    });

    await ctx.runMutation(api.startups.updateAIWireframe, {
      startupId,
      aiWireframe: JSON.stringify(result),
    });

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

    const result = await ctx.runAction(internal.gemini.generateTechStackWithAI, {
      fullContext,
    });

    await ctx.runMutation(api.startups.updateTechStack, {
      startupId,
      techStack: JSON.stringify(result),
    });

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

    const result = await ctx.runAction(internal.gemini.generateDatabaseSchema, {
      fullContext,
    });

    await ctx.runMutation(api.startups.updateDatabaseSchema, {
      startupId,
      databaseSchema: JSON.stringify(result),
    });

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

    const result = await ctx.runAction(internal.gemini.generateWebsitePrototypeWithAI, {
      fullContext,
    });

    await ctx.runMutation(api.startups.updateWebsitePrototype, {
      startupId,
      website: JSON.stringify(result),
    });

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

    const result = await ctx.runAction(internal.gemini.generateApiEndpointsWithAI, {
      fullContext,
    });

    await ctx.runMutation(api.startups.updateApiEndpoints, {
      startupId,
      apiEndpoints: result,
    });

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

    const result = await ctx.runAction(internal.gemini.generateDevelopmentRoadmapWithAI, {
      fullContext,
    });

    await ctx.runMutation(api.startups.updateDevelopmentRoadmap, {
      startupId,
      developmentRoadmap: result,
    });

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

    const result = await ctx.runAction(internal.gemini.estimateCloudCostsWithAI, {
      fullContext,
    });

    await ctx.runMutation(api.startups.updateCostEstimate, {
      startupId,
      costEstimate: result,
    });

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

    const result = await ctx.runAction(internal.gemini.generatePricingStrategyWithAI, {
      fullContext,
    });

    await ctx.runMutation(api.startups.updatePricingStrategy, {
      startupId,
      pricingStrategy: result,
    });

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

    const result = await ctx.runAction(internal.gemini.generateMarketingCopyWithAI, {
      fullContext,
    });

    await ctx.runMutation(api.startups.updateMarketingCopy, {
      startupId,
      marketingCopy: result,
    });

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

    const result = await ctx.runAction(internal.gemini.generateWaitlistPageWithAI, {
      fullContext,
    });

    await ctx.runMutation(api.startups.updatePreLaunchWaitlist, {
      startupId,
      preLaunchWaitlist: result,
    });

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

    const result = await ctx.runAction(internal.gemini.generateProductHuntKitWithAI, {
      fullContext,
    });

    await ctx.runMutation(api.startups.updateProductHuntKit, {
      startupId,
      productHuntKit: result,
    });

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

    const result = await ctx.runAction(internal.gemini.generatePressReleaseWithAI, {
      fullContext,
    });

    await ctx.runMutation(api.startups.updatePressRelease, {
      startupId,
      pressRelease: result,
    });

    return result;
  },
});

export const generateABTestIdeas = action({
  args: { startupId: v.id("startups") },
  handler: async (ctx, { startupId }) => {
    const startup = await ctx.runQuery(api.startups.getStartupById, { id: startupId });
    if (!startup || !startup.brainstormResult || !startup.customerPersonas) {
      throw new Error("Brainstorming and Customer Personas must be completed first.");
    }

    const brainstormData = JSON.parse(startup.brainstormResult);

    const fullContext = {
      name: startup.name,
      refinedIdea: brainstormData.refinedIdea,
      keyFeatures: brainstormData.keyFeatures,
      customerPersonas: JSON.parse(startup.customerPersonas).personas,
    };

    const result = await ctx.runAction(internal.gemini.generateABTestIdeasWithAI, {
      fullContext,
    });

    await ctx.runMutation(api.startups.updateABTestIdeas, {
      startupId,
      abTestIdeas: result,
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

    const result = await ctx.runAction(internal.gemini.generateSeoStrategyWithAI, {
      fullContext,
    });

    await ctx.runMutation(api.startups.updateSeoStrategy, {
      startupId,
      seoStrategy: result,
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

    const result = await ctx.runAction(internal.gemini.generateProcessMapWithAI, {
      fullContext,
    });

    await ctx.runMutation(api.startups.updateProcessAutomation, {
      startupId,
      processAutomation: result,
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

    const result = await ctx.runAction(internal.gemini.generateJobDescriptionsWithAI, {
      fullContext,
    });

    await ctx.runMutation(api.startups.updateDraftJobDescriptions, {
      startupId,
      draftJobDescriptions: result,
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
    const { queries } = await ctx.runAction(internal.gemini.generateInvestorSearchQueries, {
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
    const result = await ctx.runAction(internal.gemini.findInvestorsWithAI, {
      fullContext,
      scrapedData: allScrapedData,
    });

    // 4. Save the result
    await ctx.runMutation(api.startups.updateInvestorMatching, {
      startupId,
      investorMatching: result,
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

        const resultJsonString = await ctx.runAction(api.gemini.generateContent, {
            prompt: jsonPrompt,
            responseMimeType: "application/json"
        });

        const rawString = resultJsonString as string;
        // Use a regex to find the JSON block, which is more robust
        const match = rawString.match(/\{[\s\S]*\}/);

        if (!match) {
            throw new Error("AI response did not contain a valid JSON object. Raw response: " + rawString);
        }

        const cleanJsonString = match[0];

        try {
            const originalData = JSON.parse(cleanJsonString);
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
            console.error("Failed to parse cleaned JSON. Error:", e.message);
            console.error("Cleaned JSON string that failed parsing was:", cleanJsonString);
            throw new Error("Failed to parse JSON from AI after robust cleaning.");
        }

        return { success: true };
    },
});