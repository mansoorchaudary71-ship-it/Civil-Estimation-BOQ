import { test } from "node:test";
import assert from "node:assert/strict";
import { directShearFit, terzaghiFactors, terzaghiSbc, DIRECT_SHEAR_WORKED } from "../directShearCalc";
const approx = (a: number, b: number, tol = 0.05) => assert.ok(Math.abs(a - b) <= tol, `${a} ≈ ${b}`);
test("worked: (50,35),(100,60),(150,85) → c=10.0 kPa, φ=26.6°, R²=1", () => {
  const f = directShearFit(DIRECT_SHEAR_WORKED);
  approx(f.cohesionKpa, 10.0); approx(f.phiDeg, 26.57, 0.1); approx(f.r2, 1.0, 0.001);
  assert.ok(f.residuals.every((r) => Math.abs(r.residual) < 0.01));
});
test("R² warning fires below 0.95", () => {
  const f = directShearFit([
    { normalKpa: 50, shearKpa: 30 }, { normalKpa: 100, shearKpa: 90 }, { normalKpa: 150, shearKpa: 70 },
  ]);
  assert.ok(f.r2 < 0.95 && f.warning !== null && f.warning.includes("R²"));
});
test("Terzaghi factors are real φ-derived values (φ=26.6° → Nq≈12–13, Nc≈22–23)", () => {
  const { nc, nq, ngamma } = terzaghiFactors(26.57);
  assert.ok(nq > 11 && nq < 14, `Nq ${nq}`); assert.ok(nc > 20 && nc < 25, `Nc ${nc}`); assert.ok(ngamma > 0);
  const sbc = terzaghiSbc(10, 26.57, 18, 1, 1.5, 3);
  // qu = 10·Nc + 18·1·Nq + 0.5·18·1.5·Nγ — must use Nc, not a hardcoded c×15
  approx(sbc.quKpa, 10 * nc + 18 * nq + 0.5 * 18 * 1.5 * ngamma, 0.5);
  assert.ok(sbc.sbcKpa > 0 && sbc.sbcKpa < 500);
});
test("needs ≥3 points", () => assert.throws(() => directShearFit([{ normalKpa: 50, shearKpa: 35 }])));
