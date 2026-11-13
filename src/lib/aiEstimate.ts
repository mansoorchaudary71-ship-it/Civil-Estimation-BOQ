/**
 * aiEstimate — RULE-BASED local estimator for /ai (G9 §18).
 * The old AIAssistant called processAIEstimate -> gemini.ts, which reads
 * process.env.GEMINI_API_KEY — undefined in a Vite browser bundle, so
 * every send threw. This rebuild is a LOCAL rule-based estimator:
 * dimension extraction via regex + the local quantity/cost engines.
 * It is labelled rule-based (not AI) in the UI and uses NO key anywhere.
 * Do NOT "fix" it with import.meta.env.VITE_GEMINI_API_KEY — that would
 * ship the key in public JS.
 */
import { quickEstimate, type QuickCity, type QuickType } from "./quickEstimate";
import { materialTakeoff } from "./materialTakeoff";
import { getRates } from "./rates";

export interface ParsedDimensions {
  marla?: number;
  plotSqft?: number;
  floors?: number;
  rooms?: number;
  city?: string;
  type?: QuickType;
  raw: string;
}

const CITY_WORDS: Record<string, QuickCity> = {
  lahore: "lahore", karachi: "karachi", islamabad: "islamabad",
  faisalabad: "faisalabad", multan: "multan", rawalpindi: "rawalpindi",
};

export function parseEstimateText(text: string): ParsedDimensions {
  const lower = text.toLowerCase();
  const out: ParsedDimensions = { raw: text };
  const marla = lower.match(/(\d+(?:\.\d+)?)\s*marla/);
  if (marla) out.marla = Number(marla[1]);
  const sqft = lower.match(/(\d+(?:\.\d+)?)\s*(?:sq\.?\s*ft|sqft|square feet)/);
  if (sqft) out.plotSqft = Number(sqft[1]);
  const floors = lower.match(/(\d+)\s*(?:floor|storey|storeys|stories)/);
  if (floors) out.floors = Math.min(10, Number(floors[1]));
  const gPlus = lower.match(/g\s*\+\s*(\d+)/);
  if (gPlus) out.floors = Math.min(10, 1 + Number(gPlus[1]));
  const rooms = lower.match(/(\d+)\s*(?:bedroom|bed|room)/);
  if (rooms) out.rooms = Number(rooms[1]);
  for (const [word, city] of Object.entries(CITY_WORDS)) {
    if (lower.includes(word)) { out.city = city; break; }
  }
  if (lower.includes("luxury")) out.type = "luxury";
  else if (lower.includes("premium")) out.type = "premium";
  else if (lower.includes("grey") || lower.includes("gray")) out.type = "grey";
  else out.type = "standard";
  return out;
}

export interface LocalEstimate {
  summary: string;
  totalCost: number;
  minCost: number;
  maxCost: number;
  coveredSqft: number;
  materials: { cementBags: number; steelKg: number; bricks: number };
  method: string;
  disclaimer: string;
}

export function localEstimateFromText(text: string): LocalEstimate | { error: string } {
  const p = parseEstimateText(text);
  const plotSqft = p.plotSqft ?? (p.marla != null ? p.marla * 225 : null);
  if (plotSqft == null || plotSqft <= 0) {
    return { error: "I could not find a plot size. Try e.g. \"5 marla house in Lahore, G+1, standard finish\" — include the marla or sqft and the city." };
  }
  const floors = p.floors ?? 1;
  const city = (p.city as QuickCity) ?? "lahore";
  const type = p.type ?? "standard";
  const q = quickEstimate({ area: plotSqft, unit: "sqft", floors, type, city });
  const rates = getRates("PK").rates;
  const lines = materialTakeoff(
    { builtUpSqft: q.coveredSqft, floors, quality: type === "luxury" ? "luxury" : type === "premium" ? "premium" : "standard" },
    {
      cementPerBag: rates.cementPerBag, sandPerCft: rates.sandPerCft, crushPerCft: rates.crushPerCft,
      bricksPer1000: rates.bricksPer1000, steelPerKg: rates.steelPerKg, tilesPerBox: rates.tilesPerBox, paintPerL: rates.paintPerL,
    },
  );
  const cement = lines.filter((l) => l.material.startsWith("Cement")).reduce((s, l) => s + l.qty, 0);
  const steel = lines.find((l) => l.material.startsWith("Steel"))?.qty ?? 0;
  const bricks = lines.find((l) => l.material.startsWith("Bricks"))?.qty ?? 0;
  const marlaNote = p.marla != null ? `${p.marla} marla (society standard 225 sqft/marla)` : `${plotSqft.toLocaleString()} sqft plot`;
  return {
    summary: `Rule-based estimate for a ${marlaNote}, ${floors} floor(s), ${type} finish, ${city}: ${Math.round(q.coveredSqft).toLocaleString()} sqft covered area.`,
    totalCost: Math.round(q.totalCost),
    minCost: Math.round(q.minCost),
    maxCost: Math.round(q.maxCost),
    coveredSqft: Math.round(q.coveredSqft),
    materials: { cementBags: Math.round(cement), steelKg: Math.round(steel), bricks: Math.round(bricks) },
    method: "Rule-based local estimator: dimensions parsed from your text, quantities from fixed thumb-rule formulas, rates from the dated CEP rate table (Nov 2026). No AI model and no API key is used.",
    disclaimer: "This is a first-pass budget estimate, not a quotation. Confirm quantities from drawings and rates from your contractor before ordering.",
  };
}
