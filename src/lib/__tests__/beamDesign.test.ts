/**
 * Beam design engine tests — G7 spec §4.4 worked vectors.
 * Run: npx tsx --test src/lib/__tests__/beamDesign.test.ts
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { designBeam, fscTable, defaultBeamInputs } from "../beamDesign";

const approx = (a: number, e: number, tol: number) =>
  assert.ok(Math.abs(a - e) <= tol, `expected ${e} (±${tol}), got ${a}`);

test("verified vector, self-weight OFF: d=402, Mu=78.1, Mu,lim=135.3, Ast=496 -> 3x16 (603), tau_v=0.62, Ld=777", () => {
  const r = designBeam({ ...defaultBeamInputs, selfWeight: false });
  assert.equal(r.errors.length, 0);
  assert.equal(r.dMm, 402);
  approx(r.muGoverningKNm, 78.1, 0.2);
  approx(r.vuKN, 62.5, 0.2);
  approx(r.muLimKNm, 135.3, 0.3);
  approx(r.astReqMm2, 496, 5);
  assert.equal(r.barsRequired, 3);
  assert.equal(r.astProvidedMm2, 603);
  approx(r.tauVMpa, 0.62, 0.02);
  approx(r.ldMm, 777, 3);
  assert.equal(r.doublyReinforced, false);
  assert.equal(r.astMaxOk, true);
});

test("defaults (self-weight ON): Mu=91.3, Ast~592, still 3x16 bars", () => {
  const r = designBeam();
  approx(r.selfWeightKNm, 2.81, 0.05);
  approx(r.muGoverningKNm, 91.3, 0.3);
  approx(r.astReqMm2, 592, 6);
  assert.equal(r.barsRequired, 3);
  assert.equal(r.astProvidedMm2, 603);
});

test("continuous beam uses wL^2/10 support / wL^2/12 span, not wL^2/8", () => {
  const r = designBeam({ support: "continuous" });
  assert.ok(r.muSupportKNm > r.muSpanKNm, "support moment must exceed span moment");
  approx(r.muSupportKNm, r.factoredLoadKNm * 25 / 10, 0.3);
  approx(r.muSpanKNm, r.factoredLoadKNm * 25 / 12, 0.3);
  assert.ok(r.astSupportMm2 > r.astSpanMm2);
  // Interior-support shear is 0.625·W·L, not the simply-supported WL/2
  // (0.625 x 29.22 x 5 = 91.3 kN; WL/2 would give 73.1 kN, 20% low).
  approx(r.vuKN, 0.625 * r.factoredLoadKNm * 5, 0.2);
});

test("cantilever uses wL^2/2", () => {
  const r = designBeam({ support: "cantilever", selfWeight: false });
  approx(r.muGoverningKNm, 25 * 25 / 2, 0.3);
});

test("SP-16 Table F: fsc below 0.87fy for Fe500 at d'/d=0.10; 0.87fy at d'/d <= 0.05", () => {
  assert.equal(fscTable(415, 0.05), 0.87 * 415);
  approx(fscTable(500, 0.1), 385, 1);
  assert.ok(fscTable(500, 0.1) < 0.87 * 500);
  assert.equal(fscTable(500, 0.05), 0.87 * 500);
});

test("Ast,max gate trips on a heavily loaded section", () => {
  const r = designBeam({ workingLoadKNm: 200, selfWeight: false });
  assert.equal(r.astMaxOk, false);
  assert.ok(r.warnings.some((w) => w.includes("Ast,max")));
});

test("validation rejects zero span / out-of-range fck", () => {
  assert.ok(designBeam({ spanM: 0 }).errors.length > 0);
  assert.ok(designBeam({ fck: 80 }).errors.length > 0);
  assert.ok(designBeam({ coverMm: 300 }).errors.length > 0);
});

test("steel weight and cost are computed (not zero)", () => {
  const r = designBeam({ selfWeight: false });
  assert.ok(r.totalSteelKg > 10);
  assert.ok(r.concreteVolM3 > 0.5);
  assert.ok(r.totalCost != null && r.totalCost > 0);
  assert.ok(r.materials.cementBags > 0);
});
