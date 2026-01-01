
import React, { useState } from 'react';
import { DeviceType, CurrencyRates, UserRole } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  deviceType: DeviceType;
  role: UserRole;
  rates: CurrencyRates | null;
  date: string;
  bookId: string;
  syncStatus: string;
  isSyncing: boolean;
  onUpdateKey: (key: string) => void;
  onToggleRole: () => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, role, rates, date, bookId, syncStatus, isSyncing, onUpdateKey, onToggleRole 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newKey, setNewKey] = useState('');

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="bg-slate-950 text-white p-5 sticky top-0 z-50 shadow-2xl border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-center gap-4">
          <div className="text-center lg:text-left">
            <h1 className="text-2xl font-black tracking-tighter uppercase italic leading-none">SHIVAS BEACH CABANAS</h1>
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mt-2">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{date}</p>
              <span className="w-1 h-1 rounded-full bg-slate-700"></span>
              <div className="flex items-center gap-2 bg-slate-900 px-3 py-1 rounded border border-slate-800">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Book ID:</span>
                <span className="text-xs font-black text-blue-400 tracking-widest">{bookId}</span>
              </div>
              <button onClick={() => setIsModalOpen(true)} className="text-[10px] font-black bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded uppercase transition-colors">Change ID</button>
              
              <button 
                onClick={onToggleRole}
                className={`text-[10px] font-black px-3 py-1 rounded uppercase transition-all ${role === UserRole.ADMIN ? 'bg-emerald-600 text-white shadow-[0_0_10px_rgba(5,150,105,0.4)]' : 'bg-amber-600 text-white'}`}
              >
                MODE: {role} {role === UserRole.ADMIN ? '(MASTER)' : '(VIEWER)'}
              </button>

              <div className="text-[10px] font-black uppercase text-slate-500 flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-yellow-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                {syncStatus}
              </div>
            </div>
          </div>
          
          <div className="flex gap-4 items-center bg-slate-900 px-4 py-2 rounded-xl border border-slate-800">
            {rates ? (
              <div className="flex gap-4 text-xs font-black">
                <span className="text-emerald-400">USD {rates.usdToLkr}</span>
                <span className="text-blue-400">EUR {rates.eurToLkr}</span>
              </div>
            ) : <span className="text-[10px] text-slate-500 font-black animate-pulse">CONNECTING TO MARKETS...</span>}
          </div>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-slate-900 border-2 border-slate-800 p-8 rounded-3xl shadow-2xl w-full max-w-md">
              <h3 className="text-xl font-black uppercase mb-2 text-white">Device Pairing</h3>
              <p className="text-xs text-slate-400 mb-6 uppercase leading-relaxed font-bold">Enter your unique Book ID to link this phone with your laptop. Both must have the same ID to see the same money.</p>
              <input 
                type="text" 
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                placeholder="SHIVA-XXXX"
                className="w-full bg-black border-2 border-slate-800 rounded-xl p-4 text-white font-black tracking-widest placeholder-slate-800 text-center uppercase mb-6"
              />
              <div className="flex gap-4">
                <button onClick={() => setIsModalOpen(false)} className="flex-1 bg-slate-800 py-4 rounded-xl font-black uppercase tracking-widest text-xs text-white">Cancel</button>
                <button onClick={() => { onUpdateKey(newKey); setIsModalOpen(false); }} className="flex-1 bg-blue-600 py-4 rounded-xl font-black uppercase tracking-widest text-xs text-white shadow-lg shadow-blue-500/20">Link Book</button>
              </div>
            </div>
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
