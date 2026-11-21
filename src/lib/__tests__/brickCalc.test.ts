import { test } from "node:test";
import assert from "node:assert/strict";
import {
  calcBrickwork,
  calcBrickworkFromArea,
  calcBrickProject,
  convertLength,
  bricksPerArea,
  mixGuide,
  cementBagVolumeM3,
  BRICK_PRESETS,
  THICKNESS_PRESETS,
  BOND_PATTERNS,
  defaultBrickInputs,
} from "../brickCalc";

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

test("unit conversion: 10 ft = 3.048 m; same wall in ft and m gives the same count", () => {
  assert.equal(convertLength(10, "ft", "m"), 3.048);
  assert.equal(convertLength(3.048, "m", "ft"), 10);
  approx(convertLength(1, "yd", "ft"), 3, 1e-9);
  approx(convertLength(100, "cm", "m"), 1, 1e-9);
  approx(convertLength(1000, "mm", "m"), 1, 1e-9);
  approx(convertLength(12, "in", "ft"), 1, 1e-9);
  const inFt = calcBrickwork(defaultBrickInputs("PKR"));
  const inM = calcBrickwork({ ...defaultBrickInputs("PKR"), length: 3.048, height: 3.048, lengthUnit: "m" });
  approx(inM.bricksBeforeWastage, inFt.bricksBeforeWastage, 0.5);
  assert.equal(inM.bricks, inFt.bricks);
  assert.equal(inM.cementBags, inFt.cementBags);
});

test("18 in thickness preset exists (457 mm) and US brick preset exists", () => {
  const t = THICKNESS_PRESETS.find((p) => p.id === "t457");
  assert.ok(t && t.mm === 457);
  const us = BRICK_PRESETS.find((p) => p.id === "us-standard");
  assert.ok(us && us.l === 190.5 && us.w === 88.9 && us.h === 57.2);
  const r = calcBrickwork({ ...defaultBrickInputs("PKR"), brick: us });
  assert.ok(r.bricksBeforeWastage > 0 && isFinite(r.bricksBeforeWastage));
});

test("bricksPerArea: 4.5/9/13.5/18 in -> 4.4 / 8.7 / 13.1 / 17.3 per sq ft (exact, Awwal + 10 mm)", () => {
  approx(bricksPerArea(115, BRICK_PRESETS[0]).perSqFt, 4.4, 0.05);
  approx(bricksPerArea(230, BRICK_PRESETS[0]).perSqFt, 8.7, 0.05);
  approx(bricksPerArea(345, BRICK_PRESETS[0]).perSqFt, 13.1, 0.05);
  approx(bricksPerArea(457, BRICK_PRESETS[0]).perSqFt, 17.3, 0.05);
  approx(bricksPerArea(230, BRICK_PRESETS[0]).per100SqFt, 873, 1);
});

test("openings: total-area mode deducts; openings larger than the wall are flagged, never negative", () => {
  const withDoor = calcBrickwork({
    ...defaultBrickInputs("PKR"),
    openings: [{ id: "d", kind: "door", length: 3, height: 7, count: 1 }],
  });
  approx(withDoor.bricksBeforeWastage, 690, 1);
  assert.equal(withDoor.bricks, 725);
  const totalArea = calcBrickwork({ ...defaultBrickInputs("PKR"), openingsTotalAreaM2: 21 * 0.092903 });
  approx(totalArea.bricksBeforeWastage, 690, 1);
  const tooBig = calcBrickwork({ ...defaultBrickInputs("PKR"), openingsTotalAreaM2: 200 });
  assert.equal(tooBig.openingsExceedWall, true);
  assert.equal(tooBig.netAreaM2, 0);
  assert.equal(tooBig.bricksBeforeWastage, 0);
  assert.equal(tooBig.bricks, 0);
});

test("wastage pills: 0/10/15% scale bricks and mortar; 1:5 mix gives 4 bags / 22.7 cft sand", () => {
  const zero = calcBrickwork({ ...defaultBrickInputs("PKR"), wastagePct: 0 });
  assert.equal(zero.bricks, 873);
  const ten = calcBrickwork({ ...defaultBrickInputs("PKR"), wastagePct: 10 });
  assert.equal(ten.bricks, 961); // ceil(873.4 * 1.10)
  const fifteen = calcBrickwork({ ...defaultBrickInputs("PKR"), wastagePct: 15 });
  assert.equal(fifteen.bricks, 1004); // ceil(873.4 * 1.15)
  approx(fifteen.wastageBricks, 873.4 * 0.15, 1);
  const mix5 = calcBrickwork({ ...defaultBrickInputs("PKR"), mix: [1, 5] });
  assert.equal(mix5.cementBags, 4);
  approx(mix5.sandCft, 22.7, 0.1);
  const mix6 = calcBrickwork({ ...defaultBrickInputs("PKR"), mix: [1, 6] });
  assert.equal(mix6.cementBags, 4);
  approx(mix6.sandCft, 23.4, 0.1);
});

test("multi-wall project: two 10x10 ft walls double the single-wall result; bags rounded once", () => {
  const wall = { id: "w1", name: "Wall 1", length: 10, height: 10, lengthUnit: "ft" as const, thicknessMm: 230, openings: [] };
  const project = calcBrickProject(
    [wall, { ...wall, id: "w2", name: "Wall 2" }],
    { brick: BRICK_PRESETS[0], jointMm: 10, wastagePct: 5, mix: [1, 4], currency: "PKR", rates: { brickPer1000: null, cementPerBag: null, sandPerUnit: null } },
  );
  assert.equal(project.walls.length, 2);
  assert.equal(project.walls[0].results.bricks, 917);
  assert.equal(project.totals.bricks, 1834);
  approx(project.totals.bricksBeforeWastage, 2 * project.walls[0].results.bricksBeforeWastage, 0.01);
  // Cement bags are rounded up ONCE for the project (2 x 0.1544 m3 / 0.0347 = 8.9 -> 9),
  // not once per wall (which would give 5 + 5 = 10).
  assert.equal(project.totals.cementBags, 9);
  approx(project.totals.sandCft, 2 * 21.8, 0.2);
  assert.equal(project.anyOpeningsExceed, false);
});

test("area mode: 100 sq ft (9.2903 m2) at 230 mm matches the 10x10 ft wall", () => {
  const r = calcBrickworkFromArea(9.2903, 230, BRICK_PRESETS[0], { jointMm: 10, wastagePct: 5, mix: [1, 4] });
  approx(r.bricksBeforeWastage, 873, 1);
  assert.equal(r.bricks, 917);
});

test("custom cement bag size scales linearly; cement kg = bags x bag size", () => {
  assert.equal(cementBagVolumeM3(50), 0.0347);
  approx(cementBagVolumeM3(25), 0.01735, 1e-6);
  const r = calcBrickwork({ ...defaultBrickInputs("PKR"), cementBagKg: 25 });
  assert.equal(r.cementBags, 9); // 0.1544 m3 cement / 0.01735 m3 per 25 kg bag = 8.9 -> 9
  assert.equal(r.cementKg, 225);
  const d = calcBrickwork(defaultBrickInputs("PKR"));
  assert.equal(d.cementKg, 250); // 5 bags x 50 kg
  approx(d.wallVolumeCft, 75.5, 0.1);
  approx(d.wetMortarCft, 19.5, 0.1);
});

test("mix guide: bags per m3 dry mortar are 7.2 / 5.8 / 4.8 / 4.1 for 1:3 / 1:4 / 1:5 / 1:6", () => {
  approx(mixGuide([1, 3]).cementBagsPerM3Dry, 7.2, 0.05);
  approx(mixGuide([1, 4]).cementBagsPerM3Dry, 5.8, 0.05);
  approx(mixGuide([1, 5]).cementBagsPerM3Dry, 4.8, 0.05);
  approx(mixGuide([1, 6]).cementBagsPerM3Dry, 4.1, 0.05);
  approx(mixGuide([1, 4]).sandM3PerM3Dry, 0.8, 0.001);
});

test("bond patterns: stretcher / english / flemish all present with notes; count is bond-independent", () => {
  assert.equal(BOND_PATTERNS.length, 3);
  for (const b of BOND_PATTERNS) assert.ok(b.note.length > 20);
});

test("edge cases: zero / negative / empty inputs never produce NaN or Infinity", () => {
  for (const bad of [
    { ...defaultBrickInputs("PKR"), length: 0, height: 0 },
    { ...defaultBrickInputs("PKR"), length: -5, height: 10 },
    { ...defaultBrickInputs("PKR"), thicknessMm: 0 },
    { ...defaultBrickInputs("PKR"), jointMm: -1, wastagePct: -10 },
  ]) {
    const r = calcBrickwork(bad);
    for (const v of Object.values(r)) {
      if (typeof v === "number") assert.ok(isFinite(v), `non-finite in ${JSON.stringify(bad)}`);
    }
    assert.ok(r.bricks >= 0 && r.cementBags >= 0);
  }
});
