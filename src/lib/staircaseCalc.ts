/**
 * Staircase engine — IS 456 Cl. 33 waist-slab design + quantity takeoff
 * (pure functions). Single source of truth for BOTH the StaircaseCalculator
 * and the Universal Geometry engine's staircase tab.
 *
 * Fixes over the old StaircaseCalculator (G7 spec §4.8):
 * - The dead rebar inputs are now wired in: main steel is DESIGNED from
 *   the waist-slab moment (effective span = going·n + landing/2,
 *   w = self-weight + finishes 1.0 + live 3.0 kN/m², Mu = wL²/8), with
 *   bar count from the main dia/spacing inputs and distribution steel
 *   0.12% from the distribution dia/spacing inputs. The old flat
 *   "V × 1% × 7850" rule is kept only as a sanity cross-check.
 * - Defaults fixed: R = 0.17 m, T = 0.28 m → 2R+T = 620 mm (inside
 *   600–650; the old R 0.15 / T 0.25 gave 550 mm and a warning on load).
 * - Formwork/shuttering area added: L_incl·W + n·R·W + landing soffit.
 * - Total rise / run / stairwell size, flight split from floor height.
 * - The `landings` array state in the old component was stored but never
 *   read; the engine takes an explicit landing count instead.
 *
 * Steel-rate note (spec §4.11): the Universal engine's staircase tab used
 * 120 kg/m³ while StaircaseCalculator used 1% (= 78.5 kg/m³) — the same
 * flight gave two answers. Both now use THIS engine: designed steel, with
 * the 1% rule shown only as a cross-check.
 */
import {
  astForMu, astProvidedPerM, barAreaMm2, checkRange, costLine,
  materialsForConcrete, mixRatioForGrade, round, totalCost, type CostLine,
  type FaqItem, type MaterialBreakdown, type MixRatio,
} from "./structuralShared";
import { unitWeightKgPerM } from "./steelCalc";

export type StairShape = "straight" | "dog-legged" | "l-shaped" | "u-shaped";

export interface StaircaseInputs {
  shape: StairShape;
  steps: number; // straight: total steps; dog-legged: per flight handled via flights
  flight1Steps: number;
  flight2Steps: number;
  riseM: number;
  treadM: number;
  widthM: number;
  waistM: number;
  landingLengthM: number;
  landingWidthM: number;
  landingCount: number;
  floorHeightM: number; // 0 = not used
  fck: number;
  fy: number;
  mainDiaMm: number;
  mainSpacingMm: number;
  distDiaMm: number;
  distSpacingMm: number;
  coverMm: number;
  finishesKNm2: number;
  liveKNm2: number;
  mix: MixRatio;
  wastagePct: number;
  cementPerBag: number | null;
  steelPerKg: number | null;
  sandPerCft: number | null;
  crushPerCft: number | null;
}

export const defaultStaircaseInputs: StaircaseInputs = {
  shape: "straight",
  steps: 10, flight1Steps: 5, flight2Steps: 5,
  riseM: 0.17, treadM: 0.28, widthM: 1.2, waistM: 0.15,
  landingLengthM: 1.2, landingWidthM: 1.2, landingCount: 0,
  floorHeightM: 0,
  fck: 25, fy: 500,
  mainDiaMm: 12, mainSpacingMm: 150, distDiaMm: 10, distSpacingMm: 200,
  coverMm: 20, finishesKNm2: 1.0, liveKNm2: 3.0,
  mix: { c: 1, s: 1.5, a: 3 }, wastagePct: 5,
  cementPerBag: 1450, steelPerKg: 270, sandPerCft: 90, crushPerCft: 90,
};

export function validateStaircaseInputs(i: StaircaseInputs): string[] {
  const e: string[] = [];
  checkRange(e, "Rise", i.riseM, 0.1, 0.25);
  checkRange(e, "Tread", i.treadM, 0.2, 0.4);
  checkRange(e, "Stair width", i.widthM, 0.6, 3);
  checkRange(e, "Waist thickness", i.waistM, 0.1, 0.4);
  checkRange(e, "Steps", i.steps, 1, 40);
  const twoRT = 2 * i.riseM * 1000 + i.treadM * 1000;
  if (twoRT < 600 || twoRT > 650) e.push(`2R+T = ${round(twoRT)} mm is outside the 600–650 mm comfort band (NBC/Blondel).`);
  return e;
}

export interface StaircaseResult {
  errors: string[]; warnings: string[];
  totalSteps: number; totalRiseM: number; totalRunM: number;
  twoRPlusT: number; ergonomicsOk: boolean;
  inclinedLengthM: number;
  stepVolM3: number; waistVolM3: number; landingVolM3: number;
  wetVolM3: number;
  formworkM2: number; plywoodSheets: number; battensM: number;
  effSpanM: number; loadKNm2: number; muKNmPerM: number;
  dMm: number; astReqMm2PerM: number; astMinMm2PerM: number;
  mainBars: number; astProvidedMm2PerM: number; mainSteelKg: number;
  distAstMm2PerM: number; distBars: number; distSteelKg: number;
  designedSteelKg: number; onePctRuleKg: number;
  stairwellWidthM: number; stairwellLengthM: number;
  risersForFloor: number; flightSplit: string;
  materials: MaterialBreakdown;
  costLines: CostLine[]; totalCost: number | null;
  steps: { label: string; text: string }[];
}

export function designStaircase(input: Partial<StaircaseInputs> = {}): StaircaseResult {
  const i: StaircaseInputs = { ...defaultStaircaseInputs, ...input };
  const errors = validateStaircaseInputs(i);
  const warnings: string[] = [];
  const isStraight = i.shape === "straight";
  const totalSteps = isStraight ? i.steps : i.flight1Steps + i.flight2Steps;
  const r = i.riseM, t = i.treadM, w = i.widthM;
  const totalRise = totalSteps * r;
  const totalRun = totalSteps * t;
  const twoRT = 2 * r * 1000 + t * 1000;
  const ergonomicsOk = twoRT >= 600 && twoRT <= 650;
  if (!ergonomicsOk) warnings.push(`2R+T = ${round(twoRT)} mm is outside 600–650 mm — adjust riser or tread.`);
  const inclPerStep = Math.sqrt(r * r + t * t);
  const inclinedLength = inclPerStep * totalSteps;
  const stepVol = ((r * t * w) / 2) * totalSteps;
  const waistVol = inclinedLength * w * i.waistM;
  const landingVol = isStraight ? 0 : i.landingCount * i.landingLengthM * i.landingWidthM * i.waistM;
  const wetVol = stepVol + waistVol + landingVol;
  const formwork = inclinedLength * w + totalSteps * r * w + (isStraight ? 0 : i.landingLengthM * i.landingWidthM);
  // Waist-slab design — IS 456 Cl. 33 (per metre width).
  const cosTheta = t / inclPerStep;
  const selfWt = 25 * (i.waistM / cosTheta + r / 2); // kN/m² of plan
  const load = selfWt + i.finishesKNm2 + i.liveKNm2;
  const effSpan = totalRun + (isStraight ? 0 : i.landingLengthM / 2);
  const mu = (1.5 * load * effSpan * effSpan) / 8; // kNm per m width (factored)
  const d = i.waistM * 1000 - i.coverMm - i.mainDiaMm / 2;
  const astFlex = astForMu(mu, i.fck, i.fy, 1000, d);
  const astMin = (0.12 / 100) * 1000 * i.waistM * 1000;
  const astReq = Math.max(astFlex, astMin);
  const mainBars = Math.ceil((w * 1000 - 2 * i.coverMm) / i.mainSpacingMm) + 1;
  const astProv = astProvidedPerM(i.mainDiaMm, i.mainSpacingMm);
  if (astProv < astReq) warnings.push(`Main steel provided (${round(astProv)} mm²/m) is below the required ${round(astReq)} mm²/m — reduce the spacing or increase the bar diameter.`);
  const maxSpacing = Math.min(3 * d, 300);
  if (i.mainSpacingMm > maxSpacing) warnings.push(`Main bar spacing ${i.mainSpacingMm} mm exceeds the IS 456 limit min(3d, 300) = ${maxSpacing} mm.`);
  const mainLenM = inclinedLength + 0.3; // + anchorage allowance
  const mainKg = unitWeightKgPerM(i.mainDiaMm) * mainLenM * mainBars;
  const distAst = (0.12 / 100) * 1000 * i.waistM * 1000;
  const distBars = Math.ceil(inclinedLength * 1000 / i.distSpacingMm) + 1;
  const distKg = unitWeightKgPerM(i.distDiaMm) * w * distBars;
  const designedSteel = mainKg + distKg;
  const onePctKg = wetVol * 0.01 * 7850;
  // Stairwell size (dog-legged): width = 2·W + 0.1 m gap, length = going + landing.
  const stairwellW = isStraight ? w : 2 * w + 0.1;
  const stairwellL = isStraight ? totalRun : totalRun / 2 + i.landingLengthM;
  let risersForFloor = 0;
  let flightSplit = "";
  if (i.floorHeightM > 0) {
    risersForFloor = Math.ceil((i.floorHeightM * 1000) / (r * 1000));
    const perFlight = Math.ceil(risersForFloor / 2);
    flightSplit = `${risersForFloor} risers for ${i.floorHeightM} m floor height — split ${perFlight} + ${risersForFloor - perFlight} per flight (max 12 risers per flight residential, 15 commercial — split further if needed).`;
    if (perFlight > 12) warnings.push(`Flight of ${perFlight} risers exceeds the NBC 12-riser limit for residential stairs — add a landing.`);
  }
  const materials = materialsForConcrete(wetVol, i.mix, i.wastagePct);
  const lines: CostLine[] = [
    costLine(`Cement (${materials.cementBags} bags)`, materials.cementBags, "bags", i.cementPerBag),
    costLine(`Sand (${round(materials.sandCft, 1)} cft)`, materials.sandCft, "cft", i.sandPerCft),
    costLine(`Aggregate (${round(materials.aggCft, 1)} cft)`, materials.aggCft, "cft", i.crushPerCft),
    costLine(`Steel (${round(designedSteel, 1)} kg)`, designedSteel, "kg", i.steelPerKg),
  ];
  return {
    errors, warnings,
    totalSteps, totalRiseM: round(totalRise, 2), totalRunM: round(totalRun, 2),
    twoRPlusT: round(twoRT), ergonomicsOk,
    inclinedLengthM: round(inclinedLength, 3),
    stepVolM3: round(stepVol, 3), waistVolM3: round(waistVol, 3),
    landingVolM3: round(landingVol, 3), wetVolM3: round(wetVol, 3),
    formworkM2: round(formwork, 2), plywoodSheets: Math.ceil(formwork / 2.97),
    battensM: Math.ceil(formwork * 3.5),
    effSpanM: round(effSpan, 2), loadKNm2: round(load, 2), muKNmPerM: round(mu, 2),
    dMm: round(d), astReqMm2PerM: round(astReq), astMinMm2PerM: round(astMin),
    mainBars, astProvidedMm2PerM: round(astProv), mainSteelKg: round(mainKg, 1),
    distAstMm2PerM: round(distAst), distBars, distSteelKg: round(distKg, 1),
    designedSteelKg: round(designedSteel, 1), onePctRuleKg: round(onePctKg, 1),
    stairwellWidthM: round(stairwellW, 2), stairwellLengthM: round(stairwellL, 2),
    risersForFloor, flightSplit,
    materials, costLines: lines, totalCost: totalCost(lines),
    steps: [
      { label: "Steps volume", text: `V_steps = (R·T·W/2)·n = (${r} × ${t} × ${w}/2) × ${totalSteps} = ${round(stepVol, 3)} m³` },
      { label: "Waist slab volume", text: `L_incl = ${round(inclinedLength, 3)} m; V_waist = L_incl·W·t = ${round(waistVol, 3)} m³` },
      { label: "Formwork", text: `A = L_incl·W + n·R·W${isStraight ? "" : " + landing soffit"} = ${round(formwork, 2)} m² (${Math.ceil(formwork / 2.97)} plywood sheets)` },
      { label: "Waist design (IS 456 Cl. 33)", text: `w = self-weight ${round(selfWt, 2)} + finishes ${i.finishesKNm2} + live ${i.liveKNm2} = ${round(load, 2)} kN/m²; L_eff = ${round(effSpan, 2)} m; Mu = 1.5·w·L²/8 = ${round(mu, 2)} kNm/m; Ast = ${round(astReq)} mm²/m (min ${round(astMin)} mm²/m)` },
      { label: "Bar schedule", text: `${mainBars} main bars ${i.mainDiaMm} mm @ ${i.mainSpacingMm} mm (${round(astProv)} mm²/m provided); distribution ${i.distDiaMm} mm @ ${i.distSpacingMm} mm (${distBars} bars); designed steel ${round(designedSteel, 1)} kg — the old 1% rule would give ${round(onePctKg, 1)} kg as a cross-check only` },
    ],
  };
}

export const STAIRCASE_FAQS: FaqItem[] = [
  { q: "How many risers are needed for a 3 m floor?", a: "Risers = ceil(floor height ÷ target riser). For a 3.0 m floor with a 170 mm riser that is 18 risers, split into two flights of 9 with a landing between — never more than 12 risers in one flight for a residential stair (NBC 2016 Part 4), 15 for commercial." },
  { q: "What is 2R+T?", a: "Blondel's comfort rule: twice the riser plus the tread (going) should be 600–650 mm. A 170 mm riser with a 280 mm tread gives 620 mm — comfortable. The old defaults (150/250) gave 550 mm, which feels steep." },
  { q: "How thick should the waist slab be?", a: "About 150 mm for a normal house stair (span up to ~3.5 m), 175–200 mm for longer flights. The thickness is checked by IS 456 Cl. 33: the waist is designed as an inclined slab with effective span = going × steps + landing/2." },
  { q: "How much steel is in a staircase?", a: "Designed steel, not a thumb rule: main bars from the waist-slab moment (about 0.8–1.2% by volume for a house stair) plus 0.12% distribution steel. The old 1%-of-volume rule is shown here only as a cross-check — the designed bar schedule is what to order." },
  { q: "Dog-legged vs straight stair?", a: "A straight stair needs one long run (about 5 m for a 3 m floor) and no landing. A dog-legged stair folds back on itself with a half landing, so it fits a stairwell about 2.5 m × 5 m — the usual choice for houses." },
  { q: "How is shuttering (formwork) area calculated?", a: "Formwork = inclined soffit (L_incl × W) + riser faces (n × R × W) + landing soffit. Divide by 2.97 m² per plywood sheet (1.22 × 2.44 m) for the sheet count." },
];
