/** proctorCalc.ts — Proctor compaction + field density engine (IS 2720 Pt 7/8).
 * γd = (wet mass / mould volume) / (1 + w). OMC/MDD from a quadratic fit
 * through the γd–w points. Zero-air-voids line: γd = Gs·γw / (1 + w·Gs).
 * Core-cutter field density: bulk/dry density + relative compaction. */
export interface ProctorPoint { waterPct: number; wetMassG: number; }
export function dryDensity(waterPct: number, wetMassG: number, mouldVolumeCm3: number): number {
  if (mouldVolumeCm3 <= 0) throw new Error("Mould volume must be > 0.");
  const wetDensity = wetMassG / mouldVolumeCm3;
  return wetDensity / (1 + waterPct / 100);
}
export function zavLine(gs: number, waterPct: number): number {
  return (gs * 1) / (1 + (waterPct / 100) * gs);
}
/** Quadratic least-squares fit y = a·x² + b·x + c; vertex = OMC/MDD. */
export function proctorFit(points: ProctorPoint[], mouldVolumeCm3: number): { omcPct: number; mddGCc: number; curve: { waterPct: number; dryDensity: number }[]; warning: string | null } {
  if (points.length < 3) throw new Error("Need at least 3 Proctor points.");
  const pts = points.map((p) => ({ x: p.waterPct, y: dryDensity(p.waterPct, p.wetMassG, mouldVolumeCm3) }));
  // Normal equations for quadratic fit (3x3 solve via Gaussian elimination)
  const n = pts.length;
  let sx = 0, sx2 = 0, sx3 = 0, sx4 = 0, sy = 0, sxy = 0, sx2y = 0;
  for (const p of pts) {
    const x2 = p.x * p.x;
    sx += p.x; sx2 += x2; sx3 += x2 * p.x; sx4 += x2 * x2; sy += p.y; sxy += p.x * p.y; sx2y += x2 * p.y;
  }
  const A = [[sx4, sx3, sx2, sx2y], [sx3, sx2, sx, sxy], [sx2, sx, n, sy]];
  for (let col = 0; col < 3; col++) {
    let piv = col;
    for (let r = col + 1; r < 3; r++) if (Math.abs(A[r][col]) > Math.abs(A[piv][col])) piv = r;
    [A[col], A[piv]] = [A[piv], A[col]];
    if (Math.abs(A[col][col]) < 1e-12) throw new Error("Proctor points do not define a curve (singular fit).");
    for (let r = col + 1; r < 3; r++) {
      const f = A[r][col] / A[col][col];
      for (let k = col; k < 4; k++) A[r][k] -= f * A[col][k];
    }
  }
  const coef = [0, 0, 0];
  for (let r = 2; r >= 0; r--) {
    let s = A[r][3];
    for (let k = r + 1; k < 3; k++) s -= A[r][k] * coef[k];
    coef[r] = s / A[r][r];
  }
  const [a, b, c] = coef;
  if (a >= 0) return { omcPct: NaN, mddGCc: NaN, curve: pts.map((p) => ({ waterPct: p.x, dryDensity: p.y })), warning: "Fitted curve has no maximum (a ≥ 0) — add points on both sides of the optimum." };
  const omcPct = -b / (2 * a);
  const mddGCc = c - (b * b) / (4 * a);
  void c;
  return { omcPct, mddGCc, curve: pts.map((p) => ({ waterPct: p.x, dryDensity: p.y })), warning: null };
}
export function coreCutter(diaCm: number, heightCm: number, wetMassG: number, waterPct: number, mddGCc: number): { volumeCm3: number; bulkDensity: number; dryDensity: number; relativeCompactionPct: number } {
  if (diaCm <= 0 || heightCm <= 0 || mddGCc <= 0) throw new Error("Cutter dimensions and MDD must be > 0.");
  const volumeCm3 = Math.PI * (diaCm / 2) ** 2 * heightCm;
  const bulkDensity = wetMassG / volumeCm3;
  const dry = bulkDensity / (1 + waterPct / 100);
  return { volumeCm3, bulkDensity, dryDensity: dry, relativeCompactionPct: (dry / mddGCc) * 100 };
}
export const PROCTOR_MOULD_CM3 = 943.3; // Standard Proctor mould
export const PROCTOR_WORKED: ProctorPoint[] = [
  { waterPct: 8, wetMassG: 1650 }, { waterPct: 10, wetMassG: 1750 }, { waterPct: 12, wetMassG: 1820 },
  { waterPct: 14, wetMassG: 1800 }, { waterPct: 16, wetMassG: 1720 },
];
