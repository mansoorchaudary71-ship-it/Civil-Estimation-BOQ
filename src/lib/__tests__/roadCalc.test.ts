import { test } from "node:test";
import assert from "node:assert/strict";
import { layerQuantities, coatQuantity, irc37Guidance, ROAD_WORKED_LAYERS } from "../roadCalc";
const approx = (a: number, b: number, tol = 0.5) => assert.ok(Math.abs(a - b) <= tol, `${a} ≈ ${b}`);
test("worked flexible layers (L=1000 m): BC 283.2 m³/679.7 t, DBM 660.6/1552.4, WMM 2755/6198.8, GSB 2384/5006.4, SG 6660/11988", () => {
  const expected: [number, number][] = [[283.2, 679.7], [660.6, 1552.4], [2755, 6198.8], [2384, 5006.4], [6660, 11988]];
  ROAD_WORKED_LAYERS.forEach((layer, i) => {
    const q = layerQuantities(1000, layer);
    approx(q.volumeM3, expected[i][0], 0.5); approx(q.tonnageT, expected[i][1], 1);
  });
});
test("bitumen content: BC 5.5% of BC tonnage", () => {
  const q = layerQuantities(1000, { ...ROAD_WORKED_LAYERS[0], bitumenPct: 5.5 });
  approx(q.bitumenT, 679.7 * 0.055, 0.5);
});
test("prime/tack: 10,520 m² × 1.0 L/m² = 10,520 L ≈ 10.63 t; tack 3630 L ≈ 3.67 t", () => {
  const prime = coatQuantity(10520, 1.0);
  approx(prime.litres, 10520); approx(prime.tonnes, 10.63, 0.02); assert.equal(prime.drums200L, 53);
  const tack = coatQuantity(14520, 0.25);
  approx(tack.litres, 3630); approx(tack.tonnes, 3.67, 0.02);
});
test("IRC:37 guidance is labelled guidance, CBR<5% needs improvement", () => {
  assert.ok(irc37Guidance(3, 10).includes("improvement"));
  assert.ok(irc37Guidance(8, 10).includes("guidance only"));
});
test("no rate → cost null, not 0", () => {
  assert.equal(layerQuantities(1000, ROAD_WORKED_LAYERS[0]).cost, null);
});
