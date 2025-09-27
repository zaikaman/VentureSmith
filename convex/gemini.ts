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
      You are a top-tier business strategist drafting a comprehensive business plan.
      Analyze the provided startup data and generate the 7-part business plan.
      
      **Startup Data Package:**
      ${JSON.stringify(fullContext, null, 2)}

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
      You are a startup pitch expert (like a Y Combinator partner) creating a pitch deck.
      You have the complete data package for a new venture.

      **Startup Data Package:**
      ${JSON.stringify(fullContext, null, 2)}

      Based on this **entire** data package, generate a full Pitch Deck including:
      1.  A 1-minute voice pitch script.
      2.  A slide deck of 8-10 slides covering: Problem, Solution, Market, Product, Business Model, Competition, Team, Financials, and Call to Action.

      Your output MUST conform to the provided JSON schema. Ensure all strings, especially the 'content' field with markdown, are properly escaped.
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
    { refinedIdea, marketPulse }: { refinedIdea: string, marketPulse: any }
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
    { marketResearchSummary }: { marketResearchSummary: string }
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
      You are a strategic analyst. You have been provided with a market research summary.
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
      ${JSON.stringify(fullContext, null, 2)}

      Based on the **entire** data package (idea, market, mission, brand), generate 4 distinct customer personas that would be the most likely early adopters and champions of this product.
      For each persona, provide the details as specified in the schema. Make the details specific and actionable.

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

