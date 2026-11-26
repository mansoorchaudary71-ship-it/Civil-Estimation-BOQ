/**
 * evm tests — Step 5 (tracker engine). Pins the PMBOK formulas in
 * src/lib/evm.ts against the worked example in the file header
 * (BAC 119,000, EV 36,000, PV 50,000, AC 36,500).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { calcEvm, forecastDelayDays, phasePvOnDate, sCurvePoints } from "../evm";

const approx = (a: number, b: number, tol = 0.01) =>
  assert.ok(Math.abs(a - b) <= tol, `${a} ≈ ${b}`);

test("worked example: SPI 0.72, CPI 0.99, CV -500, SV -14,000", () => {
  const r = calcEvm({ bac: 119000, ev: 36000, pv: 50000, ac: 36500 });
  approx(r.spi, 0.72);
  approx(r.cpi, 0.9863, 0.001);
  assert.equal(r.cv, -500);
  assert.equal(r.sv, -14000);
  approx(r.overallProgressPct, 30.25, 0.01);
  assert.equal(r.status, "Over budget and behind schedule — review the plan");
});

test("EAC methods: CPI 120,653; atypical AC + (BAC - EV); TCPI 1.01", () => {
  const r = calcEvm({ bac: 119000, ev: 36000, pv: 50000, ac: 36500 });
  approx(r.eacCpi, 120652.78, 0.5);
  assert.equal(r.eacAtypical, 119500);
  approx(r.vac, -1652.78, 0.5);
  approx(r.tcpi, 1.0061, 0.001);
  assert.equal(r.eacBottomUp, null);
  approx(r.etc, 84152.78, 0.5);
});

test("EAC bottom-up method uses AC + bottom-up ETC", () => {
  const r = calcEvm({ bac: 119000, ev: 36000, pv: 50000, ac: 36500, etcBottomUp: 80000 });
  assert.equal(r.eacBottomUp, 116500);
});

test("on-track project: CPI/SPI >= 1, VAC positive", () => {
  const r = calcEvm({ bac: 100000, ev: 60000, pv: 50000, ac: 55000 });
  approx(r.spi, 1.2);
  approx(r.cpi, 1.0909, 0.001);
  assert.ok(r.vac > 0);
  assert.equal(r.status, "On track — under budget and ahead of schedule");
});

test("zero PV/AC guards: no division by zero", () => {
  const r = calcEvm({ bac: 100000, ev: 0, pv: 0, ac: 0 });
  assert.equal(r.spi, 0);
  assert.equal(r.cpi, 0);
  assert.equal(r.eacCpi, 100000);
});

test("forecast delay: SPI 0.72 over 100 remaining days = 39 days late", () => {
  assert.equal(forecastDelayDays(0.72, 100), 39);
  assert.equal(forecastDelayDays(1, 100), 0);
  assert.equal(forecastDelayDays(0, 100), 100);
  assert.equal(forecastDelayDays(2, 100), -50);
});

test("phase PV interpolates linearly between start and end", () => {
  const phase = { start: "2026-01-01", end: "2026-01-11", budget: 10000 };
  assert.equal(phasePvOnDate(phase, "2025-12-31"), 0);
  assert.equal(phasePvOnDate(phase, "2026-01-06"), 5000);
  assert.equal(phasePvOnDate(phase, "2026-01-11"), 10000);
  assert.equal(phasePvOnDate(phase, "2026-02-01"), 10000);
});

test("S-curve: daily PV/EV/AC across phases", () => {
  const pts = sCurvePoints(
    [{ start: "2026-01-01", end: "2026-01-11", budget: 10000, progress: 50, actualCost: 4000 }],
    "2026-01-06",
  );
  assert.equal(pts.length, 6);
  assert.equal(pts[0].pv, 0);
  assert.equal(pts[5].pv, 5000);
  assert.equal(pts[5].ev, 2500);
  assert.equal(pts[5].ac, 2000);
  assert.deepEqual(sCurvePoints([], "2026-01-06"), []);
});
