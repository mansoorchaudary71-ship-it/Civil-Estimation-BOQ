import { test } from "node:test";
import assert from "node:assert/strict";
import { calcRoomArea, calcCarpetFromSuperBuiltUp, validateRoomArea } from "../roomAreaCalc";

const approx = (a: number, b: number, tol = 0.01) =>
  assert.ok(Math.abs(a - b) <= tol, `expected ${a} ≈ ${b} (±${tol})`);

test("worked example: 4x3 m, t=0.23, bedroom -> carpet 12 m2 = 129.17 sq ft = 0.474 marla; built-up 15.43 m2 = 166.08 sq ft; PASS", () => {
  const r = calcRoomArea({
    roomType: "bedroom", lengthM: 4, widthM: 3, wallThicknessM: 0.23,
    ceilingHeightM: null, loadingFactorPct: 25,
  });
  assert.deepEqual(validateRoomArea({
    roomType: "bedroom", lengthM: 4, widthM: 3, wallThicknessM: 0.23,
    ceilingHeightM: null, loadingFactorPct: 25,
  }), []);
  approx(r.carpetAreaM2, 12);
  approx(r.carpet.sqft, 129.17);
  approx(r.carpet.marla, 0.474, 0.001);
  approx(r.builtUpAreaM2, 15.43, 0.01);
  approx(r.builtUp.sqft, 166.1, 0.05); // spec prints 166.08 from the rounded 15.43 m2
  approx(r.superBuiltUpAreaM2, 19.29, 0.01);
  assert.equal(r.passes, true);
  assert.equal(r.minAreaM2, 9.5);
  assert.equal(r.minWidthM, 2.4);
});

test("bathroom 1.5x1.2 m: 1.80 m2 < 2.8 -> FAIL by 1.00 m2 (old code wrongly passed at 1.8)", () => {
  const r = calcRoomArea({
    roomType: "bathroom", lengthM: 1.5, widthM: 1.2, wallThicknessM: 0.23,
    ceilingHeightM: null, loadingFactorPct: 25,
  });
  approx(r.carpetAreaM2, 1.8);
  assert.equal(r.passes, false);
  approx(r.failByAreaM2, 1.0);
});

test("width also gates compliance: a long narrow bedroom fails on width", () => {
  const r = calcRoomArea({
    roomType: "bedroom", lengthM: 5, widthM: 2, wallThicknessM: 0.23,
    ceilingHeightM: null, loadingFactorPct: 25,
  });
  assert.equal(r.passes, false);
  approx(r.failByWidthM, 0.4);
  assert.equal(r.failByAreaM2, 0);
});

test("reverse mode: super built-up 19.29 m2 -> carpet ~12 m2", () => {
  const { carpetAreaM2, builtUpAreaM2 } = calcCarpetFromSuperBuiltUp(19.29, 0.23, 4, 3, 25);
  approx(builtUpAreaM2, 15.43, 0.01);
  approx(carpetAreaM2, 12, 0.05);
});

test("validation rejects out-of-range dims", () => {
  const bad = {
    roomType: "bedroom" as const, lengthM: 0.2, widthM: 3, wallThicknessM: 0.23,
    ceilingHeightM: null, loadingFactorPct: 25,
  };
  assert.ok(validateRoomArea(bad).length > 0);
});
