/** asphaltCalc.ts — asphalt paving engine (MoRTH Cl. 507/509).
 * Density by mix: BC 2355, DBM 2370, BM 2160 kg/m³. Wastage default 10%
 * (5% simple rectangle / 15% hand-laid, editable). Loose volume ≈ +20%
 * behind the paver. Order quantity rounded UP to the nearest 0.5 t. */
export const ASPHALT_MIXES = {
  BC: { label: "Bituminous Concrete (BC)", densityKgM3: 2355, bitumenPct: 5.5 },
  DBM: { label: "Dense Bituminous Macadam (DBM)", densityKgM3: 2370, bitumenPct: 4.5 },
  BM: { label: "Bituminous Macadam (BM)", densityKgM3: 2160, bitumenPct: 3.5 },
} as const;
export type AsphaltMix = keyof typeof ASPHALT_MIXES;
export function asphaltQuantity(lengthM: number, widthM: number, thicknessMm: number, mix: AsphaltMix, wastagePct = 10): { volumeM3: number; netTonnes: number; orderTonnes: number; looseM3: number; bitumenTonnes: number } {
  if (lengthM <= 0 || widthM <= 0 || thicknessMm <= 0) throw new Error("Length, width and thickness must be > 0.");
  const volumeM3 = lengthM * widthM * (thicknessMm / 1000);
  const netTonnes = (volumeM3 * ASPHALT_MIXES[mix].densityKgM3) / 1000;
  const grossTonnes = netTonnes * (1 + wastagePct / 100);
  const orderTonnes = Math.ceil(grossTonnes * 2) / 2; // round up to nearest 0.5 t
  return { volumeM3, netTonnes, orderTonnes, looseM3: volumeM3 * 1.2, bitumenTonnes: netTonnes * (ASPHALT_MIXES[mix].bitumenPct / 100) };
}
export function asphaltCost(orderTonnes: number, ratePerTonne: number | null, deliveryFee = 0): number | null {
  return ratePerTonne == null ? null : orderTonnes * ratePerTonne + deliveryFee;
}
export const ASPHALT_WORKED = { lengthM: 100, widthM: 7, thicknessMm: 50, mix: "BC" as AsphaltMix, wastagePct: 10 };
