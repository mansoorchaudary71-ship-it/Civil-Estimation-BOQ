/**
 * Pile foundation engine — IS 2911 (pure functions).
 * Full build: the old PileFoundationCalculator was a placeholder with zero
 * inputs. Implements the α-method (clay) and β-method (sand) for layered
 * soils, end bearing, Converse–Labarre group efficiency, block failure
 * (clay), required pile count for a given column load, settlement estimate,
 * and pile + cap quantities and cost.
 */
import {
  checkRange, costLine, materialsForConcrete, mixRatioForGrade, round,
  totalCost, type CostLine, type FaqItem, type MaterialBreakdown,
} from "./structuralShared";
import { unitWeightKgPerM } from "./steelCalc";

export type PileType = "bored" | "driven";
export type SoilType = "clay" | "sand";

export interface PileLayer {
  thicknessM: number;
  gammaKNm3: number;
  cuKPa?: number; // clay
  phiDeg?: number; // sand
  alpha?: number; // clay adhesion factor (default by cu)
  beta?: number; // sand β = K·tanδ (default by φ)
}

export interface PileInputs {
  pileType: PileType;
  soilType: SoilType;
  diameterM: number;
  lengthM: number;
  layers: PileLayer[];
  fos: number;
  // Direct (Firgelli-style) override: when set, Qb/Qs are computed from
  // these instead of the layered soil model.
  directSigmaVTipKPa?: number;
  directNq?: number;
  directFsKPa?: number;
  totalLoadKN: number;
  groupRows: number;
  groupCols: number;
  spacingM: number;
  capLengthM: number;
  capWidthM: number;
  capDepthM: number;
  fck: number;
  fy: number;
  wastagePct: number;
  cementPerBag: number | null;
  steelPerKg: number | null;
  sandPerCft: number | null;
  crushPerCft: number | null;
}

export const defaultPileInputs: PileInputs = {
  pileType: "bored",
  soilType: "sand",
  diameterM: 0.5,
  lengthM: 15,
  layers: [{ thicknessM: 15, gammaKNm3: 18, phiDeg: 32, beta: 0.35 }],
  fos: 2.5,
  totalLoadKN: 5000,
  groupRows: 2,
  groupCols: 3,
  spacingM: 1.5,
  capLengthM: 3.5,
  capWidthM: 2.0,
  capDepthM: 0.8,
  fck: 25,
  fy: 500,
  wastagePct: 5,
  cementPerBag: 1450, steelPerKg: 270, sandPerCft: 90, crushPerCft: 90,
};

/** Nq by friction angle φ (IS 2911 / Berezantsev table, interpolated). */
export function nqForPhi(phiDeg: number): number {
  const table: [number, number][] = [[20, 8], [25, 12], [28, 16], [30, 20], [32, 26], [35, 35], [38, 48], [40, 60], [45, 100]];
  if (phiDeg <= 20) return 8;
  if (phiDeg >= 45) return 100;
  for (let i = 0; i < table.length - 1; i++) {
    const [x0, y0] = table[i];
    const [x1, y1] = table[i + 1];
    if (phiDeg >= x0 && phiDeg <= x1) return y0 + ((y1 - y0) * (phiDeg - x0)) / (x1 - x0);
  }
  return 20;
}

/** Adhesion factor α by undrained cohesion cu (kPa) — α-method. */
export function alphaForCu(cuKPa: number): number {
  if (cuKPa <= 25) return 0.9;
  if (cuKPa <= 100) return 0.5;
  if (cuKPa <= 175) return 0.4;
  return 0.3;
}

/** β = K·tanδ by φ — sand skin friction (K ≈ 1.0 bored, 1.5 driven). */
export function betaForPhi(phiDeg: number, pileType: PileType): number {
  const k = pileType === "driven" ? 1.5 : 1.0;
  const delta = ((phiDeg - 5) * Math.PI) / 180; // δ ≈ φ − 5°
  return k * Math.tan(delta);
}

export function validatePileInputs(i: PileInputs): string[] {
  const e: string[] = [];
  checkRange(e, "Pile diameter", i.diameterM, 0.3, 2.0);
  checkRange(e, "Pile length", i.lengthM, 3, 40);
  checkRange(e, "Factor of safety", i.fos, 2.0, 3.0);
  checkRange(e, "Total column load", i.totalLoadKN, 1, 100000);
  if (i.spacingM < 2.5 * i.diameterM) e.push(`Pile spacing ${i.spacingM} m is below the IS 2911 minimum of 2.5D = ${(2.5 * i.diameterM).toFixed(2)} m.`);
  else if (i.spacingM < 3 * i.diameterM) e.push("Note: spacing below 3D is allowed but group efficiency drops — 3D is the usual minimum for bored piles.");
  const layerTotal = i.layers.reduce((s, l) => s + l.thicknessM, 0);
  if (Math.abs(layerTotal - i.lengthM) > 0.01) e.push(`Soil layer thicknesses total ${layerTotal.toFixed(2)} m but pile length is ${i.lengthM} m — they must match.`);
  for (const l of i.layers) {
    if (i.soilType === "clay" && (l.cuKPa == null || l.cuKPa < 0 || l.cuKPa > 300)) e.push("Clay layer cu must be between 0 and 300 kPa.");
    if (i.soilType === "sand" && (l.phiDeg == null || l.phiDeg < 20 || l.phiDeg > 45)) e.push("Sand layer φ must be between 20° and 45°.");
  }
  return e;
}

export interface PileResult {
  errors: string[]; warnings: string[];
  abM2: number; perimeterM: number;
  qbKN: number; qsKN: number; quKN: number; qallKN: number;
  requiredPiles: number;
  groupEta: number; groupCapacityKN: number;
  blockCapacityKN: number | null; groupGoverns: "single-pile group" | "block failure";
  groupCapacityPerPileKN: number;
  settlementMm: number;
  pileConcreteM3: number; capConcreteM3: number; concreteVolM3: number;
  pileSteelKg: number; capSteelKg: number; totalSteelKg: number;
  materials: MaterialBreakdown;
  costLines: CostLine[]; totalCost: number | null;
  steps: { label: string; text: string }[];
}

export function designPile(input: Partial<PileInputs> = {}): PileResult {
  const i: PileInputs = { ...defaultPileInputs, ...input };
  const errors = validatePileInputs(i);
  const warnings: string[] = [];
  const ab = (Math.PI * i.diameterM * i.diameterM) / 4;
  const per = Math.PI * i.diameterM;
  let qb = 0;
  let qs = 0;
  let sigmaVTip = 0;
  if (i.directSigmaVTipKPa != null && i.directNq != null && i.directFsKPa != null) {
    // Firgelli worked-example mode (unit-test vector).
    sigmaVTip = i.directSigmaVTipKPa;
    qb = ab * sigmaVTip * i.directNq;
    qs = per * i.lengthM * i.directFsKPa;
  } else {
    // Layered model: effective stress accumulated down the pile.
    let depth = 0;
    let sigmaV = 0;
    const baseLayer = i.layers[i.layers.length - 1];
    for (const layer of i.layers) {
      const midSigmaV = sigmaV + (layer.gammaKNm3 * layer.thicknessM) / 2;
      if (i.soilType === "clay") {
        const alpha = layer.alpha ?? alphaForCu(layer.cuKPa ?? 50);
        qs += alpha * (layer.cuKPa ?? 50) * per * layer.thicknessM;
      } else {
        const beta = layer.beta ?? betaForPhi(layer.phiDeg ?? 30, i.pileType);
        qs += beta * midSigmaV * per * layer.thicknessM;
      }
      sigmaV += layer.gammaKNm3 * layer.thicknessM;
      depth += layer.thicknessM;
    }
    sigmaVTip = sigmaV;
    if (i.soilType === "clay") {
      qb = 9 * (baseLayer.cuKPa ?? 50) * ab; // Nc = 9
    } else {
      qb = ab * sigmaVTip * nqForPhi(baseLayer.phiDeg ?? 30);
    }
  }
  const qu = qb + qs;
  const qall = qu / i.fos;
  const requiredPiles = Math.max(1, Math.ceil(i.totalLoadKN / qall));
  if (qall < i.totalLoadKN / (i.groupRows * i.groupCols)) {
    warnings.push(`Allowable capacity ${round(qall)} kN/pile is below the load per pile in the ${i.groupRows}×${i.groupCols} group — add piles or lengthen them.`);
  }
  // Converse–Labarre group efficiency
  const m = i.groupRows;
  const n = i.groupCols;
  const thetaDeg = (Math.atan(i.diameterM / i.spacingM) * 180) / Math.PI;
  const eta = Math.max(0.3, 1 - (thetaDeg / 90) * (((n - 1) * m + (m - 1) * n) / (m * n)));
  const groupCap = eta * m * n * qu;
  // Block failure (clay): Qu,block = 9·cu·Ab,block + α·cu·Pblock·L
  let blockCap: number | null = null;
  if (i.soilType === "clay") {
    const blockL = (n - 1) * i.spacingM + i.diameterM;
    const blockW = (m - 1) * i.spacingM + i.diameterM;
    const cuBase = i.layers[i.layers.length - 1].cuKPa ?? 50;
    const alpha = alphaForCu(cuBase);
    blockCap = 9 * cuBase * blockL * blockW + alpha * cuBase * 2 * (blockL + blockW) * i.lengthM;
  }
  const groupGoverns = blockCap != null && blockCap < groupCap ? "block failure" : "single-pile group";
  const groupCapPerPile = Math.min(groupCap, blockCap ?? Infinity) / (m * n);
  // Settlement: elastic shortening of the pile + soil compression (Vesic approx).
  const ap = ab;
  const ec = 5000 * Math.sqrt(i.fck);
  const elasticMm = ((i.totalLoadKN / (m * n)) * 1000 * i.lengthM) / (ap * 1e6 * ec) * 1000;
  const soilSettleMm = 0.01 * i.diameterM * 1000 * (qall / Math.max(qu, 1)) * 2;
  const settlement = elasticMm + soilSettleMm;
  const pileConc = ab * i.lengthM * requiredPiles;
  const capConc = i.capLengthM * i.capWidthM * i.capDepthM;
  const concVol = pileConc + capConc;
  // Pile cage: 6 × 16 mm main + 8 mm spiral @ 150 mm.
  const spiralTurns = Math.ceil(i.lengthM / 0.15);
  const spiralLenPerPile = spiralTurns * Math.sqrt((Math.PI * (i.diameterM - 0.08)) ** 2 + 0.15 ** 2);
  const pileSteel = (6 * unitWeightKgPerM(16) * i.lengthM + unitWeightKgPerM(8) * spiralLenPerPile) * requiredPiles;
  const capSteel = capConc * 100; // ~100 kg/m³ for a pile cap
  const totalSteel = pileSteel + capSteel;
  const materials = materialsForConcrete(concVol, mixRatioForGrade(i.fck), i.wastagePct);
  const lines: CostLine[] = [
    costLine(`Cement (${materials.cementBags} bags)`, materials.cementBags, "bags", i.cementPerBag),
    costLine(`Sand (${round(materials.sandCft, 1)} cft)`, materials.sandCft, "cft", i.sandPerCft),
    costLine(`Aggregate (${round(materials.aggCft, 1)} cft)`, materials.aggCft, "cft", i.crushPerCft),
    costLine(`Steel (${round(totalSteel, 1)} kg)`, totalSteel, "kg", i.steelPerKg),
  ];
  return {
    errors, warnings,
    abM2: round(ab, 3), perimeterM: round(per, 2),
    qbKN: round(qb), qsKN: round(qs), quKN: round(qu), qallKN: round(qall),
    requiredPiles,
    groupEta: round(eta, 3), groupCapacityKN: round(groupCap),
    blockCapacityKN: blockCap == null ? null : round(blockCap),
    groupGoverns, groupCapacityPerPileKN: round(groupCapPerPile),
    settlementMm: round(settlement, 1),
    pileConcreteM3: round(pileConc, 2), capConcreteM3: round(capConc, 2),
    concreteVolM3: round(concVol, 2),
    pileSteelKg: round(pileSteel, 1), capSteelKg: round(capSteel, 1),
    totalSteelKg: round(totalSteel, 1),
    materials, costLines: lines, totalCost: totalCost(lines),
    steps: [
      { label: "End bearing", text: i.soilType === "clay"
        ? `Qb = Nc·cu·Ab = 9 × ${i.layers[i.layers.length - 1].cuKPa ?? 50} × ${round(ab, 3)} = ${round(qb)} kN`
        : `Qb = Ab·σ′v·Nq = ${round(ab, 3)} × ${round(sigmaVTip)} × ${i.directNq ?? nqForPhi(i.layers[i.layers.length - 1].phiDeg ?? 30)} = ${round(qb)} kN` },
      { label: "Skin friction", text: i.soilType === "clay"
        ? `Qs = Σ α·cu·πD·Li (α-method) = ${round(qs)} kN`
        : `Qs = Σ β·σ′v·πD·Li (β-method) = ${round(qs)} kN` },
      { label: "Ultimate & allowable", text: `Qu = Qb + Qs = ${round(qu)} kN; Qall = Qu / FoS ${i.fos} = ${round(qall)} kN per pile` },
      { label: "Piles required", text: `n = ceil(${i.totalLoadKN} / ${round(qall)}) = ${requiredPiles} piles` },
      { label: "Group", text: `Converse–Labarre η = ${round(eta, 3)}; group Qu = ${round(groupCap)} kN${blockCap != null ? `; block failure = ${round(blockCap)} kN — ${groupGoverns} governs` : ""}` },
      { label: "Settlement", text: `Elastic shortening + soil compression ≈ ${round(settlement, 1)} mm (approximate — confirm with a load test for large projects)` },
    ],
  };
}

export const PILE_FAQS: FaqItem[] = [
  { q: "End-bearing vs friction piles — what is the difference?", a: "An end-bearing pile transfers most of its load through its tip onto a hard stratum (Qb dominates). A friction pile transfers load along its shaft through skin friction (Qs dominates) and is used where no hard stratum is within reach. Most real piles carry load by both mechanisms — this tool reports Qb and Qs separately." },
  { q: "How is skin friction calculated in clay vs sand?", a: "In clay the α-method is used: fs = α·cu, where α depends on the undrained cohesion (about 0.9 for soft clay, 0.5 for stiff clay). In sand the β-method is used: fs = β·σ′v, where β = K·tanδ depends on the friction angle and whether the pile is bored or driven." },
  { q: "What is group efficiency?", a: "Piles in a group carry less per pile than a single isolated pile because their stress zones overlap. The Converse–Labarre formula η = 1 − (θ/90)·[(n−1)m + (m−1)n]/(m·n), with θ = arctan(D/s), gives the efficiency — typically 0.7–1.0. Wider spacing raises it." },
  { q: "What is the minimum spacing of piles?", a: "IS 2911 requires at least 2.5 times the pile diameter centre-to-centre, and 3D is the usual practical minimum for bored piles. Closer spacing reduces group efficiency and can cause installation problems." },
  { q: "What factor of safety is used for piles?", a: "2.5 is the usual factor of safety on ultimate capacity for a single pile (IS 2911), giving Qall = Qu/2.5. Use 2.0 only with a load test, and 3.0 where the soil data is poor or the consequences of failure are high." },
  { q: "What is negative skin friction?", a: "When the soil around a pile settles (for example a soft clay consolidating under new fill), it drags the pile down instead of supporting it. That drag is negative skin friction — it adds load to the pile rather than capacity, and must be added to the structural load in design." },
];
