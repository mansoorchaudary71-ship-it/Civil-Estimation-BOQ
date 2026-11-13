/**
 * Route-resolver tests — run with:  npm run test:routes
 * (uses tsx, already a devDependency; no test framework needed.)
 *
 * These tests are the verification for the redirect-to-home fix. They read
 * the REAL sitemap files and the REAL Dashboard/App sources and assert that
 * every published URL resolves to the tool/page it promises — never home
 * by accident, never "not-found" for a real tool.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { resolvePath, TOOL_IDS, SEO_SLUG_TO_ID, GROUP_TO_CATEGORY } from "../toolRoutes";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

function sitemapPaths(): string[] {
  const out: string[] = [];
  for (const f of fs.readdirSync(path.join(ROOT, "public")).filter((x) => x.startsWith("sitemap") && x.endsWith(".xml"))) {
    const xml = fs.readFileSync(path.join(ROOT, "public", f), "utf8");
    for (const m of xml.matchAll(/<loc>(https:\/\/civilestimationpro\.com)?([^<]*)<\/loc>/g)) {
      out.push(m[2] || "/");
    }
  }
  return [...new Set(out)];
}

function dashboardIds(): string[] {
  const src = fs.readFileSync(path.join(ROOT, "src", "components", "Dashboard.tsx"), "utf8");
  return [...new Set([...src.matchAll(/id: "([^"]+)"/g)].map((m) => m[1]))];
}

function renderModuleCases(): string[] {
  const src = fs.readFileSync(path.join(ROOT, "src", "App.tsx"), "utf8");
  return [...new Set([...src.matchAll(/case "([^"]+)":/g)].map((m) => m[1]))];
}

test("short canonical URLs resolve to their tool", () => {
  assert.deepEqual(resolvePath("/brick-calculator"), { kind: "tool", id: "brick-calculator" });
  assert.deepEqual(resolvePath("/bbs-generator"), { kind: "tool", id: "bbs-generator" });
  assert.deepEqual(resolvePath("/master-rcc"), { kind: "tool", id: "master-rcc" });
  assert.deepEqual(resolvePath("/"), { kind: "page", id: "home" });
});

test("SEO /calculators/<group>/<slug> URLs resolve (the old bug: all went home)", () => {
  for (const [slug, id] of Object.entries(SEO_SLUG_TO_ID)) {
    const r = resolvePath(`/calculators/quantity-estimation/${slug}`);
    assert.equal(r.kind, "tool", `/${slug} should resolve to a tool`);
    assert.equal((r as { id: string }).id, id, `/${slug} should resolve to ${id}`);
  }
  assert.deepEqual(resolvePath("/calculators/concrete/bbs-generator"), { kind: "tool", id: "bbs-generator" });
  assert.deepEqual(resolvePath("/calculators/geotechnical/cbr-test-calculator"), { kind: "tool", id: "cbr-test" });
});

test("category URLs land on the Dashboard with that category", () => {
  for (const [group, category] of Object.entries(GROUP_TO_CATEGORY)) {
    assert.deepEqual(resolvePath(`/calculators/${group}`), { kind: "category", id: "home", category });
  }
  assert.deepEqual(resolvePath("/calculators"), { kind: "page", id: "home" });
  assert.deepEqual(resolvePath("/calculators/standards"), { kind: "page", id: "standards" });
});

test("legacy /tools/* URLs and brick variants resolve", () => {
  assert.deepEqual(resolvePath("/tools/bbs-generator"), { kind: "tool", id: "bbs-generator" });
  assert.deepEqual(resolvePath("/tools/master-rcc-estimator"), { kind: "tool", id: "master-rcc" });
  assert.deepEqual(resolvePath("/brick-calculator/lahore"), { kind: "tool", id: "brick-calculator" });
  assert.deepEqual(resolvePath("/brick-calculator/awwal-bricks"), { kind: "tool", id: "brick-calculator" });
});

test("legacy short slugs (sitemap-tools.xml) resolve", () => {
  assert.deepEqual(resolvePath("/rcc-slab-calculator"), { kind: "tool", id: "master-rcc" });
  assert.deepEqual(resolvePath("/beam-calculator"), { kind: "tool", id: "beam-design" });
  assert.deepEqual(resolvePath("/column-concrete-estimator"), { kind: "tool", id: "column-design" });
  assert.deepEqual(resolvePath("/professional-boq-generator"), { kind: "tool", id: "boq" });
  assert.deepEqual(resolvePath("/bbs-generator-calculator"), { kind: "tool", id: "bbs-generator" });
  assert.deepEqual(resolvePath("/area-calculator"), { kind: "tool", id: "area-space-calculator" });
  assert.deepEqual(resolvePath("/property-area-calculator"), { kind: "tool", id: "marla-converter" });
  assert.deepEqual(resolvePath("/live-db-rates-calculator"), { kind: "tool", id: "rates" });
  assert.deepEqual(resolvePath("/roof-pitch-calculator"), { kind: "tool", id: "roof-calculator" });
  // Mix design has a real tool now — both sitemap URLs open it.
  assert.deepEqual(resolvePath("/concrete-mix-design-calculator"), { kind: "tool", id: "mix-design" });
  assert.deepEqual(resolvePath("/calculators/concrete/mix-design-calculator"), { kind: "tool", id: "mix-design" });
  assert.deepEqual(resolvePath("/mix-design"), { kind: "tool", id: "mix-design" });
});

test("category hubs and country portals resolve", () => {
  assert.deepEqual(resolvePath("/category/structural-calculators"), { kind: "category", id: "home", category: "Structural & Concrete Geometry" });
  assert.deepEqual(resolvePath("/category/quantity-surveying"), { kind: "category", id: "home", category: "Quantity Takeoff & Costing" });
  assert.deepEqual(resolvePath("/category/mep-architecture"), { kind: "category", id: "home", category: "MEP, Energy & Landscaping" });
  assert.deepEqual(resolvePath("/pk/"), { kind: "page", id: "home" });
  assert.deepEqual(resolvePath("/in/"), { kind: "page", id: "home" });
  assert.deepEqual(resolvePath("/ae/"), { kind: "page", id: "home" });
  assert.deepEqual(resolvePath("/uk/"), { kind: "page", id: "home" });
});
test("static pages and join/team resolve", () => {
  assert.deepEqual(resolvePath("/about"), { kind: "page", id: "about" });
  assert.deepEqual(resolvePath("/pricing"), { kind: "page", id: "pricing" });
  assert.deepEqual(resolvePath("/standards"), { kind: "page", id: "standards" });
  assert.deepEqual(resolvePath("/team"), { kind: "page", id: "team" });
  assert.deepEqual(resolvePath("/join/abc123/token456"), { kind: "page", id: "join-project" });
});

test("unknown paths are not-found (never silently home)", () => {
  assert.deepEqual(resolvePath("/no-such-tool"), { kind: "not-found" });
  assert.deepEqual(resolvePath("/calculators/nope/nope-tool"), { kind: "not-found" });
  assert.deepEqual(resolvePath("/calculators/bogus-group"), { kind: "not-found" });
});

test("every sitemap URL resolves to something real", () => {
  const paths = sitemapPaths();
  assert.ok(paths.length > 50, `expected many sitemap URLs, got ${paths.length}`);
  const bad: string[] = [];
  for (const p of paths) {
    const r = resolvePath(p);
    if (r.kind === "not-found") bad.push(p);
    if (r.kind === "page" && r.id === "home" && !["/", "/calculators", "/calculators/resources", "/pk/", "/in/", "/ae/", "/uk/"].includes(p)) {
      bad.push(`${p} (fell back to home)`);
    }
  }
  assert.deepEqual(bad, [], `sitemap URLs that do not resolve:\n${bad.join("\n")}`);
});

test("registry covers every Dashboard card and every renderModule case", () => {
  const ids = new Set(TOOL_IDS);
  const missingFromRegistry = dashboardIds().filter((id) => !ids.has(id) && !["blog"].includes(id));
  assert.deepEqual(missingFromRegistry, [], `Dashboard ids missing from TOOL_IDS: ${missingFromRegistry}`);
  const casesWithoutRegistry = renderModuleCases().filter((id) => !ids.has(id));
  assert.deepEqual(casesWithoutRegistry, [], `renderModule cases missing from TOOL_IDS: ${casesWithoutRegistry}`);
  for (const id of Object.values(SEO_SLUG_TO_ID)) {
    assert.ok(ids.has(id), `SEO slug maps to unknown tool id ${id}`);
  }
});
