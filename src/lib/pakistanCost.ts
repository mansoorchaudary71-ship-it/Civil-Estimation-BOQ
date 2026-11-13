/**
 * pakistanCost — Pakistan Cost Calculator / Cost Guide engine (G9 §11).
 * Pure functions. Rates are 2026 PKR/sqft bands, dated 2026-11-12, labelled
 * indicative (competitor-published 2026 ranges: Lahore grey 2,800–3,400,
 * standard complete ~4,350–4,850, premium 5,700–6,400, luxury turnkey
 * 7,000–8,500). The Standard band 3,800–4,500 is the spec's worked example
 * and is kept as the default; Luxury max was raised to 8,500.
 *
 * MARLA TOGGLE (mandatory): Punjab revenue marla = 272.25 sqft, society /
 * DHA / Bahria marla = 225 sqft. Same 5-marla plot swings ~17% in cost.
 */
import { MARLA_SQFT, type MarlaStandard } from "./quickEstimate";

export type PakCity = "lahore" | "islamabad" | "karachi" | "faisalabad" | "multan" | "other";
export type PakTier = "grey" | "standard" | "premium" | "luxury";

export const RATES_LAST_UPDATED = "2026-11-12";
export const RATE_SOURCE =
  "2026 market ranges (Lahore/Islamabad/Karachi builder-published rates, Nov 2026) — indicative, not a quotation. Confirm with your contractor.";

export const CITY_LABELS: Record<PakCity, string> = {
  lahore: "Lahore",
  islamabad: "Islamabad",
  karachi: "Karachi",
  faisalabad: "Faisalabad",
  multan: "Multan",
  other: "Other",
};

/** [min, max] PKR per sqft of covered area, by city and tier. */
export const PAK_RATES: Record<PakCity, Record<PakTier, [number, number]>> = {
  lahore: { grey: [2800, 3400], standard: [3800, 4500], premium: [5700, 6400], luxury: [7000, 8500] },
  islamabad: { grey: [3000, 3600], standard: [4200, 4900], premium: [6000, 6800], luxury: [7400, 8800] },
  karachi: { grey: [2900, 3500], standard: [4000, 4700], premium: [5800, 6600], luxury: [7200, 8600] },
  faisalabad: { grey: [2500, 3000], standard: [3500, 4100], premium: [5200, 5900], luxury: [6500, 7800] },
  multan: { grey: [2500, 3000], standard: [3500, 4100], premium: [5200, 5900], luxury: [6500, 7800] },
  other: { grey: [2500, 3000], standard: [3500, 4100], premium: [5200, 5900], luxury: [6500, 7800] },
};

/** Floor multipliers = 0.75 coverage x number of floors (G = 1 floor). */
export function floorMultiplier(floors: number): number {
  return 0.75 * floors;
}

export interface PakistanCostInput {
  plotArea: number;
  plotUnit: "sqft" | "sqyd" | "marla" | "kanal";
  marla: MarlaStandard;
  city: PakCity;
  tier: PakTier;
  floors: number; // 1 = ground only, 2 = G+1, ...
  basement?: boolean;
  coveredOverrideSqft?: number;
  boundaryWall?: boolean;
}

export interface PakistanCostResult {
  plotSqft: number;
  coveredSqft: number;
  rateMin: number;
  rateMax: number;
  costMin: number;
  costMax: number;
  costAvg: number;
  greyCostMin: number;
  greyCostMax: number;
  finishCostMin: number;
  finishCostMax: number;
  /** Derived material quantities on covered area (thumb rules, §4). */
  materials: { cementBags: number; steelKg: number; bricks: number; sandCft: number; aggregateCft: number };
  error?: string;
}

export function plotToSqft(area: number, unit: PakistanCostInput["plotUnit"], marla: MarlaStandard): number {
  if (unit === "marla") return area * MARLA_SQFT[marla];
  if (unit === "kanal") return area * 20 * MARLA_SQFT[marla];
  if (unit === "sqyd") return area * 9;
  return area;
}

export function pakistanCost(i: PakistanCostInput): PakistanCostResult {
  const plotSqft = plotToSqft(i.plotArea, i.plotUnit, i.marla);
  let covered = i.coveredOverrideSqft && i.coveredOverrideSqft > 0
    ? i.coveredOverrideSqft
    : plotSqft * floorMultiplier(i.floors);
  if (i.basement) covered += plotSqft * 0.75; // basement = one extra 75%-coverage floor
  const [rateMin, rateMax] = PAK_RATES[i.city][i.tier];
  const costMin = Math.round(covered * rateMin);
  const costMax = Math.round(covered * rateMax);
  // Grey ~55% / finishing ~45% split of a turnkey total (labelled, not derived).
  const greyShare = i.tier === "grey" ? 1 : 0.55;
  const error =
    !isFinite(i.plotArea) || i.plotArea <= 0
      ? "Plot area must be greater than 0."
      : i.floors < 1 || i.floors > 5
        ? "Floors must be between 1 (ground) and 5 (G+4)."
        : undefined;
  return {
    plotSqft,
    coveredSqft: covered,
    rateMin,
    rateMax,
    costMin,
    costMax,
    costAvg: (costMin + costMax) / 2,
    greyCostMin: costMin * greyShare,
    greyCostMax: costMax * greyShare,
    finishCostMin: costMin * (1 - greyShare),
    finishCostMax: costMax * (1 - greyShare),
    materials: {
      cementBags: Math.round(covered * 0.4),
      steelKg: Math.round(covered * 3.5),
      bricks: Math.round(covered * 10),
      sandCft: Math.round(covered * 1.5),
      aggregateCft: Math.round(covered * 1.35),
    },
    error,
  };
}

/** Both marla standards side by side for the same plot — the toggle view. */
export function pakistanCostBothStandards(
  i: Omit<PakistanCostInput, "marla">,
): { society225: PakistanCostResult; revenue272: PakistanCostResult } {
  return {
    society225: pakistanCost({ ...i, marla: "society225" }),
    revenue272: pakistanCost({ ...i, marla: "revenue272" }),
  };
}
