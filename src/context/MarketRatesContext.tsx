import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

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

const defaultRates: MarketRates = {
  cement: 1450,
  steel: 280,
  bricks: 18, 
  sand: 90,
  crush: 250,
  tiles: 1200,
  paint: 300,
  laborGrey: 500,
  laborFinish: 600,
  overheadMarkup: 15,
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

const regionalTrendData: Record<string, any[]> = {
  PK: [
    { month: 'Jan', cement: 1350, steel: 250, bricks: 15, sand: 80, crush: 220 },
    { month: 'Feb', cement: 1380, steel: 255, bricks: 16, sand: 82, crush: 225 },
    { month: 'Mar', cement: 1400, steel: 265, bricks: 16, sand: 85, crush: 230 },
    { month: 'Apr', cement: 1420, steel: 270, bricks: 17, sand: 87, crush: 240 },
    { month: 'May', cement: 1440, steel: 275, bricks: 17, sand: 88, crush: 245 },
    { month: 'Jun', cement: 1450, steel: 280, bricks: 18, sand: 90, crush: 250 },
  ],
  IN: [
    { month: 'Jan', cement: 380, steel: 80, bricks: 7, sand: 45, crush: 50 },
    { month: 'Feb', cement: 385, steel: 82, bricks: 7, sand: 46, crush: 52 },
    { month: 'Mar', cement: 390, steel: 85, bricks: 8, sand: 48, crush: 55 },
    { month: 'Apr', cement: 395, steel: 84, bricks: 8, sand: 48, crush: 54 },
    { month: 'May', cement: 400, steel: 86, bricks: 8, sand: 50, crush: 56 },
    { month: 'Jun', cement: 410, steel: 88, bricks: 9, sand: 52, crush: 58 },
  ],
  UAE: [
    { month: 'Jan', cement: 15, steel: 3, bricks: 1, sand: 2, crush: 3 },
    { month: 'Feb', cement: 15.5, steel: 3.1, bricks: 1, sand: 2.1, crush: 3.1 },
    { month: 'Mar', cement: 16, steel: 3.2, bricks: 1.1, sand: 2.2, crush: 3.2 },
    { month: 'Apr', cement: 16, steel: 3.3, bricks: 1.1, sand: 2.2, crush: 3.3 },
    { month: 'May', cement: 16.5, steel: 3.4, bricks: 1.2, sand: 2.3, crush: 3.4 },
    { month: 'Jun', cement: 17, steel: 3.5, bricks: 1.2, sand: 2.4, crush: 3.5 },
  ]
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

  useEffect(() => {
    fetch('/api/rates')
      .then(res => res.json())
      .then(data => {
        if (data && data.status === 'ok' && data.data) {
           const apiRates = data.data;
           setMarketRates(prev => ({
             ...prev,
             cement: apiRates.cement || prev.cement,
             steel: apiRates.steel || prev.steel,
             bricks: apiRates.bricks ? apiRates.bricks / 1000 : prev.bricks, // API returns per 1000 Nos
             sand: apiRates.sand || prev.sand,
             crush: apiRates.crush || prev.crush,
             laborGrey: apiRates.laborGrey || prev.laborGrey,
             laborFinish: apiRates.laborFinish || prev.laborFinish
           }));
           // Format Date nicely
           const dateStr = new Date(apiRates.last_updated).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
           });
           setLastUpdated(dateStr);
        }
      })
      .catch(err => console.warn('Failed to fetch automated rates, using defaults.', err));
  }, []);

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

