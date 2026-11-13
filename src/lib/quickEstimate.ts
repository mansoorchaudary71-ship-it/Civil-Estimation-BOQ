/**
 * quickEstimate — Quick Rough Estimation engine (G9 §2).
 * Pure functions, no React. Rates are dated 2026 values sourced from
 * src/lib/rates.ts context (see RATE_SOURCE below); the old 2,200/sqft grey
 * rate was stale/low (Lahore grey alone is ~2,800–3,200 in 2026) and is kept
 * only as an explicit legacy regression input in tests.
 *
 * BUG FIXED: labour was double-counted in the chart — labourCost =
 * totalCost x 0.25 was ADDED to grey + finish, so the chart summed to 125%
 * of the headline total. The split below is ONE documented split that sums
 * to 100%: grey / finish / labour shares per type.
 */
export type QuickType = "grey" | "standard" | "premium" | "luxury";
export type QuickCity =
  | "lahore"
  | "karachi"
  | "islamabad"
  | "faisalabad"
  | "multan"
  | "rawalpindi"
  | "other";
export type MarlaStandard = "society225" | "revenue272";

export const RATE_SOURCE =
  "CEP 2026 rate table (Nov 2026, indicative — confirm with your contractor). " +
  "Lahore grey structure ~Rs 2,800–3,200/sqft in 2026; old 2,200/sqft rate retired.";
export const RATES_LAST_UPDATED = "2026-11-12";

/** Per-sqft rates (PKR) by type, Lahore base. Grey is the structure rate;
 *  finish is the additional finishing rate (0 for grey-only). */
export const QUICK_RATES: Record<QuickType, { grey: number; finish: number }> = {
  grey: { grey: 3000, finish: 0 },
  standard: { grey: 3000, finish: 1800 },
  premium: { grey: 3200, finish: 3000 },
  luxury: { grey: 3500, finish: 4500 },
};

/** Legacy (stale) rates, kept only so the old worked example reproduces. */
export const LEGACY_QUICK_RATES: Record<QuickType, { grey: number; finish: number }> = {
  grey: { grey: 2200, finish: 0 },
  standard: { grey: 2200, finish: 1800 },
  premium: { grey: 2200, finish: 3000 },
  luxury: { grey: 2200, finish: 4500 },
};

export const CITY_MULTIPLIERS: Record<QuickCity, { label: string; multiplier: number }> = {
  lahore: { label: "Lahore", multiplier: 1.0 },
  karachi: { label: "Karachi", multiplier: 1.05 },
  islamabad: { label: "Islamabad", multiplier: 1.1 },
  faisalabad: { label: "Faisalabad", multiplier: 0.95 },
  multan: { label: "Multan", multiplier: 0.95 },
  rawalpindi: { label: "Rawalpindi", multiplier: 1.05 },
  other: { label: "Other", multiplier: 1.0 },
};

/** Cost split shares (of the headline total) — always sums to 100%. */
export const COST_SPLIT: Record<QuickType, { grey: number; finish: number; labour: number }> = {
  grey: { grey: 0.85, finish: 0, labour: 0.15 },
  standard: { grey: 0.55, finish: 0.3, labour: 0.15 },
  premium: { grey: 0.5, finish: 0.35, labour: 0.15 },
  luxury: { grey: 0.45, finish: 0.4, labour: 0.15 },
};

export const MARLA_SQFT: Record<MarlaStandard, number> = {
  society225: 225,
  revenue272: 272.25,
};

export function plotAreaSqft(
  area: number,
  unit: "sqft" | "marla" | "sqyd" | "sqm",
  marla: MarlaStandard = "society225",
): number {
  if (unit === "marla") return area * MARLA_SQFT[marla];
  if (unit === "sqyd") return area * 9;
  if (unit === "sqm") return area * 10.7639;
  return area;
}

/** Covered (built-up) area. The input area is the per-floor built-up area
 *  (a marla input is the plot footprint built on each floor), so covered =
 *  plot x floors — this reproduces the spec worked example
 *  (5 marla x 225 = 1,125 sqft x 1 floor = 1,125 sqft). The Pakistan page
 *  uses a separate 75%-coverage floor multiplier; do not apply it here. */
export function coveredArea(plotSqft: number, floors: number): number {
  return plotSqft * floors;
}

export interface QuickEstimateInput {
  area: number;
  unit: "sqft" | "marla" | "sqyd" | "sqm";
  marla?: MarlaStandard;
  floors: number;
  type: QuickType;
  city: QuickCity;
  basement?: boolean;
  rates?: Record<QuickType, { grey: number; finish: number }>;
}

export interface QuickEstimateResult {
  plotSqft: number;
  coveredSqft: number;
  ratePerSqft: number;
  totalCost: number;
  minCost: number;
  maxCost: number;
  greyCost: number;
  finishCost: number;
  labourCost: number;
  /** Chart series — sums exactly to totalCost (bug fix). */
  chart: { name: string; value: number }[];
  timeline: string;
  materials: { cementBagsMin: number; cementBagsMax: number; steelKgMin: number; steelKgMax: number; bricksMin: number; bricksMax: number; sandCftMin: number; sandCftMax: number; aggregateCft: number };
  error?: string;
}

export function validateQuickInput(i: QuickEstimateInput): string | null {
  if (!isFinite(i.area) || i.area <= 0) return "Area must be greater than 0.";
  if (i.area > 100000) return "Area looks too large — check the unit (max 100,000 sqft).";
  if (!Number.isFinite(i.floors) || i.floors < 1 || i.floors > 10)
    return "Floors must be between 1 and 10.";
  return null;
}

export function quickEstimate(i: QuickEstimateInput): QuickEstimateResult {
  const error = validateQuickInput(i);
  const plotSqft = plotAreaSqft(i.area, i.unit, i.marla ?? "society225");
  const covered = coveredArea(plotSqft, i.floors) + (i.basement ? plotSqft : 0);
  const table = i.rates ?? QUICK_RATES;
  const mult = CITY_MULTIPLIERS[i.city]?.multiplier ?? 1;
  const ratePerSqft = (table[i.type].grey + table[i.type].finish) * mult;
  const totalCost = covered * ratePerSqft;
  const split = COST_SPLIT[i.type];
  const greyCost = totalCost * split.grey;
  const finishCost = totalCost * split.finish;
  const labourCost = totalCost * split.labour;
  let tMin = 4;
  let tMax = 6;
  if (covered > 2000 && covered <= 4000) { tMin = 5; tMax = 8; }
  else if (covered > 4000 && covered <= 8000) { tMin = 7; tMax = 12; }
  else if (covered > 8000) { tMin = 10; tMax = 18; }
  if (i.floors > 1) { tMin += i.floors - 1; tMax += i.floors - 1; }
  // Thumb-rule material ranges per sqft of covered area (see materialTakeoff).
  const materials = {
    cementBagsMin: Math.round(covered * 0.4),
    cementBagsMax: Math.round(covered * 0.5),
    steelKgMin: Math.round(covered * 3.5),
    steelKgMax: Math.round(covered * 4.0),
    bricksMin: Math.round(covered * 8),
    bricksMax: Math.round(covered * 10),
    sandCftMin: Math.round(covered * 1.2),
    sandCftMax: Math.round(covered * 1.8),
    aggregateCft: Math.round(covered * 1.35),
  };
  return {
    plotSqft,
    coveredSqft: covered,
    ratePerSqft,
    totalCost,
    minCost: totalCost * 0.95,
    maxCost: totalCost * 1.05,
    greyCost,
    finishCost,
    labourCost,
    chart: [
      { name: "Grey Structure", value: greyCost },
      { name: "Finishing", value: finishCost },
      { name: "Labour", value: labourCost },
    ],
    timeline: `${tMin} - ${tMax} months`,
    materials,
    error: error ?? undefined,
  };
}
