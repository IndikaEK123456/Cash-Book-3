
import { GoogleGenAI } from "@google/genai";
import { CurrencyRates } from "../types";

/**
 * Fetches live exchange rates using Gemini API with Search Grounding.
 * Includes safety checks to prevent 'process is not defined' errors during deployment.
 */
export const fetchLiveRates = async (): Promise<CurrencyRates | null> => {
  try {
    // Safety check for browser environments without a bundler polyfill for process
    const apiKey = typeof process !== 'undefined' ? process.env.API_KEY : undefined;
    
    if (!apiKey) {
      console.warn("Gemini API Key is not available in this environment. Using default rates.");
      return getFallbackRates();
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // Requesting structured data from Gemini
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Get the latest exchange rate for 1 USD to LKR and 1 EURO to LKR. Return ONLY a JSON object: { \"usd\": number, \"eur\": number }",
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const text = response.text || "";
    const match = text.match(/\{.*\}/s);
    if (match) {
      const data = JSON.parse(match[0]);
      return {
        usdToLkr: Math.ceil(data.usd),
        eurToLkr: Math.ceil(data.eur),
        lastUpdated: new Date().toLocaleTimeString()
      };
    }
  } catch (error) {
    console.error("Gemini Service Error:", error);
  }
  
  return getFallbackRates();
};

const getFallbackRates = (): CurrencyRates => ({
  usdToLkr: 310,
  eurToLkr: 366,
  lastUpdated: 'Fallback (Live Rates Unavailable)'
});
