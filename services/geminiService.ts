import { GoogleGenAI } from "@google/genai";
import { TAG_GENERATION_SYSTEM_PROMPT } from '../constants';

const apiKey = process.env.API_KEY || '';

// Initialize Gemini
// Note: In a real production client-side app, you might want to proxy this or let user input key.
// We assume environment variable is present as per instructions.
const ai = new GoogleGenAI({ apiKey });

export const generateTagContent = async (userPrompt: string): Promise<string> => {
  if (!apiKey) {
    throw new Error("Gemini API Key is missing. Please configure process.env.API_KEY");
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction: TAG_GENERATION_SYSTEM_PROMPT,
        temperature: 0.8,
        maxOutputTokens: 200, // NFC tags have limited storage, keep it short
      }
    });

    return response.text || "Could not generate content.";
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw new Error("Failed to generate content with AI.");
  }
};
