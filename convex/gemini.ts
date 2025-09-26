import { internal } from "./_generated/api";
import { internalAction } from "./_generated/server";
import { GoogleGenAI } from "@google/genai";

export const summarizeMarketContent = internalAction(
  async (
    { runAction }, 
    { scrapedContent }: { scrapedContent: { url: string, markdown: string, title: string }[] }
  ) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set in your Convex project's environment variables. Please add it in the Convex dashboard under Settings.");
    }
    const ai = new GoogleGenAI({ apiKey });

    const contentString = scrapedContent
      .map(page => `--- Source: ${page.title} (${page.url}) ---\n\n${page.markdown}`)
      .join("\n\n");

    const prompt = `
        You are a world-class market analyst.
        You have been provided with the scraped content from several web pages relevant to a new startup idea.
        Your task is to synthesize all of this information into a concise, insightful market analysis summary.

        Here is the scraped content:
        ---
        ${contentString}
        ---

        Based on the content, please provide a market analysis summary. Structure your response in markdown format. The summary should cover:
        1.  **Market Overview:** Briefly describe the overall market, its size, and key characteristics.
        2.  **Key Players & Competitors:** Identify the main companies or products in this space and what they do.
        3.  **Emerging Trends:** Highlight any significant trends, technologies, or shifts in consumer behavior.
        4.  **Opportunities & Gaps:** Point out potential opportunities or underserved needs that a new startup could address.

        Your tone should be objective, professional, and data-driven, based only on the text provided.
    `;

    try {
        console.log("--- Requesting Market Summary from Gemini ---");
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        const summaryText = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

        if (!summaryText) {
            throw new Error("No summary text received from Gemini API");
        }
        
        console.log("Market summary received successfully.");
        return summaryText;

    } catch (error: any) {
        console.error("Failed to get market summary:", error.message);
        throw new Error(`Failed to get market summary from Gemini API. Error: ${error.message}`);
    }
  }
);
