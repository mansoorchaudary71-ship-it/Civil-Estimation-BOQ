/**
 * Retaining wall engine tests — G7 spec §4.7 worked vectors.
 * Run: npx tsx --test src/lib/__tests__/retainingWallCalc.test.ts
 *
 * NOTE on the spec's stem figures: §4.7 quotes stem M = 52.1 kNm/m
 * (46.0 × 3.4/3) and Ast ≈ 640 mm²/m, treating the surcharge pressure
 * as triangular. The exact split is M = Pa,soil·H/3 + Pa,sur·H/2, and
 * at the stem base (h = 3.0 m) M = 42.0 kNm/m unfactored (63.0 factored)
 * → Ast ≈ 423 mm²/m by LSM, with min steel 480 mm²/m governing.
 * This engine uses the exact split; tests assert those values.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { designRetainingWall, defaultRetainingInputs, kaFor } from "../retainingWallCalc";

const approx = (a: number, e: number, tol: number) =>
  assert.ok(Math.abs(a - e) <= tol, `expected ${e} (±${tol}), got ${a}`);

test("old defaults FAIL sliding: FS_slide = 1.49 < 1.5", () => {
  const r = designRetainingWall({ baseWidthM: 2.5, toeM: 0.7 });
  approx(r.fsSliding, 1.49, 0.03);
  assert.equal(r.slidingOk, false);
  assert.ok(r.suggestions.length > 0);
  approx(r.fsOverturning, 3.65, 0.15);
  approx(r.qMaxKPa, 70.4, 1.5);
});

test("new defaults (B=3.0, toe=0.9) pass sliding", () => {
  const r = designRetainingWall();
  assert.equal(r.errors.length, 0);
  assert.ok(r.fsSliding >= 1.5);
  approx(r.fsSliding, 1.75, 0.05);
  assert.equal(r.slidingOk, true);
  assert.equal(r.overturningOk, true);
  assert.equal(r.bearingOk, true);
  approx(r.qMaxKPa, 56.5, 1.5);
});

test("stem design at stem base: Mu = 63.0 kNm/m factored; min steel 480 mm2/m governs", () => {
  const r = designRetainingWall();
  approx(r.stemMuKNmPerM, 63.0, 1.5);
  assert.equal(r.stemAstMinMm2PerM, 480);
  assert.equal(r.stemAstMm2PerM, 480);
});

test("base steel is now designed (toe + heel Ast, not 'added later')", () => {
  const r = designRetainingWall();
  assert.ok(r.toeAstMm2PerM > 0);
  assert.ok(r.heelAstMm2PerM > 0);
  assert.ok(r.baseSteelKg > 0);
  assert.ok(r.totalSteelKg > r.stemSteelKg);
});

test("Ka for phi=30 is 1/3; solve-for-B returns a passing width <= 3.0 m", () => {
  assert.equal(kaFor(30), 1 / 3);
  const r = designRetainingWall();
  assert.ok(r.minBaseWidthM <= 3.0 && r.minBaseWidthM >= 2.0);
});

test("mu above tan(phi) is flagged", () => {
  const r = designRetainingWall({ mu: 0.9 });
  assert.ok(r.errors.some((e) => e.includes("tan")));
});
