import { test } from "node:test";
import assert from "node:assert/strict";
import { verticalCurve, ssdForSpeed, longitudinalRise, camberDrop, curveHighLowPoint, stationElevations } from "../gradientCalc";
const approx = (a: number, b: number, tol = 0.05) => assert.ok(Math.abs(a - b) <= tol, `${a} ≈ ${b}`);
test("worked: g1=3, g2=−2, V=80, SSD 120 m → A=5%, crest L=109.4 m, K=21.9", () => {
  assert.equal(ssdForSpeed(80), 120);
  const v = verticalCurve(3, -2, 80);
  assert.equal(v.type, "Crest"); approx(v.aPct, 5); approx(v.lengthM, 109.4, 0.1); approx(v.k, 21.9, 0.05);
  assert.ok(v.lengthM !== 114.3, "old invented K=V²/280 gave 114.3 m");
});
test("sag curve uses L=A·S²/(120+3.5S)", () => {
  const v = verticalCurve(-2, 3, 80);
  assert.equal(v.type, "Sag");
  approx(v.lengthM, (5 * 120 * 120) / (120 + 3.5 * 120), 0.1);
  assert.ok(v.minLengthComfortM !== null);
});
test("longitudinal + camber worked examples", () => {
  const l = longitudinalRise(100, -2.5);
  approx(l.riseM, -2.5); assert.equal(l.ratio, "1:40.00");
  approx(camberDrop(3.5, -2).dropM, 0.07);
});
test("high/low point + station elevations", () => {
  const hl = curveHighLowPoint(3, -2, 109.4);
  approx(hl.xFromPvcM as number, 65.64, 0.1); approx(hl.eM, (5 * 109.4) / 800, 0.01);
  const stations = stationElevations(0, 100, 3, -2, 109.4, 10);
  assert.ok(stations.length > 10 && stations[0].elevationM === 100);
});
test("validation: grade >12% and speed out of range throw", () => {
  assert.throws(() => verticalCurve(15, 0, 80));
  assert.throws(() => verticalCurve(3, -2, 10));
});
