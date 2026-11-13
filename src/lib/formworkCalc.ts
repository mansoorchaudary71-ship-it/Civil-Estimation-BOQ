/**
 * Formwork & shuttering engine — pure functions, no React, metric internally.
 * (brickCalc.ts pattern.)
 *
 * Contact-area rules (stated in the UI — IS 1200 / CPWD measurement):
 * - Column: 2 x (l + w) x h
 * - Beam: (2h + w) x L  (two sides + soffit)
 * - Slab: L x W + 2 x (L + W) x t  (soffit + EDGES included)
 * - Footing: 2 x (L + W) x depth  (four vertical sides)
 * Effective area = total area / repetitions x (1 + wastage/100).
 *
 * Material constants — all NAMED, EDITABLE and shown in the UI:
 * - Plywood sheet 4x8 ft = 32 sq ft = 2.9768 m2.
 * - Battens 2.5 Rft per sq ft of effective area — UNSOURCED thumb rule
 *   (competitor range runs 0.04 Rft/sq ft of covered area to 0.79 Rmt/m2
 *   of shuttering). The UI labels it "editable assumption — verify on
 *   site" and shows the covered-area thumb-rule cross-check beside it.
 * - Props 1.5 per m2 of effective area — UNSOURCED thumb rule
 *   (≈ 1 prop per 16 sq ft, lalag pattern). Editable; prop spacing input.
 * - Nails 0.075 kg/m2, binding wire 0.075 kg/m2, shuttering oil 0.065 L/m2
 *   (Scribd thumb-rule constants table — labelled as thumb rules).
 * - Beam bottom planks: 1 Rft per Rft of beam length (editable).
 * - Ballies (thumb check): 0.16 nos per sq ft of slab area (civilatwork).
 * - Centering plates: 1 per 4 ft of slab/footing perimeter (lalag).
 */
export const PLYWOOD_SHEET_SQFT = 32; // 4x8 ft sheet
export const PLYWOOD_SHEET_M2 = 2.9768; // 2.44 x 1.22 m
export const SQFT_PER_M2 = 10.7639;

export type FormworkType = "column" | "beam" | "slab" | "footing";

export interface FormworkElementInput {
  type: FormworkType;
  /** metres (component converts from ft when the user works imperial) */
  lengthM: number;
  widthM: number;
  /** column/beam: height or depth m; slab: thickness m; footing: depth m */
  heightM: number;
  count: number;
}

export interface FormworkConstants {
  /** Rft of batten per sq ft of effective area (UNSOURCED — editable assumption) */
  battenRftPerSqFt: number;
  /** props per m2 of effective area (UNSOURCED — editable assumption) */
  propsPerM2: number;
  nailsKgPerM2: number;
  wireKgPerM2: number;
  oilLPerM2: number;
  beamPlankRftPerM: number;
}

export const DEFAULT_FORMWORK_CONSTANTS: FormworkConstants = {
  battenRftPerSqFt: 2.5,
  propsPerM2: 1.5,
  nailsKgPerM2: 0.075,
  wireKgPerM2: 0.075,
  oilLPerM2: 0.065,
  beamPlankRftPerM: 1,
};

export function calcFormworkArea(el: FormworkElementInput): number {
  const { lengthM: l, widthM: w, heightM: h } = el;
  if (el.type === "column") return 2 * (l + w) * h;
  if (el.type === "beam") return (2 * h + w) * l;
  if (el.type === "slab") return l * w + 2 * (l + w) * h;
  return 2 * (l + w) * h; // footing
}

export interface FormworkResult {
  totalAreaM2: number;
  totalAreaSqFt: number;
  effectiveAreaM2: number;
  effectiveAreaSqFt: number;
  perTypeM2: Record<FormworkType, number>;
  plywoodSheets: number;
  battensRft: number;
  steelProps: number;
  nailsKg: number;
  bindingWireKg: number;
  shutteringOilL: number;
  beamBottomPlanksRft: number;
  centeringPlates: number;
  /** thumb-rule cross-check per covered sq ft (civilatwork) */
  thumbCheck: {
    coveredSqFt: number;
    plywoodSheets: number;
    battensRft: number;
    nailsKg: number;
    beamBottomPlanksRft: number;
    balliesNos: number;
    clampsNos: number;
    oilL: number;
  };
  errors: string[];
}

export function validateFormworkElement(el: FormworkElementInput): string[] {
  const errs: string[] = [];
  if (!(el.lengthM > 0) || !(el.widthM > 0) || !(el.heightM > 0)) {
    errs.push("Length, width and height/depth must all be greater than 0.");
  }
  if (!Number.isInteger(el.count) || el.count < 1) {
    errs.push("Count must be a whole number of 1 or more.");
  }
  return errs;
}

export function calcFormwork(
  elements: FormworkElementInput[],
  repetitions: number,
  wastagePct: number,
  constants: FormworkConstants = DEFAULT_FORMWORK_CONSTANTS,
): FormworkResult {
  const errors: string[] = [];
  if (repetitions < 1) errors.push("Repetition factor must be 1 or more.");
  if (wastagePct < 0 || wastagePct > 15) errors.push("Wastage must be 0-15%.");
  for (const el of elements) errors.push(...validateFormworkElement(el));

  const perTypeM2: Record<FormworkType, number> = { column: 0, beam: 0, slab: 0, footing: 0 };
  let totalAreaM2 = 0;
  let beamLengthM = 0;
  let slabSoffitM2 = 0;
  let edgePerimeterFt = 0;
  for (const el of elements) {
    const area = calcFormworkArea(el) * el.count;
    perTypeM2[el.type] += area;
    totalAreaM2 += area;
    if (el.type === "beam") beamLengthM += el.lengthM * el.count;
    if (el.type === "slab") {
      slabSoffitM2 += el.lengthM * el.widthM * el.count;
      edgePerimeterFt += 2 * (el.lengthM + el.widthM) * 3.28084 * el.count;
    }
    if (el.type === "footing") {
      edgePerimeterFt += 2 * (el.lengthM + el.widthM) * 3.28084 * el.count;
    }
  }
  const totalAreaSqFt = totalAreaM2 * SQFT_PER_M2;
  const effectiveAreaM2 = (totalAreaM2 / repetitions) * (1 + wastagePct / 100);
  const effectiveAreaSqFt = (totalAreaSqFt / repetitions) * (1 + wastagePct / 100);
  const coveredSqFt = slabSoffitM2 * SQFT_PER_M2;

  return {
    totalAreaM2,
    totalAreaSqFt,
    effectiveAreaM2,
    effectiveAreaSqFt,
    perTypeM2,
    plywoodSheets: Math.ceil(effectiveAreaSqFt / PLYWOOD_SHEET_SQFT),
    battensRft: Math.ceil(effectiveAreaSqFt * constants.battenRftPerSqFt),
    steelProps: Math.ceil(effectiveAreaM2 * constants.propsPerM2),
    nailsKg: totalAreaM2 * constants.nailsKgPerM2,
    bindingWireKg: totalAreaM2 * constants.wireKgPerM2,
    shutteringOilL: totalAreaM2 * constants.oilLPerM2,
    beamBottomPlanksRft: beamLengthM * 3.28084 * constants.beamPlankRftPerM,
    centeringPlates: Math.ceil(edgePerimeterFt / 4),
    thumbCheck: {
      coveredSqFt,
      plywoodSheets: coveredSqFt * 0.02,
      battensRft: coveredSqFt * 0.04,
      nailsKg: coveredSqFt * 0.02,
      beamBottomPlanksRft: coveredSqFt * 0.24,
      balliesNos: coveredSqFt * 0.16,
      clampsNos: coveredSqFt * 0.08,
      oilL: coveredSqFt * 0.006,
    },
    errors,
  };
}
