import { test } from "node:test";
import assert from "node:assert/strict";
import { calcPrecastWall, validatePrecast, type PrecastInputs } from "../precastWallCalc";

const approx = (a: number, b: number, tol = 0.01) =>
  assert.ok(Math.abs(a - b) <= tol, `expected ${a} ≈ ${b} (±${tol})`);

const defaults = (): PrecastInputs => ({
  wallLengthM: 30,
  wallHeightM: 2.4,
  layout: "open",
  gateDeductionM: 0,
  panelWidthM: 2.0,
  panelHeightM: 0.3,
  panelThicknessMm: 50,
  footingType: "isolated",
  footingLengthM: 0.45,
  footingWidthM: 0.45,
  footingDepthM: 0.6,
  stripWidthM: 0.45,
  mix: [1, 2, 4],
  wastagePct: 5,
  rates: { postPerNos: 1500, panelPerNos: 800, concretePerM3: 12000, labourPerM: 150, transportFlat: 0 },
});

test("metric defaults, open run, 5% wastage, 1:2:4, labour 150/m -> 16 posts, 17 to order, 120 panels, 126 to order, 13 bags, Rs 154,128", () => {
  const r = calcPrecastWall(defaults());
  assert.deepEqual(validatePrecast(defaults()), []);
  assert.equal(r.spans, 15);
  assert.equal(r.posts, 16);
  assert.equal(r.orderPosts, 17);
  assert.equal(r.panelsPerSpan, 8);
  assert.equal(r.panels, 120);
  assert.equal(r.orderPanels, 126);
  approx(r.footingWetM3, 1.944);
  approx(r.footingDryM3, 2.994, 0.01);
  assert.equal(r.cementBags, 13);
  approx(r.sandM3, 0.855, 0.01);
  approx(r.aggregateM3, 1.711, 0.01);
  // Posts are costed at the to-order count (17 x 1,500), like panels —
  // the old code costed the exact 16 posts (Rs 24,000).
  assert.equal(r.postCost, 25500);
  assert.equal(r.panelCost, 100800);
  assert.equal(r.footingCost, 23328);
  assert.equal(r.labourCost, 4500);
  assert.equal(r.totalCost, 154128);
  approx(r.costPerRunningM!, 5137.6, 0.1);
  approx(r.costPerM2Wall!, 2140.7, 0.1);
});

test("closed 40x30 m rectangle: perimeter 140 m, spans 70, posts 70 (not 71), panels 560", () => {
  const r = calcPrecastWall({ ...defaults(), wallLengthM: 140, layout: "closed" });
  assert.equal(r.spans, 70);
  assert.equal(r.posts, 70);
  assert.equal(r.panels, 560);
});

test("validation: footing dims must be > 0; panel width cannot exceed wall length", () => {
  assert.ok(validatePrecast({ ...defaults(), footingDepthM: 0 }).length > 0);
  assert.ok(validatePrecast({ ...defaults(), footingLengthM: -1 }).length > 0);
  assert.ok(validatePrecast({ ...defaults(), panelWidthM: 40 }).length > 0);
  assert.ok(validatePrecast({ ...defaults(), wallHeightM: 4 }).length === 0);
  const tall = calcPrecastWall({ ...defaults(), wallHeightM: 3.5 });
  assert.ok(tall.warnings.some((w) => w.includes("3 m")));
});

test("gate deduction shortens the effective length; strip footing uses length x width x depth", () => {
  const r = calcPrecastWall({ ...defaults(), gateDeductionM: 4 });
  assert.equal(r.effectiveLengthM, 26);
  assert.equal(r.spans, 13);
  const strip = calcPrecastWall({ ...defaults(), footingType: "strip", stripWidthM: 0.45, footingDepthM: 0.6 });
  approx(strip.footingWetM3, 30 * 0.45 * 0.6);
});
