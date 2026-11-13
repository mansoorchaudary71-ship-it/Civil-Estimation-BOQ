/**
 * Room area engine — pure functions, no React. Metric internally.
 *
 * Conversions: 1 m2 = 10.7639 sq ft; 1 sq yd = 9 sq ft;
 * 1 marla = 272.25 sq ft = 25.293 m2; 1 kanal = 20 marla = 5,445 sq ft.
 *
 * COMPLIANCE FLAG: minima below are NBC 2016 (Part 3) values as cited in
 * the audit spec. BIS replaced NBC 2016 with NBCS 2026 (SP 7:2026) on
 * 30 Apr 2026 and the new minima have NOT been verified against SP 7:2026
 * — the UI must show that warning and must not present these as NBCS 2026.
 */
export type RoomType = "bedroom" | "living" | "kitchen" | "bathroom" | "dining" | "study" | "bath-wc" | "wc";

export interface RoomMinima {
  minAreaM2: number;
  minWidthM: number;
  standard: string;
}

export const ROOM_MINIMA_NBC_2016: Record<RoomType, RoomMinima> = {
  bedroom: { minAreaM2: 9.5, minWidthM: 2.4, standard: "NBC 2016 Pt 3 — habitable room (first)" },
  living: { minAreaM2: 9.5, minWidthM: 2.4, standard: "NBC 2016 Pt 3 — habitable room" },
  dining: { minAreaM2: 7.5, minWidthM: 2.1, standard: "NBC 2016 Pt 3 — habitable room (second)" },
  study: { minAreaM2: 7.5, minWidthM: 2.1, standard: "NBC 2016 Pt 3 — habitable room (second)" },
  kitchen: { minAreaM2: 5.0, minWidthM: 1.8, standard: "NBC 2016 Pt 3 — kitchen" },
  bathroom: { minAreaM2: 2.8, minWidthM: 1.2, standard: "NBC 2016 Pt 3 — bathroom + WC" },
  "bath-wc": { minAreaM2: 2.8, minWidthM: 1.2, standard: "NBC 2016 Pt 3 — bathroom + WC" },
  wc: { minAreaM2: 1.1, minWidthM: 0.9, standard: "NBC 2016 Pt 3 — WC alone" },
};

export const COMPLIANCE_NOTE =
  "Minima shown are NBC 2016 (Part 3). BIS replaced NBC 2016 with NBCS 2026 (SP 7:2026) on 30 April 2026 — the NBCS 2026 minima have not been verified against SP 7:2026, so confirm the current code before relying on this check.";

export const M2_TO_SQFT = 10.7639;
export const SQFT_PER_MARLA = 272.25;
export const M2_PER_MARLA = 25.293;
export const SQFT_PER_KANAL = 5445;
export const M2_PER_KANAL = 505.857;

export interface AreaConversions {
  m2: number;
  sqft: number;
  sqyd: number;
  marla: number;
  kanal: number;
}

export function convertArea(m2: number): AreaConversions {
  const sqft = m2 * M2_TO_SQFT;
  return { m2, sqft, sqyd: sqft / 9, marla: sqft / SQFT_PER_MARLA, kanal: sqft / SQFT_PER_KANAL };
}

export interface RoomAreaInputs {
  roomType: RoomType;
  lengthM: number;
  widthM: number;
  wallThicknessM: number;
  ceilingHeightM: number | null;
  /** loading factor for super built-up, % of built-up area */
  loadingFactorPct: number;
}

export interface RoomAreaResults {
  carpetAreaM2: number;
  builtUpAreaM2: number;
  superBuiltUpAreaM2: number;
  volumeM3: number | null;
  carpet: AreaConversions;
  builtUp: AreaConversions;
  superBuiltUp: AreaConversions;
  minAreaM2: number;
  minWidthM: number;
  widthM: number;
  passes: boolean;
  failByAreaM2: number;
  failByWidthM: number;
  standard: string;
}

export function validateRoomArea(inp: RoomAreaInputs): string[] {
  const errors: string[] = [];
  if (!(inp.lengthM >= 0.5 && inp.lengthM <= 30))
    errors.push("Room length must be between 0.5 m and 30 m.");
  if (!(inp.widthM >= 0.5 && inp.widthM <= 30))
    errors.push("Room width must be between 0.5 m and 30 m.");
  if (!(inp.wallThicknessM >= 0.05 && inp.wallThicknessM <= 0.5))
    errors.push("Wall thickness must be between 0.05 m and 0.5 m.");
  if (inp.ceilingHeightM != null && !(inp.ceilingHeightM >= 2.4 && inp.ceilingHeightM <= 6))
    errors.push("Ceiling height must be between 2.4 m and 6 m when given.");
  return errors;
}

export function calcRoomArea(inp: RoomAreaInputs): RoomAreaResults {
  const carpetAreaM2 = Math.max(0, inp.lengthM) * Math.max(0, inp.widthM);
  const t = Math.max(0, inp.wallThicknessM);
  const builtUpAreaM2 = (Math.max(0, inp.lengthM) + 2 * t) * (Math.max(0, inp.widthM) + 2 * t);
  const superBuiltUpAreaM2 = builtUpAreaM2 * (1 + Math.max(0, inp.loadingFactorPct) / 100);
  const minima = ROOM_MINIMA_NBC_2016[inp.roomType];
  const widthM = Math.min(Math.max(0, inp.lengthM), Math.max(0, inp.widthM));
  const failByAreaM2 = Math.max(0, minima.minAreaM2 - carpetAreaM2);
  const failByWidthM = Math.max(0, minima.minWidthM - widthM);
  return {
    carpetAreaM2,
    builtUpAreaM2,
    superBuiltUpAreaM2,
    volumeM3: inp.ceilingHeightM != null ? carpetAreaM2 * inp.ceilingHeightM : null,
    carpet: convertArea(carpetAreaM2),
    builtUp: convertArea(builtUpAreaM2),
    superBuiltUp: convertArea(superBuiltUpAreaM2),
    minAreaM2: minima.minAreaM2,
    minWidthM: minima.minWidthM,
    widthM,
    passes: failByAreaM2 === 0 && failByWidthM === 0,
    failByAreaM2,
    failByWidthM,
    standard: minima.standard,
  };
}

/** Reverse mode: enter a super built-up area, recover carpet area. */
export function calcCarpetFromSuperBuiltUp(
  superBuiltUpM2: number,
  wallThicknessM: number,
  lengthM: number,
  widthM: number,
  loadingFactorPct: number,
): { builtUpAreaM2: number; carpetAreaM2: number } {
  const builtUpAreaM2 = Math.max(0, superBuiltUpM2) / (1 + Math.max(0, loadingFactorPct) / 100);
  const t = Math.max(0, wallThicknessM);
  // Built-up = (L+2t)(W+2t); carpet = L x W. Recover L,W proportionally:
  // keep the same L:W ratio as the given room, scale so (L+2t)(W+2t) = builtUp.
  const L = Math.max(0, lengthM);
  const W = Math.max(0, widthM);
  if (L <= 0 || W <= 0) return { builtUpAreaM2, carpetAreaM2: 0 };
  const ratio = L / W;
  // (k*L + 2t)(k*W + 2t) = builtUp → solve quadratic in k.
  const a = L * W;
  const b = 2 * t * (L + W);
  const c = 4 * t * t - builtUpAreaM2;
  const disc = b * b - 4 * a * c;
  if (disc < 0) return { builtUpAreaM2, carpetAreaM2: 0 };
  const k = (-b + Math.sqrt(disc)) / (2 * a);
  void ratio;
  return { builtUpAreaM2, carpetAreaM2: Math.max(0, k * L) * Math.max(0, k * W) };
}
