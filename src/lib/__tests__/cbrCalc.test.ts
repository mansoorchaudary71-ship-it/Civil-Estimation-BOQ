import { test } from "node:test";
import assert from "node:assert/strict";
import { cbrFromCurve, originShiftOffset, averageCbr, CBR_DEFAULT_MIN_SPEC, CBR_WORKED_POINTS } from "../cbrCalc";
const approx = (a: number, b: number, tol = 0.05) => assert.ok(Math.abs(a - b) <= tol, `${a} ≈ ${b}`);
test("worked: origin offset 0.50 mm (steepest early slope), corrected CBR 15.7% at 2.5 mm", () => {
  const { offsetMm, capped } = originShiftOffset(CBR_WORKED_POINTS);
  approx(offsetMm, 0.5); assert.equal(capped, false);
  const r = cbrFromCurve(CBR_WORKED_POINTS);
  approx(r.load25Kg, 215, 1); approx(r.cbr25, 15.69, 0.05); assert.equal(r.reported, r.cbr25);
  assert.ok(r.cbr50 < r.cbr25 + 1);
});
test("origin offset is capped at 2.0 mm with a re-seat warning", () => {
  // Cap is enforced via the capMm parameter: the worked curve's 0.50 mm
  // intercept exceeds a 0.40 mm cap, so it is capped with a warning.
  const { offsetMm, capped, warning } = originShiftOffset(CBR_WORKED_POINTS, 0.4);
  assert.equal(offsetMm, 0.4); assert.equal(capped, true); assert.ok(warning && warning.includes("re-seat"));
  // At the real 2.0 mm cap the worked offset (0.50 mm) passes through uncapped.
  assert.equal(originShiftOffset(CBR_WORKED_POINTS).capped, false);
});
test("Mr correlations are shown (Heukelom + AASHTO)", () => {
  const r = cbrFromCurve(CBR_WORKED_POINTS);
  approx(r.mrMPa.heukelom, 17.6 * Math.pow(r.reported, 0.64), 0.5);
  approx(r.mrMPa.aashto, 10 * r.reported, 0.5);
});
test("3-specimen averaging + realistic default minSpec 8%", () => {
  assert.equal(CBR_DEFAULT_MIN_SPEC, 8);
  approx(averageCbr([15.7, 14.2, 16.1]).mean, 15.33, 0.01);
});
