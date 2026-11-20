import { test } from "node:test";
import assert from "node:assert/strict";
import { concreteMaterials, rigidQuantities, RIGID_DISCLAIMER, RIGID_WORKED } from "../rigidPavementCalc";
const approx = (a: number, b: number, tol = 1) => assert.ok(Math.abs(a - b) <= tol, `${a} ≈ ${b}`);
test("worked: 1000×7.5 m, DLC 150 mm 1:3:6 → 1125 m³, 4990 bags; PQC 250 mm 1:1.5:3 → 1875 m³, 15,120 bags", () => {
  const r = rigidQuantities(RIGID_WORKED.lengthM, RIGID_WORKED.widthM, RIGID_WORKED.pqcThicknessMm, RIGID_WORKED.dlcThicknessMm);
  approx(r.dlcM3, 1125); approx(r.pqcM3, 1875);
  assert.equal(r.dlc.cementBags, 4990); assert.equal(r.pqc.cementBags, 15120);
  approx(r.pqc.sandM3, 787.5, 1); approx(r.pqc.aggregateM3, 1575, 1);
});
test("dowels: 222 joints × 25 = 5550 bars, 17,510 kg; ties 1666 bars, 887 kg", () => {
  const r = rigidQuantities(1000, 7.5, 250, 150);
  assert.equal(r.dowelBars, 5550); approx(r.dowelKg, 17510, 5);
  assert.equal(r.tieBars, 1666); approx(r.tieKg, 887, 2);
});
test("GSB layer is included (150 mm) and disclaimer states 1:1.5:3 is NOT M40", () => {
  const r = rigidQuantities(1000, 7.5, 250, 150);
  approx(r.gsbM3, 1125);
  assert.ok(RIGID_DISCLAIMER.includes("NOT an M40") || RIGID_DISCLAIMER.includes("not an M40"));
  assert.ok(RIGID_DISCLAIMER.includes("IRC:58-2015"));
});
test("dry volume ×1.54", () => approx(concreteMaterials(1, [1, 1.5, 3]).dryM3, 1.54, 0.001));
