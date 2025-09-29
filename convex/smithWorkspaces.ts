import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const initialFiles = {
    'index.html': { content: '<!-- HTML will be generated here -->', type: 'html' },
    'style.css': { content: '/* CSS will be generated here */', type: 'css' },
    'script.js': { content: '// JavaScript will be generated here', type: 'javascript' },
};

export const createWorkspace = mutation({
  args: { prompt: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("User is not authenticated.");
    }

    const user = await ctx.db
        .query("users")
        .withIndex("by_subject", (q) => q.eq("subject", identity.subject))
        .unique();

    if (!user) {
        throw new Error("User not found.");
    }

    const workspaceId = await ctx.db.insert("smithWorkspaces", {
      userId: user._id,
      prompt: args.prompt,
      files: initialFiles,
      messages: [],
    });

    return workspaceId;
  },
});

export const getWorkspace = query({
    args: { id: v.id("smithWorkspaces") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("User is not authenticated.");
        }

        const workspace = await ctx.db.get(args.id);

        if (!workspace) {
            throw new Error("Workspace not found.");
        }

        const user = await ctx.db.query("users").withIndex("by_subject", (q) => q.eq("subject", identity.subject)).unique();

        if (workspace.userId !== user?._id) {
            throw new Error("User is not authorized to view this workspace.");
        }

        return workspace;
    },
});

export const updateWorkspaceFiles = mutation({
    args: { id: v.id("smithWorkspaces"), files: v.any() },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("User is not authenticated.");
        }

        const workspace = await ctx.db.get(args.id);

        if (!workspace) {
            throw new Error("Workspace not found.");
        }
        
        const user = await ctx.db.query("users").withIndex("by_subject", (q) => q.eq("subject", identity.subject)).unique();

        if (workspace.userId !== user?._id) {
            throw new Error("User is not authorized to update this workspace.");
        }

        await ctx.db.patch(args.id, { files: args.files });
    },
});

export const updateWorkspaceMessages = mutation({
    args: { id: v.id("smithWorkspaces"), messages: v.any() },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("User is not authenticated.");
        }

        const workspace = await ctx.db.get(args.id);

        if (!workspace) {
            throw new Error("Workspace not found.");
        }

        const user = await ctx.db.query("users").withIndex("by_subject", (q) => q.eq("subject", identity.subject)).unique();

        if (workspace.userId !== user?._id) {
            throw new Error("User is not authorized to update this workspace.");
        }

        await ctx.db.patch(args.id, { messages: args.messages });
    },
});
