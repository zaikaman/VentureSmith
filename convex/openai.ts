import { internal } from "./_generated/api";
import { action, internalAction } from "./_generated/server";
import OpenAI from "openai";
import { v } from "convex/values";

// OpenAI Client Initialization
const openAiApiKey = process.env.OPENAI_API_KEY;
if (!openAiApiKey) {
  throw new Error("OPENAI_API_KEY is not set in environment variables.");
}
const openai = new OpenAI({
  apiKey: openAiApiKey,
  baseURL: process.env.BASE_URL,
});

const openAIModel = "gpt-5-nano";

// Helper function for OpenAI chat completions
async function getOpenAIChatCompletion(prompt: string, isJson: boolean, model?: string) {
  try {
    const completion = await openai.chat.completions.create({
      model: model || openAIModel,
      messages: [{ role: "user", content: prompt }],
      response_format: isJson ? { type: "json_object" } : { type: "text" },
    });
    const resultText = completion.choices[0]?.message?.content?.trim();
    if (!resultText) {
      throw new Error("No content received from OpenAI API");
    }
    return isJson ? JSON.parse(resultText) : resultText;
  } catch (error: any) {
    console.error(`Failed to get completion from OpenAI. Error: ${error.message}`);
    throw new Error(`Failed to get completion from OpenAI. Error: ${error.message}`);
  }
}

export const summarizeMarketContent = internalAction(
  async (
    { runAction }, 
    { scrapedContent }: { scrapedContent: { url: string, markdown: string, title: string }[] }
  ) => {
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

    console.log("--- Requesting Market Summary from OpenAI ---");
    const summary = await getOpenAIChatCompletion(prompt, false, "gpt-4.1-nano");
    console.log("Market summary received successfully.");
    return summary;
  }
);

export const validateProblemWithAI = internalAction(
  async (
    _,
    { startupName, startupDescription }: { startupName: string, startupDescription: string }
  ) => {
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
      Your output MUST be a valid JSON array.
    `;

    console.log("--- Requesting Customer Validation from OpenAI ---");
    const validationData = await getOpenAIChatCompletion(prompt, true);
    console.log("Customer validation data received successfully.");
    return validationData;
  }
);

export const brainstormIdeaWithAI = internalAction(
  async (
    _,
    { idea }: { idea: string }
  ) => {
    const prompt = `
      You are an expert startup consultant and creative thinker.
      You have been given a raw startup idea. Your task is to brainstorm and refine it.

      Initial Idea: "${idea}"

      **Your Task:**
      Generate a JSON object containing a brainstormed and refined analysis of the initial idea.

      **CRITICAL INSTRUCTIONS:**
      1. Your output MUST be a single, valid JSON object.
      2. The root of the JSON object must be a key named "brainstorm".
      3. The value of "brainstorm" must be an object containing the analysis.
      4. Do not use any markdown formatting in the JSON string values. All text must be plain text.

      **JSON Schema:**
      Your output must conform to the following JSON schema:
      {
        "brainstorm": {
          "refinedIdea": "string",
          "keyFeatures": ["string"],
          "potentialAngles": ["string"],
          "initialConcerns": ["string"],
          "competitiveAdvantage": ["string"]
        }
      }

      Now, generate the JSON object.
    `;

    console.log("--- Requesting Idea Brainstorm from OpenAI ---");
    const brainstormData = await getOpenAIChatCompletion(prompt, true);
    console.log("Brainstorm data received successfully.");
    return brainstormData;
  }
);

export const generateScorecardWithAI = internalAction(
  async (
    _,
    { fullContext }: { fullContext: any }
  ) => {
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

      **Your Task:**
      Based on the **entire** data package, generate a single JSON object containing a scorecard rating the idea on three core metrics and providing an overall score.

      **CRITICAL INSTRUCTIONS:**
      1. Your output MUST be a single, valid JSON object.
      2. For each metric, provide a score from 0-100.
      3. The weighted **Overall Score** should be calculated as (40% Market, 30% Feasibility, 30% Innovation).
      4. Do not use any markdown formatting in the JSON string values. All text must be plain text.

      **JSON Schema:**
      Your output must conform to the following JSON schema:
      {
        "marketSize": {
          "score": "number",
          "justification": "string"
        },
        "feasibility": {
          "score": "number",
          "justification": "string"
        },
        "innovation": {
          "score": "number",
          "justification": "string"
        },
        "overallScore": "number"
      }

      Now, generate the JSON object.
    `;

    console.log("--- Requesting Scorecard from OpenAI ---");
    const scorecardData = await getOpenAIChatCompletion(prompt, true);
    console.log("Scorecard data received successfully.");
    return scorecardData;
  }
);

export const generateBusinessPlanWithAI = internalAction(
  async (
    _,
    { fullContext }: { fullContext: any }
  ) => {
    const prompt = `
      You are a top-tier business strategist drafting a comprehensive business plan for a startup named "${fullContext.name}".
      Analyze the provided startup data and generate the 7-part business plan.
      
      **Startup Data Package:**
      - **Official Startup Name:** ${fullContext.name}
      - **Refined Idea:** ${fullContext.refinedIdea}
      - **Market Pulse:** ${JSON.stringify(fullContext.marketPulse, null, 2)}
      - **Mission/Vision:** ${JSON.stringify(fullContext.missionVision, null, 2)}
      - **Branding Options:** ${JSON.stringify(fullContext.brandIdentity, null, 2)}

      **Your Task:**
      Generate a single, valid JSON object representing the complete business plan.

      **CRITICAL INSTRUCTIONS:**
      1. The official name of the startup is "${fullContext.name}". You MUST use this name when referring to the company.
      2. Your output MUST be a single, valid JSON object.
      3. The financial forecast MUST cover the 6-year period from 2025 to 2030 inclusive.
      4. Do not use any markdown formatting in the JSON string values. All text must be plain text. Do not use asterisks (*).

      **JSON Schema:**
      Your output must conform to the following JSON schema:
      {
        "executiveSummary": "string",
        "companyDescription": {
          "description": "string",
          "mission": "string",
          "vision": "string",
          "coreValues": ["string"]
        },
        "productsAndServices": {
          "description": "string",
          "keyFeatures": ["string"],
          "uniqueValueProposition": "string"
        },
        "marketAnalysis": {
          "industryOverview": "string",
          "targetMarket": "string",
          "competitiveLandscape": "string"
        },
        "marketingAndSalesStrategy": {
          "digitalMarketingStrategy": ["string"],
          "salesFunnel": ["string"]
        },
        "organizationAndManagement": {
          "teamStructure": "string",
          "keyRoles": [
            {
              "role": "string",
              "responsibilities": "string"
            }
          ]
        },
        "financialProjections": {
          "summary": "string",
          "forecast": [
            { "year": 2025, "revenue": "string", "cogs": "string", "netProfit": "string" },
            { "year": 2026, "revenue": "string", "cogs": "string", "netProfit": "string" },
            { "year": 2027, "revenue": "string", "cogs": "string", "netProfit": "string" },
            { "year": 2028, "revenue": "string", "cogs": "string", "netProfit": "string" },
            { "year": 2029, "revenue": "string", "cogs": "string", "netProfit": "string" },
            { "year": 2030, "revenue": "string", "cogs": "string", "netProfit": "string" }
          ]
        }
      }

      Now, generate the JSON object.
    `;

    console.log("--- Requesting Business Plan from OpenAI ---");
    const businessPlanData = await getOpenAIChatCompletion(prompt, true);
    console.log("Business plan data received successfully.");
    return businessPlanData;
  }
);

export const generatePitchDeckWithAI = internalAction(
  async (
    _,
    { fullContext }: { fullContext: any }
  ) => {
    const prompt = `
      You are a startup pitch expert (like a Y Combinator partner) creating a pitch deck for a startup named "${fullContext.name}".
      You have the complete data package for the new venture.

      **Startup Data Package:**
      - **Official Startup Name:** ${fullContext.name}
      - **Refined Idea:** ${fullContext.refinedIdea}
      - **Market Pulse:** ${JSON.stringify(fullContext.marketPulse, null, 2)}
      - **Mission/Vision:** ${JSON.stringify(fullContext.missionVision, null, 2)}
      - **Branding Options:** ${JSON.stringify(fullContext.brandIdentity, null, 2)}

      **Your Task:**
      Based on this **entire** data package, generate a single JSON object containing a full Pitch Deck, including a 1-minute voice pitch script and 8-10 slides.

      **CRITICAL INSTRUCTIONS:**
      1. The official name of the startup is "${fullContext.name}". You MUST use this name when referring to the company.
      2. Your output MUST be a single, valid JSON object.
      3. Do not use any markdown formatting in the JSON string values. All text must be plain text. Do not use asterisks (*).

      **JSON Schema:**
      Your output must conform to the following JSON schema:
      {
        "script": "string (A 1-minute voice pitch script)",
        "slides": [
          {
            "title": "string",
            "content": "string (Slide content. Use \n for newlines.)"
          }
        ]
      }

      Now, generate the JSON object.
    `;

    console.log("--- Requesting Pitch Deck from OpenAI ---");
    const pitchDeckData = await getOpenAIChatCompletion(prompt, true);
    console.log("Pitch deck data received successfully.");
    return pitchDeckData;
  }
);

export const getMarketPulseWithAI = internalAction(
  async (
    _,
    { idea }: { idea: string }
  ) => {
    const prompt = `
      You are a sharp and fast market analyst providing a quick "pulse check" on a startup idea.
      Based on the idea, provide a high-level analysis.

      Initial Idea: "${idea}"

      **Your Task:**
      Generate a single JSON object containing a high-level market analysis.

      **CRITICAL INSTRUCTIONS:**
      1. Your output MUST be a single, valid JSON object.
      2. Provide scores from 0 to 100 for demand, competition, and growth potential.
      3. Do not use any markdown formatting in the JSON string values. All text must be plain text.

      **JSON Schema:**
      Your output must conform to the following JSON schema:
      {
        "marketDemand": "number",
        "competitionLevel": "number",
        "growthPotential": "number",
        "relatedKeywords": ["string"],
        "summary": "string"
      }

      Now, generate the JSON object.
    `;

    console.log("--- Requesting Market Pulse from OpenAI ---");
    const marketPulseData = await getOpenAIChatCompletion(prompt, true);
    console.log("Market pulse data received successfully.");
    return marketPulseData;
  }
);

export const defineMissionVisionWithAI = internalAction(
  async (
    _,
    { name, refinedIdea, marketPulse }: { name: string, refinedIdea: string, marketPulse: any }
  ) => {
    const prompt = `
      You are a world-class brand strategist and storyteller, an expert at distilling complex ideas into powerful, resonant messages.
      You are tasked with creating the foundational "Genesis Block" for a new startup: its Mission and Vision.

      Here is the core data:
      - **Startup Name:** "${name}"
      - **Refined Idea:** "${refinedIdea}"
      - **Market Pulse Analysis:** ${JSON.stringify(marketPulse, null, 2)}

      **Your Task:**
      Based on this data, generate a single JSON object containing the Mission and Vision statements.

      **CRITICAL INSTRUCTIONS:**
      1. Your output MUST be a single, valid JSON object.
      2. The mission should explain the company's core purpose (the "why").
      3. The vision should describe the future the company aims to create (the "where").
      4. Do not use any markdown formatting in the JSON string values. All text must be plain text.

      **JSON Schema:**
      Your output must conform to the following JSON schema:
      {
        "mission": "string",
        "vision": "string"
      }

      Now, generate the JSON object.
    `;

    console.log("--- Requesting Mission & Vision from OpenAI ---");
    const missionVisionData = await getOpenAIChatCompletion(prompt, true);
    console.log("Mission/Vision data received successfully.");
    return missionVisionData;
  }
);

export const generateBrandIdentityWithAI = internalAction(
  async (
    _,
    { refinedIdea, keywords, mission, vision }: { refinedIdea: string, keywords: string[], mission: string, vision: string }
  ) => {
    const prompt = `
      You are a world-class branding expert (think David Aaker, Marty Neumeier).
      You are tasked with forging a brand identity for a new startup.

      Here is the core DNA of the venture:
      - **Refined Idea:** "${refinedIdea}"
      - **Core Keywords:** ${keywords.join(", ")}
      - **Mission (The Why):** "${mission}"
      - **Vision (The Where):** "${vision}"

      **Your Task:**
      Based on this complete context, generate a single JSON object containing 5 business name suggestions and one slogan.

      **CRITICAL INSTRUCTIONS:**
      1. Your output MUST be a single, valid JSON object.
      2. The names should be diverse in style (e.g., evocative, descriptive, abstract, modern, classic).
      3. Do not use any markdown formatting in the JSON string values. All text must be plain text.

      **JSON Schema:**
      Your output must conform to the following JSON schema:
      {
        "names": ["string"],
        "slogan": "string"
      }

      Now, generate the JSON object.
    `;

    console.log("--- Requesting Brand Identity from OpenAI ---");
    const brandIdentityData = await getOpenAIChatCompletion(prompt, true);
    console.log("Brand Identity data received successfully.");
    return brandIdentityData;
  }
);

export const generateCompetitorMatrixWithAI = internalAction(
  async (
    _,
    { startupName, marketResearchSummary }: { startupName: string, marketResearchSummary: string }
  ) => {
    const prompt = `
      You are a strategic analyst. You have been provided with a market research summary for a startup called "${startupName}".
      Your task is to extract the information about competitors and structure it into a competitor landscape matrix.

      **Market Research Summary:**
      ${marketResearchSummary}

      **Your Task:**
      Based on the summary, identify 3-4 key competitors and generate a JSON object containing a matrix of these competitors.

      **CRITICAL INSTRUCTIONS:**
      1. Your output MUST be a single, valid JSON object.
      2. The root of the JSON object must be a key named "matrix".
      3. The value of "matrix" must be an array of 3-4 competitor objects.
      4. Do not use any markdown formatting in the JSON string values. All text must be plain text.

      **JSON Schema:**
      Your output must conform to the following JSON schema:
      {
        "matrix": [
          {
            "competitor": "string",
            "keyFeatures": "string",
            "targetAudience": "string",
            "strengths": "string",
            "weaknesses": "string"
          }
        ]
      }

      Now, generate the JSON object.
    `;

    console.log("--- Requesting Competitor Matrix from OpenAI ---");
    const competitorMatrixData = await getOpenAIChatCompletion(prompt, true);
    console.log("Competitor matrix data received successfully.");
    return competitorMatrixData;
  }
);

export const generateCustomerPersonasWithAI = internalAction(
  async (
    _,
    { fullContext }: { fullContext: any }
  ) => {
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

      **Your Task:**
      Based on the **entire** data package, generate a JSON object containing 4 distinct customer personas that would be the most likely early adopters and champions of this product.

      **CRITICAL INSTRUCTIONS:**
      1. Your output MUST be a single, valid JSON object.
      2. The root of the JSON object must be a key named "personas".
      3. The value of "personas" must be an array of exactly 4 persona objects.
      4. You must generate exactly 2 male and 2 female personas.
      5. For each persona, provide the details as specified in the schema, including their gender ('male' or 'female'). Make the details specific and actionable.
      6. Do not use any markdown formatting in the JSON string values. All text must be plain text.

      **JSON Schema:**
      Your output must conform to the following JSON schema:
      {
        "personas": [
          {
            "name": "string",
            "avatar": "string (single emoji)",
            "demographics": {
              "age": "number",
              "occupation": "string",
              "location": "string"
            },
            "gender": "string (must be 'male' or 'female')",
            "goals": ["string"],
            "painPoints": ["string"],
            "motivations": ["string"]
          }
        ]
      }

      Now, generate the JSON object.
    `;

    console.log("--- Requesting Customer Personas from OpenAI ---");
    const customerPersonasData = await getOpenAIChatCompletion(prompt, true);
    console.log("Customer persona data received successfully.");
    return customerPersonasData;
  }
);

export const generateInterviewScriptsWithAI = internalAction(
  async (
    _,
    { startupName, refinedIdea, personas }: { startupName: string, refinedIdea: string, personas: any }
  ) => {
    const prompt = `
      You are a professional UX researcher creating scripts for customer interviews.
      Your goal is to validate the problems and proposed solution for a new startup called "${startupName}".

      **Startup Idea:** "${refinedIdea}"

      **Target Personas:**
      ${JSON.stringify(personas, null, 2)}

      **Your Task:**
      Based on the startup idea and the specific personas provided, generate a JSON object containing a detailed interview script for EACH persona.

      **CRITICAL INSTRUCTIONS:**
      1. Your output MUST be a single, valid JSON object.
      2. The root of the JSON object must be a key named "scripts".
      3. The value of "scripts" must be an array of script objects, one for each persona.
      4. The questions should be open-ended and designed to elicit detailed stories and feedback, not just yes/no answers.
      5. Do not use any markdown formatting in the JSON string values. All text must be plain text.

      **JSON Schema:**
      Your output must conform to the following JSON schema:
      {
        "scripts": [
          {
            "personaName": "string",
            "introduction": ["string"],
            "problemDiscovery": ["string"],
            "solutionValidation": ["string"],
            "wrapUp": ["string"]
          }
        ]
      }

      Now, generate the JSON object.
    `;

    console.log("--- Requesting Interview Scripts from OpenAI ---");
    const interviewScriptsData = await getOpenAIChatCompletion(prompt, true);
    console.log("Interview script data received successfully.");
    return interviewScriptsData;
  }
);

export const runInterviewSimulationsWithAI = internalAction(
  async (
    _,
    { fullContext }: { fullContext: any }
  ) => {
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

      **CRITICAL INSTRUCTION:** The official name of the startup is "${fullContext.name}". You MUST use this name when referring to the company.

      **Your Task:**
      Carefully review the ENTIRE data package. Then, for EACH of the 4 personas listed, provide their simulated feedback on the startup concept.
      The personas to simulate are: ${fullContext.customerPersonas.personas.map((p: any) => p.name).join(", ")}.

      **CRITICAL INSTRUCTIONS:**
      1. Your output MUST be a single, valid JSON object.
      2. The root of the JSON object must be a key named "simulations".
      3. The value of "simulations" must be an array of simulation objects, one for each persona.
      4. Do not use any markdown formatting in the JSON string values. All text must be plain text.

      **JSON Schema:**
      Your output must conform to the following JSON schema:
      {
        "simulations": [
          {
            "personaName": "string",
            "keyPositiveFeedback": ["string"],
            "criticalConcerns": ["string"],
            "unansweredQuestions": ["string"]
          }
        ]
      }

      Now, generate the JSON object.
    `;

    console.log("--- Requesting Interview Simulations from OpenAI ---");
    const simulationData = await getOpenAIChatCompletion(prompt, true);
    console.log("Simulation data received successfully.");
    return simulationData;
  }
);

export const getMentorFeedbackWithAI = internalAction(
  async (
    _,
    { fullContext }: { fullContext: any }
  ) => {
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

      **CRITICAL INSTRUCTION:** The official name of the startup is "${fullContext.name}".

      **Your Task:**
      Provide a brutally honest, sharp, and insightful critique of this venture as a JSON object.

      **CRITICAL INSTRUCTIONS:**
      1. Your output MUST be a single, valid JSON object.
      2. Structure your feedback into three sections: Strengths, Weaknesses, and Suggestions.
      3. Do not use any markdown formatting in the JSON string values. All text must be plain text.

      **JSON Schema:**
      Your output must conform to the following JSON schema:
      {
        "strengths": ["string"],
        "weaknesses": ["string"],
        "suggestions": ["string"]
      }

      Now, generate the JSON object.
    `;

    console.log("--- Requesting Mentor Feedback from OpenAI ---");
    const mentorFeedbackData = await getOpenAIChatCompletion(prompt, true);
    console.log("Mentor feedback data received successfully.");
    return mentorFeedbackData;
  }
);

export const generateUserFlowWithAI = internalAction(
  async (
    _,
    { fullContext }: { fullContext: any }
  ) => {
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

      Your output MUST be a valid JSON object for React Flow with 'nodes' and 'edges' arrays.
    `;

    console.log("--- Requesting User Flow Diagram from OpenAI ---");
    const userFlowData = await getOpenAIChatCompletion(prompt, true);
    console.log("User flow data received successfully.");
    return userFlowData;
  }
);

export const generateAIWireframeWithAI = internalAction(
  async (
    _,
    { fullContext }: { fullContext: any }
  ) => {
    const prompt = `
      You are a skilled UX/UI designer specializing in rapid, low-fidelity wireframing using React.
      You are tasked with creating a clean, simple wireframe component for a startup's main landing page based on its core data.

      **Startup Data Package:**
      ${JSON.stringify(fullContext, null, 2)}

      **Your Task:**
      Generate a single, self-contained React component named 'WireframeComponent' as a JSON object.

      **CRITICAL INSTRUCTIONS:**
      1. Your output MUST be a single, valid JSON object.
      2. The root of the JSON object must be a key named "code".
      3. The value of "code" must be a string containing the React component.
      4. The component must use inline style objects for all styling and contain no import/export statements.
      5. The wireframe must include placeholders for a nav bar, hero section, three feature boxes, and a footer.
      6. Use placeholder text but include the actual startup name from the context data.

      **JSON Schema:**
      Your output must conform to the following JSON schema:
      {
        "code": "string (React component code)"
      }

      Now, generate the JSON object.
    `;

    console.log("--- Requesting AI Wireframe from OpenAI ---");
    const wireframeData = await getOpenAIChatCompletion(prompt, true);
    console.log("AI Wireframe data received successfully.");
    return wireframeData;
  }
);

export const generateWebsitePrototypeWithAI = internalAction(
  async (
    _,
    { fullContext }: { fullContext: any }
  ) => {
    const prompt = `
      You are a senior frontend developer tasked with building a beautiful, modern, and complete landing page for a new startup.
      You will be given the full context of the startup and must generate a single, self-contained React component.

      **Startup Data Package:**
      ${JSON.stringify(fullContext, null, 2)}

      **Your Task:**
      Generate a single, self-contained React component named 'LandingPageComponent'. This is a fully designed prototype, not just a wireframe.

      **Requirements:**
      1.  **Format:** A single React component. Use inline style objects for all styling. Do not use CSS classes.
      2.  **No Modules:** Do NOT include any 
import
 or 
export
 statements.
      3.  **Styling:** Use a professional and aesthetically pleasing color palette. Use a modern, clean font. Ensure proper spacing and layout. This should look like a real, polished website.
      4.  **Structure:** The component must include:
          - A navigation bar with the startup's name.
          - A compelling hero section with a strong headline, a sub-headline, and a primary call-to-action (CTA) button.
          - A 'Features' section highlighting 3 key features from the data package. Each feature should have an icon (use a relevant emoji), a title, and a brief description.
          - A 'Testimonials' section with 2-3 sample testimonials. Each testimonial should include a quote, an author name, and their title.
          - A final CTA section with a headline and another button.
          - A simple footer with the company name and copyright.
      5.  **Content:** Use the actual startup name, slogan, features, and other relevant information from the provided data package. Make the copy engaging and persuasive.

      Your output MUST be a valid JSON object with a 'code' field containing the React component as a string.
    `;

    console.log("--- Requesting Website Prototype from OpenAI ---");
    const prototypeData = await getOpenAIChatCompletion(prompt, true);
    console.log("Website prototype data received successfully.");
    return prototypeData;
  }
);

export const generateTechStackWithAI = internalAction(
  async (
    _,
    { fullContext }: { fullContext: any }
  ) => {
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
      Based on the **entire** data package, generate a JSON object recommending a technology stack.

      **CRITICAL INSTRUCTIONS:**
      1. Your output MUST be a single, valid JSON object.
      2. The root of the JSON object must be a key named "stack".
      3. The value of "stack" must be an array of objects, with each object representing a category ('Frontend', 'Backend', 'Database', 'Deployment').
      4. For each category, recommend exactly 2 primary technologies.
      5. Do not use any markdown formatting in the JSON string values. All text must be plain text.

      **JSON Schema:**
      Your output must conform to the following JSON schema:
      {
        "stack": [
          {
            "category": "string",
            "technologies": [
              {
                "name": "string",
                "justification": "string"
              }
            ]
          }
        ]
      }

      Now, generate the JSON object.
    `;

    console.log("--- Requesting Tech Stack from OpenAI ---");
    const techStackData = await getOpenAIChatCompletion(prompt, true);
    console.log("Tech stack data received successfully.");
    return techStackData;
  }
);

export const generateDatabaseSchema = internalAction(
  async (
    _,
    { fullContext }: { fullContext: any }
  ) => {
    const prompt = `
      You are a senior database architect creating a visual schema for a new application called "${fullContext.name}".
      Based on the provided application context, generate a database schema as a JSON object suitable for the React Flow library.

      **Startup Context:**
      - **Official Startup Name:** ${fullContext.name}
      - **Core Idea & Features:** ${JSON.stringify(fullContext.brainstormResult, null, 2)}
      - **Primary User Flow:** ${JSON.stringify(fullContext.userFlowDiagram, null, 2)}

      **Your Task:**
      Generate a JSON object containing 'nodes' and 'edges' to represent the database schema for React Flow.

      **CRITICAL INSTRUCTIONS:**
      1. Your output MUST be a single, valid JSON object.
      2. Each node is a table. The 'data.label' should be a multi-line string with the full table definition (name, columns, types, PK/FK).
      3. Each edge is a relationship between tables, with a label like '1-to-many'.
      4. Arrange nodes logically with x/y positions.
      5. Do not use any markdown formatting in the JSON string values. All text must be plain text.

      **JSON Schema:**
      Your output must conform to the following JSON schema for React Flow:
      {
        "nodes": [
          {
            "id": "string",
            "position": { "x": "number", "y": "number" },
            "data": { "label": "string" },
            "type": "string (optional)"
          }
        ],
        "edges": [
          {
            "id": "string",
            "source": "string (node id)",
            "target": "string (node id)",
            "label": "string (e.g., '1-to-many')"
          }
        ]
      }

      Now, generate the JSON object.
    `;

    console.log("--- Requesting Database Schema (React Flow format) from OpenAI ---");
    const schemaData = await getOpenAIChatCompletion(prompt, true);
    console.log("Database Schema data received successfully.");
    return schemaData;
  }
);

export const generateApiEndpointsWithAI = internalAction(
  async (
    _,
    { fullContext }: { fullContext: any }
  ) => {
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
      3.  **Clarity:** The endpoint paths should be clear and follow RESTful conventions (e.g., 
/api/v1/users
, 
/api/v1/users/{userId}
).
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

    console.log("--- Requesting API Endpoints from OpenAI ---");
    const apiEndpointsData = await getOpenAIChatCompletion(prompt, false);
    console.log("API endpoint data received successfully.");
    return apiEndpointsData;
  }
);

export const generateDevelopmentRoadmapWithAI = internalAction(
  async (
    _,
    { fullContext }: { fullContext: any }
  ) => {
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
      Generate a JSON object that represents the development roadmap, structured into 3-4 logical phases.

      **CRITICAL INSTRUCTIONS:**
      1. Your output MUST be a single, valid JSON object.
      2. The root of the JSON object must be a key named "roadmap".
      3. The value of "roadmap" must be an array of phase objects.
      4. Do not use any markdown formatting in the JSON string values. All text must be plain text.

      **JSON Schema:**
      Your output must conform to the following JSON schema:
      {
        "roadmap": [
          {
            "phase": "string",
            "epics": [
              {
                "title": "string",
                "icon": "string (Font Awesome 5 class, e.g., 'fas fa-users')",
                "tasks": ["string"]
              }
            ]
          }
        ]
      }

      Now, generate the JSON object.
    `;

    console.log("--- Requesting Development Roadmap from OpenAI ---");
    const roadmapData = await getOpenAIChatCompletion(prompt, true);
    console.log("Roadmap data received successfully.");
    return roadmapData;
  }
);

export const estimateCloudCostsWithAI = internalAction(
  async (
    _,
    { fullContext }: { fullContext: any }
  ) => {
    const prompt = `
      You are a pragmatic Cloud Solutions Architect providing a high-level, initial cloud cost estimate for a new startup called "${fullContext.name}".
      Based on the provided technical specifications, generate a cost breakdown in JSON format.

      **Application Context:**
      - **Official Startup Name:** ${fullContext.name}
      - **Technology Stack:** ${JSON.stringify(fullContext.techStack, null, 2)}
      - **Database Schema:** ${JSON.stringify(fullContext.databaseSchema, null, 2)}
      - **API Endpoints:** ${fullContext.apiEndpoints}

      **Your Task:**
      Generate a JSON object that estimates initial monthly cloud costs, broken down into 4 primary service categories.

      **CRITICAL INSTRUCTIONS:**
      1. Your output MUST be a single, valid JSON object.
      2. Provide estimates for three stages: "Development & Testing", "Initial Launch (Low Traffic)", and "Growth Stage (Moderate Traffic)".
      3. The cost estimates should be reasonable for a startup using modern, serverless-first or managed services.
      4. Do not use any markdown formatting in the JSON string values. All text must be plain text.

      **JSON Schema:**
      Your output must conform to the following JSON schema:
      {
        "costs": [
          {
            "service": "string",
            "icon": "string (Font Awesome 5 class)",
            "justification": "string",
            "estimates": [
              {
                "stage": "string",
                "cost": "string"
              }
            ]
          }
        ],
        "summary": "string"
      }

      Now, generate the JSON object.
    `;

    console.log("--- Requesting Cloud Cost Estimate from OpenAI ---");
    const costEstimateData = await getOpenAIChatCompletion(prompt, true);
    console.log("Cost estimate data received successfully.");
    return costEstimateData;
  }
);

export const generateInitialFiles = internalAction(
  async (
    _,
    { prompt }: { prompt: string }
  ) => {
    const generationPrompt = `
      You are an AI assistant that builds simple web applications based on a user's prompt.
      Your task is to generate the initial files for a standard web project.

      User Prompt: "${prompt}"

      Based on this prompt, generate three files:
      1.  **index.html**: A standard HTML5 boilerplate. It should link to the style.css file (<link rel="stylesheet" href="style.css">) and the script.js file (<script src="script.js" defer></script>). The body should contain the necessary HTML structure for the user's request.
      2.  **script.js**: The JavaScript code to make the application interactive, based on the user's request.
      3.  **style.css**: The necessary CSS to style the component.

      Also, provide a friendly chat response to the user confirming that you've created the initial version of their app.

      Your output MUST be a valid JSON object with a "files" object (containing file paths as keys and content as values) and a "chatResponse" string.
    `;

    console.log("--- Requesting Initial Project Files from OpenAI ---");
    const initialFilesData = await getOpenAIChatCompletion(generationPrompt, true);
    console.log("Initial project files data received successfully.");
    return initialFilesData;
  }
);

export const generatePricingStrategyWithAI = internalAction(
  async (
    _,
    { fullContext }: { fullContext: any }
  ) => {
    const prompt = `
      You are a monetization and pricing strategist for tech startups.
      Based on the provided business context for a startup called "${fullContext.name}", generate 1 or 2 potential pricing models with detailed tiers in a JSON format.

      **Business Context:**
      - **Official Startup Name:** ${fullContext.name}
      - **Business Plan:** ${JSON.stringify(fullContext.businessPlan, null, 2)}
      - **Target Personas:** ${JSON.stringify(fullContext.customerPersonas, null, 2)}
      - **Competitor Matrix:** ${JSON.stringify(fullContext.competitorMatrix, null, 2)}

      **Your Task:**
      Generate a JSON object that outlines 1-2 distinct pricing models, each with 2-3 pricing tiers.

      **CRITICAL INSTRUCTIONS:**
      1. Your output MUST be a single, valid JSON object.
      2. The root of the JSON object must be a key named "models".
      3. For each model, ensure that exactly ONE tier has "isRecommended" set to true.
      4. Do not use any markdown formatting in the JSON string values. All text must be plain text. Do not use asterisks (*).

      **JSON Schema:**
      Your output must conform to the following JSON schema:
      {
        "models": [
          {
            "modelName": "string",
            "modelDescription": "string",
            "tiers": [
              {
                "tierName": "string",
                "price": "string",
                "description": "string",
                "features": ["string"],
                "isRecommended": "boolean"
              }
            ]
          }
        ]
      }

      Now, generate the JSON object.
    `;

    console.log("--- Requesting Pricing Strategy from OpenAI ---");
    const pricingStrategyData = await getOpenAIChatCompletion(prompt, true);
    console.log("Pricing strategy data received successfully.");
    return pricingStrategyData;
  }
);

export const generateMarketingCopyWithAI = internalAction(
  async (
    _,
    { fullContext }: { fullContext: any }
  ) => {
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

      **CRITICAL INSTRUCTIONS:**
      1. You MUST use the "Official Startup Name" (${fullContext.name}) for all marketing copy.
      2. Your output MUST be a single, valid JSON object.
      3. Do not use any markdown formatting in the JSON string values. All text must be plain text. Do not use asterisks (*).

      **JSON Schema:**
      Your output must conform to the following JSON schema:
      {
        "taglines": ["string"],
        "socialMediaPosts": {
          "linkedin": "string",
          "twitter": "string",
          "facebook": "string"
        },
        "adCopy": {
          "googleAds": {
            "headline1": "string",
            "headline2": "string",
            "description": "string"
          },
          "facebookAd": {
            "headline": "string",
            "primaryText": "string",
            "callToAction": "string"
          }
        },
        "emailCampaign": {
          "subject": "string",
          "body": "string (use \n for newlines)"
        }
      }

      Now, generate the JSON object.
    `;

    console.log("--- Requesting Marketing Copy from OpenAI ---");
    const marketingCopyData = await getOpenAIChatCompletion(prompt, true);
    console.log("Marketing copy data received successfully.");
    return marketingCopyData;
  }
);

export const generateWaitlistPageWithAI = internalAction(
  async (
    _,
    { fullContext }: { fullContext: any }
  ) => {
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
      2.  **No Modules:** Do NOT include any 
import
 or 
export
 statements.
      3.  **Styling:** Create a visually appealing, modern design. Use a clean layout, good typography, and a professional color scheme derived from the brand context. The page should build anticipation and trust.
      4.  **Structure:** The component must include:
          - A strong, catchy headline (using the official brand name and tagline).
          - A brief, persuasive paragraph explaining the product's value (derived from the mission/vision).
          - An email input field.
          - A prominent call-to-action button (e.g., "Join the Waitlist", "Get Early Access").
      5.  **Content:** Use the actual startup name and marketing copy from the context.

      Your output MUST be a valid JSON object with a 'code' field containing the React component as a string.
    `;

    console.log("--- Requesting Waitlist Page Code from OpenAI ---");
    const waitlistPageData = await getOpenAIChatCompletion(prompt, true);
    console.log("Waitlist page code received successfully.");
    return waitlistPageData;
  }
);

export const smithBuildWithAI = internalAction(
  async (
    _,
    { prompt, history }: { prompt: string, history: string }
  ) => {
    const systemPrompt = `
      You are SmithBot, a world-class AI product development expert, engineer, and project manager.
      Your goal is to help users turn their ideas into real, tangible products.
      You are conversational, practical, and extremely knowledgeable in software development, UI/UX, and go-to-market strategy.
      You can write code, create plans, and provide actionable advice.
      When asked for code, provide it in clear, well-formatted markdown blocks.

      Here is the current conversation history:
      ${history}

      Based on this history, provide a helpful and expert response to the user's latest message: "${prompt}"
    `;

    console.log("--- Requesting SmithBot response from OpenAI ---");
    const responseText = await getOpenAIChatCompletion(systemPrompt, false);
    console.log("SmithBot response received successfully.");
    return responseText;
  }
);



export const generatePitchCoachAnalysisWithAI = internalAction(
  async (
    _,
    { fullContext }: { fullContext: any }
  ) => {
    const prompt = `
      You are "Echo", a world-class AI Pitch Coach from a top accelerator like Y Combinator. You are about to analyze a startup's pitch and provide structured, actionable feedback.

      **Startup Data Package:**
      - **Official Startup Name:** ${fullContext.name}
      - **Business Plan Summary:** ${JSON.stringify(fullContext.businessPlan?.executiveSummary, null, 2)}
      - **Pitch Deck Script & Slides:** ${JSON.stringify(fullContext.pitchDeck, null, 2)}

      **Your Task:**
      Generate a comprehensive pitch analysis as a JSON object.

      **CRITICAL INSTRUCTIONS:**
      1. Your output MUST be a single, valid JSON object.
      2. Provide a single, holistic score from 0-100.
      3. For the \`feedback\` field, create exactly three feedback categories as specified in the schema.
      4. For each feedback category, provide a relevant Font Awesome 5 class for the 'icon' field (e.g., 'fas fa-bullhorn', 'fas fa-cogs', 'fas fa-chart-line').
      5. Do not use any markdown formatting in the JSON string values. All text must be plain text.

      **JSON Schema:**
      Your output must conform to the following JSON schema:
      {
        "overallScore": "number",
        "feedback": [
          {
            "category": "string (e.g., 'Clarity & Narrative')",
            "icon": "string (Font Awesome 5 class)",
            "points": [
              {
                "feedback": "string",
                "isPositive": "boolean"
              }
            ]
          }
        ],
        "bodyLanguageTips": ["string"],
        "vapiAssistantPrompt": "string"
      }

      Now, generate the JSON object.
    `;

    console.log("--- Requesting AI Pitch Coach Analysis from OpenAI ---");
    const pitchCoachData = await getOpenAIChatCompletion(prompt, true);
    console.log("AI Pitch Coach data received successfully.");
    return pitchCoachData;
  }
);

export const generateContent = internalAction(
  async (_, { prompt, responseMimeType }: { prompt: string, responseMimeType?: "application/json" | "text/plain" }) => {
    const isJson = responseMimeType === "application/json";
    console.log(`--- Requesting Generic Content from OpenAI (isJson: ${isJson}) ---
`);
    const content = await getOpenAIChatCompletion(prompt, isJson);
    console.log("Generic content received successfully.");
    return content;
  }
);

export const generateABTestIdeasWithAI = internalAction(
  async (
    _,
    { fullContext }: { fullContext: any }
  ) => {
    const prompt = `
      You are a conversion rate optimization (CRO) expert.
      Based on the provided business context for a startup called "${fullContext.name}", generate 3 creative and impactful A/B test ideas in a JSON format.

      **Business Context:**
      - **Official Startup Name:** ${fullContext.name}
      - **Refined Idea:** ${fullContext.refinedIdea}
      - **Key Features:** ${fullContext.keyFeatures.join(", ")}
      - **Target Personas:** ${JSON.stringify(fullContext.customerPersonas, null, 2)}

      **Your Task:**
      Generate a JSON object containing a list of 3 distinct A/B test ideas. Focus on high-impact areas like user onboarding, call-to-actions, or pricing presentation.

      **CRITICAL INSTRUCTIONS:**
      1. Your output MUST be a single, valid JSON object.
      2. The root of the JSON object must be a key named "testIdeas".
      3. The value of "testIdeas" must be an array of exactly 3 test idea objects.
      4. Do not use any markdown formatting in the JSON string values. All text must be plain text. Do not use asterisks (*).

      **JSON Schema:**
      Your output must conform to the following JSON schema:
      {
        "testIdeas": [
          {
            "hypothesis": "string",
            "description": "string",
            "variationA": {
              "name": "string",
              "details": "string"
            },
            "variationB": {
              "name": "string",
              "details": "string"
            }
          }
        ]
      }

      Now, generate the JSON object.
    `;

    console.log("--- Requesting A/B Test Ideas from OpenAI ---");
    const abTestIdeasData = await getOpenAIChatCompletion(prompt, true);
    console.log("A/B test ideas data received successfully.");
    return abTestIdeasData;
  }
);

export const generateSeoStrategyWithAI = internalAction(
  async (
    _,
    { fullContext }: { fullContext: any }
  ) => {
    const prompt = `
      You are a world-class SEO strategist and content marketer.
      Based on the provided business context for a startup called "${fullContext.name}", generate a foundational SEO keyword and content strategy in a JSON format.

      **Business Context:**
      - **Official Startup Name:** ${fullContext.name}
      - **Refined Idea:** ${fullContext.refinedIdea}
      - **Marketing Copy Snippets:** ${JSON.stringify(fullContext.marketingCopy, null, 2)}
      - **Target Personas:** ${JSON.stringify(fullContext.customerPersonas, null, 2)}

      **Your Task:**
      Generate a JSON object that outlines a foundational SEO keyword and content strategy.

      **CRITICAL INSTRUCTIONS:**
      1. Your output MUST be a single, valid JSON object.
      2. The strategy must include two main parts: "keywordClusters" and "contentPillars".
      3. Do not use any markdown formatting in the JSON string values. All text must be plain text. Do not use asterisks (*).

      **JSON Schema:**
      Your output must conform to the following JSON schema:
      {
        "keywordClusters": [
          {
            "clusterName": "string",
            "justification": "string",
            "keywords": ["string"]
          }
        ],
        "contentPillars": [
          {
            "pillar": "string",
            "description": "string",
            "topics": ["string"]
          }
        ]
      }

      Now, generate the JSON object.
    `;

    console.log("--- Requesting SEO Strategy from OpenAI ---");
    const seoStrategyData = await getOpenAIChatCompletion(prompt, true);
    console.log("SEO strategy data received successfully.");
    return seoStrategyData;
  }
);

export const generateProcessMapWithAI = internalAction(
  async (
    _,
    { fullContext }: { fullContext: any }
  ) => {
    const prompt = `
      You are a senior business process analyst and automation expert.
      Based on the provided business context for a startup called "${fullContext.name}", identify 3-4 core processes and map them out for automation opportunities.

      **Business Context:**
      - **Official Startup Name:** ${fullContext.name}
      - **Business Plan Summary:** ${JSON.stringify(fullContext.businessPlan.executiveSummary, null, 2)}
      - **Development Roadmap Overview:** ${JSON.stringify(fullContext.developmentRoadmap, null, 2)}

      **Your Task:**
      Generate a JSON object that outlines a process automation map, identifying 3-4 core processes.

      **CRITICAL INSTRUCTIONS:**
      1. Your output MUST be a single, valid JSON object.
      2. The root of the JSON object must be a key named "processes".
      3. Identify processes from different areas of the business (e.g., customer-facing, marketing, technical operations, finance).
      4. Do not use any markdown formatting in the JSON string values. All text must be plain text. Do not use asterisks (*).

      **JSON Schema:**
      Your output must conform to the following JSON schema:
      {
        "processes": [
          {
            "name": "string",
            "description": "string",
            "automationPotential": "string (High, Medium, or Low)",
            "steps": [
              {
                "step": "number",
                "action": "string",
                "automationType": "string (Manual, Assisted, or Full)"
              }
            ]
          }
        ]
      }

      Now, generate the JSON object.
    `;

    console.log("--- Requesting Process Automation Map from OpenAI ---");
    const processMapData = await getOpenAIChatCompletion(prompt, true);
    console.log("Process map data received successfully.");
    return processMapData;
  }
);

export const generateJobDescriptionsWithAI = internalAction(
  async (
    _,
    { fullContext }: { fullContext: any }
  ) => {
    const prompt = `
      You are a senior HR manager and technical recruiter for a fast-growing tech startup.
      Based on the provided business context for a startup called "${fullContext.name}", draft professional and appealing job descriptions for the key roles identified in the development roadmap.

      **Business Context:**
      - **Official Startup Name:** ${fullContext.name}
      - **Business Plan Summary:** ${fullContext.businessPlan.executiveSummary}
      - **Key Roles Identified:** ${JSON.stringify(fullContext.developmentRoadmap.roadmap[0].epics, null, 2)}

      **Your Task:**
      Generate a JSON object containing a list of exactly 3 job descriptions for the most critical roles based on the context (e.g., a lead developer, a product manager, a marketing lead).

      **CRITICAL INSTRUCTIONS:**
      1. Your output MUST be a single, valid JSON object.
      2. The root of the JSON object must be a key named "jobs".
      3. The value of "jobs" must be an array of exactly 3 job description objects.
      4. Do not use any markdown formatting in the JSON string values. All text must be plain text. Do not use asterisks (*).

      **JSON Schema:**
      Your output must conform to the following JSON schema:
      {
        "jobs": [
          {
            "title": "string",
            "department": "string",
            "summary": "string",
            "responsibilities": ["string"],
            "qualifications": ["string"]
          }
        ]
      }

      Now, generate the JSON object.
    `;

    console.log("--- Requesting Job Descriptions from OpenAI ---");
    const jobDescriptionsData = await getOpenAIChatCompletion(prompt, true);
    console.log("Job description data received successfully.");
    return jobDescriptionsData;
  }
);

export const generateProductHuntKitWithAI = internalAction(
  async (
    _,
    { fullContext }: { fullContext: any }
  ) => {
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
      Generate a JSON object containing a rich set of assets for a successful Product Hunt launch.

      **CRITICAL INSTRUCTIONS:**
      1. Your output MUST be a single, valid JSON object.
      2. Be creative, detailed, and strategic.
      3. Do not use any markdown formatting in the JSON string values. All text must be plain text.

      **JSON Schema:**
      Your output must conform to the following JSON schema:
      {
        "taglines": ["string"],
        "makersComment": {
          "problem": "string",
          "solution": "string",
          "callToAction": "string"
        },
        "tweetSequence": [
          {
            "time": "string",
            "content": "string"
          }
        ],
        "visualAssetIdeas": [
          {
            "idea": "string",
            "description": "string"
          }
        ],
        "announcementEmail": {
          "subject": "string",
          "body": "string (use \n for newlines)"
        },
        "linkedinPost": "string",
        "thankYouTweet": "string"
      }

      Now, generate the JSON object.
    `;

    console.log("--- Requesting Expanded Product Hunt Launch Kit from OpenAI ---");
    const productHuntKitData = await getOpenAIChatCompletion(prompt, true);
    console.log("Expanded Product Hunt kit data received successfully.");
    return productHuntKitData;
  }
);

export const generatePressReleaseWithAI = internalAction(
  async (
    _,
    { fullContext }: { fullContext: any }
  ) => {
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

      **CRITICAL INSTRUCTIONS:**
      1. Your output MUST be a single, valid JSON object.
      2. Do not use any markdown formatting in the JSON string values. All text must be plain text.

      **JSON Schema:**
      Your output must conform to the following JSON schema:
      {
        "headline": "string",
        "dateline": "string",
        "introduction": "string",
        "body": "string",
        "quote": "string",
        "aboutUs": "string",
        "contactEmail": "string (e.g., press@company.com)"
      }

      Now, generate the JSON object.
    `;

    console.log("--- Requesting Press Release from OpenAI ---");
    const pressReleaseData = await getOpenAIChatCompletion(prompt, true);
    console.log("Press release data received successfully.");
    return pressReleaseData;
  }
);

export const generateInvestorSearchQueries = internalAction(
  async (
    _,
    { fullContext }: { fullContext: any }
  ) => {
    const prompt = `
      You are an AI assistant for a startup founder. Your task is to generate 3 highly specific Google
search queries to find potential investors.
      The startup is called "${fullContext.name}".
      It is in the "${fullContext.businessPlan.marketAnalysis.industryOverview}" industry.
      The core idea is: "${fullContext.businessPlan.executiveSummary}".

      **Your Task:**
      Generate a JSON object containing an array of 3 search query strings.

      **CRITICAL INSTRUCTIONS:**
      1. Your output MUST be a single, valid JSON object.
      2. The root of the JSON object must be a key named "queries".
      3. The value of "queries" must be an array of exactly 3 search query strings.
      4. The queries should be tailored to find venture capital firms or angel investors relevant to the startup's industry, stage, and model.

      **JSON Schema:**
      Your output must conform to the following JSON schema:
      {
        "queries": ["string"]
      }

      Now, generate the JSON object.
    `;

    console.log("--- Requesting Investor Search Queries from OpenAI ---");
    const searchQueriesData = await getOpenAIChatCompletion(prompt, true);
    console.log("Investor search queries received successfully.");
    return searchQueriesData;
  }
);

export const findInvestorsWithAI = internalAction(
  async (
    _,
    { fullContext, scrapedData }: { fullContext: any, scrapedData: any[] }
  ) => {
    const contentString = scrapedData.map(page => `--- Source URL: ${page.metadata.sourceURL}\r
---

${page.markdown}`).join("\n\n");

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

      **Your Task:**
      Carefully read through all the scraped data. Identify 3-5 individual investors or VC firms that are
the best fit. For each match, extract the required information and provide a strong, evidence-based
rationale for why they are a good match.

      **CRITICAL INSTRUCTIONS:**
      1. Your output MUST be a single, valid JSON object.
      2. The root of the JSON object must be a key named "investors".
      3. The value of "investors" must be an array of 3-5 investor objects.
      4. Do not use any markdown formatting in the JSON string values. All text must be plain text.

      **JSON Schema:**
      Your output must conform to the following JSON schema:
      {
        "investors": [
          {
            "name": "string",
            "firmOrType": "string",
            "investmentFocus": ["string"],
            "matchRationale": "string",
            "profileUrl": "string (a valid URL)"
          }
        ]
      }

      Now, generate the JSON object.
    `;

    console.log("--- Requesting Investor Matches from OpenAI ---");
    const investorMatches = await getOpenAIChatCompletion(prompt, true);
    console.log("Investor matches received successfully.");
    return investorMatches;
  }
);

export const generateCodeChanges = action({
  args: { files: v.any(), prompt: v.string() },
  handler: async (
    ctx,
    { files, prompt }: { files: any, prompt: string }
  ) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("User is not authenticated.");
    }

    const fileContentString = Object.entries(files).map(([path, data]) => {
        return `
--- ${path} ---
\`\`\`${(data as any).type}
${(data as any).content}
\`\`\`
`;
    }).join('');


    const generationPrompt = `
      You are an AI assistant that builds and modifies simple web applications based on a user's prompt
and the current state of the files.
      Your task is to update the files based on the user's request.

      User Prompt: "${prompt}"

      Current Files:
      ${fileContentString}

      Based on this prompt and the current files, generate the updated files.
      You should return an array of file objects. Each object must have a "path" and a "content" property.
      You must return the complete content of all files, even if they were not changed.

      Also, provide a friendly chat response to the user explaining what you did.

      Your output MUST be a valid JSON object with a "files" object (containing an array of file objects)
and a "chatResponse" string. Ensure the content of each file is a single, complete string.
    `;

    console.log("--- Requesting Code Changes from OpenAI ---");
    const codeChangesData = await getOpenAIChatCompletion(generationPrompt, true);
    console.log("Code changes data received successfully.");
    return codeChangesData;
  }
});