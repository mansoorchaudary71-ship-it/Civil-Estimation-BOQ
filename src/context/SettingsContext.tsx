import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';

export type Currency = 'PKR' | 'USD' | 'INR' | 'AED' | 'SAR' | 'GBP' | 'BDT' | 'LKR';
export type MeasurementSystem = 'FPS' | 'SI';
export type Theme = 'light' | 'dark' | 'system' | 'high-contrast';
export type FontSize = 'small' | 'medium' | 'large';
export type UserRole = 'Civil Engineer' | 'Quantity Surveyor' | 'Student' | 'Contractor' | 'Architect' | undefined;
export type ProjectType = 'Residential' | 'Commercial' | 'Infrastructure' | 'Industrial' | undefined;

export interface MaterialRates {
  cement: number;
  steel: number;
  bricks: number;
  sand: number;
  crush: number;
}

export interface ModulePreferences {
  units: {
    finishing: 'm' | 'mm' | 'ft' | 'in';
    roads: 'm' | 'km' | 'ft' | 'mi';
    earthworks: 'm' | 'ft';
  };
  themes: {
    finishing: string;
    roads: string;
    earthworks: string;
  };
}

interface SettingsState {
  currency: Currency;
  measurement: MeasurementSystem;
  theme: Theme;
  fontSize: FontSize;
  rates: MaterialRates;
  modulePreferences?: ModulePreferences;
  role?: UserRole;
  projectType?: ProjectType;
  onboardingComplete?: boolean;
  hasSeenTour?: boolean;
  usedTools?: string[];
  toolUsageStats?: Record<string, number>;
  hasExportedBOQ?: boolean;
  hasRunCalculation?: boolean;
  favoriteTools?: string[];
}

interface SettingsContextType {
  settings: SettingsState;
  updateSettings: (newSettings: Partial<SettingsState>) => void;
  formatCurrency: (amount: number, applyExchangeRate?: boolean) => string;
  convertAmount: (amount: number) => number;
  convertAmountToRaw: (amount: number) => number;
  trackToolUse: (toolId: string) => void;
  toggleTheme: () => void;
}

const defaultSettings: SettingsState = {
  currency: 'PKR',
  measurement: 'FPS',
  theme: 'system',
  fontSize: 'medium',
  role: undefined,
  projectType: undefined,
  onboardingComplete: false,
  hasSeenTour: false,
  usedTools: [],
  toolUsageStats: {},
  hasExportedBOQ: false,
  hasRunCalculation: false,
  favoriteTools: [],
  rates: {
    cement: 1200,   // per 50kg bag
    steel: 260000,  // per ton
    bricks: 15000,  // per 1000
    sand: 60,       // per cft
    crush: 120,     // per cft
  },
  modulePreferences: {
    units: {
      finishing: 'm',
      roads: 'km',
      earthworks: 'm',
    },
    themes: {
      finishing: 'blue',
      roads: 'slate',
      earthworks: 'amber',
    }
  }
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const currencySymbols: Record<Currency, string> = {
  PKR: 'Rs',
  USD: '$',
  INR: '₹',
  AED: 'AED',
  SAR: 'SAR',
  GBP: '£',
  BDT: '৳',
  LKR: 'Rs',
};

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SettingsState>(() => {
    const saved = localStorage.getItem('app-settings');
    if (saved) {
      try {
        return { ...defaultSettings, ...JSON.parse(saved) };
      } catch (e) {
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('app-settings', JSON.stringify(settings));
    
    const root = window.document.documentElement;

    const applyTheme = () => {
      let isDark = false;
      if (settings.theme === 'dark') {
          isDark = true;
      } else if (settings.theme === 'system') {
          isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }

      root.classList.remove('light', 'dark', 'high-contrast');

      if (settings.theme === 'high-contrast') {
          root.classList.add('high-contrast');
      } else if (isDark) {
          root.classList.add('dark');
      } else {
          root.classList.add('light');
      }
      
      // Apply font size scaling
      if (settings.fontSize === 'small') {
        root.style.fontSize = '14px';
      } else if (settings.fontSize === 'large') {
        root.style.fontSize = '18px';
      } else {
        root.style.fontSize = '16px';
      }
    };

    applyTheme();

    if (settings.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme();
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [settings]);

  const prevMeasurementRef = useRef(settings.measurement);

  useEffect(() => {
    if (prevMeasurementRef.current !== settings.measurement) {
      prevMeasurementRef.current = settings.measurement;
      window.dispatchEvent(new CustomEvent('units-changed', { detail: { measurement: settings.measurement } }));
    }
  }, [settings.measurement]);

  const updateSettings = (newSettings: Partial<SettingsState>) => {
    setSettings((prev) => {
      return { ...prev, ...newSettings };
    });
  };

  const getExchangeRate = (curr: Currency) => {
    switch (curr) {
      case 'USD': return 1 / 278;
      case 'SAR': return 1 / 74;
      case 'INR': return 1 / 3.33;
      case 'AED': return 1 / 75;
      case 'GBP': return 1 / 350;
      case 'BDT': return 1 / 2.3;
      default: return 1; // PKR
    }
  };

  const formatCurrency = (amount: number, applyExchangeRate = true) => {
    const symbol = currencySymbols[settings.currency];
    const rate = getExchangeRate(settings.currency);
    const finalAmount = applyExchangeRate ? amount * rate : amount;
    return `${symbol} ${finalAmount.toLocaleString('en-US', { minimumFractionDigits: settings.currency === 'PKR' ? 0 : 2, maximumFractionDigits: settings.currency === 'PKR' ? 0 : 2 })}`;
  };

  const convertAmount = (amount: number) => {
    const rate = getExchangeRate(settings.currency);
    return amount * rate;
  };

  const convertAmountToRaw = (amount: number) => {
    const rate = getExchangeRate(settings.currency);
    return amount / rate;
  };

  const trackToolUse = (toolId: string) => {
    setSettings(prev => {
      const used = prev.usedTools || [];
      const stats = prev.toolUsageStats || {};
      const newStats = { ...stats, [toolId]: (stats[toolId] || 0) + 1 };
      
      if (used.includes(toolId)) {
        return { ...prev, toolUsageStats: newStats };
      }
      return { ...prev, usedTools: [...used, toolId], toolUsageStats: newStats };
    });
  };

  const toggleTheme = () => {
    setSettings(prev => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark'
    }));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, formatCurrency, convertAmount, convertAmountToRaw, trackToolUse, toggleTheme }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

export function useGlobalSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useGlobalSettings must be used within a SettingsProvider');
  }
  return {
    currentUnit: context.settings.measurement === 'SI' ? 'Metric' : 'Imperial',
    currentCurrency: context.settings.currency,
    currentTheme: context.settings.theme,
    setCurrentUnit: (unit: 'Metric' | 'Imperial') => context.updateSettings({ measurement: unit === 'Metric' ? 'SI' : 'FPS' }),
    setCurrentCurrency: (currency: Currency) => context.updateSettings({ currency }),
    toggleTheme: context.toggleTheme,
    ...context
  };
}
