import React, { createContext, useContext, useState, ReactNode } from "react";
import { Measurement } from "../utils/measurements";

export type BOQItem = {
  id: string;
  desc: string;
  unit: string;
  rate: number;
  linkedMeasurementIds?: string[]; // ids of measurements
  qtyOverride?: number; // if manual
  isManualOverride?: boolean; // whether to use manual quantity even if linked
};

interface TakeoffContextType {
  measurements: Measurement[];
  setMeasurements: React.Dispatch<React.SetStateAction<Measurement[]>>;
  addMeasurement: (m: Measurement) => void;
  removeMeasurement: (id: string) => void;
  
  scalePxPerUnit: number;
  setScalePxPerUnit: (val: number) => void;
  unitName: string;
  setUnitName: (val: string) => void;
  
  boqItems: BOQItem[];
  setBoqItems: React.Dispatch<React.SetStateAction<BOQItem[]>>;
  updateBoqItem: (id: string, updates: Partial<BOQItem>) => void;
  addBoqItem: (item: Omit<BOQItem, 'id'>) => void;
  addBoqItems: (items: Omit<BOQItem, 'id'>[]) => void;
}

const TakeoffContext = createContext<TakeoffContextType | undefined>(undefined);

export function TakeoffProvider({ children }: { children: ReactNode }) {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [scalePxPerUnit, setScalePxPerUnit] = useState<number>(1);
  const [unitName, setUnitName] = useState("m");
  
  const [boqItems, setBoqItems] = useState<BOQItem[]>([
    { id: "1.0", desc: "Earthwork in excavation", unit: "m³", rate: 12.50, qtyOverride: 450 },
    { id: "2.0", desc: "PCC (1:4:8) for foundation", unit: "m³", rate: 85.00, qtyOverride: 32.50 },
    { id: "3.0", desc: "RCC M20 for footings", unit: "m³", rate: 145.00, qtyOverride: 120 },
    { id: "4.0", desc: "TMT Steel Reinforcement", unit: "MT", rate: 850.00, qtyOverride: 14.50 },
    { id: "5.0", desc: "Brickwork in superstructure", unit: "m²", rate: 110.00, qtyOverride: 210 },
    { id: "6.0", desc: "Plastering 15mm thick", unit: "m²", rate: 15.00, qtyOverride: 850 },
  ]);

  const addMeasurement = (m: Measurement) => setMeasurements(prev => [...prev, m]);
  const removeMeasurement = (id: string) => {
    if (window.confirm("Are you sure you want to permanently delete this task?")) {
      setMeasurements(prev => prev.filter(m => m.id !== id));
      setBoqItems(prev => prev.map(item => ({
        ...item, 
        linkedMeasurementIds: item.linkedMeasurementIds?.filter(mId => mId !== id)
      })));
    }
  };

  const updateBoqItem = (id: string, updates: Partial<BOQItem>) => {
    setBoqItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };
  
  const addBoqItem = (item: Omit<BOQItem, 'id'>) => {
    setBoqItems(prev => {
      const newId = (prev.length + 1).toFixed(1);
      return [...prev, { ...item, id: newId }];
    });
  };

  const addBoqItems = (items: Omit<BOQItem, 'id'>[]) => {
    setBoqItems(prev => {
      return [...prev, ...items.map((item, idx) => ({ ...item, id: (prev.length + 1 + idx).toFixed(1) }))];
    });
  };

  return (
    <TakeoffContext.Provider value={{
      measurements, setMeasurements, addMeasurement, removeMeasurement,
      scalePxPerUnit, setScalePxPerUnit, unitName, setUnitName,
      boqItems, setBoqItems, updateBoqItem, addBoqItem, addBoqItems
    }}>
      {children}
    </TakeoffContext.Provider>
  );
}

export function useTakeoff() {
  const context = useContext(TakeoffContext);
  if (context === undefined) {
    throw new Error("useTakeoff must be used within a TakeoffProvider");
  }
  return context;
}
