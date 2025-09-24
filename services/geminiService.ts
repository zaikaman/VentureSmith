
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
                headline: { type: Type.STRING, description: "A powerful headline for the landing page." },
                subheading: { type: Type.STRING, description: "A supporting subheading that explains more." },
                features: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            description: { type: Type.STRING }
                        },
                         required: ["title", "description"]
                    },
                    description: "A list of 3 key features with titles and descriptions."
                },
                cta: { type: Type.STRING, description: "A compelling call-to-action button text." }
            },
             required: ["headline", "subheading", "features", "cta"]
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
    try {
        const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

        const prompt = `Based on the following startup idea, generate a comprehensive startup plan.
        Idea: "${idea}"
        
        Generate the following assets:
        1. A scorecard rating the idea on market size, feasibility, and innovation.
        2. A concise business plan covering the problem, solution, target audience, and revenue model.
        3. Content for a website landing page prototype.
        4. A short script for a voice pitch deck.
        5. A brief market research summary including potential competitors and trends.
        
        Return the entire output as a single JSON object that conforms to the provided schema.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: startupDataSchema,
            },
        });

        const jsonText = response.text.trim();
        const parsedData: StartupData = JSON.parse(jsonText);
        return parsedData;

    } catch (error) {
        console.error("Error generating startup assets:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to generate startup assets from Gemini API: ${error.message}`);
        }
        throw new Error("An unknown error occurred while communicating with the Gemini API.");
    }
};
