/**
 * qsWorkflow tests — Step 5 (qs-workflow engine). The engine header
 * promises the legacy regression total Rs 3,423,000; the tests pin it,
 * plus the IS 1200 deduction rules and the 1.54 / 0.0347 house rules.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  volumeFromRows,
  areaFromRows,
  validateDimensionRow,
  footingConcrete,
  plasterNetArea,
  qsBoqTotals,
  LEGACY_QS_ITEMS,
} from "../qsWorkflow";

const approx = (a: number, b: number, tol = 0.01) =>
  assert.ok(Math.abs(a - b) <= tol, `${a} ≈ ${b}`);

test("quantities come from dimensions: Nos x L x W x D", () => {
  assert.equal(volumeFromRows([{ nos: 2, length: 3, width: 2, depth: 1 }]), 12);
  assert.equal(
    volumeFromRows([
      { nos: 2, length: 3, width: 2, depth: 1 },
      { nos: 1, length: 1, width: 1, depth: 1 },
    ]),
    13,
  );
  assert.equal(areaFromRows([{ nos: 2, length: 3, width: 2, depth: 5 }]), 12);
  assert.equal(volumeFromRows([]), 0);
});

test("dimension rows validate: > 0 and <= 10,000", () => {
  assert.equal(validateDimensionRow({ nos: 1, length: 3, width: 2, depth: 1 }), null);
  assert.equal(
    validateDimensionRow({ nos: 0, length: 3, width: 2, depth: 1 }),
    "Nos must be greater than 0.",
  );
  assert.ok(
    (validateDimensionRow({ nos: 1, length: 20000, width: 2, depth: 1 }) ?? "").includes("too large"),
  );
});

test("footing concrete 1:2:4: dry = wet x 1.54, bags = dry x (1/7) / 0.0347", () => {
  const r = footingConcrete(1);
  assert.equal(r.wet, 1);
  assert.equal(r.dry, 1.54);
  assert.equal(r.cementBags, 7); // ceil(1.54 / 7 / 0.0347) = ceil(6.34)
  approx(footingConcrete(2).dry, 3.08);
  assert.equal(footingConcrete(2).cementBags, 13);
});

test("IS 1200 plaster deductions: <0.5 none, 0.5-3 one face, >3 both faces", () => {
  assert.equal(plasterNetArea(100, [0.4]), 100);
  assert.equal(plasterNetArea(100, [0.4, 2, 4]), 90); // 0 + 2 + 2x4
  approx(plasterNetArea(100, [0.5, 3, 3.01]), 90.48);
  assert.equal(plasterNetArea(10, [20]), 0); // never negative
});

test("legacy regression: BOQ subtotal is exactly Rs 3,423,000", () => {
  const t = qsBoqTotals(LEGACY_QS_ITEMS, 5, 18);
  assert.equal(t.subtotal, 3423000);
  assert.equal(t.contingency, 171150);
  assert.equal(t.grandTotal, 4241097);
  assert.equal(t.bySection["Concrete"], 1262500);
  assert.equal(t.items.length, LEGACY_QS_ITEMS.length);
});

test("BOQ totals: tax is charged on subtotal + contingency", () => {
  const t = qsBoqTotals([{ section: "A", item: "x", qty: 10, unit: "m³", rate: 1000 }], 10, 18);
  assert.equal(t.subtotal, 10000);
  assert.equal(t.contingency, 1000);
  approx(t.tax, 11000 * 0.18);
  approx(t.grandTotal, 10000 + 1000 + 1980);
});
