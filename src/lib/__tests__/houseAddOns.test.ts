/**
 * houseAddOns tests — Step 5 (house solar add-on pricing). Pins the
 * 5 kW on-grid worked example (10 x 545 W panels, Rs 942,075) and the
 * parts-sum-to-total rounding rule.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { calcSolarAddOnCost } from "../houseAddOns";

const approx = (a: number, b: number, tol = 0.01) =>
  assert.ok(Math.abs(a - b) <= tol, `${a} ≈ ${b}`);

function assertPartsSum(r: ReturnType<typeof calcSolarAddOnCost>) {
  assert.equal(
    r.panelsCost + r.inverterCost + r.batteryCost + r.mountingCost +
      r.wiringCost + r.labourCost + r.netMeteringFee + r.contingencyCost,
    r.totalCost,
  );
}

test("5 kW on-grid: 10 panels, 5.45 kW actual, Rs 942,075 total", () => {
  const r = calcSolarAddOnCost(5, "On-Grid", 0);
  assert.equal(r.panels, 10); // ceil(5000 / 545)
  assert.equal(r.actualKw, 5.45);
  assert.equal(r.inverterKva, 6);
  assert.equal(r.panelsCost, 490500); // 5.45 kW x Rs 90/W
  assert.equal(r.inverterCost, 150000); // 6 kVA x Rs 25,000
  assert.equal(r.batteryCost, 0); // on-grid has no battery
  assert.equal(r.mountingCost, 45000); // 10 x Rs 4,500
  assert.equal(r.wiringCost, 39240); // 8% of panels
  assert.equal(r.netMeteringFee, 100000);
  assert.equal(r.totalCost, 942075);
  approx(r.costPerKwp, 172857.8, 0.5);
  assertPartsSum(r);
});

test("10 kW hybrid with 10 kWh battery: 19 panels, Rs 650,000 battery", () => {
  const r = calcSolarAddOnCost(10, "Hybrid", 10);
  assert.equal(r.panels, 19); // ceil(10000 / 545)
  assert.equal(r.actualKw, 10.355);
  assert.equal(r.batteryCost, 650000); // 10 kWh x Rs 65,000
  assert.equal(r.totalCost, 2434642);
  assertPartsSum(r);
});

test("off-grid: battery priced, no net-metering fee", () => {
  const r = calcSolarAddOnCost(5, "Off-Grid", 10);
  assert.equal(r.batteryCost, 650000);
  assert.equal(r.netMeteringFee, 0);
  assert.equal(r.panels, 10);
  assertPartsSum(r);
});

test("zero system costs zero; negative input clamps to zero", () => {
  const r = calcSolarAddOnCost(0, "On-Grid", 0);
  assert.equal(r.totalCost, 0);
  assert.equal(r.panels, 0);
  assert.equal(calcSolarAddOnCost(-5, "On-Grid", 0).totalCost, 0);
});
