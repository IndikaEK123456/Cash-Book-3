
import React, { useState } from 'react';
import { HistoryRecord } from '../types';

interface HistorySectionProps {
  history: HistoryRecord[];
}

const HistorySection: React.FC<HistorySectionProps> = ({ history }) => {
  const [selectedDay, setSelectedDay] = useState<HistoryRecord | null>(null);

  if (history.length === 0) return (
    <div className="text-center p-12 bg-white rounded-3xl border-2 border-dashed border-slate-200">
      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No Day-End history saved yet.</p>
    </div>
  );

  return (
    <section className="space-y-6">
      <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.4em] text-center">Archives & Daily Reports</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {history.map((record, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedDay(record)}>
            <div className="flex justify-between items-start mb-4">
              <span className="bg-slate-100 px-3 py-1 rounded-full text-[10px] font-black text-slate-500 uppercase">{record.date}</span>
              <span className="text-[10px] font-black text-emerald-600 uppercase">CLOSED</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Total In</span>
                <span className="font-bold text-slate-900">Rs. {record.totalIn.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Total Out</span>
                <span className="font-bold text-slate-900 text-red-500">Rs. {record.totalOut.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Final Balance</span>
                <span className="text-xl font-black text-emerald-600">Rs. {record.finalBalance.toLocaleString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedDay && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[200] flex items-center justify-center p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-4xl p-8 shadow-2xl relative">
            <button onClick={() => setSelectedDay(null)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 text-2xl font-bold">&times;</button>
            <h3 className="text-2xl font-black uppercase mb-6">Report: {selectedDay.date}</h3>
            
            <div className="space-y-8">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Receipts</p>
                  <p className="text-lg font-bold">Rs. {selectedDay.totalIn.toLocaleString()}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Expenses</p>
                  <p className="text-lg font-bold text-red-500">Rs. {selectedDay.totalOut.toLocaleString()}</p>
                </div>
                <div className="bg-emerald-50 p-4 rounded-2xl">
                  <p className="text-[10px] font-black text-emerald-400 uppercase mb-1">Balance Carried</p>
                  <p className="text-lg font-black text-emerald-600">Rs. {selectedDay.finalBalance.toLocaleString()}</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-100 uppercase tracking-tighter font-black">
                      <th className="p-3 rounded-l-xl">Room/Type</th>
                      <th className="p-3">Description</th>
                      <th className="p-3">Method</th>
                      <th className="p-3 text-right">In</th>
                      <th className="p-3 text-right rounded-r-xl">Out</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedDay.mainEntries.map((e, idx) => (
                      <tr key={idx}>
                        <td className="p-3 font-bold">{e.roomNo || '-'}</td>
                        <td className="p-3 text-slate-500">{e.description}</td>
                        <td className="p-3 font-bold">{e.method}</td>
                        <td className="p-3 text-right text-emerald-600 font-bold">{e.cashIn.toLocaleString()}</td>
                        <td className="p-3 text-right text-red-400">{e.cashOut.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default HistorySection;
