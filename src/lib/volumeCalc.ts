/**
 * Volume engine — pure functions, no React. Metric internally.
 * Rewritten as a clean switch: the old component's "Parabolic Cone"
 * branch opened a /* comment that swallowed the "Triangular Dumper"
 * header, so Triangular Dumper returned volume 0 and Parabolic Cone
 * ran the wrong surface-area code. Both are fixed here.
 *
 * Conversions: 1 m3 = 1,000 L = 35.3147 cu ft; 1 cu ft = 28.3168 L
 * = 7.48052 US gal = 6.22884 imp gal.
 */
export type VolumeShape =
  | "rect-prism" | "cube" | "cylinder" | "sphere" | "half-sphere"
  | "cone" | "frustum-cone" | "parabolic-cone" | "triangular-prism"
  | "trapezoidal-prism" | "hollow-cylinder" | "prism"
  | "rect-tank" | "commercial-tank";

export interface VolumeDims {
  lengthM: number;
  widthM: number;
  heightM: number;
  sideM: number;
  radiusM: number;
  topRadiusM: number;
  bottomRadiusM: number;
  baseM: number;
  topWidthM: number;
  bottomWidthM: number;
  depthM: number;
  baseAreaM2: number;
  basePerimeterM: number;
  outerDiameterM: number;
  innerDiameterM: number;
  densityKgM3: number;
  /** commercial tank */
  tankBase: "rect" | "cyl";
  slopedBase: boolean;
  slopedHeightM: number;
  /** freeboard as a depth (m) */
  freeboardM: number;
  deadStorageM: number;
  outletAreaM2: number;
  /** fill level for tanks, % */
  fillPct: number;
}

export const DEFAULT_VOLUME_DIMS: VolumeDims = {
  lengthM: 0,
  widthM: 0,
  heightM: 0,
  sideM: 0,
  radiusM: 0,
  topRadiusM: 0,
  bottomRadiusM: 0,
  baseM: 0,
  topWidthM: 0,
  bottomWidthM: 0,
  depthM: 0,
  baseAreaM2: 0,
  basePerimeterM: 0,
  outerDiameterM: 0,
  innerDiameterM: 0,
  densityKgM3: 1000,
  tankBase: "rect",
  slopedBase: false,
  slopedHeightM: 0,
  freeboardM: 0.2,
  deadStorageM: 0.15,
  outletAreaM2: 0,
  fillPct: 100,
};

export interface VolumeResult {
  volumeM3: number;
  surfaceAreaM2: number;
  lateralAreaM2: number;
  litres: number;
  cuFt: number;
  usGallons: number;
  impGallons: number;
  weightKg: number;
  weightLb: number;
  /** tanks only */
  grossVolumeM3: number | null;
  usableVolumeM3: number | null;
  usablePct: number | null;
  warnings: string[];
}

export const M3_TO_LITRES = 1000;
export const M3_TO_CUFT = 35.3147;
export const LITRE_TO_US_GAL = 1 / 3.78541;
export const LITRE_TO_IMP_GAL = 1 / 4.54609;

export function validateVolume(shape: VolumeShape, d: VolumeDims): string[] {
  const errors: string[] = [];
  const need = (v: number, name: string) => {
    if (!(v > 0)) errors.push(`${name} must be greater than 0.`);
  };
  switch (shape) {
    case "rect-prism": case "rect-tank":
      need(d.lengthM, "Length"); need(d.widthM, "Width"); need(d.heightM, "Height"); break;
    case "cube": need(d.sideM, "Side"); break;
    case "cylinder": case "sphere": case "half-sphere": case "cone": case "parabolic-cone":
      need(d.radiusM, "Radius");
      if (shape !== "sphere" && shape !== "half-sphere") need(d.heightM, "Height");
      break;
    case "frustum-cone":
      need(d.topRadiusM, "Top radius"); need(d.bottomRadiusM, "Bottom radius"); need(d.heightM, "Height"); break;
    case "triangular-prism":
      need(d.baseM, "Base"); need(d.heightM, "Height"); need(d.lengthM, "Length"); break;
    case "trapezoidal-prism":
      need(d.topWidthM, "Top width"); need(d.bottomWidthM, "Bottom width"); need(d.depthM, "Depth"); need(d.lengthM, "Length"); break;
    case "hollow-cylinder":
      need(d.outerDiameterM, "Outer diameter"); need(d.innerDiameterM, "Inner diameter"); need(d.lengthM, "Length");
      if (d.outerDiameterM <= d.innerDiameterM) errors.push("Outer diameter must be greater than inner diameter.");
      break;
    case "prism":
      need(d.baseAreaM2, "Base area"); need(d.basePerimeterM, "Base perimeter"); need(d.heightM, "Height"); break;
    case "commercial-tank":
      need(d.lengthM, "Length"); need(d.widthM, "Width"); need(d.heightM, "Height");
      if (d.freeboardM + d.deadStorageM >= d.heightM)
        errors.push("Freeboard + dead storage must be less than the total height.");
      break;
  }
  if (d.fillPct < 0 || d.fillPct > 100) errors.push("Fill level must be between 0% and 100%.");
  return errors;
}

function frustumVolume(h: number, a1: number, a2: number): number {
  return (h / 3) * (a1 + a2 + Math.sqrt(Math.max(0, a1 * a2)));
}

export function calcVolume(shape: VolumeShape, d: VolumeDims): VolumeResult {
  const warnings: string[] = [];
  let volumeM3 = 0;
  let surfaceAreaM2 = 0;
  let lateralAreaM2 = 0;
  let grossVolumeM3: number | null = null;
  let usableVolumeM3: number | null = null;

  const { lengthM: L, widthM: W, heightM: H, radiusM: r } = d;
  switch (shape) {
    case "rect-prism":
    case "rect-tank": {
      volumeM3 = L * W * H;
      surfaceAreaM2 = 2 * (L * W + L * H + W * H);
      lateralAreaM2 = 2 * H * (L + W);
      break;
    }
    case "cube": {
      volumeM3 = d.sideM ** 3;
      surfaceAreaM2 = 6 * d.sideM * d.sideM;
      lateralAreaM2 = 4 * d.sideM * d.sideM;
      break;
    }
    case "cylinder": {
      volumeM3 = Math.PI * r * r * H;
      lateralAreaM2 = 2 * Math.PI * r * H;
      surfaceAreaM2 = lateralAreaM2 + 2 * Math.PI * r * r;
      break;
    }
    case "sphere": {
      volumeM3 = (4 / 3) * Math.PI * r ** 3;
      surfaceAreaM2 = 4 * Math.PI * r * r;
      lateralAreaM2 = surfaceAreaM2;
      break;
    }
    case "half-sphere": {
      volumeM3 = (2 / 3) * Math.PI * r ** 3;
      surfaceAreaM2 = 3 * Math.PI * r * r; // curved + base
      lateralAreaM2 = 2 * Math.PI * r * r;
      break;
    }
    case "cone": {
      volumeM3 = (1 / 3) * Math.PI * r * r * H;
      const slant = Math.sqrt(r * r + H * H);
      lateralAreaM2 = Math.PI * r * slant;
      surfaceAreaM2 = lateralAreaM2 + Math.PI * r * r;
      break;
    }
    case "frustum-cone": {
      const R = d.bottomRadiusM;
      const rTop = d.topRadiusM;
      volumeM3 = (1 / 3) * Math.PI * H * (R * R + R * rTop + rTop * rTop);
      const slant = Math.sqrt((R - rTop) ** 2 + H * H);
      lateralAreaM2 = Math.PI * (R + rTop) * slant;
      surfaceAreaM2 = lateralAreaM2 + Math.PI * R * R + Math.PI * rTop * rTop;
      break;
    }
    case "parabolic-cone": {
      // Paraboloid: V = 1/2 pi r^2 h
      volumeM3 = 0.5 * Math.PI * r * r * H;
      const curved =
        (Math.PI * r / (6 * H * H)) * (Math.pow(r * r + 4 * H * H, 1.5) - Math.pow(r, 3));
      lateralAreaM2 = curved;
      surfaceAreaM2 = curved + Math.PI * r * r;
      break;
    }
    case "triangular-prism": {
      const b = d.baseM;
      const slant = Math.sqrt((b / 2) ** 2 + H * H);
      volumeM3 = 0.5 * b * H * L;
      surfaceAreaM2 = b * H + b * L + 2 * slant * L;
      lateralAreaM2 = b * L + 2 * slant * L;
      break;
    }
    case "trapezoidal-prism": {
      const tw = d.topWidthM;
      const bw = d.bottomWidthM;
      const dep = d.depthM;
      const slant = Math.sqrt(((tw - bw) / 2) ** 2 + dep * dep);
      volumeM3 = 0.5 * (tw + bw) * dep * L;
      surfaceAreaM2 = (tw + bw) * dep + L * tw + L * bw + 2 * L * slant;
      lateralAreaM2 = L * tw + L * bw + 2 * L * slant;
      break;
    }
    case "hollow-cylinder": {
      volumeM3 = (Math.PI / 4) * (d.outerDiameterM ** 2 - d.innerDiameterM ** 2) * L;
      lateralAreaM2 = Math.PI * d.outerDiameterM * L + Math.PI * d.innerDiameterM * L;
      surfaceAreaM2 =
        lateralAreaM2 + (Math.PI / 2) * (d.outerDiameterM ** 2 - d.innerDiameterM ** 2);
      break;
    }
    case "prism": {
      volumeM3 = d.baseAreaM2 * H;
      surfaceAreaM2 = 2 * d.baseAreaM2 + d.basePerimeterM * H;
      lateralAreaM2 = d.basePerimeterM * H;
      break;
    }
    case "commercial-tank": {
      const baseArea = d.tankBase === "rect" ? L * W : Math.PI * (L / 2) ** 2;
      const mainVol = baseArea * H;
      let slopedVol = 0;
      if (d.slopedBase) {
        const topArea = d.tankBase === "rect"
          ? Math.max(0, L - 2 * d.slopedHeightM) * Math.max(0, W - 2 * d.slopedHeightM)
          : Math.PI * Math.max(0, L / 2 - d.slopedHeightM) ** 2;
        slopedVol = frustumVolume(d.slopedHeightM, baseArea, topArea);
      }
      grossVolumeM3 = mainVol + slopedVol;
      const freeboardVol = baseArea * Math.max(0, d.freeboardM);
      const deadVol = d.slopedBase
        ? Math.max(0, d.outletAreaM2) * Math.max(0, d.deadStorageM)
        : baseArea * Math.max(0, d.deadStorageM);
      usableVolumeM3 = Math.max(0, grossVolumeM3 - freeboardVol - deadVol);
      volumeM3 = usableVolumeM3;
      // Surface area follows the tank base: a cylindrical tank (diameter L)
      // is 2πr² + 2πrH, not the rectangular 2(LW+LH+WH) the old code used
      // for both (L=4, W=3, H=5 → 94 m² reported vs 87.96 m² true).
      if (d.tankBase === "rect") {
        surfaceAreaM2 = 2 * (L * W + L * H + W * H);
        lateralAreaM2 = 2 * H * (L + W);
      } else {
        const r = L / 2;
        surfaceAreaM2 = 2 * Math.PI * r * r + 2 * Math.PI * r * H;
        lateralAreaM2 = 2 * Math.PI * r * H;
      }
      const usablePct = grossVolumeM3 > 0 ? (usableVolumeM3 / grossVolumeM3) * 100 : 0;
      if (usablePct < 75 || usablePct > 95)
        warnings.push(
          `Usable volume is ${usablePct.toFixed(0)}% of gross — normally 75–95%. Check freeboard and dead storage.`,
        );
      break;
    }
  }

  // Fill level applies to tank shapes (volume at that fill).
  if ((shape === "rect-tank" || shape === "commercial-tank") && d.fillPct < 100) {
    volumeM3 = volumeM3 * (d.fillPct / 100);
  }

  const litres = volumeM3 * M3_TO_LITRES;
  const weightKg = volumeM3 * Math.max(0, d.densityKgM3);
  return {
    volumeM3,
    surfaceAreaM2,
    lateralAreaM2,
    litres,
    cuFt: volumeM3 * M3_TO_CUFT,
    usGallons: litres * LITRE_TO_US_GAL,
    impGallons: litres * LITRE_TO_IMP_GAL,
    weightKg,
    weightLb: weightKg * 2.20462,
    grossVolumeM3,
    usableVolumeM3,
    usablePct:
      grossVolumeM3 != null && usableVolumeM3 != null && grossVolumeM3 > 0
        ? (usableVolumeM3 / grossVolumeM3) * 100
        : null,
    warnings,
  };
}

/** Horizontal cylinder volume at a fill level (circular segment). */
export function horizontalCylinderFillVolume(
  radiusM: number,
  lengthM: number,
  fillPct: number,
): number {
  const r = Math.max(0, radiusM);
  const h = (Math.max(0, Math.min(100, fillPct)) / 100) * 2 * r;
  if (h <= 0) return 0;
  if (h >= 2 * r) return Math.PI * r * r * lengthM;
  const segment =
    r * r * Math.acos((r - h) / r) - (r - h) * Math.sqrt(Math.max(0, 2 * r * h - h * h));
  return segment * Math.max(0, lengthM);
}

export const STANDARD_TANK_SIZES_L = [500, 750, 1000, 1500, 2000, 5000];

export function familyTankSize(
  persons: number,
  litresPerPersonPerDay: number,
  days: number,
): { requiredLitres: number; nextSizeL: number } {
  const requiredLitres = Math.max(0, persons) * Math.max(0, litresPerPersonPerDay) * Math.max(0, days);
  const nextSizeL =
    STANDARD_TANK_SIZES_L.find((s) => s >= requiredLitres) ?? STANDARD_TANK_SIZES_L[STANDARD_TANK_SIZES_L.length - 1];
  return { requiredLitres, nextSizeL };
}

export const DENSITY_PRESETS: { id: string; label: string; kgM3: number }[] = [
  { id: "water", label: "Water", kgM3: 1000 },
  { id: "concrete", label: "Concrete", kgM3: 2400 },
  { id: "steel", label: "Steel", kgM3: 7850 },
  { id: "sand", label: "Sand (dry)", kgM3: 1600 },
  { id: "soil", label: "Soil", kgM3: 1800 },
];
