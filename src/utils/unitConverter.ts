import { Point } from './measurements';

export const CIVIL_CONSTANTS = {
  DRY_CONCRETE_FACTOR: 1.54,
  DRY_MORTAR_FACTOR: 1.33,
  STEEL_DENSITY_KG_M3: 7850,
  CEMENT_BAG_VOLUME_M3: 0.0347,
  CEMENT_BAG_VOLUME_CFT: 1.226,
  CEMENT_BAG_KG: 50,
  CEMENT_DENSITY_KG_M3: 1440,
  MARLA_TO_SQFT: 225,
  WATER_DENSITY_KG_L: 1,
  WATER_LITER_TO_GALLON: 0.264172,
  WATER_M3_TO_LITER: 1000,
  M3_TO_CFT: 35.3147,
  CFT_TO_M3: 0.0283168,
  IN_TO_MM: 25.4,
  MM_TO_M: 0.001,
  FT_TO_M: 0.3048,
  M_TO_FT: 3.28084,
  KG_TO_TON: 0.001,
  TON_TO_KG: 1000,
  SQ_MM_TO_SQ_M: 0.000001,
};

// Types for UnitConverter component
export type Category =
  | "Length"
  | "Area"
  | "Volume"
  | "Mass"
  | "Density"
  | "Force"
  | "Pressure & Stress"
  | "Torque & Moment"
  | "Velocity"
  | "Angle"
  | "Temperature"
  | "Energy & Work"
  | "Power"
  | "Volumetric Flow"
  | "Dynamic Viscosity";

export interface Unit {
  id: string;
  label: string;
  factor?: number; // baseValue = inputValue * factor
}

export const unitsData: Record<Category, Unit[]> = {
  Length: [
    { id: "m", label: "Meter (m)", factor: 1 },
    { id: "km", label: "Kilometer (km)", factor: 1000 },
    { id: "cm", label: "Centimeter (cm)", factor: 0.01 },
    { id: "mm", label: "Millimeter (mm)", factor: 0.001 },
    { id: "mi", label: "Mile (mi)", factor: 1609.344 },
    { id: "yd", label: "Yard (yd)", factor: 0.9144 },
    { id: "ft", label: "Foot (ft)", factor: 0.3048 },
    { id: "in", label: "Inch (in)", factor: 0.0254 },
  ],
  Area: [
    { id: "sm", label: "Square Meter (m²)", factor: 1 },
    { id: "smm", label: "Square Millimeter (mm²)", factor: 0.000001 },
    { id: "scm", label: "Square Centimeter (cm²)", factor: 0.0001 },
    { id: "ha", label: "Hectare (ha)", factor: 10000 },
    { id: "sin", label: "Square Inch (sq in)", factor: 0.00064516 },
    { id: "sft", label: "Square Foot (sq ft)", factor: 0.09290304 },
    { id: "syd", label: "Square Yard (sq yd)", factor: 0.83612736 },
    { id: "ac", label: "Acre (ac)", factor: 4046.8564224 },
  ],
  Volume: [
    { id: "cm", label: "Cubic Meter (m³)", factor: 1 },
    { id: "l", label: "Liter (L)", factor: 0.001 },
    { id: "us_gal", label: "US Gallon", factor: 0.00378541 },
    { id: "cf", label: "Cubic Foot (cu ft)", factor: 0.0283168 },
    { id: "cy", label: "Cubic Yard (cu yd)", factor: 0.764554857984 },
  ],
  Mass: [
    { id: "kg", label: "Kilogram (kg)", factor: 1 },
    { id: "g", label: "Gram (g)", factor: 0.001 },
    { id: "t", label: "Metric Ton (t)", factor: 1000 },
    { id: "lb", label: "Pound (lb)", factor: 0.45359237 },
    { id: "oz", label: "Ounce (oz)", factor: 0.028349523125 },
    { id: "us_t", label: "Short Ton (US, t)", factor: 907.18474 },
  ],
  Density: [
    { id: "kg_m3", label: "Kilogram per cubic meter (kg/m³)", factor: 1 },
    { id: "g_cm3", label: "Gram per cubic centimeter (g/cm³)", factor: 1000 },
    { id: "lb_ft3", label: "Pound per cubic foot (lb/ft³)", factor: 16.01846337396014 },
    { id: "lb_in3", label: "Pound per cubic inch (lb/in³)", factor: 27679.904710203105 },
    { id: "lb_yd3", label: "Pound per cubic yard (lb/yd³)", factor: 0.5932764 },
  ],
  Force: [
    { id: "n", label: "Newton (N)", factor: 1 },
    { id: "kn", label: "Kilonewton (kN)", factor: 1000 },
    { id: "mn", label: "Meganewton (MN)", factor: 1000000 },
    { id: "kgf", label: "Kilogram-force (kgf)", factor: 9.80665 },
    { id: "lbf", label: "Pound-force (lbf)", factor: 4.448221615 },
    { id: "kip", label: "Kip (kip)", factor: 4448.221615 },
  ],
  "Pressure & Stress": [
    { id: "pa", label: "Pascal (Pa)", factor: 1 },
    { id: "kpa", label: "Kilopascal (kPa)", factor: 1000 },
    { id: "mpa", label: "Megapascal (MPa)", factor: 1000000 },
    { id: "n_mm2", label: "Newton per sq millimeter (N/mm²)", factor: 1000000 },
    { id: "n_m2", label: "Newton per sq meter (N/m²)", factor: 1 },
    { id: "psi", label: "Pound per sq inch (psi)", factor: 6894.7572932 },
    { id: "psf", label: "Pound per sq foot (psf)", factor: 47.880258 },
    { id: "ksf", label: "Kip per sq foot (ksf)", factor: 4788.0258 },
    { id: "bar", label: "Bar", factor: 100000 },
    { id: "atm", label: "Atmosphere (atm)", factor: 101325 },
  ],
  "Torque & Moment": [
    { id: "nm", label: "Newton-meter (N·m)", factor: 1 },
    { id: "knm", label: "Kilonewton-meter (kN·m)", factor: 1000 },
    { id: "n_mm", label: "Newton-millimeter (N·mm)", factor: 0.001 },
    { id: "lbf_ft", label: "Pound-force foot (lbf·ft)", factor: 1.3558179483314 },
    { id: "lbf_in", label: "Pound-force inch (lbf·in)", factor: 0.1129848290276167 },
    { id: "kip_ft", label: "Kip-foot (kip·ft)", factor: 1355.8179483314 },
    { id: "kgf_m", label: "Kilogram-force meter (kgf·m)", factor: 9.80665 },
  ],
  Velocity: [
    { id: "m_s", label: "Meter per Second (m/s)", factor: 1 },
    { id: "km_h", label: "Kilometer per Hour (km/h)", factor: 0.2777777778 },
    { id: "ft_s", label: "Foot per Second (ft/s)", factor: 0.3048 },
    { id: "mph", label: "Mile per Hour (mph)", factor: 0.44704 },
  ],
  Angle: [
    { id: "deg", label: "Degree (°)", factor: 1 },
    { id: "rad", label: "Radian (rad)", factor: 180 / Math.PI },
    { id: "grad", label: "Gradian (grad)", factor: 0.9 },
  ],
  Temperature: [
    { id: "c", label: "Celsius (°C)" },
    { id: "f", label: "Fahrenheit (°F)" },
    { id: "k", label: "Kelvin (K)" },
  ],
  "Energy & Work": [
    { id: "j", label: "Joule (J)", factor: 1 },
    { id: "kj", label: "Kilojoule (kJ)", factor: 1000 },
    { id: "mj", label: "Megajoule (MJ)", factor: 1000000 },
    { id: "kwh", label: "Kilowatt-hour (kWh)", factor: 3600000 },
    { id: "btu", label: "British Thermal Unit (BTU)", factor: 1055.05585 },
    { id: "ft_lb", label: "Foot-pound (ft-lbf)", factor: 1.355817948 },
  ],
  Power: [
    { id: "w", label: "Watt (W)", factor: 1 },
    { id: "kw", label: "Kilowatt (kW)", factor: 1000 },
    { id: "mw", label: "Megawatt (MW)", factor: 1000000 },
    { id: "hp_m", label: "Horsepower (metric)", factor: 735.49875 },
    { id: "hp_i", label: "Horsepower (imperial)", factor: 745.699872 },
    { id: "btu_h", label: "BTU per hour (BTU/h)", factor: 0.29307107 },
  ],
  "Volumetric Flow": [
    { id: "cm_s", label: "Cubic meter per second (m³/s)", factor: 1 },
    { id: "cm_h", label: "Cubic meter per hour (m³/h)", factor: 0.0002777777778 },
    { id: "l_s", label: "Liter per second (L/s)", factor: 0.001 },
    { id: "gal_min", label: "Gallon per minute (US, GPM)", factor: 0.0000630901964 },
    { id: "cfm", label: "Cubic foot per minute (CFM)", factor: 0.0004719474432 },
  ],
  "Dynamic Viscosity": [
    { id: "pa_s", label: "Pascal-second (Pa·s)", factor: 1 },
    { id: "p", label: "Poise (P)", factor: 0.1 },
    { id: "cp", label: "Centipoise (cP)", factor: 0.001 },
    { id: "n_s_m2", label: "Newton-second per sq meter", factor: 1 },
  ],
};

export const convertValue = (valStr: string, fUnit: string, tUnit: string, cat: Category): string => {
  if (!valStr || valStr.trim() === "" || valStr === "-" || valStr === "." || valStr === "-.") {
    return "";
  }
  const val = parseFloat(valStr);
  if (isNaN(val)) {
    return "";
  }
  
  let result = 0;
  if (cat === "Temperature") {
    let celsius = val;
    if (fUnit === "f") celsius = ((val - 32) * 5) / 9;
    else if (fUnit === "k") celsius = val - 273.15;
    if (tUnit === "c") result = celsius;
    else if (tUnit === "f") result = (celsius * 9) / 5 + 32;
    else if (tUnit === "k") result = celsius + 273.15;
  } else {
    const uData = unitsData[cat];
    const fUnitDef = uData.find((u) => u.id === fUnit);
    const tUnitDef = uData.find((u) => u.id === tUnit);
    if (fUnitDef && tUnitDef && fUnitDef.factor !== undefined && tUnitDef.factor !== undefined && tUnitDef.factor !== 0) {
      const baseVal = val * fUnitDef.factor;
      result = baseVal / tUnitDef.factor;
    }
  }
  
  if (result === 0) return "0";
  if (Math.abs(result) < 0.000001 || Math.abs(result) > 10000000) {
    return result.toExponential(6).replace(/\.?0+e/, "e");
  }
  
  const fixedResult = parseFloat(result.toFixed(6));
  return fixedResult.toString();
};

export type GlobalUnit = 'm' | 'ft' | 'in' | 'cm' | 'mm' | 'yd';

const conversionRatesToMeters: Record<GlobalUnit, number> = {
  m: 1,
  ft: CIVIL_CONSTANTS.FT_TO_M,
  in: 0.0254,
  cm: 0.01,
  mm: CIVIL_CONSTANTS.MM_TO_M,
  yd: 0.9144
};

export function convertLength(value: number, fromUnit: string, toUnit: string): number {
  const from = (fromUnit as GlobalUnit) || 'm';
  const to = (toUnit as GlobalUnit) || 'm';
  if (from === to || !conversionRatesToMeters[from] || !conversionRatesToMeters[to]) return value;
  const valueInMeters = value * conversionRatesToMeters[from];
  return valueInMeters / conversionRatesToMeters[to];
}

export function convertArea(value: number, fromUnit: string, toUnit: string): number {
  const from = (fromUnit as GlobalUnit) || 'm';
  const to = (toUnit as GlobalUnit) || 'm';
  if (from === to || !conversionRatesToMeters[from] || !conversionRatesToMeters[to]) return value;
  const valueInSqMeters = value * Math.pow(conversionRatesToMeters[from], 2);
  return valueInSqMeters / Math.pow(conversionRatesToMeters[to], 2);
}

export function getAlternateUnit(unit: string): GlobalUnit | null {
  const u = unit.toLowerCase().trim() as GlobalUnit;
  switch (u) {
    case 'm': return 'ft';
    case 'ft': return 'm';
    case 'cm': return 'in';
    case 'in': return 'cm';
    case 'mm': return 'in';
    case 'yd': return 'm';
    default: return null;
  }
}

export function formatDualMeasurement(value: number, currentUnit: string, type: 'line' | 'area'): { primary: string, secondary: string | null } {
  const primaryStr = type === 'area' ? `${value.toFixed(2)} ${currentUnit}²` : `${value.toFixed(2)} ${currentUnit}`;
  
  const altUnit = getAlternateUnit(currentUnit);
  if (!altUnit) return { primary: primaryStr, secondary: null };

  if (type === 'line') {
    const altVal = convertLength(value, currentUnit, altUnit);
    return { primary: primaryStr, secondary: `${altVal.toFixed(2)} ${altUnit}` };
  } else {
    const altVal = convertArea(value, currentUnit, altUnit);
    return { primary: primaryStr, secondary: `${altVal.toFixed(2)} ${altUnit}²` };
  }
}

export function getDistance(p1: Point, p2: Point) {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

export function calculateLength(points: Point[], scalePxPerUnit: number) {
  if (points.length < 2) return 0;
  let len = 0;
  for (let i = 0; i < points.length - 1; i++) {
    len += getDistance(points[i], points[i + 1]);
  }
  return len / scalePxPerUnit;
}

export function calculateArea(points: Point[], scalePxPerUnit: number) {
  if (points.length < 3) return 0;
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    area += points[i].x * points[j].y;
    area -= points[j].x * points[i].y;
  }
  return Math.abs(area / 2) / (scalePxPerUnit * scalePxPerUnit);
}
