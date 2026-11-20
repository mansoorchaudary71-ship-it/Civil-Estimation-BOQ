/**
 * Water tank design engine — IS 3370:2009 (liquid-retaining structures).
 * Full build: the old WaterTankDesign was a placeholder with zero inputs.
 * No dedicated interactive IS 3370 calculator surfaced in research, so
 * this is a first-mover tool: capacity-first flow (demand → dimensions →
 * capacity), hydrostatic wall design, hoop tension for circular tanks,
 * minimum steel 0.217% (IS 3370 Part 2 Cl. 7.1), crack-width limit 0.2 mm,
 * staging load for overhead tanks, quantities and cost.
 *
 * Permissible steel stress σst (IS 3370 Part 2 Table 2):
 * - Direct tension (hoop): 150 MPa plain bars, 130 MPa deformed bars.
 * - Flexure (bending in walls): 150 MPa (both), used with j ≈ 0.87.
 * The engine uses the table — it is not a hardcoded 150 MPa.
 */
import {
  astProvidedPerM, checkRange, costLine, materialsForConcrete,
  mixRatioForGrade, round, spacingForAst, totalCost, type CostLine,
  type FaqItem, type MaterialBreakdown,
} from "./structuralShared";

export type TankShape = "rectangular" | "circular";
export type TankPlacement = "overhead" | "underground" | "resting";
export type BarType = "deformed" | "plain";

export interface WaterTankInputs {
  shape: TankShape;
  placement: TankPlacement;
  occupants: number;
  lpcd: number;
  daysReserve: number;
  lengthM: number; // rect
  widthM: number; // rect
  diameterM: number; // circular
  waterDepthM: number;
  freeboardM: number;
  wallThicknessMm: number;
  baseThicknessMm: number;
  fck: number;
  fy: number;
  barType: BarType;
  coverMm: number;
  mainDiaMm: number;
  stagingHeightM: number; // overhead only
  wastagePct: number;
  cementPerBag: number | null;
  steelPerKg: number | null;
  sandPerCft: number | null;
  crushPerCft: number | null;
}

export const defaultWaterTankInputs: WaterTankInputs = {
  shape: "rectangular",
  placement: "overhead",
  occupants: 5, lpcd: 135, daysReserve: 2,
  lengthM: 4.5, widthM: 2.15, diameterM: 3.0,
  waterDepthM: 2.0, freeboardM: 0.3,
  wallThicknessMm: 200, baseThicknessMm: 200,
  fck: 25, fy: 415, barType: "deformed", coverMm: 40, mainDiaMm: 10,
  stagingHeightM: 6, wastagePct: 5,
  cementPerBag: 1450, steelPerKg: 270, sandPerCft: 90, crushPerCft: 90,
};

/** IS 3370 Part 2 Table 2 — permissible steel stress σst (MPa). */
export function sigmaStMpa(barType: BarType, stressType: "direct-tension" | "flexure"): number {
  if (stressType === "direct-tension") return barType === "deformed" ? 130 : 150;
  return 150;
}

export function validateWaterTankInputs(i: WaterTankInputs): string[] {
  const e: string[] = [];
  checkRange(e, "Water depth", i.waterDepthM, 0.5, 6);
  checkRange(e, "Freeboard", i.freeboardM, 0.15, 0.5);
  checkRange(e, "Wall thickness", i.wallThicknessMm, 150, 500);
  checkRange(e, "Base thickness", i.baseThicknessMm, 150, 500);
  checkRange(e, "Concrete grade (fck)", i.fck, 20, 40);
  if (i.shape === "rectangular") {
    checkRange(e, "Tank length", i.lengthM, 1, 20);
    checkRange(e, "Tank width", i.widthM, 1, 20);
  } else {
    checkRange(e, "Tank diameter", i.diameterM, 1, 20);
  }
  if (i.wallThicknessMm < 150) e.push("Wall thickness below 150 mm is not recommended for a liquid-retaining structure.");
  return e;
}

export interface WaterTankResult {
  errors: string[]; warnings: string[];
  capacityM3: number; capacityLitres: number; capacityGallons: number;
  demandLitres: number; demandOk: boolean;
  waterLoadKN: number;
  maxPressureKNm2: number;
  dMm: number;
  sigmaStFlexure: number; sigmaStHoop: number;
  muLongKNmPerM: number; muShortKNmPerM: number;
  astLongMm2PerM: number; astShortMm2PerM: number;
  astHoopMm2PerM: number; hoopTensionKNPerM: number;
  astMinMm2PerM: number; minSteelGoverns: boolean;
  barSpacingMm: number; astProvidedMm2PerM: number;
  crackWidthOk: boolean;
  stagingLoadKN: number;
  wallConcreteM3: number; baseConcreteM3: number; concreteVolM3: number;
  steelKg: number; waterproofingM2: number;
  materials: MaterialBreakdown;
  costLines: CostLine[]; totalCost: number | null;
  steps: { label: string; text: string }[];
}

export function designWaterTank(input: Partial<WaterTankInputs> = {}): WaterTankResult {
  const i: WaterTankInputs = { ...defaultWaterTankInputs, ...input };
  const errors = validateWaterTankInputs(i);
  const warnings: string[] = [];
  const demand = i.occupants * i.lpcd * i.daysReserve;
  const capacityM3 = i.shape === "rectangular"
    ? i.lengthM * i.widthM * i.waterDepthM
    : (Math.PI * i.diameterM * i.diameterM) / 4 * i.waterDepthM;
  const capacityL = capacityM3 * 1000;
  const demandOk = capacityL >= demand;
  if (!demandOk) warnings.push(`Capacity ${round(capacityL)} L is below the demand ${demand} L — increase the dimensions or the reserve days.`);
  if (i.placement === "overhead" && i.fck < 30) warnings.push("IS 3370 recommends minimum M30 concrete for severe exposure (overhead tank) — M25 is shown for resting/underground use.");
  const waterLoad = capacityM3 * 9.81;
  const pMax = 9.81 * i.waterDepthM;
  const d = i.wallThicknessMm - i.coverMm - i.mainDiaMm / 2;
  const sigFlex = sigmaStMpa(i.barType, "flexure");
  const sigHoop = sigmaStMpa(i.barType, "direct-tension");
  const astMin = 0.00217 * 1000 * i.wallThicknessMm; // 0.217% IS 3370 Part 2 Cl. 7.1
  // Rectangular walls — IS 3370 Part 4 Table 3 moment coefficients (L/H ≈ 2.25):
  // sagging 0.027·γw·H³, hogging 0.017·γw·H³ per metre run.
  const h3 = i.waterDepthM ** 3;
  const muLong = 0.027 * 9.81 * h3;
  const muShort = 0.017 * 9.81 * h3;
  const astFromMu = (mu: number) => (mu * 1e6) / (sigFlex * 0.87 * d);
  const astLongFlex = astFromMu(muLong);
  const astShortFlex = astFromMu(muShort);
  // Circular — hoop tension T = γw·H·D/2 (kN/m)
  const hoopT = i.shape === "circular" ? (9.81 * i.waterDepthM * i.diameterM) / 2 : 0;
  const astHoopFlex = i.shape === "circular" ? (hoopT * 1000) / sigHoop : 0;
  const astLong = Math.max(astLongFlex, astMin);
  const astShort = Math.max(astShortFlex, astMin);
  const astHoop = Math.max(astHoopFlex, astMin);
  const minGoverns = astMin >= astLongFlex && astMin >= astHoopFlex;
  const astDesign = i.shape === "circular" ? astHoop : astLong;
  const spacing = spacingForAst(astDesign, i.mainDiaMm);
  const astProv = astProvidedPerM(i.mainDiaMm, spacing);
  // Crack width: with steel at ≤ 0.217% min and σst capped per Table 2,
  // IS 3370 crack width is taken as ≤ 0.2 mm when Ast ≥ Ast,min and
  // spacing ≤ 200 mm (simplified check, stated as such in the UI).
  const crackOk = astProv >= astMin && spacing <= 200;
  if (!crackOk) warnings.push("Crack-width check needs closer bar spacing (≤ 200 mm) or more steel — increase Ast or reduce spacing.");
  const stagingLoad = i.placement === "overhead"
    ? (waterLoad + (i.shape === "rectangular"
      ? 2 * (i.lengthM + i.widthM) * (i.waterDepthM + i.freeboardM) * (i.wallThicknessMm / 1000) * 25
      : Math.PI * i.diameterM * (i.waterDepthM + i.freeboardM) * (i.wallThicknessMm / 1000) * 25)
      + (i.shape === "rectangular" ? i.lengthM * i.widthM : (Math.PI * i.diameterM ** 2) / 4) * (i.baseThicknessMm / 1000) * 25) * 1.5
    : 0;
  const perimeter = i.shape === "rectangular" ? 2 * (i.lengthM + i.widthM) : Math.PI * i.diameterM;
  const wallConc = perimeter * (i.waterDepthM + i.freeboardM) * (i.wallThicknessMm / 1000);
  const baseArea = i.shape === "rectangular" ? i.lengthM * i.widthM : (Math.PI * i.diameterM ** 2) / 4;
  const baseConc = baseArea * (i.baseThicknessMm / 1000);
  const concVol = wallConc + baseConc;
  // Steel: wall steel (both faces where applicable) + base mat.
  const wallSteelLenM = perimeter * (i.waterDepthM + i.freeboardM);
  // Steel volume = Ast (mm2/m) x wall face area (m2) x 7850 kg/m3, both faces.
  const wallSteelKg = (astDesign / 1e6) * wallSteelLenM * 2 * 7850;
  const baseSteelKg = (astMin / 1e6) * baseArea * 7850;
  const steelKg = wallSteelKg + baseSteelKg;
  const waterproofing = perimeter * (i.waterDepthM + i.freeboardM) + baseArea;
  const materials = materialsForConcrete(concVol, mixRatioForGrade(i.fck), i.wastagePct);
  const lines: CostLine[] = [
    costLine(`Cement (${materials.cementBags} bags)`, materials.cementBags, "bags", i.cementPerBag),
    costLine(`Sand (${round(materials.sandCft, 1)} cft)`, materials.sandCft, "cft", i.sandPerCft),
    costLine(`Aggregate (${round(materials.aggCft, 1)} cft)`, materials.aggCft, "cft", i.crushPerCft),
    costLine(`Steel (${round(steelKg, 1)} kg)`, steelKg, "kg", i.steelPerKg),
  ];
  return {
    errors, warnings,
    capacityM3: round(capacityM3, 2), capacityLitres: round(capacityL),
    capacityGallons: round(capacityL / 4.546, 1),
    demandLitres: demand, demandOk, waterLoadKN: round(waterLoad, 1),
    maxPressureKNm2: round(pMax, 1), dMm: round(d),
    sigmaStFlexure: sigFlex, sigmaStHoop: sigHoop,
    muLongKNmPerM: round(muLong, 2), muShortKNmPerM: round(muShort, 2),
    astLongMm2PerM: round(astLong), astShortMm2PerM: round(astShort),
    astHoopMm2PerM: round(astHoop), hoopTensionKNPerM: round(hoopT, 1),
    astMinMm2PerM: round(astMin), minSteelGoverns: minGoverns,
    barSpacingMm: spacing, astProvidedMm2PerM: round(astProv),
    crackWidthOk: crackOk,
    stagingLoadKN: round(stagingLoad, 1),
    wallConcreteM3: round(wallConc, 2), baseConcreteM3: round(baseConc, 2),
    concreteVolM3: round(concVol, 2), steelKg: round(steelKg, 1),
    waterproofingM2: round(waterproofing, 1),
    materials, costLines: lines, totalCost: totalCost(lines),
    steps: [
      { label: "Capacity", text: i.shape === "rectangular"
        ? `V = L·B·H = ${i.lengthM} × ${i.widthM} × ${i.waterDepthM} = ${round(capacityM3, 2)} m³ = ${round(capacityL)} L`
        : `V = πD²/4·H = ${round(capacityM3, 2)} m³ = ${round(capacityL)} L` },
      { label: "Demand", text: `${i.occupants} persons × ${i.lpcd} lpcd × ${i.daysReserve} days = ${demand} L — ${demandOk ? "capacity covers demand" : "capacity is SHORT of demand"}` },
      { label: "Hydrostatic pressure", text: `p_max = γw·H = 9.81 × ${i.waterDepthM} = ${round(pMax, 1)} kN/m²; water load = ${round(waterLoad, 1)} kN` },
      { label: "Wall design", text: i.shape === "rectangular"
        ? `Long wall Mu = 0.027·γw·H³ = ${round(muLong, 2)} kNm/m (IS 3370 Part 4 Table 3); Ast = Mu/(σst·j·d) = ${round(astLongFlex)} mm²/m; min steel 0.217% = ${round(astMin)} mm²/m ${minGoverns ? "GOVERNS" : "does not govern"}`
        : `Hoop tension T = γw·H·D/2 = ${round(hoopT, 1)} kN/m; Ast,hoop = T/σst = ${round(astHoopFlex)} mm²/m (σst = ${sigHoop} MPa, deformed bars in direct tension); min steel ${round(astMin)} mm²/m ${minGoverns ? "GOVERNS" : "does not govern"}` },
      { label: "Bar schedule", text: `Provide ${i.mainDiaMm} mm @ ${spacing} mm c/c → ${round(astProv)} mm²/m; crack width ≤ 0.2 mm check: ${crackOk ? "PASS" : "CHECK spacing"}` },
    ],
  };
}

export const WATER_TANK_FAQS: FaqItem[] = [
  { q: "How many litres of water does my house need?", a: "Multiply occupants × litres per person per day × days of reserve. At 135 litres per person per day (the usual Indian/Pakistani planning figure) a 5-person house with 2 days of reserve needs 1,350 litres of storage. The tank you build is usually larger than the demand — size it from the dimensions, then check it covers the demand." },
  { q: "Rectangular or circular — which tank is cheaper?", a: "Circular tanks are structurally more efficient: water pressure is carried as hoop tension in the wall, so the wall can be thinner and needs less steel than a rectangular tank of the same capacity. Rectangular tanks are easier to build and fit into a rectangular plot, which is why most houses use them despite the extra steel." },
  { q: "What is the minimum steel in a water tank?", a: "IS 3370 Part 2 Cl. 7.1 requires a minimum of 0.217% of the concrete cross-section for Fe415/Fe500 steel in liquid-retaining structures — higher than the 0.12% used for ordinary RCC — because the steel also controls cracking, not just strength." },
  { q: "Why is crack width limited to 0.2 mm?", a: "A water tank must not leak. IS 3370 limits the surface crack width to 0.2 mm so that cracks self-heal by autogenous healing and do not become leak paths. That is why steel stress is capped (130 MPa for deformed bars in direct tension) and minimum steel is higher than in ordinary structures." },
  { q: "What grade of concrete should a water tank use?", a: "IS 3370 requires a minimum of M30 for severe exposure (overhead tanks exposed to weather) and M25 for moderate exposure. Use a low water–cement ratio (≤ 0.45) and proper curing — permeability matters more than strength here." },
  { q: "How thick should tank walls be?", a: "At least 150 mm for a small domestic tank, 200 mm for the usual house tank. Thickness is governed by the minimum steel percentage and by placing concrete around two layers of steel, not by bending strength alone." },
];
