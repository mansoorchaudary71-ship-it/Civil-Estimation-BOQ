/**
 * Pile / column cage estimator engine — pure functions.
 *
 * Canonical rules (G3 spec + steelCalc.ts):
 * - All steel weight via unitWeightKgPerM (d^2/162.28).
 * - Helix length via spiralLengthMm() from bbsCalc.ts — the SAME function
 *   the BBS spiral shape uses, so the two can never diverge again.
 * - Spiral: turns = floor(L/pitch) + 1 (integer; count and length use the
 *   same turn count — fixes the old CageEstimator mismatch where the
 *   displayed count was ceil(L/p+1) but the length used L/p turns).
 *   L_spiral = turns * sqrt((pi*core)^2 + pitch^2) + 2*pi*core
 *   (2 flat end turns — the Cage convention, kept; BBS spirals instead
 *   add 2*10d hooks. The two conventions are for different details and
 *   are stated in the FAQ, not silently merged.)
 * - Hoops: N = floor((L-cover)/pitch) + 1; ring L = pi*core + 2*10d.
 * - Main bars: L_bar = L + anchorage - cover - 3*d_main
 *   (ParamVisions form: pile depth + development/anchorage - cover -
 *   bend deductions). Laps: ceil(L_bar/12)-1 per bar x 50d.
 * - Spiral/hoop laps: ceil(L/12)-1 laps x lapXd, added to the length.
 * - Pile concrete is WET volume as placed: V = pi*(D/2)^2 * L.
 *   The 1.54 dry-volume factor does NOT apply to pile concrete.
 * - Stiffener rings are OPTIONAL (default 0 = none). The spec's worked
 *   example totals (175.46 kg/pile) are spiral + main bars only, so the
 *   default inputs carry 0 rings; the UI suggests ceil(L/1.5) rings.
 */

import {
  unitWeightKgPerM,
  barsToOrder,
  applyWastage,
  costFor,
  STOCK_BAR_M,
} from "./steelCalc";
import { spiralLengthMm } from "./bbsCalc";

export type CageType = "spiral" | "hoop";

export interface CageInputs {
  cageType: CageType;
  piles: number;
  mainCount: number;
  mainDiaMm: number;
  /** development / anchorage length added to each main bar, mm (default 550) */
  anchorageMm: number;
  /** lap length as a multiple of dia for main bars (default 50) */
  lapX: number;
  pileDiaMm: number;
  cageLengthM: number;
  /** "m" or "ft" for the cage length field */
  lengthUnit: "m" | "ft";
  coverMm: number;
  spiralDiaMm: number;
  pitchMm: number;
  /** lap length as a multiple of dia for the spiral/hoops (default 50) */
  spiralLapX: number;
  /** stiffener rings per cage, 0 = none */
  stiffenerCount: number;
  stiffenerDiaMm: number;
  wastagePct: number;
  ratePerKg: number | null;
}

export interface CageComponent {
  label: string;
  diaMm: number;
  count: number;
  cutLengthM: number;
  totalLengthM: number;
  weightKg: number;
}

export interface CageResults {
  coreDiaMm: number;
  turnLengthM: number | null;
  turns: number | null;
  hoopCount: number | null;
  ringLengthM: number | null;
  spiralLengthM: number;
  spiralLengthBeforeLapsM: number;
  spiralLaps: number;
  spiralLapLengthM: number;
  spiralWeightKg: number;
  mainBarLengthM: number;
  mainLapsPerBar: number;
  mainLapLengthM: number;
  mainTotalLengthM: number;
  mainWeightKg: number;
  stiffenerWeightKg: number;
  components: CageComponent[];
  concreteVolumeM3: number;
  netKgPerPile: number;
  orderKgPerPile: number;
  netKgTotal: number;
  orderKgTotal: number;
  tonnesTotal: number;
  costTotal: number | null;
  costComplete: boolean;
  barsToOrder: number;
  formula: string;
  warnings: string[];
}

const round2 = (n: number) => Math.round(n * 100) / 100;
const FT_TO_M = 0.3048;

export function validateCage(inp: Partial<CageInputs>): string[] {
  const errors: string[] = [];
  if (inp.pileDiaMm == null || !isFinite(inp.pileDiaMm) || inp.pileDiaMm < 200 || inp.pileDiaMm > 3000)
    errors.push("Pile / column dia must be 200–3,000 mm.");
  if (inp.cageLengthM == null || !isFinite(inp.cageLengthM) || inp.cageLengthM < 1 || inp.cageLengthM > 60)
    errors.push("Cage length must be 1–60 m (or the equivalent in ft).");
  if (inp.coverMm == null || !isFinite(inp.coverMm) || inp.coverMm < 25 || inp.coverMm > 100)
    errors.push("Clear cover must be 25–100 mm (75 mm for bored piles against soil, 50 mm for columns).");
  if (inp.spiralDiaMm == null || ![6, 8, 10, 12, 16].includes(inp.spiralDiaMm))
    errors.push("Spiral / hoop dia must be one of 6, 8, 10, 12, 16 mm.");
  if (inp.pitchMm == null || !isFinite(inp.pitchMm) || inp.pitchMm < 75 || inp.pitchMm > 300)
    errors.push("Pitch / spacing must be 75–300 mm.");
  if (inp.mainCount == null || !Number.isInteger(inp.mainCount) || inp.mainCount < 4 || inp.mainCount > 32)
    errors.push("Main bars must be a whole number, 4–32.");
  if (inp.mainDiaMm == null || ![10, 12, 16, 20, 25, 28, 32].includes(inp.mainDiaMm))
    errors.push("Main bar dia must be one of 10, 12, 16, 20, 25, 28, 32 mm.");
  if (inp.mainDiaMm != null && inp.spiralDiaMm != null && inp.mainDiaMm < inp.spiralDiaMm)
    errors.push("Main bars must be at least as large as the spiral / hoop dia.");
  if (inp.anchorageMm == null || !isFinite(inp.anchorageMm) || inp.anchorageMm < 0 || inp.anchorageMm > 2000)
    errors.push("Anchorage / development length must be 0–2,000 mm.");
  if (inp.piles == null || !Number.isInteger(inp.piles) || inp.piles < 1 || inp.piles > 1000)
    errors.push("No. of piles must be a whole number, 1–1,000.");
  if (inp.stiffenerCount != null && (!Number.isInteger(inp.stiffenerCount) || inp.stiffenerCount < 0 || inp.stiffenerCount > 100))
    errors.push("Stiffener rings must be a whole number, 0–100 (0 = none).");
  if (
    inp.pileDiaMm != null && inp.coverMm != null && inp.spiralDiaMm != null &&
    inp.pileDiaMm - 2 * inp.coverMm - inp.spiralDiaMm <= 0
  )
    errors.push("Cover + spiral dia exceeds the pile dia — increase the pile dia or reduce the cover.");
  if (inp.wastagePct != null && (!isFinite(inp.wastagePct) || inp.wastagePct < 0 || inp.wastagePct > 15))
    errors.push("Wastage must be 0–15%.");
  return errors;
}

export function calcCage(inp: CageInputs): CageResults {
  const lengthM = inp.lengthUnit === "ft" ? inp.cageLengthM * FT_TO_M : inp.cageLengthM;
  const lengthMm = lengthM * 1000;
  const coreDiaMm = inp.pileDiaMm - 2 * inp.coverMm - inp.spiralDiaMm;
  const warnings: string[] = [];
  if (inp.coverMm < 40) warnings.push("Cover under 40 mm is low for a pile — bored piles against soil usually need 75 mm.");
  if (inp.pitchMm < 100) warnings.push("Pitch under 100 mm is very tight — check buildability on site.");
  if (inp.coverMm < 75 && inp.pileDiaMm >= 500) warnings.push("For a bored pile against soil, consider 75 mm cover instead of " + inp.coverMm + " mm.");

  const spiralUnitWt = unitWeightKgPerM(inp.spiralDiaMm);
  const mainUnitWt = unitWeightKgPerM(inp.mainDiaMm);
  // --- Spiral / hoops ---
  let turns: number | null = null;
  let turnLengthM: number | null = null;
  let hoopCount: number | null = null;
  let ringLengthM: number | null = null;
  let lengthBeforeLapsM: number;
  if (inp.cageType === "spiral") {
    const r = spiralLengthMm(coreDiaMm, inp.pitchMm, lengthMm, 2 * Math.PI * coreDiaMm);
    turns = r.turns;
    turnLengthM = r.turnLengthMm / 1000;
    lengthBeforeLapsM = r.lengthMm / 1000;
  } else {
    hoopCount = Math.floor((lengthMm - inp.coverMm) / inp.pitchMm) + 1;
    ringLengthM = (Math.PI * coreDiaMm + 2 * 10 * inp.spiralDiaMm) / 1000;
    lengthBeforeLapsM = hoopCount * ringLengthM;
  }
  const spiralBars = Math.max(1, Math.ceil(lengthBeforeLapsM / STOCK_BAR_M));
  const spiralLaps = spiralBars - 1;
  const spiralLapLengthM = (spiralLaps * inp.spiralLapX * inp.spiralDiaMm) / 1000;
  const spiralLengthM = round2(lengthBeforeLapsM + spiralLapLengthM);
  const spiralWeightKg = round2(spiralLengthM * spiralUnitWt);

  // --- Main / longitudinal bars ---
  // Lengths are kept to 3 dp internally: rounding 10.452 m to 10.45 m
  // would lose 16 mm per bar (0.13 kg on the worked example).
  const mainBarLengthM = Math.round(((lengthMm + inp.anchorageMm - inp.coverMm - 3 * inp.mainDiaMm) / 1000) * 1000) / 1000;
  const mainLapsPerBar = mainBarLengthM > STOCK_BAR_M ? Math.ceil(mainBarLengthM / STOCK_BAR_M) - 1 : 0;
  const mainLapLengthM = round2((mainLapsPerBar * inp.lapX * inp.mainDiaMm) / 1000);
  const mainTotalLengthM = round2(inp.mainCount * (mainBarLengthM + mainLapLengthM));
  const mainWeightKg = round2(mainTotalLengthM * mainUnitWt);

  // --- Stiffener rings (optional) ---
  let stiffenerWeightKg = 0;
  let stiffenerTotalLengthM = 0;
  let stiffenerRingLengthM = 0;
  if (inp.stiffenerCount > 0) {
    const ringDia = inp.pileDiaMm - 2 * inp.coverMm - inp.stiffenerDiaMm;
    stiffenerRingLengthM = (Math.PI * ringDia + 2 * 10 * inp.stiffenerDiaMm) / 1000;
    stiffenerTotalLengthM = round2(inp.stiffenerCount * stiffenerRingLengthM);
    stiffenerWeightKg = round2(stiffenerTotalLengthM * unitWeightKgPerM(inp.stiffenerDiaMm));
  }

  const components: CageComponent[] = [
    {
      label: inp.cageType === "spiral" ? "Spiral (helix)" : "Circular hoops / rings",
      diaMm: inp.spiralDiaMm,
      count: inp.cageType === "spiral" ? (turns ?? 0) : (hoopCount ?? 0),
      cutLengthM: inp.cageType === "spiral" ? round2(turnLengthM ?? 0) : round2(ringLengthM ?? 0),
      totalLengthM: spiralLengthM,
      weightKg: spiralWeightKg,
    },
    {
      label: "Main / longitudinal bars",
      diaMm: inp.mainDiaMm,
      count: inp.mainCount,
      cutLengthM: mainBarLengthM,
      totalLengthM: mainTotalLengthM,
      weightKg: mainWeightKg,
    },
  ];
  if (inp.stiffenerCount > 0) {
    components.push({
      label: "Stiffener rings",
      diaMm: inp.stiffenerDiaMm,
      count: inp.stiffenerCount,
      cutLengthM: round2(stiffenerRingLengthM),
      totalLengthM: stiffenerTotalLengthM,
      weightKg: stiffenerWeightKg,
    });
  }

  const concreteVolumeM3 = round2(Math.PI * Math.pow(inp.pileDiaMm / 2000, 2) * lengthM);
  const netKgPerPile = round2(spiralWeightKg + mainWeightKg + stiffenerWeightKg);
  const orderKgPerPile = round2(applyWastage(netKgPerPile, inp.wastagePct));
  const netKgTotal = round2(netKgPerPile * inp.piles);
  const orderKgTotal = round2(orderKgPerPile * inp.piles);
  const formula =
    inp.cageType === "spiral"
      ? `Core dia = ${inp.pileDiaMm} − 2×${inp.coverMm} − ${inp.spiralDiaMm} = ${coreDiaMm} mm; one turn = √((π×${coreDiaMm})² + ${inp.pitchMm}²) = ${((turnLengthM ?? 0) * 1000).toFixed(1)} mm; turns = ⌊${lengthMm}/${inp.pitchMm}⌋+1 = ${turns}; L = ${turns}×${((turnLengthM ?? 0) * 1000).toFixed(1)} + 2π×${coreDiaMm} = ${(lengthBeforeLapsM * 1000).toFixed(0)} mm; laps ${spiralLaps}×${inp.spiralLapX}d = ${spiralLapLengthM} m → ${spiralLengthM} m. Main bar L = ${lengthMm} + ${inp.anchorageMm} − ${inp.coverMm} − 3×${inp.mainDiaMm} = ${mainBarLengthM * 1000} mm.`
      : `Core dia = ${coreDiaMm} mm; rings N = ⌊(${lengthMm}−${inp.coverMm})/${inp.pitchMm}⌋+1 = ${hoopCount}; ring L = π×${coreDiaMm} + 2×10d = ${((ringLengthM ?? 0) * 1000).toFixed(1)} mm; L = ${spiralLengthM} m. Main bar L = ${mainBarLengthM * 1000} mm.`;
  return {
    coreDiaMm,
    turnLengthM: turnLengthM == null ? null : Math.round(turnLengthM * 1000) / 1000,
    turns,
    hoopCount,
    ringLengthM: ringLengthM == null ? null : round2(ringLengthM),
    spiralLengthM,
    spiralLengthBeforeLapsM: round2(lengthBeforeLapsM),
    spiralLaps,
    spiralLapLengthM: round2(spiralLapLengthM),
    spiralWeightKg,
    mainBarLengthM,
    mainLapsPerBar,
    mainLapLengthM,
    mainTotalLengthM,
    mainWeightKg,
    stiffenerWeightKg,
    components,
    concreteVolumeM3,
    netKgPerPile,
    orderKgPerPile,
    netKgTotal,
    orderKgTotal,
    tonnesTotal: orderKgTotal / 1000,
    costTotal: costFor(orderKgTotal, inp.ratePerKg),
    costComplete: inp.ratePerKg != null,
    barsToOrder: barsToOrder(spiralLengthM + mainTotalLengthM + stiffenerTotalLengthM, STOCK_BAR_M).bars,
    formula,
    warnings,
  };
}

/** Suggested stiffener-ring count for a cage of length L (m): one ring every ~1.5 m. */
export function suggestedStiffenerCount(lengthM: number): number {
  return Math.max(0, Math.ceil(lengthM / 1.5));
}

/** Default worked example (G3 spec §1): Ø600 pile, L=10 m, cover 50, 8×Ø16 main, Ø8 spiral @150. */
export function defaultCageInputs(): CageInputs {
  return {
    cageType: "spiral",
    piles: 10,
    mainCount: 8,
    mainDiaMm: 16,
    anchorageMm: 550,
    lapX: 50,
    pileDiaMm: 600,
    cageLengthM: 10,
    lengthUnit: "m",
    coverMm: 50,
    spiralDiaMm: 8,
    pitchMm: 150,
    spiralLapX: 50,
    stiffenerCount: 0,
    stiffenerDiaMm: 12,
    wastagePct: 5,
    ratePerKg: 270,
  };
}

export interface FaqItem {
  q: string;
  a: string;
}

export const CAGE_FAQS: FaqItem[] = [
  {
    q: "How is spiral length calculated?",
    a: "One turn of the helix is √( (π × core dia)² + pitch² ), where the core dia is the pile dia minus twice the cover minus the spiral dia. The number of turns is ⌊length ÷ pitch⌋ + 1, and two flat end turns (2π × core dia) are added. For a Ø600 pile, 10 m long, cover 50, Ø8 spiral at 150 mm: core 492 mm, one turn 1.553 m, 67 turns → 107.14 m, plus 8 laps of 50d (3.20 m) = 110.34 m, about 43.5 kg.",
  },
  {
    q: "Spiral vs circular hoops — which should I use?",
    a: "A continuous spiral is one unbroken helix and is usual for bored piles and circular columns; circular hoops are separate rings tied at the spacing. Spirals confine the concrete better and are faster to fix on a pile cage, while hoops are easier to make and replace on site. This calculator gives both: pick the type and the maths, laps and weight follow.",
  },
  {
    q: "How many main bars go in a pile cage?",
    a: "A bored pile cage usually has 6–12 longitudinal bars, 8 being the common default for a 600 mm pile. The minimum is 4. Bars are spaced evenly around the cage, with a clear gap of at least the bar dia or 25 mm between them. More bars help with bending and handling stiffness, but they also make concreting harder if they are packed too tight.",
  },
  {
    q: "What is the lap length for a cage?",
    a: "The standard lap is 50 times the bar diameter (50d): 400 mm for Ø8 spiral bar, 800 mm for Ø16 main bars. A lap is needed whenever a bar's length exceeds one 12 m stock bar — the spiral in the worked example needs 9 stock bars, so it has 8 laps. Lap length is added to the total length, never hidden.",
  },
  {
    q: "What cover should a bored pile have?",
    a: "75 mm where concrete is cast against soil (a bored pile), 50 mm for a column in normal exposure, and 40 mm minimum for a column. Cover is measured from the concrete face to the outside of the spiral. Too little cover lets groundwater reach the steel; the calculator warns when cover is under 40 mm for a pile.",
  },
  {
    q: "How much wastage should I add for pile steel?",
    a: "Add 5% as a default for cage steel — cutting, laps and handling loss on a pile cage are higher than for straight bars. Use 3% only for long straight main bars with few cuts, and up to 10% for short or congested cages. Wastage is applied to the ordered quantity.",
  },
  {
    q: "How is pile concrete volume calculated?",
    a: "A pile is a cylinder: V = π × (dia/2)² × length. A Ø600 pile, 10 m long, is π × 0.3² × 10 = 2.83 m³ of concrete as placed (wet volume). The 1.54 dry-volume factor used for site-mixed concrete does NOT apply here — that factor converts wet concrete to its dry ingredients, and a pile is ordered as ready-mix by wet volume.",
  },
  {
    q: "Do stiffener rings count in the weight?",
    a: "Yes, when you include them. Stiffener rings are the heavier rings (usually Ø12) tied inside the cage about every 1.5 m to keep it round while it is lifted and lowered. They are optional — the worked example totals exclude them — but if you enter a ring count, their weight is added to the per-pile and project totals.",
  },
];
