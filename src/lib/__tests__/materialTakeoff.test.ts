/**
 * materialTakeoff tests — Step 5 (material-takeoff engine). Pins the
 * documented thumb rules (9" outer + 4.5" inner walls, 10 bricks/sqft,
 * sand split 0.5/0.15/0.85 = 1.5 cft/sqft) and the tile-box fix
 * (per-box rate must divide by 15.5 sqft/box before pricing).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { materialTakeoff, takeoffTotals, TILE_BOX_COVERAGE_SQFT } from "../materialTakeoff";

const RATES = {
  cementPerBag: 1450, sandPerCft: 90, crushPerCft: 90,
  bricksPer1000: 20000, steelPerKg: 270, tilesPerBox: 1200, paintPerL: 800,
};

test("2,000 sqft standard house: totals match the thumb rules", () => {
  const lines = materialTakeoff({ builtUpSqft: 2000, floors: 2, quality: "standard" }, RATES);
  const t = takeoffTotals(lines);
  assert.equal(lines.length, 12);
  assert.equal(t.totalQty.cementBags, 800); // 0.40 bags/sqft x 2000
  assert.equal(t.totalQty.steelKg, 7000); // 3.5 kg/sqft x 2000
  assert.equal(t.totalQty.bricks, 20000); // 10/sqft x 2000
  assert.equal(t.totalQty.sandCft, 3000); // 1.5 cft/sqft x 2000
  assert.equal(t.totalQty.aggregateCft, 2700); // 1.35 cft/sqft x 2000
  assert.equal(t.grandTotal, 4534290);
});

test("wastage is applied to qtyWithWastage (cement 2%, bricks 5%)", () => {
  const lines = materialTakeoff({ builtUpSqft: 2000, floors: 2, quality: "standard" }, RATES);
  assert.equal(lines[0].qty, 500); // Cement RCC 0.25 x 2000
  assert.equal(lines[0].qtyWithWastage, 510); // +2%
  const bricks = lines.find((l) => l.material === "Bricks")!;
  assert.equal(bricks.qtyWithWastage, 21000); // +5%
});

test("tiles: area x 1.1 (wastage incl.) divided by 15.5 sqft/box, priced per box", () => {
  assert.equal(TILE_BOX_COVERAGE_SQFT, 15.5);
  const lines = materialTakeoff({ builtUpSqft: 2000, floors: 2, quality: "standard" }, RATES);
  const tiles = lines.find((l) => l.material === "Floor tiles")!;
  assert.equal(tiles.qty, 142); // ceil(2000 x 1.1 / 15.5)
  assert.equal(tiles.cost, 142 * 1200);
});

test("luxury multiplies structure 1.1x and finish 1.5x", () => {
  const lines = materialTakeoff({ builtUpSqft: 2000, floors: 2, quality: "luxury" }, RATES);
  const t = takeoffTotals(lines);
  assert.equal(t.totalQty.steelKg, 7700); // 3.5 x 1.1
  assert.equal(t.totalQty.bricks, 22000); // 10 x 1.1
});

test("null rates give null costs and a null grand total, never Rs 0", () => {
  const lines = materialTakeoff(
    { builtUpSqft: 1000, floors: 1, quality: "standard" },
    { cementPerBag: null, sandPerCft: null, crushPerCft: null, bricksPer1000: null, steelPerKg: null, tilesPerBox: null, paintPerL: null },
  );
  assert.ok(lines.every((l) => l.cost === null));
  assert.equal(takeoffTotals(lines).grandTotal, null);
  assert.equal(takeoffTotals(lines).totalQty.cementBags, 400); // quantities still compute
});
