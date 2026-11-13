/**
 * Shared steel / reinforcement engine — pure functions, no React.
 * (brickCalc.ts pattern: one engine shared by every steel tool so the
 * BBS generator, reinforcement visualiser, cage estimator and metal-weight
 * calculator can never diverge again.)
 *
 * Canonical rules (repo AGENTS.md + G3 audit spec):
 * - Unit weight: W = d^2 / 162.28 kg/m (d in mm).
 * - Rectangular stirrup, AGENTS.md field rule: L = 2(A+B) + 24phi.
 * - Rectangular stirrup, IS 2502 detailed form:
 *   L = 2(A+B) + 2*10d - (3*2d + 2*3d).
 *   The two differ: the field rule counts the full hook allowance without
 *   deducting bend shortening, so it reads ~10% HIGHER than the detailed
 *   form (demo: 1.372 m vs 1.244 m for a 300x450 beam, cover 40, dia 8).
 *   Both are exported — callers must say which one they used. Do NOT
 *   silently pick one.
 *
 * Rates are INDICATIVE defaults (Nov 2026, sources noted below). They are
 * editable in the UI and must be confirmed with a local dealer.
 */

export type SteelCurrency = "PKR" | "INR" | "AED" | "USD";

export const STEEL_CURRENCY_META: Record<
  SteelCurrency,
  { symbol: string; label: string }
> = {
  PKR: { symbol: "Rs", label: "Pakistani Rupee" },
  INR: { symbol: "₹", label: "Indian Rupee" },
  AED: { symbol: "AED", label: "UAE Dirham" },
  USD: { symbol: "$", label: "US Dollar" },
};

/** Density of steel, kg/m3 (used by metal-weight profiles, not by rebar). */
export const STEEL_DENSITY = 7850;

/** Divisor in the standard unit-weight derivation W = d^2 / 162.28 kg/m. */
export const UNIT_WEIGHT_DIVISOR = 162.28;

/** Unit weight of one metre of rebar, kg/m. d in mm. */
export function unitWeightKgPerM(diaMm: number): number {
  if (!isFinite(diaMm) || diaMm <= 0) return 0;
  return (diaMm * diaMm) / UNIT_WEIGHT_DIVISOR;
}

export interface BarWeightRow {
  /** bar diameter, mm */
  diaMm: number;
  /** kg per metre */
  kgPerM: number;
  /** kg per 12 m stock bar */
  kgPer12m: number;
  /** kg per 40 ft (12.192 m) stock bar */
  kgPer40ft: number;
}

function barRow(diaMm: number): BarWeightRow {
  const kgPerM = unitWeightKgPerM(diaMm);
  return {
    diaMm,
    kgPerM,
    kgPer12m: kgPerM * STOCK_BAR_M,
    kgPer40ft: kgPerM * STOCK_BAR_FT_M,
  };
}

/** Standard stock bar lengths. 40 ft = 12.192 m, i.e. 1.6% longer than 12 m. */
export const STOCK_BAR_M = 12;
export const STOCK_BAR_FT = 40;
export const STOCK_BAR_FT_M = 12.192;
/** Shown whenever a 40 ft stock length is used in a metric calculation. */
export const STOCK_BAR_FT_WARNING =
  "40 ft stock is 12.192 m — 1.6% longer than a 12 m bar. Bar counts and " +
  "offcuts below use 12.192 m, not 12 m.";

export const BAR_WEIGHT_TABLE: BarWeightRow[] = [
  6, 8, 10, 12, 16, 20, 25, 28, 32,
].map(barRow);

/** Look a diameter up in the table (exact match only); null if not a stock size. */
export function barWeight(diaMm: number): BarWeightRow | null {
  return BAR_WEIGHT_TABLE.find((r) => r.diaMm === diaMm) ?? null;
}

export interface BarGrade {
  id: string;
  label: string;
  /** characteristic / specified yield strength, MPa */
  fyMpa: number;
  /** where this grade is the usual choice */
  region: string;
  standard: string;
}

/**
 * Bar grade is a label + yield strength for display and compliance checks.
 * It does NOT change the weight: a 20 mm bar weighs the same in any grade.
 */
export const BAR_GRADES: BarGrade[] = [
  {
    id: "grade60",
    label: "Grade 60",
    fyMpa: 415,
    region: "PK",
    standard: "ASTM A615",
  },
  {
    id: "fe500",
    label: "Fe500",
    fyMpa: 500,
    region: "IN",
    standard: "IS 1786",
  },
  {
    id: "b500b",
    label: "B500B",
    fyMpa: 500,
    region: "AE / UK",
    standard: "BS 4449",
  },
  {
    id: "grade40",
    label: "Grade 40",
    fyMpa: 280,
    region: "PK",
    standard: "ASTM A615",
  },
];

export interface BarsToOrder {
  /** full stock bars to order */
  bars: number;
  /** length of the last (cut) bar, m — the piece actually used */
  lastCutLengthM: number;
  /** unused offcut from the last bar, m */
  offcutM: number;
  /** total length ordered, m (= bars x stockLengthM) */
  orderedLengthM: number;
  stockLengthM: number;
}

/**
 * How many full stock bars to order for a total cut length.
 * bars = ceil(totalLengthM / stockLengthM).
 */
export function barsToOrder(
  totalLengthM: number,
  stockLengthM: number = STOCK_BAR_M,
): BarsToOrder {
  const total = Math.max(0, totalLengthM);
  const stock = stockLengthM > 0 ? stockLengthM : STOCK_BAR_M;
  const bars = total <= 0 ? 0 : Math.ceil(total / stock);
  const orderedLengthM = bars * stock;
  const lastCutLengthM =
    bars === 0 ? 0 : total - (bars - 1) * stock;
  return {
    bars,
    lastCutLengthM,
    offcutM: orderedLengthM - total,
    orderedLengthM,
    stockLengthM: stock,
  };
}

/** Lap joints implied by the stock-bar count: one lap per bar after the first. */
export function lapsFor(totalLengthM: number, stockLengthM: number = STOCK_BAR_M): number {
  return Math.max(0, barsToOrder(totalLengthM, stockLengthM).bars - 1);
}

/** Add wastage: qty * (1 + pct/100). pct is a percentage, e.g. 5 = +5%. */
export function applyWastage(qty: number, pct: number): number {
  return qty * (1 + Math.max(0, pct) / 100);
}

/**
 * Cost of steel. Returns null when the rate is unknown (null) — callers
 * must show "—" until the user enters a rate, never price at 0.
 */
export function costFor(weightKg: number, ratePerKg: number | null): number | null {
  if (ratePerKg == null || !isFinite(ratePerKg)) return null;
  return weightKg * ratePerKg;
}

export interface SteelRates {
  /** price per kg; null = not verified, user must enter */
  perKg: number | null;
}

/** Label attached to every indicative steel rate in the UI. */
export const STEEL_RATE_LABEL = "Indicative Nov 2026 — confirm with your dealer";

/**
 * Default steel rates per currency.
 * PKR 270/kg is the midpoint of the verified Oct–Nov 2026 branded
 * Grade 60 range (PKR 255–277/kg). The repo's old 280/kg default was
 * stale/high and must not be used as "current".
 * INR / AED / USD were NOT verified — left null, do not invent.
 */
export const STEEL_RATE_DEFAULTS: Record<SteelCurrency, SteelRates> = {
  PKR: { perKg: 270 },
  INR: { perKg: null },
  AED: { perKg: null },
  USD: { perKg: null },
};

export function formatSteelMoney(value: number | null, currency: SteelCurrency): string {
  if (value == null || !isFinite(value)) return "—";
  const { symbol } = STEEL_CURRENCY_META[currency];
  return `${symbol} ${Math.round(value).toLocaleString("en-US")}`;
}

/**
 * Rectangular stirrup cutting length — AGENTS.md field rule.
 * L = 2(A+B) + 24*phi. A and B are the INNER dimensions (section minus
 * 2x cover), phi is the stirrup bar diameter. All lengths in the same unit.
 */
export function stirrupLengthSimple(aMm: number, bMm: number, phiMm: number): number {
  return 2 * (aMm + bMm) + 24 * phiMm;
}

/**
 * Rectangular stirrup cutting length — IS 2502 detailed form.
 * L = 2(A+B) + 2*hookLen - (3*2d + 2*3d), with hookLen defaulting to 10d.
 * Default hookLenMm = 10*phi (two 135-degree hooks).
 * Demo: A=220, B=370, phi=8 -> 2*590 + 160 - (48+48) = 1,244 mm.
 */
export function stirrupLengthDetailed(
  aMm: number,
  bMm: number,
  phiMm: number,
  hookLenMm: number = 10 * phiMm,
): number {
  return 2 * (aMm + bMm) + 2 * hookLenMm - (3 * 2 * phiMm + 2 * 3 * phiMm);
}

/** Weight of one stirrup of the given cut length (mm) and diameter. */
export function stirrupWeightKg(cutLengthMm: number, phiMm: number): number {
  return (cutLengthMm / 1000) * unitWeightKgPerM(phiMm);
}
