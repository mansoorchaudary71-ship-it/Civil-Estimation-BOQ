/**
 * Column design engine tests — G7 spec §4.5 worked vector.
 * Run: npx tsx --test src/lib/__tests__/columnDesign.test.ts
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { designColumn, defaultColumnInputs, layoutBars } from "../columnDesign";

const approx = (a: number, e: number, tol: number) =>
  assert.ok(Math.abs(a - e) <= tol, `expected ${e} (±${tol}), got ${a}`);

test("verified P-M vector: Pu=1500, Mu=100, le=1.95, le/D=4.33 short, e_min=21, Asc=2513 (1.86%), Puz=2433, SAFE", () => {
  const r = designColumn();
  assert.equal(r.errors.length, 0);
  assert.equal(r.dMm, 400);
  assert.equal(r.puKN, 1500);
  assert.equal(r.muKNm, 100);
  approx(r.leM, 1.95, 0.01);
  approx(r.leOverD, 4.33, 0.05);
  assert.equal(r.slenderD, false);
  assert.equal(r.eMinMm, 21);
  approx(r.ascMm2, 2513, 2);
  approx(r.steelPct, 1.86, 0.02);
  approx(r.puzKN, 2433, 5);
  assert.equal(r.isSafe, true);
  assert.equal(r.steelLimitsOk, true);
  assert.ok(r.capacityMKNm > r.designMomentKNm);
});

test("0.8-6% steel gate trips at 4 x 12 mm (452 mm2 = 0.33%)", () => {
  const r = designColumn({ barCount: 4, barDiaMm: 12 });
  approx(r.steelPct, 0.33, 0.03);
  assert.equal(r.steelLimitsOk, false);
  assert.equal(r.isSafe, false);
});

test("slenderness is checked about both axes", () => {
  const r = designColumn({ lengthM: 6, endCondition: "pinned-pinned" });
  assert.equal(r.leOverD > 12, true);
  assert.equal(r.leOverB > 12, true);
  assert.ok(r.additionalMomentKNm > 0);
});

test("biaxial check (IS 456 Cl. 39.6) is computed when Muy is given", () => {
  const r = designColumn({ workingMomentYKNm: 40 });
  assert.ok(r.biaxialRatio != null);
  assert.ok(r.alphaBiaxial != null && r.alphaBiaxial >= 1 && r.alphaBiaxial <= 2);
  assert.equal(typeof r.biaxialOk, "boolean");
  assert.ok(r.linearCheck > 0);
});

test("tie design per Cl. 26.5.3.2", () => {
  const r = designColumn();
  assert.equal(r.tieDiaMm, 6); // max(20/4, 6)
  assert.equal(r.tieSpacingMm, 300); // min(300, 16x20, 300)
  assert.ok(r.tieCount > 0 && r.tieSteelKg > 0);
  // Ties use the IS 2502 detailed length (1.212 m for 300x450, cover 40,
  // Ø8) with inner dims A/B = section − 2·cover − φ — the old field-rule
  // length (1.372 m) read ~13% high: tie steel 5.95 -> 5.26 kg.
  assert.equal(r.tieCount, 11); // ceil(3000/300) + 1
  approx(r.tieSteelKg, 5.26, 0.05);
});

test("bar layout is explicit, not a half/half split", () => {
  const layers = layoutBars(8, 450, 58, 400, 20);
  const total = layers.reduce((s, l) => s + l.count, 0);
  assert.equal(total, 8);
  assert.ok(layers.length > 2, "side bars get their own depths");
  assert.equal(layers[0].depthMm, 58);
  assert.equal(layers[layers.length - 1].depthMm, 400);
});

test("validation rejects too few bars", () => {
  assert.ok(designColumn({ barCount: 2 }).errors.length > 0);
});
