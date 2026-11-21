import test from "node:test";
import assert from "node:assert";
import { excavation, pcc, footingSingle, brickwork, slabEffectiveDepth, plaster, plasterDeductionFaces, toMetres, toSqMetres, toCubicMetres } from "../masterQuantity";
import { materialTakeoff, takeoffTotals } from "../materialTakeoff";
import { costSummary, EXAMPLE_LINES } from "../costSummary";
import { measureRow } from "../measurementSheet";
import { boqTotals, qtyFromDimensions, billableQty, RESIDENTIAL_TEMPLATE, taxLabelForRegion } from "../boq";
import { polylineLength, shoelaceArea, foundationStrip, rccSlab, roadSection } from "../takeoffCalc";
import { houseQuantities, specExampleGeometry } from "../houseEstimate";
import { footingConcrete, qsBoqTotals, LEGACY_QS_ITEMS } from "../qsWorkflow";
import { parseEstimateText, localEstimateFromText } from "../aiEstimate";
import { createProject, listProjects, updateProject, deleteProject, saveVersion, projectTotals, importProjectJson, memoryStorage } from "../projectsStore";

const approx = (a: number, b: number, tol = 0.01) => Math.abs(a - b) <= tol;

test("master-quantity: excavation 50x1x1.5 = 75 bank, 90 loose @20%", () => {
  const r = excavation(50, 1, 1.5, 20);
  assert.equal(r.bank, 75);
  assert.equal(r.loose, 90);
});

test("master-quantity: PCC 50x1x0.15 = 48 bags", () => {
  const r = pcc(50, 1, 0.15);
  assert.ok(approx(r.wet, 7.5));
  assert.ok(approx(r.dry, 11.55));
  assert.equal(r.cementBags, 48);
});

test("master-quantity: footing single 0.751 m3; x10 = 7.51 wet", () => {
  const r = footingSingle(1.5, 1.5, 0.2, 0.4, 0.4, 0.3, 10);
  assert.ok(approx(r.single, 0.751, 0.005));
  assert.ok(approx(r.wet, 7.51, 0.05));
});

test("master-quantity: brickwork 50x3x0.23 = 14,094 bricks", () => {
  const r = brickwork(50, 3, 0.23);
  assert.ok(approx(r.volume, 34.5));
  assert.equal(r.count, 14094);
});

test("master-quantity: slab d = 150-(20+5) = 125 mm", () => {
  assert.equal(slabEffectiveDepth(150, 20, 10), 125);
});

test("master-quantity: imperial == SI for the same wall (10x10 ft, 9in)", () => {
  const si = brickwork(3.048, 3.048, 0.2286);
  const impLen = toMetres(10, "Imperial");
  const impArea = toSqMetres(100, "Imperial");
  assert.ok(approx(impLen, 3.048, 0.001));
  assert.ok(approx(impArea, 9.2903, 0.001));
  assert.ok(approx(toCubicMetres(100, "Imperial"), 2.83168, 0.001));
  const imp = brickwork(toMetres(10, "Imperial"), toMetres(10, "Imperial"), toMetres(0.75, "Imperial"));
  assert.equal(imp.count, si.count);
});

test("master-quantity: plaster IS 1200 — 100x3m, two 10m2 openings one face -> net 280, wet 3.36, dry 4.47, cement 26 bags", () => {
  assert.equal(plasterDeductionFaces(0.4), 0);
  assert.equal(plasterDeductionFaces(2), 1);
  assert.equal(plasterDeductionFaces(5), 2);
  const r = plaster(300, [{ area: 10, faces: 1 }, { area: 10, faces: 1 }], 12, 1, 4);
  assert.equal(r.net, 280);
  assert.ok(approx(r.wet, 3.36));
  assert.ok(approx(r.dry, 4.47));
  assert.equal(r.cementBags, 26);
});

test("material-takeoff: 1,000 sqft Standard quantities", () => {
  const rates = { cementPerBag: 1450, sandPerCft: 90, crushPerCft: 90, bricksPer1000: 23355, steelPerKg: 270, tilesPerBox: 1200, paintPerL: 300 };
  const lines = materialTakeoff({ builtUpSqft: 1000, floors: 1, quality: "standard" }, rates);
  const t = takeoffTotals(lines);
  assert.equal(t.totalQty.cementBags, 400);
  assert.equal(t.totalQty.steelKg, 3500);
  assert.equal(t.totalQty.bricks, 10000);
  assert.equal(t.totalQty.sandCft, 1500);
  assert.equal(t.totalQty.aggregateCft, 1350);
  assert.ok(t.grandTotal != null && t.grandTotal > 0);
});

test("material-takeoff: tiles are priced per BOX, not per sqft — 2,000 sqft standard = 142 boxes, Rs 170,400 (was Rs 2,904,000)", () => {
  const rates = { cementPerBag: 1450, sandPerCft: 90, crushPerCft: 90, bricksPer1000: 23355, steelPerKg: 270, tilesPerBox: 1200, paintPerL: 300 };
  const lines = materialTakeoff({ builtUpSqft: 2000, floors: 1, quality: "standard" }, rates);
  const tiles = lines.find((l) => l.material === "Floor tiles")!;
  assert.equal(tiles.unit, "boxes");
  assert.equal(tiles.qty, 142); // ceil(2,200 / 15.5)
  assert.equal(tiles.cost, 170400);
});

test("cost-summary: example lines -> subtotal 5,700,000, grand 6,840,000, 3,420/sqft", () => {
  const r = costSummary({ areaSqft: 2000, lines: EXAMPLE_LINES, overheadPct: 15, contingencyPct: 5, taxPct: 0, taxLabel: "Sales Tax (PK)" });
  assert.equal(r.subtotal, 5700000);
  assert.equal(r.overhead, 855000);
  assert.equal(r.contingency, 285000);
  assert.equal(r.grandTotal, 6840000);
  assert.equal(r.costPerSqft, 3420);
});

test("cost-summary: tax base is subtotal + contingency (matches boqTotals) — 18% on 5,700,000 + 285,000 = 1,077,300", () => {
  const r = costSummary({ areaSqft: 2000, lines: EXAMPLE_LINES, overheadPct: 15, contingencyPct: 5, taxPct: 18, taxLabel: "Sales Tax (PK)" });
  assert.equal(r.tax, 1077300);
  assert.equal(r.grandTotal, 5700000 + 855000 + 285000 + 1077300);
});

test("measurement-sheet: 2x10x3x0.5 = 30 m3; L-only row is incomplete (null, not 10)", () => {
  const ok = measureRow({ nos: 2, length: 10, width: 3, depth: 0.5 }, "volume", "m");
  assert.equal(ok.qty, 30);
  assert.equal(ok.incomplete, false);
  const bad = measureRow({ length: 10 }, "volume", "m");
  assert.equal(bad.qty, null);
  assert.equal(bad.incomplete, true);
});

test("boq: residential template totals 37,275 / 39,138.75 / 46,183.73; NosxLxWxD qty; wastage; tax labels", () => {
  const lines = RESIDENTIAL_TEMPLATE.map((t, i) => ({ id: String(i + 1), division: "x", description: t.description, unit: t.unit, quantity: t.quantity, rate: t.rate }));
  const tot = boqTotals(lines, 5, 18);
  assert.equal(tot.subtotal, 37275);
  assert.equal(tot.taxable, 39138.75);
  assert.equal(tot.grandTotal, 46183.73);
  assert.equal(qtyFromDimensions({ nos: 10, length: 1.5, width: 1.5, depth: 0.5 }), 11.25);
  assert.equal(billableQty({ id: "1", division: "x", description: "bricks", unit: "nos", quantity: 10000, rate: 23.355, wastagePct: 5 }), 10500);
  assert.equal(taxLabelForRegion("PK").defaultPct, 18);
  assert.equal(taxLabelForRegion("AE").defaultPct, 5);
  assert.equal(taxLabelForRegion("PK").label, "Sales Tax (PK)");
});

test("takeoff: shoelace 10x5 = 50 m2; polyline 3-4-5 = 12; foundation strip 10x0.6x1.0 -> 6.00 / 0.90 / 3.40", () => {
  assert.equal(shoelaceArea([{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 5 }, { x: 0, y: 5 }], 1), 50);
  assert.equal(polylineLength([{ x: 0, y: 0 }, { x: 3, y: 0 }, { x: 3, y: 4 }, { x: 0, y: 0 }], 1), 12);
  const f = foundationStrip({ length: 10, width: 0.6, depth: 1.0 });
  assert.equal(f.excavation, 6);
  assert.ok(approx(f.pcc, 0.9));
  assert.ok(approx(f.rcc, 3.4));
  assert.throws(() => foundationStrip({ length: 10, width: 0.15, depth: 1.0 }), /width/);
  const slab = rccSlab({ area: 100, thickness: 0.15, steelKgPerM3: 100 });
  assert.equal(slab.steelKg, 1500);
  const road = roadSection({ area: 1000 });
  assert.equal(road.asphaltVolumeM3, 50);
  assert.equal(road.unit, "m³");
});

test("house: plaster bug fix — 6,024 sqft plaster -> dry 333.9 cft, 54 bags; total cement 426; bricks 34,856; steel 4,922 kg", () => {
  const q = houseQuantities(specExampleGeometry());
  assert.ok(approx(q.plasterAreaSqft, 6024, 1));
  assert.ok(approx(q.plasterDryVolumeCft, 333.9, 0.5), `dry ${q.plasterDryVolumeCft}`);
  assert.equal(q.cementPlasterBags, 54);
  assert.equal(q.cementBrickworkBags, 124);
  assert.equal(q.cementRccBags, 248);
  assert.equal(q.cementBagsTotal, 426);
  assert.equal(q.bricks, 34856);
  assert.ok(approx(q.steelKg, 4922, 5), `steel ${q.steelKg}`);
});

test("qs-workflow: footing 10x1.5x1.5x0.5 = 11.25 wet -> dry 17.33 -> 72 bags; legacy total 3,423,000", () => {
  const f = footingConcrete(11.25);
  assert.ok(approx(f.dry, 17.33, 0.01));
  assert.equal(f.cementBags, 72);
  const t = qsBoqTotals(LEGACY_QS_ITEMS, 0, 0);
  assert.equal(t.subtotal, 3423000);
});

test("ai rule-based: parses '5 marla house in Lahore, G+1, standard'", () => {
  const p = parseEstimateText("5 marla house in Lahore, G+1, standard finish");
  assert.equal(p.marla, 5);
  assert.equal(p.city, "lahore");
  assert.equal(p.floors, 2);
  const e = localEstimateFromText("5 marla house in Lahore, G+1, standard finish");
  assert.ok(!("error" in e));
  if (!("error" in e)) {
    assert.ok(e.totalCost > 0);
    assert.ok(e.materials.cementBags > 0);
    assert.ok(e.method.includes("Rule-based"));
  }
  const bad = localEstimateFromText("hello there");
  assert.ok("error" in bad);
});

test("projects local-first: CRUD + versions + totals + import, no Firebase", () => {
  const store = memoryStorage();
  assert.deepEqual(listProjects(store), []);
  const p = createProject(store, { name: "Test House", budget: 100000 });
  assert.equal(listProjects(store).length, 1);
  const upd = updateProject(store, p.id, { estimates: [{ id: "e1", name: "BOQ", cost: 50000, materials: [{ name: "Cement", quantity: 100, unit: "bags" }] }] });
  assert.ok(upd);
  const totals = projectTotals(upd!);
  assert.equal(totals.totalCost, 50000);
  assert.equal(totals.topMaterials[0].name, "Cement");
  const v = saveVersion(store, p.id, "v1");
  assert.equal(v!.versions.length, 1);
  const imported = importProjectJson(store, JSON.stringify({ name: "Imported", estimates: [] }));
  assert.ok(imported);
  assert.equal(listProjects(store).length, 2);
  assert.equal(deleteProject(store, p.id), true);
  assert.equal(listProjects(store).length, 1);
});
