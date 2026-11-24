/**
 * toolRoutes.ts — the SINGLE source of truth for URL <-> tool mapping.
 *
 * ROOT CAUSE OF THE "TOOLS REDIRECT TO HOME" BUG (fixed 2026-11-12):
 * ------------------------------------------------------------------
 * The app is state-driven: App.tsx renders a tool from an internal
 * `activeModule` id. The old mapping (`idFromPath`) took ONLY the first
 * URL segment as the tool id. But the site's own sitemap, SEO pages and
 * the (dead) routes.jsx advertised tools under `/calculators/<group>/<slug>`
 * — e.g. /calculators/concrete/bbs-generator. The first segment there is
 * "calculators", which matches no tool, so the app silently fell back to
 * "home". Every deep link, shared link, Google result and sitemap URL
 * therefore opened the home page, while in-app card clicks worked because
 * they navigate to the short form `/<tool-id>`.
 *
 * This module fixes that permanently:
 *  - resolvePath() understands ALL URL forms the site ever published:
 *      /<tool-id>                     (canonical short form, used in-app)
 *      /calculators/<group>/<slug>    (SEO form, from sitemap / routes.jsx)
 *      /calculators/<group>           (category landing -> Dashboard filtered)
 *      /<legacy-slug>-calculator      (short form, public/sitemap-tools.xml)
 *      /category/<slug>               (hub form, public/sitemap-categories.xml)
 *      /<country>/                    (pk/in/ae/uk portals -> Dashboard)
 *      /tools/<slug>                  (legacy form -> canonical tool)
 *      /estimate/<n>-<unit>-house-construction-cost-<city>
 *                                      (pSEO deep link -> house; the page
 *                                      itself parses size/unit/city)
 *      /brick-calculator/<variant>    (programmatic brick pages; the page
 *                                      itself reads the variant from the path)
 *      /<static-page>                 (about, pricing, blog, standards, ...)
 *  - Unknown paths resolve to { kind: "not-found" } so App renders the
 *    in-app 404 page instead of silently showing home.
 *  - getBasename() detects the GitHub Pages project-page subpath at runtime
 *    (the repo name, /Civil-Estimation-BOQ) so BrowserRouter works both on
 *    the custom domain (root) and on a project page (subpath) without a
 *    rebuild. Only the repo name is ever treated as a subpath — any other
 *    first segment is part of the route, so typos 404 instead of rendering
 *    home.
 *
 * RULE: any new tool must be added to TOOL_IDS (and, for an SEO slug, to
 * SEO_SLUG_TO_ID) and given a renderModule case in App.tsx. The route
 * resolver test (src/lib/__tests__/toolRoutes.test.ts) fails the build
 * if a Dashboard card id has no registry entry, or vice versa.
 */

/** Every tool/module id the app can render (Dashboard cards + renderModule cases). */
export const TOOL_IDS: readonly string[] = [
  "aggregate-blending",
  "aggregate-tests",
  "ai",
  "anti-termite",
  "area-space-calculator",
  "bbs-generator",
  "beam-design",
  "boq",
  "boq-templates",
  "brick-calculator",
  "building-setback-calculator",
  "calculators",
  "cbr-test",
  "chainage",
  "column-design",
  "cost-guide-pakistan",
  "cost-summary",
  "direct-shear",
  "door-window-schedule",
  "earthworks",
  "far-fsi-calculator",
  "formwork",
  "geotechnical",
  "gradient-calculator",
  "house",
  "infra-mep-engine",
  "interiors-finishes",
  "is-codes-reference",
  "isolated-footing",
  "labour-calculator",
  "marla-converter",
  "master-finishes",
  "master-quantity",
  "master-rcc",
  "master-sieve",
  "material-takeoff",
  "measurement-sheet",
  "mep-calculator",
  "metal-weight",
  "mix-design",
  "morth-irc-specs",
  "pakistan-building-codes",
  "pakistan-cost-calculator",
  "pavement-mix",
  "permeability-test",
  "pile-foundation",
  "plywood-estimator",
  "precast-wall",
  "prestressed-concrete",
  "projects",
  "qs-workflow",
  "quick-estimation",
  "raft-foundation",
  "rainwater-harvesting",
  "rates",
  "reinforcement",
  "retaining-wall",
  "road-pavement",
  "roof-calculator",
  "room-area-calculator",
  "soil-mechanics-lab",
  "solar-roof",
  "solar-water-heater",
  "staircase-calculator",
  "staircase-design-reference",
  "takeoff",
  "topsoil-estimator",
  "tracker",
  "uae-construction-standards",
  "unit-converter",
  "universal-structural-geometry",
  "ventilation-checker",
  "volume-estimator",
  "wastewater-calculator",
  "water-tank-design",
];

/** Non-tool pages reachable by URL. */
export const STATIC_IDS: readonly string[] = [
  "home",
  "my-estimates",
  "about",
  "careers",
  "contact",
  "blog",
  "pricing",
  "privacy",
  "terms",
  "cookies",
  "standards",
  "team",
  "join-project",
];

/**
 * SEO slug -> tool id, from the old routes.jsx table (which was dead code:
 * imported nowhere). These are the /calculators/<group>/<slug> URLs in the
 * sitemap and in Google's index. They must keep working forever.
 */
export const SEO_SLUG_TO_ID: Readonly<Record<string, string>> = {
  // quantity-estimation
  "guided-qs-workflow-tool": "qs-workflow",
  "quick-rough-estimator": "quick-estimation",
  "master-quantity-estimator": "master-quantity",
  "area-plot-converter-marla-kanal": "marla-converter",
  "house-construction-cost-calculator": "pakistan-cost-calculator",
  "house-construction-estimator": "house",
  "material-takeoff-generator": "material-takeoff",
  "cost-summary-generator": "cost-summary",
  "measurement-sheet-calculator": "measurement-sheet",
  "boq-generator": "boq",
  "plan-measure-tool": "takeoff",
  "live-rates-calculator": "rates",
  "interiors-finishes-estimator": "interiors-finishes",
  "area-space-calculator": "area-space-calculator",
  "volume-tank-capacity-calculator": "volume-estimator",
  "metal-weight-calculator": "metal-weight",
  "unit-converter-tool": "unit-converter",
  "ai-assistant-tool": "ai",
  "project-manager-tool": "projects",
  "site-progress-tracker-tool": "tracker",
  "labour-workforce-estimator": "labour-calculator",
  // concrete
  "master-rcc-estimator": "master-rcc",
  "construction-material-calculator": "calculators",
  "bbs-generator": "bbs-generator",
  "reinforcement-detailing-visualizer-tool": "reinforcement",
  "isolated-footing-calculator": "isolated-footing",
  "retaining-wall-estimator": "retaining-wall",
  "staircase-calculator": "staircase-calculator",
  "aggregate-tests-calculator": "aggregate-tests",
  "formwork-scaffold-estimator": "formwork",
  "brick-calculator": "brick-calculator",
  "concrete-mix-design-calculator": "mix-design",
  "plywood-formwork-estimator": "plywood-estimator",
  "precast-compound-wall-estimator": "precast-wall",
  "roof-pitch-calculator": "roof-calculator",
  "universal-structural-geometry-calculator": "universal-structural-geometry",
  // road-pavement
  "road-pavement-estimator": "road-pavement",
  "earthworks-excavation-calculator": "earthworks",
  "chainage-volume-calculator": "chainage",
  "gradient-slope-calculator": "gradient-calculator",
  "anti-termite-calculator": "anti-termite",
  "pavement-mix-gradation-calculator": "pavement-mix",
  "topsoil-landscaping-estimator": "topsoil-estimator",
  // geotechnical
  "sieve-analysis-grading-calculator": "master-sieve",
  "geotechnical-soil-tests-calculator": "geotechnical",
  "cbr-test-calculator": "cbr-test",
  "aggregate-blending-calculator": "aggregate-blending",
  "direct-shear-test-calculator": "direct-shear",
  "permeability-calculator": "permeability-test",
  "soil-mechanics-lab-calculator": "soil-mechanics-lab",
  // mep
  "energy-mep-calculator": "mep-calculator",
  "solar-roof-calculator": "solar-roof",
  "rainwater-harvesting-calculator": "rainwater-harvesting",
  "master-infrastructure-mep-engine": "infra-mep-engine",
  "solar-water-heater-calculator": "solar-water-heater",
  "wastewater-bod-cod-calculator": "wastewater-calculator",
  // structural-design
  "beam-design-tool": "beam-design",
  "column-design-tool": "column-design",
  "raft-foundation-calculator": "raft-foundation",
  "water-tank-design-calculator": "water-tank-design",
  "pile-foundation-calculator": "pile-foundation",
  "prestressed-concrete-estimator": "prestressed-concrete",
  // architectural
  "room-area-calculator": "room-area-calculator",
  "building-setback-calculator": "building-setback-calculator",
  "far-fsi-calculator": "far-fsi-calculator",
  "door-window-schedule-generator": "door-window-schedule",
  "ventilation-lighting-checker-tool": "ventilation-checker",
  "complete-finishes-workspace": "master-finishes",
  "staircase-design-reference": "staircase-design-reference",
};

/**
 * No SEO slug, by design (Round 3 infra):
 * - "boq-templates": the same BOQGenerator as "boq" — the existing
 *   "boq-generator" slug covers both; a second slug would split the
 *   canonical between two URLs for one tool.
 * - "cost-guide-pakistan": an alias of "pakistan-cost-calculator"
 *   (resolved to it in resolvePath below; the page canonicalises
 *   onto /pakistan-cost-calculator). A slug would be a third URL for
 *   the same page.
 * - "is-codes-reference", "morth-irc-specs", "pakistan-building-codes",
 *   "uae-construction-standards": reference pages served under the
 *   /calculators/standards hub, not calculators in a tool group.
 */

/** /calculators/<group> -> the Dashboard category label it filters to. */
export const GROUP_TO_CATEGORY: Readonly<Record<string, string>> = {
  "quantity-estimation": "Quantity Takeoff & Costing",
  concrete: "Structural & Concrete Geometry",
  "road-pavement": "Infrastructure & Highway Engineering",
  geotechnical: "Geotechnical & Soil Lab Suite",
  mep: "MEP, Energy & Landscaping",
  "structural-design": "Structural & Concrete Geometry",
  architectural: "Masonry, Surfaces & Finishes",
};

/**
 * Legacy short slugs from public/sitemap-tools.xml (/<slug>-calculator).
 * These URLs are indexed and shared; they must keep working forever.
 * Ambiguity calls (documented): "area-calculator" is the generic Area &
 * Space tool; "property-area-calculator" is the plot-area (Marla/Kanal)
 * converter, the PK-market meaning of "property area".
 */
export const LEGACY_SLUG_TO_ID: Readonly<Record<string, string>> = {
  "rcc-slab-calculator": "master-rcc",
  "column-concrete-estimator": "column-design",
  "beam-calculator": "beam-design",
  "house-construction-cost-calculator": "pakistan-cost-calculator",
  "professional-boq-generator": "boq",
  "plan-measure-takeoff": "takeoff",
  "master-quantity-estimator": "master-quantity",
  "road-pavement-estimator": "road-pavement",
  "earthworks-excavation-calculator": "earthworks",
  "chainage-volume-calculator": "chainage",
  "gradient-slope-calculator": "gradient-calculator",
  "retaining-wall-estimator": "retaining-wall",
  "geotechnical-soil-tests-calculator": "geotechnical",
  "cbr-test-calculator": "cbr-test",
  "master-sieve-analysis-calculator": "master-sieve",
  "aggregate-blending-calculator": "aggregate-blending",
  "direct-shear-test-calculator": "direct-shear",
  "permeability-calculator": "permeability-test",
  "aggregate-tests-calculator": "aggregate-tests",
  "construction-material-calculator": "calculators",
  // Mix design tool (G2): both sitemap URLs open the real tool.
  "concrete-mix-design-calculator": "mix-design",
  "mix-design-calculator": "mix-design",
  "formwork-scaffold-calculator": "formwork",
  "metal-weight-calculator": "metal-weight",
  "bbs-generator-calculator": "bbs-generator",
  "reinforcement-detailing-visualizer": "reinforcement",
  "isolated-footing-calculator": "isolated-footing",
  "project-manager-calculator": "projects",
  "site-progress-tracker": "tracker",
  "labour-workforce-calculator": "labour-calculator",
  "energy-mep-calculators": "mep-calculator",
  "solar-roof-calculator": "solar-roof",
  "rainwater-harvesting-calculator": "rainwater-harvesting",
  "roof-pitch-calculator": "roof-calculator",
  "anti-termite-calculator": "anti-termite",
  "interiors-finishes-calculator": "interiors-finishes",
  "area-calculator": "area-space-calculator",
  "property-area-calculator": "marla-converter",
  "volume-tank-capacity-calculator": "volume-estimator",
  "unit-converter-calculator": "unit-converter",
  "live-db-rates-calculator": "rates",
  "ai-assistant-calculator": "ai",
};

/** /category/<slug> (public/sitemap-categories.xml) -> Dashboard category. */
export const CATEGORY_SLUG_TO_CATEGORY: Readonly<Record<string, string>> = {
  "structural-calculators": "Structural & Concrete Geometry",
  "geotechnical-soil-testing": "Geotechnical & Soil Lab Suite",
  "quantity-surveying": "Quantity Takeoff & Costing",
  "infrastructure-road-design": "Infrastructure & Highway Engineering",
  "mep-architecture": "MEP, Energy & Landscaping",
};

/**
 * Country portals from public/sitemap-categories.xml (/pk/, /in/, /ae/, /uk/).
 * No dedicated country pages exist yet; these are explicit locale entry
 * points to the Dashboard (not an accidental fallback). A dedicated
 * country landing page is a follow-up, not part of the routing fix.
 */
export const COUNTRY_CODES: ReadonlySet<string> = new Set(["pk", "in", "ae", "uk"]);

const TOOL_ID_SET = new Set(TOOL_IDS);
const STATIC_ID_SET = new Set(STATIC_IDS);
/**
 * The GitHub Pages project-page subpath — the repo name. The app is served
 * at /Civil-Estimation-BOQ/ on mansoorchaudary71-ship-it.github.io and at
 * the domain root on the custom domain. ONLY this exact first segment is
 * ever a hosting subpath: any other unknown first segment is part of the
 * route itself (a typo must 404, not render home — see getBasename).
 */
const REPO_BASENAME = "civil-estimation-boq";

export type ResolvedRoute =
  | { kind: "tool"; id: string }
  | { kind: "page"; id: string }
  | { kind: "category"; id: "home"; category: string }
  | { kind: "not-found" };

/**
 * Detect a hosting subpath (GitHub Pages project page, e.g.
 * /Civil-Estimation-BOQ). Returns "" on the custom domain / root.
 *
 * ONLY the repo name itself is a subpath. The old rule treated ANY
 * unknown first segment as a subpath, which swallowed real routes on the
 * custom domain: /brick-calculatr, /dashboard and every legacy-slug URL
 * (/<slug>-calculator, 42 sitemap URLs) all rendered home (soft 404)
 * instead of the in-app 404 / their tool. A first segment that is not
 * the repo name is part of the route, on either host.
 */
export function getBasename(): string {
  if (typeof window === "undefined") return "";
  const segs = window.location.pathname.split("/").filter(Boolean);
  if (segs.length === 0) return "";
  if (segs[0].toLowerCase() === REPO_BASENAME) return `/${segs[0]}`;
  return "";
}

/** Remove the hosting subpath (if any) from a raw window.location.pathname. */
export function stripBasename(pathname: string): string {
  const base = getBasename();
  if (base && pathname.toLowerCase().startsWith(base.toLowerCase())) {
    const rest = pathname.slice(base.length);
    return rest === "" ? "/" : rest;
  }
  return pathname;
}

/**
 * The route path for the CURRENT browser URL (2026-11-22 deep-link fix).
 *
 * Clean-path URLs use the pathname (minus the hosting basename).
 * When the app boots at the root (pathname is "/" after stripping the
 * basename) and the URL carries a hash route (#/estimate/...), the hash
 * IS the route. This is how deep links work in two cases:
 *   - after the 404.html redirect sends a 2+-segment clean path
 *     (/estimate/..., /calculators/<group>/<slug>) to its hash form,
 *     because those paths cannot boot the app directly (relative asset
 *     paths resolve under the deep path and the browser refuses them
 *     as text/html);
 *   - legacy hash links on the project-page host, where the pathname
 *     is "/Civil-Estimation-BOQ/" (not "/") so a bare `pathname !== "/"`
 *     check would never fall back to the hash.
 * Returns "/" when there is no window (tests / SSR).
 */
export function getEffectivePathname(): string {
  if (typeof window === "undefined") return "/";
  const stripped = stripBasename(window.location.pathname);
  if (stripped !== "/" && stripped !== "") return stripped;
  const hash = window.location.hash.replace(/^#/, "");
  return hash.startsWith("/") ? hash : "/";
}

function splitPath(pathname: string): string[] {
  const clean = stripBasename(pathname).replace(/\/+$/, "") || "/";
  if (clean === "/") return [];
  return clean
    .replace(/^\/+/, "")
    .split("/")
    .map((s) => decodeURIComponent(s).toLowerCase());
}

/** Map any published URL form to the module/page it must render. */
export function resolvePath(pathname: string): ResolvedRoute {
  const segs = splitPath(pathname);
  if (segs.length === 0) return { kind: "page", id: "home" };

  const [first, second, third] = segs;

  // /calculators[/<group>[/<slug>]]  (SEO form)
  if (first === "calculators") {
    if (segs.length === 1) return { kind: "tool", id: "calculators" };
    if (segs.length === 2) {
      if (second === "standards") return { kind: "page", id: "standards" };
      // NOTE: /calculators/resources used to alias to home. There is no
      // resources page and no link points here, so the alias was removed
      // (2026-11-22): the URL now 404s instead of silently showing home.
      const category = GROUP_TO_CATEGORY[second];
      if (category) return { kind: "category", id: "home", category };
      return { kind: "not-found" };
    }
    const id = SEO_SLUG_TO_ID[third] ?? LEGACY_SLUG_TO_ID[third];
    return id ? { kind: "tool", id } : { kind: "not-found" };
  }

  // /estimate/<n>-<unit>-house-construction-cost-<city>  (pSEO deep link
  // to the House Estimator, e.g. /estimate/5-marla-house-construction-
  // cost-lahore). HouseEstimator.tsx parses size/unit/city from the path
  // itself; this branch only has to route it to the tool — before it, the
  // URL fell through to not-found and the parser never ran. The slug
  // shape is validated against the parser's own regex so a malformed
  // /estimate/... URL 404s instead of opening the tool with garbage.
  if (first === "estimate") {
    if (
      segs.length === 2 &&
      /^\d+(\.\d+)?-[^-]+-house-construction-cost-.+$/.test(second)
    ) {
      return { kind: "tool", id: "house" };
    }
    return { kind: "not-found" };
  }

  // /category/<slug>  (hub form, public/sitemap-categories.xml)
  if (first === "category") {
    if (segs.length === 2) {
      const category = CATEGORY_SLUG_TO_CATEGORY[second];
      if (category) return { kind: "category", id: "home", category };
    }
    return { kind: "not-found" };
  }

  // /pk/, /in/, /ae/, /uk/  (country portals — explicit Dashboard entry)
  if (segs.length === 1 && COUNTRY_CODES.has(first)) {
    return { kind: "page", id: "home" };
  }

  // /tools[/<slug>]  (legacy form)
  if (first === "tools") {
    if (segs.length === 1) return { kind: "page", id: "home" };
    const last = segs[segs.length - 1];
    const id = SEO_SLUG_TO_ID[last] ?? LEGACY_SLUG_TO_ID[last] ?? (TOOL_ID_SET.has(last) ? last : undefined);
    return id ? { kind: "tool", id } : { kind: "not-found" };
  }

  // /join/<projectId>/<shareToken>
  if (first === "join") return { kind: "page", id: "join-project" };
  if (first === "team") return { kind: "page", id: "team" };

  // /brick-calculator[/<variant>] — the page reads the variant itself.
  if (first === "brick-calculator") return { kind: "tool", id: "brick-calculator" };

  // /cost-guide-pakistan is an alias, not a distinct tool: it renders
  // the same PakistanCostCalculatorPage as /pakistan-cost-calculator
  // (which canonicalises onto itself). Resolve the alias to the
  // canonical tool so the published URL keeps working (sitemap, shared
  // links) without a second Dashboard card, a second search entry or a
  // second set of structured data. Must sit BEFORE the TOOL_ID_SET
  // check below: the alias id is still registered in TOOL_IDS.
  if (first === "cost-guide-pakistan") return { kind: "tool", id: "pakistan-cost-calculator" };

  // /<tool-id>  (canonical short form) or /<legacy-slug> (sitemap-tools.xml)
  if (TOOL_ID_SET.has(first)) return { kind: "tool", id: first };
  const legacyId = LEGACY_SLUG_TO_ID[first];
  if (legacyId) return { kind: "tool", id: legacyId };
  if (STATIC_ID_SET.has(first)) return { kind: "page", id: first };

  return { kind: "not-found" };
}

/** Canonical in-app URL for a tool/page id (short form). */
export function pathFromId(id: string): string {
  return id === "home" ? "/" : `/${id}`;
}

export function isKnownId(id: string): boolean {
  return TOOL_ID_SET.has(id) || STATIC_ID_SET.has(id);
}
