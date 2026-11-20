/**
 * Raft foundation engine tests — G7 spec §4.1 worked example.
 * Run: npx tsx --test src/lib/__tests__/raftCalc.test.ts
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { designRaft, defaultRaftInputs } from "../raftCalc";

const approx = (a: number, e: number, tol: number) =>
  assert.ok(Math.abs(a - e) <= tol, `expected ${e} (±${tol}), got ${a}`);

// NOTE on the spec's qmax figure: §4.1 quotes qmax = 100·(1+0.18+0.12) = 130,
// but 6·ey/L = 6×0.4/12 = 0.20 (the spec used B = 20 in the ey term).
// Correct: qmax = 100·(1+0.18+0.20) = 138 kPa, qmin = 62 kPa.
test("worked example: A=240, q_avg=100, qmax=138, qmin=62, kern PASS", () => {
  const r = designRaft();
  assert.equal(r.errors.length, 0);
  assert.equal(r.areaM2, 240);
  assert.equal(r.qAvgKPa, 100);
  assert.equal(r.qMaxKPa, 138);
  assert.equal(r.qMinKPa, 62);
  assert.equal(r.kernOk, true);
  assert.equal(r.bearingOk, true);
});

test("consolidation settlement sc = 128 mm at defaults (spec vector)", () => {
  const r = designRaft();
  approx(r.settlementConsolidationMm, 128, 2);
  // Total settlement exceeds the 50 mm limit at defaults — flagged, not hidden.
  assert.equal(r.settlementOk, false);
  assert.ok(r.warnings.some((w) => w.includes("settlement")));
});

test("punching shear at a column passes (utilisation < 1)", () => {
  const r = designRaft();
  approx(r.punchingTauVMpa, 1.13, 0.05);
  approx(r.punchingAllowMpa, 1.37, 0.02);
  assert.equal(r.punchingOk, true);
  assert.ok(r.astTopMm2PerM > 700);
});

test("eccentricity beyond B/2 is an error, not a silent triangle", () => {
  const r = designRaft({ exM: 11 });
  assert.ok(r.errors.length > 0);
});

test("quantities and cost are positive", () => {
  const r = designRaft();
  approx(r.concreteVolM3, 144, 0.1);
  assert.ok(r.steelKg > 1000);
  assert.ok(r.totalCost != null && r.totalCost > 0);
});
