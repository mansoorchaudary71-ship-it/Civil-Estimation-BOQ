/**
 * costSummary tests — Step 5 (cost-summary engine). Pins the labelled
 * example lines and the tax-base rule (tax on subtotal + contingency,
 * matching lib/boq.ts — the old code taxed the subtotal only).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { lineAmount, costSummary, validateCostSummary, EXAMPLE_LINES } from "../costSummary";

const approx = (a: number, b: number, tol = 0.01) =>
  assert.ok(Math.abs(a - b) <= tol, `${a} ≈ ${b}`);

const INPUT = {
  areaSqft: 2000, lines: EXAMPLE_LINES,
  overheadPct: 15, contingencyPct: 5, taxPct: 18, taxLabel: "Sales Tax (PK)",
};

test("example lines: grey 30.5L / finish 14.5L / labour 12L, grand Rs 79.17 lakh", () => {
  const r = costSummary(INPUT);
  assert.equal(r.greyTotal, 3050000);
  assert.equal(r.finishTotal, 1450000);
  assert.equal(r.labourTotal, 1200000);
  assert.equal(r.subtotal, 5700000);
  assert.equal(r.overhead, 855000);
  assert.equal(r.contingency, 285000);
  assert.equal(r.tax, 1077300);
  assert.equal(r.grandTotal, 7917300);
  approx(r.costPerSqft, 3958.65);
});

test("tax base is subtotal + contingency (not subtotal alone)", () => {
  const r = costSummary(INPUT);
  assert.equal(r.tax, (r.subtotal + r.contingency) * 0.18);
});

test("zero tax by default is explicit, not omitted silently", () => {
  const r = costSummary({ ...INPUT, taxPct: 0 });
  assert.equal(r.tax, 0);
  assert.equal(r.grandTotal, r.subtotal + r.overhead + r.contingency);
});

test("lineAmount is qty x rate; validation catches bad inputs", () => {
  assert.equal(lineAmount({ id: "x", category: "grey", label: "t", qty: 10, unit: "m³", rate: 500 }), 5000);
  assert.deepEqual(validateCostSummary(INPUT), []);
  assert.ok(validateCostSummary({ ...INPUT, areaSqft: 0 }).includes("Area must be greater than 0."));
  assert.ok(validateCostSummary({ ...INPUT, overheadPct: 60 }).some((e) => e.includes("Overhead")));
  assert.ok(validateCostSummary({ ...INPUT, lines: [] }).includes("Add at least one cost line."));
  assert.ok(
    validateCostSummary({ ...INPUT, lines: [{ id: "x", category: "grey", label: "bad", qty: -1, unit: "m³", rate: 100 }] })
      .some((e) => e.includes("cannot be negative")),
  );
});
