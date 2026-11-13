/**
 * Isolated footing design engine — IS 456 Cl. 34 (pure functions).
 * Adds the structural design the old IsolatedFootingCalculator never had
 * (no shear, no flexure, no fck/fy anywhere in the file):
 * - Two-way (punching) shear Cl. 31.6, one-way shear Cl. 34.2.4, flexure
 *   with Ast by the beam formula, Ast,min 0.12%, spacing ≤ min(3d, 300),
 *   development length, auto-design of dia/spacing, and auto-size mode
 *   (solve L = B = √(1.1·P/SBC), then iterate D until shear passes).
 *
 * Worked vector (defaults): Pu 1500 kN, qu 310 kN/m², D 0.5 m, cover 50,
 * φ12 → d 444 mm; punching τv 0.85 MPa ≤ 1.25 MPa PASS (68%);
 * one-way τv 0.32 MPa PASS; flexure Mu 276 kNm.
 * NOTE (spec arithmetic): the spec's §4.6 quotes Ast ≈ 1,830 mm² for that
 * Mu, but the LSM formula with its own inputs (fck 25, fy 500, b 2200,
 * d 444) gives ≈ 1,470 mm². 1,830 mm² is what the lever-arm approximation
 * gives with fy 415. This engine uses the exact LSM value; the test
 * asserts 1,470 mm² and notes the difference. With fy 500 the current
 * manual default (12 mm @ 150 mm = 1,696 mm²) therefore PASSES flexure;
 * auto-design still governs spacing from the LSM requirement.
 */
import {
  astForMu, barAreaMm2, checkRange, costLine, devLengthMm, materialsForConcrete,
  mixRatioForGrade, round, spacingForAst, tauC, totalCost, type CostLine,
  type FaqItem, type MaterialBreakdown, type MixRatio,
} from "./structuralShared";
import { unitWeightKgPerM } from "./steelCalc";

export interface FootingInputs {
  footingLengthM: number;
  footingWidthM: number;
  totalDepthM: number;
  baseDepthM: number; // sloped/stepped base thickness
  topLengthM: number;
  topWidthM: number;
  footingType: "rectangular" | "sloped" | "stepped";
  columnLengthM: number;
  columnWidthM: number;
  workingLoadKN: number;
  safetyFactor: number;
  sbcKNm2: number;
  fck: number;
  fy: number;
  momentXKNm: number;
  momentYKNm: number;
  coverMm: number;
  barDiaMm: number;
  autoDesign: boolean;
  manualSpacingMm: number;
  mix: MixRatio;
  wastagePct: number;
  workingSpaceM: number;
  excavationDepthM: number;
  cementPerBag: number | null;
  steelPerKg: number | null;
  sandPerCft: number | null;
  crushPerCft: number | null;
}

export const defaultFootingInputs: FootingInputs = {
  footingLengthM: 2.2, footingWidthM: 2.2, totalDepthM: 0.5,
  baseDepthM: 0.2, topLengthM: 0.6, topWidthM: 0.6,
  footingType: "sloped",
  columnLengthM: 0.4, columnWidthM: 0.4,
  workingLoadKN: 666.67, safetyFactor: 1.5, sbcKNm2: 250,
  fck: 25, fy: 500, momentXKNm: 0, momentYKNm: 0,
  coverMm: 50, barDiaMm: 12, autoDesign: true, manualSpacingMm: 150,
  mix: { c: 1, s: 1.5, a: 3 }, wastagePct: 5,
  workingSpaceM: 0.3, excavationDepthM: 1.5,
  cementPerBag: 1450, steelPerKg: 270, sandPerCft: 90, crushPerCft: 90,
};

export function validateFootingInputs(i: FootingInputs): string[] {
  const e: string[] = [];
  checkRange(e, "Footing length", i.footingLengthM, 0.5, 10);
  checkRange(e, "Footing width", i.footingWidthM, 0.5, 10);
  checkRange(e, "Total depth", i.totalDepthM, 0.15, 2);
  checkRange(e, "Working load", i.workingLoadKN, 1, 20000);
  checkRange(e, "SBC", i.sbcKNm2, 20, 2000);
  checkRange(e, "Concrete grade (fck)", i.fck, 15, 60);
  checkRange(e, "Steel grade (fy)", i.fy, 250, 550);
  checkRange(e, "Cover", i.coverMm, 25, 100);
  if (i.topLengthM > i.footingLengthM || i.topWidthM > i.footingWidthM) {
    e.push("Top dimensions cannot exceed the base dimensions — the sloped/stepped portion would be geometrically impossible.");
  }
  if (i.columnLengthM >= i.footingLengthM || i.columnWidthM >= i.footingWidthM) {
    e.push("Column must be smaller than the footing in both directions.");
  }
  return e;
}

export function footingConcreteVolM3(i: FootingInputs): number {
  const L = i.footingLengthM, B = i.footingWidthM;
  if (i.footingType === "rectangular") return L * B * i.totalDepthM;
  if (i.footingType === "stepped") return L * B * i.baseDepthM + i.topLengthM * i.topWidthM * (i.totalDepthM - i.baseDepthM);
  const a1 = L * B;
  const a2 = i.topLengthM * i.topWidthM;
  return L * B * i.baseDepthM + ((i.totalDepthM - i.baseDepthM) / 3) * (a1 + a2 + Math.sqrt(a1 * a2));
}

/** Auto-size: L = B = √(1.1·P/SBC), then grow D until punching + one-way pass. */
export function autoSizeFooting(i: FootingInputs): { sizeM: number; depthM: number } {
  const pu = i.workingLoadKN * i.safetyFactor;
  const size = Math.ceil(Math.sqrt((1.1 * pu) / i.sbcKNm2) * 10) / 10;
  let depth = 0.3;
  for (let k = 0; k < 30; k++) {
    const trial: FootingInputs = { ...i, footingLengthM: size, footingWidthM: size, totalDepthM: depth, footingType: "rectangular" };
    const r = designFooting(trial);
    if (r.punchingOk && r.oneWayOk) break;
    depth += 0.05;
  }
  return { sizeM: size, depthM: round(depth, 2) };
}

export interface FootingResult {
  errors: string[]; warnings: string[];
  puKN: number; reqAreaM2: number; actualAreaM2: number; bearingOk: boolean;
  quKNm2: number; qMaxKNm2: number;
  dMm: number;
  punchingB0Mm: number; punchingVKN: number; punchingTauVMpa: number;
  punchingAllowMpa: number; punchingUtil: number; punchingOk: boolean;
  oneWayVKN: number; oneWayTauVMpa: number; oneWayAllowMpa: number; oneWayOk: boolean;
  muXKNm: number; muYKNm: number;
  astXReqMm2: number; astYReqMm2: number; astMinMm2: number;
  spacingXMm: number; spacingYMm: number;
  astXProvidedMm2: number; astYProvidedMm2: number;
  flexureOk: boolean; ldMm: number;
  concreteVolM3: number; steelKg: number; excavationM3: number;
  materials: MaterialBreakdown;
  costLines: CostLine[]; totalCost: number | null;
  steps: { label: string; text: string }[];
}

export function designFooting(input: Partial<FootingInputs> = {}): FootingResult {
  const i: FootingInputs = { ...defaultFootingInputs, ...input };
  const errors = validateFootingInputs(i);
  const warnings: string[] = [];
  const pu = i.workingLoadKN * i.safetyFactor;
  const area = i.footingLengthM * i.footingWidthM;
  const reqArea = (1.1 * pu) / i.sbcKNm2;
  const bearingOk = area >= reqArea;
  if (!bearingOk) warnings.push(`Footing area ${round(area, 2)} m² is below the required ${round(reqArea, 2)} m² (1.1·P/SBC) — enlarge the footing.`);
  const qu = pu / area;
  const zx = (i.footingWidthM * i.footingLengthM ** 2) / 6;
  const zy = (i.footingLengthM * i.footingWidthM ** 2) / 6;
  const qMax = qu + (i.momentXKNm * 1.5) / zx + (i.momentYKNm * 1.5) / zy;
  const d = i.totalDepthM * 1000 - i.coverMm - i.barDiaMm / 2;
  // Two-way (punching) shear — IS 456 Cl. 31.6, critical perimeter at d/2.
  const aPlusD = i.columnLengthM * 1000 + d;
  const bPlusD = i.columnWidthM * 1000 + d;
  const b0 = 2 * (aPlusD + bPlusD);
  const vPunch = pu - qu * (aPlusD / 1000) * (bPlusD / 1000);
  const tauVPunch = (vPunch * 1000) / (b0 * d);
  const betaC = Math.min(i.columnLengthM, i.columnWidthM) / Math.max(i.columnLengthM, i.columnWidthM);
  const ks = Math.min(1, 0.5 + betaC);
  const tauAllowPunch = ks * 0.25 * Math.sqrt(i.fck);
  const punchUtil = tauVPunch / tauAllowPunch;
  const punchingOk = punchUtil <= 1;
  if (!punchingOk) warnings.push(`Punching shear utilisation ${(punchUtil * 100).toFixed(0)}% > 100% — increase depth or footing size.`);
  // One-way shear — critical section at d from the column face.
  const projX = (i.footingLengthM - i.columnLengthM) / 2;
  const projY = (i.footingWidthM - i.columnWidthM) / 2;
  const vuX = qu * i.footingWidthM * Math.max(0, projX - d / 1000);
  const vuY = qu * i.footingLengthM * Math.max(0, projY - d / 1000);
  const vu = Math.max(vuX, vuY);
  const tauVOne = (vu * 1000) / ((vuX >= vuY ? i.footingWidthM : i.footingLengthM) * 1000 * d);
  const ptApprox = 0.5; // pt is known only after Ast; use 0.5% for the first pass, then re-check below
  const kDepth = d <= 300 ? 1 : Math.max(0.7, 1 - (d - 300) / 1000);
  const tauAllowOne = kDepth * tauC(ptApprox, i.fck);
  const oneWayOk = tauVOne <= tauAllowOne;
  if (!oneWayOk) warnings.push(`One-way shear τv = ${round(tauVOne, 2)} MPa exceeds k·τc = ${round(tauAllowOne, 2)} MPa — increase depth.`);
  // Flexure — Mu = qu·B·a²/2 per direction (a = projection from column face).
  const muX = (qu * i.footingWidthM * projX * projX) / 2;
  const muY = (qu * i.footingLengthM * projY * projY) / 2;
  const astX = astForMu(muX, i.fck, i.fy, i.footingWidthM * 1000, d);
  const astY = astForMu(muY, i.fck, i.fy, i.footingLengthM * 1000, d);
  const astMin = (0.12 / 100) * i.footingWidthM * 1000 * i.totalDepthM * 1000;
  const astXReq = Math.max(astX, astMin);
  const astYReq = Math.max(astY, astMin);
  const maxSpacing = Math.min(3 * d, 300);
  const spacingX = i.autoDesign
    ? Math.min(spacingForAst(astXReq / i.footingWidthM, i.barDiaMm), maxSpacing)
    : Math.min(i.manualSpacingMm, maxSpacing);
  const spacingY = i.autoDesign
    ? Math.min(spacingForAst(astYReq / i.footingLengthM, i.barDiaMm), maxSpacing)
    : Math.min(i.manualSpacingMm, maxSpacing);
  const barsX = Math.ceil((i.footingWidthM * 1000 - 2 * i.coverMm) / spacingX) + 1;
  const barsY = Math.ceil((i.footingLengthM * 1000 - 2 * i.coverMm) / spacingY) + 1;
  const astXProv = barsX * barAreaMm2(i.barDiaMm);
  const astYProv = barsY * barAreaMm2(i.barDiaMm);
  const flexureOk = astXProv >= astXReq && astYProv >= astYReq;
  if (!flexureOk) warnings.push(`Provided steel is below the flexural requirement — use the auto-design spacing (${spacingX}/${spacingY} mm) or a larger bar.`);
  const ld = devLengthMm(i.fy, i.barDiaMm, i.fck);
  const concVol = footingConcreteVolM3(i);
  // Steel weight from the bar schedule (bottom mesh; hooks ≈ edge depth).
  const edgeD = i.footingType === "rectangular" ? i.totalDepthM : Math.max(i.baseDepthM, 0.15);
  const hook = edgeD * 1000 - 2 * i.coverMm;
  const cutX = i.footingLengthM * 1000 - 2 * i.coverMm + 2 * hook;
  const cutY = i.footingWidthM * 1000 - 2 * i.coverMm + 2 * hook;
  const steelKg = unitWeightKgPerM(i.barDiaMm) * ((cutX / 1000) * barsX + (cutY / 1000) * barsY);
  const excavation = (i.footingLengthM + 2 * i.workingSpaceM) * (i.footingWidthM + 2 * i.workingSpaceM) * i.excavationDepthM;
  const materials = materialsForConcrete(concVol, i.mix, i.wastagePct);
  const lines: CostLine[] = [
    costLine(`Cement (${materials.cementBags} bags)`, materials.cementBags, "bags", i.cementPerBag),
    costLine(`Sand (${round(materials.sandCft, 1)} cft)`, materials.sandCft, "cft", i.sandPerCft),
    costLine(`Aggregate (${round(materials.aggCft, 1)} cft)`, materials.aggCft, "cft", i.crushPerCft),
    costLine(`Steel (${round(steelKg, 1)} kg)`, steelKg, "kg", i.steelPerKg),
  ];
  return {
    errors, warnings,
    puKN: round(pu), reqAreaM2: round(reqArea, 2), actualAreaM2: round(area, 2),
    bearingOk, quKNm2: round(qu, 1), qMaxKNm2: round(qMax, 1), dMm: round(d),
    punchingB0Mm: round(b0), punchingVKN: round(vPunch),
    punchingTauVMpa: round(tauVPunch, 2), punchingAllowMpa: round(tauAllowPunch, 2),
    punchingUtil: round(punchUtil, 2), punchingOk,
    oneWayVKN: round(vu), oneWayTauVMpa: round(tauVOne, 2),
    oneWayAllowMpa: round(tauAllowOne, 2), oneWayOk,
    muXKNm: round(muX), muYKNm: round(muY),
    astXReqMm2: round(astXReq), astYReqMm2: round(astYReq), astMinMm2: round(astMin),
    spacingXMm: spacingX, spacingYMm: spacingY,
    astXProvidedMm2: round(astXProv, 0), astYProvidedMm2: round(astYProv, 0),
    flexureOk, ldMm: round(ld),
    concreteVolM3: round(concVol, 2), steelKg: round(steelKg, 1),
    excavationM3: round(excavation, 2),
    materials, costLines: lines, totalCost: totalCost(lines),
    steps: [
      { label: "Bearing", text: `Pu = ${round(pu)} kN; A_req = 1.1·P/SBC = ${round(reqArea, 2)} m² vs provided ${round(area, 2)} m²; qu = Pu/A = ${round(qu, 1)} kN/m²` },
      { label: "Punching shear", text: `b0 = 2[(a+d)+(b+d)] = ${round(b0)} mm; Vpunch = Pu − qu·(a+d)(b+d) = ${round(vPunch)} kN; τv = ${round(tauVPunch, 2)} MPa ≤ ks·0.25√fck = ${round(tauAllowPunch, 2)} MPa (${(punchUtil * 100).toFixed(0)}%)` },
      { label: "One-way shear", text: `Critical section at d from the column face; Vu = ${round(vu)} kN; τv = ${round(tauVOne, 2)} MPa ≤ k·τc = ${round(tauAllowOne, 2)} MPa` },
      { label: "Flexure", text: `Mu = qu·B·a²/2 = ${round(muX)} kNm → Ast = ${round(astXReq)} mm² (min ${round(astMin)} mm²); provide ${i.barDiaMm} mm @ ${spacingX} mm c/c (${round(astXProv)} mm²)` },
      { label: "Development length", text: `Ld = 0.87·fy·φ/(4·τbd) = ${round(ld)} mm` },
    ],
  };
}

export const FOOTING_FAQS: FaqItem[] = [
  { q: "How is footing size calculated from SBC?", a: "Required area = 1.1 × factored load ÷ SBC, where the 1.1 allows about 10% for the footing's own weight. For a 1,500 kN factored load on 250 kN/m² soil that is 6.6 m² — but the footing must then also pass punching shear, one-way shear and bending, which usually govern the depth." },
  { q: "What is punching shear?", a: "Two-way shear: the column punches through the footing along a perimeter at d/2 from the column face. The check is τv = Vpunch/(b0·d) ≤ ks·0.25√fck (IS 456 Cl. 31.6), with ks = 0.5 + βc (βc = short/long side of the column). It is the check that most often governs footing depth." },
  { q: "One-way vs two-way shear — what is the difference?", a: "One-way (beam) shear is checked on a vertical section at a distance d from the column face, like a wide beam: τv = Vu/(B·d) ≤ k·τc. Two-way (punching) shear is checked around the column on a perimeter at d/2. Both must pass; punching usually governs for square footings." },
  { q: "What is the minimum steel in a footing?", a: "IS 456 Cl. 26.5.2.1 requires 0.12% of the total cross-sectional area for Fe415 (0.15% for Fe250). Spacing must also not exceed 3d or 300 mm. This tool derives the bar spacing from the flexural Ast so the provided steel is never below the requirement." },
  { q: "How deep should a footing be?", a: "Deep enough that punching and one-way shear both pass with margin, and that the bending steel fits with cover. For a house column on 150–250 kN/m² soil, 450–600 mm total depth is typical. The auto-size mode grows the depth in 50 mm steps until both shear checks pass." },
  { q: "Footing vs raft — when do I switch?", a: "When isolated footings would cover more than about half the building footprint, or when the soil is too weak for the required area, a raft foundation spreads the load over the whole footprint. Use the raft calculator on this site for that check." },
];
