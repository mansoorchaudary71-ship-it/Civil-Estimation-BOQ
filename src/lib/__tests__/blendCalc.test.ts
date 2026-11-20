import { test } from "node:test";
import assert from "node:assert/strict";
import { blendPassing, blendedGs, power45Line, batchQuantities, batchCost, validatePassing, BLEND_EXAMPLE } from "../blendCalc";
const approx = (a: number, b: number, tol = 0.01) => assert.ok(Math.abs(a - b) <= tol, `${a} ≈ ${b}`);
test("worked: bins 100/90/100/100 at 25% each → 97.5% at that sieve", () => {
  const stocks = [100, 90, 100, 100].map((p, i) => ({ name: `Bin ${i}`, gs: 2.65, costPerTonne: null, passing: { 20: p } }));
  approx(blendPassing(stocks, [25, 25, 25, 25])[20], 97.5);
});
test("worked: G_blend 40/35/25, Gs 2.65/2.70/2.60 → ≈2.65", () => {
  approx(blendedGs(BLEND_EXAMPLE.stockpiles, BLEND_EXAMPLE.proportions), 2.65, 0.01);
});
test("0.45-power line: 100% at max size, ~73% at half size", () => {
  approx(power45Line(20, 20), 100); approx(power45Line(10, 20), 73.2, 0.5);
});
test("batch quantities + cost for 1000 kg batch", () => {
  const q = batchQuantities(1000, [40, 35, 25]);
  assert.deepEqual(q, [400, 350, 250]);
  const stocks = BLEND_EXAMPLE.stockpiles.map((s, i) => ({ ...s, costPerTonne: [2000, 2500, 1500][i] }));
  approx(batchCost(1000, [40, 35, 25], stocks) as number, 400 * 2 + 350 * 2.5 + 250 * 1.5, 0.01);
  assert.equal(batchCost(1000, [40, 35, 25], BLEND_EXAMPLE.stockpiles), null); // no rates → cost hidden, not 0
});
test("validation: % passing >100 and non-monotonic are flagged", () => {
  assert.ok(validatePassing({ 20: 110, 10: 50 }).length > 0);
  assert.ok(validatePassing({ 20: 50, 10: 80 }).length > 0);
  assert.deepEqual(validatePassing({ 20: 100, 10: 80 }), []);
});
