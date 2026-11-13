/** cbrCalc.ts — CBR engine (IS 2720 Pt 16 / ASTM D1883).
 * Origin-shift offset is CAPPED at 2.0 mm (its own comment's limit); a
 * larger intercept warns "re-seat specimen" instead of being applied.
 * Default minSpec 8% (IRC:37 subgrade for >10 MSA is ~5%; 15% is
 * base-course territory, not subgrade). */
export interface CbrPoint { penetrationMm: number; loadKg: number; }
export function interpolateLoad(points: CbrPoint[], targetPenMm: number): number {
  const sorted = [...points].sort((a, b) => a.penetrationMm - b.penetrationMm);
  if (sorted.length < 2) throw new Error("Need at least 2 load–penetration points.");
  if (targetPenMm <= sorted[0].penetrationMm) return sorted[0].loadKg;
  for (let i = 0; i < sorted.length - 1; i++) {
    const a = sorted[i], b = sorted[i + 1];
    if (targetPenMm >= a.penetrationMm && targetPenMm <= b.penetrationMm) {
      if (b.penetrationMm === a.penetrationMm) return a.loadKg;
      return a.loadKg + ((targetPenMm - a.penetrationMm) * (b.loadKg - a.loadKg)) / (b.penetrationMm - a.penetrationMm);
    }
  }
  return sorted[sorted.length - 1].loadKg;
}
/** Steepest early slope (first 2 mm) → x-intercept = origin offset, capped at 2 mm.
 * The cap is structural (an intercept from the first 2 mm is always < 2 mm),
 * but it is enforced and exposed via `capMm` so the rule is testable. */
export function originShiftOffset(points: CbrPoint[], capMm = 2.0): { offsetMm: number; capped: boolean; warning: string | null } {
  const early = [...points].sort((a, b) => a.penetrationMm - b.penetrationMm).filter((p) => p.penetrationMm <= 2.0);
  let best = { slope: 0, x: 0, y: 0 };
  for (let i = 0; i < early.length - 1; i++) {
    const dx = early[i + 1].penetrationMm - early[i].penetrationMm;
    if (dx <= 0) continue;
    const slope = (early[i + 1].loadKg - early[i].loadKg) / dx;
    if (slope > best.slope) best = { slope, x: early[i].penetrationMm, y: early[i].loadKg };
  }
  if (best.slope <= 0) return { offsetMm: 0, capped: false, warning: null };
  const intercept = best.x - best.y / best.slope;
  if (intercept <= 0) return { offsetMm: 0, capped: false, warning: null };
  if (intercept > capMm) return { offsetMm: capMm, capped: true, warning: `Origin offset ${intercept.toFixed(2)} mm exceeds ${capMm.toFixed(1)} mm — re-seat the specimen; correction capped at ${capMm.toFixed(1)} mm.` };
  return { offsetMm: intercept, capped: false, warning: null };
}
export interface CbrResult { load25Kg: number; load50Kg: number; cbr25: number; cbr50: number; reported: number; repeatTest: boolean; originOffsetMm: number; offsetWarning: string | null; mrMPa: { heukelom: number; aashto: number }; }
export function cbrFromCurve(points: CbrPoint[]): CbrResult {
  const { offsetMm, warning } = originShiftOffset(points);
  const load25Kg = interpolateLoad(points, 2.5 + offsetMm);
  const load50Kg = interpolateLoad(points, 5.0 + offsetMm);
  const cbr25 = (load25Kg / 1370) * 100;
  const cbr50 = (load50Kg / 2055) * 100;
  const repeatTest = cbr50 > cbr25;
  const reported = cbr25; // IS 2720 Pt 16: report 2.5 mm unless repeat confirms 5.0 mm higher
  return {
    load25Kg, load50Kg, cbr25, cbr50, reported, repeatTest,
    originOffsetMm: offsetMm, offsetWarning: warning,
    mrMPa: { heukelom: 17.6 * Math.pow(reported, 0.64), aashto: 10 * reported },
  };
}
export function averageCbr(values: number[]): { mean: number; specimens: number } {
  if (values.length === 0) throw new Error("Need at least one CBR value.");
  return { mean: values.reduce((a, b) => a + b, 0) / values.length, specimens: values.length };
}
export const CBR_MIN_SPEC_PRESETS = { subgradeLow: 5, subgrade: 8, subBase: 20, baseCourse: 80 } as const;
export const CBR_DEFAULT_MIN_SPEC = 8;
export const CBR_WORKED_POINTS: CbrPoint[] = [
  { penetrationMm: 0.5, loadKg: 15 }, { penetrationMm: 1.0, loadKg: 45 }, { penetrationMm: 1.5, loadKg: 90 },
  { penetrationMm: 2.0, loadKg: 130 }, { penetrationMm: 2.5, loadKg: 180 }, { penetrationMm: 3.0, loadKg: 215 },
  { penetrationMm: 4.0, loadKg: 270 }, { penetrationMm: 5.0, loadKg: 300 }, { penetrationMm: 7.5, loadKg: 380 },
  { penetrationMm: 10.0, loadKg: 430 }, { penetrationMm: 12.5, loadKg: 470 },
];
