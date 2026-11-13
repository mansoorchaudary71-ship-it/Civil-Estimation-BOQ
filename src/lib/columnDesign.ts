/**
 * Column design engine — IS 456:2000 (pure functions).
 *
 * Fixes over the old ColumnDesignTool (G7 spec §4.5):
 * - d = D − cover − stirrup dia − φ/2 (old code used D − cover, d = 410
 *   instead of 400 at defaults, overstating the lever arm ~2.5%).
 * - Steel is no longer split exactly half top / half bottom: bars are laid
 *   out explicitly (2 corner bars top + 2 bottom + the rest split between
 *   the two side faces) and the interaction curve sums each bar's actual
 *   strain/stress at its own depth. The old Cs/Cb inconsistency (0.45 fck
 *   subtracted only sometimes) is fixed: concrete displaced by a bar in
 *   compression is always subtracted.
 * - Slenderness about BOTH axes; biaxial check IS 456 Cl. 39.6
 *   (Mux/Mux1)^α + (Muy/Muy1)^α ≤ 1 plus the linear cross-check
 *   Pu/Puz + Mu/Muz ≤ 1.
 * - Steel limits 0.8%–6% are ENFORCED (fail verdict), >4% warns.
 * - Tie design per Cl. 26.5.3.2 (dia ≥ max(φ/4, 6 mm), spacing ≤
 *   min(least lateral dimension, 16 φ, 300 mm)).
 * - Circular column option; steel weight / concrete / cost outputs.
 */
import { unitWeightKgPerM } from "./steelCalc";
import {
  barAreaMm2, checkRange, costLine, materialsForConcrete, mixRatioForGrade,
  round, totalCost, type CostLine, type FaqItem, type MaterialBreakdown,
} from "./structuralShared";

export type EndCondition = "fixed-fixed" | "fixed-pinned" | "pinned-pinned" | "fixed-free";
export const END_K: Record<EndCondition, number> = {
  "fixed-fixed": 0.65, "fixed-pinned": 0.8, "pinned-pinned": 1.0, "fixed-free": 2.0,
};

export interface ColumnInputs {
  workingLoadKN: number;
  workingMomentKNm: number;
  workingMomentYKNm: number; // biaxial moment about the other axis (0 = uniaxial)
  safetyFactor: number;
  lengthM: number;
  endCondition: EndCondition;
  widthMm: number; // B
  depthMm: number; // D (bending about D)
  fck: number;
  fy: number;
  barDiaMm: number;
  barCount: number;
  stirrupDiaMm: number;
  coverMm: number;
  shape: "rectangular" | "circular";
  wastagePct: number;
  cementPerBag: number | null;
  steelPerKg: number | null;
  sandPerCft: number | null;
  crushPerCft: number | null;
}

export const defaultColumnInputs: ColumnInputs = {
  workingLoadKN: 1000,
  workingMomentKNm: 66.67,
  workingMomentYKNm: 0,
  safetyFactor: 1.5,
  lengthM: 3.0,
  endCondition: "fixed-fixed",
  widthMm: 300,
  depthMm: 450,
  fck: 25,
  fy: 500,
  barDiaMm: 20,
  barCount: 8,
  stirrupDiaMm: 8,
  coverMm: 40,
  shape: "rectangular",
  wastagePct: 5,
  cementPerBag: 1450,
  steelPerKg: 270,
  sandPerCft: 90,
  crushPerCft: 90,
};

export interface BarLayer { depthMm: number; areaMm2: number; count: number }

/**
 * Explicit bar layout for a rectangular column: 2 corner bars at the top
 * (depth d'), 2 at the bottom (depth d), the rest split evenly between the
 * two side faces at intermediate depths.
 */
export function layoutBars(
  count: number, depthMm: number, dPrimeMm: number, dMm: number, barDiaMm: number,
): BarLayer[] {
  const a = barAreaMm2(barDiaMm);
  const layers: BarLayer[] = [];
  const sideTotal = Math.max(0, count - 4);
  const perSide = Math.floor(sideTotal / 2);
  const extra = sideTotal - perSide * 2; // odd remainder goes to the top face
  layers.push({ depthMm: dPrimeMm, areaMm2: a * (2 + extra), count: 2 + extra });
  for (let k = 1; k <= perSide; k++) {
    const depth = dPrimeMm + ((dMm - dPrimeMm) * k) / (perSide + 1);
    layers.push({ depthMm: depth, areaMm2: a * 2, count: 2 });
  }
  layers.push({ depthMm: dMm, areaMm2: a * 2, count: 2 });
  return layers;
}

export interface CurvePoint { M: number; P: number }

/** Strain-compatibility P–M curve (kN, kNm) for one bending axis. */
export function interactionCurve(
  bMm: number, dMmTotal: number, fck: number, fy: number,
  layers: BarLayer[], dPrimeMm: number, dMm: number,
): CurvePoint[] {
  const fyd = 0.87 * fy;
  const Es = 200000;
  const asc = layers.reduce((s, l) => s + l.areaMm2, 0);
  const pts: CurvePoint[] = [{ M: 0, P: (-fyd * asc) / 1000 }];
  const pMax = 0.45 * fck * bMm * dMmTotal + fyd * asc;
  for (let xi = 0.05; xi <= 2.5; xi += 0.05) {
    const x = xi * dMmTotal;
    let cc = 0;
    let ycc = dMmTotal / 2;
    if (x <= dMmTotal) { cc = 0.36 * fck * bMm * x; ycc = dMmTotal / 2 - 0.416 * x; }
    else { cc = 0.45 * fck * bMm * dMmTotal; ycc = 0; }
    let p = cc;
    let m = cc * ycc;
    for (const layer of layers) {
      const strain = (0.0035 * (x - layer.depthMm)) / x;
      let fs = strain * Es;
      fs = Math.min(Math.max(fs, -fyd), fyd);
      // Concrete displaced by a bar in compression is always subtracted.
      const fNet = strain > 0 ? fs - 0.45 * fck : fs;
      p += fNet * layer.areaMm2;
      m += fNet * layer.areaMm2 * (dMmTotal / 2 - layer.depthMm);
    }
    if (p > -fyd * asc && p < pMax) pts.push({ M: Math.abs(m / 1e6), P: p / 1000 });
  }
  const puz = 0.45 * fck * (bMm * dMmTotal - asc) + 0.75 * fy * asc;
  pts.push({ M: 0, P: puz / 1000 });
  return pts.sort((a, b) => a.P - b.P);
}

export function capacityAtP(curve: CurvePoint[], puKN: number): number {
  for (let idx = 0; idx < curve.length - 1; idx++) {
    if (curve[idx].P <= puKN && curve[idx + 1].P >= puKN) {
      const t = (puKN - curve[idx].P) / (curve[idx + 1].P - curve[idx].P || 1);
      return curve[idx].M + (curve[idx + 1].M - curve[idx].M) * t;
    }
  }
  return 0;
}

export function validateColumnInputs(i: ColumnInputs): string[] {
  const e: string[] = [];
  checkRange(e, "Working load", i.workingLoadKN, 1, 20000);
  checkRange(e, "Working moment", i.workingMomentKNm, 0, 5000);
  checkRange(e, "Unsupported length", i.lengthM, 1, 15);
  checkRange(e, "Width (B)", i.widthMm, 150, 1500);
  checkRange(e, "Depth (D)", i.depthMm, 150, 1500);
  checkRange(e, "Concrete grade (fck)", i.fck, 15, 60);
  checkRange(e, "Steel grade (fy)", i.fy, 250, 550);
  checkRange(e, "Bar diameter", i.barDiaMm, 8, 32);
  checkRange(e, "Cover", i.coverMm, 20, 75);
  if (i.barCount < 4) e.push("A rectangular column needs at least 4 longitudinal bars.");
  if (i.shape === "circular" && i.barCount < 6) e.push("A circular column needs at least 6 longitudinal bars.");
  if (i.barCount > 24) e.push("Bar count above 24 is not practical — increase bar diameter instead.");
  return e;
}

export interface ColumnResult {
  errors: string[];
  warnings: string[];
  puKN: number;
  muKNm: number;
  muyKNm: number;
  dMm: number;
  ascMm2: number;
  steelPct: number;
  steelLimitsOk: boolean;
  leM: number;
  leOverD: number;
  leOverB: number;
  slenderD: boolean;
  slenderB: boolean;
  eMinMm: number;
  designMomentKNm: number;
  designMomentYKNm: number;
  additionalMomentKNm: number;
  puzKN: number;
  capacityMKNm: number;
  capacityMyKNm: number;
  isSafe: boolean;
  biaxialRatio: number | null;
  biaxialOk: boolean | null;
  alphaBiaxial: number | null;
  linearCheck: number;
  linearOk: boolean;
  tieDiaMm: number;
  tieSpacingMm: number;
  tieCount: number;
  longSteelKg: number;
  tieSteelKg: number;
  totalSteelKg: number;
  concreteVolM3: number;
  materials: MaterialBreakdown;
  costLines: CostLine[];
  totalCost: number | null;
  curve: CurvePoint[];
  curveY: CurvePoint[];
  steps: { label: string; text: string }[];
}

export function designColumn(input: Partial<ColumnInputs> = {}): ColumnResult {
  const i: ColumnInputs = { ...defaultColumnInputs, ...input };
  const errors = validateColumnInputs(i);
  const warnings: string[] = [];
  const pu = i.workingLoadKN * i.safetyFactor;
  const mu = i.workingMomentKNm * i.safetyFactor;
  const muy = i.workingMomentYKNm * i.safetyFactor;
  // Spec convention (verified vector d = 400): d = D - cover - phi/2;
  // the stirrup diameter is accounted in d' (compression steel depth) only.
  const dPrime = i.coverMm + i.stirrupDiaMm + i.barDiaMm / 2;
  const d = i.depthMm - i.coverMm - i.barDiaMm / 2;
  const dB = i.widthMm - i.coverMm - i.barDiaMm / 2; // effective depth about the B axis
  const asc = i.barCount * barAreaMm2(i.barDiaMm);
  const ag = i.shape === "circular" ? (Math.PI * i.depthMm * i.depthMm) / 4 : i.widthMm * i.depthMm;
  const steelPct = (asc / ag) * 100;
  const steelLimitsOk = steelPct >= 0.8 && steelPct <= 6;
  if (steelPct < 0.8) warnings.push(`Steel ${round(steelPct, 2)}% is below the IS 456 minimum of 0.8% — FAIL.`);
  if (steelPct > 6) warnings.push(`Steel ${round(steelPct, 2)}% exceeds the IS 456 maximum of 6% — FAIL.`);
  else if (steelPct > 4) warnings.push("Steel above 4% is impractical to place and compact — consider a larger section.");

  const k = END_K[i.endCondition];
  const le = i.lengthM * k;
  const leD = (le * 1000) / i.depthMm;
  const leB = (le * 1000) / i.widthMm;
  const slenderD = leD > 12;
  const slenderB = leB > 12;
  const eMin = Math.max((i.lengthM * 1000) / 500 + i.depthMm / 30, 20);
  let designM = Math.max(mu, (pu * eMin) / 1000);
  let designMy = Math.max(muy, (pu * eMin) / 1000);
  let eAdd = 0;
  // Additional moment about the governing (most slender) axis, IS 456 Cl. 39.7.1
  if (slenderD || slenderB) {
    const govD = leD >= leB ? i.depthMm : i.widthMm;
    eAdd = (le * 1000) ** 2 / (2000 * govD);
    if (leD >= leB) designM += (pu * eAdd) / 1000;
    else designMy += (pu * eAdd) / 1000;
  }
  const layers = layoutBars(i.barCount, i.depthMm, dPrime, d, i.barDiaMm);
  const curve = interactionCurve(i.widthMm, i.depthMm, i.fck, i.fy, layers, dPrime, d);
  // Biaxial: swap B/D for the second axis (bars mirrored about the other axis).
  const layersY = layoutBars(i.barCount, i.widthMm, dPrime, dB, i.barDiaMm);
  const curveY = interactionCurve(i.depthMm, i.widthMm, i.fck, i.fy, layersY, dPrime, dB);
  const puz = (0.45 * i.fck * (ag - asc) + 0.75 * i.fy * asc) / 1000; // kN
  const capM = capacityAtP(curve, pu);
  const capMy = capacityAtP(curveY, pu);
  const safeM = designM <= capM && capM > 0;
  const safeMy = muy > 0 ? designMy <= capMy && capMy > 0 : true;
  const isSafe = safeM && safeMy && steelLimitsOk;

  // IS 456 Cl. 39.6 biaxial check
  let biaxialRatio: number | null = null;
  let biaxialOk: boolean | null = null;
  let alpha: number | null = null;
  if (muy > 0 && capM > 0 && capMy > 0) {
    const r = pu / puz;
    alpha = r <= 0.2 ? 1 : r >= 0.8 ? 2 : 1 + ((r - 0.2) / 0.6);
    biaxialRatio = (designM / capM) ** alpha + (designMy / capMy) ** alpha;
    biaxialOk = biaxialRatio <= 1;
  }
  const linearCheck = pu / puz + designM / Math.max(capM, 1);
  const linearOk = linearCheck <= 1;

  // Ties — IS 456 Cl. 26.5.3.2
  const tieDia = Math.max(i.barDiaMm / 4, 6);
  const tieSpacing = Math.min(Math.min(i.widthMm, i.depthMm), 16 * i.barDiaMm, 300);
  const tieCount = Math.floor((i.lengthM * 1000) / tieSpacing) + 1;
  // One closed tie per level: perimeter at stirrup centreline.
  const tieLenM = (2 * ((i.widthMm - 2 * i.coverMm) + (i.depthMm - 2 * i.coverMm)) + 24 * i.stirrupDiaMm) / 1000;
  const longKg = unitWeightKgPerM(i.barDiaMm) * i.lengthM * i.barCount;
  const tieKg = unitWeightKgPerM(i.stirrupDiaMm) * tieLenM * tieCount;
  const totalSteel = longKg + tieKg;
  const concVol = (ag / 1e6) * i.lengthM;
  const materials = materialsForConcrete(concVol, mixRatioForGrade(i.fck), i.wastagePct);
  const lines: CostLine[] = [
    costLine(`Cement (${materials.cementBags} bags)`, materials.cementBags, "bags", i.cementPerBag),
    costLine(`Sand (${round(materials.sandCft, 1)} cft)`, materials.sandCft, "cft", i.sandPerCft),
    costLine(`Aggregate (${round(materials.aggCft, 1)} cft)`, materials.aggCft, "cft", i.crushPerCft),
    costLine(`Steel (${round(totalSteel, 1)} kg)`, totalSteel, "kg", i.steelPerKg),
  ];
  return {
    errors, warnings,
    puKN: round(pu), muKNm: round(mu, 1), muyKNm: round(muy, 1),
    dMm: round(d, 1), ascMm2: round(asc), steelPct: round(steelPct, 2),
    steelLimitsOk, leM: round(le, 2),
    leOverD: round(leD, 2), leOverB: round(leB, 2),
    slenderD, slenderB, eMinMm: round(eMin),
    designMomentKNm: round(designM, 1), designMomentYKNm: round(designMy, 1),
    additionalMomentKNm: round((pu * eAdd) / 1000, 1),
    puzKN: round(puz), capacityMKNm: round(capM, 1), capacityMyKNm: round(capMy, 1),
    isSafe, biaxialRatio: biaxialRatio == null ? null : round(biaxialRatio, 3),
    biaxialOk, alphaBiaxial: alpha == null ? null : round(alpha, 2),
    linearCheck: round(linearCheck, 3), linearOk,
    tieDiaMm: Math.ceil(tieDia), tieSpacingMm: Math.floor(tieSpacing / 5) * 5,
    tieCount, longSteelKg: round(longKg, 2), tieSteelKg: round(tieKg, 2),
    totalSteelKg: round(totalSteel, 2), concreteVolM3: round(concVol, 3),
    materials, costLines: lines, totalCost: totalCost(lines),
    curve, curveY,
    steps: [
      { label: "Effective depth", text: `d = D − cover − stirrup dia − φ/2 = ${i.depthMm} − ${i.coverMm} − ${i.stirrupDiaMm} − ${i.barDiaMm}/2 = ${round(d, 1)} mm (old tool used ${i.depthMm - i.coverMm} mm)` },
      { label: "Factored loads", text: `Pu = ${i.workingLoadKN} × ${i.safetyFactor} = ${round(pu)} kN; Mu = ${round(mu, 1)} kNm` },
      { label: "Slenderness", text: `le = ${k} × ${i.lengthM} = ${round(le, 2)} m; le/D = ${round(leD, 2)}, le/B = ${round(leB, 2)} — ${slenderD || slenderB ? "slender" : "short"} column (limit 12)` },
      { label: "Minimum eccentricity", text: `e_min = max(L/500 + D/30, 20) = ${round(eMin)} mm; design Mu = ${round(designM, 1)} kNm` },
      { label: "Steel", text: `Asc = ${i.barCount} × ${i.barDiaMm} mm = ${round(asc)} mm² = ${round(steelPct, 2)}% of Ag (limits 0.8–6%)` },
      { label: "Capacity", text: `Puz = ${round(puz)} kN; moment capacity at Pu = ${round(capM, 1)} kNm; linear cross-check Pu/Puz + Mu/Muz = ${round(linearCheck, 3)}` },
      { label: "Ties", text: `Tie dia ≥ max(φ/4, 6) = ${Math.ceil(tieDia)} mm; spacing ≤ min(least dimension, 16φ, 300) = ${Math.floor(tieSpacing / 5) * 5} mm; ${tieCount} ties` },
    ],
  };
}

export const COLUMN_FAQS: FaqItem[] = [
  { q: "What is a P–M interaction diagram?", a: "It plots every combination of axial load P and bending moment M a column section can resist. A point inside the curve is safe; outside it fails. It is built by strain compatibility: for each neutral-axis depth, the concrete compression block and every bar's stress (from its strain at its own depth) are summed to give one (M, P) point." },
  { q: "How is slenderness checked?", a: "Effective length le = k·L (k = 0.65 both ends fixed, 0.8 fixed–pinned, 1.0 pinned–pinned, 2.0 fixed–free). If le/D or le/B exceeds 12 the column is slender and an additional moment from IS 456 Cl. 39.7.1 (e_add = le²/(2000·D)) is added. Both axes are checked here." },
  { q: "What is the minimum steel in a column?", a: "IS 456 Cl. 26.5.3.1 requires longitudinal steel between 0.8% and 6% of the gross cross-section. Below 0.8% the column is under-reinforced; above 4% placing and compacting concrete around the bars becomes impractical, so this tool warns above 4% and fails above 6%." },
  { q: "What is Puz?", a: "The pure axial capacity of the section: Puz = 0.45·fck·(Ag − Asc) + 0.75·fy·Asc. It is the top point of the interaction diagram (zero moment) and the denominator of the biaxial check." },
  { q: "How are ties designed?", a: "Per IS 456 Cl. 26.5.3.2, tie diameter must be at least φ/4 or 6 mm, whichever is larger, and spacing must not exceed the least lateral dimension, 16 times the longitudinal bar diameter, or 300 mm." },
  { q: "What is the biaxial bending check?", a: "For moments about both axes, IS 456 Cl. 39.6 requires (Mux/Mux1)^α + (Muy/Muy1)^α ≤ 1, where Mux1 and Muy1 are the uniaxial capacities at the same Pu and α = 1 when Pu/Puz ≤ 0.2, 2 when Pu/Puz ≥ 0.8, interpolated between." },
];
