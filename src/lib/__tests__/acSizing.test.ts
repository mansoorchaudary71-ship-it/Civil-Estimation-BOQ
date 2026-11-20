/** AC sizing tests — run with: npx tsx --test src/lib/__tests__/acSizing.test.ts */
import { test } from "node:test";
import assert from "node:assert/strict";
import { calcAcSizing } from "../acSizing";

test("worked example §4.1: 12x10 ft, 10 ft ceiling, 2 occ, normal -> 6,250 BTU/h, 8,000 standard", () => {
  const r = calcAcSizing({ areaSqFt: 120, ceilingHeightFt: 10, occupants: 2, sun: "normal", isKitchen: false, seer2: 15 });
  assert.equal(r.baseBtuPerHour, 5000);
  assert.equal(r.requiredBtuPerHour, 6250);
  assert.ok(Math.abs(r.tons - 0.52) < 0.01);
  assert.equal(r.standardBtuPerHour, 8000);
  assert.ok(Math.abs(r.runningWatts - 417) < 1);
});

test("worked example §4.9: 20 m2 room, 3 m ceiling -> about 7,380 BTU/h, 0.62 t", () => {
  const r = calcAcSizing({ areaSqM: 20, ceilingHeightM: 3, occupants: 2, sun: "normal" });
  assert.equal(r.baseBtuPerHour, 6000);
  assert.ok(Math.abs(r.requiredBtuPerHour - 7380) < 10, `got ${r.requiredBtuPerHour}`);
  assert.ok(Math.abs(r.tons - 0.62) < 0.02);
});

test("adjustments: kitchen +4,000, extra people +600 each, sunny x1.1", () => {
  const r = calcAcSizing({ areaSqFt: 200, ceilingHeightFt: 8, occupants: 4, sun: "sunny", isKitchen: true });
  // base 6,000 x 1.1 = 6,600 + 1,200 + 4,000 = 11,800
  assert.equal(r.requiredBtuPerHour, 11800);
  assert.equal(r.standardBtuPerHour, 12000);
});

test("validation rejects bad inputs", () => {
  assert.throws(() => calcAcSizing({ areaSqFt: 0 }), /greater than 0/);
  assert.throws(() => calcAcSizing({ areaSqFt: 120, ceilingHeightFt: 25 }), /Ceiling height/);
  assert.throws(() => calcAcSizing({ areaSqFt: 120, seer2: 40 }), /SEER2/);
});

test("running cost uses tariff", () => {
  const r = calcAcSizing({ areaSqFt: 120, ceilingHeightFt: 10, tariffPerKwh: 50, hoursPerDay: 8 });
  assert.ok(r.monthlyRunningCost != null && Math.abs(r.monthlyRunningCost - 5000) < 60);
});
