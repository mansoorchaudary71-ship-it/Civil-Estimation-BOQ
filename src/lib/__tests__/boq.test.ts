/**
 * boq tests — Step 5 (BOQ Generator engine + shared BOQ inbox).
 * Pins the residential-template regression in the file header
 * (subtotal 37,275; 5% contingency 39,138.75; +18% tax 46,183.73),
 * the unpriced-line concept, and the inbox round-trip guards.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  qtyFromDimensions,
  billableQty,
  lineAmount,
  isUnpriced,
  boqTotals,
  taxLabelForRegion,
  RESIDENTIAL_TEMPLATE,
  readBoqInbox,
  sendToBoq,
  type BoqLine,
} from "../boq";

const approx = (a: number, b: number, tol = 0.02) =>
  assert.ok(Math.abs(a - b) <= tol, `${a} ≈ ${b}`);

const lines = (): BoqLine[] =>
  RESIDENTIAL_TEMPLATE.map((l, i) => ({
    id: String(i), division: "x", description: l.description,
    unit: l.unit, quantity: l.quantity, rate: l.rate,
  }));

test("residential template regression: 37,275 / 39,138.75 / 46,183.73", () => {
  const t = boqTotals(lines(), 5, 18);
  assert.equal(t.subtotal, 37275);
  assert.equal(t.contingency, 1863.75);
  assert.equal(t.taxable, 39138.75);
  approx(t.tax, 7044.98);
  approx(t.grandTotal, 46183.73);
  assert.equal(t.unpricedCount, 0);
});

test("quantity from dimensions: Nos x L x W x D", () => {
  assert.equal(qtyFromDimensions({ nos: 2, length: 3, width: 2, depth: 1 }), 12);
  assert.equal(qtyFromDimensions({ length: 3, width: 2 }), 6);
  assert.equal(qtyFromDimensions({}), null);
  assert.equal(qtyFromDimensions({ length: -1 }), null);
});

test("billable quantity adds wastage; amount is null without a rate", () => {
  assert.equal(billableQty({ id: "x", division: "d", description: "d", unit: "m³", quantity: 100, rate: 10, wastagePct: 5 }), 105);
  assert.equal(billableQty({ id: "x", division: "d", description: "d", unit: "m³", quantity: 100, rate: 10 }), 100);
  assert.equal(lineAmount({ id: "x", division: "d", description: "d", unit: "m³", quantity: 10, rate: null }), null);
  assert.equal(lineAmount({ id: "x", division: "d", description: "d", unit: "m³", quantity: 10, rate: 100 }), 1000);
  assert.equal(isUnpriced({ id: "x", division: "d", description: "d", unit: "m³", quantity: 1, rate: null }), true);
  assert.equal(isUnpriced({ id: "x", division: "d", description: "d", unit: "m³", quantity: 1, rate: 0 }), true);
  assert.equal(isUnpriced({ id: "x", division: "d", description: "d", unit: "m³", quantity: 1, rate: 5 }), false);
});

test("unpriced lines are counted, not priced at zero", () => {
  const t = boqTotals(
    [...lines(), { id: "u", division: "x", description: "unpriced", unit: "lot", quantity: 1, rate: null }],
    0, 0,
  );
  assert.equal(t.unpricedCount, 1);
  assert.equal(t.subtotal, 37275);
});

test("regional tax labels: PK Sales Tax 18%, IN GST 18%, AE VAT 5%", () => {
  assert.deepEqual(taxLabelForRegion("PK").label, "Sales Tax (PK)");
  assert.equal(taxLabelForRegion("PK").defaultPct, 18);
  assert.equal(taxLabelForRegion("IN").defaultPct, 18);
  assert.equal(taxLabelForRegion("AE").label, "VAT (UAE)");
  assert.equal(taxLabelForRegion("AE").defaultPct, 5);
});

test("inbox is a no-op without localStorage (node) and never throws", () => {
  assert.deepEqual(readBoqInbox(), []);
  assert.doesNotThrow(() =>
    sendToBoq([{ description: "test", unit: "lot", quantity: 1, rate: null, source: "test" }]),
  );
});
