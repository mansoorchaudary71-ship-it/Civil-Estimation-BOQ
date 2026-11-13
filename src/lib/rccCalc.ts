/**
 * RCC engine — pure functions, no React, metric internally.
 * (brickCalc.ts pattern: the engine is shared by MasterRccCore and
 * SlabEstimator so the two can never diverge again.)
 *
 * Canonical rules (repo AGENTS.md + G2 spec §4.2/§4.3):
 * - Wet volume -> dry volume x1.54; cement bag = 0.0347 m3 (50 kg).
 * - Steel unit weight W = d^2 / 162.28 kg/m (steelCalc.ts).
 * - Effective depth d = D - (cover + phi/2).
 * - Crank allowance 0.42 x d on ALTERNATE bars only.
 * - Stirrups: IS 2502 detailed length (stirrupLengthDetailed) is canonical;
 *   the field rule 2(A+B)+24phi (stirrupLengthSimple) is shown as a labelled
 *   approximation. Both imported from steelCalc.ts — never duplicated here.
 * - Bar count N = ceil(span / spacing) + 1 (AGENTS.md rebar-spacing rule).
 * - Shuttering: slab = soffit LxW + edges 2(L+W)xt (IS 1200 measurement,
 *   edges INCLUDED — the old code counted the soffit only); beam =
 *   (2h+w)xL; column = 2(l+w)xh; footing = 2(L+W)xdepth.
 * - Thumb steel % of wet volume: slab 1.0, beam 1.5, column 2.0,
 *   staircase 1.0, footing 0.8 (x 7850 kg/m3).
 * - Nominal mixes (IS 456 Table 9) only up to M20; for M25+ the UI links
 *   to /mix-design instead of using a nominal mix.
 */
import {
  unitWeightKgPerM,
  stirrupLengthDetailed,
  stirrupLengthSimple,
} from "./steelCalc";

export const DRY_CONCRETE_FACTOR = 1.54;
export const CEMENT_BAG_M3 = 0.0347;
export const CEMENT_BAG_KG = 50;
export const STEEL_DENSITY = 7850;

export type RccElementType =
  | "slab"
  | "column"
  | "beam"
  | "staircase"
  | "round-column"
  | "footing";

export const THUMB_STEEL_PCT: Record<RccElementType, number> = {
  slab: 1.0,
  beam: 1.5,
  column: 2.0,
  staircase: 1.0,
  "round-column": 2.0,
  footing: 0.8,
};

/** kg steel per m3 of wet concrete at the thumb % (78.5 / 117.8 / 157.0 / 62.8). */
export function thumbKgPerM3(type: RccElementType): number {
  return (THUMB_STEEL_PCT[type] / 100) * STEEL_DENSITY;
}

/** Nominal mixes, IS 456 Table 9 (up to M20 only). */
export const NOMINAL_MIXES: Record<string, { ratio: [number, number, number]; wc: number; label: string }> = {
  M10: { ratio: [1, 3, 6], wc: 0.6, label: "1:3:6 (M10)" },
  M15: { ratio: [1, 2, 4], wc: 0.5, label: "1:2:4 (M15)" },
  M20: { ratio: [1, 1.5, 3], wc: 0.5, label: "1:1.5:3 (M20)" },
};

export interface RccElementInput {
  type: RccElementType;
  count: number;
  /** slab: L m; column: section length mm; beam: span m; stair: flight width m; round-column: diameter mm; footing: L m */
  l: number;
  /** slab: W m; column: section width mm; beam: width mm; stair: steps count; round-column: unused; footing: W m */
  w: number;
  /** slab: thickness mm; column: height m; beam: depth mm; stair: tread mm; round-column: height m; footing: base depth m */
  h: number;
  /** staircase: riser mm; footing: frustum top L m (0 = rectangular only) */
  extra1: number;
  /** staircase: waist mm; footing: frustum top W m */
  extra2: number;
  /** staircase: unused; footing: frustum height m */
  extra3: number;
  coverMm: number;
  steelMode: "thumb" | "bbs";
  thumbPct: number;
  mainDia: number;
  mainSpacing: number;
  distDia: number;
  distSpacing: number;
  /** column/beam main-bar count; footing/slab ignored */
  mainBars: number;
  stirrupDia: number;
  stirrupSpacing: number;
}

export function defaultRccElement(type: RccElementType): RccElementInput {
  const base: RccElementInput = {
    type,
    count: 1,
    l: 4,
    w: 3,
    h: 150,
    extra1: 0,
    extra2: 0,
    extra3: 0,
    coverMm: 25,
    steelMode: "thumb",
    thumbPct: THUMB_STEEL_PCT[type],
    mainDia: 12,
    mainSpacing: 150,
    distDia: 10,
    distSpacing: 150,
    mainBars: 4,
    stirrupDia: 8,
    stirrupSpacing: 150,
  };
  if (type === "column") {
    base.l = 300;
    base.w = 300;
    base.h = 3;
    base.coverMm = 40;
  }
  if (type === "beam") {
    base.l = 4;
    base.w = 230;
    base.h = 450;
    base.coverMm = 25;
  }
  if (type === "staircase") {
    base.l = 3;
    base.w = 10;
    base.h = 250;
    base.extra1 = 150;
    base.extra2 = 150;
    base.coverMm = 20;
  }
  if (type === "round-column") {
    base.l = 300;
    base.w = 0;
    base.h = 3;
    base.coverMm = 40;
  }
  if (type === "footing") {
    base.l = 1.5;
    base.w = 1.5;
    base.h = 0.3;
    base.extra1 = 0.6;
    base.extra2 = 0.6;
    base.extra3 = 0.3;
    base.coverMm = 50;
  }
  if (type === "slab") base.coverMm = 20;
  return base;
}

export interface BbsRow {
  diaMm: number;
  description: string;
  count: number;
  cutLengthM: number;
  totalLengthM: number;
  weightKg: number;
}

export interface RccElementResult {
  wetVolumeM3: number;
  shutteringM2: number;
  steelKg: number;
  thumbKgPerM3: number;
  bbs: BbsRow[];
  /** stirrup length by the IS 2502 detailed form (canonical) */
  stirrupLengthDetailedMm: number | null;
  /** stirrup length by the field rule, labelled approximation */
  stirrupLengthSimpleMm: number | null;
  errors: string[];
}

export function validateRccElement(el: RccElementInput): string[] {
  const errs: string[] = [];
  if (!Number.isInteger(el.count) || el.count < 1) errs.push("Count must be a whole number of 1 or more.");
  if (el.type === "slab" && (el.l <= 0 || el.w <= 0 || el.h <= 0)) errs.push("Slab length, width and thickness must all be greater than 0.");
  if (el.type === "column" && (el.l <= 0 || el.w <= 0 || el.h <= 0)) errs.push("Column section and height must all be greater than 0.");
  if (el.type === "beam" && (el.l <= 0 || el.w <= 0 || el.h <= 0)) errs.push("Beam span, width and depth must all be greater than 0.");
  if (el.type === "staircase" && (el.w < 1 || el.h <= 0 || el.extra1 <= 0 || el.extra2 <= 0)) errs.push("Staircase needs at least 1 step, and tread, riser and waist thickness greater than 0.");
  if (el.type === "round-column" && (el.l <= 0 || el.h <= 0)) errs.push("Round column diameter and height must be greater than 0.");
  if (el.type === "footing" && (el.l <= 0 || el.w <= 0 || el.h <= 0)) errs.push("Footing length, width and base depth must be greater than 0.");
  if (el.steelMode === "bbs") {
    if (el.mainSpacing < 75 || el.mainSpacing > 300) errs.push("Main-bar spacing must be 75-300 mm.");
    if (![8, 10, 12, 16, 20, 25, 32].includes(el.mainDia)) errs.push("Main bar diameter must be 8, 10, 12, 16, 20, 25 or 32 mm.");
    if (el.type === "slab" && el.coverMm >= el.h / 2) errs.push("Cover must be less than half the slab thickness.");
  }
  if (el.coverMm < 0 || el.coverMm > 75) errs.push("Cover must be 0-75 mm.");
  return errs;
}

/** Effective depth d = D - (cover + phi/2) (repo AGENTS.md). */
export function effectiveDepth(thicknessMm: number, coverMm: number, diaMm: number): number {
  return thicknessMm - (coverMm + diaMm / 2);
}

/** Bar count across a span: ceil(span/spacing) + 1. */
export function barCount(spanMm: number, spacingMm: number): number {
  if (spacingMm <= 0) return 0;
  return Math.ceil(spanMm / spacingMm) + 1;
}

/**
 * One direction of slab bars with alternate cranked bars.
 * Straight bars: cut = span - 2 x cover.
 * Cranked bars (every other bar): cut = span - 2 x cover + 0.42 x d.
 */
export function slabDirectionBars(
  spanMm: number,
  acrossMm: number,
  diaMm: number,
  spacingMm: number,
  coverMm: number,
  thicknessMm: number,
  cranked: boolean,
): { count: number; totalLengthM: number; weightKg: number; dMm: number } {
  const count = barCount(acrossMm, spacingMm);
  const dMm = effectiveDepth(thicknessMm, coverMm, diaMm);
  const straightM = Math.max(0, (spanMm - 2 * coverMm) / 1000);
  const crankedCount = cranked ? Math.floor(count / 2) : 0;
  const crankedM = straightM + (0.42 * dMm) / 1000;
  const totalLengthM = (count - crankedCount) * straightM + crankedCount * crankedM;
  return { count, totalLengthM, weightKg: totalLengthM * unitWeightKgPerM(diaMm), dMm };
}

export function calcRccElement(el: RccElementInput): RccElementResult {
  const errors = validateRccElement(el);
  const count = Math.max(1, Math.floor(el.count) || 1);
  let wet = 0;
  let shut = 0;
  const bbs: BbsRow[] = [];
  let stirrupDetailed: number | null = null;
  let stirrupSimple: number | null = null;

  const pushBbs = (row: Omit<BbsRow, "totalLengthM" | "weightKg">) => {
    const totalLengthM = row.count * row.cutLengthM;
    bbs.push({ ...row, totalLengthM, weightKg: totalLengthM * unitWeightKgPerM(row.diaMm) });
  };

  if (el.type === "slab") {
    const tM = el.h / 1000;
    wet = el.l * el.w * tM * count;
    shut = (el.l * el.w + 2 * (el.l + el.w) * tM) * count; // soffit + edges
    if (el.steelMode === "bbs") {
      const lxMm = el.w * 1000; // short span = width input
      const lyMm = el.l * 1000;
      const short = slabDirectionBars(lxMm, lyMm, el.mainDia, el.mainSpacing, el.coverMm, el.h, true);
      const long = slabDirectionBars(lyMm, lxMm, el.distDia, el.distSpacing, el.coverMm, el.h, true);
      pushBbs({
        diaMm: el.mainDia,
        description: `Short-span bars (${el.mainDia} mm @ ${el.mainSpacing} mm c/c, alternate cranked, d = ${short.dMm.toFixed(0)} mm)`,
        count: short.count * count,
        cutLengthM: short.totalLengthM / short.count,
      });
      pushBbs({
        diaMm: el.distDia,
        description: `Long-span bars (${el.distDia} mm @ ${el.distSpacing} mm c/c, alternate cranked, d = ${long.dMm.toFixed(0)} mm)`,
        count: long.count * count,
        cutLengthM: long.totalLengthM / long.count,
      });
    }
  } else if (el.type === "column") {
    wet = (el.l / 1000) * (el.w / 1000) * el.h * count;
    shut = 2 * (el.l / 1000 + el.w / 1000) * el.h * count;
    if (el.steelMode === "bbs") {
      const mainCutM = el.h - (2 * el.coverMm) / 1000 + (2 * 9 * el.mainDia) / 1000;
      pushBbs({
        diaMm: el.mainDia,
        description: `Main bars (${el.mainDia} mm, cut = height - 2 x cover + 2 x 9phi hooks)`,
        count: el.mainBars * count,
        cutLengthM: mainCutM,
      });
      const aMm = el.l - 2 * el.coverMm;
      const bMm = el.w - 2 * el.coverMm;
      stirrupDetailed = stirrupLengthDetailed(aMm, bMm, el.stirrupDia);
      stirrupSimple = stirrupLengthSimple(aMm, bMm, el.stirrupDia);
      const nStirrups = barCount(el.h * 1000, el.stirrupSpacing);
      pushBbs({
        diaMm: el.stirrupDia,
        description: `Stirrups (${el.stirrupDia} mm @ ${el.stirrupSpacing} mm c/c, IS 2502 detailed length)`,
        count: nStirrups * count,
        cutLengthM: stirrupDetailed / 1000,
      });
    }
  } else if (el.type === "beam") {
    wet = el.l * (el.w / 1000) * (el.h / 1000) * count;
    shut = el.l * (2 * (el.h / 1000) + el.w / 1000) * count; // 2 sides + soffit
    if (el.steelMode === "bbs") {
      const mainCutM = el.l - (2 * el.coverMm) / 1000 + (2 * 9 * el.mainDia) / 1000;
      pushBbs({
        diaMm: el.mainDia,
        description: `Main bars (${el.mainDia} mm, ${el.mainBars} nos, cut = span - 2 x cover + 2 x 9phi hooks)`,
        count: el.mainBars * count,
        cutLengthM: mainCutM,
      });
      const aMm = el.w - 2 * el.coverMm;
      const bMm = el.h - 2 * el.coverMm;
      stirrupDetailed = stirrupLengthDetailed(aMm, bMm, el.stirrupDia);
      stirrupSimple = stirrupLengthSimple(aMm, bMm, el.stirrupDia);
      const nStirrups = barCount(el.l * 1000, el.stirrupSpacing);
      pushBbs({
        diaMm: el.stirrupDia,
        description: `Stirrups (${el.stirrupDia} mm @ ${el.stirrupSpacing} mm c/c, IS 2502 detailed length)`,
        count: nStirrups * count,
        cutLengthM: stirrupDetailed / 1000,
      });
    }
  } else if (el.type === "staircase") {
    const steps = el.w;
    const treadM = el.h / 1000;
    const riserM = el.extra1 / 1000;
    const waistM = el.extra2 / 1000;
    const widthM = el.l;
    const horiz = steps * treadM;
    const vert = steps * riserM;
    const slopeM = Math.sqrt(horiz * horiz + vert * vert);
    const waistVol = slopeM * widthM * waistM;
    const stepsVol = steps * (0.5 * treadM * riserM * widthM);
    wet = (waistVol + stepsVol) * count;
    const bottomShut = slopeM * widthM;
    const sideShut = slopeM * waistM * 2 + steps * (0.5 * treadM * riserM * 2);
    const riserShut = steps * riserM * widthM;
    shut = (bottomShut + sideShut + riserShut) * count;
    if (el.steelMode === "bbs") {
      const nMain = barCount(widthM * 1000, el.mainSpacing);
      pushBbs({
        diaMm: el.mainDia,
        description: `Main bars along slope (${el.mainDia} mm @ ${el.mainSpacing} mm c/c)`,
        count: nMain * count,
        cutLengthM: slopeM - (2 * el.coverMm) / 1000 + (2 * 9 * el.mainDia) / 1000,
      });
      const nDist = barCount(slopeM * 1000, el.distSpacing);
      pushBbs({
        diaMm: el.distDia,
        description: `Distribution bars (${el.distDia} mm @ ${el.distSpacing} mm c/c)`,
        count: nDist * count,
        cutLengthM: widthM - (2 * el.coverMm) / 1000,
      });
    }
  } else if (el.type === "round-column") {
    const rM = el.l / 2000;
    wet = Math.PI * rM * rM * el.h * count;
    shut = 2 * Math.PI * rM * el.h * count;
    if (el.steelMode === "bbs") {
      const mainCutM = el.h - (2 * el.coverMm) / 1000 + (2 * 9 * el.mainDia) / 1000;
      pushBbs({
        diaMm: el.mainDia,
        description: `Main bars (${el.mainDia} mm, cut = height - 2 x cover + 2 x 9phi hooks)`,
        count: el.mainBars * count,
        cutLengthM: mainCutM,
      });
      // Circular ties: circumference at core diameter + hooks.
      const coreDiaMm = el.l - 2 * el.coverMm;
      const tieLenMm = Math.PI * coreDiaMm + 2 * 10 * el.stirrupDia;
      const nTies = barCount(el.h * 1000, el.stirrupSpacing);
      pushBbs({
        diaMm: el.stirrupDia,
        description: `Circular ties (${el.stirrupDia} mm @ ${el.stirrupSpacing} mm c/c)`,
        count: nTies * count,
        cutLengthM: tieLenMm / 1000,
      });
    }
  } else if (el.type === "footing") {
    const baseVol = el.l * el.w * el.h;
    let frustumVol = 0;
    if (el.extra1 > 0 && el.extra2 > 0 && el.extra3 > 0) {
      const a1 = el.l * el.w;
      const a2 = el.extra1 * el.extra2;
      frustumVol = (el.extra3 / 3) * (a1 + a2 + Math.sqrt(a1 * a2));
    }
    wet = (baseVol + frustumVol) * count;
    shut = 2 * (el.l + el.w) * el.h * count;
    if (el.steelMode === "bbs") {
      const nX = barCount(el.w * 1000, el.mainSpacing);
      pushBbs({
        diaMm: el.mainDia,
        description: `Bottom bars, X direction (${el.mainDia} mm @ ${el.mainSpacing} mm c/c)`,
        count: nX * count,
        cutLengthM: el.l - (2 * el.coverMm) / 1000 + (2 * 9 * el.mainDia) / 1000,
      });
      const nY = barCount(el.l * 1000, el.mainSpacing);
      pushBbs({
        diaMm: el.mainDia,
        description: `Bottom bars, Y direction (${el.mainDia} mm @ ${el.mainSpacing} mm c/c)`,
        count: nY * count,
        cutLengthM: el.w - (2 * el.coverMm) / 1000 + (2 * 9 * el.mainDia) / 1000,
      });
    }
  }

  const steelKg =
    el.steelMode === "thumb"
      ? wet * (el.thumbPct / 100) * STEEL_DENSITY
      : bbs.reduce((s, r) => s + r.weightKg, 0);

  return {
    wetVolumeM3: wet,
    shutteringM2: shut,
    steelKg,
    thumbKgPerM3: thumbKgPerM3(el.type),
    bbs,
    stirrupLengthDetailedMm: stirrupDetailed,
    stirrupLengthSimpleMm: stirrupSimple,
    errors,
  };
}

/** Material breakdown from wet volume by nominal mix (or a linked design mix). */
export interface RccMaterials {
  wetVolumeM3: number;
  dryVolumeM3: number;
  cementBagsExact: number;
  cementBagsOrder: number;
  cementKgExact: number;
  sandM3: number;
  aggregateM3: number;
  waterLiters: number;
  mixLabel: string;
  wc: number;
}

export function calcRccMaterials(
  wetVolumeM3: number,
  grade: "M10" | "M15" | "M20",
  wastagePct: number,
): RccMaterials {
  const mix = NOMINAL_MIXES[grade];
  const dry = wetVolumeM3 * DRY_CONCRETE_FACTOR * (1 + wastagePct / 100);
  const sum = mix.ratio[0] + mix.ratio[1] + mix.ratio[2];
  const cementVol = (mix.ratio[0] / sum) * dry;
  const cementKgExact = (cementVol / CEMENT_BAG_M3) * CEMENT_BAG_KG;
  return {
    wetVolumeM3,
    dryVolumeM3: dry,
    cementBagsExact: cementVol / CEMENT_BAG_M3,
    cementBagsOrder: Math.ceil(cementVol / CEMENT_BAG_M3),
    cementKgExact,
    sandM3: (mix.ratio[1] / sum) * dry,
    aggregateM3: (mix.ratio[2] / sum) * dry,
    // Water from the UNROUNDED cement mass (not the rounded bag count).
    waterLiters: cementKgExact * mix.wc,
    mixLabel: mix.label,
    wc: mix.wc,
  };
}

/* ---------------- SlabEstimator (shared with MasterRccCore) ---------------- */

export interface SlabInputs {
  slabType: "one-way" | "two-way";
  lyM: number;
  lxM: number;
  thicknessMm: number;
  coverMm: number;
  mainDiaMm: number;
  distDiaMm: number;
  mainSpacingMm: number;
  distSpacingMm: number;
  densityKgM3: number;
  riggingRadiusM: number;
  wastagePct: number;
}

export interface SlabResult {
  wetVolumeM3: number;
  dryVolumeM3: number;
  shortBarsCount: number;
  shortBarsTotalLengthM: number;
  longBarsCount: number;
  longBarsTotalLengthM: number;
  totalSteelKg: number;
  /** steel with wastage applied */
  totalSteelKgWithWastage: number;
  elementWeightKg: number;
  /** required crane capacity = weight x 1.5 / 1000 (tonnes) */
  craneCapacityT: number;
  /** load moment = capacity x radius (tonne-metres) — NOT a capacity */
  loadMomentTm: number;
  lyLxRatio: number;
  oneWayWarning: boolean;
  errors: string[];
}

export function calcSlab(inp: SlabInputs): SlabResult {
  const errors: string[] = [];
  if (!(inp.lyM > 0) || !(inp.lxM > 0) || !(inp.thicknessMm > 0)) {
    errors.push("Long span, short span and thickness must all be greater than 0.");
  }
  if (inp.mainSpacingMm < 75 || inp.mainSpacingMm > 300 || inp.distSpacingMm < 75 || inp.distSpacingMm > 300) {
    errors.push("Bar spacing must be 75-300 mm.");
  }
  if (inp.coverMm >= inp.thicknessMm / 2) {
    errors.push("Cover must be less than half the slab thickness.");
  }
  const wet = inp.lxM * inp.lyM * (inp.thicknessMm / 1000);
  const dry = wet * DRY_CONCRETE_FACTOR;
  const lxMm = inp.lxM * 1000;
  const lyMm = inp.lyM * 1000;
  const elementWeightKg = wet * inp.densityKgM3;
  const craneCapacityT = (elementWeightKg * 1.5) / 1000;
  const loadMomentTm = craneCapacityT * inp.riggingRadiusM;
  const ratio = Math.max(inp.lyM, inp.lxM) / Math.min(inp.lyM, inp.lxM);
  const oneWayWarning = inp.slabType === "two-way" && ratio > 2;

  let short: ReturnType<typeof slabDirectionBars>;
  let long: ReturnType<typeof slabDirectionBars>;
  if (inp.slabType === "two-way") {
    short = slabDirectionBars(lxMm, lyMm, inp.mainDiaMm, inp.mainSpacingMm, inp.coverMm, inp.thicknessMm, true);
    long = slabDirectionBars(lyMm, lxMm, inp.distDiaMm, inp.distSpacingMm, inp.coverMm, inp.thicknessMm, true);
  } else {
    short = slabDirectionBars(lxMm, lyMm, inp.mainDiaMm, inp.mainSpacingMm, inp.coverMm, inp.thicknessMm, false);
    long = slabDirectionBars(lyMm, lxMm, inp.distDiaMm, inp.distSpacingMm, inp.coverMm, inp.thicknessMm, false);
  }
  const totalSteelKg = short.weightKg + long.weightKg;
  return {
    wetVolumeM3: wet,
    dryVolumeM3: dry,
    shortBarsCount: short.count,
    shortBarsTotalLengthM: short.totalLengthM,
    longBarsCount: long.count,
    longBarsTotalLengthM: long.totalLengthM,
    totalSteelKg,
    totalSteelKgWithWastage: totalSteelKg * (1 + inp.wastagePct / 100),
    elementWeightKg,
    craneCapacityT,
    loadMomentTm,
    lyLxRatio: ratio,
    oneWayWarning,
    errors,
  };
}
