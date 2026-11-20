/**
 * Calculators-hub engine tests — run with:
 *   npx tsx --test src/lib/__tests__/calculators.test.ts
 * (plain node:test + node:assert, same pattern as steelCalc.test.ts)
 *
 * Worked examples from the G2 spec §2 / §4.4.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ConcreteMortarCalculator,
  BrickworkCalculator,
  SteelCalculator,
} from "../../utils/calculators";

const approx = (actual: number, expected: number, tol = 1e-9) =>
  assert.ok(
    Math.abs(actual - expected) <= tol,
    `expected ${expected} (±${tol}), got ${actual}`,
  );

test("concrete 10x10x0.15, 1:2:4, w/c 0.5, 5% wastage (spec §2)", () => {
  const calc = new ConcreteMortarCalculator(10, 10, 0.15, "1:2:4", 5, 0.5, true);
  const res = calc.calculate();
  assert.equal(res.totalWetVolume, 15);
  assert.equal(res.cementBags, 100);
  approx(res.sandVol, 6.93, 0.01);
  approx(res.aggregateVol, 13.86, 0.01);
  // Water from the UNROUNDED cement mass: 2,496 L, not 2,500 L.
  approx(res.waterLiters, 2496, 1);
  assert.ok(res.waterLiters < 2500);
  // calculate() returns no cementKgExact on the zero-ratio early return, so
  // narrow the optional before using it; asserted values unchanged.
  const cementKgExact = res.cementKgExact;
  assert.ok(typeof cementKgExact === "number" && cementKgExact > 0);
  approx(cementKgExact, 4992.8, 1);
});

test("steel: 12 mm, 10 m span, 150 mm spacing, 12 m bars -> 68 bars, 724.0 kg", () => {
  const calc = new SteelCalculator(12, 10, 150, 12, 50, 0, 0, true);
  const res = calc.calculate();
  assert.equal(res.numBars, 68); // ceil(10/0.15)+1
  approx(res.totalWeightKg, 724.0, 0.5); // 68 x 12 x 144/162.28
});

test("steel imperial: diameter is always mm; length in ft uses d^2/533 kg/ft", () => {
  const calc = new SteelCalculator(12, 10, 6, 40, 50, 0, 0, false);
  const res = calc.calculate();
  // spacing 6 in = 0.5 ft -> ceil(10/0.5)+1 = 21 bars; 21 x 40 ft x 144/533 kg/ft
  assert.equal(res.numBars, 21);
  approx(res.weightPerUnitLength, 144 / 533, 1e-6);
  approx(res.totalWeightKg, 21 * 40 * (144 / 533), 0.5);
});

test("REGRESSION: brick wastage honours the wastagePct parameter (was hardcoded 10%)", () => {
  // 20 x 10 ft wall, 9 in thick, standard 9x4.5x3 in brick, 10 mm joint, 1:4.
  const mk = (wastage: number) =>
    new BrickworkCalculator(20, 10, 0.75, 0, 0.75, 0.375, 0.25, 0.033, "1:4", wastage, false).calculate();
  const at5 = mk(5);
  const at10 = mk(10);
  const at0 = mk(0);
  assert.ok(at5.numBricks < at10.numBricks, "5% wastage must order fewer bricks than 10%");
  assert.ok(at0.numBricks < at5.numBricks, "0% wastage must order fewer bricks than 5%");
  // 5% vs 10% differ by roughly the 5-point gap, not zero.
  assert.ok(at10.numBricks - at5.numBricks >= 20, `gap ${at10.numBricks - at5.numBricks} too small`);
});
