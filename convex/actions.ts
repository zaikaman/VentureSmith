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
  args: {
    startupId: v.id("startups"),
    idea: v.string(),
  },
  handler: async (ctx, { startupId, idea }) => {
    const result = await ctx.runAction(internal.gemini.generateScorecardWithAI, {
      idea,
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
