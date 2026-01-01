
import { useState, useEffect, useCallback } from 'react';
import { DailyRecord, OutPartyEntry, MainEntry, PaymentMethod } from './types';

const BASE_STORAGE_KEY = 'SHIVAS_CASH_BOOK_';
const ACTIVE_KEY_STORAGE = 'SHIVAS_ACTIVE_BOOK_ID';

const generateKey = () => `SHIVA-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

const createInitialData = (dateStr?: string): DailyRecord => ({
  date: dateStr || new Date().toLocaleDateString(),
  outPartyEntries: [],
  mainEntries: [],
  openingBalance: 0
});

export const useCashBookStore = () => {
  const [bookId, setBookId] = useState<string>(() => {
    return localStorage.getItem(ACTIVE_KEY_STORAGE) || generateKey();
  });

  const [data, setData] = useState<DailyRecord>(() => {
    const saved = localStorage.getItem(BASE_STORAGE_KEY + bookId);
    return saved ? JSON.parse(saved) : createInitialData();
  });

  const [isSyncing, setIsSyncing] = useState(false);

  // Sync logic: listen for changes in other tabs/windows (Cross-tab simulation)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === BASE_STORAGE_KEY + bookId && e.newValue) {
        setData(JSON.parse(e.newValue));
      }
      if (e.key === ACTIVE_KEY_STORAGE && e.newValue) {
        setBookId(e.newValue);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [bookId]);

  const saveToStorage = useCallback((newData: DailyRecord) => {
    localStorage.setItem(BASE_STORAGE_KEY + bookId, JSON.stringify(newData));
    localStorage.setItem(ACTIVE_KEY_STORAGE, bookId);
    setData(newData);
    
    // Trigger storage event manually for the same window (useful for some listeners)
    window.dispatchEvent(new StorageEvent('storage', {
      key: BASE_STORAGE_KEY + bookId,
      newValue: JSON.stringify(newData)
    }));
  }, [bookId]);

  const setSyncKey = (newKey: string) => {
    const cleanKey = newKey.trim().toUpperCase();
    if (cleanKey) {
      setIsSyncing(true);
      setBookId(cleanKey);
      localStorage.setItem(ACTIVE_KEY_STORAGE, cleanKey);
      
      // Attempt to load from local storage first
      const saved = localStorage.getItem(BASE_STORAGE_KEY + cleanKey);
      if (saved) {
        setData(JSON.parse(saved));
        setIsSyncing(false);
      } else {
        // If not found locally (likely first time on this device), we'd fetch from cloud
        // For now, we initialize blank and wait for the "Laptop" to broadcast via storage event
        // or the user to manually enter data.
        setData(createInitialData());
        setTimeout(() => setIsSyncing(false), 800);
      }
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
    // Existing day end logic...
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
