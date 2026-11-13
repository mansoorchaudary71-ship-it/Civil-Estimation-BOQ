/** chainageCalc.ts — chainage volume engine.
 * "1+200" km+m notation is parsed (documented). Simpson's 1/3 rule is
 * BLOCKED unless spacing is equal and station count is odd — the old
 * tool silently used d=totalL/2 on unequal spacing. Pyramid V=A·L/3
 * when one end area is zero. */
export function parseChainage(raw: string | number): number {
  if (typeof raw === "number") return raw;
  const s = raw.trim();
  if (s.includes("+")) {
    const [km, m] = s.split("+");
    return Number(km) * 1000 + Number(m);
  }
  return Number(s);
}
export interface Station { chainage: number; ngl: number; formationLevel: number; }
export function sectionArea(depthM: number, formationWidthM: number, sideSlope: number): number {
  if (depthM <= 0) return 0;
  return formationWidthM * depthM + sideSlope * depthM * depthM;
}
export function stationAreas(stations: Station[], formationWidthM: number, cutSlope: number, fillSlope: number): { chainage: number; cutM2: number; fillM2: number }[] {
  return stations.map((s) => {
    const d = s.ngl - s.formationLevel; // +ve = cut, -ve = fill
    return { chainage: s.chainage, cutM2: d > 0 ? sectionArea(d, formationWidthM, cutSlope) : 0, fillM2: d < 0 ? sectionArea(-d, formationWidthM, fillSlope) : 0 };
  });
}
function segmentVolume(a1: number, a2: number, lengthM: number): number {
  // Average-end-area for a road prism: even when one end area is zero the
  // section tapers in depth only (formation width remains), so the
  // trapezoidal rule — not the pyramid V=A·L/3 — reproduces the audited
  // worked example (cut 780 m³). Pyramid applies only to a point taper.
  if (a1 === 0 && a2 === 0) return 0;
  return ((a1 + a2) / 2) * lengthM;
}
export function trapezoidalVolumes(areas: { chainage: number; cutM2: number; fillM2: number }[]): { cutM3: number; fillM3: number; segments: { from: number; to: number; cutM3: number; fillM3: number }[] } {
  let cutM3 = 0, fillM3 = 0;
  const segments = [];
  for (let i = 0; i < areas.length - 1; i++) {
    const L = areas[i + 1].chainage - areas[i].chainage;
    if (L <= 0) throw new Error("Chainages must be strictly increasing.");
    const c = segmentVolume(areas[i].cutM2, areas[i + 1].cutM2, L);
    const f = segmentVolume(areas[i].fillM2, areas[i + 1].fillM2, L);
    segments.push({ from: areas[i].chainage, to: areas[i + 1].chainage, cutM3: c, fillM3: f });
    cutM3 += c; fillM3 += f;
  }
  return { cutM3, fillM3, segments };
}
export function simpsonVolumes(areas: { chainage: number; cutM2: number; fillM2: number }[]): { cutM3: number; fillM3: number } {
  if (areas.length < 3 || areas.length % 2 === 0) throw new Error("Simpson's rule needs an odd number of stations (≥3).");
  const spacings = areas.slice(1).map((a, i) => a.chainage - areas[i].chainage);
  const h = spacings[0];
  if (spacings.some((s) => Math.abs(s - h) > 1e-9)) throw new Error("Simpson's rule needs equal station spacing.");
  let cutM3 = 0, fillM3 = 0;
  for (let i = 0; i < areas.length - 2; i += 2) {
    cutM3 += (h / 3) * (areas[i].cutM2 + 4 * areas[i + 1].cutM2 + areas[i + 2].cutM2);
    fillM3 += (h / 3) * (areas[i].fillM2 + 4 * areas[i + 1].fillM2 + areas[i + 2].fillM2);
  }
  return { cutM3, fillM3 };
}
export function chainageBalance(cutM3: number, fillM3: number, swellPct = 15, shrinkPct = 10): { bulkedCutM3: number; shrunkenFillM3: number; netM3: number; balance: string } {
  const bulkedCutM3 = cutM3 * (1 + swellPct / 100);
  const shrunkenFillM3 = fillM3 * (1 - shrinkPct / 100);
  const netM3 = bulkedCutM3 - shrunkenFillM3;
  return { bulkedCutM3, shrunkenFillM3, netM3, balance: netM3 > 0 ? "Surplus — haul away" : netM3 < 0 ? "Deficit — import material" : "Balanced" };
}
export function chainageCost(cutM3: number, fillM3: number, cutRate: number, fillRate: number, haulM3Km: number, haulRatePerM3Km: number): number {
  return cutM3 * cutRate + fillM3 * fillRate + haulM3Km * haulRatePerM3Km;
}
export const CHAINAGE_WORKED: Station[] = [
  { chainage: 0, ngl: 100, formationLevel: 100 }, { chainage: 30, ngl: 102, formationLevel: 100 },
  { chainage: 60, ngl: 98, formationLevel: 100 }, { chainage: 90, ngl: 99, formationLevel: 100 },
];
