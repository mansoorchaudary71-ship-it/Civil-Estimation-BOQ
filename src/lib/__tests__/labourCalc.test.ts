/**
 * labourCalc tests — Step 5 (labour-calculator engine). Pins the IS 7272
 * Pt 1 outputs and the fixed bug where displayed days x burn did not
 * equal the displayed total (costs now use the same rounded days).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { calcLabourTask, calcLabourSummary, LABOUR_PRESETS } from "../labourCalc";

const approx = (a: number, b: number, tol = 0.01) =>
  assert.ok(Math.abs(a - b) <= tol, `${a} ≈ ${b}`);

const brickTask = {
  id: "b", name: "Brickwork", qty: 10.1, unit: "m³",
  outputPerWorker: 1.25, keyWorkers: 2, helpers: 3,
  masonWage: 1200, helperWage: 600,
};

test("documented example: 10.1 m³ brickwork = 4.0 days x Rs 4,200 = Rs 16,800", () => {
  const r = calcLabourTask(brickTask, 10);
  assert.equal(r.dailyOutput, 2.5);
  assert.equal(r.days, 4);
  assert.equal(r.daysWithContingency, 4.4);
  assert.equal(r.dailyBurn, 4200);
  assert.equal(r.totalCost, 16800);
  assert.equal(r.totalCostWithContingency, 18480);
  assert.equal(r.error, undefined);
});

test("unskilled-driven task (excavation): helpers are the key workers", () => {
  const r = calcLabourTask({
    id: "e", name: "Excavation", qty: 12, unit: "m³",
    outputPerWorker: 3.0, keyWorkers: 0, helpers: 4,
    masonWage: 1200, helperWage: 600,
  }, 0);
  assert.equal(r.dailyOutput, 12);
  assert.equal(r.days, 1);
  assert.equal(r.dailyBurn, 2400);
  assert.equal(r.totalCost, 2400);
});

test("IS 7272 presets: brickwork 1.25, plastering 10, steel 150", () => {
  const byName = Object.fromEntries(LABOUR_PRESETS.map((p) => [p.name, p]));
  assert.equal(byName["Brickwork"].outputPerWorker, 1.25);
  assert.equal(byName["Plastering"].outputPerWorker, 10);
  assert.equal(byName["Steel binding"].outputPerWorker, 150);
  assert.equal(byName["Formwork"].outputPerWorker, 8);
  assert.equal(byName["Painting"].outputPerWorker, 40);
  assert.ok(LABOUR_PRESETS.every((p) => p.source.includes("IS 7272")));
});

test("errors: negative quantity, zero output", () => {
  assert.equal(calcLabourTask({ ...brickTask, qty: -1 }, 0).error, "Quantity cannot be negative.");
  assert.equal(
    calcLabourTask({ ...brickTask, outputPerWorker: 0 }, 0).error,
    "Output per worker must be greater than 0.",
  );
});

test("summary: sequential sums days, parallel takes the longest", () => {
  const s = calcLabourSummary([brickTask, { ...brickTask, id: "b2", qty: 5.05 }], 10);
  // second task: 5.05 / 2.5 = 2.02 -> 2.0 days, 2.2 with contingency
  assert.equal(s.results[1].days, 2);
  approx(s.sequentialDays, 4.4 + 2.2);
  assert.equal(s.parallelDays, 4.4);
  assert.equal(s.totalCost, 16800 + 8400);
});
