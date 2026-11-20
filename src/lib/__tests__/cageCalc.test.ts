/**
 * Cage engine tests — run with:
 *   npx tsx --test src/lib/__tests__/cageCalc.test.ts
 *
 * Worked example from the G3 spec §1/§3C (Ø600 pile, L=10 m, cover 50,
 * 8×Ø16 main, Ø8 spiral @150, 10 piles). Rounding note: the spec's
 * printed weights use the 3-dp table unit weights (0.394 / 1.578 kg/m);
 * this engine uses precise d^2/162.28 (0.39438 / 1.57753), giving
 * spiral 43.52 kg (spec 43.51) and main 131.91 kg (spec 131.95) — the
 * per-pile total is 175.43 kg vs the spec's 175.46 kg (0.03 kg, 0.02%).
 * Weight assertions use a ±0.05 kg tolerance (project totals ±1 kg,
 * cost ±Rs 100); lengths, counts and areas are exact.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  calcCage,
  defaultCageInputs,
  validateCage,
  suggestedStiffenerCount,
} from "../cageCalc";
import { spiralLengthMm } from "../bbsCalc";

const approx = (actual: number, expected: number, tol = 1e-9) =>
  assert.ok(Math.abs(actual - expected) <= tol, `expected ${expected} (±${tol}), got ${actual}`);

test("default pile: core 492, 67 turns, spiral 107.14 m + 3.20 m laps = 110.34 m, 43.51 kg", () => {
  const r = calcCage(defaultCageInputs());
  assert.equal(r.coreDiaMm, 492);
  assert.equal(r.turns, 67);
  approx(r.turnLengthM!, 1.553, 0.001);
  approx(r.spiralLengthBeforeLapsM, 107.14, 0.01);
  assert.equal(r.spiralLaps, 8);
  approx(r.spiralLapLengthM, 3.2, 0.01);
  approx(r.spiralLengthM, 110.34, 0.01);
  approx(r.spiralWeightKg, 43.51, 0.05);
});

test("default pile: main bars 8xØ16, L_bar 10.452 m, 131.95 kg; per pile 175.46 kg", () => {
  const r = calcCage(defaultCageInputs());
  assert.equal(r.mainBarLengthM, 10.452);
  assert.equal(r.mainLapsPerBar, 0);
  approx(r.mainTotalLengthM, 83.62, 0.01);
  approx(r.mainWeightKg, 131.95, 0.05);
  approx(r.netKgPerPile, 175.46, 0.05);
  approx(r.orderKgPerPile, 184.23, 0.05);
});

test("default project: 10 piles -> 1,754.6 kg net, 1,842.3 kg @5%, Rs 497,421, 2.83 m3 concrete", () => {
  const r = calcCage(defaultCageInputs());
  approx(r.netKgTotal, 1754.6, 1);
  approx(r.orderKgTotal, 1842.3, 1);
  approx(Math.round(r.costTotal ?? 0), 497421, 100);
  assert.equal(r.concreteVolumeM3, 2.83);
  assert.equal(r.tonnesTotal.toFixed(2), "1.84");
});

test("BBS and Cage share one helix: same turns/turn-length; lengths differ only by end allowance", () => {
  const core = 492;
  const pitch = 150;
  const height = 10000;
  // BBS spiral adds 2x10d hooks (160 mm); cage adds 2 flat end turns (2*pi*core).
  const bbs = spiralLengthMm(core, pitch, height, 2 * 10 * 8);
  const cage = spiralLengthMm(core, pitch, height, 2 * Math.PI * core);
  assert.equal(bbs.turns, cage.turns);
  assert.equal(bbs.turnLengthMm, cage.turnLengthMm);
  approx(cage.lengthMm - bbs.lengthMm, 2 * Math.PI * core - 160, 0.01);
  const r = calcCage(defaultCageInputs());
  // Cage length is stored rounded to 2 dp in metres; the raw helix is
  // 107,137.3 mm, so compare in mm with a 10 mm tolerance.
  approx(r.spiralLengthBeforeLapsM * 1000, cage.lengthMm, 10);
});

test("hoop mode: N = floor((L-cover)/pitch)+1 = 67 rings (spec 3C formula)", () => {
  const r = calcCage({ ...defaultCageInputs(), cageType: "hoop" });
  // NOTE: the spec §1 cross-check quotes 68 rings / 1.738 m from the OLD
  // code's ceil(L/p)+1 count and 24d ring allowance; the rebuild spec §3C
  // formula is floor((L-cover)/p)+1 rings with L_ring = pi*core + 2*10d.
  assert.equal(r.hoopCount, 67);
  approx(r.ringLengthM!, 1.706, 0.01);
  approx(r.spiralLengthM, 117.88, 0.05);
});

test("stiffener rings: optional, 0 by default; suggestion is ceil(L/1.5)", () => {
  assert.equal(suggestedStiffenerCount(10), 7);
  assert.equal(suggestedStiffenerCount(3), 2);
  const r = calcCage(defaultCageInputs());
  assert.equal(r.stiffenerWeightKg, 0);
  assert.equal(r.components.length, 2);
  const withRings = calcCage({ ...defaultCageInputs(), stiffenerCount: 7, stiffenerDiaMm: 12 });
  assert.equal(withRings.components.length, 3);
  assert.ok(withRings.stiffenerWeightKg > 0);
  assert.ok(withRings.netKgPerPile > r.netKgPerPile);
});

test("validation: cover exceeding pile dia, main dia smaller than spiral, bad counts", () => {
  const inp = defaultCageInputs();
  assert.ok(validateCage({ ...inp, coverMm: 300 }).some((e) => e.includes("cover must be")));
  assert.ok(validateCage({ ...inp, pileDiaMm: 100 }).some((e) => e.includes("dia must be")));
  assert.ok(validateCage({ ...inp, mainDiaMm: 10, spiralDiaMm: 12 }).some((e) => e.includes("at least as large")));
  assert.ok(validateCage({ ...inp, mainCount: 3 }).some((e) => e.includes("Main bars")));
  assert.ok(validateCage({ ...inp, pitchMm: 50 }).some((e) => e.includes("Pitch")));
  assert.ok(validateCage({ ...inp, piles: 0 }).some((e) => e.includes("piles")));
  assert.deepEqual(validateCage(inp), []);
});

test("ft length unit converts (10 m pile entered as 32.81 ft gives the same cage)", () => {
  const r = calcCage({ ...defaultCageInputs(), piles: 1, cageLengthM: 32.8084, lengthUnit: "ft" });
  assert.equal(r.turns, 67);
  approx(r.spiralLengthM, 110.34, 0.05);
});
