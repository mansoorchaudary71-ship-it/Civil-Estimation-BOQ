/** rigidPavementCalc.ts — rigid pavement QUANTITY engine (IRC:58-2015).
 * Quantity-only: slab thickness is NOT designed here. The 1:1.5:3 mix is a
 * nominal M20 mix — it is NOT an M40 mix and must never be presented as
 * an IRC:58 design. Design requires flexural strength, traffic (CFD ≤ 1.0)
 * and a pavement engineer. Dry volume ×1.54; cement kg = V×1440, bags ceil(kg/50). */
export interface RigidLayer { name: string; thicknessMm: number; mixParts: [number, number, number]; densityTM3?: number; }
export function concreteMaterials(wetVolumeM3: number, mixParts: [number, number, number]): { dryM3: number; cementM3: number; cementKg: number; cementBags: number; sandM3: number; aggregateM3: number; waterLitres: number } {
  if (wetVolumeM3 < 0) throw new Error("Volume must be >= 0.");
  const [c, s, a] = mixParts;
  const total = c + s + a;
  const dryM3 = wetVolumeM3 * 1.54;
  const cementM3 = (dryM3 * c) / total;
  const cementKg = cementM3 * 1440;
  return { dryM3, cementM3, cementKg, cementBags: Math.ceil(cementKg / 50), sandM3: (dryM3 * s) / total, aggregateM3: (dryM3 * a) / total, waterLitres: cementKg * 0.5 };
}
export function rigidQuantities(lengthM: number, widthM: number, pqcThicknessMm: number, dlcThicknessMm: number, gsbThicknessMm = 150): {
  pqcM3: number; dlcM3: number; gsbM3: number; pqc: ReturnType<typeof concreteMaterials>; dlc: ReturnType<typeof concreteMaterials>;
  slabs: number; dowelBars: number; dowelKg: number; tieBars: number; tieKg: number;
} {
  if (lengthM <= 0 || widthM <= 0) throw new Error("Length and width must be > 0.");
  const area = lengthM * widthM;
  const pqcM3 = area * (pqcThicknessMm / 1000);
  const dlcM3 = area * (dlcThicknessMm / 1000);
  const gsbM3 = area * (gsbThicknessMm / 1000);
  // 1:1.5:3 is a nominal M20 mix — labelled as such, NOT M40 / NOT IRC:58 design
  const pqc = concreteMaterials(pqcM3, [1, 1.5, 3]);
  const dlc = concreteMaterials(dlcM3, [1, 3, 6]);
  const jointSpacingM = 4.5;
  const slabs = Math.ceil(lengthM / jointSpacingM);
  const joints = Math.floor(lengthM / jointSpacingM);
  const dowelBars = joints * Math.floor(widthM / 0.3);
  const dowelKg = dowelBars * 0.5 * (32 * 32) / 162.28; // 32 mm dia, 500 mm long
  const tieBars = Math.floor(lengthM / 0.6) * 1;
  const tieKg = tieBars * 0.6 * (12 * 12) / 162.28; // 12 mm dia, 600 mm long
  return { pqcM3, dlcM3, gsbM3, pqc, dlc, slabs, dowelBars, dowelKg, tieBars, tieKg };
}
export const RIGID_DISCLAIMER = "Quantity-only estimate. The 1:1.5:3 mix is a nominal M20 mix, not an M40 mix. Slab thickness, joint spacing and dowel/tie design must be checked per IRC:58-2015 (cumulative fatigue damage CFD ≤ 1.0) by a pavement engineer.";
export const RIGID_WORKED = { lengthM: 1000, widthM: 7.5, pqcThicknessMm: 250, dlcThicknessMm: 150 };
