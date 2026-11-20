/** Anti-termite tests — run with: npx tsx --test src/lib/__tests__/antiTermiteCalc.test.ts
 *  The 920 L / 48.3 L test is the regression test for the old
 *  perimeter x depth x 7.5 under-dose (which gave 650 L / 32.5 L). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { ANTITERMITE_CHEMICALS, calcAntiTermite } from "../antiTermiteCalc";

const bifenthrin = ANTITERMITE_CHEMICALS.find((c) => c.id === "bifenthrin")!;
const chlorpyrifos = ANTITERMITE_CHEMICALS.find((c) => c.id === "chlorpyrifos")!;

test("worked example §4.8: 100 m2, 40 m trench, 0.6 m wide, 1:19, 5% wastage -> 920 L / 48.3 L", () => {
  const r = calcAntiTermite({
    floorAreaM2: 100, trenchLengthM: 40, trenchWidthM: 0.6, trenchDepthM: 0.5,
    chemical: bifenthrin, wastagePct: 5, packSizeL: 5,
  });
  assert.equal(r.trenchBottomL, 120);
  assert.equal(r.trenchSidesL, 300);
  assert.equal(r.floorL, 500);
  assert.equal(r.subtotalL, 920);
  assert.ok(Math.abs(r.totalEmulsionL - 966) < 0.01);
  assert.ok(Math.abs(r.concentrateL - 48.3) < 0.01, `concentrate ${r.concentrateL}`);
  assert.ok(Math.abs(r.waterL - 917.7) < 0.01);
  assert.equal(r.packs, 10);
  assert.equal(r.packsVolumeL, 50);
});

test("REGRESSION: trench sides are per linear metre, not per m2 of wall", () => {
  const r = calcAntiTermite({
    floorAreaM2: 100, trenchLengthM: 40, trenchWidthM: 0.6, trenchDepthM: 0.5,
    chemical: bifenthrin, wastagePct: 0,
  });
  // Old (wrong) formula gave 40 x 0.5 x 7.5 = 150 L and a 650 L total
  // (floor 500 + trench 150, no trench-bottom stage at all).
  assert.notEqual(r.trenchSidesL, 150);
  assert.equal(r.trenchSidesL, 300);
  assert.equal(r.subtotalL, 920);
  assert.equal(r.concentrateL, 46);
});

test("imidacloprid 1:475 and cost when rates are given", () => {
  const imid = ANTITERMITE_CHEMICALS.find((c) => c.id === "imidacloprid")!;
  const r = calcAntiTermite({
    floorAreaM2: 100, trenchLengthM: 40, trenchWidthM: 0.6,
    chemical: imid, wastagePct: 0, ratePerLitreConcentrate: 2000, labourPerM2: 50,
  });
  assert.ok(Math.abs(r.concentrateL - 920 / 476) < 0.01);
  assert.equal(r.labourCost, 5000);
  assert.ok(r.totalCost != null && r.totalCost > 5000);
});

test("cost is null when no rates are given (never priced at 0)", () => {
  const r = calcAntiTermite({ floorAreaM2: 100, trenchLengthM: 40, chemical: bifenthrin });
  assert.equal(r.totalCost, null);
});

test("chlorpyrifos carries a registration warning and is not the default", () => {
  const r = calcAntiTermite({ floorAreaM2: 100, trenchLengthM: 40, chemical: chlorpyrifos });
  assert.ok(r.warnings.some((w) => /unverified/i.test(w)));
  assert.notEqual(ANTITERMITE_CHEMICALS[0].id, "chlorpyrifos");
});

test("deep trench warns that depth does not increase the sides dose", () => {
  const r = calcAntiTermite({ floorAreaM2: 100, trenchLengthM: 40, trenchDepthM: 0.9, chemical: bifenthrin });
  assert.equal(r.trenchSidesL, 300);
  assert.ok(r.warnings.some((w) => /0\.3 m/.test(w)));
});

test("validation rejects bad inputs", () => {
  assert.throws(() => calcAntiTermite({ floorAreaM2: 0, trenchLengthM: 40, chemical: bifenthrin }), /Floor area/);
  assert.throws(() => calcAntiTermite({ floorAreaM2: 100, trenchLengthM: 40, trenchWidthM: 2, chemical: bifenthrin }), /Trench width/);
});
