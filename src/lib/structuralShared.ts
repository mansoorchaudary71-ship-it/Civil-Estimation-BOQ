/**
 * Shared helpers for the G7 structural-design engines (IS 456 / IS 3370 /
 * IS 1343 / IS 2911 / IS 2950). Pure functions, no React.
 *
 * Conventions (repo AGENTS.md + shared libs, imported never duplicated):
 * - Steel unit weight W = d^2 / 162.28 kg/m  -> unitWeightKgPerM (steelCalc.ts)
 * - Stirrup cutting length: stirrupLengthDetailed is canonical (steelCalc.ts)
 * - Dry concrete volume = wet x 1.54; 50 kg cement bag = 0.0347 m3;
 *   1 m3 = 35.3147 cft (unitConverter.ts CIVIL_CONSTANTS)
 * - Rates come from rates.ts (PK sourced Nov 2026; IN/AE null — never invented).
 *   A null rate means the cost line is unknown and must be shown as "—".
 */
import { unitWeightKgPerM } from "./steelCalc";
import { CIVIL_CONSTANTS } from "../utils/unitConverter";

export const DISCLAIMER =
  "Disclaimer: This estimate is algorithmically generated based on benchmark rates and standard assumptions. It should not be used as a substitute for a professional BOQ certified by a licensed structural engineer or quantity surveyor.";

export interface MixRatio {
  c: number;
  s: number;
  a: number;
}

export const MIX_RATIOS: Record<string, MixRatio> = {
  "M15 (1:2:4)": { c: 1, s: 2, a: 4 },
  "M20 (1:1.5:3)": { c: 1, s: 1.5, a: 3 },
  "M25 (1:1:2)": { c: 1, s: 1, a: 2 },
  "M30 (1:0.75:1.5)": { c: 1, s: 0.75, a: 1.5 },
};

export function mixRatioForGrade(fck: number): MixRatio {
  if (fck <= 15) return MIX_RATIOS["M15 (1:2:4)"];
  if (fck <= 20) return MIX_RATIOS["M20 (1:1.5:3)"];
  if (fck <= 25) return MIX_RATIOS["M25 (1:1:2)"];
  return MIX_RATIOS["M30 (1:0.75:1.5)"];
}

export interface MaterialBreakdown {
  /** wet concrete volume, m3 (before wastage unless noted by caller) */
  wetVolM3: number;
  dryVolM3: number;
  cementBags: number;
  sandCft: number;
  aggCft: number;
}

/** Cement / sand / aggregate from a wet concrete volume and a mix ratio. */
export function materialsForConcrete(
  wetVolM3: number,
  mix: MixRatio,
  wastagePct = 0,
): MaterialBreakdown {
  const wet = Math.max(0, wetVolM3) * (1 + Math.max(0, wastagePct) / 100);
  const dry = wet * CIVIL_CONSTANTS.DRY_CONCRETE_FACTOR;
  const total = mix.c + mix.s + mix.a;
  const cementM3 = (dry * mix.c) / total;
  return {
    wetVolM3: wet,
    dryVolM3: dry,
    cementBags: Math.ceil(cementM3 / CIVIL_CONSTANTS.CEMENT_BAG_VOLUME_M3),
    sandCft: ((dry * mix.s) / total) * CIVIL_CONSTANTS.M3_TO_CFT,
    aggCft: ((dry * mix.a) / total) * CIVIL_CONSTANTS.M3_TO_CFT,
  };
}

export interface CostLine {
  label: string;
  qty: number;
  unit: string;
  /** null = rate unknown, cost unknown (show "—", never price at 0) */
  rate: number | null;
  amount: number | null;
}

export function costLine(
  label: string,
  qty: number,
  unit: string,
  rate: number | null,
): CostLine {
  return {
    label,
    qty,
    unit,
    rate,
    amount: rate == null ? null : qty * rate,
  };
}

/** Sum of known cost lines; null when every line is unknown. */
export function totalCost(lines: CostLine[]): number | null {
  let total = 0;
  let known = false;
  for (const l of lines) {
    if (l.amount != null) {
      total += l.amount;
      known = true;
    }
  }
  return known ? total : null;
}

/** Steel weight (kg) for `count` bars of dia (mm) and length (m) each. */
export function barWeightKg(diaMm: number, lengthM: number, count: number): number {
  return unitWeightKgPerM(diaMm) * Math.max(0, lengthM) * Math.max(0, count);
}

/** Bar area, mm2. */
export function barAreaMm2(diaMm: number): number {
  return (Math.PI * diaMm * diaMm) / 4;
}

/** Number of bars across a width (mm) at spacing (mm): ceil((W-2c)/s)+1. */
export function barCountAcross(widthMm: number, coverMm: number, spacingMm: number): number {
  if (spacingMm <= 0) return 0;
  return Math.ceil(Math.max(0, widthMm - 2 * coverMm) / spacingMm) + 1;
}

/** Spacing (mm, floored to 10 mm) that provides `astReqMm2` per metre width. */
export function spacingForAst(astReqPerM: number, diaMm: number): number {
  if (astReqPerM <= 0) return 300;
  const s = (barAreaMm2(diaMm) / astReqPerM) * 1000;
  return Math.max(75, Math.floor(s / 10) * 10);
}

/** Ast provided (mm2 per metre width) by bars of dia at spacing (mm). */
export function astProvidedPerM(diaMm: number, spacingMm: number): number {
  if (spacingMm <= 0) return 0;
  return (barAreaMm2(diaMm) / spacingMm) * 1000;
}

// ---- IS 456 flexure (singly reinforced, LSM) -------------------------------

/** xu,max/d by steel grade (IS 456 Cl. G.2.2.1). */
export function xuMaxRatio(fy: number): number {
  if (fy <= 250) return 0.53;
  if (fy <= 415) return 0.48;
  if (fy <= 500) return 0.46;
  return 0.44;
}

/** Limiting moment of resistance, kNm (b, d in mm, fck in MPa). */
export function muLimKNm(fck: number, bMm: number, dMm: number, fy: number): number {
  const x = xuMaxRatio(fy);
  const rLim = 0.36 * fck * x * (1 - 0.416 * x);
  return (rLim * bMm * dMm * dMm) / 1e6;
}

/**
 * Tension steel for a moment Mu (kNm) on a section b x d (mm).
 * Returns Ast (mm2) by the exact LSM quadratic; 0 when Mu <= 0.
 */
export function astForMu(muKNm: number, fck: number, fy: number, bMm: number, dMm: number): number {
  if (muKNm <= 0 || bMm <= 0 || dMm <= 0) return 0;
  const term = 1 - (4.6 * muKNm * 1e6) / (fck * bMm * dMm * dMm);
  if (term < 0) return NaN; // Mu exceeds Mu,lim — caller must take the doubly branch
  return (0.5 * fck / fy) * (1 - Math.sqrt(term)) * bMm * dMm;
}

/** Minimum tension steel, IS 456 Cl. 26.5.1.1: Ast,min = 0.85 b d / fy. */
export function astMinMm2(fy: number, bMm: number, dMm: number): number {
  return (0.85 * bMm * dMm) / fy;
}

/** Maximum tension steel, IS 456 Cl. 26.5.1.1: Ast,max = 0.04 b D. */
export function astMaxMm2(bMm: number, dMm: number): number {
  return 0.04 * bMm * dMm;
}

// ---- IS 456 shear -----------------------------------------------------------

const TAU_C_MAX_TABLE: Record<number, number> = { 20: 2.8, 25: 3.1, 30: 3.5, 35: 3.7, 40: 4.0 };

/** tau_c,max (MPa) by fck — IS 456 Table 20 (interpolated). */
export function tauCMax(fck: number): number {
  if (fck <= 20) return 2.8;
  if (fck >= 40) return 4.0;
  return TAU_C_MAX_TABLE[fck] ?? 2.8 + ((fck - 20) * (4.0 - 2.8)) / 20;
}

/** tau_c (MPa) for steel percentage pt — IS 456 Table 19 expression. */
export function tauC(ptPct: number, fck: number): number {
  const p = Math.min(Math.max(ptPct, 0.15), 3.0);
  const beta = (0.8 * fck) / (6.89 * p);
  return (0.85 * Math.sqrt(0.8 * fck) * (Math.sqrt(1 + 5 * beta) - 1)) / (6 * beta);
}

const TAU_BD_TABLE: Record<number, number> = { 20: 1.2, 25: 1.4, 30: 1.5, 35: 1.7, 40: 1.9 };

/** Basic bond stress tau_bd (MPa) — IS 456 Table 26 (interpolated). */
export function tauBdBasic(fck: number): number {
  if (fck <= 20) return 1.2;
  if (fck >= 40) return 1.9;
  return TAU_BD_TABLE[fck] ?? 1.2 + ((fck - 20) * (1.9 - 1.2)) / 20;
}

/** Development length Ld (mm), IS 456 Cl. 26.2.1 (x1.6 for deformed bars). */
export function devLengthMm(fy: number, diaMm: number, fck: number): number {
  let tauBd = tauBdBasic(fck);
  if (fy > 250) tauBd *= 1.6;
  return (0.87 * fy * diaMm) / (4 * tauBd);
}

// ---- Validation -------------------------------------------------------------

export function num(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  return isFinite(n) ? n : NaN;
}

/** Collect "field must be > 0 / in range" errors; returns [] when valid. */
export function checkRange(
  errors: string[],
  label: string,
  value: number,
  min: number,
  max: number,
): void {
  if (!isFinite(value) || value <= 0) {
    errors.push(`${label} must be greater than 0.`);
  } else if (value < min || value > max) {
    errors.push(`${label} must be between ${min} and ${max}.`);
  }
}

export interface FaqItem {
  q: string;
  a: string;
}

/** Round to `dp` decimals (for stable test/display values). */
export function round(n: number, dp = 2): number {
  const f = 10 ** dp;
  return Math.round(n * f) / f;
}
