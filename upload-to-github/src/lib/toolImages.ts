/**
 * Tool-card cover images.
 *
 * Every tool gets a premium, brand-graded cover image that matches what it calculates
 * (bricks for the brick calculator, concrete for RCC tools, rebar for BBS, ...).
 *
 * The default covers are lightweight SVG material scenes in /public/tool-images/<key>.svg.
 *
 * HOW TO USE REAL PHOTOS INSTEAD
 *  1. Drop a photo (ideally 16:10, ~800x500, .webp or .jpg) into /public/tool-images/
 *  2. Either replace a scene file of the same name, or add an entry to PHOTO_OVERRIDES below, e.g.
 *       "brick-calculator": "tool-images/brick-calculator.webp"
 *     Overrides are keyed by tool id and win over everything else.
 */

export type ToolImageKey =
  | "bricks" | "concrete" | "rebar" | "blueprint" | "soil" | "aggregate" | "road"
  | "solar" | "water" | "stairs" | "tiles" | "steel" | "site" | "frame" | "wall"
  | "mep" | "calculator" | "dashboard" | "docs" | "window" | "formwork" | "earthwork";

/** Per-tool optional real photo (path relative to /public). Leave empty to use the scenes. */
export const PHOTO_OVERRIDES: Record<string, string> = {};

const BY_ID: Record<string, ToolImageKey> = {
  // Masonry, surfaces & finishes
  "brick-calculator": "bricks",
  "master-finishes": "tiles",
  "interiors-finishes": "tiles",
  "room-area-calculator": "tiles",
  "building-setback-calculator": "site",
  "far-fsi-calculator": "site",
  "staircase-design-reference": "stairs",
  "door-window-schedule": "window",
  "ventilation-checker": "window",

  // Quantity takeoff & costing
  "qs-workflow": "blueprint",
  "house": "site",
  "takeoff": "blueprint",
  "quick-estimation": "blueprint",
  "master-quantity": "blueprint",
  "material-takeoff": "blueprint",
  "measurement-sheet": "blueprint",
  "boq": "blueprint",
  "boq-templates": "blueprint",
  "area-space-calculator": "site",
  "rates": "calculator",
  "cost-summary": "calculator",
  "unit-converter": "calculator",
  "labour-calculator": "dashboard",
  "ai": "dashboard",
  "projects": "dashboard",
  "tracker": "dashboard",
  "volume-estimator": "water",
  "metal-weight": "steel",
  "cost-guide-pakistan": "docs",
  "blog": "docs",

  // Structural & concrete
  "universal-structural-geometry": "frame",
  "master-rcc": "frame",
  "calculators": "concrete",
  "bbs-generator": "rebar",
  "reinforcement": "rebar",
  "isolated-footing": "frame",
  "retaining-wall": "wall",
  "staircase-calculator": "stairs",
  "aggregate-tests": "aggregate",
  "formwork": "formwork",
  "beam-design": "frame",
  "column-design": "frame",
  "raft-foundation": "concrete",
  "water-tank-design": "water",
  "pile-foundation": "frame",
  "prestressed-concrete": "concrete",
  "is-codes-reference": "docs",
  "morth-irc-specs": "docs",
  "pakistan-building-codes": "docs",
  "uae-construction-standards": "docs",

  // Geotechnical & soil lab
  "geotechnical": "soil",
  "cbr-test": "soil",
  "direct-shear": "soil",
  "permeability-test": "soil",
  "aggregate-blending": "aggregate",

  // MEP, energy & landscaping
  "mep-calculator": "mep",
  "solar-water-heater": "solar",
  "solar-roof": "solar",
  "rainwater-harvesting": "water",

  // Infrastructure & highway
  "road-pavement": "road",
  "earthworks": "earthwork",
  "chainage": "earthwork",
  "gradient-calculator": "earthwork",
  "anti-termite": "soil",
  "master-sieve": "aggregate",
};

const BY_CATEGORY: Record<string, ToolImageKey> = {
  "Masonry, Surfaces & Finishes": "bricks",
  "Quantity Takeoff & Costing": "blueprint",
  "Structural & Concrete Geometry": "concrete",
  "Geotechnical & Soil Lab Suite": "soil",
  "MEP, Energy & Landscaping": "mep",
  "Infrastructure & Highway Engineering": "road",
};

export function getToolImage(mod: { id?: string; category?: string }): string {
  // The app uses clean URLs (BrowserRouter, e.g. /calculator/slug) and Vite's base is "./".
  // A relative "./tool-images/..." would 404 on any nested URL, so always resolve from the site root.
  const envBase: string = (import.meta as any).env?.BASE_URL ?? "/";
  const base = envBase.startsWith("/") ? envBase : "/";
  const override = mod.id ? PHOTO_OVERRIDES[mod.id] : undefined;
  if (override) return `${base}${override}`;
  const key: ToolImageKey = (mod.id && BY_ID[mod.id]) || BY_CATEGORY[mod.category || ""] || "concrete";
  return `${base}tool-images/${key}.svg`;
}

/** Short label for the badge on the image (category names are too long for a pill). */
const SHORT_CATEGORY: Record<string, string> = {
  "Masonry, Surfaces & Finishes": "Masonry",
  "Quantity Takeoff & Costing": "Estimating",
  "Structural & Concrete Geometry": "Structural",
  "Geotechnical & Soil Lab Suite": "Geotech",
  "MEP, Energy & Landscaping": "MEP & Energy",
  "Infrastructure & Highway Engineering": "Infrastructure",
};
export const getShortCategory = (category?: string) =>
  (category && SHORT_CATEGORY[category]) || (category ? category.split(/[,&]/)[0].trim() : "Tool");
