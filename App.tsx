
import React, { useState, useEffect, useMemo } from 'react';
import Layout from './components/Layout';
import CashSection from './components/CashSection';
import HistorySection from './components/HistorySection';
import { useCashBookStore } from './store';
import { DeviceType, CurrencyRates } from './types';
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
    isSyncing,
    lastSyncTime,
    setSyncKey, 
    addOutPartyEntry, 
    deleteOutPartyEntry,
    addMainEntry, 
    deleteMainEntry,
    performDayEnd 
  } = useCashBookStore(detectedDevice);

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
      rates={rates} 
      date={data.date} 
      bookId={bookId} 
      isSyncingStatus={isSyncing}
      lastSyncTime={lastSyncTime}
      onUpdateKey={setSyncKey}
    >
      <CashSection 
        deviceType={detectedDevice}
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
      
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900 text-slate-400 text-[10px] p-1 text-center font-bold tracking-widest uppercase border-t border-slate-800 backdrop-blur-md bg-opacity-95 z-50">
        Book ID: {bookId} • {detectedDevice} VIEW • Cloud Status: {isSyncing ? 'Synchronizing...' : 'Live'}
      </div>
    </Layout>
  );
};

export default App;
