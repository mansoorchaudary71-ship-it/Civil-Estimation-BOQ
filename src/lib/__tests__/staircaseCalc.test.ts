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

test("new defaults R170/T280: V_steps=0.286, L_incl=3.04, V_waist=0.547, V_wet=0.833, shutter=5.69 m2", () => {
  // (n−1) goings, not n: inclined length 3.28 -> 3.04 m, waist 0.590 ->
  // 0.547 m³, wet 0.876 -> 0.833 m³, formwork 5.97 -> 5.69 m².
  const r = designStaircase();
  assert.equal(r.errors.length, 0);
  assert.equal(r.twoRPlusT, 620);
  assert.equal(r.ergonomicsOk, true);
  assert.equal(r.totalRunM, 2.52); // (10−1) x 0.28, was 2.80
  approx(r.stepVolM3, 0.286, 0.005);
  approx(r.inclinedLengthM, 3.04, 0.01);
  approx(r.waistVolM3, 0.547, 0.005);
  approx(r.wetVolM3, 0.833, 0.005);
  approx(r.formworkM2, 5.69, 0.05);
});

test("old quantity vector at R150/T250 (1% rule cross-check): V_wet 0.712, steel 55.9 kg at 1%", () => {
  const r = designStaircase({ riseM: 0.15, treadM: 0.25 });
  approx(r.wetVolM3, 0.712, 0.005); // was 0.750 with n x tread
  approx(r.onePctRuleKg, 55.9, 1); // 0.712 x 1% x 7850 = 55.9
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

test("multi-flight span is ONE flight's going + landing/2 (was total run, Mu ~3x high)", () => {
  const r = designStaircase({ shape: "dog-legged", flight1Steps: 5, flight2Steps: 5, landingCount: 1 });
  approx(r.effSpanM, 1.72, 0.01); // (5−1) x 0.28 + 1.2/2 (old code: 2.0 with n x tread)
  approx(r.muKNmPerM, 5.83, 0.05); // old code: 7.88
  assert.equal(r.astReqMm2PerM, 180); // minimum steel governs (old code: 456)
  const uneven = designStaircase({ shape: "l-shaped", flight1Steps: 6, flight2Steps: 4, landingCount: 1 });
  approx(uneven.effSpanM, 2.0, 0.01); // longer flight (6−1) x 0.28 + 0.6
});

test("long straight flight over Mu,lim is a hard error, never a silent NaN", () => {
  const r = designStaircase({ shape: "straight", steps: 24 });
  approx(r.muKNmPerM, 81.74, 0.05); // was 89.01 with n x tread
  assert.ok(!Number.isNaN(r.astReqMm2PerM));
  assert.ok(r.errors.some((e) => e.includes("exceeds the limiting moment")));
  assert.ok(r.errors.some((e) => e.includes("51.5")));
});
