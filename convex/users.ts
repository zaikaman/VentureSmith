
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Query to get the current user's profile
export const getCurrentUser = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }
    const user = await ctx.db
      .query("users")
      .withIndex("by_subject", (q) => q.eq("subject", identity.subject))
      .unique();

    return user;
  },
});

// Mutation to create or update a user's profile
export const createOrUpdateUser = mutation({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return null;
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_subject", (q) => q.eq("subject", identity.subject))
            .unique();

        // If the user doesn't exist, create them
        if (user === null) {
            const newUser = await ctx.db.insert("users", {
                email: identity.email!,
                subject: identity.subject,
            });
            return newUser;
        }

        // If the user exists but has no email, update it
        if (user.email !== identity.email) {
            await ctx.db.patch(user._id, {
                email: identity.email!,
            });
        }

        return user._id;
    }
});

// Mutation to update the user's name
export const updateProfile = mutation({
    args: { name: v.string() },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return null;
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_subject", (q) => q.eq("subject", identity.subject))
            .unique();

        if (user === null) {
            return null;
        }

        await ctx.db.patch(user._id, { name: args.name });
    }
});

