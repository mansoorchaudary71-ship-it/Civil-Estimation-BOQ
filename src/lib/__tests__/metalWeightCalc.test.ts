/**
 * Metal weight engine tests — run with:
 *   npx tsx --test src/lib/__tests__/metalWeightCalc.test.ts
 *
 * Worked examples from the G3 spec §1/§3D. Rounding note: the spec's
 * printed per-piece weights use the 3-dp rounded kg/m (e.g. 2.466 for
 * Ø20); this engine uses the precise value (2.4649), so per-piece and
 * total assertions use a ±0.05 kg tolerance; kg/m assertions are exact
 * to 3 dp.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  calcMetalWeight,
  profileAreaMm2,
  validateMetal,
  STANDARD_SECTIONS,
  type MetalInputs,
} from "../metalWeightCalc";

const approx = (actual: number, expected: number, tol = 1e-9) =>
  assert.ok(Math.abs(actual - expected) <= tol, `expected ${expected} (±${tol}), got ${actual}`);

const base = (over: Partial<MetalInputs> = {}): MetalInputs => ({
  profile: "round",
  dims: { d: 20 },
  density: 7850,
  pieceLengthM: 12,
  qty: 1,
  wastagePct: 5,
  ratePerKg: 270,
  ...over,
});

test("round bar Ø20: 2.466 kg/m, 12 m piece 29.59 kg", () => {
  // Area maths (pi*400/4 x 7850) gives 2.466; the rebar d^2/162.28 value is
  // 2.465 — the G3 spec prints both. The metal engine uses area maths.
  const r = calcMetalWeight(base());
  assert.equal(r.weightPerM.toFixed(3), "2.466");
  approx(r.weightPerPieceKg, 29.59, 0.05);
  approx(r.totalKg, 29.59, 0.05);
  approx(r.orderKg, 31.07, 0.05);
});

test("pipe OD100x5: 11.71 kg/m; 6 m, 10 pcs -> 70.28 kg/pc, 702.8 kg", () => {
  const r = calcMetalWeight(base({ profile: "pipe", dims: { d: 100, t: 5 }, pieceLengthM: 6, qty: 10 }));
  assert.equal(r.weightPerM.toFixed(2), "11.71");
  approx(r.weightPerPieceKg, 70.28, 0.05);
  approx(r.totalKg, 702.8, 0.5);
  assert.ok(r.formula.includes("0.02466"), "pipe formula must show the 0.02466 shortcut");
});

test("plate/sheet: 1000x10, 2.5x1.25 m sheet -> 3.125 m2, 245.31 kg/sheet", () => {
  const r = calcMetalWeight(base({ profile: "sheet", dims: { w: 1250, t: 10 }, pieceLengthM: 2.5 }));
  assert.equal(r.sheetAreaM2, 3.13);
  assert.equal(r.plateKgPerM2, 78.5);
  approx(r.weightPerPieceKg, 245.31, 0.05);
});

test("angle 50x50x6: 4.43 kg/m, 12 m -> 53.1 kg; I-beam 150x300x10x7: 38.94 kg/m", () => {
  const angle = calcMetalWeight(base({ profile: "angle", dims: { leg1: 50, leg2: 50, t: 6 } }));
  assert.equal(angle.weightPerM.toFixed(2), "4.43");
  approx(angle.weightPerPieceKg, 53.1, 0.05);
  const beam = calcMetalWeight(base({ profile: "beam", dims: { w: 150, h: 300, tf: 10, tw: 7 }, pieceLengthM: 1 }));
  assert.equal(beam.areaMm2, 4960);
  assert.equal(beam.weightPerM.toFixed(2), "38.94");
  assert.ok(beam.note?.includes("Rectangle approximation"), "beam must warn about fillets");
});

test("hex s=30: 6.12 kg/m; square tube 50x3: 4.43 kg/m; rebar Ø12: 0.887 kg/m", () => {
  const hex = calcMetalWeight(base({ profile: "hex", dims: { s: 30 }, pieceLengthM: 1 }));
  assert.equal(hex.weightPerM.toFixed(2), "6.12");
  const tube = calcMetalWeight(base({ profile: "square-tube", dims: { w: 50, t: 3 }, pieceLengthM: 1 }));
  assert.equal(tube.weightPerM.toFixed(2), "4.43");
  const rebar = calcMetalWeight(base({ profile: "rebar", dims: { d: 12 }, pieceLengthM: 1 }));
  assert.equal(rebar.weightPerM.toFixed(3), "0.887");
  assert.ok(rebar.formula.includes("162.28"));
  // RHS 100x50x4: A = 2*4*(100+50-8) = 1136 mm2 -> 8.92 kg/m
  const rhs = calcMetalWeight(base({ profile: "rect-tube", dims: { w: 100, h: 50, t: 4 }, pieceLengthM: 1 }));
  assert.equal(rhs.areaMm2, 1136);
  assert.equal(rhs.weightPerM.toFixed(2), "8.92");
});

test("standard-section picker: ISMB 200 tabulated 25.4 kg/m overrides rectangle maths", () => {
  const ismb = STANDARD_SECTIONS.find((s) => s.id === "ismb200")!;
  assert.equal(ismb.kgPerM, 25.4);
  const r = calcMetalWeight(
    base({ profile: "beam", dims: ismb.dims, pieceLengthM: 1, tabulatedKgPerM: ismb.kgPerM }),
  );
  assert.equal(r.weightPerM, 25.4);
  assert.ok(r.note?.includes("IS 808 tabulated"));
  const rect = calcMetalWeight(base({ profile: "beam", dims: ismb.dims, pieceLengthM: 1 }));
  assert.notEqual(rect.weightPerM.toFixed(2), "25.40");
});

test("area formulas match the audit spot-checks", () => {
  approx(profileAreaMm2("round", { d: 20 }), 314.16, 0.01);
  approx(profileAreaMm2("pipe", { d: 100, t: 5 }), 1492.26, 0.01);
  approx(profileAreaMm2("hex", { s: 30 }), 779.42, 0.01);
  assert.equal(profileAreaMm2("pipe", { d: 100, t: 60 }), 0);
  assert.equal(profileAreaMm2("square-tube", { w: 50, t: 30 }), 0);
});

test("validation: blank dims, wall thicker than half the section, bad qty/length", () => {
  assert.ok(validateMetal(base({ dims: {} })).length > 0);
  assert.ok(validateMetal(base({ profile: "pipe", dims: { d: 100, t: 60 } })).some((e) => e.includes("half the outer dia")));
  assert.ok(validateMetal(base({ qty: 0 })).some((e) => e.includes("Quantity")));
  assert.ok(validateMetal(base({ qty: 1.5 })).some((e) => e.includes("whole number")));
  assert.ok(validateMetal(base({ pieceLengthM: 0 })).some((e) => e.includes("Piece length")));
  assert.ok(validateMetal(base({ density: 500 })).some((e) => e.includes("Density")));
  assert.deepEqual(validateMetal(base()), []);
});

test("cost: null rate -> null cost; lb/ft shown alongside kg/m", () => {
  const r = calcMetalWeight(base({ ratePerKg: null }));
  assert.equal(r.cost, null);
  assert.equal(r.costComplete, false);
  const priced = calcMetalWeight(base());
  assert.ok((priced.cost ?? 0) > 0);
  approx(priced.weightLbPerFt, 2.466 * 0.6719689, 0.001);
});
