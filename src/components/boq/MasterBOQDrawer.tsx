import React, { useState } from 'react';
import { useBOQ } from '../../context/BOQContext';
import { useSettings, useGlobalSettings } from '../../context/SettingsContext';
import { X, FileText, Download, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MasterBOQDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { items, removeItem, updateItem, clearBOQ, contingency, setContingency, overheadProfit, setOverheadProfit, tax, setTax } = useBOQ();
  const { settings, formatCurrency } = useSettings();

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const contingencyAmount = (subtotal * contingency) / 100;
  const overheadAmount = (subtotal * overheadProfit) / 100;
  const taxableAmount = subtotal + contingencyAmount + overheadAmount;
  const taxAmount = (taxableAmount * tax) / 100;
  const grandTotal = taxableAmount + taxAmount;

  const { currentCurrency, setCurrentCurrency } = useGlobalSettings();
  const currencies = ['PKR', 'INR', 'USD', 'AED', 'GBP', 'EUR'];

  const exportCSV = () => {
    const headers = "Item Name,Category,Quantity,Unit,Rate,Amount\n";
    const rows = items.map(item => `"${item.name}","${item.category}",${item.quantity},"${item.unit}",${item.rate},${item.amount}`).join("\n");
    const summary = `\nSubtotal,,,,,${subtotal}\nContingency (${contingency}%),,,,,${contingencyAmount}\nOverhead/Profit (${overheadProfit}%),,,,,${overheadAmount}\nTax (${tax}%),,,,,${taxAmount}\nGrand Total,,,,,${grandTotal}`;
    
    const blob = new Blob([headers + rows + summary], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "Master_BOQ.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const exportPDF = () => {
    window.print();
  };
  

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="w-full max-w-lg bg-white h-full shadow-2xl relative z-10 flex flex-col"
          >
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <FileText className="text-indigo-600" /> Master BOQ
              </h2>
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 bg-white rounded-full shadow-sm">
                <X size={20} />
              </button>
            </div>
    <div className="px-6 py-3 border-b border-slate-100 bg-white flex justify-between items-center">
      <span className="text-sm font-semibold text-slate-600">Regional Rate Sync (Live):</span>
      <select 
        value={currentCurrency} 
        onChange={(e) => setCurrentCurrency(e.target.value as any)}
        className="text-sm border border-slate-200 rounded-lg px-2 py-1 bg-slate-50 font-bold text-indigo-700 outline-none"
      >
        {currencies.map(c => <option key={c} value={c}>{c}</option>)}
      </select>
    </div>
  

            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <div className="text-center py-12 text-slate-400 font-medium">
                  Your BOQ is empty. Add items from the calculators.
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-bold text-slate-900">{item.name}</h4>
                          <p className="text-xs font-semibold text-indigo-600 uppercase">{item.category}</p>
                        </div>
                        <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600">
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="flex items-center gap-4 text-sm mt-4">
                        <div className="flex-1">
                          <label className="text-xs font-bold text-slate-400 uppercase">Qty</label>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItem(item.id, { quantity: parseFloat(e.target.value) || 0 })}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 mt-1 font-semibold"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="text-xs font-bold text-slate-400 uppercase">Rate</label>
                          <input
                            type="number"
                            value={item.rate}
                            onChange={(e) => updateItem(item.id, { rate: parseFloat(e.target.value) || 0 })}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 mt-1 font-semibold"
                          />
                        </div>
                        <div className="flex-1 text-right">
                          <label className="text-xs font-bold text-slate-400 uppercase">Amount</label>
                          <p className="font-bold text-slate-800 mt-2">{formatCurrency(item.amount)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50">
              <div className="space-y-3 text-sm font-medium text-slate-600 mb-6">
                <div className="flex justify-between items-center">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-900">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2">Contingency <input type="number" value={contingency} onChange={(e) => setContingency(parseFloat(e.target.value) || 0)} className="w-16 px-2 py-1 border rounded" />%</span>
                  <span>{formatCurrency(contingencyAmount)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2">Overhead/Profit <input type="number" value={overheadProfit} onChange={(e) => setOverheadProfit(parseFloat(e.target.value) || 0)} className="w-16 px-2 py-1 border rounded" />%</span>
                  <span>{formatCurrency(overheadAmount)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2">Tax <input type="number" value={tax} onChange={(e) => setTax(parseFloat(e.target.value) || 0)} className="w-16 px-2 py-1 border rounded" />%</span>
                  <span>{formatCurrency(taxAmount)}</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                  <span className="text-lg font-bold text-slate-900">Grand Total</span>
                  <span className="text-xl font-black text-indigo-600">{formatCurrency(grandTotal)}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  className="flex-1 bg-white border border-slate-200 text-slate-700 font-bold py-3 px-4 rounded-xl hover:bg-slate-50 flex justify-center items-center gap-2 shadow-sm"
                  onClick={exportPDF}
                >
                  <Download size={18} /> PDF
                </button>
                <button
                  className="flex-1 bg-indigo-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-indigo-700 flex justify-center items-center gap-2 shadow-sm shadow-indigo-200"
                  onClick={exportCSV}
                >
                  <Download size={18} /> CSV
                </button>

    <button
      className="flex-1 bg-emerald-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-emerald-700 flex justify-center items-center gap-2 shadow-sm shadow-emerald-200"
      onClick={exportCSV}
    >
      <Download size={18} /> Excel
    </button>
  
              </div>
              <button onClick={clearBOQ} className="w-full mt-3 text-red-500 font-semibold py-2 hover:bg-red-50 rounded-lg">
                Clear All
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
