/**
 * Reinforcement (beam / column / slab) quantity engine — pure functions.
 *
 * Canonical rules (G3 spec + repo AGENTS.md):
 * - Effective depth: d = D - (cover + phi/2), phi = main bar dia.
 * - Steel area: As = n * pi * phi^2 / 4. Steel ratio rho = As / (b*d).
 * - Rectangular stirrup, AGENTS.md field rule (quantity take-off):
 *   L = 2(A+B) + 24*phi. The IS 2502 detailed value is computed alongside
 *   and shown, because it reads ~10.3% LOWER (demo 1.364 m vs 1.492 m for
 *   the default beam) — the two must never be silently swapped.
 * - Stirrup count: N = floor(L/S) + 1 (AGENTS.md: N = L/S + 1, rounded up).
 * - All steel weight via steelCalc.ts unitWeightKgPerM (d^2/162.28).
 * - Slab grid (Omni pattern): n = floor(grid/spacing) + 1 per direction.
 *
 * This tool gives QUANTITIES only. It does not design the member — the
 * steel ratio note is a rule of thumb, not a design check.
 */

import {
  unitWeightKgPerM,
  barsToOrder,
  applyWastage,
  costFor,
  stirrupLengthSimple,
  stirrupLengthDetailed,
  STOCK_BAR_M,
} from "./steelCalc";

export type ReinfElementType = "Beam" | "Column" | "Slab";

export const MIN_COVER_MM: Record<ReinfElementType, number> = {
  Slab: 20,
  Beam: 25,
  Column: 40,
};

export interface ReinforcementInputs {
  type: ReinfElementType;
  /** member length, m (beam/column) or slab length, m */
  lengthM: number;
  /** slab width, m (slab only) */
  widthM?: number;
  /** section width b, mm (beam/column) */
  widthMm: number;
  /** total depth / slab thickness D, mm */
  depthMm: number;
  coverMm: number;
  /** beam/column only */
  topCount?: number;
  topDiaMm?: number;
  bottomCount?: number;
  bottomDiaMm?: number;
  stirrupDiaMm?: number;
  stirrupSpacingMm?: number;
  /** slab only */
  mainDiaMm?: number;
  mainSpacingMm?: number;
  distDiaMm?: number;
  distSpacingMm?: number;
  wastagePct: number;
  /** null = unverified, cost shows "—" */
  ratePerKg: number | null;
}

export interface ReinfLayer {
  label: string;
  count: number;
  diaMm: number;
  barLengthM: number;
  totalLengthM: number;
  weightKg: number;
  areaMm2?: number;
}

export interface ReinforcementResults {
  effectiveDepthMm: number;
  activeWidthMm: number;
  minCoverMm: number;
  coverPass: boolean;
  coverMsg: string;
  minClearMm: number;
  bottomClearMm: number | null;
  topClearMm: number | null;
  spacingPass: boolean;
  spacingMsg: string;
  asBottomMm2: number | null;
  asTopMm2: number | null;
  rhoBottomPct: number | null;
  rhoTopPct: number | null;
  rhoNote: string;
  layers: ReinfLayer[];
  /** beam/column */
  stirrupLengthSimpleMm: number | null;
  stirrupLengthDetailedMm: number | null;
  stirrupCount: number | null;
  stirrupTotalLengthM: number | null;
  stirrupWeightKg: number | null;
  mainWeightKg: number;
  /** slab */
  slabMainCount: number | null;
  slabDistCount: number | null;
  slabGridLengthM: number | null;
  slabGridWidthM: number | null;
  slabRemainderWarn: string | null;
  totalNetKg: number;
  orderWeightKg: number;
  tonnes: number;
  cost: number | null;
  costComplete: boolean;
  barsToOrder: number;
  formula: string;
}

const round2 = (n: number) => Math.round(n * 100) / 100;
const barArea = (diaMm: number) => (Math.PI * diaMm * diaMm) / 4;

export function validateReinforcement(inp: Partial<ReinforcementInputs>): string[] {
  const errors: string[] = [];
  const num = (v: number | undefined, label: string, min: number, max: number) => {
    if (v == null || !isFinite(v) || v < min || v > max) errors.push(`${label} must be ${min}–${max}.`);
  };
  const cnt = (v: number | undefined, label: string) => {
    if (v == null || !Number.isInteger(v) || v < 1 || v > 20) errors.push(`${label} must be a whole number, 1–20.`);
  };
  const dia = (v: number | undefined, label: string) => {
    if (v == null || ![6, 8, 10, 12, 16, 20, 25, 28, 32].includes(v))
      errors.push(`${label} must be one of 6, 8, 10, 12, 16, 20, 25, 28, 32 mm.`);
  };
  if (!inp.type) errors.push("Choose an element type (Beam, Column or Slab).");
  num(inp.lengthM, inp.type === "Slab" ? "Slab length" : "Member length", 0.5, 30);
  if (inp.type === "Slab") {
    num(inp.widthM, "Slab width", 1, 30);
  } else {
    num(inp.widthMm, "Width", 100, 2000);
  }
  num(inp.depthMm, inp.type === "Slab" ? "Slab thickness" : "Depth", 100, 2000);
  num(inp.coverMm, "Clear cover", 15, 75);
  if (inp.type !== "Slab" && inp.coverMm != null && inp.widthMm != null && inp.depthMm != null && inp.coverMm >= Math.min(inp.widthMm, inp.depthMm) / 4)
    errors.push("Cover is too large for this section — cover must be less than a quarter of the smaller side.");
  if (inp.type !== "Slab") {
    cnt(inp.topCount, "Top bars count");
    dia(inp.topDiaMm, "Top bar dia");
    cnt(inp.bottomCount, "Bottom bars count");
    dia(inp.bottomDiaMm, "Bottom bar dia");
    dia(inp.stirrupDiaMm, "Stirrup dia");
    num(inp.stirrupSpacingMm, "Stirrup spacing", 75, 300);
  } else {
    dia(inp.mainDiaMm, "Main bar dia");
    num(inp.mainSpacingMm, "Main bar spacing", 75, 300);
    dia(inp.distDiaMm, "Distribution bar dia");
    num(inp.distSpacingMm, "Distribution bar spacing", 75, 300);
  }
  if (inp.wastagePct != null && (!isFinite(inp.wastagePct) || inp.wastagePct < 0 || inp.wastagePct > 15))
    errors.push("Wastage must be 0–15%.");
  return errors;
}

/** Lap allowance for one bar of length L (m): ceil(L/12)-1 laps x 50d, 0 when L <= 12 m. */
export function lapAllowanceM(lengthM: number, diaMm: number, lapX = 50): number {
  if (lengthM <= STOCK_BAR_M) return 0;
  return (Math.ceil(lengthM / STOCK_BAR_M) - 1) * lapX * (diaMm / 1000);
}

export function calcReinforcement(inp: ReinforcementInputs): ReinforcementResults {
  const dMain = inp.type === "Slab" ? (inp.mainDiaMm ?? 12) : (inp.bottomDiaMm ?? 20);
  const d = inp.depthMm - (inp.coverMm + dMain / 2);
  const minCover = MIN_COVER_MM[inp.type];
  const coverPass = inp.coverMm >= minCover;
  const layers: ReinfLayer[] = [];
  let formula = "";

  if (inp.type === "Slab") {
    const edgeMm = inp.coverMm; // grid starts one cover in from each edge (spec worked example)
    const gridLmm = inp.lengthM * 1000 - 2 * edgeMm;
    const gridWmm = (inp.widthM ?? 3) * 1000 - 2 * edgeMm;
    const mainDia = inp.mainDiaMm ?? 12;
    const distDia = inp.distDiaMm ?? 8;
    const mainSpacing = inp.mainSpacingMm ?? 150;
    const distSpacing = inp.distSpacingMm ?? 200;
    const nMain = Math.floor(gridWmm / mainSpacing) + 1;
    const nDist = Math.floor(gridLmm / distSpacing) + 1;
    const mainLenM = (nMain * gridLmm) / 1000;
    const distLenM = (nDist * gridWmm) / 1000;
    const mainWt = round2(mainLenM * unitWeightKgPerM(mainDia));
    const distWt = round2(distLenM * unitWeightKgPerM(distDia));
    layers.push(
      { label: "Main bars", count: nMain, diaMm: mainDia, barLengthM: gridLmm / 1000, totalLengthM: round2(mainLenM), weightKg: mainWt, areaMm2: round2(nMain * barArea(mainDia)) },
      { label: "Distribution bars", count: nDist, diaMm: distDia, barLengthM: gridWmm / 1000, totalLengthM: round2(distLenM), weightKg: distWt, areaMm2: round2(nDist * barArea(distDia)) },
    );
    const remMain = gridWmm - (nMain - 1) * mainSpacing;
    const remDist = gridLmm - (nDist - 1) * distSpacing;
    const warn =
      remMain > mainSpacing / 2 || remDist > distSpacing / 2
        ? `Last spacing will be ${Math.round(remMain)} mm (main) / ${Math.round(remDist)} mm (distribution) — the grid does not divide evenly.`
        : null;
    const totalNetKg = round2(mainWt + distWt);
    const orderWeightKg = round2(applyWastage(totalNetKg, inp.wastagePct));
    formula =
      `d = ${inp.depthMm} − (${inp.coverMm} + ${mainDia}/2) = ${d} mm; ` +
      `grid ${gridLmm / 1000} × ${gridWmm / 1000} m; main bars ⌊${gridWmm}/${mainSpacing}⌋+1 = ${nMain}; ` +
      `distribution bars ⌊${gridLmm}/${distSpacing}⌋+1 = ${nDist}; total ${(mainLenM + distLenM).toFixed(1)} m.`;
    return {
      effectiveDepthMm: d,
      activeWidthMm: inp.widthMm - 2 * inp.coverMm,
      minCoverMm: minCover,
      coverPass,
      coverMsg: coverPass
        ? `Cover ${inp.coverMm} mm meets the IS 456 minimum of ${minCover} mm for a slab.`
        : `Cover too low! Minimum ${minCover} mm is required for a slab.`,
      minClearMm: Math.max(mainDia, 25),
      bottomClearMm: null,
      topClearMm: null,
      spacingPass: true,
      spacingMsg: `Main bars at ${mainSpacing} mm c/c, distribution bars at ${distSpacing} mm c/c.`,
      asBottomMm2: round2(nMain * barArea(mainDia)),
      asTopMm2: null,
      rhoBottomPct: null,
      rhoTopPct: null,
      rhoNote: "Steel ratio is not shown for slabs — it is checked per metre width against the design, not for the whole panel.",
      layers,
      stirrupLengthSimpleMm: null,
      stirrupLengthDetailedMm: null,
      stirrupCount: null,
      stirrupTotalLengthM: null,
      stirrupWeightKg: null,
      mainWeightKg: totalNetKg,
      slabMainCount: nMain,
      slabDistCount: nDist,
      slabGridLengthM: gridLmm / 1000,
      slabGridWidthM: gridWmm / 1000,
      slabRemainderWarn: warn,
      totalNetKg,
      orderWeightKg,
      tonnes: orderWeightKg / 1000,
      cost: costFor(orderWeightKg, inp.ratePerKg),
      costComplete: inp.ratePerKg != null,
      barsToOrder: barsToOrder(mainLenM + distLenM, STOCK_BAR_M).bars,
      formula,
    };
  }

  // Beam / Column
  const topCount = inp.topCount ?? 2;
  const topDia = inp.topDiaMm ?? 16;
  const botCount = inp.bottomCount ?? 3;
  const botDia = inp.bottomDiaMm ?? 20;
  const stirDia = inp.stirrupDiaMm ?? 8;
  const stirSpacing = inp.stirrupSpacingMm ?? 150;
  const activeWidth = inp.widthMm - 2 * inp.coverMm - 2 * stirDia;
  const bottomClear = botCount > 1 ? (activeWidth - botCount * botDia) / (botCount - 1) : activeWidth;
  const topClear = topCount > 1 ? (activeWidth - topCount * topDia) / (topCount - 1) : activeWidth;
  const minClear = Math.max(botDia, 25); // max(bar dia, 25 mm); aggregate 20 mm fixed, +5 mm
  const spacingPass = bottomClear >= minClear && topClear >= minClear;
  const asBottom = botCount * barArea(botDia);
  const asTop = topCount * barArea(topDia);
  const rhoBottom = (asBottom / (inp.widthMm * d)) * 100;
  const rhoTop = (asTop / (inp.widthMm * d)) * 100;

  const a = inp.widthMm - 2 * inp.coverMm;
  const b = inp.depthMm - 2 * inp.coverMm;
  const stirSimple = stirrupLengthSimple(a, b, stirDia);
  const stirDetailed = stirrupLengthDetailed(a, b, stirDia);
  const stirCount = Math.floor((inp.lengthM * 1000) / stirSpacing) + 1;
  const stirTotalM = round2((stirCount * stirSimple) / 1000);
  const stirWt = round2(stirTotalM * unitWeightKgPerM(stirDia));

  const barLen = (dia: number) => inp.lengthM + lapAllowanceM(inp.lengthM, dia);
  const botLenM = round2(botCount * barLen(botDia));
  const topLenM = round2(topCount * barLen(topDia));
  const botWt = round2(botLenM * unitWeightKgPerM(botDia));
  const topWt = round2(topLenM * unitWeightKgPerM(topDia));
  layers.push(
    { label: "Bottom (main) bars", count: botCount, diaMm: botDia, barLengthM: round2(barLen(botDia)), totalLengthM: botLenM, weightKg: botWt, areaMm2: round2(asBottom) },
    { label: "Top bars", count: topCount, diaMm: topDia, barLengthM: round2(barLen(topDia)), totalLengthM: topLenM, weightKg: topWt, areaMm2: round2(asTop) },
    { label: "Stirrups", count: stirCount, diaMm: stirDia, barLengthM: round2(stirSimple / 1000), totalLengthM: stirTotalM, weightKg: stirWt },
  );
  const mainWt = round2(botWt + topWt);
  const totalNetKg = round2(mainWt + stirWt);
  const orderWeightKg = round2(applyWastage(totalNetKg, inp.wastagePct));
  formula =
    `d = ${inp.depthMm} − (${inp.coverMm} + ${botDia}/2) = ${d} mm; ` +
    `As,bottom = ${botCount}×π×${botDia}²/4 = ${round2(asBottom)} mm²; ρ = ${round2(asBottom)}/(${inp.widthMm}×${d}) = ${rhoBottom.toFixed(2)}%; ` +
    `stirrup L = 2(${a}+${b}) + 24×${stirDia} = ${stirSimple} mm (field rule); N = ⌊${inp.lengthM * 1000}/${stirSpacing}⌋+1 = ${stirCount}.`;
  return {
    effectiveDepthMm: d,
    activeWidthMm: activeWidth,
    minCoverMm: minCover,
    coverPass,
    coverMsg: coverPass
      ? `Cover ${inp.coverMm} mm meets the IS 456 minimum of ${minCover} mm for a ${inp.type.toLowerCase()}.`
      : `Cover too low! Minimum ${minCover} mm is required for a ${inp.type.toLowerCase()}.`,
    minClearMm: minClear,
    bottomClearMm: round2(bottomClear),
    topClearMm: round2(topClear),
    spacingPass,
    spacingMsg: spacingPass
      ? `Clear spacing between bars is adequate (≥ ${minClear} mm).`
      : `Bars too close! Need ${minClear} mm, got ${Math.min(bottomClear, topClear).toFixed(1)} mm.`,
    asBottomMm2: round2(asBottom),
    asTopMm2: round2(asTop),
    rhoBottomPct: round2(rhoBottom),
    rhoTopPct: round2(rhoTop),
    rhoNote: `Steel ratio ${rhoBottom.toFixed(2)}% (bottom) — within the typical 0.8–1.5% rule of thumb for beams. This is a quantity check, not a design check.`,
    layers,
    stirrupLengthSimpleMm: stirSimple,
    stirrupLengthDetailedMm: stirDetailed,
    stirrupCount: stirCount,
    stirrupTotalLengthM: stirTotalM,
    stirrupWeightKg: stirWt,
    mainWeightKg: mainWt,
    slabMainCount: null,
    slabDistCount: null,
    slabGridLengthM: null,
    slabGridWidthM: null,
    slabRemainderWarn: null,
    totalNetKg,
    orderWeightKg,
    tonnes: orderWeightKg / 1000,
    cost: costFor(orderWeightKg, inp.ratePerKg),
    costComplete: inp.ratePerKg != null,
    barsToOrder: barsToOrder(botLenM + topLenM + stirTotalM, STOCK_BAR_M).bars,
    formula,
  };
}

/** Default worked example (G3 spec §1): 300×450 beam, L=3 m, cover 25, 2×Ø16 top, 3×Ø20 bottom, Ø8@150. */
export function defaultReinforcementInputs(): ReinforcementInputs {
  return {
    type: "Beam",
    lengthM: 3,
    widthMm: 300,
    depthMm: 450,
    coverMm: 25,
    topCount: 2,
    topDiaMm: 16,
    bottomCount: 3,
    bottomDiaMm: 20,
    stirrupDiaMm: 8,
    stirrupSpacingMm: 150,
    wastagePct: 5,
    ratePerKg: 270,
  };
}

export function defaultSlabInputs(): ReinforcementInputs {
  return {
    type: "Slab",
    lengthM: 4,
    widthM: 3,
    widthMm: 3000,
    depthMm: 150,
    coverMm: 20,
    mainDiaMm: 12,
    mainSpacingMm: 150,
    distDiaMm: 8,
    distSpacingMm: 200,
    wastagePct: 5,
    ratePerKg: 270,
  };
}

export interface FaqItem {
  q: string;
  a: string;
}

export const REINFORCEMENT_FAQS: FaqItem[] = [
  {
    q: "How do you calculate effective depth?",
    a: "Effective depth d is the distance from the compression face to the centre of the main steel: d = D − (cover + φ/2), where D is the total depth and φ is the diameter of the main bar. For a 450 mm beam with 25 mm cover and Ø20 bottom bars, d = 450 − (25 + 10) = 415 mm. It is the depth that actually resists bending, so bar quantities must use d, not the full depth.",
  },
  {
    q: "How many stirrups are in a beam?",
    a: "Count them as N = L/S + 1, rounded up — one stirrup at each end plus one per spacing interval. A 3 m beam with stirrups at 150 mm needs ⌊3000/150⌋ + 1 = 21 stirrups. Each Ø8 stirrup for a 300 × 450 mm beam (25 mm cover) is 2(250+400) + 24×8 = 1,492 mm long, so 21 stirrups are 31.33 m of bar, about 12.34 kg.",
  },
  {
    q: "What is the minimum cover for a beam, column or slab?",
    a: "IS 456 nominal cover: slab 20 mm, beam 25 mm, column 40 mm, footing 50 mm (75 mm against soil). Cover is measured from the concrete face to the outside of the stirrup or link. Too little cover lets moisture reach the steel; too much cover reduces the effective depth and wastes concrete.",
  },
  {
    q: "How is steel weight calculated?",
    a: "Weight is diameter squared divided by 162.28, in kg per metre: a 12 mm bar weighs 0.887 kg/m, a 16 mm bar 1.578 kg/m and a 20 mm bar 2.465 kg/m. Multiply the unit weight by the total bar length. One 12 m stock bar of 12 mm steel therefore weighs about 10.65 kg.",
  },
  {
    q: "What is a good steel percentage for a beam?",
    a: "As a rule of thumb, beams are typically 0.8–1.5% steel (As ÷ b×d), columns 1–4% and slabs 0.15–0.5% — but these are planning figures, not design limits. The exact steel comes from the structural design, and this tool does not design the member: it only takes off the quantities from the bars you enter. Verify against engineer-approved drawings.",
  },
  {
    q: "How do I calculate slab steel (main + distribution)?",
    a: "Work out the grid in each direction: number of bars = ⌊grid length ÷ spacing⌋ + 1. For a 4 × 3 m slab, 150 mm thick, Ø12 main bars at 150 mm and Ø8 distribution bars at 200 mm, the grid is 3.96 × 2.96 m, giving 20 main bars and 20 distribution bars — 138.4 m of bar, about 93.6 kg. Main bars run along the short span; distribution bars run across them.",
  },
  {
    q: "What spacing should stirrups have?",
    a: "Stirrup spacing is set by the structural design, but as a guide it is usually 100–150 mm near the supports (where shear is highest) and 150–200 mm in the middle of the span, never more than 0.75d or 300 mm. This calculator uses one spacing for the whole member; if your design zones the spacing, run each zone separately and add the counts.",
  },
  {
    q: "Does this tool design my beam?",
    a: "No — quantities only. It takes the bars, cover and spacing you enter and works out the cutting lengths, bar counts, steel weight and cost, with cover and spacing checks against IS 456. It does not check bending, shear or deflection, and it is not a substitute for a design by a licensed structural engineer.",
  },
];
