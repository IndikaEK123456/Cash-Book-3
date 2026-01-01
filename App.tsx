
import React, { useState, useEffect, useMemo } from 'react';
import Layout from './components/Layout';
import CashSection from './components/CashSection';
import HistorySection from './components/HistorySection';
import { useCashBookStore } from './store';
import { DeviceType, CurrencyRates, UserRole } from './types';
import { fetchLiveRates } from './services/geminiService';

const App: React.FC = () => {
  const detectedDevice = useMemo(() => {
    const ua = navigator.userAgent;
    if (/Android/i.test(ua)) return DeviceType.ANDROID;
    if (/iPhone|iPad|iPod/i.test(ua)) return DeviceType.IPHONE;
    return DeviceType.LAPTOP;
  }, []);

  const [rates, setRates] = useState<CurrencyRates | null>(null);
  
  const { 
    data, 
    history,
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
  } = useCashBookStore();

  useEffect(() => {
    const updateRates = async () => {
      const liveRates = await fetchLiveRates();
      if (liveRates) setRates(liveRates);
    };
    updateRates();
    const interval = setInterval(updateRates, 600000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Layout 
      deviceType={detectedDevice} 
      role={role}
      rates={rates} 
      date={data.date} 
      bookId={bookId} 
      syncStatus={lastSyncMsg}
      isSyncing={isSyncing}
      onUpdateKey={updateBookId}
      onToggleRole={toggleRole}
    >
      <CashSection 
        // We override the viewer check based on UserRole, not just DeviceType
        deviceType={role === UserRole.ADMIN ? DeviceType.LAPTOP : DeviceType.ANDROID}
        outPartyEntries={data.outPartyEntries}
        mainEntries={data.mainEntries}
        onAddOutParty={addOutPartyEntry}
        onDeleteOutParty={deleteOutPartyEntry}
        onAddMain={addMainEntry}
        onDeleteMain={deleteMainEntry}
        onDayEnd={performDayEnd}
        openingBalance={data.openingBalance}
      />

      <HistorySection history={history} />
      
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900 text-slate-400 text-[9px] p-2 text-center font-bold tracking-[0.2em] uppercase border-t border-slate-800 backdrop-blur-md bg-opacity-90 z-50">
        Active Book: {bookId} • {role} Mode • {lastSyncMsg}
      </div>
    </Layout>
  );
};

export default App;
