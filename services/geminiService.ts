import { GoogleGenAI } from "@google/genai";
import { TAG_GENERATION_SYSTEM_PROMPT } from '../constants';

// Safely retrieve API key without crashing if 'process' is undefined in browser
const getApiKey = () => {
  try {
    return (typeof process !== 'undefined' && process.env) ? process.env.API_KEY : '';
  } catch (e) {
    return '';
  }
};

export const generateTagContent = async (userPrompt: string): Promise<string> => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    // Return a helpful mock response if no key is present, preventing app crash
    console.warn("Gemini API Key missing");
    throw new Error("API Key is missing. AI features require configuration.");
  }

  try {
    // Initialize lazily to prevent top-level errors
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
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw new Error("Failed to generate content with AI.");
  }
};