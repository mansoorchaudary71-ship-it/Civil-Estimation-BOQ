/**
 * Aggregate tests engine tests — run with:
 *   npx tsx --test src/lib/__tests__/aggregateTestsCalc.test.ts
 * (plain node:test + node:assert, same pattern as steelCalc.test.ts)
 *
 * Worked inputs from the G2 spec §2.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  calcAIV,
  calcACV,
  calcLA,
  calcWA,
  meanOfTrials,
  aivSuitability,
  acvSuitability,
  laSuitability,
  waSuitability,
  sgSuitability,
} from "../aggregateTestsCalc";

test("impact: W1=100, W2=450, W3=70 -> AIV 20.0% Strong", () => {
  const r = calcAIV(100, 450, 70);
  assert.equal(r.value, 20);
  assert.equal(r.valid, true);
  assert.deepEqual(aivSuitability(r.value), {
    verdict: "Strong",
    suitableFor: ["Wearing course", "Base course", "Non-wearing concrete"],
    unsuitable: false,
  });
});

test("crushing: same weights -> ACV 20.0% suitable for wearing course", () => {
  const r = calcACV(100, 450, 70);
  assert.equal(r.value, 20);
  assert.equal(acvSuitability(r.value).verdict, "Suitable for wearing course (<30%)");
});

test("LA abrasion: W1=5000, passing 1200 -> 24.0% suitable for wearing course", () => {
  const r = calcLA(5000, 1200, "passing");
  assert.equal(r.value, 24);
  assert.equal(laSuitability(r.value).verdict, "Suitable for wearing course (<30%)");
});

test("REGRESSION: LA with RETAINED weight must give the same 24%, not 76%", () => {
  // A lab tech naturally records retained weight: 5000 - 1200 = 3800 g.
  // The old UI treated any entry as "passing" and reported 3800/5000 = 76% UNSUITABLE.
  const r = calcLA(5000, 3800, "retained");
  assert.equal(r.value, 24);
  assert.equal(laSuitability(r.value).unsuitable, false);
});

test("water absorption / SG: SSD 1000, in water 620, oven dry 980", () => {
  const r = calcWA(1000, 620, 980);
  assert.equal(r.waterAbsorptionPct.toFixed(2), "2.04");
  assert.equal(r.bulkSg.toFixed(3), "2.579");
  assert.equal(r.apparentSg.toFixed(3), "2.722");
  assert.equal(r.valid, true);
  assert.equal(waSuitability(r.waterAbsorptionPct).verdict.startsWith("Acceptable"), true);
  assert.equal(sgSuitability(r.bulkSg).unsuitable, false);
});

test("validation: W3 above the sample, W2 <= W1, LA above original, WA inverted weights", () => {
  assert.ok(calcAIV(100, 450, 400).errors.length > 0); // W3 400 > sample 350
  assert.ok(calcAIV(450, 100, 10).errors.length > 0); // W2 < W1
  assert.ok(calcLA(5000, 6000, "passing").errors.length > 0);
  assert.ok(calcWA(600, 620, 980).errors.length > 0); // SSD < in-water
  assert.ok(calcWA(1000, 620, 1100).errors.length > 0); // oven dry > SSD
});

test("two-trial mean (IS 2386): mean of 20.0 and 22.0 is 21.0; single trial passes through", () => {
  assert.equal(meanOfTrials(20, 22), 21);
  assert.equal(meanOfTrials(20, null), 20);
  assert.equal(meanOfTrials(null, null), null);
});

test("thresholds: AIV 45 boundary, ACV 45, LA 50, WA 5", () => {
  assert.equal(aivSuitability(45).verdict, "Satisfactory for concrete (non-wearing)");
  assert.equal(aivSuitability(46).unsuitable, true);
  assert.equal(acvSuitability(45).verdict, "Suitable for base course (<45%)");
  assert.equal(acvSuitability(46).unsuitable, true);
  assert.equal(laSuitability(50).verdict, "Suitable for base course only (<=50%, MoRTH)");
  assert.equal(laSuitability(51).unsuitable, true);
  assert.equal(waSuitability(5).verdict.startsWith("Acceptable"), true);
  assert.equal(waSuitability(5.1).unsuitable, true);
});
