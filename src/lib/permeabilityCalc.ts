/** permeabilityCalc.ts — permeability engine (ASTM D2434 / D5084).
 * Temperature correction uses the ASTM viscosity-ratio table, linearly
 * interpolated (10 °C 1.301, 15 °C 1.135, 20 °C 1.000, 25 °C 0.890,
 * 30 °C 0.797) — replacing the old polynomial, which was ~4% low at 10 °C. */
export const VISCOSITY_RATIO_TABLE: { tempC: number; rt: number }[] = [
  { tempC: 10, rt: 1.301 }, { tempC: 15, rt: 1.135 }, { tempC: 20, rt: 1.0 },
  { tempC: 25, rt: 0.89 }, { tempC: 30, rt: 0.797 },
];
export function temperatureCorrectionFactor(tempC: number): number {
  const t = VISCOSITY_RATIO_TABLE;
  if (tempC <= t[0].tempC) return t[0].rt;
  if (tempC >= t[t.length - 1].tempC) return t[t.length - 1].rt;
  for (let i = 0; i < t.length - 1; i++) {
    if (tempC >= t[i].tempC && tempC <= t[i + 1].tempC) {
      const f = (tempC - t[i].tempC) / (t[i + 1].tempC - t[i].tempC);
      return t[i].rt + f * (t[i + 1].rt - t[i].rt);
    }
  }
  return 1;
}
export function constantHeadK(qCm3: number, lengthCm: number, areaCm2: number, headCm: number, timeS: number): number {
  if (areaCm2 <= 0 || headCm <= 0 || timeS <= 0) throw new Error("Area, head and time must be > 0 for constant-head k.");
  return (qCm3 * lengthCm) / (areaCm2 * headCm * timeS);
}
export function fallingHeadK(standpipeAreaCm2: number, lengthCm: number, sampleAreaCm2: number, timeS: number, head1Cm: number, head2Cm: number): number {
  if (sampleAreaCm2 <= 0 || timeS <= 0 || head1Cm <= 0 || head2Cm <= 0) throw new Error("Areas, time and heads must be > 0 for falling-head k.");
  if (head2Cm >= head1Cm) throw new Error("Final head h2 must be less than initial head h1.");
  return (2.303 * (standpipeAreaCm2 * lengthCm) / (sampleAreaCm2 * timeS)) * Math.log10(head1Cm / head2Cm);
}
export function kToMetresPerDay(kCmS: number): number { return kCmS * 864; }
/** Hazen screening estimate k ≈ 0.01·D10² (D10 in mm → k in cm/s). Labelled estimate only. */
export function hazenK(d10Mm: number): number {
  if (d10Mm <= 0) throw new Error("D10 must be > 0.");
  return 0.01 * d10Mm * d10Mm;
}
export function averageK(values: number[]): number {
  if (values.length === 0) throw new Error("Need at least one trial.");
  if (values.some((v) => v <= 0)) throw new Error("All k trials must be > 0.");
  return values.reduce((a, b) => a + b, 0) / values.length;
}
export function permeabilityClass(kCmS: number): string {
  if (kCmS > 1e-1) return "Very high — clean gravel";
  if (kCmS > 1e-2) return "High — clean sand";
  if (kCmS > 1e-3) return "Medium — fine sand / silty sand";
  if (kCmS > 1e-5) return "Low — silt";
  return "Very low — clay";
}
