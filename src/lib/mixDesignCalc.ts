/**
 * Concrete mix design engine — IS 10262:2019 (default) + ACI 211.1.
 * Pure functions, no React, metric internally.
 *
 * One absolute-volume engine for both methods:
 *   V_cem + V_water + V_air + V_admix + V_FA + V_CA = 1.000 m3
 *   V = mass / (SG x 1000)
 * Fresh-density sanity band 2,300-2,500 kg/m3.
 *
 * SOURCES (do NOT copy multicalci's tables):
 * - IS 10262:2019 Cl 5.2 target strength; Table 2 / IS 456 Table 8 SD;
 *   Table 4 water (25-50 mm slump); Fig. 1 w/c-strength curve (encoded
 *   as a table, linear interpolation); Table 5 CA volume fraction.
 * - IS 456:2000 Table 5 durability (min cement / max w/c / min grade).
 *   Correct values: Mild 300/0.55/M20; Moderate 300/0.50/M25;
 *   Severe 320/0.45/M30; Very severe 340/0.45/M35; Extreme 360/0.40/M40.
 *   Max cement 450 kg/m3.
 * - ACI 211.1 Table 6.3.3 (water), Table 6.3.4(a) (w/c keyed to f'cr,
 *   NOT f'c), Table 6.3.6 (CA dry-rodded volume by FM).
 *
 * VERIFICATION FLAG: the IS 10262 Table 5 CA-fraction values and the
 * Fig. 1 w/c-strength curve are reproduced from standard references
 * (concreteinfo / IS 10262 walkthroughs). Verify them against a BIS
 * controlled copy of IS 10262:2019 before release.
 */

export type MixMethod = "IS" | "ACI";
export type Exposure = "Mild" | "Moderate" | "Severe" | "Very severe" | "Extreme";
export type FaZone = "I" | "II" | "III" | "IV";
export type AggType = "angular" | "rounded";
export type CementType = "OPC43" | "OPC53" | "PPC" | "SRPC";
export type AciExposure = "none" | "F1" | "F2" | "F3" | "C1" | "C2";

export const CEMENT_SG: Record<CementType, number> = {
  OPC43: 3.15,
  OPC53: 3.15,
  PPC: 2.9,
  SRPC: 3.2,
};

export const CEMENT_LABEL: Record<CementType, string> = {
  OPC43: "OPC 43",
  OPC53: "OPC 53",
  PPC: "PPC",
  SRPC: "SRPC",
};

/** IS 456 Table 5 durability limits (correct values — see header). */
export const DURABILITY: Record<
  Exposure,
  { minCementKg: number; maxWc: number; minGrade: number }
> = {
  Mild: { minCementKg: 300, maxWc: 0.55, minGrade: 20 },
  Moderate: { minCementKg: 300, maxWc: 0.5, minGrade: 25 },
  Severe: { minCementKg: 320, maxWc: 0.45, minGrade: 30 },
  "Very severe": { minCementKg: 340, maxWc: 0.45, minGrade: 35 },
  Extreme: { minCementKg: 360, maxWc: 0.4, minGrade: 40 },
};

/** Max cement, kg/m3 (IS 456, excluding fly ash / GGBS). */
export const MAX_CEMENT_KG = 450;
/** 50 kg bag volume, m3 (repo AGENTS.md cement-bag rule). */
export const CEMENT_BAG_KG = 50;
export const CEMENT_BAG_M3 = 0.0347;

/** IS 10262 Table 2 / IS 456 Table 8 standard deviation, MPa. */
export function sdForGrade(fck: number): number {
  if (fck <= 15) return 3.5;
  if (fck <= 25) return 4.0;
  return 5.0;
}

/** Target mean strength f'ck = fck + 1.65 x SD (IS 10262 Cl 5.2). */
export function targetStrength(fck: number, sd: number): number {
  return fck + 1.65 * sd;
}

/** Round UP to the nearest 0.5 MPa for display (38.25 -> 38.5). */
export function roundUpHalf(v: number): number {
  return Math.ceil(v * 2 - 1e-9) / 2;
}

/** IS 10262 Table 4 water, kg/m3, 25-50 mm slump, non-air-entrained. */
export const WATER_TABLE_IS: Record<AggType, Record<10 | 20 | 40, number>> = {
  angular: { 10: 208, 20: 186, 40: 165 },
  rounded: { 10: 190, 20: 170, 40: 150 },
};

/** Slump correction: +3% per +25 mm above 50 mm, -3% per 25 mm below (floor at 25 mm). */
export function slumpFactor(slumpMm: number): number {
  const f = 1 + 0.03 * ((slumpMm - 50) / 25);
  return Math.max(0.97, f);
}

/** IS 10262 Fig. 1 design curve (target strength MPa -> w/c), linear interpolation. */
const WC_STRENGTH_IS: Array<[number, number]> = [
  [26.6, 0.55],
  [31.6, 0.5],
  [38.3, 0.45],
  [43.3, 0.42],
  [48.3, 0.4],
];

export function wcFromStrengthIS(fm: number): { wc: number; clamped: boolean } {
  const pts = WC_STRENGTH_IS;
  if (fm <= pts[0][0]) return { wc: pts[0][1], clamped: fm < pts[0][0] };
  if (fm >= pts[pts.length - 1][0])
    return { wc: pts[pts.length - 1][1], clamped: fm > pts[pts.length - 1][0] };
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[i + 1];
    if (fm >= x0 && fm <= x1) {
      return { wc: y0 + ((fm - x0) / (x1 - x0)) * (y1 - y0), clamped: false };
    }
  }
  return { wc: 0.5, clamped: true };
}

/**
 * IS 10262 Table 5 — CA volume fraction of total aggregate, w/c 0.50.
 * Adjust +0.01 per 0.05 decrease in w/c, -0.01 per 0.05 increase.
 * Pumped concrete: -10% relative.
 * FLAG: verify against a BIS controlled copy before release.
 */
export const CA_FRACTION_IS: Record<10 | 20 | 40, Record<FaZone, number>> = {
  10: { I: 0.44, II: 0.46, III: 0.48, IV: 0.5 },
  20: { I: 0.6, II: 0.62, III: 0.64, IV: 0.66 },
  40: { I: 0.68, II: 0.7, III: 0.72, IV: 0.74 },
};

export function caFractionIS(
  maxAggMm: 10 | 20 | 40,
  zone: FaZone,
  wc: number,
  pumped: boolean,
): number {
  const base = CA_FRACTION_IS[maxAggMm][zone];
  const adj = ((0.5 - wc) / 0.05) * 0.01;
  let frac = base + adj;
  if (pumped) frac *= 0.9;
  return Math.min(0.85, Math.max(0.3, frac));
}

/* ---------------- ACI 211.1 tables ---------------- */

/** ACI Table 6.3.3 water, kg/m3, non-air-entrained, by slump band. */
export const ACI_WATER: Record<string, Record<number, number>> = {
  "25-50": { 9.5: 207, 12.5: 199, 19: 190, 25: 179, 37.5: 166, 50: 154, 75: 130, 100: 113 },
  "75-100": { 9.5: 228, 12.5: 216, 19: 205, 25: 193, 37.5: 181, 50: 169, 75: 145, 100: 124 },
  "150-175": { 9.5: 243, 12.5: 228, 19: 216, 25: 202, 37.5: 190, 50: 178, 75: 160, 100: 140 },
};

/** ACI Table 6.3.3 entrapped air, %. */
export const ACI_AIR: Record<number, number> = {
  9.5: 3.0, 12.5: 2.5, 19: 2.0, 25: 1.5, 37.5: 1.0, 50: 0.5, 75: 0.3, 100: 0.2,
};

/** ACI Table 6.3.4(a) w/c by REQUIRED average strength f'cr (not f'c). */
const WC_ACI: Array<[number, number]> = [
  [15, 0.79],
  [20, 0.69],
  [25, 0.61],
  [30, 0.54],
  [35, 0.47],
  [40, 0.42],
];

export function wcFromStrengthACI(fcr: number): { wc: number; clamped: boolean } {
  const pts = WC_ACI;
  if (fcr <= pts[0][0]) return { wc: pts[0][1], clamped: fcr < pts[0][0] };
  if (fcr >= pts[pts.length - 1][0])
    return { wc: pts[pts.length - 1][1], clamped: fcr > pts[pts.length - 1][0] };
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[i + 1];
    if (fcr >= x0 && fcr <= x1) {
      return { wc: y0 + ((fcr - x0) / (x1 - x0)) * (y1 - y0), clamped: false };
    }
  }
  return { wc: 0.54, clamped: true };
}

/** ACI Table 6.3.6 — dry-rodded CA volume per unit volume of concrete, by FM. */
export const ACI_CA_VOL: Record<number, Record<number, number>> = {
  9.5: { 2.4: 0.5, 2.6: 0.48, 2.8: 0.46, 3.0: 0.44 },
  12.5: { 2.4: 0.59, 2.6: 0.57, 2.8: 0.55, 3.0: 0.53 },
  19: { 2.4: 0.66, 2.6: 0.64, 2.8: 0.62, 3.0: 0.6 },
  25: { 2.4: 0.71, 2.6: 0.69, 2.8: 0.67, 3.0: 0.65 },
  37.5: { 2.4: 0.75, 2.6: 0.73, 2.8: 0.71, 3.0: 0.69 },
  50: { 2.4: 0.78, 2.6: 0.76, 2.8: 0.74, 3.0: 0.72 },
  75: { 2.4: 0.82, 2.6: 0.8, 2.8: 0.78, 3.0: 0.76 },
  100: { 2.4: 0.85, 2.6: 0.83, 2.8: 0.81, 3.0: 0.79 },
};

export function aciCaVolumeFraction(sizeMm: number, fm: number): number {
  const row = ACI_CA_VOL[sizeMm] ?? ACI_CA_VOL[19];
  const fms = [2.4, 2.6, 2.8, 3.0];
  if (fm <= 2.4) return row[2.4];
  if (fm >= 3.0) return row[3.0];
  for (let i = 0; i < fms.length - 1; i++) {
    if (fm >= fms[i] && fm <= fms[i + 1]) {
      const t = (fm - fms[i]) / (fms[i + 1] - fms[i]);
      return row[fms[i]] + t * (row[fms[i + 1]] - row[fms[i]]);
    }
  }
  return row[2.6];
}

/** ACI 318 durability w/c caps by exposure class (F/C). */
export const ACI_DURABILITY_MAX_WC: Record<AciExposure, number | null> = {
  none: null,
  F1: 0.45,
  F2: 0.45,
  F3: 0.4,
  C1: 0.4,
  C2: 0.4,
};

/** Map a nominal max-aggregate size to the nearest ACI table row. */
export function aciSizeRow(maxAggMm: 10 | 20 | 40): number {
  return maxAggMm === 10 ? 9.5 : maxAggMm === 20 ? 19 : 37.5;
}

/* ---------------- Inputs / outputs ---------------- */

export interface MixDesignInputs {
  method: MixMethod;
  /** IS: grade fck (M10-M60). ACI: specified f'c, MPa. */
  fck: number;
  sdMode: "table" | "custom";
  sdCustom: number;
  exposure: Exposure;
  aciExposure: AciExposure;
  maxAggMm: 10 | 20 | 40;
  aggType: AggType;
  slumpMm: number;
  cementType: CementType;
  sgCem: number;
  sgFA: number;
  sgCA: number;
  faZone: FaZone;
  /** CA volume fraction override (IS only); null = Table 5 value. */
  caFractionOverride: number | null;
  fm: number;
  dryRoddedKgM3: number;
  wcMode: "auto" | "manual";
  wcManual: number;
  pceReductionPct: number;
  pceDosePct: number;
  moistureFA: number; // fraction, e.g. 0.03 = 3%
  moistureCA: number;
  batchVolumeM3: number;
  airPct: number; // entrapped air %, IS default 1.5
  pumped: boolean;
}

export function defaultMixDesignInputs(): MixDesignInputs {
  return {
    method: "IS",
    fck: 25,
    sdMode: "table",
    sdCustom: 4.0,
    exposure: "Moderate",
    aciExposure: "none",
    maxAggMm: 20,
    aggType: "angular",
    slumpMm: 50,
    cementType: "OPC53",
    sgCem: 3.15,
    sgFA: 2.65,
    sgCA: 2.7,
    faZone: "II",
    caFractionOverride: null,
    fm: 2.6,
    dryRoddedKgM3: 1600,
    wcMode: "auto",
    wcManual: 0.5,
    pceReductionPct: 0,
    pceDosePct: 0,
    moistureFA: 0,
    moistureCA: 0,
    batchVolumeM3: 1,
    airPct: 1.5,
    pumped: false,
  };
}

export interface BatchWeights {
  volumeM3: number;
  cementKg: number;
  cementBagsExact: number;
  cementBagsOrder: number;
  waterL: number;
  faKg: number;
  caKg: number;
}

export interface MixDesignResult {
  inputs: MixDesignInputs;
  sdUsed: number;
  /** target mean strength (IS f'ck / ACI f'cr), MPa */
  targetStrength: number;
  targetStrengthDisplay: number;
  waterBaseKg: number;
  waterKg: number;
  waterBatchedKg: number;
  wcStrength: number;
  wcDurability: number | null;
  wcGoverning: number;
  wcActual: number;
  governedBy: "strength" | "durability" | "manual" | "cement-minimum";
  cementKg: number;
  cementBagsExact: number;
  cementBagsOrder: number;
  cementRaisedToMinimum: boolean;
  cementMinKg: number;
  vCem: number;
  vWater: number;
  vAir: number;
  vAdmix: number;
  vAgg: number;
  vFA: number;
  vCA: number;
  caFraction: number;
  caFractionTable: number | null;
  faKg: number;
  caKg: number;
  admixtureKg: number;
  ratioFA: number;
  ratioCA: number;
  densityKgM3: number;
  densityOk: boolean;
  batch: BatchWeights;
  batchHalf: BatchWeights;
  moistureCorrected: boolean;
  waterFloorApplied: boolean;
  warnings: string[];
  errors: string[];
  steps: string[];
}

function round2(v: number): number {
  return Math.round(v * 100) / 100;
}

function batchFor(r: Omit<MixDesignResult, "batch" | "batchHalf">, volumeM3: number): BatchWeights {
  const cementKg = r.cementKg * volumeM3;
  // SSD moisture correction applies to the batched (as-weighed) masses.
  const faKg = r.faKg * (1 + r.inputs.moistureFA) * volumeM3;
  const caKg = r.caKg * (1 + r.inputs.moistureCA) * volumeM3;
  const waterL =
    (r.waterKg - r.faKg * r.inputs.moistureFA - r.caKg * r.inputs.moistureCA) *
    volumeM3;
  const waterFloored = Math.max(waterL, 0.8 * r.waterKg * volumeM3);
  return {
    volumeM3,
    cementKg,
    cementBagsExact: cementKg / CEMENT_BAG_KG,
    cementBagsOrder: Math.ceil(cementKg / CEMENT_BAG_KG),
    waterL: waterFloored,
    faKg,
    caKg,
  };
}

export function calcMixDesign(inp: MixDesignInputs): MixDesignResult {
  const warnings: string[] = [];
  const errors: string[] = [];
  const steps: string[] = [];

  const sdUsed = inp.sdMode === "custom" ? inp.sdCustom : sdForGrade(inp.fck);
  if (inp.sdMode === "custom" && inp.sdCustom < sdForGrade(inp.fck)) {
    warnings.push(
      `Your standard deviation (${inp.sdCustom} MPa) is lower than the IS 10262 Table value (${sdForGrade(inp.fck)} MPa) — only use it with at least 30 test results (IS 10262 Cl 5.2).`,
    );
  }

  let fTarget: number;
  let wcStrength: number;
  let wcDurability: number | null = null;
  let waterBaseKg: number;
  let waterKg: number;
  let airPct = inp.airPct;
  let caFraction: number;
  let caFractionTable: number | null = null;
  let governedBy: MixDesignResult["governedBy"] = "strength";
  let cementMinKg = 0;

  if (inp.method === "IS") {
    fTarget = targetStrength(inp.fck, sdUsed);
    steps.push(`Target strength f'ck = ${inp.fck} + 1.65 x ${sdUsed} = ${fTarget.toFixed(2)} MPa (IS 10262 Cl 5.2).`);
    const dur = DURABILITY[inp.exposure];
    cementMinKg = dur.minCementKg;
    wcDurability = dur.maxWc;
    if (inp.fck < dur.minGrade) {
      errors.push(
        `Grade M${inp.fck} is below the minimum grade M${dur.minGrade} for ${inp.exposure} exposure (IS 456 Table 5).`,
      );
    }
    waterBaseKg = WATER_TABLE_IS[inp.aggType][inp.maxAggMm];
    steps.push(`Water (Table 4, ${inp.maxAggMm} mm ${inp.aggType === "angular" ? "angular crushed" : "rounded gravel"}, 25-50 mm slump) = ${waterBaseKg} kg/m3.`);
    const f = slumpFactor(inp.slumpMm);
    // Water is rounded to whole litres before any admixture reduction —
    // the spec's worked examples use 197 L then 197 x 0.85 = 167 L.
    waterKg = Math.round(waterBaseKg * f);
    if (inp.slumpMm !== 50) {
      steps.push(`Slump ${inp.slumpMm} mm: water x ${f.toFixed(3)} = ${waterKg} kg/m3 (+3% per 25 mm above 50 mm).`);
    }
    if (inp.pceReductionPct > 0) {
      waterKg = Math.round(waterKg * (1 - inp.pceReductionPct / 100));
      steps.push(`Superplasticiser reduces water by ${inp.pceReductionPct}% -> ${waterKg.toFixed(1)} kg/m3 batched.`);
    }
    const wcs = wcFromStrengthIS(fTarget);
    wcStrength = round2(wcs.wc);
    if (wcs.clamped) {
      warnings.push(
        `Target strength ${fTarget.toFixed(1)} MPa is outside the IS 10262 Fig. 1 curve (26.6-48.3 MPa) — w/c held at the table edge ${wcStrength.toFixed(2)}.`,
      );
    }
    steps.push(`w/c from strength (Fig. 1, fm ${fTarget.toFixed(1)} MPa) = ${wcStrength.toFixed(2)}; durability max (${inp.exposure}) = ${wcDurability.toFixed(2)}.`);
  } else {
    // ACI 211.1
    const sizeRow = aciSizeRow(inp.maxAggMm);
    if (inp.sdMode === "custom") {
      const s = inp.sdCustom;
      fTarget = Math.max(inp.fck + 1.34 * s, inp.fck + 2.33 * s - 3.45);
      steps.push(`Required average strength f'cr = max(${inp.fck} + 1.34 x ${s}, ${inp.fck} + 2.33 x ${s} - 3.45) = ${fTarget.toFixed(2)} MPa (ACI 318).`);
    } else {
      fTarget = inp.fck + 8.3;
      steps.push(`No established SD: f'cr = f'c + 8.3 = ${fTarget.toFixed(2)} MPa (ACI 318).`);
    }
    const band = inp.slumpMm <= 50 ? "25-50" : inp.slumpMm <= 100 ? "75-100" : "150-175";
    waterBaseKg = ACI_WATER[band][sizeRow];
    steps.push(`Water (ACI Table 6.3.3, ${sizeRow} mm aggregate, slump ${band} mm) = ${waterBaseKg} kg/m3.`);
    waterKg = waterBaseKg;
    if (inp.pceReductionPct > 0) {
      waterKg = Math.round(waterKg * (1 - inp.pceReductionPct / 100));
      steps.push(`Superplasticiser reduces water by ${inp.pceReductionPct}% -> ${waterKg.toFixed(1)} kg/m3 batched.`);
    }
    airPct = ACI_AIR[sizeRow];
    steps.push(`Entrapped air (ACI Table 6.3.3, ${sizeRow} mm) = ${airPct}%.`);
    const wcs = wcFromStrengthACI(fTarget);
    wcStrength = round2(wcs.wc);
    if (wcs.clamped) {
      warnings.push(
        `f'cr ${fTarget.toFixed(1)} MPa is outside the ACI Table 6.3.4(a) range (15-40 MPa) — w/c held at the table edge ${wcStrength.toFixed(2)}.`,
      );
    }
    wcDurability = ACI_DURABILITY_MAX_WC[inp.aciExposure];
    steps.push(
      `w/c from f'cr ${fTarget.toFixed(1)} MPa (Table 6.3.4(a), keyed to f'cr not f'c) = ${wcStrength.toFixed(2)}` +
        (wcDurability != null ? `; durability cap (${inp.aciExposure}) = ${wcDurability.toFixed(2)}.` : "."),
    );
  }

  // Governing w/c
  let wcGoverning: number;
  if (inp.wcMode === "manual") {
    wcGoverning = round2(inp.wcManual);
    governedBy = "manual";
    if (wcDurability != null && wcGoverning > wcDurability) {
      errors.push(
        `Manual w/c ${wcGoverning.toFixed(2)} exceeds the durability maximum ${wcDurability.toFixed(2)} (${inp.method === "IS" ? `${inp.exposure} exposure, IS 456 Table 5` : `ACI exposure ${inp.aciExposure}`}).`,
      );
    }
  } else if (wcDurability != null && wcDurability < wcStrength) {
    wcGoverning = wcDurability;
    governedBy = "durability";
  } else {
    wcGoverning = wcStrength;
    governedBy = "strength";
  }

  // Cement
  let cementKg = waterKg / wcGoverning;
  let wcActual = wcGoverning;
  let cementRaisedToMinimum = false;
  if (inp.method === "IS") {
    if (cementKg < cementMinKg) {
      cementKg = cementMinKg;
      wcActual = round2(waterKg / cementKg);
      cementRaisedToMinimum = true;
      governedBy = "cement-minimum";
      steps.push(`Cement ${Math.round(waterKg / wcGoverning)} kg/m3 is below the minimum ${cementMinKg} kg/m3 — raised to ${cementMinKg} kg/m3, so the actual w/c is ${wcActual.toFixed(2)} (lower than entered).`);
    }
    if (cementKg > MAX_CEMENT_KG) {
      errors.push(
        `Cement ${Math.round(cementKg)} kg/m3 exceeds the maximum ${MAX_CEMENT_KG} kg/m3 (IS 456) — increase the aggregate size, use an admixture, or raise the w/c within the durability limit.`,
      );
    }
  } else if (cementKg > MAX_CEMENT_KG) {
    warnings.push(
      `Cement ${Math.round(cementKg)} kg/m3 is above 450 kg/m3 — ACI has no 450 kg/m3 cap, but check the mix for heat of hydration and shrinkage.`,
    );
  }
  cementKg = Math.round(cementKg);

  // Absolute volumes
  const vCem = cementKg / (inp.sgCem * 1000);
  const vWater = waterKg / 1000;
  const vAir = airPct / 100;
  const admixtureKg = inp.pceDosePct > 0 ? (cementKg * inp.pceDosePct) / 100 : 0;
  const vAdmix = admixtureKg / 1000; // water-based PCE, SG ~ 1.0
  const vAgg = 1 - vCem - vWater - vAir - vAdmix;
  if (vAgg <= 0) {
    errors.push(
      "No room left for aggregate — raise the w/c, reduce the water, or reduce the cement content.",
    );
  }

  let vFA: number;
  let vCA: number;
  if (inp.method === "IS") {
    caFractionTable = caFractionIS(inp.maxAggMm, inp.faZone, wcActual, inp.pumped);
    caFraction = inp.caFractionOverride ?? caFractionTable;
    if (inp.caFractionOverride != null) {
      steps.push(`CA fraction overridden to ${caFraction.toFixed(2)} (Table 5 suggests ${caFractionTable.toFixed(2)}).`);
    } else {
      steps.push(`CA fraction (Table 5, ${inp.maxAggMm} mm, Zone ${inp.faZone}, w/c ${wcActual.toFixed(2)}${inp.pumped ? ", pumped" : ""}) = ${caFraction.toFixed(2)}.`);
    }
    vCA = vAgg * caFraction;
    vFA = vAgg - vCA;
  } else {
    const sizeRow = aciSizeRow(inp.maxAggMm);
    const caVolFrac = aciCaVolumeFraction(sizeRow, inp.fm);
    const caKgPre = caVolFrac * inp.dryRoddedKgM3;
    vCA = caKgPre / (inp.sgCA * 1000);
    vFA = vAgg - vCA;
    caFraction = vCA / vAgg;
    steps.push(`CA (Table 6.3.6, FM ${inp.fm.toFixed(2)}, ${sizeRow} mm) = ${caVolFrac.toFixed(2)} x ${inp.dryRoddedKgM3} kg/m3 dry-rodded = ${Math.round(caKgPre)} kg/m3; FA is the remainder by absolute volume.`);
  }

  const faKg = Math.round(vFA * inp.sgFA * 1000);
  const caKg = Math.round(vCA * inp.sgCA * 1000);
  const densityKgM3 = Math.round(cementKg + waterKg + faKg + caKg + admixtureKg);
  const densityOk = densityKgM3 >= 2300 && densityKgM3 <= 2500;
  if (!densityOk) {
    warnings.push(
      `Fresh density ${densityKgM3.toLocaleString()} kg/m3 is outside the normal 2,300-2,500 kg/m3 band — check the specific gravities and aggregate split.`,
    );
  }

  const moistureCorrected = inp.moistureFA > 0 || inp.moistureCA > 0;
  const waterBatchedRaw =
    waterKg - faKg * inp.moistureFA - caKg * inp.moistureCA;
  const waterFloorApplied = waterBatchedRaw < 0.8 * waterKg;
  if (waterFloorApplied) {
    warnings.push(
      "Aggregate moisture would push the batch water below 80% of the design water — batch water is floored at 80% and the aggregates are wetter than the mix allows; re-check the moisture readings.",
    );
  }
  const waterBatchedKg = Math.max(waterBatchedRaw, 0.8 * waterKg);

  const partial: Omit<MixDesignResult, "batch" | "batchHalf"> = {
    inputs: inp,
    sdUsed,
    targetStrength: fTarget,
    targetStrengthDisplay: roundUpHalf(fTarget),
    waterBaseKg,
    waterKg: Math.round(waterKg * 10) / 10,
    waterBatchedKg: Math.round(waterBatchedKg * 10) / 10,
    wcStrength,
    wcDurability,
    wcGoverning,
    wcActual,
    governedBy,
    cementKg,
    cementBagsExact: cementKg / CEMENT_BAG_KG,
    cementBagsOrder: Math.ceil(cementKg / CEMENT_BAG_KG),
    cementRaisedToMinimum,
    cementMinKg,
    vCem,
    vWater,
    vAir,
    vAdmix,
    vAgg,
    vFA,
    vCA,
    caFraction,
    caFractionTable,
    faKg,
    caKg,
    admixtureKg: Math.round(admixtureKg * 100) / 100,
    ratioFA: faKg / cementKg,
    ratioCA: caKg / cementKg,
    densityKgM3,
    densityOk,
    moistureCorrected,
    waterFloorApplied,
    warnings,
    errors,
    steps,
  };
  const batch = batchFor(partial, inp.batchVolumeM3);
  const batchHalf = batchFor(partial, 0.5);
  return { ...partial, batch, batchHalf };
}

/** Validate inputs; returns field-level errors (empty = valid). */
export function validateMixDesign(inp: MixDesignInputs): string[] {
  const errs: string[] = [];
  if (inp.method === "IS" && (inp.fck < 10 || inp.fck > 60))
    errs.push("Grade must be M10-M60.");
  if (inp.method === "ACI" && (inp.fck < 15 || inp.fck > 60))
    errs.push("Specified strength f'c must be 15-60 MPa.");
  if (inp.sdCustom < 2 || inp.sdCustom > 8)
    errs.push("Standard deviation must be 2-8 MPa.");
  if (inp.slumpMm < 25 || inp.slumpMm > 175)
    errs.push("Slump must be 25-175 mm.");
  if (inp.sgCem < 2.5 || inp.sgCem > 3.3) errs.push("Cement SG must be 2.5-3.3.");
  if (inp.sgFA < 2.5 || inp.sgFA > 2.8) errs.push("Fine aggregate SG must be 2.5-2.8.");
  if (inp.sgCA < 2.5 || inp.sgCA > 2.9) errs.push("Coarse aggregate SG must be 2.5-2.9.");
  if (inp.wcMode === "manual" && (inp.wcManual < 0.25 || inp.wcManual > 0.8))
    errs.push("Manual w/c must be 0.25-0.80.");
  if (inp.pceReductionPct < 0 || inp.pceReductionPct > 30)
    errs.push("Water reduction must be 0-30%.");
  if (inp.pceDosePct < 0 || inp.pceDosePct > 1.5)
    errs.push("Superplasticiser dose must be 0-1.5% of cement mass (IS 9103).");
  if (inp.moistureFA < 0 || inp.moistureFA > 0.1 || inp.moistureCA < 0 || inp.moistureCA > 0.1)
    errs.push("Aggregate moisture must be 0-10%.");
  if (inp.batchVolumeM3 <= 0) errs.push("Batch volume must be greater than 0.");
  if (inp.airPct < 0 || inp.airPct > 3) errs.push("Entrapped air must be 0-3%.");
  if (inp.fm < 2.3 || inp.fm > 3.2) errs.push("Fineness modulus must be 2.3-3.2.");
  if (inp.dryRoddedKgM3 < 1400 || inp.dryRoddedKgM3 > 1800)
    errs.push("Dry-rodded unit weight must be 1,400-1,800 kg/m3.");
  if (inp.caFractionOverride != null && (inp.caFractionOverride < 0.25 || inp.caFractionOverride > 0.75))
    errs.push("CA fraction override must be 0.25-0.75.");
  return errs;
}

export interface FaqItem {
  q: string;
  a: string;
}

export const MIX_DESIGN_FAQS: FaqItem[] = [
  {
    q: "How is target mean strength calculated?",
    a: "Target strength f'ck = fck + 1.65 x SD, where SD is the standard deviation of the concrete plant (IS 10262 Cl 5.2). The 1.65 factor covers 5% defectives — only 1 in 20 test results may fall below the specified grade. For M25 with SD 4.0 MPa, f'ck = 25 + 1.65 x 4.0 = 31.6 MPa. The calculator rounds f'ck up to the nearest 0.5 MPa for display (for example 38.25 becomes 38.5 MPa).",
  },
  {
    q: "What standard deviation (SD) should I use?",
    a: "Use the IS 10262 Table 2 / IS 456 Table 8 values unless your plant has at least 30 test results: M10 and M15 use 3.5 MPa, M20 and M25 use 4.0 MPa, and M30 and above use 5.0 MPa. If your own plant SD is lower than the table value, you may use it only with 30 or more tests — the calculator warns you when you do.",
  },
  {
    q: "What is the difference between a nominal mix and a design mix?",
    a: "A nominal mix (for example 1:2:4 for M15 or 1:1.5:3 for M20) uses fixed proportions from IS 456 Table 9 and is permitted only up to grade M20. A design mix is proportioned for a target strength by laboratory trial under IS 10262 and is required for M25 and above, or whenever durability or exposure conditions govern. A nominal 1:2:4 ratio is by volume; a design mix ratio such as 1 : 1.84 : 3.06 : 0.50 is by mass — they are not interchangeable.",
  },
  {
    q: "How is the water content chosen?",
    a: "From IS 10262 Table 4 for a 25-50 mm slump: angular crushed aggregate needs 208 kg/m3 for 10 mm, 186 kg/m3 for 20 mm and 165 kg/m3 for 40 mm; rounded gravel needs 190, 170 and 150 kg/m3. Water is then adjusted by +3% for every 25 mm of slump above 50 mm (and -3% per 25 mm below), and reduced by the superplasticiser percentage if one is used.",
  },
  {
    q: "How is the water-cement ratio chosen?",
    a: "Two limits are calculated and the lower one governs: the w/c from strength (IS 10262 Fig. 1, read at the target strength) and the durability maximum from IS 456 Table 5 for the exposure (Mild 0.55, Moderate 0.50, Severe 0.45, Very severe 0.45, Extreme 0.40). The calculator tells you which one governed. If the cement content falls below the Table 5 minimum, cement is raised to the minimum and the actual w/c drops below the entered value.",
  },
  {
    q: "How many cement bags are needed per cubic metre for M25?",
    a: "At w/c 0.50 with 186 litres of water, cement is 186 / 0.50 = 372 kg/m3, which is 372 / 50 = 7.44 bags exact — order 8 bags per cubic metre. For a 0.5 m3 batch that is 186 kg of cement, 4 bags to order, with 93 litres of water, 343 kg of fine aggregate and 570 kg of coarse aggregate.",
  },
  {
    q: "Why is my actual w/c lower than the one I entered?",
    a: "Because IS 456 Table 5 sets a minimum cement content for the exposure. If water divided by the governing w/c gives less cement than that minimum, the calculator raises the cement to the minimum — and since the water is unchanged, the actual w/c (water / cement) drops. For example, 186 litres at w/c 0.50 gives 372 kg, which is above the 300 kg minimum for Moderate exposure, so no change; with less water the minimum can govern instead.",
  },
  {
    q: "What is the absolute volume method?",
    a: "The absolute volume method says the volumes of every ingredient in one cubic metre of concrete add up to exactly 1.000 m3: cement volume + water volume + entrapped air + admixture volume + fine aggregate volume + coarse aggregate volume = 1.000 m3, where each volume is mass / (specific gravity x 1000). The aggregate split comes from IS 10262 Table 5 (for 20 mm Zone II aggregate at w/c 0.50, coarse aggregate is 62% of the total aggregate volume).",
  },
  {
    q: "Do I need trial mixes?",
    a: "Yes. A design mix must be confirmed by trial batches — IS 10262 Cl 5.8 requires three batches of at least 0.5 m3, tested at 7 and 28 days — and production acceptance follows IS 456 Cl 16 / Table 11. This calculator is a proportioning aid, not a substitute for a licensed engineer's design.",
  },
  {
    q: "How do I correct for wet aggregates?",
    a: "Aggregates on site hold free water, so the batch weights are corrected to saturated surface dry (SSD) basis: batch fine aggregate = FA x (1 + moisture FA), batch coarse aggregate = CA x (1 + moisture CA), and batch water = design water - FA x moisture FA - CA x moisture CA. If the aggregates are very wet, the batch water is floored at 80% of the design water and the calculator warns you — never batch negative water.",
  },
  {
    q: "IS 10262 or ACI 211.1 — which should I use?",
    a: "Use IS 10262:2019 for Pakistan and India — it is the code your local authorities and the IS 456 durability table are written around. Use ACI 211.1 for the UAE and international work. Both methods share the same absolute-volume engine here; they differ in the water table, the w/c table (ACI keys w/c to the required average strength f'cr, not to f'c) and the coarse-aggregate table (ACI uses the fineness modulus and dry-rodded unit weight).",
  },
];
