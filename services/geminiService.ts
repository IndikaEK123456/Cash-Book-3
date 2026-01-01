
import { GoogleGenAI } from "@google/genai";
import { CurrencyRates } from "../types";

export const fetchLiveRates = async (): Promise<CurrencyRates | null> => {
  try {
    // Fix: Using process.env.API_KEY directly as per SDK guidelines
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    // Note: In a real environment, Search Grounding might provide real-time data.
    // We use gemini-3-flash-preview for quick queries.
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Get the latest exchange rate for 1 USD to LKR and 1 EURO to LKR. Return ONLY a JSON object: { \"usd\": number, \"eur\": number }",
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    // Fix: Accessing property .text directly instead of method or nested response objects
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
    console.error("Failed to fetch rates via Gemini:", error);
  }
  
  // Fallback default rates if API fails
  return {
    usdToLkr: 310,
    eurToLkr: 366,
    lastUpdated: 'Fallback'
  };
};
