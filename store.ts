
import { useState, useEffect } from 'react';
import { DailyRecord, OutPartyEntry, MainEntry, PaymentMethod } from './types';

const BASE_STORAGE_KEY = 'SHIVAS_CASH_BOOK_';
const HISTORY_KEY = 'SHIVAS_CASH_BOOK_HISTORY';
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

  // Save current book ID
  useEffect(() => {
    localStorage.setItem(ACTIVE_KEY_STORAGE, bookId);
  }, [bookId]);

  // Sync logic: listen for changes in other tabs/windows
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

  const saveToStorage = (newData: DailyRecord) => {
    localStorage.setItem(BASE_STORAGE_KEY + bookId, JSON.stringify(newData));
    setData(newData);
  };

  const setSyncKey = (newKey: string) => {
    const cleanKey = newKey.trim().toUpperCase();
    if (cleanKey) {
      setBookId(cleanKey);
      const saved = localStorage.getItem(BASE_STORAGE_KEY + cleanKey);
      setData(saved ? JSON.parse(saved) : createInitialData());
    }
  };

  const addOutPartyEntry = (amount: number, method: PaymentMethod) => {
    const newEntry: OutPartyEntry = {
      id: crypto.randomUUID(),
      index: data.outPartyEntries.length + 1,
      method,
      amount
    };
    const newData = { ...data, outPartyEntries: [...data.outPartyEntries, newEntry] };
    saveToStorage(newData);
  };

  const deleteOutPartyEntry = (id: string) => {
    const newData = { 
      ...data, 
      outPartyEntries: data.outPartyEntries
        .filter(e => e.id !== id)
        .map((e, i) => ({ ...e, index: i + 1 })) // Re-index after delete
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
    const newData = { ...data, mainEntries: [...data.mainEntries, newEntry] };
    saveToStorage(newData);
  };

  const deleteMainEntry = (id: string) => {
    const newData = {
      ...data,
      mainEntries: data.mainEntries.filter(e => e.id !== id)
    };
    saveToStorage(newData);
  };

  const performDayEnd = () => {
    const outCash = data.outPartyEntries.filter(e => e.method === PaymentMethod.CASH).reduce((acc, e) => acc + e.amount, 0);
    const outCard = data.outPartyEntries.filter(e => e.method === PaymentMethod.CARD).reduce((acc, e) => acc + e.amount, 0);
    const outPaypal = data.outPartyEntries.filter(e => e.method === PaymentMethod.PAYPAL).reduce((acc, e) => acc + e.amount, 0);

    const mainCashIn = data.mainEntries.reduce((acc, e) => acc + e.cashIn, 0) + (outCash + outCard + outPaypal);
    const mainCashOut = data.mainEntries.reduce((acc, e) => acc + e.cashOut, 0) + (outCard + outPaypal);
    const finalBalance = mainCashIn - mainCashOut;

    const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    history.push({ ...data, finalBalance, bookId });
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));

    const nextDay = new Date();
    nextDay.setDate(nextDay.getDate() + 1);
    const newData = createInitialData(nextDay.toLocaleDateString());
    newData.openingBalance = finalBalance;
    saveToStorage(newData);
  };

  return {
    data,
    bookId,
    setSyncKey,
    addOutPartyEntry,
    deleteOutPartyEntry,
    addMainEntry,
    deleteMainEntry,
    performDayEnd
  };
};
