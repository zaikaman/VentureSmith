import { mutation, query, action } from "./_generated/server";
import { api } from "./_generated/api";
import { v } from "convex/values";

export const getStartupsForUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_subject", (q) => q.eq("subject", identity.subject))
      .unique();

    if (!user) {
      return [];
    }

    return ctx.db
      .query("startups")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

export const createStartup = mutation({
  args: {
    name: v.optional(v.string()),
    idea: v.optional(v.string()),
    dashboard: v.optional(v.string()),
    businessPlan: v.optional(v.string()),
    website: v.optional(v.string()),
    pitchDeck: v.optional(v.string()),
    marketResearch: v.optional(v.string()),
    aiMentor: v.optional(v.string()),
    dueDiligenceChecklist: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_subject", (q) => q.eq("subject", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const startupId = await ctx.db.insert("startups", {
      userId: user._id,
      createdAt: Date.now(),
      ...args,
    });
    return startupId;
  },
});

export const getStartupById = query({
  args: { id: v.id("startups") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const startup = await ctx.db.get(args.id);

    if (!startup) {
      throw new Error("Startup not found");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_subject", (q) => q.eq("subject", identity.subject))
      .unique();

    if (!user || user._id !== startup.userId) {
      throw new Error("Not authorized to view this startup");
    }

    return startup;
  },
});

export const updateWebsitePrototype = mutation({
  args: { 
    startupId: v.id("startups"), 
    website: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const startup = await ctx.db.get(args.startupId);
    if (!startup) {
      throw new Error("Startup not found");
    }

    // Check for ownership
    const user = await ctx.db.query("users").withIndex("by_subject", q => q.eq("subject", identity.subject)).unique();
    if (!user || user._id !== startup.userId) {
      throw new Error("Not authorized to update this startup");
    }

    // Update the startup document
    await ctx.db.patch(args.startupId, {
      website: args.website,
    });

    return { success: true };
  },
});

export const updateMentorFeedback = mutation({
  args: { 
    startupId: v.id("startups"), 
    feedback: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const startup = await ctx.db.get(args.startupId);
    if (!startup) {
      throw new Error("Startup not found");
    }

    // Check for ownership
    const user = await ctx.db.query("users").withIndex("by_subject", q => q.eq("subject", identity.subject)).unique();
    if (!user || user._id !== startup.userId) {
      throw new Error("Not authorized to update this startup");
    }

    // Update the startup document
    await ctx.db.patch(args.startupId, {
      aiMentor: args.feedback,
    });

    return { success: true };
  },
});

export const updateCustomerValidation = mutation({
  args: {
    startupId: v.id("startups"),
    customerValidation: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const startup = await ctx.db.get(args.startupId);
    if (!startup) {
      throw new Error("Startup not found");
    }

    // Check for ownership
    const user = await ctx.db.query("users").withIndex("by_subject", q => q.eq("subject", identity.subject)).unique();
    if (!user || user._id !== startup.userId) {
      throw new Error("Not authorized to update this startup");
    }

    await ctx.db.patch(args.startupId, {
      customerValidation: args.customerValidation,
    });

    return { success: true };
  },
});

export const updateScorecard = mutation({
  args: {
    startupId: v.id("startups"),
    scorecard: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const startup = await ctx.db.get(args.startupId);
    if (!startup) {
      throw new Error("Startup not found");
    }

    // Check for ownership
    const user = await ctx.db.query("users").withIndex("by_subject", q => q.eq("subject", identity.subject)).unique();
    if (!user || user._id !== startup.userId) {
      throw new Error("Not authorized to update this startup");
    }

    await ctx.db.patch(args.startupId, {
      dashboard: args.scorecard,
    });

    return { success: true };
  },
});

export const updateBrainstormResult = mutation({
  args: {
    startupId: v.id("startups"),
    brainstormResult: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const startup = await ctx.db.get(args.startupId);
    if (!startup) {
      throw new Error("Startup not found");
    }

    // Check for ownership
    const user = await ctx.db.query("users").withIndex("by_subject", q => q.eq("subject", identity.subject)).unique();
    if (!user || user._id !== startup.userId) {
      throw new Error("Not authorized to update this startup");
    }

    await ctx.db.patch(args.startupId, {
      brainstormResult: args.brainstormResult,
    });

    return { success: true };
  },
});

export const deleteStartup = mutation({
  args: { id: v.id("startups") },
  handler: async (ctx, args) => {
    console.log(`Backend: Attempting to delete document with ID: ${args.id}`);
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const startup = await ctx.db.get(args.id);
    if (!startup) {
      throw new Error("Startup not found");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_subject", (q) => q.eq("subject", identity.subject))
      .unique();

    if (!user || user._id !== startup.userId) {
      throw new Error("Not authorized to delete this startup");
    }

    await ctx.db.delete(args.id);
    return { success: true };
  },
});

export const updateBusinessPlan = mutation({
  args: {
    startupId: v.id("startups"),
    businessPlan: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const startup = await ctx.db.get(args.startupId);
    if (!startup) {
      throw new Error("Startup not found");
    }

    // Check for ownership
    const user = await ctx.db.query("users").withIndex("by_subject", q => q.eq("subject", identity.subject)).unique();
    if (!user || user._id !== startup.userId) {
      throw new Error("Not authorized to update this startup");
    }

    await ctx.db.patch(args.startupId, {
      businessPlan: args.businessPlan,
    });

    return { success: true };
  },
});

export const updatePitchDeck = mutation({
  args: {
    startupId: v.id("startups"),
    pitchDeck: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const startup = await ctx.db.get(args.startupId);
    if (!startup) {
      throw new Error("Startup not found");
    }

    // Check for ownership
    const user = await ctx.db.query("users").withIndex("by_subject", q => q.eq("subject", identity.subject)).unique();
    if (!user || user._id !== startup.userId) {
      throw new Error("Not authorized to update this startup");
    }

    await ctx.db.patch(args.startupId, {
      pitchDeck: args.pitchDeck,
    });

    return { success: true };
  },
});

export const updateMarketResearch = mutation({
  args: {
    startupId: v.id("startups"),
    marketResearch: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const startup = await ctx.db.get(args.startupId);
    if (!startup) {
      throw new Error("Startup not found");
    }

    // Check for ownership
    const user = await ctx.db.query("users").withIndex("by_subject", q => q.eq("subject", identity.subject)).unique();
    if (!user || user._id !== startup.userId) {
      throw new Error("Not authorized to update this startup");
    }

    await ctx.db.patch(args.startupId, {
      marketResearch: args.marketResearch,
    });

    return { success: true };
  },
});

export const updateMarketPulse = mutation({
  args: {
    startupId: v.id("startups"),
    marketPulse: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const startup = await ctx.db.get(args.startupId);
    if (!startup) {
      throw new Error("Startup not found");
    }

    // Check for ownership
    const user = await ctx.db.query("users").withIndex("by_subject", q => q.eq("subject", identity.subject)).unique();
    if (!user || user._id !== startup.userId) {
      throw new Error("Not authorized to update this startup");
    }

    await ctx.db.patch(args.startupId, {
      marketPulse: args.marketPulse,
    });

    return { success: true };
  },
});

export const updateMissionVision = mutation({
  args: {
    startupId: v.id("startups"),
    missionVision: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const startup = await ctx.db.get(args.startupId);
    if (!startup) {
      throw new Error("Startup not found");
    }

    const user = await ctx.db.query("users").withIndex("by_subject", q => q.eq("subject", identity.subject)).unique();
    if (!user || user._id !== startup.userId) {
      throw new Error("Not authorized to update this startup");
    }

    await ctx.db.patch(args.startupId, {
      missionVision: args.missionVision,
    });

    return { success: true };
  },
});

export const updateBrandIdentity = mutation({
  args: {
    startupId: v.id("startups"),
    brandIdentity: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const startup = await ctx.db.get(args.startupId);
    if (!startup) {
      throw new Error("Startup not found");
    }

    const user = await ctx.db.query("users").withIndex("by_subject", q => q.eq("subject", identity.subject)).unique();
    if (!user || user._id !== startup.userId) {
      throw new Error("Not authorized to update this startup");
    }

    await ctx.db.patch(args.startupId, {
      brandIdentity: args.brandIdentity,
    });

    return { success: true };
  },
});

export const updateCompetitorMatrix = mutation({
  args: {
    startupId: v.id("startups"),
    competitorMatrix: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const startup = await ctx.db.get(args.startupId);
    if (!startup) {
      throw new Error("Startup not found");
    }

    const user = await ctx.db.query("users").withIndex("by_subject", q => q.eq("subject", identity.subject)).unique();
    if (!user || user._id !== startup.userId) {
      throw new Error("Not authorized to update this startup");
    }

    await ctx.db.patch(args.startupId, {
      competitorMatrix: args.competitorMatrix,
    });

    return { success: true };
  },
});

export const updateCustomerPersonas = mutation({
  args: {
    startupId: v.id("startups"),
    customerPersonas: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const startup = await ctx.db.get(args.startupId);
    if (!startup) {
      throw new Error("Startup not found");
    }

    const user = await ctx.db.query("users").withIndex("by_subject", q => q.eq("subject", identity.subject)).unique();
    if (!user || user._id !== startup.userId) {
      throw new Error("Not authorized to update this startup");
    }

    await ctx.db.patch(args.startupId, {
      customerPersonas: args.customerPersonas,
    });

    return { success: true };
  },
});

export const updateInterviewScripts = mutation({
  args: {
    startupId: v.id("startups"),
    interviewScripts: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const startup = await ctx.db.get(args.startupId);
    if (!startup) {
      throw new Error("Startup not found");
    }

    const user = await ctx.db.query("users").withIndex("by_subject", q => q.eq("subject", identity.subject)).unique();
    if (!user || user._id !== startup.userId) {
      throw new Error("Not authorized to update this startup");
    }

    await ctx.db.patch(args.startupId, {
      interviewScripts: args.interviewScripts,
    });

    return { success: true };
  },
});

export const updateName = mutation({
  args: {
    startupId: v.id("startups"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const startup = await ctx.db.get(args.startupId);
    if (!startup) {
      throw new Error("Startup not found");
    }

    const user = await ctx.db.query("users").withIndex("by_subject", q => q.eq("subject", identity.subject)).unique();
    if (!user || user._id !== startup.userId) {
      throw new Error("Not authorized to update this startup");
    }

    await ctx.db.patch(args.startupId, {
      name: args.name,
      brandNameSelected: true,
    });

    return { success: true };
  },
});

export const updateUserFlowDiagram = mutation({
  args: {
    startupId: v.id("startups"),
    userFlowDiagram: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const startup = await ctx.db.get(args.startupId);
    if (!startup) {
      throw new Error("Startup not found");
    }

    const user = await ctx.db.query("users").withIndex("by_subject", q => q.eq("subject", identity.subject)).unique();
    if (!user || user._id !== startup.userId) {
      throw new Error("Not authorized to update this startup");
    }

    await ctx.db.patch(args.startupId, {
      userFlowDiagram: args.userFlowDiagram,
    });

    return { success: true };
  },
});

export const updateAIWireframe = mutation({
  args: {
    startupId: v.id("startups"),
    aiWireframe: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const startup = await ctx.db.get(args.startupId);
    if (!startup) {
      throw new Error("Startup not found");
    }

    const user = await ctx.db.query("users").withIndex("by_subject", q => q.eq("subject", identity.subject)).unique();
    if (!user || user._id !== startup.userId) {
      throw new Error("Not authorized to update this startup");
    }

    await ctx.db.patch(args.startupId, {
      aiWireframe: args.aiWireframe,
    });

    return { success: true };
  },
});

export const updateTechStack = mutation({
  args: {
    startupId: v.id("startups"),
    techStack: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const startup = await ctx.db.get(args.startupId);
    if (!startup) {
      throw new Error("Startup not found");
    }

    const user = await ctx.db.query("users").withIndex("by_subject", q => q.eq("subject", identity.subject)).unique();
    if (!user || user._id !== startup.userId) {
      throw new Error("Not authorized to update this startup");
    }

    await ctx.db.patch(args.startupId, {
      techStack: args.techStack,
    });

    return { success: true };
  },
});

export const updateDatabaseSchema = mutation({
  args: {
    startupId: v.id("startups"),
    databaseSchema: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const startup = await ctx.db.get(args.startupId);
    if (!startup) {
      throw new Error("Startup not found");
    }

    const user = await ctx.db.query("users").withIndex("by_subject", q => q.eq("subject", identity.subject)).unique();
    if (!user || user._id !== startup.userId) {
      throw new Error("Not authorized to update this startup");
    }

    await ctx.db.patch(args.startupId, {
      databaseSchema: args.databaseSchema,
    });

    return { success: true };
  },
});

export const updateAIWireframeCode = mutation({
  args: { 
    startupId: v.id("startups"), 
    aiWireframe: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const startup = await ctx.db.get(args.startupId);
    if (!startup) {
      throw new Error("Startup not found");
    }

    const user = await ctx.db.query("users").withIndex("by_subject", q => q.eq("subject", identity.subject)).unique();
    if (!user || user._id !== startup.userId) {
      throw new Error("Not authorized to update this startup");
    }

    await ctx.db.patch(args.startupId, {
      aiWireframe: args.aiWireframe,
    });

    return { success: true };
  },
});

export const updateApiEndpoints = mutation({
  args: {
    startupId: v.id("startups"),
    apiEndpoints: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const startup = await ctx.db.get(args.startupId);
    if (!startup) {
      throw new Error("Startup not found");
    }

    const user = await ctx.db.query("users").withIndex("by_subject", q => q.eq("subject", identity.subject)).unique();
    if (!user || user._id !== startup.userId) {
      throw new Error("Not authorized to update this startup");
    }

    await ctx.db.patch(args.startupId, {
      apiEndpoints: args.apiEndpoints,
    });

    return { success: true };
  },
});

export const updateDevelopmentRoadmap = mutation({
  args: {
    startupId: v.id("startups"),
    developmentRoadmap: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const startup = await ctx.db.get(args.startupId);
    if (!startup) {
      throw new Error("Startup not found");
    }

    const user = await ctx.db.query("users").withIndex("by_subject", q => q.eq("subject", identity.subject)).unique();
    if (!user || user._id !== startup.userId) {
      throw new Error("Not authorized to update this startup");
    }

    await ctx.db.patch(args.startupId, {
      developmentRoadmap: args.developmentRoadmap,
    });

    return { success: true };
  },
});

export const updateCostEstimate = mutation({
  args: {
    startupId: v.id("startups"),
    costEstimate: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const startup = await ctx.db.get(args.startupId);
    if (!startup) {
      throw new Error("Startup not found");
    }

    const user = await ctx.db.query("users").withIndex("by_subject", q => q.eq("subject", identity.subject)).unique();
    if (!user || user._id !== startup.userId) {
      throw new Error("Not authorized to update this startup");
    }

    await ctx.db.patch(args.startupId, {
      costEstimate: args.costEstimate,
    });

    return { success: true };
  },
});

export const updatePricingStrategy = mutation({
  args: {
    startupId: v.id("startups"),
    pricingStrategy: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const startup = await ctx.db.get(args.startupId);
    if (!startup) {
      throw new Error("Startup not found");
    }

    const user = await ctx.db.query("users").withIndex("by_subject", q => q.eq("subject", identity.subject)).unique();
    if (!user || user._id !== startup.userId) {
      throw new Error("Not authorized to update this startup");
    }

    await ctx.db.patch(args.startupId, {
      pricingStrategy: args.pricingStrategy,
    });

    return { success: true };
  },
});

export const updateMarketingCopy = mutation({
  args: {
    startupId: v.id("startups"),
    marketingCopy: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const startup = await ctx.db.get(args.startupId);
    if (!startup) {
      throw new Error("Startup not found");
    }

    const user = await ctx.db.query("users").withIndex("by_subject", q => q.eq("subject", identity.subject)).unique();
    if (!user || user._id !== startup.userId) {
      throw new Error("Not authorized to update this startup");
    }

    await ctx.db.patch(args.startupId, {
      marketingCopy: args.marketingCopy,
    });

    return { success: true };
  },
});

export const updatePreLaunchWaitlist = mutation({
  args: {
    startupId: v.id("startups"),
    preLaunchWaitlist: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const startup = await ctx.db.get(args.startupId);
    if (!startup) {
      throw new Error("Startup not found");
    }

    const user = await ctx.db.query("users").withIndex("by_subject", q => q.eq("subject", identity.subject)).unique();
    if (!user || user._id !== startup.userId) {
      throw new Error("Not authorized to update this startup");
    }

    await ctx.db.patch(args.startupId, {
      preLaunchWaitlist: args.preLaunchWaitlist,
    });

    return { success: true };
  },
});

export const updateWebsitePrototypeCode = mutation({
  args: {
    startupId: v.id("startups"),
    website: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const startup = await ctx.db.get(args.startupId);
    if (!startup) {
      throw new Error("Startup not found");
    }

    const user = await ctx.db.query("users").withIndex("by_subject", q => q.eq("subject", identity.subject)).unique();
    if (!user || user._id !== startup.userId) {
      throw new Error("Not authorized to update this startup");
    }

    await ctx.db.patch(args.startupId, {
      website: args.website,
    });

    return { success: true };
  },
});

export const updateProductHuntKit = mutation({
  args: {
    startupId: v.id("startups"),
    productHuntKit: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const startup = await ctx.db.get(args.startupId);
    if (!startup) {
      throw new Error("Startup not found");
    }

    const user = await ctx.db.query("users").withIndex("by_subject", q => q.eq("subject", identity.subject)).unique();
    if (!user || user._id !== startup.userId) {
      throw new Error("Not authorized to update this startup");
    }

    await ctx.db.patch(args.startupId, {
      productHuntKit: args.productHuntKit,
    });

    return { success: true };
  },
});

export const updatePressRelease = mutation({
  args: {
    startupId: v.id("startups"),
    pressRelease: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const startup = await ctx.db.get(args.startupId);
    if (!startup) {
      throw new Error("Startup not found");
    }

    const user = await ctx.db.query("users").withIndex("by_subject", q => q.eq("subject", identity.subject)).unique();
    if (!user || user._id !== startup.userId) {
      throw new Error("Not authorized to update this startup");
    }

    await ctx.db.patch(args.startupId, {
      pressRelease: args.pressRelease,
    });

    return { success: true };
  },
});

export const updateGrowthMetrics = mutation({
  args: {
    startupId: v.id("startups"),
    growthMetrics: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const startup = await ctx.db.get(args.startupId);
    if (!startup) {
      throw new Error("Startup not found");
    }

    const user = await ctx.db.query("users").withIndex("by_subject", q => q.eq("subject", identity.subject)).unique();
    if (!user || user._id !== startup.userId) {
      throw new Error("Not authorized to update this startup");
    }

    await ctx.db.patch(args.startupId, {
      growthMetrics: args.growthMetrics,
    });

    return { success: true };
  },
});

export const updateABTestIdeas = mutation({
  args: {
    startupId: v.id("startups"),
    abTestIdeas: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const startup = await ctx.db.get(args.startupId);
    if (!startup) {
      throw new Error("Startup not found");
    }

    const user = await ctx.db.query("users").withIndex("by_subject", q => q.eq("subject", identity.subject)).unique();
    if (!user || user._id !== startup.userId) {
      throw new Error("Not authorized to update this startup");
    }

    await ctx.db.patch(args.startupId, {
      abTestIdeas: args.abTestIdeas,
    });

    return { success: true };
  },
});

export const updateSeoStrategy = mutation({
  args: {
    startupId: v.id("startups"),
    seoStrategy: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const startup = await ctx.db.get(args.startupId);
    if (!startup) {
      throw new Error("Startup not found");
    }

    const user = await ctx.db.query("users").withIndex("by_subject", q => q.eq("subject", identity.subject)).unique();
    if (!user || user._id !== startup.userId) {
      throw new Error("Not authorized to update this startup");
    }

    await ctx.db.patch(args.startupId, {
      seoStrategy: args.seoStrategy,
    });

    return { success: true };
  },
});

export const updateDraftJobDescriptions = mutation({
  args: {
    startupId: v.id("startups"),
    draftJobDescriptions: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const startup = await ctx.db.get(args.startupId);
    if (!startup) {
      throw new Error("Startup not found");
    }

    const user = await ctx.db.query("users").withIndex("by_subject", q => q.eq("subject", identity.subject)).unique();
    if (!user || user._id !== startup.userId) {
      throw new Error("Not authorized to update this startup");
    }

    await ctx.db.patch(args.startupId, {
      draftJobDescriptions: args.draftJobDescriptions,
    });

    return { success: true };
  },
});

export const updateInvestorMatching = mutation({
  args: {
    startupId: v.id("startups"),
    investorMatching: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const startup = await ctx.db.get(args.startupId);
    if (!startup) {
      throw new Error("Startup not found");
    }
    const user = await ctx.db.query("users").withIndex("by_subject", q => q.eq("subject",
identity.subject)).unique();
    if (!user || user._id !== startup.userId) {
      throw new Error("Not authorized to update this startup");
    }
    await ctx.db.patch(args.startupId, {
      investorMatching: args.investorMatching,
    });
    return { success: true };
  },
});

export const updateDueDiligenceChecklist = mutation({
    args: {
        startupId: v.id("startups"),
        dueDiligenceChecklist: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }

        const startup = await ctx.db.get(args.startupId);
        if (!startup) {
            throw new Error("Startup not found");
        }

        const user = await ctx.db.query("users").withIndex("by_subject", q => q.eq("subject", identity.subject)).unique();
        if (!user || user._id !== startup.userId) {
            throw new Error("Not authorized to update this startup");
        }

        await ctx.db.patch(args.startupId, {
            dueDiligenceChecklist: args.dueDiligenceChecklist,
        });

        return { success: true };
    },
});

export const updateAIPitchCoach = mutation({
    args: {
        startupId: v.id("startups"),
        aiPitchCoach: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }

        const startup = await ctx.db.get(args.startupId);
        if (!startup) {
            throw new Error("Startup not found");
        }

        const user = await ctx.db.query("users").withIndex("by_subject", q => q.eq("subject", identity.subject)).unique();
        if (!user || user._id !== startup.userId) {
            throw new Error("Not authorized to update this startup");
        }

        await ctx.db.patch(args.startupId, {
            aiPitchCoach: args.aiPitchCoach,
        });

        return { success: true };
    },
});

export const updateProcessAutomation = mutation({
  args: {
    startupId: v.id("startups"),
    processAutomation: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const startup = await ctx.db.get(args.startupId);
    if (!startup) {
      throw new Error("Startup not found");
    }

    const user = await ctx.db.query("users").withIndex("by_subject", q => q.eq("subject", identity.subject)).unique();
    if (!user || user._id !== startup.userId) {
      throw new Error("Not authorized to update this startup");
    }

    await ctx.db.patch(args.startupId, {
      processAutomation: args.processAutomation,
    });

    return { success: true };
  },
});

export const updateBusinessPlanEvaluationUrl = mutation({
  args: {
    startupId: v.id("startups"),
    url: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const startup = await ctx.db.get(args.startupId);
    if (!startup) {
      throw new Error("Startup not found");
    }

    const user = await ctx.db.query("users").withIndex("by_subject", q => q.eq("subject", identity.subject)).unique();
    if (!user || user._id !== startup.userId) {
      throw new Error("Not authorized to update this startup");
    }

    await ctx.db.patch(args.startupId, {
      businessPlanEvaluationUrl: args.url,
    });

    return { success: true };
  },
});

export const updateBrainstormEvaluationUrl = mutation({
  args: {
    startupId: v.id("startups"),
    url: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const startup = await ctx.db.get(args.startupId);
    if (!startup) {
      throw new Error("Startup not found");
    }

    const user = await ctx.db.query("users").withIndex("by_subject", q => q.eq("subject", identity.subject)).unique();
    if (!user || user._id !== startup.userId) {
      throw new Error("Not authorized to update this startup");
    }

    await ctx.db.patch(args.startupId, {
      brainstormEvaluationUrl: args.url,
    });

    return { success: true };
  },
});

export const updateMarketPulseEvaluationUrl = mutation({
  args: {
    startupId: v.id("startups"),
    url: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const startup = await ctx.db.get(args.startupId);
    if (!startup) {
      throw new Error("Startup not found");
    }

    const user = await ctx.db.query("users").withIndex("by_subject", q => q.eq("subject", identity.subject)).unique();
    if (!user || user._id !== startup.userId) {
      throw new Error("Not authorized to update this startup");
    }

    await ctx.db.patch(args.startupId, {
      marketPulseEvaluationUrl: args.url,
    });

    return { success: true };
  },
});

export const updateMissionVisionEvaluationUrl = mutation({
  args: {
    startupId: v.id("startups"),
    url: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const startup = await ctx.db.get(args.startupId);
    if (!startup) {
      throw new Error("Startup not found");
    }

    const user = await ctx.db.query("users").withIndex("by_subject", q => q.eq("subject", identity.subject)).unique();
    if (!user || user._id !== startup.userId) {
      throw new Error("Not authorized to update this startup");
    }

    await ctx.db.patch(args.startupId, {
      missionVisionEvaluationUrl: args.url,
    });

    return { success: true };
  },
});