
import { useState, useEffect, useCallback, useRef } from 'react';
import { DailyRecord, HistoryRecord, AppState, OutPartyEntry, MainEntry, PaymentMethod, UserRole, DeviceType } from './types';
import { pushToCloud, fetchFromCloud } from './services/syncService';

const STORAGE_KEY = 'SHIVAS_CASHBOOK_STATE';
const BOOK_ID_KEY = 'SHIVAS_BOOK_ID';
const ROLE_KEY = 'SHIVAS_USER_ROLE';

const generateKey = () => `SHIVA-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

const createInitialDay = (dateStr?: string, opening: number = 0): DailyRecord => ({
  date: dateStr || new Date().toLocaleDateString(),
  outPartyEntries: [],
  mainEntries: [],
  openingBalance: opening,
  lastUpdated: Date.now()
});

export const useCashBookStore = () => {
  const [bookId, setBookId] = useState<string>(() => localStorage.getItem(BOOK_ID_KEY) || generateKey());
  const [role, setRole] = useState<UserRole>(() => (localStorage.getItem(ROLE_KEY) as UserRole) || UserRole.ADMIN);
  
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + bookId);
    return saved ? JSON.parse(saved) : { activeDay: createInitialDay(), history: [], role: UserRole.ADMIN };
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncMsg, setLastSyncMsg] = useState("Local Only");
  const lastProcessedCloudTime = useRef<number>(0);

  // Persistence logic
  const persist = useCallback(async (newState: AppState) => {
    localStorage.setItem(STORAGE_KEY + bookId, JSON.stringify(newState));
    setState(newState);

    if (role === UserRole.ADMIN) {
      setIsSyncing(true);
      const success = await pushToCloud(bookId, newState);
      setLastSyncMsg(success ? `Last Sync: ${new Date().toLocaleTimeString()}` : "Sync Error - Retrying...");
      setIsSyncing(false);
    }
  }, [bookId, role]);

  // Cloud Polling Logic
  useEffect(() => {
    const poll = async () => {
      // If we are ADMIN, we don't pull (we are the source of truth), 
      // UNLESS we just started and need to check if cloud has newer data.
      // For simplicity, VIEWERS always poll.
      if (role === UserRole.VIEWER) {
        setIsSyncing(true);
        const cloudState = await fetchFromCloud(bookId);
        if (cloudState && cloudState.activeDay?.lastUpdated) {
          if (cloudState.activeDay.lastUpdated > lastProcessedCloudTime.current) {
            setState(cloudState);
            lastProcessedCloudTime.current = cloudState.activeDay.lastUpdated;
            setLastSyncMsg(`Live Data: ${new Date().toLocaleTimeString()}`);
          }
        } else {
          setLastSyncMsg("Waiting for Admin...");
        }
        setIsSyncing(false);
      }
    };

    const interval = setInterval(poll, 3000);
    poll();
    return () => clearInterval(interval);
  }, [bookId, role]);

  const toggleRole = () => {
    const nextRole = role === UserRole.ADMIN ? UserRole.VIEWER : UserRole.ADMIN;
    setRole(nextRole);
    localStorage.setItem(ROLE_KEY, nextRole);
  };

  const updateBookId = async (newId: string) => {
    const cleanId = newId.trim().toUpperCase();
    if (!cleanId) return;
    
    setBookId(cleanId);
    localStorage.setItem(BOOK_ID_KEY, cleanId);
    
    // Immediate pull to check for data
    setIsSyncing(true);
    const cloud = await fetchFromCloud(cleanId);
    if (cloud) {
      setState(cloud);
      lastProcessedCloudTime.current = cloud.activeDay.lastUpdated || 0;
    }
    setIsSyncing(false);
  };

  const addOutPartyEntry = (amount: number, method: PaymentMethod) => {
    const newEntry = { id: crypto.randomUUID(), index: state.activeDay.outPartyEntries.length + 1, method, amount };
    persist({ ...state, activeDay: { ...state.activeDay, outPartyEntries: [...state.activeDay.outPartyEntries, newEntry] } });
  };

  const deleteOutPartyEntry = (id: string) => {
    const newEntries = state.activeDay.outPartyEntries.filter(e => e.id !== id).map((e, i) => ({ ...e, index: i + 1 }));
    persist({ ...state, activeDay: { ...state.activeDay, outPartyEntries: newEntries } });
  };

  const addMainEntry = (roomNo: string, description: string, method: PaymentMethod, cashIn: number, cashOut: number) => {
    const newEntry = { id: crypto.randomUUID(), roomNo, description, method, cashIn, cashOut };
    persist({ ...state, activeDay: { ...state.activeDay, mainEntries: [...state.activeDay.mainEntries, newEntry] } });
  };

  const deleteMainEntry = (id: string) => {
    persist({ ...state, activeDay: { ...state.activeDay, mainEntries: state.activeDay.mainEntries.filter(e => e.id !== id) } });
  };

  const performDayEnd = () => {
    const active = state.activeDay;
    const opTotal = active.outPartyEntries.reduce((acc, e) => acc + e.amount, 0);
    const mainIn = active.mainEntries.reduce((acc, e) => acc + e.cashIn, 0);
    const mainOut = active.mainEntries.reduce((acc, e) => acc + e.cashOut, 0);
    
    // Correct Grand Logic: Main In + OP (since OP is external collection) vs Main Out
    const totalIn = mainIn + opTotal;
    const totalOut = mainOut;
    const finalBalance = totalIn - totalOut;

    const archive: HistoryRecord = { ...active, totalIn, totalOut, finalBalance };
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    persist({
      ...state,
      history: [archive, ...state.history],
      activeDay: createInitialDay(tomorrow.toLocaleDateString(), finalBalance)
    });
  };

  return {
    data: state.activeDay,
    history: state.history,
    bookId,
    role,
    isSyncing,
    lastSyncMsg,
    toggleRole,
    updateBookId,
    addOutPartyEntry,
    deleteOutPartyEntry,
    addMainEntry,
    deleteMainEntry,
    performDayEnd
  };
};
