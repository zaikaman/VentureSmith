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
                script: { type: Type.STRING, description: "A 1-minute voice pitch script an AI CEO would deliver." }
            },
            required: ["script"]
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
        - Any internal double quotes within the code string MUST be escaped with a backslash (e.g., "some-class" should be \"some-class\")
        - NO markdown formatting whatsoever (no jsx blocks, no backticks, no code blocks)
        - Must be properly formatted with line breaks and indentation for readability (NOT minified or single-line)
        - Each JSX element should be on its own line with proper indentation
        - String must start with: const WebsitePrototypeComponent = () => {
        - String must end with: };
        - Component name must be exactly 'WebsitePrototypeComponent'
        - Use modern React functional component syntax
        - Style with Tailwind CSS classes only
        - All HTML tags must be self-closing where appropriate (<img />, <br />, etc.)
        - Component must be completely self-contained with no external references
        - Return a single root JSX element
        - Do not include any import statements
        
        STRUCTURE REQUIREMENTS:
        - Include a header with startup name and navigation menu
        - Include a footer with social media links and copyright
        - Include at least 2-3 content sections showcasing the startup's value proposition
        - Make the design responsive and modern
        
        EXAMPLE FORMAT (follow this exact structure):
        const WebsitePrototypeComponent = () => {
          return (
            <div className="min-h-screen">
              <header className="bg-white shadow">
                {/* header content */}
              </header>
              <main>
                <section className="hero-section">
                  {/* hero content */}
                </section>
                <section className="features-section">
                  {/* features content */}
                </section>
              </main>
              <footer className="bg-gray-800">
                {/* footer content */}
              </footer>
            </div>
          );
        };
        4. A short script for a voice pitch deck.
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
