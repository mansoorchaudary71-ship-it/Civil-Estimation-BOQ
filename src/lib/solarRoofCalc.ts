/**
 * solarRoofCalc.ts — solar PV system sizing, cost and financials.
 * Pure functions; PSH / export-credit / CO2 constants imported from
 * mepConstants.ts (single source of truth).
 *
 * Canonical defaults (G6 spec §4.3): Lahore PSH 5.0 (old tool used 4.8);
 * export credit 20% of the import tariff (old tool used 100%, which
 * overstated savings ~2x on exported units — NEPRA buyback is about
 * PKR 9-11/kWh vs ~PKR 50 import); battery PKR 65,000/kWh (editable).
 *
 * Formulas: dailyDemand = monthlyUnits / 30.4; derate = 1 - losses/100;
 * reqKw = (dailyDemand / PSH) / derate; panels = ceil(reqKw*1000/panelW);
 * roofReq = panels * panelArea * 1.3; inverterKva = ceil(max(actualKw,
 * peakLoad) / invEff); battKwh = dailyDemand * autonomy / DoD;
 * batt modules = ceil(battAh / 200 Ah) — rounding UP to 200 Ah x 48 V
 * modules oversizes the battery and that oversizing is reported.
 * Annual savings = min(gen, usage) x tariff
 *   + max(0, gen - usage) x tariff x exportRate%.
 */
import {
  BATTERY_DOD,
  SOLAR_CO2_KG_PER_KWH,
  SOLAR_EXPORT_CREDIT_FRACTION_OF_TARIFF,
  SOLAR_PSH_BY_CITY,
  type MepCity,
} from "./mepConstants";

export type SolarGridType = "On-Grid" | "Off-Grid" | "Hybrid";
export type SolarBatteryType = "lifepo4" | "leadAcid";
export type SolarCurrency = "PKR" | "INR" | "AED";

export const SOLAR_CURRENCY_SYMBOL: Record<SolarCurrency, string> = {
  PKR: "Rs",
  INR: "₹",
  AED: "AED",
};

export interface SolarCityPreset {
  city: MepCity;
  psh: number;
  currency: SolarCurrency;
  tariff: number;
  panelCostPerW: number;
  inverterCostPerKva: number;
  batteryCostPerKwh: number;
}

/** City presets. Battery PKR 65,000/kWh is an editable indicative
 *  default (Nov 2026) — confirm with a supplier. */
export const SOLAR_CITY_PRESETS: Record<MepCity, SolarCityPreset> = {
  Lahore: { city: "Lahore", psh: SOLAR_PSH_BY_CITY.Lahore, currency: "PKR", tariff: 50, panelCostPerW: 90, inverterCostPerKva: 25000, batteryCostPerKwh: 65000 },
  Karachi: { city: "Karachi", psh: SOLAR_PSH_BY_CITY.Karachi, currency: "PKR", tariff: 50, panelCostPerW: 90, inverterCostPerKva: 25000, batteryCostPerKwh: 65000 },
  Islamabad: { city: "Islamabad", psh: SOLAR_PSH_BY_CITY.Islamabad, currency: "PKR", tariff: 50, panelCostPerW: 90, inverterCostPerKva: 25000, batteryCostPerKwh: 65000 },
  Multan: { city: "Multan", psh: SOLAR_PSH_BY_CITY.Multan, currency: "PKR", tariff: 50, panelCostPerW: 90, inverterCostPerKva: 25000, batteryCostPerKwh: 65000 },
  Quetta: { city: "Quetta", psh: SOLAR_PSH_BY_CITY.Quetta, currency: "PKR", tariff: 50, panelCostPerW: 90, inverterCostPerKva: 25000, batteryCostPerKwh: 65000 },
  Dubai: { city: "Dubai", psh: SOLAR_PSH_BY_CITY.Dubai, currency: "AED", tariff: 0.3, panelCostPerW: 1.2, inverterCostPerKva: 350, batteryCostPerKwh: 1500 },
  Mumbai: { city: "Mumbai", psh: SOLAR_PSH_BY_CITY.Mumbai, currency: "INR", tariff: 8, panelCostPerW: 28, inverterCostPerKva: 7000, batteryCostPerKwh: 25000 },
  Delhi: { city: "Delhi", psh: SOLAR_PSH_BY_CITY.Delhi, currency: "INR", tariff: 8, panelCostPerW: 28, inverterCostPerKva: 7000, batteryCostPerKwh: 25000 },
};

export interface SolarRoofInputs {
  monthlyUnitsKwh: number;
  /** Average monthly electricity bill in the same currency — used only
   *  to cross-check the entered units (bill / tariff = implied units). */
  monthlyBill?: number | null;
  psh: number;
  systemLossesPct?: number;
  panelWattage?: number;
  /** Panel efficiency % — used to derive panel area when panelAreaM2
   *  is not given: area = panelW / (1000 x efficiency). */
  panelEfficiencyPct?: number;
  panelAreaM2?: number;
  roofAreaM2?: number;
  peakLoadKw?: number;
  gridType?: SolarGridType;
  inverterEfficiencyPct?: number;
  batteryAutonomyDays?: number;
  batteryType?: SolarBatteryType;
  batteryVoltage?: number;
  panelCostPerW?: number;
  inverterCostPerKva?: number;
  batteryCostPerKwh?: number;
  structureCostPerPanel?: number;
  wiringPct?: number;
  labourPct?: number;
  netMeteringFee?: number;
  contingencyPct?: number;
  tariffPerKwh?: number;
  /** Export credit as % of the import tariff (default 20). */
  exportRatePct?: number;
  degradationPctPerYear?: number;
  maintenancePctPerYear?: number;
  tariffEscalationPctPerYear?: number;
  lifespanYears?: number;
  /** Tilt in degrees — informational: optimal tilt is about latitude
   *  +/- 5 degrees (Lahore ~31 deg). Does not change PSH by itself. */
  tiltDeg?: number;
  loanEnabled?: boolean;
  loanPctOfCost?: number;
  loanInterestPctPerYear?: number;
  loanTenureYears?: number;
  currency?: SolarCurrency;
}

export interface SolarCashFlowYear {
  year: number;
  generationKwh: number;
  tariffPerKwh: number;
  grossSavings: number;
  maintenance: number;
  inverterReplacement: number;
  netSavings: number;
  cumulative: number;
}

export interface SolarRoofResults {
  dailyDemandKwh: number;
  derate: number;
  requiredKw: number;
  panels: number;
  actualKw: number;
  panelAreaM2: number;
  roofAreaRequiredM2: number;
  maxPanelsOnRoof: number;
  maxKwOnRoof: number;
  roofFits: boolean;
  inverterKva: number;
  hasBattery: boolean;
  batteryRequiredKwh: number;
  batteryAhRequired: number;
  batteryModules: number;
  batteryActualKwh: number;
  batteryOversizePct: number;
  panelsCost: number;
  inverterCost: number;
  batteryCost: number;
  mountingCost: number;
  wiringCost: number;
  netMeteringFee: number;
  labourCost: number;
  contingencyCost: number;
  totalCost: number;
  costPerKwp: number;
  dailyGenerationKwh: number;
  annualGenerationKwh: number;
  annualUsageKwh: number;
  exportedKwhPerYear: number;
  exportPricePerKwh: number;
  annualSavingsYear1: number;
  netAnnualSavingsYear1: number;
  simplePaybackYears: number | null;
  annualCo2Kg: number;
  npv: number;
  irrPct: number | null;
  lcoePerKwh: number;
  inverterReplacementCost: number;
  cashFlows: SolarCashFlowYear[];
  lifetimeNetSavings: number;
  impliedUnitsFromBill: number | null;
  billCrossCheckWarning: string | null;
  optimalTiltHint: string;
  loanMonthlyInstalment: number | null;
  loanTotalInterest: number | null;
  steps: string[];
}

export function defaultSolarRoofInputs(city: MepCity = "Lahore"): SolarRoofInputs {
  const p = SOLAR_CITY_PRESETS[city];
  return {
    monthlyUnitsKwh: 600,
    monthlyBill: 30000,
    psh: p.psh,
    systemLossesPct: 14,
    panelWattage: 545,
    panelEfficiencyPct: 21,
    panelAreaM2: 2.58,
    roofAreaM2: 100,
    peakLoadKw: 4.5,
    gridType: "Hybrid",
    inverterEfficiencyPct: 97,
    batteryAutonomyDays: 1,
    batteryType: "lifepo4",
    batteryVoltage: 48,
    panelCostPerW: p.panelCostPerW,
    inverterCostPerKva: p.inverterCostPerKva,
    batteryCostPerKwh: p.batteryCostPerKwh,
    structureCostPerPanel: 4500,
    wiringPct: 8,
    labourPct: 10,
    netMeteringFee: 100000,
    contingencyPct: 5,
    tariffPerKwh: p.tariff,
    exportRatePct: SOLAR_EXPORT_CREDIT_FRACTION_OF_TARIFF * 100,
    degradationPctPerYear: 0.5,
    maintenancePctPerYear: 0.5,
    tariffEscalationPctPerYear: 10,
    lifespanYears: 25,
    tiltDeg: 31,
    loanEnabled: false,
    loanPctOfCost: 70,
    loanInterestPctPerYear: 18,
    loanTenureYears: 5,
    currency: p.currency,
  };
}

export function validateSolarRoofInputs(inp: SolarRoofInputs): string[] {
  const errors: string[] = [];
  if (!isFinite(inp.monthlyUnitsKwh) || inp.monthlyUnitsKwh <= 0)
    errors.push("Monthly units must be greater than 0.");
  else if (inp.monthlyUnitsKwh > 100000)
    errors.push("Monthly units look too large (max 100,000 kWh).");
  if (!isFinite(inp.psh) || inp.psh < 1 || inp.psh > 8)
    errors.push("Peak sun hours (PSH) must be between 1 and 8 — a value of 0 would make the system size infinite.");
  const losses = inp.systemLossesPct ?? 14;
  if (!isFinite(losses) || losses < 0 || losses >= 100)
    errors.push("System losses must be between 0% and under 100% — 100% losses would make the system size infinite.");
  if (losses > 40) errors.push("System losses above 40% are unrealistic — check the value.");
  const eff = inp.panelEfficiencyPct ?? 21;
  if (!isFinite(eff) || eff < 5 || eff > 100)
    errors.push("Panel efficiency must be between 5% and 100%.");
  if (inp.panelWattage != null && (!isFinite(inp.panelWattage) || inp.panelWattage < 100 || inp.panelWattage > 1000))
    errors.push("Panel wattage must be between 100 W and 1,000 W.");
  if (inp.roofAreaM2 != null && (!isFinite(inp.roofAreaM2) || inp.roofAreaM2 <= 0))
    errors.push("Available roof area must be greater than 0.");
  const exportRate = inp.exportRatePct ?? 20;
  if (!isFinite(exportRate) || exportRate < 0 || exportRate > 100)
    errors.push("Export rate must be between 0% and 100% of the import tariff.");
  const costs = [
    inp.panelCostPerW, inp.inverterCostPerKva, inp.batteryCostPerKwh,
    inp.structureCostPerPanel, inp.netMeteringFee, inp.tariffPerKwh,
  ];
  if (costs.some((c) => c != null && (!isFinite(c) || c < 0)))
    errors.push("Costs and tariff cannot be negative.");
  if (inp.loanEnabled) {
    if ((inp.loanPctOfCost ?? 0) <= 0 || (inp.loanPctOfCost ?? 0) > 100)
      errors.push("Loan share must be between 1% and 100% of system cost.");
    if ((inp.loanInterestPctPerYear ?? 0) < 0 || (inp.loanInterestPctPerYear ?? 0) > 60)
      errors.push("Loan interest must be between 0% and 60% per year.");
    if ((inp.loanTenureYears ?? 0) <= 0 || (inp.loanTenureYears ?? 0) > 25)
      errors.push("Loan tenure must be between 1 and 25 years.");
  }
  return errors;
}

function npvAtRate(cashFlows: number[], rate: number): number {
  return cashFlows.reduce((sum, cf, t) => sum + cf / Math.pow(1 + rate, t), 0);
}

export function calcSolarRoof(inp: SolarRoofInputs): SolarRoofResults {
  const errors = validateSolarRoofInputs(inp);
  if (errors.length > 0) throw new Error(errors.join(" "));
  const lossesPct = inp.systemLossesPct ?? 14;
  const panelWattage = inp.panelWattage ?? 545;
  const panelAreaM2 =
    inp.panelAreaM2 ??
    panelWattage / (1000 * ((inp.panelEfficiencyPct ?? 21) / 100));
  const roofAreaM2 = inp.roofAreaM2 ?? 100;
  const peakLoadKw = inp.peakLoadKw ?? 4.5;
  const gridType = inp.gridType ?? "Hybrid";
  const invEff = (inp.inverterEfficiencyPct ?? 97) / 100;
  const autonomy = inp.batteryAutonomyDays ?? 1;
  const batteryType = inp.batteryType ?? "lifepo4";
  const dod = BATTERY_DOD[batteryType];
  const batteryVoltage = inp.batteryVoltage ?? 48;
  const tariff = inp.tariffPerKwh ?? 50;
  const exportRatePct = inp.exportRatePct ?? SOLAR_EXPORT_CREDIT_FRACTION_OF_TARIFF * 100;
  const lifespan = inp.lifespanYears ?? 25;

  const dailyDemand = inp.monthlyUnitsKwh / 30.4;
  const derate = 1 - lossesPct / 100;
  const requiredKw = dailyDemand / inp.psh / derate;
  const panels = Math.ceil((requiredKw * 1000) / panelWattage);
  const actualKw = (panels * panelWattage) / 1000;
  const roofAreaRequired = panels * panelAreaM2 * 1.3;
  const maxPanels = Math.floor(roofAreaM2 / (panelAreaM2 * 1.3));
  const maxKw = (maxPanels * panelWattage) / 1000;
  const inverterKva = Math.ceil(Math.max(actualKw, peakLoadKw) / invEff);

  const hasBattery = gridType !== "On-Grid";
  const batteryRequiredKwh = hasBattery ? (dailyDemand * autonomy) / dod : 0;
  const batteryAhRequired = hasBattery ? (batteryRequiredKwh * 1000) / batteryVoltage : 0;
  const batteryModules = hasBattery ? Math.ceil(batteryAhRequired / 200) : 0;
  const batteryActualKwh = hasBattery ? (batteryModules * 200 * batteryVoltage) / 1000 : 0;
  const batteryOversizePct =
    batteryRequiredKwh > 0 ? ((batteryActualKwh - batteryRequiredKwh) / batteryRequiredKwh) * 100 : 0;

  const panelsCost = actualKw * 1000 * (inp.panelCostPerW ?? 90);
  const inverterCost = inverterKva * (inp.inverterCostPerKva ?? 25000);
  const batteryCost = hasBattery ? batteryActualKwh * (inp.batteryCostPerKwh ?? 65000) : 0;
  const mountingCost = panels * (inp.structureCostPerPanel ?? 4500);
  const wiringCost = panelsCost * ((inp.wiringPct ?? 8) / 100);
  const hardwareTotal = panelsCost + inverterCost + batteryCost + mountingCost + wiringCost;
  const netMeteringFee = gridType !== "Off-Grid" ? (inp.netMeteringFee ?? 100000) : 0;
  const labourCost = hardwareTotal * ((inp.labourPct ?? 10) / 100);
  const preContingency = hardwareTotal + netMeteringFee + labourCost;
  const contingencyCost = preContingency * ((inp.contingencyPct ?? 5) / 100);
  const totalCost = preContingency + contingencyCost;
  const costPerKwp = actualKw > 0 ? totalCost / actualKw : 0;

  const dailyGen = actualKw * inp.psh * derate;
  const annualGen = dailyGen * 365;
  const annualUsage = inp.monthlyUnitsKwh * 12;
  const exportedKwh = Math.max(0, annualGen - annualUsage);
  const exportPrice = tariff * (exportRatePct / 100);
  const annualSavings =
    Math.min(annualGen, annualUsage) * tariff + exportedKwh * exportPrice;
  const maintPerYear = totalCost * ((inp.maintenancePctPerYear ?? 0.5) / 100);
  const netAnnualSavingsYear1 = annualSavings - maintPerYear;
  const simplePayback =
    netAnnualSavingsYear1 > 0 ? totalCost / netAnnualSavingsYear1 : null;

  // Year-by-year cash flow (degradation + tariff escalation, inverter
  // replacement at year 12 at today's inverter cost).
  const cashFlows: SolarCashFlowYear[] = [];
  let gen = annualGen;
  let curTariff = tariff;
  let cumulative = -totalCost;
  let lifetimeNet = 0;
  let totalGenLifetime = 0;
  for (let year = 1; year <= lifespan; year++) {
    const exported = Math.max(0, gen - annualUsage);
    const gross = Math.min(gen, annualUsage) * curTariff + exported * curTariff * (exportRatePct / 100);
    const inverterReplacement = year === 12 ? inverterCost : 0;
    const net = gross - maintPerYear - inverterReplacement;
    lifetimeNet += net;
    totalGenLifetime += gen;
    cumulative += net;
    cashFlows.push({
      year,
      generationKwh: gen,
      tariffPerKwh: curTariff,
      grossSavings: gross,
      maintenance: maintPerYear,
      inverterReplacement,
      netSavings: net,
      cumulative,
    });
    gen *= 1 - (inp.degradationPctPerYear ?? 0.5) / 100;
    curTariff *= 1 + (inp.tariffEscalationPctPerYear ?? 10) / 100;
  }
  const npvCashFlows = [-totalCost, ...cashFlows.map((c) => c.netSavings)];
  const npv = npvAtRate(npvCashFlows, 0.1);
  // IRR by bisection on NPV(r) = 0.
  let irr: number | null = null;
  let lo = -0.9;
  let hi = 5;
  const npvLo = npvAtRate(npvCashFlows, lo);
  const npvHi = npvAtRate(npvCashFlows, hi);
  if (npvLo * npvHi < 0) {
    for (let i = 0; i < 100; i++) {
      const mid = (lo + hi) / 2;
      const v = npvAtRate(npvCashFlows, mid);
      if (Math.abs(v) < 1) break;
      if (v * npvLo > 0) lo = mid; else hi = mid;
    }
    irr = ((lo + hi) / 2) * 100;
  }
  const lcoe =
    totalGenLifetime > 0
      ? (totalCost + inverterCost + maintPerYear * lifespan) / totalGenLifetime
      : 0;

  const impliedUnitsFromBill =
    inp.monthlyBill != null && tariff > 0 ? inp.monthlyBill / tariff : null;
  const billCrossCheckWarning =
    impliedUnitsFromBill != null
      ? Math.abs(impliedUnitsFromBill - inp.monthlyUnitsKwh) / inp.monthlyUnitsKwh > 0.2
        ? `Your bill implies about ${impliedUnitsFromBill.toFixed(0)} kWh/month (bill / tariff), but you entered ${inp.monthlyUnitsKwh} kWh/month — a difference of over 20%. Check which figure is right; the units figure drives the sizing.`
        : null
      : null;

  let loanMonthlyInstalment: number | null = null;
  let loanTotalInterest: number | null = null;
  if (inp.loanEnabled) {
    const principal = totalCost * ((inp.loanPctOfCost ?? 70) / 100);
    const r = (inp.loanInterestPctPerYear ?? 18) / 100 / 12;
    const n = (inp.loanTenureYears ?? 5) * 12;
    loanMonthlyInstalment =
      r > 0 ? (principal * r) / (1 - Math.pow(1 + r, -n)) : principal / n;
    loanTotalInterest = loanMonthlyInstalment * n - principal;
  }

  return {
    dailyDemandKwh: dailyDemand,
    derate,
    requiredKw,
    panels,
    actualKw,
    panelAreaM2,
    roofAreaRequiredM2: roofAreaRequired,
    maxPanelsOnRoof: maxPanels,
    maxKwOnRoof: maxKw,
    roofFits: roofAreaRequired <= roofAreaM2,
    inverterKva,
    hasBattery,
    batteryRequiredKwh,
    batteryAhRequired,
    batteryModules,
    batteryActualKwh,
    batteryOversizePct,
    panelsCost,
    inverterCost,
    batteryCost,
    mountingCost,
    wiringCost,
    netMeteringFee,
    labourCost,
    contingencyCost,
    totalCost,
    costPerKwp,
    dailyGenerationKwh: dailyGen,
    annualGenerationKwh: annualGen,
    annualUsageKwh: annualUsage,
    exportedKwhPerYear: exportedKwh,
    exportPricePerKwh: exportPrice,
    annualSavingsYear1: annualSavings,
    netAnnualSavingsYear1,
    simplePaybackYears: simplePayback,
    annualCo2Kg: annualGen * SOLAR_CO2_KG_PER_KWH,
    npv,
    irrPct: irr,
    lcoePerKwh: lcoe,
    inverterReplacementCost: inverterCost,
    cashFlows,
    lifetimeNetSavings: lifetimeNet,
    impliedUnitsFromBill,
    billCrossCheckWarning,
    optimalTiltHint: `Optimal tilt is about latitude ± 5° (Lahore ~31°). You entered ${inp.tiltDeg ?? 31}°. Tilt within a few degrees of optimal changes annual yield by only a few percent — it does not change the PSH figure by itself.`,
    loanMonthlyInstalment,
    loanTotalInterest,
    steps: [
      `Daily demand = ${inp.monthlyUnitsKwh} / 30.4 = ${dailyDemand.toFixed(2)} kWh/day`,
      `Required kWp = (${dailyDemand.toFixed(2)} / ${inp.psh} PSH) / ${derate.toFixed(2)} derate = ${requiredKw.toFixed(2)} kW`,
      `Panels = ceil(${requiredKw.toFixed(2)} x 1000 / ${panelWattage} W) = ${panels} panels = ${actualKw.toFixed(2)} kWp installed`,
      `Roof needed = ${panels} x ${panelAreaM2} m² x 1.3 spacing = ${roofAreaRequired.toFixed(1)} m² (roof fits ${maxPanels} panels / ${maxKw.toFixed(2)} kWp)`,
      `Inverter = ceil(max(${actualKw.toFixed(2)} kWp, ${peakLoadKw} kW peak) / ${invEff}) = ${inverterKva} kVA`,
      hasBattery
        ? `Battery = ${dailyDemand.toFixed(2)} kWh x ${autonomy} day(s) / ${Math.round(dod * 100)}% DoD (${batteryType === "lifepo4" ? "LiFePO4" : "lead-acid"}) = ${batteryRequiredKwh.toFixed(2)} kWh -> ${batteryModules} x 200 Ah x ${batteryVoltage} V modules = ${batteryActualKwh.toFixed(1)} kWh (+${batteryOversizePct.toFixed(1)}% oversize from module rounding)`
        : "On-grid system: no battery.",
      `Year-1 savings = ${Math.min(annualGen, annualUsage).toFixed(0)} kWh self-used x ${tariff} + ${exportedKwh.toFixed(0)} kWh exported x ${exportPrice.toFixed(2)} (${exportRatePct}% of tariff) = ${annualSavings.toFixed(0)} per year`,
    ],
  };
}
