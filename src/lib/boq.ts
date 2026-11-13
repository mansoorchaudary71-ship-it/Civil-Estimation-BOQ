/**
 * boq — BOQ Generator engine (G9 §7) + shared BOQ inbox handoff.
 * Pure functions. Upgrades over the component's inline math:
 * - Nos x L x W x D measurement columns (ported from AdvancedBoqGenerator,
 *   WITHOUT its wrong trade-rate map)
 * - per-line wastage % (billable qty = qty x (1 + w%))
 * - item codes (CPWD DSR style), unpriced-line flag (rate 0 / null)
 * - region-labelled tax (GST (IN) / Sales Tax (PK) / VAT (UAE 5%))
 * - measurement-standard note (IS 1200 / CESMM4 / NRM2 / POMI — the
 *   selector is cosmetic in the UI and must be labelled as such until a
 *   standard changes the math)
 */
export interface BoqLine {
  id: string;
  code?: string;
  division: string;
  description: string;
  unit: string;
  nos?: number | null;
  length?: number | null;
  width?: number | null;
  depth?: number | null;
  quantity: number;
  quantityManual?: boolean;
  rate: number | null;
  wastagePct?: number;
}

export function qtyFromDimensions(l: Pick<BoqLine, "nos" | "length" | "width" | "depth">): number | null {
  const dims = [l.length, l.width, l.depth].filter((d) => d != null && isFinite(d as number) && (d as number) > 0) as number[];
  if (dims.length === 0) return null;
  const nos = l.nos != null && isFinite(l.nos) && l.nos > 0 ? l.nos : 1;
  return Math.round(nos * dims.reduce((a, b) => a * b, 1) * 100) / 100;
}

export function billableQty(l: BoqLine): number {
  return Math.round(l.quantity * (1 + (l.wastagePct ?? 0) / 100) * 100) / 100;
}

export function lineAmount(l: BoqLine): number | null {
  if (l.rate == null) return null;
  return Math.round(billableQty(l) * l.rate * 100) / 100;
}

export function isUnpriced(l: BoqLine): boolean {
  return l.rate == null || l.rate === 0;
}

export interface BoqTotals { subtotal: number; contingency: number; taxable: number; tax: number; grandTotal: number; unpricedCount: number; }
export function boqTotals(lines: BoqLine[], contingencyPct: number, taxPct: number): BoqTotals {
  const subtotal = lines.reduce((s, l) => s + (lineAmount(l) ?? 0), 0);
  const contingency = subtotal * (contingencyPct / 100);
  const taxable = subtotal + contingency;
  const tax = taxable * (taxPct / 100);
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    contingency: Math.round(contingency * 100) / 100,
    taxable: Math.round(taxable * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    grandTotal: Math.round((taxable + tax) * 100) / 100,
    unpricedCount: lines.filter(isUnpriced).length,
  };
}

export function taxLabelForRegion(region: "PK" | "IN" | "AE"): { label: string; defaultPct: number; note: string } {
  if (region === "PK") return { label: "Sales Tax (PK)", defaultPct: 18, note: "Pakistan standard sales-tax rate is 18% — adjust for your contract; not universal." };
  if (region === "AE") return { label: "VAT (UAE)", defaultPct: 5, note: "UAE VAT is 5%." };
  return { label: "GST (IN)", defaultPct: 18, note: "India GST default 18% — adjust per item/slab." };
}

/** Residential template totals (regression, old demo rates): 37,275 / 39,138.75 / 46,183.73 */
export const RESIDENTIAL_TEMPLATE: Array<{ description: string; unit: string; quantity: number; rate: number }> = [
  { description: "Excavation for foundation", unit: "m³", quantity: 120, rate: 15 },
  { description: "PCC (1:4:8) for foundation bed", unit: "m³", quantity: 15, rate: 85 },
  { description: "RCC (1:2:4) in columns, beams, slab", unit: "m³", quantity: 65, rate: 150 },
  { description: "First class brickwork in cement mortar (1:6)", unit: "m³", quantity: 85, rate: 110 },
  { description: "Internal Plastering (1:4)", unit: "m²", quantity: 450, rate: 12 },
  { description: "Vitrified Tile Flooring", unit: "m²", quantity: 120, rate: 35 },
  { description: "Plumbing fixtures and piping", unit: "lump sum", quantity: 1, rate: 2500 },
  { description: "Wiring and DB fixtures", unit: "lump sum", quantity: 1, rate: 3000 },
];

/* ---- Shared BOQ inbox: "Send to BOQ" handoff (localStorage) ---- */
export const BOQ_INBOX_KEY = "cep_boq_inbox_v1";
export interface BoqInboxLine { description: string; unit: string; quantity: number; rate: number | null; source: string; }
export function sendToBoq(lines: BoqInboxLine[]): void {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(BOQ_INBOX_KEY, JSON.stringify({ at: new Date().toISOString(), lines }));
  } catch { /* storage unavailable — caller shows a copy fallback */ }
}
export function readBoqInbox(): BoqInboxLine[] {
  try {
    if (typeof localStorage === "undefined") return [];
    const raw = localStorage.getItem(BOQ_INBOX_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as { lines?: BoqInboxLine[] };
    return Array.isArray(parsed.lines) ? parsed.lines : [];
  } catch { return []; }
}
export function clearBoqInbox(): void {
  try { if (typeof localStorage !== "undefined") localStorage.removeItem(BOQ_INBOX_KEY); } catch { /* ignore */ }
}
