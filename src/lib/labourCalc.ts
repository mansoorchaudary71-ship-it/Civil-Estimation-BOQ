/**
 * labourCalc — Labour Calculator engine (G9 §13).
 * Pure functions. Output rates follow IS 7272 Pt 1 labour constants
 * (8-hour day); wages come from rates.ts (PK mason 1,200 / helper 600 per
 * day, indicative, Nov 2026) — never hardcoded in the component again.
 */
export interface LabourTaskInput {
  id: string;
  name: string;
  qty: number;
  unit: string;
  /** output per key worker per day */
  outputPerWorker: number;
  keyWorkers: number;
  helpers: number;
  masonWage: number;
  helperWage: number;
  source?: string;
}

export const LABOUR_PRESETS: Array<{
  name: string; unit: string; outputPerWorker: number; keyWorkers: number; helpers: number; source: string;
}> = [
  { name: "Brickwork", unit: "m³", outputPerWorker: 1.25, keyWorkers: 2, helpers: 3, source: "IS 7272 Pt 1 — brickwork 1.0–1.25 m³/mason-day" },
  { name: "Excavation", unit: "m³", outputPerWorker: 3.0, keyWorkers: 0, helpers: 4, source: "IS 7272 Pt 1 — excavation 3.0 m³/labour-day (unskilled-driven)" },
  { name: "Plastering", unit: "m²", outputPerWorker: 10, keyWorkers: 1, helpers: 1, source: "IS 7272 Pt 1 — plaster 15 mm ≈ 0.10 mason-days/m² (≈10 m²/day)" },
  { name: "Concreting", unit: "m³", outputPerWorker: 4.0, keyWorkers: 2, helpers: 4, source: "IS 7272 Pt 1 — concreting gang output" },
  { name: "Steel binding", unit: "kg", outputPerWorker: 150, keyWorkers: 1, helpers: 1, source: "IS 7272 Pt 1 — steel binding ≈150 kg/bar-bender-day" },
  { name: "Formwork", unit: "m²", outputPerWorker: 8, keyWorkers: 1, helpers: 1, source: "IS 7272 Pt 1 — formwork ≈8 m²/carpenter-day" },
  { name: "Painting", unit: "m²", outputPerWorker: 40, keyWorkers: 1, helpers: 0, source: "IS 7272 Pt 1 — painting ≈40 m²/painter-day" },
];

export interface LabourTaskResult {
  id: string;
  name: string;
  dailyOutput: number;
  /** key-worker days, before contingency */
  days: number;
  daysWithContingency: number;
  dailyBurn: number;
  totalCost: number;
  totalCostWithContingency: number;
  error?: string;
}

/** Deterministic chart palette — never Math.random() per render. */
export const LABOUR_PALETTE = ["rgb(31, 29, 26)", "rgb(242, 164, 19)", "rgb(15, 118, 110)", "rgb(234, 76, 137)", "rgb(124, 106, 174)", "rgb(59, 130, 246)", "rgb(146, 64, 14)", "rgb(21, 128, 61)"];

export function calcLabourTask(t: LabourTaskInput, contingencyPct: number): LabourTaskResult {
  const keyWorkers = Math.max(t.keyWorkers, 0);
  const helpers = Math.max(t.helpers, 0);
  if (t.qty < 0) return { id: t.id, name: t.name, dailyOutput: 0, days: 0, daysWithContingency: 0, dailyBurn: 0, totalCost: 0, totalCostWithContingency: 0, error: "Quantity cannot be negative." };
  if (t.outputPerWorker <= 0) return { id: t.id, name: t.name, dailyOutput: 0, days: 0, daysWithContingency: 0, dailyBurn: 0, totalCost: 0, totalCostWithContingency: 0, error: "Output per worker must be greater than 0." };
  // Unskilled-driven tasks (e.g. excavation): helpers are the key workers.
  const effectiveKey = keyWorkers > 0 ? keyWorkers : helpers;
  const dailyOutput = effectiveKey * t.outputPerWorker;
  const rawDays = dailyOutput > 0 ? t.qty / dailyOutput : 0;
  const dailyBurn = keyWorkers * t.masonWage + helpers * t.helperWage;
  const factor = 1 + contingencyPct / 100;
  // Costs are computed from the SAME rounded days that are displayed —
  // the old code priced the unrounded days, so displayed days x burn did
  // not equal the displayed total (e.g. 4.0 d x Rs 4,200 = 16,800 shown
  // as 16,968 for 10.1 m³ of brickwork).
  const days = Math.round(rawDays * 10) / 10;
  const daysWithContingency = Math.round(rawDays * factor * 10) / 10;
  return {
    id: t.id,
    name: t.name,
    dailyOutput,
    days,
    daysWithContingency,
    dailyBurn,
    totalCost: Math.round(days * dailyBurn),
    totalCostWithContingency: Math.round(daysWithContingency * dailyBurn),
  };
}

export function calcLabourSummary(
  tasks: LabourTaskInput[],
  contingencyPct: number,
): { sequentialDays: number; parallelDays: number; totalCost: number; totalCostWithContingency: number; results: LabourTaskResult[] } {
  const results = tasks.map((t) => calcLabourTask(t, contingencyPct));
  const sequentialDays = Math.round(results.reduce((s, r) => s + r.daysWithContingency, 0) * 10) / 10;
  const parallelDays = Math.round(Math.max(0, ...results.map((r) => r.daysWithContingency)) * 10) / 10;
  return {
    sequentialDays,
    parallelDays,
    totalCost: results.reduce((s, r) => s + r.totalCost, 0),
    totalCostWithContingency: results.reduce((s, r) => s + r.totalCostWithContingency, 0),
    results,
  };
}
