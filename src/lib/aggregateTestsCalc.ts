/**
 * Aggregate tests engine — pure functions, no React.
 * (brickCalc.ts pattern.)
 *
 * Standards: IS 2386 Pt IV (impact, crushing, LA abrasion),
 * IS 2386 Pt III (water absorption, specific gravity), IS 383 (limits).
 * IS 2386 requires the MEAN of two trials to be reported.
 *
 * - AIV = W3 / (W2 - W1) x 100, W3 = weight passing 2.36 mm.
 * - ACV = same form, W3 = weight passing 2.36 mm after crushing.
 * - LA = loss / original x 100, where loss is EITHER the weight passing
 *   1.70 mm OR original - retained (the old UI only accepted "passing",
 *   so a lab tech entering retained weight got a silent 76% "UNSUITABLE").
 * - WA = (SSD - oven dry) / oven dry x 100.
 * - Bulk SG = dry / (SSD - in water); apparent SG = dry / (dry - in water).
 */
export type LaInputMode = "passing" | "retained";

export interface TrialResult {
  value: number;
  valid: boolean;
  errors: string[];
}

export function calcAIV(w1: number, w2: number, w3: number): TrialResult {
  const errors: string[] = [];
  if (w1 < 0 || w2 < 0 || w3 < 0) errors.push("Weights cannot be negative.");
  if (w2 <= w1) errors.push("Weight of container + aggregate (W2) must be greater than the empty container (W1).");
  const sample = w2 - w1;
  if (w3 > sample) errors.push("Weight passing 2.36 mm (W3) cannot exceed the sample weight (W2 - W1).");
  const value = sample > 0 ? (w3 / sample) * 100 : 0;
  return { value, valid: errors.length === 0 && sample > 0, errors };
}

export function calcACV(w1: number, w2: number, w3: number): TrialResult {
  return calcAIV(w1, w2, w3); // identical form, different test
}

export function calcLA(originalG: number, w2: number, mode: LaInputMode): TrialResult {
  const errors: string[] = [];
  if (originalG <= 0) errors.push("Original sample weight must be greater than 0.");
  if (w2 < 0) errors.push("Weight cannot be negative.");
  if (w2 > originalG) {
    errors.push(
      mode === "passing"
        ? "Weight passing 1.70 mm cannot exceed the original sample weight."
        : "Retained weight cannot exceed the original sample weight.",
    );
  }
  const loss = mode === "passing" ? w2 : originalG - w2;
  const value = originalG > 0 ? (loss / originalG) * 100 : 0;
  return { value, valid: errors.length === 0 && originalG > 0, errors };
}

export interface WaResult extends TrialResult {
  waterAbsorptionPct: number;
  bulkSg: number;
  apparentSg: number;
}

export function calcWA(ssdG: number, inWaterG: number, ovenDryG: number): WaResult {
  const errors: string[] = [];
  if (ssdG <= 0 || inWaterG <= 0 || ovenDryG <= 0) errors.push("All three weights must be greater than 0.");
  if (ssdG <= inWaterG) errors.push("SSD weight in air must be greater than the weight in water.");
  if (ovenDryG >= ssdG) errors.push("Oven-dry weight must be less than the SSD weight.");
  const wa = ovenDryG > 0 ? ((ssdG - ovenDryG) / ovenDryG) * 100 : 0;
  const bulkSg = ssdG - inWaterG > 0 ? ovenDryG / (ssdG - inWaterG) : 0;
  const apparentSg = ovenDryG - inWaterG > 0 ? ovenDryG / (ovenDryG - inWaterG) : 0;
  const valid = errors.length === 0;
  return { value: wa, waterAbsorptionPct: wa, bulkSg, apparentSg, valid, errors };
}

/** Mean of two trials (IS 2386) — trial 2 is optional. */
export function meanOfTrials(t1: number | null, t2: number | null): number | null {
  const vals = [t1, t2].filter((v): v is number => v != null && isFinite(v));
  if (vals.length === 0) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

export interface Suitability {
  verdict: string;
  suitableFor: string[];
  unsuitable: boolean;
}

export function aivSuitability(aiv: number): Suitability {
  if (aiv <= 10) return { verdict: "Exceptionally strong", suitableFor: ["Wearing course", "Base course", "Non-wearing concrete"], unsuitable: false };
  if (aiv <= 20) return { verdict: "Strong", suitableFor: ["Wearing course", "Base course", "Non-wearing concrete"], unsuitable: false };
  if (aiv <= 30) return { verdict: "Satisfactory for road surfacing", suitableFor: ["Road surfacing", "Base course", "Non-wearing concrete"], unsuitable: false };
  if (aiv <= 45) return { verdict: "Satisfactory for concrete (non-wearing)", suitableFor: ["Non-wearing concrete", "Base course"], unsuitable: false };
  return { verdict: "UNSUITABLE FOR CONCRETE (>45%)", suitableFor: [], unsuitable: true };
}

export function acvSuitability(acv: number): Suitability {
  if (acv <= 30) return { verdict: "Suitable for wearing course (<30%)", suitableFor: ["Wearing course", "Base course"], unsuitable: false };
  if (acv <= 45) return { verdict: "Suitable for base course (<45%)", suitableFor: ["Base course"], unsuitable: false };
  return { verdict: "UNSUITABLE (>45%)", suitableFor: [], unsuitable: true };
}

export function laSuitability(la: number): Suitability {
  if (la <= 30) return { verdict: "Suitable for wearing course (<30%)", suitableFor: ["Wearing course (MoRTH)", "Base course"], unsuitable: false };
  if (la <= 35) return { verdict: "Suitable for bituminous concrete (<=35%, IRC)", suitableFor: ["Bituminous concrete (IRC:111)", "Base course"], unsuitable: false };
  if (la <= 40) return { verdict: "Suitable for WBM base (<=40%, IRC)", suitableFor: ["WBM base (IRC)", "Base course"], unsuitable: false };
  if (la <= 50) return { verdict: "Suitable for base course only (<=50%, MoRTH)", suitableFor: ["Base course (MoRTH)"], unsuitable: false };
  return { verdict: "UNSUITABLE (>50%)", suitableFor: [], unsuitable: true };
}

export function waSuitability(wa: number): Suitability {
  if (wa <= 2) return { verdict: "Good quality aggregate (<=2%, IS 383)", suitableFor: ["Structural concrete", "Road works"], unsuitable: false };
  if (wa <= 5) return { verdict: "Acceptable only with engineer approval for non-structural use (2-5%)", suitableFor: ["Non-structural use (with approval)"], unsuitable: false };
  return { verdict: "HIGH POROSITY — flagged (>5%)", suitableFor: [], unsuitable: true };
}

export function sgSuitability(sg: number): Suitability {
  if (sg >= 2.5 && sg <= 3.0) return { verdict: "Normal range (2.5-3.0)", suitableFor: ["Concrete aggregate"], unsuitable: false };
  return { verdict: "Outside the normal 2.5-3.0 range — flag and re-check", suitableFor: [], unsuitable: true };
}

/** Sample-size guidance (IS 2386). */
export const SAMPLE_GUIDANCE: Record<string, string> = {
  impact: "About 350 g of aggregate passing 12.5 mm and retained on 10 mm (IS 2386 Pt IV).",
  crushing: "About 350 g of aggregate passing 12.5 mm and retained on 10 mm (IS 2386 Pt IV).",
  abrasion: "Grading per IS 2386 Pt IV Table 2 (usually 5,000 g total, grading A-G by size).",
  "water-absorption": "About 2 kg of aggregate, soaked 24 hours (IS 2386 Pt III).",
};
