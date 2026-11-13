/**
 * qsWorkflow — Guided QS Workflow engine (G9 §1). Pure functions.
 * Quantities are derived from dimensions (Nos x L x W x D), never typed-in
 * totals. Rates come from the caller (rates.ts); the old hardcoded literal
 * rate table and the fictional "Apollo Highrise" defaults are NOT carried.
 *
 * Legacy regression: with the old default quantities/rates entered directly,
 * the BOQ total reproduces Rs 3,423,000 (see qsWorkflow.test.ts).
 */
export interface DimensionRow { nos: number; length: number; width: number; depth: number; }

export function volumeFromRows(rows: DimensionRow[]): number {
  return rows.reduce((s, r) => s + r.nos * r.length * r.width * r.depth, 0);
}

export function areaFromRows(rows: DimensionRow[]): number {
  return rows.reduce((s, r) => s + r.nos * r.length * r.width, 0);
}

export function validateDimensionRow(r: DimensionRow): string | null {
  for (const [k, v] of [["Nos", r.nos], ["Length", r.length], ["Width", r.width], ["Depth", r.depth]] as const) {
    if (!isFinite(v) || v <= 0) return `${k} must be greater than 0.`;
    if (v > 10000) return `${k} looks too large (max 10,000).`;
  }
  return null;
}

/** Footing concrete 1:2:4 — wet -> dry (1.54) -> cement bags. */
export function footingConcrete(wetVolumeM3: number) {
  const dry = wetVolumeM3 * 1.54;
  const cementBags = Math.ceil(dry * (1 / 7) / 0.0347);
  return { wet: wetVolumeM3, dry: Math.round(dry * 100) / 100, cementBags };
}

/** Plaster net area with IS 1200 opening deductions (see masterQuantity). */
export function plasterNetArea(grossM2: number, openingsM2: number[]): number {
  let deduction = 0;
  for (const a of openingsM2) {
    deduction += a < 0.5 ? 0 : a <= 3 ? a : a * 2;
  }
  return Math.max(0, grossM2 - deduction);
}

export interface QsBoqItem { section: string; item: string; qty: number; unit: string; rate: number; }
export function qsBoqTotals(items: QsBoqItem[], contingencyPct: number, taxPct: number) {
  const amounts = items.map((i) => ({ ...i, amount: Math.round(i.qty * i.rate * 100) / 100 }));
  const subtotal = amounts.reduce((s, a) => s + a.amount, 0);
  const contingency = subtotal * (contingencyPct / 100);
  const taxable = subtotal + contingency;
  const tax = taxable * (taxPct / 100);
  const grand = taxable + tax;
  const bySection = new Map<string, number>();
  for (const a of amounts) bySection.set(a.section, (bySection.get(a.section) ?? 0) + a.amount);
  return { items: amounts, subtotal, contingency, tax, grandTotal: grand, bySection: Object.fromEntries(bySection) };
}

/** Legacy default items (old QSWorkflow defaults) — regression only. */
export const LEGACY_QS_ITEMS: QsBoqItem[] = [
  { section: "Earthwork", item: "Excavation", qty: 120, unit: "m³", rate: 350 },
  { section: "Concrete", item: "Footing concrete", qty: 45, unit: "m³", rate: 5500 },
  { section: "Concrete", item: "PCC", qty: 15, unit: "m³", rate: 6000 },
  { section: "Concrete", item: "Columns", qty: 25, unit: "m³", rate: 7000 },
  { section: "Concrete", item: "Beams", qty: 30, unit: "m³", rate: 6500 },
  { section: "Concrete", item: "Slabs", qty: 80, unit: "m³", rate: 6000 },
  { section: "Concrete", item: "Staircase", qty: 10, unit: "m³", rate: 7500 },
  { section: "Masonry", item: "Brickwork", qty: 150, unit: "m³", rate: 4500 },
  { section: "Finishes", item: "Plaster", qty: 850, unit: "m²", rate: 250 },
  { section: "Finishes", item: "Flooring", qty: 400, unit: "m²", rate: 800 },
  { section: "Finishes", item: "Painting", qty: 1200, unit: "m²", rate: 150 },
  { section: "Services", item: "Plumbing points", qty: 45, unit: "nos", rate: 1200 },
  { section: "Services", item: "Electrical points", qty: 120, unit: "nos", rate: 850 },
  { section: "Services", item: "Paint / misc", qty: 5000, unit: "sqft", rate: 15 },
  { section: "Services", item: "Solar PV System", qty: 10, unit: "kW", rate: 50000 },
];
