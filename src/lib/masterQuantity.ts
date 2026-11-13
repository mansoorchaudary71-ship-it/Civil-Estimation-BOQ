/**
 * masterQuantity — Master Quantity Estimator engine (G9 §3).
 * Pure, unit-safe functions. All computation happens in metric internally;
 * Imperial inputs are converted on entry (ft -> m x0.3048, sqft -> m2
 * x0.092903, cu.ft -> m3 x0.0283168). Display converts back.
 *
 * Fixes the old bug where `isSI` only changed labels while areas in sqft
 * were multiplied by metres and cu.ft was treated as m3 for bag counts.
 */
export const FT_TO_M = 0.3048;
export const SQFT_TO_M2 = 0.092903;
export const CUFT_TO_M3 = 0.0283168;
export const DRY_CONCRETE_FACTOR = 1.54;
export const DRY_MORTAR_FACTOR = 1.33;
export const CEMENT_BAG_M3 = 0.0347;

export type UnitSystem = "SI" | "Imperial";

/** Convert a length value to metres. */
export function toMetres(value: number, unit: UnitSystem): number {
  return unit === "Imperial" ? value * FT_TO_M : value;
}
/** Convert an area value to m2. */
export function toSqMetres(value: number, unit: UnitSystem): number {
  return unit === "Imperial" ? value * SQFT_TO_M2 : value;
}
/** Convert a volume value to m3. */
export function toCubicMetres(value: number, unit: UnitSystem): number {
  return unit === "Imperial" ? value * CUFT_TO_M3 : value;
}
export function fromMetres(m: number, unit: UnitSystem): number {
  return unit === "Imperial" ? m / FT_TO_M : m;
}
export function volumeUnit(unit: UnitSystem): string {
  return unit === "SI" ? "m³" : "cu.ft";
}
export function areaUnit(unit: UnitSystem): string {
  return unit === "SI" ? "m²" : "sqft";
}

/** Excavation: bank volume and loose volume at a swell %. */
export function excavation(lengthM: number, widthM: number, depthM: number, swellPct = 20) {
  const bank = lengthM * widthM * depthM;
  return { bank, loose: bank * (1 + swellPct / 100) };
}

/** PCC 1:2:4 — wet/dry volume and cement bags. */
export function pcc(lengthM: number, widthM: number, depthM: number) {
  const wet = lengthM * widthM * depthM;
  const dry = wet * DRY_CONCRETE_FACTOR;
  const cementBags = Math.ceil(dry * (1 / 7) / CEMENT_BAG_M3);
  return { wet, dry, cementBags };
}

/** Single trapezoidal footing: rectangular base + frustum slope. */
export function footingSingle(
  baseL: number, baseW: number, baseD: number,
  topL: number, topW: number, slopeH: number,
  count = 1,
) {
  const rect = baseL * baseW * baseD;
  const a1 = baseL * baseW;
  const a2 = topL * topW;
  const slope = (slopeH / 3) * (a1 + a2 + Math.sqrt(a1 * a2));
  const single = rect + slope;
  const wet = single * count;
  return { single, wet, dry: wet * DRY_CONCRETE_FACTOR };
}

/** Brickwork: N = V_wall / V_brick-with-mortar (0.24 x 0.12 x 0.085 m). */
export function brickwork(lengthM: number, heightM: number, thicknessM: number, wastagePct = 5) {
  const volume = lengthM * heightM * thicknessM;
  const brickVol = 0.24 * 0.12 * 0.085;
  const count = Math.ceil(volume / brickVol);
  return { volume, count, countWithWastage: Math.ceil(count * (1 + wastagePct / 100)) };
}

/** Slab effective depth: d = D - (cover + phi/2), all in mm. */
export function slabEffectiveDepth(totalMm: number, coverMm: number, barDiaMm: number): number {
  return totalMm - (coverMm + barDiaMm / 2);
}

/** IS 1200 plaster opening rule: deduction faces per opening area (m2). */
export function plasterDeductionFaces(openingAreaM2: number): number {
  if (openingAreaM2 < 0.5) return 0; // no deduction
  if (openingAreaM2 <= 3) return 1; // one face only
  return 2; // both faces + jambs/soffits/sills
}

export interface PlasterOpening { area: number; faces?: number }
/**
 * Plastering: net area after IS 1200 deductions, wet/dry volume, cement bags.
 * `faces` per opening defaults to the IS 1200 rule; pass explicitly to
 * override (the spec worked example uses two 10 m2 openings at one face).
 */
export function plaster(
  grossAreaM2: number,
  openings: PlasterOpening[],
  thicknessMm: number,
  mixCementParts: number,
  mixSandParts: number,
) {
  let deduction = 0;
  for (const o of openings) {
    const faces = o.faces ?? plasterDeductionFaces(o.area);
    deduction += o.area * faces;
  }
  const net = Math.max(0, grossAreaM2 - deduction);
  const wet = net * (thicknessMm / 1000);
  const dry = wet * DRY_MORTAR_FACTOR;
  const totalParts = mixCementParts + mixSandParts;
  const cementBags = Math.ceil((dry * (mixCementParts / totalParts)) / CEMENT_BAG_M3);
  const sandM3 = dry * (mixSandParts / totalParts);
  return { gross: grossAreaM2, deduction, net, wet, dry, cementBags, sandM3 };
}

/** Cost for a quantity at a rate (null rate -> null cost, never 0). */
export function costFor(qty: number, ratePerUnit: number | null): number | null {
  if (ratePerUnit == null || !isFinite(ratePerUnit)) return null;
  return qty * ratePerUnit;
}

/** Validate a numeric input: returns an error string or null. */
export function validateNumber(value: unknown, label: string, max = 10000): string | null {
  if (value === "" || value == null) return `${label} is required.`;
  const n = typeof value === "number" ? value : Number(value);
  if (!isFinite(n)) return `${label} must be a number.`;
  if (n <= 0) return `${label} must be greater than 0.`;
  if (n > max) return `${label} looks too large (max ${max}).`;
  return null;
}
