import { test } from "node:test";
import assert from "node:assert/strict";
import { dryDensity, proctorFit, zavLine, coreCutter, PROCTOR_MOULD_CM3, PROCTOR_WORKED } from "../proctorCalc";
const approx = (a: number, b: number, tol = 0.05) => assert.ok(Math.abs(a - b) <= tol, `${a} ≈ ${b}`);
test("worked core-cutter: V=1021.0 cm³, bulk 1.959, dry 1.749 g/cc, RC 89.7% (MDD 1.95)", () => {
  // wet mass that gives bulk 1.959 at V=1021.0: 2000 g
  const r = coreCutter(10, 13, 2000, 12, 1.95);
  approx(r.volumeCm3, 1021.0, 0.5); approx(r.bulkDensity, 1.959, 0.01); approx(r.dryDensity, 1.749, 0.01);
  approx(r.relativeCompactionPct, 89.7, 0.2);
});
test("Proctor quadratic fit: OMC near 12% and MDD near the peak dry density", () => {
  const f = proctorFit(PROCTOR_WORKED, PROCTOR_MOULD_CM3);
  assert.ok(f.omcPct > 10 && f.omcPct < 14, `OMC ${f.omcPct}`);
  assert.ok(f.mddGCc > 1.7 && f.mddGCc < 1.9, `MDD ${f.mddGCc}`);
  assert.equal(f.warning, null);
});
test("dry density = (mass/V)/(1+w); ZAV line at Gs 2.67, w 12%", () => {
  approx(dryDensity(12, 1820, PROCTOR_MOULD_CM3), (1820 / PROCTOR_MOULD_CM3) / 1.12, 0.001);
  approx(zavLine(2.67, 12), 2.67 / (1 + 0.12 * 2.67), 0.001);
});
test("needs ≥3 points", () => assert.throws(() => proctorFit([{ waterPct: 10, wetMassG: 1700 }], PROCTOR_MOULD_CM3)));
