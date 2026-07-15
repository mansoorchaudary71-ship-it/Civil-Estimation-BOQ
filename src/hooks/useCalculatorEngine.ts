import { useState, useMemo } from 'react';

export type SoilType = 'Loose Fill' | 'Sandy' | 'Hard Clay';

export interface CalculatorEngineInput {
  coveredAreaSqft: number;
  totalWallLength: number;
  stories: number;
  roomHeight?: number;
  slabThickness?: number;
  wallThickness?: number;
  // Rates
  rates: {
    cement: number; // per bag
    steel: number; // per kg
    bricks: number; // per brick
    sand: number; // per cft
    crush: number; // per cft
    laborMasonry: number; // per sqft
    laborExcavation: number; // per cft
    laborSteelFixing: number; // per kg
    laborShuttering: number; // per sqft
  };
}

export interface CalculationResult {
  foundationDepth: number;
  materialCosts: {
    cement: number;
    steel: number;
    bricks: number;
    sand: number;
    crush: number;
    total: number;
  };
  laborCosts: {
    masonry: number;
    excavation: number;
    steelFixing: number;
    shuttering: number;
    total: number;
  };
  grandTotal: number;
  volumes: {
    concrete: number; // dry
    bricks: number; // count
    steel: number; // kg
    excavation: number; // cft
  };
}

export function useCalculatorEngine(initialInput: CalculatorEngineInput) {
  // We can just keep currentSoilType to 'Sandy' as the initial state
  const [currentSoilType, setCurrentSoilType] = useState<SoilType>('Sandy');
  const [includeWastage, setIncludeWastage] = useState<boolean>(false);
  const [inputState, setInputState] = useState<CalculatorEngineInput>(initialInput);

  const results = useMemo<CalculationResult>(() => {
    // 1. SBC Logic
    let foundationDepth = 3; // default
    if (currentSoilType === 'Loose Fill') {
      foundationDepth = 6;
    } else if (currentSoilType === 'Sandy') {
      foundationDepth = 4;
    } else if (currentSoilType === 'Hard Clay') {
      foundationDepth = 2.5;
    }

    // Assumptions Setup
    const roomHeight = inputState.roomHeight || 10.5;
    const slabThickness = inputState.slabThickness || 0.5; // 6 inches
    const wallThickness = inputState.wallThickness || 0.75; // 9 inches
    const totalHeight = (roomHeight * inputState.stories) + foundationDepth;
    const foundationWidth = 3;
    const openingDeduction = 0.85; // 15% deductions for doors/windows

    // Excavation Volume
    const excavationVolumeCft = inputState.totalWallLength * foundationWidth * foundationDepth;

    // Wastage Multipliers
    const volumeWastageMulti = includeWastage ? 1.05 : 1.0;
    const steelWastageMulti = includeWastage ? 1.03 : 1.0;

    // Brickwork Calculation
    const brickworkVolume = inputState.totalWallLength * totalHeight * wallThickness * openingDeduction;
    let brickworkVolumeWithWastage = brickworkVolume * volumeWastageMulti;
    const totalBricksNos = Math.ceil(brickworkVolumeWithWastage * 13.5);

    // Brickwork Mortar
    const brickworkDryMortar = brickworkVolumeWithWastage * 0.3; // 30% of brickwork is mortar
    const cementBw = (1 / 5) * brickworkDryMortar;
    const sandBw = (4 / 5) * brickworkDryMortar;

    // Concrete Calculation (Slab + Beams + Columns approx)
    const slabArea = inputState.coveredAreaSqft * inputState.stories;
    const slabWetVolume = slabArea * slabThickness;
    const rcWetVolume = slabWetVolume * 1.25 * volumeWastageMulti; // 25% extra for beams/columns
    const rccDryVolume = rcWetVolume * 1.54; // Dry concrete factor
    const cementRcc = (1 / 7) * rccDryVolume; // 1:2:4
    const sandRcc = (2 / 7) * rccDryVolume;
    const crushRcc = (4 / 7) * rccDryVolume;

    // Plastering Area (both sides of wall)
    const plasterArea = inputState.totalWallLength * (roomHeight * inputState.stories) * 2 * openingDeduction;
    const plasterWetVol = plasterArea * (0.0416); // 0.5 inches
    const plasterDryVol = plasterWetVol * 1.27; // Dry mortar factor
    const cementPlaster = (1 / 5) * plasterDryVol; // 1:4
    const sandPlaster = (4 / 5) * plasterDryVol;

    // Steel Calculation
    const steelKgBase = slabWetVolume * 1.25 * 0.015 * 222.2; // 1.5% of concrete volume (rule of thumb)
    const steelKg = Math.ceil(steelKgBase * steelWastageMulti);

    // Totals
    const cementBagsTotal = Math.ceil((cementBw + cementRcc + cementPlaster) / 1.25); // 1 bag = 1.25 cft
    const sandCftTotal = Math.ceil(sandBw + sandRcc + sandPlaster);
    const crushCftTotal = Math.ceil(crushRcc);

    // 2. Material vs. Labour Bifurcation
    const materialCosts = {
      cement: cementBagsTotal * inputState.rates.cement,
      steel: steelKg * inputState.rates.steel,
      bricks: totalBricksNos * inputState.rates.bricks,
      sand: sandCftTotal * inputState.rates.sand,
      crush: crushCftTotal * inputState.rates.crush,
      total: 0
    };
    materialCosts.total = materialCosts.cement + materialCosts.steel + materialCosts.bricks + materialCosts.sand + materialCosts.crush;

    const laborCosts = {
      masonry: inputState.coveredAreaSqft * inputState.stories * inputState.rates.laborMasonry,
      excavation: excavationVolumeCft * inputState.rates.laborExcavation,
      steelFixing: steelKg * inputState.rates.laborSteelFixing,
      shuttering: slabArea * inputState.rates.laborShuttering,
      total: 0
    };
    laborCosts.total = laborCosts.masonry + laborCosts.excavation + laborCosts.steelFixing + laborCosts.shuttering;

    const grandTotal = materialCosts.total + laborCosts.total;

    return {
      foundationDepth,
      materialCosts,
      laborCosts,
      grandTotal,
      volumes: {
        concrete: rccDryVolume,
        bricks: totalBricksNos,
        steel: steelKg,
        excavation: excavationVolumeCft,
      }
    };
  }, [currentSoilType, includeWastage, inputState]);

  return {
    soilType: currentSoilType,
    setSoilType: setCurrentSoilType,
    includeWastage,
    setIncludeWastage,
    inputState,
    setInputState,
    results
  };
}
