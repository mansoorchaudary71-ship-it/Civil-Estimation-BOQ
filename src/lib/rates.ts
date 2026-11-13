/**
 * Shared rate table — the ONE dated, sourced rate table per region that
 * every tool consumes. No component may hardcode a material rate again.
 *
 * Rules (G9 audit spec):
 * - Every value is either sourced below or explicitly null (unverified).
 *   Never invent a rate.
 * - `null` means "unknown — the UI must ask the user to enter a rate and
 *   show '—' for any cost that depends on it", never price at 0.
 * - The old crush default of PKR 250/cft was a proven ~3x error
 *   (PK crush is ~65–110/cft); it is NOT carried here. PK crush = 90/cft.
 * - PK brick 23,355/1,000 is the Pakistan Bureau of Statistics
 *   Aug 2026 Lahore figure (already established for the brick pages).
 * - PK steel 270/kg is the midpoint of the verified Oct–Nov 2026 branded
 *   Grade 60 range (255–277/kg); see steelCalc.ts. Labelled indicative.
 * - IN / AE tables are all null: no sourced IN/AE rate was in the audit
 *   specs, so nothing is published for them. Group agents: fill a value
 *   only with a dated source, never from memory.
 */
import { STEEL_RATE_DEFAULTS, type SteelCurrency } from "./steelCalc";

export type Region = "PK" | "IN" | "AE";
export type RateCurrency = "PKR" | "INR" | "AED";
export const DEFAULT_REGION: Region = "PK";

export interface RegionRates {
  cementPerBag: number | null;
  steelPerKg: number | null;
  /** price per 1,000 bricks */
  bricksPer1000: number | null;
  sandPerCft: number | null;
  crushPerCft: number | null;
  tilesPerBox: number | null;
  paintPerL: number | null;
  labourMasonPerDay: number | null;
  labourHelperPerDay: number | null;
  /** grey-structure labour, per sq ft (MarketRatesContext default) */
  labourGreyPerSqft: number | null;
  /** finishing labour, per sq ft (MarketRatesContext default) */
  labourFinishPerSqft: number | null;
  /** overhead + profit markup, percent */
  overheadMarkupPct: number | null;
}

export interface RateTable {
  region: Region;
  currency: RateCurrency;
  /** ISO date the table was compiled / last verified */
  lastUpdated: string;
  source: string;
  rates: RegionRates;
  /** per-rate provenance, so the UI can show "source + date" per line */
  rateSources: Partial<Record<keyof RegionRates, string>>;
}

export const RATE_TABLES: Record<Region, RateTable> = {
  PK: {
    region: "PK",
    currency: "PKR",
    lastUpdated: "2026-11-12",
    source:
      "PBS Aug 2026 (bricks, Lahore) + CEP market check Nov 2026 (indicative) + MarketRatesContext defaults (undated)",
    rates: {
      cementPerBag: 1450,
      steelPerKg: STEEL_RATE_DEFAULTS.PKR.perKg,
      bricksPer1000: 23355,
      sandPerCft: 90,
      crushPerCft: 90,
      tilesPerBox: 1200,
      paintPerL: 300,
      labourMasonPerDay: 1200,
      labourHelperPerDay: 600,
      labourGreyPerSqft: 500,
      labourFinishPerSqft: 600,
      overheadMarkupPct: 15,
    },
    rateSources: {
      cementPerBag: "CEP market check Nov 2026 — indicative",
      steelPerKg: "Indicative Nov 2026 — confirm with your dealer",
      bricksPer1000: "Pakistan Bureau of Statistics, Aug 2026, Lahore",
      sandPerCft: "MarketRatesContext default (undated) — indicative",
      crushPerCft:
        "G9 spec worked value 90/cft (PK crush ~65–110/cft); old 250/cft default was a ~3x error",
      tilesPerBox: "MarketRatesContext default (undated) — indicative",
      paintPerL: "MarketRatesContext default (undated) — indicative",
      labourMasonPerDay: "LabourCalculator preset (unsourced) — indicative",
      labourHelperPerDay: "LabourCalculator preset (unsourced) — indicative",
      labourGreyPerSqft: "MarketRatesContext default (undated) — indicative",
      labourFinishPerSqft: "MarketRatesContext default (undated) — indicative",
      overheadMarkupPct: "MarketRatesContext default (undated)",
    },
  },
  IN: {
    region: "IN",
    currency: "INR",
    lastUpdated: "2026-11-12",
    source: "No verified IN rate in the audit specs — all values null pending verification",
    rates: {
      cementPerBag: null,
      steelPerKg: null,
      bricksPer1000: null,
      sandPerCft: null,
      crushPerCft: null,
      tilesPerBox: null,
      paintPerL: null,
      labourMasonPerDay: null,
      labourHelperPerDay: null,
      labourGreyPerSqft: null,
      labourFinishPerSqft: null,
      overheadMarkupPct: null,
    },
    rateSources: {},
  },
  AE: {
    region: "AE",
    currency: "AED",
    lastUpdated: "2026-11-12",
    source: "No verified AE rate in the audit specs — all values null pending verification",
    rates: {
      cementPerBag: null,
      steelPerKg: null,
      bricksPer1000: null,
      sandPerCft: null,
      crushPerCft: null,
      tilesPerBox: null,
      paintPerL: null,
      labourMasonPerDay: null,
      labourHelperPerDay: null,
      labourGreyPerSqft: null,
      labourFinishPerSqft: null,
      overheadMarkupPct: null,
    },
    rateSources: {},
  },
};

export function getRates(region: Region = DEFAULT_REGION): RateTable {
  return RATE_TABLES[region] ?? RATE_TABLES[DEFAULT_REGION];
}

/** Steel rate for a currency, from the shared table (null = unverified). */
export function steelRatePerKg(currency: SteelCurrency): number | null {
  return STEEL_RATE_DEFAULTS[currency]?.perKg ?? null;
}

const RATE_CURRENCY_SYMBOL: Record<RateCurrency | "USD", string> = {
  PKR: "Rs",
  INR: "₹",
  AED: "AED",
  USD: "$",
};

/**
 * Format one rate for display, e.g. `Rs 1,450 / bag` or `—` when unknown.
 * `unitLabel` is the unit the rate is quoted in ("bag", "kg", "cft", ...).
 */
export function formatRate(
  value: number | null,
  currency: RateCurrency | "USD",
  unitLabel?: string,
): string {
  if (value == null || !isFinite(value)) return "—";
  const symbol = RATE_CURRENCY_SYMBOL[currency] ?? currency;
  const num = value.toLocaleString("en-US");
  return unitLabel ? `${symbol} ${num} / ${unitLabel}` : `${symbol} ${num}`;
}

/** localStorage key for user-edited rate overrides (per region). */
export const RATES_STORAGE_KEY = "cep-rates-v1";

export type RateOverrides = Partial<RegionRates>;

/**
 * Load the user's saved rate overrides for a region (plain function, no
 * React — safe to call from engines and from the useRates hook).
 * Returns {} when nothing is saved or storage is unavailable (SSR/tests).
 */
export function loadSavedRates(region: Region): RateOverrides {
  try {
    if (typeof localStorage === "undefined") return {};
    const raw = localStorage.getItem(`${RATES_STORAGE_KEY}:${region}`);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (parsed == null || typeof parsed !== "object") return {};
    const out: RateOverrides = {};
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof v === "number" && isFinite(v)) {
        (out as Record<string, number>)[k] = v;
      }
    }
    return out;
  } catch {
    return {};
  }
}

/** Persist the user's rate overrides for a region. No-op when storage is unavailable. */
export function saveRates(region: Region, overrides: RateOverrides): void {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(`${RATES_STORAGE_KEY}:${region}`, JSON.stringify(overrides));
  } catch {
    // Storage full / unavailable — overrides stay session-only.
  }
}

/** Effective rates for a region: table defaults with the user's saved overrides applied. */
export function getEffectiveRates(region: Region = DEFAULT_REGION): RegionRates {
  return { ...getRates(region).rates, ...loadSavedRates(region) };
}
