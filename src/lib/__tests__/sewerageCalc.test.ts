/** Sewerage tests — run with: npx tsx --test src/lib/__tests__/sewerageCalc.test.ts */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  calcBeddingVolume,
  calcDesignFlow,
  calcManning,
  calcSeptic,
  calcTrenchVolume,
  pipeSegmentArea,
  selectSewerPipe,
} from "../sewerageCalc";

test("Manning worked example §2: D 0.3 m, 1:200, concrete n 0.013 -> V 0.967 m/s, Q 68.4 L/s, S_min 1 in 520", () => {
  const r = calcManning({ diameterM: 0.3, gradient1InX: 200, material: "concrete" });
  assert.ok(Math.abs(r.velocityMs - 0.967) < 0.005, `V ${r.velocityMs}`);
  assert.ok(Math.abs(r.dischargeLPerS - 68.4) < 0.5, `Q ${r.dischargeLPerS}`);
  assert.ok(Math.abs(r.minSlopeForSelfCleansing1InX - 520) < 15, `Smin 1 in ${r.minSlopeForSelfCleansing1InX}`);
  assert.equal(r.selfCleansing, true);
  assert.equal(r.n, 0.013);
});

test("design flow first: 100 people -> 0.139 L/s average, 0.417 L/s design; smallest adequate pipe is 150 mm", () => {
  const f = calcDesignFlow({ population: 100 });
  assert.ok(Math.abs(f.averageFlowLPerS - 0.139) < 0.005);
  assert.ok(Math.abs(f.designFlowLPerS - 0.417) < 0.01);
  const sel = selectSewerPipe({ population: 100, gradient1InX: 200, material: "concrete" });
  // 100 mm pipe is too slow (V 0.47 m/s < 0.6 self-cleansing); 150 mm passes.
  assert.equal(sel.selectedDiameterMm, 150);
  assert.equal(sel.adequate, true);
});

test("septic worked example §4.6: 5 users -> IS 2470 minimum 1,000 L applies; W 0.75 m, L 1.5 m, total depth 1.5 m; 2 soak pits x 2.12 m", () => {
  const r = calcSeptic({ users: 5, litresPerPersonPerDay: 120, retentionDays: 1, sludgeLPerPersonPerYear: 30, desludgingIntervalYears: 2, liquidDepthM: 1.2, percolationLoadingRate: 30, soakPitDiameterM: 1.5 });
  assert.equal(r.dailyFlowL, 600);
  assert.equal(r.calculatedVolumeL, 900);
  assert.equal(r.minimumApplied, true);
  assert.ok(Math.abs(r.widthM - 0.75) < 0.01, `W ${r.widthM}`);
  assert.ok(Math.abs(r.lengthM - 1.5) < 0.01, `L ${r.lengthM}`);
  assert.ok(Math.abs(r.totalDepthM - 1.5) < 0.01);
  assert.equal(r.soakAreaM2, 20);
  assert.equal(r.soakPits, 2);
  assert.ok(Math.abs(r.soakPitDepthPerPitM - 2.12) < 0.05, `pit depth ${r.soakPitDepthPerPitM}`);
  // Old tool gave W = 0.71 m (below the 0.75 m minimum) and a 4.24 m diameter pit.
  assert.ok(r.widthM >= 0.75);
  assert.equal(r.soakPitDiameterM, 1.5);
});

test("larger septic: 20 users exceeds the minimum, no minimum flag", () => {
  const r = calcSeptic({ users: 20 });
  assert.equal(r.calculatedVolumeL, 3600);
  assert.equal(r.minimumApplied, false);
  assert.ok(r.widthM > 0.75 && r.lengthM > r.widthM);
});

test("trench volume: sloped vs vertical", () => {
  const v = calcTrenchVolume(100, 1.5, 2.5, false);
  assert.equal(v.volumeM3, 375);
  const s = calcTrenchVolume(100, 1.5, 2.5, true, 0.5);
  assert.ok(Math.abs(s.topWidthM - 4.0) < 0.01);
  assert.ok(Math.abs(s.volumeM3 - 687.5) < 0.01);
});

test("pipe segment area: full pipe and half pipe", () => {
  assert.ok(Math.abs(pipeSegmentArea(0.4, 0.4) - Math.PI * 0.04) < 0.001);
  assert.ok(Math.abs(pipeSegmentArea(0.4, 0.2) - (Math.PI * 0.04) / 2) < 0.001);
  assert.ok(calcBeddingVolume(100, 1.5, 0.4, 0.15, 0.2) > 0);
});

test("validation rejects bad inputs", () => {
  assert.throws(() => calcManning({ diameterM: 0, gradient1InX: 200 }), /diameter/);
  assert.throws(() => calcSeptic({ users: 5, liquidDepthM: 0.8 }), /at least 1 m/);
  assert.throws(() => calcSeptic({ users: 5, soakPitDiameterM: 4.24 }), /between 1\.2 m and 2\.0 m/);
});
