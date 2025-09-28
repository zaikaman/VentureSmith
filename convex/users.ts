
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

        // If the user doesn't exist, create them
        if (user === null) {
            const newUser = await ctx.db.insert("users", {
                name: args.name,
                email: identity.email!,
                subject: identity.subject,
            });
            return newUser;
        }

        // If the user exists, update their name and email if different
        const updates: { name?: string; email?: string } = {};
        if (user.name !== args.name) {
            updates.name = args.name;
        }
        if (user.email !== identity.email) {
            updates.email = identity.email!;
        }

        if (Object.keys(updates).length > 0) {
            await ctx.db.patch(user._id, updates);
        }

        return user._id;
    }
});

