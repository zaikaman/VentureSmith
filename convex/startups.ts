
import { mutation, query } from "./_generated/server";
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
    dashboard: v.optional(v.string()),
    businessPlan: v.optional(v.string()),
    website: v.optional(v.string()),
    pitchDeck: v.optional(v.string()),
    marketResearch: v.optional(v.string()),
    aiMentor: v.optional(v.string()),
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
    newCode: v.string(),
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

    // Create the new website object
    const newWebsiteData = { code: args.newCode };

    // Update the startup document
    await ctx.db.patch(args.startupId, {
      website: JSON.stringify(newWebsiteData, null, 2),
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
