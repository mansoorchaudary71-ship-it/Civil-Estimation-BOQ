import { test } from "node:test";
import assert from "node:assert/strict";
import { gridCellVolumes, borrowPitVolume, gridCost, GRID_WORKED } from "../gridEarthworkCalc";
const approx = (a: number, b: number, tol = 0.01) => assert.ok(Math.abs(a - b) <= tol, `${a} ≈ ${b}`);
test("worked single cell: 10×10 m, avg depth 0.475 m → 47.5 m³ cut", () => {
  const r = gridCellVolumes(GRID_WORKED.existing, GRID_WORKED.proposed, GRID_WORKED.spacingM);
  approx(r.cutM3, 47.5); approx(r.fillM3, 0); assert.equal(r.cells.length, 1);
});
test("multi-cell grid splits cut and fill instead of net-averaging", () => {
  const existing = [[101, 101, 99, 99], [101, 101, 99, 99], [101, 101, 99, 99]];
  const proposed = [[100, 100, 100, 100], [100, 100, 100, 100], [100, 100, 100, 100]];
  const r = gridCellVolumes(existing, proposed, 10);
  assert.equal(r.cells.length, 6);
  assert.ok(r.cutM3 > 0 && r.fillM3 > 0, `cut ${r.cutM3} fill ${r.fillM3}`);
  // left cells are pure cut (100 m³ each), right cells pure fill — never netted
  approx(r.cutM3, 200); approx(r.fillM3, 200); assert.equal(r.netM3, 0);
});
test("borrow-pit weighted formula: uniform 0.475 m depth over 2×2 grid", () => {
  const depths = [[0.475, 0.475], [0.475, 0.475]];
  approx(borrowPitVolume(depths, 10), 47.5);
});
test("grid cost: swell, trips and cost", () => {
  const c = gridCost(47.5, 0, 15, 10, 8, 150, 100, 500);
  approx(c.looseM3, 54.625, 0.01); assert.equal(c.trips, 7); approx(c.cost, 47.5 * 150 + 7 * 500, 0.01);
});
