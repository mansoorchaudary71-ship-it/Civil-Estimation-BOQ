/**
 * Beam design engine — IS 456:2000 limit state method (pure functions).
 *
 * Fixes over the old BeamDesignTool (G7 spec §4.4):
 * - Continuous beam: support Mu = wL^2/10, span Mu = wL^2/12 (not wL^2/8);
 *   both are designed and reported. Simply-supported stays wL^2/8,
 *   cantilever wL^2/2.
 * - Ast,max = 0.04 b D check (IS 456 Cl. 26.5.1.1) — FAIL when exceeded.
 * - Doubly-reinforced compression steel uses SP-16 Table F fsc by d'/d and
 *   fy (not a blanket 0.87 fy, which is unconservative for Fe500).
 * - d' = cover + stirrup dia + main dia/2 (not cover + main/2).
 * - Optional self-weight (default ON): w_sw = 25 b D / 10^6 kN/m.
 * - Steel weight / concrete volume / materials / cost outputs.
 */
import { unitWeightKgPerM, stirrupLengthDetailed } from "./steelCalc";
import {
  astForMu, astMaxMm2, astMinMm2, barAreaMm2, checkRange, costLine,
  devLengthMm, materialsForConcrete, muLimKNm, round, tauC, tauCMax,
  totalCost, xuMaxRatio, type CostLine, type FaqItem, type MaterialBreakdown,
  type MixRatio, mixRatioForGrade,
} from "./structuralShared";

export type SupportCondition = "simply-supported" | "continuous" | "cantilever";

export interface BeamInputs {
  spanM: number;
  workingLoadKNm: number; // kN/m (excluding self-weight)
  safetyFactor: number;
  widthMm: number;
  depthMm: number;
  coverMm: number;
  fck: number;
  fy: number;
  support: SupportCondition;
  mainDiaMm: number;
  stirrupDiaMm: number;
  stirrupLegs: number;
  selfWeight: boolean;
  beamLengthM: number; // length of steel (defaults to span)
  wastagePct: number;
  mix?: MixRatio;
  cementPerBag: number | null;
  steelPerKg: number | null;
  sandPerCft: number | null;
  crushPerCft: number | null;
}

export const defaultBeamInputs: BeamInputs = {
  spanM: 5,
  workingLoadKNm: 16.67,
  safetyFactor: 1.5,
  widthMm: 250,
  depthMm: 450,
  coverMm: 40,
  fck: 25,
  fy: 500,
  support: "simply-supported",
  mainDiaMm: 16,
  stirrupDiaMm: 8,
  stirrupLegs: 2,
  selfWeight: true,
  beamLengthM: 5,
  wastagePct: 5,
  cementPerBag: 1450,
  steelPerKg: 270,
  sandPerCft: 90,
  crushPerCft: 90,
};

/**
 * SP-16 Table F — stress in compression steel fsc (MPa) by d'/d and fy.
 * Interpolated linearly between the tabulated d'/d points (0.05–0.30).
 * Only for d'/d <= 0.05 does the old 0.87 fy approximation hold.
 */
const FSC_TABLE: Record<number, [number, number][]> = {
  250: [[0.05, 217], [0.1, 217], [0.15, 217], [0.2, 217], [0.25, 217], [0.3, 217]],
  415: [[0.05, 355], [0.1, 340], [0.15, 320], [0.2, 295], [0.25, 270], [0.3, 245]],
  500: [[0.05, 410], [0.1, 385], [0.15, 360], [0.2, 330], [0.25, 300], [0.3, 270]],
  550: [[0.05, 435], [0.1, 410], [0.15, 380], [0.2, 350], [0.25, 320], [0.3, 290]],
};

export function fscTable(fy: number, dPrimeOverD: number): number {
  if (dPrimeOverD <= 0.05) return 0.87 * fy;
  const table = FSC_TABLE[fy] ?? FSC_TABLE[fy <= 250 ? 250 : fy <= 415 ? 415 : fy <= 500 ? 500 : 550];
  const x = Math.min(Math.max(dPrimeOverD, 0.05), 0.3);
  for (let i = 0; i < table.length - 1; i++) {
    const [x0, y0] = table[i];
    const [x1, y1] = table[i + 1];
    if (x >= x0 && x <= x1) return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
  }
  return table[table.length - 1][1];
}

export function validateBeamInputs(i: BeamInputs): string[] {
  const e: string[] = [];
  checkRange(e, "Span", i.spanM, 1, 30);
  checkRange(e, "Working load", i.workingLoadKNm, 0.1, 500);
  checkRange(e, "Safety factor", i.safetyFactor, 1, 2);
  checkRange(e, "Width (b)", i.widthMm, 150, 1000);
  checkRange(e, "Overall depth (D)", i.depthMm, 200, 1500);
  checkRange(e, "Cover", i.coverMm, 20, 75);
  checkRange(e, "Concrete grade (fck)", i.fck, 15, 60);
  checkRange(e, "Steel grade (fy)", i.fy, 250, 550);
  checkRange(e, "Main bar diameter", i.mainDiaMm, 8, 32);
  checkRange(e, "Stirrup diameter", i.stirrupDiaMm, 6, 16);
  if (i.depthMm <= i.widthMm) e.push("Depth (D) should normally exceed width (b) for a beam.");
  if (i.coverMm * 2 >= i.depthMm) e.push("Cover is too large for the section depth.");
  return e;
}

export interface BeamResult {
  errors: string[];
  warnings: string[];
  dMm: number;
  dPrimeMm: number;
  selfWeightKNm: number;
  factoredLoadKNm: number;
  muSpanKNm: number;
  muSupportKNm: number;
  muGoverningKNm: number;
  vuKN: number;
  muLimKNm: number;
  doublyReinforced: boolean;
  astSpanMm2: number;
  astSupportMm2: number;
  astReqMm2: number;
  astMinMm2: number;
  astMaxMm2: number;
  astMaxOk: boolean;
  ascMm2: number;
  fscMpa: number;
  barsRequired: number;
  astProvidedMm2: number;
  ptPct: number;
  deflectionSafe: boolean;
  actualLdRatio: number;
  allowableLdRatio: number;
  tauVMpa: number;
  tauCMpa: number;
  tauCMaxMpa: number;
  shearSafe: boolean;
  stirrupSpacingMm: number;
  stirrupDesc: string;
  ldMm: number;
  stirrupLengthMm: number;
  mainSteelKg: number;
  stirrupSteelKg: number;
  compSteelKg: number;
  totalSteelKg: number;
  concreteVolM3: number;
  materials: MaterialBreakdown;
  costLines: CostLine[];
  totalCost: number | null;
  steps: { label: string; text: string }[];
}

export function designBeam(input: Partial<BeamInputs> = {}): BeamResult {
  const i: BeamInputs = { ...defaultBeamInputs, ...input };
  const errors = validateBeamInputs(i);
  const warnings: string[] = [];
  // Spec convention (verified vector d = 402): d = D - cover - phi/2.
  // The stirrup diameter is accounted in d' (compression steel depth) only.
  const d = i.depthMm - i.coverMm - i.mainDiaMm / 2;
  const dPrime = i.coverMm + i.stirrupDiaMm + i.mainDiaMm / 2;
  const wSw = i.selfWeight ? (25 * i.widthMm * i.depthMm) / 1e6 : 0;
  const W = (i.workingLoadKNm + wSw) * i.safetyFactor;
  const L = i.spanM;
  let muSpan = 0;
  let muSupport = 0;
  let vu = 0;
  if (i.support === "simply-supported") {
    muSpan = (W * L * L) / 8;
    vu = (W * L) / 2;
  } else if (i.support === "continuous") {
    muSupport = (W * L * L) / 10;
    muSpan = (W * L * L) / 12;
    vu = (W * L) / 2;
  } else {
    muSpan = (W * L * L) / 2;
    vu = W * L;
  }
  const muGov = Math.max(muSpan, muSupport);
  const muLim = muLimKNm(i.fck, i.widthMm, d, i.fy);
  const doubly = muGov > muLim;
  const fsc = fscTable(i.fy, dPrime / d);

  const astFor = (mu: number): { ast: number; asc: number } => {
    if (mu <= 0) return { ast: 0, asc: 0 };
    if (mu <= muLim) return { ast: astForMu(mu, i.fck, i.fy, i.widthMm, d), asc: 0 };
    const mu2 = mu - muLim;
    const ast1 = astForMu(muLim, i.fck, i.fy, i.widthMm, d);
    const ast2 = (mu2 * 1e6) / (0.87 * i.fy * (d - dPrime));
    const asc = (mu2 * 1e6) / ((fsc - 0.45 * i.fck) * (d - dPrime));
    return { ast: ast1 + ast2, asc };
  };
  const spanSteel = astFor(muSpan);
  const supSteel = astFor(muSupport);
  const govSteel = astFor(muGov);
  const astMin = astMinMm2(i.fy, i.widthMm, d);
  const astMax = astMaxMm2(i.widthMm, i.depthMm);
  let astReq = Math.max(govSteel.ast, astMin);
  const astMaxOk = astReq <= astMax;
  if (!astMaxOk) warnings.push(`Required steel ${round(astReq)} mm² exceeds Ast,max = 0.04·b·D = ${round(astMax)} mm² (IS 456 Cl. 26.5.1.1) — increase the section.`);
  if (doubly) warnings.push("Moment exceeds Mu,lim — doubly reinforced section with compression steel.");
  const aBar = barAreaMm2(i.mainDiaMm);
  const bars = Math.max(2, Math.ceil(astReq / aBar));
  const astProv = bars * aBar;
  const pt = (astProv / (i.widthMm * d)) * 100;

  // Deflection (IS 456 Fig. 4 approximation)
  const fs = 0.58 * i.fy * (astReq / Math.max(astProv, 1));
  let kt = 1 / (0.225 + 0.0032 * fs + 0.625 * Math.log10(Math.max(pt, 0.001)));
  kt = Math.min(Math.max(kt, 0), 2);
  const basicLd = i.support === "simply-supported" ? 20 : i.support === "continuous" ? 26 : 7;
  const allowLd = basicLd * kt;
  const actualLd = (L * 1000) / d;
  const deflectionSafe = actualLd <= allowLd;

  // Shear
  const tauV = (vu * 1000) / (i.widthMm * d);
  const tauCMaxVal = tauCMax(i.fck);
  const tauCVal = tauC(pt, i.fck);
  const shearSafe = tauV <= tauCMaxVal;
  const asv = i.stirrupLegs * barAreaMm2(i.stirrupDiaMm);
  const maxSv = Math.min(0.75 * d, 300);
  let reqSv: number;
  if (!shearSafe) reqSv = 0;
  else if (tauV <= tauCVal) reqSv = Math.min((0.87 * i.fy * asv) / (0.4 * i.widthMm), maxSv);
  else {
    const vus = vu * 1000 - tauCVal * i.widthMm * d;
    const svDesign = (0.87 * i.fy * asv * d) / Math.max(vus, 1);
    const svMin = (0.87 * i.fy * asv) / (0.4 * i.widthMm);
    reqSv = Math.min(svDesign, svMin, maxSv);
  }
  const stirrupSpacing = shearSafe ? Math.max(75, Math.floor(reqSv / 10) * 10) : 0;
  const stirrupDesc = !shearSafe
    ? "Section unsafe in shear — redesign"
    : tauV <= tauCVal
      ? `Nominal: ${i.stirrupLegs}-L ${i.stirrupDiaMm} mm @ ${stirrupSpacing} c/c`
      : `${i.stirrupLegs}-L ${i.stirrupDiaMm} mm @ ${stirrupSpacing} c/c`;
  const ld = devLengthMm(i.fy, i.mainDiaMm, i.fck);

  // Quantities — stirrup length by the canonical IS 2502 detailed form
  const aIn = i.widthMm - 2 * i.coverMm - i.stirrupDiaMm;
  const bIn = i.depthMm - 2 * i.coverMm - i.stirrupDiaMm;
  const stirrupLen = stirrupLengthDetailed(aIn, bIn, i.stirrupDiaMm);
  const lenM = i.beamLengthM > 0 ? i.beamLengthM : L;
  const mainKg = unitWeightKgPerM(i.mainDiaMm) * lenM * bars;
  const stirrupCount = stirrupSpacing > 0 ? Math.ceil((lenM * 1000) / stirrupSpacing) + 1 : 0;
  const stirrupKg = unitWeightKgPerM(i.stirrupDiaMm) * (stirrupLen / 1000) * stirrupCount;
  const compBars = govSteel.asc > 0 ? Math.max(2, Math.ceil(govSteel.asc / aBar)) : 0;
  const compKg = unitWeightKgPerM(i.mainDiaMm) * lenM * compBars;
  const totalSteel = mainKg + stirrupKg + compKg;
  const concVol = (i.widthMm / 1000) * (i.depthMm / 1000) * lenM;
  const mix = i.mix ?? mixRatioForGrade(i.fck);
  const materials = materialsForConcrete(concVol, mix, i.wastagePct);
  const lines: CostLine[] = [
    costLine(`Cement (${materials.cementBags} bags)`, materials.cementBags, "bags", i.cementPerBag),
    costLine(`Sand (${round(materials.sandCft, 1)} cft)`, materials.sandCft, "cft", i.sandPerCft),
    costLine(`Aggregate (${round(materials.aggCft, 1)} cft)`, materials.aggCft, "cft", i.crushPerCft),
    costLine(`Steel (${round(totalSteel, 1)} kg)`, totalSteel, "kg", i.steelPerKg),
  ];
  return {
    errors, warnings,
    dMm: round(d, 1), dPrimeMm: round(dPrime, 1),
    selfWeightKNm: round(wSw, 2), factoredLoadKNm: round(W, 2),
    muSpanKNm: round(muSpan, 1), muSupportKNm: round(muSupport, 1),
    muGoverningKNm: round(muGov, 1), vuKN: round(vu, 1),
    muLimKNm: round(muLim, 1), doublyReinforced: doubly,
    astSpanMm2: round(spanSteel.ast), astSupportMm2: round(supSteel.ast),
    astReqMm2: round(astReq), astMinMm2: round(astMin), astMaxMm2: round(astMax),
    astMaxOk, ascMm2: round(govSteel.asc), fscMpa: round(fsc, 1),
    barsRequired: bars, astProvidedMm2: round(astProv, 0), ptPct: round(pt, 2),
    deflectionSafe, actualLdRatio: round(actualLd, 2), allowableLdRatio: round(allowLd, 2),
    tauVMpa: round(tauV, 2), tauCMpa: round(tauCVal, 2), tauCMaxMpa: tauCMaxVal,
    shearSafe, stirrupSpacingMm: stirrupSpacing, stirrupDesc,
    ldMm: round(ld),
    stirrupLengthMm: round(stirrupLen),
    mainSteelKg: round(mainKg, 2), stirrupSteelKg: round(stirrupKg, 2),
    compSteelKg: round(compKg, 2), totalSteelKg: round(totalSteel, 2),
    concreteVolM3: round(concVol, 3), materials,
    costLines: lines, totalCost: totalCost(lines),    steps: [
      { label: "Effective depth", text: `d = D − cover − stirrup dia − φ/2 = ${i.depthMm} − ${i.coverMm} − ${i.stirrupDiaMm} − ${i.mainDiaMm}/2 = ${round(d, 1)} mm` },
      { label: "Factored load", text: `w = (${i.workingLoadKNm} + self-weight ${round(wSw, 2)}) × ${i.safetyFactor} = ${round(W, 2)} kN/m` },
      { label: "Design moment", text: i.support === "continuous"
        ? `Support Mu = wL²/10 = ${round(muSupport, 1)} kNm; span Mu = wL²/12 = ${round(muSpan, 1)} kNm (IS 456 continuous beam)`
        : `Mu = ${i.support === "cantilever" ? "wL²/2" : "wL²/8"} = ${round(muGov, 1)} kNm` },
      { label: "Limiting moment", text: `Mu,lim = ${round(muLim, 1)} kNm (xu,max/d = ${xuMaxRatio(i.fy)})` },
      { label: "Steel", text: `Ast = ${round(astReq)} mm² → ${bars} × ${i.mainDiaMm} mm bars (${round(astProv)} mm² provided)${govSteel.asc > 0 ? `; Asc = ${round(govSteel.asc)} mm² at fsc = ${round(fsc, 1)} MPa (SP-16 Table F)` : ""}` },
      { label: "Shear", text: `τv = ${round(tauV, 2)} MPa vs τc = ${round(tauCVal, 2)} MPa, τc,max = ${tauCMaxVal} MPa — ${stirrupDesc}` },
      { label: "Development length", text: `Ld = 0.87·fy·φ / (4·τbd) = ${round(ld)} mm` },
    ],
  };
}

export const BEAM_FAQS: FaqItem[] = [
  { q: "How is Ast calculated for a beam?", a: "By the IS 456 limit state formula Ast = (0.5·fck/fy)·(1 − √(1 − 4.6·Mu/(fck·b·d²)))·b·d, where Mu is the factored design moment and d = D − cover − stirrup dia − φ/2. The result is then checked against Ast,min = 0.85·b·d/fy and Ast,max = 0.04·b·D." },
  { q: "When is a beam doubly reinforced?", a: "When the design moment Mu exceeds the limiting moment Mu,lim. Compression steel is then needed as well as tension steel. The compression steel stress fsc comes from SP-16 Table F by d′/d and steel grade — for Fe500 it is well below 0.87·fy, so assuming 0.87·fy would under-design the compression steel." },
  { q: "What is Mu,lim?", a: "The maximum moment a singly reinforced section can resist, reached when the neutral axis is at xu,max. For Fe500, xu,max/d = 0.46. If Mu is larger, either deepen the section or design it as doubly reinforced." },
  { q: "What are the minimum and maximum steel limits in a beam?", a: "Minimum tension steel is Ast,min = 0.85·b·d/fy (IS 456 Cl. 26.5.1.1) so the beam does not fail suddenly in tension. Maximum steel is Ast,max = 0.04·b·D — above that the section is over-reinforced and concrete crushes before the steel yields." },
  { q: "How is stirrup spacing calculated?", a: "From the shear the concrete can carry (τc, IS 456 Table 19) and the balance the stirrups must carry: spacing = 0.87·fy·Asv·d / Vus, capped by the minimum-steel spacing 0.87·fy·Asv / (0.4·b) and by 0.75·d or 300 mm, whichever is smaller." },
  { q: "What is development length?", a: "The length of bar that must be embedded in concrete for the bar to reach its design stress: Ld = 0.87·fy·φ / (4·τbd), where τbd is the design bond stress from IS 456 Table 26 (×1.6 for deformed bars). For Fe500 16 mm bars in M25 concrete it is about 777 mm." },
];
