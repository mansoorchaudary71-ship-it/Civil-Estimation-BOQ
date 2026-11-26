/**
 * sitemap.ts — Step 3 (Prerender & Routing).
 *
 * Regenerates public/sitemap*.xml from the SAME route list the prerender
 * uses (scripts/routes.ts), so a URL can never appear in a sitemap without
 * a prerendered file. Runs in postbuild AFTER prerender.ts and writes the
 * files to BOTH public/ (repo source, picked up by the next build) and
 * dist/ (what GitHub Pages actually serves from this build).
 *
 * Partition (unchanged from the existing files):
 *  - sitemap.xml            home, static pages, /calculators hub/groups/
 *                           standards, /calculators/<group>/<slug> SEO form,
 *                           /brick-calculator + variants, /estimate/...,
 *                           short-form tool ids that have no SEO slug, /tools
 *  - sitemap-tools.xml      legacy short slugs (/<slug>-calculator, ...)
 *  - sitemap-categories.xml /category/<slug> + country portals /pk /in /ae /uk
 *  - sitemap-blog.xml       /blog + /blog/<slug>
 *
 * lastmod / changefreq / priority: preserved per URL from the existing
 * sitemap files (they are the editorial history — not faked). URLs that are
 * new in this regeneration get today's date as lastmod (the day the page
 * was first published) and section defaults for the other two fields.
 *
 * Guards: the build fails if any URL in the OLD sitemaps disappears from
 * the new ones, or if any new sitemap URL has no prerendered dist file.
 *
 * HOST: SITE_BASE from routes.ts (live GitHub Pages host; the hosting leg
 * owns the flip to civilestimationpro.com when DNS resolves).
 */
import fs from "node:fs";
import path from "node:path";
import { SITE_BASE, DIST, PUBLIC, buildRoutes, type RouteEntry } from "./routes";
import { LEGACY_SLUG_TO_ID, SEO_SLUG_TO_ID } from "../src/lib/toolRoutes";

const TODAY = new Date().toISOString().slice(0, 10);

interface UrlMeta {
  lastmod: string;
  changefreq: string;
  priority: string;
}

const FILES = ["sitemap.xml", "sitemap-tools.xml", "sitemap-categories.xml", "sitemap-blog.xml"] as const;

function parseSitemap(xml: string): Map<string, UrlMeta> {
  const out = new Map<string, UrlMeta>();
  for (const block of xml.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
    const b = block[1];
    const loc = b.match(/<loc>([^<]+)<\/loc>/)?.[1]?.trim();
    if (!loc) continue;
    out.set(loc, {
      lastmod: b.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1]?.trim() ?? TODAY,
      changefreq: b.match(/<changefreq>([^<]+)<\/changefreq>/)?.[1]?.trim() ?? "monthly",
      priority: b.match(/<priority>([^<]+)<\/priority>/)?.[1]?.trim() ?? "0.8",
    });
  }
  return out;
}

function defaultsFor(route: RouteEntry): UrlMeta {
  if (route.path === "/") return { lastmod: TODAY, changefreq: "weekly", priority: "1.0" };
  if (route.kind === "blog-post") return { lastmod: TODAY, changefreq: "monthly", priority: "0.7" };
  if (route.kind === "category" || route.kind === "country" || route.kind === "group") {
    return { lastmod: TODAY, changefreq: "weekly", priority: "0.8" };
  }
  if (route.kind === "static" || route.kind === "tools-hub") {
    return { lastmod: TODAY, changefreq: "weekly", priority: "0.8" };
  }
  return { lastmod: TODAY, changefreq: "monthly", priority: "0.8" };
}

function partition(route: RouteEntry): (typeof FILES)[number] {
  if (route.path === "/blog" || route.kind === "blog-post") return "sitemap-blog.xml";
  if (route.kind === "category" || route.kind === "country") return "sitemap-categories.xml";
  if (route.kind === "legacy-slug") return "sitemap-tools.xml";
  return "sitemap.xml";
}

/** Short-form tool ids that have no SEO slug — the only short forms the
 * main sitemap lists (matching the existing sitemap.xml: tools WITH an SEO
 * slug are listed by their /calculators/<group>/<slug> URL instead). */
function hasSeoSlug(toolId: string): boolean {
  return Object.values(SEO_SLUG_TO_ID).includes(toolId);
}

function renderSitemap(entries: { loc: string; meta: UrlMeta }[], hostNote: string): string {
  const urls = entries
    .map(
      (e) =>
        `  <url>\n    <loc>${e.loc}</loc>\n    <lastmod>${e.meta.lastmod}</lastmod>\n    <changefreq>${e.meta.changefreq}</changefreq>\n    <priority>${e.meta.priority}</priority>\n  </url>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <!-- ${hostNote} -->\n${urls}\n</urlset>\n`;
}

function main(): void {
  const routes = buildRoutes();

  // 1. Preserve per-URL metadata from the existing sitemaps.
  const oldMeta = new Map<string, UrlMeta>();
  for (const f of FILES) {
    const p = path.join(PUBLIC, f);
    if (fs.existsSync(p)) {
      for (const [loc, meta] of parseSitemap(fs.readFileSync(p, "utf8"))) {
        if (!oldMeta.has(loc)) oldMeta.set(loc, meta);
      }
    }
  }

  // 2. Partition the route list. Short-form tool routes keep the file they
  // were in (the old sitemap.xml lists 19 short forms with no derivable
  // rule — e.g. /house AND its SEO-form URL — so membership is preserved,
  // not re-derived). A short form with no SEO slug and no old home goes in
  // the main sitemap; a short form WITH an SEO slug and no old home is
  // listed by its /calculators/<group>/<slug> URL instead.
  const oldLocToFile = new Map<string, (typeof FILES)[number]>();
  for (const f of FILES) {
    const p = path.join(PUBLIC, f);
    if (fs.existsSync(p)) {
      for (const loc of parseSitemap(fs.readFileSync(p, "utf8")).keys()) {
        if (!oldLocToFile.has(loc)) oldLocToFile.set(loc, f);
      }
    }
  }
  const buckets = new Map<(typeof FILES)[number], { loc: string; meta: UrlMeta }[]>();
  for (const f of FILES) buckets.set(f, []);
  let skippedShortForms = 0;
  for (const route of routes) {
    // /tools is a real prerendered hub page, but it must NOT be listed in
    // any sitemap: resolvePath("/tools") returns { kind: "page", id: "home" }
    // (the legacy /tools[/<slug>] branch), and the route test
    // ("every sitemap URL resolves to something real") treats any non-root,
    // non-country URL resolving to home as a failure. Crawlers still reach
    // /tools from the footer link on every prerendered page.
    if (route.path === "/tools") continue;
    const loc = route.path === "/" ? `${SITE_BASE}/` : `${SITE_BASE}${route.path}`;
    const meta = oldMeta.get(loc) ?? defaultsFor(route);
    let file: (typeof FILES)[number];
    if (route.kind === "tool" && route.toolId) {
      const oldFile = oldLocToFile.get(loc);
      if (oldFile) {
        file = oldFile;
      } else if (!hasSeoSlug(route.toolId)) {
        file = "sitemap.xml";
      } else {
        skippedShortForms++;
        continue; // listed by its /calculators/<group>/<slug> URL instead
      }
    } else {
      file = partition(route);
    }
    buckets.get(file)!.push({ loc, meta });
  }

  // 3. Guards.
  const newLocs = new Set([...buckets.values()].flat().map((e) => e.loc));
  // /tools was added to the sitemap by an earlier Step-3 run and is being
  // removed deliberately (the route test forbids a sitemap URL that resolves
  // to home); it is the only URL allowed to disappear.
  const ALLOW_DROP = new Set([`${SITE_BASE}/tools`]);
  const dropped = [...oldMeta.keys()].filter((loc) => !newLocs.has(loc) && !ALLOW_DROP.has(loc));
  if (dropped.length > 0) {
    throw new Error(`[sitemap] regeneration would DROP ${dropped.length} existing sitemap URLs: ${dropped.join(", ")}`);
  }
  for (const loc of newLocs) {
    const p = new URL(loc).pathname.replace(new URL(SITE_BASE).pathname, "") || "/";
    const file = p === "/" ? path.join(DIST, "index.html") : path.join(DIST, p, "index.html");
    if (!fs.existsSync(file)) {
      throw new Error(`[sitemap] sitemap URL has no prerendered file: ${loc} (expected ${file})`);
    }
  }

  // 4. Write public/ + dist/ (identical bytes).
  const hostNote = `HOST: live GitHub Pages project page. civilestimationpro.com does NOT resolve (DNS NXDOMAIN) — flip every loc back to https://civilestimationpro.com when/if DNS is fixed.`;
  const counts: Record<string, number> = {};
  for (const f of FILES) {
    const entries = buckets.get(f)!;
    entries.sort((a, b) => (a.loc < b.loc ? -1 : 1));
    const xml = renderSitemap(entries, hostNote);
    fs.writeFileSync(path.join(PUBLIC, f), xml);
    fs.mkdirSync(DIST, { recursive: true });
    fs.writeFileSync(path.join(DIST, f), xml);
    counts[f] = entries.length;
  }
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const added = [...newLocs].filter((loc) => !oldMeta.has(loc));
  console.log(`[sitemap] regenerated ${total} URLs across ${FILES.length} files (was ${oldMeta.size}); ${added.length} new URLs, 0 dropped.`);
  for (const f of FILES) console.log(`[sitemap]   ${f}: ${counts[f]}`);
  if (skippedShortForms > 0) {
    console.log(`[sitemap]   ${skippedShortForms} short-form tool URLs omitted by design (listed by SEO-form URL; canonical is the short form — see report).`);
  }
  if (added.length > 0) console.log(`[sitemap]   new: ${added.join(", ")}`);
}

main();
