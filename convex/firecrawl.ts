import { v } from "convex/values";
import { action } from "./_generated/server";
import { api, internal } from "./_generated/api";
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
        const searchResult = await app.search(keyword, {});
        console.log(`Firecrawl API Result for keyword '${keyword}':`, searchResult);
        return searchResult?.web || []; // Success
      } catch (error: any) {
        if (error.message && (error.message.includes("Rate limit exceeded") || error.message.includes("AbortError"))) {
          if (i < maxRetries - 1) {
            console.warn(`Rate limit hit for keyword '${keyword}'. Retrying in ${retryDelay / 1000}s... (Attempt ${i + 1}/${maxRetries})`);
            await wait(retryDelay);
          } else {
            throw new Error(`Failed to fetch data for '${keyword}' after ${maxRetries} attempts due to rate limiting.`);
          }
        } else {
          throw error;
        }
      }
    }
    throw new Error("Search action failed unexpectedly.");
  },
});


export const performMarketAnalysis = action({
    args: { keyword: v.string() },
    handler: async (ctx, { keyword }) => {
        const apiKey = process.env.FIRECRAWL_API_KEY;
        if (!apiKey) {
          throw new Error("FIRECRAWL_API_KEY environment variable not set.");
        }
        const app = new FirecrawlApp({ apiKey });

        const fullQuery = `in-depth market analysis for a startup idea: ${keyword}`;
        
        const maxRetries = 3;
        const retryDelay = 30000; // 30 seconds
        let searchResults;

        for (let i = 0; i < maxRetries; i++) {
          try {
            searchResults = await app.search(fullQuery);
            break; // Success, exit loop
          } catch (error: any) {
            console.warn(`Firecrawl search attempt ${i + 1}/${maxRetries} failed. Error: ${error.message}. Retrying in ${retryDelay / 1000}s...`);
            if (i < maxRetries - 1) {
              await wait(retryDelay); // Wait before retrying
            } else {
              // All retries failed
              console.error(`All Firecrawl search retries failed for query: "${fullQuery}".`);
              return {
                summary: `We encountered a persistent error after ${maxRetries} attempts while searching for information. The error was: ${error.message}. Please try again later.`,
                sources: [],
              };
            }
          }
        }
        
        const topUrls = (searchResults?.web || []).slice(0, 5).map((res: any) => res.url);

        if (topUrls.length === 0) {
            console.warn("No URLs found from Firecrawl search.");
            return {
                summary: "We couldn't find any relevant web pages to analyze for this idea. Please try a different or more specific keyword.",
                sources: [],
            };
        }

        // 2. Scrape each URL individually
        const scrapePromises = topUrls.map((url: string) => app.scrape(url));
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

        // 3. Summarize content in chunks to avoid token limits
        const chunkSize = 1;
        const chunks = [];
        for (let i = 0; i < scrapedContent.length; i += chunkSize) {
            chunks.push(scrapedContent.slice(i, i + chunkSize));
        }

        const chunkSummaries = await Promise.all(
            chunks.map(chunk => ctx.runAction(internal.openai.summarizeMarketContent, { scrapedContent: chunk }))
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

        // 4. Format sources
        const sources = scrapedContent.map((result: any) => ({
            title: result.metadata.title,
            url: result.metadata.sourceURL,
        }));

        return { summary, sources };
    }
});

export const scrape = action({
  args: { url: v.string() },
  handler: async (_, { url }) => {
    const apiKey = process.env.FIRECRAWL_API_KEY;
    if (!apiKey) {
      throw new Error("FIRECRAWL_API_KEY environment variable not set.");
    }
    const app = new FirecrawlApp({ apiKey });
    
    console.log(`Scraping URL with Firecrawl: ${url}`);

    // Using a try-catch to handle potential scraping failures for a single URL
    try {
      const scrapedData = await app.scrape(url);
      return scrapedData;
    } catch (error: any) {
      console.error(`Failed to scrape ${url}. Error: ${error.message}`);
      return null; // Return null to indicate failure for this URL
    }
  },
});