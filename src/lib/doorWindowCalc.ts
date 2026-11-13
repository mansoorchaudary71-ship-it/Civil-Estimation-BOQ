/**
 * Door & window schedule engine — pure functions, no React.
 * Metric internally. Lintel = masonry opening width + 0.30 m
 * (150 mm bearing each side). Frame length = 2 x (frame-outer H + W).
 * Glass area for glazed shutters uses a 50 mm sill-rail allowance
 * (labelled assumption in the UI).
 */
export type DoorWindowCurrency = "PKR" | "INR" | "AED" | "USD";
export type DoorWindowKind = "door" | "window" | "ventilator";

export interface DoorWindowRowInput {
  id: string;
  mark: string;
  kind: DoorWindowKind;
  room: string;
  /** leaf width (m) */
  leafWidthM: number;
  /** leaf height (m) */
  leafHeightM: number;
  frameMaterial: string;
  shutterType: string;
  /** "none" | "clear-5mm" | "tempered" | "frosted" */
  glass: string;
  /** frame section width (mm), default 100 */
  frameSectionMm: number;
  /** window sill height (m) */
  sillHeightM: number;
  qty: number;
  /** wall thickness (m) for lintel concrete volume */
  wallThicknessM: number;
  frameRatePerM: number | null;
  leafRatePerM2: number | null;
  hardwareRatePerSet: number | null;
}

export interface DoorWindowRowResult {
  leafAreaM2: number;
  frameOuterWidthM: number;
  frameOuterHeightM: number;
  openingWidthM: number;
  openingHeightM: number;
  /** clear passage width = leaf width minus 2 x 25 mm stop allowance */
  clearWidthM: number;
  glassAreaM2: number;
  frameLengthM: number;
  lintelLengthM: number;
  lintelVolumeM3: number;
  hardwareSets: number;
  totalLeafAreaM2: number;
  frameCost: number | null;
  leafCost: number | null;
  hardwareCost: number | null;
  rowCost: number | null;
  warnings: string[];
}

export const LINTEL_BEARING_M = 0.15; // each side
export const FRAME_CLEARANCE_MM = 10; // per side
export const STOP_ALLOWANCE_MM = 25; // per side
export const SILL_RAIL_MM = 50; // assumption for glass height

export function validateDoorWindowRow(r: DoorWindowRowInput): string[] {
  const errors: string[] = [];
  if (!(r.leafWidthM > 0)) errors.push(`${r.mark}: leaf width must be greater than 0.`);
  if (!(r.leafHeightM > 0)) errors.push(`${r.mark}: leaf height must be greater than 0.`);
  if (!Number.isInteger(r.qty) || r.qty < 1 || r.qty > 99)
    errors.push(`${r.mark}: quantity must be a whole number from 1 to 99.`);
  if (r.sillHeightM < 0 || r.sillHeightM > 1.8)
    errors.push(`${r.mark}: sill height must be between 0 and 1.8 m.`);
  if (r.frameSectionMm <= 0 || r.frameSectionMm > 200)
    errors.push(`${r.mark}: frame section must be between 1 and 200 mm.`);
  return errors;
}

export function calcDoorWindowRow(r: DoorWindowRowInput): DoorWindowRowResult {
  const warnings: string[] = [];
  const fs = Math.max(0, r.frameSectionMm) / 1000;
  const leafAreaM2 = Math.max(0, r.leafWidthM) * Math.max(0, r.leafHeightM);
  const frameOuterWidthM = Math.max(0, r.leafWidthM) + 2 * fs;
  // Door frames have a head but no bottom sill/threshold, so the outer
  // height adds one frame section; windows/ventilators add two.
  const frameOuterHeightM =
    Math.max(0, r.leafHeightM) + (r.kind === "door" ? 1 : 2) * fs;
  const openingWidthM = frameOuterWidthM + (2 * FRAME_CLEARANCE_MM) / 1000;
  const openingHeightM = frameOuterHeightM + (2 * FRAME_CLEARANCE_MM) / 1000;
  const clearWidthM = Math.max(0, r.leafWidthM - (2 * STOP_ALLOWANCE_MM) / 1000);
  const glazed = r.glass !== "none";
  const glassAreaM2 = glazed
    ? Math.max(0, r.leafWidthM - 2 * fs) *
      Math.max(0, r.leafHeightM - fs - SILL_RAIL_MM / 1000)
    : 0;
  const frameLengthM = 2 * (frameOuterHeightM + frameOuterWidthM);
  const lintelLengthM = openingWidthM + 2 * LINTEL_BEARING_M;
  // Lintel section 0.15 m deep x wall thickness (default 0.23 m).
  const lintelVolumeM3 = lintelLengthM * 0.15 * Math.max(0, r.wallThicknessM);
  const hardwareSets = r.qty;
  const totalLeafAreaM2 = leafAreaM2 * r.qty;
  const frameCost = r.frameRatePerM != null ? frameLengthM * r.qty * r.frameRatePerM : null;
  const leafCost = r.leafRatePerM2 != null ? totalLeafAreaM2 * r.leafRatePerM2 : null;
  const hardwareCost = r.hardwareRatePerSet != null ? hardwareSets * r.hardwareRatePerSet : null;
  const parts = [frameCost, leafCost, hardwareCost].filter((v): v is number => v != null);
  if (r.kind === "door" && r.leafHeightM > 2.6)
    warnings.push(`${r.mark}: door height above 2.6 m is unusual — confirm on the drawing.`);
  if (r.leafWidthM > 2.4)
    warnings.push(`${r.mark}: single leaf wider than 2.4 m — consider a double door.`);
  return {
    leafAreaM2,
    frameOuterWidthM,
    frameOuterHeightM,
    openingWidthM,
    openingHeightM,
    clearWidthM,
    glassAreaM2,
    frameLengthM,
    lintelLengthM,
    lintelVolumeM3,
    hardwareSets,
    totalLeafAreaM2,
    frameCost,
    leafCost,
    hardwareCost,
    rowCost: parts.length > 0 ? parts.reduce((a, b) => a + b, 0) : null,
    warnings,
  };
}

export interface DoorWindowScheduleTotals {
  rows: DoorWindowRowResult[];
  totalLeafAreaM2: number;
  totalFrameLengthM: number;
  totalGlassAreaM2: number;
  totalLintelVolumeM3: number;
  totalHardwareSets: number;
  totalCost: number | null;
}

export function calcDoorWindowSchedule(rows: DoorWindowRowInput[]): DoorWindowScheduleTotals {
  const results = rows.map(calcDoorWindowRow);
  const totalCostParts = results
    .map((r) => r.rowCost)
    .filter((v): v is number => v != null);
  return {
    rows: results,
    totalLeafAreaM2: results.reduce((a, r) => a + r.totalLeafAreaM2, 0),
    totalFrameLengthM: results.reduce((a, r, i) => a + r.frameLengthM * rows[i].qty, 0),
    totalGlassAreaM2: results.reduce((a, r, i) => a + r.glassAreaM2 * rows[i].qty, 0),
    totalLintelVolumeM3: results.reduce((a, r, i) => a + r.lintelVolumeM3 * rows[i].qty, 0),
    totalHardwareSets: results.reduce((a, r) => a + r.hardwareSets, 0),
    totalCost: totalCostParts.length > 0 ? totalCostParts.reduce((a, b) => a + b, 0) : null,
  };
}

/** Preset leaf sizes — labelled "typical — confirm on drawing" in the UI. */
export const DOOR_WINDOW_PRESETS: {
  id: string;
  mark: string;
  kind: DoorWindowKind;
  room: string;
  leafWidthM: number;
  leafHeightM: number;
  frameMaterial: string;
  shutterType: string;
  glass: string;
  sillHeightM: number;
}[] = [
  { id: "main-door", mark: "D1", kind: "door", room: "Entrance", leafWidthM: 1.067, leafHeightM: 2.134, frameMaterial: "timber", shutterType: "solid", glass: "none", sillHeightM: 0 },
  { id: "bed-door", mark: "D2", kind: "door", room: "Bedroom", leafWidthM: 0.914, leafHeightM: 2.134, frameMaterial: "timber", shutterType: "flush", glass: "none", sillHeightM: 0 },
  { id: "bath-door", mark: "D3", kind: "door", room: "Bathroom", leafWidthM: 0.686, leafHeightM: 2.134, frameMaterial: "UPVC", shutterType: "flush", glass: "frosted", sillHeightM: 0 },
  { id: "double-door", mark: "D4", kind: "door", room: "Entrance", leafWidthM: 1.524, leafHeightM: 2.134, frameMaterial: "timber", shutterType: "panelled", glass: "none", sillHeightM: 0 },
  { id: "bed-window", mark: "W1", kind: "window", room: "Bedroom", leafWidthM: 1.219, leafHeightM: 1.219, frameMaterial: "UPVC", shutterType: "sliding", glass: "clear-5mm", sillHeightM: 0.9 },
  { id: "living-window", mark: "W2", kind: "window", room: "Living", leafWidthM: 1.524, leafHeightM: 1.219, frameMaterial: "UPVC", shutterType: "sliding", glass: "clear-5mm", sillHeightM: 0.75 },
  { id: "kitchen-window", mark: "W3", kind: "window", room: "Kitchen", leafWidthM: 1.219, leafHeightM: 0.914, frameMaterial: "aluminium", shutterType: "sliding", glass: "clear-5mm", sillHeightM: 1.05 },
  { id: "bath-window", mark: "W4", kind: "window", room: "Bathroom", leafWidthM: 0.61, leafHeightM: 0.457, frameMaterial: "UPVC", shutterType: "fixed", glass: "frosted", sillHeightM: 1.5 },
  { id: "ventilator", mark: "V1", kind: "ventilator", room: "Bathroom", leafWidthM: 0.6, leafHeightM: 0.45, frameMaterial: "steel", shutterType: "louvred", glass: "none", sillHeightM: 1.8 },
];

export const DEFAULT_DOOR_WINDOW_ROWS: DoorWindowRowInput[] = [
  {
    id: "row-d1", mark: "D1", kind: "door", room: "Entrance",
    leafWidthM: 1.2, leafHeightM: 2.1, frameMaterial: "timber", shutterType: "solid",
    glass: "none", frameSectionMm: 100, sillHeightM: 0, qty: 1, wallThicknessM: 0.23,
    frameRatePerM: null, leafRatePerM2: null, hardwareRatePerSet: null,
  },
  {
    id: "row-d2", mark: "D2", kind: "door", room: "Bedroom",
    leafWidthM: 0.9, leafHeightM: 2.1, frameMaterial: "timber", shutterType: "flush",
    glass: "none", frameSectionMm: 100, sillHeightM: 0, qty: 3, wallThicknessM: 0.23,
    frameRatePerM: null, leafRatePerM2: null, hardwareRatePerSet: null,
  },
  {
    id: "row-w1", mark: "W1", kind: "window", room: "Living",
    leafWidthM: 1.5, leafHeightM: 1.2, frameMaterial: "UPVC", shutterType: "sliding",
    glass: "clear-5mm", frameSectionMm: 100, sillHeightM: 0.9, qty: 2, wallThicknessM: 0.23,
    frameRatePerM: null, leafRatePerM2: null, hardwareRatePerSet: null,
  },
];
