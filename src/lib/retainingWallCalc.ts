/**
 * Retaining wall engine — Rankine earth pressure + IS 456 flexure (pure).
 *
 * Fixes over the old RetainingWallCalculator (G7 spec §4.7):
 * - Defaults fixed: base width 2.5 → 3.0 m, toe 0.7 → 0.9 m (the old
 *   defaults FAILED sliding, FS_slide = 1.49 < 1.5, with no remedy offered).
 * - Auto-fix suggestions per failure (widen base / add shear key) and a
 *   solve-for-B mode (minimum base width for FS_over ≥ 2.0, FS_slide ≥ 1.5,
 *   qmax ≤ SBC).
 * - Stem flexural design (moment at stem base, Ast, min steel) and base
 *   slab design (heel/toe moments, Ast top + bottom) — the old code
 *   admitted "Base added later" and the base steel was missing from the BOQ.
 * - Options: passive pressure in front of the toe, shear key, sloped
 *   backfill (Coulomb Ka), seismic coefficient (IS 1893, simplified).
 * - Heel is derived (B − toe − stem_bot), never over-constrained.
 *
 * NOTE (spec arithmetic): the spec's §4.7 quotes a stem moment of
 * 52.1 kNm/m (46.0 × 3.4/3) and Ast ≈ 640 mm²/m. That treats the
 * surcharge pressure as triangular; the exact split is
 * M = Pa,soil·H/3 + Pa,sur·H/2 = 39.3 + 19.3 = 58.6 kNm/m at total height,
 * and at the stem base (h = 3.0 m) M = 42.0 kNm/m → Ast ≈ 423 mm²/m by
 * the LSM formula (min steel 480 mm²/m governs). This engine uses the
 * exact split at the stem base; tests assert those values and note the
 * difference.
 */
import {
  astForMu, barAreaMm2, checkRange, costLine, materialsForConcrete,
  mixRatioForGrade, round, spacingForAst, totalCost, type CostLine,
  type FaqItem, type MaterialBreakdown, type MixRatio,
} from "./structuralShared";
import { unitWeightKgPerM } from "./steelCalc";

export interface RetainingInputs {
  stemHeightM: number;
  wallLengthM: number;
  baseWidthM: number;
  baseDepthM: number;
  stemTopM: number;
  stemBottomM: number;
  toeM: number;
  gammaKNm3: number;
  phiDeg: number;
  surchargeKNm2: number;
  mu: number;
  sbcKNm2: number;
  fck: number;
  fy: number;
  coverMm: number;
  vertDiaMm: number;
  vertSpacingMm: number;
  horizDiaMm: number;
  horizSpacingMm: number;
  mix: MixRatio;
  passivePressure: boolean;
  passiveDepthM: number;
  shearKey: boolean;
  shearKeyDepthM: number;
  backfillSlopeDeg: number;
  seismicKh: number;
  wastagePct: number;
  cementPerBag: number | null;
  steelPerKg: number | null;
  sandPerCft: number | null;
  crushPerCft: number | null;
}

export const defaultRetainingInputs: RetainingInputs = {
  stemHeightM: 3.0, wallLengthM: 10, baseWidthM: 3.0, baseDepthM: 0.4,
  stemTopM: 0.2, stemBottomM: 0.4, toeM: 0.9,
  gammaKNm3: 18, phiDeg: 30, surchargeKNm2: 10, mu: 0.5, sbcKNm2: 200,
  fck: 25, fy: 500, coverMm: 40,
  vertDiaMm: 16, vertSpacingMm: 150, horizDiaMm: 10, horizSpacingMm: 200,
  mix: { c: 1, s: 1.5, a: 3 },
  passivePressure: false, passiveDepthM: 0.5,
  shearKey: false, shearKeyDepthM: 0.3,
  backfillSlopeDeg: 0, seismicKh: 0,
  wastagePct: 5,
  cementPerBag: 1450, steelPerKg: 270, sandPerCft: 90, crushPerCft: 90,
};

/** Rankine Ka for level backfill; Coulomb-style correction for slope β. */
export function kaFor(phiDeg: number, betaDeg = 0): number {
  const phi = (phiDeg * Math.PI) / 180;
  const beta = (betaDeg * Math.PI) / 180;
  if (betaDeg === 0) return (1 - Math.sin(phi)) / (1 + Math.sin(phi));
  const cosB = Math.cos(beta);
  const sinP = Math.sin(phi);
  const ratio = Math.sqrt(Math.max(0, sinP * sinP - Math.sin(beta) * Math.sin(beta))) / cosB;
  return cosB * (cosB - ratio) / (cosB + ratio);
}

export function validateRetainingInputs(i: RetainingInputs): string[] {
  const e: string[] = [];
  checkRange(e, "Stem height", i.stemHeightM, 1, 8);
  checkRange(e, "Base width", i.baseWidthM, 0.5, 10);
  checkRange(e, "Base depth", i.baseDepthM, 0.2, 1.5);
  checkRange(e, "Friction angle φ", i.phiDeg, 20, 45);
  checkRange(e, "Base friction μ", i.mu, 0.1, 1);
  checkRange(e, "SBC", i.sbcKNm2, 50, 1000);
  if (i.toeM + i.stemBottomM >= i.baseWidthM) e.push("Toe + stem bottom width must be less than the base width (heel would be ≤ 0).");
  if (i.mu > Math.tan((i.phiDeg * Math.PI) / 180)) e.push("Base friction μ exceeds tan φ of the foundation soil — reduce μ (it cannot exceed the soil's own friction).");
  return e;
}

export interface RetainingResult {
  errors: string[]; warnings: string[]; suggestions: string[];
  heelM: number; totalHeightM: number; ka: number; kp: number;
  paSoilKN: number; paSurKN: number; drivingKN: number;
  sumWKN: number; resistingKN: number;
  fsSliding: number; fsOverturning: number;
  xBarM: number; eccentricityM: number; qMaxKPa: number; qMinKPa: number;
  slidingOk: boolean; overturningOk: boolean; bearingOk: boolean;
  stemMuKNmPerM: number; stemAstMm2PerM: number; stemAstMinMm2PerM: number;
  stemSpacingMm: number; stemOk: boolean;
  toeMuKNmPerM: number; heelMuKNmPerM: number;
  toeAstMm2PerM: number; heelAstMm2PerM: number;
  baseSteelKg: number; stemSteelKg: number; totalSteelKg: number;
  concreteVolM3: number; materials: MaterialBreakdown;
  minBaseWidthM: number;
  costLines: CostLine[]; totalCost: number | null;
  steps: { label: string; text: string }[];
}

export function designRetainingWall(input: Partial<RetainingInputs> = {}, internal?: { skipSolveB?: boolean }): RetainingResult {
  const i: RetainingInputs = { ...defaultRetainingInputs, ...input };
  const errors = validateRetainingInputs(i);
  const warnings: string[] = [];
  const suggestions: string[] = [];
  if (i.baseWidthM < 0.5 * (i.stemHeightM + i.baseDepthM) || i.baseWidthM > 0.7 * (i.stemHeightM + i.baseDepthM)) {
    warnings.push(`Base width ${i.baseWidthM} m is outside the rule-of-thumb band 0.5H–0.7H (${(0.5 * (i.stemHeightM + i.baseDepthM)).toFixed(2)}–${(0.7 * (i.stemHeightM + i.baseDepthM)).toFixed(2)} m) — the stability checks above govern, not the rule of thumb.`);
  }
  const heel = i.baseWidthM - i.toeM - i.stemBottomM;
  const totalH = i.stemHeightM + i.baseDepthM;
  const ka = kaFor(i.phiDeg, i.backfillSlopeDeg);
  const kp = (1 + Math.sin((i.phiDeg * Math.PI) / 180)) / (1 - Math.sin((i.phiDeg * Math.PI) / 180));
  const paSoil = 0.5 * ka * i.gammaKNm3 * totalH ** 2;
  const paSur = ka * i.surchargeKNm2 * totalH;
  let driving = paSoil + paSur;
  const mOver = (paSoil * totalH) / 3 + (paSur * totalH) / 2;
  // Seismic (simplified IS 1893): extra horizontal force kh·ΣW at H/2.
  const wStemRect = i.stemTopM * i.stemHeightM * 25;
  const wStemTri = 0.5 * (i.stemBottomM - i.stemTopM) * i.stemHeightM * 25;
  const wBase = i.baseWidthM * i.baseDepthM * 25;
  const wSoil = heel * i.stemHeightM * i.gammaKNm3;
  const wSur = heel * i.surchargeKNm2;
  const sumW = wStemRect + wStemTri + wBase + wSoil + wSur;
  const seismicForce = i.seismicKh * sumW;
  driving += seismicForce;
  const mOverSeismic = mOver + (seismicForce * totalH) / 2;
  // Passive resistance in front of the toe (optional, default OFF).
  let passive = 0;
  if (i.passivePressure) passive = 0.5 * kp * i.gammaKNm3 * i.passiveDepthM ** 2;
  if (i.shearKey) passive += 0.5 * kp * i.gammaKNm3 * i.shearKeyDepthM ** 2;
  const resisting = sumW * i.mu + passive;
  const xStemRect = i.toeM + i.stemBottomM - i.stemTopM / 2;
  const xStemTri = i.toeM + (2 / 3) * (i.stemBottomM - i.stemTopM);
  const xBase = i.baseWidthM / 2;
  const xSoil = i.baseWidthM - heel / 2;
  const mRes = wStemRect * xStemRect + wStemTri * xStemTri + wBase * xBase + wSoil * xSoil + wSur * xSoil;
  const fsSlide = driving > 0 ? resisting / driving : 0;
  const fsOver = mOverSeismic > 0 ? mRes / mOverSeismic : 0;
  const xBar = sumW > 0 ? (mRes - mOverSeismic) / sumW : 0;
  const ecc = Math.abs(i.baseWidthM / 2 - xBar);
  const qMax = (sumW / i.baseWidthM) * (1 + (6 * ecc) / i.baseWidthM);
  const qMin = (sumW / i.baseWidthM) * (1 - (6 * ecc) / i.baseWidthM);
  const slidingOk = fsSlide >= 1.5;
  const overturningOk = fsOver >= 2.0;
  const bearingOk = qMax <= i.sbcKNm2 && qMin >= 0 && ecc <= i.baseWidthM / 6;
  if (!slidingOk) {
    suggestions.push(`Sliding fails (FS ${round(fsSlide, 2)} < 1.5). Widen the base — solve-for-B gives ${""} m — or add a shear key 0.3 m deep, which adds passive resistance in front of the key.`);
    warnings.push("Sliding check FAILS.");
  }
  if (!overturningOk) { suggestions.push("Overturning fails — widen the base or increase the heel soil weight."); warnings.push("Overturning check FAILS."); }
  if (!bearingOk) { suggestions.push("Bearing fails — widen the base or improve the soil (higher SBC)."); warnings.push("Bearing check FAILS."); }
  // Stem flexure at the stem base (h = stem height, not total height).
  const paStemSoil = 0.5 * ka * i.gammaKNm3 * i.stemHeightM ** 2;
  const paStemSur = ka * i.surchargeKNm2 * i.stemHeightM;
  const stemMuUnfact = (paStemSoil * i.stemHeightM) / 3 + (paStemSur * i.stemHeightM) / 2;
  const stemMu = 1.5 * stemMuUnfact;
  const dStem = i.stemBottomM * 1000 - i.coverMm - i.vertDiaMm / 2;
  const stemAstFlex = astForMu(stemMu, i.fck, i.fy, 1000, dStem);
  const stemAstMin = (0.12 / 100) * 1000 * i.stemBottomM * 1000;
  const stemAst = Math.max(stemAstFlex, stemAstMin);
  const stemSpacing = Math.min(spacingForAst(stemAst, i.vertDiaMm), 300);
  const stemOk = astForMu(stemMu, i.fck, i.fy, 1000, dStem) <= stemAst;
  // Base slab: toe moment from bearing pressure, heel moment from soil weight
  // minus bearing pressure (per m run, factored 1.5).
  const toeMu = 1.5 * ((qMax * i.toeM ** 2) / 2);
  const heelMu = 1.5 * Math.abs(((wSoil + wSur) * heel) / 2 - ((qMin + ((qMax - qMin) * (i.baseWidthM - heel / 2)) / i.baseWidthM) * heel ** 2) / 2);
  const dBase = i.baseDepthM * 1000 - i.coverMm - i.vertDiaMm / 2;
  const toeAst = Math.max(astForMu(toeMu, i.fck, i.fy, 1000, dBase), (0.12 / 100) * 1000 * i.baseDepthM * 1000);
  const heelAst = Math.max(astForMu(heelMu, i.fck, i.fy, 1000, dBase), (0.12 / 100) * 1000 * i.baseDepthM * 1000);
  // Quantities
  const stemVol = 0.5 * (i.stemTopM + i.stemBottomM) * i.stemHeightM * i.wallLengthM;
  const baseVol = i.baseWidthM * i.baseDepthM * i.wallLengthM;
  const concVol = stemVol + baseVol;
  const vBars = Math.ceil((i.wallLengthM * 1000) / i.vertSpacingMm) + 1;
  const vLen = i.stemHeightM + i.baseDepthM + 0.3;
  const stemSteel = unitWeightKgPerM(i.vertDiaMm) * vLen * vBars * 2
    + unitWeightKgPerM(i.horizDiaMm) * i.wallLengthM * (Math.ceil((i.stemHeightM * 1000) / i.horizSpacingMm) + 1) * 2;
  // Base steel: toe bottom + heel top bars along the wall length.
  const baseBarsPerM = (1000 / spacingForAst(Math.max(toeAst, heelAst), i.vertDiaMm));
  const baseSteel = unitWeightKgPerM(i.vertDiaMm) * i.wallLengthM * Math.ceil(baseBarsPerM * i.baseWidthM) * 2;
  const totalSteel = stemSteel + baseSteel;
  const materials = materialsForConcrete(concVol, i.mix, i.wastagePct);
  // Solve-for-B: grow B in 0.1 m steps until all three FS targets pass.
  let minB = i.baseWidthM;
  if (!internal?.skipSolveB) {
    for (let b = 0.5 * totalH; b <= 1.2 * totalH + 0.5; b += 0.1) {
      const trial = designRetainingWall({ ...i, baseWidthM: round(b, 1), toeM: Math.max(0.5, round(b, 1) * 0.3) }, { skipSolveB: true });
      if (trial.slidingOk && trial.overturningOk && trial.bearingOk) { minB = round(b, 1); break; }
      minB = round(b, 1);
    }
  }
  if (!slidingOk) {
    const idx = suggestions.findIndex((s) => s.startsWith("Sliding fails"));
    if (idx >= 0) suggestions[idx] = `Sliding fails (FS ${round(fsSlide, 2)} < 1.5). Widen the base to at least ${minB} m, or add a shear key 0.3 m deep, which adds passive resistance in front of the key.`;
  }
  const lines: CostLine[] = [
    costLine(`Cement (${materials.cementBags} bags)`, materials.cementBags, "bags", i.cementPerBag),
    costLine(`Sand (${round(materials.sandCft, 1)} cft)`, materials.sandCft, "cft", i.sandPerCft),
    costLine(`Aggregate (${round(materials.aggCft, 1)} cft)`, materials.aggCft, "cft", i.crushPerCft),
    costLine(`Steel (${round(totalSteel, 1)} kg)`, totalSteel, "kg", i.steelPerKg),
  ];
  return {
    errors, warnings, suggestions,
    heelM: round(heel, 2), totalHeightM: round(totalH, 2), ka: round(ka, 3), kp: round(kp, 2),
    paSoilKN: round(paSoil, 1), paSurKN: round(paSur, 1), drivingKN: round(driving, 1),
    sumWKN: round(sumW, 1), resistingKN: round(resisting, 1),
    fsSliding: round(fsSlide, 2), fsOverturning: round(fsOver, 2),
    xBarM: round(xBar, 3), eccentricityM: round(ecc, 3),
    qMaxKPa: round(qMax, 1), qMinKPa: round(qMin, 1),
    slidingOk, overturningOk, bearingOk,
    stemMuKNmPerM: round(stemMu, 1), stemAstMm2PerM: round(stemAst),
    stemAstMinMm2PerM: round(stemAstMin), stemSpacingMm: stemSpacing, stemOk,
    toeMuKNmPerM: round(toeMu, 1), heelMuKNmPerM: round(heelMu, 1),
    toeAstMm2PerM: round(toeAst), heelAstMm2PerM: round(heelAst),
    baseSteelKg: round(baseSteel, 1), stemSteelKg: round(stemSteel, 1),
    totalSteelKg: round(totalSteel, 1), concreteVolM3: round(concVol, 2),
    materials, minBaseWidthM: minB,
    costLines: lines, totalCost: totalCost(lines),
    steps: [
      { label: "Earth pressure", text: `Ka = (1−sinφ)/(1+sinφ) = ${round(ka, 3)}; Pa,soil = ½·Ka·γ·H² = ${round(paSoil, 1)} kN/m; Pa,sur = Ka·q·H = ${round(paSur, 1)} kN/m` },
      { label: "Sliding", text: `FS_slide = μ·ΣW / F_drive = ${round(resisting, 1)} / ${round(driving, 1)} = ${round(fsSlide, 2)} (≥ 1.5 required)` },
      { label: "Overturning", text: `FS_over = M_res / M_over = ${round(fsOver, 2)} (≥ 2.0 required)` },
      { label: "Bearing", text: `e = ${round(ecc, 3)} m (≤ B/6 = ${round(i.baseWidthM / 6, 2)} m); qmax = ${round(qMax, 1)} kPa, qmin = ${round(qMin, 1)} kPa vs SBC ${i.sbcKNm2} kPa` },
      { label: "Stem design", text: `M at stem base = ${round(stemMuUnfact, 1)} kNm/m unfactored, ${round(stemMu, 1)} factored; Ast = ${round(stemAst)} mm²/m (min ${round(stemAstMin)} mm²/m) → ${i.vertDiaMm} mm @ ${stemSpacing} mm` },
      { label: "Base design", text: `Toe Mu = ${round(toeMu, 1)} kNm/m → Ast ${round(toeAst)} mm²/m (bottom); heel Mu = ${round(heelMu, 1)} kNm/m → Ast ${round(heelAst)} mm²/m (top)` },
    ],
  };
}

export const RETAINING_FAQS: FaqItem[] = [
  { q: "What factor of safety is required for a retaining wall?", a: "Sliding FS ≥ 1.5, overturning FS ≥ 2.0, and the resultant must stay in the middle third (e ≤ B/6) with qmax ≤ SBC and qmin ≥ 0. Those are the standard acceptance criteria (IS 456 / IS 1893 practice and the Rankine method)." },
  { q: "How is Ka calculated?", a: "For level backfill, Rankine's Ka = (1 − sinφ)/(1 + sinφ). For φ = 30° that is 0.333. For sloped backfill this tool uses the Coulomb form, which gives a larger Ka — a sloped backfill pushes harder." },
  { q: "What is the middle-third rule?", a: "The resultant of all vertical forces must fall within the middle third of the base (e ≤ B/6). If it leaves the middle third, one edge of the base would lift off the soil and the bearing pressure becomes triangular, with a peak of 2ΣV/(3a) instead of the trapezoidal formula." },
  { q: "When is a shear key needed?", a: "When sliding FS is below 1.5 and widening the base is impractical. A key (a downstand under the base, typically 300 mm deep) mobilises passive earth pressure in front of the key and adds directly to the sliding resistance." },
  { q: "Cantilever vs gravity wall — which one is this?", a: "This is a cantilever (T-shaped) RCC wall: a thin stem and base slab held by steel, not by its own weight. A gravity wall is a massive unreinforced block that resists by weight alone and needs a much wider base (about 0.5–0.7H)." },
  { q: "How wide should the base be?", a: "As a rule of thumb, B ≈ 0.5–0.7 times the total height H. The exact width comes from the three checks — sliding usually governs. Use the solve-for-B result on this page for your height and soil." },
];
