/** topsoilCalc.ts — topsoil engine (pure client-side).
 * Replaces the dead POST /api/tools/topsoil-calculator (no server on
 * static GitHub Pages). Settling/compaction allowance default 10%
 * (competitor norm; the old 15% was high). Swell factors from the merged
 * TopSoilFillCalculator orphan: topsoil 1.25, sand 1.15, gravel 1.12, clay 1.40. */
export const TOPSOIL_MATERIALS = {
  topsoil: { label: "Topsoil", densityKgM3: 1200, swellFactor: 1.25 },
  compost: { label: "Compost", densityKgM3: 600, swellFactor: 1.2 },
  sand: { label: "Sand", densityKgM3: 1600, swellFactor: 1.15 },
  gravel: { label: "Gravel", densityKgM3: 1700, swellFactor: 1.12 },
  clay: { label: "Clay fill", densityKgM3: 1600, swellFactor: 1.4 },
} as const;
export type TopsoilMaterial = keyof typeof TOPSOIL_MATERIALS;
export interface TopsoilInput { areaM2: number; depthM: number; densityKgM3: number; allowancePct?: number; bagWeightKg?: number; truckCapacityM3?: number; bulkRatePerM3?: number | null; bagRateEach?: number | null; deliveryFee?: number; }
export function topsoilCalc(input: TopsoilInput) {
  const { areaM2, depthM, densityKgM3 } = input;
  if (areaM2 <= 0) throw new Error("Area must be > 0.");
  if (depthM <= 0 || depthM > 1) throw new Error("Depth must be 0–1 m (1–100 cm).");
  if (densityKgM3 <= 0) throw new Error("Density must be > 0.");
  const allowancePct = input.allowancePct ?? 10;
  const netM3 = areaM2 * depthM;
  const orderM3 = netM3 * (1 + allowancePct / 100);
  const weightKg = orderM3 * densityKgM3;
  const bagWeightKg = input.bagWeightKg ?? 25;
  const bags = Math.ceil(weightKg / bagWeightKg);
  const truckCap = input.truckCapacityM3 ?? 10;
  const trucks = Math.ceil(orderM3 / truckCap);
  const bulkCost = input.bulkRatePerM3 != null ? orderM3 * input.bulkRatePerM3 + (input.deliveryFee ?? 0) : null;
  const bagCost = input.bagRateEach != null ? bags * input.bagRateEach + (input.deliveryFee ?? 0) : null;
  return {
    netM3, orderM3, weightKg, weightTonnes: weightKg / 1000, bags, trucks,
    volumeYd3: orderM3 * 1.30795, volumeFt3: orderM3 * 35.3147, volumeLitres: orderM3 * 1000,
    bulkCost, bagCost,
    cheaper: bulkCost != null && bagCost != null ? (bulkCost <= bagCost ? "bulk" : "bags") : null,
  };
}
export const TOPSOIL_WORKED: TopsoilInput = { areaM2: 50, depthM: 0.15, densityKgM3: 1200, allowancePct: 15, bagWeightKg: 25, truckCapacityM3: 10 };
