import { v } from "convex/values";
import { action, internalQuery, internalMutation, ActionCtx } from "./_generated/server";
import { api, internal } from "./_generated/api";
import FirecrawlApp from "@mendable/firecrawl-js";

// --- API Key Rotation Logic ---

// IMPORTANT: Add your Firecrawl API keys to your Convex environment variables.
// The names should be FIRECRAWL_API_KEY, FIRECRAWL_API_KEY_2, FIRECRAWL_API_KEY_3, etc.
const firecrawlApiKeys = [
  process.env.FIRECRAWL_API_KEY,
  process.env.FIRECRAWL_API_KEY_2,
  process.env.FIRECRAWL_API_KEY_3,
  process.env.FIRECRAWL_API_KEY_4,
  process.env.FIRECRAWL_API_KEY_5,
  process.env.FIRECRAWL_API_KEY_6,
].filter((key): key is string => key !== undefined && key !== "");

// Query to get the current key index from the database.
export const getKeyState = internalQuery({
  handler: async (ctx) => {
    return await ctx.db
      .query("apiKeyState")
      .withIndex("by_service", (q) => q.eq("service", "firecrawl"))
      .first();
  },
});

// Mutation to rotate to the next key index.
export const rotateKey = internalMutation({
  args: { lastKnownIndex: v.number() },
  handler: async (ctx, { lastKnownIndex }) => {
    const currentState = await ctx.db
      .query("apiKeyState")
      .withIndex("by_service", (q) => q.eq("service", "firecrawl"))
      .first();

    // To prevent race conditions, only update if the index is what we expect.
    if (currentState && currentState.keyIndex !== lastKnownIndex) {
      return; // Key was already rotated by another process.
    }

    const newIndex = (lastKnownIndex + 1) % firecrawlApiKeys.length;

    if (currentState) {
      await ctx.db.patch(currentState._id, { keyIndex: newIndex });
      console.log(`Rotated Firecrawl API key from index ${lastKnownIndex} to ${newIndex}.`);
    } else {
      await ctx.db.insert("apiKeyState", {
        service: "firecrawl",
        keyIndex: newIndex,
      });
      console.log(`Initialized and set Firecrawl API key to index ${newIndex}.`);
    }
  },
});

/**
 * A wrapper to execute Firecrawl operations with auto-retry and API key rotation.
 * @param ctx The action context.
 * @param operation A function that takes a Firecrawl client and performs an operation.
 * @returns The result of the Firecrawl operation.
 */
async function withApiKeyRotation<T>(
  ctx: ActionCtx,
  operation: (client: FirecrawlApp) => Promise<T>
): Promise<T> {
  if (firecrawlApiKeys.length === 0) {
    throw new Error("No Firecrawl API keys configured. Please set FIRECRAWL_API_KEY, FIRECRAWL_API_KEY_2, etc. in your Convex environment variables.");
  }

  const state = await ctx.runQuery(internal.firecrawl.getKeyState);
  const initialKeyIndex = state?.keyIndex ?? 0;

  // Loop to retry with the next key upon rate limit failure.
  for (let i = 0; i < firecrawlApiKeys.length; i++) {
    const keyIndex = (initialKeyIndex + i) % firecrawlApiKeys.length;
    
    const apiKey = firecrawlApiKeys[keyIndex];

    try {
      const app = new FirecrawlApp({ apiKey });
      // If the operation succeeds, return the result.
      return await operation(app);
    } catch (error: any) {
      // Check for rate limit error (e.g., HTTP 429)
      if (error.status === 429 || (error.message && error.message.includes("Rate limit exceeded"))) {
        console.warn(`Firecrawl rate limit hit on API key index ${keyIndex}. Rotating and retrying with the next key.`);
        
        // Rotate the key in the database for the next independent request.
        await ctx.runMutation(internal.firecrawl.rotateKey, { lastKnownIndex: keyIndex });

        // If this was the last key in the loop, we will exit and throw an error below.
        // Otherwise, the loop will continue to the next iteration to auto-retry.
      } else {
        // For any other error, fail immediately.
        throw error;
      }
    }
  }

  // If the loop completes, it means all keys failed.
  throw new Error(`All ${firecrawlApiKeys.length} Firecrawl API keys are rate-limited. Please wait or check your keys.`);
}


// --- Original Actions Refactored ---

// Action to perform a general search using Firecrawl
export const search = action({
  args: { keyword: v.string() },
  handler: async (ctx, { keyword }) => {
    return withApiKeyRotation(ctx, async (app) => {
      const searchResult = await app.search(keyword, {});
      console.log(`Firecrawl API Result for keyword '${keyword}':`, searchResult);
      return searchResult?.web || [];
    });
  },
});


export const performMarketAnalysis = action({
    args: { keyword: v.string() },
    handler: async (ctx, { keyword }) => {
        const fullQuery = `in-depth market analysis for a startup idea: ${keyword}`;
        
        const searchResults = await withApiKeyRotation(ctx, (app) => app.search(fullQuery));
        
        const topUrls = (searchResults?.web || []).slice(0, 5).map((res: any) => res.url);

        if (topUrls.length === 0) {
            console.warn("No URLs found from Firecrawl search.");
            return {
                summary: "We couldn't find any relevant web pages to analyze for this idea. Please try a different or more specific keyword.",
                sources: [],
            };
        }

        // Scrape each URL individually with API key rotation for each scrape
        const scrapePromises = topUrls.map((url: string) => 
            withApiKeyRotation(ctx, (app) => app.scrape(url))
        );
        const scrapeResults = await Promise.allSettled(scrapePromises);

        const scrapedContent = scrapeResults
            .filter(result => result.status === 'fulfilled' && result.value.markdown && result.value.markdown.length > 100)
            .map((result: any) => result.value);

        if (scrapedContent.length === 0) {
            console.warn("Scraping completed, but no content-rich pages found.");
            return {
                summary: "We found some web pages, but could not extract enough content to perform an analysis. This can happen with complex or protected websites.",
                sources: topUrls.map((url: string) => ({ title: url, url }))
            };
        }

        // Create smaller content chunks from scraped pages to avoid token limits
        const MAX_CONTENT_LENGTH = 250000; // Safe character limit per chunk
        const contentChunks: { url: string, markdown: string, title: string }[][] = [];
        
        for (const page of scrapedContent) {
          if (page.markdown.length > MAX_CONTENT_LENGTH) {
            // Split the large page into smaller chunks
            for (let i = 0; i < page.markdown.length; i += MAX_CONTENT_LENGTH) {
              const contentPart = page.markdown.substring(i, i + MAX_CONTENT_LENGTH);
              contentChunks.push([{
                url: page.url,
                markdown: contentPart,
                title: `${page.title} (Part ${Math.floor(i / MAX_CONTENT_LENGTH) + 1})`
              }]);
            }
          } else {
            // Page is small enough, add it as a single chunk
            contentChunks.push([page]);
          }
        }

        if (contentChunks.length === 0) {
            console.warn("No content to summarize after chunking.");
            return {
                summary: "Could not generate a summary as no processable content was found.",
                sources: [],
            };
        }

        const chunkSummaries = await Promise.all(
            contentChunks.map(chunk => ctx.runAction(internal.openai.summarizeMarketContent, { scrapedContent: chunk }))
        );

        const combinedSummary = chunkSummaries.join('\n\n---\n\n');

        const finalSummaryPrompt = `You are a world-class market analyst. You have been provided with several market analysis summaries from different sources. Your task is to synthesize all of this information into a single, final, concise, and insightful market analysis summary.

Here are the summaries:
---
${combinedSummary}
---

Based on all the provided summaries, please provide a final market analysis summary. Structure your response in markdown format. The summary should cover:
1.  **Market Overview:** Briefly describe the overall market, its size, and key characteristics.
2.  **Key Players & Competitors:** Identify the main companies or products in this space and what they do.
3.  **Emerging Trends:** Highlight any significant trends, technologies, or shifts in consumer behavior.
4.  **Opportunities & Gaps:** Point out potential opportunities or underserved needs that a new startup could address.

Your tone should be objective, professional, and data-driven.`;
        
        const summary = await ctx.runAction(internal.openai.generateContent, { prompt: finalSummaryPrompt, responseMimeType: "text/plain" });

        // Format sources
        const sources = scrapedContent.map((result: any) => ({
            title: result.metadata.title,
            url: result.metadata.sourceURL,
        }));

        return { summary, sources };
    }
});

export const scrape = action({
  args: { url: v.string() },
  handler: async (ctx, { url }) => {
    console.log(`Scraping URL with Firecrawl: ${url}`);
    // Using a try-catch here is optional as withApiKeyRotation handles it,
    // but it can be useful for specific logging per scrape call.
    try {
      return await withApiKeyRotation(ctx, (app) => app.scrape(url));
    } catch (error: any) {
      console.error(`Failed to scrape ${url} after trying all API keys. Error: ${error.message}`);
      return null; // Return null to indicate failure for this URL
    }
  },
});
