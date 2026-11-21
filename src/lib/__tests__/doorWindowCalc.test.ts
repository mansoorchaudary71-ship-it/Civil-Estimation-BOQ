import { test } from "node:test";
import assert from "node:assert/strict";
import {
  calcDoorWindowRow,
  calcDoorWindowSchedule,
  validateDoorWindowRow,
  DEFAULT_DOOR_WINDOW_ROWS,
  type DoorWindowRowInput,
} from "../doorWindowCalc";

const approx = (a: number, b: number, tol = 0.01) =>
  assert.ok(Math.abs(a - b) <= tol, `expected ${a} ≈ ${b} (±${tol})`);

const row = (over: Partial<DoorWindowRowInput>): DoorWindowRowInput => ({
  id: "t", mark: "T1", kind: "door", room: "Test",
  leafWidthM: 1, leafHeightM: 2, frameMaterial: "timber", shutterType: "flush",
  glass: "none", frameSectionMm: 100, sillHeightM: 0, qty: 1, wallThicknessM: 0.23,
  frameRatePerM: null, leafRatePerM2: null, hardwareRatePerSet: null,
  ...over,
});

test("D1 main door 1.067x2.134: leaf 2.28, frame-outer 1.267x2.234, opening 1.287x2.244, lintel 1.59, frame 5.74 r.m", () => {
  const r = calcDoorWindowRow(row({ mark: "D1", leafWidthM: 1.067, leafHeightM: 2.134 }));
  approx(r.leafAreaM2, 2.28);
  approx(r.frameOuterWidthM, 1.267);
  approx(r.frameOuterHeightM, 2.234);
  approx(r.openingWidthM, 1.287);
  // Door opening height adds head clearance only (+10 mm, not +20 mm):
  // 2.234 + 0.01 = 2.244.
  approx(r.openingHeightM, 2.244);
  approx(r.lintelLengthM, 1.59);
  // Door frame = 2H + W (no sill member): 2 x 2.234 + 1.267 = 5.74 r.m,
  // not the full perimeter 2 x (2.234 + 1.267) = 7.00 r.m.
  approx(r.frameLengthM, 5.74);
  approx(r.clearWidthM, 1.017);
});

test("W1 living window 1.524x1.219 x2 UPVC sliding: leaf 1.86 each, total 3.72, glass 1.42 each", () => {
  const r = calcDoorWindowRow(row({
    mark: "W1", kind: "window", room: "Living",
    leafWidthM: 1.524, leafHeightM: 1.219, shutterType: "sliding",
    glass: "clear-5mm", sillHeightM: 0.9, qty: 2,
  }));
  approx(r.leafAreaM2, 1.86);
  approx(r.totalLeafAreaM2, 3.72);
  approx(r.glassAreaM2, 1.42);
  // Windows keep the full-perimeter frame (sill member included):
  // frame-outer 1.724 x 1.419 -> 2 x (1.419 + 1.724) = 6.29 r.m.
  approx(r.frameLengthM, 6.29);
  // Window opening height adds clearance top and bottom: 1.419 + 0.02.
  approx(r.openingHeightM, 1.439);
});

test("default schedule: D1 2.52 + D2 5.67 + W1 3.60 = 11.79 m2 total opening; lintels from masonry opening + 0.30", () => {
  const s = calcDoorWindowSchedule(DEFAULT_DOOR_WINDOW_ROWS);
  approx(s.totalLeafAreaM2, 11.79);
  // NOTE: the audit's 1.50/1.20/1.80 lintels were leaf width + 0.30 (old
  // code). The spec formula is masonry-opening width + 0.30:
  // D1 1.42+0.30=1.72, D2 1.12+0.30=1.42, W1 1.72+0.30=2.02.
  approx(s.rows[0].lintelLengthM, 1.72, 0.01);
  approx(s.rows[1].lintelLengthM, 1.42, 0.01);
  approx(s.rows[2].lintelLengthM, 2.02, 0.01);
  // Per-unit leaf areas: D1 1.2x2.1=2.52, D2 0.9x2.1=1.89 x3=5.67, W1 1.5x1.2=1.80 x2=3.60
  approx(s.rows[0].leafAreaM2, 2.52);
  approx(s.rows[1].totalLeafAreaM2, 5.67);
  approx(s.rows[2].totalLeafAreaM2, 3.6);
});

test("validation: qty 1-99 integer, sill 0-1.8 m, dims > 0; warnings for very wide/tall leaves", () => {
  assert.ok(validateDoorWindowRow(row({ qty: 0 })).length > 0);
  assert.ok(validateDoorWindowRow(row({ qty: 1.5 })).length > 0);
  assert.ok(validateDoorWindowRow(row({ sillHeightM: 2 })).length > 0);
  assert.ok(validateDoorWindowRow(row({ leafWidthM: 0 })).length > 0);
  assert.deepEqual(validateDoorWindowRow(row({})), []);
  assert.ok(calcDoorWindowRow(row({ leafWidthM: 2.6 })).warnings.length > 0);
  assert.ok(calcDoorWindowRow(row({ leafHeightM: 2.8 })).warnings.length > 0);
});

test("cost: frame length x rate + leaf area x rate + hardware x rate; null rates -> null cost", () => {
  const r = calcDoorWindowRow(row({ frameRatePerM: 1000, leafRatePerM2: 5000, hardwareRatePerSet: 2000 }));
  assert.ok(r.rowCost != null && r.rowCost > 0);
  approx(r.frameCost!, r.frameLengthM * 1000);
  const free = calcDoorWindowRow(row({}));
  assert.equal(free.rowCost, null);
});
