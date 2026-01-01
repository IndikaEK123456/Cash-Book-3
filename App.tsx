
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import CashSection from './components/CashSection';
import { useCashBookStore } from './store';
import { DeviceType, CurrencyRates } from './types';
import { fetchLiveRates } from './services/geminiService';

const App: React.FC = () => {
  const [deviceType, setDeviceType] = useState<DeviceType>(DeviceType.LAPTOP);
  const [rates, setRates] = useState<CurrencyRates | null>(null);
  const { 
    data, 
    bookId, 
    setSyncKey, 
    addOutPartyEntry, 
    deleteOutPartyEntry,
    addMainEntry, 
    deleteMainEntry,
    performDayEnd 
  } = useCashBookStore();

  // Device Detection
  useEffect(() => {
    const ua = navigator.userAgent;
    if (/Android/i.test(ua)) {
      setDeviceType(DeviceType.ANDROID);
    } else if (/iPhone|iPad|iPod/i.test(ua)) {
      setDeviceType(DeviceType.IPHONE);
    } else {
      setDeviceType(DeviceType.LAPTOP);
    }
  }, []);

  // Fetch Rates every 10 minutes
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
      deviceType={deviceType} 
      rates={rates} 
      date={data.date} 
      bookId={bookId} 
      onUpdateKey={setSyncKey}
    >
      <CashSection 
        deviceType={deviceType}
        outPartyEntries={data.outPartyEntries}
        mainEntries={data.mainEntries}
        onAddOutParty={addOutPartyEntry}
        onDeleteOutParty={deleteOutPartyEntry}
        onAddMain={addMainEntry}
        onDeleteMain={deleteMainEntry}
        onDayEnd={performDayEnd}
        openingBalance={data.openingBalance}
      />
      
      {/* Footer Info */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900 text-slate-400 text-[10px] p-1 text-center font-bold tracking-widest uppercase border-t border-slate-800">
        Active Shared Book: {bookId} • Shivas Beach Cabanas • Live Cloud Engine
      </div>
    </Layout>
  );
};

export default App;
