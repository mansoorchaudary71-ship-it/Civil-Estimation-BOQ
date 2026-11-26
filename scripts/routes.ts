/**
 * routes.ts — Step 3 (Prerender & Routing): the SINGLE source of truth for
 * every prerendered route and every sitemap URL.
 *
 * Both scripts/prerender.ts and scripts/sitemap.ts import this module, so a
 * URL can never appear in a sitemap without a prerendered file (and vice
 * versa for the sitemap partition — see sitemap.ts).
 *
 * HOST — the live GitHub Pages project-page host, copied from the existing
 * public/sitemap.xml + public/robots.txt. civilestimationpro.com does NOT
 * resolve (DNS NXDOMAIN, see src/seo/siteConfig.ts), so SITE_URL from
 * siteConfig must NOT be used for canonicals/sitemaps. The HOSTING leg owns
 * the CNAME / canonical-host flip: when DNS is fixed, change SITE_BASE here
 * (and the sitemap/robots comments) and the next build regenerates every
 * canonical, internal link and sitemap URL from it. Do not hardcode the
 * host anywhere else in the prerender/sitemap scripts.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  TOOL_IDS,
  STATIC_IDS,
  SEO_SLUG_TO_ID,
  LEGACY_SLUG_TO_ID,
  GROUP_TO_CATEGORY,
  CATEGORY_SLUG_TO_CATEGORY,
  COUNTRY_CODES,
  resolvePath,
} from "../src/lib/toolRoutes";
import {
  CITY_VARIANTS,
  BRICK_TYPE_VARIANTS,
  HOUSE_SIZE_VARIANTS,
} from "../src/seo/brickProgrammatic";

export const SITE_BASE =
  "https://mansoorchaudary71-ship-it.github.io/Civil-Estimation-BOQ";
/** Hosting subpath of SITE_BASE ("" on the custom domain, "/Civil-Estimation-BOQ" here). */
export const SITE_SUBPATH = new URL(SITE_BASE).pathname.replace(/\/+$/, "");

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.join(HERE, "..");
export const DIST = path.join(ROOT, "dist");
export const PUBLIC = path.join(ROOT, "public");

export type RouteKind =
  | "home"
  | "tool"
  | "seo-form"
  | "legacy-slug"
  | "brick-variant"
  | "category"
  | "group"
  | "country"
  | "static"
  | "blog"
  | "blog-post"
  | "estimate"
  | "tools-hub";

export interface RouteEntry {
  /** Site-relative path, e.g. "/brick-calculator/lahore" ("/" for home). */
  path: string;
  /** Canonical site-relative path (aliases canonicalise onto the tool's short form, mirroring SEOHead). */
  canonicalPath: string;
  kind: RouteKind;
  /** Tool id this route renders (for tool / seo-form / legacy-slug / brick-variant kinds). */
  toolId?: string;
}

/**
 * The published /calculators/<group>/<slug> set, copied verbatim from
 * public/sitemap.xml (2026-11-21). toolRoutes.ts maps the third segment via
 * SEO_SLUG_TO_ID ?? LEGACY_SLUG_TO_ID but records no group per slug, so the
 * group assignment lives here; buildRoutes() asserts every pair resolves to
 * a real tool, so a slug removed from toolRoutes fails the build loudly
 * instead of silently prerendering a 404.
 */
export const SEO_FORM_ROUTES: ReadonlyArray<readonly [string, string]> = [
  // quantity-estimation (21)
  ["quantity-estimation", "guided-qs-workflow-tool"],
  ["quantity-estimation", "quick-rough-estimator"],
  ["quantity-estimation", "master-quantity-estimator"],
  ["quantity-estimation", "area-plot-converter-marla-kanal"],
  ["quantity-estimation", "house-construction-cost-calculator"],
  ["quantity-estimation", "house-construction-estimator"],
  ["quantity-estimation", "material-takeoff-generator"],
  ["quantity-estimation", "cost-summary-generator"],
  ["quantity-estimation", "measurement-sheet-calculator"],
  ["quantity-estimation", "boq-generator"],
  ["quantity-estimation", "plan-measure-tool"],
  ["quantity-estimation", "live-rates-calculator"],
  ["quantity-estimation", "interiors-finishes-estimator"],
  ["quantity-estimation", "area-space-calculator"],
  ["quantity-estimation", "volume-tank-capacity-calculator"],
  ["quantity-estimation", "metal-weight-calculator"],
  ["quantity-estimation", "unit-converter-tool"],
  ["quantity-estimation", "ai-assistant-tool"],
  ["quantity-estimation", "project-manager-tool"],
  ["quantity-estimation", "site-progress-tracker-tool"],
  ["quantity-estimation", "labour-workforce-estimator"],
  // concrete (16)
  ["concrete", "master-rcc-estimator"],
  ["concrete", "construction-material-calculator"],
  ["concrete", "mix-design-calculator"],
  ["concrete", "bbs-generator"],
  ["concrete", "reinforcement-detailing-visualizer-tool"],
  ["concrete", "isolated-footing-calculator"],
  ["concrete", "retaining-wall-estimator"],
  ["concrete", "staircase-calculator"],
  ["concrete", "aggregate-tests-calculator"],
  ["concrete", "formwork-scaffold-estimator"],
  ["concrete", "brick-calculator"],
  ["concrete", "concrete-mix-design-calculator"],
  ["concrete", "plywood-formwork-estimator"],
  ["concrete", "precast-compound-wall-estimator"],
  ["concrete", "roof-pitch-calculator"],
  ["concrete", "universal-structural-geometry-calculator"],
  // road-pavement (7)
  ["road-pavement", "road-pavement-estimator"],
  ["road-pavement", "earthworks-excavation-calculator"],
  ["road-pavement", "chainage-volume-calculator"],
  ["road-pavement", "gradient-slope-calculator"],
  ["road-pavement", "anti-termite-calculator"],
  ["road-pavement", "pavement-mix-gradation-calculator"],
  ["road-pavement", "topsoil-landscaping-estimator"],
  // geotechnical (7)
  ["geotechnical", "sieve-analysis-grading-calculator"],
  ["geotechnical", "geotechnical-soil-tests-calculator"],
  ["geotechnical", "cbr-test-calculator"],
  ["geotechnical", "aggregate-blending-calculator"],
  ["geotechnical", "direct-shear-test-calculator"],
  ["geotechnical", "permeability-calculator"],
  ["geotechnical", "soil-mechanics-lab-calculator"],
  // mep (6)
  ["mep", "energy-mep-calculator"],
  ["mep", "solar-roof-calculator"],
  ["mep", "rainwater-harvesting-calculator"],
  ["mep", "master-infrastructure-mep-engine"],
  ["mep", "solar-water-heater-calculator"],
  ["mep", "wastewater-bod-cod-calculator"],
  // structural-design (6)
  ["structural-design", "beam-design-tool"],
  ["structural-design", "column-design-tool"],
  ["structural-design", "raft-foundation-calculator"],
  ["structural-design", "water-tank-design-calculator"],
  ["structural-design", "pile-foundation-calculator"],
  ["structural-design", "prestressed-concrete-estimator"],
  // architectural (7)
  ["architectural", "room-area-calculator"],
  ["architectural", "building-setback-calculator"],
  ["architectural", "far-fsi-calculator"],
  ["architectural", "door-window-schedule-generator"],
  ["architectural", "ventilation-lighting-checker-tool"],
  ["architectural", "complete-finishes-workspace"],
  ["architectural", "staircase-design-reference"],
];

/** Representative /estimate/<size>-house-construction-cost-<city> pSEO URLs.
 * The pattern is otherwise unbounded (any size/city matches the parser's
 * regex), so only this bounded, most-searched set is prerendered; any other
 * /estimate/... URL still works through the 404.html SPA fallback. */
export const ESTIMATE_ROUTES: ReadonlyArray<readonly [string, string]> = [
  ["5-marla", "lahore"],
  ["7-marla", "lahore"],
  ["10-marla", "lahore"],
  ["1-kanal", "lahore"],
  ["5-marla", "karachi"],
  ["10-marla", "karachi"],
  ["1-kanal", "karachi"],
  ["5-marla", "islamabad"],
  ["10-marla", "islamabad"],
  ["1-kanal", "islamabad"],
  ["5-marla", "delhi"],
  ["5-marla", "dubai"],
];

export interface BlogPostMeta {
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  category: string;
  /** Raw markdown body (after frontmatter). */
  body: string;
}

/** Parse content/blog/*.md frontmatter (title/excerpt/author/date/category). */
export function loadBlogPosts(): BlogPostMeta[] {
  const dir = path.join(ROOT, "content", "blog");
  if (!fs.existsSync(dir)) return [];
  const posts: BlogPostMeta[] = [];
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".md")).sort()) {
    const raw = fs.readFileSync(path.join(dir, file), "utf8");
    const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!m) {
      console.warn(`[routes] skipping content/blog/${file}: no frontmatter`);
      continue;
    }
    const fm: Record<string, string> = {};
    for (const line of m[1].split("\n")) {
      const kv = line.match(/^([A-Za-z]+):\s*"?([^"]*)"?\s*$/);
      if (kv) fm[kv[1]] = kv[2];
    }
    const slug = file.replace(/\.md$/, "");
    if (!fm.title || !fm.date) {
      console.warn(`[routes] skipping content/blog/${file}: missing title/date`);
      continue;
    }
    posts.push({
      slug,
      title: fm.title,
      excerpt: fm.excerpt ?? "",
      author: fm.author ?? "Civil Estimation Pro",
      date: fm.date,
      category: fm.category ?? "Engineering",
      body: m[2].trim(),
    });
  }
  posts.sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
  return posts;
}

/** Canonical short-form path for a tool id (mirrors toolRoutes.ts). */
export function canonicalToolPath(toolId: string): string {
  // Alias that renders another tool's page (see toolRoutes.ts):
  // /cost-guide-pakistan resolves to tool id "pakistan-cost-calculator",
  // so the SPA canonicalises it onto /pakistan-cost-calculator.
  // NOTE: /boq-templates is NOT aliased here on purpose — resolvePath
  // returns tool id "boq-templates", so the SPA canonical is /boq-templates.
  if (toolId === "cost-guide-pakistan") return "/pakistan-cost-calculator";
  return toolId === "home" ? "/" : `/${toolId}`;
}

export function buildRoutes(): RouteEntry[] {
  const routes: RouteEntry[] = [];
  const seen = new Set<string>();
  const add = (r: RouteEntry) => {
    if (seen.has(r.path)) return;
    seen.add(r.path);
    routes.push(r);
  };

  // Home.
  add({ path: "/", canonicalPath: "/", kind: "home" });

  // All 75 tool short forms (canonical, except the two aliases above).
  for (const id of TOOL_IDS) {
    add({ path: `/${id}`, canonicalPath: canonicalToolPath(id), kind: "tool", toolId: id });
  }

  // Legacy short slugs (public/sitemap-tools.xml): /<slug>-calculator etc.
  for (const [slug, id] of Object.entries(LEGACY_SLUG_TO_ID)) {
    add({ path: `/${slug}`, canonicalPath: canonicalToolPath(id), kind: "legacy-slug", toolId: id });
  }

  // SEO form: /calculators/<group>/<slug>.
  for (const [group, slug] of SEO_FORM_ROUTES) {
    const id = SEO_SLUG_TO_ID[slug] ?? LEGACY_SLUG_TO_ID[slug];
    if (!id) throw new Error(`[routes] SEO-form slug has no tool: /calculators/${group}/${slug}`);
    add({
      path: `/calculators/${group}/${slug}`,
      canonicalPath: canonicalToolPath(id),
      kind: "seo-form",
      toolId: id,
    });
  }

  // Group landings + hub + standards hub.
  for (const group of Object.keys(GROUP_TO_CATEGORY)) {
    add({ path: `/calculators/${group}`, canonicalPath: `/calculators/${group}`, kind: "group" });
  }
  add({ path: "/calculators/standards", canonicalPath: "/calculators/standards", kind: "group" });

  // Category hubs: /category/<slug>.
  for (const slug of Object.keys(CATEGORY_SLUG_TO_CATEGORY)) {
    add({ path: `/category/${slug}`, canonicalPath: `/category/${slug}`, kind: "category" });
  }

  // Country portals.
  for (const code of COUNTRY_CODES) {
    add({ path: `/${code}`, canonicalPath: `/${code}`, kind: "country" });
  }

  // Programmatic brick variants (16).
  for (const c of CITY_VARIANTS) {
    add({ path: `/brick-calculator/${c.slug}`, canonicalPath: `/brick-calculator/${c.slug}`, kind: "brick-variant", toolId: "brick-calculator" });
  }
  for (const t of BRICK_TYPE_VARIANTS) {
    add({ path: `/brick-calculator/${t.slug}`, canonicalPath: `/brick-calculator/${t.slug}`, kind: "brick-variant", toolId: "brick-calculator" });
  }
  for (const s of HOUSE_SIZE_VARIANTS) {
    add({ path: `/brick-calculator/${s.slug}`, canonicalPath: `/brick-calculator/${s.slug}`, kind: "brick-variant", toolId: "brick-calculator" });
  }

  // Static pages (STATIC_IDS minus home, which is "/").
  for (const id of STATIC_IDS) {
    if (id === "home") continue;
    add({ path: `/${id}`, canonicalPath: `/${id}`, kind: "static" });
  }

  // Blog listing is /blog (static above); individual posts.
  for (const post of loadBlogPosts()) {
    add({ path: `/blog/${post.slug}`, canonicalPath: `/blog/${post.slug}`, kind: "blog-post" });
  }

  // Representative estimate pSEO URLs.
  for (const [size, city] of ESTIMATE_ROUTES) {
    add({
      path: `/estimate/${size}-house-construction-cost-${city}`,
      canonicalPath: `/estimate/${size}-house-construction-cost-${city}`,
      kind: "estimate",
    });
  }

  // Tools hub.
  add({ path: "/tools", canonicalPath: "/tools", kind: "tools-hub" });

  // Guard: every route must resolve to a real page/tool in the SPA, never
  // to not-found. resolvePath() runs in Node here (window is undefined, so
  // getEffectivePathname/getBasename are inert and splitPath uses the raw
  // pathname — exactly what we pass).
  for (const r of routes) {
    const resolved = resolvePath(r.path);
    if (resolved.kind === "not-found") {
      throw new Error(`[routes] route resolves to not-found in the SPA: ${r.path}`);
    }
  }

  routes.sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
  return routes;
}
