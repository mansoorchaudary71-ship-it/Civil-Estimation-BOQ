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
import { resolvePath, getEffectivePathname, TOOL_IDS, SEO_SLUG_TO_ID, LEGACY_SLUG_TO_ID, GROUP_TO_CATEGORY } from "../toolRoutes";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

function sitemapPaths(): string[] {
  const out: string[] = [];
  for (const f of fs.readdirSync(path.join(ROOT, "public")).filter((x) => x.startsWith("sitemap") && x.endsWith(".xml"))) {
    const xml = fs.readFileSync(path.join(ROOT, "public", f), "utf8");
    for (const m of xml.matchAll(/<loc>([^<]*)<\/loc>/g)) {
      // Strip the origin (either host) and the project-page subpath prefix,
      // leaving the path resolvePath() expects. Wave 1-D rewrote sitemap hosts
      // from civilestimationpro.com to the live github.io project page.
      const p = m[1].replace(/^https?:\/\/[^/]+/, "").replace(/^\/Civil-Estimation-BOQ/i, "");
      out.push(p || "/");
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

// Round 3 infra: the 15 new SEO slugs resolve under their own group
// (the group segment is ignored by the resolver — the slug is the key).
test("Round 3 SEO slugs resolve", () => {
  assert.deepEqual(resolvePath("/calculators/concrete/brick-calculator"), { kind: "tool", id: "brick-calculator" });
  assert.deepEqual(resolvePath("/calculators/concrete/concrete-mix-design-calculator"), { kind: "tool", id: "mix-design" });
  assert.deepEqual(resolvePath("/calculators/quantity-estimation/house-construction-estimator"), { kind: "tool", id: "house" });
  assert.deepEqual(resolvePath("/calculators/mep/master-infrastructure-mep-engine"), { kind: "tool", id: "infra-mep-engine" });
  assert.deepEqual(resolvePath("/calculators/architectural/complete-finishes-workspace"), { kind: "tool", id: "master-finishes" });
  assert.deepEqual(resolvePath("/calculators/road-pavement/pavement-mix-gradation-calculator"), { kind: "tool", id: "pavement-mix" });
  assert.deepEqual(resolvePath("/calculators/geotechnical/soil-mechanics-lab-calculator"), { kind: "tool", id: "soil-mechanics-lab" });
  assert.deepEqual(resolvePath("/calculators/mep/solar-water-heater-calculator"), { kind: "tool", id: "solar-water-heater" });
  assert.deepEqual(resolvePath("/calculators/mep/wastewater-bod-cod-calculator"), { kind: "tool", id: "wastewater-calculator" });
  assert.deepEqual(resolvePath("/calculators/architectural/staircase-design-reference"), { kind: "tool", id: "staircase-design-reference" });
});

// Round 3 infra: /cost-guide-pakistan is an alias of the Pakistan cost
// calculator, not a distinct tool — it must resolve to the canonical
// tool (sitemap URL keeps working, no second card/search/JSON-LD).
test("/cost-guide-pakistan aliases to pakistan-cost-calculator", () => {
  assert.deepEqual(resolvePath("/cost-guide-pakistan"), { kind: "tool", id: "pakistan-cost-calculator" });
});

// Step 5 merge: the alias id is retired from the registry — the honest
// tool count is 74, not 75 — while the published URL keeps aliasing to
// the canonical tool (previous test). No Dashboard card and no
// renderModule case may re-register it (the registry-coverage test
// below would fail if one did).
test("cost-guide-pakistan is retired as a tool id (74 tools)", () => {
  assert.ok(!TOOL_IDS.includes("cost-guide-pakistan"), "alias id must not be in TOOL_IDS");
  assert.equal(TOOL_IDS.length, 74, `expected 74 tools, got ${TOOL_IDS.length}`);
  assert.ok(TOOL_IDS.includes("pakistan-cost-calculator"), "canonical id stays registered");
  // ...but the published URL stays live: it is kept in LEGACY_SLUG_TO_ID
  // so scripts/routes.ts still emits it (prerendered + sitemap) with
  // canonical /pakistan-cost-calculator, without counting as a tool.
  assert.equal(LEGACY_SLUG_TO_ID["cost-guide-pakistan"], "pakistan-cost-calculator");
});

// Round 3 infra: the 6 tools with no SEO slug are deliberate —
// boq-templates shares boq's slug, cost-guide-pakistan is an alias,
// and the 4 standards pages live under /calculators/standards.
test("no SEO slug maps to the deliberate exclusions", () => {
  const targets = new Set(Object.values(SEO_SLUG_TO_ID));
  for (const id of ["boq-templates", "cost-guide-pakistan", "is-codes-reference", "morth-irc-specs", "pakistan-building-codes", "uae-construction-standards"]) {
    assert.ok(!targets.has(id), `no SEO slug should map to ${id}`);
  }
});

test("category URLs land on the Dashboard with that category", () => {
  for (const [group, category] of Object.entries(GROUP_TO_CATEGORY)) {
    assert.deepEqual(resolvePath(`/calculators/${group}`), { kind: "category", id: "home", category });
  }
  assert.deepEqual(resolvePath("/calculators"), { kind: "tool", id: "calculators" }); // Wave 1-D fix (pillar 5): bare /calculators renders the Calculators hub tool, not home
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

test("/estimate/<n>-<unit>-house-construction-cost-<city> deep links open the House Estimator", () => {
  assert.deepEqual(resolvePath("/estimate/5-marla-house-construction-cost-lahore"), { kind: "tool", id: "house" });
  assert.deepEqual(resolvePath("/estimate/10-sqyd-house-construction-cost-karachi"), { kind: "tool", id: "house" });
  assert.deepEqual(resolvePath("/estimate/2500-sqft-house-construction-cost-islamabad"), { kind: "tool", id: "house" });
  assert.deepEqual(resolvePath("/estimate/5.5-marla-house-construction-cost-lahore"), { kind: "tool", id: "house" });
  // Malformed /estimate/ slugs 404 instead of opening the tool with garbage.
  assert.deepEqual(resolvePath("/estimate/house-construction-cost-lahore"), { kind: "not-found" });
  assert.deepEqual(resolvePath("/estimate/5-marla-something-else"), { kind: "not-found" });
  assert.deepEqual(resolvePath("/estimate"), { kind: "not-found" });
});

test("/calculators/resources has no page, so it 404s (the old home alias was removed)", () => {
  assert.deepEqual(resolvePath("/calculators/resources"), { kind: "not-found" });
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
    if (r.kind === "page" && r.id === "home" && !["/", "/pk", "/in", "/ae", "/uk"].includes(p)) {
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

test("getEffectivePathname() — hash deep links resolve on both hosts (2026-11-22)", () => {
  const prevWindow = (globalThis as any).window;
  try {
    // Root host, hash deep link: the hash IS the route.
    (globalThis as any).window = { location: { pathname: "/", hash: "#/estimate/5-marla-house-construction-cost-lahore" } };
    assert.equal(getEffectivePathname(), "/estimate/5-marla-house-construction-cost-lahore");
    // Project-page host, hash deep link: pathname is the subpath root, hash is the route.
    (globalThis as any).window = { location: { pathname: "/Civil-Estimation-BOQ/", hash: "#/estimate/10-marla-house-construction-cost-islamabad" } };
    assert.equal(getEffectivePathname(), "/estimate/10-marla-house-construction-cost-islamabad");
    // Clean-path deep link wins over any hash.
    (globalThis as any).window = { location: { pathname: "/estimate/5-marla-house-construction-cost-lahore", hash: "" } };
    assert.equal(getEffectivePathname(), "/estimate/5-marla-house-construction-cost-lahore");
    // Plain root with no hash stays root.
    (globalThis as any).window = { location: { pathname: "/", hash: "" } };
    assert.equal(getEffectivePathname(), "/");
    // A hash that is not a route (e.g. #details) is not treated as one.
    (globalThis as any).window = { location: { pathname: "/", hash: "#details" } };
    assert.equal(getEffectivePathname(), "/");
  } finally {
    if (prevWindow === undefined) delete (globalThis as any).window;
    else (globalThis as any).window = prevWindow;
  }
});
