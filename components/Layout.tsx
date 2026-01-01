
import React, { useState } from 'react';
import { DeviceType, CurrencyRates } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  deviceType: DeviceType;
  rates: CurrencyRates | null;
  date: string;
  bookId: string;
  isSyncingStatus: boolean;
  lastSyncTime: string;
  onUpdateKey: (key: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, deviceType, rates, date, bookId, isSyncingStatus, lastSyncTime, onUpdateKey }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newKey, setNewKey] = useState('');

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateKey(newKey);
    setIsModalOpen(false);
    setNewKey('');
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="bg-slate-950 text-white p-5 sticky top-0 z-50 shadow-2xl border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-center gap-6">
          <div className="text-center lg:text-left">
            <h1 className="text-3xl font-black tracking-tighter uppercase italic leading-none">SHIVAS BEACH CABANAS</h1>
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mt-2">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{date}</p>
              <span className="w-1 h-1 rounded-full bg-slate-700"></span>
              <div className="flex items-center gap-2 bg-slate-900 px-3 py-1 rounded border border-slate-800">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Book ID:</span>
                <span className="text-xs font-black text-blue-400 select-all tracking-widest">{bookId}</span>
              </div>
              <button 
                onClick={() => setIsModalOpen(!isModalOpen)}
                className="text-[10px] font-black bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded uppercase transition-colors"
              >
                Change ID
              </button>
              
              <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 ml-2">
                {isSyncingStatus ? (
                   <span className="text-yellow-500 animate-pulse">● Syncing...</span>
                ) : (
                   <span>Synced: {lastSyncTime}</span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex gap-8 items-center bg-slate-900 px-6 py-3 rounded-2xl border border-slate-800 shadow-inner">
            {rates ? (
              <>
                <div className="flex flex-col items-start">
                  <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">USD RATE</span>
                  <span className="text-xl font-black text-green-400 leading-none">Rs. {rates.usdToLkr}</span>
                </div>
                <div className="w-px h-10 bg-slate-800"></div>
                <div className="flex flex-col items-start">
                  <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">EURO RATE</span>
                  <span className="text-xl font-black text-blue-400 leading-none">Rs. {rates.eurToLkr}</span>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Live Rates...</span>
              </div>
            )}
          </div>
        </div>

        {isModalOpen && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 bg-slate-900 border-2 border-slate-800 p-6 rounded-3xl shadow-2xl z-[60] w-full max-w-md">
            <h3 className="text-lg font-black uppercase mb-4 tracking-widest text-white">Cloud Connect</h3>
            <p className="text-xs text-slate-400 mb-6 font-medium leading-relaxed uppercase">
              Enter the Book ID to sync data between your Laptop and Mobile devices globally.
            </p>
            <form onSubmit={handleConnect} className="space-y-4">
              <input 
                type="text" 
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                placeholder="SHIVA-XXXX"
                className="w-full bg-black border-2 border-slate-800 rounded-xl p-4 text-white font-black tracking-widest placeholder-slate-700 text-center uppercase focus:border-blue-500 focus:outline-none"
              />
              <div className="flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-slate-800 py-3 rounded-xl font-black uppercase tracking-widest text-xs text-white">Cancel</button>
                <button type="submit" className="flex-1 bg-blue-600 py-3 rounded-xl font-black uppercase tracking-widest text-xs text-white">Connect</button>
              </div>
            </form>
          </div>
        )}
      </header>
      <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-12">
        {children}
      </main>
    </div>
  );
};

export default Layout;
