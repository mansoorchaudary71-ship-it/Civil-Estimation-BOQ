/**
 * RCC engine tests — run with:
 *   npx tsx --test src/lib/__tests__/rccCalc.test.ts
 * (plain node:test + node:assert, same pattern as steelCalc.test.ts)
 *
 * Every worked example is from the G2 spec §2, hand-verified there.
 * Regression vectors: the old "Exact BBS" column bug (2,001 bars /
 * 7,105.89 kg for one 300x300 column) and the old crane formula.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  calcRccElement,
  calcRccMaterials,
  calcSlab,
  defaultRccElement,
  effectiveDepth,
  barCount,
  thumbKgPerM3,
  type RccElementInput,
} from "../rccCalc";
import { stirrupLengthDetailed, stirrupLengthSimple } from "../steelCalc";

const approx = (actual: number, expected: number, tol = 1e-9) =>
  assert.ok(
    Math.abs(actual - expected) <= tol,
    `expected ${expected} (±${tol}), got ${actual}`,
  );

test("slab 4x3x150 thumb 1%: wet 1.80, shuttering includes edges (14.10), steel 141.30", () => {
  const el: RccElementInput = { ...defaultRccElement("slab"), l: 4, w: 3, h: 150 };
  const r = calcRccElement(el);
  approx(r.wetVolumeM3, 1.8, 1e-9);
  // soffit 12.00 + edges 2 x (4+3) x 0.15 = 2.10 -> 14.10 (old code: 12.00 only)
  assert.equal(r.shutteringM2.toFixed(2), "14.10");
  approx(r.steelKg, 141.3, 0.01);
  assert.equal(r.thumbKgPerM3, 78.5);
  assert.deepEqual(r.errors, []);
});

test("column 300x300x3 thumb 2%: wet 0.27, shuttering 3.60, steel 42.39", () => {
  const el: RccElementInput = { ...defaultRccElement("column") };
  const r = calcRccElement(el);
  assert.equal(r.wetVolumeM3, 0.27);
  assert.equal(r.shutteringM2.toFixed(2), "3.60");
  approx(r.steelKg, 42.39, 0.01);
  assert.equal(r.thumbKgPerM3, 157);
});

test("REGRESSION: column exact BBS must never be 2,001 bars / 7,105.89 kg", () => {
  const el: RccElementInput = {
    ...defaultRccElement("column"),
    steelMode: "bbs",
    mainBars: 4,
    mainDia: 16,
    stirrupDia: 8,
    stirrupSpacing: 150,
  };
  const r = calcRccElement(el);
  const mainRow = r.bbs.find((b) => b.description.startsWith("Main bars"));
  assert.ok(mainRow, "main bars row exists");
  assert.equal(mainRow!.count, 4);
  assert.ok(r.bbs.every((b) => b.count < 100), "no row may have hundreds of bars");
  assert.ok(r.steelKg < 200, `total steel ${r.steelKg} kg must be sane for one column`);
  assert.ok(r.steelKg > 20, `total steel ${r.steelKg} kg must include stirrups`);
  // stirrups: ceil(3000/150)+1 = 21, detailed length 1244 mm for 300x450? here 300x300 cover 40:
  // A = B = 220 -> 2x440 + 160 - 96 = 944 mm
  const stirrupRow = r.bbs.find((b) => b.description.startsWith("Stirrups"));
  assert.equal(stirrupRow!.count, 21);
  assert.equal(r.stirrupLengthDetailedMm, 944);
  assert.equal(r.stirrupLengthSimpleMm, 1072); // 2x440 + 24x8 = 1072 (labelled approx)
});

test("beam 4 m, 230x450, thumb 1.5%: wet 0.414, shuttering 4.52, steel 48.75", () => {
  const el: RccElementInput = { ...defaultRccElement("beam") };
  const r = calcRccElement(el);
  approx(r.wetVolumeM3, 0.414, 1e-9);
  assert.equal(r.shutteringM2.toFixed(2), "4.52");
  approx(r.steelKg, 48.75, 0.01);
  assert.equal(r.thumbKgPerM3, 117.75);
});

test("staircase defaults: concrete 1.87 m3", () => {
  const el: RccElementInput = { ...defaultRccElement("staircase") };
  const r = calcRccElement(el);
  approx(r.wetVolumeM3, 1.8746, 0.005);
  assert.equal(r.wetVolumeM3.toFixed(2), "1.87");
});

test("round column 300 mm dia x 3 m: volume pi r^2 h", () => {
  const el: RccElementInput = { ...defaultRccElement("round-column") };
  const r = calcRccElement(el);
  approx(r.wetVolumeM3, Math.PI * 0.15 * 0.15 * 3, 1e-9);
  assert.equal(r.wetVolumeM3.toFixed(3), "0.212");
});

test("footing: rectangular base + frustum (AGENTS.md formula)", () => {
  const el: RccElementInput = { ...defaultRccElement("footing") };
  const r = calcRccElement(el);
  // base 1.5x1.5x0.3 = 0.675; frustum 0.3/3 x (2.25 + 0.36 + sqrt(0.81)) = 0.351
  approx(r.wetVolumeM3, 1.026, 1e-9);
  approx(r.shutteringM2, 1.8, 1e-9); // 2 x (1.5+1.5) x 0.3, base sides only
});

test("stirrup lengths: detailed is canonical, simple is the labelled approximation", () => {
  // 300x450 beam, cover 40, dia 8: A=220, B=370
  assert.equal(stirrupLengthDetailed(220, 370, 8), 1244);
  assert.equal(stirrupLengthSimple(220, 370, 8), 1372);
});

test("effective depth d = D - (cover + phi/2)", () => {
  assert.equal(effectiveDepth(150, 20, 12), 124);
  assert.equal(effectiveDepth(150, 20, 10), 125);
  assert.equal(effectiveDepth(450, 25, 16), 417);
});

test("bar count: ceil(span/spacing) + 1", () => {
  assert.equal(barCount(5000, 150), 35);
  assert.equal(barCount(4000, 150), 28);
  assert.equal(barCount(3000, 150), 21);
});

test("materials: 15 m3 wet, 1:2:4, 5% wastage — water from UNROUNDED cement (2,496 L)", () => {
  const m = calcRccMaterials(15, "M15", 5);
  approx(m.dryVolumeM3, 24.255, 0.001);
  assert.equal(m.dryVolumeM3.toFixed(2), "24.26");
  assert.equal(m.cementBagsExact.toFixed(2), "99.86");
  assert.equal(m.cementBagsOrder, 100);
  approx(m.sandM3, 6.93, 0.01);
  approx(m.aggregateM3, 13.86, 0.01);
  // 100 rounded bags x 50 kg x 0.5 = 2,500 L is WRONG; unrounded gives 2,496 L.
  approx(m.waterLiters, 2496, 1);
  assert.ok(m.waterLiters < 2500);
});

test("slab defaults (two-way 5x4x150): wet 3.00, dry 4.62, steel ~209.8 kg (not 210.71)", () => {
  const r = calcSlab({
    slabType: "two-way",
    lyM: 5,
    lxM: 4,
    thicknessMm: 150,
    coverMm: 20,
    mainDiaMm: 12,
    distDiaMm: 10,
    mainSpacingMm: 150,
    distSpacingMm: 150,
    densityKgM3: 2400,
    riggingRadiusM: 5,
    wastagePct: 5,
  });
  assert.equal(r.wetVolumeM3, 3);
  assert.equal(r.dryVolumeM3, 4.62);
  assert.equal(r.shortBarsCount, 35);
  assert.equal(r.longBarsCount, 28);
  // Correct method: d = D - (cover + phi/2), 0.42d crank on alternate bars only.
  // Spec §4.3 says "~207 kg" (loose); the exact hand-computed value is 209.8 kg.
  approx(r.totalSteelKg, 209.8, 0.5);
  assert.ok(r.totalSteelKg < 210.71, "must be below the old wrong 210.71 kg");
  assert.deepEqual(r.errors, []);
});

test("slab one-way defaults: steel 208.6 kg, no crank", () => {
  const r = calcSlab({
    slabType: "one-way",
    lyM: 5,
    lxM: 4,
    thicknessMm: 150,
    coverMm: 20,
    mainDiaMm: 12,
    distDiaMm: 10,
    mainSpacingMm: 150,
    distSpacingMm: 150,
    densityKgM3: 2400,
    riggingRadiusM: 5,
    wastagePct: 5,
  });
  approx(r.totalSteelKg, 208.6, 0.5);
});

test("REGRESSION: crane capacity is 10.80 t and load moment 54.0 t.m — separate numbers", () => {
  const r = calcSlab({
    slabType: "two-way",
    lyM: 5,
    lxM: 4,
    thicknessMm: 150,
    coverMm: 20,
    mainDiaMm: 12,
    distDiaMm: 10,
    mainSpacingMm: 150,
    distSpacingMm: 150,
    densityKgM3: 2400,
    riggingRadiusM: 5,
    wastagePct: 5,
  });
  assert.equal(r.elementWeightKg, 7200);
  assert.equal(r.craneCapacityT, 10.8);
  assert.equal(r.loadMomentTm, 54.0);
});

test("two-way warning when ly/lx > 2", () => {
  const r = calcSlab({
    slabType: "two-way",
    lyM: 6,
    lxM: 2.5,
    thicknessMm: 150,
    coverMm: 20,
    mainDiaMm: 12,
    distDiaMm: 10,
    mainSpacingMm: 150,
    distSpacingMm: 150,
    densityKgM3: 2400,
    riggingRadiusM: 5,
    wastagePct: 5,
  });
  assert.equal(r.lyLxRatio, 2.4);
  assert.equal(r.oneWayWarning, true);
});

test("validation: bad dims and spacing produce field-level errors", () => {
  const el: RccElementInput = { ...defaultRccElement("slab"), l: 0, steelMode: "bbs", mainSpacing: 50 };
  const r = calcRccElement(el);
  assert.ok(r.errors.length >= 2);
});
