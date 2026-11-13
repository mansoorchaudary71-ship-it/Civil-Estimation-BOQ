/**
 * evm — Earned Value Management engine (G9 §15).
 * Pure functions. All four EAC methods, ETC, VAC, TCPI, and the
 * days-ahead/behind forecast (replaces the old "hacky" formula).
 *
 * Worked example (spec): BAC 119,000, EV 36,000, PV 50,000, AC 36,500
 * -> SPI 0.72, CPI 0.99, CV -500, SV -14,000, TCPI 1.01.
 * EAC by the CPI method = AC + (BAC - EV) / CPI = 36,500 + 83,000 / 0.9863
 * = ~120,653 (the spec's printed 120,515 does not reproduce from its own
 * inputs — it implies CPI 0.988; the formula here is the PMI one and the
 * test asserts the formula, not the misprinted figure).
 */
export interface EvmInput {
  bac: number;
  ev: number;
  pv: number;
  ac: number;
  /** bottom-up estimate to complete, when known */
  etcBottomUp?: number;
}

export interface EvmResult {
  spi: number;
  cpi: number;
  cv: number;
  sv: number;
  overallProgressPct: number;
  /** EAC method 1: BAC / CPI */
  eacCpi: number;
  /** EAC method 2: AC + (BAC - EV) */
  eacAtypical: number;
  /** EAC method 3: AC + (BAC - EV) / (CPI x SPI) */
  eacCpiSpi: number;
  /** EAC method 4: AC + bottom-up ETC */
  eacBottomUp: number | null;
  etc: number; // ETC for the CPI method
  vac: number; // BAC - EAC(CPI)
  tcpi: number; // (BAC - EV) / (BAC - AC)
  status: string;
}

export function calcEvm(i: EvmInput): EvmResult {
  const spi = i.pv > 0 ? i.ev / i.pv : 0;
  const cpi = i.ac > 0 ? i.ev / i.ac : 0;
  const cv = i.ev - i.ac;
  const sv = i.ev - i.pv;
  const eacCpi = cpi > 0 ? i.bac / cpi : i.bac;
  const eacAtypical = i.ac + (i.bac - i.ev);
  const eacCpiSpi = cpi > 0 && spi > 0 ? i.ac + (i.bac - i.ev) / (cpi * spi) : eacAtypical;
  const eacBottomUp = i.etcBottomUp != null ? i.ac + i.etcBottomUp : null;
  const etc = eacCpi - i.ac;
  const vac = i.bac - eacCpi;
  const tcpi = i.bac - i.ac !== 0 ? (i.bac - i.ev) / (i.bac - i.ac) : 0;
  const status =
    cpi >= 1 && spi >= 1 ? "On track — under budget and ahead of schedule"
    : cpi < 1 && spi < 1 ? "Over budget and behind schedule — review the plan"
    : cpi < 1 ? "Over budget but on schedule"
    : "Under budget but behind schedule";
  return {
    spi, cpi, cv, sv,
    overallProgressPct: i.bac > 0 ? (i.ev / i.bac) * 100 : 0,
    eacCpi, eacAtypical, eacCpiSpi, eacBottomUp, etc, vac, tcpi, status,
  };
}

/**
 * Forecast finish: planned finish + (1/SPI - 1) x remaining duration.
 * Returns extra days vs plan (negative = ahead).
 */
export function forecastDelayDays(spi: number, remainingPlannedDays: number): number {
  if (spi <= 0) return remainingPlannedDays;
  return Math.round((1 / spi - 1) * remainingPlannedDays);
}

/** Daily interpolation of a phase's planned value between start and end. */
export function phasePvOnDate(
  phase: { start: string; end: string; budget: number },
  onDate: string,
): number {
  const start = new Date(phase.start).getTime();
  const end = new Date(phase.end).getTime();
  const at = new Date(onDate).getTime();
  if (isNaN(start) || isNaN(end) || end <= start) return 0;
  if (at <= start) return 0;
  if (at >= end) return phase.budget;
  return phase.budget * ((at - start) / (end - start));
}

/** S-curve points: daily PV/EV/AC interpolation across all phases. */
export function sCurvePoints(
  phases: Array<{ start: string; end: string; budget: number; progress: number; actualCost: number }>,
  statusDate: string,
): Array<{ date: string; pv: number; ev: number; ac: number }> {
  const starts = phases.map((p) => new Date(p.start).getTime()).filter((t) => !isNaN(t));
  const ends = phases.map((p) => new Date(p.end).getTime()).filter((t) => !isNaN(t));
  if (!starts.length || !ends.length) return [];
  const from = Math.min(...starts);
  const to = Math.min(Math.max(...ends), new Date(statusDate).getTime());
  const points: Array<{ date: string; pv: number; ev: number; ac: number }> = [];
  const day = 86400000;
  for (let t = from; t <= to; t += day) {
    const d = new Date(t).toISOString().slice(0, 10);
    let pv = 0;
    let ev = 0;
    let ac = 0;
    for (const p of phases) {
      pv += phasePvOnDate(p, d);
      // EV accrues in proportion to the same time interpolation, capped by progress.
      const frac = phasePvOnDate(p, d) / (p.budget || 1);
      ev += p.budget * (p.progress / 100) * frac;
      ac += p.actualCost * frac;
    }
    points.push({ date: d, pv: Math.round(pv), ev: Math.round(ev), ac: Math.round(ac) });
  }
  return points;
}
