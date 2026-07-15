export interface BrickworkParams {
  coveredAreaSqft: number;
  roomCount: number;
  roomHeightFt: number;
  openingsAreaSqft: number;
  wallThicknessFt?: number; // default 0.75 (9 inches)
}

export interface BrickworkResult {
  grossWallVolumeCft: number;
  netWallVolumeCft: number;
  brickCount: number;
  mortarVolumeCft: number;
  wallLengthFt: number;
}

/**
 * Calculates exact brickwork volumes based on granular inputs.
 */
export function calculateBrickwork(params: BrickworkParams): BrickworkResult {
  const {
    coveredAreaSqft,
    roomCount,
    roomHeightFt,
    openingsAreaSqft,
    wallThicknessFt = 0.75, // 9" wall
  } = params;

  // Approximate total running length of 9" walls. 
  // Base length from area + additional length per room.
  const basePerimeter = Math.sqrt(coveredAreaSqft) * 4;
  const internalWalls = roomCount * 12; // roughly 12 ft of additional wall per room on average
  const wallLengthFt = basePerimeter + internalWalls;

  const grossWallAreaSqft = wallLengthFt * roomHeightFt;
  const netWallAreaSqft = Math.max(0, grossWallAreaSqft - openingsAreaSqft);

  const grossWallVolumeCft = grossWallAreaSqft * wallThicknessFt;
  const netWallVolumeCft = netWallAreaSqft * wallThicknessFt;

  // Standard calculation: ~13.5 bricks per cubic foot (with mortar joints)
  const brickCount = Math.ceil(netWallVolumeCft * 13.5);

  // Mortar is typically 25% to 30% of total brickwork volume
  const mortarVolumeCft = netWallVolumeCft * 0.25;

  return {
    wallLengthFt,
    grossWallVolumeCft,
    netWallVolumeCft,
    brickCount,
    mortarVolumeCft,
  };
}

export interface SlabParams {
  coveredAreaSqft: number;
  slabThicknessFt?: number; // default 5 inches (5/12 ft)
  barDiameterMm?: number; // Main & Dist bar dia, default 10mm
  barSpacingInches?: number; // c/c spacing, default 6 inches
}

export interface SlabResult {
  concreteVolumeCft: number;
  concreteVolumeCum: number;
  steelWeightKg: number;
}

/**
 * Calculates slab concrete volume and steel reinforcement weight.
 * Uses exact engineering formula W = D^2 / 162.28 per meter.
 */
export function calculateSlabAndSteel(params: SlabParams): SlabResult {
  const {
    coveredAreaSqft,
    slabThicknessFt = 5 / 12,
    barDiameterMm = 10,
    barSpacingInches = 6,
  } = params;

  // Concrete Volume
  const concreteVolumeCft = coveredAreaSqft * slabThicknessFt;
  const concreteVolumeCum = concreteVolumeCft / 35.3147;

  // Steel Calculation
  // Spacing in grid (both ways)
  const spacingMeters = barSpacingInches * 0.0254; // converting inches to meters
  const areaCum = coveredAreaSqft / 10.7639; // sq meters

  // Length of bars in 1 square meter (X and Y directions)
  const barsPerMeter = 1 / spacingMeters;
  const lengthPerSqm = barsPerMeter * 2; // total running length of steel per sq.m

  // Weight formula: D^2 / 162.28 = kg per meter
  const weightPerMeter = Math.pow(barDiameterMm, 2) / 162.28;
  const weightPerSqm = lengthPerSqm * weightPerMeter;

  // Total steel weight + 10% for lap lengths, bends, wastage
  const steelWeightKg = areaCum * weightPerSqm * 1.1;

  return {
    concreteVolumeCft,
    concreteVolumeCum,
    steelWeightKg,
  };
}

export interface FinishingParams {
  coveredAreaSqft: number;
  wallLengthFt: number;
  roomHeightFt: number;
  openingsAreaSqft: number;
}

export interface FinishingResult {
  internalPlasterAreaSqft: number;
  externalPlasterAreaSqft: number;
  paintAreaSqft: number;
  flooringAreaSqft: number;
  ceilingAreaSqft: number;
}

/**
 * Calculates surface areas for plaster, paint, flooring, and ceilings.
 */
export function calculateFinishing(params: FinishingParams): FinishingResult {
  const {
    coveredAreaSqft,
    wallLengthFt,
    roomHeightFt,
    openingsAreaSqft,
  } = params;

  // Internal wall area assumes painting both sides of all internal walls
  // minus openings (openings exist on both sides, so x2)
  const totalWallSurfaceArea = (wallLengthFt * roomHeightFt) * 2;
  const internalPlasterAreaSqft = Math.max(0, totalWallSurfaceArea - (openingsAreaSqft * 2));
  
  // Outer plaster is approx the exterior perimeter. 
  const perimeter = Math.sqrt(coveredAreaSqft) * 4;
  const externalPlasterAreaSqft = perimeter * roomHeightFt;

  // Paint is applied to internal plaster + ceiling
  const ceilingAreaSqft = coveredAreaSqft;
  const paintAreaSqft = internalPlasterAreaSqft + ceilingAreaSqft;

  // Flooring covers the exact floor area
  const flooringAreaSqft = coveredAreaSqft;

  return {
    internalPlasterAreaSqft,
    externalPlasterAreaSqft,
    paintAreaSqft,
    flooringAreaSqft,
    ceilingAreaSqft,
  };
}

export interface AdvancedHouseEstimateParams {
  coveredAreaSqft: number;
  roomCount: number;
  roomHeightFt: number;
  openingsAreaSqft: number;
  slabThicknessFt?: number;
  barDiameterMm?: number;
  barSpacingInches?: number;
}

/**
 * Combines all granular calculations into one unified report.
 */
export function calculateAdvancedHouseEstimate(params: AdvancedHouseEstimateParams) {
  const brickwork = calculateBrickwork({
    coveredAreaSqft: params.coveredAreaSqft,
    roomCount: params.roomCount,
    roomHeightFt: params.roomHeightFt,
    openingsAreaSqft: params.openingsAreaSqft,
  });

  const structure = calculateSlabAndSteel({
    coveredAreaSqft: params.coveredAreaSqft,
    slabThicknessFt: params.slabThicknessFt,
    barDiameterMm: params.barDiameterMm,
    barSpacingInches: params.barSpacingInches,
  });

  const finishing = calculateFinishing({
    coveredAreaSqft: params.coveredAreaSqft,
    wallLengthFt: brickwork.wallLengthFt,
    roomHeightFt: params.roomHeightFt,
    openingsAreaSqft: params.openingsAreaSqft,
  });

  return {
    brickwork,
    structure,
    finishing,
  };
}
