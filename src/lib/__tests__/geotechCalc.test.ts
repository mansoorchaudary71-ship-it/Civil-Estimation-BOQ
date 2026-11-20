import { test } from "node:test";
import assert from "node:assert/strict";
import { waterContent, specificGravity, onePointLiquidLimit, liquidLimitRegression, atterberg, cbrFromLoads, phaseRelations, freeSwell } from "../geotechCalc";
const approx = (a: number, b: number, tol = 0.01) => assert.ok(Math.abs(a - b) <= tol, `${a} ≈ ${b}`);
test("worked: WC 25/125/105 → 25.0%", () => approx(waterContent(25, 125, 105), 25.0));
test("worked: SG 500/700/1600/1475 → 2.667", () => approx(specificGravity(500, 700, 1600, 1475), 2.667));
test("worked: one-point LL N=22, w=42% → 41.4%", () => approx(onePointLiquidLimit(42, 22), 41.4, 0.05));
test("worked: CBR 180/300 kg → 13.14%/14.60%, report 2.5 mm + repeat flag", () => {
  const r = cbrFromLoads(180, 300);
  approx(r.cbr25, 13.14); approx(r.cbr50, 14.6); assert.equal(r.reported, r.cbr25); assert.equal(r.repeatTest, true);
});
test("LL regression over 4 flow-curve points gives LL near 40–42% with R²", () => {
  const { ll, r2 } = liquidLimitRegression([{ n: 15, w: 45 }, { n: 22, w: 42 }, { n: 28, w: 39 }, { n: 35, w: 37 }]);
  assert.ok(ll > 38 && ll < 43, `LL ${ll}`); assert.ok(r2 > 0.9, `R² ${r2}`);
});
test("Atterberg: PI/LI/CI + plasticity from LL/PI, not water content", () => {
  const a = atterberg(41.4, 22, 25);
  approx(a.pi, 19.4); approx(a.li, (25 - 22) / 19.4); assert.equal(a.plasticity, "High plasticity");
});
test("phase relations defaults are physical: bulk 1.8, w 25% → S ≈ 78.5% (≤100%)", () => {
  const p = phaseRelations(25, 2.667, 1.8);
  approx(p.dryDensity, 1.44); approx(p.voidRatio, 0.85, 0.01); approx(p.saturationPct, 78.5, 0.5);
  assert.ok(p.saturationPct <= 100);
});
test("free swell 10→15 ml = 50%", () => approx(freeSwell(10, 15).swellPct, 50));
test("validation: W2 < W3 throws, LL N out of range throws", () => {
  assert.throws(() => waterContent(25, 100, 105));
  assert.throws(() => onePointLiquidLimit(42, 10));
});
