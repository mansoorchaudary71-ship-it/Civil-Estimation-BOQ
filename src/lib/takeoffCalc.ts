/**
 * takeoffCalc — Plan Takeoff engine (G9 §9). Pure geometry + assemblies.
 * Shoelace area, polyline length, and the five assemblies with documented
 * formulas. Rates come from the caller (rates.ts); the old hardcoded,
 * unsourced, currency-free assembly rates are NOT reproduced here.
 *
 * RCC footing offsets explained: the footing concrete is measured as
 * l x (w - 0.2) x (d - 0.15) because 0.2 m is the column width allowance
 * and 0.15 m is the PCC bed thickness already measured separately.
 * Inputs are validated: w must exceed 0.2 and d must exceed 0.15.
 */
export interface Point { x: number; y: number }

export function polylineLength(points: Point[], scalePxPerUnit: number): number {
  if (scalePxPerUnit <= 0) throw new Error("Scale must be greater than 0.");
  let px = 0;
  for (let i = 1; i < points.length; i++) {
    px += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
  }
  return px / scalePxPerUnit;
}

export function shoelaceArea(points: Point[], scalePxPerUnit: number): number {
  if (scalePxPerUnit <= 0) throw new Error("Scale must be greater than 0.");
  let sum = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    sum += points[i].x * points[j].y - points[j].x * points[i].y;
  }
  return Math.abs(sum) / 2 / (scalePxPerUnit * scalePxPerUnit);
}

export interface FoundationStripInput { length: number; width: number; depth: number; pccThickness?: number }
export function foundationStrip(i: FoundationStripInput) {
  if (i.width <= 0.2) throw new Error("Footing width must exceed 0.2 m (column allowance).");
  if (i.depth <= 0.15) throw new Error("Footing depth must exceed 0.15 m (PCC bed).");
  const pccT = i.pccThickness ?? 0.15;
  const excavation = i.length * i.width * i.depth;
  const pcc = i.length * i.width * pccT;
  const rcc = i.length * (i.width - 0.2) * (i.depth - 0.15);
  return { excavation, pcc, rcc };
}

export interface SlabInput { area: number; thickness: number; steelKgPerM3?: number }
export function rccSlab(i: SlabInput) {
  const volume = i.area * i.thickness;
  const steelKgPerM3 = i.steelKgPerM3 ?? 100; // editable assumption, range 80–120
  return { volume, steelKg: volume * steelKgPerM3, steelKgPerM3, formworkArea: i.area };
}

export interface RoadInput { area: number; asphaltThickness?: number }
export function roadSection(i: RoadInput) {
  const thickness = i.asphaltThickness ?? 0.05;
  // Asphalt quantity is a VOLUME (area x thickness) in m3 — never m2.
  return { asphaltVolumeM3: i.area * thickness, thickness, unit: "m³" as const };
}

export interface BrickWallInput { length: number; height: number; thickness: number; sides?: 1 | 2 }
export function brickWall(i: BrickWallInput) {
  const volume = i.length * i.height * i.thickness;
  const bricks = Math.ceil(volume / (0.24 * 0.12 * 0.085));
  const plasterArea = i.length * i.height * (i.sides ?? 2);
  return { volume, bricks, plasterArea };
}

export function validateScale(scalePxPerUnit: number): string | null {
  if (!isFinite(scalePxPerUnit) || scalePxPerUnit <= 0)
    return "Scale is not calibrated — trace a known length first (scale must be > 0).";
  return null;
}
