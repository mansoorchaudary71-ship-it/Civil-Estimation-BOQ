import { test } from "node:test";
import assert from "node:assert/strict";
import {
  calcShape, calcPlot, calcProperty, calcPlasterDeduction, calcRoof, heronArea,
  type ShapeInputs,
} from "../areaSpaceCalc";

const approx = (a: number, b: number, tol = 0.01) =>
  assert.ok(Math.abs(a - b) <= tol, `expected ${a} ≈ ${b} (±${tol})`);

const shapeDefaults = (): ShapeInputs => ({
  lengthM: 5, widthM: 4, radiusM: 3, sideAM: 5, sideBM: 7, sideCM: 4, heightM: 3,
  overallLengthM: 5, overallWidthM: 3, arm1M: 2, arm2M: 2,
  topWidthM: 6, topThicknessM: 1, legWidthM: 2, totalHeightM: 5,
  polygon: [{ x: 0, y: 0 }, { x: 5, y: 0 }, { x: 4, y: 4 }, { x: 1, y: 3 }],
});

test("shapes: rectangle 5x4 -> 20; circle r=3 -> 28.27; triangle 5/7/4 -> 9.80", () => {
  const p = shapeDefaults();
  approx(calcShape("rectangle", p).areaM2, 20);
  approx(calcShape("rectangle", p).perimeterM, 18);
  approx(calcShape("circle", p).areaM2, 28.27);
  approx(calcShape("triangle", p).areaM2, 9.8, 0.01);
});

test("L-shape overall 5x3, arms 2/2 -> area 12.00, perimeter 16.00 (shoelace cross-check)", () => {
  const p = shapeDefaults();
  const r = calcShape("l-shape", p);
  approx(r.areaM2, 12);
  approx(r.perimeterM, 16);
  // Shoelace on the L polygon (0,0)-(5,0)-(5,2)-(2,2)-(2,3)-(0,3): area 12, perimeter 16.
  const poly = calcShape("polygon", {
    ...p,
    polygon: [{ x: 0, y: 0 }, { x: 5, y: 0 }, { x: 5, y: 2 }, { x: 2, y: 2 }, { x: 2, y: 3 }, { x: 0, y: 3 }],
  });
  approx(poly.areaM2, 12);
  approx(poly.perimeterM, 16);
});

test("T-shape: top 6x1 + leg (5-1)x2 -> area 14, perimeter 22", () => {
  const r = calcShape("t-shape", shapeDefaults());
  approx(r.areaM2, 14);
  approx(r.perimeterM, 22);
});

test("plot 30/30/40/40/D50 -> 1,200; impossible diagonal errors", () => {
  const r = calcPlot({ northM: 30, southM: 30, eastM: 40, westM: 40, diagonalM: 50 });
  approx(r.totalM2!, 1200);
  assert.equal(r.error, null);
  const bad = calcPlot({ northM: 30, southM: 30, eastM: 40, westM: 40, diagonalM: 100 });
  assert.equal(bad.totalM2, null);
  assert.ok(bad.error);
  assert.equal(heronArea(1, 2, 10), null);
});

test("plaster single-face fix: wall 15 m2, openings 2.1 + 1.8 (0.5-3 tier) -> net 11.10, not 13.05", () => {
  const r = calcPlasterDeduction({
    wallLengthM: 5, wallHeightM: 3, faces: 1,
    openings: [
      { id: "o1", kind: "door", widthM: 1.05, heightM: 2, count: 1 },
      { id: "o2", kind: "window", widthM: 1.5, heightM: 1.2, count: 1 },
    ],
    jambDepthM: 0.2, lengthUnit: "m",
  });
  approx(r.grossAreaM2, 15);
  approx(r.totalDeductionM2, 3.9);
  approx(r.netAreaM2, 11.1);
});

test("roof 150 m2 @30 deg, overhang 0.6, perimeter 50 -> true 207.85 m2", () => {
  const r = calcRoof({ floorAreaM2: 150, pitchDegrees: 30, overhangM: 0.6, perimeterM: 50 });
  approx(r.horizontalAreaM2, 180);
  approx(r.trueAreaM2, 207.85, 0.01);
  approx(r.pitchMultiplier, 1.1547, 0.001);
});

test("RERA ladder: carpet 100 -> RERA 110 / plinth 115 / built-up 125 / super 150", () => {
  const r = calcProperty({
    carpetM2: 100, internalWallsPct: 10, externalWallsPct: 5, balconyM2: 10, commonAreaPct: 20,
  });
  approx(r.reraCarpetM2, 110);
  approx(r.plinthM2, 115);
  approx(r.builtUpM2, 125);
  approx(r.superBuiltUpM2, 150);
});
