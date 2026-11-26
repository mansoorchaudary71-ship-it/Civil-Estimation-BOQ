/**
 * measurementSheet tests — Step 5 (measurement-sheet engine). Pins the
 * incomplete-row rule (a row with too few dimensions returns null, never
 * a made-up quantity) and the IS 1200 opening-deduction faces.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { measureRow, validateMeasureRow, plasterDeductionFaces } from "../measurementSheet";

test("volume row: Nos x L x W x D with amount at the rate", () => {
  const r = measureRow({ nos: 2, length: 3, width: 2, depth: 1.5, rate: 100 }, "volume", "m");
  assert.equal(r.qty, 18);
  assert.equal(r.unit, "m³");
  assert.equal(r.amount, 1800);
  assert.equal(r.incomplete, false);
  assert.equal(r.hint, null);
});

test("incomplete row returns null qty, never a partial quantity", () => {
  const r = measureRow({ length: 10 }, "volume", "m");
  assert.equal(r.qty, null);
  assert.equal(r.amount, null);
  assert.equal(r.incomplete, true);
  assert.equal(r.hint, "Incomplete — 3 dimension(s) needed for volume, only 1 given.");
});

test("area needs 2 dimensions, length needs 1; ft units label cu.ft/sqft", () => {
  assert.equal(measureRow({ length: 5, width: 4, rate: 50 }, "area", "m").qty, 20);
  assert.equal(measureRow({ length: 5, width: 4 }, "area", "m").unit, "m²");
  assert.equal(measureRow({ length: 7 }, "length", "ft").qty, 7);
  assert.equal(measureRow({ length: 7 }, "length", "ft").unit, "ft");
  assert.equal(measureRow({ length: 3, width: 2, depth: 1 }, "volume", "ft").unit, "cu.ft");
  assert.equal(measureRow({ length: 3, width: 2, depth: 1 }, "volume", "ft").amount, null); // no rate -> no amount, never 0
});

test("missing Nos defaults to 1; zero/negative dimensions do not count", () => {
  assert.equal(measureRow({ length: 3, width: 2, depth: 1 }, "volume", "m").qty, 6);
  assert.equal(measureRow({ length: 3, width: 0, depth: 1 }, "volume", "m").incomplete, true);
});

test("IS 1200 plaster deduction faces: <0.5 none, 0.5-3 one, >3 both", () => {
  assert.equal(plasterDeductionFaces(0.4), 0);
  assert.equal(plasterDeductionFaces(0.5), 1);
  assert.equal(plasterDeductionFaces(3), 1);
  assert.equal(plasterDeductionFaces(3.01), 2);
});

test("row validation: negatives rejected, >10,000 flagged", () => {
  assert.equal(validateMeasureRow({ length: 3, width: 2 }), null);
  assert.equal(validateMeasureRow({ length: -1 }), "Length cannot be negative.");
  assert.ok((validateMeasureRow({ length: 20000 }) ?? "").includes("too large"));
});
