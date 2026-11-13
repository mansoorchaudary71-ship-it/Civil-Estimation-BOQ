/**
 * Universal structural geometry engine (pure functions).
 * Fixes over the old UniversalStructuralGeometryEngine (G7 spec §4.11):
 * - Bar-size inputs per tab (main dia default 12, stirrup/tie dia default 8,
 *   cover default 25 mm); steel always via d²/162.28 — the hardcoded
 *   0.888/0.395 kg/m values are gone.
 * - Stirrup length by the canonical IS 2502 detailed form
 *   (stirrupLengthDetailed from steelCalc.ts): L = 2(A+B) + 2·10φ −
 *   (3·2φ + 2·3φ), A/B = section dims − 2·cover − φ.
 * - Rectangular formwork counts SIDES ONLY (2·L·(W+D) − W·L, bottom
 *   excluded) with a "formed on ground" toggle that shows both numbers.
 * - Shared editable rate table + currency via rates.ts; cost shown in-UI.
 * - Cement/sand/aggregate (dry × 1.54) + wastage per tab.
 * - Precast post/footing sizes are inputs (were hardcoded 0.15×0.15 m and
 *   0.45×0.45×0.6 m). Roof tab adds purlin/batten spacing + sheet area.
 * - New trapezoidal-footing tab reusing the frustum formula (cross-link
 *   to the isolated-footing tool).
 * - Staircase tab delegates to staircaseCalc.ts — the single source of
 *   truth. That kills the 120 kg/m³ vs 78.5 kg/m³ disagreement: the
 *   standard is now DESIGNED steel, with the 1% rule only as a cross-check.
 */
import {
  checkRange, costLine, materialsForConcrete, mixRatioForGrade, round,
  totalCost, type CostLine, type FaqItem, type MaterialBreakdown,
} from "./structuralShared";
import { designStaircase, type StaircaseInputs } from "./staircaseCalc";
import { stirrupLengthDetailed, unitWeightKgPerM } from "./steelCalc";

export interface GeometryRates {
  cementPerBag: number | null;
  steelPerKg: number | null;
  sandPerCft: number | null;
  crushPerCft: number | null;
}

export const defaultGeometryRates: GeometryRates = {
  cementPerBag: 1450, steelPerKg: 270, sandPerCft: 90, crushPerCft: 90,
};

export interface RectInputs {
  lengthM: number; widthM: number; depthM: number;
  mainDiaMm: number; mainBarCount: number;
  stirrupDiaMm: number; stirrupSpacingM: number; coverMm: number;
  formedOnGround: boolean; fck: number; wastagePct: number;
}
export const defaultRectInputs: RectInputs = {
  lengthM: 3, widthM: 0.3, depthM: 0.4,
  mainDiaMm: 12, mainBarCount: 4, stirrupDiaMm: 8, stirrupSpacingM: 0.15,
  coverMm: 25, formedOnGround: true, fck: 25, wastagePct: 5,
};

export interface CircInputs {
  diaM: number; heightM: number; mainDiaMm: number; mainBarCount: number;
  tieDiaMm: number; tiePitchM: number; coverMm: number; fck: number; wastagePct: number;
}
export const defaultCircInputs: CircInputs = {
  diaM: 0.4, heightM: 3, mainDiaMm: 12, mainBarCount: 6,
  tieDiaMm: 8, tiePitchM: 0.15, coverMm: 25, fck: 25, wastagePct: 5,
};

export interface TubeInputs { odM: number; idM: number; lengthM: number; fck: number; wastagePct: number }
export const defaultTubeInputs: TubeInputs = { odM: 1, idM: 0.8, lengthM: 5, fck: 25, wastagePct: 5 };

export interface PrecastInputs {
  wallLengthM: number; wallHeightM: number; panelHeightM: number; panelThickM: number;
  postSpacingM: number; postSizeM: number; footingSizeM: number; footingDepthM: number;
  fck: number; wastagePct: number;
}
export const defaultPrecastInputs: PrecastInputs = {
  wallLengthM: 30, wallHeightM: 2.4, panelHeightM: 0.3, panelThickM: 0.05,
  postSpacingM: 3, postSizeM: 0.15, footingSizeM: 0.45, footingDepthM: 0.6,
  fck: 25, wastagePct: 5,
};

export interface RoofInputs {
  spanM: number; riseM: number; runM: number;
  purlinSpacingM: number; battenSpacingM: number; sheetWidthM: number;
}
export const defaultRoofInputs: RoofInputs = {
  spanM: 8, riseM: 2, runM: 12, purlinSpacingM: 1.2, battenSpacingM: 0.6, sheetWidthM: 1.0,
};

export interface TrapFootingInputs {
  baseLengthM: number; baseWidthM: number; baseDepthM: number;
  topLengthM: number; topWidthM: number; slopeDepthM: number;
  fck: number; wastagePct: number;
}
export const defaultTrapFootingInputs: TrapFootingInputs = {
  baseLengthM: 2.2, baseWidthM: 2.2, baseDepthM: 0.2,
  topLengthM: 0.6, topWidthM: 0.6, slopeDepthM: 0.3, fck: 25, wastagePct: 5,
};

export interface GeometryResult {
  errors: string[]; warnings: string[];
  volM3: number; formworkM2: number; formworkAllSidesM2?: number;
  mainSteelKg: number; stirrupSteelKg: number; totalSteelKg: number;
  weightKg?: number; extra?: Record<string, number>;
  materials: MaterialBreakdown;
  costLines: CostLine[]; totalCost: number | null;
  steps: { label: string; text: string }[];
}

function finish(
  volM3: number, formworkM2: number, mainKg: number, stirrupKg: number,
  fck: number, wastagePct: number, rates: GeometryRates,
  steps: { label: string; text: string }[], errors: string[], warnings: string[],
  extra?: Record<string, number>, formworkAll?: number, weightKg?: number,
): GeometryResult {
  const materials = materialsForConcrete(volM3, mixRatioForGrade(fck), wastagePct);
  const totalSteel = mainKg + stirrupKg;
  const lines: CostLine[] = [
    costLine(`Cement (${materials.cementBags} bags)`, materials.cementBags, "bags", rates.cementPerBag),
    costLine(`Sand (${round(materials.sandCft, 1)} cft)`, materials.sandCft, "cft", rates.sandPerCft),
    costLine(`Aggregate (${round(materials.aggCft, 1)} cft)`, materials.aggCft, "cft", rates.crushPerCft),
    costLine(`Steel (${round(totalSteel, 1)} kg)`, totalSteel, "kg", rates.steelPerKg),
  ];
  return {
    errors, warnings, volM3: round(volM3, 3), formworkM2: round(formworkM2, 2),
    formworkAllSidesM2: formworkAll == null ? undefined : round(formworkAll, 2),
    mainSteelKg: round(mainKg, 2), stirrupSteelKg: round(stirrupKg, 2),
    totalSteelKg: round(totalSteel, 2), weightKg: weightKg == null ? undefined : round(weightKg, 1),
    extra, materials, costLines: lines, totalCost: totalCost(lines), steps,
  };
}

export function calcRectangular(i: RectInputs, rates: GeometryRates = defaultGeometryRates): GeometryResult {
  const errors: string[] = [];
  checkRange(errors, "Length", i.lengthM, 0.1, 100);
  checkRange(errors, "Width", i.widthM, 0.05, 10);
  checkRange(errors, "Depth", i.depthM, 0.05, 10);
  const vol = i.lengthM * i.widthM * i.depthM;
  const formworkAll = 2 * i.lengthM * (i.widthM + i.depthM);
  const formworkSides = formworkAll - i.widthM * i.lengthM; // bottom excluded
  const formwork = i.formedOnGround ? formworkSides : formworkAll;
  const mainKg = unitWeightKgPerM(i.mainDiaMm) * i.lengthM * i.mainBarCount;
  const stirrupCount = Math.ceil(i.lengthM / i.stirrupSpacingM) + 1;
  const aMm = i.widthM * 1000 - 2 * i.coverMm - i.stirrupDiaMm;
  const bMm = i.depthM * 1000 - 2 * i.coverMm - i.stirrupDiaMm;
  const stirrupLenMm = stirrupLengthDetailed(aMm, bMm, i.stirrupDiaMm);
  const stirrupKg = unitWeightKgPerM(i.stirrupDiaMm) * (stirrupLenMm / 1000) * stirrupCount;
  return finish(vol, formwork, mainKg, stirrupKg, i.fck, i.wastagePct, rates, [
    { label: "Volume", text: `V = L·W·D = ${i.lengthM} × ${i.widthM} × ${i.depthM} = ${round(vol, 3)} m³` },
    { label: "Formwork (sides only)", text: `2·L·(W+D) − W·L = ${round(formworkAll, 2)} − ${round(i.widthM * i.lengthM, 2)} = ${round(formworkSides, 2)} m² (bottom not formed on ground; all four sides = ${round(formworkAll, 2)} m²)` },
    { label: "Main steel", text: `${i.mainBarCount} × ${i.mainDiaMm} mm × ${i.lengthM} m × ${round(unitWeightKgPerM(i.mainDiaMm), 3)} kg/m = ${round(mainKg, 2)} kg` },
    { label: "Stirrups (IS 2502 detailed)", text: `A = ${round(aMm)} mm, B = ${round(bMm)} mm; L = 2(A+B) + 2·10φ − (3·2φ + 2·3φ) = ${round(stirrupLenMm)} mm; ${stirrupCount} nos × ${i.stirrupDiaMm} mm = ${round(stirrupKg, 2)} kg` },
  ], errors, [], undefined, formworkAll);
}

export function calcCircular(i: CircInputs, rates: GeometryRates = defaultGeometryRates): GeometryResult {
  const errors: string[] = [];
  checkRange(errors, "Diameter", i.diaM, 0.1, 10);
  checkRange(errors, "Height", i.heightM, 0.1, 50);
  const r = i.diaM / 2;
  const vol = Math.PI * r * r * i.heightM;
  const formwork = Math.PI * i.diaM * i.heightM;
  const mainKg = unitWeightKgPerM(i.mainDiaMm) * i.heightM * i.mainBarCount;
  const spiralLen = Math.sqrt((Math.PI * (i.diaM - 2 * (i.coverMm / 1000) - (i.tieDiaMm / 1000))) ** 2 + i.tiePitchM ** 2) * (i.heightM / i.tiePitchM);
  const spiralKg = unitWeightKgPerM(i.tieDiaMm) * spiralLen;
  return finish(vol, formwork, mainKg, spiralKg, i.fck, i.wastagePct, rates, [
    { label: "Volume", text: `V = πr²h = π × ${round(r, 2)}² × ${i.heightM} = ${round(vol, 3)} m³` },
    { label: "Formwork", text: `A = π·D·h = ${round(formwork, 2)} m²` },
    { label: "Spiral ties", text: `One turn = √((π(D−2c−φ))² + pitch²); total ${round(spiralLen, 1)} m of ${i.tieDiaMm} mm = ${round(spiralKg, 2)} kg` },
  ], errors, []);
}

export function calcTube(i: TubeInputs, rates: GeometryRates = defaultGeometryRates): GeometryResult {
  const errors: string[] = [];
  checkRange(errors, "Outer diameter", i.odM, 0.1, 10);
  if (i.idM >= i.odM) errors.push("Inner diameter must be smaller than outer diameter.");
  const vol = Math.PI * ((i.odM / 2) ** 2 - (i.idM / 2) ** 2) * i.lengthM;
  const formwork = Math.PI * (i.odM + i.idM) * i.lengthM;
  return finish(vol, formwork, 0, 0, i.fck, i.wastagePct, rates, [
    { label: "Volume", text: `V = π(R²−r²)·L = ${round(vol, 3)} m³` },
    { label: "Formwork", text: `A = π(OD+ID)·L = ${round(formwork, 2)} m² (outer + inner faces)` },
  ], errors, [], undefined, undefined, round(vol * 2400, 1));
}

export function calcPrecast(i: PrecastInputs, rates: GeometryRates = defaultGeometryRates): GeometryResult {
  const errors: string[] = [];
  checkRange(errors, "Wall length", i.wallLengthM, 1, 1000);
  const postCount = Math.ceil(i.wallLengthM / i.postSpacingM) + 1;
  const panelsPerSpan = Math.ceil(i.wallHeightM / i.panelHeightM);
  const totalPanels = panelsPerSpan * (postCount - 1);
  const panelVol = (i.postSpacingM - 0.1) * i.panelHeightM * i.panelThickM * totalPanels;
  const postVol = postCount * i.postSizeM * i.postSizeM * i.wallHeightM;
  const footingVol = postCount * i.footingSizeM * i.footingSizeM * i.footingDepthM;
  const vol = panelVol + postVol + footingVol;
  return finish(vol, 0, 0, 0, i.fck, i.wastagePct, rates, [
    { label: "Posts", text: `${postCount} posts (${i.postSizeM} × ${i.postSizeM} m) at ${i.postSpacingM} m centres` },
    { label: "Panels", text: `${totalPanels} panels (${i.panelHeightM} m high × ${i.panelThickM} m thick)` },
    { label: "Footings", text: `${postCount} footings ${i.footingSizeM} × ${i.footingSizeM} × ${i.footingDepthM} m = ${round(footingVol, 2)} m³` },
  ], errors, [], { postCount, totalPanels, panelVol: round(panelVol, 2), postVol: round(postVol, 2), footingVol: round(footingVol, 2) });
}

export function calcRoof(i: RoofInputs): { rafterM: number; pitchDeg: number; areaM2: number; purlinsM: number; battensM: number; sheets: number; errors: string[] } {
  const errors: string[] = [];
  checkRange(errors, "Span", i.spanM, 1, 50);
  const rafter = Math.sqrt((i.spanM / 2) ** 2 + i.riseM ** 2);
  const pitch = (Math.atan(i.riseM / (i.spanM / 2)) * 180) / Math.PI;
  const area = 2 * rafter * i.runM;
  const purlins = Math.ceil(rafter / i.purlinSpacingM) * 2 * i.runM;
  const battens = Math.ceil((2 * rafter) / i.battenSpacingM) * i.runM;
  const sheets = Math.ceil(area / (i.sheetWidthM * 2.44));
  return { rafterM: round(rafter, 2), pitchDeg: round(pitch, 1), areaM2: round(area, 2), purlinsM: round(purlins, 1), battensM: round(battens, 1), sheets, errors };
}

export function calcTrapFooting(i: TrapFootingInputs, rates: GeometryRates = defaultGeometryRates): GeometryResult {
  const errors: string[] = [];
  if (i.topLengthM > i.baseLengthM || i.topWidthM > i.baseWidthM) errors.push("Top dimensions cannot exceed the base dimensions.");
  const a1 = i.baseLengthM * i.baseWidthM;
  const a2 = i.topLengthM * i.topWidthM;
  const vol = i.baseLengthM * i.baseWidthM * i.baseDepthM + (i.slopeDepthM / 3) * (a1 + a2 + Math.sqrt(a1 * a2));
  const formwork = 2 * (i.baseLengthM + i.baseWidthM) * i.baseDepthM;
  return finish(vol, formwork, 0, 0, i.fck, i.wastagePct, rates, [
    { label: "Volume", text: `V = base + frustum = L·B·D1 + (h/3)(A1 + A2 + √(A1·A2)) = ${round(vol, 3)} m³ (trapezoidal rule, IS 456 practice)` },
    { label: "Note", text: "For the full structural design (punching shear, bending, steel) use the Isolated Footing Design tool — this tab is quantities only." },
  ], errors, []);
}

/** Staircase tab — delegates to the shared staircase engine (single source of truth). */
export function calcStaircaseTab(i: Partial<StaircaseInputs>): ReturnType<typeof designStaircase> {
  return designStaircase(i);
}

export const GEOMETRY_FAQS: FaqItem[] = [
  { q: "How is hollow cylinder (tube) volume calculated?", a: "V = π(R² − r²)·L — the outer cylinder minus the inner cylinder. The same formula gives a pipe, a well ring or a hollow column; the weight is volume × 2,400 kg/m³ for concrete." },
  { q: "How much steel per cubic metre of concrete?", a: "As a planning rule: slab ~1.0% (≈ 78 kg/m³), beam ~1.5% (≈ 118 kg/m³), column ~2.0% (≈ 157 kg/m³), footing ~0.8% (≈ 63 kg/m³). This tool does not use those rules where a design exists — the rectangular tab uses your actual bar sizes and spacing." },
  { q: "What is the formwork area formula?", a: "For a beam on the ground, formwork is the two sides plus the ends: 2·L·(W+D) minus the bottom (W·L), which the ground forms. A column is perimeter × height; a circular column is π·D·h." },
  { q: "How many plywood sheets are needed?", a: "One standard sheet is 1.22 × 2.44 m = 2.97 m². Sheets = ceil(formwork area ÷ 2.97). Battens run about 3.5 m per m² of formwork." },
  { q: "What is the stirrup length formula?", a: "IS 2502 detailed form: L = 2(A+B) + 2·10φ − (3·2φ + 2·3φ), where A and B are the inner dimensions (section minus 2× cover minus φ) and φ is the stirrup diameter. The field rule 2(A+B) + 24φ reads about 10% higher because it does not deduct bend shortening — this tool uses the detailed form and says so." },
];
