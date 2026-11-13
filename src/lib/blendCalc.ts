/** blendCalc.ts — aggregate blending engine (trial-and-error / 0.45-power).
 * P_blend = Σ P_i · prop_i. Blended Gs: G_blend = 100 / Σ(prop_i% / G_i).
 * Defaults are EMPTY (not 100% passing) — the old all-100% defaults drew
 * a misleading flat line until every cell was overwritten. */
export interface Stockpile { name: string; gs: number; costPerTonne: number | null; passing: Record<number, number>; }
export function validatePassing(passing: Record<number, number>): string[] {
  const errs: string[] = [];
  const sizes = Object.keys(passing).map(Number).sort((a, b) => b - a);
  for (const s of sizes) {
    const v = passing[s];
    if (v < 0 || v > 100) errs.push(`% passing at ${s} mm must be 0–100 (got ${v}).`);
  }
  for (let i = 0; i < sizes.length - 1; i++) {
    if (passing[sizes[i + 1]] > passing[sizes[i]] + 1e-9) errs.push(`% passing must not increase as sieve size falls (${sizes[i]} mm → ${sizes[i + 1]} mm).`);
  }
  return errs;
}
export function blendPassing(stockpiles: Stockpile[], proportionsPct: number[]): Record<number, number> {
  if (stockpiles.length !== proportionsPct.length) throw new Error("Stockpile count must match proportion count.");
  const total = proportionsPct.reduce((a, b) => a + b, 0);
  if (total <= 0) throw new Error("Proportions must sum to more than 0.");
  const sizes = [...new Set(stockpiles.flatMap((s) => Object.keys(s.passing).map(Number)))].sort((a, b) => b - a);
  const out: Record<number, number> = {};
  for (const size of sizes) {
    out[size] = stockpiles.reduce((acc, s, i) => acc + (s.passing[size] ?? 0) * (proportionsPct[i] / total), 0);
  }
  return out;
}
export function blendedGs(stockpiles: Stockpile[], proportionsPct: number[]): number {
  // G_blend = 100 / Σ(P_i / G_i), P_i in percent (Alberta / OCW blending method)
  const denom = stockpiles.reduce((acc, s, i) => acc + proportionsPct[i] / s.gs, 0);
  if (denom <= 0) throw new Error("Proportions / Gs must be positive.");
  return 100 / denom;
}
/** 0.45-power maximum-density line: % passing = 100·(size/maxSize)^0.45 */
export function power45Line(sizeMm: number, maxSizeMm: number): number {
  return 100 * Math.pow(sizeMm / maxSizeMm, 0.45);
}
export function batchQuantities(totalBatchKg: number, proportionsPct: number[]): number[] {
  const total = proportionsPct.reduce((a, b) => a + b, 0);
  return proportionsPct.map((p) => (totalBatchKg * p) / total);
}
export function batchCost(totalBatchKg: number, proportionsPct: number[], stockpiles: Stockpile[]): number | null {
  if (stockpiles.some((s) => s.costPerTonne == null)) return null;
  const qtys = batchQuantities(totalBatchKg, proportionsPct);
  return qtys.reduce((acc, kg, i) => acc + (kg / 1000) * (stockpiles[i].costPerTonne as number), 0);
}
export const BLEND_EXAMPLE: { stockpiles: Stockpile[]; proportions: number[] } = {
  stockpiles: [
    { name: "20 mm aggregate", gs: 2.65, costPerTonne: null, passing: { 20: 100, 10: 55, 4.75: 5 } },
    { name: "10 mm aggregate", gs: 2.70, costPerTonne: null, passing: { 20: 100, 10: 95, 4.75: 25 } },
    { name: "Crusher dust", gs: 2.60, costPerTonne: null, passing: { 20: 100, 10: 100, 4.75: 90 } },
  ],
  proportions: [40, 35, 25],
};
