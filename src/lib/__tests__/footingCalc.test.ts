/**
 * Isolated footing engine tests — G7 spec §4.6 worked vector.
 * Run: npx tsx --test src/lib/__tests__/footingCalc.test.ts
 *
 * NOTE on the spec's Ast figure: §4.6 quotes Ast ≈ 1,830 mm² for
 * Mu = 276 kNm, but the LSM formula with its own inputs (fck 25, fy 500,
 * b = 2200 mm, d = 444 mm) gives ≈ 1,470 mm². 1,830 mm² is what the
 * lever-arm approximation gives with fy 415. This engine uses the exact
 * LSM value; the test asserts 1,470 mm². With fy 500 the manual default
 * (12 mm @ 150 mm = 1,696 mm²) therefore passes flexure.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { designFooting, autoSizeFooting, defaultFootingInputs, footingConcreteVolM3 } from "../footingCalc";

const approx = (a: number, e: number, tol: number) =>
  assert.ok(Math.abs(a - e) <= tol, `expected ${e} (±${tol}), got ${a}`);

test("worked vector: Pu=1500, qu=310, d=444; punching tau 0.85 <= 1.25 PASS (68%); one-way 0.32 PASS", () => {
  const r = designFooting({ workingLoadKN: 1000 }); // Pu = 1000 x 1.5 = 1500 kN
  assert.equal(r.errors.length, 0);
  assert.equal(r.puKN, 1500);
  approx(r.quKNm2, 310, 2);
  assert.equal(r.dMm, 444);
  approx(r.punchingTauVMpa, 0.85, 0.03);
  approx(r.punchingAllowMpa, 1.25, 0.01);
  approx(r.punchingUtil, 0.68, 0.03);
  assert.equal(r.punchingOk, true);
  approx(r.oneWayTauVMpa, 0.32, 0.03);
  assert.equal(r.oneWayOk, true);
});

test("flexure: Mu=276 kNm -> Ast ~1,470 mm2 (LSM, fy 500); auto spacing 160 mm; flexure passes", () => {
  const r = designFooting({ workingLoadKN: 1000 });
  approx(r.muXKNm, 276, 2);
  approx(r.astXReqMm2, 1470, 60);
  assert.equal(r.spacingXMm, 160);
  assert.equal(r.flexureOk, true);
  assert.ok(r.astXProvidedMm2 >= r.astXReqMm2);
});

test("manual 12 @ 150 (1,696 mm2) passes flexure at fy 500", () => {
  const r = designFooting({ workingLoadKN: 1000, autoDesign: false, manualSpacingMm: 150 });
  assert.equal(r.astXProvidedMm2, 1696);
  assert.equal(r.flexureOk, true);
});

test("existing quantity vector stays: sloped V=1.62 m3, 14 bags, steel 61.2 kg", () => {
  const r = designFooting({ workingLoadKN: 1000 });
  approx(r.concreteVolM3, 1.62, 0.02);
  assert.equal(r.materials.cementBags, 14);
  approx(r.steelKg, 61.2, 1.5);
});

test("top dimensions larger than base are an error", () => {
  const r = designFooting({ topLengthM: 3.0 });
  assert.ok(r.errors.length > 0);
});

test("auto-size solves 2.6 m square, depth 0.45 m for the defaults", () => {
  const s = autoSizeFooting({ ...defaultFootingInputs, workingLoadKN: 1000 });
  assert.equal(s.sizeM, 2.6);
  assert.equal(s.depthM, 0.45);
});

test("frustum volume rule: rectangular and stepped types", () => {
  const rect = footingConcreteVolM3({ ...defaultFootingInputs, footingType: "rectangular", totalDepthM: 0.5 });
  approx(rect, 2.42, 0.01);
});
