/**
 * wastewaterLabCalc.ts — BOD5 / COD lab calculations, done CLIENT-SIDE.
 * Pure functions. Replaces the old /api/tools/wastewater-testing/bod
 * and .../cod fetches, which existed only in the dev Express server —
 * on static GitHub Pages every load failed with "Failed to connect to
 * API". server.ts keeps its endpoints for dev, but the client must
 * never call them.
 *
 * BOD5 (APHA 5210B): P = sampleVol / bottleVol; BOD = (DOi - DOf) / P
 * COD  (APHA 5220D): COD = ((Vblank - Vsample) x N x 8000) / sampleVol
 * Thresholds are PEQS/NEQS (Punjab EPA): BOD 80 mg/L inland / 250 to
 * sewer; COD 150 mg/L inland / 400 to sewer; TSS 200 mg/L inland / 400
 * to sewer. The old "Safe <30 BOD / <250 COD" bands were wrong and are retired.
 */
import { PEQS_LIMITS_MG_L } from "./mepConstants";

export interface BodInputs {
  initialDoMgL: number;
  finalDoMgL: number;
  sampleVolumeMl: number;
  bottleVolumeMl: number;
  /** Blank bottle DO, mg/L (initial / final) — for the blank-depletion check. */
  blankInitialDoMgL?: number;
  blankFinalDoMgL?: number;
}

export interface CodInputs {
  blankTitrantMl: number;
  sampleTitrantMl: number;
  normality: number;
  sampleVolumeMl: number;
}

export type PeqsStatus = "meets-inland" | "meets-sewer-only" | "exceeds";

export function peqsStatus(value: number, inlandLimit: number, sewerLimit: number): PeqsStatus {
  if (value <= inlandLimit) return "meets-inland";
  if (value <= sewerLimit) return "meets-sewer-only";
  return "exceeds";
}

export const PEQS_STATUS_LABEL: Record<PeqsStatus, string> = {
  "meets-inland": "Meets PEQS (inland discharge)",
  "meets-sewer-only": "Meets PEQS for discharge to sewer only — not for inland discharge",
  exceeds: "Exceeds PEQS limits",
};

export interface BodResults {
  dilutionFactorP: number;
  doDepletionMgL: number;
  bodMgL: number;
  status: PeqsStatus;
  validityErrors: string[];
  steps: string[];
}

export function validateBodInputs(inp: BodInputs): string[] {
  const errors: string[] = [];
  if (!isFinite(inp.initialDoMgL) || inp.initialDoMgL < 0 || inp.initialDoMgL > 20)
    errors.push("Initial DO must be between 0 and 20 mg/L.");
  if (!isFinite(inp.finalDoMgL) || inp.finalDoMgL < 0 || inp.finalDoMgL > 20)
    errors.push("Final DO must be between 0 and 20 mg/L.");
  if (inp.finalDoMgL >= inp.initialDoMgL)
    errors.push("Final DO must be lower than initial DO — oxygen must have been consumed.");
  if (!isFinite(inp.sampleVolumeMl) || inp.sampleVolumeMl <= 0)
    errors.push("Sample volume must be greater than 0 mL.");
  if (!isFinite(inp.bottleVolumeMl) || inp.bottleVolumeMl <= 0)
    errors.push("Bottle volume must be greater than 0 mL.");
  if (inp.sampleVolumeMl > inp.bottleVolumeMl)
    errors.push("Sample volume cannot exceed the bottle volume.");
  return errors;
}

export function calcBod(inp: BodInputs): BodResults {
  const errors = validateBodInputs(inp);
  if (errors.length > 0) throw new Error(errors.join(" "));
  const p = inp.sampleVolumeMl / inp.bottleVolumeMl;
  const depletion = inp.initialDoMgL - inp.finalDoMgL;
  const bod = depletion / p;
  const validityErrors: string[] = [];
  if (inp.finalDoMgL < 1.0)
    validityErrors.push("Final DO is below 1.0 mg/L (APHA 5210B) — the test is invalid; use a smaller sample volume.");
  if (depletion < 2.0)
    validityErrors.push("DO depletion is under 2.0 mg/L (APHA 5210B) — the test is invalid; use a larger sample volume.");
  if (inp.blankInitialDoMgL != null && inp.blankFinalDoMgL != null) {
    const blankDepletion = inp.blankInitialDoMgL - inp.blankFinalDoMgL;
    if (blankDepletion > 0.2)
      validityErrors.push(`Blank depletion is ${blankDepletion.toFixed(2)} mg/L, over the 0.2 mg/L limit (APHA 5210B) — the dilution water or seed is suspect.`);
  }
  return {
    dilutionFactorP: p,
    doDepletionMgL: depletion,
    bodMgL: bod,
    status: peqsStatus(bod, PEQS_LIMITS_MG_L.bodInland, PEQS_LIMITS_MG_L.bodToSewer),
    validityErrors,
    steps: [
      `Dilution factor P = ${inp.sampleVolumeMl} mL / ${inp.bottleVolumeMl} mL = ${p.toFixed(4)}`,
      `DO depletion = ${inp.initialDoMgL} - ${inp.finalDoMgL} = ${depletion.toFixed(2)} mg/L`,
      `BOD5 = ${depletion.toFixed(2)} / ${p.toFixed(4)} = ${bod.toFixed(1)} mg/L (PEQS inland limit ${PEQS_LIMITS_MG_L.bodInland} mg/L, to sewer ${PEQS_LIMITS_MG_L.bodToSewer} mg/L)`,
    ],
  };
}

export interface CodResults {
  titrantDiffMl: number;
  codMgL: number;
  status: PeqsStatus;
  validityErrors: string[];
  steps: string[];
}

export function validateCodInputs(inp: CodInputs): string[] {
  const errors: string[] = [];
  if (!isFinite(inp.blankTitrantMl) || inp.blankTitrantMl < 0)
    errors.push("Blank titrant volume cannot be negative.");
  if (!isFinite(inp.sampleTitrantMl) || inp.sampleTitrantMl < 0)
    errors.push("Sample titrant volume cannot be negative.");
  if (inp.sampleTitrantMl > inp.blankTitrantMl)
    errors.push("Sample titrant volume cannot exceed the blank — the sample must consume less dichromate than the blank.");
  if (!isFinite(inp.normality) || inp.normality <= 0 || inp.normality > 1)
    errors.push("Normality must be between 0 and 1 N.");
  if (!isFinite(inp.sampleVolumeMl) || inp.sampleVolumeMl <= 0)
    errors.push("Sample volume must be greater than 0 mL.");
  return errors;
}

export function calcCod(inp: CodInputs): CodResults {
  const errors = validateCodInputs(inp);
  if (errors.length > 0) throw new Error(errors.join(" "));
  const diff = inp.blankTitrantMl - inp.sampleTitrantMl;
  const cod = (diff * inp.normality * 8000) / inp.sampleVolumeMl;
  return {
    titrantDiffMl: diff,
    codMgL: cod,
    status: peqsStatus(cod, PEQS_LIMITS_MG_L.codInland, PEQS_LIMITS_MG_L.codToSewer),
    validityErrors: [],
    steps: [
      `Titrant difference = ${inp.blankTitrantMl} - ${inp.sampleTitrantMl} = ${diff.toFixed(2)} mL`,
      `COD = (${diff.toFixed(2)} x ${inp.normality} x 8000) / ${inp.sampleVolumeMl} = ${cod.toFixed(1)} mg/L (PEQS inland limit ${PEQS_LIMITS_MG_L.codInland} mg/L, to sewer ${PEQS_LIMITS_MG_L.codToSewer} mg/L)`,
    ],
  };
}

export interface EffluentScreenInputs {
  bod: BodInputs;
  cod: CodInputs;
  /** Total suspended solids, mg/L (optional). */
  tssMgL?: number;
}

export interface EffluentScreenResults {
  bod: BodResults;
  cod: CodResults;
  codBodRatio: number;
  codBodInterpretation: string;
  tssMgL: number | null;
  tssStatus: PeqsStatus | null;
}

/** Combined BOD + COD screen with the COD/BOD ratio interpretation. */
export function calcEffluentScreen(inp: EffluentScreenInputs): EffluentScreenResults {
  const bod = calcBod(inp.bod);
  const cod = calcCod(inp.cod);
  const ratio = bod.bodMgL > 0 ? cod.codMgL / bod.bodMgL : 0;
  let interpretation: string;
  if (ratio < 1.5)
    interpretation = "Unusually low ratio — check dilution, seeding or measurement; a ratio below 1.5 is rare for real wastewater.";
  else if (ratio <= 3.0)
    interpretation = "Biodegradable wastewater (normal range 1.5–3.0) — biological treatment is suitable.";
  else if (ratio <= 3.5)
    interpretation = "Partly biodegradable — biological treatment may need a long retention time or pre-treatment.";
  else
    interpretation = "Largely non-biodegradable (ratio over 3.5) — chemical / physico-chemical treatment is likely needed.";
  return {
    bod,
    cod,
    codBodRatio: ratio,
    codBodInterpretation: interpretation,
    tssMgL: inp.tssMgL ?? null,
    tssStatus:
      inp.tssMgL != null ? peqsStatus(inp.tssMgL, PEQS_LIMITS_MG_L.tss, PEQS_LIMITS_MG_L.tssToSewer) : null,
  };
}
