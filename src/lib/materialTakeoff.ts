/**
 * materialTakeoff — Material Takeoff Sheet engine (G9 §4).
 * Pure functions. Thumb rules are documented with their wall assumption:
 * 9" outer + 4.5" inner walls, 230x110x75 mm brick + 10 mm joint.
 * Sand default corrected: the old 1.15 cft/sqft was below the published
 * 1.2–1.8 range; default split is now RCC 0.5 / PCC 0.15 / plaster 0.85
 * = 1.5 cft/sqft. Rates come from the caller (rates.ts), never hardcoded.
 */
export interface TakeoffRates {
  cementPerBag: number | null;
  sandPerCft: number | null;
  crushPerCft: number | null;
  bricksPer1000: number | null;
  steelPerKg: number | null;
  tilesPerBox: number | null;
  paintPerL: number | null;
}

export const WASTAGE_DEFAULTS = {
  cement: 2, steel: 3, bricks: 5, tiles: 10, paint: 5, sand: 3, aggregate: 3,
};

export interface TakeoffInput {
  builtUpSqft: number;
  floors: number;
  quality: "standard" | "premium" | "luxury";
  /** wastage % per material (defaults above) */
  wastage?: Partial<typeof WASTAGE_DEFAULTS>;
}

export interface TakeoffLine {
  material: string;
  qty: number;
  unit: string;
  qtyWithWastage: number;
  rate: number | null;
  rateUnit: string;
  cost: number | null;
  formula: string;
}

export function materialTakeoff(i: TakeoffInput, rates: TakeoffRates): TakeoffLine[] {
  const area = i.builtUpSqft;
  const w = { ...WASTAGE_DEFAULTS, ...(i.wastage ?? {}) };
  const finishMult = i.quality === "premium" ? 1.2 : i.quality === "luxury" ? 1.5 : 1;
  const structMult = i.quality === "luxury" ? 1.1 : 1;
  const withW = (q: number, pct: number) => q * (1 + pct / 100);
  const line = (
    material: string, qty: number, unit: string, wastagePct: number,
    rate: number | null, rateUnit: string, formula: string,
  ): TakeoffLine => ({
    material, qty, unit,
    qtyWithWastage: Math.round(withW(qty, wastagePct) * 100) / 100,
    rate, rateUnit,
    cost: rate == null ? null : Math.round(withW(qty, wastagePct) * rate),
    formula,
  });
  const brickPerSqft = 10; // 9" outer + 4.5" inner wall assumption
  return [
    line("Cement — RCC", area * 0.25 * structMult, "bags", w.cement, rates.cementPerBag, "bag", "0.25 bags/sqft (RCC)"),
    line("Cement — PCC", area * 0.05, "bags", w.cement, rates.cementPerBag, "bag", "0.05 bags/sqft (PCC)"),
    line("Cement — Plaster", area * 0.10, "bags", w.cement, rates.cementPerBag, "bag", "0.10 bags/sqft (plaster)"),
    line("Sand — RCC", area * 0.5, "cft", w.sand, rates.sandPerCft, "cft", "0.5 cft/sqft"),
    line("Sand — PCC", area * 0.15, "cft", w.sand, rates.sandPerCft, "cft", "0.15 cft/sqft"),
    line("Sand — Plaster", area * 0.85, "cft", w.sand, rates.sandPerCft, "cft", "0.85 cft/sqft"),
    line("Aggregate — RCC", area * 1.05, "cft", w.aggregate, rates.crushPerCft, "cft", "1.05 cft/sqft"),
    line("Aggregate — PCC", area * 0.3, "cft", w.aggregate, rates.crushPerCft, "cft", "0.3 cft/sqft"),
    line("Bricks", area * brickPerSqft * structMult, "nos", w.bricks, rates.bricksPer1000 == null ? null : rates.bricksPer1000 / 1000, "pc", `10/sqft (9" outer + 4.5" inner walls)`),
    line("Steel / Rebar", area * 3.5 * structMult, "kg", w.steel, rates.steelPerKg, "kg", "3.5 kg/sqft (range 3.5–4.0)"),
    line("Floor tiles", area * 1.1 * finishMult, "sqft", w.tiles, rates.tilesPerBox, "box*", "1.1x area (10% wastage incl.) — rate per box, see note"),
    line("Paint", area * 0.17 * finishMult, "L", w.paint, rates.paintPerL, "L", "0.12 L/sqft primer + 0.05 L/sqft finish"),
  ];
}

export function takeoffTotals(lines: TakeoffLine[]): { totalQty: { cementBags: number; steelKg: number; bricks: number; sandCft: number; aggregateCft: number }; grandTotal: number | null } {
  const sum = (prefix: string) => lines.filter((l) => l.material.startsWith(prefix)).reduce((s, l) => s + l.qty, 0);
  const grand = lines.every((l) => l.cost != null) ? lines.reduce((s, l) => s + (l.cost ?? 0), 0) : null;
  return {
    totalQty: {
      cementBags: Math.round(sum("Cement")),
      steelKg: Math.round(sum("Steel")),
      bricks: Math.round(sum("Bricks")),
      sandCft: Math.round(sum("Sand")),
      aggregateCft: Math.round(sum("Aggregate")),
    },
    grandTotal: grand,
  };
}
