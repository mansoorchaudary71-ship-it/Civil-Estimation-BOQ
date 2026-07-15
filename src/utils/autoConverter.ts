export interface Conversion { targetUnit: string; multiplyBy: number; }
export const METRIC_TO_IMPERIAL: Record<string, Conversion> = {
  "m": { targetUnit: "ft", multiplyBy: 3.28084 },
  "mm": { targetUnit: "in", multiplyBy: 0.0393701 },
  "cm": { targetUnit: "in", multiplyBy: 0.393701 },
  "m²": { targetUnit: "sq.ft", multiplyBy: 10.7639 },
  "sq.m": { targetUnit: "sq.ft", multiplyBy: 10.7639 },
  "sqm": { targetUnit: "sq.ft", multiplyBy: 10.7639 },
  "m³": { targetUnit: "cu.ft", multiplyBy: 35.3147 },
  "cu.m": { targetUnit: "cu.ft", multiplyBy: 35.3147 },
  "cum": { targetUnit: "cu.ft", multiplyBy: 35.3147 },
  "kg": { targetUnit: "lb", multiplyBy: 2.20462 },
  "kg/m³": { targetUnit: "lb/ft³", multiplyBy: 0.062428 },
  "kN": { targetUnit: "kips", multiplyBy: 0.224809 },
  "MPa": { targetUnit: "psi", multiplyBy: 145.038 },
  "N/mm²": { targetUnit: "psi", multiplyBy: 145.038 },
  "nos": { targetUnit: "nos", multiplyBy: 1 }, 
  "bags": { targetUnit: "bags", multiplyBy: 1 },
  "liters": { targetUnit: "gal", multiplyBy: 0.264172 },
  "litres": { targetUnit: "gal", multiplyBy: 0.264172 }
};

export function getImperialConversion(unit: string | undefined): Conversion | null {
  if (!unit) return null;
  const lowerUnit = unit.toLowerCase().trim();
  for (const [key, value] of Object.entries(METRIC_TO_IMPERIAL)) {
    if (key.toLowerCase() === lowerUnit) return value;
  }
  return null;
}
