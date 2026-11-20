/**
 * Staircase engine tests — G7 spec §4.8 worked vectors.
 * Run: npx tsx --test src/lib/__tests__/staircaseCalc.test.ts
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { designStaircase, defaultStaircaseInputs } from "../staircaseCalc";

const approx = (a: number, e: number, tol: number) =>
  assert.ok(Math.abs(a - e) <= tol, `expected ${e} (±${tol}), got ${a}`);

test("old defaults fail 2R+T: R150/T250 -> 550 mm warning", () => {
  const r = designStaircase({ riseM: 0.15, treadM: 0.25 });
  assert.equal(r.twoRPlusT, 550);
  assert.equal(r.ergonomicsOk, false);
  assert.ok(r.warnings.length > 0);
});

test("new defaults R170/T280: V_steps=0.286, L_incl=3.28, V_waist=0.590, V_wet=0.876, shutter=5.97 m2", () => {
  const r = designStaircase();
  assert.equal(r.errors.length, 0);
  assert.equal(r.twoRPlusT, 620);
  assert.equal(r.ergonomicsOk, true);
  approx(r.stepVolM3, 0.286, 0.005);
  approx(r.inclinedLengthM, 3.277, 0.01);
  approx(r.waistVolM3, 0.590, 0.005);
  approx(r.wetVolM3, 0.876, 0.005);
  approx(r.formworkM2, 5.97, 0.05);
});

test("old quantity vector at R150/T250 (1% rule cross-check): V_wet 0.750, steel 61.8 kg at 1%", () => {
  const r = designStaircase({ riseM: 0.15, treadM: 0.25 });
  approx(r.wetVolM3, 0.750, 0.005);
  approx(r.onePctRuleKg, 58.9, 1); // 0.750 x 1% x 7850 = 58.9 (61.8 included 5% wastage in the old UI)
  assert.equal(r.materials.cementBags, 7);
});

test("designed steel: main bars from the waist moment, distribution 0.12%", () => {
  const r = designStaircase();
  assert.equal(r.mainBars, 9);
  assert.ok(r.astProvidedMm2PerM >= r.astReqMm2PerM);
  assert.ok(r.designedSteelKg > 0);
  assert.ok(r.distSteelKg > 0);
  assert.equal(r.distAstMm2PerM, 180); // 0.12% of 1000x150
});

test("flight split from floor height 3.0 m", () => {
  const r = designStaircase({ floorHeightM: 3.0 });
  assert.equal(r.risersForFloor, 18);
  assert.ok(r.flightSplit.includes("9 + 9"));
});

test("dog-legged stairwell size", () => {
  const r = designStaircase({ shape: "dog-legged", landingCount: 1 });
  approx(r.stairwellWidthM, 2.5, 0.05);
  assert.ok(r.landingVolM3 > 0);
});
