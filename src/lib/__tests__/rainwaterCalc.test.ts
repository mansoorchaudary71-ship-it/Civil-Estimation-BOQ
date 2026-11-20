/** Rainwater tests — run with: npx tsx --test src/lib/__tests__/rainwaterCalc.test.ts */
import { test } from "node:test";
import assert from "node:assert/strict";
import { calcRainwater } from "../rainwaterCalc";

test("worked example §4.5: 100 m2 concrete, Lahore 628 mm, 0.85, filter 0.90, 4 people", () => {
  const r = calcRainwater({
    roofAreaM2: 100, rainfallMm: 628, roofType: "concreteTiles",
    filterEfficiency: 0.9, people: 4, usePerPersonLPerDay: 50, dryDays: 21,
    waterCostPerM3: 150, tankRatePerLitre: 35, fixedSystemCost: 75000,
  });
  assert.ok(Math.abs(r.yieldLPerYear - 48042) < 1, `yield ${r.yieldLPerYear}`);
  assert.equal(r.demandLPerYear, 73000);
  assert.ok(Math.abs(r.tankBy5PctRuleL - 2402) < 2, `5% rule ${r.tankBy5PctRuleL}`);
  assert.equal(r.tankByDrySpellL, 4200);
  assert.equal(r.tankL, 5000);
  assert.ok(Math.abs(r.coveragePct - 66) < 1, `coverage ${r.coveragePct}`);
  assert.equal(r.daysOfSupply, 25);
  assert.ok(Math.abs(r.annualSavings - 7206) < 5, `savings ${r.annualSavings}`);
  assert.equal(r.systemCost, 250000);
  assert.ok(r.paybackYears != null && Math.abs(r.paybackYears - 34.7) < 0.2, `payback ${r.paybackYears}`);
  assert.ok(r.warnings.some((w) => /20 years/.test(w)));
});

test("tank is 5% of the LESSER of yield and demand (BS 8515), not 8% of yield", () => {
  // Small roof, big demand: 5% of yield governs the rule (not 8%).
  const r = calcRainwater({ roofAreaM2: 50, rainfallMm: 628, roofType: "concreteTiles", people: 10, dryDays: 7 });
  assert.ok(Math.abs(r.tankBy5PctRuleL - 0.05 * r.yieldLPerYear) < 0.01);
  assert.notEqual(r.tankBy5PctRuleL, 0.08 * r.yieldLPerYear);
});

test("city preset: Karachi rainfall is 174 mm", () => {
  const r = calcRainwater({ roofAreaM2: 100, city: "Karachi", roofType: "metal" });
  assert.equal(r.rainfallMm, 174);
});

test("validation rejects bad inputs", () => {
  assert.throws(() => calcRainwater({ roofAreaM2: 0 }), /Roof area/);
  assert.throws(() => calcRainwater({ roofAreaM2: 100, rainfallMm: 10 }), /rainfall/);
  assert.throws(() => calcRainwater({ roofAreaM2: 100, dryDays: 100 }), /Dry-spell/);
});
