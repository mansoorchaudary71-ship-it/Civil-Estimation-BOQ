/**
 * rainwaterCalc.ts — rainwater harvesting yield, demand and tank sizing.
 * Pure functions; rainfall presets, runoff coefficients and the 5%
 * rule imported from mepConstants.ts.
 *
 * Yield (L/yr) = roofArea(m2) x rainfall(mm) x runoffCoeff x filterEff
 *   (1 mm of rain on 1 m2 = 1 L). First-flush is an optional deduction.
 * Demand (L/yr) = people x nonPotableUse(L/person/day) x 365.
 * Tank (BS 8515): 5% of the LESSER of yield and demand; also meet the
 * dry-spell need (dailyUse x dryDays). Tank = max of the two, rounded
 * UP to a standard size. The old tool used 8% of yield with no demand
 * input — that rule is retired.
 */
import {
  RAINFALL_MM_BY_CITY,
  RAINWATER_FILTER_EFFICIENCY_DEFAULT,
  RAINWATER_FIRST_FLUSH_L_PER_M2_PER_EVENT,
  RAINWATER_RUNOFF_COEFFICIENT,
  RAINWATER_TANK_FRACTION_OF_LESSER,
  type MepCity,
} from "./mepConstants";

export type RainwaterRoofType = "metal" | "concreteTiles" | "asphalt" | "gravel" | "greenRoof";

export const RAINWATER_ROOF_LABELS: Record<RainwaterRoofType, string> = {
  metal: "Metal roof",
  concreteTiles: "Concrete / tiles",
  asphalt: "Asphalt",
  gravel: "Gravel",
  greenRoof: "Green roof",
};

export const RAINWATER_STANDARD_TANK_SIZES_L = [500, 1000, 2000, 3000, 5000, 10000];

export interface RainwaterInputs {
  roofAreaM2: number;
  /** Annual rainfall, mm. Defaults from the city preset when omitted. */
  rainfallMm?: number;
  city?: MepCity;
  roofType?: RainwaterRoofType;
  /** Runoff coefficient (overrides the roof-type default). */
  runoffCoeff?: number;
  filterEfficiency?: number;
  /** First-flush events per year (0 = no deduction; 60 is typical). */
  firstFlushEventsPerYear?: number;
  people?: number;
  /** Non-potable use per person per day, litres (default 50). */
  usePerPersonLPerDay?: number;
  /** Dry-spell days the tank must cover (default 21, range 7-45). */
  dryDays?: number;
  /** Water cost per m3 in the chosen currency (default 150). */
  waterCostPerM3?: number;
  /** Tank rate per litre in the chosen currency (default 35). */
  tankRatePerLitre?: number;
  /** Gutter / filter / pump lump sum in the chosen currency (default 75,000). */
  fixedSystemCost?: number;
  /** Tank depth for dimensioning, m (default 1.75). */
  tankDepthM?: number;
}

export interface RainwaterResults {
  rainfallMm: number;
  runoffCoeff: number;
  yieldGrossLPerYear: number;
  firstFlushLPerYear: number;
  yieldLPerYear: number;
  demandLPerYear: number;
  dailyUseL: number;
  tankBy5PctRuleL: number;
  tankByDrySpellL: number;
  tankRequiredL: number;
  tankL: number;
  coveragePct: number;
  daysOfSupply: number;
  annualSavings: number;
  tankCost: number;
  systemCost: number;
  paybackYears: number | null;
  tankLengthM: number;
  tankWidthM: number;
  tankDepthM: number;
  downpipes: number;
  gutterSizeMm: number;
  monthlyYieldL: number[];
  monthlyDemandL: number[];
  warnings: string[];
  steps: string[];
}

export function validateRainwaterInputs(inp: RainwaterInputs): string[] {
  const errors: string[] = [];
  if (!isFinite(inp.roofAreaM2) || inp.roofAreaM2 <= 0)
    errors.push("Roof area must be greater than 0.");
  else if (inp.roofAreaM2 > 100000) errors.push("Roof area looks too large (max 100,000 m²).");
  const rain = inp.rainfallMm ?? (inp.city ? RAINFALL_MM_BY_CITY[inp.city] : 628);
  if (!isFinite(rain) || rain < 50 || rain > 4000)
    errors.push("Annual rainfall must be between 50 mm and 4,000 mm.");
  const coeff = inp.runoffCoeff ?? RAINWATER_RUNOFF_COEFFICIENT[inp.roofType ?? "concreteTiles"];
  if (!isFinite(coeff) || coeff < 0.1 || coeff > 1)
    errors.push("Runoff coefficient must be between 0.1 and 1.0.");
  if (inp.dryDays != null && (!isFinite(inp.dryDays) || inp.dryDays < 7 || inp.dryDays > 45))
    errors.push("Dry-spell days must be between 7 and 45.");
  if (inp.people != null && (!isFinite(inp.people) || inp.people <= 0 || inp.people > 100))
    errors.push("Number of people must be between 1 and 100.");
  return errors;
}

export function calcRainwater(inp: RainwaterInputs): RainwaterResults {
  const errors = validateRainwaterInputs(inp);
  if (errors.length > 0) throw new Error(errors.join(" "));
  const rainfallMm = inp.rainfallMm ?? (inp.city ? RAINFALL_MM_BY_CITY[inp.city] : 628);
  const roofType = inp.roofType ?? "concreteTiles";
  const coeff = inp.runoffCoeff ?? RAINWATER_RUNOFF_COEFFICIENT[roofType];
  const filterEff = inp.filterEfficiency ?? RAINWATER_FILTER_EFFICIENCY_DEFAULT;
  const people = inp.people ?? 4;
  const usePerPerson = inp.usePerPersonLPerDay ?? 50;
  const dryDays = inp.dryDays ?? 21;
  const depthM = inp.tankDepthM ?? 1.75;

  const yieldGross = inp.roofAreaM2 * rainfallMm * coeff * filterEff;
  const firstFlush =
    (inp.firstFlushEventsPerYear ?? 0) *
    RAINWATER_FIRST_FLUSH_L_PER_M2_PER_EVENT *
    inp.roofAreaM2;
  const yieldL = Math.max(0, yieldGross - firstFlush);
  const demandL = people * usePerPerson * 365;
  const dailyUse = people * usePerPerson;
  const tank5pct = RAINWATER_TANK_FRACTION_OF_LESSER * Math.min(yieldL, demandL);
  const tankDry = dailyUse * dryDays;
  const tankRequired = Math.max(tank5pct, tankDry);
  const tank =
    RAINWATER_STANDARD_TANK_SIZES_L.find((s) => s >= tankRequired) ??
    Math.ceil(tankRequired / 1000) * 1000;
  const coverage = demandL > 0 ? (Math.min(yieldL, demandL) / demandL) * 100 : 0;
  const daysOfSupply = dailyUse > 0 ? tank / dailyUse : 0;
  const waterCost = inp.waterCostPerM3 ?? 150;
  const annualSavings = (Math.min(yieldL, demandL) / 1000) * waterCost;
  const tankCost = tank * (inp.tankRatePerLitre ?? 35);
  const systemCost = tankCost + (inp.fixedSystemCost ?? 75000);
  const payback = annualSavings > 0 ? systemCost / annualSavings : null;

  // Tank dimensions: rectangular cistern, L:W = 2:1, depth as given.
  const volumeM3 = tank / 1000;
  const planArea = volumeM3 / depthM;
  const tankWidth = Math.sqrt(planArea / 2);
  const tankLength = 2 * tankWidth;
  const downpipes = Math.max(1, Math.ceil(inp.roofAreaM2 / 75));
  const gutterSizeMm =
    inp.roofAreaM2 <= 50 ? 75 : inp.roofAreaM2 <= 100 ? 100 : inp.roofAreaM2 <= 200 ? 110 : 150;
  // Monthly balance assumes rainfall spread evenly over the year
  // (labelled as an assumption — replace with monthly PMD/IMD data
  // when available).
  const monthlyYieldL = Array.from({ length: 12 }, () => yieldL / 12);
  const monthlyDemandL = Array.from({ length: 12 }, () => demandL / 12);

  const warnings: string[] = [];
  if (yieldL < 0.2 * demandL)
    warnings.push("Roof yield covers under 20% of demand — the roof is too small for this demand. Consider a recharge pit instead of (or as well as) a storage tank.");
  if (payback != null && payback > 20)
    warnings.push("Payback is over 20 years on water savings alone. In Pakistan rainwater harvesting usually pays as water security and groundwater recharge, not as a financial return — size the tank for dry-spell cover, not for payback.");
  warnings.push("Harvested rainwater is not drinking water without treatment and testing — use it for flushing, washing, gardening and cleaning unless it is filtered and disinfected to drinking-water standards.");

  return {
    rainfallMm,
    runoffCoeff: coeff,
    yieldGrossLPerYear: yieldGross,
    firstFlushLPerYear: firstFlush,
    yieldLPerYear: yieldL,
    demandLPerYear: demandL,
    dailyUseL: dailyUse,
    tankBy5PctRuleL: tank5pct,
    tankByDrySpellL: tankDry,
    tankRequiredL: tankRequired,
    tankL: tank,
    coveragePct: coverage,
    daysOfSupply,
    annualSavings,
    tankCost,
    systemCost,
    paybackYears: payback,
    tankLengthM: tankLength,
    tankWidthM: tankWidth,
    tankDepthM: depthM,
    downpipes,
    gutterSizeMm,
    monthlyYieldL,
    monthlyDemandL,
    warnings,
    steps: [
      `Annual yield = ${inp.roofAreaM2} m² x ${rainfallMm} mm x ${coeff} runoff x ${filterEff} filter = ${yieldGross.toFixed(0)} L/year${firstFlush > 0 ? `, less first-flush ${firstFlush.toFixed(0)} L = ${yieldL.toFixed(0)} L/year` : ""}`,
      `Annual demand = ${people} people x ${usePerPerson} L/day x 365 = ${demandL.toFixed(0)} L/year`,
      `BS 8515 5% rule = 5% x min(${yieldL.toFixed(0)}, ${demandL.toFixed(0)}) = ${tank5pct.toFixed(0)} L`,
      `Dry-spell need = ${dailyUse} L/day x ${dryDays} days = ${tankDry.toFixed(0)} L`,
      `Tank = max(${tank5pct.toFixed(0)}, ${tankDry.toFixed(0)}) = ${tankRequired.toFixed(0)} L -> ${tank.toLocaleString("en-US")} L standard size`,
      `Coverage = ${Math.min(yieldL, demandL).toFixed(0)} / ${demandL.toFixed(0)} = ${coverage.toFixed(0)}%; days of supply = ${tank} / ${dailyUse} = ${daysOfSupply.toFixed(0)} days`,
    ],
  };
}
