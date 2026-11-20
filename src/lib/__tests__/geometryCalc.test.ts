/**
 * Universal geometry engine tests — G7 spec §4.11 worked vectors.
 * Run: npx tsx --test src/lib/__tests__/geometryCalc.test.ts
 *
 * NOTE on the spec's formwork figure: §4.11 quotes sides-only formwork
 * 4.20 − 0.09 = 4.11 m², but the bottom is W·L = 0.3 × 3.0 = 0.90 m²,
 * not 0.09 m², so sides-only formwork is 4.20 − 0.90 = 3.30 m².
 * This engine uses 3.30 m²; the test asserts it.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  calcRectangular, calcCircular, calcTube, calcPrecast, calcRoof,
  calcTrapFooting, calcStaircaseTab, defaultRectInputs,
} from "../geometryCalc";

const approx = (a: number, e: number, tol: number) =>
  assert.ok(Math.abs(a - e) <= tol, `expected ${e} (±${tol}), got ${a}`);

test("rect defaults: V=0.36, formwork sides-only 3.30 m2, main 10.66 kg", () => {
  const r = calcRectangular(defaultRectInputs);
  assert.equal(r.errors.length, 0);
  assert.equal(r.volM3, 0.36);
  assert.equal(r.formworkM2, 3.3);
  assert.equal(r.formworkAllSidesM2, 4.2);
  approx(r.mainSteelKg, 10.66, 0.05);
});

test("stirrups use the IS 2502 detailed length (1.232 m) — 21 nos = 10.22 kg, not 9.95 kg", () => {
  const r = calcRectangular(defaultRectInputs);
  approx(r.stirrupSteelKg, 10.22, 0.1);
  assert.ok(r.totalSteelKg > 20);
});

test("bar sizes are inputs, not hardcoded 12/8 mm", () => {
  const r = calcRectangular({ ...defaultRectInputs, mainDiaMm: 16, stirrupDiaMm: 10 });
  assert.ok(r.mainSteelKg > 10.66);
  assert.ok(r.stirrupSteelKg > 0);
});

test("circular: V and spiral steel computed", () => {
  const r = calcCircular({ diaM: 0.4, heightM: 3, mainDiaMm: 12, mainBarCount: 6, tieDiaMm: 8, tiePitchM: 0.15, coverMm: 25, fck: 25, wastagePct: 5 });
  approx(r.volM3, 0.377, 0.005);
  assert.ok(r.totalSteelKg > 15);
});

test("tube: hollow volume and weight", () => {
  const r = calcTube({ odM: 1, idM: 0.8, lengthM: 5, fck: 25, wastagePct: 5 });
  approx(r.volM3, 1.414, 0.01);
  approx(r.weightKg ?? 0, 3393, 5);
});

test("trapezoidal footing reuses the frustum rule: V = 1.62 m3", () => {
  const r = calcTrapFooting({ baseLengthM: 2.2, baseWidthM: 2.2, baseDepthM: 0.2, topLengthM: 0.6, topWidthM: 0.6, slopeDepthM: 0.3, fck: 25, wastagePct: 5 });
  approx(r.volM3, 1.62, 0.02);
});

test("roof: rafter, pitch, purlins and sheets", () => {
  const r = calcRoof({ spanM: 8, riseM: 2, runM: 12, purlinSpacingM: 1.2, battenSpacingM: 0.6, sheetWidthM: 1.0 });
  approx(r.rafterM, 4.47, 0.02);
  approx(r.pitchDeg, 26.6, 0.2);
  assert.ok(r.sheets > 0 && r.purlinsM > 0);
});

test("staircase tab delegates to the shared engine (designed steel, not 120 kg/m3)", () => {
  const r = calcStaircaseTab({});
  assert.equal(r.twoRPlusT, 620);
  assert.ok(r.designedSteelKg > 0);
  // The old 120 kg/m3 rule would give 0.876 x 120 = 105 kg; designed steel differs.
  assert.ok(Math.abs(r.designedSteelKg - 105) > 5);
});

test("materials and cost are shown in-UI", () => {
  const r = calcRectangular(defaultRectInputs);
  assert.ok(r.materials.cementBags > 0);
  assert.ok(r.totalCost != null && r.totalCost > 0);
});
