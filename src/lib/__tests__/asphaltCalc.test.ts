import { test } from "node:test";
import assert from "node:assert/strict";
import { asphaltQuantity, asphaltCost, ASPHALT_MIXES } from "../asphaltCalc";
const approx = (a: number, b: number, tol = 0.05) => assert.ok(Math.abs(a - b) <= tol, `${a} ≈ ${b}`);
test("MoRTH densities: BC 2355 / DBM 2370 / BM 2160 kg/m³", () => {
  assert.equal(ASPHALT_MIXES.BC.densityKgM3, 2355);
  assert.equal(ASPHALT_MIXES.DBM.densityKgM3, 2370);
  assert.equal(ASPHALT_MIXES.BM.densityKgM3, 2160);
});
test("worked: 100×7 m×50 mm BC → 35 m³, 82.4 t net (2355 kg/m³), 91.0 t to order at 10%", () => {
  const q = asphaltQuantity(100, 7, 50, "BC", 10);
  approx(q.volumeM3, 35); approx(q.netTonnes, 82.43, 0.05); approx(q.orderTonnes, 91.0, 0.05); // 82.43×1.10=90.67 → round up to 91.0 t
  approx(q.looseM3, 42, 0.01); approx(q.bitumenTonnes, 82.43 * 0.055, 0.05);
});
test("order quantity rounds UP to nearest 0.5 t", () => {
  const q = asphaltQuantity(10, 3, 40, "BM", 0);
  assert.ok(q.orderTonnes >= q.netTonnes && q.orderTonnes * 2 === Math.round(q.orderTonnes * 2));
});
test("no rate → cost null", () => assert.equal(asphaltCost(90.5, null), null));
