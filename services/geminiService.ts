import { GoogleGenAI, Type } from "@google/genai";
import { StartupData } from '../types';

const scoreSchema = {
    type: Type.OBJECT,
    properties: {
        score: { type: Type.NUMBER, description: "A score from 0 to 100 for this category." },
        justification: { type: Type.STRING, description: "A brief justification for the score, explaining the reasoning." }
    },
    required: ["score", "justification"]
};

const startupDataSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING, description: "A creative and memorable name for the startup." },
        scorecard: {
            type: Type.OBJECT,
            properties: {
                marketSize: scoreSchema,
                feasibility: scoreSchema,
                innovation: scoreSchema,
                overallScore: { type: Type.NUMBER, description: "The weighted average score from 0 to 100." }
            },
            required: ["marketSize", "feasibility", "innovation", "overallScore"]
        },
        businessPlan: {
            type: Type.OBJECT,
            properties: {
                executiveSummary: { type: Type.STRING, description: "A concise, compelling summary of the entire business plan." },
                companyDescription: { type: Type.STRING, description: "The company's mission, vision, and core values." },
                marketAnalysis: {
                    type: Type.OBJECT,
                    properties: {
                        industryOverview: { type: Type.STRING, description: "An overview of the industry, including size and growth rate." },
                        targetMarket: { type: Type.STRING, description: "A detailed description of the target customer segments." },
                        competitiveAnalysis: { type: Type.STRING, description: "An analysis of key competitors, their strengths, and weaknesses." },
                    },
                    required: ["industryOverview", "targetMarket", "competitiveAnalysis"]
                },
                organizationAndManagement: { type: Type.STRING, description: "Description of the organizational structure and key management personnel (using placeholder roles)." },
                productsAndServices: { type: Type.STRING, description: "A detailed description of the products or services offered, including unique features and benefits." },
                marketingAndSalesStrategy: { type: Type.STRING, description: "The strategy for marketing, customer acquisition, and sales channels." },
                financialProjections: {
                    type: Type.OBJECT,
                    properties: {
                        summary: { type: Type.STRING, description: "A brief summary of the financial outlook and key assumptions." },
                        forecast: {
                            type: Type.ARRAY,
                            description: "A 3-year financial forecast table.",
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    year: { type: Type.NUMBER, description: "The forecast year (1, 2, 3)." },
                                    revenue: { type: Type.STRING, description: "Projected revenue for the year." },
                                    cogs: { type: Type.STRING, description: "Projected Cost of Goods Sold for the year." },
                                    netProfit: { type: Type.STRING, description: "Projected Net Profit for the year." },
                                },
                                required: ["year", "revenue", "cogs", "netProfit"]
                            }
                        }
                    },
                    required: ["summary", "forecast"]
                }
            },
            required: ["executiveSummary", "companyDescription", "marketAnalysis", "organizationAndManagement", "productsAndServices", "marketingAndSalesStrategy", "financialProjections"]
        },
        websitePrototype: {
            type: Type.OBJECT,
            properties: {
                code: { type: Type.STRING, description: "A React component code string for the website landing page." }
            },
            required: ["code"]
        },
        pitchDeck: {
            type: Type.OBJECT,
            properties: {
                script: { type: Type.STRING, description: "A 1-minute voice pitch script an AI CEO would deliver, written in a natural, conversational tone." },
                slides: {
                    type: Type.ARRAY,
                    description: "An array of 8-10 slides for a standard startup pitch deck.",
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING, description: "The title of the slide." },
                            content: { type: Type.STRING, description: "The key content for the slide, formatted as markdown with bullet points using hyphens." }
                        },
                        required: ["title", "content"]
                    }
                }
            },
            required: ["script", "slides"]
        },
        marketResearch: {
            type: Type.OBJECT,
            properties: {
                summary: { type: Type.STRING, description: "A summary of the market landscape." },
                competitors: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "A list of 3 potential competitors."
                },
                trends: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "A list of 3 relevant market trends."
                }
            },
             required: ["summary", "competitors", "trends"]
        }
    },
    required: ["name", "scorecard", "businessPlan", "websitePrototype", "pitchDeck", "marketResearch"]
};


export const generateStartupAssets = async (idea: string): Promise<StartupData> => {
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
    const maxRetries = 2; // 1 initial attempt + 2 retries
    let lastError: Error | null = null;
    let jsonText: string | undefined;

    const initialPrompt = `Based on the following startup idea, generate a comprehensive startup plan.
        Idea: "${idea}"
        
        Generate the following assets:
        1. A creative and memorable name for the startup.
        2. A scorecard rating the idea on market size, feasibility, and innovation.
        3. A comprehensive 7-part business plan containing:
            a. Executive Summary: A concise, compelling summary of the entire business plan.
            b. Company Description: The company's mission, vision, and core values.
            c. Market Analysis: A detailed analysis of the industry, target market, and competition.
            d. Organization and Management: Description of the team and structure (use placeholder roles like 'CEO', 'CTO').
            e. Products or Services: A detailed description of the offering and its competitive advantages.
            f. Marketing and Sales Strategy: The plan for customer acquisition, marketing, and sales.
            g. Financial Projections: A summary of the financial outlook and a 3-year forecast table (revenue, COGS, net profit).

        4. A self-contained React functional component code string for a comprehensive website landing page prototype. CRITICAL FORMATTING REQUIREMENTS:
        - The returned code string must be a raw string of valid, well-formed JSX code only
        - Any internal double quotes within the code string MUST be escaped with a backslash (e.g., \"some-class\")
        - NO markdown formatting whatsoever (no jsx blocks, no backticks, no code blocks)
        - Must be properly formatted with line breaks and indentation for readability (NOT minified or single-line)
        - String must start with: const WebsitePrototypeComponent = () => {
        - String must end with: };
        - Use modern React functional component syntax and Tailwind CSS classes only.
        - Do not use any external images or assets. The component must be self-contained.
        
        5. A full Pitch Deck including:
           a. A natural, conversational 1-minute voice pitch script.
           b. A slide deck of 8-10 slides. For each slide, provide a title and content. The content should be concise, using markdown bullet points (hyphens). The slides should cover: Problem, Solution, Market Opportunity, Business Model, Product Demo (use a placeholder description), Market Validation, Competition, Financial Projection (use high-level estimates), Team (use placeholder founders), and a Call to Action.

        6. A brief market research summary including potential competitors and trends.
        
        Return the entire output as a single JSON object that conforms to the provided schema.`;

    for (let i = 0; i <= maxRetries; i++) {
        try {
            console.log(`--- Gemini API Attempt ${i + 1} of ${maxRetries + 1} ---`);
            
            if (i === 0) {
                const response = await ai.models.generateContent({
                    model: "gemini-2.5-flash",
                    contents: initialPrompt,
                    config: {
                        responseMimeType: "application/json",
                        responseSchema: startupDataSchema,
                    },
                });
                jsonText = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
            } else {
                const fixerPrompt = `The following JSON response you previously provided resulted in a parsing error. Please fix it and return only the corrected, valid JSON object. Do not add any commentary or markdown, just the raw JSON string.

                    ERROR:
                    ${lastError?.message}
                    
                    FAULTY JSON:
                    ${jsonText}`;
                
                const response = await ai.models.generateContent({
                    model: "gemini-2.5-flash",
                    contents: fixerPrompt,
                });
                jsonText = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
            }

            console.log("Raw response from Gemini:", jsonText);
            if (!jsonText) {
                throw new Error("No response text received from Gemini API");
            }

            const parsedData: StartupData = JSON.parse(jsonText);
            console.log("JSON parsing successful.");
            return parsedData; // Success! 

        } catch (error: any) {
            console.error(`Attempt ${i + 1} failed:`, error.message);
            lastError = error;
        }
    }

    console.error("Failed to generate and parse startup assets after all retries.");
    throw new Error(`Failed to generate startup assets from Gemini API after ${maxRetries + 1} attempts. Last error: ${lastError?.message}`);
};

export const regenerateWebsitePrototype = async (idea: string): Promise<{ code: string }> => {
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
    const maxRetries = 2;
    let lastError: Error | null = null;
    let jsonText: string | undefined;

    const websiteSchema = {
        type: Type.OBJECT,
        properties: {
            code: { type: Type.STRING, description: "A React component code string for the website landing page." }
        },
        required: ["code"]
    };

    const prompt = `Based on the following startup idea, regenerate a new and different design for the website landing page prototype. 
        Idea: "${idea}"
        
        CRITICAL FORMATTING REQUIREMENTS:
        - The returned code string must be a raw string of valid, well-formed JSX code only
        - Any internal double quotes within the code string MUST be escaped with a backslash (e.g., \"some-class\")
        - NO markdown formatting whatsoever (no jsx blocks, no backticks, no code blocks)
        - Must be properly formatted with line breaks and indentation for readability (NOT minified or single-line)
        - String must start with: const WebsitePrototypeComponent = () => {
        - String must end with: };
        - Use modern React functional component syntax and Tailwind CSS classes only.
        - Do not use any external images or assets. The component must be self-contained.
        - Make the design responsive and modern.

        Return the entire output as a single JSON object that conforms to the provided schema.`;

    for (let i = 0; i <= maxRetries; i++) {
        try {
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: websiteSchema,
                },
            });
            jsonText = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

            if (!jsonText) {
                throw new Error("No response text received from Gemini API for website regeneration");
            }

            const parsedData: { code: string } = JSON.parse(jsonText);
            return parsedData;

        } catch (error: any) {
            console.error(`Website regeneration attempt ${i + 1} failed:`, error.message);
            lastError = error;
        }
    }

    throw new Error(`Failed to regenerate website prototype after ${maxRetries + 1} attempts. Last error: ${lastError?.message}`);
};

export const getMentorFeedback = async (startupData: StartupData, marketResearch: any): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

    const prompt = `
        You are a seasoned venture capitalist and startup mentor. Your name is "Alex Chen".
        A startup founder has generated the following business assets and is asking for your expert feedback.
        Please provide a critical, insightful, and constructive analysis of their entire plan.

        Here is the data they have generated:
        ---
        **Core Business Data:**
        ${JSON.stringify(startupData, null, 2)}
        ---
        **External Market Research Data:**
        ${JSON.stringify(marketResearch, null, 2)}
        ---

        Based on all the information provided, please structure your feedback in markdown format as follows:

        # AI Mentor Feedback

        ### Overall Investability Score: [Provide a score out of 10] / 10
        **Justification:** [Provide a brief, sharp justification for your score.]

        ---

        ### Key Strengths
        *   **Strength 1:** [Describe the first major strength of the business idea/plan.]
        *   **Strength 2:** [Describe the second major strength.]
        *   **Strength 3:** [Describe the third major strength.]

        ---

        ### Potential Risks & Weaknesses
        *   **Risk 1:** [Describe the first major risk or weakness.]
        *   **Risk 2:** [Describe the second major risk or weakness.]
        *   **Risk 3:** [Describe the third major risk or weakness.]

        ---

        ### Critical Investor Questions
        *   **Question 1:** [Pose a challenging, insightful question an investor would ask.]
        *   **Question 2:** [Pose another critical question.]
        *   **Question 3:** [Pose a final, thought-provoking question.]

        Your tone should be professional, direct, and helpful. You are here to challenge the founder to make their idea better.
    `;

    try {
        console.log("--- Requesting Mentor Feedback from Gemini ---");
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        const feedbackText = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

        if (!feedbackText) {
            throw new Error("No feedback text received from Gemini API");
        }
        
        console.log("Mentor feedback received successfully.");
        return feedbackText;

    } catch (error: any) {
        console.error("Failed to get mentor feedback:", error.message);
        throw new Error(`Failed to get mentor feedback from Gemini API. Error: ${error.message}`);
    }
};