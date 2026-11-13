/**
 * Precast compound wall engine — pure functions, no React.
 * Metric internally. Dry concrete = wet x 1.54; 50 kg cement bag = 0.0347 m3.
 * Rates are INDICATIVE defaults (Nov 2026, unverified — both in-repo rate
 * sets disagree: rendered tool 1500/800 vs orphan file 800/400). The UI
 * must show them as editable indicative rates, never as verified prices.
 */
import { CEMENT_BAG_M3 } from "./brickCalc";

export type PrecastCurrency = "PKR" | "INR" | "AED" | "USD";
export type FootingType = "isolated" | "strip" | "pcc-bed";
export type PrecastLayout = "open" | "closed";

export interface PrecastRates {
  postPerNos: number | null;
  panelPerNos: number | null;
  /** concrete per m3 */
  concretePerM3: number | null;
  labourPerM: number | null;
  transportFlat: number | null;
}

export interface PrecastInputs {
  wallLengthM: number;
  wallHeightM: number;
  layout: PrecastLayout;
  /** length lost to gates / returns, m */
  gateDeductionM: number;
  /** post spacing centre-to-centre = panel width, m */
  panelWidthM: number;
  panelHeightM: number;
  panelThicknessMm: number;
  footingType: FootingType;
  footingLengthM: number;
  footingWidthM: number;
  footingDepthM: number;
  /** strip footing width (m) when footingType === "strip" */
  stripWidthM: number;
  /** cement : sand : aggregate parts, e.g. [1, 2, 4] */
  mix: [number, number, number];
  wastagePct: number;
  rates: PrecastRates;
}

export interface PrecastResults {
  effectiveLengthM: number;
  spans: number;
  posts: number;
  panelsPerSpan: number;
  panels: number;
  orderPanels: number;
  orderPosts: number;
  coveredLengthM: number;
  overrunM: number;
  footingWetEachM3: number;
  footingWetM3: number;
  footingDryM3: number;
  cementBags: number;
  sandM3: number;
  aggregateM3: number;
  panelConcreteM3: number;
  postCost: number | null;
  panelCost: number | null;
  footingCost: number | null;
  labourCost: number | null;
  transportCost: number | null;
  totalCost: number | null;
  costPerRunningM: number | null;
  costPerM2Wall: number | null;
  warnings: string[];
}

export function validatePrecast(inp: PrecastInputs): string[] {
  const errors: string[] = [];
  if (!(inp.wallLengthM > 0)) errors.push("Wall length must be greater than 0.");
  if (!(inp.wallHeightM > 0)) errors.push("Wall height must be greater than 0.");
  if (!(inp.panelWidthM > 0)) errors.push("Panel width must be greater than 0.");
  if (inp.panelWidthM > inp.wallLengthM)
    errors.push("Panel width cannot exceed the wall length.");
  if (!(inp.panelHeightM > 0)) errors.push("Panel height must be greater than 0.");
  if (inp.panelHeightM > inp.wallHeightM)
    errors.push("Panel height cannot exceed the wall height.");
  if (!(inp.footingLengthM > 0) || !(inp.footingWidthM > 0) || !(inp.footingDepthM > 0))
    errors.push("Footing length, width and depth must all be greater than 0.");
  if (inp.footingType === "strip" && !(inp.stripWidthM > 0))
    errors.push("Strip footing width must be greater than 0.");
  if (inp.gateDeductionM < 0 || inp.gateDeductionM >= inp.wallLengthM)
    errors.push("Gate deduction must be 0 or more and less than the wall length.");
  if (inp.wastagePct < 0 || inp.wastagePct > 50)
    errors.push("Wastage must be between 0% and 50%.");
  return errors;
}

export function calcPrecastWall(inp: PrecastInputs): PrecastResults {
  const warnings: string[] = [];
  const effectiveLengthM = Math.max(0, inp.wallLengthM - Math.max(0, inp.gateDeductionM));
  const spans = Math.ceil(effectiveLengthM / Math.max(0.01, inp.panelWidthM));
  // Open run: spans + 1 posts (start + end). Closed rectangle: spans posts.
  const posts = inp.layout === "closed" ? spans : spans + 1;
  const panelsPerSpan = Math.ceil(inp.wallHeightM / Math.max(0.01, inp.panelHeightM));
  const panels = spans * panelsPerSpan;
  const w = Math.max(0, inp.wastagePct) / 100;
  const orderPanels = Math.ceil(panels * (1 + w));
  const orderPosts = Math.ceil(posts * (1 + w));
  const coveredLengthM = spans * inp.panelWidthM;
  const overrunM = Math.max(0, coveredLengthM - effectiveLengthM);
  if (inp.wallHeightM % inp.panelHeightM !== 0 && inp.panelHeightM > 0)
    warnings.push(
      `Wall height is not a whole number of ${inp.panelHeightM} m panels — the top panel in each span is cut.`,
    );
  if (inp.wallHeightM > 3)
    warnings.push("Wall height above 3 m — check wind load and structural design. This tool gives quantities only.");
  if (overrunM > 0)
    warnings.push(`Panels cover ${coveredLengthM.toFixed(2)} m — ${overrunM.toFixed(2)} m more than the requested length.`);

  const footingWetEachM3 =
    Math.max(0, inp.footingLengthM) * Math.max(0, inp.footingWidthM) * Math.max(0, inp.footingDepthM);
  let footingWetM3: number;
  if (inp.footingType === "strip") {
    footingWetM3 = effectiveLengthM * Math.max(0, inp.stripWidthM) * Math.max(0, inp.footingDepthM);
  } else {
    // Isolated pad per post; PCC bed uses the same pad volume as a blinding
    // allowance and is labelled as such in the UI.
    footingWetM3 = posts * footingWetEachM3;
  }
  const footingDryM3 = footingWetM3 * 1.54;
  const [c, s, a] = inp.mix;
  const total = c + s + a || 1;
  const cementBags = Math.ceil(((footingDryM3 * c) / total) / CEMENT_BAG_M3);
  const sandM3 = (footingDryM3 * s) / total;
  const aggregateM3 = (footingDryM3 * a) / total;
  const panelConcreteM3 =
    panels * inp.panelWidthM * inp.panelHeightM * (Math.max(0, inp.panelThicknessMm) / 1000);

  const r = inp.rates;
  const postCost = r.postPerNos != null ? posts * r.postPerNos : null;
  const panelCost = r.panelPerNos != null ? orderPanels * r.panelPerNos : null;
  const footingCost = r.concretePerM3 != null ? footingWetM3 * r.concretePerM3 : null;
  const labourCost = r.labourPerM != null ? effectiveLengthM * r.labourPerM : null;
  const transportCost = r.transportFlat ?? null;
  const parts = [postCost, panelCost, footingCost, labourCost, transportCost].filter(
    (v): v is number => v != null,
  );
  const totalCost = parts.length > 0 ? parts.reduce((x, y) => x + y, 0) : null;
  const wallAreaM2 = effectiveLengthM * inp.wallHeightM;
  return {
    effectiveLengthM,
    spans,
    posts,
    panelsPerSpan,
    panels,
    orderPanels,
    orderPosts,
    coveredLengthM,
    overrunM,
    footingWetEachM3,
    footingWetM3,
    footingDryM3,
    cementBags,
    sandM3,
    aggregateM3,
    panelConcreteM3,
    postCost,
    panelCost,
    footingCost,
    labourCost,
    transportCost,
    totalCost,
    costPerRunningM: totalCost != null && effectiveLengthM > 0 ? totalCost / effectiveLengthM : null,
    costPerM2Wall: totalCost != null && wallAreaM2 > 0 ? totalCost / wallAreaM2 : null,
    warnings,
  };
}
