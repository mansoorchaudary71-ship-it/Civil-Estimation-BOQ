import { test } from "node:test";
import assert from "node:assert/strict";
import { earthworkVolumes, trenchVolume, EARTHWORK_WORKED } from "../earthworkCalc";
const approx = (a: number, b: number, tol = 0.5) => assert.ok(Math.abs(a - b) <= tol, `${a} ≈ ${b}`);
test("worked: L=100, A1=50, A2=40, Am=47, 8 m³ trucks → prismoidal 4633.3, avg-end 4500, loose 5328.3, compacted 4170, 667 trips, Rs 1,445,500", () => {
  const r = earthworkVolumes(EARTHWORK_WORKED);
  approx(r.prismoidal, 4633.3, 0.1); approx(r.avgEnd, 4500.0, 0.1); approx(r.correction, 133.3, 0.1);
  approx(r.loose, 5328.3, 0.1); approx(r.compacted, 4170.0, 0.1);
  assert.equal(r.trips, 667); approx(r.cost, 1445500, 1);
});
test("Am == mean end area warns that the prismoidal correction is zero", () => {
  const r = earthworkVolumes({ lengthM: 100, area1M2: 50, area2M2: 40, midAreaM2: 45 });
  assert.equal(r.correction, 0); assert.ok(r.warnings.length > 0);
});
test("worked trench: L=100, Wb=1, X=0.5, D=1.5 → Wt=2.5, A=2.625, V=262.5 m³", () => {
  const t = trenchVolume(100, 1, 0.5, 1.5);
  approx(t.topWidthM, 2.5); approx(t.sectionAreaM2, 2.625); approx(t.excavationM3, 262.5);
});
test("trench backfill deducts pipe + bedding; spoil is loose", () => {
  const t = trenchVolume(100, 1, 0.5, 1.5, 0.3, 0.1, 1.0, 15);
  approx(t.pipeM3, Math.PI * 0.15 ** 2 * 100, 0.01); approx(t.beddingM3, 10);
  approx(t.backfillM3, 262.5 - t.pipeM3 - 10, 0.01); approx(t.spoilLooseM3, 262.5 * 1.15, 0.01);
});
