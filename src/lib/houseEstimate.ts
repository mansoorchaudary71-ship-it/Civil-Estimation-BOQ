/**
 * houseEstimate — House Estimator engine (G9 §12), extracted from
 * HouseEstimator.tsx so the math is testable. Pure functions.
 *
 * BUG FIXED: plaster dry volume used 1.27; the correct dry-mortar factor
 * is 1.33. On the spec example (plaster area 6,024 sqft) that is
 * dry 333.9 cft and 54 bags of plaster cement, not 318.8 cft / 51 bags.
 *
 * Documented constants (each flagged "assumption — edit" in the UI unless
 * sourced): wall length 0.15 x covered area; wall 0.75 ft thick; slab
 * 0.5 ft; opening deduction 0.85; bricks 13.5/cft; steel factor
 * 0.015 x 222.2; finish multipliers 1 / 1.6 / 2.5; MEP 20% + 5% per extra
 * washroom/kitchen; termite Rs 12/sqft; polythene Rs 8/sqft; water tank
 * Rs 150,000 flat. Cement conversion 1.25 cft/bag is used by the component
 * (exact 1.226 — documented as acceptable rounding).
 */
export const DRY_MORTAR_FACTOR = 1.33;
export const DRY_CONCRETE_FACTOR = 1.54;
export const CEMENT_CFT_PER_BAG = 1.25; // component convention; exact 1.226

export interface HouseGeometry {
  coveredAreaSqft: number;
  stories: number;
  roomHeightFt: number;
  foundationDepthFt: number;
  foundationWidthFt: number;
  seismicSteelMulti: number;
  seismicConcreteMulti: number;
  structureSteelMulti: number;
  structureBrickMulti: number;
  foundationConcreteMulti: number;
  foundationSteelMulti: number;
}

export interface HouseQuantities {
  wallLengthFt: number;
  totalHeightFt: number;
  brickworkVolumeCft: number;
  bricks: number;
  cementBrickworkBags: number;
  slabVolumeCft: number;
  rccWetVolumeCft: number;
  rccDryVolumeCft: number;
  cementRccBags: number;
  steelKg: number;
  plasterAreaSqft: number;
  plasterWetVolumeCft: number;
  plasterDryVolumeCft: number;
  cementPlasterBags: number;
  /** Sum of per-part bag counts (124 + 248 + 54 = 426 in the example). */
  cementBagsTotal: number;
  sandCftTotal: number;
  crushCftTotal: number;
}

export function houseQuantities(g: HouseGeometry): HouseQuantities {
  const wallLengthFt = g.coveredAreaSqft * 0.15;
  const wallThickness = 0.75;
  const slabThickness = 0.5;
  const openingDeduction = 0.85;
  const totalHeightFt = g.roomHeightFt * g.stories + g.foundationDepthFt;
  const brickworkVolumeCft = wallLengthFt * totalHeightFt * wallThickness * openingDeduction * g.structureBrickMulti;
  const bricks = Math.ceil(brickworkVolumeCft * 13.5);
  const brickworkDryMortar = brickworkVolumeCft * 0.3;
  const cementBwCft = (1 / 5) * brickworkDryMortar;
  const sandBwCft = (4 / 5) * brickworkDryMortar;
  const slabVolumeCft = g.coveredAreaSqft * slabThickness * g.stories;
  const rccWetVolumeCft = slabVolumeCft * 1.25 * g.foundationConcreteMulti;
  const rccDryVolumeCft = rccWetVolumeCft * DRY_CONCRETE_FACTOR;
  const cementRccCft = (1 / 7) * rccDryVolumeCft;
  const sandRccCft = (2 / 7) * rccDryVolumeCft;
  const crushRccCft = (4 / 7) * rccDryVolumeCft;
  const steelKgResult = slabVolumeCft * 1.25 * 0.015 * 222.2 * g.seismicSteelMulti * g.structureSteelMulti * g.foundationSteelMulti;
  const plasterAreaSqft = wallLengthFt * (g.roomHeightFt * g.stories) * 2 * openingDeduction;
  const plasterWetVolumeCft = plasterAreaSqft * (0.5 / 12);
  const plasterDryVolumeCft = plasterWetVolumeCft * DRY_MORTAR_FACTOR; // 1.33, not 1.27
  const cementPlasterCft = (1 / 5) * plasterDryVolumeCft;
  const sandPlasterCft = (4 / 5) * plasterDryVolumeCft;
  const cementBrickworkBags = Math.ceil(cementBwCft / CEMENT_CFT_PER_BAG);
  const cementRccBags = Math.ceil(cementRccCft / CEMENT_CFT_PER_BAG);
  const cementPlasterBags = Math.ceil(cementPlasterCft / CEMENT_CFT_PER_BAG);
  return {
    wallLengthFt,
    totalHeightFt,
    brickworkVolumeCft,
    bricks,
    cementBrickworkBags,
    slabVolumeCft,
    rccWetVolumeCft,
    rccDryVolumeCft,
    cementRccBags,
    steelKg: Math.ceil(steelKgResult),
    plasterAreaSqft,
    plasterWetVolumeCft,
    plasterDryVolumeCft,
    cementPlasterBags,
    cementBagsTotal: cementBrickworkBags + cementRccBags + cementPlasterBags,
    sandCftTotal: Math.ceil(sandBwCft + sandRccCft + sandPlasterCft),
    crushCftTotal: Math.ceil(crushRccCft),
  };
}

export function validateHouseGeometry(g: HouseGeometry): string[] {
  const errs: string[] = [];
  if (!isFinite(g.coveredAreaSqft) || g.coveredAreaSqft <= 0) errs.push("Covered area must be greater than 0.");
  if (g.stories < 1 || g.stories > 10) errs.push("Stories must be between 1 and 10.");
  if (g.roomHeightFt < 8 || g.roomHeightFt > 15) errs.push("Room height must be 8–15 ft.");
  return errs;
}

/** The spec's worked example geometry. */
export function specExampleGeometry(): HouseGeometry {
  return {
    coveredAreaSqft: 1125,
    stories: 2,
    roomHeightFt: 10.5,
    foundationDepthFt: 3,
    foundationWidthFt: 3,
    seismicSteelMulti: 1.05, // Zone 2B
    seismicConcreteMulti: 1,
    structureSteelMulti: 1,
    structureBrickMulti: 1,
    foundationConcreteMulti: 1,
    foundationSteelMulti: 1,
  };
}
