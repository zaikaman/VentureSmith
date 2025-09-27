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

export const validateProblemWithAI = internalAction(
  async (
    _,
    { startupName, startupDescription }: { startupName: string, startupDescription: string }
  ) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set in your Convex project's environment variables.");
    }
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
      You are an AI simulating potential customers for a new startup idea.
      The startup is called "${startupName}".
      Here is a brief description of the startup: "${startupDescription}".

      Please generate 4 distinct potential customer personas who might be interested in this startup.
      For each persona, provide:
      1.  **Name:** A realistic name.
      2.  **Demographics:** Age, occupation, and other relevant details.
      3.  **Problem/Need:** What problem or need does this person have that the startup could solve?
      4.  **Feedback:** Their initial thoughts and feedback on the startup idea. What do they like? What are their concerns? What questions do they have?

      Present the output as a JSON array of objects. Each object should represent a customer persona and have the fields: "name", "demographics", "problem", and "feedback".
    `;

    try {
      console.log("--- Requesting Customer Validation from Gemini ---");
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
            responseMimeType: "application/json",
        },
      });
      const resultText = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (!resultText) {
        throw new Error("No customer validation data received from Gemini API");
      }

      console.log("Customer validation data received successfully.");
      return JSON.parse(resultText);

    } catch (error: any) {
      console.error("Failed to get customer validation:", error.message);
      throw new Error(`Failed to get customer validation from Gemini API. Error: ${error.message}`);
    }
  }
);

export const brainstormIdeaWithAI = internalAction(
  async (
    _,
    { idea }: { idea: string }
  ) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set in your Convex project's environment variables.");
    }
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
      You are an expert startup consultant and creative thinker.
      You have been given a raw startup idea. Your task is to brainstorm and refine it.

      Initial Idea: "${idea}"

      Please provide the following:
      1.  **Refined Idea:** A more polished, single-sentence version of the idea.
      2.  **Key Features (Top 3):** List the three most important features or aspects of this product/service.
      3.  **Potential Angles (Top 2):** Suggest two unique angles or target niches for this idea that the founder might not have considered.
      4.  **Initial Concerns (Top 2):** Raise two immediate questions or concerns that need to be addressed.
      5.  **Competitive Advantage (Top 2):** List two key competitive advantages or unique selling propositions.

      Present the output as a JSON object with the fields: "refinedIdea", "keyFeatures", "potentialAngles", "initialConcerns", and "competitiveAdvantage".
      "keyFeatures", "potentialAngles", "initialConcerns", and "competitiveAdvantage" should be arrays of strings.
    `;

    try {
      console.log("--- Requesting Idea Brainstorm from Gemini ---");
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
        },
      });
      const resultText = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (!resultText) {
        throw new Error("No brainstorm data received from Gemini API");
      }

      console.log("Brainstorm data received successfully.");
      return JSON.parse(resultText);

    } catch (error: any) {
      console.error("Failed to get brainstorm data:", error.message);
      throw new Error(`Failed to get brainstorm data from Gemini API. Error: ${error.message}`);
    }
  }
);

export const generateScorecardWithAI = internalAction(
  async (
    _,
    { idea }: { idea: string }
  ) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set in your Convex project's environment variables.");
    }
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
      You are a startup analyst. Based on the following startup idea, generate a scorecard rating the idea on market size, feasibility, and innovation.

      Idea: "${idea}"

      Return the output as a JSON object with the following structure:
      {
        "marketSize": { "score": number, "justification": string },
        "feasibility": { "score": number, "justification": string },
        "innovation": { "score": number, "justification": string },
        "overallScore": number
      }
      The overallScore should be a weighted average of the other three scores.
    `;

    try {
      console.log("--- Requesting Scorecard from Gemini ---");
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
        },
      });
      const resultText = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (!resultText) {
        throw new Error("No scorecard data received from Gemini API");
      }

      console.log("Scorecard data received successfully.");
      return JSON.parse(resultText);

    } catch (error: any) {
      console.error("Failed to get scorecard data:", error.message);
      throw new Error(`Failed to get scorecard data from Gemini API. Error: ${error.message}`);
    }
  }
);

export const generateBusinessPlanWithAI = internalAction(
  async (
    _,
    { idea }: { idea: string }
  ) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set in your Convex project's environment variables.");
    }
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
      You are a business strategist. Based on the following startup idea, generate a comprehensive 7-part business plan.

      Idea: "${idea}"

      Generate the following sections:
      1.  Executive Summary
      2.  Company Description
      3.  Market Analysis (Industry Overview, Target Market, Competitive Analysis)
      4.  Organization and Management
      5.  Products or Services
      6.  Marketing and Sales Strategy
      7.  Financial Projections (Summary and a 3-year forecast table)

      Return the output as a JSON object.
    `;

    try {
      console.log("--- Requesting Business Plan from Gemini ---");
      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
        },
      });
      const resultText = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (!resultText) {
        throw new Error("No business plan data received from Gemini API");
      }

      console.log("Business plan data received successfully.");
      return JSON.parse(resultText);

    } catch (error: any) {
      console.error("Failed to get business plan data:", error.message);
      throw new Error(`Failed to get business plan data from Gemini API. Error: ${error.message}`);
    }
  }
);

export const generatePitchDeckWithAI = internalAction(
  async (
    _,
    { idea }: { idea: string }
  ) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set in your Convex project's environment variables.");
    }
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
      You are a startup pitch expert. Based on the following startup idea, generate a full Pitch Deck.

      Idea: "${idea}"

      Generate the following:
      1.  A natural, conversational 1-minute voice pitch script.
      2.  A slide deck of 8-10 slides. For each slide, provide a title and content. The content should be concise, using markdown bullet points (hyphens). The slides should cover: Problem, Solution, Market Opportunity, Business Model, Product Demo (use a placeholder description), Market Validation, Competition, Financial Projection (use high-level estimates), Team (use placeholder founders), and a Call to Action.

      Return the output as a JSON object with the fields "script" and "slides".
    `;

    try {
      console.log("--- Requesting Pitch Deck from Gemini ---");
      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
        },
      });
      const resultText = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (!resultText) {
        throw new Error("No pitch deck data received from Gemini API");
      }

      console.log("Pitch deck data received successfully.");
      return JSON.parse(resultText);

    } catch (error: any) {
      console.error("Failed to get pitch deck data:", error.message);
      throw new Error(`Failed to get pitch deck data from Gemini API. Error: ${error.message}`);
    }
  }
);

export const getMarketPulseWithAI = internalAction(
  async (
    _,
    { idea }: { idea: string }
  ) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set in your Convex project's environment variables.");
    }
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
      You are a sharp and fast market analyst providing a quick "pulse check" on a startup idea.
      Based on the idea, provide a high-level analysis.

      Initial Idea: "${idea}"

      Please provide the following as a JSON object:
      1.  **marketDemand**: A score from 0 to 100 representing the potential market demand for this idea.
      2.  **competitionLevel**: A score from 0 to 100 representing how crowded the market is.
      3.  **growthPotential**: A score from 0 to 100 representing the potential for future growth.
      4.  **relatedKeywords**: An array of 5-6 related search keywords or topics that are relevant to this idea.
      5.  **summary**: A single, concise sentence summarizing the market pulse.

      Ensure the output is a valid JSON object with the fields: "marketDemand", "competitionLevel", "growthPotential", "relatedKeywords", and "summary".
    `;

    try {
      console.log("--- Requesting Market Pulse from Gemini ---");
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
        },
      });
      const resultText = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (!resultText) {
        throw new Error("No market pulse data received from Gemini API");
      }

      console.log("Market pulse data received successfully.");
      return JSON.parse(resultText);

    } catch (error: any) {
      console.error("Failed to get market pulse data:", error.message);
      throw new Error(`Failed to get market pulse data from Gemini API. Error: ${error.message}`);
    }
  }
);
