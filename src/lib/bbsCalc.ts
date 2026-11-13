/**
 * Bar Bending Schedule (BBS) engine — pure functions, no React.
 * (brickCalc.ts pattern.)
 *
 * Canonical rules (G3 spec + repo AGENTS.md + steelCalc.ts):
 * - Unit weight: W = d^2 / 162.28 kg/m, always via steelCalc.ts.
 * - Rectangular stirrup, IS 2502 detailed form (canonical):
 *   L = 2(A+B) + 2*10d - (3*2d + 2*3d), A/B = inner dims (section - 2*cover).
 * - Field shortcut 2(A+B) + 24d reads ~10.3% HIGHER (demo 1.372 m vs
 *   1.244 m) because it counts the full hook allowance without deducting
 *   bend shortening. It is shown as a labelled approximation only — the
 *   schedule itself always uses the detailed form.
 * - Spiral / helix length is defined ONCE here (helixTurnLengthMm +
 *   spiralLengthMm) and cageCalc.ts imports it, so BBS and Cage can never
 *   diverge again. (steelCalc.ts has no helix export and is read-only.)
 * - Stock bar 12 m (or 40 ft = 12.192 m); bars to order = ceil(total/stock).
 * - Rates: PKR 270/kg indicative Nov 2026 ("confirm with your dealer");
 *   INR/AED/USD null — never invent a rate, cost shows "—" until entered.
 */

import {
  unitWeightKgPerM,
  barsToOrder,
  applyWastage,
  costFor,
  stirrupLengthDetailed,
  stirrupLengthSimple,
  STOCK_BAR_M,
  STOCK_BAR_FT_M,
  STOCK_BAR_FT_WARNING,
  BAR_GRADES,
  STEEL_RATE_DEFAULTS,
  STEEL_RATE_LABEL,
  formatSteelMoney,
  type SteelCurrency,
} from "./steelCalc";

export { BAR_GRADES, STEEL_RATE_DEFAULTS, STEEL_RATE_LABEL, formatSteelMoney, STOCK_BAR_FT_WARNING };
export type { SteelCurrency };

export const STANDARD_DIAS = [6, 8, 10, 12, 16, 20, 25, 28, 32];

export type BbsShape =
  | "straight"
  | "l-hook"
  | "u-hook"
  | "cranked"
  | "rect-stirrup"
  | "u-stirrup"
  | "spiral"
  | "circular-ring";

export type HookStandard = "IS 2502" | "ACI 315" | "BS 8666";

export const BBS_SHAPES: { id: BbsShape; label: string }[] = [
  { id: "straight", label: "Straight Bar" },
  { id: "l-hook", label: "L-Hook Bar (90°)" },
  { id: "u-hook", label: "U-Hook Bar (180°)" },
  { id: "cranked", label: "Cranked Slab Bar" },
  { id: "rect-stirrup", label: "Rectangular Stirrup" },
  { id: "u-stirrup", label: "U-Stirrup" },
  { id: "spiral", label: "Spiral Reinforcement" },
  { id: "circular-ring", label: "Circular Ring" },
];

export const HOOK_STANDARDS: HookStandard[] = ["IS 2502", "ACI 315", "BS 8666"];

/**
 * Hook allowance (× dia) and bend deductions (× dia) per standard.
 * Bend deductions follow the IS 2502 table (45°=1d, 90°=2d, 135°=3d,
 * 180°=4d) for all three standards; the hook allowance is what varies
 * (ACI 315 standard hooks use 12d). The UI states this explicitly.
 */
export const HOOK_TABLE: Record<
  HookStandard,
  { hookXd: number; bend45: number; bend90: number; bend135: number; bend180: number }
> = {
  "IS 2502": { hookXd: 10, bend45: 1, bend90: 2, bend135: 3, bend180: 4 },
  "ACI 315": { hookXd: 12, bend45: 1, bend90: 2, bend135: 3, bend180: 4 },
  "BS 8666": { hookXd: 10, bend45: 1, bend90: 2, bend135: 3, bend180: 4 },
};

export const COVER_PRESETS: { id: string; label: string; coverMm: number }[] = [
  { id: "beam", label: "Beam — 25 mm", coverMm: 25 },
  { id: "column", label: "Column — 40 mm", coverMm: 40 },
  { id: "slab", label: "Slab — 20 mm", coverMm: 20 },
  { id: "footing", label: "Footing — 50 mm", coverMm: 50 },
  { id: "footing-soil", label: "Footing against soil — 75 mm", coverMm: 75 },
];

/** Length of one turn of a helix: sqrt((pi * coreDia)^2 + pitch^2). */
export function helixTurnLengthMm(coreDiaMm: number, pitchMm: number): number {
  return Math.sqrt(Math.pow(Math.PI * coreDiaMm, 2) + Math.pow(pitchMm, 2));
}

/**
 * Total helix length for a cage/column of height `lengthMm`.
 * turns = floor(length/pitch) + 1 (integer — the count and the length use
 * the SAME turn count, fixing the old CageEstimator mismatch where the
 * displayed count was ceil(L/p+1) but the length used L/p turns).
 * `endAllowanceMm` is the caller's convention: BBS spirals add 2 hook
 * lengths (2*10d); pile cages add 2 flat end turns (2*pi*coreDia).
 */
export function spiralLengthMm(
  coreDiaMm: number,
  pitchMm: number,
  lengthMm: number,
  endAllowanceMm: number,
): { turns: number; turnLengthMm: number; lengthMm: number } {
  const turns = Math.floor(lengthMm / pitchMm) + 1;
  const turnLengthMm = helixTurnLengthMm(coreDiaMm, pitchMm);
  return { turns, turnLengthMm, lengthMm: turns * turnLengthMm + endAllowanceMm };
}

export interface BbsRowInput {
  member: string;
  shape: BbsShape;
  diaMm: number;
  /** no. of identical members (e.g. 25 stirrups in one beam) */
  members: number;
  /** bars per member */
  barsPerMember: number;
  coverMm: number;
  hookStandard: HookStandard;
  /** lap length as a multiple of dia (0 = none), default 50 */
  lapX: number;
  spanMm?: number;
  widthMm?: number;
  depthMm?: number;
  slabThicknessMm?: number;
  cranks?: number;
  colDiaMm?: number;
  pitchMm?: number;
  heightMm?: number;
}

export interface BbsRowResult extends BbsRowInput {
  cutLengthMm: number;
  cutLengthM: number;
  /** lap length added to EACH bar, mm (0 when the cut length fits one stock bar) */
  lapLengthPerBarMm: number;
  lapsPerBar: number;
  totalLengthM: number;
  weightKg: number;
  unitWeightKgPerM: number;
  barsToOrderCount: number;
  /** substituted arithmetic shown under "How it was calculated" */
  formula: string;
  /** field-shortcut comparison, only for rectangular stirrups */
  fieldApproxNote?: string;
}

const isInt = (n: number) => Number.isInteger(n);
const round2 = (n: number) => Math.round(n * 100) / 100;

export function validateBbsRow(inp: Partial<BbsRowInput>): string[] {
  const errors: string[] = [];
  if (!inp.member || !inp.member.trim()) errors.push("Member / mark is required — e.g. B1, C2, Main Bar.");
  if (!inp.shape) errors.push("Choose a bar shape.");
  if (inp.diaMm == null || !STANDARD_DIAS.includes(inp.diaMm))
    errors.push("Bar diameter must be one of 6, 8, 10, 12, 16, 20, 25, 28, 32 mm.");
  if (inp.members == null || !isFinite(inp.members) || !isInt(inp.members) || inp.members < 1)
    errors.push("No. of members must be a whole number, 1 or more.");
  if (inp.barsPerMember == null || !isFinite(inp.barsPerMember) || !isInt(inp.barsPerMember) || inp.barsPerMember < 1)
    errors.push("Bars per member must be a whole number, 1 or more — whole bars only.");
  if (inp.coverMm == null || !isFinite(inp.coverMm) || inp.coverMm < 10 || inp.coverMm > 75)
    errors.push("Cover must be 10–75 mm (beam 25, column 40, slab 20, footing 50/75).");
  if (inp.lapX != null && (!isFinite(inp.lapX) || inp.lapX < 0 || inp.lapX > 100))
    errors.push("Lap length must be 0–100 × dia (50d is standard, 0 = no lap).");

  const dim = (v: number | undefined, label: string, min = 50, max = 12000) => {
    if (v == null || !isFinite(v) || v < min || v > max)
      errors.push(`${label} must be ${min}–${max} mm.`);
  };
  const shape = inp.shape;
  if (shape === "straight" || shape === "l-hook" || shape === "u-hook" || shape === "cranked")
    dim(inp.spanMm, "Length / span", 50, 60000);
  if (shape === "rect-stirrup" || shape === "u-stirrup") {
    dim(inp.widthMm, "Section width");
    dim(inp.depthMm, "Section depth");
    if (
      inp.widthMm != null && inp.depthMm != null && inp.coverMm != null && inp.diaMm != null &&
      (2 * inp.coverMm + inp.diaMm >= inp.widthMm || 2 * inp.coverMm + inp.diaMm >= inp.depthMm)
    )
      errors.push("Cover + bar dia exceeds the section — increase the section or reduce the cover.");
  }
  if (shape === "cranked") {
    dim(inp.slabThicknessMm, "Slab thickness", 50, 1000);
    if (inp.cranks == null || !isInt(inp.cranks) || inp.cranks < 1 || inp.cranks > 4)
      errors.push("No. of cranks must be a whole number, 1–4.");
    if (
      inp.slabThicknessMm != null && inp.coverMm != null && inp.diaMm != null &&
      inp.slabThicknessMm - 2 * inp.coverMm - inp.diaMm <= 0
    )
      errors.push("Crank height is zero or negative — slab thickness must exceed 2 × cover + bar dia.");
  }
  if (shape === "spiral" || shape === "circular-ring") {
    dim(inp.colDiaMm, "Column / pile diameter", 100, 3000);
    if (
      inp.colDiaMm != null && inp.coverMm != null && inp.diaMm != null &&
      inp.colDiaMm - 2 * inp.coverMm - inp.diaMm <= 0
    )
      errors.push("Cover + bar dia exceeds the column dia — increase the dia or reduce the cover.");
  }
  if (shape === "spiral") {
    dim(inp.pitchMm, "Pitch", 50, 300);
    dim(inp.heightMm, "Height", 50, 60000);
  }
  return errors;
}

/** Cutting length (mm) for one bar, before laps. Returns 0 when inputs are invalid. */
export function cutLengthMm(inp: BbsRowInput): { lengthMm: number; formula: string; fieldApproxNote?: string } {
  const d = inp.diaMm;
  const c = inp.coverMm;
  const t = HOOK_TABLE[inp.hookStandard] ?? HOOK_TABLE["IS 2502"];
  const hook = t.hookXd * d;
  switch (inp.shape) {
    case "straight": {
      const s = inp.spanMm ?? 0;
      return { lengthMm: s, formula: `L = span = ${s} mm` };
    }
    case "l-hook": {
      const s = inp.spanMm ?? 0;
      const l = s + 2 * hook - 2 * (t.bend90 * d);
      return { lengthMm: l, formula: `L = ${s} + 2×${t.hookXd}d − 2×${t.bend90}d = ${s} + ${2 * hook} − ${2 * t.bend90 * d} = ${l} mm` };
    }
    case "u-hook": {
      const s = inp.spanMm ?? 0;
      const l = s + 2 * hook - 2 * (t.bend180 * d);
      return { lengthMm: l, formula: `L = ${s} + 2×${t.hookXd}d − 2×${t.bend180}d = ${s} + ${2 * hook} − ${2 * t.bend180 * d} = ${l} mm` };
    }
    case "cranked": {
      const s = inp.spanMm ?? 0;
      const th = inp.slabThicknessMm ?? 0;
      const n = inp.cranks ?? 2;
      const h = th - 2 * c - d;
      const perCrank = 0.42 * h - 2 * t.bend45 * d;
      const l = s + n * perCrank + 2 * hook - 2 * (t.bend90 * d);
      return {
        lengthMm: l,
        formula: `h = ${th} − 2×${c} − ${d} = ${h} mm; per crank 0.42×${h} − 2×${t.bend45}d = ${perCrank.toFixed(2)} mm; L = ${s} + ${n}×${perCrank.toFixed(2)} + ${2 * hook} − ${2 * t.bend90 * d} = ${l.toFixed(2)} mm`,
      };
    }
    case "rect-stirrup": {
      const a = (inp.widthMm ?? 0) - 2 * c;
      const b = (inp.depthMm ?? 0) - 2 * c;
      const l = stirrupLengthDetailed(a, b, d, hook);
      const simple = stirrupLengthSimple(a, b, d);
      return {
        lengthMm: l,
        formula: `A = ${inp.widthMm} − 2×${c} = ${a} mm; B = ${inp.depthMm} − 2×${c} = ${b} mm; L = 2(${a}+${b}) + 2×${t.hookXd}d − (3×${t.bend90}d + 2×${t.bend135}d) = ${l} mm (IS 2502 detailed form)`,
        fieldApproxNote: `Field shortcut 2(A+B)+24d gives ${(simple / 1000).toFixed(3)} m — ${(((simple - l) / l) * 100).toFixed(1)}% higher, because it counts the full hook allowance without deducting bend shortening. This schedule uses the IS 2502 detailed form above.`,
      };
    }
    case "u-stirrup": {
      const a = (inp.widthMm ?? 0) - 2 * c;
      const b = (inp.depthMm ?? 0) - 2 * c;
      const l = a + 2 * b + 2 * hook - 2 * (t.bend90 * d);
      return { lengthMm: l, formula: `A = ${a} mm; B = ${b} mm; L = ${a} + 2×${b} + 2×${t.hookXd}d − 2×${t.bend90}d = ${l} mm` };
    }
    case "spiral": {
      const core = (inp.colDiaMm ?? 0) - 2 * c - d;
      const { turns, turnLengthMm, lengthMm: l } = spiralLengthMm(core, inp.pitchMm ?? 0, inp.heightMm ?? 0, 2 * hook);
      return {
        lengthMm: l,
        formula: `Core dia = ${inp.colDiaMm} − 2×${c} − ${d} = ${core} mm; one turn = √((π×${core})² + ${inp.pitchMm}²) = ${turnLengthMm.toFixed(1)} mm; turns = ⌊${inp.heightMm}/${inp.pitchMm}⌋+1 = ${turns}; L = ${turns}×${turnLengthMm.toFixed(1)} + 2×${t.hookXd}d = ${l.toFixed(1)} mm`,
      };
    }
    case "circular-ring": {
      const ringD = (inp.colDiaMm ?? 0) - 2 * c - d;
      const l = Math.PI * ringD + 2 * hook;
      return { lengthMm: l, formula: `Ring dia = ${inp.colDiaMm} − 2×${c} − ${d} = ${ringD} mm; L = π×${ringD} + 2×${t.hookXd}d = ${l.toFixed(1)} mm` };
    }
  }
}

export function calcBbsRow(inp: BbsRowInput, stockLengthM: number = STOCK_BAR_M): BbsRowResult | { errors: string[] } {
  const errors = validateBbsRow(inp);
  if (errors.length > 0) return { errors };
  const { lengthMm, formula, fieldApproxNote } = cutLengthMm(inp);
  if (!isFinite(lengthMm) || lengthMm <= 0) return { errors: ["Computed cutting length is zero or negative — check the dimensions."] };
  const unitWt = unitWeightKgPerM(inp.diaMm);
  // Laps join stock bars end to end. A spiral is ordered as one continuous
  // coil length, so no per-bar lap is added here — spiral laps are counted
  // in the cage estimator (spiralBars = ceil(L/12)), which is the worked
  // example's convention (14.497 m -> 5.72 kg, no lap).
  const lapsPerBar =
    inp.shape === "spiral"
      ? 0
      : lengthMm > stockLengthM * 1000
        ? Math.ceil(lengthMm / (stockLengthM * 1000)) - 1
        : 0;
  const lapLengthPerBarMm = lapsPerBar * (inp.lapX ?? 50) * inp.diaMm;
  const perBarMm = lengthMm + lapLengthPerBarMm;
  const totalLengthM = (perBarMm / 1000) * inp.barsPerMember * inp.members;
  const weightKg = round2(totalLengthM * unitWt);
  return {
    ...inp,
    cutLengthMm: lengthMm,
    cutLengthM: lengthMm / 1000,
    lapLengthPerBarMm,
    lapsPerBar,
    totalLengthM,
    weightKg,
    unitWeightKgPerM: unitWt,
    barsToOrderCount: barsToOrder(totalLengthM, stockLengthM).bars,
    formula,
    fieldApproxNote,
  };
}

export interface BbsTotals {
  netWeightKg: number;
  orderWeightKg: number;
  tonnes: number;
  maunds: number;
  cost: number | null;
  costComplete: boolean;
  totalBarsToOrder: number;
  perDia: { diaMm: number; weightKg: number; bars: number; totalLengthM: number }[];
}

export function calcBbsTotals(
  rows: BbsRowResult[],
  wastagePct: number,
  ratePerKg: number | null,
  stockLengthM: number = STOCK_BAR_M,
): BbsTotals {
  const netWeightKg = round2(rows.reduce((s, r) => s + r.weightKg, 0));
  const orderWeightKg = round2(applyWastage(netWeightKg, wastagePct));
  const cost = costFor(orderWeightKg, ratePerKg);
  const byDia = new Map<number, { weightKg: number; totalLengthM: number }>();
  for (const r of rows) {
    const cur = byDia.get(r.diaMm) ?? { weightKg: 0, totalLengthM: 0 };
    cur.weightKg = round2(cur.weightKg + r.weightKg);
    cur.totalLengthM = round2(cur.totalLengthM + r.totalLengthM);
    byDia.set(r.diaMm, cur);
  }
  const perDia = [...byDia.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([diaMm, v]) => ({
      diaMm,
      weightKg: v.weightKg,
      totalLengthM: v.totalLengthM,
      bars: barsToOrder(v.totalLengthM, stockLengthM).bars,
    }));
  return {
    netWeightKg,
    orderWeightKg,
    tonnes: orderWeightKg / 1000,
    maunds: orderWeightKg / 40,
    cost,
    costComplete: cost != null,
    totalBarsToOrder: perDia.reduce((s, p) => s + p.bars, 0),
    perDia,
  };
}

/** Default worked example: Beam B1, 25 × Ø8 rectangular stirrups, 300×450, cover 40. */
export function bbsWorkedExample(): BbsRowInput {
  return {
    member: "B1 — Main Beam",
    shape: "rect-stirrup",
    diaMm: 8,
    members: 25,
    barsPerMember: 1,
    coverMm: 40,
    hookStandard: "IS 2502",
    lapX: 50,
    widthMm: 300,
    depthMm: 450,
  };
}

export interface FaqItem {
  q: string;
  a: string;
}

export const BBS_FAQS: FaqItem[] = [
  {
    q: "How is cutting length calculated?",
    a: "Cutting length is the straight length of bar needed before bending: the sum of the straight portions, plus the hook allowance, minus the shortening at each bend. For a rectangular stirrup the IS 2502 detailed form is L = 2(A+B) + 2×10d − (3×2d + 2×3d), where A and B are the inner dimensions (section minus twice the cover) and d is the bar diameter. A straight bar needs no addition: its cutting length is just its span.",
  },
  {
    q: "What is the D²/162 formula?",
    a: "The weight of one metre of steel bar is d² ÷ 162.28 kg/m, where d is the bar diameter in millimetres. It comes from the volume of a 1 m bar (πd²/4) times the density of steel (7,850 kg/m³). So a 12 mm bar weighs 144 ÷ 162.28 = 0.887 kg/m, a 16 mm bar 1.578 kg/m and a 20 mm bar 2.465 kg/m. One 12 m stock bar of 12 mm steel weighs about 10.65 kg.",
  },
  {
    q: "How long is a rectangular stirrup for a 300 × 450 mm beam?",
    a: "With 40 mm cover and Ø8 bars, the inner dimensions are A = 300 − 80 = 220 mm and B = 450 − 80 = 370 mm. The IS 2502 detailed form gives L = 2(220+370) + 2×80 − (3×16 + 2×24) = 1,244 mm = 1.244 m, weighing 1.244 × 0.394 = 0.49 kg. Twenty-five such stirrups need 31.10 m of bar, 12.27 kg net, or 12.88 kg with 5% wastage.",
  },
  {
    q: "How much wastage should I add for reinforcement?",
    a: "Add 3% for straight bars and 5% for bent shapes such as stirrups and cranked bars as a default, and up to 10% where there is a lot of cutting, complex shapes or handling loss. Wastage is applied to the ordered quantity, not to the theoretical weight — order 5% more steel than the schedule shows.",
  },
  {
    q: "How many 12 m bars do I need to order?",
    a: "Divide the total cut length by the stock length and round up: bars = ⌈total length ÷ 12⌉ for 12 m stock bars (or ÷ 12.192 m for 40 ft bars, which are 1.6% longer). For example 31.10 m of Ø8 stirrup bar needs ⌈31.10 ÷ 12⌉ = 3 bars. The last bar's offcut is shown so you can see what is left over.",
  },
  {
    q: "What is lap length (50d)?",
    a: "A lap is the overlap where two bars are joined end to end because one stock bar is not long enough. The standard lap is 50 times the bar diameter — 50d — so a 12 mm bar laps 600 mm and a 20 mm bar laps 1,000 mm. This calculator adds laps automatically whenever a single bar's cutting length exceeds one stock bar, and shows how many laps each bar needs.",
  },
  {
    q: "Which cover should I use for a beam, column, slab or footing?",
    a: "As a guide (IS 456 nominal cover): slab 20 mm, beam 25 mm, column 40 mm, footing 50 mm, and 75 mm where concrete is cast directly against soil. Cover is measured from the concrete face to the outside of the stirrup. Too little cover lets moisture reach the steel and rust it; too much cover wastes concrete and reduces the effective depth.",
  },
  {
    q: "How is BBS cost calculated?",
    a: "Cost = ordered weight × rate per kg, where ordered weight is the net schedule weight plus wastage. The default rate is Rs 270/kg for Pakistan (indicative November 2026 — confirm with your dealer). Rates for India, the UAE and USD are left blank because no verified rate was available; enter your dealer's rate and the cost appears. A cost is never shown as zero when the rate is unknown.",
  },
];
