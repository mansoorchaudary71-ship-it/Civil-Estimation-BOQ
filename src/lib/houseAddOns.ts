/**
 * houseAddOns — House Estimator add-ons engine (solar / smart home /
 * landscaping), extracted so the math is testable. Pure functions.
 *
 * SOLAR: priced from the existing SolarRoofCalculator rates — the Lahore
 * PKR preset in solarRoofCalc.ts (panel Rs 90/W, inverter Rs 25,000/kVA,
 * battery Rs 65,000/kWh) plus that tool's cost defaults (545 W panels,
 * Rs 4,500/panel mounting, wiring 8%, labour 10%, net-metering fee
 * Rs 100,000, contingency 5%, inverter efficiency 97%). No rate here is
 * invented: every solar rate is imported or copied from the sourced
 * solarRoofCalc defaults, and the source is labelled in the UI. The
 * add-on prices a user-chosen system size (kW) rather than re-running
 * the full solar sizing engine (which sizes from monthly units).
 *
 * SMART HOME / LANDSCAPING: no rates for these exist anywhere in the
 * CEP rate table (rates.ts) or the codebase, so they are user-entered
 * lump-sum costs (default 0 = not included), never guessed prices.
 */
import { SOLAR_CITY_PRESETS } from "./solarRoofCalc";
import type { SolarGridType } from "./solarRoofCalc";

/** PKR preset the add-on prices from (same table as SolarRoofCalculator). */
const PRESET = SOLAR_CITY_PRESETS.Lahore;

export const SOLAR_PANEL_WATTAGE = 545;
export const SOLAR_PANEL_COST_PER_W = PRESET.panelCostPerW; // Rs 90/W
export const SOLAR_INVERTER_COST_PER_KVA = PRESET.inverterCostPerKva; // Rs 25,000/kVA
export const SOLAR_BATTERY_COST_PER_KWH = PRESET.batteryCostPerKwh; // Rs 65,000/kWh
export const SOLAR_MOUNTING_COST_PER_PANEL = 4500; // calcSolarRoof default
export const SOLAR_WIRING_PCT = 8; // calcSolarRoof default
export const SOLAR_LABOUR_PCT = 10; // calcSolarRoof default
export const SOLAR_NET_METERING_FEE = 100000; // calcSolarRoof default (non Off-Grid)
export const SOLAR_CONTINGENCY_PCT = 5; // calcSolarRoof default
export const SOLAR_INVERTER_EFFICIENCY = 0.97; // calcSolarRoof default

export interface HouseAddOnsState {
  includeAddOns: boolean;
  /** User-chosen solar system size, kW (house standard: 5–10 kW). */
  solarKw: number;
  solarGridType: SolarGridType;
  /** Battery storage, kWh — 0 = panels + inverter only, no battery. */
  solarBatteryKwh: number;
  /** No CEP rate exists: user-entered quoted cost, 0 = not included. */
  smartHomeCost: number;
  /** No CEP rate exists: user-entered quoted cost, 0 = not included. */
  landscapingCost: number;
}

export const initialAddOns: HouseAddOnsState = {
  includeAddOns: false,
  solarKw: 5,
  solarGridType: "Hybrid",
  solarBatteryKwh: 0,
  smartHomeCost: 0,
  landscapingCost: 0,
};

export interface SolarAddOnCost {
  panels: number;
  actualKw: number;
  inverterKva: number;
  panelsCost: number;
  inverterCost: number;
  batteryCost: number;
  mountingCost: number;
  wiringCost: number;
  labourCost: number;
  netMeteringFee: number;
  contingencyCost: number;
  totalCost: number;
  costPerKwp: number;
}

export function calcSolarAddOnCost(
  systemKw: number,
  gridType: SolarGridType,
  batteryKwh: number,
): SolarAddOnCost {
  const kw = Math.max(0, systemKw || 0);
  if (kw <= 0) {
    return {
      panels: 0, actualKw: 0, inverterKva: 0, panelsCost: 0, inverterCost: 0,
      batteryCost: 0, mountingCost: 0, wiringCost: 0, labourCost: 0,
      netMeteringFee: 0, contingencyCost: 0, totalCost: 0, costPerKwp: 0,
    };
  }
  const panels = Math.ceil((kw * 1000) / SOLAR_PANEL_WATTAGE);
  const actualKw = (panels * SOLAR_PANEL_WATTAGE) / 1000;
  const inverterKva = Math.ceil(actualKw / SOLAR_INVERTER_EFFICIENCY);
  const hasBattery = gridType !== "On-Grid";
  const batteryKwhUsed = hasBattery ? Math.max(0, batteryKwh || 0) : 0;

  // Whole-rupee rounding: every money figure is rounded to the nearest
  // rupee at the source, and the total is the sum of the rounded parts
  // (not a rounding of the raw total), so the parts always add exactly
  // to the total. The screen renders PKR with formatCurrency at 0
  // decimals, so an unrounded total (e.g. 942074.70, from the 5%
  // contingency on 897214) would show as Rs 942,075 in one place and
  // 942074.70 in the saved-estimate breakdown. No rate is changed here
  // — rounding only, at most Rs 0.50 per line.
  const panelsCost = Math.round(actualKw * 1000 * SOLAR_PANEL_COST_PER_W);
  const inverterCost = Math.round(inverterKva * SOLAR_INVERTER_COST_PER_KVA);
  const batteryCost = Math.round(batteryKwhUsed * SOLAR_BATTERY_COST_PER_KWH);
  const mountingCost = Math.round(panels * SOLAR_MOUNTING_COST_PER_PANEL);
  const wiringCost = Math.round(panelsCost * (SOLAR_WIRING_PCT / 100));
  const hardwareTotal =
    panelsCost + inverterCost + batteryCost + mountingCost + wiringCost;
  const netMeteringFee = gridType !== "Off-Grid" ? SOLAR_NET_METERING_FEE : 0;
  const labourCost = Math.round(hardwareTotal * (SOLAR_LABOUR_PCT / 100));
  const preContingency = hardwareTotal + netMeteringFee + labourCost;
  const contingencyCost = Math.round(preContingency * (SOLAR_CONTINGENCY_PCT / 100));
  const totalCost = preContingency + contingencyCost;
  return {
    panels,
    actualKw,
    inverterKva,
    panelsCost,
    inverterCost,
    batteryCost,
    mountingCost,
    wiringCost,
    labourCost,
    netMeteringFee,
    contingencyCost,
    totalCost,
    costPerKwp: actualKw > 0 ? totalCost / actualKw : 0,
  };
}
