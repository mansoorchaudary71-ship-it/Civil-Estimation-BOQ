import React, { useState, useRef, useEffect } from 'react';
import { useSettings, Currency } from '../../context/SettingsContext';
import { Globe, Check } from 'lucide-react';

const currencies: { code: Currency; label: string; flag: string }[] = [
  { code: 'PKR', label: 'Pakistan (PKR)', flag: '🇵🇰' },
  { code: 'INR', label: 'India (INR)', flag: '🇮🇳' },
  { code: 'USD', label: 'USA (USD)', flag: '🇺🇸' },
  { code: 'AED', label: 'UAE (AED)', flag: '🇦🇪' },
  { code: 'SAR', label: 'Saudi Arabia (SAR)', flag: '🇸🇦' },
  { code: 'BDT', label: 'Bangladesh (BDT)', flag: '🇧🇩' },
  { code: 'GBP', label: 'UK (GBP)', flag: '🇬🇧' },
];

export function CurrencySelector() {
  const { settings, updateSettings } = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentSettingsObj = currencies.find(c => c.code === settings.currency) || currencies[0];

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-10 px-3 rounded-full bg-bg-card shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 text-slate-700 dark:text-slate-300 hover:text-[var(--accent-vibrant)] hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
        title="Currency & Region"
      >
        <span className="text-lg">{currentSettingsObj.flag}</span>
        <span className="text-base font-medium tracking-tight">{currentSettingsObj.code}</span>
      </button>

      {isOpen && (
        <div className="absolute top-12 right-0 w-56 bg-bg-card border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <h4 className="text-base font-medium uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" />
              Currency & Region
            </h4>
          </div>
          <div className="py-2 flex flex-col">
            {currencies.map((curr) => {
              const isSelected = settings.currency === curr.code;
              return (
                <button
                  key={curr.code}
                  onClick={() => {
                    updateSettings({ currency: curr.code });
                    setIsOpen(false);
                    // Also save to localStorage exactly
                    const saved = localStorage.getItem('app-settings');
                    const parsed = saved ? JSON.parse(saved) : {};
                    parsed.currency = curr.code;
                    localStorage.setItem('app-settings', JSON.stringify(parsed));
                  }}
                  className={`px-4 py-2.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors ${
                    isSelected ? 'bg-indigo-50/50 dark:bg-indigo-900/20' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{curr.flag}</span>
                    <span className={`text-sm ${isSelected ? 'font-bold text-indigo-700 dark:text-indigo-400' : 'font-medium text-slate-700 dark:text-slate-300'}`}>
                      {curr.label}
                    </span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
