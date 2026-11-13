/**
 * Finishes engine — ONE canonical engine serving both the master-finishes
 * workspace and the interiors-finishes calculator. Pure functions, no React.
 * All calculations are done in metric internally (m, m2, m3).
 *
 * Rules applied (see repo AGENTS.md + audit specs G1 §5.2 / G4 Spec 1):
 * - Brick/block count: N = V_wall / V_unit_with_mortar (delegates to
 *   brickCalc.ts — never re-implemented here).
 * - Dry mortar = wet x 1.33; 50 kg cement bag = 0.0347 m3; bags rounded up.
 * - Plaster opening deductions (IS 1200): <0.5 m2 none; 0.5-3 m2 one face;
 *   >3 m2 both faces + jambs/soffits/sills ((2h + w) x jamb depth).
 * - Cost: a rate quoted per 1,000 bricks is divided by 1,000 (the old
 *   interiors-finishes code multiplied pieces by the per-1,000 rate,
 *   overstating brick cost 1,000x). Null rate = unknown cost ("—"), never 0.
 */
import {
  calcBrickworkFromArea,
  CEMENT_BAG_M3,
  DRY_MORTAR_FACTOR,
  M3_TO_CFT,
  type BrickPreset,
  type BrickRates,
  type BrickResults,
  type Currency as BrickCurrency,
} from "./brickCalc";

export type FinishesCurrency = "PKR" | "INR" | "AED" | "USD";

export const CURRENCY_SYMBOLS: Record<FinishesCurrency, string> = {
  PKR: "Rs",
  INR: "₹",
  AED: "AED",
  USD: "$",
};

export function formatFinishesMoney(
  value: number | null | undefined,
  currency: FinishesCurrency,
): string {
  if (value == null || !isFinite(value)) return "—";
  return `${CURRENCY_SYMBOLS[currency]} ${Math.round(value).toLocaleString("en-US")}`;
}

export function costLine(qty: number, rate: number | null | undefined): number | null {
  if (rate == null || !isFinite(rate) || rate < 0) return null;
  return qty * rate;
}

export function sumCosts(lines: (number | null | undefined)[]): number | null {
  const vals = lines.filter((v): v is number => v != null && isFinite(v));
  return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) : null;
}

/* ------------------------------------------------------------------ */
/* Shared room geometry + IS 1200 opening deductions                  */
/* ------------------------------------------------------------------ */

export interface OpeningInput {
  id: string;
  kind: "door" | "window" | "other";
  /** width in m */
  widthM: number;
  /** height in m */
  heightM: number;
  count: number;
}

export interface OpeningDeduction {
  id: string;
  kind: OpeningInput["kind"];
  areaM2: number;
  /** "none" | "one-face" | "both-faces" */
  rule: "none" | "one-face" | "both-faces";
  deductionM2: number;
  jambM2: number;
}

export const OPENING_RULE_NONE = 0.5; // m2 — below this, no deduction
export const OPENING_RULE_BOTH = 3; // m2 — above this, deduct both faces + jambs

export function deductOpening(
  opening: OpeningInput,
  faces: 1 | 2,
  jambDepthM: number,
): OpeningDeduction {
  const areaM2 = Math.max(0, opening.widthM) * Math.max(0, opening.heightM);
  const count = Math.max(0, opening.count);
  const totalArea = areaM2 * count;
  if (areaM2 < OPENING_RULE_NONE) {
    return { id: opening.id, kind: opening.kind, areaM2: totalArea, rule: "none", deductionM2: 0, jambM2: 0 };
  }
  if (areaM2 <= OPENING_RULE_BOTH) {
    // One face only: deduct the opening area once, however many faces
    // are being plastered (the other face is still plastered around it).
    return { id: opening.id, kind: opening.kind, areaM2: totalArea, rule: "one-face", deductionM2: totalArea, jambM2: 0 };
  }
  // Both faces + jambs / soffits / sills: (2h + w) x jamb depth, per opening.
  const jambM2 =
    (2 * Math.max(0, opening.heightM) + Math.max(0, opening.widthM)) *
    Math.max(0, jambDepthM) *
    count;
  return {
    id: opening.id,
    kind: opening.kind,
    areaM2: totalArea,
    rule: "both-faces",
    deductionM2: totalArea * faces,
    jambM2,
  };
}

export interface RoomGeometry {
  grossWallM2: number;
  netWallM2: number;
  floorM2: number;
  ceilingM2: number;
  perimeterM: number;
  deductionsM2: number;
  jambsM2: number;
  openings: OpeningDeduction[];
}

export function calcRoomGeometry(
  lengthM: number,
  widthM: number,
  heightM: number,
  openings: OpeningInput[],
  faces: 1 | 2 = 1,
  jambDepthM = 0.23,
): RoomGeometry {
  const L = Math.max(0, lengthM);
  const W = Math.max(0, widthM);
  const H = Math.max(0, heightM);
  const grossWallM2 = 2 * (L + W) * H * faces;
  const floorM2 = L * W;
  const perimeterM = 2 * (L + W);
  const ded = openings.map((o) => deductOpening(o, faces, jambDepthM));
  const deductionsM2 = ded.reduce((a, d) => a + d.deductionM2, 0);
  const jambsM2 = ded.reduce((a, d) => a + d.jambM2, 0);
  const netWallM2 = Math.max(0, grossWallM2 - deductionsM2 + jambsM2);
  return {
    grossWallM2,
    netWallM2,
    floorM2,
    ceilingM2: floorM2,
    perimeterM,
    deductionsM2,
    jambsM2,
    openings: ded,
  };
}

export function validateRoom(
  lengthM: number,
  widthM: number,
  heightM: number,
  openings: OpeningInput[],
): string[] {
  const errors: string[] = [];
  if (!(lengthM > 0)) errors.push("Room length must be greater than 0.");
  if (!(widthM > 0)) errors.push("Room width must be greater than 0.");
  if (!(heightM > 0)) errors.push("Room height must be greater than 0.");
  if (lengthM > 100 || widthM > 100 || heightM > 30)
    errors.push("Room dimensions look too large — check the unit (m vs ft).");
  for (const o of openings) {
    if (!(o.widthM > 0) || !(o.heightM > 0))
      errors.push(`Opening ${o.kind} must have width and height greater than 0.`);
    if (!(o.count >= 1) || !Number.isInteger(o.count))
      errors.push(`Opening ${o.kind} count must be a whole number of 1 or more.`);
    if (o.widthM * o.heightM * o.count > 2 * (lengthM + widthM) * heightM)
      errors.push("Openings exceed the gross wall area — reduce an opening or enlarge the room.");
  }
  return errors;
}

/* ------------------------------------------------------------------ */
/* 1. Masonry — delegates to brickCalc.ts (one engine, one truth)     */
/* ------------------------------------------------------------------ */

export interface MasonryInputs {
  netWallM2: number;
  thicknessMm: number;
  brick: BrickPreset;
  customBrick?: { l: number; w: number; h: number };
  jointMm: number;
  wastagePct: number;
  mix: [number, number];
  currency: BrickCurrency;
  rates: BrickRates;
}

export function calcMasonry(inp: MasonryInputs): BrickResults {
  return calcBrickworkFromArea(inp.netWallM2, inp.thicknessMm, inp.brick, {
    customBrick: inp.customBrick,
    jointMm: inp.jointMm,
    wastagePct: inp.wastagePct,
    mix: inp.mix,
    currency: inp.currency,
    rates: inp.rates,
  });
}

/* ------------------------------------------------------------------ */
/* 2. Plaster                                                           */
/* ------------------------------------------------------------------ */

export interface PlasterInputs {
  /** internal plaster area (net wall, m2) */
  internalAreaM2: number;
  /** external plaster area (gross wall with opening rules applied, m2) */
  externalAreaM2: number;
  /** ceiling area (m2); plastered at internal thickness when included */
  ceilingAreaM2: number;
  ceilingIncluded: boolean;
  internalThicknessMm: number;
  externalThicknessMm: number;
  /** cement : sand parts, e.g. [1, 4] */
  mix: [number, number];
  /** extra for uneven surfaces, factor e.g. 1.10 */
  unevenFactor: number;
  wastagePct: number;
}

export interface PlasterResults {
  internalWetM3: number;
  externalWetM3: number;
  wetM3: number;
  dryM3: number;
  cementBags: number;
  cementM3: number;
  sandM3: number;
  sandCft: number;
}

export function calcPlaster(inp: PlasterInputs): PlasterResults {
  const intArea = Math.max(0, inp.internalAreaM2) + (inp.ceilingIncluded ? Math.max(0, inp.ceilingAreaM2) : 0);
  const internalWetM3 = intArea * (Math.max(0, inp.internalThicknessMm) / 1000);
  const externalWetM3 = Math.max(0, inp.externalAreaM2) * (Math.max(0, inp.externalThicknessMm) / 1000);
  const wetM3 = (internalWetM3 + externalWetM3) * Math.max(0, inp.unevenFactor || 1);
  const dryM3 = wetM3 * DRY_MORTAR_FACTOR * (1 + Math.max(0, inp.wastagePct) / 100);
  const [c, s] = inp.mix;
  const total = c + s || 1;
  const cementM3 = (dryM3 * c) / total;
  const cementBags = Math.ceil(cementM3 / CEMENT_BAG_M3);
  const sandM3 = (dryM3 * s) / total;
  return {
    internalWetM3,
    externalWetM3,
    wetM3,
    dryM3,
    cementBags,
    cementM3,
    sandM3,
    sandCft: sandM3 * M3_TO_CFT,
  };
}

/* ------------------------------------------------------------------ */
/* 3. Paint (incl. primer + putty)                                    */
/* ------------------------------------------------------------------ */

export interface PaintInputs {
  netWallM2: number;
  ceilingM2: number;
  ceilingIncluded: boolean;
  /** doors: each door face adds this area (m2) when included */
  doorAreaM2: number;
  skirtingHeightM: number;
  perimeterM: number;
  skirtingDeducted: boolean;
  /** m2 covered per litre per coat */
  coverageM2PerL: number;
  primerCoverageM2PerL: number;
  coats: number;
  primerCoats: number;
  /** m2 covered per kg of putty per coat (indicative 1.1) */
  puttyCoverageM2PerKg: number;
  puttyCoats: number;
  wastagePct: number;
}

export interface PaintResults {
  paintableAreaM2: number;
  primerLitres: number;
  paintLitres: number;
  puttyKg: number;
  /** packs, largest first: [20L, 10L, 4L, 1L] counts */
  packs: { sizeL: number; count: number }[];
}

export const PAINT_PACK_SIZES_L = [20, 10, 4, 1];

export function packsForLitres(litres: number): { sizeL: number; count: number }[] {
  let remaining = Math.ceil(litres);
  return PAINT_PACK_SIZES_L.map((sizeL) => {
    const count = Math.floor(remaining / sizeL);
    remaining -= count * sizeL;
    return { sizeL, count };
  }).filter((p) => p.count > 0);
}

export function calcPaint(inp: PaintInputs): PaintResults {
  const skirtingM2 = inp.skirtingDeducted ? Math.max(0, inp.perimeterM) * Math.max(0, inp.skirtingHeightM) : 0;
  const paintableAreaM2 = Math.max(
    0,
    Math.max(0, inp.netWallM2) +
      (inp.ceilingIncluded ? Math.max(0, inp.ceilingM2) : 0) +
      Math.max(0, inp.doorAreaM2) -
      skirtingM2,
  );
  const primerLitres = Math.ceil(
    (paintableAreaM2 * Math.max(0, inp.primerCoats)) / Math.max(0.01, inp.primerCoverageM2PerL),
  );
  const paintLitres = Math.ceil(
    ((paintableAreaM2 * Math.max(0, inp.coats)) / Math.max(0.01, inp.coverageM2PerL)) *
      (1 + Math.max(0, inp.wastagePct) / 100),
  );
  const puttyKg = Math.ceil(
    (paintableAreaM2 * Math.max(0, inp.puttyCoats)) / Math.max(0.01, inp.puttyCoverageM2PerKg),
  );
  return { paintableAreaM2, primerLitres, paintLitres, puttyKg, packs: packsForLitres(paintLitres) };
}

/* ------------------------------------------------------------------ */
/* 4. Flooring (tiles + skirting strips + mortar bed)                 */
/* ------------------------------------------------------------------ */

export type TilePattern = "straight" | "brick-bond" | "diagonal" | "herringbone";

export const TILE_PATTERN_WASTAGE: Record<TilePattern, number> = {
  straight: 7,
  "brick-bond": 10,
  diagonal: 14,
  herringbone: 16,
};

export interface FlooringInputs {
  floorAreaM2: number;
  perimeterM: number;
  tileLengthM: number;
  tileWidthM: number;
  groutMm: number;
  pattern: TilePattern;
  /** overrides pattern default when given */
  wastagePct?: number;
  tilesPerBox: number;
  skirtingHeightM: number;
  skirtingIncluded: boolean;
  /** total width of door openings (m) — skirting does not run across doors */
  doorWidthsTotalM: number;
  bedThicknessMm: number;
  /** cement : sand parts for the mortar bed */
  mix: [number, number];
}

export interface FlooringResults {
  effectiveTileAreaM2: number;
  floorTiles: number;
  skirtingTiles: number;
  totalTiles: number;
  boxes: number;
  spares: number;
  skirtingAreaM2: number;
  groutKg: number;
  bedDryM3: number;
  bedCementBags: number;
  bedSandM3: number;
  bedSandCft: number;
}

export function calcFlooring(inp: FlooringInputs): FlooringResults {
  const wastagePct = inp.wastagePct ?? TILE_PATTERN_WASTAGE[inp.pattern];
  const groutM = Math.max(0, inp.groutMm) / 1000;
  const effectiveTileAreaM2 =
    (Math.max(0, inp.tileLengthM) + groutM) * (Math.max(0, inp.tileWidthM) + groutM);
  const floorTiles = Math.ceil(
    (Math.max(0, inp.floorAreaM2) / effectiveTileAreaM2) * (1 + wastagePct / 100),
  );
  const skirtingAreaM2 = inp.skirtingIncluded
    ? Math.max(0, Math.max(0, inp.perimeterM) - Math.max(0, inp.doorWidthsTotalM)) *
      Math.max(0, inp.skirtingHeightM)
    : 0;
  // Skirting is cut strips, counted separately — never folded into the
  // floor area and divided by whole-tile area (the old workspace bug).
  const skirtingTiles = Math.ceil(
    (skirtingAreaM2 / effectiveTileAreaM2) * (1 + wastagePct / 100),
  );
  const totalTiles = floorTiles + skirtingTiles;
  const boxes = Math.ceil(totalTiles / Math.max(1, inp.tilesPerBox));
  const spares = boxes * Math.max(1, inp.tilesPerBox) - totalTiles;
  const groutKg = 0.3 * (Math.max(0, inp.floorAreaM2) + skirtingAreaM2); // 0.3 kg/m2 assumption
  const bedDryM3 =
    Math.max(0, inp.floorAreaM2) * (Math.max(0, inp.bedThicknessMm) / 1000) * DRY_MORTAR_FACTOR;
  const [c, s] = inp.mix;
  const total = c + s || 1;
  const bedCementBags = Math.ceil((bedDryM3 * c) / total / CEMENT_BAG_M3);
  const bedSandM3 = (bedDryM3 * s) / total;
  return {
    effectiveTileAreaM2,
    floorTiles,
    skirtingTiles,
    totalTiles,
    boxes,
    spares,
    skirtingAreaM2,
    groutKg,
    bedDryM3,
    bedCementBags,
    bedSandM3,
    bedSandCft: bedSandM3 * M3_TO_CFT,
  };
}

/* ------------------------------------------------------------------ */
/* 5. Countertops (adopts CountertopModule logic; slab thickness used)*/
/* ------------------------------------------------------------------ */

export type CounterShape = "straight" | "l-shape" | "u-shape";

export interface CountertopInputs {
  shape: CounterShape;
  lengthAM: number;
  lengthBM: number;
  lengthCM: number;
  depthM: number;
  slabThicknessMm: number;
  sinkOn: boolean;
  sinkLengthM: number;
  sinkWidthM: number;
  hobOn: boolean;
  hobLengthM: number;
  hobWidthM: number;
  skirtingHeightM: number;
  wastagePct: number;
}

export interface CountertopResults {
  grossAreaM2: number;
  netAreaM2: number;
  skirtingLengthM: number;
  skirtingAreaM2: number;
  orderAreaM2: number;
  edgePolishM: number;
  /** slab volume = gross area x slab thickness — thickness MUST be used */
  slabVolumeM3: number;
}

export function calcCountertop(inp: CountertopInputs): CountertopResults {
  const d = Math.max(0, inp.depthM);
  const a = Math.max(0, inp.lengthAM);
  const b = Math.max(0, inp.lengthBM);
  const c = Math.max(0, inp.lengthCM);
  let grossAreaM2 = 0;
  let skirtingLengthM = 0;
  let edgePolishM = 0;
  if (inp.shape === "straight") {
    grossAreaM2 = a * d;
    skirtingLengthM = a + 2 * d;
    edgePolishM = a + 2 * d;
  } else if (inp.shape === "l-shape") {
    grossAreaM2 = a * d + Math.max(0, b - d) * d;
    skirtingLengthM = a + b + d;
    edgePolishM = a + b;
  } else {
    grossAreaM2 = a * d + Math.max(0, b - d) * d + Math.max(0, c - d) * d;
    skirtingLengthM = a + b + c;
    edgePolishM = a + b + c;
  }
  let cutouts = 0;
  if (inp.sinkOn) cutouts += Math.max(0, inp.sinkLengthM) * Math.max(0, inp.sinkWidthM);
  if (inp.hobOn) cutouts += Math.max(0, inp.hobLengthM) * Math.max(0, inp.hobWidthM);
  const netAreaM2 = Math.max(0, grossAreaM2 - cutouts);
  const skirtingAreaM2 = skirtingLengthM * Math.max(0, inp.skirtingHeightM);
  const orderAreaM2 = (grossAreaM2 + skirtingAreaM2) * (1 + Math.max(0, inp.wastagePct) / 100);
  const slabVolumeM3 = grossAreaM2 * (Math.max(0, inp.slabThicknessMm) / 1000);
  return { grossAreaM2, netAreaM2, skirtingLengthM, skirtingAreaM2, orderAreaM2, edgePolishM, slabVolumeM3 };
}

/* ------------------------------------------------------------------ */
/* 6. Carpentry / woodwork                                            */
/* ------------------------------------------------------------------ */

export interface CarpentryInputs {
  perimeterM: number;
  netWallAreaM2: number;
  studSpacingM: number;
  /** closed room (default) vs open run */
  openRun: boolean;
  sheetLengthM: number;
  sheetWidthM: number;
  wastagePct: number;
  /** "panelling" = fixed covering, reuse 1; "formwork" = reuse factor applies */
  purpose: "panelling" | "formwork";
  reuseFactor: number;
}

export interface CarpentryResults {
  studs: number;
  sheets: number;
  sheetAreaM2: number;
}

export function calcCarpentry(inp: CarpentryInputs): CarpentryResults {
  // Closed room: ceil(perimeter / spacing). The old +1 double-counts a
  // corner on a closed loop; +1 applies only to an open run.
  const studs = Math.ceil(
    Math.max(0, inp.perimeterM) / Math.max(0.01, inp.studSpacingM),
  ) + (inp.openRun ? 1 : 0);
  const sheetAreaM2 = Math.max(0, inp.sheetLengthM) * Math.max(0, inp.sheetWidthM);
  // Reuse divides only formwork/shuttering. Fixed panelling is divided by 1.
  const reuse = inp.purpose === "formwork" ? Math.max(1, inp.reuseFactor) : 1;
  const sheets = Math.ceil(
    (Math.max(0, inp.netWallAreaM2) * (1 + Math.max(0, inp.wastagePct) / 100)) /
      sheetAreaM2 /
      reuse,
  );
  return { studs, sheets, sheetAreaM2 };
}

/* ------------------------------------------------------------------ */
/* 7. Carpet / built-up / super built-up area                         */
/* ------------------------------------------------------------------ */

export interface CarpetInputs {
  floorAreaM2: number;
  /** labelled assumption: share of floor area taken by internal walls */
  internalWallDeductionPct: number;
  /** addition for common areas, % of built-up area */
  superBuiltUpAddPct: number;
}

export interface CarpetResults {
  carpetAreaM2: number;
  builtUpAreaM2: number;
  superBuiltUpAreaM2: number;
}

export function calcCarpetArea(inp: CarpetInputs): CarpetResults {
  const carpetAreaM2 = Math.max(0, inp.floorAreaM2);
  // Assumption-based conversion, labelled as such in the UI: built-up =
  // carpet / (1 - deduction%). The parts-based alternative (carpet +
  // internal-wall area + common share) is in calcBuiltUpFromParts.
  const builtUpAreaM2 =
    carpetAreaM2 / (1 - Math.min(90, Math.max(0, inp.internalWallDeductionPct)) / 100);
  const superBuiltUpAreaM2 =
    builtUpAreaM2 * (1 + Math.max(0, inp.superBuiltUpAddPct) / 100);
  return { carpetAreaM2, builtUpAreaM2, superBuiltUpAreaM2 };
}

export function calcBuiltUpFromParts(
  carpetAreaM2: number,
  internalWallAreaM2: number,
  commonAreaM2: number,
  superBuiltUpAddPct: number,
): CarpetResults {
  const builtUpAreaM2 =
    Math.max(0, carpetAreaM2) + Math.max(0, internalWallAreaM2) + Math.max(0, commonAreaM2);
  return {
    carpetAreaM2: Math.max(0, carpetAreaM2),
    builtUpAreaM2,
    superBuiltUpAreaM2: builtUpAreaM2 * (1 + Math.max(0, superBuiltUpAddPct) / 100),
  };
}

/* ------------------------------------------------------------------ */
/* Default openings (unit-aware)                                      */
/* ------------------------------------------------------------------ */

export function defaultOpenings(lengthUnit: "m" | "ft"): OpeningInput[] {
  if (lengthUnit === "ft") {
    return [
      { id: "op-door-1", kind: "door", widthM: 0.9, heightM: 2.1, count: 1 },
      { id: "op-win-1", kind: "window", widthM: 1.2, heightM: 1.2, count: 1 },
    ];
  }
  return [
    { id: "op-door-1", kind: "door", widthM: 0.9, heightM: 2.1, count: 1 },
    { id: "op-win-1", kind: "window", widthM: 1.2, heightM: 1.2, count: 1 },
  ];
}
