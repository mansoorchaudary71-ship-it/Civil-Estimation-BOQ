/**
 * Plywood engine — pure functions, no React. Moved client-side from the
 * old dev-server endpoint (server.ts /api/tools/plywood-calculator), which
 * cannot run on the static GitHub Pages site. Metric internally.
 *
 * Sheet count: sheets = ceil(gross area / sheet area), gross = net x (1+waste).
 * For formwork, reuse divides the stock to buy: ceil(exact / reuse).
 * "Sheet volume" is the volume of ONE sheet; total order volume is
 * sheets-to-buy x one-sheet volume (the server returned the one-sheet
 * volume without labelling it).
 */
export type PlywoodCurrency = "PKR" | "INR" | "AED" | "USD";
export type PlywoodElement = "general" | "slab" | "wall" | "beam" | "column";
export type PlywoodGrade = "commercial" | "bwr" | "marine" | "shuttering";
export type PlywoodInputMode = "dimensions" | "area";

export interface PlywoodInputs {
  mode: PlywoodInputMode;
  /** dimensions mode: length (m) — for walls this is wall length */
  lengthM: number;
  /** dimensions mode: width/height (m) — for walls this is wall height */
  widthM: number;
  /** area mode: net area (m2) */
  areaM2: number;
  element: PlywoodElement;
  /** wall formwork: faces formed (1 or 2) */
  faces: 1 | 2;
  /** beam: width (m); column: second side (m) */
  beamWidthM: number;
  /** beam: depth (m); column: height is widthM */
  beamDepthM: number;
  openingsM2: number;
  sheetLengthM: number;
  sheetWidthM: number;
  thicknessMm: number;
  grade: PlywoodGrade;
  wastagePct: number;
  /** formwork reuse cycles (1 = buy every sheet once) */
  reuseFactor: number;
  costPerSheet: number | null;
  /** slab/wall formwork beam spacings (m) */
  secondaryBeamSpacingM: number;
  primaryBeamSpacingM: number;
}

export interface PlywoodResults {
  contactAreaM2: number;
  netAreaM2: number;
  grossAreaM2: number;
  sheetAreaM2: number;
  exactSheets: number;
  sheetsToBuy: number;
  wastageAreaM2: number;
  /** volume of ONE sheet (m3) */
  sheetVolumeM3: number;
  totalOrderVolumeM3: number;
  totalCost: number | null;
  costPerM2: number | null;
  /** slab mode only */
  secondaryBeamM: number;
  primaryBeamM: number;
}

export function validatePlywood(inp: PlywoodInputs): string[] {
  const errors: string[] = [];
  if (inp.mode === "dimensions" && (!(inp.lengthM > 0) || !(inp.widthM > 0)))
    errors.push("Length and width/height must be greater than 0.");
  if (inp.mode === "area" && !(inp.areaM2 > 0)) errors.push("Area must be greater than 0.");
  if (!(inp.sheetLengthM > 0) || !(inp.sheetWidthM > 0))
    errors.push("Sheet length and width must be greater than 0.");
  if (inp.wastagePct < 0 || inp.wastagePct > 30)
    errors.push("Wastage must be between 0% and 30%.");
  if (!Number.isInteger(inp.reuseFactor) || inp.reuseFactor < 1 || inp.reuseFactor > 8)
    errors.push("Reuse factor must be a whole number from 1 to 8.");
  if (inp.openingsM2 < 0) errors.push("Opening deduction cannot be negative.");
  if (inp.element === "beam" && (!(inp.beamWidthM > 0) || !(inp.beamDepthM > 0)))
    errors.push("Beam width and depth must be greater than 0.");
  if (inp.element === "column" && !(inp.beamWidthM > 0))
    errors.push("Column second side must be greater than 0.");
  return errors;
}

export function contactArea(inp: PlywoodInputs): number {
  const L = Math.max(0, inp.lengthM);
  const W = Math.max(0, inp.widthM);
  switch (inp.element) {
    case "slab":
      return L * W;
    case "wall":
      return L * W * inp.faces;
    case "beam":
      // Two sides + soffit, per running metre of beam.
      return (2 * Math.max(0, inp.beamDepthM) + Math.max(0, inp.beamWidthM)) * L;
    case "column":
      return 2 * (L + Math.max(0, inp.beamWidthM)) * W;
    default:
      return L * W;
  }
}

export function calcPlywood(inp: PlywoodInputs): PlywoodResults {
  const rawArea = inp.mode === "dimensions" ? contactArea(inp) : Math.max(0, inp.areaM2);
  const netAreaM2 = Math.max(0, rawArea - Math.max(0, inp.openingsM2));
  const grossAreaM2 = netAreaM2 * (1 + Math.max(0, inp.wastagePct) / 100);
  const sheetAreaM2 = Math.max(0, inp.sheetLengthM) * Math.max(0, inp.sheetWidthM);
  const exactSheets = sheetAreaM2 > 0 ? grossAreaM2 / sheetAreaM2 : 0;
  // Reuse applies to formwork stock: the same sheets serve several pours.
  const sheetsToBuy =
    inp.element === "general"
      ? Math.ceil(exactSheets)
      : Math.ceil(exactSheets / Math.max(1, inp.reuseFactor));
  const wastageAreaM2 = grossAreaM2 - netAreaM2;
  const sheetVolumeM3 = (sheetAreaM2 * Math.max(0, inp.thicknessMm)) / 1000;
  const totalOrderVolumeM3 = sheetsToBuy * sheetVolumeM3;
  const totalCost = inp.costPerSheet != null ? sheetsToBuy * inp.costPerSheet : null;
  const costPerM2 = totalCost != null && netAreaM2 > 0 ? totalCost / netAreaM2 : null;
  let secondaryBeamM = 0;
  let primaryBeamM = 0;
  if (inp.element === "slab") {
    const L = Math.max(0, inp.lengthM);
    const W = Math.max(0, inp.widthM);
    secondaryBeamM = (L / Math.max(0.01, inp.secondaryBeamSpacingM) + 1) * W;
    primaryBeamM = (W / Math.max(0.01, inp.primaryBeamSpacingM) + 1) * L;
  }
  return {
    contactAreaM2: rawArea,
    netAreaM2,
    grossAreaM2,
    sheetAreaM2,
    exactSheets,
    sheetsToBuy,
    wastageAreaM2,
    sheetVolumeM3,
    totalOrderVolumeM3,
    totalCost,
    costPerM2,
    secondaryBeamM,
    primaryBeamM,
  };
}

export const PLYWOOD_SHEET_PRESETS = [
  { id: "8x4", label: "2.44 × 1.22 m (8 × 4 ft) — standard", lM: 2.44, wM: 1.22 },
  { id: "6x3", label: "1.83 × 0.91 m (6 × 3 ft)", lM: 1.83, wM: 0.91 },
] as const;
