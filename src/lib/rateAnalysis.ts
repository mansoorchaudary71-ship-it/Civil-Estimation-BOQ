/**
 * rateAnalysis — CPWD-style rate analysis engine (G9 §10).
 * Pure functions. Crush default corrected: the old 250/cft was ~3x market;
 * rates.ts now carries 90/cft (PK crush ~65–110/cft).
 *
 * CPWD DAR layout: materials + labour + equipment + sundries = prime cost;
 * + water 1% of prime; + CPOH/overhead 15% of (prime + water) = rate.
 * The "RCC" 1:2:4 path in the old tool had NO steel — it is PCC, labelled
 * honestly here; steel is an explicit kg/m3 input for RCC items.
 */
export interface MixSpec {
  id: string;
  label: string;
  /** cement : sand : aggregate parts (aggregate 0 for mortar/plaster) */
  parts: [number, number, number];
  kind: "concrete" | "mortar" | "brickwork" | "plaster" | "paint" | "tile";
  /** CPWD convention unit for the analysis */
  unit: string;
  /** dry-volume factor: 1.54 concrete, 1.33 mortar */
  dryFactor: number;
  /** wet volume (m3) per unit of work, or area-based volume handled by caller */
  wetVolumePerUnit: number;
}

export const MIXES: MixSpec[] = [
  { id: "pcc124", label: "PCC 1:2:4 (1 m³)", parts: [1, 2, 4], kind: "concrete", unit: "m³", dryFactor: 1.54, wetVolumePerUnit: 1 },
  { id: "pcc148", label: "PCC 1:4:8 (1 m³)", parts: [1, 4, 8], kind: "concrete", unit: "m³", dryFactor: 1.54, wetVolumePerUnit: 1 },
  { id: "rcc1153", label: "RCC 1:1.5:3 (1 m³, incl. steel input)", parts: [1, 1.5, 3], kind: "concrete", unit: "m³", dryFactor: 1.54, wetVolumePerUnit: 1 },
  { id: "rcc124", label: "RCC 1:2:4 (1 m³, incl. steel input)", parts: [1, 2, 4], kind: "concrete", unit: "m³", dryFactor: 1.54, wetVolumePerUnit: 1 },
  { id: "mortar14", label: "Mortar 1:4 (1 m³)", parts: [1, 4, 0], kind: "mortar", unit: "m³", dryFactor: 1.33, wetVolumePerUnit: 1 },
  { id: "mortar16", label: "Mortar 1:6 (1 m³)", parts: [1, 6, 0], kind: "mortar", unit: "m³", dryFactor: 1.33, wetVolumePerUnit: 1 },
  { id: "brickwork14", label: "Brickwork 1:4 (1 m³)", parts: [1, 4, 0], kind: "brickwork", unit: "m³", dryFactor: 1.33, wetVolumePerUnit: 1 },
  { id: "brickwork16", label: "Brickwork 1:6 (1 m³)", parts: [1, 6, 0], kind: "brickwork", unit: "m³", dryFactor: 1.33, wetVolumePerUnit: 1 },
  { id: "plaster14", label: "Plaster 12 mm 1:4 (10 m²)", parts: [1, 4, 0], kind: "plaster", unit: "10 m²", dryFactor: 1.33, wetVolumePerUnit: 0.12 },
  { id: "plaster16", label: "Plaster 12 mm 1:6 (10 m²)", parts: [1, 6, 0], kind: "plaster", unit: "10 m²", dryFactor: 1.33, wetVolumePerUnit: 0.12 },
];

export const CEMENT_BAG_M3 = 0.0347;
export const M3_TO_CFT = 35.3147;
export const CEMENT_WASTAGE_PCT = 2;
export const STEEL_WASTAGE_PCT = 3;

export interface RateInputs {
  cementPerBag: number;
  sandPerCft: number;
  crushPerCft: number;
  steelPerKg: number | null;
  labour: number; // flat labour cost per unit (gang total)
  equipment: number;
  sundries?: number;
  steelKgPerM3?: number; // RCC only, default 100 (editable assumption, 80–120)
  waterPct?: number; // default 1 (CPWD)
  cpohPct?: number; // default 15 (CPWD overhead + profit)
  applyWaterAndCpoh?: boolean; // false = plain prime x (1+cpoh) — the 18,042 variant
}

export interface RateAnalysisResult {
  dryVolume: number;
  cementBags: number;
  cementCost: number;
  sandM3: number;
  sandCft: number;
  sandCost: number;
  crushM3: number;
  crushCft: number;
  crushCost: number;
  steelKg: number;
  steelCost: number;
  materialCost: number;
  primeCost: number;
  waterCost: number;
  cpohCost: number;
  finalRate: number;
  /** CPWD reference quantities per m3 of 1:2:4: 6.4 bags, 0.445 m3 sand, 0.89 m3 aggregate */
  notes: string[];
}

export function analyseMix(mix: MixSpec, r: RateInputs): RateAnalysisResult {
  const [c, s, a] = mix.parts;
  const total = c + s + a;
  const dryVolume = mix.wetVolumePerUnit * mix.dryFactor;
  const cementM3 = (c / total) * dryVolume;
  const cementBagsRaw = cementM3 / CEMENT_BAG_M3;
  const cementBags = Math.ceil(cementBagsRaw * (1 + CEMENT_WASTAGE_PCT / 100) * 100) / 100;
  // Cost is priced on the exact (fractional) bag quantity, as in the CPWD
  // worked example (6.34 bags x 1,450 = 9,193); the ceiled count above is
  // the quantity to ORDER.
  const cementBagsForCost = cementBagsRaw;
  const sandM3 = (s / total) * dryVolume;
  const crushM3 = (a / total) * dryVolume;
  const sandCft = sandM3 * M3_TO_CFT;
  const crushCft = crushM3 * M3_TO_CFT;
  const cementCost = cementBagsForCost * r.cementPerBag;
  const sandCost = sandCft * r.sandPerCft;
  const crushCost = crushCft * r.crushPerCft;
  const steelKg = mix.kind === "concrete" && mix.id.startsWith("rcc")
    ? (r.steelKgPerM3 ?? 100) * mix.wetVolumePerUnit * (1 + STEEL_WASTAGE_PCT / 100)
    : 0;
  const steelCost = steelKg * (r.steelPerKg ?? 0);
  const materialCost = cementCost + sandCost + crushCost + steelCost;
  const primeCost = materialCost + r.labour + r.equipment + (r.sundries ?? 0);
  const applyCpwd = r.applyWaterAndCpoh !== false;
  const waterPct = r.waterPct ?? 1;
  const cpohPct = r.cpohPct ?? 15;
  const waterCost = applyCpwd ? primeCost * (waterPct / 100) : 0;
  const cpohCost = applyCpwd
    ? (primeCost + waterCost) * (cpohPct / 100)
    : primeCost * (cpohPct / 100);
  const finalRate = primeCost + waterCost + cpohCost;
  return {
    dryVolume,
    cementBags: cementBagsForCost,
    cementCost,
    sandM3,
    sandCft,
    sandCost,
    crushM3,
    crushCft,
    crushCost,
    steelKg,
    steelCost,
    materialCost,
    primeCost,
    waterCost,
    cpohCost,
    finalRate,
    notes: [
      `Dry volume = wet x ${mix.dryFactor} = ${dryVolume.toFixed(2)} m³.`,
      `Cement (with ${CEMENT_WASTAGE_PCT}% wastage) = ${cementBags.toFixed(2)} bags; billed at ${cementBagsForCost} bags.`,
      mix.id.startsWith("rcc")
        ? `Steel ${r.steelKgPerM3 ?? 100} kg/m³ (editable assumption, 80–120) + ${STEEL_WASTAGE_PCT}% wastage.`
        : "No steel in this item — this is PCC/mortar, not RCC.",
      applyCpwd
        ? `CPWD: +${waterPct}% water charges, then +${cpohPct}% CPOH on (prime + water).`
        : `No water charge — prime x (1 + ${cpohPct}% CPOH).`,
    ],
  };
}

/** The spec's worked example, with the default PK rates. */
export function pcc124Default(): RateAnalysisResult {
  const mix = MIXES.find((m) => m.id === "pcc124")!;
  return analyseMix(mix, {
    cementPerBag: 1450,
    sandPerCft: 90,
    crushPerCft: 90,
    steelPerKg: null,
    labour: 1500,
    equipment: 800,
  });
}
