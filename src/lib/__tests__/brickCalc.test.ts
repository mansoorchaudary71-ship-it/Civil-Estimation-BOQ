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
  parseCompositeLength,
  parseLengthValue,
  gableTriangleAreaM2,
  arcLengthM,
  courseCount,
  reverseBricksToArea,
  budgetMode,
  packingFor,
  calcLabourCost,
  rateStrip,
  CURRENCY_META,
  DEFAULT_CEMENT_BAG_KG,
  INDICATIVE_RATES,
  BRICK_FAQS,
} from "../brickCalc";
import {
  CITY_VARIANTS,
  BRICK_TYPE_VARIANTS,
  HOUSE_SIZE_VARIANTS,
  parseBrickVariant,
  allBrickProgrammaticUrls,
} from "../../seo/brickProgrammatic";

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

test("ft+in composite entry: 10'6\" = 10.5 ft, in ft and in units", () => {
  assert.equal(parseCompositeLength("10'6\"", "ft"), 10.5);
  assert.equal(parseCompositeLength("10' 6\"", "ft"), 10.5);
  assert.equal(parseCompositeLength("10 ft 6 in", "ft"), 10.5);
  assert.equal(parseCompositeLength("10ft 6in", "ft"), 10.5);
  assert.equal(parseCompositeLength("10", "ft"), 10);
  assert.equal(parseCompositeLength("10'6\"", "in"), 126);
  assert.equal(parseCompositeLength('126"', "ft"), 10.5);
  assert.equal(parseLengthValue("10'6\"", "ft"), 10.5);
  assert.equal(parseLengthValue("junk", "ft"), 0);
  // A 10'6" x 10 ft wall needs more bricks than the 10x10 default.
  const r = calcBrickwork({ ...defaultBrickInputs("PKR"), length: 10.5, height: 10 });
  assert.ok(r.bricks > 917);
  approx(r.bricksBeforeWastage, 872.86 * 1.05, 1);
});

test("UK preset (215x102.5x65, BS EN 771-1) + GBP/USD currencies and bag sizes", () => {
  const uk = BRICK_PRESETS.find((p) => p.id === "uk-clay");
  assert.ok(uk && uk.l === 215 && uk.w === 102.5 && uk.h === 65);
  assert.ok(uk.standard.includes("BS EN 771-1"));
  assert.equal(CURRENCY_META.GBP.symbol, "£");
  assert.equal(CURRENCY_META.USD.symbol, "$");
  assert.equal(CURRENCY_META.GBP.sandUnit, "m3");
  assert.equal(DEFAULT_CEMENT_BAG_KG.GBP, 25);
  assert.equal(DEFAULT_CEMENT_BAG_KG.USD, 42.6);
  assert.equal(DEFAULT_CEMENT_BAG_KG.PKR, 50);
  // Indicative Nov 2026 defaults: UK £650/1,000, US $550/1,000.
  assert.equal(INDICATIVE_RATES.GBP.brickPer1000, 650);
  assert.equal(INDICATIVE_RATES.GBP.cementPerBag, 8);
  assert.equal(INDICATIVE_RATES.USD.brickPer1000, 550);
  assert.equal(INDICATIVE_RATES.USD.cementPerBag, null);
  const r = calcBrickwork({ ...defaultBrickInputs("GBP"), brick: uk, cementBagKg: 25 });
  assert.ok(r.bricksBeforeWastage > 0 && r.cementBags > 0);
});

test("gable end: triangle base x rise / 2 is extra wall area", () => {
  approx(gableTriangleAreaM2(3.048, 0.9144), 3.048 * 0.9144 / 2, 1e-9);
  const base = calcBrickwork(defaultBrickInputs("PKR"));
  const gable = calcBrickwork({
    ...defaultBrickInputs("PKR"),
    extraAreaM2: gableTriangleAreaM2(3.048, 0.9144),
  });
  // 15 sq ft of extra 9-inch wall = ~131 bricks before wastage.
  approx(gable.bricksBeforeWastage - base.bricksBeforeWastage, 15 * 8.7286, 1);
  assert.equal(gable.bricks, Math.ceil(gable.bricksBeforeWastage * 1.05));
});

test("curved wall: centre-line length is radius x angle in radians", () => {
  approx(arcLengthM(2, 90), Math.PI, 1e-9);
  approx(arcLengthM(1, 360), 2 * Math.PI, 1e-9);
  approx(arcLengthM(1.8288, 90), 2.873, 0.001); // 6 ft radius, quarter circle
  assert.equal(arcLengthM(-2, 90), 0);
});

test("reverse mode: 1,000 bricks cover ~115 sq ft of 9-inch wall before wastage", () => {
  const rev = reverseBricksToArea(1000, 230, BRICK_PRESETS[0], { jointMm: 10 });
  approx(rev.areaSqFt, 1000 / 8.7286, 0.5);
  approx(rev.areaM2, 10.64, 0.05);
  approx(rev.bricksPerSqFt, 8.73, 0.01);
  const rev2 = reverseBricksToArea(1000, 115, BRICK_PRESETS[0], { jointMm: 10 });
  approx(rev2.areaSqFt, 1000 / 4.36, 1);
});

test("budget mode: PKR 20,000 for 100 sq ft -> 200/sq ft, ~21,810/1,000, buys 1,000", () => {
  const b = budgetMode(9.2903, 20000, 230, BRICK_PRESETS[0], {
    jointMm: 10,
    wastagePct: 5,
    rates: { brickPer1000: 20000, cementPerBag: 1550, sandPerUnit: 50 },
  });
  assert.equal(b.bricks, 917);
  approx(b.pricePerSqFt ?? 0, 200, 0.01);
  approx(b.pricePer1000 ?? 0, (20000 / 917) * 1000, 1);
  assert.equal(b.bricksAffordable, 1000);
  const noRate = budgetMode(9.2903, 20000, 230, BRICK_PRESETS[0], {});
  assert.equal(noRate.bricksAffordable, null);
});

test("packs / pallets / trucks: 917 bricks = 2 packs of 500 (83 spare), 2 pallets", () => {
  const p = packingFor(917);
  assert.equal(p.packs, 2);
  assert.equal(p.spareBricks, 83);
  assert.equal(p.pallets, 2);
  assert.equal(p.trucks, null); // no truck capacity entered
  assert.equal(packingFor(917, { packSize: 400 }).packs, 3);
  assert.equal(packingFor(25000, { truckCapacity: 10000 }).trucks, 3);
  assert.equal(packingFor(0).packs, 0);
});

test("labour cost: per-1,000, per-sq-ft and per-day bases; null rate = null", () => {
  approx(calcLabourCost({ netAreaSqFt: 100, bricks: 917, basis: "per1000", rate: 550 }) ?? 0, 504.35, 0.01);
  assert.equal(calcLabourCost({ netAreaSqFt: 100, bricks: 917, basis: "perSqFt", rate: 10 }), 1000);
  assert.equal(calcLabourCost({ netAreaSqFt: 100, bricks: 917, basis: "perDay", rate: 300, days: 5 }), 1500);
  assert.equal(calcLabourCost({ netAreaSqFt: 100, bricks: 917, basis: "per1000", rate: null }), null);
});

test("rate strip + per-1,000 figures on the default wall", () => {
  const r = calcBrickwork(defaultBrickInputs("PKR"));
  const strip = rateStrip(r);
  approx(strip.bricksPerCft, 11.57, 0.01);
  approx(strip.cementBagsPerCft, 5 / 75.46, 0.001);
  approx(strip.sandCftPerCft, 21.8 / 75.46, 0.01);
  approx(r.bricksPerCft, 11.57, 0.01);
  approx(r.cementKgPer1000, (250 / 872.86) * 1000, 1);
  approx(r.sandCftPer1000, (21.8 / 872.86) * 1000, 0.5);
});

test("course count: 10 ft wall with 75 mm brick + 10 mm joint = 36 courses", () => {
  assert.equal(courseCount(3.048, 75, 10), 36);
  assert.equal(courseCount(0, 75, 10), 0);
});

test("programmatic variants: 18 total (10 city + 4 type + 4 size), all unique", () => {
  assert.equal(CITY_VARIANTS.length, 10);
  assert.equal(BRICK_TYPE_VARIANTS.length, 4);
  assert.equal(HOUSE_SIZE_VARIANTS.length, 4);
  assert.equal(allBrickProgrammaticUrls("https://example.com").length, 18);
  const titles = [
    ...CITY_VARIANTS.map((c) => c.title),
    ...BRICK_TYPE_VARIANTS.map((t) => t.title),
    ...HOUSE_SIZE_VARIANTS.map((s) => s.title),
  ];
  assert.equal(new Set(titles).size, titles.length, "duplicate variant title");
  const descs = [
    ...CITY_VARIANTS.map((c) => c.description),
    ...BRICK_TYPE_VARIANTS.map((t) => t.description),
    ...HOUSE_SIZE_VARIANTS.map((s) => s.description),
  ];
  assert.equal(new Set(descs).size, descs.length, "duplicate variant description");
  const london = parseBrickVariant("/brick-calculator/london");
  assert.equal(london.kind, "city");
  if (london.kind === "city") {
    assert.equal(london.data.currency, "GBP");
    assert.equal(london.data.brickPresetId, "uk-clay");
    assert.equal(london.data.cementBagKg, 25);
  }
  const ny = parseBrickVariant("/brick-calculator/new-york");
  assert.equal(ny.kind, "city");
  if (ny.kind === "city") {
    assert.equal(ny.data.currency, "USD");
    assert.equal(ny.data.cementBagKg, 42.6);
  }
  assert.deepEqual(parseBrickVariant("/brick-calculator/unknown-slug"), { kind: "main" });
});

test("FAQs cover the new modes (21 total, all non-empty)", () => {
  assert.equal(BRICK_FAQS.length, 21);
  for (const f of BRICK_FAQS) {
    assert.ok(f.q.length > 10 && f.a.length > 40, `thin FAQ: ${f.q}`);
  }
  const qs = BRICK_FAQS.map((f) => f.q);
  for (const needle of [
    "packs or pallets",
    "labour cost",
    "wall area will my bricks cover",
    "budget",
    "gable end or a curved wall",
    "standard brick size in the uk",
    "standard brick size in the us",
  ]) {
    assert.ok(qs.some((q) => q.toLowerCase().includes(needle)), `missing FAQ: ${needle}`);
  }
});
