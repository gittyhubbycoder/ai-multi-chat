import { GoogleGenAI } from "@google/genai";
import type { AttachedFile } from "../types";

// This is a placeholder as the actual API key is managed by the execution environment.
const API_KEY = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey: API_KEY });

interface HistoryMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const generateGeminiContent = async (
  modelName: string,
  history: HistoryMessage[],
  file?: AttachedFile
): Promise<string> => {
  try {
    // FIX: Per @google/genai guidelines, use ai.models.generateContent and construct the request correctly.
    // Removed deprecated/incorrect patterns like ai.models[modelName] and chat.sendMessage.
    if (history.length === 0) {
      throw new Error("Cannot generate content from an empty history.");
    }

    // FIX: Refactored content creation to correctly handle multipart data (text and file)
    // for the last message in history. This single `map` operation correctly infers the
    // union type for the `parts` array, resolving the original TypeScript error.
    const contents = history.map((msg, index) => {
      const isLastMessage = index === history.length - 1;
      const parts: ({ text: string } | { inlineData: { mimeType: string; data: string } })[] = [{ text: msg.content }];
      if (isLastMessage && file) {
        parts.push({
          inlineData: {
            mimeType: file.type,
            data: file.data,
          },
        });
      }
      return {
        role: msg.role === 'user' ? 'user' : 'model',
        parts: parts,
      };
    });
    
    const response = await ai.models.generateContent({
      model: modelName,
      contents: contents,
    });

    if (response.text) {
      return response.text;
    } else {
      throw new Error('Gemini API returned an empty response.');
    }

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        return `Error with Gemini API: ${error.message}`;
    }
    return "An unknown error occurred with the Gemini API.";
  }
};
