/**
 * electricalLoad.ts — NEW scope for the MEP calculator (the tool was
 * called "MEP" but had no electrical load, cable or DB sizing at all).
 * Pure functions.
 *
 * Connected kW = sum(W x qty) / 1000
 * Demand kW    = sum(W x qty x diversity) / 1000
 * kVA = kW / pf (pf default 0.9)
 * I = P / (V x pf) single-phase, or P / (sqrt(3) x V x pf) three-phase
 * Design current Id = I x 1.25 (continuous-load factor)
 * Breaker = next standard size >= Id
 * Cable = smallest copper mm2 whose current-carrying capacity Iz
 * (IEC 60364-5-52, Method C, PVC) is >= breaker rating after ambient
 * derating, AND whose voltage drop is <= 3% (branch) / <= 5% (total).
 * Vd (1-phase) = 2 x I x L x (R cosφ + X sinφ) / 1000 (volts)
 * Vd (3-phase) = sqrt(3) x I x L x (R cosφ + X sinφ) / 1000 (volts)
 */
export interface ElectricalAppliance {
  name: string;
  watts: number;
  quantity: number;
  /** Diversity factor 0-1 (share of the load expected on at once). */
  diversity: number;
}

export const ELECTRICAL_STANDARD_BREAKERS_A = [6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250];

/** Copper cable, PVC, Method C (clipped direct) — indicative ampacity
 *  at 40 °C (the PK/IN reference temperature) and resistance/reactance
 *  per km (planning values from IEC 60364-5-52 tables; confirm with the
 *  cable maker's datasheet). Derating below is RELATIVE to 40 °C. */
export interface CableSizeRow { mm2: number; izA: number; rOhmPerKm: number; xOhmPerKm: number }
export const COPPER_CABLE_TABLE: CableSizeRow[] = [
  { mm2: 1.5, izA: 17, rOhmPerKm: 12.1, xOhmPerKm: 0.1 },
  { mm2: 2.5, izA: 24, rOhmPerKm: 7.41, xOhmPerKm: 0.1 },
  { mm2: 4, izA: 32, rOhmPerKm: 4.61, xOhmPerKm: 0.1 },
  { mm2: 6, izA: 41, rOhmPerKm: 3.08, xOhmPerKm: 0.08 },
  { mm2: 10, izA: 57, rOhmPerKm: 1.83, xOhmPerKm: 0.08 },
  { mm2: 16, izA: 76, rOhmPerKm: 1.15, xOhmPerKm: 0.08 },
  { mm2: 25, izA: 101, rOhmPerKm: 0.727, xOhmPerKm: 0.08 },
  { mm2: 35, izA: 125, rOhmPerKm: 0.524, xOhmPerKm: 0.08 },
  { mm2: 50, izA: 151, rOhmPerKm: 0.387, xOhmPerKm: 0.08 },
  { mm2: 70, izA: 192, rOhmPerKm: 0.268, xOhmPerKm: 0.08 },
  { mm2: 95, izA: 232, rOhmPerKm: 0.193, xOhmPerKm: 0.08 },
  { mm2: 120, izA: 269, rOhmPerKm: 0.153, xOhmPerKm: 0.08 },
];

/** Ambient-temperature derating RELATIVE to the 40 °C table rating
 *  (IEC 60364-5-52). At 40 °C the factor is 1.0, so a 6 mm² cable
 *  (Iz 41 A) passes a 40 A breaker — the spec §4.1 worked example. */
export function ambientDeratingFactor(ambientC: number): number {
  if (ambientC <= 40) return 1.0;
  if (ambientC <= 45) return 0.91;
  if (ambientC <= 50) return 0.82;
  if (ambientC <= 55) return 0.71;
  return 0.61;
}

export const DEFAULT_APPLIANCES: ElectricalAppliance[] = [
  { name: "LED lights", watts: 15, quantity: 12, diversity: 0.8 },
  { name: "Ceiling fans", watts: 75, quantity: 5, diversity: 0.8 },
  { name: "Split AC (1.5 ton)", watts: 1800, quantity: 2, diversity: 0.7 },
  { name: "Refrigerator", watts: 200, quantity: 1, diversity: 0.8 },
  { name: "Water pump (1 HP)", watts: 750, quantity: 1, diversity: 0.5 },
  { name: "Washing machine", watts: 500, quantity: 1, diversity: 0.5 },
  { name: "Electric geyser", watts: 2000, quantity: 1, diversity: 0.5 },
];

export interface ElectricalLoadInputs {
  appliances: ElectricalAppliance[];
  /** "single" 230 V or "three" 400 V. */
  phase?: "single" | "three";
  voltageV?: number;
  powerFactor?: number;
  /** Cable run length (one way), metres (default 20). */
  cableLengthM?: number;
  /** Ambient temperature, °C (default 40 PK/IN, 45 UAE). */
  ambientC?: number;
  /** Voltage-drop limit, % (default 3 for a branch circuit). */
  voltageDropLimitPct?: number;
}

export interface DbCircuitRow { circuit: string; loadW: number; demandW: number; breakerA: number; cableMm2: number | null }
export interface ElectricalLoadResults {
  connectedKw: number;
  demandKw: number;
  demandKva: number;
  currentA: number;
  designCurrentA: number;
  breakerA: number;
  cableMm2: number | null;
  cableIzA: number | null;
  voltageDropV: number;
  voltageDropPct: number;
  voltageDropOk: boolean;
  cableDecidedBy: string;
  dbSchedule: DbCircuitRow[];
  steps: string[];
}

export function validateElectricalInputs(inp: ElectricalLoadInputs): string[] {
  const errors: string[] = [];
  if (!inp.appliances || inp.appliances.length === 0)
    errors.push("Add at least one appliance or load.");
  for (const a of inp.appliances ?? []) {
    if (!isFinite(a.watts) || a.watts < 0) errors.push(`"${a.name}": watts cannot be negative.`);
    if (!isFinite(a.quantity) || a.quantity < 0 || a.quantity > 100) errors.push(`"${a.name}": quantity must be between 0 and 100.`);
    if (!isFinite(a.diversity) || a.diversity < 0 || a.diversity > 1) errors.push(`"${a.name}": diversity must be between 0 and 1.`);
  }
  const pf = inp.powerFactor ?? 0.9;
  if (!isFinite(pf) || pf <= 0 || pf > 1) errors.push("Power factor must be between 0 and 1.");
  const v = inp.voltageV ?? (inp.phase === "three" ? 400 : 230);
  if (!isFinite(v) || v <= 0) errors.push("Voltage must be greater than 0.");
  if (inp.cableLengthM != null && (!isFinite(inp.cableLengthM) || inp.cableLengthM <= 0 || inp.cableLengthM > 500))
    errors.push("Cable length must be between 1 m and 500 m.");
  return errors;
}

export function calcElectricalLoad(inp: ElectricalLoadInputs): ElectricalLoadResults {
  const errors = validateElectricalInputs(inp);
  if (errors.length > 0) throw new Error(errors.join(" "));
  const phase = inp.phase ?? "single";
  const voltage = inp.voltageV ?? (phase === "three" ? 400 : 230);
  const pf = inp.powerFactor ?? 0.9;
  const lengthM = inp.cableLengthM ?? 20;
  const ambientC = inp.ambientC ?? 40;
  const vdLimit = inp.voltageDropLimitPct ?? 3;

  const connectedW = inp.appliances.reduce((s, a) => s + a.watts * a.quantity, 0);
  const demandW = inp.appliances.reduce((s, a) => s + a.watts * a.quantity * a.diversity, 0);
  const connectedKw = connectedW / 1000;
  const demandKw = demandW / 1000;
  const demandKva = demandKw / pf;
  const currentA =
    phase === "three"
      ? (demandW / (Math.sqrt(3) * voltage * pf))
      : demandW / (voltage * pf);
  const designCurrent = currentA * 1.25;
  const breaker =
    ELECTRICAL_STANDARD_BREAKERS_A.find((b) => b >= designCurrent) ?? 250;

  const derating = ambientDeratingFactor(ambientC);
  const cosPhi = pf;
  const sinPhi = Math.sqrt(Math.max(0, 1 - pf * pf));
  // Smallest cable that passes BOTH ampacity (Ib <= In <= Iz after
  // derating) and voltage drop.
  let chosen: CableSizeRow | null = null;
  let chosenVdPct = 0;
  let chosenVdV = 0;
  let decidedBy = "";
  for (const row of COPPER_CABLE_TABLE) {
    const izDerated = row.izA * derating;
    if (izDerated < breaker) continue;
    const vdV =
      phase === "three"
        ? (Math.sqrt(3) * currentA * lengthM * (row.rOhmPerKm * cosPhi + row.xOhmPerKm * sinPhi)) / 1000
        : (2 * currentA * lengthM * (row.rOhmPerKm * cosPhi + row.xOhmPerKm * sinPhi)) / 1000;
    const vdPct = (vdV / voltage) * 100;
    if (vdPct <= vdLimit) {
      chosen = row;
      chosenVdV = vdV;
      chosenVdPct = vdPct;
      decidedBy = `Smallest copper cable passing ampacity (Iz ${row.izA} A x ${derating} derating = ${izDerated.toFixed(1)} A >= ${breaker} A breaker) and voltage drop (${vdPct.toFixed(2)}% <= ${vdLimit}%).`;
      break;
    }
    // Remember the first ampacity-passing size so the report can say
    // voltage drop forced a larger cable.
    if (!chosen) {
      chosenVdV = vdV;
      chosenVdPct = vdPct;
    }
  }
  if (!chosen) {
    // No size passed both: report the largest size and flag the failure.
    const largest = COPPER_CABLE_TABLE[COPPER_CABLE_TABLE.length - 1];
    const vdV =
      phase === "three"
        ? (Math.sqrt(3) * currentA * lengthM * (largest.rOhmPerKm * cosPhi + largest.xOhmPerKm * sinPhi)) / 1000
        : (2 * currentA * lengthM * (largest.rOhmPerKm * cosPhi + largest.xOhmPerKm * sinPhi)) / 1000;
    decidedBy = `No cable in the table passes both ampacity and the ${vdLimit}% voltage-drop limit at ${lengthM} m — split the load across circuits or shorten the run. Largest size (${largest.mm2} mm²) still drops ${(vdV / voltage * 100).toFixed(2)}%.`;
    return {
      connectedKw, demandKw, demandKva, currentA, designCurrentA: designCurrent,
      breakerA: breaker, cableMm2: null, cableIzA: null,
      voltageDropV: vdV, voltageDropPct: (vdV / voltage) * 100, voltageDropOk: false,
      cableDecidedBy: decidedBy,
      dbSchedule: buildDbSchedule(inp.appliances, voltage, pf, phase),
      steps: [`Connected load ${connectedKw.toFixed(2)} kW; demand load ${demandKw.toFixed(2)} kW; current ${currentA.toFixed(1)} A; design current ${designCurrent.toFixed(1)} A; breaker ${breaker} A — but no cable size passes. See note above.`],
    };
  }

  return {
    connectedKw,
    demandKw,
    demandKva,
    currentA,
    designCurrentA: designCurrent,
    breakerA: breaker,
    cableMm2: chosen.mm2,
    cableIzA: chosen.izA * derating,
    voltageDropV: chosenVdV,
    voltageDropPct: chosenVdPct,
    voltageDropOk: chosenVdPct <= vdLimit,
    cableDecidedBy: decidedBy,
    dbSchedule: buildDbSchedule(inp.appliances, voltage, pf, phase),
    steps: [
      `Connected load = sum(W x qty) = ${connectedKw.toFixed(2)} kW; demand load = sum(W x qty x diversity) = ${demandKw.toFixed(2)} kW; demand = ${demandKw.toFixed(2)} / pf ${pf} = ${demandKva.toFixed(2)} kVA`,
      `Current I = ${demandW.toFixed(0)} W / (${phase === "three" ? "√3 x " : ""}${voltage} V x ${pf}) = ${currentA.toFixed(1)} A; design current = ${currentA.toFixed(1)} x 1.25 = ${designCurrent.toFixed(1)} A -> ${breaker} A breaker`,
      `Cable: ${decidedBy}`,
      `Voltage drop at ${lengthM} m = ${chosenVdV.toFixed(2)} V = ${chosenVdPct.toFixed(2)}% (limit ${vdLimit}%)`,
    ],
  };
}

function buildDbSchedule(appliances: ElectricalAppliance[], voltage: number, pf: number, phase: "single" | "three"): DbCircuitRow[] {
  return appliances
    .filter((a) => a.quantity > 0 && a.watts > 0)
    .map((a) => {
      const loadW = a.watts * a.quantity;
      const demandW = loadW * a.diversity;
      const current =
        phase === "three"
          ? demandW / (Math.sqrt(3) * voltage * pf)
          : demandW / (voltage * pf);
      const design = current * 1.25;
      const breaker =
        ELECTRICAL_STANDARD_BREAKERS_A.find((b) => b >= design) ?? 250;
      const cable = COPPER_CABLE_TABLE.find((r) => r.izA >= breaker)?.mm2 ?? null;
      return { circuit: a.name, loadW, demandW, breakerA: breaker, cableMm2: cable };
    });
}
