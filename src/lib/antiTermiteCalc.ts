/**
 * antiTermiteCalc.ts — anti-termite treatment quantities per IS 6313-2:2022.
 * Pure functions; doses imported from mepConstants.ts (single source).
 *
 * SAFETY-CRITICAL: the old tool used trench = perimeter x depth x 7.5
 * (per m2 of wall area). IS 6313-2:2022 prescribes 7.5 L PER LINEAR
 * METRE of trench (sides, to 30 cm depth). At the defaults the old
 * formula gave 150 L where the correct dose is 300 L — a 50% under-dose.
 * That formula must never be re-introduced.
 *
 * Stages (litres of diluted emulsion):
 *  (1) trench bottom: trenchLength x trenchWidth x 5 L/m2
 *  (2) trench sides:  trenchLength x 7.5 L per linear metre
 *  (3) floor / plinth soil: floorArea x 5 L/m2
 *  (4) external periphery apron (optional): perimeter x 7.5 L/m
 *  (5) RCC vertical surfaces in contact with soil (optional): area x 7.5 L/m2
 */
import {
  ANTITERMITE_FLOOR_L_PER_M2,
  ANTITERMITE_TRENCH_BOTTOM_L_PER_M2,
  ANTITERMITE_TRENCH_L_PER_LINEAR_M,
} from "./mepConstants";

export interface AntiTermiteChemical {
  id: string;
  name: string;
  /** Water parts in the 1:X dilution (e.g. 19 for 1:19). */
  waterParts: number;
  note: string;
}

/**
 * Chemical table. Chlorpyrifos is listed for completeness with a
 * regulatory warning — it is NOT the default recommendation.
 * Registration status in Punjab, Pakistan is UNVERIFIED: use only a
 * product registered for soil treatment in your province/state and
 * follow its label. Default chemical is Bifenthrin.
 */
export const ANTITERMITE_CHEMICALS: AntiTermiteChemical[] = [
  {
    id: "bifenthrin",
    name: "Bifenthrin 2.5% EC",
    waterParts: 19,
    note: "Common soil-treatment termiticide. Check local registration and follow the label.",
  },
  {
    id: "chlorpyrifos",
    name: "Chlorpyrifos 20% EC",
    waterParts: 19,
    note: "REGULATORY WARNING: Chlorpyrifos is restricted or banned in several jurisdictions. Its registration status for soil treatment in Punjab, Pakistan is unverified — do NOT use it as a default. Use only a product registered for soil treatment in your province/state and follow its label.",
  },
  {
    id: "imidacloprid",
    name: "Imidacloprid 30.5% SC",
    waterParts: 475,
    note: "Label dose about 2.1 mL/L (1:475). Check local registration and follow the label.",
  },
  { id: "custom", name: "Custom mix", waterParts: 19, note: "Enter the dilution from the product label." },
];

export interface AntiTermiteInputs {
  floorAreaM2: number;
  /** Trench / perimeter length in metres. */
  trenchLengthM: number;
  /** Trench bottom width in metres (default 0.6). */
  trenchWidthM?: number;
  /** Trench depth in metres — informational only: the IS 6313 sides
   *  dose is per linear metre to 30 cm depth and does NOT increase
   *  with depth beyond that. */
  trenchDepthM?: number;
  /** Include the external-periphery apron stage (default off — it can
   *  overlap stage 2 on some sites). */
  includeExternalPeriphery?: boolean;
  /** Vertical RCC area in contact with soil, m2 (default 0). */
  verticalAreaM2?: number;
  chemical: AntiTermiteChemical;
  /** Custom water parts when chemical.id === "custom". */
  customWaterParts?: number;
  /** Wastage / spillage allowance, % (default 5). */
  wastagePct?: number;
  /** Pack size the concentrate is sold in, litres (default 5). */
  packSizeL?: number;
  /** Price per litre of concentrate in the chosen currency (null = no cost). */
  ratePerLitreConcentrate?: number | null;
  /** Labour rate per m2 of floor area (null = no labour cost). */
  labourPerM2?: number | null;
  /** Spraying equipment lump sum (default 0). */
  equipmentLumpSum?: number;
}

export interface AntiTermiteResults {
  trenchBottomL: number;
  trenchSidesL: number;
  floorL: number;
  externalPeripheryL: number;
  verticalL: number;
  subtotalL: number;
  wastageL: number;
  /** Total diluted emulsion to prepare, litres. */
  totalEmulsionL: number;
  waterParts: number;
  concentrateL: number;
  waterL: number;
  packs: number;
  packsVolumeL: number;
  /** Total cost in the chosen currency (null when no rates given). */
  totalCost: number | null;
  chemicalCost: number | null;
  labourCost: number | null;
  warnings: string[];
  steps: string[];
}

export function validateAntiTermiteInputs(inp: AntiTermiteInputs): string[] {
  const errors: string[] = [];
  if (!isFinite(inp.floorAreaM2) || inp.floorAreaM2 <= 0)
    errors.push("Floor area must be greater than 0.");
  if (inp.floorAreaM2 > 100000) errors.push("Floor area looks too large (max 100,000 m²).");
  if (!isFinite(inp.trenchLengthM) || inp.trenchLengthM <= 0)
    errors.push("Trench / perimeter length must be greater than 0.");
  const w = inp.trenchWidthM ?? 0.6;
  if (!isFinite(w) || w < 0.3 || w > 1.0)
    errors.push("Trench width must be between 0.3 m and 1.0 m.");
  const wp = inp.chemical.id === "custom" ? (inp.customWaterParts ?? inp.chemical.waterParts) : inp.chemical.waterParts;
  if (!isFinite(wp) || wp <= 0) errors.push("Dilution water parts (1:X) must be greater than 0.");
  if (inp.wastagePct != null && (!isFinite(inp.wastagePct) || inp.wastagePct < 0 || inp.wastagePct > 50))
    errors.push("Wastage must be between 0% and 50%.");
  if (inp.packSizeL != null && (!isFinite(inp.packSizeL) || inp.packSizeL <= 0))
    errors.push("Pack size must be greater than 0.");
  return errors;
}

export function calcAntiTermite(inp: AntiTermiteInputs): AntiTermiteResults {
  const errors = validateAntiTermiteInputs(inp);
  if (errors.length > 0) throw new Error(errors.join(" "));
  const trenchWidthM = inp.trenchWidthM ?? 0.6;
  const trenchDepthM = inp.trenchDepthM ?? 0.5;
  const wastagePct = inp.wastagePct ?? 5;
  const packSizeL = inp.packSizeL ?? 5;
  const waterParts =
    inp.chemical.id === "custom"
      ? (inp.customWaterParts ?? inp.chemical.waterParts)
      : inp.chemical.waterParts;

  const trenchBottomL = inp.trenchLengthM * trenchWidthM * ANTITERMITE_TRENCH_BOTTOM_L_PER_M2;
  const trenchSidesL = inp.trenchLengthM * ANTITERMITE_TRENCH_L_PER_LINEAR_M;
  const floorL = inp.floorAreaM2 * ANTITERMITE_FLOOR_L_PER_M2;
  const externalPeripheryL = inp.includeExternalPeriphery
    ? inp.trenchLengthM * ANTITERMITE_TRENCH_L_PER_LINEAR_M
    : 0;
  const verticalL = (inp.verticalAreaM2 ?? 0) * 7.5;
  const subtotalL = trenchBottomL + trenchSidesL + floorL + externalPeripheryL + verticalL;
  const wastageL = (subtotalL * wastagePct) / 100;
  const totalEmulsionL = subtotalL + wastageL;
  const concentrateL = totalEmulsionL / (1 + waterParts);
  const waterL = totalEmulsionL - concentrateL;
  const packs = Math.ceil(concentrateL / packSizeL);
  const packsVolumeL = packs * packSizeL;

  const chemicalCost =
    inp.ratePerLitreConcentrate != null ? packsVolumeL * inp.ratePerLitreConcentrate : null;
  const labourCost =
    inp.labourPerM2 != null ? inp.floorAreaM2 * inp.labourPerM2 : null;
  const equipment = inp.equipmentLumpSum ?? 0;
  const totalCost =
    chemicalCost != null || labourCost != null || equipment > 0
      ? (chemicalCost ?? 0) + (labourCost ?? 0) + equipment
      : null;

  const warnings: string[] = [];
  if (trenchDepthM > 0.3)
    warnings.push(
      "Trench depth entered is over 0.3 m. The IS 6313 sides dose is 7.5 L per linear metre to 30 cm depth — depth beyond that does not increase the chemical quantity.",
    );
  if (inp.chemical.id === "chlorpyrifos")
    warnings.push(
      "Chlorpyrifos is restricted or banned in several jurisdictions and its registration status for soil treatment in Punjab, Pakistan is unverified. Do not use it as a default — use only a product registered for soil treatment in your province/state and follow its label.",
    );
  warnings.push(
    "This calculator does not recommend a chemical. Always check the product label and local registration before buying or applying any termiticide.",
  );

  return {
    trenchBottomL,
    trenchSidesL,
    floorL,
    externalPeripheryL,
    verticalL,
    subtotalL,
    wastageL,
    totalEmulsionL,
    waterParts,
    concentrateL,
    waterL,
    packs,
    packsVolumeL,
    totalCost,
    chemicalCost,
    labourCost,
    warnings,
    steps: [
      `Trench bottom: ${inp.trenchLengthM} m x ${trenchWidthM} m x 5 L/m² = ${trenchBottomL.toFixed(1)} L`,
      `Trench sides: ${inp.trenchLengthM} m x 7.5 L per linear metre = ${trenchSidesL.toFixed(1)} L (IS 6313-2:2022 — NOT perimeter x depth x 7.5)`,
      `Floor / plinth soil: ${inp.floorAreaM2} m² x 5 L/m² = ${floorL.toFixed(1)} L`,
      ...(inp.includeExternalPeriphery
        ? [`External periphery apron: ${inp.trenchLengthM} m x 7.5 L/m = ${externalPeripheryL.toFixed(1)} L`]
        : []),
      ...(verticalL > 0 ? [`RCC vertical surfaces: ${(inp.verticalAreaM2 ?? 0)} m² x 7.5 L/m² = ${verticalL.toFixed(1)} L`] : []),
      `Subtotal = ${subtotalL.toFixed(1)} L; +${wastagePct}% wastage (${wastageL.toFixed(1)} L) = ${totalEmulsionL.toFixed(1)} L emulsion`,
      `Concentrate (1:${waterParts}) = ${totalEmulsionL.toFixed(1)} / ${1 + waterParts} = ${concentrateL.toFixed(1)} L; water = ${waterL.toFixed(1)} L`,
      `Packs: ${concentrateL.toFixed(1)} L / ${packSizeL} L = ${packs} packs (${packsVolumeL} L)`,
    ],
  };
}
