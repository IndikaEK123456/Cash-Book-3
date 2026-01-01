
import { AppState } from "../types";

/**
 * Shivas Beach Cabanas Global Sync Relay
 * Ensures all devices with the same Book ID see the same data.
 */

const BUCKET_ID = 'ShivasBC_Ultimate_Relay_V3_2024'; 
const API_BASE = `https://kvdb.io/${BUCKET_ID}/`;

export const pushToCloud = async (bookId: string, state: any): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE}${bookId}`, {
      method: 'PUT', // Using PUT for total overwrite of the relay object
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...state,
        activeDay: { ...state.activeDay, lastUpdated: Date.now() }
      }),
    });
    return response.ok;
  } catch (error) {
    console.error("Critical Sync Failure (Push):", error);
    return false;
  }
};

export const fetchFromCloud = async (bookId: string): Promise<any | null> => {
  try {
    const response = await fetch(`${API_BASE}${bookId}?timestamp=${Date.now()}`, {
      mode: 'cors'
    });
    if (!response.ok) {
      if (response.status === 404) return null; // New Book ID
      throw new Error(`Cloud returned ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.warn("Sync Relay Unavailable:", error);
    return null;
  }
};
