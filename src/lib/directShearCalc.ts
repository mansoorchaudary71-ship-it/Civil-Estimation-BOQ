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
/** Terzaghi bearing-capacity factors (general shear, φ in degrees). */
export function terzaghiFactors(phiDeg: number): { nc: number; nq: number; ngamma: number } {
  const phi = (phiDeg * Math.PI) / 180;
  const tanPhi = Math.tan(phi);
  const nq = Math.pow(Math.tan(Math.PI / 4 + phi / 2), 2) * Math.exp(Math.PI * tanPhi);
  const nc = tanPhi === 0 ? 5.7 : (nq - 1) / tanPhi;
  const ngamma = 2 * (nq - 1) * tanPhi;
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
