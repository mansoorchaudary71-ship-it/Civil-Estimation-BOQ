/**
 * plumbingFixture.ts — plumbing fixture units (WSFU), design flow,
 * pipe sizing, tank and pump. Pure functions.
 *
 * WSFU per fixture (Hunter's method, cold-water supply):
 *   WC flush tank 3, WC flush valve 10, basin 1, bath/shower 2,
 *   kitchen sink 2, washing machine 3, dishwasher 2.
 * Design flow for small systems uses the approximation
 *   Q (L/s) = 0.25 x sqrt(total WSFU)
 * stated as an approximation — for large systems use the full
 * Hunter's curve table. Pipe sizing from velocity <= 2 m/s:
 *   D = sqrt(4Q / (pi x v)); rounded UP to a standard size.
 * Pump power: P(kW) = rho x g x Q x H / (eta x 1000), eta default 0.6.
 * Head = static head + friction head + 10% allowance.
 */
export type PlumbingFixtureKind =
  | "wcTank"
  | "wcValve"
  | "basin"
  | "bathShower"
  | "kitchenSink"
  | "washingMachine"
  | "dishwasher";

export const PLUMBING_FIXTURE_WSFU: Record<PlumbingFixtureKind, { label: string; wsfu: number }> = {
  wcTank: { label: "WC — flush tank", wsfu: 3 },
  wcValve: { label: "WC — flush valve", wsfu: 10 },
  basin: { label: "Wash basin", wsfu: 1 },
  bathShower: { label: "Bath / shower", wsfu: 2 },
  kitchenSink: { label: "Kitchen sink", wsfu: 2 },
  washingMachine: { label: "Washing machine", wsfu: 3 },
  dishwasher: { label: "Dishwasher", wsfu: 2 },
};

export const STANDARD_PIPE_SIZES_MM = [15, 20, 25, 32, 40, 50, 65, 80, 100];

export interface PlumbingFixtureCount { kind: PlumbingFixtureKind; count: number }

export interface PlumbingInputs {
  fixtures: PlumbingFixtureCount[];
  /** Design velocity limit, m/s (default 2). */
  maxVelocityMs?: number;
  /** Overhead tank size, litres (default 3,785 L = 1,000 gallons, PK standard). */
  tankLitres?: number;
  /** Static head (tank to highest fixture), m (default 10). */
  staticHeadM?: number;
  /** Friction head loss, m (default 5). */
  frictionHeadM?: number;
  /** Pump efficiency 0-1 (default 0.6). */
  pumpEfficiency?: number;
}

export interface PlumbingFixtureLine { label: string; count: number; wsfuEach: number; wsfuTotal: number }

export interface PlumbingResults {
  lines: PlumbingFixtureLine[];
  totalWsfu: number;
  designFlowLs: number;
  designFlowM3PerH: number;
  mainDiameterMm: number;
  mainDiameterInch: string;
  branchDiameterMm: number;
  tankLitres: number;
  tankGallons: number;
  pumpHeadM: number;
  pumpKw: number;
  pumpHp: number;
  steps: string[];
}

export function validatePlumbingInputs(inp: PlumbingInputs): string[] {
  const errors: string[] = [];
  if (!inp.fixtures || inp.fixtures.length === 0)
    errors.push("Add at least one fixture.");
  for (const f of inp.fixtures ?? []) {
    if (!isFinite(f.count) || f.count < 0 || f.count > 100)
      errors.push(`"${PLUMBING_FIXTURE_WSFU[f.kind]?.label ?? f.kind}": count must be between 0 and 100.`);
  }
  if (inp.maxVelocityMs != null && (!isFinite(inp.maxVelocityMs) || inp.maxVelocityMs <= 0 || inp.maxVelocityMs > 3))
    errors.push("Design velocity must be between 0 and 3 m/s.");
  if (inp.pumpEfficiency != null && (!isFinite(inp.pumpEfficiency) || inp.pumpEfficiency <= 0 || inp.pumpEfficiency > 1))
    errors.push("Pump efficiency must be between 0 and 1.");
  return errors;
}

export function pipeSizeForFlow(flowLs: number, maxVelocityMs = 2): number {
  const qM3s = flowLs / 1000;
  const dM = Math.sqrt((4 * qM3s) / (Math.PI * maxVelocityMs));
  const dMm = dM * 1000;
  return STANDARD_PIPE_SIZES_MM.find((s) => s >= dMm) ?? STANDARD_PIPE_SIZES_MM[STANDARD_PIPE_SIZES_MM.length - 1];
}

export function calcPlumbing(inp: PlumbingInputs): PlumbingResults {
  const errors = validatePlumbingInputs(inp);
  if (errors.length > 0) throw new Error(errors.join(" "));
  const maxV = inp.maxVelocityMs ?? 2;
  const lines: PlumbingFixtureLine[] = inp.fixtures
    .filter((f) => f.count > 0)
    .map((f) => ({
      label: PLUMBING_FIXTURE_WSFU[f.kind].label,
      count: f.count,
      wsfuEach: PLUMBING_FIXTURE_WSFU[f.kind].wsfu,
      wsfuTotal: f.count * PLUMBING_FIXTURE_WSFU[f.kind].wsfu,
    }));
  const totalWsfu = lines.reduce((s, l) => s + l.wsfuTotal, 0);
  if (totalWsfu <= 0) throw new Error("Total fixture units must be greater than 0 — add at least one fixture.");
  // Hunter's-curve approximation for small systems (stated as such).
  const designFlowLs = 0.25 * Math.sqrt(totalWsfu);
  const mainMm = pipeSizeForFlow(designFlowLs, maxV);
  // Largest single-fixture branch: a WC flush valve (10 WSFU) governs
  // the branch in most houses; otherwise the biggest fixture group.
  const maxFixtureWsfu = Math.max(...lines.map((l) => l.wsfuEach));
  const branchFlowLs = 0.25 * Math.sqrt(maxFixtureWsfu);
  const branchMm = pipeSizeForFlow(branchFlowLs, maxV);
  const tankLitres = inp.tankLitres ?? 3785;
  const staticHead = inp.staticHeadM ?? 10;
  const frictionHead = inp.frictionHeadM ?? 5;
  const pumpHead = (staticHead + frictionHead) * 1.1;
  const eta = inp.pumpEfficiency ?? 0.6;
  const pumpKw = (1000 * 9.81 * (designFlowLs / 1000) * pumpHead) / (eta * 1000);
  return {
    lines,
    totalWsfu,
    designFlowLs,
    designFlowM3PerH: designFlowLs * 3.6,
    mainDiameterMm: mainMm,
    mainDiameterInch: (mainMm / 25.4).toFixed(2),
    branchDiameterMm: branchMm,
    tankLitres,
    tankGallons: tankLitres / 3.785,
    pumpHeadM: pumpHead,
    pumpKw,
    pumpHp: pumpKw * 1.341,
    steps: [
      `Total fixture units = ${lines.map((l) => `${l.count} x ${l.wsfuEach}`).join(" + ")} = ${totalWsfu} WSFU`,
      `Design flow (Hunter's-curve approximation for small systems, Q = 0.25 x sqrt(WSFU)) = 0.25 x sqrt(${totalWsfu}) = ${designFlowLs.toFixed(2)} L/s (${(designFlowLs * 3.6).toFixed(2)} m³/h)`,
      `Cold-water main: D = sqrt(4Q / (pi x ${maxV} m/s)) -> ${mainMm} mm (${(mainMm / 25.4).toFixed(2)} inch) standard size; branch (largest fixture) -> ${branchMm} mm`,
      `Pump head = (${staticHead} m static + ${frictionHead} m friction) x 1.1 = ${pumpHead.toFixed(1)} m; pump power = rho x g x Q x H / eta = ${pumpKw.toFixed(2)} kW (${(pumpKw * 1.341).toFixed(2)} HP) at ${(eta * 100).toFixed(0)}% efficiency`,
    ],
  };
}
