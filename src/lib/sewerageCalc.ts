/**
 * sewerageCalc.ts — sewer pipe sizing (Manning), septic tank and soak
 * pit design. Pure functions; Manning n, sludge rate and IS 2470
 * minimums imported from mepConstants.ts.
 *
 * Manning (full bore): R = D/4; V = (1/n) x R^(2/3) x S^(1/2);
 * Q = A x V. Minimum slope for self-cleansing (V >= 0.6 m/s):
 * S_min = [0.6 x n / R^(2/3)]^2.
 *
 * Design flow comes FIRST (the old tool only gave pipe capacity and
 * never checked demand): Q_design = population x q x peakFactor.
 * Pipe selection: smallest standard diameter whose full-bore capacity
 * is >= Q_design and whose full-bore velocity is 0.6-2.5 m/s.
 *
 * Septic (IS 2470 + CPHEEO): V = P x q x T + P x S x N, then ENFORCE
 * minimums — liquid volume >= 1,000 L, width >= 0.75 m, liquid depth
 * >= 1.0 m, + 0.3 m freeboard, L:W 2:1-3:1. The old tool used 80 L/user
 * sludge (retired) and a cube-root depth heuristic that gave W = 0.71 m
 * at the defaults — below the 0.75 m minimum.
 *
 * Soak pit: diameter FIXED at 1.5 m (editable 1.2-2.0 m); depth =
 * sidewall area / (pi x D); if depth > 4 m, split into several pits.
 * The old 4.24 m diameter pit was absurd and is retired.
 */
import {
  MANNING_N,
  SEPTIC_FREEBOARD_M,
  SEPTIC_MIN_LIQUID_DEPTH_M,
  SEPTIC_MIN_LIQUID_VOLUME_L,
  SEPTIC_MIN_WIDTH_M,
  SEPTIC_SLUDGE_L_PER_PERSON_PER_YEAR,
} from "./mepConstants";

export type SewerPipeMaterial = "pvc" | "upvc" | "hdpe" | "concrete" | "castIron" | "clay";

export const SEWER_STANDARD_DIAMETERS_MM = [100, 150, 200, 250, 300, 375, 450, 600];

export interface ManningInputs {
  diameterM: number;
  /** Gradient as 1 in X (e.g. 200 for 1:200). */
  gradient1InX: number;
  material?: SewerPipeMaterial;
  n?: number;
}

export interface ManningResults {
  n: number;
  hydraulicRadiusM: number;
  slope: number;
  velocityMs: number;
  areaM2: number;
  dischargeM3PerS: number;
  dischargeLPerS: number;
  minSlopeForSelfCleansing1InX: number;
  selfCleansing: boolean;
  froudeNumber: number;
  steps: string[];
}

export function validateManningInputs(inp: ManningInputs): string[] {
  const errors: string[] = [];
  if (!isFinite(inp.diameterM) || inp.diameterM <= 0 || inp.diameterM > 2)
    errors.push("Pipe diameter must be between 0 and 2 m.");
  if (!isFinite(inp.gradient1InX) || inp.gradient1InX <= 0)
    errors.push("Gradient (1 in X) must be greater than 0.");
  if (inp.n != null && (!isFinite(inp.n) || inp.n < 0.005 || inp.n > 0.03))
    errors.push("Manning's n must be between 0.005 and 0.030.");
  return errors;
}

export function calcManning(inp: ManningInputs): ManningResults {
  const errors = validateManningInputs(inp);
  if (errors.length > 0) throw new Error(errors.join(" "));
  const n = inp.n ?? MANNING_N[inp.material ?? "concrete"] ?? 0.013;
  const R = inp.diameterM / 4;
  const slope = 1 / inp.gradient1InX;
  const velocity = (1 / n) * Math.pow(R, 2 / 3) * Math.sqrt(slope);
  const area = (Math.PI * inp.diameterM * inp.diameterM) / 4;
  const discharge = area * velocity;
  const sMin = Math.pow((0.6 * n) / Math.pow(R, 2 / 3), 2);
  const froude = velocity / Math.sqrt(9.81 * R);
  return {
    n,
    hydraulicRadiusM: R,
    slope,
    velocityMs: velocity,
    areaM2: area,
    dischargeM3PerS: discharge,
    dischargeLPerS: discharge * 1000,
    minSlopeForSelfCleansing1InX: sMin > 0 ? 1 / sMin : Infinity,
    selfCleansing: velocity >= 0.6,
    froudeNumber: froude,
    steps: [
      `Hydraulic radius R = D/4 = ${inp.diameterM} / 4 = ${R.toFixed(4)} m; slope S = 1/${inp.gradient1InX} = ${slope.toFixed(5)}`,
      `V = (1/${n}) x ${R.toFixed(4)}^(2/3) x ${slope.toFixed(5)}^(1/2) = ${velocity.toFixed(3)} m/s`,
      `A = pi x ${inp.diameterM}² / 4 = ${area.toFixed(4)} m²; Q = A x V = ${discharge.toFixed(4)} m³/s = ${(discharge * 1000).toFixed(1)} L/s`,
      `Minimum slope for self-cleansing (V >= 0.6 m/s) = 1 in ${(1 / sMin).toFixed(0)}`,
    ],
  };
}

export interface DesignFlowInputs {
  population: number;
  /** Wastewater per person per day, litres (default 120). */
  litresPerPersonPerDay?: number;
  /** Peak factor (default 3.0 for <1,000 people, 2.5 above). */
  peakFactor?: number;
}

export function calcDesignFlow(inp: DesignFlowInputs): {
  averageFlowLPerS: number;
  designFlowLPerS: number;
  peakFactor: number;
} {
  if (!isFinite(inp.population) || inp.population <= 0)
    throw new Error("Population must be greater than 0.");
  const q = inp.litresPerPersonPerDay ?? 120;
  if (!isFinite(q) || q <= 0 || q > 500) throw new Error("Wastewater per person must be between 1 and 500 L/day.");
  const peak = inp.peakFactor ?? (inp.population < 1000 ? 3.0 : 2.5);
  const avg = (inp.population * q) / 86400;
  return { averageFlowLPerS: avg, designFlowLPerS: avg * peak, peakFactor: peak };
}

export interface PipeSelectionInputs extends DesignFlowInputs {
  gradient1InX: number;
  material?: SewerPipeMaterial;
}

export interface PipeSelectionResults {
  designFlowLPerS: number;
  selectedDiameterMm: number | null;
  capacityLPerS: number | null;
  velocityMs: number | null;
  adequate: boolean;
  checked: { diameterMm: number; capacityLPerS: number; velocityMs: number }[];
  note: string;
}

export function selectSewerPipe(inp: PipeSelectionInputs): PipeSelectionResults {
  const flow = calcDesignFlow(inp);
  const checked = SEWER_STANDARD_DIAMETERS_MM.map((dMm) => {
    const m = calcManning({ diameterM: dMm / 1000, gradient1InX: inp.gradient1InX, material: inp.material });
    return { diameterMm: dMm, capacityLPerS: m.dischargeLPerS, velocityMs: m.velocityMs };
  });
  const selected =
    checked.find((c) => c.capacityLPerS >= flow.designFlowLPerS && c.velocityMs >= 0.6 && c.velocityMs <= 2.5) ?? null;
  return {
    designFlowLPerS: flow.designFlowLPerS,
    selectedDiameterMm: selected?.diameterMm ?? null,
    capacityLPerS: selected?.capacityLPerS ?? null,
    velocityMs: selected?.velocityMs ?? null,
    adequate: selected != null,
    checked,
    note:
      selected == null
        ? "No standard diameter in the list carries this design flow at this gradient with self-cleansing velocity — steepen the gradient, split the flow, or use a larger diameter."
        : "Velocity is the full-bore velocity. At the design flow the pipe runs part-full; check the design depth ratio (0.5-0.75 for sanitary sewers) on the drawings.",
  };
}

export interface SepticInputs {
  users: number;
  /** Wastewater per person per day, litres (default 120). */
  litresPerPersonPerDay?: number;
  /** Retention time, days (default 1, minimum 1). */
  retentionDays?: number;
  /** Sludge accumulation, L/person/year (default 30, CPHEEO). */
  sludgeLPerPersonPerYear?: number;
  /** Desludging interval, years (default 2). */
  desludgingIntervalYears?: number;
  /** Liquid depth, m (default 1.2; minimum 1.0 per IS 2470). */
  liquidDepthM?: number;
  /** Soil loading rate, L/m2/day (default 30). */
  percolationLoadingRate?: number;
  /** Soak-pit diameter, m (default 1.5; standard 1.2-2.0). */
  soakPitDiameterM?: number;
}

export interface SepticResults {
  dailyFlowL: number;
  retentionVolumeL: number;
  sludgeVolumeL: number;
  calculatedVolumeL: number;
  /** Liquid volume actually provided (after IS 2470 minimums), litres. */
  liquidVolumeL: number;
  minimumApplied: boolean;
  liquidDepthM: number;
  widthM: number;
  lengthM: number;
  totalDepthM: number;
  soakAreaM2: number;
  soakPitDiameterM: number;
  soakPitDepthPerPitM: number;
  soakPits: number;
  dispersionTrenchLengthM: number;
  steps: string[];
}

export function validateSepticInputs(inp: SepticInputs): string[] {
  const errors: string[] = [];
  if (!isFinite(inp.users) || inp.users <= 0 || inp.users > 1000)
    errors.push("Number of users must be between 1 and 1,000.");
  if (inp.liquidDepthM != null && inp.liquidDepthM < SEPTIC_MIN_LIQUID_DEPTH_M)
    errors.push(`Liquid depth must be at least ${SEPTIC_MIN_LIQUID_DEPTH_M} m (IS 2470).`);
  if (inp.soakPitDiameterM != null && (inp.soakPitDiameterM < 1.2 || inp.soakPitDiameterM > 2.0))
    errors.push("Soak-pit diameter must be between 1.2 m and 2.0 m (standard pits are 1.2-1.5 m diameter).");
  if (inp.percolationLoadingRate != null && (inp.percolationLoadingRate <= 0 || inp.percolationLoadingRate > 100))
    errors.push("Soil loading rate must be between 1 and 100 L/m²/day.");
  return errors;
}

export function calcSeptic(inp: SepticInputs): SepticResults {
  const errors = validateSepticInputs(inp);
  if (errors.length > 0) throw new Error(errors.join(" "));
  const q = inp.litresPerPersonPerDay ?? 120;
  const T = inp.retentionDays ?? 1;
  const S = inp.sludgeLPerPersonPerYear ?? SEPTIC_SLUDGE_L_PER_PERSON_PER_YEAR;
  const N = inp.desludgingIntervalYears ?? 2;
  const liquidDepth = inp.liquidDepthM ?? 1.2;
  const loadingRate = inp.percolationLoadingRate ?? 30;
  const pitDia = inp.soakPitDiameterM ?? 1.5;

  const dailyFlow = inp.users * q;
  const retentionVol = inp.users * q * T;
  const sludgeVol = inp.users * S * N;
  const calculatedVol = retentionVol + sludgeVol;
  const minimumApplied = calculatedVol < SEPTIC_MIN_LIQUID_VOLUME_L;
  // Plan area for the provided volume (minimum enforced), L:W = 2:1.
  const providedVolL = Math.max(calculatedVol, SEPTIC_MIN_LIQUID_VOLUME_L);
  const planAreaM2 = providedVolL / 1000 / liquidDepth;
  let width = Math.sqrt(planAreaM2 / 2);
  if (width < SEPTIC_MIN_WIDTH_M) width = SEPTIC_MIN_WIDTH_M;
  const length = 2 * width;
  const actualVolL = length * width * liquidDepth * 1000;
  const totalDepth = liquidDepth + SEPTIC_FREEBOARD_M;

  const soakArea = dailyFlow / loadingRate;
  const depthOnePit = soakArea / (Math.PI * pitDia);
  const pits = Math.max(1, Math.ceil(depthOnePit / 4));
  const depthPerPit = depthOnePit / pits;
  // Dispersion-trench alternative: length = area / (2 x depth + width),
  // assuming 1.0 m deep x 0.6 m wide trench.
  const trenchLength = soakArea / (2 * 1.0 + 0.6);

  return {
    dailyFlowL: dailyFlow,
    retentionVolumeL: retentionVol,
    sludgeVolumeL: sludgeVol,
    calculatedVolumeL: calculatedVol,
    liquidVolumeL: actualVolL,
    minimumApplied,
    liquidDepthM: liquidDepth,
    widthM: width,
    lengthM: length,
    totalDepthM: totalDepth,
    soakAreaM2: soakArea,
    soakPitDiameterM: pitDia,
    soakPitDepthPerPitM: depthPerPit,
    soakPits: pits,
    dispersionTrenchLengthM: trenchLength,
    steps: [
      `Daily flow = ${inp.users} users x ${q} L/day = ${dailyFlow} L/day`,
      `Septic volume V = P x q x T + P x S x N = ${retentionVol} + ${sludgeVol} = ${calculatedVol} L${minimumApplied ? ` — below the IS 2470 minimum of ${SEPTIC_MIN_LIQUID_VOLUME_L} L, so the minimum applies` : ""}`,
      `Tank: liquid depth ${liquidDepth} m, width ${width.toFixed(2)} m (min ${SEPTIC_MIN_WIDTH_M} m), length ${length.toFixed(2)} m, + ${SEPTIC_FREEBOARD_M} m freeboard = ${totalDepth.toFixed(2)} m total depth; provided liquid volume ${actualVolL.toFixed(0)} L`,
      `Soak area = ${dailyFlow} / ${loadingRate} = ${soakArea.toFixed(1)} m²; pit dia ${pitDia} m -> depth ${depthOnePit.toFixed(2)} m for one pit -> ${pits} pit(s) x ${depthPerPit.toFixed(2)} m deep (max 4 m per pit)`,
      `Alternative: dispersion trench about ${trenchLength.toFixed(1)} m long (1.0 m deep x 0.6 m wide)`,
    ],
  };
}

/** Trapezoidal (or vertical-sided) trench excavation volume, m3. */
export function calcTrenchVolume(lengthM: number, bottomWidthM: number, depthM: number, sloped: boolean, slopeRatioHPerV = 0.5): { topWidthM: number; volumeM3: number } {
  if (lengthM <= 0 || bottomWidthM <= 0 || depthM <= 0) throw new Error("Trench length, width and depth must all be greater than 0.");
  const topWidth = sloped ? bottomWidthM + 2 * (slopeRatioHPerV * depthM) : bottomWidthM;
  return { topWidthM: topWidth, volumeM3: ((bottomWidthM + topWidth) / 2) * depthM * lengthM };
}

/** Circular-segment area displaced by a pipe in bedding (haunch height h). */
export function pipeSegmentArea(pipeDiameterM: number, haunchHeightM: number): number {
  const R = pipeDiameterM / 2;
  const h = Math.min(Math.max(haunchHeightM, 0), pipeDiameterM);
  if (h <= 0) return 0;
  if (h >= pipeDiameterM) return Math.PI * R * R;
  const d = Math.abs(R - h);
  const theta = 2 * Math.acos(d / R);
  const segment = (R * R) / 2 * (theta - Math.sin(theta));
  return h <= R ? segment : Math.PI * R * R - segment;
}

/** Bedding volume, m3: (trench width x total bedding depth - pipe segment) x length. */
export function calcBeddingVolume(lengthM: number, trenchWidthM: number, pipeDiameterM: number, underPipeM: number, haunchHeightM: number): number {
  const totalDepth = underPipeM + Math.min(pipeDiameterM, Math.max(0, haunchHeightM));
  const crossSection = Math.max(0, trenchWidthM * totalDepth - pipeSegmentArea(pipeDiameterM, haunchHeightM));
  return crossSection * lengthM;
}

export interface SewerageCostRates {
  excavationPerM3?: number | null;
  pipePerMByDiaMm?: Record<number, number | null>;
  manholeEach?: number | null;
  septicPerM3?: number | null;
  soakPitEach?: number | null;
}

export interface SewerageCostLine { description: string; quantity: number; unit: string; rate: number | null; amount: number | null }

/** Line-item cost. Any line whose rate is null/unknown returns null
 *  amounts — never priced at 0. Rates are inputs: no sourced PK/IN/AE
 *  sewerage rates were in the audit spec, so the UI must ask the user
 *  (mepConstants.ts carries no sewerage cost rates — flagged in the
 *  G6 report). */
export function calcSewerageCost(lines: SewerageCostLine[]): { lines: SewerageCostLine[]; total: number | null; complete: boolean } {
  const total = lines.reduce((sum, l) => sum + (l.amount ?? 0), 0);
  const complete = lines.every((l) => l.amount != null);
  return { lines, total: lines.some((l) => l.amount != null) ? total : null, complete };
}
