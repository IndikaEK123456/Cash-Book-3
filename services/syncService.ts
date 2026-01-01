
import { DailyRecord } from "../types";

/**
 * Shivas Beach Cabanas Cloud Sync Service
 * Uses a public KV storage relay to allow cross-device communication.
 */

// Public bucket for Shivas Beach Cabanas. 
// This allows us to use the Book ID as a unique key for synchronization.
const BUCKET_ID = 'ShivasBC_v1_Relay_7788'; 
const API_BASE = `https://kvdb.io/${BUCKET_ID}/`;

/**
 * Pushes the current state of the book to the cloud.
 * Only the Laptop (Admin) should ideally perform this.
 */
export const pushToCloud = async (bookId: string, data: DailyRecord): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE}${bookId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.ok;
  } catch (error) {
    console.error("Cloud Sync Push Error:", error);
    return false;
  }
};

/**
 * Fetches the latest data for a given Book ID from the cloud.
 */
export const fetchFromCloud = async (bookId: string): Promise<DailyRecord | null> => {
  try {
    const response = await fetch(`${API_BASE}${bookId}?t=${Date.now()}`); // Cache busting
    if (!response.ok) return null;
    const data = await response.json();
    return data as DailyRecord;
  } catch (error) {
    // Silently fail as polling happens frequently
    return null;
  }
};
