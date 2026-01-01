
import React from 'react';
import { HistoryRecord } from '../types';

interface HistorySectionProps {
  history: HistoryRecord[];
}

const HistorySection: React.FC<HistorySectionProps> = ({ history }) => {
  if (history.length === 0) return null;

  return (
    <section className="bg-slate-50 rounded-2xl p-6 border-2 border-dashed border-slate-200">
      <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] mb-6 text-center">Archive & Previous Days</h2>
      <div className="space-y-4">
        {history.map((record, idx) => (
          <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Date</p>
              <p className="text-lg font-black text-slate-900">{record.date}</p>
            </div>
            <div className="grid grid-cols-3 gap-6 text-center md:text-left">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total In</p>
                <p className="font-bold text-blue-600">Rs. {record.totalIn.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Out</p>
                <p className="font-bold text-red-600">Rs. {record.totalOut.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Balance</p>
                <p className="font-bold text-emerald-600">Rs. {record.finalBalance.toLocaleString()}</p>
              </div>
            </div>
            <button className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors">
              View Full Report
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HistorySection;
