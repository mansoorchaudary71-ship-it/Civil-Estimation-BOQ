/**
 * solarWaterHeaterCalc.ts — solar water heater sizing (collector area,
 * tank, panels, system cost, payback). Pure functions; the 50 L/person
 * demand comes from mepConstants.ts (the old tool's 40 L/person is
 * retired). Energy cost is an input in the chosen currency — the old
 * hardcoded $0.15/kWh USD is gone.
 *
 * Q(kWh/day) = demand(L) x 4.184 x ΔT / 3600
 * area(m2) = Q / (radiation x efficiency x solarFraction)
 * panels = ceil(area / 2)  (2 m2 standard modules)
 * tank = max(demand x 1.5, area x 60 L/m2), rounded UP to a standard size
 * annualSavings = Q x solarFraction x 365 x energyCostPerKwh
 */
import {
  SOLAR_WATER_HEATER_L_PER_PERSON_PER_DAY,
  SOLAR_WATER_HEATER_SOLAR_FRACTION_DEFAULT,
  SOLAR_WATER_HEATER_STANDARD_TANK_SIZES_L,
  SOLAR_WATER_HEATER_TANK_DEMAND_MULTIPLIER,
  SOLAR_WATER_HEATER_TANK_L_PER_M2_COLLECTOR,
} from "./mepConstants";

export type SolarCollectorType = "flatPlate" | "evacuatedTube";

export const SOLAR_COLLECTOR_TYPES: Record<
  SolarCollectorType,
  { label: string; efficiencyPct: number; ratePerM2: number; note: string }
> = {
  flatPlate: {
    label: "Flat-plate (selective)",
    efficiencyPct: 50,
    ratePerM2: 45000,
    note: "Selective flat-plate collector. Indicative rate PKR 45,000/m² — confirm with a supplier.",
  },
  evacuatedTube: {
    label: "Evacuated tube",
    efficiencyPct: 65,
    ratePerM2: 60000,
    note: "Evacuated-tube collector, better in winter / cold climates. Indicative rate PKR 60,000/m² — confirm with a supplier.",
  },
};

export interface SolarWaterHeaterInputs {
  people: number;
  /** Hot-water use per person per day, litres (default 50). */
  usePerPersonL?: number;
  targetTempC?: number;
  inletTempC?: number;
  /** Solar radiation, kWh/m2/day (default 5.0). */
  radiationKwhPerM2PerDay?: number;
  collectorType?: SolarCollectorType;
  /** Collector efficiency % (overrides the collector-type default). */
  efficiencyPct?: number;
  /** Solar fraction 0.3-0.9 (default 0.6). */
  solarFraction?: number;
  /** Energy cost per kWh in the chosen currency (default 50 — PKR
   *  grid tariff; enter your own rate for INR/AED). */
  energyCostPerKwh?: number;
  /** System rate per m2 of collector in the chosen currency. */
  ratePerM2Collector?: number;
  /** Tank cost per litre in the chosen currency (default 800). */
  tankCostPerLitre?: number;
  /** Installation as % of (collector + tank) cost (default 10). */
  installationPct?: number;
}

export interface SolarWaterHeaterResults {
  demandLPerDay: number;
  deltaT: number;
  energyKwhPerDay: number;
  collectorAreaM2: number;
  panels: number;
  installedAreaM2: number;
  tankUnroundedL: number;
  tankL: number;
  backupKwhPerDay: number;
  annualSolarKwh: number;
  annualSavings: number;
  collectorCost: number;
  tankCost: number;
  installationCost: number;
  systemCost: number;
  paybackYears: number | null;
  steps: string[];
}

export function validateSolarWaterHeaterInputs(inp: SolarWaterHeaterInputs): string[] {
  const errors: string[] = [];
  if (!isFinite(inp.people) || inp.people <= 0 || inp.people > 50)
    errors.push("Number of people must be between 1 and 50.");
  const use = inp.usePerPersonL ?? SOLAR_WATER_HEATER_L_PER_PERSON_PER_DAY;
  if (!isFinite(use) || use < 30 || use > 80)
    errors.push("Hot-water use must be between 30 and 80 L/person/day.");
  const target = inp.targetTempC ?? 60;
  const inlet = inp.inletTempC ?? 15;
  if (target <= inlet)
    errors.push("Target temperature must exceed inlet temperature.");
  if (target > 90) errors.push("Target temperature above 90 °C is not realistic for a domestic system.");
  const eff = inp.efficiencyPct ?? 50;
  if (!isFinite(eff) || eff < 10 || eff > 90)
    errors.push("Collector efficiency must be between 10% and 90% — 0% would make the area infinite.");
  const rad = inp.radiationKwhPerM2PerDay ?? 5;
  if (!isFinite(rad) || rad < 2 || rad > 8)
    errors.push("Solar radiation must be between 2 and 8 kWh/m²/day.");
  const sf = inp.solarFraction ?? SOLAR_WATER_HEATER_SOLAR_FRACTION_DEFAULT;
  if (!isFinite(sf) || sf < 0.3 || sf > 0.9)
    errors.push("Solar fraction must be between 0.3 and 0.9.");
  return errors;
}

export function calcSolarWaterHeater(inp: SolarWaterHeaterInputs): SolarWaterHeaterResults {
  const errors = validateSolarWaterHeaterInputs(inp);
  if (errors.length > 0) throw new Error(errors.join(" "));
  const usePerPerson = inp.usePerPersonL ?? SOLAR_WATER_HEATER_L_PER_PERSON_PER_DAY;
  const target = inp.targetTempC ?? 60;
  const inlet = inp.inletTempC ?? 15;
  const radiation = inp.radiationKwhPerM2PerDay ?? 5;
  const collector = SOLAR_COLLECTOR_TYPES[inp.collectorType ?? "flatPlate"];
  const efficiency = (inp.efficiencyPct ?? collector.efficiencyPct) / 100;
  const solarFraction = inp.solarFraction ?? SOLAR_WATER_HEATER_SOLAR_FRACTION_DEFAULT;
  const energyCost = inp.energyCostPerKwh ?? 50;

  const demand = inp.people * usePerPerson;
  const deltaT = target - inlet;
  const energyKwh = (demand * 4.184 * deltaT) / 3600;
  const area = energyKwh / (radiation * efficiency * solarFraction);
  const panels = Math.ceil(area / 2);
  const installedArea = panels * 2;
  const tankUnrounded = Math.max(
    demand * SOLAR_WATER_HEATER_TANK_DEMAND_MULTIPLIER,
    area * SOLAR_WATER_HEATER_TANK_L_PER_M2_COLLECTOR,
  );
  const tank =
    SOLAR_WATER_HEATER_STANDARD_TANK_SIZES_L.find((s) => s >= tankUnrounded) ??
    Math.ceil(tankUnrounded / 100) * 100;
  const backupKwh = energyKwh * (1 - solarFraction);
  const annualSolarKwh = energyKwh * solarFraction * 365;
  const annualSavings = annualSolarKwh * energyCost;

  const ratePerM2 = inp.ratePerM2Collector ?? collector.ratePerM2;
  const collectorCost = area * ratePerM2;
  const tankCost = tank * (inp.tankCostPerLitre ?? 800);
  const installationCost = (collectorCost + tankCost) * ((inp.installationPct ?? 10) / 100);
  const systemCost = collectorCost + tankCost + installationCost;
  const paybackYears = annualSavings > 0 ? systemCost / annualSavings : null;

  return {
    demandLPerDay: demand,
    deltaT,
    energyKwhPerDay: energyKwh,
    collectorAreaM2: area,
    panels,
    installedAreaM2: installedArea,
    tankUnroundedL: tankUnrounded,
    tankL: tank,
    backupKwhPerDay: backupKwh,
    annualSolarKwh,
    annualSavings,
    collectorCost,
    tankCost,
    installationCost,
    systemCost,
    paybackYears,
    steps: [
      `Daily demand = ${inp.people} people x ${usePerPerson} L/person = ${demand} L/day`,
      `Heat needed Q = ${demand} x 4.184 x ${deltaT} °C / 3600 = ${energyKwh.toFixed(2)} kWh/day`,
      `Collector area = ${energyKwh.toFixed(2)} / (${radiation} kWh/m²/day x ${(efficiency * 100).toFixed(0)}% x solar fraction ${solarFraction}) = ${area.toFixed(2)} m²`,
      `Panels = ceil(${area.toFixed(2)} / 2 m²) = ${panels} modules (${installedArea} m² installed)`,
      `Tank = max(${demand} x 1.5 = ${(demand * 1.5).toFixed(0)} L, ${area.toFixed(2)} m² x 60 = ${(area * 60).toFixed(0)} L) = ${tankUnrounded.toFixed(0)} L -> ${tank} L standard size`,
      `Annual saving = ${energyKwh.toFixed(2)} x ${solarFraction} x 365 x ${energyCost} = ${annualSavings.toFixed(0)} per year; payback = ${systemCost.toFixed(0)} / ${annualSavings.toFixed(0)} = ${paybackYears?.toFixed(1) ?? "—"} years`,
    ],
  };
}
