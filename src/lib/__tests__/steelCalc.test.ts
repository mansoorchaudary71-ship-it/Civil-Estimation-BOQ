/**
 * Steel engine tests — run with:
 *   npx tsx --test src/lib/__tests__/steelCalc.test.ts
 * (plain node:test + node:assert, same pattern as toolRoutes.test.ts)
 *
 * Every worked example below is from the G3 audit spec / repo AGENTS.md.
 * NOTE on dia 20: d^2/162.28 gives 400/162.28 = 2.4649 kg/m, i.e. 2.465
 * to 3 dp — NOT 2.466 (2.466 follows from the older /162.2 divisor).
 * The engine follows 162.28, so the test asserts 2.465.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  unitWeightKgPerM,
  BAR_WEIGHT_TABLE,
  barWeight,
  BAR_GRADES,
  STOCK_BAR_M,
  STOCK_BAR_FT_M,
  barsToOrder,
  lapsFor,
  applyWastage,
  costFor,
  STEEL_RATE_DEFAULTS,
  stirrupLengthSimple,
  stirrupLengthDetailed,
  stirrupWeightKg,
} from "../steelCalc";

const approx = (actual: number, expected: number, tol = 1e-9) =>
  assert.ok(
    Math.abs(actual - expected) <= tol,
    `expected ${expected} (±${tol}), got ${actual}`,
  );

test("unit weight: d^2/162.28 (dia 20 = 2.465 kg/m)", () => {
  approx(unitWeightKgPerM(20), 400 / 162.28);
  assert.equal(unitWeightKgPerM(20).toFixed(3), "2.465");
  assert.equal(unitWeightKgPerM(6).toFixed(3), "0.222");
  assert.equal(unitWeightKgPerM(8).toFixed(3), "0.394");
  assert.equal(unitWeightKgPerM(12).toFixed(3), "0.887");
  assert.equal(unitWeightKgPerM(16).toFixed(3), "1.578");
  assert.equal(unitWeightKgPerM(25).toFixed(3), "3.851");
  assert.equal(unitWeightKgPerM(32).toFixed(3), "6.310");
  assert.equal(unitWeightKgPerM(0), 0);
  assert.equal(unitWeightKgPerM(-5), 0);
});

test("BAR_WEIGHT_TABLE: 9 sizes, kg/12 m and kg/40 ft consistent", () => {
  assert.deepEqual(
    BAR_WEIGHT_TABLE.map((r) => r.diaMm),
    [6, 8, 10, 12, 16, 20, 25, 28, 32],
  );
  const row12 = barWeight(12)!;
  approx(row12.kgPer12m, 0.887 * 12, 0.01);
  approx(row12.kgPer40ft, 0.887 * 12.192, 0.01);
  // 12 mm bar: 10.65 kg per 12 m, 10.82 kg per 40 ft (G3 spec values)
  assert.equal(row12.kgPer12m.toFixed(2), "10.65");
  assert.equal(row12.kgPer40ft.toFixed(2), "10.82");
  assert.equal(barWeight(14), null);
});

test("BAR_GRADES: four grades, grade does not change weight", () => {
  assert.deepEqual(
    BAR_GRADES.map((g) => g.id),
    ["grade60", "fe500", "b500b", "grade40"],
  );
  assert.equal(BAR_GRADES.find((g) => g.id === "grade60")!.fyMpa, 415);
  assert.equal(BAR_GRADES.find((g) => g.id === "fe500")!.fyMpa, 500);
  assert.equal(BAR_GRADES.find((g) => g.id === "b500b")!.fyMpa, 500);
  assert.equal(BAR_GRADES.find((g) => g.id === "grade40")!.fyMpa, 280);
  assert.equal(STOCK_BAR_M, 12);
  assert.equal(STOCK_BAR_FT_M, 12.192);
});

test("stirrup demo: W300 x D450, cover 40, dia 8 -> detailed 1,244 mm / 0.49 kg", () => {
  const a = 300 - 2 * 40; // 220
  const b = 450 - 2 * 40; // 370
  const detailed = stirrupLengthDetailed(a, b, 8);
  assert.equal(detailed, 1244);
  assert.equal(stirrupWeightKg(detailed, 8).toFixed(2), "0.49");
  // AGENTS.md field rule reads higher: 2(220+370) + 24*8 = 1,372 mm, 0.54 kg
  const simple = stirrupLengthSimple(a, b, 8);
  assert.equal(simple, 1372);
  assert.equal(stirrupWeightKg(simple, 8).toFixed(2), "0.54");
  assert.ok(simple > detailed, "field rule must read higher than detailed form");
});

test("stirrup detailed form honours a custom hook length", () => {
  // 2(A+B) + 2*hook - (3*2d + 2*3d); hook 12d instead of 10d adds 4d.
  assert.equal(stirrupLengthDetailed(220, 370, 8, 12 * 8), 1244 + 4 * 8);
});

test("barsToOrder math", () => {
  // 25 stirrups x 1.244 m = 31.10 m of dia 8
  const r = barsToOrder(31.1, 12);
  assert.equal(r.bars, 3);
  assert.equal(r.orderedLengthM, 36);
  approx(r.lastCutLengthM, 7.1);
  approx(r.offcutM, 4.9);
  assert.equal(lapsFor(31.1, 12), 2);

  // Exact stock length: no offcut, no lap.
  const exact = barsToOrder(12, 12);
  assert.deepEqual(
    { bars: exact.bars, last: exact.lastCutLengthM, off: exact.offcutM },
    { bars: 1, last: 12, off: 0 },
  );
  assert.equal(lapsFor(12, 12), 0);

  // Just over one bar orders a second bar.
  assert.equal(barsToOrder(12.01, 12).bars, 2);
  // 40 ft stock: 12.192 m per bar.
  assert.equal(barsToOrder(24.5, STOCK_BAR_FT_M).bars, 3);
  assert.equal(barsToOrder(0).bars, 0);
});

test("applyWastage and costFor", () => {
  approx(applyWastage(100, 5), 105);
  approx(applyWastage(12.27, 5), 12.8835, 1e-9);
  assert.equal(costFor(100, 270), 27000);
  assert.equal(costFor(100, null), null);
  // BBS worked example: 12.27 kg net, +5% = 12.8835 kg, x Rs 270 = Rs 3,478.55.
  // (The G3 spec quotes Rs 3,478 — that is the cost of the ROUNDED 12.88 kg.)
  const orderKg = applyWastage(12.27, 5);
  approx(costFor(orderKg, 270)!, 3478.545, 1e-9);
  assert.equal(Math.round(costFor(Number(orderKg.toFixed(2)), 270)!), 3478);
});

test("steel rate defaults: PKR 270 indicative, others null (unverified)", () => {
  assert.equal(STEEL_RATE_DEFAULTS.PKR.perKg, 270);
  assert.equal(STEEL_RATE_DEFAULTS.INR.perKg, null);
  assert.equal(STEEL_RATE_DEFAULTS.AED.perKg, null);
  assert.equal(STEEL_RATE_DEFAULTS.USD.perKg, null);
});
