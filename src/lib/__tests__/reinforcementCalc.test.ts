/**
 * Reinforcement engine tests — run with:
 *   npx tsx --test src/lib/__tests__/reinforcementCalc.test.ts
 *
 * Worked examples from the G3 spec §1/§3B. Rounding note: the spec's
 * printed stirrup weight (12.34 kg) uses the 3-dp table unit weight
 * (0.394 kg/m for Ø8); this engine uses the precise d^2/162.28 value
 * (0.39438), giving 12.36 kg — a 0.02 kg (0.2%) difference. Weight
 * assertions therefore use a ±0.05 kg tolerance; lengths, counts,
 * areas and ratios are exact.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  calcReinforcement,
  defaultReinforcementInputs,
  defaultSlabInputs,
  validateReinforcement,
  lapAllowanceM,
} from "../reinforcementCalc";

const approx = (actual: number, expected: number, tol = 1e-9) =>
  assert.ok(Math.abs(actual - expected) <= tol, `expected ${expected} (±${tol}), got ${actual}`);

test("default beam: d=415, As,bottom=942 mm2, rho=0.76%, clear spacing 87/202 mm", () => {
  const r = calcReinforcement(defaultReinforcementInputs());
  assert.equal(r.effectiveDepthMm, 415);
  approx(r.asBottomMm2!, 942, 0.5);
  approx(r.asTopMm2!, 402, 0.5);
  approx(r.rhoBottomPct!, 0.76, 0.01);
  assert.equal(r.bottomClearMm, 87);
  assert.equal(r.topClearMm, 202);
  assert.equal(r.minClearMm, 25);
  assert.equal(r.coverPass, true);
  assert.equal(r.spacingPass, true);
  assert.equal(r.activeWidthMm, 234);
});

test("default beam: stirrups 21 x 1.332 m = 27.97 m, main 31.65 kg, total 42.68 kg net", () => {
  // Unified X3 stirrup convention: inner dims A/B = section − 2·cover −
  // φ (242/392 mm, not 250/400) and the headline weight uses the IS 2502
  // DETAILED length (1.332 m, not the 1.492 m field rule) — stirrup
  // weight 12.34 -> 11.03 kg, total 43.99 -> 42.68 kg.
  const r = calcReinforcement(defaultReinforcementInputs());
  assert.equal(r.stirrupLengthSimpleMm, 1460);
  assert.equal(r.stirrupLengthDetailedMm, 1332);
  assert.ok(r.stirrupLengthSimpleMm! > r.stirrupLengthDetailedMm!, "field rule must read higher than detailed form");
  assert.equal(r.stirrupCount, 21);
  approx(r.stirrupTotalLengthM!, 27.97, 0.01);
  approx(r.stirrupWeightKg!, 11.03, 0.05);
  const main = r.layers.find((l) => l.label === "Bottom (main) bars")!;
  const top = r.layers.find((l) => l.label === "Top bars")!;
  approx(main.weightKg, 22.18, 0.05);
  approx(top.weightKg, 9.47, 0.05);
  approx(r.mainWeightKg, 31.65, 0.05);
  approx(r.totalNetKg, 42.68, 0.05);
  approx(r.orderWeightKg, 44.81, 0.05);
  approx(r.cost ?? 0, 12100, 10);
  assert.equal(r.costComplete, true);
  // ρ = 0.76% is BELOW the 0.8–1.5% beam band — the old note always
  // claimed "within" regardless of the computed value.
  assert.ok(r.rhoNote?.includes("BELOW"), "rho note must say BELOW at 0.76%");
});

test("slab worked example: 4x3 m, 150 thick, Ø12@150 + Ø8@200 -> 20+20 bars, 138.4 m, 93.57 kg", () => {
  const r = calcReinforcement(defaultSlabInputs());
  assert.equal(r.effectiveDepthMm, 124);
  assert.equal(r.slabGridLengthM, 3.96);
  assert.equal(r.slabGridWidthM, 2.96);
  assert.equal(r.slabMainCount, 20);
  assert.equal(r.slabDistCount, 20);
  const main = r.layers[0];
  const dist = r.layers[1];
  approx(main.totalLengthM, 79.2, 0.01);
  approx(dist.totalLengthM, 59.2, 0.01);
  approx(main.weightKg, 70.25, 0.1);
  approx(dist.weightKg, 23.32, 0.1);
  approx(r.totalNetKg, 93.57, 0.1);
  assert.equal(r.stirrupCount, null);
});

test("lap allowance: no lap at/under 12 m, one 50d lap per bar over 12 m", () => {
  assert.equal(lapAllowanceM(3, 20), 0);
  assert.equal(lapAllowanceM(12, 20), 0);
  assert.equal(lapAllowanceM(13, 20), 1.0);
  assert.equal(lapAllowanceM(25, 12), 1.2);
});

test("validation: cover, spacing, counts and dia are checked, never silently 0", () => {
  const inp = defaultReinforcementInputs();
  assert.ok(validateReinforcement({ ...inp, coverMm: 10 }).some((e) => e.includes("cover must be")));
  assert.ok(validateReinforcement({ ...inp, bottomCount: 0 }).some((e) => e.includes("whole number")));
  assert.ok(validateReinforcement({ ...inp, bottomDiaMm: 14 }).some((e) => e.includes("dia")));
  assert.ok(validateReinforcement({ ...inp, stirrupSpacingMm: 50 }).some((e) => e.includes("spacing")));
  assert.ok(validateReinforcement({ ...inp, lengthM: 0.2 }).some((e) => e.includes("length")));
  assert.deepEqual(validateReinforcement(inp), []);
  // Cover below the IS 456 minimum fails the compliance check (not the calc)
  const low = calcReinforcement({ ...inp, coverMm: 20 });
  assert.equal(low.coverPass, false);
  assert.equal(low.minCoverMm, 25);
  // Crowded bars fail the spacing check
  const crowded = calcReinforcement({ ...inp, widthMm: 150, bottomCount: 6, bottomDiaMm: 25 });
  assert.equal(crowded.spacingPass, false);
});

test("null rate -> null cost, never priced at 0", () => {
  const r = calcReinforcement({ ...defaultReinforcementInputs(), ratePerKg: null });
  assert.equal(r.cost, null);
  assert.equal(r.costComplete, false);
  assert.ok(r.totalNetKg > 0);
});
