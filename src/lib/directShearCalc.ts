/** directShearCalc.ts — direct shear engine (ASTM D3080).
 * Least-squares Mohr–Coulomb regression with R² + residuals; negative
 * intercept is reported (not silently clamped). Bearing capacity is a
 * LABELLED Terzaghi estimate with real φ-derived Nc/Nq/Nγ — the old PDF
 * used a fabricated c×15 + 18×1×10 formula with Nc computed and unused. */
export interface ShearPoint { normalKpa: number; shearKpa: number; }
export interface ShearFit { cohesionKpa: number; phiDeg: number; r2: number; residuals: { normalKpa: number; shearKpa: number; predicted: number; residual: number }[]; warning: string | null; }
export function directShearFit(points: ShearPoint[]): ShearFit {
  if (points.length < 3) throw new Error("Need at least 3 direct-shear points.");
  const n = points.length;
  const mx = points.reduce((a, p) => a + p.normalKpa, 0) / n;
  const my = points.reduce((a, p) => a + p.shearKpa, 0) / n;
  let sxy = 0, sxx = 0, syy = 0;
  for (const p of points) { sxy += (p.normalKpa - mx) * (p.shearKpa - my); sxx += (p.normalKpa - mx) ** 2; syy += (p.shearKpa - my) ** 2; }
  if (sxx === 0) throw new Error("Normal stresses must vary.");
  const slope = sxy / sxx;
  const cohesionKpa = my - slope * mx;
  const phiDeg = (Math.atan(slope) * 180) / Math.PI;
  const r2 = syy === 0 ? 0 : (sxy * sxy) / (sxx * syy);
  const residuals = points.map((p) => {
    const predicted = cohesionKpa + slope * p.normalKpa;
    return { normalKpa: p.normalKpa, shearKpa: p.shearKpa, predicted, residual: p.shearKpa - predicted };
  });
  const warning = [
    r2 < 0.95 ? "R² < 0.95 — repeat the test; the envelope is not reliable." : null,
    cohesionKpa < 0 ? "Fitted cohesion is negative — physically impossible; report c = 0 and repeat the test." : null,
    slope < 0 ? "Fitted friction angle is negative — check the data; repeat the test." : null,
  ].filter(Boolean).join(" ") || null;
  return { cohesionKpa, phiDeg, r2, residuals, warning };
}
/** Terzaghi bearing-capacity factors (general shear, φ in degrees).
 * Terzaghi (1943), NOT the Prandtl/Reissner (Vesic) factors the old code
 * used under this name: Nq = e^((3π/2−φ)·tanφ) / (2·cos²(45°+φ/2)),
 * Nc = (Nq−1)·cotφ (5.7 at φ = 0), Nγ = (Nq−1)·tan(1.4φ) — the closed-form
 * approximation to Terzaghi's chart value. Check at φ = 30°: Nq 22.5,
 * Nc 37.2, Nγ 19.3 (tabulated 22.5 / 37.2 / 19.7). The old Vesic factors
 * gave Nq 18.4 / Nc 30.1 at φ = 30°, understating the labelled SBC ~13%. */
export function terzaghiFactors(phiDeg: number): { nc: number; nq: number; ngamma: number } {
  const phi = (phiDeg * Math.PI) / 180;
  const tanPhi = Math.tan(phi);
  const nq = Math.exp(((3 * Math.PI) / 2 - phi) * tanPhi) / (2 * Math.pow(Math.cos(Math.PI / 4 + phi / 2), 2));
  const nc = tanPhi === 0 ? 5.7 : (nq - 1) / tanPhi;
  const ngamma = (nq - 1) * Math.tan(1.4 * phi);
  return { nc, nq, ngamma };
}
/** Labelled Terzaghi estimate only — NOT a design bearing capacity. */
export function terzaghiSbc(cKpa: number, phiDeg: number, gammaKnM3: number, depthM: number, widthM: number, fos = 3): { quKpa: number; sbcKpa: number; factors: { nc: number; nq: number; ngamma: number } } {
  const factors = terzaghiFactors(phiDeg);
  const quKpa = cKpa * factors.nc + gammaKnM3 * depthM * factors.nq + 0.5 * gammaKnM3 * widthM * factors.ngamma;
  return { quKpa, sbcKpa: quKpa / fos, factors };
}
export const DIRECT_SHEAR_WORKED: ShearPoint[] = [
  { normalKpa: 50, shearKpa: 35 }, { normalKpa: 100, shearKpa: 60 }, { normalKpa: 150, shearKpa: 85 },
];
