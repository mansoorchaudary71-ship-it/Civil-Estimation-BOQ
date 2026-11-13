/**
 * Metal weight engine — pure functions.
 *
 * W = A * L * rho, with A in mm^2, L in m, rho in kg/m^3:
 * weight per metre = A/10^6 * rho. All profile areas below are the
 * verified rectangle / circle formulas from the G3 audit (spot-checked
 * against d^2/162.28 for rebar and the 0.02466 pipe shortcut).
 *
 * Rolled sections (I-beam / channel): the rectangle formula IGNORES
 * fillets and root radii, so it under-reads the true rolled weight.
 * The UI says so, and the standard-size picker gives the IS 808
 * tabulated kg/m instead — those three values are the ones named in the
 * G3 spec, labelled "approx. — confirm with the supplier", because no
 * IS 808 table was verified line-by-line for this build.
 */

import { unitWeightKgPerM, applyWastage, costFor } from "./steelCalc";

export type MetalProfile =
  | "round"
  | "square"
  | "pipe"
  | "hex"
  | "square-tube"
  | "rect-tube"
  | "tee"
  | "beam"
  | "channel"
  | "angle"
  | "flat"
  | "sheet"
  | "rebar";

export const METAL_PROFILES: { id: MetalProfile; label: string; short: string }[] = [
  { id: "round", label: "Round Bar", short: "Round" },
  { id: "square", label: "Square Bar", short: "Square" },
  { id: "pipe", label: "Round Pipe", short: "Pipe" },
  { id: "hex", label: "Hexagonal Bar", short: "Hex" },
  { id: "square-tube", label: "Square Tube", short: "Sq tube" },
  { id: "rect-tube", label: "Rectangular Tube (RHS)", short: "RHS" },
  { id: "tee", label: "Tee Bar", short: "Tee" },
  { id: "beam", label: "Beam (I / H)", short: "Beam" },
  { id: "channel", label: "Channel (C / U)", short: "Channel" },
  { id: "angle", label: "Angle (L)", short: "Angle" },
  { id: "flat", label: "Flat Bar", short: "Flat" },
  { id: "sheet", label: "Sheet / Plate", short: "Sheet" },
  { id: "rebar", label: "Rebar (d²/162.28)", short: "Rebar" },
];

/** Sensible defaults per profile (mm) — the tool must never load showing 0.00 kg. */
export const PROFILE_DEFAULTS: Record<MetalProfile, Record<string, number>> = {
  round: { d: 20 },
  square: { w: 50 },
  pipe: { d: 100, t: 5 },
  hex: { s: 30 },
  "square-tube": { w: 50, t: 3 },
  "rect-tube": { w: 100, h: 50, t: 4 },
  tee: { w: 40, h: 40, t: 5 },
  beam: { w: 150, h: 300, tf: 10, tw: 7 },
  channel: { w: 100, h: 50, tf: 8, tw: 5 },
  angle: { leg1: 50, leg2: 50, t: 6 },
  flat: { w: 100, t: 10 },
  sheet: { w: 1250, t: 10 },
  rebar: { d: 12 },
};

export const PROFILE_DIMS: Record<MetalProfile, { key: string; label: string }[]> = {
  round: [{ key: "d", label: "Diameter (mm)" }],
  square: [{ key: "w", label: "Side width (mm)" }],
  pipe: [
    { key: "d", label: "Outer dia OD (mm)" },
    { key: "t", label: "Wall thickness (mm)" },
  ],
  hex: [{ key: "s", label: "Size across flats (mm)" }],
  "square-tube": [
    { key: "w", label: "Outer width (mm)" },
    { key: "t", label: "Wall thickness (mm)" },
  ],
  "rect-tube": [
    { key: "w", label: "Width (mm)" },
    { key: "h", label: "Height (mm)" },
    { key: "t", label: "Wall thickness (mm)" },
  ],
  tee: [
    { key: "w", label: "Flange width (mm)" },
    { key: "h", label: "Total height (mm)" },
    { key: "t", label: "Thickness (mm)" },
  ],
  beam: [
    { key: "w", label: "Flange width (mm)" },
    { key: "h", label: "Depth / height (mm)" },
    { key: "tf", label: "Flange thickness (mm)" },
    { key: "tw", label: "Web thickness (mm)" },
  ],
  channel: [
    { key: "w", label: "Flange width (mm)" },
    { key: "h", label: "Depth / height (mm)" },
    { key: "tf", label: "Flange thickness (mm)" },
    { key: "tw", label: "Web thickness (mm)" },
  ],
  angle: [
    { key: "leg1", label: "Leg 1 (mm)" },
    { key: "leg2", label: "Leg 2 (mm)" },
    { key: "t", label: "Thickness (mm)" },
  ],
  flat: [
    { key: "w", label: "Width (mm)" },
    { key: "t", label: "Thickness (mm)" },
  ],
  sheet: [
    { key: "w", label: "Sheet width (mm)" },
    { key: "t", label: "Thickness (mm)" },
  ],
  rebar: [{ key: "d", label: "Bar dia (mm)" }],
};

export interface Material {
  id: string;
  label: string;
  density: number;
}

export const MATERIALS: Material[] = [
  { id: "mild-steel", label: "Mild steel", density: 7850 },
  { id: "ss304", label: "Stainless steel 304", density: 8000 },
  { id: "ss316", label: "Stainless steel 316", density: 8000 },
  { id: "aluminium", label: "Aluminium", density: 2700 },
  { id: "copper", label: "Copper", density: 8960 },
  { id: "brass", label: "Brass", density: 8500 },
  { id: "custom", label: "Custom density…", density: 7850 },
];

/**
 * IS 808 tabulated weights (kg/m) for the three sections named in the
 * G3 spec. Labelled "approx." in the UI — confirm with the supplier
 * before pricing, and use these in preference to the rectangle maths
 * for rolled sections (which ignores fillets).
 */
export const STANDARD_SECTIONS: { id: string; label: string; profile: MetalProfile; dims: Record<string, number>; kgPerM: number }[] = [
  { id: "ismb200", label: "ISMB 200 — 25.4 kg/m (approx.)", profile: "beam", dims: { w: 140, h: 200, tf: 9.3, tw: 6.1 }, kgPerM: 25.4 },
  { id: "ismc100", label: "ISMC 100 — 9.56 kg/m (approx.)", profile: "channel", dims: { w: 50, h: 100, tf: 7.5, tw: 4.6 }, kgPerM: 9.56 },
  { id: "isa50506", label: "ISA 50×50×6 — 4.5 kg/m (approx.)", profile: "angle", dims: { leg1: 50, leg2: 50, t: 6 }, kgPerM: 4.5 },
];

export interface MetalInputs {
  profile: MetalProfile;
  dims: Record<string, number>;
  density: number;
  pieceLengthM: number;
  qty: number;
  wastagePct: number;
  ratePerKg: number | null;
  /** tabulated kg/m override (standard-size picker); null = use area maths */
  tabulatedKgPerM?: number | null;
}

export interface MetalResults {
  areaMm2: number;
  weightPerM: number;
  weightPerPieceKg: number;
  totalKg: number;
  orderKg: number;
  tonnes: number;
  cost: number | null;
  costComplete: boolean;
  /** sheet / plate only: area of one sheet in m^2 */
  sheetAreaM2: number | null;
  /** plate weight per m^2, kg/m^2 (flat/sheet only) */
  plateKgPerM2: number | null;
  /** weight in lb/ft alongside kg/m */
  weightLbPerFt: number;
  formula: string;
  note: string | null;
}

const round2 = (n: number) => Math.round(n * 100) / 100;
const round3 = (n: number) => Math.round(n * 1000) / 1000;
const KG_PER_M_TO_LB_PER_FT = 0.6719689;

/** Cross-sectional area in mm^2 for a profile, or 0 when dims are invalid. */
export function profileAreaMm2(profile: MetalProfile, d: Record<string, number>): number {
  const v = (k: string) => d[k] ?? 0;
  switch (profile) {
    case "round":
      return (Math.PI * v("d") * v("d")) / 4;
    case "square":
      return v("w") * v("w");
    case "pipe": {
      const id = v("d") - 2 * v("t");
      return id > 0 ? (Math.PI / 4) * (v("d") * v("d") - id * id) : 0;
    }
    case "hex":
      return (Math.sqrt(3) / 2) * v("s") * v("s");
    case "square-tube": {
      const inner = v("w") - 2 * v("t");
      return inner > 0 ? v("w") * v("w") - inner * inner : 0;
    }
    case "rect-tube":
      return 2 * v("t") * (v("w") + v("h") - 2 * v("t"));
    case "tee":
      return v("w") * v("t") + (v("h") - v("t")) * v("t");
    case "beam":
    case "channel":
      return 2 * (v("w") * v("tf")) + (v("h") - 2 * v("tf")) * v("tw");
    case "angle":
      return v("leg1") * v("t") + (v("leg2") - v("t")) * v("t");
    case "flat":
    case "sheet":
      return v("w") * v("t");
    case "rebar":
      return (Math.PI * v("d") * v("d")) / 4;
  }
}

export function profileFormula(profile: MetalProfile, d: Record<string, number>): string {
  const v = (k: string) => d[k] ?? 0;
  switch (profile) {
    case "round":
      return `A = π×${v("d")}²/4 = ${round2(profileAreaMm2(profile, d))} mm²`;
    case "square":
      return `A = ${v("w")}² = ${round2(profileAreaMm2(profile, d))} mm²`;
    case "pipe":
      return `ID = ${v("d")} − 2×${v("t")} = ${v("d") - 2 * v("t")} mm; A = π/4×(OD² − ID²) = ${round2(profileAreaMm2(profile, d))} mm² — shortcut (OD−t)×t×0.02466 = ${round3((v("d") - v("t")) * v("t") * 0.02466)} kg/m`;
    case "hex":
      return `A = (√3/2)×${v("s")}² = ${round2(profileAreaMm2(profile, d))} mm²`;
    case "square-tube":
      return `A = ${v("w")}² − (${v("w")}−2×${v("t")})² = ${round2(profileAreaMm2(profile, d))} mm²`;
    case "rect-tube":
      return `A = 2×${v("t")}×(${v("w")}+${v("h")}−2×${v("t")}) = ${round2(profileAreaMm2(profile, d))} mm²`;
    case "tee":
      return `A = ${v("w")}×${v("t")} + (${v("h")}−${v("t")})×${v("t")} = ${round2(profileAreaMm2(profile, d))} mm²`;
    case "beam":
    case "channel":
      return `A = 2×(${v("w")}×${v("tf")}) + (${v("h")}−2×${v("tf")})×${v("tw")} = ${round2(profileAreaMm2(profile, d))} mm² (rectangle approximation — ignores fillets)`;
    case "angle":
      return `A = (${v("leg1")}+${v("leg2")}−${v("t")})×${v("t")} = ${round2(profileAreaMm2(profile, d))} mm²`;
    case "flat":
    case "sheet":
      return `A = ${v("w")}×${v("t")} = ${round2(profileAreaMm2(profile, d))} mm²; plate ${v("t")} mm = ${(v("t") * 7.85).toFixed(2)} kg/m²`;
    case "rebar":
      return `W = d²/162.28 = ${v("d")}²/162.28 = ${round3(unitWeightKgPerM(v("d")))} kg/m`;
  }
}

export function validateMetal(inp: Partial<MetalInputs>): string[] {
  const errors: string[] = [];
  if (!inp.profile) errors.push("Choose a profile.");
  const dims = inp.dims ?? {};
  const req = (k: string, label: string, min: number, max: number) => {
    const v = dims[k];
    if (v == null || !isFinite(v) || v <= 0) errors.push(`${label} is required and must be greater than 0.`);
    else if (v < min || v > max) errors.push(`${label} must be ${min}–${max} mm.`);
  };
  for (const dim of PROFILE_DIMS[inp.profile ?? "round"] ?? []) req(dim.key, dim.label, 1, 5000);
  if (inp.profile === "pipe" && dims.d != null && dims.t != null && dims.t >= dims.d / 2)
    errors.push("Wall thickness must be less than half the outer dia — check the dimensions.");
  if ((inp.profile === "square-tube" || inp.profile === "rect-tube") && dims.t != null && dims.w != null && dims.t >= dims.w / 2)
    errors.push("Wall thickness must be less than half the width — check the dimensions.");
  if ((inp.profile === "beam" || inp.profile === "channel") && dims.tf != null && dims.h != null && dims.tf >= dims.h / 2)
    errors.push("Flange thickness must be less than half the depth — check the dimensions.");
  if ((inp.profile === "beam" || inp.profile === "channel") && dims.tw != null && dims.w != null && dims.tw >= dims.w)
    errors.push("Web thickness must be less than the flange width — check the dimensions.");
  if (inp.pieceLengthM == null || !isFinite(inp.pieceLengthM) || inp.pieceLengthM < 0.1 || inp.pieceLengthM > 12.5)
    errors.push("Piece length must be 0.1–12.5 m.");
  if (inp.qty == null || !Number.isInteger(inp.qty) || inp.qty < 1 || inp.qty > 10000)
    errors.push("Quantity must be a whole number, 1–10,000.");
  if (inp.density != null && (!isFinite(inp.density) || inp.density < 1000 || inp.density > 20000))
    errors.push("Density must be 1,000–20,000 kg/m³.");
  if (inp.wastagePct != null && (!isFinite(inp.wastagePct) || inp.wastagePct < 0 || inp.wastagePct > 15))
    errors.push("Wastage must be 0–15%.");
  return errors;
}

export function calcMetalWeight(inp: MetalInputs): MetalResults {
  const areaMm2 = profileAreaMm2(inp.profile, inp.dims);
  const weightPerM =
    inp.tabulatedKgPerM != null
      ? inp.tabulatedKgPerM
      : inp.profile === "rebar"
        ? unitWeightKgPerM(inp.dims.d ?? 0)
        : (areaMm2 / 1_000_000) * inp.density;
  const weightPerPieceKg = round2(weightPerM * inp.pieceLengthM);
  const totalKg = round2(weightPerPieceKg * inp.qty);
  const orderKg = round2(applyWastage(totalKg, inp.wastagePct));
  const sheetAreaM2 = inp.profile === "sheet" ? round2(((inp.dims.w ?? 0) / 1000) * inp.pieceLengthM) : null;
  const plateKgPerM2 =
    inp.profile === "flat" || inp.profile === "sheet" ? round2(((inp.dims.t ?? 0) * inp.density) / 1000) : null;
  const note =
    inp.profile === "beam" || inp.profile === "channel"
      ? inp.tabulatedKgPerM != null
        ? "Using the IS 808 tabulated kg/m (approx. — confirm with the supplier), not the rectangle maths below."
        : "Rectangle approximation — ignores fillets and root radii. For priced work use the IS 808 tabulated kg/m from the standard-size picker."
      : inp.pieceLengthM > 12
        ? "Piece length is over 12 m stock — it will need a joint / lap."
        : null;
  return {
    areaMm2: round2(areaMm2),
    weightPerM: round3(weightPerM),
    weightPerPieceKg,
    totalKg,
    orderKg,
    tonnes: orderKg / 1000,
    cost: costFor(orderKg, inp.ratePerKg),
    costComplete: inp.ratePerKg != null,
    sheetAreaM2,
    plateKgPerM2,
    weightLbPerFt: round3(weightPerM * KG_PER_M_TO_LB_PER_FT),
    formula: profileFormula(inp.profile, inp.dims),
    note,
  };
}

export interface FaqItem {
  q: string;
  a: string;
}

export const METAL_FAQS: FaqItem[] = [
  {
    q: "How is metal weight calculated?",
    a: "Weight = cross-sectional area × length × density. Find the area A in mm² from the profile formula, convert to m² (÷ 1,000,000), multiply by the density (7,850 kg/m³ for mild steel) to get kg per metre, then multiply by the piece length and the quantity. A Ø20 round bar has A = π×20²/4 = 314.16 mm², so it weighs 314.16 ÷ 1,000,000 × 7,850 = 2.465 kg/m.",
  },
  {
    q: "What is the steel pipe weight formula?",
    a: "Pipe weight is (OD − wall thickness) × wall thickness × 0.02466 kg/m, with OD and thickness in millimetres. A Ø100 × 5 mm pipe is (100 − 5) × 5 × 0.02466 = 11.71 kg/m. The same result comes from the area formula π/4 × (OD² − ID²) × density — the shortcut is just that formula with the density of steel already folded in.",
  },
  {
    q: "How heavy is a 10 mm steel plate per square metre?",
    a: "One millimetre of steel plate weighs 7.85 kg/m², so a 10 mm plate weighs 78.5 kg/m². A standard 2.5 × 1.25 m sheet (3.125 m²) of 10 mm plate therefore weighs 3.125 × 78.5 = 245.31 kg. Multiply the thickness in millimetres by 7.85 for any plate thickness.",
  },
  {
    q: "What is the d²/162 formula?",
    a: "The weight of one metre of rebar is d² ÷ 162.28 kg/m, where d is the bar diameter in millimetres. A 12 mm bar weighs 0.887 kg/m, a 16 mm bar 1.578 kg/m and a 20 mm bar 2.465 kg/m. A 12 m stock bar of 12 mm steel weighs about 10.65 kg, and a 40 ft (12.192 m) bar about 10.82 kg.",
  },
  {
    q: "How much does a 12 m bar weigh?",
    a: "Multiply the kg/m by 12: Ø8 is 4.73 kg, Ø10 is 7.40 kg, Ø12 is 10.65 kg, Ø16 is 18.94 kg, Ø20 is 29.58 kg, Ø25 is 46.21 kg and Ø32 is 75.72 kg per 12 m bar. The rebar table on this page lists every size, plus the 40 ft equivalent.",
  },
  {
    q: "Which density should I use for stainless steel or aluminium?",
    a: "Mild steel 7,850 kg/m³, stainless steel 304 and 316 both 8,000 kg/m³, aluminium 2,700 kg/m³, copper 8,960 kg/m³ and brass 8,500 kg/m³. Pick the material and the density is set for you; pick Custom to enter your own density (for example 7,750 kg/m³ for some alloy steels).",
  },
  {
    q: "Why do rolled sections differ from the rectangle maths?",
    a: "An I-beam or channel is not three rectangles — it has fillets and root radii where the flange meets the web, and the flanges taper. The rectangle formula ignores that steel, so it under-reads the true weight. For priced work always use the IS 808 tabulated kg/m for the section (the standard-size picker on this page), and treat the rectangle value as an estimate only.",
  },
  {
    q: "How do I price the total?",
    a: "Total cost = ordered weight × rate per kg, where ordered weight is the net weight plus wastage (5% default). The default rate is Rs 270/kg for Pakistan (indicative November 2026 — confirm with your dealer). Rates for India, the UAE and USD are left blank because no verified rate was available; enter your dealer's rate and the cost appears.",
  },
];
