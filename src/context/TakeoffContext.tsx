import React, { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from "react";
import { Measurement } from "../utils/measurements";

export type BOQItem = {
  id: string;
  desc: string;
  unit: string;
  rate: number;
  linkedMeasurementIds?: string[]; // ids of measurements
  qtyOverride?: number; // if manual
  isManualOverride?: boolean; // whether to use manual quantity even if linked
  /** Drawing sheet this line was measured from (e.g. "A-101"), if known. */
  sheetRef?: string;
  /** "measured" = taken from a drawing measurement; "assumed" = typed-in / sample. */
  status?: "measured" | "assumed";
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

  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const TakeoffContext = createContext<TakeoffContextType | undefined>(undefined);

const TAKEOFF_STORAGE_KEY = "takeoff_project";

/** Sample BOQ — loaded only via the "Load sample" button, clearly labelled SAMPLE. */
export const SAMPLE_BOQ: Array<Omit<BOQItem, "id">> = [
  { desc: "Earthwork in excavation", unit: "m³", rate: 450, qtyOverride: 42, status: "assumed", sheetRef: "SAMPLE" },
  { desc: "PCC (1:4:8) for foundation", unit: "m³", rate: 14500, qtyOverride: 4.5, status: "assumed", sheetRef: "SAMPLE" },
  { desc: "RCC 1:2:4 for footings", unit: "m³", rate: 28500, qtyOverride: 12, status: "assumed", sheetRef: "SAMPLE" },
  { desc: "TMT Steel Reinforcement", unit: "kg", rate: 270, qtyOverride: 1200, status: "assumed", sheetRef: "SAMPLE" },
  { desc: "Brickwork in superstructure", unit: "m³", rate: 24500, qtyOverride: 21, status: "assumed", sheetRef: "SAMPLE" },
  { desc: "Plastering 12 mm", unit: "m²", rate: 320, qtyOverride: 260, status: "assumed", sheetRef: "SAMPLE" },
];

type Snapshot = { measurements: Measurement[]; boqItems: BOQItem[] };

function loadPersisted(): Snapshot & { scalePxPerUnit: number; unitName: string } {
  const empty = { measurements: [], boqItems: [], scalePxPerUnit: 1, unitName: "m" };
  try {
    const raw = localStorage.getItem(TAKEOFF_STORAGE_KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw);
    return {
      measurements: Array.isArray(parsed.measurements) ? parsed.measurements : [],
      boqItems: Array.isArray(parsed.boqItems) ? parsed.boqItems : [],
      scalePxPerUnit: typeof parsed.scalePxPerUnit === "number" && isFinite(parsed.scalePxPerUnit) && parsed.scalePxPerUnit > 0 ? parsed.scalePxPerUnit : 1,
      unitName: typeof parsed.unitName === "string" ? parsed.unitName : "m",
    };
  } catch {
    return empty;
  }
}

export function TakeoffProvider({ children }: { children: ReactNode }) {
  const [initial] = useState(loadPersisted);
  const [measurements, setMeasurementsState] = useState<Measurement[]>(initial.measurements);
  const [scalePxPerUnit, setScalePxPerUnitState] = useState<number>(initial.scalePxPerUnit);
  const [unitName, setUnitName] = useState(initial.unitName);

  // Empty on first run: the old 6 hardcoded demo rows were presented as if real.
  const [boqItems, setBoqItemsState] = useState<BOQItem[]>(initial.boqItems);

  // --- undo / redo (one history for measurements + BOQ) ---
  const pastRef = useRef<Snapshot[]>([]);
  const futureRef = useRef<Snapshot[]>([]);
  const stateRef = useRef<Snapshot>({ measurements: initial.measurements, boqItems: initial.boqItems });
  const [, setHistoryVersion] = useState(0);

  useEffect(() => {
    stateRef.current = { measurements, boqItems };
  }, [measurements, boqItems]);

  const record = useCallback(() => {
    pastRef.current.push({ ...stateRef.current });
    if (pastRef.current.length > 50) pastRef.current.shift();
    futureRef.current = [];
    setHistoryVersion((v) => v + 1);
  }, []);

  const setMeasurements: React.Dispatch<React.SetStateAction<Measurement[]>> = useCallback((action) => {
    record();
    setMeasurementsState(action);
  }, [record]);

  const setBoqItems: React.Dispatch<React.SetStateAction<BOQItem[]>> = useCallback((action) => {
    record();
    setBoqItemsState(action);
  }, [record]);

  /** Scale guard: a scale of 0 / Infinity / NaN makes every measurement divide by zero. */
  const setScalePxPerUnit = useCallback((val: number) => {
    if (!isFinite(val) || val <= 0) return;
    setScalePxPerUnitState(val);
  }, []);

  const undo = useCallback(() => {
    const prev = pastRef.current.pop();
    if (!prev) return;
    futureRef.current.push({ ...stateRef.current });
    setMeasurementsState(prev.measurements);
    setBoqItemsState(prev.boqItems);
    setHistoryVersion((v) => v + 1);
  }, []);

  const redo = useCallback(() => {
    const next = futureRef.current.pop();
    if (!next) return;
    pastRef.current.push({ ...stateRef.current });
    setMeasurementsState(next.measurements);
    setBoqItemsState(next.boqItems);
    setHistoryVersion((v) => v + 1);
  }, []);

  // --- persistence (local-first; static GH Pages has no backend) ---
  useEffect(() => {
    try {
      localStorage.setItem(TAKEOFF_STORAGE_KEY, JSON.stringify({ measurements, boqItems, scalePxPerUnit, unitName }));
    } catch {
      // storage full / unavailable — the tool keeps working in-memory
    }
  }, [measurements, boqItems, scalePxPerUnit, unitName]);

  const addMeasurement = (m: Measurement) => { record(); setMeasurementsState(prev => [...prev, m]); };
  const removeMeasurement = (id: string) => {
    if (window.confirm("Are you sure you want to permanently delete this task?")) {
      record();
      setMeasurementsState(prev => prev.filter(m => m.id !== id));
      setBoqItemsState(prev => prev.map(item => ({
        ...item,
        linkedMeasurementIds: item.linkedMeasurementIds?.filter(mId => mId !== id)
      })));
    }
  };

  const updateBoqItem = (id: string, updates: Partial<BOQItem>) => {
    record();
    setBoqItemsState(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const addBoqItem = (item: Omit<BOQItem, 'id'>) => {
    record();
    setBoqItemsState(prev => {
      const newId = (prev.length + 1).toFixed(1);
      return [...prev, { ...item, id: newId }];
    });
  };

  const addBoqItems = (items: Omit<BOQItem, 'id'>[]) => {
    record();
    setBoqItemsState(prev => {
      return [...prev, ...items.map((item, idx) => ({ ...item, id: (prev.length + 1 + idx).toFixed(1) }))];
    });
  };

  return (
    <TakeoffContext.Provider value={{
      measurements, setMeasurements, addMeasurement, removeMeasurement,
      scalePxPerUnit, setScalePxPerUnit, unitName, setUnitName,
      boqItems, setBoqItems, updateBoqItem, addBoqItem, addBoqItems,
      undo, redo, canUndo: pastRef.current.length > 0, canRedo: futureRef.current.length > 0,
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
