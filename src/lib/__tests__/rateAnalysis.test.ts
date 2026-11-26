/**
 * rateAnalysis tests — Step 5 (rates engine). Pins the CPWD layout
 * (prime + 1% water + 15% CPOH) and the house rules it encodes:
 * dry concrete x1.54, dry mortar x1.33, one cement bag = 0.0347 m³.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  MIXES, CEMENT_BAG_M3, analyseMix, pcc124Default,
} from "../rateAnalysis";

const approx = (a: number, b: number, tol = 0.05) =>
  assert.ok(Math.abs(a - b) <= tol, `${a} ≈ ${b}`);

const PK = {
  cementPerBag: 1450, sandPerCft: 90, crushPerCft: 90,
  steelPerKg: 270, labour: 1500, equipment: 800,
};

test("house constants: one 50 kg cement bag = 0.0347 m³", () => {
  assert.equal(CEMENT_BAG_M3, 0.0347);
});

test("PCC 1:2:4 worked example: dry 1.54 m³, 6.34 bags, final rate Rs 18,222/m³", () => {
  const r = pcc124Default();
  assert.equal(r.dryVolume, 1.54);
  approx(r.cementBags, 6.34); // (1/7) x 1.54 / 0.0347
  approx(r.cementCost, 9193.08, 0.5); // 6.34 bags x Rs 1,450
  approx(r.sandM3, 0.44);
  approx(r.crushM3, 0.88);
  assert.equal(r.steelKg, 0); // PCC has no steel — labelled, not RCC
  approx(r.finalRate, 18222.16, 0.5);
  assert.ok(r.notes.some((n) => n.includes("CPWD")));
});

test("CPWD build-up: prime + 1% water, then +15% CPOH on (prime + water)", () => {
  const r = pcc124Default();
  approx(r.waterCost, r.primeCost * 0.01);
  approx(r.cpohCost, (r.primeCost + r.waterCost) * 0.15);
  approx(r.finalRate, r.primeCost + r.waterCost + r.cpohCost);
});

test("mortar uses the 1.33 dry factor, concrete the 1.54 factor", () => {
  const mortar = analyseMix(MIXES.find((m) => m.id === "mortar14")!, PK);
  assert.equal(mortar.dryVolume, 1.33);
  approx(mortar.cementBags, (1 / 5) * 1.33 / 0.0347); // 7.67 bags
  const concrete = analyseMix(MIXES.find((m) => m.id === "pcc148")!, PK);
  assert.equal(concrete.dryVolume, 1.54);
});

test("RCC includes steel: 100 kg/m³ + 3% wastage = 103 kg", () => {
  const r = analyseMix(
    MIXES.find((m) => m.id === "rcc124")!,
    { ...PK, steelKgPerM3: 100 },
  );
  assert.equal(r.steelKg, 103);
  assert.equal(r.steelCost, 103 * 270);
});

test("no water/CPOH variant: prime x (1 + CPOH) only", () => {
  const r = analyseMix(MIXES.find((m) => m.id === "pcc124")!, { ...PK, applyWaterAndCpoh: false });
  assert.equal(r.waterCost, 0);
  approx(r.cpohCost, r.primeCost * 0.15);
  approx(r.finalRate, r.primeCost * 1.15);
});
