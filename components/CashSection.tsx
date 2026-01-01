
import React, { useState } from 'react';
import { DeviceType, OutPartyEntry, MainEntry, PaymentMethod } from '../types';
import { getMethodColor, COLORS } from '../constants';

interface CashSectionProps {
  deviceType: DeviceType;
  outPartyEntries: OutPartyEntry[];
  mainEntries: MainEntry[];
  onAddOutParty: (amount: number, method: PaymentMethod) => void;
  onDeleteOutParty: (id: string) => void;
  onAddMain: (roomNo: string, desc: string, method: PaymentMethod, cin: number, cout: number) => void;
  onDeleteMain: (id: string) => void;
  onDayEnd: () => void;
  openingBalance: number;
}

const CashSection: React.FC<CashSectionProps> = ({
  deviceType,
  outPartyEntries,
  mainEntries,
  onAddOutParty,
  onDeleteOutParty,
  onAddMain,
  onDeleteMain,
  onDayEnd,
}) => {
  const isViewer = deviceType !== DeviceType.LAPTOP;

  // Form states
  const [opAmount, setOpAmount] = useState('');
  const [opMethod, setOpMethod] = useState<PaymentMethod>(PaymentMethod.CASH);

  const [mRoom, setMRoom] = useState('');
  const [mDesc, setMDesc] = useState('');
  const [mMethod, setMMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [mCin, setMCin] = useState('');
  const [mCout, setMCout] = useState('');

  // --- Calculations ---

  // Out Party Totals
  const opCashTotal = outPartyEntries.filter(e => e.method === PaymentMethod.CASH).reduce((acc, e) => acc + e.amount, 0);
  const opCardTotal = outPartyEntries.filter(e => e.method === PaymentMethod.CARD).reduce((acc, e) => acc + e.amount, 0);
  const opPayPalTotal = outPartyEntries.filter(e => e.method === PaymentMethod.PAYPAL).reduce((acc, e) => acc + e.amount, 0);

  // Main Section Method-specific Totals (Receipts)
  const mainCashInTotal = mainEntries.filter(e => e.method === PaymentMethod.CASH).reduce((acc, e) => acc + e.cashIn, 0);
  const mainCardInTotal = mainEntries.filter(e => e.method === PaymentMethod.CARD).reduce((acc, e) => acc + e.cashIn, 0);
  const mainPayPalInTotal = mainEntries.filter(e => e.method === PaymentMethod.PAYPAL).reduce((acc, e) => acc + e.cashIn, 0);

  // Main Section Method-specific Totals (Expenses)
  const mainCashOutTotal = mainEntries.filter(e => e.method === PaymentMethod.CASH).reduce((acc, e) => acc + e.cashOut, 0);
  const mainCardOutTotal = mainEntries.filter(e => e.method === PaymentMethod.CARD).reduce((acc, e) => acc + e.cashOut, 0);
  const mainPayPalOutTotal = mainEntries.filter(e => e.method === PaymentMethod.PAYPAL).reduce((acc, e) => acc + e.cashOut, 0);

  // Aggregated Totals for Summary Cards (Adding Out Party to Main)
  const combinedCashIn = mainCashInTotal + opCashTotal;
  const combinedCardIn = mainCardInTotal + opCardTotal;
  const combinedPayPalIn = mainPayPalInTotal + opPayPalTotal;

  // Grand Totals for Summary
  const totalBookCashIn = mainEntries.reduce((acc, e) => acc + e.cashIn, 0) + opCashTotal + opCardTotal + opPayPalTotal;
  const totalBookCashOut = mainEntries.reduce((acc, e) => acc + e.cashOut, 0) + opCardTotal + opPayPalTotal;
  const finalBalance = totalBookCashIn - totalBookCashOut;

  const handleOpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!opAmount) return;
    onAddOutParty(Number(opAmount), opMethod);
    setOpAmount('');
  };

  const handleMainSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddMain(mRoom, mDesc, mMethod, Number(mCin) || 0, Number(mCout) || 0);
    setMRoom('');
    setMDesc('');
    setMCin('');
    setMCout('');
  };

  const inputClass = "w-full bg-slate-950 text-white border-2 border-slate-800 rounded-lg p-3 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-slate-500 transition-all";

  return (
    <div className="space-y-12">
      {/* 1. Grand Summary Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-600 text-white p-8 rounded-3xl shadow-2xl border-b-8 border-blue-800">
          <p className="text-xs font-black opacity-80 uppercase tracking-[0.2em]">Grand Cash In Total</p>
          <p className="text-5xl font-black mt-3 flex items-baseline truncate">
            <span className="text-2xl mr-1">Rs.</span> {totalBookCashIn.toLocaleString()}
          </p>
        </div>
        <div className="bg-red-600 text-white p-8 rounded-3xl shadow-2xl border-b-8 border-red-800">
          <p className="text-xs font-black opacity-80 uppercase tracking-[0.2em]">Grand Cash Out Total</p>
          <p className="text-5xl font-black mt-3 flex items-baseline truncate">
            <span className="text-2xl mr-1">Rs.</span> {totalBookCashOut.toLocaleString()}
          </p>
        </div>
        <div className="bg-emerald-600 text-white p-8 rounded-3xl shadow-2xl border-b-8 border-emerald-800 ring-8 ring-emerald-500/20">
          <p className="text-xs font-black opacity-80 uppercase tracking-[0.2em]">Final Balance</p>
          <p className="text-5xl font-black mt-3 flex items-baseline truncate">
            <span className="text-2xl mr-1">Rs.</span> {finalBalance.toLocaleString()}
          </p>
        </div>
      </div>

      {/* 2. Out Party Section */}
      <section className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        <div className="bg-slate-900 border-b border-slate-800 p-5 flex justify-between items-center">
          <h2 className="text-lg font-black text-white uppercase tracking-widest">Out Party Section</h2>
          {!isViewer && (
            <button onClick={onDayEnd} className="bg-red-600 hover:bg-red-700 active:scale-95 text-white px-8 py-2.5 rounded-xl font-black shadow-lg transition-all text-xs uppercase tracking-wider">
              HIT DAY END
            </button>
          )}
        </div>

        <div className="p-6">
          {!isViewer && (
            <form onSubmit={handleOpSubmit} className="mb-10 grid grid-cols-1 sm:grid-cols-3 gap-6 items-end bg-slate-100 p-6 rounded-2xl border-2 border-slate-200">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest">Entry Method</label>
                <select value={opMethod} onChange={(e) => setOpMethod(e.target.value as PaymentMethod)} className={inputClass}>
                  <option value={PaymentMethod.CASH}>CASH</option>
                  <option value={PaymentMethod.CARD}>CARD</option>
                  <option value={PaymentMethod.PAYPAL}>PAY PAL</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest">Amount (Rs.)</label>
                <input type="number" value={opAmount} onChange={(e) => setOpAmount(e.target.value)} placeholder="0.00" className={inputClass} />
              </div>
              <button type="submit" className="bg-blue-600 h-[52px] text-white px-6 rounded-lg font-black hover:bg-blue-700 transition-colors uppercase tracking-widest text-sm shadow-md">Add Out Party</button>
            </form>
          )}

          <div className="overflow-x-auto rounded-xl border border-slate-200 mb-8">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">
                  <th className="p-4 border-b border-slate-800 w-16">No.</th>
                  <th className="p-4 border-b border-slate-800">Method</th>
                  <th className="p-4 border-b border-slate-800">Amount</th>
                  {!isViewer && <th className="p-4 border-b border-slate-800 w-24 text-center">Action</th>}
                </tr>
              </thead>
              <tbody className="font-bold text-slate-900 text-sm">
                {outPartyEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50 border-b border-slate-100 transition-colors">
                    <td className="p-4 text-slate-500">{entry.index}</td>
                    <td className={`p-4 ${getMethodColor(entry.method)}`}>{entry.method}</td>
                    <td className="p-4">Rs. {entry.amount.toLocaleString()}</td>
                    {!isViewer && (
                      <td className="p-4 text-center">
                        <button onClick={() => onDeleteOutParty(entry.id)} className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Out Party Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-5 rounded-2xl border-2 border-blue-100 shadow-sm">
              <span className="text-[10px] font-black text-blue-800 uppercase block mb-2 tracking-widest">OP Cash Total</span>
              <span className="text-2xl font-black text-blue-900">Rs. {opCashTotal.toLocaleString()}</span>
            </div>
            <div className="bg-yellow-50 p-5 rounded-2xl border-2 border-yellow-100 shadow-sm">
              <span className="text-[10px] font-black text-yellow-800 uppercase block mb-2 tracking-widest">OP Card Total</span>
              <span className="text-2xl font-black text-yellow-900">Rs. {opCardTotal.toLocaleString()}</span>
            </div>
            <div className="bg-purple-50 p-5 rounded-2xl border-2 border-purple-100 shadow-sm">
              <span className="text-[10px] font-black text-purple-800 uppercase block mb-2 tracking-widest">OP PayPal Total</span>
              <span className="text-2xl font-black text-purple-900">Rs. {opPayPalTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Main Transaction Section */}
      <section className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        <div className="bg-slate-900 border-b border-slate-800 p-5">
          <h2 className="text-lg font-black text-white uppercase tracking-widest">Main Transaction Section</h2>
        </div>

        <div className="p-6">
          {!isViewer && (
            <form onSubmit={handleMainSubmit} className="mb-10 space-y-6 bg-slate-100 p-6 rounded-2xl border-2 border-slate-200">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 items-end">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest">Room No</label>
                  <input type="text" value={mRoom} onChange={(e) => setMRoom(e.target.value)} className={inputClass} placeholder="Room #" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest">Method</label>
                  <select value={mMethod} onChange={(e) => setMMethod(e.target.value as PaymentMethod)} className={inputClass}>
                    <option value={PaymentMethod.CASH}>CASH</option>
                    <option value={PaymentMethod.CARD}>CARD</option>
                    <option value={PaymentMethod.PAYPAL}>PAY PAL</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest">Cash In (Rs.)</label>
                  <input type="number" value={mCin} onChange={(e) => setMCin(e.target.value)} className={inputClass} placeholder="0" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest">Cash Out (Rs.)</label>
                  <input type="number" value={mCout} onChange={(e) => setMCout(e.target.value)} className={inputClass} placeholder="0" />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-6 items-end">
                <div className="flex-1">
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest">Detailed Description</label>
                  <textarea value={mDesc} onChange={(e) => setMDesc(e.target.value)} rows={2} className={inputClass} placeholder="Transaction details..."></textarea>
                </div>
                <button type="submit" className="w-full sm:w-auto bg-slate-900 text-white px-10 h-[52px] rounded-lg font-black hover:bg-black transition-all uppercase tracking-widest text-sm shadow-xl">Post Entry</button>
              </div>
            </form>
          )}

          <div className="overflow-x-auto rounded-xl border border-slate-200 mb-8">
            <table className="w-full text-left border-collapse min-w-[950px]">
              <thead>
                <tr className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">
                  <th className="p-4 border-b border-slate-800 w-24">Room</th>
                  <th className="p-4 border-b border-slate-800 min-w-[350px]">Descriptions</th>
                  <th className="p-4 border-b border-slate-800 w-32">Method</th>
                  <th className="p-4 border-b border-slate-800 w-44">Cash In</th>
                  <th className="p-4 border-b border-slate-800 w-44">Cash Out</th>
                  {!isViewer && <th className="p-4 border-b border-slate-800 w-24 text-center">Action</th>}
                </tr>
              </thead>
              <tbody className="font-bold text-slate-950 text-sm">
                {(opCashTotal > 0 || opCardTotal > 0 || opPayPalTotal > 0) && (
                   <tr className="bg-slate-50 border-b-2 border-slate-200 italic">
                     <td className="p-4 text-slate-400">OP</td>
                     <td className="p-4 font-black">OUT PARTY TOTALS AGGREGATED</td>
                     <td className="p-4 text-slate-400">VARIOUS</td>
                     <td className={`p-4 ${COLORS.CASH_IN}`}>Rs. {(opCashTotal + opCardTotal + opPayPalTotal).toLocaleString()}</td>
                     <td className={`p-4 ${COLORS.CASH_OUT}`}>Rs. {(opCardTotal + opPayPalTotal).toLocaleString()}</td>
                     {!isViewer && <td className="p-4"></td>}
                   </tr>
                )}
                {mainEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50 border-b border-slate-100 transition-colors">
                    <td className="p-4">{entry.roomNo || '-'}</td>
                    <td className="p-4 leading-relaxed whitespace-pre-wrap">{entry.description}</td>
                    <td className={`p-4 ${getMethodColor(entry.method)}`}>{entry.method}</td>
                    <td className={`p-4 ${entry.cashIn > 0 ? COLORS.CASH_IN : 'text-slate-300'}`}>
                      {entry.cashIn > 0 ? `Rs. ${entry.cashIn.toLocaleString()}` : '0'}
                    </td>
                    <td className={`p-4 ${entry.cashOut > 0 ? COLORS.CASH_OUT : 'text-slate-300'}`}>
                      {entry.cashOut > 0 ? `Rs. ${entry.cashOut.toLocaleString()}` : '0'}
                    </td>
                    {!isViewer && (
                      <td className="p-4 text-center">
                        <button onClick={() => onDeleteMain(entry.id)} className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Main Section Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Cash Summary Card */}
            <div className="bg-blue-50 p-5 rounded-2xl border-2 border-blue-100 shadow-sm">
              <span className="text-[10px] font-black text-blue-800 uppercase block mb-2 tracking-widest">Main Cash Summary</span>
              <div className="flex justify-between items-baseline">
                <span className="text-xl font-black text-blue-900" title="Main In + Out Party Cash In">In: Rs. {combinedCashIn.toLocaleString()}</span>
                <span className="text-sm font-bold text-red-600" title="Main Out">Out: {mainCashOutTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Card Summary Card */}
            <div className="bg-yellow-50 p-5 rounded-2xl border-2 border-yellow-100 shadow-sm">
              <span className="text-[10px] font-black text-yellow-800 uppercase block mb-2 tracking-widest">Main Card Summary</span>
              <div className="flex justify-between items-baseline">
                <span className="text-xl font-black text-yellow-900" title="Main In + Out Party Card In">In: Rs. {combinedCardIn.toLocaleString()}</span>
                <span className="text-sm font-bold text-red-600" title="Out Party Card Portion">OP Out: {opCardTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* PayPal Summary Card */}
            <div className="bg-purple-50 p-5 rounded-2xl border-2 border-purple-100 shadow-sm">
              <span className="text-[10px] font-black text-purple-800 uppercase block mb-2 tracking-widest">Main PayPal Summary</span>
              <div className="flex justify-between items-baseline">
                <span className="text-xl font-black text-purple-900" title="Main In + Out Party PayPal In">In: Rs. {combinedPayPalIn.toLocaleString()}</span>
                <span className="text-sm font-bold text-red-600" title="Out Party PayPal Portion">OP Out: {opPayPalTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CashSection;
