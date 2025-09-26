
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

    await ctx.db.insert("startups", {
      userId: user._id,
      createdAt: Date.now(),
      ...args,
    });
  },
});
