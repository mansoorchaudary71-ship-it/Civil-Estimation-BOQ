/**
 * Pavement mix engine tests — run with:
 *   npx tsx --test src/lib/__tests__/pavementMixCalc.test.ts
 * (plain node:test + node:assert, same pattern as steelCalc.test.ts)
 *
 * Worked example from the G2 spec §2: defaults (40/30/30) must reproduce
 * the blended values exactly and be ALL-PASS against DBM-1. The old code
 * showed 0.0% on every sieve with a false PASS.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  blend,
  checkAgainstSpec,
  overallPass,
  rmseVsBandMid,
  solveProportions,
  calcMixQuantities,
  validateStockpiles,
  validateProportions,
  DEFAULT_STOCKPILES,
  DEFAULT_PROPORTIONS,
  SPECIFICATIONS,
} from "../pavementMixCalc";

const approx = (actual: number, expected: number, tol = 1e-9) =>
  assert.ok(
    Math.abs(actual - expected) <= tol,
    `expected ${expected} (±${tol}), got ${actual}`,
  );

test("defaults blend to the spec §2 values exactly (DBM-1, ALL-PASS)", () => {
  const blended = blend(DEFAULT_PROPORTIONS, DEFAULT_STOCKPILES);
  const bySieve: Record<number, number> = {};
  const sieves = [75, 53, 26.5, 19, 9.5, 4.75, 2.36, 0.3, 0.075];
  sieves.forEach((s, i) => (bySieve[s] = blended[i]));
  assert.equal(bySieve[75], 100);
  assert.equal(bySieve[53], 100);
  assert.equal(bySieve[26.5], 100);
  assert.equal(bySieve[19], 94.0);
  assert.equal(bySieve[9.5], 70.5);
  assert.equal(bySieve[4.75], 45.5);
  assert.equal(bySieve[2.36], 31.5);
  assert.equal(bySieve[0.3], 13.5);
  assert.equal(bySieve[0.075], 4.5);
  const checks = checkAgainstSpec(blended, "dbm-1");
  assert.equal(overallPass(checks), true);
  assert.ok(checks.every((c) => c.status !== "fail"));
});

test("REGRESSION: a failing blend must render FAIL, never default-pass", () => {
  // propC 0 -> 0.075 mm = 0% passing, below the DBM-1 minimum of 1%.
  const blended = blend({ aggA: 50, aggB: 50, aggC: 0, filler: 0 }, DEFAULT_STOCKPILES);
  const checks = checkAgainstSpec(blended, "dbm-1");
  const fine = checks.find((c) => c.sieve === 0.075)!;
  assert.equal(fine.blended, 0);
  assert.equal(fine.status, "fail");
  assert.equal(overallPass(checks), false);
  // And a sieve with no spec band is null, not a pass.
  const coarse = checks.find((c) => c.sieve === 75)!;
  assert.equal(coarse.status, null);
});

test("envelopes are the MoRTH values (DBM-1, GSB-I, SMA spot checks)", () => {
  const dbm1 = SPECIFICATIONS["dbm-1"];
  assert.deepEqual(dbm1.find((s) => s.sieve === 19), { sieve: 19, min: 90, max: 100 });
  assert.deepEqual(dbm1.find((s) => s.sieve === 0.075), { sieve: 0.075, min: 1, max: 7 });
  const gsb = SPECIFICATIONS["gsb-i"];
  assert.deepEqual(gsb.find((s) => s.sieve === 53), { sieve: 53, min: 80, max: 100 });
  assert.deepEqual(gsb.find((s) => s.sieve === 0.075), { sieve: 0.075, min: 0, max: 10 });
  const sma = SPECIFICATIONS["sma"];
  assert.deepEqual(sma.find((s) => s.sieve === 19), { sieve: 19, min: 100, max: 100 });
  assert.deepEqual(sma.find((s) => s.sieve === 0.075), { sieve: 0.075, min: 8, max: 12 });
  // New presets exist and are shaped the same.
  assert.equal(SPECIFICATIONS["dbm-2"].length, 9);
  assert.equal(SPECIFICATIONS["bc-1"].length, 9);
  assert.equal(SPECIFICATIONS["bc-2"].length, 9);
});

test("auto-blend finds proportions at least as good as the defaults", () => {
  const solved = solveProportions(DEFAULT_STOCKPILES, "dbm-1");
  const defaultRmse = rmseVsBandMid(blend(DEFAULT_PROPORTIONS, DEFAULT_STOCKPILES), "dbm-1");
  assert.ok(solved.rmse <= defaultRmse + 1e-9, `solved ${solved.rmse} vs default ${defaultRmse}`);
  const sum = solved.proportions.aggA + solved.proportions.aggB + solved.proportions.aggC + solved.proportions.filler;
  assert.equal(sum, 100);
});

test("mix quantities: 100 m2 x 50 mm at 4.5% bitumen", () => {
  const q = calcMixQuantities(100, 50, 4.5, DEFAULT_PROPORTIONS);
  // 100 x 0.05 x 2.35 = 11.75 t
  assert.equal(q.totalTonnes.toFixed(2), "11.75");
  assert.equal(q.bitumenKg.toFixed(1), "528.8");
  assert.equal(q.aggTonnes.aggA.toFixed(2), "4.70");
  approx(q.aggTonnes.aggB, 3.525, 0.01);
  approx(q.aggTonnes.aggC, 3.525, 0.01);
});

test("validation: inversion and proportion sum", () => {
  const bad = validateStockpiles({
    ...DEFAULT_STOCKPILES,
    aggA: [100, 100, 100, 85, 90, 5, 0, 0, 0], // 90 > 85 as sieve gets finer
  });
  assert.ok(bad.length > 0, "inversion must be flagged");
  assert.deepEqual(validateStockpiles(DEFAULT_STOCKPILES), []);
  assert.deepEqual(validateProportions(DEFAULT_PROPORTIONS), []);
  assert.ok(validateProportions({ aggA: 50, aggB: 50, aggC: 10, filler: 0 }).length > 0);
});
