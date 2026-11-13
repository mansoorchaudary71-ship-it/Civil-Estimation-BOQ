/**
 * mepConstants.ts — SINGLE source of truth for every MEP constant.
 * No MEP engine may hardcode any of these again. Every value below is
 * taken from the G6 audit spec (which verified each against the tool it
 * came from) and carries its source. Where the old tools contradicted
 * each other, the canonical value is the one stated here — the losing
 * value is named in the comment so nobody re-introduces it.
 *
 * No UI in this file: named constants + short source strings only.
 */

export type MepCity =
  | "Lahore"
  | "Karachi"
  | "Islamabad"
  | "Multan"
  | "Quetta"
  | "Dubai"
  | "Mumbai"
  | "Delhi";

/** Short source string per constant group, for UI footnotes. */
export const MEP_SOURCES: Record<string, string> = {
  solarWaterHeater: "Unified across MEP tools (G6 spec §4.4) — old 40 L/person value retired",
  rainwaterTank: "BS 8515 / BS EN 16941-1 — 5% of the LESSER of annual yield and annual demand",
  antiTermite: "IS 6313-2:2022",
  septicSludge: "CPHEEO — 30 L/person/year",
  solarPsh: "G6 spec §4.3 city presets (solar-roof Lahore 4.8 corrected to 5.0)",
  exportCredit: "NEPRA buyback ≈ PKR 9–11/kWh vs ~PKR 50 import tariff",
  acSizing: "ENERGY STAR room-size chart (G6 spec §4.9)",
  rainfall: "Long-term city averages (G6 spec §4.5) — verify with PMD/IMD",
  manning: "Standard Manning's n table (G6 spec §4.6)",
  peqs: "Punjab EPA / PEQS inland-discharge limits",
  ach: "G6 spec §4.7 ACH targets (room-type exhaust/supply)",
  batteryDod: "G6 spec §4.3 — LiFePO4 80%, lead-acid 50%",
};

/* ------------------------------------------------------------------ */
/* Solar water heater                                                  */
/* ------------------------------------------------------------------ */

/** Hot-water demand per person per day. CANONICAL: 50 L. The old
 *  solar-water-heater tool used 40 L/person — that value is retired. */
export const SOLAR_WATER_HEATER_L_PER_PERSON_PER_DAY = 50;

/** Tank = max(demand x 1.5, collector area x 60 L/m2), rounded up to a
 *  standard size. (G6 spec §4.4.) */
export const SOLAR_WATER_HEATER_TANK_DEMAND_MULTIPLIER = 1.5;
export const SOLAR_WATER_HEATER_TANK_L_PER_M2_COLLECTOR = 60;
export const SOLAR_WATER_HEATER_STANDARD_TANK_SIZES_L = [100, 150, 200, 300, 500];

/** Solar fraction default (share of annual hot-water energy from the sun). */
export const SOLAR_WATER_HEATER_SOLAR_FRACTION_DEFAULT = 0.6;

/* ------------------------------------------------------------------ */
/* Rainwater harvesting                                                */
/* ------------------------------------------------------------------ */

/**
 * Tank = 5% of the LESSER of annual yield and annual demand (BS 8515).
 * The standalone rainwater tool used 8% of yield (no demand input) and
 * the infra engine used 5% of yield — both are retired: the rule needs
 * demand, and it is the lesser of the two that governs.
 */
export const RAINWATER_TANK_FRACTION_OF_LESSER = 0.05;

export function rainwaterTankLitres(annualYieldL: number, annualDemandL: number): number {
  return RAINWATER_TANK_FRACTION_OF_LESSER * Math.min(annualYieldL, annualDemandL);
}

/** Long-term average annual rainfall, mm. Verify with PMD/IMD before publishing. */
export const RAINFALL_MM_BY_CITY: Record<MepCity, number> = {
  Lahore: 628,
  Karachi: 174,
  Islamabad: 1143,
  Multan: 186,
  Quetta: 244,
  Dubai: 94,
  Mumbai: 2213,
  Delhi: 797,
};

/** Runoff coefficients by roof type (G6 spec §4.5). */
export const RAINWATER_RUNOFF_COEFFICIENT: Record<string, number> = {
  metal: 0.9,
  concreteTiles: 0.85,
  asphalt: 0.8,
  gravel: 0.6,
  greenRoof: 0.2,
};

/** First-flush diversion + filter efficiency defaults (G6 spec §4.5). */
export const RAINWATER_FILTER_EFFICIENCY_DEFAULT = 0.9;
export const RAINWATER_FIRST_FLUSH_L_PER_M2_PER_EVENT = 0.5;

/* ------------------------------------------------------------------ */
/* Solar PV                                                            */
/* ------------------------------------------------------------------ */

/**
 * Peak sun hours by city. CANONICAL. The old tools used 4.0 (MEP),
 * 4.5 (infra) and 4.8 (solar-roof, Lahore) for the same cities — all
 * retired in favour of this one table.
 */
export const SOLAR_PSH_BY_CITY: Record<MepCity, number> = {
  Lahore: 5.0,
  Karachi: 5.6,
  Islamabad: 5.0,
  Multan: 5.5,
  Quetta: 5.8,
  Dubai: 6.2,
  Mumbai: 5.1,
  Delhi: 5.2,
};

/** Exported units are credited at this fraction of the import tariff.
 *  CANONICAL: 20%. The solar-roof default of 100% overstated savings
 *  ~2x on exported units and is retired. */
export const SOLAR_EXPORT_CREDIT_FRACTION_OF_TARIFF = 0.2;

/** Depth of discharge by battery chemistry. */
export const BATTERY_DOD: Record<"lifepo4" | "leadAcid", number> = {
  lifepo4: 0.8,
  leadAcid: 0.5,
};

/** Grid-average CO2 factor for savings claims — label as an estimate. */
export const SOLAR_CO2_KG_PER_KWH = 0.5;

/* ------------------------------------------------------------------ */
/* Anti-termite (IS 6313-2:2022) — SAFETY-CRITICAL                    */
/* ------------------------------------------------------------------ */

/**
 * Trench dose: 7.5 L of diluted emulsion PER LINEAR METRE of trench
 * (sides, to 30 cm depth). The old anti-termite tool used
 * perimeter x depth x 7.5 (per m2 of wall area) — that UNDER-DOSED by
 * 50% (150 L vs the correct 300 L at the defaults). Never reproduce it.
 */
export const ANTITERMITE_TRENCH_L_PER_LINEAR_M = 7.5;
/** Floor / plinth soil dose, L per m2. */
export const ANTITERMITE_FLOOR_L_PER_M2 = 5;
/** Trench-bottom dose, L per m2 of trench bottom. */
export const ANTITERMITE_TRENCH_BOTTOM_L_PER_M2 = 5;

/* ------------------------------------------------------------------ */
/* Septic / sewerage                                                   */
/* ------------------------------------------------------------------ */

/** Sludge accumulation: 30 L/person/year (CPHEEO). The old sewerage
 *  tool used 80 L/user as a 2-year total — retired. */
export const SEPTIC_SLUDGE_L_PER_PERSON_PER_YEAR = 30;
/** IS 2470 minimums enforced on every septic sizing. */
export const SEPTIC_MIN_LIQUID_VOLUME_L = 1000;
export const SEPTIC_MIN_WIDTH_M = 0.75;
export const SEPTIC_MIN_LIQUID_DEPTH_M = 1.0;
export const SEPTIC_FREEBOARD_M = 0.3;

/** Manning's roughness coefficients. */
export const MANNING_N: Record<string, number> = {
  pvc: 0.009,
  upvc: 0.009,
  hdpe: 0.009,
  concrete: 0.013,
  castIron: 0.014,
  clay: 0.015,
};

/** PEQS / NEQS effluent limits, mg/L (inland discharge / to sewer). */
export const PEQS_LIMITS_MG_L = {
  bodInland: 80,
  bodToSewer: 250,
  codInland: 150,
  codToSewer: 400,
  tss: 200,
};

/* ------------------------------------------------------------------ */
/* AC sizing — ENERGY STAR chart (G6 spec §4.9)                        */
/* ------------------------------------------------------------------ */

/** 12,000 BTU/h = 1 ton of cooling. */
export const BTU_PER_TON = 12000;

/**
 * ENERGY STAR base table: room area (sq ft) -> base BTU/h.
 * The old tools used 5 BTU/ft3 (MEP) and 337 BTU/m2 (infra, ~35–50%
 * oversized) — both retired. Adjustments, in order:
 * base x (ceilingHeightFt / 8) x sunFactor + 600 x max(0, occupants - 2)
 * + 4,000 if kitchen. Then round UP to the nearest standard size.
 */
export const ENERGY_STAR_AC_TABLE: ReadonlyArray<{ maxAreaSqFt: number; btuPerHour: number }> = [
  { maxAreaSqFt: 150, btuPerHour: 5000 },
  { maxAreaSqFt: 250, btuPerHour: 6000 },
  { maxAreaSqFt: 300, btuPerHour: 7000 },
  { maxAreaSqFt: 350, btuPerHour: 8000 },
  { maxAreaSqFt: 400, btuPerHour: 9000 },
  { maxAreaSqFt: 450, btuPerHour: 10000 },
  { maxAreaSqFt: 550, btuPerHour: 12000 },
  { maxAreaSqFt: 700, btuPerHour: 14000 },
  { maxAreaSqFt: 1000, btuPerHour: 18000 },
  { maxAreaSqFt: 1200, btuPerHour: 21000 },
  { maxAreaSqFt: 1400, btuPerHour: 23000 },
  { maxAreaSqFt: 1500, btuPerHour: 24000 },
  { maxAreaSqFt: 2000, btuPerHour: 30000 },
  { maxAreaSqFt: 2500, btuPerHour: 34000 },
];

export const AC_SUN_FACTOR: Record<"shaded" | "normal" | "sunny", number> = {
  shaded: 0.9,
  normal: 1.0,
  sunny: 1.1,
};
export const AC_BTU_PER_EXTRA_PERSON = 600;
export const AC_KITCHEN_EXTRA_BTU = 4000;
export const AC_STANDARD_SIZES_BTU = [5000, 6000, 8000, 10000, 12000, 18000, 24000, 30000, 36000];
/** Default SEER2 for running-cost estimates (editable in the UI). */
export const AC_SEER2_DEFAULT = 15;

/** Base BTU/h for a room area in sq ft (top of the ENERGY STAR table above 2,500 sq ft). */
export function energyStarBaseBtu(areaSqFt: number): number {
  for (const row of ENERGY_STAR_AC_TABLE) {
    if (areaSqFt <= row.maxAreaSqFt) return row.btuPerHour;
  }
  return 34000;
}

/* ------------------------------------------------------------------ */
/* Ventilation                                                         */
/* ------------------------------------------------------------------ */

/** Target air changes per hour by room type (G6 spec §4.7). */
export const VENTILATION_ACH_TARGET: Record<string, number> = {
  bedroom: 4,
  living: 4,
  kitchen: 10,
  bathroom: 8,
  office: 6,
  classroom: 6,
};
