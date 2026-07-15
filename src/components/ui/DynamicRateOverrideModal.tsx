import React, { useState } from 'react';
import { X, Save, RefreshCw } from 'lucide-react';
import { MaskedInput } from './MaskedInput';

interface MaterialRates {
  cement: number;
  steel: number;
  bricks: number;
  sand: number;
  crush: number;
}

export const DEFAULT_RATES: MaterialRates = {
  cement: 1200,
  steel: 260,
  bricks: 15,
  sand: 60,
  crush: 120,
};

interface DynamicRateOverrideModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRates: MaterialRates;
  onSave: (newRates: MaterialRates) => void;
}

export function DynamicRateOverrideModal({ isOpen, onClose, currentRates, onSave }: DynamicRateOverrideModalProps) {
  const [rates, setRates] = useState<MaterialRates>(currentRates);

  if (!isOpen) return null;

  const handleRateChange = (key: keyof MaterialRates, value: string) => {
    const num = parseFloat(value);
    setRates(prev => ({
      ...prev,
      [key]: isNaN(num) ? 0 : num
    }));
  };

  const handleSave = () => {
    onSave(rates);
    onClose();
  };

  const resetToDefault = () => {
    setRates(DEFAULT_RATES);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Material Rates Override</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="space-y-4">
            <RateField label="Cement (per Bag)" value={rates.cement} onChange={(v) => handleRateChange('cement', v)} />
            <RateField label="Steel (per Kg)" value={rates.steel} onChange={(v) => handleRateChange('steel', v)} />
            <RateField label="Bricks (per Unit)" value={rates.bricks} onChange={(v) => handleRateChange('bricks', v)} />
            <RateField label="Sand (per Cft)" value={rates.sand} onChange={(v) => handleRateChange('sand', v)} />
            <RateField label="Crush (per Cft)" value={rates.crush} onChange={(v) => handleRateChange('crush', v)} />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
          <button
            onClick={resetToDefault}
            className="flex items-center gap-2 px-4 py-2.5 text-base font-medium dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Reset
          </button>
          
          <button
            onClick={handleSave}
            className="flex-1 flex justify-center items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-md shadow-indigo-500/20"
          >
            <Save className="w-4 h-4" /> Save Rates
          </button>
        </div>

      </div>
    </div>
  );
}

function RateField({ label, value, onChange }: { label: string, value: number, onChange: (val: string) => void }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <label className="text-sm font-medium text-slate-700 dark:text-slate-300 w-1/2">{label}</label>
      <div className="w-1/2 relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">Rs</span>
        <MaskedInput
          value={value}
          onValueChange={onChange}
          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 pl-9 pr-4 text-right text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
        />
      </div>
    </div>
  );
}
