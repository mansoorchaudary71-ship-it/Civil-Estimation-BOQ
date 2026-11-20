import { test } from "node:test";
import assert from "node:assert/strict";
import { calcBrickwork, calcBrickworkFromArea, BRICK_PRESETS, defaultBrickInputs } from "../brickCalc";

const approx = (a: number, b: number, tol = 0.01) =>
  assert.ok(Math.abs(a - b) <= tol, `expected ${a} ≈ ${b} (±${tol})`);

test("10x10 ft wall, 230 mm, PK Awwal, 10 mm joint, 1:4, 5% -> 873 / 917 / 5 bags / 21.8 cft", () => {
  const r = calcBrickwork(defaultBrickInputs("PKR"));
  approx(r.bricksBeforeWastage, 873, 1);
  assert.equal(r.bricks, 917);
  assert.equal(r.cementBags, 5);
  approx(r.sandCft, 21.8, 0.1);
  approx(r.bricksPerSqFt, 8.73, 0.01);
});

test("workspace wall: 52 m2 net, 230 mm -> 4,886 before wastage, 5,130 @5% (old workspace said 6,358)", () => {
  const r = calcBrickworkFromArea(52, 230, BRICK_PRESETS[0], {
    jointMm: 10, wastagePct: 5, mix: [1, 4],
  });
  approx(r.bricksBeforeWastage, 4886, 1);
  assert.equal(r.bricks, 5130);
});

test("AAC 600x200x150 and hollow 400x200x200 presets exist and use the same engine", () => {
  const aac = BRICK_PRESETS.find((p) => p.id === "aac-600");
  const hollow = BRICK_PRESETS.find((p) => p.id === "hollow-400");
  assert.ok(aac && aac.l === 600 && aac.w === 200 && aac.h === 150);
  assert.ok(hollow && hollow.l === 400 && hollow.w === 200 && hollow.h === 200);
  // AAC wall: 52 m2 x 0.15 m = 7.8 m3; block+mortar (0.603 x 0.203 x 0.153) = 0.01873 m3
  const r = calcBrickworkFromArea(52, 150, aac, { jointMm: 3, wastagePct: 5, mix: [1, 4] });
  approx(r.bricksBeforeWastage, 7.8 / (0.603 * 0.203 * 0.153), 1);
  assert.ok(r.cementBags > 0 && r.sandM3 > 0);
  // Hollow wall: 52 m2 x 0.20 m = 10.4 m3; block+mortar (0.41 x 0.21 x 0.21) = 0.01808 m3
  const h = calcBrickworkFromArea(52, 200, hollow, { jointMm: 10, wastagePct: 5, mix: [1, 4] });
  approx(h.bricksBeforeWastage, 10.4 / (0.41 * 0.21 * 0.21), 1);
});

test("mortar uses the pre-wastage count (Brickwork9InchModule bug: ceiled count understates mortar)", () => {
  // With 0% wastage the ceiled and pre-wastage counts agree only by luck;
  // with 5% they differ. Wet mortar must be wallVol - preWastage*unitVol, x1.15.
  const r = calcBrickwork(defaultBrickInputs("PKR"));
  const wallVol = 9.2903 * 0.23;
  const expectedWet = Math.max(0, wallVol - r.bricksBeforeWastage * (0.23 * 0.11 * 0.075)) * 1.15;
  approx(r.wetMortarM3, expectedWet, 0.001);
});
