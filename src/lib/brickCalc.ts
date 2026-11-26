/**
 * Brick calculator engine — pure functions, no React.
 * Standard quantity-surveying method, same family as the repo's existing
 * Brickwork9InchModule: N = V_wall / V_brick_with_mortar; dry mortar = wet x 1.33;
 * 50 kg cement bag = 0.0347 m3. All calculations are done in metric internally.
 *
 * Rates are INDICATIVE defaults (Nov 2026, sources noted in brickProgrammatic.ts).
 * They are editable in the UI and must be confirmed with a local supplier.
 */

export type Currency = "PKR" | "INR" | "AED" | "GBP" | "USD";

export const CURRENCY_META: Record<
  Currency,
  { symbol: string; label: string; sandUnit: "cft" | "m3" }
> = {
  PKR: { symbol: "Rs", label: "Pakistani Rupee", sandUnit: "cft" },
  INR: { symbol: "₹", label: "Indian Rupee", sandUnit: "cft" },
  AED: { symbol: "AED", label: "UAE Dirham", sandUnit: "m3" },
  GBP: { symbol: "£", label: "British Pound", sandUnit: "m3" },
  USD: { symbol: "$", label: "US Dollar", sandUnit: "cft" },
};

/**
 * Standard cement bag size on each market (kg). Pakistan / India / UAE
 * sell 50 kg bags; the UK sells 25 kg bags; the US sells 94 lb bags
 * (42.6 kg, ASTM C150). The bag-count maths scales the 0.0347 m³ per
 * 50 kg volume linearly, so the bag size is an input, not a constant.
 */
export const DEFAULT_CEMENT_BAG_KG: Record<Currency, number> = {
  PKR: 50,
  INR: 50,
  AED: 50,
  GBP: 25,
  USD: 42.6,
};

/**
 * Indicative default rates (November 2026) — editable in the UI, never a
 * quote. Sources: PK/IN/AE as in brickProgrammatic.ts; UK facing bricks
 * £400–900 per 1,000 and cement ~£8 per 25 kg bag (bestbuilders.co.uk
 * Q3 2026 bricklaying guide; Travis Perkins Blue Circle 25 kg, Nov 2026);
 * US standard brick ~$550 per 1,000 (Angi, Jul 2026; designestimation.com,
 * Oct 2026). UK sand is sold per tonne / bulk bag and US cement/sand
 * prices were not verified — those fields stay blank for the user to fill.
 */
export const INDICATIVE_RATES: Record<
  Currency,
  { brickPer1000: number | null; cementPerBag: number | null; sandPerUnit: number | null }
> = {
  PKR: { brickPer1000: 20000, cementPerBag: 1550, sandPerUnit: 50 },
  INR: { brickPer1000: 10000, cementPerBag: 400, sandPerUnit: 80 },
  AED: { brickPer1000: null, cementPerBag: 25, sandPerUnit: null },
  GBP: { brickPer1000: 650, cementPerBag: 8, sandPerUnit: null },
  USD: { brickPer1000: 550, cementPerBag: null, sandPerUnit: null },
};

/** Indicative labour defaults (November 2026, editable, off by default). */
export const INDICATIVE_LABOUR_PER_1000: Record<Currency, number | null> = {
  PKR: null,
  INR: null,
  AED: null,
  // UK: £400–700 per 1,000 bricks laid (bestbuilders.co.uk, Q3 2026).
  GBP: 550,
  // US: $1,500–2,000 per 1,000 laid, labour only (2026 US guides).
  USD: 1750,
};

/** Wall length units. The engine converts every unit to metres internally. */
export type LengthUnit = "ft" | "in" | "m" | "cm" | "mm" | "yd";

export const LENGTH_UNIT_TO_M: Record<LengthUnit, number> = {
  ft: 0.3048,
  in: 0.0254,
  m: 1,
  cm: 0.01,
  mm: 0.001,
  yd: 0.9144,
};

export const LENGTH_UNITS: { id: LengthUnit; label: string; short: string }[] = [
  { id: "ft", label: "Feet (ft)", short: "ft" },
  { id: "in", label: "Inches (in)", short: "in" },
  { id: "m", label: "Metres (m)", short: "m" },
  { id: "cm", label: "Centimetres (cm)", short: "cm" },
  { id: "mm", label: "Millimetres (mm)", short: "mm" },
  { id: "yd", label: "Yards (yd)", short: "yd" },
];

/** Convert a length value between two length units (exact factors). */
export function convertLength(value: number, from: LengthUnit, to: LengthUnit): number {
  if (!isFinite(value) || from === to) return value;
  return (value * LENGTH_UNIT_TO_M[from]) / LENGTH_UNIT_TO_M[to];
}

/** Parse a wall length that may be written ft+in, e.g. `10'6"`, `10 ft 6 in`,
 * `10' 6"` — the way Pakistani and US users actually measure — into a value
 * in `unit`. A plain number is returned unchanged. Returns NaN for junk. */
export function parseCompositeLength(input: string, unit: LengthUnit): number {
  const s = input.trim().toLowerCase();
  if (s === "") return NaN;
  const plain = Number(s);
  if (isFinite(plain)) return plain;
  // 10'6" / 10' 6" / 10 ft 6 in / 10ft 6in
  const m = s.match(
    /^(\d+(?:\.\d+)?)\s*(?:'|ft|feet)\s*(\d+(?:\.\d+)?)?\s*(?:"|in|inch|inches)?$/,
  );
  if (m) {
    const feet = parseFloat(m[1]);
    const inches = m[2] ? parseFloat(m[2]) : 0;
    const totalFt = feet + inches / 12;
    if (unit === "in") return totalFt * 12;
    if (unit === "ft") return totalFt;
    return convertLength(totalFt, "ft", unit);
  }
  // Bare inches written as 126" — only meaningful when the unit is ft/in.
  const inchesOnly = s.match(/^(\d+(?:\.\d+)?)\s*(?:"|in|inch|inches)$/);
  if (inchesOnly) {
    const inches = parseFloat(inchesOnly[1]);
    if (unit === "in") return inches;
    if (unit === "ft") return inches / 12;
    return convertLength(inches, "in", unit);
  }
  return NaN;
}

/** Parse a length input box: composite ft+in notation, else a plain number. */
export function parseLengthValue(input: string, unit: LengthUnit): number {
  const v = parseCompositeLength(input, unit);
  return isFinite(v) ? v : 0;
}

/** Area of a gable-end triangle (base × rise ÷ 2), in m². */
export function gableTriangleAreaM2(baseM: number, riseM: number): number {
  return Math.max(0, baseM) * Math.max(0, riseM) / 2;
}

/** Centre-line length of a curved wall: radius × angle (degrees → radians). */
export function arcLengthM(radiusM: number, angleDeg: number): number {
  return Math.max(0, radiusM) * ((Math.max(0, angleDeg) * Math.PI) / 180);
}

/** Courses in a wall of `heightM` with bricks `brickHeightMm` + `jointMm`. */
export function courseCount(heightM: number, brickHeightMm: number, jointMm: number): number {
  const courseM = (Math.max(0, brickHeightMm) + Math.max(0, jointMm)) / 1000;
  if (courseM <= 0 || heightM <= 0) return 0;
  return Math.ceil(heightM / courseM);
}
export const AREA_UNIT_TO_M2: Record<"sqft" | "m2" | "sqyd", number> = {
  sqft: 0.092903,
  m2: 1,
  sqyd: 0.836127,
};

export type BondPattern = "stretcher" | "english" | "flemish";

export interface BondPatternInfo {
  id: BondPattern;
  label: string;
  /** One-line structural note. The count never changes with bond. */
  note: string;
}

export const BOND_PATTERNS: BondPatternInfo[] = [
  {
    id: "stretcher",
    label: "Stretcher bond",
    note: "Single-leaf / half-brick (4½″) walls only — the fastest bond to lay, all stretchers.",
  },
  {
    id: "english",
    label: "English bond",
    note: "Strongest common bond for 9″ walls — courses alternate between stretchers and headers.",
  },
  {
    id: "flemish",
    label: "Flemish bond",
    note: "Stretcher and header alternate in every course — a decorative face, same strength class as English for 9″ walls.",
  },
];

export interface BrickPreset {
  id: string;
  label: string;
  /** actual brick size in mm (L x W x H) */
  l: number;
  w: number;
  h: number;
  standard: string;
  note: string;
}

export const BRICK_PRESETS: BrickPreset[] = [
  {
    id: "pk-awwal",
    label: "Pakistani Awwal — 9\" × 4½\" × 3\"",
    l: 230,
    w: 110,
    h: 75,
    standard: "Pakistan kiln standard (nominal 9\" × 4½\" × 3\")",
    note: "First-class burnt clay brick. Kiln sizes vary ±3 mm — measure your bricks.",
  },
  {
    id: "pk-275",
    label: "Pakistani standard — 9\" × 4½\" × 2¾\"",
    l: 230,
    w: 114,
    h: 70,
    standard: "Pakistan FPS nominal 23 × 11.5 × 7.5 cm",
    note: "Common 2¾-inch height variant sold by many kilns.",
  },
  {
    id: "in-modular",
    label: "Indian modular — 190 × 90 × 90 mm",
    l: 190,
    w: 90,
    h: 90,
    standard: "IS 1077 (modular brick)",
    note: "Nominal size with mortar is 200 × 100 × 100 mm.",
  },
  {
    id: "in-nonmodular",
    label: "Indian non-modular — 230 × 110 × 70 mm",
    l: 230,
    w: 110,
    h: 70,
    standard: "IS 1077 (non-modular brick)",
    note: "Traditional size still used across much of India.",
  },
  {
    id: "us-standard",
    label: "US standard — 7½\" × 3½\" × 2¼\"",
    l: 190.5,
    w: 88.9,
    h: 57.2,
    standard: "US modular face brick (7½\" × 3½\" × 2¼\")",
    note: "US face-brick work is usually a single leaf (veneer). This calculator counts full wall volume, so a veneer wall should use the 4½″-equivalent thickness.",
  },
  {
    id: "uae-clay",
    label: "UAE clay brick — 215 × 102.5 × 65 mm",
    l: 215,
    w: 102.5,
    h: 65,
    standard: "BS EN 771-1 (British size, used across the Gulf)",
    note: "Clay bricks in the UAE are mostly imported. Concrete blocks are the common local walling unit.",
  },
  {
    id: "uk-clay",
    label: "UK clay brick — 215 × 102.5 × 65 mm",
    l: 215,
    w: 102.5,
    h: 65,
    standard: "BS EN 771-1 (UK standard clay brick)",
    note: "The standard UK facing brick, sold in packs of about 400–520. UK cement comes in 25 kg bags, so the bag size defaults to 25 kg with this preset's currency (GBP).",
  },
  {
    id: "aac-600",
    label: "AAC block — 600 × 200 × 150 mm",
    l: 600,
    w: 200,
    h: 150,
    standard: "AAC block (autoclaved aerated concrete)",
    note: "Use a 3 mm thin-bed joint and a 150 mm wall thickness with this block. Mortar is wall volume minus block volume, same method as bricks.",
  },
  {
    id: "hollow-400",
    label: "Hollow concrete block — 400 × 200 × 200 mm",
    l: 400,
    w: 200,
    h: 200,
    standard: "Hollow concrete block",
    note: "Use a 10 mm joint and a 200 mm wall thickness with this block. Mortar is wall volume minus block volume, same method as bricks.",
  },
  {
    id: "custom",
    label: "Custom size",
    l: 230,
    w: 110,
    h: 75,
    standard: "Your measured brick",
    note: "Measure length, width and height of your actual bricks.",
  },
];

export interface ThicknessPreset {
  id: string;
  label: string;
  /** mm */
  mm: number;
  use: string;
}

export const THICKNESS_PRESETS: ThicknessPreset[] = [
  { id: "t115", label: "4½\" (115 mm) — single brick", mm: 115, use: "Partition / internal walls" },
  { id: "t230", label: "9\" (230 mm) — double brick", mm: 230, use: "External / load-bearing walls" },
  { id: "t345", label: "13½\" (345 mm)", mm: 345, use: "Foundations / heavy load-bearing" },
  { id: "t457", label: "18\" (457 mm) — double wall", mm: 457, use: "Thick foundations / retaining walls" },
  { id: "tcustom", label: "Custom thickness", mm: 230, use: "Enter your wall thickness" },
];

export interface OpeningInput {
  id: string;
  kind: "door" | "window" | "other";
  /** length in the wall's length unit */
  length: number;
  height: number;
  count: number;
}

export interface BrickRates {
  /** price per 1,000 bricks; null = unknown, user must enter */
  brickPer1000: number | null;
  /** price per cement bag (see cementBagKg); null = unknown */
  cementPerBag: number | null;
  /** price per sand unit (cft for PKR/INR, m3 for AED); null = unknown */
  sandPerUnit: number | null;
}

export interface BrickInputs {
  /** wall length in lengthUnit */
  length: number;
  /** wall height in lengthUnit */
  height: number;
  lengthUnit: LengthUnit;
  /** wall thickness in mm */
  thicknessMm: number;
  openings: OpeningInput[];
  /**
   * Total openings area in m². When set, it replaces the per-opening list
   * (the two modes are mutually exclusive per wall).
   */
  openingsTotalAreaM2?: number | null;
  /**
   * Extra net wall area in m² beyond length × height — the gable-end
   * triangle (base × rise ÷ 2). Added to the gross area before openings
   * are deducted.
   */
  extraAreaM2?: number | null;
  brick: BrickPreset;
  /** custom brick size in mm (used when brick.id === "custom") */
  customBrick?: { l: number; w: number; h: number };
  /** mortar joint thickness in mm */
  jointMm: number;
  /** wastage percent applied to bricks and mortar */
  wastagePct: number;
  /** cement : sand parts, e.g. [1, 4] */
  mix: [number, number];
  /** cement bag size in kg on the local market (default 50) */
  cementBagKg?: number;
  currency: Currency;
  rates: BrickRates;
}

export interface BrickResults {
  grossAreaM2: number;
  grossAreaSqFt: number;
  openingsAreaM2: number;
  openingsAreaSqFt: number;
  netAreaM2: number;
  netAreaSqFt: number;
  /** true when the openings area is larger than the gross wall area */
  openingsExceedWall: boolean;
  wallVolumeM3: number;
  wallVolumeCft: number;
  bricksBeforeWastage: number;
  /** bricks added by wastage (before rounding) */
  wastageBricks: number;
  bricks: number;
  bricksPerSqFt: number;
  bricksPerM2: number;
  /** bricks per cubic foot of wall volume (before wastage) */
  bricksPerCft: number;
  /** cement (kg) needed per 1,000 bricks (before wastage) */
  cementKgPer1000: number;
  /** sand (cft) needed per 1,000 bricks (before wastage) */
  sandCftPer1000: number;
  wetMortarM3: number;
  wetMortarCft: number;
  dryMortarM3: number;
  dryMortarCft: number;
  cementBags: number;
  /** cement in kg = bags × bag size */
  cementKg: number;
  /** bag size used for the bag count */
  cementBagKg: number;
  sandM3: number;
  sandCft: number;
  brickCost: number | null;
  cementCost: number | null;
  sandCost: number | null;
  totalCost: number | null;
  costComplete: boolean;
}

export const M3_TO_CFT = 35.3147;
export const FT_TO_M = 0.3048;
export const CEMENT_BAG_M3 = 0.0347; // 50 kg bag
export const DRY_MORTAR_FACTOR = 1.33;
export const FROG_ALLOWANCE = 1.15; // extra mortar for frog filling

/** Volume of one cement bag in m³ for a given bag size (scales linearly from 0.0347 m³ per 50 kg). */
export function cementBagVolumeM3(bagKg: number): number {
  const kg = bagKg > 0 && isFinite(bagKg) ? bagKg : 50;
  return (kg * CEMENT_BAG_M3) / 50;
}

export function calcBrickwork(inp: BrickInputs): BrickResults {
  const toM = LENGTH_UNIT_TO_M[inp.lengthUnit] ?? 1;
  const L = Math.max(0, inp.length) * toM;
  const H = Math.max(0, inp.height) * toM;
  const thicknessM = Math.max(0, inp.thicknessMm) / 1000;

  const grossAreaM2 = L * H + Math.max(0, inp.extraAreaM2 ?? 0);
  const openingsAreaM2 =
    inp.openingsTotalAreaM2 != null
      ? Math.max(0, inp.openingsTotalAreaM2)
      : inp.openings.reduce(
          (sum, o) =>
            sum +
            Math.max(0, o.count) *
              Math.max(0, o.length) *
              toM *
              Math.max(0, o.height) *
              toM,
          0,
        );
  const openingsExceedWall = grossAreaM2 > 0 && openingsAreaM2 > grossAreaM2;
  const netAreaM2 = Math.max(0, grossAreaM2 - openingsAreaM2);
  const wallVolumeM3 = netAreaM2 * thicknessM;

  const b = inp.brick.id === "custom" && inp.customBrick ? inp.customBrick : inp.brick;
  const jointM = Math.max(0, inp.jointMm) / 1000;
  const brickWithMortarM3 =
    (b.l / 1000 + jointM) * (b.w / 1000 + jointM) * (b.h / 1000 + jointM);
  const brickWithoutMortarM3 = (b.l / 1000) * (b.w / 1000) * (b.h / 1000);

  const bricksBeforeWastage =
    brickWithMortarM3 > 0 ? wallVolumeM3 / brickWithMortarM3 : 0;
  const wastage = Math.max(0, inp.wastagePct) / 100;
  const wastageBricks = bricksBeforeWastage * wastage;
  const bricks = Math.ceil(bricksBeforeWastage * (1 + wastage));

  const volumeOfBricksM3 = bricksBeforeWastage * brickWithoutMortarM3;
  let wetMortarM3 = Math.max(0, wallVolumeM3 - volumeOfBricksM3) * FROG_ALLOWANCE;
  if (!isFinite(wetMortarM3)) wetMortarM3 = 0;
  const dryMortarM3 = wetMortarM3 * DRY_MORTAR_FACTOR * (1 + wastage);

  const [cParts, sParts] = inp.mix;
  const totalParts = cParts + sParts || 1;
  const cementM3 = (dryMortarM3 * cParts) / totalParts;
  const bagKg = inp.cementBagKg != null && inp.cementBagKg > 0 ? inp.cementBagKg : 50;
  const cementBags = Math.ceil(cementM3 / cementBagVolumeM3(bagKg));
  const cementKg = cementBags * bagKg;
  const sandM3 = (dryMortarM3 * sParts) / totalParts;
  const sandCft = sandM3 * M3_TO_CFT;

  const sqFtPerM2 = 1 / (FT_TO_M * FT_TO_M);
  const grossAreaSqFt = grossAreaM2 * sqFtPerM2;
  const openingsAreaSqFt = openingsAreaM2 * sqFtPerM2;
  const netAreaSqFt = netAreaM2 * sqFtPerM2;
  const bricksPerSqFt = netAreaSqFt > 0 ? bricksBeforeWastage / netAreaSqFt : 0;
  const bricksPerM2 = netAreaM2 > 0 ? bricksBeforeWastage / netAreaM2 : 0;
  const wallVolumeCft = wallVolumeM3 * M3_TO_CFT;
  const bricksPerCft = wallVolumeCft > 0 ? bricksBeforeWastage / wallVolumeCft : 0;
  const cementKgPer1000 =
    bricksBeforeWastage > 0 ? (cementKg / bricksBeforeWastage) * 1000 : 0;
  const sandCftPer1000 =
    bricksBeforeWastage > 0 ? (sandCft / bricksBeforeWastage) * 1000 : 0;

  const brickCost =
    inp.rates.brickPer1000 != null ? (bricks / 1000) * inp.rates.brickPer1000 : null;
  const cementCost =
    inp.rates.cementPerBag != null ? cementBags * inp.rates.cementPerBag : null;
  const sandCost =
    inp.rates.sandPerUnit != null
      ? (CURRENCY_META[inp.currency].sandUnit === "cft" ? sandCft : sandM3) *
        inp.rates.sandPerUnit
      : null;
  const parts = [brickCost, cementCost, sandCost].filter(
    (v): v is number => v != null,
  );
  const totalCost = parts.length > 0 ? parts.reduce((a, v) => a + v, 0) : null;

  return {
    grossAreaM2,
    grossAreaSqFt,
    openingsAreaM2,
    openingsAreaSqFt,
    netAreaM2,
    netAreaSqFt,
    openingsExceedWall,
    wallVolumeM3,
    wallVolumeCft,
    bricksBeforeWastage,
    wastageBricks,
    bricks,
    bricksPerSqFt,
    bricksPerM2,
    bricksPerCft,
    cementKgPer1000,
    sandCftPer1000,
    wetMortarM3,
    wetMortarCft: wetMortarM3 * M3_TO_CFT,
    dryMortarM3,
    dryMortarCft: dryMortarM3 * M3_TO_CFT,
    cementBags,
    cementKg,
    cementBagKg: bagKg,
    sandM3,
    sandCft,
    brickCost,
    cementCost,
    sandCost,
    totalCost,
    costComplete: brickCost != null && cementCost != null && sandCost != null,
  };
}

/**
 * Same engine, driven by a known net wall area instead of length x height.
 * Used by the finishes workspace, whose room geometry already produced a
 * net wall area. Mortar is always computed from the PRE-WASTAGE unit count
 * (wall volume minus unit volume), never from the ceiled/wastage count.
 */
export function calcBrickworkFromArea(
  netAreaM2: number,
  thicknessMm: number,
  brick: BrickPreset,
  opts: {
    customBrick?: { l: number; w: number; h: number };
    jointMm?: number;
    wastagePct?: number;
    mix?: [number, number];
    cementBagKg?: number;
    currency?: Currency;
    rates?: BrickRates;
  } = {},
): BrickResults {
  return calcBrickwork({
    length: Math.max(0, netAreaM2),
    height: 1,
    lengthUnit: "m",
    thicknessMm,
    openings: [],
    brick,
    customBrick: opts.customBrick,
    jointMm: opts.jointMm ?? 10,
    wastagePct: opts.wastagePct ?? 5,
    mix: opts.mix ?? [1, 4],
    cementBagKg: opts.cementBagKg ?? 50,
    currency: opts.currency ?? "PKR",
    rates: opts.rates ?? { brickPer1000: null, cementPerBag: null, sandPerUnit: null },
  });
}

export interface BrickWallInput {
  id: string;
  name: string;
  length: number;
  height: number;
  lengthUnit: LengthUnit;
  thicknessMm: number;
  openings: OpeningInput[];
  openingsTotalAreaM2?: number | null;
}

export interface BrickProjectSettings {
  brick: BrickPreset;
  customBrick?: { l: number; w: number; h: number };
  jointMm: number;
  wastagePct: number;
  mix: [number, number];
  cementBagKg?: number;
  currency: Currency;
  rates: BrickRates;
}

export interface BrickProjectResults {
  walls: { wall: BrickWallInput; results: BrickResults }[];
  totals: BrickResults;
  /** true when any wall's openings exceed that wall's area */
  anyOpeningsExceed: boolean;
}

/**
 * Multi-wall room project: run the same engine per wall with one shared set
 * of brick / joint / wastage / mix / rate settings, then total the continuous
 * quantities (areas, volumes, pre-wastage bricks, mortar) and derive the
 * project totals from those sums — so cement bags are rounded up once for
 * the whole project, not once per wall.
 */
export function calcBrickProject(
  walls: BrickWallInput[],
  settings: BrickProjectSettings,
): BrickProjectResults {
  const perWall = walls.map((wall) => ({
    wall,
    results: calcBrickwork({
      length: wall.length,
      height: wall.height,
      lengthUnit: wall.lengthUnit,
      thicknessMm: wall.thicknessMm,
      openings: wall.openings,
      openingsTotalAreaM2: wall.openingsTotalAreaM2,
      brick: settings.brick,
      customBrick: settings.customBrick,
      jointMm: settings.jointMm,
      wastagePct: settings.wastagePct,
      mix: settings.mix,
      cementBagKg: settings.cementBagKg,
      currency: settings.currency,
      rates: settings.rates,
    }),
  }));
  const sum = (pick: (r: BrickResults) => number) =>
    perWall.reduce((a, w) => a + pick(w.results), 0);
  const grossAreaM2 = sum((r) => r.grossAreaM2);
  const openingsAreaM2 = sum((r) => r.openingsAreaM2);
  const netAreaM2 = sum((r) => r.netAreaM2);
  const wallVolumeM3 = sum((r) => r.wallVolumeM3);
  const bricksBeforeWastage = sum((r) => r.bricksBeforeWastage);
  const wastage = Math.max(0, settings.wastagePct) / 100;
  const wastageBricks = bricksBeforeWastage * wastage;
  const bricks = Math.ceil(bricksBeforeWastage * (1 + wastage));
  const wetMortarM3 = sum((r) => r.wetMortarM3);
  const dryMortarM3 = sum((r) => r.dryMortarM3);
  const [cParts, sParts] = settings.mix;
  const totalParts = cParts + sParts || 1;
  const cementM3 = (dryMortarM3 * cParts) / totalParts;
  const bagKg =
    settings.cementBagKg != null && settings.cementBagKg > 0 ? settings.cementBagKg : 50;
  const cementBags = Math.ceil(cementM3 / cementBagVolumeM3(bagKg));
  const cementKg = cementBags * bagKg;
  const sandM3 = (dryMortarM3 * sParts) / totalParts;
  const sandCft = sandM3 * M3_TO_CFT;
  const sqFtPerM2 = 1 / (FT_TO_M * FT_TO_M);
  const netAreaSqFt = netAreaM2 * sqFtPerM2;
  const bricksPerSqFt = netAreaSqFt > 0 ? bricksBeforeWastage / netAreaSqFt : 0;
  const bricksPerM2 = netAreaM2 > 0 ? bricksBeforeWastage / netAreaM2 : 0;
  const wallVolumeCft = wallVolumeM3 * M3_TO_CFT;
  const bricksPerCft = wallVolumeCft > 0 ? bricksBeforeWastage / wallVolumeCft : 0;
  const cementKgPer1000 =
    bricksBeforeWastage > 0 ? (cementKg / bricksBeforeWastage) * 1000 : 0;
  const sandCftPer1000 =
    bricksBeforeWastage > 0 ? (sandCft / bricksBeforeWastage) * 1000 : 0;
  const brickCost =
    settings.rates.brickPer1000 != null ? (bricks / 1000) * settings.rates.brickPer1000 : null;
  const cementCost =
    settings.rates.cementPerBag != null ? cementBags * settings.rates.cementPerBag : null;
  const sandCost =
    settings.rates.sandPerUnit != null
      ? (CURRENCY_META[settings.currency].sandUnit === "cft" ? sandCft : sandM3) *
        settings.rates.sandPerUnit
      : null;
  const costParts = [brickCost, cementCost, sandCost].filter(
    (v): v is number => v != null,
  );
  const totalCost = costParts.length > 0 ? costParts.reduce((a, v) => a + v, 0) : null;
  const totals: BrickResults = {
    grossAreaM2,
    grossAreaSqFt: grossAreaM2 * sqFtPerM2,
    openingsAreaM2,
    openingsAreaSqFt: openingsAreaM2 * sqFtPerM2,
    netAreaM2,
    netAreaSqFt,
    openingsExceedWall: perWall.some((w) => w.results.openingsExceedWall),
    wallVolumeM3,
    wallVolumeCft,
    bricksBeforeWastage,
    wastageBricks,
    bricks,
    bricksPerSqFt,
    bricksPerM2,
    bricksPerCft,
    cementKgPer1000,
    sandCftPer1000,
    wetMortarM3,
    wetMortarCft: wetMortarM3 * M3_TO_CFT,
    dryMortarM3,
    dryMortarCft: dryMortarM3 * M3_TO_CFT,
    cementBags,
    cementKg,
    cementBagKg: bagKg,
    sandM3,
    sandCft,
    brickCost,
    cementCost,
    sandCost,
    totalCost,
    costComplete: brickCost != null && cementCost != null && sandCost != null,
  };
  return {
    walls: perWall,
    totals,
    anyOpeningsExceed: perWall.some((w) => w.results.openingsExceedWall),
  };
}

/**
 * Bricks per unit of wall face for a given thickness and brick (before
 * wastage). Used by the reference table on the page — always computed from
 * the same engine, never hand-typed.
 */
export function bricksPerArea(
  thicknessMm: number,
  brick: BrickPreset,
  opts: { customBrick?: { l: number; w: number; h: number }; jointMm?: number } = {},
): { perSqFt: number; perM2: number; per100SqFt: number; perCft: number } {
  const r = calcBrickworkFromArea(1, thicknessMm, brick, {
    customBrick: opts.customBrick,
    jointMm: opts.jointMm ?? 10,
    wastagePct: 0,
    mix: [1, 4],
  });
  const perCft =
    thicknessMm > 0
      ? r.bricksBeforeWastage / ((thicknessMm / 1000) * M3_TO_CFT)
      : 0;
  return {
    perSqFt: r.bricksPerSqFt,
    perM2: r.bricksPerM2,
    per100SqFt: r.bricksPerSqFt * 100,
    perCft,
  };
}

/**
 * Cement and sand needed per 1 m³ of dry mortar for a mix ratio.
 * Computed from the same constants as the engine (0.0347 m³ per 50 kg bag).
 */
export function mixGuide(mix: [number, number]): {
  cementBagsPerM3Dry: number;
  cementKgPerM3Dry: number;
  sandM3PerM3Dry: number;
} {
  const [cParts, sParts] = mix;
  const totalParts = cParts + sParts || 1;
  const cementBagsPerM3Dry = cParts / totalParts / CEMENT_BAG_M3;
  return {
    cementBagsPerM3Dry,
    cementKgPerM3Dry: cementBagsPerM3Dry * 50,
    sandM3PerM3Dry: sParts / totalParts,
  };
}

/**
 * Reverse mode: how much wall area does a quantity of bricks cover?
 * Inverts the exact volume method — area = bricks × brick-with-mortar
 * volume ÷ thickness — so it agrees with the forward calculator.
 */
export function reverseBricksToArea(
  bricks: number,
  thicknessMm: number,
  brick: BrickPreset,
  opts: { customBrick?: { l: number; w: number; h: number }; jointMm?: number } = {},
): { areaM2: number; areaSqFt: number; bricksPerSqFt: number; bricksPerM2: number } {
  const b = brick.id === "custom" && opts.customBrick ? opts.customBrick : brick;
  const jointM = Math.max(0, opts.jointMm ?? 10) / 1000;
  const brickWithMortarM3 =
    (b.l / 1000 + jointM) * (b.w / 1000 + jointM) * (b.h / 1000 + jointM);
  const thicknessM = Math.max(0, thicknessMm) / 1000;
  const areaM2 =
    thicknessM > 0 && brickWithMortarM3 > 0
      ? (Math.max(0, bricks) * brickWithMortarM3) / thicknessM
      : 0;
  const per = bricksPerArea(thicknessMm, brick, opts);
  return {
    areaM2,
    areaSqFt: areaM2 / (FT_TO_M * FT_TO_M),
    bricksPerSqFt: per.perSqFt,
    bricksPerM2: per.perM2,
  };
}

export interface BudgetResult {
  /** bricks needed for the area (to order, with wastage) */
  bricks: number;
  bricksBeforeWastage: number;
  /** budget ÷ net wall area */
  pricePerSqFt: number | null;
  pricePerM2: number | null;
  /** budget ÷ bricks to order × 1,000 */
  pricePer1000: number | null;
  /** bricks the budget buys at the entered brick rate (null when no rate) */
  bricksAffordable: number | null;
  /** material cost of the bricks needed, at the entered rate (null when no rate) */
  bricksCost: number | null;
  netAreaSqFt: number;
  netAreaM2: number;
}

/**
 * Budget mode: a wall area and a budget → what the budget buys per sq ft
 * and per 1,000 bricks, and how many bricks the budget covers at the
 * entered brick rate. Quantities come from the same engine as the forward
 * calculator; only the money is divided up differently.
 */
export function budgetMode(
  netAreaM2: number,
  budget: number,
  thicknessMm: number,
  brick: BrickPreset,
  opts: {
    customBrick?: { l: number; w: number; h: number };
    jointMm?: number;
    wastagePct?: number;
    mix?: [number, number];
    currency?: Currency;
    rates?: BrickRates;
  } = {},
): BudgetResult {
  const results = calcBrickworkFromArea(Math.max(0, netAreaM2), thicknessMm, brick, {
    customBrick: opts.customBrick,
    jointMm: opts.jointMm ?? 10,
    wastagePct: opts.wastagePct ?? 5,
    mix: opts.mix ?? [1, 4],
    currency: opts.currency ?? "PKR",
    rates: opts.rates ?? { brickPer1000: null, cementPerBag: null, sandPerUnit: null },
  });
  const b = Math.max(0, budget);
  const per1000 = opts.rates?.brickPer1000;
  return {
    bricks: results.bricks,
    bricksBeforeWastage: results.bricksBeforeWastage,
    pricePerSqFt: results.netAreaSqFt > 0 ? b / results.netAreaSqFt : null,
    pricePerM2: results.netAreaM2 > 0 ? b / results.netAreaM2 : null,
    pricePer1000: results.bricks > 0 ? (b / results.bricks) * 1000 : null,
    bricksAffordable:
      per1000 != null && per1000 > 0 ? Math.floor(b / (per1000 / 1000)) : null,
    bricksCost: results.brickCost,
    netAreaSqFt: results.netAreaSqFt,
    netAreaM2: results.netAreaM2,
  };
}

export interface PackingResult {
  packSize: number;
  /** full packs to order (rounded up) */
  packs: number;
  /** spare bricks inside the last pack */
  spareBricks: number;
  palletSize: number;
  /** pallets to order (rounded up) */
  pallets: number;
  truckCapacity: number | null;
  /** truckloads to order, null when no capacity entered or not needed */
  trucks: number | null;
}

/**
 * Packs / pallets / trucks to order. Pack and pallet sizes are editable —
 * they vary by supplier (UK/US packs commonly run 400–520 bricks; a
 * pallet is commonly about 400–550). Trucks only appear when the user
 * enters a truck capacity, because lorry loads vary too much to assume.
 */
export function packingFor(
  bricks: number,
  opts: { packSize?: number; palletSize?: number; truckCapacity?: number | null } = {},
): PackingResult {
  const n = Math.max(0, Math.ceil(bricks));
  const packSize = opts.packSize != null && opts.packSize > 0 ? Math.floor(opts.packSize) : 500;
  const palletSize =
    opts.palletSize != null && opts.palletSize > 0 ? Math.floor(opts.palletSize) : 500;
  const truckCapacity =
    opts.truckCapacity != null && opts.truckCapacity > 0
      ? Math.floor(opts.truckCapacity)
      : null;
  const packs = Math.ceil(n / packSize);
  return {
    packSize,
    packs,
    spareBricks: packs * packSize - n,
    palletSize,
    pallets: Math.ceil(n / palletSize),
    truckCapacity,
    trucks: truckCapacity != null && n >= truckCapacity ? Math.ceil(n / truckCapacity) : null,
  };
}

export type LabourBasis = "perSqFt" | "per1000" | "perDay";

/** Optional labour cost — off by default; the materials total is unchanged. */
export function calcLabourCost(args: {
  netAreaSqFt: number;
  bricks: number;
  basis: LabourBasis;
  rate: number | null;
  days?: number;
}): number | null {
  const { basis, rate } = args;
  if (rate == null || !isFinite(rate) || rate < 0) return null;
  if (basis === "perSqFt") return rate * Math.max(0, args.netAreaSqFt);
  if (basis === "per1000") return (rate * Math.max(0, args.bricks)) / 1000;
  return rate * Math.max(0, args.days ?? 0);
}

/** Persistent rate strip: per-cubic-foot rates for the current wall + mix. */
export function rateStrip(results: BrickResults): {
  bricksPerCft: number;
  cementBagsPerCft: number;
  sandCftPerCft: number;
} {
  const vol = results.wallVolumeCft;
  if (!(vol > 0)) return { bricksPerCft: 0, cementBagsPerCft: 0, sandCftPerCft: 0 };
  return {
    bricksPerCft: results.bricksBeforeWastage / vol,
    cementBagsPerCft: results.cementBags / vol,
    sandCftPerCft: results.sandCft / vol,
  };
}

/** Default worked example shown on load: 10 ft x 10 ft, 9" wall, 5% wastage. */
export function defaultBrickInputs(currency: Currency = "PKR"): BrickInputs {
  return {
    length: 10,
    height: 10,
    lengthUnit: "ft",
    thicknessMm: 230,
    openings: [],
    brick: BRICK_PRESETS[0],
    jointMm: 10,
    wastagePct: 5,
    mix: [1, 4],
    cementBagKg: 50,
    currency,
    rates: { brickPer1000: null, cementPerBag: null, sandPerUnit: null },
  };
}

export function formatMoney(value: number | null, currency: Currency): string {
  if (value == null || !isFinite(value)) return "—";
  const { symbol } = CURRENCY_META[currency];
  const rounded = Math.round(value);
  return `${symbol} ${rounded.toLocaleString("en-US")}`;
}

export function formatInt(value: number): string {
  if (!isFinite(value)) return "0";
  return Math.round(value).toLocaleString("en-US");
}

/** FAQ content — shared by the page content and the FAQPage JSON-LD. */
export interface FaqItem {
  q: string;
  a: string;
}

export const BRICK_FAQS: FaqItem[] = [
  {
    q: "How many bricks are needed for a 9-inch wall?",
    a: "About 8.7 bricks per square foot of wall face (about 11.6 bricks per cubic foot) for a 9-inch wall built with standard 230 × 110 × 75 mm bricks and 10 mm mortar joints, before wastage. The commonly quoted rule of 9 per square foot rounds that up slightly, which is safe. A 10 ft × 10 ft wall therefore needs about 873 bricks before wastage, or about 917 bricks after adding 5% wastage. Measure your own bricks first — kiln sizes vary, and a smaller brick means more bricks per square foot.",
  },
  {
    q: "What is the standard brick size in Pakistan?",
    a: "The standard brick in Pakistan is 9 inches × 4½ inches × 3 inches (nominally 230 × 115 × 75 mm). A common variant is 9\" × 4½\" × 2¾\". In India the IS 1077 modular size is 190 × 90 × 90 mm and the non-modular size is 230 × 110 × 70 mm. In the UAE the usual clay brick is 215 × 102.5 × 65 mm (BS EN 771-1). Always estimate with the nominal size — the brick plus one mortar joint — not the bare brick size.",
  },
  {
    q: "How is the number of bricks calculated?",
    a: "Divide the volume of the wall by the volume of one brick including its mortar joint: bricks = (length × height × thickness) ÷ ((brick length + joint) × (brick width + joint) × (brick height + joint)). Then add wastage of 5–10%. Openings for doors and windows are deducted from the wall area first. This calculator shows every step so you can check the maths.",
  },
  {
    q: "How much wastage should I add for bricks?",
    a: "Add 5% for good-quality machine-made or well-burnt Awwal bricks on a straightforward wall, and 10% for hand-made kiln bricks, curved or cut work, or walls with many openings. This calculator applies the same percentage to mortar. Ordering too little stops work; ordering far too much wastes money, so 5% is a good default for a normal rectangular wall.",
  },
  {
    q: "How many cement bags are needed for brickwork?",
    a: "It depends on the wall volume and the mortar mix. As a rule of thumb, one cubic foot of 9-inch brickwork needs about 0.06 bags of 50 kg cement at a 1:4 mix and about 0.07 bags at a 1:3 mix (both including 5% wastage). The calculator works it out exactly: it finds the wet mortar volume, converts it to dry volume (× 1.33), splits it by your mix ratio, and divides the cement volume by 0.0347 m³ per bag, rounding up.",
  },
  {
    q: "Which mortar mix ratio is best for brickwork?",
    a: "Use 1:4 (one part cement to four parts sand) for general brickwork, 1:3 for load-bearing walls and foundations where extra strength matters, and 1:6 for partition walls and non-load-bearing work. A richer mix costs more and shrinks more; a leaner mix is weaker. Never go leaner than 1:6 for structural brickwork.",
  },
  {
    q: "How many bricks are needed for a 5 marla house?",
    a: "A double-storey 5 marla house (about 1,125 sq ft plot) typically needs roughly 35,000–45,000 bricks for the grey structure, depending on the covered area, wall thickness and number of openings. The exact number comes from the wall areas, not from a thumb rule — enter your wall lengths in the calculator, or use the plot-size table on this page as a starting point and confirm it against your drawings.",
  },
  {
    q: "What is the brick price per 1,000 in Pakistan in 2026?",
    a: "Indicative November 2026 rates: Awwal (first-class) bricks run about PKR 16,500–23,000 per 1,000 depending on the city — the Pakistan Bureau of Statistics August 2026 survey recorded Lahore at PKR 23,355, Islamabad at PKR 27,016 and Karachi at PKR 22,000 per 1,000. Doam (second-class) bricks are about PKR 12,000–17,000 per 1,000. Rates change with season, transport and order size, so confirm with your local kiln before ordering. This calculator lets you enter your own rate.",
  },
  {
    q: "Do I deduct doors and windows from brick quantity?",
    a: "Yes. Deduct the full area of every opening from the gross wall area before calculating volume — a door or window is a hole, not brickwork. This calculator has a dedicated openings section: add each door and window with its size and count. As a cross-check, standard quantity-surveying practice also says openings under 0.5 sq m need no deduction for plastering, but for brick quantity, deduct every opening.",
  },
  {
    q: "Are these brick quantities exact?",
    a: "They are planning estimates, not a quotation. The maths is exact for the sizes you enter, but real bricks vary in size from kiln to kiln, mortar joints are never perfectly 10 mm, and breakage happens on site — which is why wastage is included. Always confirm the final order with your quantity surveyor or contractor, and order from a kiln whose bricks you have measured.",
  },
  {
    q: "How many bricks are in 1 square foot of a 9-inch wall?",
    a: "Exactly about 8.7 bricks per square foot of wall face for a 9-inch wall built with standard 230 × 110 × 75 mm bricks and a 10 mm mortar joint, before wastage — 873 bricks per 100 sq ft. The commonly quoted rule of 9 per square foot rounds that up slightly, which is safe to order by. For a 4½-inch wall the exact figure is about 4.4 per square foot, for a 13½-inch wall about 13.1, and for an 18-inch wall about 17.3. The table on this page lists all four, exact and thumb rule side by side.",
  },
  {
    q: "What is the difference between stretcher, English and Flemish bond?",
    a: "Stretcher bond lays every brick long-face out — it is for single-leaf (4½-inch) walls only and is the fastest to lay. English bond alternates whole courses of stretchers and headers, and is the strongest common bond for 9-inch walls. Flemish bond alternates a stretcher and a header in every course, giving a decorative chequered face with the same strength class as English for 9-inch walls. The bond changes the look of the wall, not the brick count — the volume of brickwork is the same either way, so this calculator's count is identical for all three.",
  },
  {
    q: "How do I calculate bricks for a curved wall?",
    a: "Measure the wall along its centre line: length = average radius × angle in radians (for a full circle, 2 × π × average radius), then height and thickness as usual. Enter that length in the calculator. Add 10–15% wastage instead of the usual 5%, because curved work needs many cut bricks and produces more breakage. If the curve is gentle, a straight-wall estimate using the centre-line length is close enough for ordering.",
  },
  {
    q: "How many bricks will I need for a wall of a given area?",
    a: "Use the Total Wall Area mode in the calculator: enter the net wall area (in sq ft or m²) and the wall thickness, and it gives the brick count directly — no length and height needed. As a check, multiply the area by the per-square-foot rate for your thickness: about 8.7 bricks per sq ft for a 9-inch wall (9 as a safe thumb rule), 4.4 for a 4½-inch wall. Going the other way, a quantity of bricks covers area = bricks ÷ bricks-per-square-foot — for example, 1,000 bricks cover about 115 sq ft of 9-inch wall before wastage.",
  },
  {
    q: "How many packs or pallets of bricks should I order?",
    a: "Bricks are delivered in packs, not loose — so order packs, not individual bricks. This calculator converts your brick count into packs (default 500 per pack, editable — UK and US packs commonly run 400–520), pallets and, where the count justifies it, truckloads. For example, 917 bricks need 2 packs of 500, leaving 83 spare bricks in the second pack. Always confirm the pack size with your supplier before ordering, because it varies by kiln and merchant.",
  },
  {
    q: "Does the calculator include labour cost?",
    a: "Labour is optional and off by default, because the headline total is materials only. Turn it on to add a labour rate per square foot, per 1,000 bricks or per day — the total then reads materials plus labour. As a guide, UK bricklayers charge about £400–700 in labour per 1,000 bricks laid (Q3 2026) and US masons about $1,500–2,000 per 1,000 (2026 guides); in Pakistan, India and the UAE, enter your mason's own rate, since no verified per-1,000 labour rate was found for those markets.",
  },
  {
    q: "How much wall area will my bricks cover?",
    a: "Use the Reverse mode: enter the number of bricks and the wall thickness, and it tells you the wall area they cover — 1,000 standard Pakistani bricks cover about 115 sq ft of 9-inch wall (about 10.7 m²) before wastage, or about 109 sq ft after 5% wastage. It uses the same exact volume method as the forward calculator, so the two modes always agree.",
  },
  {
    q: "How do I work out bricks from a budget?",
    a: "Use the Budget mode: enter the wall area and your budget, and it gives the price per square foot and per 1,000 bricks your budget allows, plus how many bricks the budget buys at your entered brick rate. For example, a PKR 20,000 budget for 100 sq ft of 9-inch wall allows PKR 200 per sq ft, or about PKR 21,800 per 1,000 bricks to order — and at PKR 20,000 per 1,000, that budget buys 1,000 bricks. The brick count itself still comes from the wall area, not from the money.",
  },
  {
    q: "How do I calculate bricks for a gable end or a curved wall?",
    a: "For a gable end, enter the wall's length and height as usual, then add the triangle: base × rise ÷ 2. A 10 ft wide gable with a 3 ft rise adds 15 sq ft of brickwork — about 131 extra bricks for a 9-inch wall before wastage — and 10% wastage instead of 5%, because of the cut bricks. For a curved wall, measure along the centre line: length = average radius × angle in radians (a full circle is 2 × π × radius), then use 10–15% wastage. The calculator has a gable input and a curved-wall input that do both calculations for you.",
  },
  {
    q: "What is the standard brick size in the UK, and how many bricks per square metre?",
    a: "The UK standard clay brick is 215 × 102.5 × 65 mm (BS EN 771-1). A single-leaf wall needs about 60 bricks per square metre of wall face — 1 ÷ ((215 + 10) × (65 + 10) mm) — or about 5.6 per square foot. UK bricks are sold in packs of about 400–520, cement comes in 25 kg bags (not 50 kg), and facing bricks run about £400–900 per 1,000 (Q3 2026 guides). For a single leaf, work from the 60-per-m² face figure; a UK cavity wall is two leaves, so calculate each leaf separately.",
  },
  {
    q: "What is the standard brick size in the US, and what do bricks cost there?",
    a: "The US standard brick is 7½″ × 3½″ × 2¼″ (190.5 × 88.9 × 57.2 mm), and the US modular face brick is 7⅝″ × 3⅝″ × 2¼″. US face brickwork needs about 6.6–6.9 bricks per square foot of single-leaf face with a 3/8-inch joint. Standard clay bricks cost about $350–850 per 1,000 in 2026, averaging about $550 (Angi, July 2026). US cement is sold in 94 lb (42.6 kg) bags, so the calculator defaults to a 42.6 kg bag when USD is selected.",
  },
];
