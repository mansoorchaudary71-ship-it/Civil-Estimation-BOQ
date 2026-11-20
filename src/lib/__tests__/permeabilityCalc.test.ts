import { test } from "node:test";
import assert from "node:assert/strict";
import { temperatureCorrectionFactor, constantHeadK, fallingHeadK, kToMetresPerDay, hazenK, averageK, VISCOSITY_RATIO_TABLE } from "../permeabilityCalc";
const approx = (a: number, b: number, tol = 1e-4) => assert.ok(Math.abs(a - b) <= tol, `${a} ≈ ${b}`);
test("ASTM table values are exact at 10/15/20/25/30 °C", () => {
  for (const row of VISCOSITY_RATIO_TABLE) approx(temperatureCorrectionFactor(row.tempC), row.rt, 0.001);
});
test("old polynomial was ~4% low at 10 °C; table gives 1.301", () => {
  approx(temperatureCorrectionFactor(10), 1.301, 0.001);
  const poly = 1 - 0.023 * (10 - 20) + 0.0002 * (10 - 20) ** 2;
  assert.ok(Math.abs(poly - 1.301) / 1.301 > 0.03); // documents the old error
});
test("worked constant-head: Q=500,L=10,A=50,h=50,t=60 → 3.33×10⁻² cm/s", () => {
  approx(constantHeadK(500, 10, 50, 50, 60), 0.0333, 0.0001);
  approx(kToMetresPerDay(0.0333), 28.8, 0.1);
});
test("worked falling-head: a=5,L=10,A=50,t=120,h1=100,h2=50 → 5.78×10⁻³ cm/s", () => {
  approx(fallingHeadK(5, 10, 50, 120, 100, 50), 0.00578, 0.00005);
});
test("Hazen k≈0.01·D10² and 3-trial averaging; h2≥h1 throws", () => {
  approx(hazenK(0.3), 0.0009, 1e-6);
  approx(averageK([0.01, 0.02, 0.03]), 0.02);
  assert.throws(() => fallingHeadK(5, 10, 50, 120, 50, 100));
});
