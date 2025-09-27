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
  args: {
    startupId: v.id("startups"),
    idea: v.string(),
  },
  handler: async (ctx, { startupId, idea }) => {
    const result = await ctx.runAction(internal.gemini.generateBusinessPlanWithAI, {
      idea,
    });

    await ctx.runMutation(api.startups.updateBusinessPlan, {
      startupId,
      businessPlan: JSON.stringify(result),
    });

    return result;
  },
});

export const generatePitchDeck = action({
  args: {
    startupId: v.id("startups"),
    idea: v.string(),
  },
  handler: async (ctx, { startupId, idea }) => {
    const result = await ctx.runAction(internal.gemini.generatePitchDeckWithAI, {
      idea,
    });

    await ctx.runMutation(api.startups.updatePitchDeck, {
      startupId,
      pitchDeck: JSON.stringify(result),
    });

    return result;
  },
});

export const generateMarketResearch = action({
  args: {
    startupId: v.id("startups"),
    idea: v.string(),
  },
  handler: async (ctx, { startupId, idea }) => {
    const result = await ctx.runAction(api.firecrawl.performMarketAnalysis, {
      keyword: idea,
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
