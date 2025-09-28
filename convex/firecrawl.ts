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
        const searchResult = await app.search(keyword, {
          pageOptions: {
            fetchPageContent: true, // This is crucial
          }
        });
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
        
        // 1. Search for URLs first, without scraping
        const searchResults = await app.search(fullQuery, { pageOptions: { fetchPageContent: false } });
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

        // 3. Call Gemini to summarize the content
        const summary = await ctx.runAction(internal.gemini.summarizeMarketContent, { scrapedContent });

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