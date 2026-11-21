import { test } from "node:test";
import assert from "node:assert/strict";
import { layerQuantities, coatQuantity, irc37Guidance, ROAD_WORKED_LAYERS } from "../roadCalc";
const approx = (a: number, b: number, tol = 0.5) => assert.ok(Math.abs(a - b) <= tol, `${a} ≈ ${b}`);
test("worked flexible layers (L=1000 m): BC 283.2 m³/679.7 t, DBM 660.6/1552.4, WMM 2005/4511.3, GSB 1784/3746.4, SG 5160/9288", () => {
  // Volumes rebuilt from one consistent 2:1 slope with continuous stacking
  // (old fixture had 0.66 m / 1.16 m gaps between layers and a different
  // implied slope per layer). WMM (7.52+8.52)/2·0.25·1000 = 2005 m³;
  // GSB (8.52+9.32)/2·0.20·1000 = 1784 m³; SG (9.32+11.32)/2·0.50·1000 = 5160 m³.
  const expected: [number, number][] = [[283.2, 679.7], [660.6, 1552.4], [2005, 4511.3], [1784, 3746.4], [5160, 9288]];
  ROAD_WORKED_LAYERS.forEach((layer, i) => {
    const q = layerQuantities(1000, layer);
    approx(q.volumeM3, expected[i][0], 0.5); approx(q.tonnageT, expected[i][1], 1);
  });
});
test("worked layers stack continuously at one 2:1 slope (no gaps)", () => {
  for (let i = 1; i < ROAD_WORKED_LAYERS.length; i++) {
    assert.equal(ROAD_WORKED_LAYERS[i].topWidthM, ROAD_WORKED_LAYERS[i - 1].bottomWidthM);
    const widen = ROAD_WORKED_LAYERS[i].bottomWidthM - ROAD_WORKED_LAYERS[i].topWidthM;
    approx(widen, 2 * 2 * (ROAD_WORKED_LAYERS[i].thicknessMm / 1000), 0.001);
  }
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
