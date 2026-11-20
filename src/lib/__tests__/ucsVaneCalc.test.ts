import { test } from "node:test";
import assert from "node:assert/strict";
import { ucs, vaneShear, ucsConsistency, UCS_WORKED, VANE_WORKED } from "../ucsVaneCalc";
const approx = (a: number, b: number, tol = 0.5) => assert.ok(Math.abs(a - b) <= tol, `${a} ≈ ${b}`);
test("worked UCS: D=38 mm, 250 N, 15% strain → Ac=0.001334 m², qu=187.4 kPa, cu=93.7 kPa", () => {
  const r = ucs(UCS_WORKED.diaMm, UCS_WORKED.failureLoadN, UCS_WORKED.axialStrainPct);
  approx(r.area0M2, 0.001134, 0.00001); approx(r.correctedAreaM2, 0.001334, 0.00001);
  approx(r.quKpa, 187.4, 0.5); approx(r.cuKpa, 93.7, 0.5);
  assert.equal(ucsConsistency(r.quKpa), "Stiff");
});
test("worked vane shear: T=15 N·m, D=50, H=100 mm → 32.7 kPa", () => {
  approx(vaneShear(VANE_WORKED.torqueNm, VANE_WORKED.diaMm, VANE_WORKED.heightMm).cuKpa, 32.7, 0.2);
});
test("strain ≥100% throws", () => assert.throws(() => ucs(38, 250, 100)));
