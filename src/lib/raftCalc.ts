/**
 * Raft (mat) foundation engine — IS 2950 / IS 456 (pure functions).
 * Full build: the old RaftFoundationDesigner was a placeholder with two
 * dead inputs and a false "verified here" claim. This engine computes
 * bearing pressures with eccentric load, kern check, immediate +
 * consolidation settlement, punching shear per column, strip flexure,
 * quantities and cost.
 */
import {
  astForMu, checkRange, costLine, materialsForConcrete,
  mixRatioForGrade, round, totalCost, type CostLine, type FaqItem,
  type MaterialBreakdown,
} from "./structuralShared";

export interface RaftInputs {
  lengthM: number;
  widthM: number;
  thicknessM: number;
  totalLoadKN: number; // service load
  exM: number; // eccentricity about the width axis
  eyM: number; // eccentricity about the length axis
  sbcKNm2: number;
  soilModulusMPa: number;
  poisson: number;
  cc: number; // compression index (0 = skip consolidation)
  clayThicknessM: number;
  e0: number;
  sigmaV0KPa: number;
  deltaSigmaRatio: number; // Δσ / q_avg
  fck: number;
  fy: number;
  colSizeMm: number; // square column side
  colLoadKN: number; // service load per column
  coverMm: number;
  depthM: number; // foundation depth for excavation
  wastagePct: number;
  cementPerBag: number | null;
  steelPerKg: number | null;
  sandPerCft: number | null;
  crushPerCft: number | null;
}

export const defaultRaftInputs: RaftInputs = {
  lengthM: 12, widthM: 20, thicknessM: 0.6,
  totalLoadKN: 24000, exM: 0.6, eyM: 0.4,
  sbcKNm2: 150, soilModulusMPa: 25, poisson: 0.3,
  cc: 0.25, clayThicknessM: 4, e0: 0.9, sigmaV0KPa: 80, deltaSigmaRatio: 0.6,
  fck: 30, fy: 500, colSizeMm: 400, colLoadKN: 1500,
  coverMm: 75, depthM: 1.5, wastagePct: 5,
  cementPerBag: 1450, steelPerKg: 270, sandPerCft: 90, crushPerCft: 90,
};

export function validateRaftInputs(i: RaftInputs): string[] {
  const e: string[] = [];
  checkRange(e, "Raft length", i.lengthM, 1, 100);
  checkRange(e, "Raft width", i.widthM, 1, 100);
  checkRange(e, "Raft thickness", i.thicknessM, 0.3, 2);
  checkRange(e, "Total load", i.totalLoadKN, 1, 1000000);
  checkRange(e, "SBC", i.sbcKNm2, 50, 1000);
  checkRange(e, "Soil modulus", i.soilModulusMPa, 1, 200);
  checkRange(e, "Concrete grade (fck)", i.fck, 20, 60);
  checkRange(e, "Steel grade (fy)", i.fy, 250, 550);
  if (Math.abs(i.exM) >= i.widthM / 2) e.push("Eccentricity ex must be less than B/2, otherwise part of the raft lifts off — no contact.");
  if (Math.abs(i.eyM) >= i.lengthM / 2) e.push("Eccentricity ey must be less than L/2, otherwise part of the raft lifts off — no contact.");
  if (i.cc < 0) e.push("Compression index Cc cannot be negative.");
  return e;
}

export interface RaftResult {
  errors: string[]; warnings: string[];
  areaM2: number; qAvgKPa: number; qMaxKPa: number; qMinKPa: number;
  kernOk: boolean; bearingOk: boolean;
  settlementImmediateMm: number; settlementConsolidationMm: number;
  settlementTotalMm: number; settlementOk: boolean;
  punchingTauVMpa: number; punchingAllowMpa: number; punchingUtil: number; punchingOk: boolean;
  dMm: number; astTopMm2PerM: number; astBottomMm2PerM: number;
  muStripKNmPerM: number;
  concreteVolM3: number; steelKg: number; formworkM2: number;
  excavationM3: number; materials: MaterialBreakdown;
  costLines: CostLine[]; totalCost: number | null;
  steps: { label: string; text: string }[];
}

export function designRaft(input: Partial<RaftInputs> = {}): RaftResult {
  const i: RaftInputs = { ...defaultRaftInputs, ...input };
  const errors = validateRaftInputs(i);
  const warnings: string[] = [];
  const area = i.lengthM * i.widthM;
  const qAvg = i.totalLoadKN / area;
  const qMax = qAvg * (1 + (6 * Math.abs(i.exM)) / i.widthM + (6 * Math.abs(i.eyM)) / i.lengthM);
  const qMin = qAvg * (1 - (6 * Math.abs(i.exM)) / i.widthM - (6 * Math.abs(i.eyM)) / i.lengthM);
  const kernOk = Math.abs(i.exM) <= i.widthM / 6 && Math.abs(i.eyM) <= i.lengthM / 6;
  const bearingOk = qMax <= i.sbcKNm2 && qMin >= 0;
  if (!bearingOk) warnings.push(`Bearing pressure qmax = ${round(qMax, 1)} kPa exceeds SBC ${i.sbcKNm2} kPa or qmin < 0 — enlarge the raft or improve the ground.`);
  if (!kernOk) warnings.push("Resultant falls outside the middle third — corner pressures are tensile in theory; widen the raft or shift the load.");
  // Immediate settlement: si = q·B·(1−ν²)·If/Es, If ≈ 1.0 (flexible raft, average)
  const siM = ((qAvg * 1000) * i.widthM * (1 - i.poisson * i.poisson) * 1.0) / (i.soilModulusMPa * 1e6);
  const siMm = siM * 1000;
  const dSigma = i.deltaSigmaRatio * qAvg;
  const scM = i.cc > 0
    ? (i.clayThicknessM / (1 + i.e0)) * i.cc * Math.log10((i.sigmaV0KPa + dSigma) / i.sigmaV0KPa)
    : 0;
  const scMm = scM * 1000;
  const totalSettle = siMm + scMm;
  const settlementOk = totalSettle <= 50;
  if (!settlementOk) warnings.push(`Total settlement ${round(totalSettle)} mm exceeds the usual 50 mm limit for a raft — thicken the raft, improve the ground, or consider piles.`);
  // Punching at one interior column (IS 456 Cl. 31.6.3)
  const d = i.thicknessM * 1000 - i.coverMm - 10;
  const cPlusD = i.colSizeMm + d;
  const b0 = 2 * (cPlusD + cPlusD);
  const qu = (1.5 * i.totalLoadKN) / area; // factored average pressure, kN/m2
  const vPunch = 1.5 * i.colLoadKN - qu * (cPlusD / 1000) ** 2;
  const tauV = (vPunch * 1000) / (b0 * d);
  const betaC = 1; // square column
  const ks = Math.min(1, 0.5 + betaC);
  const tauAllow = ks * 0.25 * Math.sqrt(i.fck);
  const util = tauV / tauAllow;
  const punchingOk = util <= 1;
  if (!punchingOk) warnings.push(`Punching shear utilisation ${(util * 100).toFixed(0)}% > 100% — thicken the raft or add a column capital / drop panel.`);
  // Strip flexure: 1 m wide strip, simply-supported span = column spacing proxy
  // (use the shorter plan dimension / 4 as a conservative strip span), q factored.
  const stripSpan = Math.min(i.lengthM, i.widthM) / 4;
  const muStrip = (qu * stripSpan * stripSpan) / 8;
  const astFlex = astForMu(muStrip, i.fck, i.fy, 1000, d);
  const astMin = (0.12 / 100) * 1000 * i.thicknessM * 1000; // IS 456 Cl. 26.5.2.1: 0.12% of total area
  const astReq = Math.max(astFlex, astMin);
  const concVol = area * i.thicknessM;
  // Steel: top + bottom mats each way at the required Ast per m (min governs in practice)
  const steelPerM2 = (astReq * 2 * 2) / 1e6 * 7850; // kg/m2 (2 faces x 2 directions)
  const steelKg = steelPerM2 * area;
  const formwork = 2 * (i.lengthM + i.widthM) * i.thicknessM;
  const excavation = (i.lengthM + 0.6) * (i.widthM + 0.6) * i.depthM;
  const materials = materialsForConcrete(concVol, mixRatioForGrade(i.fck), i.wastagePct);
  const lines: CostLine[] = [
    costLine(`Cement (${materials.cementBags} bags)`, materials.cementBags, "bags", i.cementPerBag),
    costLine(`Sand (${round(materials.sandCft, 1)} cft)`, materials.sandCft, "cft", i.sandPerCft),
    costLine(`Aggregate (${round(materials.aggCft, 1)} cft)`, materials.aggCft, "cft", i.crushPerCft),
    costLine(`Steel (${round(steelKg, 1)} kg)`, steelKg, "kg", i.steelPerKg),
  ];
  return {
    errors, warnings,
    areaM2: round(area, 1), qAvgKPa: round(qAvg, 1), qMaxKPa: round(qMax, 1), qMinKPa: round(qMin, 1),
    kernOk, bearingOk,
    settlementImmediateMm: round(siMm, 1), settlementConsolidationMm: round(scMm, 1),
    settlementTotalMm: round(totalSettle, 1), settlementOk,
    punchingTauVMpa: round(tauV, 2), punchingAllowMpa: round(tauAllow, 2),
    punchingUtil: round(util, 2), punchingOk,
    dMm: round(d), astTopMm2PerM: round(astReq), astBottomMm2PerM: round(astReq),
    muStripKNmPerM: round(muStrip, 1),
    concreteVolM3: round(concVol, 2), steelKg: round(steelKg, 1),
    formworkM2: round(formwork, 2), excavationM3: round(excavation, 2),
    materials, costLines: lines, totalCost: totalCost(lines),
    steps: [
      { label: "Bearing pressure", text: `A = ${i.lengthM} × ${i.widthM} = ${round(area)} m²; q_avg = P/A = ${round(qAvg, 1)} kPa; qmax = q_avg·(1 + 6ex/B + 6ey/L) = ${round(qMax, 1)} kPa; qmin = ${round(qMin, 1)} kPa` },
      { label: "Kern check", text: `Resultant inside middle third iff ex ≤ B/6 = ${round(i.widthM / 6, 2)} m and ey ≤ L/6 = ${round(i.lengthM / 6, 2)} m — ${kernOk ? "PASS" : "FAIL"}` },
      { label: "Settlement", text: `Immediate si = q·B·(1−ν²)·If/Es = ${round(siMm, 1)} mm; consolidation sc = (Hc/(1+e0))·Cc·log10((σ′v0+Δσ)/σ′v0) = ${round(scMm, 1)} mm; total ${round(totalSettle, 1)} mm vs 50 mm limit` },
      { label: "Punching shear", text: `b0 = 2[(c+d)+(c+d)] = ${round(b0)} mm; τv = ${round(tauV, 2)} MPa ≤ ks·0.25√fck = ${round(tauAllow, 2)} MPa (utilisation ${(util * 100).toFixed(0)}%)` },
      { label: "Flexure", text: `Strip Mu = ${round(muStrip, 1)} kNm/m → Ast = ${round(astReq)} mm²/m each way, top and bottom (min 0.12% governs where noted)` },
    ],
  };
}

export const RAFT_FAQS: FaqItem[] = [
  { q: "When is a raft needed instead of isolated footings?", a: "When the total footing area would exceed about half the building footprint, when the soil is weak or the water table is high, or when columns are so close that their footings overlap. A raft spreads the load over the whole footprint, so the bearing pressure drops and differential settlement is reduced." },
  { q: "How is bearing pressure calculated with an eccentric load?", a: "q = (P/A)·(1 ± 6ex/B ± 6ey/L). The corners see the highest and lowest pressures. If the eccentricity exceeds B/6 (or L/6) the resultant leaves the middle third and one edge would theoretically lift — the pressure diagram becomes triangular and the effective area shrinks." },
  { q: "What settlement is acceptable for a raft?", a: "Total settlement of about 50 mm is the usual limit for a raft on clay, with differential settlement kept much smaller (about 1/500 of the span). This tool reports immediate (elastic) and consolidation settlement separately so you can see which one governs." },
  { q: "How thick should a raft be?", a: "Punching shear at the columns usually governs. Start with 500–800 mm for a normal house and check τv ≤ ks·0.25√fck at each column; if it fails, thicken the raft or add drop panels under the columns." },
  { q: "Does SBC increase for raft foundations?", a: "IS 1893 allows the bearing capacity to be increased for raft foundations (the code's factor is applied in seismic combinations), and IS 2950 notes that a raft mobilises a larger soil mass. This tool checks against the SBC you enter — apply any code increase to that input and note it, rather than hiding it in the maths." },
  { q: "What is punching shear in a raft?", a: "The column punches through the raft along a perimeter at d/2 from the column face. The check is τv = Vpunch/(b0·d) ≤ ks·0.25√fck, where Vpunch is the column load minus the soil pressure acting inside the punching perimeter." },
];
