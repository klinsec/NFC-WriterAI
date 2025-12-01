import { GoogleGenAI } from "@google/genai";
import { TAG_GENERATION_SYSTEM_PROMPT } from '../constants';

// Extremely safe way to get env var without crashing in browser
const getApiKey = (): string | undefined => {
  try {
    // Check if process exists globally (Node/Build tools)
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
      return process.env.API_KEY;
    }
    // Fallback for some bundlers that inject it directly
    // @ts-ignore
    if (typeof API_KEY !== 'undefined') return API_KEY;
  } catch (e) {
    return undefined;
  }
  return undefined;
};

export const generateTagContent = async (userPrompt: string): Promise<string> => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    console.warn("Gemini API Key missing");
    // Do not throw error, return a friendly message to the UI
    return "AI Generation is disabled (Missing API Key). Please deploy with a valid key or enter text manually.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction: TAG_GENERATION_SYSTEM_PROMPT,
        temperature: 0.8,
        maxOutputTokens: 200,
      }
    });

    return response.text || "Could not generate content.";
  } catch (error: any) {
    console.error("Gemini Generation Error:", error);
    return `Error generating content: ${error.message}`;
  }
};