import { CIVIL_CONSTANTS } from './unitConverter';

export interface CalculatorUnit {
  isMetric: boolean;
}

export class ConcreteMortarCalculator {
  length: number;
  width: number;
  depth: number;
  mixRatio: number[];
  wastagePct: number;
  wcRatio: number;
  isMetric: boolean;

  constructor(length: number, width: number, depth: number, mixRatio: string, wastagePct: number = 5, wcRatio: number = 0.5, isMetric: boolean = false) {
    this.length = length;
    this.width = width;
    this.depth = depth;
    this.mixRatio = mixRatio.split(':').map(Number);
    this.wastagePct = wastagePct;
    this.wcRatio = wcRatio;
    this.isMetric = isMetric;
  }

  getWetVolume() {
    return this.length * this.width * this.depth;
  }

  getDryVolume() {
    return this.getWetVolume() * 1.54;
  }

  calculate() {
    const sumRatio = this.mixRatio.reduce((a, b) => a + b, 0);
    if (sumRatio === 0) return { cementBags: 0, sandVol: 0, aggregateVol: 0, waterLiters: 0, totalWetVolume: this.getWetVolume() };

    let dryVol = this.getDryVolume();
    dryVol = dryVol * (1 + this.wastagePct / 100);

    const cementRatio = this.mixRatio[0] || 0;
    const cementVol = (cementRatio / sumRatio) * dryVol;
    
    // CEMENT_BAG_CONVERSION: In Metric (cubic meters), 1 bag cement (50kg) = 0.0347 cu.m
    const cementVolumePerBag = this.isMetric ? 0.0347 : 1.226;
    const cementBags = Math.ceil(cementVol / cementVolumePerBag);

    // Weight of cement in kg
    const cementWeightKg = cementBags * 50;

    // Water amount (Liters = kg of water) = cementWeightKg * wcRatio
    const waterLiters = cementWeightKg * this.wcRatio;

    const sandRatio = this.mixRatio[1] || 0;
    const sandVol = (sandRatio / sumRatio) * dryVol;

    const aggRatio = this.mixRatio[2] || 0;
    const aggregateVol = (aggRatio / sumRatio) * dryVol;

    return {
      cementBags,
      sandVol,
      aggregateVol,
      waterLiters,
      totalWetVolume: this.getWetVolume()
    };
  }
}

export class PlasterCalculator {
  area: number;
  thickness: number;
  mixRatio: number[];
  wastagePct: number;
  isMetric: boolean;

  constructor(area: number, thickness: number, mixRatio: string, wastagePct: number = 5, isMetric: boolean = false) {
    this.area = area;
    this.thickness = thickness; // thickness should be in the same unit base (e.g., meters or feet)
    this.mixRatio = mixRatio.split(':').map(Number);
    this.wastagePct = wastagePct;
    this.isMetric = isMetric;
  }

  calculate() {
    const wetVolume = this.area * this.thickness;
    // MORTAR_DRY_VOLUME: V_dry = V_wet * 1.33
    // We add user defined wastage afterwards if needed
    let dryVolume = wetVolume * 1.33;
    dryVolume = dryVolume * (1 + this.wastagePct / 100);

    const sumRatio = this.mixRatio.reduce((a, b) => a + b, 0);
    if (sumRatio === 0) return { cementBags: 0, sandVol: 0, waterLiters: 0, totalWetVolume: wetVolume };

    const cementRatio = this.mixRatio[0] || 0;
    const cementVol = (cementRatio / sumRatio) * dryVolume;
    
    // CEMENT_BAG_CONVERSION
    const cementVolumePerBag = this.isMetric ? 0.0347 : 1.226;
    const cementBags = Math.ceil(cementVol / cementVolumePerBag);

    const sandRatio = this.mixRatio[1] || 0;
    const sandVol = (sandRatio / sumRatio) * dryVolume;

    // standard water rule: ~20% of dry weight of cement + sand, or rough rule ~10-15 L per bag of cement used. Let's just use typical ratio water= cementWeight*0.2 + sandWeight*0.05
    // But typical W/C ratio for plastering is around 0.5 to 0.6. We'll use 0.55 * cement kg. 
    // 1 bag cement = 50kg.
    const waterLiters = cementBags * 50 * 0.55;

    return { cementBags, sandVol, waterLiters, totalWetVolume: wetVolume };
  }
}

export class BrickworkCalculator {
  wallLength: number;
  wallHeight: number;
  wallThickness: number;
  deductionsSqUnits: number;
  
  brickLength: number;
  brickWidth: number;
  brickHeight: number;
  
  mortarThickness: number;
  mixRatio: number[];
  wastagePct: number;
  isMetric: boolean;

  constructor(
    wallLength: number,
    wallHeight: number,
    wallThickness: number,
    deductionsSqUnits: number,
    brickLength: number,
    brickWidth: number,
    brickHeight: number,
    mortarThickness: number,
    mixRatio: string,
    wastagePct: number = 5,
    isMetric: boolean = false
  ) {
    this.wallLength = wallLength;
    this.wallHeight = wallHeight;
    this.wallThickness = wallThickness;
    this.deductionsSqUnits = deductionsSqUnits;
    this.brickLength = brickLength;
    this.brickWidth = brickWidth;
    this.brickHeight = brickHeight;
    this.mortarThickness = mortarThickness;
    this.mixRatio = mixRatio.split(':').map(Number);
    this.wastagePct = wastagePct;
    this.isMetric = isMetric;
  }

  getNetWallVolume() {
    const wallVol = this.wallLength * this.wallHeight * this.wallThickness;
    const deductionVol = this.deductionsSqUnits * this.wallThickness;
    return Math.max(0, wallVol - deductionVol);
  }

  calculate() {
    const netWallVol = this.getNetWallVolume();

    const bL = this.brickLength;
    const bW = this.brickWidth;
    const bH = this.brickHeight;
    const mT = this.mortarThickness;

    // standard mortar joint thickness accounted around the brick
    const volBrickWithMortar = (bL + mT) * (bW + mT) * (bH + mT);
    
    // MASONRY_BRICK_COUNT
    const baseNumBricks = volBrickWithMortar > 0 ? (netWallVol / volBrickWithMortar) : 0;
    
    // Apply 10% standard wastage for bricks
    const numBricks = Math.ceil(baseNumBricks * (1 + 10 / 100));

    const volOneBrick = bL * bW * bH;
    const totalBrickVol = baseNumBricks * volOneBrick; // Actual bricks space without wastage

    // Mortar volume (wet)
    let mortarWetVol = Math.max(0, netWallVol - totalBrickVol);
    
    // Frog filling allowance (adds approx 15% extra mortar per brick)
    mortarWetVol = mortarWetVol * 1.15;
    
    // Add overall wastage to mortar
    mortarWetVol = mortarWetVol * (1 + this.wastagePct / 100);

    // MORTAR_DRY_VOLUME: V_dry = V_wet * 1.33
    const mortarDryVol = mortarWetVol * 1.33;

    const sumRatio = this.mixRatio.reduce((a, b) => a + b, 0);
    let cementBags = 0;
    let sandVol = 0;

    if (sumRatio > 0 && this.mixRatio.length >= 2) {
      const cementVol = (this.mixRatio[0] / sumRatio) * mortarDryVol;
      // CEMENT_BAG_CONVERSION
      const cementVolumePerBag = this.isMetric ? 0.0347 : 1.226;
      cementBags = Math.ceil(cementVol / cementVolumePerBag);
      sandVol = (this.mixRatio[1] / sumRatio) * mortarDryVol;
    }

    return {
      netWallVol,
      numBricks,
      mortarWetVol,
      cementBags,
      sandVol
    };
  }
}

export class SteelCalculator {
  barDiameter: number; // mm or inches depending on unit, but mathematically we'll standardize to standard formulas
  spanLength: number;
  spacing: number;     // in mm or inches
  barLength: number;
  overlapFactor: number;
  overlapsPerBar: number;
  wastagePct: number;
  isMetric: boolean;

  constructor(
    barDiameter: number,
    spanLength: number,
    spacing: number,
    barLength: number,
    overlapFactor: number,
    overlapsPerBar: number,
    wastagePct: number = 5,
    isMetric: boolean = true // Standard steel formulas are easiest in metric.
  ) {
    this.barDiameter = barDiameter;
    this.spanLength = spanLength;
    this.spacing = spacing;
    this.barLength = barLength;
    this.overlapFactor = overlapFactor;
    this.overlapsPerBar = overlapsPerBar;
    this.wastagePct = wastagePct;
    this.isMetric = isMetric;
  }

  calculate() {
    // If metric, spacing is in mm, otherwise in inches
    const spacingMetersOrFt = this.isMetric ? this.spacing / 1000 : this.spacing / 12;
    const numBars = spacingMetersOrFt > 0 ? Math.ceil(this.spanLength / spacingMetersOrFt) + 1 : 1;
    
    // overlap length
    const overlapLength = this.isMetric ? (this.overlapFactor * this.barDiameter) / 1000 : (this.overlapFactor * this.barDiameter) / 12;
    
    let singleBarTotalLength = this.barLength + (overlapLength * this.overlapsPerBar);
    
    let totalLengthAllBars = numBars * singleBarTotalLength;
    totalLengthAllBars = totalLengthAllBars * (1 + this.wastagePct / 100);

    // Standard formula: D^2 / 162.28 in kg/m, D^2 / 533 in kg/ft
    let weightPerUnitLength = 0;
    if (this.isMetric) {
      weightPerUnitLength = Math.pow(this.barDiameter, 2) / 162.28; 
    } else {
      // In US standard, bar # represents eighths of an inch. But if barDiameter is in eights or inches, let's assume barDiameter is in eighths? 
      // If imperial, user inputs bar diameter in eights of inch (e.g. #4 is 4/8") => The formula is (D in eighths)^2 / 2.67 lbs/ft but kg is fine (D in mm)^2/533 for kg/ft
      // Let's assume diameter is in mm for metric and inches or 'number' for imperial.
      // D^2 / 533 applies to kg/ft where D is in mm! 
      // Let's assume input barDiameter is always in mm for the weight formula, which is common.
      weightPerUnitLength = Math.pow(this.barDiameter, 2) / 533; // kg/ft
    }
    
    const totalWeightKg = totalLengthAllBars * weightPerUnitLength;
    const totalWeightMT = totalWeightKg / 1000;

    return {
      numBars,
      singleBarTotalLength,
      totalLengthAllBars,
      weightPerUnitLength,
      totalWeightKg,
      totalWeightMT
    };
  }
}
