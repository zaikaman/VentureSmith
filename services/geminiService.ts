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
                slogan: { type: Type.STRING, description: "A catchy slogan for the startup." },
                problem: { type: Type.STRING, description: "The core problem the startup is solving." },
                solution: { type: Type.STRING, description: "The startup's solution to the problem." },
                targetAudience: { type: Type.STRING, description: "A description of the ideal customer profile." },
                revenueModel: { type: Type.STRING, description: "How the startup plans to make money." }
            },
            required: ["slogan", "problem", "solution", "targetAudience", "revenueModel"]
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
    required: ["scorecard", "businessPlan", "websitePrototype", "pitchDeck", "marketResearch"]
};


export const generateStartupAssets = async (idea: string): Promise<StartupData> => {
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
    const maxRetries = 2; // 1 initial attempt + 2 retries
    let lastError: Error | null = null;
    let jsonText: string | undefined;

    const initialPrompt = `Based on the following startup idea, generate a comprehensive startup plan.
        Idea: "${idea}"
        
        Generate the following assets:
        1. A scorecard rating the idea on market size, feasibility, and innovation.
        2. A concise business plan covering the problem, solution, target audience, and revenue model.
        3. A self-contained React functional component code string for a comprehensive website landing page prototype. CRITICAL FORMATTING REQUIREMENTS:
        - The returned code string must be a raw string of valid, well-formed JSX code only
        - Any internal double quotes within the code string MUST be escaped with a backslash (e.g., \"some-class\")
        - NO markdown formatting whatsoever (no jsx blocks, no backticks, no code blocks)
        - Must be properly formatted with line breaks and indentation for readability (NOT minified or single-line)
        - String must start with: const WebsitePrototypeComponent = () => {
        - String must end with: };
        - Use modern React functional component syntax and Tailwind CSS classes only.
        - Do not use any external images or assets. The component must be self-contained.
        
        4. A full Pitch Deck including:
           a. A natural, conversational 1-minute voice pitch script.
           b. A slide deck of 8-10 slides. For each slide, provide a title and content. The content should be concise, using markdown bullet points (hyphens). The slides should cover: Problem, Solution, Market Opportunity, Business Model, Product Demo (use a placeholder description), Market Validation, Competition, Financial Projection (use high-level estimates), Team (use placeholder founders), and a Call to Action.

        5. A brief market research summary including potential competitors and trends.
        
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