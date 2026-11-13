/** earthworkCalc.ts — general earthworks engine (IS 1200 Pt 27).
 * Prismoidal V = L/6·(A1 + 4·Am + A2); average-end-area V = L·(A1+A2)/2.
 * Am must be MEASURED — if Am equals the mean end area the prismoidal
 * correction is zero and a warning is raised. Truck capacity is in m³
 * (the old "800" was unit-ambiguous). */
export interface EarthworkInput { lengthM: number; area1M2: number; area2M2: number; midAreaM2: number; swellPct?: number; shrinkPct?: number; truckCapacityM3?: number; excRate?: number; compRate?: number; haulRatePerTrip?: number; }
export function earthworkVolumes(input: EarthworkInput) {
  const { lengthM: L, area1M2: A1, area2M2: A2, midAreaM2: Am } = input;
  if (L <= 0 || A1 < 0 || A2 < 0 || Am < 0) throw new Error("Length must be > 0 and areas >= 0.");
  const prismoidal = (L / 6) * (A1 + 4 * Am + A2);
  const avgEnd = (L * (A1 + A2)) / 2;
  const correction = prismoidal - avgEnd;
  const swellPct = input.swellPct ?? 15;
  const shrinkPct = input.shrinkPct ?? 10;
  const loose = prismoidal * (1 + swellPct / 100);
  const compacted = prismoidal * (1 - shrinkPct / 100);
  const truckCap = input.truckCapacityM3 ?? 8;
  const trips = truckCap > 0 ? Math.ceil(loose / truckCap) : 0;
  const cost = (input.excRate ?? 0) * prismoidal + (input.compRate ?? 0) * compacted + (input.haulRatePerTrip ?? 0) * trips;
  const warnings: string[] = [];
  if (Math.abs(Am - (A1 + A2) / 2) < 1e-9) warnings.push("Mid area equals the mean end area, so the prismoidal correction is zero — measure Am at mid-length instead of averaging.");
  return { prismoidal, avgEnd, correction, loose, compacted, trips, cost, warnings };
}
/** Trench: trapezoidal section, pipe + bedding deduction, backfill, spoil. */
export function trenchVolume(lengthM: number, bottomWidthM: number, sideSlopeHPerV: number, depthM: number, pipeDiaM = 0, beddingDepthM = 0, beddingWidthM = 0, swellPct = 15): { topWidthM: number; sectionAreaM2: number; excavationM3: number; pipeM3: number; beddingM3: number; backfillM3: number; spoilLooseM3: number } {
  if (lengthM <= 0 || depthM <= 0 || bottomWidthM <= 0) throw new Error("Trench length, depth and bottom width must be > 0.");
  const topWidthM = bottomWidthM + 2 * sideSlopeHPerV * depthM;
  const sectionAreaM2 = ((bottomWidthM + topWidthM) / 2) * depthM;
  const excavationM3 = sectionAreaM2 * lengthM;
  const pipeM3 = pipeDiaM > 0 ? Math.PI * (pipeDiaM / 2) ** 2 * lengthM : 0;
  const beddingM3 = beddingDepthM > 0 && beddingWidthM > 0 ? beddingDepthM * beddingWidthM * lengthM : 0;
  const backfillM3 = Math.max(0, excavationM3 - pipeM3 - beddingM3);
  return { topWidthM, sectionAreaM2, excavationM3, pipeM3, beddingM3, backfillM3, spoilLooseM3: excavationM3 * (1 + swellPct / 100) };
}
export const OSHA_SLOPES = { "Type A (stable rock / stiff clay)": 0.75, "Type B (most soils)": 1.0, "Type C (loose / submerged)": 1.5 } as const;
export const EARTHWORK_WORKED: EarthworkInput = { lengthM: 100, area1M2: 50, area2M2: 40, midAreaM2: 47, swellPct: 15, shrinkPct: 10, truckCapacityM3: 8, excRate: 150, compRate: 100, haulRatePerTrip: 500 };
