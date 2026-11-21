import { test } from "node:test";
import assert from "node:assert/strict";
import { calcPlywood, validatePlywood, type PlywoodInputs } from "../plywoodCalc";

const approx = (a: number, b: number, tol = 0.01) =>
  assert.ok(Math.abs(a - b) <= tol, `expected ${a} ≈ ${b} (±${tol})`);

const base = (): PlywoodInputs => ({
  mode: "dimensions",
  lengthM: 10,
  widthM: 5,
  areaM2: 50,
  element: "general",
  faces: 1,
  beamWidthM: 0,
  beamDepthM: 0,
  openingsM2: 0,
  sheetLengthM: 2.44,
  sheetWidthM: 1.22,
  thicknessMm: 18,
  grade: "commercial",
  wastagePct: 5,
  reuseFactor: 1,
  costPerSheet: 2500,
  secondaryBeamSpacingM: 0.4,
  primaryBeamSpacingM: 1.2,
});

test("worked example 1 (metric defaults): net 50, gross 52.5, 18 sheets, waste 2.5, Rs 45,000, total vol 0.96 m3", () => {
  const r = calcPlywood(base());
  assert.deepEqual(validatePlywood(base()), []);
  approx(r.netAreaM2, 50);
  approx(r.grossAreaM2, 52.5);
  approx(r.sheetAreaM2, 2.9768, 0.001);
  approx(r.exactSheets, 17.64, 0.01);
  assert.equal(r.sheetsToBuy, 18);
  approx(r.wastageAreaM2, 2.5);
  assert.equal(r.totalCost, 45000);
  approx(r.sheetVolumeM3, 0.0536, 0.001);
  approx(r.totalOrderVolumeM3, 0.96, 0.01);
});

test("worked example 2 (NRTech cross-check): 10x3 m wall, both faces, 10% -> 23 sheets", () => {
  const r = calcPlywood({
    ...base(), lengthM: 10, widthM: 3, element: "wall", faces: 2, wastagePct: 10,
  });
  approx(r.contactAreaM2, 60);
  approx(r.grossAreaM2, 66);
  approx(r.exactSheets, 22.17, 0.01);
  assert.equal(r.sheetsToBuy, 23);
});

test("2-face wall: a 6 m2 opening is deducted once per face (12 m2), not once", () => {
  const r = calcPlywood({
    ...base(), lengthM: 10, widthM: 3, element: "wall", faces: 2, openingsM2: 6, wastagePct: 0,
  });
  // Contact 60 m2; deduction 6 x 2 = 12; net 48; exact 48 / 2.9768 = 16.13 -> 17 sheets.
  approx(r.netAreaM2, 48);
  assert.equal(r.sheetsToBuy, 17);
  const oneFace = calcPlywood({
    ...base(), lengthM: 10, widthM: 3, element: "wall", faces: 1, openingsM2: 6, wastagePct: 0,
  });
  approx(oneFace.netAreaM2, 24);
});

test("worked example 3 (reuse): same as #1 but formwork reuse 4 -> 5 sheets to buy", () => {
  const r = calcPlywood({ ...base(), element: "slab", reuseFactor: 4 });
  assert.equal(r.sheetsToBuy, 5);
  const r2 = calcPlywood({ ...base(), element: "general", reuseFactor: 4 });
  // General surface is not formwork: reuse must NOT divide the count.
  assert.equal(r2.sheetsToBuy, 18);
});

test("validation: wastage 0-30%, reuse 1-8 integer, sheet dims > 0", () => {
  assert.ok(validatePlywood({ ...base(), wastagePct: 31 }).length > 0);
  assert.ok(validatePlywood({ ...base(), reuseFactor: 0 }).length > 0);
  assert.ok(validatePlywood({ ...base(), reuseFactor: 2.5 }).length > 0);
  assert.ok(validatePlywood({ ...base(), sheetLengthM: 0 }).length > 0);
});

test("slab beam lengths: 12x10 m slab -> secondary (12/0.4+1)x10 = 310 m", () => {
  const r = calcPlywood({ ...base(), lengthM: 12, widthM: 10, element: "slab" });
  approx(r.secondaryBeamM, 310);
  assert.ok(r.primaryBeamM > 0);
});
