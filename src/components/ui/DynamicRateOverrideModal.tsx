import { Button } from './/Button';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-surface-default dark:bg-ink rounded-2xl shadow-2xl border border-ui-borderSubtle dark:border-ink flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border-color dark:border-ink">
          <h2 className="text-xl font-bold text-txt-primary dark:text-white">Material Rates Override</h2>
          <Button 
            onClick={onClose}
            className="p-2 rounded-full text-txt-tertiary hover:text-txt-secondary hover:bg-surface-hover transition-colors"
          >
            <X className="w-5 h-5" />
          </Button>
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
        <div className="p-4 sm:p-6 bg-surface-default/50 border-t border-border-color dark:border-ink flex items-center justify-between gap-4">
          <Button
            onClick={resetToDefault}
            className="flex items-center gap-2 px-4 py-2.5 text-base font-medium dark:text-txt-tertiary hover:bg-surface-active dark:hover:bg-ink-700 rounded-xl transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Reset
          </Button>
          
          <Button
            onClick={handleSave}
            className="flex-1 flex justify-center items-center gap-2 px-6 py-2.5 bg-ink hover:bg-ink-700 text-white font-semibold rounded-xl transition-all shadow-brand-md shadow-accent-500/20"
          >
            <Save className="w-4 h-4" /> Save Rates
          </Button>
        </div>

      </div>
    </div>
  );
}

function RateField({ label, value, onChange }: { label: string, value: number, onChange: (val: string) => void }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <label className="text-sm font-medium text-txt-secondary dark:text-txt-tertiary w-1/2">{label}</label>
      <div className="w-1/2 relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-txt-tertiary text-sm font-medium">Rs</span>
        <MaskedInput
          value={value}
          onValueChange={onChange}
          className="w-full bg-surface-default border border-ui-borderSubtle dark:border-ink-600 rounded-xl py-2 pl-9 pr-4 text-right text-txt-primary dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-accent-500 focus:outline-none focus:ring-accent-500/50 focus:border-accent-800 transition-all"
        />
      </div>
    </div>
  );
}
