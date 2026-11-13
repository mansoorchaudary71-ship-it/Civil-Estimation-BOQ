/**
 * costSummary — Construction Cost Summary engine (G9 §5).
 * Pure functions. Line items are qty x rate rows (never hand-typed demo
 * amounts presented as computed); the old defaults are reproduced only as a
 * labelled regression example. GST/VAT is an explicit editable input
 * (default 0 — never silently omitted, never silently added).
 */
export interface CostLine { id: string; category: "grey" | "finish" | "labour"; label: string; qty: number; unit: string; rate: number; }
export function lineAmount(l: CostLine): number { return l.qty * l.rate; }

export interface CostSummaryInput {
  areaSqft: number;
  lines: CostLine[];
  overheadPct: number; // default 15, range 5–25
  contingencyPct: number; // default 5, range 2–10
  taxPct: number; // default 0, editable; label by region in the UI
  taxLabel: string; // e.g. "Sales Tax (PK)" / "GST (IN)" / "VAT (UAE 5%)"
}

export interface CostSummaryResult {
  greyTotal: number; finishTotal: number; labourTotal: number;
  subtotal: number; overhead: number; contingency: number; tax: number;
  grandTotal: number; costPerSqft: number;
}

/** The old hardcoded demo amounts, labelled as an EXAMPLE, for regression. */
export const EXAMPLE_LINES: CostLine[] = [
  { id: "g1", category: "grey", label: "Foundation (example)", qty: 1, unit: "LS", rate: 450000 },
  { id: "g2", category: "grey", label: "Brickwork / walls (example)", qty: 1, unit: "LS", rate: 800000 },
  { id: "g3", category: "grey", label: "RCC slabs (example)", qty: 1, unit: "LS", rate: 1200000 },
  { id: "g4", category: "grey", label: "Roof / misc grey (example)", qty: 1, unit: "LS", rate: 600000 },
  { id: "f1", category: "finish", label: "Flooring (example)", qty: 1, unit: "LS", rate: 500000 },
  { id: "f2", category: "finish", label: "Plaster / paint (example)", qty: 1, unit: "LS", rate: 250000 },
  { id: "f3", category: "finish", label: "Doors / windows (example)", qty: 1, unit: "LS", rate: 400000 },
  { id: "f4", category: "finish", label: "Fixtures (example)", qty: 1, unit: "LS", rate: 300000 },
  { id: "l1", category: "labour", label: "Skilled labour (example)", qty: 1, unit: "LS", rate: 800000 },
  { id: "l2", category: "labour", label: "Unskilled labour (example)", qty: 1, unit: "LS", rate: 400000 },
];

export function costSummary(i: CostSummaryInput): CostSummaryResult {
  const sumCat = (c: CostLine["category"]) =>
    i.lines.filter((l) => l.category === c).reduce((s, l) => s + lineAmount(l), 0);
  const greyTotal = sumCat("grey");
  const finishTotal = sumCat("finish");
  const labourTotal = sumCat("labour");
  const subtotal = greyTotal + finishTotal + labourTotal;
  const overhead = subtotal * (i.overheadPct / 100);
  const contingency = subtotal * (i.contingencyPct / 100);
  const tax = subtotal * (i.taxPct / 100);
  const grandTotal = subtotal + overhead + contingency + tax;
  return {
    greyTotal, finishTotal, labourTotal, subtotal, overhead, contingency, tax,
    grandTotal,
    costPerSqft: i.areaSqft > 0 ? grandTotal / i.areaSqft : 0,
  };
}

export function validateCostSummary(i: CostSummaryInput): string[] {
  const errs: string[] = [];
  if (!isFinite(i.areaSqft) || i.areaSqft <= 0) errs.push("Area must be greater than 0.");
  if (i.overheadPct < 0 || i.overheadPct > 50) errs.push("Overhead & profit must be 0–50%.");
  if (i.contingencyPct < 0 || i.contingencyPct > 25) errs.push("Contingency must be 0–25%.");
  if (i.taxPct < 0 || i.taxPct > 50) errs.push("Tax must be 0–50%.");
  for (const l of i.lines) {
    if (l.qty < 0) errs.push(`"${l.label}": quantity cannot be negative.`);
    if (l.rate < 0) errs.push(`"${l.label}": rate cannot be negative.`);
  }
  if (i.lines.length === 0) errs.push("Add at least one cost line.");
  return errs;
}
