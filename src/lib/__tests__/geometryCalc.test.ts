/**
 * Universal geometry engine tests — G7 spec §4.11 worked vectors.
 * Run: npx tsx --test src/lib/__tests__/geometryCalc.test.ts
 *
 * NOTE on the spec's formwork figure: §4.11 quoted sides-only formwork
 * 4.20 − 0.09 = 4.11 m², but the bottom is W·L = 0.3 × 3.0 = 0.90 m²,
 * not 0.09 m² — and the whole formula was wrong: it counted the soffit
 * and omitted the two ends. Sides-only formwork is 2·D·(L+W) =
 * 2 × 0.4 × 3.3 = 2.64 m²; a suspended beam (sides + soffit) is
 * 3.54 m²; all six faces are 4.44 m². This engine uses those values.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  calcRectangular, calcCircular, calcTube, calcPrecast, calcRoof,
  calcTrapFooting, calcStaircaseTab, defaultRectInputs, defaultPrecastInputs,
} from "../geometryCalc";

const approx = (a: number, e: number, tol: number) =>
  assert.ok(Math.abs(a - e) <= tol, `expected ${e} (±${tol}), got ${a}`);

test("rect defaults: V=0.36, formwork sides-only 2.64 m2, main 10.66 kg", () => {
  const r = calcRectangular(defaultRectInputs);
  assert.equal(r.errors.length, 0);
  assert.equal(r.volM3, 0.36);
  assert.equal(r.formworkM2, 2.64); // 2·D·(L+W); old code gave 3.30 (soffit in, ends out)
  assert.equal(r.formworkAllSidesM2, 4.44); // all six faces; old code gave 4.20
  approx(r.mainSteelKg, 10.66, 0.05);
});

test("stirrups use the IS 2502 detailed length (1.232 m) — 21 nos = 10.22 kg, not 9.95 kg", () => {
  const r = calcRectangular(defaultRectInputs);
  approx(r.stirrupSteelKg, 10.22, 0.1);
  assert.ok(r.totalSteelKg > 20);
});

test("bar sizes are inputs, not hardcoded 12/8 mm", () => {
  const r = calcRectangular({ ...defaultRectInputs, mainDiaMm: 16, stirrupDiaMm: 10 });
  assert.ok(r.mainSteelKg > 10.66);
  assert.ok(r.stirrupSteelKg > 0);
});

test("circular: V and spiral steel computed", () => {
  const r = calcCircular({ diaM: 0.4, heightM: 3, mainDiaMm: 12, mainBarCount: 6, tieDiaMm: 8, tiePitchM: 0.15, coverMm: 25, fck: 25, wastagePct: 5 });
  approx(r.volM3, 0.377, 0.005);
  assert.ok(r.totalSteelKg > 15);
});

test("tube: hollow volume and weight", () => {
  const r = calcTube({ odM: 1, idM: 0.8, lengthM: 5, fck: 25, wastagePct: 5 });
  approx(r.volM3, 1.414, 0.01);
  approx(r.weightKg ?? 0, 3393, 5);
});

test("trapezoidal footing reuses the frustum rule: V = 1.62 m3", () => {
  const r = calcTrapFooting({ baseLengthM: 2.2, baseWidthM: 2.2, baseDepthM: 0.2, topLengthM: 0.6, topWidthM: 0.6, slopeDepthM: 0.3, fck: 25, wastagePct: 5 });
  approx(r.volM3, 1.62, 0.02);
  // Formwork is base sides (1.76) + the four sloped faces (4.78) — the
  // old code counted the base sides only.
  approx(r.formworkM2, 6.54, 0.05);
});

test("roof: rafter, pitch, purlins and sheets", () => {
  const r = calcRoof({ spanM: 8, riseM: 2, runM: 12, purlinSpacingM: 1.2, battenSpacingM: 0.6, sheetWidthM: 1.0 });
  approx(r.rafterM, 4.47, 0.02);
  approx(r.pitchDeg, 26.6, 0.2);
  assert.ok(r.sheets > 0 && r.purlinsM > 0);
  // Purlins: ridge + eave + one every spacing, per slope — (⌈4.47/1.2⌉+1)
  // x 2 slopes x 12 m = 120 m (old code missed the ridge/eave pair: 96 m).
  approx(r.purlinsM, 120, 0.5);
});

test("staircase tab delegates to the shared engine (designed steel, not 120 kg/m3)", () => {
  const r = calcStaircaseTab({});
  assert.equal(r.twoRPlusT, 620);
  assert.ok(r.designedSteelKg > 0);
  // The old 120 kg/m3 rule would give 0.833 x 120 = 100 kg; designed steel differs.
  assert.ok(Math.abs(r.designedSteelKg - 100) > 5);
});

test("materials and cost are shown in-UI", () => {
  const r = calcRectangular(defaultRectInputs);
  assert.ok(r.materials.cementBags > 0);
  assert.ok(r.totalCost != null && r.totalCost > 0);
});

test("zero-guards: spacing/width 0 errors and stays finite — never Infinity", () => {
  // Stirrup spacing 0 (rectangular).
  const rect = calcRectangular({ ...defaultRectInputs, stirrupSpacingM: 0 });
  assert.ok(rect.errors.some((e) => e.includes("Stirrup spacing")), `errors: ${rect.errors.join("; ")}`);
  assert.equal(rect.stirrupSteelKg, 0);
  assert.ok(Number.isFinite(rect.totalSteelKg));
  // Tie pitch 0 (circular).
  const circ = calcCircular({ diaM: 0.4, heightM: 3, mainDiaMm: 12, mainBarCount: 6, tieDiaMm: 8, tiePitchM: 0, coverMm: 25, fck: 25, wastagePct: 5 });
  assert.ok(circ.errors.some((e) => e.includes("Tie pitch")), `errors: ${circ.errors.join("; ")}`);
  assert.equal(circ.stirrupSteelKg, 0);
  assert.ok(Number.isFinite(circ.totalSteelKg));
  // Roof: all three spacings/widths 0.
  const roof = calcRoof({ spanM: 8, riseM: 2, runM: 12, purlinSpacingM: 0, battenSpacingM: 0, sheetWidthM: 0 });
  assert.ok(roof.errors.some((e) => e.includes("Purlin spacing")));
  assert.ok(roof.errors.some((e) => e.includes("Batten spacing")));
  assert.ok(roof.errors.some((e) => e.includes("Sheet width")));
  assert.equal(roof.purlinsM, 0);
  assert.equal(roof.battensM, 0);
  assert.equal(roof.sheets, 0);
  assert.ok(Number.isFinite(roof.rafterM) && Number.isFinite(roof.areaM2));
  // One bad spacing only: the other two still compute.
  const roof2 = calcRoof({ spanM: 8, riseM: 2, runM: 12, purlinSpacingM: 0, battenSpacingM: 0.6, sheetWidthM: 1.0 });
  assert.equal(roof2.purlinsM, 0);
  assert.ok(roof2.battensM > 0 && roof2.sheets > 0);
});

test("precast: post spacing 0 errors, 0 posts, no Infinity", () => {
  const r = calcPrecast({ ...defaultPrecastInputs, postSpacingM: 0 });
  assert.ok(r.errors.some((e) => e.includes("Post spacing")), `errors: ${r.errors.join("; ")}`);
  assert.equal(r.extra?.postCount, 0);
  assert.equal(r.extra?.totalPanels, 0);
  assert.ok(Number.isFinite(r.volM3), `volM3: ${r.volM3}`);
  assert.ok(Object.values(r.extra ?? {}).every((v) => Number.isFinite(v)), `extra: ${JSON.stringify(r.extra)}`);
  assert.ok(!JSON.stringify(r).includes("Infinity"));
  // Valid spacing still computes (30 m wall at 3 m centres = 11 posts).
  const ok = calcPrecast(defaultPrecastInputs);
  assert.equal(ok.errors.length, 0);
  assert.equal(ok.extra?.postCount, 11);
});
