/**
 * Master calculators (hub) tests — F2 staircase fix + rcc_columns guard.
 * Run: npx tsx --test src/lib/__tests__/masterCalculators.test.ts
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { calculatorsList } from "../masterCalculators";

const approx = (a: number, e: number, tol: number) =>
  assert.ok(Math.abs(a - e) <= tol, `expected ${e} (±${tol}), got ${a}`);

function compute(id: string, inputs: Record<string, number>) {
  const calc = calculatorsList.find((c) => c.id === id);
  assert.ok(calc, `calculator ${id} must exist`);
  return calc!.compute(inputs, {}, true).results;
}

test("F2: stairs use (n−1) goings — 20 steps, T 0.30, R 0.15 gives 6.441 m, not 6.708 m", () => {
  const r = compute("stairs", { steps: 20, tread: 0.3, riser: 0.15, width: 1.2, waist: 0.15 });
  // Flight length √(((20−1)·0.30)² + (20·0.15)²) = √(5.7² + 3²) = 6.441 m.
  // Step vol 0.5·0.3·0.15·1.2·20 = 0.540 m³; waist vol 6.441·1.2·0.15 = 1.159 m³.
  approx(parseFloat(String(r["Concrete Vol (Wet)"])), 1.699, 0.001);
  approx(parseFloat(String(r["Concrete Vol (Dry)"])), 2.617, 0.001);
  // The old n-tread length (6.708 m) would have given 1.747 m³ wet.
  assert.notEqual(parseFloat(String(r["Concrete Vol (Wet)"])).toFixed(3), "1.747");
});

test("zero-guard: rcc_columns spacing 0 gives 0 stirrups, never Infinity", () => {
  const r = compute("rcc_columns", { count: 10, L: 0.4, W: 0.4, H: 3, spacing: 0 });
  assert.equal(r["Total Stirrups"], 0);
  assert.ok(Number.isFinite(Number(r["Total Stirrups"])));
  // Normal spacing is unchanged: ceil(3/0.2)+1 = 16 per column × 10 = 160.
  const ok = compute("rcc_columns", { count: 10, L: 0.4, W: 0.4, H: 3, spacing: 200 });
  assert.equal(ok["Total Stirrups"], 160);
});
