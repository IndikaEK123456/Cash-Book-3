
import { useState, useEffect, useCallback, useRef } from 'react';
import { DailyRecord, OutPartyEntry, MainEntry, PaymentMethod, DeviceType } from './types';
import { pushToCloud, fetchFromCloud } from './services/syncService';

const BASE_STORAGE_KEY = 'SHIVAS_CASH_BOOK_';
const ACTIVE_KEY_STORAGE = 'SHIVAS_ACTIVE_BOOK_ID';

const generateKey = () => `SHIVA-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

const createInitialData = (dateStr?: string): DailyRecord => ({
  date: dateStr || new Date().toLocaleDateString(),
  outPartyEntries: [],
  mainEntries: [],
  openingBalance: 0
});

export const useCashBookStore = (deviceType: DeviceType) => {
  const [bookId, setBookId] = useState<string>(() => {
    return localStorage.getItem(ACTIVE_KEY_STORAGE) || generateKey();
  });

  const [data, setData] = useState<DailyRecord>(() => {
    const saved = localStorage.getItem(BASE_STORAGE_KEY + bookId);
    return saved ? JSON.parse(saved) : createInitialData();
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const lastSyncRef = useRef<string>("");

  // Save and Sync Helper
  const syncWithCloud = useCallback(async (newData: DailyRecord) => {
    // Only push if we are on Laptop (Admin)
    if (deviceType === DeviceType.LAPTOP) {
      setIsSyncing(true);
      await pushToCloud(bookId, newData);
      setIsSyncing(false);
    }
  }, [bookId, deviceType]);

  const saveToStorage = useCallback((newData: DailyRecord) => {
    localStorage.setItem(BASE_STORAGE_KEY + bookId, JSON.stringify(newData));
    localStorage.setItem(ACTIVE_KEY_STORAGE, bookId);
    setData(newData);
    
    // Trigger Cloud Push
    syncWithCloud(newData);
    
    // Trigger local storage event for same-device cross-tab
    window.dispatchEvent(new StorageEvent('storage', {
      key: BASE_STORAGE_KEY + bookId,
      newValue: JSON.stringify(newData)
    }));
  }, [bookId, syncWithCloud]);

  // Polling Logic for Mobile Devices (Viewers)
  useEffect(() => {
    if (deviceType === DeviceType.LAPTOP) return; // Laptop doesn't poll, it pushes

    const poll = async () => {
      setIsSyncing(true);
      const cloudData = await fetchFromCloud(bookId);
      if (cloudData) {
        const cloudStr = JSON.stringify(cloudData);
        if (cloudStr !== lastSyncRef.current) {
          setData(cloudData);
          localStorage.setItem(BASE_STORAGE_KEY + bookId, cloudStr);
          lastSyncRef.current = cloudStr;
        }
      }
      setIsSyncing(false);
    };

    poll(); // Initial poll
    const interval = setInterval(poll, 3000); // Poll every 3 seconds for near real-time
    return () => clearInterval(interval);
  }, [bookId, deviceType]);

  // Handle Book ID Change
  const setSyncKey = async (newKey: string) => {
    const cleanKey = newKey.trim().toUpperCase();
    if (cleanKey) {
      setBookId(cleanKey);
      localStorage.setItem(ACTIVE_KEY_STORAGE, cleanKey);
      
      // Immediate cloud fetch when key changes
      setIsSyncing(true);
      const cloudData = await fetchFromCloud(cleanKey);
      if (cloudData) {
        setData(cloudData);
        localStorage.setItem(BASE_STORAGE_KEY + cleanKey, JSON.stringify(cloudData));
      } else {
        // If not on cloud, check local or start new
        const saved = localStorage.getItem(BASE_STORAGE_KEY + cleanKey);
        setData(saved ? JSON.parse(saved) : createInitialData());
      }
      setIsSyncing(false);
    }
  };

  const addOutPartyEntry = (amount: number, method: PaymentMethod) => {
    const newEntry: OutPartyEntry = {
      id: crypto.randomUUID(),
      index: data.outPartyEntries.length + 1,
      method,
      amount
    };
    saveToStorage({ ...data, outPartyEntries: [...data.outPartyEntries, newEntry] });
  };

  const deleteOutPartyEntry = (id: string) => {
    const newData = { 
      ...data, 
      outPartyEntries: data.outPartyEntries
        .filter(e => e.id !== id)
        .map((e, i) => ({ ...e, index: i + 1 }))
    };
    saveToStorage(newData);
  };

  const addMainEntry = (roomNo: string, description: string, method: PaymentMethod, cashIn: number, cashOut: number) => {
    const newEntry: MainEntry = {
      id: crypto.randomUUID(),
      roomNo,
      description,
      method,
      cashIn,
      cashOut
    };
    saveToStorage({ ...data, mainEntries: [...data.mainEntries, newEntry] });
  };

  const deleteMainEntry = (id: string) => {
    saveToStorage({ ...data, mainEntries: data.mainEntries.filter(e => e.id !== id) });
  };

  const performDayEnd = () => {
    const outCash = data.outPartyEntries.filter(e => e.method === PaymentMethod.CASH).reduce((acc, e) => acc + e.amount, 0);
    const outCard = data.outPartyEntries.filter(e => e.method === PaymentMethod.CARD).reduce((acc, e) => acc + e.amount, 0);
    const outPaypal = data.outPartyEntries.filter(e => e.method === PaymentMethod.PAYPAL).reduce((acc, e) => acc + e.amount, 0);
    const mainCashIn = data.mainEntries.reduce((acc, e) => acc + e.cashIn, 0) + (outCash + outCard + outPaypal);
    const mainCashOut = data.mainEntries.reduce((acc, e) => acc + e.cashOut, 0) + (outCard + outPaypal);
    const finalBalance = mainCashIn - mainCashOut;

    const nextDay = new Date();
    nextDay.setDate(nextDay.getDate() + 1);
    const newData = createInitialData(nextDay.toLocaleDateString());
    newData.openingBalance = finalBalance;
    saveToStorage(newData);
  };

  return {
    data,
    bookId,
    isSyncing,
    setSyncKey,
    addOutPartyEntry,
    deleteOutPartyEntry,
    addMainEntry,
    deleteMainEntry,
    performDayEnd
  };
};
