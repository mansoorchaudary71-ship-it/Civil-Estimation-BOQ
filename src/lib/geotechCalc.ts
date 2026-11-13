/** geotechCalc.ts — pure geotechnical index-test engine (IS 2720 / IS 1498).
 * Water content, specific gravity, Atterberg limits, phase relations,
 * one-point / regression liquid limit, and CBR reporting per IS 2720 Pt 16:
 * report the 2.5 mm value; if CBR(5.0 mm) > CBR(2.5 mm) flag "repeat test"
 * — never silently take the max. Plasticity is labelled from LL/PI, never
 * from water content alone. */
export function waterContent(w1: number, w2: number, w3: number): number {
  if (!(w3 > w1) || !(w2 >= w3)) throw new Error("Need W2 >= W3 > W1 (container, wet, dry weights).");
  return ((w2 - w3) / (w3 - w1)) * 100;
}
export function specificGravity(w1: number, w2: number, w3: number, w4: number): number {
  const denom = (w2 - w1) - (w3 - w4);
  if (denom <= 0) throw new Error("Invalid pycnometer weights: denominator must be positive.");
  return (w2 - w1) / denom;
}
/** One-point LL (fallback only): LL = w * (N/25)^0.121, valid 15<=N<=35. */
export function onePointLiquidLimit(wPct: number, blowsN: number): number {
  if (blowsN < 15 || blowsN > 35) throw new Error("Blow count N must be 15–35 for the one-point LL method.");
  return wPct * Math.pow(blowsN / 25, 0.121);
}
/** Flow-curve regression: LL = w at N=25 from log10(N) vs w linear fit. */
export function liquidLimitRegression(points: { n: number; w: number }[]): { ll: number; r2: number } {
  if (points.length < 3) throw new Error("Need at least 3 flow-curve points for regression.");
  const xs = points.map((p) => Math.log10(p.n));
  const ys = points.map((p) => p.w);
  const mx = xs.reduce((a, b) => a + b, 0) / xs.length;
  const my = ys.reduce((a, b) => a + b, 0) / ys.length;
  let sxy = 0, sxx = 0, syy = 0;
  xs.forEach((x, i) => { sxy += (x - mx) * (ys[i] - my); sxx += (x - mx) ** 2; syy += (ys[i] - my) ** 2; });
  const slope = sxx === 0 ? 0 : sxy / sxx;
  const intercept = my - slope * mx;
  const ll = intercept + slope * Math.log10(25);
  const r2 = sxx === 0 || syy === 0 ? 0 : (sxy * sxy) / (sxx * syy);
  return { ll, r2 };
}
export interface Atterberg { ll: number; pl: number; pi: number; li: number; ci: number; activity: number | null; plasticity: string; }
export function atterberg(ll: number, pl: number, wPct: number, clayPct?: number): Atterberg {
  if (ll <= pl) throw new Error("Liquid limit must exceed plastic limit.");
  const pi = ll - pl;
  const li = (wPct - pl) / pi;
  const ci = (ll - wPct) / pi;
  const activity = clayPct && clayPct > 0 ? pi / clayPct : null;
  let plasticity = "Low plasticity";
  if (pi > 17) plasticity = "High plasticity";
  else if (pi > 7) plasticity = "Medium plasticity";
  return { ll, pl, pi, li, ci, activity, plasticity };
}
/** CBR per IS 2720 Pt 16. Standard loads: 1370 kg @2.5 mm, 2055 kg @5.0 mm. */
export function cbrFromLoads(load25Kg: number, load50Kg: number): { cbr25: number; cbr50: number; reported: number; governing: string; repeatTest: boolean; note: string } {
  if (load25Kg < 0 || load50Kg < 0) throw new Error("CBR loads must be >= 0.");
  const cbr25 = (load25Kg / 1370) * 100;
  const cbr50 = (load50Kg / 2055) * 100;
  const repeatTest = cbr50 > cbr25;
  return {
    cbr25, cbr50,
    reported: cbr25,
    governing: "2.5 mm penetration (IS 2720 Pt 16)",
    repeatTest,
    note: repeatTest
      ? "CBR at 5.0 mm exceeds CBR at 2.5 mm — repeat the test. If the repeat also gives 5.0 mm higher, the 5.0 mm value may be reported."
      : "Reported value is the 2.5 mm CBR, per IS 2720 Pt 16.",
  };
}
/** Phase relations. Defaults fixed so S <= 100%: bulk 1.8 g/cc, w 25%, Gs 2.667. */
export function phaseRelations(wPct: number, gs: number, bulkDensity: number): { w: number; gs: number; dryDensity: number; voidRatio: number; saturationPct: number } {
  if (wPct < 0 || gs <= 0 || bulkDensity <= 0) throw new Error("w, Gs and bulk density must be positive.");
  const w = wPct / 100;
  const dryDensity = bulkDensity / (1 + w);
  const voidRatio = gs / dryDensity - 1;
  if (voidRatio <= 0) throw new Error("Void ratio must be positive — check bulk density / Gs.");
  const saturationPct = ((w * gs) / voidRatio) * 100;
  return { w: wPct, gs, dryDensity, voidRatio, saturationPct };
}
export function freeSwell(initialMl: number, finalMl: number): { swellPct: number; band: string } {
  if (initialMl <= 0) throw new Error("Initial volume must be > 0.");
  const swellPct = ((finalMl - initialMl) / initialMl) * 100;
  const band = swellPct < 20 ? "Low expansiveness" : swellPct <= 50 ? "Moderate expansiveness" : "High expansiveness";
  return { swellPct, band };
}
export const GEOTECH_WORKED = { waterContentPct: 25.0, specificGravity: 2.667, liquidLimit: 41.4, cbr25: 13.14, cbr50: 14.6 };
