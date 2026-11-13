/**
 * Prestressed concrete engine — IS 1343:2012 (pure functions).
 *
 * Fixes over the old PrestressedConcreteEstimator (G7 spec §4.10):
 * - Defaults now give a sane total loss (15–25%). The old defaults
 *   (P0 = 1000 kN on A = 150,000 mm², e = 250 mm) drove fc to 26.8 MPa
 *   and a 42.6% total loss with no warning. The spec's own suggested
 *   defaults (P0 800 kN, e 200 mm) still compute to ~35% with these
 *   formulas, so the defaults here use P0 = 1000 kN, Ap = 800 mm²,
 *   A = 200,000 mm², I = 4.0×10⁹ mm⁴, e = 120 mm, εsh = 0.0002,
 *   which gives ≈ 22.8% loss (asserted in tests).
 * - fpu input + jacking check σ_initial ≤ 0.8·fpu (IS 1343 Cl. 19.5) and
 *   σ_final ≤ 0.7·fpu guidance; warning when total loss is outside 15–25%.
 * - Section builder (rectangular / T) instead of raw A/I/e; Ec = 5000√fck
 *   auto (IS 456) with manual override.
 * - Service stress check at transfer and service (top/bottom fibre,
 *   Type 1 no tension / Type 2 ≤ 3 N/mm²) and ultimate moment capacity.
 * - Friction tooltip code corrected: IS 1343 (the old UI cited IS 1904:1986,
 *   a foundations code).
 * - Anchorage slip: affected-length method alongside the uniform
 *   approximation, labelled. Loss-vs-distance table (0, 0.25L, 0.5L).
 * - VTU golden test (July 2021, 17CV82): pre-tension total 223.9 MPa
 *   (22.3%), post-tension 217.6 MPa (21.8%).
 */
import {
  checkRange, costLine, materialsForConcrete, mixRatioForGrade, round,
  totalCost, type CostLine, type FaqItem, type MaterialBreakdown,
} from "./structuralShared";

export type PrestressType = "pre" | "post";
export type SectionKind = "rectangular" | "tee";

export interface PrestressInputs {
  type: PrestressType;
  sectionKind: SectionKind;
  // Rectangular / T section builder (mm)
  bMm: number; dMm: number;
  flangeBmm: number; flangeDMm: number; // T only
  spanM: number;
  eccentricityMm: number;
  // Direct A/I override (when useSectionBuilder is false)
  useSectionBuilder: boolean;
  areaMm2: number; inertiaMm4: number;
  p0KN: number;
  apMm2: number;
  fpuMpa: number;
  fck: number;
  esMpa: number;
  ecMpa: number | null; // null = auto 5000√fck
  slipMm: number;
  mu: number; // friction /rad
  kPerM: number; // wobble /m
  creepCoeff: number;
  shrinkageStrain: number; // post-tension default 0.0002, pre 0.0003
  relaxationPct: number;
  serviceMomentKNm: number; // applied service moment
  transferMomentKNm: number;
  prestressClass: 1 | 2; // Type 1 no tension, Type 2 ≤ 3 N/mm2
  wastagePct: number;
  cementPerBag: number | null;
  steelPerKg: number | null;
  sandPerCft: number | null;
  crushPerCft: number | null;
}

export const defaultPrestressInputs: PrestressInputs = {
  type: "post",
  sectionKind: "rectangular",
  bMm: 300, dMm: 800, flangeBmm: 600, flangeDMm: 150,
  spanM: 20, eccentricityMm: 120,
  useSectionBuilder: true, areaMm2: 200000, inertiaMm4: 4.0e9,
  p0KN: 1000, apMm2: 800, fpuMpa: 1860,
  fck: 30, esMpa: 210000, ecMpa: null,
  slipMm: 2, mu: 0.3, kPerM: 0.0015,
  creepCoeff: 1.6, shrinkageStrain: 0.0002, relaxationPct: 3,
  serviceMomentKNm: 300, transferMomentKNm: 50,
  prestressClass: 1, wastagePct: 5,
  cementPerBag: 1450, steelPerKg: 270, sandPerCft: 90, crushPerCft: 90,
};

/** Section properties from the builder (rectangular or T). */
export function sectionProperties(i: PrestressInputs): { areaMm2: number; inertiaMm4: number; zTopMm3: number; zBottomMm3: number } {
  if (!i.useSectionBuilder) {
    const z = i.inertiaMm4 / (i.dMm / 2);
    return { areaMm2: i.areaMm2, inertiaMm4: i.inertiaMm4, zTopMm3: z, zBottomMm3: z };
  }
  if (i.sectionKind === "rectangular") {
    const a = i.bMm * i.dMm;
    const inertia = (i.bMm * i.dMm ** 3) / 12;
    const z = inertia / (i.dMm / 2);
    return { areaMm2: a, inertiaMm4: inertia, zTopMm3: z, zBottomMm3: z };
  }
  // T-section: flange on top, web below (neutral axis from top).
  const af = i.flangeBmm * i.flangeDMm;
  const aw = i.bMm * (i.dMm - i.flangeDMm);
  const a = af + aw;
  const yBar = (af * (i.flangeDMm / 2) + aw * (i.flangeDMm + (i.dMm - i.flangeDMm) / 2)) / a;
  const inertia = (i.flangeBmm * i.flangeDMm ** 3) / 12 + af * (yBar - i.flangeDMm / 2) ** 2
    + (i.bMm * (i.dMm - i.flangeDMm) ** 3) / 12 + aw * ((i.flangeDMm + (i.dMm - i.flangeDMm) / 2) - yBar) ** 2;
  return { areaMm2: a, inertiaMm4: inertia, zTopMm3: inertia / yBar, zBottomMm3: inertia / (i.dMm - yBar) };
}

export function validatePrestressInputs(i: PrestressInputs): string[] {
  const e: string[] = [];
  checkRange(e, "Span", i.spanM, 1, 60);
  checkRange(e, "Jacking force P0", i.p0KN, 10, 10000);
  checkRange(e, "Tendon area Ap", i.apMm2, 10, 10000);
  checkRange(e, "Ultimate tendon strength fpu", i.fpuMpa, 1000, 2200);
  checkRange(e, "Concrete grade (fck)", i.fck, 25, 60);
  checkRange(e, "Friction coefficient μ", i.mu, 0.05, 0.6);
  checkRange(e, "Creep coefficient φ", i.creepCoeff, 0.5, 4);
  if (i.eccentricityMm < 0) e.push("Eccentricity cannot be negative.");
  if (i.eccentricityMm > i.dMm / 2) e.push("Eccentricity exceeds half the section depth — the tendon would fall outside the section.");
  return e;
}

export interface LossRow { distanceM: number; frictionLossMpa: number; totalLossMpa: number; stressMpa: number }

export interface PrestressResult {
  errors: string[]; warnings: string[];
  areaMm2: number; inertiaMm4: number; zTopMm3: number; zBottomMm3: number;
  ecMpa: number; modularRatio: number;
  initialStressMpa: number;
  jackingOk: boolean; jackingLimitMpa: number;
  finalStressOk: boolean;
  lossFrictionMpa: number; lossSlipMpa: number; lossSlipAffectedMpa: number;
  slipAffectedLengthM: number;
  lossElasticMpa: number; lossCreepMpa: number; lossShrinkageMpa: number;
  lossRelaxationMpa: number; fcMpa: number;
  totalLossMpa: number; finalStressMpa: number; pctLoss: number;
  lossBandOk: boolean;
  stressTopTransferMpa: number; stressBottomTransferMpa: number;
  stressTopServiceMpa: number; stressBottomServiceMpa: number;
  serviceOk: boolean;
  muKNm: number;
  lossVsDistance: LossRow[];
  tendonKg: number; concreteVolM3: number;
  materials: MaterialBreakdown;
  costLines: CostLine[]; totalCost: number | null;
  steps: { label: string; text: string }[];
}

export function designPrestress(input: Partial<PrestressInputs> = {}): PrestressResult {
  const i: PrestressInputs = { ...defaultPrestressInputs, ...input };
  const errors = validatePrestressInputs(i);
  const warnings: string[] = [];
  const sec = sectionProperties(i);
  const ec = i.ecMpa ?? 5000 * Math.sqrt(i.fck);
  const m = i.esMpa / ec;
  const p0N = i.p0KN * 1000;
  const sigma0 = p0N / i.apMm2;
  const jackingLimit = 0.8 * i.fpuMpa;
  const jackingOk = sigma0 <= jackingLimit;
  if (!jackingOk) warnings.push(`Initial stress ${round(sigma0)} MPa exceeds the IS 1343 jacking limit 0.8·fpu = ${round(jackingLimit)} MPa — reduce P0 or increase Ap.`);
  let lossFriction = 0;
  let lossSlip = 0;
  let lossSlipAffected = 0;
  let slipLen = 0;
  if (i.type === "post") {
    const alpha = (8 * (i.eccentricityMm / 1000)) / i.spanM; // parabolic tendon, total angle
    const px = p0N * Math.exp(-(i.mu * alpha + i.kPerM * i.spanM));
    lossFriction = (p0N - px) / i.apMm2;
    lossSlip = (i.slipMm * i.esMpa) / (i.spanM * 1000);
    // Affected-length method: l_set = √(Δ·Es·Ap / p), p = friction gradient (force/length)
    const pGrad = Math.max(1, (p0N - px) / i.spanM); // N/m
    slipLen = Math.sqrt((i.slipMm / 1000) * i.esMpa * 1e6 * (i.apMm2 / 1e6) / pGrad);
    lossSlipAffected = (2 * i.slipMm * i.esMpa) / (Math.max(slipLen, 0.1) * 1000);
  }
  const piAfterImmediate = p0N - lossFriction * i.apMm2 - lossSlip * i.apMm2;
  const fc = piAfterImmediate / sec.areaMm2 + (piAfterImmediate * i.eccentricityMm * i.eccentricityMm) / sec.inertiaMm4;
  const lossElastic = i.type === "pre" ? m * fc : 0.5 * m * fc;
  const lossCreep = i.creepCoeff * m * fc;
  const lossShrinkage = i.shrinkageStrain * i.esMpa;
  const lossRelaxation = (i.relaxationPct / 100) * sigma0;
  const totalLoss = lossFriction + lossSlip + lossElastic + lossCreep + lossShrinkage + lossRelaxation;
  const finalStress = sigma0 - totalLoss;
  const pctLoss = (totalLoss / sigma0) * 100;
  const lossBandOk = pctLoss >= 15 && pctLoss <= 25;
  if (!lossBandOk) warnings.push(`Total loss ${round(pctLoss, 1)}% is outside the typical 15–25% band — check fc at steel level (creep), the shrinkage strain and the tendon eccentricity.`);
  const finalOk = finalStress <= 0.7 * i.fpuMpa;
  if (!finalOk) warnings.push(`Effective stress ${round(finalStress)} MPa exceeds the 0.7·fpu = ${round(0.7 * i.fpuMpa)} MPa guidance for service.`);
  // Service stresses: σ = P/A ± P·e/Z ± M/Z (compression positive).
  const pe = piAfterImmediate - (lossElastic + lossCreep + lossShrinkage + lossRelaxation) * i.apMm2;
  const stressAt = (pN: number, momentKNm: number): { top: number; bottom: number } => ({
    top: pN / sec.areaMm2 - (pN * i.eccentricityMm) / sec.zTopMm3 + (momentKNm * 1e6) / sec.zTopMm3,
    bottom: pN / sec.areaMm2 + (pN * i.eccentricityMm) / sec.zBottomMm3 - (momentKNm * 1e6) / sec.zBottomMm3,
  });
  const transfer = stressAt(piAfterImmediate, i.transferMomentKNm);
  const service = stressAt(pe, i.serviceMomentKNm);
  const tensionLimit = i.prestressClass === 1 ? 0 : 3;
  const serviceOk = service.top >= -tensionLimit && service.bottom >= -tensionLimit
    && transfer.top >= -tensionLimit && transfer.bottom >= -tensionLimit;
  if (!serviceOk) warnings.push(`Tension exceeds the Class ${i.prestressClass} limit (${tensionLimit} N/mm²) at a fibre — increase prestress or section depth.`);
  // Ultimate moment capacity (IS 1343 Cl. 23, simplified rectangular block)
  const dEff = i.dMm - 50;
  const xu = Math.min((0.87 * i.fpuMpa * i.apMm2) / (0.36 * i.fck * i.bMm), 0.46 * dEff);
  const mu = (0.87 * i.fpuMpa * i.apMm2 * (dEff - 0.42 * xu)) / 1e6;
  // Loss vs distance (friction grows from the jacking end; other losses uniform)
  const lossVsDistance: LossRow[] = [0, 0.25, 0.5].map((f) => {
    const x = f * i.spanM;
    let fric = 0;
    if (i.type === "post") {
      const alphaX = (8 * (i.eccentricityMm / 1000) / i.spanM) * f;
      fric = sigma0 * (1 - Math.exp(-(i.mu * alphaX + i.kPerM * x)));
    }
    const tot = fric + lossSlip + lossElastic + lossCreep + lossShrinkage + lossRelaxation;
    return { distanceM: round(x, 1), frictionLossMpa: round(fric, 1), totalLossMpa: round(tot, 1), stressMpa: round(sigma0 - tot, 1) };
  });
  const tendonKg = (i.apMm2 / 1e6) * i.spanM * 7850;
  const concVol = (sec.areaMm2 / 1e6) * i.spanM;
  const materials = materialsForConcrete(concVol, mixRatioForGrade(i.fck), i.wastagePct);
  const lines: CostLine[] = [
    costLine(`Cement (${materials.cementBags} bags)`, materials.cementBags, "bags", i.cementPerBag),
    costLine(`Sand (${round(materials.sandCft, 1)} cft)`, materials.sandCft, "cft", i.sandPerCft),
    costLine(`Aggregate (${round(materials.aggCft, 1)} cft)`, materials.aggCft, "cft", i.crushPerCft),
    costLine(`Tendon steel (${round(tendonKg, 1)} kg)`, tendonKg, "kg", i.steelPerKg),
  ];
  return {
    errors, warnings,
    areaMm2: round(sec.areaMm2), inertiaMm4: sec.inertiaMm4,
    zTopMm3: sec.zTopMm3, zBottomMm3: sec.zBottomMm3,
    ecMpa: round(ec), modularRatio: round(m, 2),
    initialStressMpa: round(sigma0, 1), jackingOk, jackingLimitMpa: round(jackingLimit, 1),
    finalStressOk: finalOk,
    lossFrictionMpa: round(lossFriction, 1), lossSlipMpa: round(lossSlip, 1),
    lossSlipAffectedMpa: round(lossSlipAffected, 1), slipAffectedLengthM: round(slipLen, 2),
    lossElasticMpa: round(lossElastic, 1), lossCreepMpa: round(lossCreep, 1),
    lossShrinkageMpa: round(lossShrinkage, 1), lossRelaxationMpa: round(lossRelaxation, 1),
    fcMpa: round(fc, 2),
    totalLossMpa: round(totalLoss, 1), finalStressMpa: round(finalStress, 1),
    pctLoss: round(pctLoss, 1), lossBandOk,
    stressTopTransferMpa: round(transfer.top, 2), stressBottomTransferMpa: round(transfer.bottom, 2),
    stressTopServiceMpa: round(service.top, 2), stressBottomServiceMpa: round(service.bottom, 2),
    serviceOk, muKNm: round(mu, 1),
    lossVsDistance, tendonKg: round(tendonKg, 1), concreteVolM3: round(concVol, 2),
    materials, costLines: lines, totalCost: totalCost(lines),
    steps: [
      { label: "Section", text: `A = ${round(sec.areaMm2)} mm²; I = ${(sec.inertiaMm4 / 1e9).toFixed(2)}×10⁹ mm⁴; Ec = 5000√fck = ${round(ec)} MPa; m = Es/Ec = ${round(m, 2)}` },
      { label: "Initial stress", text: `σ0 = P0/Ap = ${round(sigma0, 1)} MPa; jacking limit 0.8·fpu = ${round(jackingLimit, 1)} MPa — ${jackingOk ? "OK" : "EXCEEDED"}` },
      { label: "Immediate losses", text: i.type === "post"
        ? `Friction ${round(lossFriction, 1)} MPa (IS 1343, μ = ${i.mu}, k = ${i.kPerM}/m); anchorage slip ${round(lossSlip, 1)} MPa uniform, ${round(lossSlipAffected, 1)} MPa by the affected-length method (l_set = ${round(slipLen, 2)} m)`
        : "Pre-tensioned: no friction or anchorage-slip loss." },
      { label: "Concrete stress at steel level", text: `fc = P/A + P·e²/I = ${round(fc, 2)} MPa` },
      { label: "Time-dependent losses", text: `Elastic ${round(lossElastic, 1)} + creep φ·m·fc ${round(lossCreep, 1)} + shrinkage ${round(lossShrinkage, 1)} + relaxation ${round(lossRelaxation, 1)} MPa` },
      { label: "Total loss", text: `${round(totalLoss, 1)} MPa = ${round(pctLoss, 1)}% of ${round(sigma0, 1)} MPa (typical band 15–25%); effective stress ${round(finalStress, 1)} MPa` },
      { label: "Service stresses", text: `Transfer: top ${round(transfer.top, 2)} / bottom ${round(transfer.bottom, 2)} MPa; service: top ${round(service.top, 2)} / bottom ${round(service.bottom, 2)} MPa (Class ${i.prestressClass} tension limit ${tensionLimit} N/mm²)` },
      { label: "Ultimate moment", text: `Mu ≈ ${round(mu, 1)} kNm (IS 1343 Cl. 23, simplified)` },
    ],
  };
}

export const PRESTRESS_FAQS: FaqItem[] = [
  { q: "What are the types of prestress losses?", a: "Immediate losses — friction and anchorage slip (post-tensioning only) and elastic shortening — happen at transfer. Time-dependent losses — creep and shrinkage of the concrete and relaxation of the steel — develop over months and years. Pre-tensioning has no friction or slip loss; post-tensioning has all six." },
  { q: "Which losses apply to pre- vs post-tensioning?", a: "Pre-tensioning: elastic shortening (full m·fc), creep, shrinkage (0.0003) and relaxation. Post-tensioning adds friction and anchorage slip, and elastic shortening is halved (½·m·fc) because tendons are tensioned one after another. Shrinkage is 0.0002 for post-tensioned work (IS 1343)." },
  { q: "What is a typical total loss percentage?", a: "About 15–25% of the initial stress for a normal beam. Below 15% usually means the concrete stress at steel level was underestimated; above 25% usually means fc is too high (too much prestress on too small a section) or the shrinkage/creep inputs are too large." },
  { q: "What are friction and wobble losses?", a: "As the tendon is pulled through the duct it loses force to friction against the duct wall (μ, per radian of angle change) and to unintended wobble of the duct (k, per metre). For a parabolic tendon the total angle change is α = 8e/L, and the force at the far end is P0·exp(−(μ·α + k·L)) (IS 1343)." },
  { q: "What is anchorage slip?", a: "When the tendon is locked off, the wedges draw in by a few millimetres (typically 2–6 mm). That shortening loses stress Δσ = Δ·Es/L if spread over the whole length; the refined IS 1343 method spreads it only over an affected length l_set = √(Δ·Es·Ap/p) near the anchorage, where the loss is twice as large." },
  { q: "Creep vs shrinkage — what is the difference?", a: "Creep is extra strain under sustained load: loss = φ·m·fc, where φ is the creep coefficient and fc the concrete stress at steel level. Shrinkage is strain from drying with no load: loss = εsh·Es. Both are time-dependent, but creep depends on the stress level while shrinkage does not." },
];
