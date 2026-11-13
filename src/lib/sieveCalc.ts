/** sieveCalc.ts — sieve analysis engine (IS 383 / ASTM D6913 / IS 1498 USCS).
 * D10/D30/D60 by log-interpolation, never extrapolated. USCS order fixed:
 * gravel-vs-sand is decided FIRST (coarse fraction retained on 4.75 mm),
 * then Cu>=4 (gravel) / Cu>=6 (sand) with 1<=Cc<=3 gives GW/SW — so SW
 * is reachable, unlike the old component where the GW branch ran first. */
export interface SieveRowInput { sizeMm: number; retainedG: number; }
export interface SieveRowOut extends SieveRowInput { cumRetainedPct: number; passingPct: number; }
export function analyseSieve(rows: SieveRowInput[], totalWeightG: number, panG = 0): { rows: SieveRowOut[]; sumRetained: number; sumCheckPct: number; d10: number | null; d30: number | null; d60: number | null; cu: number | null; cc: number | null; fm: number; finesPct: number; uscs: string; warnings: string[] } {
  if (totalWeightG <= 0) throw new Error("Total sample weight must be > 0.");
  if (rows.some((r) => r.retainedG < 0 || r.sizeMm <= 0)) throw new Error("Sieve sizes and retained weights must be >= 0 / > 0.");
  const sorted = [...rows].sort((a, b) => b.sizeMm - a.sizeMm); // coarse first
  const sumRetained = sorted.reduce((a, r) => a + r.retainedG, 0);
  const sumCheckPct = ((sumRetained + panG) / totalWeightG) * 100;
  const warnings: string[] = [];
  if (Math.abs(sumCheckPct - 100) > 2) warnings.push(`Retained + pan (${sumCheckPct.toFixed(1)}% of total) differs from total weight by more than 2% — check weights.`);
  let cum = 0;
  const out: SieveRowOut[] = sorted.map((r) => {
    cum += r.retainedG;
    const cumRetainedPct = (cum / totalWeightG) * 100;
    return { ...r, cumRetainedPct, passingPct: 100 - cumRetainedPct };
  });
  // D-values: log-interpolate % passing vs size (ascending size order)
  const asc = [...out].sort((a, b) => a.sizeMm - b.sizeMm);
  const dAt = (target: number): number | null => {
    for (let i = 0; i < asc.length - 1; i++) {
      const p1 = asc[i].passingPct, p2 = asc[i + 1].passingPct;
      if ((p1 <= target && p2 >= target) || (p1 >= target && p2 <= target)) {
        if (p2 === p1) return asc[i].sizeMm;
        const logX = Math.log10(asc[i].sizeMm) + ((target - p1) * (Math.log10(asc[i + 1].sizeMm) - Math.log10(asc[i].sizeMm))) / (p2 - p1);
        return Math.pow(10, logX);
      }
    }
    return null; // curve does not reach this % — never extrapolate
  };
  const d10 = dAt(10), d30 = dAt(30), d60 = dAt(60);
  const cu = d10 && d60 ? d60 / d10 : null;
  const cc = d10 && d30 && d60 ? (d30 * d30) / (d10 * d60) : null;
  // Fineness modulus: sum of cumulative % retained on 4.75/2.36/1.18/0.6/0.3/0.15 / 100
  const fmSizes = [4.75, 2.36, 1.18, 0.6, 0.3, 0.15];
  const fm = fmSizes.reduce((acc, s) => {
    const row = out.find((r) => Math.abs(r.sizeMm - s) < 0.001);
    return acc + (row ? row.cumRetainedPct : 0);
  }, 0) / 100;
  const finesPct = asc.length ? asc[0].passingPct : 0; // % passing the finest sieve (pan fraction)
  // USCS — gravel/sand first, then well-graded test
  let uscs = "Unknown — D-values incomplete";
  if (cu !== null && cc !== null) {
    const retained475 = out.find((r) => Math.abs(r.sizeMm - 4.75) < 0.001);
    const coarseRetainedPct = retained475 ? retained475.cumRetainedPct : 0;
    const coarseTotal = 100 - finesPct;
    const isGravel = coarseTotal > 0 && coarseRetainedPct / coarseTotal > 0.5;
    const wellGraded = isGravel ? cu >= 4 && cc >= 1 && cc <= 3 : cu >= 6 && cc >= 1 && cc <= 3;
    const base = isGravel ? (wellGraded ? "GW" : "GP") : (wellGraded ? "SW" : "SP");
    if (finesPct < 5) uscs = `${base} — ${isGravel ? "well/poorly graded gravel" : "well/poorly graded sand"}, clean (<5% fines)`;
    else if (finesPct <= 12) uscs = `${base}-SM/${base}-SC — dual symbol (5–12% fines; needs Atterberg limits to split)`;
    else uscs = `${isGravel ? "GM/GC" : "SM/SC"} — >12% fines; classify by A-line (needs LL/PL)`;
  }
  return { rows: out, sumRetained, sumCheckPct, d10, d30, d60, cu, cc, fm, finesPct, uscs, warnings };
}
/** AASHTO M145 group estimate from fines + LL/PI (simplified, labelled). */
export function aashtoGroup(finesPct: number, ll?: number, pi?: number): string {
  if (finesPct <= 15) return "A-1 / A-3 (granular — fines ≤15%)";
  if (finesPct <= 25) return "A-2 (granular with fines)";
  if (ll === undefined || pi === undefined) return "A-4 to A-7 (silt/clay — LL/PI needed to split)";
  if (ll <= 40 && pi <= 10) return "A-4 (silty soil)";
  if (ll <= 41 && pi <= 11) return "A-5 (silty soil)";
  if (ll <= 40 && pi > 11) return "A-6 (clayey soil)";
  return "A-7 (clayey soil)";
}
export const SIEVE_WORKED_ROWS: SieveRowInput[] = [
  { sizeMm: 4.75, retainedG: 100 }, { sizeMm: 2.36, retainedG: 200 }, { sizeMm: 1.18, retainedG: 250 },
  { sizeMm: 0.6, retainedG: 200 }, { sizeMm: 0.3, retainedG: 150 }, { sizeMm: 0.15, retainedG: 80 },
];
