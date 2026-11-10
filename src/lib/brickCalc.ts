/**
 * Brick calculator engine — pure functions, no React.
 * Standard quantity-surveying method, same family as the repo's existing
 * Brickwork9InchModule: N = V_wall / V_brick_with_mortar; dry mortar = wet x 1.33;
 * 50 kg cement bag = 0.0347 m3. All calculations are done in metric internally.
 *
 * Rates are INDICATIVE defaults (Nov 2026, sources noted in brickProgrammatic.ts).
 * They are editable in the UI and must be confirmed with a local supplier.
 */

export type Currency = "PKR" | "INR" | "AED";

export const CURRENCY_META: Record<
  Currency,
  { symbol: string; label: string; sandUnit: "cft" | "m3" }
> = {
  PKR: { symbol: "Rs", label: "Pakistani Rupee", sandUnit: "cft" },
  INR: { symbol: "₹", label: "Indian Rupee", sandUnit: "cft" },
  AED: { symbol: "AED", label: "UAE Dirham", sandUnit: "m3" },
};

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
    id: "uae-clay",
    label: "UAE clay brick — 215 × 102.5 × 65 mm",
    l: 215,
    w: 102.5,
    h: 65,
    standard: "BS EN 771-1 (British size, used across the Gulf)",
    note: "Clay bricks in the UAE are mostly imported. Concrete blocks are the common local walling unit.",
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
  { id: "tcustom", label: "Custom thickness", mm: 230, use: "Enter your wall thickness" },
];

export interface OpeningInput {
  id: string;
  kind: "door" | "window" | "other";
  /** length in the wall's length unit (m or ft) */
  length: number;
  height: number;
  count: number;
}

export interface BrickRates {
  /** price per 1,000 bricks; null = unknown, user must enter */
  brickPer1000: number | null;
  /** price per 50 kg cement bag; null = unknown */
  cementPerBag: number | null;
  /** price per sand unit (cft for PKR/INR, m3 for AED); null = unknown */
  sandPerUnit: number | null;
}

export interface BrickInputs {
  /** wall length in lengthUnit */
  length: number;
  /** wall height in lengthUnit */
  height: number;
  /** "m" or "ft" */
  lengthUnit: "m" | "ft";
  /** wall thickness in mm */
  thicknessMm: number;
  openings: OpeningInput[];
  brick: BrickPreset;
  /** custom brick size in mm (used when brick.id === "custom") */
  customBrick?: { l: number; w: number; h: number };
  /** mortar joint thickness in mm */
  jointMm: number;
  /** wastage percent applied to bricks and mortar */
  wastagePct: number;
  /** cement : sand parts, e.g. [1, 4] */
  mix: [number, number];
  currency: Currency;
  rates: BrickRates;
}

export interface BrickResults {
  grossAreaM2: number;
  openingsAreaM2: number;
  netAreaM2: number;
  wallVolumeM3: number;
  bricksBeforeWastage: number;
  bricks: number;
  bricksPerSqFt: number;
  bricksPerM2: number;
  wetMortarM3: number;
  dryMortarM3: number;
  cementBags: number;
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

export function calcBrickwork(inp: BrickInputs): BrickResults {
  const toM = inp.lengthUnit === "ft" ? FT_TO_M : 1;
  const L = Math.max(0, inp.length) * toM;
  const H = Math.max(0, inp.height) * toM;
  const thicknessM = Math.max(0, inp.thicknessMm) / 1000;

  const grossAreaM2 = L * H;
  const openingsAreaM2 = inp.openings.reduce(
    (sum, o) => sum + Math.max(0, o.count) * Math.max(0, o.length) * toM * Math.max(0, o.height) * toM,
    0,
  );
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
  const bricks = Math.ceil(bricksBeforeWastage * (1 + wastage));

  const volumeOfBricksM3 = bricksBeforeWastage * brickWithoutMortarM3;
  let wetMortarM3 = Math.max(0, wallVolumeM3 - volumeOfBricksM3) * FROG_ALLOWANCE;
  if (!isFinite(wetMortarM3)) wetMortarM3 = 0;
  const dryMortarM3 = wetMortarM3 * DRY_MORTAR_FACTOR * (1 + wastage);

  const [cParts, sParts] = inp.mix;
  const totalParts = cParts + sParts || 1;
  const cementM3 = (dryMortarM3 * cParts) / totalParts;
  const cementBags = Math.ceil(cementM3 / CEMENT_BAG_M3);
  const sandM3 = (dryMortarM3 * sParts) / totalParts;
  const sandCft = sandM3 * M3_TO_CFT;

  const netAreaSqFt = netAreaM2 / (FT_TO_M * FT_TO_M);
  const bricksPerSqFt = netAreaSqFt > 0 ? bricksBeforeWastage / netAreaSqFt : 0;
  const bricksPerM2 = netAreaM2 > 0 ? bricksBeforeWastage / netAreaM2 : 0;

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
    openingsAreaM2,
    netAreaM2,
    wallVolumeM3,
    bricksBeforeWastage,
    bricks,
    bricksPerSqFt,
    bricksPerM2,
    wetMortarM3,
    dryMortarM3,
    cementBags,
    sandM3,
    sandCft,
    brickCost,
    cementCost,
    sandCost,
    totalCost,
    costComplete: brickCost != null && cementCost != null && sandCost != null,
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
];
