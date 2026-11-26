/**
 * quickEstimate tests — Step 5 (quick-estimation engine). Pins the
 * spec worked example (5 marla x 225 = 1,125 sqft) and the fixed
 * 100% cost split (grey + finish + labour = total, never 125%).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  plotAreaSqft,
  coveredArea,
  validateQuickInput,
  quickEstimate,
  MARLA_SQFT,
} from "../quickEstimate";

const approx = (a: number, b: number, tol = 0.01) =>
  assert.ok(Math.abs(a - b) <= tol, `${a} ≈ ${b}`);

test("spec worked example: 5 marla standard Lahore = Rs 5,400,000", () => {
  const r = quickEstimate({ area: 5, unit: "marla", floors: 1, type: "standard", city: "lahore" });
  assert.equal(r.plotSqft, 1125);
  assert.equal(r.coveredSqft, 1125);
  assert.equal(r.ratePerSqft, 4800); // grey 3000 + finish 1800
  assert.equal(r.totalCost, 5400000);
  assert.equal(r.minCost, 5130000);
  assert.equal(r.maxCost, 5670000);
  assert.equal(r.timeline, "4 - 6 months");
  assert.equal(r.error, undefined);
});

test("cost split sums to exactly 100% of the total (no double-counted labour)", () => {
  for (const type of ["grey", "standard", "premium", "luxury"] as const) {
    const r = quickEstimate({ area: 10, unit: "marla", floors: 2, type, city: "lahore" });
    approx(r.greyCost + r.finishCost + r.labourCost, r.totalCost, 0.01);
    approx(
      r.chart.reduce((s, c) => s + c.value, 0),
      r.totalCost,
      0.01,
    );
  }
});

test("marla standards: society 225 vs revenue 272.25 sqft", () => {
  assert.equal(MARLA_SQFT.society225, 225);
  assert.equal(MARLA_SQFT.revenue272, 272.25);
  assert.equal(plotAreaSqft(5, "marla", "society225"), 1125);
  assert.equal(plotAreaSqft(5, "marla", "revenue272"), 1361.25);
  assert.equal(plotAreaSqft(100, "sqyd"), 900);
  assert.equal(coveredArea(1125, 2), 2250);
});

test("city multiplier: Islamabad 1.1x Lahore", () => {
  const r = quickEstimate({ area: 5, unit: "marla", floors: 1, type: "standard", city: "islamabad" });
  assert.equal(r.ratePerSqft, 5280);
  assert.equal(r.totalCost, 5940000);
});

test("basement adds one full floor of covered area", () => {
  const base = quickEstimate({ area: 5, unit: "marla", floors: 1, type: "grey", city: "lahore" });
  const withBasement = quickEstimate({ area: 5, unit: "marla", floors: 1, type: "grey", city: "lahore", basement: true });
  assert.equal(withBasement.coveredSqft, base.coveredSqft * 2);
});

test("thumb-rule materials scale with covered area", () => {
  const r = quickEstimate({ area: 5, unit: "marla", floors: 1, type: "standard", city: "lahore" });
  assert.equal(r.materials.cementBagsMin, 450); // 1125 x 0.4
  assert.equal(r.materials.steelKgMin, 3938); // 1125 x 3.5, rounded
  assert.equal(r.materials.bricksMin, 9000);
});

test("validation: area > 0, floors 1-10", () => {
  assert.equal(validateQuickInput({ area: 0, unit: "marla", floors: 1, type: "grey", city: "lahore" }), "Area must be greater than 0.");
  assert.equal(validateQuickInput({ area: 5, unit: "marla", floors: 11, type: "grey", city: "lahore" }), "Floors must be between 1 and 10.");
  assert.equal(validateQuickInput({ area: 5, unit: "marla", floors: 1, type: "grey", city: "lahore" }), null);
});
