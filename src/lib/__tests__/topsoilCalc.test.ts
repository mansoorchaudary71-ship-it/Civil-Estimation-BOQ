import { test } from "node:test";
import assert from "node:assert/strict";
import { topsoilCalc, TOPSOIL_WORKED, TOPSOIL_MATERIALS } from "../topsoilCalc";
const approx = (a: number, b: number, tol = 0.01) => assert.ok(Math.abs(a - b) <= tol, `${a} ≈ ${b}`);
test("worked (task): 10×5 m, 15 cm, 1200 kg/m³, swell 1.25 → net 7.50, order 9.38 m³, 11,250 kg, 450 bags, 1 truck", () => {
  const r = topsoilCalc(TOPSOIL_WORKED);
  approx(r.netM3, 7.5); approx(r.orderM3, 9.375, 0.01); approx(r.weightKg, 11250, 1);
  assert.equal(r.bags, 450); assert.equal(r.trucks, 1);
});
test("spec default swell 1.25: same inputs → order 9.375 m³, 11,250 kg, 450 bags", () => {
  const r = topsoilCalc({ areaM2: 50, depthM: 0.15, densityKgM3: 1200 });
  approx(r.orderM3, 9.375); approx(r.weightKg, 11250); assert.equal(r.bags, 450);
});
test("material presets carry densities + swell factors (merged orphan)", () => {
  assert.equal(TOPSOIL_MATERIALS.topsoil.densityKgM3, 1200);
  assert.equal(TOPSOIL_MATERIALS.topsoil.swellFactor, 1.25);
  assert.equal(TOPSOIL_MATERIALS.sand.swellFactor, 1.15);
});
test("bulk-vs-bag cost comparison; no rates → cost null, not 0", () => {
  const r = topsoilCalc({ areaM2: 50, depthM: 0.15, densityKgM3: 1200, bulkRatePerM3: 2000, bagRateEach: 100 });
  assert.ok(r.bulkCost !== null && r.bagCost !== null);
  assert.equal(r.cheaper, "bulk");
  assert.equal(topsoilCalc({ areaM2: 50, depthM: 0.15, densityKgM3: 1200 }).bulkCost, null);
});
test("validation: depth >1 m throws", () => assert.throws(() => topsoilCalc({ areaM2: 50, depthM: 1.5, densityKgM3: 1200 })));
