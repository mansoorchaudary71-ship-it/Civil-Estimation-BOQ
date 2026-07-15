import React, { createContext, useContext, useState, ReactNode } from 'react';

export type BrickType = 'aClass' | 'bClass';
export type MixRatio = '1:1.5:3' | '1:2:4' | '1:3:6' | '1:4:8';
export type PlasterRatio = '1:4' | '1:5' | '1:6';
export type FlooringType = 'ceramic' | 'porcelain' | 'marble' | 'wooden';
export type CeilingType = 'pop' | 'gypsum' | 'bare';
export type DWType = 'solidWood' | 'ashWood' | 'aluminum' | 'upvc';
export type PaintIntType = 'distemper' | 'emulsion';
export type PaintExtType = 'weatherShield' | 'texture';
export type ElectricalWiringType = '3/0.29 & 7/0.29 Standard' | 'Premium Brand';
export type SwitchesBoardsType = 'Local Standard' | 'Premium';

export interface HouseSpecs {
  brickwork: { type: BrickType; wastagePct: number };
  concrete: { slabMix: MixRatio; foundationMix: MixRatio };
  plastering: { innerThickness: string; outerThickness: string; mortarRatio: PlasterRatio };
  flooring: { type: FlooringType; pricePerSqft: string };
  ceiling: { type: CeilingType };
  doorsWindows: { type: DWType; openingsSqft: string };
  paint: { interior: PaintIntType; exterior: PaintExtType };
  electrical: { wiring: ElectricalWiringType; switches: SwitchesBoardsType };
}

const defaultSpecs: HouseSpecs = {
  brickwork: { type: 'aClass', wastagePct: 5 },
  concrete: { slabMix: '1:2:4', foundationMix: '1:4:8' },
  plastering: { innerThickness: '0.5', outerThickness: '0.75', mortarRatio: '1:4' },
  flooring: { type: 'ceramic', pricePerSqft: '150' },
  ceiling: { type: 'pop' },
  doorsWindows: { type: 'aluminum', openingsSqft: '250' },
  paint: { interior: 'emulsion', exterior: 'weatherShield' },
  electrical: { wiring: '3/0.29 & 7/0.29 Standard', switches: 'Local Standard' },
};

// Simulated central pricing dictionary
export const PricingDictionary = {
  bricks: { aClass: 15, bClass: 12 },
  flooring: { ceramic: 120, porcelain: 250, marble: 180, wooden: 220 },
  ceiling: { pop: 45, gypsum: 85, bare: 0 },
  doorsWindows: { solidWood: 1500, ashWood: 1200, aluminum: 800, upvc: 950 },
  paint: { distemper: 15, emulsion: 30, weatherShield: 35, texture: 45 },
};

interface HouseSpecsContextType {
  specs: HouseSpecs;
  updateSpecs: (category: keyof HouseSpecs, field: string, value: any) => void;
}

const HouseSpecsContext = createContext<HouseSpecsContextType | undefined>(undefined);

export function HouseSpecsProvider({ children }: { children: ReactNode }) {
  const [specs, setSpecs] = useState<HouseSpecs>(defaultSpecs);

  const updateSpecs = (category: keyof HouseSpecs, field: string, value: any) => {
    setSpecs(prev => ({
      ...prev,
      [category]: {
        ...(prev as any)[category],
        [field]: value
      }
    }));
  };

  return (
    <HouseSpecsContext.Provider value={{ specs, updateSpecs }}>
      {children}
    </HouseSpecsContext.Provider>
  );
}

export function useHouseSpecs() {
  const context = useContext(HouseSpecsContext);
  if (context === undefined) {
    throw new Error('useHouseSpecs must be used within a HouseSpecsProvider');
  }
  return context;
}
