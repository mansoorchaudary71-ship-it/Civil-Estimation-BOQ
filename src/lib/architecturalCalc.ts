/**
 * Architectural calculators engine — pure functions, no React, no fetch.
 * One shared engine for the building-setback, FAR/FSI and roof-pitch tools,
 * following the brickCalc.ts precedent (metric internally, countable items
 * rounded UP).
 *
 * Scope note (repo AGENTS.md): the concrete dry-volume x1.54, mortar x1.33,
 * steel d^2/162.28, stirrup/footing/effective-depth rules do NOT apply here
 * — these three tools have no concrete/steel quantities. The AGENTS.md
 * liability disclaimer DOES apply and is exported below for every results
 * panel.
 *
 * Regulation values (LDA 2019 / India Model Bye-Laws 2016 / Dubai DBC) are
 * SECONDARY: no primary regulation text was verified for the LDA setback
 * table, the LDA coverage/FAR/height/storey table is a secondary blog
 * summary, the India bands are secondary example bands, and Dubai has no
 * DM-wide residential table (the AE figures are one Al Barari community
 * example only). Every preset carries `verified: false` and a `source`
 * string; the UI must show a "verify with your authority" badge on them.
 * Values that could not be sourced are `null` — never invented. A preset
 * with a null setback leaves the field blank for the user to fill from
 * their own authority's figures.
 *
 * Roof material rates: no Pakistan/India/UAE shingle, felt or ridge-cap
 * price was found, so all roof rates are null (user enters) — never invented.
 */

import { CURRENCY_META, type Currency } from "./brickCalc";
import type { Region } from "./rates";

export type { Region } from "./rates";
export type { Currency };
export { CURRENCY_META };

// ---------------------------------------------------------------- units ---
export const FT_TO_M = 0.3048;
export const M2_PER_SQFT = 0.092903;
export const SQFT_PER_M2 = 1 / M2_PER_SQFT;
export const MARLA_M2 = 20.903; // 225 sq ft
export const KANAL_M2 = 418.06; // 20 marla = 4,500 sq ft
export const MARLA_SQFT = 225;
export const KANAL_SQFT = 4500;

export const SQFT_PER_SQUARE = 100; // 1 roofing square = 100 sq ft
export const M2_PER_SQUARE = SQFT_PER_SQUARE * M2_PER_SQFT; // 9.2903 m²
export const BUNDLES_PER_SQUARE = 3; // composition shingles, ~33 ft²/bundle
export const FELT15_M2_PER_ROLL = 40.13; // 36" x 144 ft ≈ 432 ft²/roll
export const FELT30_M2_PER_ROLL = 20.07; // 36" x 72 ft ≈ 216 ft²/roll
export const RIDGE_M_PER_BUNDLE = 9.14; // ≈ 30 ft of ridge per bundle (indicative)
export const DRIP_EDGE_M_PER_PIECE = 3.05; // 10 ft lengths
export const DEFAULT_FLOOR_HEIGHT_M = 3.05; // 10 ft floor-to-floor

export const ARCHITECTURAL_DISCLAIMER =
  "Disclaimer: This estimate is algorithmically generated based on benchmark rates and standard assumptions. It should not be used as a substitute for a professional BOQ certified by a licensed structural engineer or quantity surveyor.";
export const PLANNING_NOTE =
  "Setbacks, coverage and FAR are planning controls — confirm with LDA / your local authority before building; this tool is not a building permission.";

// ------------------------------------------------------------- validation ---
export function validatePositive(value: number, label: string): string | null {
  if (value == null || typeof value !== "number" || !isFinite(value)) {
    return `${label} must be a number.`;
  }
  if (value <= 0) return `${label} must be greater than 0.`;
  return null;
}

function isFiniteNumber(v: unknown): v is number {
  return typeof v === "number" && isFinite(v);
}

// -------------------------------------------------------------- formatting --
export function formatLength(m: number, unit: "m" | "ft" | "ft-in"): string {
  if (!isFinite(m)) return "—";
  if (unit === "m") return `${m.toFixed(2)} m`;
  const ft = m / FT_TO_M;
  if (unit === "ft") return `${ft.toFixed(2)} ft`;
  const feet = Math.floor(ft);
  const inches = (ft - feet) * 12;
  return `${feet}' ${inches.toFixed(1)}"`;
}

export type AreaUnit = "m2" | "sqft" | "marla" | "kanal";
export function convertAreaM2(m2: number, unit: AreaUnit): number {
  switch (unit) {
    case "sqft":
      return m2 * SQFT_PER_M2;
    case "marla":
      return m2 / MARLA_M2;
    case "kanal":
      return m2 / KANAL_M2;
    default:
      return m2;
  }
}
export function areaUnitLabel(unit: AreaUnit): string {
  switch (unit) {
    case "sqft":
      return "sq ft";
    case "marla":
      return "marla";
    case "kanal":
      return "kanal";
    default:
      return "m²";
  }
}

// --------------------------------------------------------------- presets ----
export interface RegionPreset {
  id: string;
  region: Region;
  label: string;
  plotBand: string;
  /** plot-area band in m² (null = open-ended) */
  minPlotM2: number | null;
  maxPlotM2: number | null;
  /** setbacks in metres; null = not sourced — user must enter their own */
  frontM: number | null;
  rearM: number | null;
  sideM: number | null;
  /** true = side setback on both sides; false = one side only */
  sideBoth: boolean;
  /** extra setback on the road-facing side of a corner plot; null = unsourced */
  cornerExtraM: number | null;
  maxCoveragePct: number | null;
  maxFar: number | null;
  maxStoreys: number | null;
  maxHeightM: number | null;
  source: string;
  /** false = SECONDARY/unverified — UI must show a "verify" badge */
  verified: boolean;
  note?: string;
}

const LDA_SOURCE =
  "LDA 2019 — secondary blog summary; verify against the regulation text before launch. Setback feet are society-practice figures; no verified LDA setback table was found.";
const MBBL_SOURCE =
  "India Model Building Bye-Laws 2016 — secondary example bands; state/city bye-laws override. No setback table sourced.";
const DBC_SOURCE =
  "Dubai DBC (Executive Council Decree 45 of 2021) — Al Barari community example only; no DM-wide residential FAR/coverage/setback table exists. Values are plot-specific via Affection Plan + master-developer PDCRs.";

const FT = FT_TO_M; // 1 ft in m, for readability in the preset table

function generalPlanningGuide(region: Region): RegionPreset {
  return {
    id: "general-planning",
    region,
    label: "General planning guide",
    plotBand: "Any plot",
    minPlotM2: null,
    maxPlotM2: null,
    frontM: 3.0,
    rearM: 2.0,
    sideM: 1.5,
    sideBoth: true,
    cornerExtraM: null,
    maxCoveragePct: null,
    maxFar: null,
    maxStoreys: null,
    maxHeightM: null,
    source:
      "General planning guide — not a bye-law. Confirm setbacks with your local authority before building.",
    verified: false,
    note: "Starting values only. Pick an LDA / MBBL / DBC preset for sourced limits, or enter your authority's figures.",
  };
}

const PK_PRESETS: Omit<RegionPreset, "region">[] = [
  {
    id: "pk-lda-lt5marla",
    label: "LDA Lahore — under 5 marla",
    plotBand: "< 5 marla",
    minPlotM2: null,
    maxPlotM2: 5 * MARLA_M2,
    frontM: 5 * FT,
    rearM: 5 * FT,
    sideM: 0,
    sideBoth: false,
    cornerExtraM: null,
    maxCoveragePct: 80,
    maxFar: 2.4,
    maxStoreys: 3,
    maxHeightM: 38 * FT,
    source: LDA_SOURCE,
    verified: false,
    note: "5 ft front / 5 ft rear / no side setback (continuous building).",
  },
  {
    id: "pk-lda-5marla",
    label: "LDA Lahore — 5 marla to under 10 marla",
    plotBand: "5 marla – < 10 marla",
    minPlotM2: 5 * MARLA_M2,
    maxPlotM2: 10 * MARLA_M2,
    frontM: null,
    rearM: null,
    sideM: null,
    sideBoth: false,
    cornerExtraM: null,
    maxCoveragePct: 75,
    maxFar: 2.3,
    maxStoreys: 3,
    maxHeightM: 38 * FT,
    source: LDA_SOURCE,
    verified: false,
    note: "No sourced setback figures for this band — enter your authority's figures.",
  },
  {
    id: "pk-lda-10marla",
    label: "LDA Lahore — 10 marla to under 1 kanal",
    plotBand: "10 marla – < 1 kanal",
    minPlotM2: 10 * MARLA_M2,
    maxPlotM2: 20 * MARLA_M2,
    frontM: 10 * FT,
    rearM: 7 * FT,
    sideM: 5 * FT,
    sideBoth: false,
    cornerExtraM: null,
    maxCoveragePct: 70,
    maxFar: 2.8,
    maxStoreys: 4,
    maxHeightM: 45 * FT,
    source: LDA_SOURCE,
    verified: false,
    note: "10 ft front / 7 ft rear / 5 ft on one side.",
  },
  {
    id: "pk-lda-1kanal",
    label: "LDA Lahore — 1 kanal to 30 marla",
    plotBand: "1 kanal – 30 marla",
    minPlotM2: 20 * MARLA_M2,
    maxPlotM2: 30 * MARLA_M2,
    frontM: null,
    rearM: null,
    sideM: 5 * FT,
    sideBoth: true,
    cornerExtraM: null,
    maxCoveragePct: 65,
    maxFar: 2.6,
    maxStoreys: 4,
    maxHeightM: 45 * FT,
    source: LDA_SOURCE,
    verified: false,
    note: "5 ft on each side for 1 kanal and above. Front/rear not sourced — enter your authority's figures.",
  },
  {
    id: "pk-lda-30marla",
    label: "LDA Lahore — over 30 marla to under 2 kanal",
    plotBand: "> 30 marla – < 2 kanal",
    minPlotM2: 30 * MARLA_M2,
    maxPlotM2: 40 * MARLA_M2,
    frontM: null,
    rearM: null,
    sideM: 5 * FT,
    sideBoth: true,
    cornerExtraM: null,
    maxCoveragePct: 60,
    maxFar: 2.4,
    maxStoreys: 4,
    maxHeightM: 45 * FT,
    source: LDA_SOURCE,
    verified: false,
    note: "5 ft on each side. Front/rear not sourced — enter your authority's figures.",
  },
  {
    id: "pk-lda-2kanal",
    label: "LDA Lahore — 2 kanal and above",
    plotBand: "2 kanal +",
    minPlotM2: 40 * MARLA_M2,
    maxPlotM2: null,
    frontM: null,
    rearM: null,
    sideM: 5 * FT,
    sideBoth: true,
    cornerExtraM: null,
    maxCoveragePct: 55,
    maxFar: 2.2,
    maxStoreys: 4,
    maxHeightM: 45 * FT,
    source: LDA_SOURCE,
    verified: false,
    note: "5 ft on each side. Front/rear not sourced — enter your authority's figures.",
  },
];

const IN_PRESETS: Omit<RegionPreset, "region">[] = [
  {
    id: "in-mbbl-360",
    label: "MBBL 2016 — up to 360 m²",
    plotBand: "≤ 360 m²",
    minPlotM2: null,
    maxPlotM2: 360,
    frontM: null,
    rearM: null,
    sideM: null,
    sideBoth: true,
    cornerExtraM: null,
    maxCoveragePct: 75,
    maxFar: 1.75,
    maxStoreys: null,
    maxHeightM: null,
    source: MBBL_SOURCE,
    verified: false,
  },
  {
    id: "in-mbbl-1000",
    label: "MBBL 2016 — 361 to 1,000 m²",
    plotBand: "361 – 1,000 m²",
    minPlotM2: 360,
    maxPlotM2: 1000,
    frontM: null,
    rearM: null,
    sideM: null,
    sideBoth: true,
    cornerExtraM: null,
    maxCoveragePct: 65,
    maxFar: 2.25,
    maxStoreys: null,
    maxHeightM: null,
    source: MBBL_SOURCE,
    verified: false,
  },
  {
    id: "in-mbbl-2000",
    label: "MBBL 2016 — 1,001 to 2,000 m²",
    plotBand: "1,001 – 2,000 m²",
    minPlotM2: 1000,
    maxPlotM2: 2000,
    frontM: null,
    rearM: null,
    sideM: null,
    sideBoth: true,
    cornerExtraM: null,
    maxCoveragePct: 60,
    maxFar: 2.5,
    maxStoreys: null,
    maxHeightM: null,
    source: MBBL_SOURCE,
    verified: false,
  },
  {
    id: "in-mbbl-4000",
    label: "MBBL 2016 — 2,001 to 4,000 m²",
    plotBand: "2,001 – 4,000 m²",
    minPlotM2: 2000,
    maxPlotM2: 4000,
    frontM: null,
    rearM: null,
    sideM: null,
    sideBoth: true,
    cornerExtraM: null,
    maxCoveragePct: 55,
    maxFar: 3.0,
    maxStoreys: null,
    maxHeightM: null,
    source: MBBL_SOURCE,
    verified: false,
  },
];

const AE_PRESETS: Omit<RegionPreset, "region">[] = [
  {
    id: "ae-dbc-villa",
    label: "Dubai DBC — villa community (Al Barari example)",
    plotBand: "Villa plots",
    minPlotM2: null,
    maxPlotM2: null,
    frontM: 3.0,
    rearM: 3.0,
    sideM: 3.0,
    sideBoth: true,
    cornerExtraM: null,
    maxCoveragePct: 40,
    maxFar: 0.6,
    maxStoreys: 2,
    maxHeightM: 16,
    source: DBC_SOURCE,
    verified: false,
    note: "G+1 plus roof. FAR 0.60, coverage 40:60, 3.0 m setbacks on all sides — one community only, not a Dubai-wide rule.",
  },
];

export function getRegionPresets(region: Region): RegionPreset[] {
  const base =
    region === "PK" ? PK_PRESETS : region === "IN" ? IN_PRESETS : AE_PRESETS;
  return [
    generalPlanningGuide(region),
    ...base.map((p) => ({ ...p, region })),
  ];
}

export function findPreset(region: Region, presetId: string): RegionPreset | null {
  return getRegionPresets(region).find((p) => p.id === presetId) ?? null;
}

/** First sourced preset whose plot band contains the area (general guide excluded). */
export function findPresetForPlot(
  region: Region,
  plotAreaM2: number,
): RegionPreset | null {
  if (!isFiniteNumber(plotAreaM2) || plotAreaM2 <= 0) return null;
  return (
    getRegionPresets(region).find(
      (p) =>
        p.id !== "general-planning" &&
        (p.minPlotM2 == null || plotAreaM2 >= p.minPlotM2) &&
        (p.maxPlotM2 == null || plotAreaM2 < p.maxPlotM2),
    ) ?? null
  );
}

// --------------------------------------------------------------- setback ----
export interface SetbackInput {
  region: Region;
  presetId?: string;
  /** frontage × depth (m), or areaM2 directly — never both silently */
  frontageM?: number;
  depthM?: number;
  areaM2?: number;
  frontM?: number;
  rearM?: number;
  sideM?: number;
  sideBoth?: boolean;
  cornerPlot?: boolean;
  /** extra setback on the road-facing side of a corner plot (m) */
  cornerExtraM?: number;
  buildingType?: "residential" | "commercial";
  roadWidthM?: number;
}

export interface SetbackResult {
  frontM: number | null;
  rearM: number | null;
  sideM: number | null;
  sideBoth: boolean;
  plotAreaM2: number;
  buildableFrontageM: number | null;
  buildableDepthM: number | null;
  buildableAreaM2: number | null;
  /** setback-constrained footprint as % of plot — NOT the regulatory coverage */
  setbackFootprintPct: number | null;
  coverageCapM2: number | null;
  coverageCapPct: number | null;
  /** min(setback footprint, coverage cap) — the footprint you may actually build */
  buildableFootprintM2: number | null;
  binding: "setbacks" | "coverage" | null;
  preset: RegionPreset | null;
  warnings: string[];
  errors: string[];
}

export function calcSetback(inp: SetbackInput): SetbackResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const preset = inp.presetId ? findPreset(inp.region, inp.presetId) : null;

  const hasDims =
    isFiniteNumber(inp.frontageM) && isFiniteNumber(inp.depthM);
  const hasArea = isFiniteNumber(inp.areaM2);
  let plotAreaM2 = 0;
  if (hasDims) {
    const fe = validatePositive(inp.frontageM as number, "Plot frontage");
    const de = validatePositive(inp.depthM as number, "Plot depth");
    if (fe) errors.push(fe);
    if (de) errors.push(de);
    plotAreaM2 = (inp.frontageM as number) * (inp.depthM as number);
  } else if (hasArea) {
    const ae = validatePositive(inp.areaM2 as number, "Plot area");
    if (ae) errors.push(ae);
    plotAreaM2 = inp.areaM2 as number;
  } else {
    errors.push("Enter plot frontage and depth, or a plot area.");
  }
  if (plotAreaM2 > 0 && !isFinite(plotAreaM2)) {
    errors.push("Plot area is not a finite number.");
    plotAreaM2 = 0;
  }

  // Explicit values win; otherwise the preset's sourced values; null = unsourced.
  let frontM: number | null = inp.frontM ?? preset?.frontM ?? null;
  let rearM: number | null = inp.rearM ?? preset?.rearM ?? null;
  let sideM: number | null = inp.sideM ?? preset?.sideM ?? null;
  const sideBoth = inp.sideBoth ?? preset?.sideBoth ?? true;

  // Planning rule carried from the previous version (not a regulation
  // citation): commercial front setback at least 4.5 m, at least 6.0 m
  // where the approach road is wider than 18 m.
  if (inp.buildingType === "commercial") {
    if (frontM != null) frontM = Math.max(frontM, 4.5);
    if (frontM != null && isFiniteNumber(inp.roadWidthM) && (inp.roadWidthM as number) > 18) {
      frontM = Math.max(frontM, 6.0);
    }
  }

  if (preset && !preset.verified) {
    warnings.push(
      `Preset figures are secondary/unverified (${preset.source}). Confirm with your local authority before building.`,
    );
  }
  if (!hasDims && hasArea) {
    warnings.push(
      "Plot entered by area only — buildable frontage and depth assume a square plot of the same area; enter frontage × depth for the exact rectangle.",
    );
  }
  if (frontM == null) warnings.push("No verified front setback for this preset — enter your authority's figure.");
  if (rearM == null) warnings.push("No verified rear setback for this preset — enter your authority's figure.");
  if (sideM == null) warnings.push("No verified side setback for this preset — enter your authority's figure.");
  if (inp.cornerPlot && (inp.cornerExtraM == null || inp.cornerExtraM <= 0)) {
    warnings.push("Corner plot: add the extra setback for the road-facing side (no sourced value — enter your authority's figure).");
  }

  const empty: SetbackResult = {
    frontM,
    rearM,
    sideM,
    sideBoth,
    plotAreaM2,
    buildableFrontageM: null,
    buildableDepthM: null,
    buildableAreaM2: null,
    setbackFootprintPct: null,
    coverageCapM2: null,
    coverageCapPct: null,
    buildableFootprintM2: null,
    binding: null,
    preset,
    warnings,
    errors,
  };
  if (errors.length > 0 || frontM == null || rearM == null || sideM == null) {
    return empty;
  }

  const frontageM = hasDims ? (inp.frontageM as number) : Math.sqrt(plotAreaM2);
  const depthM = hasDims ? (inp.depthM as number) : Math.sqrt(plotAreaM2);
  const cornerExtra =
    inp.cornerPlot && isFiniteNumber(inp.cornerExtraM)
      ? Math.max(0, inp.cornerExtraM as number)
      : 0;
  const buildableFrontageM = Math.max(
    0,
    frontageM - sideM * (sideBoth ? 2 : 1) - cornerExtra,
  );
  const buildableDepthM = Math.max(0, depthM - frontM - rearM);
  const buildableAreaM2 = buildableFrontageM * buildableDepthM;
  const setbackFootprintPct =
    plotAreaM2 > 0 ? (buildableAreaM2 / plotAreaM2) * 100 : null;

  if (buildableFrontageM === 0 || buildableDepthM === 0) {
    warnings.push("The setbacks consume the whole plot — no buildable footprint remains at these setbacks.");
  }

  const coverageCapPct = preset?.maxCoveragePct ?? null;
  const coverageCapM2 =
    coverageCapPct != null && plotAreaM2 > 0
      ? (plotAreaM2 * coverageCapPct) / 100
      : null;
  const buildableFootprintM2 =
    coverageCapM2 != null
      ? Math.min(buildableAreaM2, coverageCapM2)
      : buildableAreaM2;
  const binding: "setbacks" | "coverage" =
    coverageCapM2 != null && coverageCapM2 < buildableAreaM2
      ? "coverage"
      : "setbacks";

  return {
    ...empty,
    buildableFrontageM,
    buildableDepthM,
    buildableAreaM2,
    setbackFootprintPct,
    coverageCapM2,
    coverageCapPct,
    buildableFootprintM2,
    binding,
  };
}

// ------------------------------------------------------------------- FAR ----
export interface FarInput {
  region: Region;
  presetId?: string;
  plotAreaM2: number;
  far?: number;
  coveragePct?: number;
  maxHeightM?: number;
  maxStoreys?: number;
  /** floor-to-floor height (m); default 3.05 m / 10 ft */
  floorHeightM?: number;
}

export interface FarResult {
  maxBuiltUpM2: number;
  maxFootprintM2: number;
  floorsByFar: number;
  floorsByHeight: number | null;
  maxFloors: number;
  binding: "far" | "height" | "storeys" | null;
  gfaNote: string;
  preset: RegionPreset | null;
  warnings: string[];
  errors: string[];
}

export function gfaNoteForRegion(region: Region): string {
  switch (region) {
    case "PK":
      return "LDA 2019: basements count toward FAR. Check whether your basement is counted before sizing floors — this tool counts every floor above ground at the full FAR.";
    case "IN":
      return "Model Bye-Laws 2016: FAR uses the covered area on all floors, excluding specified exemptions (stilt parking, balconies within limits, service areas). Your state/city bye-laws override.";
    case "AE":
      return "Dubai DBC Table A.3 lists explicit GFA inclusions and exclusions. Confirm the counted area against your plot's Affection Plan — Dubai has no DM-wide residential FAR table.";
  }
}

export function calcFar(inp: FarInput): FarResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const preset = inp.presetId ? findPreset(inp.region, inp.presetId) : null;

  const far = inp.far ?? preset?.maxFar ?? null;
  const coveragePct = inp.coveragePct ?? preset?.maxCoveragePct ?? null;
  const maxHeightM = inp.maxHeightM ?? preset?.maxHeightM ?? null;
  const maxStoreys = inp.maxStoreys ?? preset?.maxStoreys ?? null;
  const floorHeightM =
    isFiniteNumber(inp.floorHeightM) && (inp.floorHeightM as number) > 0
      ? (inp.floorHeightM as number)
      : DEFAULT_FLOOR_HEIGHT_M;

  const areaErr = validatePositive(inp.plotAreaM2, "Plot area");
  if (areaErr) errors.push(areaErr);
  if (far == null) {
    errors.push("Enter a permissible FAR/FSI, or pick a region preset.");
  } else if (!isFinite(far) || far < 0.1 || far > 15) {
    errors.push("FAR/FSI must be between 0.1 and 15 (Dubai allows 12+).");
  }
  if (coveragePct == null) {
    errors.push("Enter a maximum ground coverage %, or pick a region preset.");
  } else if (!isFinite(coveragePct) || coveragePct <= 0) {
    errors.push("Ground coverage must be above 0% — at 0% no floor can be built (division by zero).");
  } else if (coveragePct > 100) {
    errors.push("Ground coverage cannot exceed 100%.");
  }
  if (maxHeightM != null && (!isFinite(maxHeightM) || maxHeightM <= 0)) {
    errors.push("Maximum height must be greater than 0.");
  }
  if (maxStoreys != null && (!isFinite(maxStoreys) || maxStoreys < 1)) {
    errors.push("Maximum storeys must be at least 1.");
  }
  if (preset && !preset.verified) {
    warnings.push(
      `Preset figures are secondary/unverified (${preset.source}). Confirm with your local authority before building.`,
    );
  }

  const empty: FarResult = {
    maxBuiltUpM2: 0,
    maxFootprintM2: 0,
    floorsByFar: 0,
    floorsByHeight: null,
    maxFloors: 0,
    binding: null,
    gfaNote: gfaNoteForRegion(inp.region),
    preset,
    warnings,
    errors,
  };
  if (errors.length > 0 || far == null || coveragePct == null) return empty;

  const maxBuiltUpM2 = inp.plotAreaM2 * far;
  const maxFootprintM2 = (inp.plotAreaM2 * coveragePct) / 100;
  // +1e-9 guards the float boundary (e.g. 468.244 / 117.061 is exactly 4
  // in decimal but can land a hair under 4.0 in binary floating point).
  const floorsByFar = Math.floor(maxBuiltUpM2 / maxFootprintM2 + 1e-9);
  const floorsByHeight =
    maxHeightM != null ? Math.floor(maxHeightM / floorHeightM + 1e-9) : null;

  if (floorsByFar === 0) {
    warnings.push(
      "FSI below coverage — no full floor is possible at this coverage. Raise the FAR or lower the ground coverage.",
    );
  }
  if (floorsByHeight != null && floorsByHeight === 0) {
    warnings.push("The height limit allows no full storey at this floor-to-floor height.");
  }

  const candidates: { binding: "far" | "height" | "storeys"; floors: number }[] = [
    { binding: "far", floors: floorsByFar },
  ];
  if (floorsByHeight != null) candidates.push({ binding: "height", floors: floorsByHeight });
  if (maxStoreys != null) candidates.push({ binding: "storeys", floors: Math.floor(maxStoreys) });
  // Ties keep the earliest constraint (FAR, then height, then storeys).
  const bindingConstraint = candidates.reduce((min, c) =>
    c.floors < min.floors ? c : min,
  );
  const maxFloors = Math.max(0, bindingConstraint.floors);

  return {
    ...empty,
    maxBuiltUpM2,
    maxFootprintM2,
    floorsByFar,
    floorsByHeight,
    maxFloors,
    binding: bindingConstraint.binding,
  };
}

// ------------------------------------------------------------------ roof ----
export type RoofType = "gable" | "hip" | "mono";

export interface RoofInput {
  spanM: number;
  /** exactly one of riseM / pitchX12 / angleDeg / pitchPct drives the pitch (rise wins) */
  riseM?: number;
  pitchX12?: number;
  angleDeg?: number;
  pitchPct?: number;
  /** horizontal eave overhang (m) */
  overhangHM: number;
  lengthM: number;
  /** eave overhang on the gable/hip ends (m); 0 = none */
  rakeOverhangM?: number;
  roofType: RoofType;
  wastePct?: number;
  rafterSpacingM?: number;
}

export interface RoofResult {
  runM: number;
  riseM: number;
  angleDeg: number;
  pitchX12: number;
  pitchPct: number;
  /** 1 / cos θ — multiply the footprint by this to get sloped area */
  multiplier: number;
  hypotenuseM: number;
  slopedOverhangM: number;
  rafterM: number;
  /** hip/valley rafter ≈ 1.5 × common run (stated approximation); gable/mono: null */
  hipRafterM: number | null;
  ridgeM: number;
  eaveM: number;
  rakeM: number;
  roofAreaM2: number;
  footprintM2: number;
  squares: number;
  bundles: number;
  felt15Rolls: number;
  felt30Rolls: number;
  ridgeCapBundles: number;
  dripEdgeM: number;
  dripEdgePieces: number;
  rafterCount: number;
  pitchBand: string;
  warnings: string[];
  errors: string[];
}

export function pitchBandFor(pitchX12: number): string {
  if (pitchX12 < 2) return "Flat";
  if (pitchX12 < 4) return "Low slope";
  if (pitchX12 < 9) return "Conventional";
  if (pitchX12 <= 12) return "Steep";
  return "Very steep";
}

export function calcRoof(inp: RoofInput): RoofResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const wastePct = inp.wastePct ?? 10;
  const spacingM = inp.rafterSpacingM ?? 0.4;
  const rakeOverhangM = inp.rakeOverhangM ?? 0;
  const overhangHM = inp.overhangHM ?? 0;

  const spanErr = validatePositive(inp.spanM, "Building span");
  if (spanErr) errors.push(spanErr);
  const lenErr = validatePositive(inp.lengthM, "Building length");
  if (lenErr) errors.push(lenErr);
  if (!isFiniteNumber(overhangHM) || overhangHM < 0) {
    errors.push("Overhang must be 0 or more.");
  }
  if (!isFiniteNumber(rakeOverhangM) || rakeOverhangM < 0) {
    errors.push("Rake overhang must be 0 or more.");
  }
  if (!isFiniteNumber(wastePct) || wastePct < 0 || wastePct > 25) {
    errors.push("Wastage must be between 0% and 25%.");
  }
  if (!isFiniteNumber(spacingM) || spacingM <= 0) {
    errors.push("Rafter spacing must be greater than 0.");
  }
  if (inp.riseM != null && (!isFiniteNumber(inp.riseM) || inp.riseM < 0)) {
    errors.push("Rise must be 0 or more (0 = flat roof).");
  }
  if (inp.pitchX12 != null && (!isFiniteNumber(inp.pitchX12) || inp.pitchX12 <= 0)) {
    errors.push("Pitch (X:12) must be greater than 0.");
  }
  if (inp.angleDeg != null && (!isFiniteNumber(inp.angleDeg) || inp.angleDeg <= 0 || inp.angleDeg >= 90)) {
    errors.push("Pitch angle must be between 0° and 90°.");
  }
  if (inp.pitchPct != null && (!isFiniteNumber(inp.pitchPct) || inp.pitchPct < 0)) {
    errors.push("Pitch (%) must be 0 or more.");
  }
  const hasPitchInput =
    inp.riseM != null || inp.pitchX12 != null || inp.angleDeg != null || inp.pitchPct != null;
  if (!hasPitchInput) errors.push("Enter a rise, or a pitch in X:12, degrees or percent.");

  const empty: RoofResult = {
    runM: 0,
    riseM: 0,
    angleDeg: 0,
    pitchX12: 0,
    pitchPct: 0,
    multiplier: 0,
    hypotenuseM: 0,
    slopedOverhangM: 0,
    rafterM: 0,
    hipRafterM: null,
    ridgeM: 0,
    eaveM: 0,
    rakeM: 0,
    roofAreaM2: 0,
    footprintM2: 0,
    squares: 0,
    bundles: 0,
    felt15Rolls: 0,
    felt30Rolls: 0,
    ridgeCapBundles: 0,
    dripEdgeM: 0,
    dripEdgePieces: 0,
    rafterCount: 0,
    pitchBand: "—",
    warnings,
    errors,
  };
  if (errors.length > 0) return empty;

  const runM = inp.spanM / 2;
  // Derive the rise from whichever pitch input was given (rise wins).
  let riseM: number;
  if (inp.riseM != null) {
    riseM = inp.riseM;
  } else if (inp.pitchX12 != null) {
    riseM = runM * ((inp.pitchX12 as number) / 12);
  } else if (inp.angleDeg != null) {
    riseM = runM * Math.tan(((inp.angleDeg as number) * Math.PI) / 180);
  } else {
    riseM = runM * ((inp.pitchPct as number) / 100);
  }

  const ratio = runM > 0 ? riseM / runM : 0;
  const angleDeg = (Math.atan(ratio) * 180) / Math.PI;
  const pitchX12 = ratio * 12;
  const pitchPct = ratio * 100;
  const multiplier = Math.sqrt(1 + ratio * ratio); // = 1 / cos θ
  const hypotenuseM = Math.sqrt(riseM * riseM + runM * runM);
  // Overhang is HORIZONTAL: the sloped length it adds is overhang / cos θ.
  // (The old server code added it to the sloped rafter directly, which
  // understated the rafter by ~1.3% on the worked example.)
  const slopedOverhangM = overhangHM * multiplier;
  const rafterM = hypotenuseM + slopedOverhangM;
  const footprintM2 = inp.spanM * inp.lengthM;

  let roofAreaM2: number;
  let ridgeM: number;
  let eaveM: number;
  let rakeM: number;
  let hipRafterM: number | null = null;
  let slopeCount: number;
  if (inp.roofType === "mono") {
    roofAreaM2 = rafterM * inp.lengthM;
    ridgeM = 0;
    eaveM = 2 * inp.lengthM;
    rakeM = 2 * rafterM;
    slopeCount = 1;
  } else if (inp.roofType === "hip") {
    // Uniform-pitch hip: sloped area = horizontal projection / cos θ.
    const planWithOverhangM2 =
      (inp.spanM + 2 * overhangHM) * (inp.lengthM + 2 * rakeOverhangM);
    roofAreaM2 = planWithOverhangM2 * multiplier;
    ridgeM = Math.max(0, inp.lengthM - inp.spanM);
    eaveM =
      2 * (inp.spanM + 2 * overhangHM + inp.lengthM + 2 * rakeOverhangM);
    rakeM = 0;
    hipRafterM = 1.5 * runM; // stated approximation, not an exact hip length
    slopeCount = 2;
    warnings.push(
      "Hip roof area assumes a uniform pitch on all slopes, and the hip/valley rafter (≈ 1.5 × run) is an approximation — confirm long hip rafters against your drawings.",
    );
  } else {
    roofAreaM2 = 2 * rafterM * inp.lengthM;
    ridgeM = inp.lengthM;
    eaveM = 2 * inp.lengthM;
    rakeM = 4 * rafterM;
    slopeCount = 2;
  }

  const areaWithWasteM2 = roofAreaM2 * (1 + wastePct / 100);
  const squares = Math.ceil(areaWithWasteM2 / M2_PER_SQUARE);
  const bundles = squares * BUNDLES_PER_SQUARE;
  const felt15Rolls = Math.ceil(roofAreaM2 / FELT15_M2_PER_ROLL);
  const felt30Rolls = Math.ceil(roofAreaM2 / FELT30_M2_PER_ROLL);
  const ridgeCapBundles = ridgeM > 0 ? Math.ceil(ridgeM / RIDGE_M_PER_BUNDLE) : 0;
  const dripEdgeM = eaveM + rakeM;
  const dripEdgePieces = Math.ceil(dripEdgeM / DRIP_EDGE_M_PER_PIECE);
  const rafterCount = (Math.ceil(inp.lengthM / spacingM) + 1) * slopeCount;

  if (riseM === 0) {
    warnings.push(
      "Flat roof (rise 0): for a flat RCC roof use the Concrete / Slab tools — this calculator is for pitched roofs.",
    );
  }
  if (pitchX12 > 12) {
    warnings.push("Very steep — over 12:12 needs specialist fixing and access.");
  }

  return {
    runM,
    riseM,
    angleDeg,
    pitchX12,
    pitchPct,
    multiplier,
    hypotenuseM,
    slopedOverhangM,
    rafterM,
    hipRafterM,
    ridgeM,
    eaveM,
    rakeM,
    roofAreaM2,
    footprintM2,
    squares,
    bundles,
    felt15Rolls,
    felt30Rolls,
    ridgeCapBundles,
    dripEdgeM,
    dripEdgePieces,
    rafterCount,
    pitchBand: pitchBandFor(pitchX12),
    warnings,
    errors,
  };
}

// ---------------------------------------------------------- roof costing ----
export interface RoofMaterialRates {
  /** price per roofing square (100 sq ft); null = unknown, user enters */
  shinglePerSquare: number | null;
  felt15PerRoll: number | null;
  felt30PerRoll: number | null;
  ridgeCapPerBundle: number | null;
  dripEdgePerM: number | null;
  rafterPerM: number | null;
}

export const EMPTY_ROOF_RATES: RoofMaterialRates = {
  shinglePerSquare: null,
  felt15PerRoll: null,
  felt30PerRoll: null,
  ridgeCapPerBundle: null,
  dripEdgePerM: null,
  rafterPerM: null,
};

export interface RoofCostLine {
  description: string;
  quantity: number;
  unit: string;
  rate: number | null;
  amount: number | null;
}

export interface RoofCost {
  lines: RoofCostLine[];
  totalCost: number | null;
  /** true only when every priced line has a rate */
  costComplete: boolean;
}

export function calcRoofCost(
  result: RoofResult,
  rates: RoofMaterialRates,
): RoofCost {
  const lines: RoofCostLine[] = [
    {
      description: "Roofing shingles",
      quantity: result.squares,
      unit: "squares",
      rate: rates.shinglePerSquare,
      amount:
        rates.shinglePerSquare != null
          ? result.squares * rates.shinglePerSquare
          : null,
    },
    {
      description: "Shingle bundles (3 per square)",
      quantity: result.bundles,
      unit: "bundles",
      rate: null,
      amount: null,
    },
    {
      description: "#15 felt underlay",
      quantity: result.felt15Rolls,
      unit: "rolls",
      rate: rates.felt15PerRoll,
      amount:
        rates.felt15PerRoll != null
          ? result.felt15Rolls * rates.felt15PerRoll
          : null,
    },
    {
      description: "#30 felt underlay",
      quantity: result.felt30Rolls,
      unit: "rolls",
      rate: rates.felt30PerRoll,
      amount:
        rates.felt30PerRoll != null
          ? result.felt30Rolls * rates.felt30PerRoll
          : null,
    },
    {
      description: "Ridge cap bundles",
      quantity: result.ridgeCapBundles,
      unit: "bundles",
      rate: rates.ridgeCapPerBundle,
      amount:
        rates.ridgeCapPerBundle != null
          ? result.ridgeCapBundles * rates.ridgeCapPerBundle
          : null,
    },
    {
      description: "Drip edge",
      quantity: Math.round(result.dripEdgeM * 100) / 100,
      unit: "m",
      rate: rates.dripEdgePerM,
      amount:
        rates.dripEdgePerM != null
          ? result.dripEdgeM * rates.dripEdgePerM
          : null,
    },
    {
      description: "Rafters",
      quantity: result.rafterCount,
      unit: "nos",
      rate: rates.rafterPerM,
      amount:
        rates.rafterPerM != null
          ? result.rafterCount * result.rafterM * rates.rafterPerM
          : null,
    },
  ];
  const priced = lines.filter((l) => l.amount != null);
  const totalCost =
    priced.length > 0
      ? priced.reduce((sum, l) => sum + (l.amount as number), 0)
      : null;
  // The bundles line is informational (already inside the squares price),
  // so completeness ignores it: every rate-bearing line must have a rate.
  const rateBearing = lines.filter(
    (l) => l.description !== "Shingle bundles (3 per square)",
  );
  return {
    lines,
    totalCost,
    costComplete:
      rateBearing.length > 0 && rateBearing.every((l) => l.amount != null),
  };
}
