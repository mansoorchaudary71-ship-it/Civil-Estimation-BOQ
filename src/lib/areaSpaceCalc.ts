/**
 * Area & space engine — pure functions, no React. Metric internally.
 * Fixes the two audited bugs: (a) single-face 0.5–3 m2 plaster deduction
 * now deducts the FULL opening area (the old code deducted half);
 * (b) thresholds are converted to the active unit (0.5 m2 = 5.38 sq ft,
 * 3 m2 = 32.29 sq ft) instead of being applied raw in imperial mode.
 */
import { deductOpening, type OpeningInput } from "./finishesCalc";

export const M2_TO_SQFT = 10.7639;
export const SQFT_PER_MARLA = 272.25;

export interface AreaConversions {
  m2: number;
  sqft: number;
  sqyd: number;
  marla: number;
  kanal: number;
}

export function convertArea(m2: number): AreaConversions {
  const sqft = m2 * M2_TO_SQFT;
  return { m2, sqft, sqyd: sqft / 9, marla: sqft / SQFT_PER_MARLA, kanal: sqft / (SQFT_PER_MARLA * 20) };
}

export type ShapeKind =
  | "rectangle" | "square" | "circle" | "triangle" | "trapezoid"
  | "l-shape" | "t-shape" | "polygon";

export interface ShapeInputs {
  lengthM: number;
  widthM: number;
  radiusM: number;
  sideAM: number;
  sideBM: number;
  sideCM: number;
  heightM: number;
  /** L-shape: overall length */
  overallLengthM: number;
  /** L-shape: overall width */
  overallWidthM: number;
  /** L-shape: arm widths */
  arm1M: number;
  arm2M: number;
  /** T-shape: top width */
  topWidthM: number;
  /** T-shape: top thickness */
  topThicknessM: number;
  /** T-shape: leg width */
  legWidthM: number;
  /** T-shape: total height */
  totalHeightM: number;
  polygon: { x: number; y: number }[];
}

export interface ShapeResult {
  areaM2: number;
  perimeterM: number;
}

export function heronArea(a: number, b: number, c: number): number | null {
  if (a + b <= c || a + c <= b || b + c <= a) return null;
  const s = (a + b + c) / 2;
  const v = s * (s - a) * (s - b) * (s - c);
  return v < 0 ? null : Math.sqrt(v);
}

export function calcShape(kind: ShapeKind, p: ShapeInputs): ShapeResult {
  switch (kind) {
    case "rectangle":
      return { areaM2: p.lengthM * p.widthM, perimeterM: 2 * (p.lengthM + p.widthM) };
    case "square":
      return { areaM2: p.lengthM * p.lengthM, perimeterM: 4 * p.lengthM };
    case "circle":
      return { areaM2: Math.PI * p.radiusM * p.radiusM, perimeterM: 2 * Math.PI * p.radiusM };
    case "triangle": {
      const area = heronArea(p.sideAM, p.sideBM, p.sideCM);
      return { areaM2: area ?? 0, perimeterM: p.sideAM + p.sideBM + p.sideCM };
    }
    case "trapezoid": {
      const leg = Math.sqrt(Math.pow(Math.abs(p.sideBM - p.sideAM) / 2, 2) + p.heightM * p.heightM);
      return {
        areaM2: ((p.sideAM + p.sideBM) / 2) * p.heightM,
        perimeterM: p.sideAM + p.sideBM + 2 * leg,
      };
    }
    case "l-shape":
      // Overall rectangle minus the missing corner; perimeter of an
      // orthogonal L equals the perimeter of its bounding rectangle.
      return {
        areaM2:
          p.overallLengthM * p.arm1M +
          Math.max(0, p.overallWidthM - p.arm1M) * p.arm2M,
        perimeterM: 2 * (p.overallLengthM + p.overallWidthM),
      };
    case "t-shape":
      return {
        areaM2:
          p.topWidthM * p.topThicknessM +
          Math.max(0, p.totalHeightM - p.topThicknessM) * p.legWidthM,
        perimeterM: 2 * p.topWidthM + 2 * p.totalHeightM,
      };
    case "polygon": {
      const pts = p.polygon;
      if (pts.length < 3) return { areaM2: 0, perimeterM: 0 };
      let sum = 0;
      let perim = 0;
      for (let i = 0; i < pts.length; i++) {
        const cur = pts[i];
        const nxt = pts[(i + 1) % pts.length];
        sum += cur.x * nxt.y - nxt.x * cur.y;
        perim += Math.hypot(nxt.x - cur.x, nxt.y - cur.y);
      }
      return { areaM2: Math.abs(sum) / 2, perimeterM: perim };
    }
  }
}

export interface PlotInputs {
  northM: number;
  southM: number;
  eastM: number;
  westM: number;
  diagonalM: number;
}

export interface PlotResult {
  area1M2: number | null;
  area2M2: number | null;
  totalM2: number | null;
  perimeterM: number;
  error: string | null;
}

export function calcPlot(inp: PlotInputs): PlotResult {
  const a1 = heronArea(inp.northM, inp.eastM, inp.diagonalM);
  const a2 = heronArea(inp.southM, inp.westM, inp.diagonalM);
  const error =
    a1 == null || a2 == null
      ? "Diagonal impossible for these sides — the diagonal must be shorter than the sum of each adjacent pair and longer than their difference."
      : null;
  return {
    area1M2: a1,
    area2M2: a2,
    totalM2: a1 != null && a2 != null ? a1 + a2 : null,
    perimeterM: inp.northM + inp.southM + inp.eastM + inp.westM,
    error,
  };
}

export interface PropertyInputs {
  carpetM2: number;
  internalWallsPct: number;
  externalWallsPct: number;
  balconyM2: number;
  commonAreaPct: number;
}

export interface PropertyResult {
  traditionalCarpetM2: number;
  reraCarpetM2: number;
  plinthM2: number;
  builtUpM2: number;
  superBuiltUpM2: number;
  loadingFactorPct: number;
}

export function calcProperty(inp: PropertyInputs): PropertyResult {
  const traditional = Math.max(0, inp.carpetM2);
  const rera = traditional * (1 + Math.max(0, inp.internalWallsPct) / 100);
  const plinth = rera + traditional * (Math.max(0, inp.externalWallsPct) / 100);
  const builtUp = plinth + Math.max(0, inp.balconyM2);
  const superBuiltUp = builtUp * (1 + Math.max(0, inp.commonAreaPct) / 100);
  return {
    traditionalCarpetM2: traditional,
    reraCarpetM2: rera,
    plinthM2: plinth,
    builtUpM2: builtUp,
    superBuiltUpM2: superBuiltUp,
    loadingFactorPct: builtUp > 0 ? ((superBuiltUp - builtUp) / builtUp) * 100 : 0,
  };
}

export interface PlasterDeductionInputs {
  wallLengthM: number;
  wallHeightM: number;
  faces: 1 | 2;
  openings: OpeningInput[];
  jambDepthM: number;
  /** "m" | "ft" — thresholds are converted, never applied raw */
  lengthUnit: "m" | "ft";
}

export interface PlasterDeductionResult {
  grossAreaM2: number;
  totalDeductionM2: number;
  jambsM2: number;
  netAreaM2: number;
  perOpening: { areaM2: number; rule: string; deductionM2: number; jambM2: number }[];
}

/**
 * IS 1200 plaster deductions, unit-aware. The old code deducted only
 * totalOpArea/2 for a single-face 0.5–3 m2 opening — that is wrong: one
 * face means the FULL opening area is deducted once. (For both-faces
 * plastering the same tier also deducts the full area once, because only
 * one of the two faces is deducted.)
 */
export function calcPlasterDeduction(inp: PlasterDeductionInputs): PlasterDeductionResult {
  const grossAreaM2 = Math.max(0, inp.wallLengthM) * Math.max(0, inp.wallHeightM) * inp.faces;
  const perOpening = inp.openings.map((o) => {
    const d = deductOpening(o, inp.faces, inp.jambDepthM);
    return { areaM2: d.areaM2, rule: d.rule, deductionM2: d.deductionM2, jambM2: d.jambM2 };
  });
  const totalDeductionM2 = perOpening.reduce((a, p) => a + p.deductionM2, 0);
  const jambsM2 = perOpening.reduce((a, p) => a + p.jambM2, 0);
  return {
    grossAreaM2,
    totalDeductionM2,
    jambsM2,
    netAreaM2: Math.max(0, grossAreaM2 - totalDeductionM2 + jambsM2),
    perOpening,
  };
}

export interface RoofInputs {
  floorAreaM2: number;
  pitchDegrees: number;
  overhangM: number;
  perimeterM: number;
}

export interface RoofResult {
  horizontalAreaM2: number;
  trueAreaM2: number;
  pitchMultiplier: number;
  /** rise:run as "7:12" style string */
  pitchRatio: string;
}

export function calcRoof(inp: RoofInputs): RoofResult {
  const horizontalAreaM2 =
    Math.max(0, inp.floorAreaM2) + Math.max(0, inp.perimeterM) * Math.max(0, inp.overhangM);
  const rad = (Math.max(0, Math.min(89, inp.pitchDegrees)) * Math.PI) / 180;
  const pitchMultiplier = 1 / Math.cos(rad);
  const rise = Math.tan(rad) * 12;
  return {
    horizontalAreaM2,
    trueAreaM2: horizontalAreaM2 * pitchMultiplier,
    pitchMultiplier,
    pitchRatio: `${rise.toFixed(1)}:12`,
  };
}

export function validateRoof(inp: RoofInputs): string[] {
  const errors: string[] = [];
  if (!(inp.floorAreaM2 > 0)) errors.push("Floor area must be greater than 0.");
  if (!(inp.pitchDegrees >= 0 && inp.pitchDegrees < 90))
    errors.push("Roof pitch must be between 0° and 89°.");
  if (inp.overhangM < 0 || inp.perimeterM < 0)
    errors.push("Overhang and perimeter cannot be negative.");
  return errors;
}
