import React, { createContext, useContext, useState, ReactNode } from 'react';
import { getRates } from '../lib/rates';

export interface MarketRates {
  cement: number; // per bag (50kg)
  steel: number; // per kg
  bricks: number; // per piece (using divided by 1000 from db)
  sand: number; // per cft
  crush: number; // per cft
  tiles: number; // per box
  paint: number; // per liter
  laborGrey: number; // per sq.ft
  laborFinish: number; // per sq.ft base multiplier
  overheadMarkup: number; // percentage
}

/**
 * Defaults come from the single shared rate table (src/lib/rates.ts) so
 * every tool quotes the same numbers. The `??` fallbacks are the old
 * hardcoded values and are unreachable while the PK table is populated;
 * they exist only to keep the MarketRates fields non-nullable.
 * NOTE: the old crush default (250/cft) was a proven ~3x error and is
 * deliberately NOT the fallback here — PK crush is 90/cft in rates.ts.
 * Bricks are stored per piece here (23.355 = 23,355 per 1,000, PBS Aug 2026
 * Lahore); steel is 270/kg (indicative Nov 2026), not the old stale 280.
 */
const pkRates = getRates("PK").rates;
const defaultRates: MarketRates = {
  cement: pkRates.cementPerBag ?? 1450,
  steel: pkRates.steelPerKg ?? 270,
  bricks: pkRates.bricksPer1000 != null ? pkRates.bricksPer1000 / 1000 : 18,
  sand: pkRates.sandPerCft ?? 90,
  crush: pkRates.crushPerCft ?? 90,
  tiles: pkRates.tilesPerBox ?? 1200,
  paint: pkRates.paintPerL ?? 300,
  laborGrey: pkRates.labourGreyPerSqft ?? 500,
  laborFinish: pkRates.labourFinishPerSqft ?? 600,
  overheadMarkup: pkRates.overheadMarkupPct ?? 15,
};

const COMPANY_RATES_STORAGE_KEY = "company_material_rates";

interface MarketRatesContextType {
  marketRates: MarketRates;
  customRates: Partial<MarketRates>;
  companyRates: Partial<MarketRates>;
  rates: MarketRates; // Effective rates (custom over market)
  lastUpdated: string | null;
  region: string;
  trendData: any[];
  setRegion: (region: string) => void;
  updateRate: (key: keyof MarketRates, value: number) => void; 
  setCustomRate: (key: keyof MarketRates, value: number | null) => void;
  setCompanyRate: (key: keyof MarketRates, value: number | null) => void;
  resetCustomRates: () => void;
  isCustomRate: (key: keyof MarketRates) => boolean;
  isCompanyRate: (key: keyof MarketRates) => boolean;
}

// Trend history: the old hardcoded 6-month series was DELETED, not
// "corrected". It was invented: PK crush 220–250 (a proven ~3x error —
// the sourced rate is 90/cft), bricks 15–18 (sourced 23.355/pc, PBS Aug
// 2026 Lahore), steel 250–280 (sourced 270/kg), and the IN/UAE series
// were unsourced while rates.ts deliberately leaves IN/AE null ("Never
// invent a rate"). There is no sourced monthly history anywhere in the
// repo, so no trend is plotted: PK shows the single current month built
// from the sourced table (defaultRates, so it can never drift from it),
// and regions without sourced rates show nothing. Add a real dated
// monthly series here only when one exists.
const regionalTrendData: Record<string, any[]> = {
  PK: [
    { month: "Nov", cement: defaultRates.cement, steel: defaultRates.steel, bricks: defaultRates.bricks, sand: defaultRates.sand, crush: defaultRates.crush },
  ],
  IN: [],
  UAE: [],
};

const MarketRatesContext = createContext<MarketRatesContextType | undefined>(undefined);

export function MarketRatesProvider({ children }: { children: ReactNode }) {
  const [region, setRegion] = useState<string>('PK');
  const [marketRates, setMarketRates] = useState<MarketRates>(defaultRates);
  const [customRates, setCustomRates] = useState<Partial<MarketRates>>({});
  const [companyRates, setCompanyRates] = useState<Partial<MarketRates>>(() => {
    try {
      const saved = localStorage.getItem(COMPANY_RATES_STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      console.error("Failed to load company rates from localStorage", e);
      return {};
    }
  });
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // Rates come solely from the sourced table in src/lib/rates.ts
  // (loaded as defaultRates above). There is no rates backend: the old
  // GET /api/rates fetch was removed because the dev stub returned stale
  // values (bricks 14/pc vs 23.355, crush 120 vs 90) and silently
  // overwrote the good table in dev. lastUpdated stays null unless a
  // future sourced feed sets it.

  const updateRate = (key: keyof MarketRates, value: number) => {
    setMarketRates(prev => ({ ...prev, [key]: value }));
  };

  const setCustomRate = (key: keyof MarketRates, value: number | null) => {
    setCustomRates(prev => {
      const updated = { ...prev };
      if (value === null || isNaN(value)) {
        delete updated[key];
      } else {
        updated[key] = value;
      }
      return updated;
    });
  };

  const setCompanyRate = (key: keyof MarketRates, value: number | null) => {
    setCompanyRates(prev => {
      const updated = { ...prev };
      if (value === null || isNaN(value)) {
        delete updated[key];
      } else {
        updated[key] = value;
      }
      localStorage.setItem(COMPANY_RATES_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const resetCustomRates = () => {
    setCustomRates({});
  };

  const isCustomRate = (key: keyof MarketRates) => {
    return customRates[key] !== undefined;
  };

  const isCompanyRate = (key: keyof MarketRates) => {
    return companyRates[key] !== undefined;
  };

  // Precedence: Custom > Company > Market
  const rates: MarketRates = { ...marketRates, ...companyRates, ...customRates };
  const trendData = regionalTrendData[region] || regionalTrendData.PK;

  return (
    <MarketRatesContext.Provider value={{ marketRates, customRates, companyRates, rates, lastUpdated, region, trendData, setRegion, updateRate, setCustomRate, setCompanyRate, resetCustomRates, isCustomRate, isCompanyRate }}>
      {children}
    </MarketRatesContext.Provider>
  );
}

export function useMarketRates() {
  const context = useContext(MarketRatesContext);
  if (context === undefined) {
    throw new Error('useMarketRates must be used within a MarketRatesProvider');
  }
  return context;
}

