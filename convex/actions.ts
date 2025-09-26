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
