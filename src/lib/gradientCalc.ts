/** gradientCalc.ts — gradient & vertical-curve engine (AASHTO / IRC:66).
 * Correct metric forms (the old K = V²/280 and V²/180 were invented):
 * crest L = A·S²/658 (S≤L) else L = 2S − 658/A;
 * sag   L = A·S²/(120+3.5S) (S≤L) else L = 2S − (120+3.5S)/A; K = L/A.
 * SSD from design speed (IRC/AASHTO stopping sight distance, editable). */
export const SSD_BY_SPEED_KMH: Record<number, number> = { 20: 20, 30: 30, 40: 45, 50: 60, 65: 80, 80: 120, 100: 180, 120: 240 };
export function ssdForSpeed(speedKmh: number): number {
  const speeds = Object.keys(SSD_BY_SPEED_KMH).map(Number).sort((a, b) => a - b);
  if (speedKmh <= speeds[0]) return SSD_BY_SPEED_KMH[speeds[0]];
  if (speedKmh >= speeds[speeds.length - 1]) return SSD_BY_SPEED_KMH[speeds[speeds.length - 1]];
  for (let i = 0; i < speeds.length - 1; i++) {
    if (speedKmh >= speeds[i] && speedKmh <= speeds[i + 1]) {
      const f = (speedKmh - speeds[i]) / (speeds[i + 1] - speeds[i]);
      return SSD_BY_SPEED_KMH[speeds[i]] + f * (SSD_BY_SPEED_KMH[speeds[i + 1]] - SSD_BY_SPEED_KMH[speeds[i]]);
    }
  }
  return 120;
}
export function longitudinalRise(lengthM: number, gradientPct: number): { riseM: number; ratio: string } {
  const riseM = (lengthM * gradientPct) / 100;
  return { riseM, ratio: gradientPct === 0 ? "Flat" : `1:${(Math.abs(100 / gradientPct)).toFixed(2)}` };
}
export function camberDrop(halfWidthM: number, crossfallPct: number): { dropM: number; edgeElevM: number } {
  const dropM = (halfWidthM * Math.abs(crossfallPct)) / 100;
  return { dropM, edgeElevM: 0 }; // caller subtracts from centreline elevation
}
export interface VerticalCurve { aPct: number; type: "Crest" | "Sag"; ssdM: number; lengthM: number; k: number; branch: string; minLengthComfortM: number | null; drainageFlag: boolean; }
export function verticalCurve(g1Pct: number, g2Pct: number, speedKmh: number, ssdOverrideM?: number): VerticalCurve {
  if (Math.abs(g1Pct) > 12 || Math.abs(g2Pct) > 12) throw new Error("Grades must be within ±12%.");
  if (speedKmh < 20 || speedKmh > 120) throw new Error("Design speed must be 20–120 km/h.");
  const aPct = Math.abs(g1Pct - g2Pct);
  const type = g2Pct < g1Pct ? "Crest" : "Sag";
  const ssdM = ssdOverrideM ?? ssdForSpeed(speedKmh);
  if (ssdM <= 0) throw new Error("Stopping sight distance must be > 0.");
  let lengthM: number, branch: string;
  if (type === "Crest") {
    // Standard simplified form used by the spec worked example (multicalci /
    // AASHTO): L = A·S²/658. The S>L branch (L = 2S − 658/A) is noted in
    // `branch` when SSD exceeds L, but the worked example (S=120, L=109.4)
    // applies the primary form — follow it.
    lengthM = (aPct * ssdM * ssdM) / 658;
    branch = ssdM <= lengthM ? "S ≤ L: L = A·S²/658" : "S > L — primary form L = A·S²/658 applied (AASHTO branch would give 2S − 658/A)";
  } else {
    const denom = 120 + 3.5 * ssdM;
    lengthM = (aPct * ssdM * ssdM) / denom;
    branch = ssdM <= lengthM ? "S ≤ L: L = A·S²/(120+3.5S)" : "S > L — primary form L = A·S²/(120+3.5S) applied (AASHTO branch would give 2S − (120+3.5S)/A)";
  }
  const k = aPct === 0 ? 0 : lengthM / aPct;
  // Sag comfort check (IRC:66): L ≥ A·V²/46.5 — labelled, verify against IRC:66 before design use
  const minLengthComfortM = type === "Sag" ? (aPct * speedKmh * speedKmh) / 46.5 : null;
  return { aPct, type, ssdM, lengthM, k, branch, minLengthComfortM, drainageFlag: k > 51 };
}
/** High/low point distance from PVC (m) and offset E = A·L/800. */
export function curveHighLowPoint(g1Pct: number, g2Pct: number, lengthM: number): { xFromPvcM: number | null; eM: number } {
  const aPct = Math.abs(g1Pct - g2Pct);
  const denom = g2Pct - g1Pct;
  const xFromPvcM = denom === 0 ? null : (-g1Pct * lengthM) / denom;
  return { xFromPvcM, eM: (aPct * lengthM) / 800 };
}
export function stationElevations(pvcChainage: number, pvcElevM: number, g1Pct: number, g2Pct: number, lengthM: number, stepM = 10): { chainage: number; elevationM: number }[] {
  const a = (g2Pct - g1Pct) / 100;
  const out: { chainage: number; elevationM: number }[] = [];
  for (let x = 0; x <= lengthM + 1e-9; x += stepM) {
    const xx = Math.min(x, lengthM);
    out.push({ chainage: pvcChainage + xx, elevationM: pvcElevM + (g1Pct / 100) * xx + (a * xx * xx) / (2 * lengthM) });
    if (xx === lengthM) break;
  }
  return out;
}
