/**
 * Water tank engine tests — G7 spec §4.2 worked example.
 * Run: npx tsx --test src/lib/__tests__/waterTankCalc.test.ts
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { designWaterTank, sigmaStMpa, defaultWaterTankInputs } from "../waterTankCalc";

const approx = (a: number, e: number, tol: number) =>
  assert.ok(Math.abs(a - e) <= tol, `expected ${e} (±${tol}), got ${a}`);

test("rectangular defaults: V=19.35 m3 = 19,350 L; demand 1,350 L covered", () => {
  const r = designWaterTank();
  assert.equal(r.errors.length, 0);
  approx(r.capacityM3, 19.35, 0.01);
  assert.equal(r.capacityLitres, 19350);
  assert.equal(r.demandLitres, 1350);
  assert.equal(r.demandOk, true);
  approx(r.maxPressureKNm2, 19.6, 0.2);
});

test("wall design: min steel 0.217% = 434 mm2/m governs over flexure (105 mm2/m)", () => {
  const r = designWaterTank();
  assert.equal(r.astMinMm2PerM, 434);
  assert.equal(r.minSteelGoverns, true);
  approx(r.muLongKNmPerM, 2.12, 0.05);
  assert.equal(r.barSpacingMm, 180);
  approx(r.astProvidedMm2PerM, 436.3, 0.5);
  assert.equal(r.crackWidthOk, true);
});

test("sigma_st table: deformed bars in direct tension = 130 MPa, flexure = 150 MPa", () => {
  assert.equal(sigmaStMpa("deformed", "direct-tension"), 130);
  assert.equal(sigmaStMpa("plain", "direct-tension"), 150);
  assert.equal(sigmaStMpa("deformed", "flexure"), 150);
});

test("circular tank: hoop tension T = 36.8 kN/m; Ast,hoop = 283 mm2/m, min steel governs", () => {
  const r = designWaterTank({ shape: "circular", waterDepthM: 2.5 });
  approx(r.capacityM3, 17.67, 0.05);
  approx(r.hoopTensionKNPerM, 36.8, 0.3);
  approx(r.astHoopMm2PerM, 434, 1); // min steel governs over 283
  assert.equal(r.minSteelGoverns, true);
});

test("capacity below demand warns", () => {
  const r = designWaterTank({ occupants: 50, daysReserve: 5 });
  assert.equal(r.demandOk, false);
  assert.ok(r.warnings.length > 0);
});

test("overhead staging load is computed", () => {
  const r = designWaterTank();
  assert.ok(r.stagingLoadKN > r.waterLoadKN);
  const resting = designWaterTank({ placement: "resting" });
  assert.equal(resting.stagingLoadKN, 0);
});

test("circular minSteelGoverns compares hoop only: deep tank where hoop steel exceeds min", () => {
  // D = 3 m, H = 6 m: T = 9.81 x 6 x 3 / 2 = 88.3 kN/m; Ast,hoop = 88,290/130
  // = 679 mm2/m > Ast,min 434, so min steel must NOT govern. The old
  // comparison also required Ast,min >= long-wall flexure steel (which a
  // circular tank does not have) and could report governs wrongly.
  const r = designWaterTank({ shape: "circular", waterDepthM: 6 });
  approx(r.astHoopMm2PerM, 679, 2);
  assert.equal(r.minSteelGoverns, false);
});

test("L/H far from 2.25 warns (Table 3 coefficients do not apply)", () => {
  const r = designWaterTank({ lengthM: 10, waterDepthM: 2 }); // L/H = 5
  assert.ok(r.warnings.some((w) => w.includes("L/H = 5")));
  const ok = designWaterTank(); // defaults L/H = 4.5/2 = 2.25
  assert.ok(!ok.warnings.some((w) => w.includes("L/H")));
});

test("empty occupants is an error, not a 0 L demand PASS", () => {
  const r = designWaterTank({ occupants: 0 });
  assert.ok(r.errors.some((e) => e.includes("Occupants")));
});
