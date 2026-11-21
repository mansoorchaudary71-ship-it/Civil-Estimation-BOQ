/**
 * Pavement mix engine tests — run with:
 *   npx tsx --test src/lib/__tests__/pavementMixCalc.test.ts
 * (plain node:test + node:assert, same pattern as steelCalc.test.ts)
 *
 * Worked example from the G2 spec §2: defaults (40/30/30) must reproduce
 * the blended values exactly. Against the corrected MoRTH Table 500-10
 * DBM-1 envelope the default blend FAILS at 26.5 mm (100% passing vs the
 * 63–93% band — every stockpile passes 100% at 26.5 mm, so no proportion
 * of these stockpiles can pass DBM-1 there). The old test asserted
 * ALL-PASS because it locked in the shifted (wrong) 26.5 mm 100–100 band.
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

test("defaults blend to the spec §2 values exactly (DBM-1: FAILS at 26.5 mm per MoRTH)", () => {
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
  // MoRTH Table 500-10 Grading 1: 26.5 mm band is 63–93%, so 100% fails.
  const at265 = checks.find((c) => c.sieve === 26.5)!;
  assert.equal(at265.status, "fail");
  assert.equal(overallPass(checks), false);
  // 19 and 9.5 mm have no MoRTH spec for DBM-1 — null, not pass/fail.
  assert.equal(checks.find((c) => c.sieve === 19)!.status, null);
  assert.equal(checks.find((c) => c.sieve === 9.5)!.status, null);
});

test("REGRESSION: a failing blend must render FAIL, never default-pass", () => {
  // propC 0 -> 0.075 mm = 0% passing, below the DBM-1 minimum of 2%.
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

test("envelopes are the MoRTH values (DBM-1, DBM-2, GSB-I, SMA spot checks)", () => {
  const dbm1 = SPECIFICATIONS["dbm-1"];
  // MoRTH Table 500-10 Grading 1: 26.5 mm 63–93; no spec at 19 / 9.5 mm.
  assert.deepEqual(dbm1.find((s) => s.sieve === 26.5), { sieve: 26.5, min: 63, max: 93 });
  assert.deepEqual(dbm1.find((s) => s.sieve === 19), { sieve: 19, min: null, max: null });
  assert.deepEqual(dbm1.find((s) => s.sieve === 9.5), { sieve: 9.5, min: null, max: null });
  assert.deepEqual(dbm1.find((s) => s.sieve === 4.75), { sieve: 4.75, min: 38, max: 54 });
  assert.deepEqual(dbm1.find((s) => s.sieve === 0.075), { sieve: 0.075, min: 2, max: 8 });
  const dbm2 = SPECIFICATIONS["dbm-2"];
  // Table 500-10 Grading 2: no 9.5 mm row; 0.3 mm 7–21.
  assert.deepEqual(dbm2.find((s) => s.sieve === 9.5), { sieve: 9.5, min: null, max: null });
  assert.deepEqual(dbm2.find((s) => s.sieve === 0.3), { sieve: 0.3, min: 7, max: 21 });
  const gsb = SPECIFICATIONS["gsb-i"];
  assert.deepEqual(gsb.find((s) => s.sieve === 53), { sieve: 53, min: 80, max: 100 });
  // Table 400-1 Grade I: 4.75 mm 25–55, 0.075 mm <5.
  assert.deepEqual(gsb.find((s) => s.sieve === 4.75), { sieve: 4.75, min: 25, max: 55 });
  assert.deepEqual(gsb.find((s) => s.sieve === 0.075), { sieve: 0.075, min: 0, max: 5 });
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
