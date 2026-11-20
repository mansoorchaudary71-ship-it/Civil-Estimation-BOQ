import { test } from "node:test";
import assert from "node:assert/strict";
import {
  calcRoomGeometry,
  calcPlaster,
  calcPaint,
  calcFlooring,
  calcCountertop,
  calcCarpentry,
  calcCarpetArea,
  calcMasonry,
  deductOpening,
  validateRoom,
} from "../finishesCalc";
import { BRICK_PRESETS } from "../brickCalc";

const approx = (a: number, b: number, tol = 0.01) =>
  assert.ok(Math.abs(a - b) <= tol, `expected ${a} ≈ ${b} (±${tol})`);

test("IS 1200 opening deductions: <0.5 none, 0.5-3 one face, >3 both faces + jambs", () => {
  const small = deductOpening({ id: "a", kind: "window", widthM: 0.4, heightM: 0.4, count: 1 }, 1, 0.23);
  assert.equal(small.rule, "none");
  assert.equal(small.deductionM2, 0);
  const mid = deductOpening({ id: "b", kind: "door", widthM: 0.9, heightM: 2.1, count: 1 }, 1, 0.23);
  assert.equal(mid.rule, "one-face");
  approx(mid.deductionM2, 1.89);
  assert.equal(mid.jambM2, 0);
  const big = deductOpening({ id: "c", kind: "window", widthM: 2, heightM: 2, count: 1 }, 1, 0.23);
  assert.equal(big.rule, "both-faces");
  approx(big.deductionM2, 4);
  approx(big.jambM2, (2 * 2 + 2) * 0.23);
  // Two faces: a >3 m2 opening is deducted on both faces.
  const big2 = deductOpening({ id: "c", kind: "window", widthM: 2, heightM: 2, count: 1 }, 2, 0.23);
  approx(big2.deductionM2, 8);
});

test("room geometry, G4 worked example: 5x4x3 m, door 0.9x2.1 + window 1.2x1.2 -> net 50.67 m2", () => {
  const g = calcRoomGeometry(
    5, 4, 3,
    [
      { id: "d", kind: "door", widthM: 0.9, heightM: 2.1, count: 1 },
      { id: "w", kind: "window", widthM: 1.2, heightM: 1.2, count: 1 },
    ],
    1,
  );
  approx(g.grossWallM2, 54);
  approx(g.netWallM2, 50.67);
  approx(g.floorM2, 20);
  approx(g.perimeterM, 18);
  assert.deepEqual(validateRoom(5, 4, 3, []), []);
  assert.ok(validateRoom(0, 4, 3, []).length > 0);
});

test("masonry delegates to brickCalc: 52 m2 net wall, 230 mm -> 4,886 before, 5,130 @5%", () => {
  const r = calcMasonry({
    netWallM2: 52,
    thicknessMm: 230,
    brick: BRICK_PRESETS[0],
    jointMm: 10,
    wastagePct: 5,
    mix: [1, 4],
    currency: "PKR",
    rates: { brickPer1000: null, cementPerBag: null, sandPerUnit: null },
  });
  approx(r.bricksBeforeWastage, 4886, 1);
  assert.equal(r.bricks, 5130);
  // NOTE: G1 §5.2 prints dry mortar 4.11 m3 / 24 bags, which omits the
  // wastage multiplier on dry mortar. brickCalc (the one engine, matching
  // the brick page's own 10x10 ft example) applies it: dry 4.32, 25 bags.
  approx(r.dryMortarM3, 4.32, 0.02);
  assert.equal(r.cementBags, 25);
  approx(r.sandM3, 3.46, 0.02);
});

test("plaster, G1 worked example: 52+20 int @12mm, 54 ext @20mm, 1:4, 5% -> 16 bags, 2.17 m3 sand", () => {
  const r = calcPlaster({
    internalAreaM2: 52, externalAreaM2: 54, ceilingAreaM2: 20, ceilingIncluded: true,
    internalThicknessMm: 12, externalThicknessMm: 20, mix: [1, 4], unevenFactor: 1, wastagePct: 5,
  });
  approx(r.internalWetM3, 0.864);
  approx(r.externalWetM3, 1.08);
  approx(r.dryM3, 2.715, 0.01);
  assert.equal(r.cementBags, 16);
  approx(r.sandM3, 2.17, 0.01);
});

test("plaster, G4 worked example: net 50.67 @12mm 1:4 +10% uneven -> 6 bags, 0.71 m3 sand", () => {
  const r = calcPlaster({
    internalAreaM2: 50.67, externalAreaM2: 0, ceilingAreaM2: 0, ceilingIncluded: false,
    internalThicknessMm: 12, externalThicknessMm: 20, mix: [1, 4], unevenFactor: 1.1, wastagePct: 0,
  });
  approx(r.wetM3, 0.669, 0.01);
  approx(r.dryM3, 0.89, 0.01);
  assert.equal(r.cementBags, 6);
  approx(r.sandM3, 0.71, 0.01);
});

test("paint, G1 worked example: area 72 - 1.8 skirting = 70.2 -> primer 6 L, paint 15 L", () => {
  const r = calcPaint({
    netWallM2: 52, ceilingM2: 20, ceilingIncluded: true, doorAreaM2: 0,
    skirtingHeightM: 0.1, perimeterM: 18, skirtingDeducted: true,
    coverageM2PerL: 10, primerCoverageM2PerL: 12, coats: 2, primerCoats: 1,
    puttyCoverageM2PerKg: 1.1, puttyCoats: 0, wastagePct: 5,
  });
  approx(r.paintableAreaM2, 70.2);
  assert.equal(r.primerLitres, 6);
  assert.equal(r.paintLitres, 15);
});

test("paint, G4 worked example: net 50.67, 11 m2/L, 2 coats +10% -> 11 L, primer 8 L, putty 93 kg", () => {
  const r = calcPaint({
    netWallM2: 50.67, ceilingM2: 0, ceilingIncluded: false, doorAreaM2: 0,
    skirtingHeightM: 0.1, perimeterM: 18, skirtingDeducted: false,
    coverageM2PerL: 11, primerCoverageM2PerL: 7, coats: 2, primerCoats: 1,
    puttyCoverageM2PerKg: 1.1, puttyCoats: 2, wastagePct: 10,
  });
  assert.equal(r.paintLitres, 11);
  assert.equal(r.primerLitres, 8);
  assert.equal(r.puttyKg, 93);
  assert.deepEqual(r.packs, [{ sizeL: 10, count: 1 }, { sizeL: 1, count: 1 }]);
});

test("flooring, G1 worked example: 600x600, 3mm grout, straight 10% -> floor 61, skirting 6, 17 boxes, 8 bags", () => {
  const r = calcFlooring({
    floorAreaM2: 20, perimeterM: 18, tileLengthM: 0.6, tileWidthM: 0.6, groutMm: 3,
    pattern: "straight", wastagePct: 10, tilesPerBox: 4, skirtingHeightM: 0.1,
    skirtingIncluded: true, doorWidthsTotalM: 0, bedThicknessMm: 50, mix: [1, 4],
  });
  // NOTE: G1 prints floor tiles 60 using a rounded tile area of 0.367 m2;
  // exact (0.603 x 0.603) = 0.3636 m2 gives 61. Skirting, boxes and bags match.
  assert.equal(r.floorTiles, 61);
  assert.equal(r.skirtingTiles, 6);
  assert.equal(r.totalTiles, 67);
  assert.equal(r.boxes, 17);
  assert.equal(r.bedCementBags, 8);
  approx(r.bedDryM3, 1.33, 0.01);
});

test("countertop, G1 worked example: straight 3x0.6, sink + hob -> net 1.23, order 2.33, edge 4.2, slab 0.036 m3", () => {
  const r = calcCountertop({
    shape: "straight", lengthAM: 3, lengthBM: 0, lengthCM: 0, depthM: 0.6,
    slabThicknessMm: 20, sinkOn: true, sinkLengthM: 0.6, sinkWidthM: 0.45,
    hobOn: true, hobLengthM: 0.6, hobWidthM: 0.5, skirtingHeightM: 0.1, wastagePct: 5,
  });
  approx(r.grossAreaM2, 1.8);
  approx(r.netAreaM2, 1.23);
  approx(r.skirtingAreaM2, 0.42);
  approx(r.orderAreaM2, 2.33, 0.01);
  approx(r.edgePolishM, 4.2);
  approx(r.slabVolumeM3, 0.036);
});

test("carpentry, G1 worked example: studs 45 (closed room, no +1); panelling sheets 19 (no /4 reuse)", () => {
  const r = calcCarpentry({
    perimeterM: 18, netWallAreaM2: 52, studSpacingM: 0.4, openRun: false,
    sheetLengthM: 2.44, sheetWidthM: 1.22, wastagePct: 5, purpose: "panelling", reuseFactor: 4,
  });
  assert.equal(r.studs, 45);
  assert.equal(r.sheets, 19);
  const formwork = calcCarpentry({
    perimeterM: 18, netWallAreaM2: 52, studSpacingM: 0.4, openRun: false,
    sheetLengthM: 2.44, sheetWidthM: 1.22, wastagePct: 5, purpose: "formwork", reuseFactor: 4,
  });
  assert.equal(formwork.sheets, 5);
});

test("carpet / built-up: 20 m2 -> built-up 23.53, super 28.24 (assumption-labelled)", () => {
  const r = calcCarpetArea({ floorAreaM2: 20, internalWallDeductionPct: 15, superBuiltUpAddPct: 20 });
  approx(r.carpetAreaM2, 20);
  approx(r.builtUpAreaM2, 23.53, 0.01);
  approx(r.superBuiltUpAreaM2, 28.24, 0.01);
});
