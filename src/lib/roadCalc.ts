/** roadCalc.ts — flexible pavement engine (IRC:37-2018 / MoRTH).
 * Layer volume from trapezoidal section A=(wTop+wBot)/2·t; tonnage = V·density.
 * Bitumen tonnes from bitumen content % by mass. Wastage editable
 * (default 5% granular, 3% bituminous). IRC:37 thickness table is
 * GUIDANCE only, never a design. */
export interface PavementLayer { name: string; thicknessMm: number; topWidthM: number; bottomWidthM: number; densityTM3: number; bitumenPct?: number; wastagePct?: number; ratePerTonne?: number | null; }
export function layerVolume(lengthM: number, layer: PavementLayer): number {
  if (lengthM <= 0 || layer.thicknessMm <= 0) throw new Error("Length and thickness must be > 0.");
  const avgWidth = (layer.topWidthM + layer.bottomWidthM) / 2;
  return lengthM * avgWidth * (layer.thicknessMm / 1000);
}
export function layerQuantities(lengthM: number, layer: PavementLayer): { volumeM3: number; tonnageT: number; tonnageToOrderT: number; bitumenT: number; cost: number | null } {
  const volumeM3 = layerVolume(lengthM, layer);
  const tonnageT = volumeM3 * layer.densityTM3;
  const wastagePct = layer.wastagePct ?? 0;
  const tonnageToOrderT = tonnageT * (1 + wastagePct / 100);
  const bitumenT = layer.bitumenPct ? tonnageT * (layer.bitumenPct / 100) : 0;
  return { volumeM3, tonnageT, tonnageToOrderT, bitumenT, cost: layer.ratePerTonne != null ? tonnageToOrderT * layer.ratePerTonne : null };
}
/** Prime / tack coat: litres = area × rate L/m²; tonnes ≈ litres × 0.00101 (bitumen ~1.01 kg/L). */
export function coatQuantity(areaM2: number, rateLM2: number): { litres: number; tonnes: number; drums200L: number } {
  const litres = areaM2 * rateLM2;
  return { litres, tonnes: litres * 0.00101, drums200L: Math.ceil(litres / 200) };
}
/** IRC:37 thickness GUIDANCE (labelled, not design) by CBR + traffic. */
export function irc37Guidance(cbrPct: number, msa: number): string {
  if (cbrPct < 5) return "CBR <5% — subgrade improvement / capping layer needed before IRC:37 crust selection; get a pavement design.";
  if (msa <= 5) return "Light traffic (≤5 MSA): granular base + thin bituminous surfacing per IRC:37 — guidance only.";
  if (msa <= 30) return "Medium traffic (5–30 MSA): GSB + WMM + DBM + BC per IRC:37 — guidance only.";
  return "Heavy traffic (>30 MSA): full IRC:37 crust with DBM + BC — guidance only; design by a pavement engineer.";
}
export const ROAD_WORKED_LAYERS: PavementLayer[] = [
  { name: "BC", thicknessMm: 40, topWidthM: 7.0, bottomWidthM: 7.16, densityTM3: 2.4 },
  { name: "DBM", thicknessMm: 90, topWidthM: 7.16, bottomWidthM: 7.52, densityTM3: 2.35 },
  { name: "WMM", thicknessMm: 250, topWidthM: 10.9, bottomWidthM: 11.14, densityTM3: 2.25 },
  { name: "GSB", thicknessMm: 200, topWidthM: 11.8, bottomWidthM: 12.04, densityTM3: 2.1 },
  { name: "Subgrade", thicknessMm: 500, topWidthM: 13.2, bottomWidthM: 13.44, densityTM3: 1.8 },
];
