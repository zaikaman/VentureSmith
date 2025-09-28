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
      .map(page => `--- Source: ${page.title} (${page.url}) ---

${page.markdown}`)
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
    { fullContext }: { fullContext: any }
  ) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set.");
    }
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
      You are a meticulous, data-driven venture capital analyst from a top-tier firm like Sequoia or a16z.
      You have been provided with a comprehensive data package for a startup.
      Your task is to generate a critical scorecard rating the venture's potential.

      **Startup Data Package:**
      - **Official Name:** ${fullContext.name}
      - **Refined Idea:** ${fullContext.refinedIdea}
      - **Market Pulse:** ${JSON.stringify(fullContext.marketPulse, null, 2)}
      - **Mission/Vision:** ${JSON.stringify(fullContext.missionVision, null, 2)}
      - **Branding Options:** ${JSON.stringify(fullContext.brandIdentity, null, 2)}

      Based on the **entire** data package, generate a scorecard rating the idea on three core metrics:
      1.  **Market Size & Demand:** Based on the idea, keywords, and market pulse, how large and receptive is the target market?
      2.  **Feasibility & Execution:** Based on the idea's complexity and the stated mission, how feasible is it to build and succeed with this venture?
      3.  **Innovation & Defensibility:** Based on the competitive landscape and the idea's unique selling propositions, how innovative and defensible is it?

      For each metric, provide a score from 0-100 and a concise but sharp justification for your rating.
      Finally, calculate a weighted **Overall Score** (40% Market, 30% Feasibility, 30% Innovation).

      Return the output as a valid JSON object with the structure:
      {
        "marketSize": { "score": number, "justification": string },
        "feasibility": { "score": number, "justification": string },
        "innovation": { "score": number, "justification": string },
        "overallScore": number
      }
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
    { fullContext }: { fullContext: any }
  ) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set.");
    }
    const ai = new GoogleGenAI({ apiKey });

    const businessPlanSchema = {
      type: "OBJECT",
      properties: {
        executiveSummary: { type: "STRING", description: "A compelling, high-level overview of the entire business plan." },
        companyDescription: {
          type: "OBJECT",
          description: "Details about the company.",
          properties: {
            description: { type: "STRING" },
            mission: { type: "STRING" },
            vision: { type: "STRING" },
            coreValues: { type: "ARRAY", items: { type: "STRING" } },
          },
          required: ["description", "mission", "vision", "coreValues"],
        },
        productsAndServices: {
          type: "OBJECT",
          description: "Details about the products and services.",
          properties: {
            description: { type: "STRING" },
            keyFeatures: { type: "ARRAY", items: { type: "STRING" } },
            uniqueValueProposition: { type: "STRING" },
          },
          required: ["description", "keyFeatures", "uniqueValueProposition"],
        },
        marketAnalysis: {
          type: "OBJECT",
          description: "Analysis of the market.",
          properties: {
            industryOverview: { type: "STRING" },
            targetMarket: { type: "STRING" },
            competitiveLandscape: { type: "STRING" },
          },
          required: ["industryOverview", "targetMarket", "competitiveLandscape"],
        },
        marketingAndSalesStrategy: {
          type: "OBJECT",
          description: "Go-to-market strategy.",
          properties: {
            digitalMarketingStrategy: { type: "ARRAY", items: { type: "STRING" } },
            salesFunnel: { type: "ARRAY", items: { type: "STRING" } },
          },
          required: ["digitalMarketingStrategy", "salesFunnel"],
        },
        organizationAndManagement: {
          type: "OBJECT",
          description: "Team and structure.",
          properties: {
            teamStructure: { type: "STRING" },
            keyRoles: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  role: { type: "STRING" },
                  responsibilities: { type: "STRING" },
                },
                required: ["role", "responsibilities"],
              },
            },
          },
          required: ["teamStructure", "keyRoles"],
        },
        financialProjections: {
          type: "OBJECT",
          description: "Financial forecast.",
          properties: {
            summary: { type: "STRING" },
            forecast: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  year: { type: "NUMBER" },
                  revenue: { type: "STRING" },
                  cogs: { type: "STRING" },
                  netProfit: { type: "STRING" },
                },
                required: ["year", "revenue", "cogs", "netProfit"],
              },
            },
          },
          required: ["summary", "forecast"],
        },
      },
      required: ["executiveSummary", "companyDescription", "productsAndServices", "marketAnalysis", "marketingAndSalesStrategy", "organizationAndManagement", "financialProjections"],
    };

    const prompt = `
      You are a top-tier business strategist drafting a comprehensive business plan for a startup named "${fullContext.name}".
      Analyze the provided startup data and generate the 7-part business plan.
      
      **Startup Data Package:**
      - **Official Startup Name:** ${fullContext.name}
      - **Refined Idea:** ${fullContext.refinedIdea}
      - **Market Pulse:** ${JSON.stringify(fullContext.marketPulse, null, 2)}
      - **Mission/Vision:** ${JSON.stringify(fullContext.missionVision, null, 2)}
      - **Branding Options:** ${JSON.stringify(fullContext.brandIdentity, null, 2)}

      **CRITICAL INSTRUCTION:** The official name of the startup is "${fullContext.name}". You MUST use this name when referring to the company. Do NOT use any of the name suggestions from the "Branding Options" section.

      **Important Formatting Rule:** Do not use any markdown formatting. All text in the JSON string values must be plain text. Do not use asterisks (*).

      Your output MUST conform to the provided JSON schema.
    `;

    try {
      console.log("--- Requesting Business Plan from Gemini with Schema ---");
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: businessPlanSchema,
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
    { fullContext }: { fullContext: any }
  ) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set.");
    }
    const ai = new GoogleGenAI({ apiKey });

    const pitchDeckSchema = {
      type: "OBJECT",
      properties: {
        script: { 
          type: "STRING", 
          description: "A natural, conversational 1-minute voice pitch script an AI CEO would deliver."
        },
        slides: {
          type: "ARRAY",
          description: "An array of 8-10 slides for a standard startup pitch deck.",
          items: {
            type: "OBJECT",
            properties: {
              title: { type: "STRING", description: "The title of the slide." },
              content: { type: "STRING", description: "The key content for the slide, formatted as markdown with bullet points using hyphens. Newlines must be escaped as \n." }
            },
            required: ["title", "content"]
          }
        }
      },
      required: ["script", "slides"]
    };

    const prompt = `
      You are a startup pitch expert (like a Y Combinator partner) creating a pitch deck for a startup named "${fullContext.name}".
      You have the complete data package for the new venture.

      **Startup Data Package:**
      - **Official Startup Name:** ${fullContext.name}
      - **Refined Idea:** ${fullContext.refinedIdea}
      - **Market Pulse:** ${JSON.stringify(fullContext.marketPulse, null, 2)}
      - **Mission/Vision:** ${JSON.stringify(fullContext.missionVision, null, 2)}
      - **Branding Options:** ${JSON.stringify(fullContext.brandIdentity, null, 2)}

      **CRITICAL INSTRUCTION:** The official name of the startup is "${fullContext.name}". You MUST use this name when referring to the company. Do NOT use any of the name suggestions from the "Branding Options" section.

      Based on this **entire** data package, generate a full Pitch Deck including:
      1.  A 1-minute voice pitch script.
      2.  A slide deck of 8-10 slides covering: Problem, Solution, Market, Product, Business Model, Competition, Team, Financials, and Call to Action.

      **Important Formatting Rule:** Do not use any markdown formatting. All text in the JSON string values must be plain text. Do not use asterisks (*).

      Your output MUST conform to the provided JSON schema. Ensure all strings are properly escaped.
    `;

    try {
      console.log("--- Requesting Pitch Deck from Gemini with Schema ---");
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: pitchDeckSchema,
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

export const defineMissionVisionWithAI = internalAction(
  async (
    _,
    { name, refinedIdea, marketPulse }: { name: string, refinedIdea: string, marketPulse: any }
  ) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set in your Convex project's environment variables.");
    }
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
      You are a world-class brand strategist and storyteller, an expert at distilling complex ideas into powerful, resonant messages.
      You are tasked with creating the foundational "Genesis Block" for a new startup: its Mission and Vision.

      Here is the core data:
      - **Startup Name:** "${name}"
      - **Refined Idea:** "${refinedIdea}"
      - **Market Pulse Analysis:** ${JSON.stringify(marketPulse, null, 2)}

      Based on this data, please generate:
      1.  **Mission Statement:** A concise, powerful sentence explaining the company's core purpose and **why** it exists. It should be inspiring and focused on the problem it solves or the value it creates.
      2.  **Vision Statement:** A short, ambitious sentence describing the future the company aims to create. It should paint a picture of the long-term impact and **where** the company is going.

      Present the output as a single, valid JSON object with the fields: "mission" and "vision".
    `;

    try {
      console.log("--- Requesting Mission & Vision from Gemini ---");
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
        },
      });
      const resultText = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (!resultText) {
        throw new Error("No Mission/Vision data received from Gemini API");
      }

      console.log("Mission/Vision data received successfully.");
      return JSON.parse(resultText);

    } catch (error: any) {
      console.error("Failed to get Mission/Vision data:", error.message);
      throw new Error(`Failed to get Mission/Vision data from Gemini API. Error: ${error.message}`);
    }
  }
);

export const generateBrandIdentityWithAI = internalAction(
  async (
    _,
    { refinedIdea, keywords, mission, vision }: { refinedIdea: string, keywords: string[], mission: string, vision: string }
  ) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set.");
    }
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
      You are a world-class branding expert (think David Aaker, Marty Neumeier).
      You are tasked with forging a brand identity for a new startup.

      Here is the core DNA of the venture:
      - **Refined Idea:** "${refinedIdea}"
      - **Core Keywords:** ${keywords.join(", ")}
      - **Mission (The Why):** "${mission}"
      - **Vision (The Where):** "${vision}"

      Based on this complete context, generate:
      1.  **Names**: A list of 5 creative, memorable, and professional business names. The names should be diverse in style (e.g., evocative, descriptive, abstract, modern, classic).
      2.  **Slogan**: One powerful, concise slogan that captures the essence of the brand.

      Return the output as a single, valid JSON object with the fields: "names" (an array of strings) and "slogan" (a string).
    `;

    try {
      console.log("--- Requesting Brand Identity from Gemini ---");
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
        },
      });
      const resultText = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (!resultText) {
        throw new Error("No Brand Identity data received from Gemini API");
      }

      console.log("Brand Identity data received successfully.");
      return JSON.parse(resultText);

    } catch (error: any) {
      console.error("Failed to get Brand Identity data:", error.message);
      throw new Error(`Failed to get Brand Identity data from Gemini API. Error: ${error.message}`);
    }
  }
);

export const generateCompetitorMatrixWithAI = internalAction(
  async (
    _,
    { startupName, marketResearchSummary }: { startupName: string, marketResearchSummary: string }
  ) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set.");
    }
    const ai = new GoogleGenAI({ apiKey });

    const matrixSchema = {
      type: "OBJECT",
      properties: {
        matrix: {
          type: "ARRAY",
          description: "An array representing the competitor matrix. Each object is a competitor.",
          items: {
            type: "OBJECT",
            properties: {
              competitor: { type: "STRING", description: "Name of the competitor." },
              keyFeatures: { type: "STRING", description: "Their most important features." },
              targetAudience: { type: "STRING", description: "Their primary target audience." },
              strengths: { type: "STRING", description: "What they do well." },
              weaknesses: { type: "STRING", description: "Where they are lacking." },
            },
            required: ["competitor", "keyFeatures", "targetAudience", "strengths", "weaknesses"],
          }
        }
      },
      required: ["matrix"]
    };

    const prompt = `
      You are a strategic analyst. You have been provided with a market research summary for a startup called "${startupName}".
      Your task is to extract the information about competitors and structure it into a competitor landscape matrix.

      **Market Research Summary:**
      ${marketResearchSummary}

      Based on the summary, identify 3-4 key competitors and fill out the matrix with details for each.
      The output MUST be a JSON object that conforms to the provided schema.
    `;

    try {
      console.log("--- Requesting Competitor Matrix from Gemini with Schema ---");
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: matrixSchema,
        },
      });
      const resultText = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (!resultText) {
        throw new Error("No competitor matrix data received from Gemini API");
      }

      console.log("Competitor matrix data received successfully.");
      return JSON.parse(resultText);

    } catch (error: any) {
      console.error("Failed to get competitor matrix data:", error.message);
      throw new Error(`Failed to get competitor matrix data from Gemini API. Error: ${error.message}`);
    }
  }
);

export const generateCustomerPersonasWithAI = internalAction(
  async (
    _,
    { fullContext }: { fullContext: any }
  ) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set.");
    }
    const ai = new GoogleGenAI({ apiKey });

    const personasSchema = {
      type: "OBJECT",
      properties: {
        personas: {
          type: "ARRAY",
          description: "An array of 4 ideal customer personas.",
          items: {
            type: "OBJECT",
            properties: {
              name: { type: "STRING", description: "A memorable, alliterative name for the persona (e.g., 'Marketing Mary')." },
              avatar: { type: "STRING", description: "A single, relevant emoji for the persona." },
              demographics: { type: "STRING", description: "A short description of their age, role, and location." },
              gender: { type: "STRING", description: "The gender of the persona ('male' or 'female')." },
              goals: { type: "ARRAY", items: { type: "STRING" }, description: "A list of their primary goals." },
              painPoints: { type: "ARRAY", items: { type: "STRING" }, description: "A list of their key frustrations." },
              motivations: { type: "ARRAY", items: { type: "STRING" }, description: "A list of what drives them." },
            },
            required: ["name", "avatar", "demographics", "goals", "painPoints", "motivations"],
          }
        }
      },
      required: ["personas"]
    };

    const prompt = `
      You are a senior User Experience (UX) researcher and strategist.
      You are tasked with creating a set of ideal customer personas based on a comprehensive startup data package.

      **Startup Data Package:**
      - **Official Startup Name:** ${fullContext.name}
      - **Refined Idea:** ${fullContext.refinedIdea}
      - **Market Research:** ${JSON.stringify(fullContext.marketResearch, null, 2)}
      - **Mission & Vision:** ${JSON.stringify(fullContext.missionVision, null, 2)}
      - **Brand Identity:** ${JSON.stringify(fullContext.brandIdentity, null, 2)}

      **CRITICAL INSTRUCTION:** The official name of the startup is "${fullContext.name}". You MUST use this name when referring to the company. Do NOT use any of the name suggestions from the "Brand Identity" section.

      Based on the **entire** data package (idea, market, mission, brand), generate 4 distinct customer personas that would be the most likely early adopters and champions of this product. It is crucial that you generate exactly 2 male personas and 2 female personas.
      For each persona, provide the details as specified in the schema, including their gender ('male' or 'female'). Make the details specific and actionable.

      Your output MUST conform to the provided JSON schema.
    `;

    try {
      console.log("--- Requesting Customer Personas from Gemini with Schema ---");
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: personasSchema,
        },
      });
      const resultText = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (!resultText) {
        throw new Error("No customer persona data received from Gemini API");
      }

      console.log("Customer persona data received successfully.");
      return JSON.parse(resultText);

    } catch (error: any) {
      console.error("Failed to get customer persona data:", error.message);
      throw new Error(`Failed to get customer persona data from Gemini API. Error: ${error.message}`);
    }
  }
);

export const generateInterviewScriptsWithAI = internalAction(
  async (
    _,
    { startupName, refinedIdea, personas }: { startupName: string, refinedIdea: string, personas: any }
  ) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set.");
    }
    const ai = new GoogleGenAI({ apiKey });

    const scriptsSchema = {
      type: "OBJECT",
      properties: {
        scripts: {
          type: "ARRAY",
          description: "An array of interview scripts, one for each customer persona.",
          items: {
            type: "OBJECT",
            properties: {
              personaName: { type: "STRING", description: "The name of the persona this script targets." },
              introduction: { type: "ARRAY", items: { type: "STRING" }, description: "Opening lines to build rapport." },
              problemDiscovery: { type: "ARRAY", items: { type: "STRING" }, description: "Questions to validate the persona's problems." },
              solutionValidation: { type: "ARRAY", items: { type: "STRING" }, description: "Questions to get feedback on the proposed solution." },
              wrapUp: { type: "ARRAY", items: { type: "STRING" }, description: "Closing lines for the interview." },
            },
            required: ["personaName", "introduction", "problemDiscovery", "solutionValidation", "wrapUp"],
          }
        }
      },
      required: ["scripts"]
    };

    const prompt = `
      You are a professional UX researcher creating scripts for customer interviews.
      Your goal is to validate the problems and proposed solution for a new startup called "${startupName}".

      **Startup Idea:** "${refinedIdea}"

      **Target Personas:**
      ${JSON.stringify(personas, null, 2)}

      Based on the startup idea and the specific personas provided, generate a detailed interview script for EACH persona.
      The questions should be open-ended and designed to elicit detailed stories and feedback, not just yes/no answers.
      Tailor the language and questions to be appropriate for each specific persona.

      Your output MUST conform to the provided JSON schema.
    `;

    try {
      console.log("--- Requesting Interview Scripts from Gemini with Schema ---");
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: scriptsSchema,
        },
      });
      const resultText = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (!resultText) {
        throw new Error("No interview script data received from Gemini API");
      }

      console.log("Interview script data received successfully.");
      return JSON.parse(resultText);

    } catch (error: any) {
      console.error("Failed to get interview script data:", error.message);
      throw new Error(`Failed to get interview script data from Gemini API. Error: ${error.message}`);
    }
  }
);

export const runInterviewSimulationsWithAI = internalAction(
  async (
    _,
    { fullContext }: { fullContext: any }
  ) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set.");
    }
    const ai = new GoogleGenAI({ apiKey });

    const simulationSchema = {
      type: "OBJECT",
      properties: {
        simulations: {
          type: "ARRAY",
          description: "An array of feedback simulations, one for each customer persona.",
          items: {
            type: "OBJECT",
            properties: {
              personaName: { type: "STRING", description: "The name of the persona providing feedback." },
              keyPositiveFeedback: { type: "ARRAY", items: { type: "STRING" }, description: "A list of 2-3 key positive points the persona loved." },
              criticalConcerns: { type: "ARRAY", items: { type: "STRING" }, description: "A list of 2-3 critical concerns or things they disliked." },
              unansweredQuestions: { type: "ARRAY", items: { type: "STRING" }, description: "A list of 2-3 lingering questions they have." },
            },
            required: ["personaName", "keyPositiveFeedback", "criticalConcerns", "unansweredQuestions"],
          }
        }
      },
      required: ["simulations"]
    };

    const prompt = `
      You are an AI acting as a virtual focus group. You will embody the 4 customer personas provided and give feedback on a startup idea.
      You have been given a complete data package for the startup, including the personas you need to simulate.

      **Startup Data Package:**
      - **Official Startup Name:** ${fullContext.name}
      - **Refined Idea:** ${fullContext.refinedIdea}
      - **Market Pulse:** ${JSON.stringify(fullContext.marketPulse, null, 2)}
      - **Mission & Vision:** ${JSON.stringify(fullContext.missionVision, null, 2)}
      - **Brand Identity:** ${JSON.stringify(fullContext.brandIdentity, null, 2)}
      - **Customer Personas:** ${JSON.stringify(fullContext.customerPersonas, null, 2)}
      - **Interview Scripts:** ${JSON.stringify(fullContext.interviewScripts, null, 2)}

      **CRITICAL INSTRUCTION:** The official name of the startup is "${fullContext.name}". You MUST use this name when referring to the company. Do NOT use any of the name suggestions from the "Brand Identity" section.

      **Your Task:**
      Carefully review the ENTIRE data package (the idea, market, mission, brand, etc.).
      Then, for EACH of the 4 personas listed in the 'customerPersonas' section, provide their simulated feedback on the startup concept.
      Imagine you have just been pitched the idea. What is your gut reaction as that specific persona?

      The personas to simulate are: ${fullContext.customerPersonas.personas.map((p: any) => p.name).join(", ")}.

      Provide the feedback for all 4 personas. For each one, detail:
      1.  **Key Positive Feedback:** What aspects of the idea excite them the most? What makes them say "Wow, I need this"?
      2.  **Critical Concerns:** What are their biggest worries or objections? What would stop them from using this product?
      3.  **Unanswered Questions:** What do they still need to know before they are convinced?

      Your output MUST conform to the provided JSON schema. Ensure the feedback is distinct and believable for each persona.
    `;

    try {
      console.log("--- Requesting Interview Simulations from Gemini with Schema ---");
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: simulationSchema,
        },
      });
      const resultText = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (!resultText) {
        throw new Error("No simulation data received from Gemini API");
      }

      console.log("Simulation data received successfully.");
      return JSON.parse(resultText);

    } catch (error: any) {
      console.error("Failed to get simulation data:", error.message);
      throw new Error(`Failed to get simulation data from Gemini API. Error: ${error.message}`);
    }
  }
);

export const getMentorFeedbackWithAI = internalAction(
  async (
    _,
    { fullContext }: { fullContext: any }
  ) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set.");
    }
    const ai = new GoogleGenAI({ apiKey });

    const feedbackSchema = {
      type: "OBJECT",
      properties: {
        strengths: {
          type: "ARRAY",
          description: "A list of 2-3 key strengths of the business idea and plan.",
          items: { type: "STRING" }
        },
        weaknesses: {
          type: "ARRAY",
          description: "A list of 2-3 critical weaknesses or blind spots in the current plan.",
          items: { type: "STRING" }
        },
        suggestions: {
          type: "ARRAY",
          description: "A list of 2-3 actionable suggestions for improvement.",
          items: { type: "STRING" }
        }
      },
      required: ["strengths", "weaknesses", "suggestions"]
    };

    const prompt = `
      You are a top-tier venture capital partner at a firm like Andreessen Horowitz or Sequoia Capital. You have decades of experience evaluating startups.
      You are reviewing a complete data package for a new venture.

      **Startup Data Package:**
      - **Official Startup Name:** ${fullContext.name}
      - **Brainstorm Result:** ${JSON.stringify(fullContext.brainstormResult, null, 2)}
      - **Market Pulse:** ${JSON.stringify(fullContext.marketPulse, null, 2)}
      - **Mission & Vision:** ${JSON.stringify(fullContext.missionVision, null, 2)}
      - **Brand Identity:** ${JSON.stringify(fullContext.brandIdentity, null, 2)}
      - **Scorecard:** ${JSON.stringify(fullContext.scorecard, null, 2)}
      - **Business Plan:** ${JSON.stringify(fullContext.businessPlan, null, 2)}
      - **Pitch Deck:** ${JSON.stringify(fullContext.pitchDeck, null, 2)}
      - **Market Research:** ${JSON.stringify(fullContext.marketResearch, null, 2)}
      - **Competitor Matrix:** ${JSON.stringify(fullContext.competitorMatrix, null, 2)}
      - **Customer Personas:** ${JSON.stringify(fullContext.customerPersonas, null, 2)}

      **CRITICAL INSTRUCTION:** The official name of the startup is "${fullContext.name}". You MUST use this name when referring to the company. Do NOT use any of the name suggestions from the "Brand Identity" section.

      **Your Task:**
      Provide a brutally honest, sharp, and insightful critique of this venture as if you were deciding whether to invest. Your feedback is invaluable.
      Based on the **entire** data package, analyze the business and provide your feedback, focusing on the most critical points an investor would care about.

      Structure your feedback into three sections:
      1.  **Strengths:** What are the most compelling parts of this plan? What makes it potentially a billion-dollar company?
      2.  **Weaknesses:** What are the most glaring holes? What are the biggest risks that could kill this company?
      3.  **Suggestions:** What are the most important, actionable things the founders should do right now to de-risk the venture and strengthen their position?

      Your output MUST conform to the provided JSON schema.
    `;

    try {
      console.log("--- Requesting Mentor Feedback from Gemini with Schema ---");
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: feedbackSchema
        }
      });
      const resultText = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (!resultText) {
        throw new Error("No mentor feedback data received from Gemini API");
      }

      console.log("Mentor feedback data received successfully.");
      return JSON.parse(resultText);
    } catch (error: any) {
      console.error("Failed to get mentor feedback data:", error.message);
      throw new Error(
        `Failed to get mentor feedback data from Gemini API. Error: ${error.message}`
      );
    }
  }
);

export const generateUserFlowWithAI = internalAction(
  async (
    _,
    { fullContext }: { fullContext: any }
  ) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set.");
    }
    const ai = new GoogleGenAI({ apiKey });

    const userFlowSchema = {
      type: "OBJECT",
      properties: {
        nodes: {
          type: "ARRAY",
          description: "An array of nodes in the user flow diagram.",
          items: {
            type: "OBJECT",
            properties: {
              id: { type: "STRING", description: "Unique identifier for the node." },
              type: { type: "STRING", description: "Type of the node (e.g., 'input', 'default', 'output')." },
              data: { 
                type: "OBJECT",
                properties: { 
                  label: { type: "STRING", description: "The display text on the node." }
                },
                required: ["label"]
              },
              position: { 
                type: "OBJECT",
                properties: { 
                  x: { type: "NUMBER", description: "X coordinate for the node's position." },
                  y: { type: "NUMBER", description: "Y coordinate for the node's position." }
                },
                required: ["x", "y"]
              },
            },
            required: ["id", "type", "data", "position"],
          },
        },
        edges: {
          type: "ARRAY",
          description: "An array of edges connecting the nodes.",
          items: {
            type: "OBJECT",
            properties: {
              id: { type: "STRING", description: "Unique identifier for the edge." },
              source: { type: "STRING", description: "The ID of the source node." },
              target: { type: "STRING", description: "The ID of the target node." },
            },
            required: ["id", "source", "target"],
          },
        },
      },
      required: ["nodes", "edges"],
    };

    const prompt = `
      You are a senior UX designer tasked with creating a primary user flow diagram for a new startup called "${fullContext.name}".
      Based on the provided data, map out the most common and critical path a user would take from discovery to achieving the core value proposition.

      **Startup Data Package:**
      - **Official Startup Name:** ${fullContext.name}
      - **Refined Idea:** ${fullContext.refinedIdea}
      - **Personas:** ${JSON.stringify(fullContext.personas, null, 2)}

      **Your Task:**
      Generate a user flow diagram with 5-7 key steps (nodes).
      1.  Start with an entry point (e.g., 'Visits Landing Page').
      2.  Map out the key actions and decisions a user makes (e.g., 'Signs Up', 'Completes Onboarding', 'Uses Core Feature').
      3.  End with the user achieving the primary goal or outcome.
      4.  Arrange the nodes logically on a 2D plane by setting their x and y positions. The flow should generally move from left to right.

      Your output MUST conform to the provided JSON schema, containing an array of 'nodes' and an array of 'edges'.
    `;

    try {
      console.log("--- Requesting User Flow Diagram from Gemini with Schema ---");
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: userFlowSchema,
        },
      });
      const resultText = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (!resultText) {
        throw new Error("No user flow data received from Gemini API");
      }

      console.log("User flow data received successfully.");
      return JSON.parse(resultText);

    } catch (error: any) {
      console.error("Failed to get user flow data:", error.message);
    }
  }
);

export const generateAIWireframeWithAI = internalAction(
  async (
    _,
    { fullContext }: { fullContext: any }
  ) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set.");
    }
    const ai = new GoogleGenAI({ apiKey });

    const wireframeSchema = {
      type: "OBJECT",
      properties: {
        code: { 
          type: "STRING", 
          description: "A single string containing the complete, self-contained React component code for the wireframe. It should be named WireframeComponent and use inline style objects for all styling."
        },
      },
      required: ["code"]
    };

    const prompt = `
      You are a skilled UX/UI designer specializing in rapid, low-fidelity wireframing using React.
      You are tasked with creating a clean, simple wireframe component for a startup's main landing page based on its core data.

      **Startup Data Package:**
      ${JSON.stringify(fullContext, null, 2)}

      **Your Task:**
      Generate a single, self-contained React component named 'WireframeComponent'. This is NOT a full website design; it is a structural blueprint.

      **Requirements:**
      1.  **Format:** A single React component. Use inline style objects for all styling. Do not use CSS classes.
      2.  **No Modules:** Do NOT include any \`import\` or \`export\` statements. The code must be a single, self-contained component definition.
      3.  **Simplicity:** Use only basic JSX elements (div, header, footer, p, h1, etc.). Represent images and complex elements with simple placeholder boxes.
      4.  **Styling:** Use a monochrome color scheme (e.g., shades of gray like '#ccc', '#eee', '#333'). Use dashed borders for placeholder elements. Keep it clean and minimal.
      5.  **Structure:** The wireframe must include placeholders for:
          - A main navigation bar.
          - A hero section with a headline and a call-to-action button.
          - Three feature boxes below the hero section.
          - A footer.
      6.  **Content:** Use placeholder text (e.g., "[Headline]", "[Feature 1 Description]") for content, but use the actual startup name from the context data.

      Your output MUST conform to the provided JSON schema, returning a single JSON object with the 'code' field containing the entire React component as a string.
    `;

    try {
      console.log("--- Requesting AI Wireframe from Gemini with Schema ---");
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: wireframeSchema,
        },
      });
      const resultText = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (!resultText) {
        throw new Error("No wireframe data received from Gemini API");
      }

      console.log("AI Wireframe data received successfully.");
      return JSON.parse(resultText);

    } catch (error: any) {
      console.error("Failed to get AI wireframe data:", error.message);
      throw new Error(`Failed to get AI wireframe data from Gemini API. Error: ${error.message}`);
    }
  }
);

export const generateWebsitePrototypeWithAI = internalAction(
  async (
    _,
    { fullContext }: { fullContext: any }
  ) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set.");
    }
    const ai = new GoogleGenAI({ apiKey });

    const prototypeSchema = {
      type: "OBJECT",
      properties: {
        code: { 
          type: "STRING", 
          description: "A single string containing the complete, self-contained React component code for the landing page. It should be named LandingPageComponent and use inline style objects for all styling."
        },
      },
      required: ["code"]
    };

    const prompt = `
      You are a senior frontend developer tasked with building a beautiful, modern, and complete landing page for a new startup.
      You will be given the full context of the startup and must generate a single, self-contained React component.

      **Startup Data Package:**
      ${JSON.stringify(fullContext, null, 2)}

      **Your Task:**
      Generate a single, self-contained React component named 'LandingPageComponent'. This is a fully designed prototype, not just a wireframe.

      **Requirements:**
      1.  **Format:** A single React component. Use inline style objects for all styling. Do not use CSS classes.
      2.  **No Modules:** Do NOT include any \`import\` or \`export\` statements.
      3.  **Styling:** Use a professional and aesthetically pleasing color palette. Use a modern, clean font. Ensure proper spacing and layout. This should look like a real, polished website.
      4.  **Structure:** The component must include:
          - A navigation bar with the startup's name.
          - A compelling hero section with a strong headline, a sub-headline, and a primary call-to-action (CTA) button.
          - A 'Features' section highlighting 3 key features from the data package. Each feature should have an icon (use a relevant emoji), a title, and a brief description.
          - A 'Testimonials' section with 2-3 sample testimonials. Each testimonial should include a quote, an author name, and their title.
          - A final CTA section with a headline and another button.
          - A simple footer with the company name and copyright.
      5.  **Content:** Use the actual startup name, slogan, features, and other relevant information from the provided data package. Make the copy engaging and persuasive.

      Your output MUST conform to the provided JSON schema, returning a single JSON object with the 'code' field containing the entire React component as a string.
    `;

    try {
      console.log("--- Requesting Website Prototype from Gemini with Schema ---");
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: prototypeSchema,
        },
      });
      const resultText = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (!resultText) {
        throw new Error("No website prototype data received from Gemini API");
      }

      console.log("Website prototype data received successfully.");
      return JSON.parse(resultText);

    } catch (error: any) {
      console.error("Failed to get website prototype data:", error.message);
      throw new Error(`Failed to get website prototype data from Gemini API. Error: ${error.message}`);
    }
  }
);

export const generateTechStackWithAI = internalAction(
  async (
    _,
    { fullContext }: { fullContext: any }
  ) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set.");
    }
    const ai = new GoogleGenAI({ apiKey });

    const techStackSchema = {
      type: "OBJECT",
      properties: {
        stack: {
          type: "ARRAY",
          description: "An array of technology categories.",
          items: {
            type: "OBJECT",
            properties: {
              category: { type: "STRING", description: "The category name (e.g., Frontend, Backend, Database)." },
              technologies: {
                type: "ARRAY",
                description: "An array of recommended technologies in this category.",
                items: {
                  type: "OBJECT",
                  properties: {
                    name: { type: "STRING", description: "The name of the technology." },
                    justification: { type: "STRING", description: "A concise reason for choosing this technology for this specific startup." },
                  },
                  required: ["name", "justification"],
                }
              }
            },
            required: ["category", "technologies"],
          }
        }
      },
      required: ["stack"]
    };

    const prompt = `
      You are a seasoned Chief Technology Officer (CTO) and startup architect.
      You are tasked with recommending a complete, modern, and scalable technology stack for a new venture based on its full context.

      **Startup Data Package:**
      - **Official Startup Name:** ${fullContext.name}
      - **Core Idea & Features:** ${JSON.stringify(fullContext.brainstormResult, null, 2)}
      - **User Personas:** ${JSON.stringify(fullContext.customerPersonas, null, 2)}
      - **User Flow:** ${JSON.stringify(fullContext.userFlow, null, 2)}
      - **Wireframe Code:** ${fullContext.aiWireframe}

      **CRITICAL INSTRUCTION:** The official name of the startup is "${fullContext.name}". You MUST use this name when referring to the company.

      **Your Task:**
      Based on the **entire** data package, recommend a technology stack. The stack should be divided into four categories: 'Frontend', 'Backend', 'Database', and 'Deployment'.

      **Requirements:**
      1.  For each category, recommend exactly 2 primary technologies.
      2.  For each technology, provide a concise **justification** explaining why it's a good fit for this specific startup idea.
      3.  The choices should be modern, widely-used, and suitable for a startup aiming for rapid development and scalability.

      Your output MUST conform to the provided JSON schema.
    `;

    try {
      console.log("--- Requesting Tech Stack from Gemini with Schema ---");
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: techStackSchema,
        },
      });
      const resultText = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (!resultText) {
        throw new Error("No tech stack data received from Gemini API");
      }

      console.log("Tech stack data received successfully.");
      return JSON.parse(resultText);

    } catch (error: any) {
      console.error("Failed to get tech stack data:", error.message);
      throw new Error(`Failed to get tech stack data from Gemini API. Error: ${error.message}`);
    }
  }
);

export const generateDatabaseSchema = internalAction(
  async (
    _,
    { fullContext }: { fullContext: any }
  ) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set.");
    }
    const ai = new GoogleGenAI({ apiKey });

    const reactFlowSchema = {
        type: "OBJECT",
        properties: {
            nodes: {
                type: "ARRAY",
                description: "An array of nodes representing database tables.",
                items: {
                    type: "OBJECT",
                    properties: {
                        id: { type: "STRING", description: "Unique identifier for the node (table name)." },
                        type: { type: "STRING", description: "Type of the node, should be 'default'." },
                        data: { 
                            type: "OBJECT",
                            properties: { 
                                label: { type: "STRING", description: "The table definition, including name, columns, types, and keys (PK, FK). Format as a multi-line string." }
                            },
                            required: ["label"]
                        },
                        position: { 
                            type: "OBJECT",
                            properties: { 
                                x: { type: "NUMBER", description: "X coordinate for the node's position." },
                                y: { type: "NUMBER", description: "Y coordinate for the node's position." }
                            },
                            required: ["x", "y"]
                        },
                    },
                    required: ["id", "type", "data", "position"],
                },
            },
            edges: {
                type: "ARRAY",
                description: "An array of edges representing relationships between tables.",
                items: {
                    type: "OBJECT",
                    properties: {
                        id: { type: "STRING", description: "Unique identifier for the edge (e.g., 'users-user_profiles')." },
                        source: { type: "STRING", description: "The ID of the source table node." },
                        target: { type: "STRING", description: "The ID of the target table node." },
                        label: { type: "STRING", description: "Label for the relationship (e.g., 'has one', 'has many')." },
                    },
                    required: ["id", "source", "target", "label"],
                },
            },
        },
        required: ["nodes", "edges"],
    };

    const prompt = `
      You are a senior database architect creating a visual schema for a new application called "${fullContext.name}".
      Based on the provided application context, generate a database schema as a JSON object suitable for the React Flow library.

      **Startup Context:**
      - **Official Startup Name:** ${fullContext.name}
      - **Core Idea & Features:** ${JSON.stringify(fullContext.brainstormResult, null, 2)}
      - **Primary User Flow:** ${JSON.stringify(fullContext.userFlowDiagram, null, 2)}

      **Your Task:**
      Generate a JSON object containing 'nodes' and 'edges' to represent the database schema.

      **Requirements:**
      1.  **Nodes:** Each node represents a database table. The 'id' should be the table name. The 'data.label' should be a multi-line string containing the full table definition (name, columns with types, and PK/FK designations).
      2.  **Edges:** Each edge represents a relationship between two tables. The 'label' should describe the relationship (e.g., '1-to-many').
      3.  **Layout:** Arrange the nodes logically on a 2D plane by setting their x and y positions. The flow should be clear and minimize overlapping edges.
      4.  **Schema:** The output MUST conform to the provided JSON schema.
    `;

    try {
      console.log("--- Requesting Database Schema (React Flow format) from Gemini ---");
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: reactFlowSchema,
        },
      });
      const resultText = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (!resultText) {
        throw new Error("No schema data received from Gemini API");
      }

      console.log("Database Schema data received successfully.");
      return JSON.parse(resultText);

    } catch (error: any) {
      console.error("Failed to get Database Schema data:", error.message);
    }
  }
);

export const generateApiEndpointsWithAI = internalAction(
  async (
    _,
    { fullContext }: { fullContext: any }
  ) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set.");
    }
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
      You are a senior backend engineer designing the RESTful API for a new application called "${fullContext.name}".
      Based on the provided application context, including the core idea, user flows, and database schema, your task is to define a logical and comprehensive set of API endpoints.

      **Application Context:**
      - **Official Startup Name:** ${fullContext.name}
      - **Core Idea & Features:** ${JSON.stringify(fullContext.brainstormResult, null, 2)}
      - **Primary User Flow:** ${JSON.stringify(fullContext.userFlowDiagram, null, 2)}
      - **Database Schema:** ${JSON.stringify(fullContext.databaseSchema, null, 2)}

      **Your Task:**
      Generate a list of RESTful API endpoints required to power the application. Present the output in a clear Markdown format.

      **Requirements:**
      1.  **Format:** Use Markdown tables to structure the endpoints by resource (e.g., Users, Products, Orders).
      2.  **Columns:** Each table should have three columns: "HTTP Method", "Path", and "Description".
      3.  **Clarity:** The endpoint paths should be clear and follow RESTful conventions (e.g., \`/api/v1/users\`, \`/api/v1/users/{userId}\`).
      4.  **Completeness:** Cover all the main CRUD (Create, Read, Update, Delete) operations for each major resource identified from the application context.
      5.  **Group by Resource:** Group related endpoints under a clear resource heading (e.g., ### User Management).

      **Example for a single resource:**

      ### User Management

      | HTTP Method | Path                  | Description                                      |
      |-------------|-----------------------|--------------------------------------------------|
      | POST        | /api/v1/users         | Creates a new user.                              |
      | GET         | /api/v1/users         | Retrieves a list of users.                       |
      | GET         | /api/v1/users/{userId}  | Retrieves a specific user by their ID.           |
      | PUT         | /api/v1/users/{userId}  | Updates a specific user.                         |
      | DELETE      | /api/v1/users/{userId}  | Deletes a specific user.                         |

      Now, generate the full list of API endpoints based on the provided context.
    `;

    try {
      console.log("--- Requesting API Endpoints from Gemini ---");
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });
      const resultText = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (!resultText) {
        throw new Error("No API endpoint data received from Gemini API");
      }

      console.log("API endpoint data received successfully.");
      return resultText;

    } catch (error: any) {
      console.error("Failed to get API endpoint data:", error.message);
      throw new Error(`Failed to get API endpoint data from Gemini API. Error: ${error.message}`);
    }
  }
);

export const generateDevelopmentRoadmapWithAI = internalAction(
  async (
    _,
    { fullContext }: { fullContext: any }
  ) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set.");
    }
    const ai = new GoogleGenAI({ apiKey });

    const roadmapSchema = {
      type: "OBJECT",
      properties: {
        roadmap: {
          type: "ARRAY",
          description: "The development roadmap, broken into phases.",
          items: {
            type: "OBJECT",
            properties: {
              phase: { type: "STRING", description: "The title of the phase (e.g., 'Phase 1: MVP Foundation')." },
              epics: {
                type: "ARRAY",
                description: "A list of epics within this phase.",
                items: {
                  type: "OBJECT",
                  properties: {
                    title: { type: "STRING", description: "The title of the epic." },
                    icon: { type: "STRING", description: "A relevant Font Awesome 5 free icon class name (e.g., 'fas fa-users')." },
                    tasks: { type: "ARRAY", items: { type: "STRING" }, description: "A list of user stories or tasks for this epic." },
                  },
                  required: ["title", "icon", "tasks"],
                }
              }
            },
            required: ["phase", "epics"],
          }
        }
      },
      required: ["roadmap"]
    };

    const prompt = `
      You are a senior Project Manager and Tech Lead creating a development roadmap for a new application called "${fullContext.name}".
      Based on the provided context, generate a clear, phased roadmap as a JSON object.

      **Application Context:**
      - **Official Startup Name:** ${fullContext.name}
      - **Core Idea & Features:** ${JSON.stringify(fullContext.brainstormResult, null, 2)}
      - **Technology Stack:** ${JSON.stringify(fullContext.techStack, null, 2)}
      - **Database Schema:** ${JSON.stringify(fullContext.databaseSchema, null, 2)}
      - **API Endpoints:** ${fullContext.apiEndpoints}

      **Your Task:**
      Generate a JSON object that represents the development roadmap. The roadmap should be structured into 3-4 logical phases.

      **JSON Schema Requirements:**
      1.  The root object must have a key "roadmap" which is an array of phase objects.
      2.  Each phase object must have a "phase" title and an array of "epics".
      3.  Each epic object must have a "title", a suggested Font Awesome 5 free icon class name in the "icon" field (e.g., "fas fa-users", "fas fa-database", "fas fa-credit-card"), and an array of "tasks" (user stories).
      **Important Formatting Rule:** Do not use any markdown formatting. All text in the JSON string values must be plain text. Do not use asterisks (*).

      Your output MUST conform to the provided JSON schema.
    `;

    try {
      console.log("--- Requesting Development Roadmap from Gemini with Schema ---");
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: roadmapSchema,
        },
      });
      const resultText = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (!resultText) {
        throw new Error("No roadmap data received from Gemini API");
      }

      console.log("Roadmap data received successfully.");
      // The result is already a stringified JSON from the API
      return resultText;

    } catch (error: any) {
      console.error("Failed to get roadmap data:", error.message);
      throw new Error(`Failed to get roadmap data from Gemini API. Error: ${error.message}`);
    }
  }
);

export const estimateCloudCostsWithAI = internalAction(
  async (
    _,
    { fullContext }: { fullContext: any }
  ) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set.");
    }
    const ai = new GoogleGenAI({ apiKey });

    const costSchema = {
      type: "OBJECT",
      properties: {
        costs: {
          type: "ARRAY",
          description: "A breakdown of estimated costs by service category.",
          items: {
            type: "OBJECT",
            properties: {
              service: { type: "STRING", description: "The name of the service category (e.g., 'Compute', 'Database')." },
              icon: { type: "STRING", description: "A relevant Font Awesome 5 free icon class name (e.g., 'fas fa-server')." },
              justification: { type: "STRING", description: "A brief explanation of why this service is needed." },
              estimates: {
                type: "ARRAY",
                description: "A list of cost estimates for different stages.",
                items: {
                  type: "OBJECT",
                  properties: {
                    stage: { type: "STRING", description: "The name of the stage (e.g., 'Development', 'Initial Launch')." },
                    cost: { type: "STRING", description: "The estimated monthly cost for this stage (e.g., '$10 - $20 / month')." },
                  },
                  required: ["stage", "cost"],
                }
              }
            },
            required: ["service", "icon", "justification", "estimates"],
          }
        },
        summary: { type: "STRING", description: "A concluding summary of the overall cost strategy." },
      },
      required: ["costs", "summary"],
    };

    const prompt = `
      You are a pragmatic Cloud Solutions Architect providing a high-level, initial cloud cost estimate for a new startup called "${fullContext.name}".
      Based on the provided technical specifications, generate a cost breakdown in JSON format.

      **Application Context:**
      - **Official Startup Name:** ${fullContext.name}
      - **Technology Stack:** ${JSON.stringify(fullContext.techStack, null, 2)}
      - **Database Schema:** ${JSON.stringify(fullContext.databaseSchema, null, 2)}
      - **API Endpoints:** ${fullContext.apiEndpoints}

      **Your Task:**
      Generate a JSON object that estimates initial monthly cloud costs. Break down the costs into exactly 4 primary service categories: Compute, Database, Storage, and Networking.

      **JSON Schema Requirements:**
      1.  The root object must have a "costs" array and a "summary" string.
      2.  Each item in the "costs" array should represent a service category and have:
          - "service": The category name.
          - "icon": A relevant Font Awesome 5 free icon class (e.g., "fas fa-server").
          - "justification": A brief explanation.
          - "estimates": An array of objects, each with a "stage" and a "cost" string for that stage.
      3.  Provide estimates for three stages: "Development & Testing", "Initial Launch (Low Traffic)", and "Growth Stage (Moderate Traffic)".
      4.  The cost estimates should be reasonable for a startup using modern, serverless-first or managed services where possible to keep initial costs low.

      Your output MUST conform to the provided JSON schema.
    `;

    try {
      console.log("--- Requesting Cloud Cost Estimate from Gemini with Schema ---");
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: costSchema,
        },
      });
      const resultText = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (!resultText) {
        throw new Error("No cost estimate data received from Gemini API");
      }

      console.log("Cost estimate data received successfully.");
      return resultText;

    } catch (error: any) {
      console.error("Failed to get cost estimate data:", error.message);
      throw new Error(`Failed to get cost estimate data from Gemini API. Error: ${error.message}`);
    }
  }
);

export const generatePricingStrategyWithAI = internalAction(
  async (
    _,
    { fullContext }: { fullContext: any }
  ) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set.");
    }
    const ai = new GoogleGenAI({ apiKey });

    const pricingSchema = {
      type: "OBJECT",
      properties: {
        models: {
          type: "ARRAY",
          description: "An array of 1 to 2 suggested pricing models.",
          items: {
            type: "OBJECT",
            properties: {
              modelName: { type: "STRING", description: "The name of the pricing model (e.g., 'Tiered Subscription')." },
              modelDescription: { type: "STRING", description: "A brief description of why this model is a good fit." },
              tiers: {
                type: "ARRAY",
                description: "An array of 2-3 pricing tiers for this model.",
                items: {
                  type: "OBJECT",
                  properties: {
                    tierName: { type: "STRING", description: "Name of the tier (e.g., 'Basic', 'Pro', 'Enterprise')." },
                    price: { type: "STRING", description: "The price for this tier (e.g., '$10/month', '$0/month')." },
                    description: { type: "STRING", description: "A short description of the ideal customer for this tier." },
                    features: { type: "ARRAY", items: { type: "STRING" }, description: "A list of key features included in this tier." },
                    isRecommended: { type: "BOOLEAN", description: "Set to true for the single tier you most recommend for new users to start with." },
                  },
                  required: ["tierName", "price", "description", "features", "isRecommended"],
                }
              }
            },
            required: ["modelName", "modelDescription", "tiers"],
          }
        }
      },
      required: ["models"],
    };

    const prompt = `
      You are a monetization and pricing strategist for tech startups.
      Based on the provided business context for a startup called "${fullContext.name}", generate 1 or 2 potential pricing models with detailed tiers in a JSON format.

      **Business Context:**
      - **Official Startup Name:** ${fullContext.name}
      - **Business Plan:** ${JSON.stringify(fullContext.businessPlan, null, 2)}
      - **Target Personas:** ${JSON.stringify(fullContext.customerPersonas, null, 2)}
      - **Competitor Matrix:** ${JSON.stringify(fullContext.competitorMatrix, null, 2)}

      **Your Task:**
      Generate a JSON object that outlines 1-2 distinct pricing models. For each model, define 2-3 pricing tiers.

      **JSON Schema Requirements:**
      1.  The root object must have a "models" array.
      2.  Each model object must have a "modelName", "modelDescription", and an array of "tiers".
      3.  Each tier object must have "tierName", "price", "description", an array of "features", and a boolean "isRecommended".
      4.  Ensure that for each model, exactly ONE tier has "isRecommended" set to true.
      **Important Formatting Rule:** Do not use any markdown formatting. All text in the JSON string values must be plain text. Do not use asterisks (*).

      Your output MUST conform to the provided JSON schema.
    `;

    try {
      console.log("--- Requesting Pricing Strategy from Gemini with Schema ---");
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: pricingSchema,
        },
      });
      const resultText = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (!resultText) {
        throw new Error("No pricing strategy data received from Gemini API");
      }

      console.log("Pricing strategy data received successfully.");
      return resultText;

    } catch (error: any) {
      console.error("Failed to get pricing strategy data:", error.message);
      throw new Error(`Failed to get pricing strategy data from Gemini API. Error: ${error.message}`);
    }
  }
);

export const generateMarketingCopyWithAI = internalAction(
  async (
    _,
    { fullContext }: { fullContext: any }
  ) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set.");
    }
    const ai = new GoogleGenAI({ apiKey });

    const marketingCopySchema = {
      type: "OBJECT",
      properties: {
        taglines: {
          type: "ARRAY",
          description: "An array of 3-4 short, catchy taglines for the brand.",
          items: { type: "STRING" },
        },
        socialMediaPosts: {
          type: "OBJECT",
          properties: {
            linkedin: { type: "STRING", description: "A professional post for LinkedIn announcing the product." },
            twitter: { type: "STRING", description: "A short, punchy tweet for Twitter/X." },
            facebook: { type: "STRING", description: "An engaging post for a Facebook audience." },
          },
          required: ["linkedin", "twitter", "facebook"],
        },
        adCopy: {
          type: "OBJECT",
          properties: {
            googleAds: {
              type: "OBJECT",
              properties: {
                headline1: { type: "STRING", description: "A 30-character headline for Google Ads." },
                headline2: { type: "STRING", description: "A second 30-character headline." },
                description: { type: "STRING", description: "A 90-character description for Google Ads." },
              },
              required: ["headline1", "headline2", "description"],
            },
            facebookAd: {
              type: "OBJECT",
              properties: {
                headline: { type: "STRING", description: "A headline for a Facebook Ad." },
                primaryText: { type: "STRING", description: "The main body text for the Facebook Ad." },
                callToAction: { type: "STRING", description: "A short call to action, e.g., 'Learn More'." },
              },
              required: ["headline", "primaryText", "callToAction"],
            },
          },
          required: ["googleAds", "facebookAd"],
        },
        emailCampaign: {
          type: "OBJECT",
          properties: {
            subject: { type: "STRING", description: "A compelling subject line for a product announcement email." },
            body: { type: "STRING", description: "The full body of the announcement email, written in a persuasive tone. Use markdown for formatting." },
          },
          required: ["subject", "body"],
        },
      },
      required: ["taglines", "socialMediaPosts", "adCopy", "emailCampaign"],
    };

    const prompt = `
      You are a senior marketing copywriter for a new tech startup.
      Based on the provided business context, generate a complete set of marketing copy in a JSON format.

      **Business Context:**
      - **Official Startup Name:** ${fullContext.name}
      - **Brand Identity:** ${JSON.stringify(fullContext.brandIdentity, null, 2)}
      - **Mission & Vision:** ${JSON.stringify(fullContext.missionVision, null, 2)}
      - **Target Personas:** ${JSON.stringify(fullContext.customerPersonas, null, 2)}
      - **Pricing Strategy:** ${JSON.stringify(fullContext.pricingStrategy, null, 2)}

      **Your Task:**
      Generate a JSON object that contains a variety of marketing copy tailored to the business.

      **CRITICAL INSTRUCTION:** You MUST use the "Official Startup Name" provided above for all marketing copy. Do NOT use any of the name suggestions from the "Brand Identity" section. The official name is "${fullContext.name}".

      **Important Formatting Rule:** Do not use any markdown formatting. All text in the JSON string values must be plain text. Do not use asterisks (*).

      **JSON Schema Requirements:**
      1.  The root object must contain keys for "taglines", "socialMediaPosts", "adCopy", and "emailCampaign".
      2.  **taglines**: Provide 3-4 diverse and catchy options.
      3.  **socialMediaPosts**: Provide distinct copy for LinkedIn (professional), Twitter/X (concise), and Facebook (engaging).
      4.  **adCopy**: Provide copy for both Google Ads (respecting character limits) and a Facebook Ad.
      5.  **emailCampaign**: Write a complete announcement email with a strong subject line and body.

      Your output MUST conform to the provided JSON schema.
    `;

    try {
      console.log("--- Requesting Marketing Copy from Gemini with Schema ---");
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: marketingCopySchema,
        },
      });
      const resultText = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (!resultText) {
        throw new Error("No marketing copy data received from Gemini API");
      }

      console.log("Marketing copy data received successfully.");
      return resultText;

    } catch (error: any) {
      console.error("Failed to get marketing copy data:", error.message);
      throw new Error(`Failed to get marketing copy data from Gemini API. Error: ${error.message}`);
    }
  }
);

export const generateWaitlistPageWithAI = internalAction(
  async (
    _,
    { fullContext }: { fullContext: any }
  ) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set.");
    }
    const ai = new GoogleGenAI({ apiKey });

    const pageSchema = {
      type: "OBJECT",
      properties: {
        code: { 
          type: "STRING", 
          description: "A single string containing the complete, self-contained React component code for the waitlist page. It should be named WaitlistComponent and use inline style objects for all styling."
        },
      },
      required: ["code"]
    };

    const prompt = `
      You are a senior frontend developer and UI/UX designer creating a pre-launch waitlist page.
      Based on the provided marketing context, generate the code for a beautiful, modern, and effective waitlist page.

      **Marketing Context:**
      - **Official Startup Name:** ${fullContext.name}
      - **Brand Identity:** ${JSON.stringify(fullContext.brandIdentity, null, 2)}
      - **Mission & Vision:** ${JSON.stringify(fullContext.missionVision, null, 2)}
      - **Key Tagline:** ${fullContext.marketingCopy.taglines[0]}

      **Your Task:**
      Generate a single, self-contained React component named 'WaitlistComponent'.

      **CRITICAL INSTRUCTION:** You MUST use the "Official Startup Name" (${fullContext.name}) for the company name in the generated code. Do NOT use any of the name suggestions from the "Brand Identity" section.

      **Requirements:**
      1.  **Format:** A single React component in a string. Use inline style objects for all styling. Do not use CSS classes.
      2.  **No Modules:** Do NOT include any \`import\` or \`export\` statements.
      3.  **Styling:** Create a visually appealing, modern design. Use a clean layout, good typography, and a professional color scheme derived from the brand context. The page should build anticipation and trust.
      4.  **Structure:** The component must include:
          - A strong, catchy headline (using the official brand name and tagline).
          - A brief, persuasive paragraph explaining the product's value (derived from the mission/vision).
          - An email input field.
          - A prominent call-to-action button (e.g., "Join the Waitlist", "Get Early Access").
      5.  **Content:** Use the actual startup name and marketing copy from the context.

      Your output MUST conform to the provided JSON schema, returning a single JSON object with the 'code' field containing the entire React component as a string.
    `;

    try {
      console.log("--- Requesting Waitlist Page Code from Gemini with Schema ---");
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: pageSchema,
        },
      });
      const resultText = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (!resultText) {
        throw new Error("No waitlist page code received from Gemini API");
      }

      console.log("Waitlist page code received successfully.");
      return resultText;

    } catch (error: any) {
      console.error("Failed to get waitlist page code:", error.message);
      throw new Error(`Failed to get waitlist page code from Gemini API. Error: ${error.message}`);
    }
  }
);

export const generateABTestIdeasWithAI = internalAction(
  async (
    _,
    { fullContext }: { fullContext: any }
  ) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set.");
    }
    const ai = new GoogleGenAI({ apiKey });

    const abTestSchema = {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          hypothesis: { type: "STRING", description: "A clear, testable hypothesis for the A/B test (e.g., 'Changing the CTA button color from blue to green will increase sign-ups')." },
          description: { type: "STRING", description: "A brief explanation of the reasoning behind this test." },
          variationA: {
            type: "OBJECT",
            properties: {
              name: { type: "STRING", description: "Name of Variation A (e.g., 'Control: Blue Button')." },
              details: { type: "STRING", description: "Specific details of what Variation A entails." },
            },
            required: ["name", "details"],
          },
          variationB: {
            type: "OBJECT",
            properties: {
              name: { type: "STRING", description: "Name of Variation B (e.g., 'Challenger: Green Button')." },
              details: { type: "STRING", description: "Specific details of what Variation B entails." },
            },
            required: ["name", "details"],
          },
        },
        required: ["hypothesis", "description", "variationA", "variationB"],
      }
    };

    const prompt = `
      You are a conversion rate optimization (CRO) expert.
      Based on the provided business context for a startup called "${fullContext.name}", generate 3 creative and impactful A/B test ideas in a JSON format.

      **Business Context:**
      - **Official Startup Name:** ${fullContext.name}
      - **Refined Idea:** ${fullContext.refinedIdea}
      - **Key Features:** ${fullContext.keyFeatures.join(", ")}
      - **Target Personas:** ${JSON.stringify(fullContext.customerPersonas, null, 2)}

      **Your Task:**
      Generate a JSON object that contains an array of 3 distinct A/B test ideas. Focus on high-impact areas like user onboarding, call-to-actions, or pricing presentation.

      **JSON Schema Requirements:**
      1.  The root of the response must be a JSON array.
      2.  Each object in the array must have "hypothesis", "description", "variationA" (object), and "variationB" (object).
      3.  The variations objects must contain "name" and "details".
      **Important Formatting Rule:** Do not use any markdown formatting. All text in the JSON string values must be plain text. Do not use asterisks (*).

      Your output MUST conform to the provided JSON schema.
    `;

    try {
      console.log("--- Requesting A/B Test Ideas from Gemini with Schema ---");
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: abTestSchema,
        },
      });
      const resultText = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (!resultText) {
        throw new Error("No A/B test ideas data received from Gemini API");
      }

      console.log("A/B test ideas data received successfully.");
      return resultText;

    } catch (error: any) {
      console.error("Failed to get A/B test ideas data:", error.message);
      throw new Error(`Failed to get A/B test ideas data from Gemini API. Error: ${error.message}`);
    }
  }
);

export const generateSeoStrategyWithAI = internalAction(
  async (
    _,
    { fullContext }: { fullContext: any }
  ) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set.");
    }
    const ai = new GoogleGenAI({ apiKey });

    const seoSchema = {
      type: "OBJECT",
      properties: {
        keywordClusters: {
          type: "ARRAY",
          description: "An array of 3-4 keyword clusters.",
          items: {
            type: "OBJECT",
            properties: {
              clusterName: { type: "STRING", description: "A high-level name for the keyword group (e.g., 'DIY Project Management Tools')." },
              justification: { type: "STRING", description: "A brief explanation of who this cluster targets and their intent." },
              keywords: { type: "ARRAY", items: { type: "STRING" }, description: "A list of 5-7 related keywords in this cluster." },
            },
            required: ["clusterName", "justification", "keywords"],
          }
        },
        contentPillars: {
          type: "ARRAY",
          description: "An array of 2-3 main content pillars.",
          items: {
            type: "OBJECT",
            properties: {
              pillar: { type: "STRING", description: "The name of the content pillar (e.g., 'Startup Productivity')." },
              description: { type: "STRING", description: "A brief description of what this content pillar covers." },
              topics: { type: "ARRAY", items: { type: "STRING" }, description: "A list of 3-4 specific blog post or article ideas for this pillar." },
            },
            required: ["pillar", "description", "topics"],
          }
        }
      },
      required: ["keywordClusters", "contentPillars"],
    };

    const prompt = `
      You are a world-class SEO strategist and content marketer.
      Based on the provided business context for a startup called "${fullContext.name}", generate a foundational SEO keyword and content strategy in a JSON format.

      **Business Context:**
      - **Official Startup Name:** ${fullContext.name}
      - **Refined Idea:** ${fullContext.refinedIdea}
      - **Marketing Copy Snippets:** ${JSON.stringify(fullContext.marketingCopy, null, 2)}
      - **Target Personas:** ${JSON.stringify(fullContext.customerPersonas, null, 2)}

      **Your Task:**
      Generate a JSON object that outlines the SEO strategy. The strategy must include two main parts: "keywordClusters" and "contentPillars".

      **JSON Schema Requirements:**
      1.  **keywordClusters**: Create 3-4 distinct clusters. Each cluster must have a 'clusterName', a 'justification' explaining the user intent, and a list of 5-7 'keywords'.
      2.  **contentPillars**: Create 2-3 high-level content pillars. Each pillar must have a 'pillar' name, a 'description', and a list of 3-4 specific article 'topics'.
      **Important Formatting Rule:** Do not use any markdown formatting. All text in the JSON string values must be plain text. Do not use asterisks (*).

      Your output MUST conform to the provided JSON schema.
    `;

    try {
      console.log("--- Requesting SEO Strategy from Gemini with Schema ---");
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: seoSchema,
        },
      });
      const resultText = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (!resultText) {
        throw new Error("No SEO strategy data received from Gemini API");
      }

      console.log("SEO strategy data received successfully.");
      return resultText;

    } catch (error: any) {
      console.error("Failed to get SEO strategy data:", error.message);
      throw new Error(`Failed to get SEO strategy data from Gemini API. Error: ${error.message}`);
    }
  }
);

export const generateProcessMapWithAI = internalAction(
  async (
    _,
    { fullContext }: { fullContext: any }
  ) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set.");
    }
    const ai = new GoogleGenAI({ apiKey });

    const processMapSchema = {
      type: "OBJECT",
      properties: {
        processes: {
          type: "ARRAY",
          description: "An array of 3-4 key business or technical processes.",
          items: {
            type: "OBJECT",
            properties: {
              name: { type: "STRING", description: "The name of the process (e.g., 'New Customer Onboarding')." },
              description: { type: "STRING", description: "A brief description of the process goal." },
              automationPotential: { type: "STRING", enum: ["High", "Medium", "Low"], description: "An assessment of the overall automation potential for this process." },
              steps: {
                type: "ARRAY",
                description: "The sequence of steps in the process.",
                items: {
                  type: "OBJECT",
                  properties: {
                    step: { type: "NUMBER", description: "The step number in the sequence." },
                    action: { type: "STRING", description: "A description of the action taken in this step." },
                    automationType: { type: "STRING", enum: ["Manual", "Assisted", "Full"], description: "The type of automation possible for this step." },
                  },
                  required: ["step", "action", "automationType"],
                }
              }
            },
            required: ["name", "description", "automationPotential", "steps"],
          }
        }
      },
      required: ["processes"],
    };

    const prompt = `
      You are a senior business process analyst and automation expert.
      Based on the provided business context for a startup called "${fullContext.name}", identify 3-4 core processes and map them out for automation opportunities.

      **Business Context:**
      - **Official Startup Name:** ${fullContext.name}
      - **Business Plan Summary:** ${JSON.stringify(fullContext.businessPlan.executiveSummary, null, 2)}
      - **Development Roadmap Overview:** ${JSON.stringify(fullContext.developmentRoadmap, null, 2)}

      **Your Task:**
      Generate a JSON object that outlines a process automation map. The map must contain a "processes" array.

      **JSON Schema Requirements:**
      1.  For each process, provide a 'name', 'description', and an 'automationPotential' rating ('High', 'Medium', or 'Low').
      2.  For each process, detail the 'steps' in an array. Each step must have a 'step' number, an 'action' description, and an 'automationType' ('Manual', 'Assisted', or 'Full').
      3.  Identify processes from different areas of the business (e.g., customer-facing, marketing, technical operations, finance).
      **Important Formatting Rule:** Do not use any markdown formatting. All text in the JSON string values must be plain text. Do not use asterisks (*).

      Your output MUST conform to the provided JSON schema.
    `;

    try {
      console.log("--- Requesting Process Automation Map from Gemini with Schema ---");
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: processMapSchema,
        },
      });
      const resultText = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (!resultText) {
        throw new Error("No process map data received from Gemini API");
      }

      console.log("Process map data received successfully.");
      return resultText;

    } catch (error: any) {
      console.error("Failed to get process map data:", error.message);
      throw new Error(`Failed to get process map data from Gemini API. Error: ${error.message}`);
    }
  }
);

export const generateJobDescriptionsWithAI = internalAction(
  async (
    _,
    { fullContext }: { fullContext: any }
  ) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set.");
    }
    const ai = new GoogleGenAI({ apiKey });

    const jobDescriptionSchema = {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          title: { type: "STRING", description: "The job title (e.g., 'Lead Frontend Engineer')." },
          department: { type: "STRING", description: "The department for this role (e.g., 'Engineering', 'Marketing')." },
          summary: { type: "STRING", description: "A brief, engaging summary of the role." },
          responsibilities: { type: "ARRAY", items: { type: "STRING" }, description: "A list of 4-5 key responsibilities." },
          qualifications: { type: "ARRAY", items: { type: "STRING" }, description: "A list of 4-5 key qualifications and requirements." },
        },
        required: ["title", "department", "summary", "responsibilities", "qualifications"],
      }
    };

    const prompt = `
      You are a senior HR manager and technical recruiter for a fast-growing tech startup.
      Based on the provided business context for a startup called "${fullContext.name}", draft professional and appealing job descriptions for the key roles identified in the development roadmap.

      **Business Context:**
      - **Official Startup Name:** ${fullContext.name}
      - **Business Plan Summary:** ${fullContext.businessPlan.executiveSummary}
      - **Key Roles Identified:** ${JSON.stringify(fullContext.developmentRoadmap.roadmap[0].epics, null, 2)}

      **Your Task:**
      Generate a JSON object that contains an array of job descriptions for the 3 most critical roles based on the context (e.g., a lead developer, a product manager, a marketing lead).

      **JSON Schema Requirements:**
      1.  The root of the response must be a JSON array.
      2.  Each object in the array must represent a job description and contain 'title', 'department', 'summary', an array of 'responsibilities', and an array of 'qualifications'.
      **Important Formatting Rule:** Do not use any markdown formatting. All text in the JSON string values must be plain text. Do not use asterisks (*).

      Your output MUST conform to the provided JSON schema.
    `;

    try {
      console.log("--- Requesting Job Descriptions from Gemini with Schema ---");
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: jobDescriptionSchema,
        },
      });
      const resultText = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (!resultText) {
        throw new Error("No job description data received from Gemini API");
      }

      console.log("Job description data received successfully.");
      return resultText;

    } catch (error: any) {
      console.error("Failed to get job description data:", error.message);
      throw new Error(`Failed to get job description data from Gemini API. Error: ${error.message}`);
    }
  }
);

export const generateProductHuntKitWithAI = internalAction(
  async (
    _,
    { fullContext }: { fullContext: any }
  ) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set.");
    }
    const ai = new GoogleGenAI({ apiKey });

    const kitSchema = {
      type: "OBJECT",
      properties: {
        taglines: {
          type: "ARRAY",
          description: "An array of 3-5 short, catchy taglines for the Product Hunt title.",
          items: { type: "STRING" },
        },
        makersComment: {
          type: "OBJECT",
          description: "The maker's first comment, introducing the product and starting the conversation.",
          properties: {
            problem: { type: "STRING", description: "A relatable description of the problem being solved." },
            solution: { type: "STRING", description: "How your product solves this problem in a unique way." },
            callToAction: { type: "STRING", description: "An open-ended question to the community to spark engagement." },
          },
          required: ["problem", "solution", "callToAction"],
        },
        tweetSequence: {
          type: "ARRAY",
          description: "A sequence of 3 tweets for launch day.",
          items: {
            type: "OBJECT",
            properties: {
              time: { type: "STRING", description: "When to post this tweet (e.g., 'Morning - Launch Time!', 'Afternoon Update', 'Final Hours')." },
              content: { type: "STRING", description: "The content of the tweet. Must include the placeholder [PH_LINK] and relevant hashtags." },
            },
            required: ["time", "content"],
          },
        },
        visualAssetIdeas: {
          type: "ARRAY",
          description: "A list of 3 creative, detailed ideas for images or GIFs.",
          items: {
            type: "OBJECT",
            properties: {
              idea: { type: "STRING", description: "The core concept of the visual." },
              description: { type: "STRING", description: "A detailed description of what the visual should look like, including any text overlays." },
            },
            required: ["idea", "description"],
          },
        },
        announcementEmail: {
          type: "OBJECT",
          description: "An email to send to subscribers announcing the launch.",
          properties: {
            subject: { type: "STRING", description: "A compelling subject line for the email." },
            body: { type: "STRING", description: "The full body of the email, written in a personal and exciting tone. Use markdown for formatting." },
          },
          required: ["subject", "body"],
        },
        linkedinPost: {
          type: "STRING",
          description: "A professional post for LinkedIn to announce the launch and explain the product's value proposition.",
        },
        thankYouTweet: {
          type: "STRING",
          description: "A pre-written tweet to thank the community for their support after the launch is over.",
        },
      },
      required: ["taglines", "makersComment", "tweetSequence", "visualAssetIdeas", "announcementEmail", "linkedinPost", "thankYouTweet"],
    };

    const prompt = `
      You are a Product Hunt launch expert and marketing guru. You have helped dozens of products reach #1 Product of the Day.
      You are tasked with creating a comprehensive, detailed launch kit for a new startup based on its core data.

      **Startup Data Package:**
      - **Name:** ${fullContext.name}
      - **Idea:** ${fullContext.idea}
      - **Business Plan Summary:** ${fullContext.businessPlan.executiveSummary}
      - **Key Features:** ${fullContext.businessPlan.productsAndServices.keyFeatures.join(", ")}
      - **Brand Slogan:** ${fullContext.brandIdentity.slogan}
      - **Mission:** ${fullContext.missionVision.mission}
      - **Key Marketing Tagline:** ${fullContext.marketingCopy.taglines[0]}

      **Your Task:**
      Generate a JSON object containing a rich set of assets for a successful Product Hunt launch. Be creative, detailed, and strategic.

      **JSON Schema Requirements:**
      1.  **taglines**: Generate 3-5 diverse and catchy tagline options for the Product Hunt title.
      2.  **makersComment**: Create the crucial first comment. Structure it with a relatable 'problem', a clear 'solution', and an engaging 'callToAction' question.
      3.  **tweetSequence**: Write a sequence of exactly 3 tweets for launch day: one for the morning launch, one for the afternoon, and one for the final hours. Each must include the placeholder [PH_LINK] and relevant hashtags.
      4.  **visualAssetIdeas**: Generate 3 distinct and creative ideas for visuals (images/GIFs). For each, provide a core 'idea' and a detailed 'description' of what it should look like.
      5.  **announcementEmail**: Write a complete launch announcement email for subscribers, with a strong 'subject' and a personal, exciting 'body'.
      6.  **linkedinPost**: Write a professional and insightful post for LinkedIn.
      7.  **thankYouTweet**: Write a sincere thank you tweet for after the launch.

      Your output MUST conform to the provided JSON schema.
    `;

    try {
      console.log("--- Requesting Expanded Product Hunt Launch Kit from Gemini with Schema ---");
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: kitSchema,
        },
      });
      const resultText = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (!resultText) {
        throw new Error("No Product Hunt kit data received from Gemini API");
      }

      console.log("Expanded Product Hunt kit data received successfully.");
      return resultText;

    } catch (error: any) {
      console.error("Failed to get Product Hunt kit data:", error.message);
      throw new Error(`Failed to get Product Hunt kit data from Gemini API. Error: ${error.message}`);
    }
  }
);

export const generatePressReleaseWithAI = internalAction(
  async (
    _,
    { fullContext }: { fullContext: any }
  ) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set.");
    }
    const ai = new GoogleGenAI({ apiKey });

    const pressReleaseSchema = {
      type: "OBJECT",
      properties: {
        headline: { type: "STRING", description: "A compelling, attention-grabbing headline for the press release." },
        dateline: { type: "STRING", description: "The city, state, and date of the release (e.g., 'SAN FRANCISCO, CA – September 28, 2025')." },
        introduction: { type: "STRING", description: "A summary of the announcement (the who, what, when, where, why)." },
        body: { type: "STRING", description: "Detailed paragraphs about the product, the problem it solves, and its features." },
        quote: { type: "STRING", description: "An insightful quote from the founder/CEO." },
        aboutUs: { type: "STRING", description: "A standard boilerplate about the company, using its mission and vision." },
        contactEmail: { type: "STRING", description: "A placeholder contact email, like 'press@yourcompany.com'." },
      },
      required: ["headline", "dateline", "introduction", "body", "quote", "aboutUs", "contactEmail"],
    };

    const prompt = `
      You are a professional public relations (PR) executive specializing in tech startups.
      You are tasked with drafting a professional and effective press release for a new product launch.

      **Startup Data Package:**
      - **Company Name:** ${fullContext.name}
      - **Product Idea:** ${fullContext.idea}
      - **Executive Summary:** ${fullContext.businessPlan.executiveSummary}
      - **Company Mission:** ${fullContext.businessPlan.companyDescription.mission}
      - **Founder/CEO Name:** ${fullContext.brandIdentity.names[0]} (use the first name suggestion as the founder's name)

      **Your Task:**
      Generate a JSON object containing the structured content for a press release.

      **JSON Schema Requirements:**
      1.  **headline**: Create a powerful and concise headline.
      2.  **dateline**: Use the current date and a major tech hub city (e.g., San Francisco, CA).
      3.  **introduction**: Write a strong opening paragraph that summarizes the key announcement.
      4.  **body**: Elaborate on the product, its value, and the problem it solves. Keep it to 2-3 paragraphs.
      5.  **quote**: Write a compelling and human-sounding quote attributed to the founder name provided.
      6.  **aboutUs**: Write a standard, professional 'About [Company Name]' boilerplate.
      7.  **contactEmail**: Provide a placeholder press contact email.

      Your output MUST conform to the provided JSON schema.
    `;

    try {
      console.log("--- Requesting Press Release from Gemini with Schema ---");
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: pressReleaseSchema,
        },
      });
      const resultText = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (!resultText) {
        throw new Error("No press release data received from Gemini API");
      }

      console.log("Press release data received successfully.");
      return resultText;

    } catch (error: any) {
      console.error("Failed to get press release data:", error.message);
      throw new Error(`Failed to get press release data from Gemini API. Error: ${error.message}`);
    }
  }
);

export const generateInvestorSearchQueries = internalAction(
  async (
    _,
    { fullContext }: { fullContext: any }
  ) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set.");
    }
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
      You are an AI assistant for a startup founder. Your task is to generate 3 highly specific Google
search queries to find potential investors.
      The startup is called "${fullContext.name}".
      It is in the "${fullContext.businessPlan.marketAnalysis.industryOverview}" industry.
      The core idea is: "${fullContext.businessPlan.executiveSummary}".

      Based on this, generate a JSON object containing an array of 3 search query strings. The queries
should be tailored to find venture capital firms or angel investors relevant to the startup's industry,
stage, and model.

      Example queries: "early stage SaaS VC firms", "angel investors interested in AI-powered developer
tools", "seed funding for consumer hardware startups".

      Return a JSON object with a single key "queries" which is an array of strings.
      { "queries": ["query 1", "query 2", "query 3"] }
    `;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
        },
      });
      const resultText = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (!resultText) {
        throw new Error("No search queries received from Gemini API");
      }
      return JSON.parse(resultText);
    } catch (error: any) {
      throw new Error(`Failed to generate investor search queries. Error: ${error.message}`);
    }
  }
);

export const findInvestorsWithAI = internalAction(
  async (
    _,
    { fullContext, scrapedData }: { fullContext: any, scrapedData: any[] }
  ) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set.");
    }
    const ai = new GoogleGenAI({ apiKey });

    const investorSchema = {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          name: { type: "STRING", description: "Name of the individual investor or firm." },
          firmOrType: { type: "STRING", description: "The name of the VC firm, or 'Angel Investor'." },
          investmentFocus: { 
            type: "ARRAY", 
            items: { type: "STRING" }, 
            description: "A list of their key investment areas (e.g., 'SaaS', 'Fintech', 'AI')." 
          },
          matchRationale: { 
            type: "STRING", 
            description: "A concise, 1-2 sentence explanation of why this investor is a strong match for the startup." 
          },
          profileUrl: { type: "STRING", description: "The source URL where the information was found." },
        },
        required: ["name", "firmOrType", "investmentFocus", "matchRationale", "profileUrl"],
      }
    };

    const contentString = scrapedData.map(page => `--- Source URL: ${page.metadata.sourceURL}
---\n\n${page.markdown}`).join("\n\n");

    const prompt = `
      You are a top-tier venture capital analyst. You have been given a profile of a startup and a large
amount of text scraped from the web about potential investors.
      Your task is to analyze all the scraped text and identify the 3-5 best investor matches for the
startup.

      Startup Profile:
      - Name: "${fullContext.name}"
      - Industry: "${fullContext.businessPlan.marketAnalysis.industryOverview}"
      - Summary: "${fullContext.businessPlan.executiveSummary}"

      Scraped Data from Investor Websites/Profiles:
      ${contentString}

      Your Task:
      Carefully read through all the scraped data. Identify 3-5 individual investors or VC firms that are
the best fit. For each match, extract the required information and provide a strong, evidence-based
rationale for why they are a good match.

      Your output MUST be a JSON array of objects that conforms to the provided schema.
    `;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: investorSchema,
        },
      });
      const resultText = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (!resultText) {
        throw new Error("No investor matches received from Gemini API");
      }
      return resultText;
    } catch (error: any) {
      throw new Error(`Failed to find investors from scraped data. Error: ${error.message}`);
    }
  }
);