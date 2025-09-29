
import { useState, useCallback, useRef } from "react";
import { useAction } from "convex/react";
import { api } from "../convex/_generated/api";
import type { Message, AiStatus, FileSystem, FileChange } from "@/types";
import { GoogleGenAI, type Content, type Part, type GenerationConfig } from "@google/genai";

// 1. Define the JSON schema that the AI MUST follow.
const responseSchema = {
  type: "OBJECT",
  properties: {
    chatResponse: { 
      type: "STRING",
      description: "The friendly, conversational response to the user, explaining what was done."
    },
    files: {
      type: "ARRAY",
      description: "An array of file change operations.",
      items: {
        type: "OBJECT",
        properties: {
          operation: { type: "STRING", enum: ["CREATE", "UPDATE", "DELETE"] },
          path: { type: "STRING", description: "The full path of the file to modify." },
          description: { type: "STRING", description: "A user-friendly description of the change." },
          content: { type: "STRING", description: "The full source code for CREATE or UPDATE operations." },
        },
        required: ["operation", "path", "description"],
      },
    },
  },
  required: ["chatResponse", "files"],
};

// 2. Update the system prompt to align with the JSON mode.
const AI_SYSTEM_PROMPT = `You are "Smith," an AI expert specializing in web development. Your main instruction is to use **HTML, CSS, and vanilla JavaScript** to build and modify single-page web applications.

### CRITICAL INSTRUCTION
Your entire response MUST be a single, valid JSON object that conforms to the provided schema. Do NOT include any text, markdown, or any characters outside of the JSON object.

The JSON object has two main properties:
1.  **chatResponse**: A friendly, conversational string explaining your plan and what you have done. This is where you talk to the user.
2.  **files**: An array of file operations (CREATE, UPDATE, DELETE) to modify the project code.

### Core Philosophy:
- Build complete, working prototypes using HTML, CSS, and vanilla JavaScript (\`index.html\`, \`style.css\`, and \`script.js\`).
- Ensure correct file linking in \`index.html\`.
- Design with a keen eye for modern aesthetics, blending Vercel and Apple design principles.
- Always build accessible components with semantic HTML.
`;

const applyCodeChanges = (
  changes: FileChange[],
  setFileSystem: React.Dispatch<React.SetStateAction<FileSystem>>,
) => {
  setFileSystem((currentFs) => {
    const newFs = { ...currentFs };
    for (const change of changes) {
      if (change.operation === "CREATE" || change.operation === "UPDATE") {
        if (typeof change.content === "string") {
          const extension = change.path.split(".").pop() || 'tsx';
          newFs[change.path] = { content: change.content, type: extension };
        }
      } else if (change.operation === "DELETE") {
        delete newFs[change.path];
      }
    }
    return newFs;
  });
};

export const useSmithChat = (
  fileSystem: FileSystem,
  setFileSystem: React.Dispatch<React.SetStateAction<FileSystem>>,
) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [aiStatus, setAiStatus] = useState<AiStatus>("idle");
  const stopGenerationRef = useRef(false);

  const stopGeneration = useCallback(() => {
    stopGenerationRef.current = true;
  }, []);

  const buildHistory = (currentMessages: Message[]): Content[] => {
    const history: Content[] = [];
    currentMessages.forEach((msg) => {
      if (!msg.isStreaming && !msg.error && (msg.role === "user" || msg.role === "ai")) {
        const messageText = msg.text;
        if (messageText) {
          history.push({
            role: msg.role === "user" ? "user" : "model",
            parts: [{ text: messageText }],
          });
        }
      }
    });
    return history;
  };

  const sendMessage = useCallback(
    async (prompt: string) => {
      stopGenerationRef.current = false;
      setAiStatus("thinking");

      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        text: prompt,
      };
      setMessages((prev) => [...prev, userMessage]);

      try {
        const apiKey = localStorage.getItem('gemini_api_key') || import.meta.env.VITE_GEMINI_API_KEY;
        if (!apiKey) {
          throw new Error('A Gemini API Key must be set. Please add it in the settings.');
        }
        const genAI = new GoogleGenAI({ apiKey });

        const history = buildHistory(messages);
        const fileContext = Object.entries(fileSystem)
          .map(([path, data]) => `--- ${path} ---
${data.content}`)
          .join('\n\n');

        const fullPrompt = `${AI_SYSTEM_PROMPT}\n\n# Current Files:\n${fileContext}\n\n# User Request:\n${prompt}`;
        
        const contents: Content[] = [...history, { role: "user", parts: [{ text: fullPrompt }] }];

        // 3. Update the API call to use JSON Mode
        const result = await genAI.models.generateContentStream({
          model: "gemini-2.5-flash", // As requested by user
          contents,
          config: { // Renamed from generationConfig
            responseMimeType: "application/json",
            responseSchema: responseSchema,
          },
        });

        let fullResponseText = "";
        let currentAiMessage: Message | null = null;
        
        setAiStatus("streaming");

        // 4. Update streaming logic to handle a JSON response
        for await (const chunk of result) {
          if (stopGenerationRef.current) break;

          const chunkText = chunk.text;
          fullResponseText += chunkText;

          // We can't parse the JSON until the stream is complete,
          // but we can show a placeholder message.
          if (!currentAiMessage) {
            currentAiMessage = {
              id: Date.now().toString(),
              role: "ai",
              text: "Thinking...",
              isStreaming: true,
            };
            setMessages((prev) => [...prev, currentAiMessage!]);
          }
        }

        if (stopGenerationRef.current) {
            if (currentAiMessage) {
              setMessages((prev) =>
                prev.map((msg) => (msg.id === currentAiMessage!.id ? { ...msg, isStreaming: false } : msg)),
              );
            }
            return;
        }

        // Now parse the complete JSON response
        const parsedResponse = JSON.parse(fullResponseText);
        const { chatResponse, files: changes } = parsedResponse;

        if (!chatResponse || !changes) {
          throw new Error("Invalid JSON response structure from AI.");
        }

        // Update the AI message with the actual conversational response
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === currentAiMessage?.id ? { ...msg, isStreaming: false, text: chatResponse } : msg,
          ),
        );

        // Apply the code changes
        if (changes.length > 0) {
          applyCodeChanges(changes, setFileSystem);
        }

      } catch (err) {
        console.error("AI Error:", err);
        const errorMessage = err instanceof Error ? err.message : String(err);
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: "ai",
            text: `An error occurred: ${errorMessage}`,
            error: errorMessage,
          },
        ]);
      } finally {
        setAiStatus("idle");
        stopGenerationRef.current = false;
      }
    },
    [messages, fileSystem, setFileSystem],
  );

  return { messages, setMessages, sendMessage, aiStatus, stopGeneration };
};
