import { test } from "node:test";
import assert from "node:assert/strict";
import { analyseSieve, aashtoGroup, SIEVE_WORKED_ROWS } from "../sieveCalc";
const approx = (a: number, b: number, tol = 0.01) => assert.ok(Math.abs(a - b) <= tol, `${a} ≈ ${b}`);
test("worked dataset: D10 0.30, D30 0.71, D60 1.79, Cu 5.96, Cc 0.94, FM 3.58, SP", () => {
  const r = analyseSieve(SIEVE_WORKED_ROWS, 1000, 20);
  approx(r.d10 as number, 0.3, 0.005); approx(r.d30 as number, 0.71, 0.01); approx(r.d60 as number, 1.79, 0.01);
  approx(r.cu as number, 5.96, 0.02); approx(r.cc as number, 0.94, 0.02); approx(r.fm, 3.58, 0.01);
  assert.ok(r.uscs.startsWith("SP"), `USCS ${r.uscs}`);
  approx(r.sumCheckPct, 100);
});
test("USCS bug fix: a well-graded sand (Cu≥6, 1≤Cc≤3) returns SW, not GW", () => {
  // Passing 92/78/55/30/15/5 → D10≈0.21, D30=0.60, D60≈1.37, Cu≈6.5, Cc≈1.24
  const rows = [
    { sizeMm: 4.75, retainedG: 80 }, { sizeMm: 2.36, retainedG: 140 }, { sizeMm: 1.18, retainedG: 230 },
    { sizeMm: 0.6, retainedG: 250 }, { sizeMm: 0.3, retainedG: 150 }, { sizeMm: 0.15, retainedG: 100 },
  ];
  const r = analyseSieve(rows, 1000, 50);
  assert.ok(r.cu !== null && r.cu >= 6, `Cu ${r.cu}`);
  assert.ok(r.cc !== null && r.cc >= 1 && r.cc <= 3, `Cc ${r.cc}`);
  assert.ok(r.uscs.startsWith("SW"), `USCS ${r.uscs} (was GW before the fix)`);
});
test("D-values return null (no extrapolation) when the curve never reaches the %", () => {
  const r = analyseSieve([{ sizeMm: 4.75, retainedG: 100 }, { sizeMm: 2.36, retainedG: 100 }], 1000, 800);
  assert.equal(r.d60, null);
});
test("Σ retained check warns when weights do not add up", () => {
  const r = analyseSieve(SIEVE_WORKED_ROWS, 1000, 200);
  assert.ok(r.warnings.length > 0);
});
test("AASHTO group: low fines → granular", () => assert.ok(aashtoGroup(10).startsWith("A-1")));
