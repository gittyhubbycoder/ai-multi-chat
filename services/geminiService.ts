import { GoogleGenAI } from "@google/genai";
import type { AttachedFile } from "../types";

interface HistoryMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface GenerateContentParams {
  modelName: string;
  apiKey: string;
  history: HistoryMessage[];
  file?: AttachedFile;
}

export const generateGeminiContent = async (params: GenerateContentParams): Promise<string> => {
  const { modelName, apiKey, history, file } = params;
  try {
    if (!apiKey) {
      throw new Error("Google API key is missing. Please add it in settings.");
    }
    const ai = new GoogleGenAI({ apiKey: apiKey });

    if (history.length === 0) {
      throw new Error("Cannot generate content from an empty history.");
    }

    const contents = history.map((msg, index) => {
      const isLastMessage = index === history.length - 1;
      const textContent = typeof msg.content === 'string' ? msg.content : '';
      const parts: ({ text: string } | { inlineData: { mimeType: string; data: string } })[] = [{ text: textContent }];
      
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
