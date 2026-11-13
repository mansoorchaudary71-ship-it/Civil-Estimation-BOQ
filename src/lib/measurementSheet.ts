/**
 * measurementSheet — Measurement Sheet engine (G9 §6).
 * Pure functions. BUG FIXED: a missing dimension was treated as 1, so a
 * row with only L=10 returned 10 with undefined units. A row is now
 * "incomplete" until it has enough dimensions (2 for area, 3 for volume);
 * incomplete rows return null and must be flagged in the UI, never computed.
 */
export type MeasureKind = "volume" | "area" | "length";
export interface MeasureRow {
  nos?: number | null;
  length?: number | null;
  width?: number | null;
  depth?: number | null;
  rate?: number | null;
}

export interface MeasureResult {
  qty: number | null;
  unit: string;
  amount: number | null;
  incomplete: boolean;
  hint: string | null;
}

export function measureRow(row: MeasureRow, kind: MeasureKind, unit: "m" | "ft"): MeasureResult {
  const dims = [row.length, row.width, row.depth].filter((d) => d != null && isFinite(d as number) && (d as number) > 0);
  const needed = kind === "volume" ? 3 : kind === "area" ? 2 : 1;
  const unitLabel = kind === "volume" ? (unit === "m" ? "m³" : "cu.ft") : kind === "area" ? (unit === "m" ? "m²" : "sqft") : unit;
  if (dims.length < needed) {
    return {
      qty: null, unit: unitLabel, amount: null, incomplete: true,
      hint: `Incomplete — ${needed} dimension(s) needed for ${kind}, only ${dims.length} given.`,
    };
  }
  const nos = row.nos != null && isFinite(row.nos) && row.nos > 0 ? row.nos : 1;
  const qty = nos * (dims as number[]).reduce((a, b) => a * b, 1);
  return {
    qty: Math.round(qty * 100) / 100,
    unit: unitLabel,
    amount: row.rate != null && isFinite(row.rate) ? Math.round(qty * row.rate * 100) / 100 : null,
    incomplete: false,
    hint: null,
  };
}

export function validateMeasureRow(row: MeasureRow): string | null {
  for (const [k, v] of [["Nos", row.nos], ["Length", row.length], ["Width", row.width], ["Depth", row.depth]] as const) {
    if (v != null && (!isFinite(v) || v < 0)) return `${k} cannot be negative.`;
    if (v != null && v > 10000) return `${k} looks too large (max 10,000).`;
  }
  return null;
}

/** IS 1200 plaster opening deduction (shared with masterQuantity). */
export function plasterDeductionFaces(openingAreaM2: number): number {
  if (openingAreaM2 < 0.5) return 0;
  if (openingAreaM2 <= 3) return 1;
  return 2;
}
