/**
 * Pavement mix & aggregate gradation engine — pure functions, no React,
 * NO fetch. The old component fetched /api/tools/pavement-gradation,
 * which does not exist on static GitHub Pages, so the chart was always
 * 0% and the table still said PASS. Everything is computed client-side
 * here.
 *
 * Blending: blended % passing per sieve = sum over stockpiles of
 * (proportion x % passing). Check: each sieve against the preset
 * envelope (MoRTH). Status is computed from real blended values —
 * never a default 'pass' when there is no result.
 *
 * Envelopes (MoRTH, verbatim for the sieves in the set):
 * - GSB-I: MoRTH Table 400-1.
 * - DBM-1 (Grading 1, 37.5 mm NMAS) and DBM-2 (Grading 2, 26.5 mm NMAS):
 *   MoRTH Table 500-10.
 * - SMA: MoRTH Clause 515.
 * - BC-1 (Bituminous Concrete Grading 1, 19 mm) and BC-2 (Grading 2,
 *   13.2 mm): MoRTH Table 500-17. Only the sieves in SIEVE_SIZES are
 *   shown; the full MoRTH tables have intermediate sieves (13.2, 1.18,
 *   0.6, 0.15 mm) that this tool does not track.
 */
export const SIEVE_SIZES = [75, 53, 26.5, 19, 9.5, 4.75, 2.36, 0.3, 0.075];

export type MixPreset = "gsb-i" | "dbm-1" | "dbm-2" | "sma" | "bc-1" | "bc-2";

export interface SieveSpec {
  sieve: number;
  min: number | null;
  max: number | null;
}

export const PRESET_LABELS: Record<MixPreset, string> = {
  "gsb-i": "GSB Grade I (MoRTH Table 400-1)",
  "dbm-1": "DBM Grade 1 (MoRTH Table 500-10)",
  "dbm-2": "DBM Grade 2 (MoRTH Table 500-10)",
  sma: "Stone Matrix Asphalt — SMA (MoRTH Clause 515)",
  "bc-1": "Bituminous Concrete Grading 1 (MoRTH Table 500-17)",
  "bc-2": "Bituminous Concrete Grading 2 (MoRTH Table 500-17)",
};

/** Default bitumen content % of mix (MoRTH minimum shown in the UI). */
export const PRESET_BITUMEN: Record<MixPreset, { min: number; typical: number }> = {
  "gsb-i": { min: 0, typical: 0 },
  "dbm-1": { min: 4.5, typical: 4.5 },
  "dbm-2": { min: 4.5, typical: 4.5 },
  sma: { min: 5.8, typical: 5.8 },
  "bc-1": { min: 5.0, typical: 5.2 },
  "bc-2": { min: 5.0, typical: 5.4 },
};

export const SPECIFICATIONS: Record<MixPreset, SieveSpec[]> = {
  "gsb-i": [
    { sieve: 75, min: 100, max: 100 },
    { sieve: 53, min: 80, max: 100 },
    { sieve: 26.5, min: 55, max: 90 },
    { sieve: 19, min: null, max: null },
    { sieve: 9.5, min: 35, max: 65 },
    { sieve: 4.75, min: 25, max: 50 },
    { sieve: 2.36, min: null, max: null },
    { sieve: 0.3, min: null, max: null },
    { sieve: 0.075, min: 0, max: 10 },
  ],
  "dbm-1": [
    { sieve: 75, min: null, max: null },
    { sieve: 53, min: null, max: null },
    { sieve: 26.5, min: 100, max: 100 },
    { sieve: 19, min: 90, max: 100 },
    { sieve: 9.5, min: 56, max: 80 },
    { sieve: 4.75, min: 29, max: 59 },
    { sieve: 2.36, min: 19, max: 45 },
    { sieve: 0.3, min: 5, max: 17 },
    { sieve: 0.075, min: 1, max: 7 },
  ],
  "dbm-2": [
    { sieve: 75, min: null, max: null },
    { sieve: 53, min: null, max: null },
    { sieve: 26.5, min: 90, max: 100 },
    { sieve: 19, min: 71, max: 95 },
    { sieve: 9.5, min: 50, max: 73 },
    { sieve: 4.75, min: 38, max: 54 },
    { sieve: 2.36, min: 28, max: 42 },
    { sieve: 0.3, min: 7, max: 18 },
    { sieve: 0.075, min: 2, max: 8 },
  ],
  sma: [
    { sieve: 75, min: null, max: null },
    { sieve: 53, min: null, max: null },
    { sieve: 26.5, min: null, max: null },
    { sieve: 19, min: 100, max: 100 },
    { sieve: 9.5, min: 50, max: 75 },
    { sieve: 4.75, min: 20, max: 28 },
    { sieve: 2.36, min: 16, max: 24 },
    { sieve: 0.3, min: 12, max: 16 },
    { sieve: 0.075, min: 8, max: 12 },
  ],
  "bc-1": [
    { sieve: 75, min: null, max: null },
    { sieve: 53, min: null, max: null },
    { sieve: 26.5, min: null, max: null },
    { sieve: 19, min: 100, max: 100 },
    { sieve: 9.5, min: 70, max: 88 },
    { sieve: 4.75, min: 53, max: 71 },
    { sieve: 2.36, min: 42, max: 58 },
    { sieve: 0.3, min: 18, max: 28 },
    { sieve: 0.075, min: 4, max: 10 },
  ],
  "bc-2": [
    { sieve: 75, min: null, max: null },
    { sieve: 53, min: null, max: null },
    { sieve: 26.5, min: null, max: null },
    { sieve: 19, min: null, max: null },
    { sieve: 9.5, min: 90, max: 100 },
    { sieve: 4.75, min: 72, max: 88 },
    { sieve: 2.36, min: 56, max: 70 },
    { sieve: 0.3, min: 21, max: 31 },
    { sieve: 0.075, min: 4, max: 10 },
  ],
};

/** Default stockpile gradings (% passing per sieve, same order as SIEVE_SIZES). */
export const DEFAULT_STOCKPILES = {
  aggA: [100, 100, 100, 85, 30, 5, 0, 0, 0], // coarse
  aggB: [100, 100, 100, 100, 95, 45, 10, 0, 0], // intermediate
  aggC: [100, 100, 100, 100, 100, 100, 95, 45, 15], // fine / dust
  filler: [100, 100, 100, 100, 100, 100, 100, 100, 90], // mineral filler
};

export interface Stockpiles {
  aggA: number[];
  aggB: number[];
  aggC: number[];
  filler: number[];
}

export interface Proportions {
  aggA: number;
  aggB: number;
  aggC: number;
  filler: number;
}

export const DEFAULT_PROPORTIONS: Proportions = { aggA: 40, aggB: 30, aggC: 30, filler: 0 };

/** Blended % passing per sieve = sum(proportion x passing). */
export function blend(proportions: Proportions, stockpiles: Stockpiles): number[] {
  const p = [proportions.aggA / 100, proportions.aggB / 100, proportions.aggC / 100, proportions.filler / 100];
  const piles = [stockpiles.aggA, stockpiles.aggB, stockpiles.aggC, stockpiles.filler];
  return SIEVE_SIZES.map((_, i) => {
    let v = 0;
    for (let k = 0; k < 4; k++) v += p[k] * (piles[k][i] ?? 0);
    return Math.round(v * 10) / 10;
  });
}

export interface SieveCheck {
  sieve: number;
  min: number | null;
  max: number | null;
  blended: number;
  /** null = no spec band for this sieve (not a pass, not a fail) */
  status: "pass" | "fail" | null;
}

export function checkAgainstSpec(blended: number[], preset: MixPreset): SieveCheck[] {
  return SPECIFICATIONS[preset].map((spec, i) => {
    const b = blended[i];
    let status: SieveCheck["status"] = null;
    if (spec.min != null || spec.max != null) {
      status = "pass";
      if (spec.min != null && b < spec.min) status = "fail";
      if (spec.max != null && b > spec.max) status = "fail";
    }
    return { sieve: spec.sieve, min: spec.min, max: spec.max, blended: b, status };
  });
}

export function overallPass(checks: SieveCheck[]): boolean {
  return checks.every((c) => c.status !== "fail");
}

/** RMSE of the blended curve vs the middle of each spec band. */
export function rmseVsBandMid(blended: number[], preset: MixPreset): number {
  let sumSq = 0;
  let n = 0;
  for (let i = 0; i < SIEVE_SIZES.length; i++) {
    const spec = SPECIFICATIONS[preset][i];
    if (spec.min != null && spec.max != null) {
      const mid = (spec.min + spec.max) / 2;
      sumSq += (blended[i] - mid) ** 2;
      n++;
    }
  }
  return n === 0 ? 0 : Math.sqrt(sumSq / n);
}

/**
 * Auto-blend: grid search over 5% steps (A/B/C, filler fixed) minimising
 * RMSE vs the band mid. Proportions always sum to 100%.
 */
export function solveProportions(
  stockpiles: Stockpiles,
  preset: MixPreset,
  fillerPct = 0,
): { proportions: Proportions; rmse: number } {
  let best: { proportions: Proportions; rmse: number } | null = null;
  for (let a = 0; a <= 100 - fillerPct; a += 5) {
    for (let b = 0; b <= 100 - fillerPct - a; b += 5) {
      const c = 100 - fillerPct - a - b;
      const props: Proportions = { aggA: a, aggB: b, aggC: c, filler: fillerPct };
      const rmse = rmseVsBandMid(blend(props, stockpiles), preset);
      if (!best || rmse < best.rmse) best = { proportions: props, rmse };
    }
  }
  return best!;
}

/** JMF tolerances (MoRTH) by sieve, percentage points. */
export const JMF_TOLERANCE: Record<number, number | null> = {
  75: null,
  53: null,
  26.5: 8,
  19: 7,
  9.5: 6,
  4.75: 5,
  2.36: 4,
  0.3: 2,
  0.075: 2,
};

export interface MixQuantities {
  totalTonnes: number;
  bitumenKg: number;
  fillerKg: number;
  aggTonnes: { aggA: number; aggB: number; aggC: number };
}

/** Mix quantities for a paved area. Density default 2.35 t/m3 (compacted). */
export function calcMixQuantities(
  areaM2: number,
  thicknessMm: number,
  bitumenPct: number,
  proportions: Proportions,
  densityTm3 = 2.35,
): MixQuantities {
  const totalTonnes = areaM2 * (thicknessMm / 1000) * densityTm3;
  return {
    totalTonnes,
    bitumenKg: (totalTonnes * bitumenPct) / 100 * 1000,
    fillerKg: (totalTonnes * proportions.filler) / 100 * 1000,
    aggTonnes: {
      aggA: (totalTonnes * proportions.aggA) / 100,
      aggB: (totalTonnes * proportions.aggB) / 100,
      aggC: (totalTonnes * proportions.aggC) / 100,
    },
  };
}

export function validateStockpiles(stockpiles: Stockpiles): string[] {
  const errs: string[] = [];
  const names: Array<[string, number[]]> = [
    ["Aggregate A", stockpiles.aggA],
    ["Aggregate B", stockpiles.aggB],
    ["Aggregate C", stockpiles.aggC],
    ["Filler", stockpiles.filler],
  ];
  for (const [name, arr] of names) {
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] < 0 || arr[i] > 100) errs.push(`${name}: % passing must be 0-100 (sieve ${SIEVE_SIZES[i]} mm).`);
    }
    for (let i = 1; i < arr.length; i++) {
      if (arr[i] > arr[i - 1]) {
        errs.push(`${name}: % passing rises from ${SIEVE_SIZES[i - 1]} mm to ${SIEVE_SIZES[i]} mm — passing must not increase as the sieve gets finer. Check the entry.`);
        break;
      }
    }
  }
  return errs;
}

export function validateProportions(p: Proportions): string[] {
  const sum = p.aggA + p.aggB + p.aggC + p.filler;
  if (Math.abs(sum - 100) > 0.01) return [`Proportions must sum to 100% (currently ${sum.toFixed(1)}%).`];
  return [];
}
