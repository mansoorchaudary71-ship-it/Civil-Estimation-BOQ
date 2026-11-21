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
test("Terzaghi factors are Terzaghi's (φ=30° → Nq≈22.5, Nc≈37.2, Nγ≈19.3; φ=26.6° → Nq≈15.1, Nc≈28.2)", () => {
  const f30 = terzaghiFactors(30);
  approx(f30.nq, 22.5, 0.2); approx(f30.nc, 37.2, 0.2); approx(f30.ngamma, 19.3, 0.5);
  // Audit example: γ=18, Df=1.0, B=1.5, FoS=3, c=10, φ=30 → qu ≈ 1,037, SBC ≈ 346.
  const sbc30 = terzaghiSbc(10, 30, 18, 1, 1.5, 3);
  approx(sbc30.quKpa, 1037, 5); approx(sbc30.sbcKpa, 346, 2);
  const { nc, nq, ngamma } = terzaghiFactors(26.57);
  assert.ok(nq > 14 && nq < 16, `Nq ${nq}`); assert.ok(nc > 27 && nc < 29, `Nc ${nc}`); assert.ok(ngamma > 0);
  const sbc = terzaghiSbc(10, 26.57, 18, 1, 1.5, 3);
  // qu = 10·Nc + 18·1·Nq + 0.5·18·1.5·Nγ — must use Nc, not a hardcoded c×15
  approx(sbc.quKpa, 10 * nc + 18 * nq + 0.5 * 18 * 1.5 * ngamma, 0.5);
  assert.ok(sbc.sbcKpa > 0 && sbc.sbcKpa < 500);
});
test("needs ≥3 points", () => assert.throws(() => directShearFit([{ normalKpa: 50, shearKpa: 35 }])));
