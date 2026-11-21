/**
 * ventilationCalc.ts — ventilation by three methods: NBC glazing check,
 * air-changes-per-hour (ACH), and ASHRAE 62.1 outdoor air.
 * Pure functions; ACH targets imported from mepConstants.ts.
 *
 * Glazing (kept from the old tool): required glazing = floorArea /
 * ratio (Dry Hot 1/10, Intermediate 1/8, Wet Hot 1/6); required
 * openable = 50% of required glazing; kitchen minimum 1.0 m2,
 * bathroom minimum 0.3 m2. Clause number is NOT asserted: the ratios
 * are labelled "Pakistan Building Code / NBC 2016 Part 8 as applicable
 * — verify the clause number before publishing" (G6 spec §4.7).
 * The old CodeTooltip citing IS 875 Part 3 (wind loads) for a
 * ventilation ratio was a copy-paste error and is removed.
 *
 * ACH: required airflow (m3/h) = volume x target ACH.
 * ASHRAE 62.1: Vbz = Rp x Pz + Ra x Az; Voz = Vbz / Ez.
 * Note the two methods measure different things: ASHRAE gives OUTDOOR
 * air, ACH gives TOTAL supply air — they are shown side by side and
 * must not be compared as if they were the same quantity.
 */
import { VENTILATION_ACH_TARGET } from "./mepConstants";

export type VentRoomType = "bedroom" | "living" | "kitchen" | "bathroom" | "office" | "classroom";
export type VentClimateZone = "Dry Hot" | "Intermediate" | "Wet Hot";

export const VENTILATION_RATIOS: Record<VentClimateZone, number> = {
  "Dry Hot": 10,
  Intermediate: 8,
  "Wet Hot": 6,
};

export const VENTILATION_ROOM_LABELS: Record<VentRoomType, string> = {
  bedroom: "Bedroom",
  living: "Living room",
  kitchen: "Kitchen",
  bathroom: "Bathroom / WC",
  office: "Office",
  classroom: "Classroom",
};

/** ASHRAE 62.1 Table 6.2.2.1 planning defaults (L/s per person / per m2).
 *  Labelled as defaults to verify against the current standard. */
export const ASHRAE_RP_RA: Record<VentRoomType, { rp: number; ra: number }> = {
  bedroom: { rp: 2.5, ra: 0.3 },
  living: { rp: 2.5, ra: 0.3 },
  kitchen: { rp: 5, ra: 0.3 },
  bathroom: { rp: 5, ra: 0.3 },
  office: { rp: 2.5, ra: 0.3 },
  classroom: { rp: 5, ra: 0.6 },
};

export const STANDARD_FAN_SIZES_CFM = [50, 100, 150, 200, 250, 300, 400, 600];

/** ASHRAE 62.2 residential exhaust rates (intermittent, CFM): a kitchen or
 * bathroom exhaust fan is sized on the exhaust rate, NOT on whole-room air
 * changes. The old code sized the fan from volume × ACH (a 90 m³ kitchen
 * got a 600 CFM commercial-hood fan). Continuous rates are 25 CFM
 * (kitchen) / 20 CFM (bathroom); the intermittent rates below are the
 * default sizing basis. */
export const EXHAUST_FAN_CFM: Record<"kitchen" | "bathroom", number> = {
  kitchen: 100,
  bathroom: 50,
};

export const M3H_TO_CFM = 0.5886;
export const LS_TO_M3H = 3.6;
export const LS_TO_CFM = 2.119;

export interface VentilationInputs {
  roomType: VentRoomType;
  climateZone?: VentClimateZone;
  lengthM: number;
  widthM: number;
  heightM: number;
  occupants?: number;
  /** Total window (glazing) area, m2. */
  windowAreaM2?: number;
  /** Openable fraction of the window area, % (0-100). */
  openableFractionPct?: number;
  /** Existing mechanical airflow, m3/h (optional — for the actual-ACH check). */
  existingAirflowM3h?: number;
  /** Target ACH (overrides the room-type default). */
  targetAch?: number;
  /** Zone air-distribution effectiveness Ez (default 1.0). */
  ez?: number;
}

export interface VentilationResults {
  floorAreaM2: number;
  volumeM3: number;
  ratio: number;
  requiredGlazingM2: number;
  requiredOpenableM2: number;
  actualGlazingM2: number;
  actualOpenableM2: number;
  glazingPass: boolean;
  ventilationPass: boolean;
  glazingShortfallM2: number;
  targetAch: number;
  requiredAirflowM3h: number;
  requiredAirflowCfm: number;
  actualAch: number | null;
  minutesPerChange: number;
  ashraeVbzLs: number;
  ashraeVozM3h: number;
  ashraeVozCfm: number;
  exhaustFanCfm: number | null;
  recommendedWindows: number;
  windowSizeLabel: string;
  warnings: string[];
  steps: string[];
}

export function validateVentilationInputs(inp: VentilationInputs): string[] {
  const errors: string[] = [];
  for (const [name, v] of [["Length", inp.lengthM], ["Width", inp.widthM], ["Height", inp.heightM]] as const) {
    if (!isFinite(v) || v <= 0) errors.push(`${name} must be greater than 0.`);
  }
  if (inp.heightM < 2.4 || inp.heightM > 6)
    errors.push("Room height must be between 2.4 m and 6 m.");
  if (inp.lengthM * inp.widthM > 10000) errors.push("Floor area looks too large (max 10,000 m²).");
  if (inp.occupants != null && (!isFinite(inp.occupants) || inp.occupants < 0 || inp.occupants > 200))
    errors.push("Occupants must be between 0 and 200.");
  if (inp.openableFractionPct != null && (!isFinite(inp.openableFractionPct) || inp.openableFractionPct < 0 || inp.openableFractionPct > 100))
    errors.push("Openable fraction must be between 0% and 100%.");
  if (inp.windowAreaM2 != null && (!isFinite(inp.windowAreaM2) || inp.windowAreaM2 < 0))
    errors.push("Window area cannot be negative.");
  if (inp.existingAirflowM3h != null && (!isFinite(inp.existingAirflowM3h) || inp.existingAirflowM3h < 0))
    errors.push("Existing airflow cannot be negative.");
  if (inp.targetAch != null && (!isFinite(inp.targetAch) || inp.targetAch <= 0 || inp.targetAch > 30))
    errors.push("Target ACH must be between 0 and 30.");
  return errors;
}

export function calcVentilation(inp: VentilationInputs): VentilationResults {
  const errors = validateVentilationInputs(inp);
  if (errors.length > 0) throw new Error(errors.join(" "));
  const floorArea = inp.lengthM * inp.widthM;
  const volume = floorArea * inp.heightM;
  const climate = inp.climateZone ?? "Intermediate";
  const ratio = VENTILATION_RATIOS[climate];
  let requiredGlazing = floorArea / ratio;
  if (inp.roomType === "kitchen") requiredGlazing = Math.max(1.0, requiredGlazing);
  if (inp.roomType === "bathroom") requiredGlazing = Math.max(0.3, requiredGlazing);
  const requiredOpenable = requiredGlazing * 0.5;
  const actualGlazing = inp.windowAreaM2 ?? 0;
  const openablePct = inp.openableFractionPct ?? 50;
  const actualOpenable = actualGlazing * (openablePct / 100);
  const glazingPass = actualGlazing >= requiredGlazing;
  const ventilationPass = actualOpenable >= requiredOpenable;

  const targetAch = inp.targetAch ?? VENTILATION_ACH_TARGET[inp.roomType] ?? 4;
  const requiredAirflowM3h = volume * targetAch;
  const requiredAirflowCfm = requiredAirflowM3h * M3H_TO_CFM;
  const actualAch =
    inp.existingAirflowM3h != null ? inp.existingAirflowM3h / volume : null;
  const minutesPerChange = targetAch > 0 ? 60 / targetAch : 0;

  const { rp, ra } = ASHRAE_RP_RA[inp.roomType];
  const occupants = inp.occupants ?? 2;
  const vbz = rp * occupants + ra * floorArea;
  const ez = inp.ez ?? 1.0;
  const vozM3h = (vbz / ez) * LS_TO_M3H;
  const vozCfm = (vbz / ez) * LS_TO_CFM;

  const isExhaustRoom = inp.roomType === "kitchen" || inp.roomType === "bathroom";
  // Exhaust fan sized on the ASHRAE 62.2 exhaust rate for the room type
  // (kitchen 100 CFM / bathroom 50 CFM intermittent), rounded up to the
  // next standard size — NOT on the whole-room ACH airflow, which is a
  // ventilation rate, not an exhaust-fan size.
  const exhaustFanCfm = isExhaustRoom
    ? (STANDARD_FAN_SIZES_CFM.find((s) => s >= EXHAUST_FAN_CFM[inp.roomType as "kitchen" | "bathroom"]) ??
      STANDARD_FAN_SIZES_CFM[STANDARD_FAN_SIZES_CFM.length - 1])
    : null;
  // Recommended window schedule: 1.2 m x 1.5 m windows (1.8 m2 each).
  const recommendedWindows = Math.max(1, Math.ceil(requiredOpenable / 1.8));

  const warnings: string[] = [];
  if (actualAch != null && actualAch < targetAch)
    warnings.push(`Actual ACH (${actualAch.toFixed(1)}) is below the ${targetAch} ACH target for a ${VENTILATION_ROOM_LABELS[inp.roomType].toLowerCase()} — add mechanical ventilation or more openable area.`);
  warnings.push("ASHRAE 62.1 gives OUTDOOR air; the ACH method gives TOTAL supply air. They are different quantities — do not compare them directly.");

  return {
    floorAreaM2: floorArea,
    volumeM3: volume,
    ratio,
    requiredGlazingM2: requiredGlazing,
    requiredOpenableM2: requiredOpenable,
    actualGlazingM2: actualGlazing,
    actualOpenableM2: actualOpenable,
    glazingPass,
    ventilationPass,
    glazingShortfallM2: Math.max(0, requiredGlazing - actualGlazing),
    targetAch,
    requiredAirflowM3h,
    requiredAirflowCfm,
    actualAch,
    minutesPerChange,
    ashraeVbzLs: vbz,
    ashraeVozM3h: vozM3h,
    ashraeVozCfm: vozCfm,
    exhaustFanCfm,
    recommendedWindows,
    windowSizeLabel: `${recommendedWindows} window(s) of 1.2 m x 1.5 m (1.8 m² each)`,
    warnings,
    steps: [
      `Floor area = ${inp.lengthM} m x ${inp.widthM} m = ${floorArea.toFixed(1)} m²; volume = ${floorArea.toFixed(1)} x ${inp.heightM} m = ${volume.toFixed(1)} m³`,
      `Glazing: required = ${floorArea.toFixed(1)} / ${ratio} (1/${ratio}, ${climate}) = ${requiredGlazing.toFixed(2)} m²; required openable = 50% = ${requiredOpenable.toFixed(2)} m²`,
      `ACH: required airflow = ${volume.toFixed(1)} m³ x ${targetAch} ACH = ${requiredAirflowM3h.toFixed(0)} m³/h = ${requiredAirflowCfm.toFixed(0)} CFM; one air change every ${minutesPerChange.toFixed(0)} minutes`,
      `ASHRAE 62.1: Vbz = ${rp} x ${occupants} people + ${ra} x ${floorArea.toFixed(1)} m² = ${vbz.toFixed(1)} L/s; Voz = ${vbz.toFixed(1)} / Ez ${ez} = ${vozM3h.toFixed(1)} m³/h (${vozCfm.toFixed(0)} CFM) of OUTDOOR air`,
      ...(exhaustFanCfm != null
        ? [`Exhaust fan: ASHRAE 62.2 intermittent exhaust rate ${EXHAUST_FAN_CFM[inp.roomType as "kitchen" | "bathroom"]} CFM for a ${VENTILATION_ROOM_LABELS[inp.roomType].toLowerCase()} → next standard size ${exhaustFanCfm} CFM (sized on the exhaust rate, NOT on the whole-room ACH airflow of ${requiredAirflowCfm.toFixed(0)} CFM)`]
        : []),
    ],
  };
}
