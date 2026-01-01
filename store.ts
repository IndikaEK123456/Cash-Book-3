
import { useState, useEffect, useCallback, useRef } from 'react';
import { DailyRecord, HistoryRecord, AppState, OutPartyEntry, MainEntry, PaymentMethod, DeviceType } from './types';
import { pushToCloud, fetchFromCloud } from './services/syncService';

const BASE_STORAGE_KEY = 'SHIVAS_APP_STATE_';
const ACTIVE_KEY_STORAGE = 'SHIVAS_ACTIVE_BOOK_ID';

const generateKey = () => `SHIVA-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

const createInitialDay = (dateStr?: string): DailyRecord => ({
  date: dateStr || new Date().toLocaleDateString(),
  outPartyEntries: [],
  mainEntries: [],
  openingBalance: 0,
  lastUpdated: Date.now()
});

export const useCashBookStore = (deviceType: DeviceType) => {
  const [bookId, setBookId] = useState<string>(() => {
    return localStorage.getItem(ACTIVE_KEY_STORAGE) || generateKey();
  });

  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(BASE_STORAGE_KEY + bookId);
    return saved ? JSON.parse(saved) : { activeDay: createInitialDay(), history: [] };
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>("Never");
  const lastCloudTimestamp = useRef<number>(0);

  // Sync with Cloud
  const triggerSync = useCallback(async (newState: AppState) => {
    if (deviceType === DeviceType.LAPTOP) {
      setIsSyncing(true);
      const success = await pushToCloud(bookId, newState);
      if (success) {
        setLastSyncTime(new Date().toLocaleTimeString());
        lastCloudTimestamp.current = newState.activeDay.lastUpdated || 0;
      }
      setIsSyncing(false);
    }
  }, [bookId, deviceType]);

  const updateState = useCallback((newState: AppState) => {
    localStorage.setItem(BASE_STORAGE_KEY + bookId, JSON.stringify(newState));
    localStorage.setItem(ACTIVE_KEY_STORAGE, bookId);
    setState(newState);
    triggerSync(newState);
  }, [bookId, triggerSync]);

  // Polling for Viewers (Mobile)
  useEffect(() => {
    if (deviceType === DeviceType.LAPTOP) return;

    const poll = async () => {
      setIsSyncing(true);
      const cloudState = await fetchFromCloud(bookId);
      if (cloudState && cloudState.activeDay.lastUpdated) {
        if (cloudState.activeDay.lastUpdated > lastCloudTimestamp.current) {
          setState(cloudState);
          localStorage.setItem(BASE_STORAGE_KEY + bookId, JSON.stringify(cloudState));
          lastCloudTimestamp.current = cloudState.activeDay.lastUpdated;
          setLastSyncTime(new Date().toLocaleTimeString());
        }
      }
      setIsSyncing(false);
    };

    const interval = setInterval(poll, 4000);
    poll();
    return () => clearInterval(interval);
  }, [bookId, deviceType]);

  const setSyncKey = async (newKey: string) => {
    const cleanKey = newKey.trim().toUpperCase();
    if (cleanKey) {
      setBookId(cleanKey);
      localStorage.setItem(ACTIVE_KEY_STORAGE, cleanKey);
      setIsSyncing(true);
      const cloudData = await fetchFromCloud(cleanKey);
      if (cloudData) {
        setState(cloudData);
        localStorage.setItem(BASE_STORAGE_KEY + cleanKey, JSON.stringify(cloudData));
      }
      setIsSyncing(false);
    }
  };

  const addOutPartyEntry = (amount: number, method: PaymentMethod) => {
    const newEntry: OutPartyEntry = {
      id: crypto.randomUUID(),
      index: state.activeDay.outPartyEntries.length + 1,
      method,
      amount
    };
    updateState({
      ...state,
      activeDay: {
        ...state.activeDay,
        outPartyEntries: [...state.activeDay.outPartyEntries, newEntry]
      }
    });
  };

  const deleteOutPartyEntry = (id: string) => {
    updateState({
      ...state,
      activeDay: {
        ...state.activeDay,
        outPartyEntries: state.activeDay.outPartyEntries
          .filter(e => e.id !== id)
          .map((e, i) => ({ ...e, index: i + 1 }))
      }
    });
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
    updateState({
      ...state,
      activeDay: {
        ...state.activeDay,
        mainEntries: [...state.activeDay.mainEntries, newEntry]
      }
    });
  };

  const deleteMainEntry = (id: string) => {
    updateState({
      ...state,
      activeDay: {
        ...state.activeDay,
        mainEntries: state.activeDay.mainEntries.filter(e => e.id !== id)
      }
    });
  };

  const performDayEnd = () => {
    const active = state.activeDay;
    const outCash = active.outPartyEntries.filter(e => e.method === PaymentMethod.CASH).reduce((acc, e) => acc + e.amount, 0);
    const outCard = active.outPartyEntries.filter(e => e.method === PaymentMethod.CARD).reduce((acc, e) => acc + e.amount, 0);
    const outPaypal = active.outPartyEntries.filter(e => e.method === PaymentMethod.PAYPAL).reduce((acc, e) => acc + e.amount, 0);
    
    const totalIn = active.mainEntries.reduce((acc, e) => acc + e.cashIn, 0) + outCash + outCard + outPaypal;
    const totalOut = active.mainEntries.reduce((acc, e) => acc + e.cashOut, 0) + outCard + outPaypal;
    const finalBalance = totalIn - totalOut;

    // Create Archive Record
    const archive: HistoryRecord = {
      ...active,
      finalBalance,
      totalIn,
      totalOut
    };

    const nextDayDate = new Date();
    nextDayDate.setDate(nextDayDate.getDate() + 1);
    
    updateState({
      history: [archive, ...state.history],
      activeDay: {
        ...createInitialDay(nextDayDate.toLocaleDateString()),
        openingBalance: finalBalance
      }
    });
  };

  return {
    data: state.activeDay,
    history: state.history,
    bookId,
    isSyncing,
    lastSyncTime,
    setSyncKey,
    addOutPartyEntry,
    deleteOutPartyEntry,
    addMainEntry,
    deleteMainEntry,
    performDayEnd
  };
};
