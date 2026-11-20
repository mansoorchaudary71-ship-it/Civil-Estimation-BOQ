/**
 * Formwork engine tests — run with:
 *   npx tsx --test src/lib/__tests__/formworkCalc.test.ts
 * (plain node:test + node:assert, same pattern as steelCalc.test.ts)
 *
 * Worked example from the G2 spec §2 (defaults: Column C1 + Slab Roof).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  calcFormwork,
  calcFormworkArea,
  DEFAULT_FORMWORK_CONSTANTS,
  type FormworkElementInput,
} from "../formworkCalc";

const approx = (actual: number, expected: number, tol = 1e-9) =>
  assert.ok(
    Math.abs(actual - expected) <= tol,
    `expected ${expected} (±${tol}), got ${actual}`,
  );

const DEFAULT_ELEMENTS: FormworkElementInput[] = [
  { type: "column", lengthM: 0.3, widthM: 0.4, heightM: 3.0, count: 10 },
  { type: "slab", lengthM: 12.0, widthM: 10.0, heightM: 0.15, count: 1 },
];

test("area rules: column 2(l+w)h, beam (2h+w)L, slab soffit + edges, footing 2(L+W)d", () => {
  approx(calcFormworkArea({ type: "column", lengthM: 0.3, widthM: 0.4, heightM: 3, count: 1 }), 4.2, 1e-9);
  approx(calcFormworkArea({ type: "beam", lengthM: 4, widthM: 0.23, heightM: 0.45, count: 1 }), 4.52, 1e-9);
  // slab 12x10x0.15: 120 + 2x22x0.15 = 126.6 (edges INCLUDED, IS 1200)
  approx(calcFormworkArea({ type: "slab", lengthM: 12, widthM: 10, heightM: 0.15, count: 1 }), 126.6, 1e-9);
  approx(calcFormworkArea({ type: "footing", lengthM: 1.5, widthM: 1.5, heightM: 0.3, count: 1 }), 1.8, 1e-9);
});

test("defaults (spec §2): total 168.6 m2, effective 44.26 m2 / 476.4 sq ft", () => {
  const r = calcFormwork(DEFAULT_ELEMENTS, 4, 5);
  approx(r.perTypeM2.column, 42.0, 1e-9);
  approx(r.perTypeM2.slab, 126.6, 1e-9);
  approx(r.totalAreaM2, 168.6, 1e-9);
  approx(r.effectiveAreaM2, 44.2575, 0.001);
  assert.equal(r.effectiveAreaM2.toFixed(2), "44.26");
  approx(r.effectiveAreaSqFt, 476.4, 0.5);
  assert.deepEqual(r.errors, []);
});

test("defaults: plywood 15 sheets, battens 1,191 Rft, props 67", () => {
  const r = calcFormwork(DEFAULT_ELEMENTS, 4, 5);
  assert.equal(r.plywoodSheets, 15); // ceil(476.4/32)
  assert.equal(r.battensRft, 1191); // ceil(476.4 x 2.5)
  assert.equal(r.steelProps, 67); // ceil(44.26 x 1.5)
});

test("consumables use the total area: nails/wire 0.075 kg/m2, oil 0.065 L/m2", () => {
  const r = calcFormwork(DEFAULT_ELEMENTS, 4, 5);
  approx(r.nailsKg, 168.6 * 0.075, 0.01);
  approx(r.bindingWireKg, 168.6 * 0.075, 0.01);
  approx(r.shutteringOilL, 168.6 * 0.065, 0.01);
});

test("wastage input changes the effective area (was hard to reach before)", () => {
  const r0 = calcFormwork(DEFAULT_ELEMENTS, 4, 0);
  const r10 = calcFormwork(DEFAULT_ELEMENTS, 4, 10);
  approx(r0.effectiveAreaM2, 168.6 / 4, 0.001);
  approx(r10.effectiveAreaM2, (168.6 / 4) * 1.1, 0.001);
  assert.ok(r10.plywoodSheets >= r0.plywoodSheets);
});

test("repetition 1 with no wastage gives the full area", () => {
  const r = calcFormwork(DEFAULT_ELEMENTS, 1, 0);
  assert.equal(r.effectiveAreaM2, 168.6);
});

test("constants are editable: batten rate 1.0 halves the battens", () => {
  const r = calcFormwork(DEFAULT_ELEMENTS, 4, 5, {
    ...DEFAULT_FORMWORK_CONSTANTS,
    battenRftPerSqFt: 1.0,
  });
  assert.equal(r.battensRft, Math.ceil(r.effectiveAreaSqFt * 1.0));
});

test("validation: bad dims, bad count, bad repetition, bad wastage", () => {
  const r = calcFormwork(
    [{ type: "column", lengthM: 0, widthM: 0.4, heightM: 3, count: 0 }],
    0,
    20,
  );
  assert.ok(r.errors.length >= 3);
});
