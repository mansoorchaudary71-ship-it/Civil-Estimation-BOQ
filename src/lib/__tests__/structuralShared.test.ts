/**
 * structuralShared tests — Step 5 (shared structural helpers used by the
 * beam / column / footing / slab tools). Pins the steel house rule
 * W = d²/162.28 kg/m, the IS 456 mix ratios and xu,max, and the
 * null-rate-never-zero cost rule.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  mixRatioForGrade,
  materialsForConcrete,
  costLine,
  totalCost,
  barWeightKg,
  barAreaMm2,
  barCountAcross,
  spacingForAst,
  astProvidedPerM,
  xuMaxRatio,
  astMinMm2,
} from "../structuralShared";

const approx = (a: number, b: number, tol = 0.01) =>
  assert.ok(Math.abs(a - b) <= tol, `${a} ≈ ${b}`);

test("steel weight: W = d²/162.28 kg/m", () => {
  approx(barWeightKg(12, 1, 1), 144 / 162.28, 0.001); // 0.887 kg/m
  approx(barWeightKg(16, 12, 10), 189.3, 0.05); // 256/162.28 x 12 x 10
  assert.equal(barWeightKg(12, 0, 5), 0);
  assert.equal(barWeightKg(12, -3, 5), 0);
});

test("bar area and count: 12 mm bar = 113.10 mm²; 8 bars across 1 m at 150 c/c", () => {
  approx(barAreaMm2(12), 113.097, 0.01);
  assert.equal(barCountAcross(1000, 40, 150), 8); // ceil(920/150) + 1
  assert.equal(barCountAcross(1000, 40, 0), 0);
});

test("IS 456 mix ratios: M20 1:1.5:3, M25 1:1:2", () => {
  assert.deepEqual(mixRatioForGrade(20), { c: 1, s: 1.5, a: 3 });
  assert.deepEqual(mixRatioForGrade(25), { c: 1, s: 1, a: 2 });
});

test("materials for 1 m³ M20: dry 1.54 m³, 9 bags, 14.83 cft sand, 29.66 cft agg", () => {
  const r = materialsForConcrete(1, { c: 1, s: 1.5, a: 3 });
  assert.equal(r.wetVolM3, 1);
  assert.equal(r.dryVolM3, 1.54);
  assert.equal(r.cementBags, 9); // ceil(0.28 / 0.0347)
  approx(r.sandCft, 14.83, 0.01);
  approx(r.aggCft, 29.66, 0.01);
});

test("spacing / Ast: 12 mm bars for 500 mm²/m -> 220 mm spacing", () => {
  assert.equal(spacingForAst(500, 12), 220);
  approx(astProvidedPerM(12, 150), 753.98, 0.01);
  assert.equal(spacingForAst(0, 12), 300); // no demand -> max spacing
});

test("IS 456 limits: xu,max 0.48 for Fe415; Ast,min 921.69 mm²/m", () => {
  assert.equal(xuMaxRatio(415), 0.48);
  approx(astMinMm2(415, 1000, 450), 921.69, 0.01);
});

test("cost lines: null rate means null amount, never 0; total null when all unknown", () => {
  assert.equal(costLine("x", 10, "m³", null).amount, null);
  assert.equal(costLine("x", 10, "m³", 100).amount, 1000);
  assert.equal(totalCost([costLine("a", 1, "m³", null)]), null);
  assert.equal(totalCost([costLine("a", 1, "m³", 100), costLine("b", 2, "m³", null)]), 100);
});
