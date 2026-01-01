
import { AppState } from "../types";

/**
 * Shivas Beach Cabanas Cloud Sync Service
 * Uses a public KV storage relay for cross-device communication.
 */

// Unique Bucket for Shivas
const BUCKET_ID = 'ShivasBC_Global_Store_9900'; 
const API_BASE = `https://kvdb.io/${BUCKET_ID}/`;

/**
 * Pushes the entire app state (Active Day + History) to the cloud.
 */
export const pushToCloud = async (bookId: string, state: AppState): Promise<boolean> => {
  try {
    // We use PUT to ensure we overwrite the existing state for this Book ID
    const response = await fetch(`${API_BASE}${bookId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...state,
        activeDay: { ...state.activeDay, lastUpdated: Date.now() }
      }),
    });
    return response.ok;
  } catch (error) {
    console.error("Sync Error (Push):", error);
    return false;
  }
};

/**
 * Fetches the entire app state from the cloud.
 */
export const fetchFromCloud = async (bookId: string): Promise<AppState | null> => {
  try {
    const response = await fetch(`${API_BASE}${bookId}?nocache=${Date.now()}`);
    if (!response.ok) return null;
    const data = await response.json();
    return data as AppState;
  } catch (error) {
    return null;
  }
};
