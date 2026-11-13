/** ucsVaneCalc.ts — unconfined compression + vane shear engine (IS 2720 Pt 10/30).
 * UCS: Ac = A₀/(1−ε), qu = P/Ac, cu = qu/2. Vane: cu = T / [πD²(H/2 + D/6)]. */
export function ucs(diaMm: number, failureLoadN: number, axialStrainPct: number): { area0M2: number; correctedAreaM2: number; quKpa: number; cuKpa: number } {
  if (diaMm <= 0 || failureLoadN < 0) throw new Error("Diameter must be > 0 and load >= 0.");
  const strain = axialStrainPct / 100;
  if (strain < 0 || strain >= 1) throw new Error("Axial strain must be 0–100%.");
  const area0M2 = (Math.PI * (diaMm / 1000) ** 2) / 4;
  const correctedAreaM2 = area0M2 / (1 - strain);
  const quKpa = failureLoadN / correctedAreaM2 / 1000;
  return { area0M2, correctedAreaM2, quKpa, cuKpa: quKpa / 2 };
}
export function vaneShear(torqueNm: number, diaMm: number, heightMm: number): { cuKpa: number } {
  if (torqueNm < 0 || diaMm <= 0 || heightMm <= 0) throw new Error("Torque, diameter and height must be positive.");
  const d = diaMm / 1000, h = heightMm / 1000;
  const cuKpa = torqueNm / (Math.PI * d * d * (h / 2 + d / 6)) / 1000;
  return { cuKpa };
}
export function ucsConsistency(quKpa: number): string {
  if (quKpa < 25) return "Very soft";
  if (quKpa < 50) return "Soft";
  if (quKpa < 100) return "Medium";
  if (quKpa < 200) return "Stiff";
  if (quKpa < 400) return "Very stiff";
  return "Hard";
}
export const UCS_WORKED = { diaMm: 38, failureLoadN: 250, axialStrainPct: 15 };
export const VANE_WORKED = { torqueNm: 15, diaMm: 50, heightMm: 100 };
