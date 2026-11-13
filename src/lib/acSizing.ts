/**
 * acSizing.ts — AC sizing from the ENERGY STAR room-size chart.
 * Pure functions; all constants imported from mepConstants.ts (single
 * source of truth). Retired: 5 BTU/ft3 (old MEP tool) and 337 BTU/m2
 * (old infra engine, ~35-50% oversized).
 *
 * Method (G6 spec §4.9): base BTU from area band, then
 *   base x (ceilingHeightFt / 8) x sunFactor
 *   + 600 x max(0, occupants - 2) + 4,000 if kitchen.
 * Round UP to the nearest standard size. 1 ton = 12,000 BTU/h.
 */
import {
  AC_BTU_PER_EXTRA_PERSON,
  AC_KITCHEN_EXTRA_BTU,
  AC_SEER2_DEFAULT,
  AC_STANDARD_SIZES_BTU,
  AC_SUN_FACTOR,
  BTU_PER_TON,
  energyStarBaseBtu,
} from "./mepConstants";

export type AcSunExposure = "shaded" | "normal" | "sunny";

export interface AcInputs {
  /** Room floor area in sq ft (use areaSqM instead for metric). */
  areaSqFt?: number;
  /** Room floor area in m2 (converted: / 0.092903). */
  areaSqM?: number;
  /** Ceiling height in feet (default 8). */
  ceilingHeightFt?: number;
  /** Ceiling height in metres (converted to feet). */
  ceilingHeightM?: number;
  occupants?: number;
  sun?: AcSunExposure;
  isKitchen?: boolean;
  /** SEER2 rating for running-cost estimate (default 15). */
  seer2?: number;
  /** Electricity tariff per kWh in the chosen currency (0 = skip cost). */
  tariffPerKwh?: number;
  /** Running hours per day (default 8). */
  hoursPerDay?: number;
}

export interface AcResults {
  areaSqFt: number;
  baseBtuPerHour: number;
  ceilingFactor: number;
  sunFactor: number;
  extraPersonBtu: number;
  kitchenBtu: number;
  /** Adjusted (required) cooling, BTU/h. */
  requiredBtuPerHour: number;
  tons: number;
  /** Nearest standard unit size >= required, BTU/h. */
  standardBtuPerHour: number;
  standardTons: number;
  /** Cooling capacity in kW. */
  coolingKw: number;
  /** Running watts at the required load (= BTU / SEER2). */
  runningWatts: number;
  /** Monthly running cost in the chosen currency (null when no tariff). */
  monthlyRunningCost: number | null;
  steps: string[];
}

export const SQM_TO_SQFT = 1 / 0.092903;
export const M_TO_FT = 1 / 0.3048;

export function validateAcInputs(inp: AcInputs): string[] {
  const errors: string[] = [];
  const areaSqFt =
    inp.areaSqFt ?? (inp.areaSqM != null ? inp.areaSqM * SQM_TO_SQFT : undefined);
  if (areaSqFt == null || !isFinite(areaSqFt) || areaSqFt <= 0)
    errors.push("Room area must be greater than 0.");
  else if (areaSqFt > 10000) errors.push("Room area looks too large (max 10,000 sq ft).");
  const heightFt =
    inp.ceilingHeightFt ?? (inp.ceilingHeightM != null ? inp.ceilingHeightM * M_TO_FT : 8);
  if (!isFinite(heightFt) || heightFt < 6 || heightFt > 20)
    errors.push("Ceiling height must be between 6 ft and 20 ft.");
  if (inp.occupants != null && (!isFinite(inp.occupants) || inp.occupants < 0 || inp.occupants > 50))
    errors.push("Occupants must be between 0 and 50.");
  if (inp.seer2 != null && (!isFinite(inp.seer2) || inp.seer2 < 5 || inp.seer2 > 30))
    errors.push("SEER2 must be between 5 and 30.");
  if (inp.tariffPerKwh != null && (!isFinite(inp.tariffPerKwh) || inp.tariffPerKwh < 0))
    errors.push("Tariff per kWh cannot be negative.");
  return errors;
}

export function calcAcSizing(inp: AcInputs): AcResults {
  const errors = validateAcInputs(inp);
  if (errors.length > 0) throw new Error(errors.join(" "));
  const areaSqFt =
    inp.areaSqFt ?? (inp.areaSqM != null ? inp.areaSqM * SQM_TO_SQFT : 0);
  const heightFt =
    inp.ceilingHeightFt ?? (inp.ceilingHeightM != null ? inp.ceilingHeightM * M_TO_FT : 8);
  const occupants = inp.occupants ?? 2;
  const sun = inp.sun ?? "normal";
  const isKitchen = inp.isKitchen ?? false;
  const seer2 = inp.seer2 ?? AC_SEER2_DEFAULT;
  const hoursPerDay = inp.hoursPerDay ?? 8;

  const base = energyStarBaseBtu(areaSqFt);
  const ceilingFactor = heightFt / 8;
  const sunFactor = AC_SUN_FACTOR[sun];
  const extraPersonBtu = AC_BTU_PER_EXTRA_PERSON * Math.max(0, occupants - 2);
  const kitchenBtu = isKitchen ? AC_KITCHEN_EXTRA_BTU : 0;
  const required = Math.round(
    base * ceilingFactor * sunFactor + extraPersonBtu + kitchenBtu,
  );
  const standard =
    AC_STANDARD_SIZES_BTU.find((s) => s >= required) ??
    AC_STANDARD_SIZES_BTU[AC_STANDARD_SIZES_BTU.length - 1];
  const runningWatts = required / seer2;
  const monthlyRunningCost =
    inp.tariffPerKwh != null && inp.tariffPerKwh > 0
      ? (runningWatts / 1000) * hoursPerDay * 30 * inp.tariffPerKwh
      : null;

  return {
    areaSqFt,
    baseBtuPerHour: base,
    ceilingFactor,
    sunFactor,
    extraPersonBtu,
    kitchenBtu,
    requiredBtuPerHour: required,
    tons: required / BTU_PER_TON,
    standardBtuPerHour: standard,
    standardTons: standard / BTU_PER_TON,
    coolingKw: required * 0.000293071,
    runningWatts,
    monthlyRunningCost,
    steps: [
      `ENERGY STAR base for ${areaSqFt.toFixed(0)} sq ft: ${base.toLocaleString("en-US")} BTU/h`,
      `Ceiling factor ${heightFt.toFixed(1)} ft / 8 ft = ${ceilingFactor.toFixed(3)}; sun factor (${sun}) = ${sunFactor}`,
      `Extra people: +${extraPersonBtu.toLocaleString("en-US")} BTU/h; kitchen: +${kitchenBtu.toLocaleString("en-US")} BTU/h`,
      `Required = ${base.toLocaleString("en-US")} x ${ceilingFactor.toFixed(3)} x ${sunFactor} + ${extraPersonBtu.toLocaleString("en-US")} + ${kitchenBtu.toLocaleString("en-US")} = ${required.toLocaleString("en-US")} BTU/h (${(required / BTU_PER_TON).toFixed(2)} tons)`,
      `Nearest standard unit: ${standard.toLocaleString("en-US")} BTU/h (${(standard / BTU_PER_TON).toFixed(2)} tons)`,
      `Running watts = ${required.toLocaleString("en-US")} / SEER2 ${seer2} = ${runningWatts.toFixed(0)} W`,
    ],
  };
}

/** Breaker + cable note for an AC unit (planning note, not a design). */
export function acBreakerNote(runningWatts: number, voltageV = 230): string {
  const amps = runningWatts / voltageV;
  const design = amps * 1.25;
  const breaker = [6, 10, 16, 20, 25, 32, 40].find((b) => b >= design) ?? 40;
  return `Running current about ${amps.toFixed(1)} A at ${voltageV} V; design current (x1.25) about ${design.toFixed(1)} A — use a ${breaker} A breaker with a dedicated circuit. Confirm cable size and breaker with a licensed electrician.`;
}
