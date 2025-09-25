
import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";
import FirecrawlApp from "@mendable/firecrawl-js";

// Helper function for waiting
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Action to perform a general search using Firecrawl with retry logic
export const search = action({
  args: { keyword: v.string() },
  handler: async (ctx, { keyword }) => {
    const apiKey = process.env.FIRECRAWL_API_KEY;
    if (!apiKey) {
      throw new Error("FIRECRAWL_API_KEY environment variable not set.");
    }

    const app = new FirecrawlApp({ apiKey });
    const maxRetries = 3;
    const retryDelay = 60000; // 60 seconds

    for (let i = 0; i < maxRetries; i++) {
      try {
        const searchResult = await app.search(keyword, {
          pageOptions: {
            fetchPageContent: true,
          }
        });
        console.log(`Firecrawl API Result for keyword '${keyword}':`, searchResult);
        return searchResult; // Success
      } catch (error: any) {
        // Check if it's a rate limit error
        if (error.message && error.message.includes("Rate limit exceeded")) {
          if (i < maxRetries - 1) {
            console.warn(`Rate limit hit for keyword '${keyword}'. Retrying in ${retryDelay / 1000}s... (Attempt ${i + 1}/${maxRetries})`);
            await wait(retryDelay);
          } else {
            // Last attempt failed, throw a specific error
            throw new Error(`Failed to fetch data for '${keyword}' after ${maxRetries} attempts due to rate limiting.`);
          }
        } else {
          // Not a rate limit error, re-throw it immediately
          throw error;
        }
      }
    }
    // This part should be unreachable, but typescript needs a return path
    throw new Error("Search action failed unexpectedly.");
  },
});

// Action to get market landscape information
export const getMarketLandscape = action({
    args: { keyword: v.string() },
    handler: async (ctx, { keyword }) => {
        const fullQuery = `market landscape for ${keyword}`;
        return await ctx.runAction(api.firecrawl.search, { keyword: fullQuery });
    }
});

// Action to find potential competitors
export const getCompetitors = action({
    args: { keyword: v.string() },
    handler: async (ctx, { keyword }) => {
        const fullQuery = `competitors for ${keyword}`;
        return await ctx.runAction(api.firecrawl.search, { keyword: fullQuery });
    }
});

// Action to get key industry trends
export const getKeyTrends = action({
    args: { keyword: v.string() },
    handler: async (ctx, { keyword }) => {
        const fullQuery = `key trends for ${keyword}`;
        return await ctx.runAction(api.firecrawl.search, { keyword: fullQuery });
    }
});
