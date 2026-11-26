/**
 * prerender.ts — Step 3 (Prerender & Routing).
 *
 * Runs in postbuild (after `vite build`, before the sitemap step). Reads the
 * built dist/index.html as a template and emits dist/<route>/index.html for
 * EVERY route in scripts/routes.ts, so GitHub Pages serves real HTML with
 * HTTP 200 for each clean URL (no 404.html fallback, no hash redirect).
 *
 * Content is REUSED from the app's own SEO data — nothing is invented:
 *  - titles/descriptions: ALL_MODULES (src/lib/allModules) — the same strings SEOHead
 *    puts in <title>/<meta description> at runtime;
 *  - guide copy (intro, formulas, tables, worked example, related links):
 *    TOOL_GUIDES (src/seo/toolGuides.ts), the verified guide the SPA renders
 *    in ToolArticleWidget;
 *  - FAQs: SPECIFIC_FAQS (GlobalFAQ) — the same questions GlobalFAQ renders
 *    visibly, so FAQPage JSON-LD matches visible content. Tools with no
 *    specific FAQs get SEOHead's exact fallback (one templated Q&A);
 *  - brick pages: BrickCalculatorPage's own titles/descriptions/intros,
 *    BRICK_FAQS, its 4 HowTo steps and hreflang set, from
 *    src/seo/brickProgrammatic.ts + src/lib/brickCalc.ts;
 *  - static pages: the <SEO> title/description and <h1> of each page
 *    component (see STATIC_META below — each entry cites its source file);
 *  - blog posts: content/blog/*.md frontmatter + body.
 *
 * Hydration: every emitted file keeps the template's #root div and the
 * built <script type="module"> / CSS asset tags (rewritten to depth-relative
 * paths, because vite base is "./" — see rewriteAssetPaths). React's
 * createRoot therefore mounts over the static content exactly as it does on
 * dist/index.html; the static copy is what crawlers and no-JS clients see.
 *
 * Run: `npx tsx scripts/prerender.ts` (also wired into `npm run build` via
 * the postbuild chain in package.json). Exits non-zero on any failure.
 */
import fs from "node:fs";
import path from "node:path";
import { ALL_MODULES } from "../src/lib/allModules";
import { TOOL_GUIDES, type ToolGuide } from "../src/seo/toolGuides";
import { SPECIFIC_FAQS, type FAQItem } from "../src/components/ui/GlobalFAQ";
import {
  CITY_VARIANTS,
  BRICK_TYPE_VARIANTS,
  HOUSE_SIZE_VARIANTS,
  type CityVariant,
  type BrickTypeVariant,
  type HouseSizeVariant,
} from "../src/seo/brickProgrammatic";
import { BRICK_FAQS } from "../src/lib/brickCalc";
import {
  TOOL_IDS,
  GROUP_TO_CATEGORY,
  CATEGORY_SLUG_TO_CATEGORY,
  SEO_SLUG_TO_ID,
  LEGACY_SLUG_TO_ID,
} from "../src/lib/toolRoutes";
import {
  SITE_BASE,
  SITE_SUBPATH,
  DIST,
  ROOT,
  buildRoutes,
  loadBlogPosts,
  canonicalToolPath,
  type RouteEntry,
} from "./routes";

/* ------------------------------------------------------------------ */
/* Small helpers                                                       */
/* ------------------------------------------------------------------ */

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Root-relative link inside prerendered HTML (includes the hosting subpath). */
function href(p: string): string {
  return `${SITE_SUBPATH}${p}`;
}

function absUrl(p: string): string {
  return `${SITE_BASE}${p}`;
}

interface PageMeta {
  title: string;
  description: string;
  canonicalPath: string;
  h1: string;
  /** Visible body HTML (inside the static shell; must contain no <h1>). */
  body: string;
  jsonLd: object[];
  hreflang?: { lang: string; href: string }[];
}

/* ------------------------------------------------------------------ */
/* Shared data                                                         */
/* ------------------------------------------------------------------ */

const toolById = new Map(ALL_MODULES.map((m) => [m.id as string, m]));
// Dashboard category label -> /calculators/<group> (SEOHead's rule: the
// first group wins when two groups share one label).
const CATEGORY_TO_GROUP: Record<string, string> = Object.fromEntries(
  Object.entries(GROUP_TO_CATEGORY).map(([group, category]) => [category, group]),
);

/** "Last updated" line shown on brick pages (src/components/calculators/BrickCalculatorContent.tsx). */
const BRICK_LAST_UPDATED = (() => {
  const src = fs.readFileSync(
    path.join(ROOT, "src/components/calculators/BrickCalculatorContent.tsx"),
    "utf8",
  );
  const m = src.match(/BRICK_CONTENT_LAST_UPDATED\s*=\s*"([^"]+)"/);
  return m ? m[1] : "November 2026";
})();

const BRICK_MAIN_TITLE = "Brick Calculator Pakistan, India, UAE | Civil Estimation Pro";
const BRICK_MAIN_DESCRIPTION =
  "Free brick calculator for Pakistan, India & UAE. Bricks, cement bags, sand & total cost in PKR, INR or AED — with openings, wastage & local rates.";
const BRICK_MAIN_INTRO =
  "About 8.7 bricks per sq ft for a 9-inch wall — a 10 ft × 10 ft wall needs 917 bricks to order with 5% wastage. Calculate bricks, cement bags, sand and total cost for any wall — in PKR, INR, AED, GBP or USD. Deduct doors and windows, pick your brick size and mortar mix, and download the result as a PDF.";
/** The 4 HowTo steps from BrickCalculatorPage.tsx buildJsonLd (verbatim). */
const BRICK_HOWTO_STEPS: { name: string; text: string }[] = [
  { name: "Measure the wall", text: "Length × height gives the gross area. A 10 ft × 10 ft wall is 100 sq ft." },
  { name: "Deduct openings", text: "Every door and window is subtracted — a 3 × 7 ft door removes 21 sq ft of brickwork." },
  { name: "Pick the brick and joint", text: "A Pakistani Awwal brick is 9″ × 4½″ × 3″ with a 10 mm joint; Indian modular is 190 × 90 × 90 mm; UAE clay brick is 215 × 102.5 × 65 mm." },
  { name: "Add wastage and read the cost", text: "5% covers a normal rectangular wall; 10% covers kiln bricks or cut work. Enter your supplier's rates to see the material cost in PKR, INR or AED." },
];
const BRICK_RELATED = [
  { id: "calculators", title: "Construction Material Calculator", desc: "Concrete, bricks, steel, blocks and mortar in one place." },
  { id: "master-finishes", title: "Complete Finishes Workspace", desc: "Plaster, paint, flooring and finishes for the same walls." },
  { id: "master-quantity", title: "Master Quantity Estimator", desc: "Full quantity takeoff for the whole project, not just one wall." },
  { id: "house", title: "House Construction Cost Calculator", desc: "Grey structure and finishing cost for a full house in PKR." },
  { id: "master-rcc", title: "Master RCC Estimator", desc: "Concrete, steel and formwork for slabs, beams and columns." },
];
/** hreflang set from BrickCalculatorPage.tsx hreflangFor (same for every brick page). */
const BRICK_HREFLANG = [
  { lang: "en-PK", href: absUrl("/brick-calculator/lahore") },
  { lang: "en-IN", href: absUrl("/brick-calculator/delhi") },
  { lang: "en-AE", href: absUrl("/brick-calculator/dubai") },
  { lang: "en-GB", href: absUrl("/brick-calculator/london") },
  { lang: "en-US", href: absUrl("/brick-calculator/new-york") },
  { lang: "x-default", href: absUrl("/brick-calculator") },
];

/** Static-page meta, copied from each page component's own <SEO> + <h1>. */
const STATIC_META: Record<string, { title: string; description: string; h1: string; intro: string }> = {
  // src/components/pages/AboutUs.tsx
  about: {
    title: "About Us | Civil Estimation Pro",
    description: "Our mission is to simplify civil engineering estimations with cutting-edge tools.",
    h1: "Simplifying Civil Engineering Estimations",
    intro: "We are on a mission to build the next generation of intuitive, fast, and precise estimation and takeoff tools for the modern construction professional.",
  },
  // src/components/pages/Careers.tsx
  careers: {
    title: "Careers | Civil Estimation Pro",
    description: "Join our team and help build the future of construction software.",
    h1: "Join Our Team",
    intro: "Help us build the software that's literally building the world. We are always looking for passionate engineers, designers, and innovators.",
  },
  // src/components/pages/Contact.tsx
  contact: {
    title: "Contact Us — BOQ & Estimation Help",
    description: "Contact Civil Estimation Pro for help with BOQ calculators, material rates, pricing, or technical support. Send us a message and we will get back to you.",
    h1: "Get in Touch",
    intro: "Have questions about our tools, pricing, or need technical support? Our team is ready to help.",
  },
  // src/components/pages/PricingPage.tsx (no <h1> in the component; title text used)
  pricing: {
    title: "Construction Estimator Pricing",
    description: "Free calculators for everyone, with Pro plans for PDF exports, cloud saving and team tools — start a 14-day free trial, no credit card required.",
    h1: "Construction Estimator Pricing",
    intro: "Free calculators for everyone, with Pro plans for PDF exports, cloud saving and team tools. Start a 14-day free trial, no credit card required.",
  },
  // src/components/pages/LegalPages.tsx PAGE_DEFINITIONS
  privacy: {
    title: "Privacy Policy | Civil Estimation Pro",
    description: "Learn how we collect, use, and protect your data.",
    h1: "Privacy Policy",
    intro: "Learn how we collect, use, and protect your data. Last updated: May 15, 2026.",
  },
  terms: {
    title: "Terms of Service | Civil Estimation Pro",
    description: "The rules and guidelines for using our platform.",
    h1: "Terms of Service",
    intro: "The rules and guidelines for using our platform. Last updated: May 15, 2026.",
  },
  cookies: {
    title: "Cookie Policy | Civil Estimation Pro",
    description: "Information about how we use cookies and tracking.",
    h1: "Cookie Policy",
    intro: "Information about how we use cookies and tracking. Last updated: May 15, 2026.",
  },
  // src/components/pages/TeamCollaboration.tsx
  team: {
    title: "Team Collaboration & Sharing",
    description: "Share projects and collaborate with team members — invite viewers and editors, manage roles and keep every estimate in one shared workspace.",
    h1: "Team Collaboration",
    intro: "Share projects and collaborate with team members — invite viewers and editors, manage roles and keep every estimate in one shared workspace.",
  },
  // src/components/pages/JoinProject.tsx (no <h1> in the component; title text used)
  "join-project": {
    title: "Join a Shared Project Team",
    description: "Accept a project invite and join a shared workspace — view and edit estimates with your team once the invite link is verified and your membership is confirmed.",
    h1: "Join a Shared Project Team",
    intro: "Accept a project invite and join a shared workspace — view and edit estimates with your team once the invite link is verified and your membership is confirmed.",
  },
  // src/components/RecentEstimates.tsx
  "my-estimates": {
    title: "My Saved Estimates & Projects",
    description: "Manage your saved construction projects and estimates — reopen calculations, track progress and organise your work in one place, across projects.",
    h1: "My Projects",
    intro: "Manage your saved construction projects and estimates — reopen calculations, track progress and organise your work in one place, across projects.",
  },
  // src/components/StandardsReferencePage.tsx SEO_BY_COUNTRY.All
  standards: {
    title: "Engineering Standards & Codes Hub",
    description: "A reference library of civil engineering standards and building codes for India, Pakistan and the UAE — IS codes, MoRTH, BCP and Dubai Municipality.",
    h1: "Engineering Standards & Codes Hub",
    intro: "A reference library of civil engineering standards and building codes for India, Pakistan and the UAE — IS codes, MoRTH, BCP and Dubai Municipality.",
  },
  // src/components/pages/Blog.tsx
  blog: {
    title: "Blog | Civil Estimation Pro",
    description: "Insights, updates, and engineering tutorials from our experts.",
    h1: "Civil Estimation Pro Blog",
    intro: "Insights, updates, and tutorials from the team building the future of construction software.",
  },
};

/**
 * Per-country SEO for the four standards reference tools, copied from
 * src/components/StandardsReferencePage.tsx SEO_BY_COUNTRY / MORTH_SEO.
 * The SPA renders the same component for all four ids.
 */
const STANDARDS_SEO: Record<string, { title: string; description: string; h1: string }> = {
  "is-codes-reference": {
    title: "Indian Standards & Codes Reference",
    description: "Indian Standard codes and MoRTH/IRC specifications — IS 456, IS 800, IS 10262 and highway specs, with scope, clauses and linked calculators.",
    h1: "Indian Standards & Codes",
  },
  "pakistan-building-codes": {
    title: "Pakistan Building Codes Reference",
    description: "Building Code of Pakistan, NHA specifications and LDA/DHA bylaws — seismic provisions, zoning rules and approval requirements for building in Pakistan.",
    h1: "Pakistan Building Codes",
  },
  "uae-construction-standards": {
    title: "UAE Construction Standards Reference",
    description: "Dubai Building Code, Abu Dhabi International Building Code and UAE Fire & Life Safety Code — the construction standards behind our UAE calculators.",
    h1: "UAE Construction Standards",
  },
  "morth-irc-specs": {
    title: "MoRTH & IRC Specifications Guide",
    description: "MoRTH Specifications for Road and Bridge Works (5th Rev., 2013) and IRC codes — IRC:37-2018 flexible pavements, IRC:58-2015 rigid pavements, IRC:6-2017 bridge loads and IRC:112-2020 concrete bridges, with scope and linked calculators.",
    h1: "MoRTH & IRC Specifications",
  },
};

/* ------------------------------------------------------------------ */
/* HTML fragments (all content comes from the data above)              */
/* ------------------------------------------------------------------ */

function linkList(items: { id: string; title: string; desc: string }[]): string {
  return `<ul class="cep-links">${items
    .map(
      (it) =>
        `<li><a href="${esc(href(`/${it.id}`))}">${esc(it.title)}</a><p>${esc(it.desc)}</p></li>`,
    )
    .join("")}</ul>`;
}

function guideBody(guide: ToolGuide): string {
  const parts: string[] = [];
  parts.push(`<p class="cep-intro">${esc(guide.intro)}</p>`);
  if (guide.formulas.length > 0) {
    parts.push(`<section><h2>Formulas</h2><dl>${guide.formulas
      .map(
        (f) =>
          `<div><dt>${esc(f.formula)}</dt><dd>${esc(f.variables)}${f.note ? ` ${esc(f.note)}` : ""}</dd></div>`,
      )
      .join("")}</dl></section>`);
  }
  for (const t of guide.tables) {
    parts.push(
      `<section><h2>${esc(t.title)}</h2><table><thead><tr>${t.headers.map((h) => `<th>${esc(h)}</th>`).join("")}</tr></thead><tbody>${t.rows
        .map((row) => `<tr>${row.map((c) => `<td>${esc(c)}</td>`).join("")}</tr>`)
        .join("")}</tbody></table></section>`,
    );
  }
  const ex = guide.workedExample;
  parts.push(
    `<section><h2>Worked example: ${esc(ex.title)}</h2><p>${esc(ex.inputs)}</p><ol>${ex.steps
      .map((s) => `<li>${esc(s)}</li>`)
      .join("")}</ol><p><strong>Result:</strong> ${esc(ex.result)}</p></section>`,
  );
  return parts.join("\n");
}

function faqBody(faqs: FAQItem[]): string {
  if (faqs.length === 0) return "";
  return `<section><h2>Frequently asked questions</h2>${faqs
    .map(
      (f) =>
        `<details><summary>${esc(f.question)}</summary><p>${esc(f.answer)}</p></details>`,
    )
    .join("")}</section>`;
}

function faqJsonLd(faqs: FAQItem[]): object {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

function breadcrumbJsonLd(items: { name: string; item?: string }[]): object {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      ...(it.item ? { item: it.item } : {}),
    })),
  };
}

function webAppJsonLd(name: string, description: string, url: string): object {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name,
    description,
    applicationCategory: "BusinessApplication",
    operatingSystem: "All",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    url,
  };
}

function howToJsonLd(name: string, steps: string[]): object | null {
  if (steps.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name,
    step: steps.map((text) => ({ "@type": "HowToStep", text })),
  };
}

/** FAQs for a tool: the tool's SPECIFIC_FAQS, else SEOHead's exact fallback. */
function faqsForTool(toolId: string, toolTitle: string, toolDesc: string): FAQItem[] {
  const specific = SPECIFIC_FAQS[toolId] ?? [];
  if (specific.length > 0) return specific;
  return [{ question: `What is the ${toolTitle} used for?`, answer: toolDesc }];
}

/** Category landing URL for a tool (SEOHead's rule), or the site root. */
function categoryUrlFor(category: string): string {
  const group = CATEGORY_TO_GROUP[category];
  return group ? absUrl(`/calculators/${group}`) : SITE_BASE;
}

function relatedLinks(guide: ToolGuide | undefined): string {
  if (!guide || guide.related.length === 0) return "";
  const items = guide.related
    .filter((r) => toolById.has(r.id))
    .map((r) => ({ id: r.id, title: r.title, desc: r.desc }));
  if (items.length === 0) return "";
  return `<section><h2>Related calculators</h2>${linkList(items)}</section>`;
}

/** Popular-tools link block used on hub/static pages (real titles/descs). */
const POPULAR_IDS = ["brick-calculator", "house", "master-quantity", "master-rcc", "boq", "mix-design", "rates", "marla-converter"];
function popularToolsBlock(): string {
  const items = POPULAR_IDS.map((id) => {
    const m = toolById.get(id)!;
    return { id, title: m.title as string, desc: m.desc as string };
  });
  return `<section><h2>Popular calculators</h2>${linkList(items)}<p><a href="${esc(href("/tools"))}">Browse all ${TOOL_IDS.length} calculators</a></p></section>`;
}

/* ------------------------------------------------------------------ */
/* Page builders                                                       */
/* ------------------------------------------------------------------ */

function toolPage(route: RouteEntry): PageMeta {
  const toolId = route.toolId!;
  // /cost-guide-pakistan has no Dashboard card: resolvePath maps it to the
  // tool it renders (pakistan-cost-calculator), so the SPA shows that
  // tool's title/description/guide/FAQs here. The canonical is already
  // /pakistan-cost-calculator (routes.ts).
  const renderedId = toolId === "cost-guide-pakistan" ? "pakistan-cost-calculator" : toolId;
  const mod = toolById.get(renderedId);
  if (!mod) throw new Error(`[prerender] no ALL_MODULES entry for tool ${renderedId}`);
  const title0 = mod.title as string;
  const desc = mod.desc as string;
  const category = mod.category as string;
  const canonicalPath = route.canonicalPath;
  const canonical = absUrl(canonicalPath);

  // Brick renders its own shell page (BrickCalculatorPage) with its own
  // titles, FAQs, HowTo and hreflang — handled by brickPage().
  if (toolId === "brick-calculator") return brickPage(route, null);

  const std = STANDARDS_SEO[renderedId];
  const title = std ? std.title : `${title0} | Civil Estimation Pro`;
  const description = std ? std.description : desc;
  const h1 = std ? std.h1 : title0;
  // The standards family renders StandardsReferencePage, whose guide is the
  // "standards" TOOL_GUIDES entry (its own HowTo source in that file).
  const guide = TOOL_GUIDES[renderedId] ?? (std ? TOOL_GUIDES["standards"] : undefined);
  const faqs = faqsForTool(renderedId, title0, desc);
  const howTo = guide ? howToJsonLd(`How to use ${title0}`, guide.workedExample.steps) : null;

  const body = [
    `<p class="cep-intro">${esc(description)}</p>`,
    `<p>Use the free ${esc(title0)} below — enter your measurements and the results, quantities and costs are calculated instantly. No sign-up needed.</p>`,
    guide ? guideBody(guide) : "",
    faqBody(faqs),
    relatedLinks(guide),
    `<section><h2>More calculators</h2><p><a href="${esc(href(categoryUrlFor(category).replace(SITE_BASE, "")))}">All ${esc(category)} calculators</a> · <a href="${esc(href("/tools"))}">Browse all ${TOOL_IDS.length} calculators</a></p></section>`,
  ].join("\n");

  return {
    title,
    description,
    canonicalPath,
    h1,
    body,
    jsonLd: [
      webAppJsonLd(`${title0} | Civil Estimation Pro`, description, canonical),
      ...(howTo ? [howTo] : []),
      faqJsonLd(faqs),
      breadcrumbJsonLd([
        { name: "Home", item: SITE_BASE },
        { name: category, item: categoryUrlFor(category) },
        { name: title0, item: canonical },
      ]),
    ],
  };
}

function brickPage(route: RouteEntry, variant: { kind: string; data: CityVariant | BrickTypeVariant | HouseSizeVariant } | null): PageMeta {
  const canonical = absUrl(route.canonicalPath);
  const brickFaqs: FAQItem[] = BRICK_FAQS.map((f) => ({ question: f.q, answer: f.a }));
  const guide = TOOL_GUIDES["brick-calculator"];
  const variantLinks = [
    ...CITY_VARIANTS.map((c) => ({ id: `brick-calculator/${c.slug}`, title: `Brick Calculator ${c.name}`, desc: c.description })),
    ...BRICK_TYPE_VARIANTS.map((t) => ({ id: `brick-calculator/${t.slug}`, title: t.title, desc: t.description })),
    ...HOUSE_SIZE_VARIANTS.map((s) => ({ id: `brick-calculator/${s.slug}`, title: s.title, desc: s.description })),
  ];
  // linkList() prefixes "/"+id — brick variant ids already contain the path.
  const variantList = `<ul class="cep-links">${variantLinks
    .map((it) => `<li><a href="${esc(href(`/${it.id}`))}">${esc(it.title)}</a><p>${esc(it.desc)}</p></li>`)
    .join("")}</ul>`;

  if (!variant) {
    const body = [
      `<p class="cep-intro">${esc(BRICK_MAIN_INTRO)}</p>`,
      `<p>Last updated: ${esc(BRICK_LAST_UPDATED)} · Free · No sign-up</p>`,
      guide ? guideBody(guide) : "",
      faqBody(brickFaqs),
      `<section><h2>Related calculators</h2>${linkList(BRICK_RELATED)}</section>`,
      `<section><h2>Brick calculators by city, type and house size</h2>${variantList}</section>`,
    ].join("\n");
    return {
      title: BRICK_MAIN_TITLE,
      description: BRICK_MAIN_DESCRIPTION,
      canonicalPath: route.canonicalPath,
      h1: "Brick Calculator",
      body,
      hreflang: BRICK_HREFLANG,
      jsonLd: [
        { ...webAppJsonLd("Brick Calculator", BRICK_MAIN_DESCRIPTION, canonical), applicationCategory: "UtilitiesApplication", operatingSystem: "Web",
          featureList: ["Wall length, height and thickness (4.5, 9, 13.5 and 18 inch)", "Multi-wall room projects and total wall area mode", "Doors and windows deduction, per opening or by total area", "Pakistani, Indian, US, UAE and UK brick sizes plus custom size", "Stretcher, English and Flemish bond patterns with a live wall drawing", "Cement bags and sand quantity", "Cost in PKR, INR, AED, GBP and USD, with optional labour cost", "Packs, pallets and truckloads to order", "Reverse mode (bricks to wall area) and budget mode (area and budget to price)", "Gable-end and curved-wall input", "PDF download, print, share, copy and CSV/Excel export of the results"] },
        { "@context": "https://schema.org", "@type": "HowTo", name: "How to calculate bricks for a wall", description: BRICK_MAIN_DESCRIPTION,
          step: BRICK_HOWTO_STEPS.map((s) => ({ "@type": "HowToStep", name: s.name, text: s.text })) },
        faqJsonLd(brickFaqs),
        breadcrumbJsonLd([
          { name: "Home", item: SITE_BASE },
          { name: "Calculators", item: absUrl("/calculators") },
          { name: "Brick Calculator", item: canonical },
        ]),
      ],
    };
  }

  const data = variant.data;
  const title = data.title;
  const description = data.description;
  const h1 =
    variant.kind === "city"
      ? `Brick Calculator ${(data as CityVariant).name}`
      : variant.kind === "type"
        ? `${(data as BrickTypeVariant).name} Calculator`
        : `Bricks for a ${(data as HouseSizeVariant).name}`;
  const extras: string[] = [`<p class="cep-intro">${esc(data.intro)}</p>`];
  if (variant.kind === "city") {
    const c = data as CityVariant;
    extras.push(`<p>${esc(c.localNote)}</p>`);
    extras.push(
      `<section><h2>Indicative rates — ${esc(c.name)} (${esc(c.rateDate)})</h2><p>Brick: ${c.brickPer1000 === null ? "not verified — enter your supplier's rate" : `${c.brickPer1000.toLocaleString("en-US")} per 1,000`} · Cement: ${c.cementPerBag === null ? "not verified" : `${c.cementPerBag.toLocaleString("en-US")} per bag`} · Sand: ${c.sandPerUnit === null ? "not verified" : `${c.sandPerUnit} per unit`}. Source: ${esc(c.rateSource)}</p></section>`,
    );
  } else if (variant.kind === "type") {
    const t = data as BrickTypeVariant;
    extras.push(`<p><strong>Best for:</strong> ${esc(t.bestFor)}</p><p><strong>Watch out:</strong> ${esc(t.watchOut)}</p><p><strong>Indicative price:</strong> ${esc(t.pricePer1000Range)}</p>`);
  } else {
    const s = data as HouseSizeVariant;
    extras.push(`<p><strong>Method:</strong> ${esc(s.method)}</p>`);
    extras.push(
      `<section><h2>Brick breakdown — ${esc(s.name)}</h2><table><thead><tr><th>Part</th><th>Bricks</th></tr></thead><tbody><tr><td>External walls</td><td>${s.externalBricks.toLocaleString("en-US")}</td></tr><tr><td>Internal walls</td><td>${s.internalBricks.toLocaleString("en-US")}</td></tr><tr><td>Boundary wall</td><td>${s.boundaryBricks.toLocaleString("en-US")}</td></tr><tr><td><strong>Total (incl. 5% wastage)</strong></td><td><strong>${s.totalBricks.toLocaleString("en-US")}</strong></td></tr></tbody></table></section>`,
    );
  }
  const body = [
    ...extras,
    `<p>Last updated: ${esc(BRICK_LAST_UPDATED)} · Free · No sign-up</p>`,
    faqBody(brickFaqs),
    `<section><h2>Related calculators</h2>${linkList(BRICK_RELATED)}</section>`,
    `<section><h2>More brick calculators</h2>${variantList}</section>`,
  ].join("\n");
  return {
    title,
    description,
    canonicalPath: route.canonicalPath,
    h1,
    body,
    hreflang: BRICK_HREFLANG,
    jsonLd: [
      { ...webAppJsonLd("Brick Calculator", description, canonical), applicationCategory: "UtilitiesApplication", operatingSystem: "Web" },
      { "@context": "https://schema.org", "@type": "HowTo", name: "How to calculate bricks for a wall", description,
        step: BRICK_HOWTO_STEPS.map((s) => ({ "@type": "HowToStep", name: s.name, text: s.text })) },
      faqJsonLd(brickFaqs),
      breadcrumbJsonLd([
        { name: "Home", item: SITE_BASE },
        { name: "Calculators", item: absUrl("/calculators") },
        { name: "Brick Calculator", item: absUrl("/brick-calculator") },
        { name: h1, item: canonical },
      ]),
    ],
  };
}

function categoryPage(route: RouteEntry, label: string, groupPath?: string): PageMeta {
  const tools = ALL_MODULES.filter((m) => (m.category as string) === label).map((m) => ({
    id: m.id as string,
    title: m.title as string,
    desc: m.desc as string,
  }));
  const body = [
    `<p class="cep-intro">${tools.length} free calculators for ${esc(label)} — quantities, materials and costs, no sign-up needed.</p>`,
    linkList(tools),
    popularToolsBlock(),
  ].join("\n");
  return {
    title: `${label} Calculators | Civil Estimation Pro`,
    description: `${tools.length} free ${label.toLowerCase()} calculators — quantities, materials and costs for construction projects in Pakistan, India and the UAE.`,
    canonicalPath: route.canonicalPath,
    h1: `${label} Calculators`,
    body,
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: `${label} Calculators`,
        description: `${tools.length} free ${label.toLowerCase()} calculators.`,
        url: absUrl(route.canonicalPath),
        hasPart: tools.map((t) => ({ "@type": "WebApplication", name: t.title, url: absUrl(`/${t.id}`) })),
      },
      breadcrumbJsonLd([
        { name: "Home", item: SITE_BASE },
        ...(groupPath
          ? [{ name: "Calculators", item: absUrl("/calculators") }]
          : []),
        { name: label, item: absUrl(route.canonicalPath) },
      ]),
    ],
  };
}

function countryPage(route: RouteEntry, code: string): PageMeta {
  const names: Record<string, string> = { pk: "Pakistan", in: "India", ae: "UAE", uk: "United Kingdom" };
  const name = names[code] ?? code.toUpperCase();
  const pick: Record<string, string[]> = {
    pk: ["brick-calculator/lahore", "brick-calculator/karachi", "brick-calculator/islamabad", "brick-calculator/rawalpindi", "house", "pakistan-cost-calculator", "marla-converter", "rates"],
    in: ["brick-calculator/delhi", "brick-calculator/mumbai", "is-codes-reference", "morth-irc-specs", "house", "mix-design", "rates"],
    ae: ["brick-calculator/dubai", "brick-calculator/abu-dhabi", "uae-construction-standards", "house", "rates"],
    uk: ["brick-calculator", "house", "master-quantity", "master-rcc", "boq", "rates"],
  };
  const items = (pick[code] ?? []).map((p) => {
    if (p.startsWith("brick-calculator/")) {
      const slug = p.split("/")[1];
      const city = CITY_VARIANTS.find((c) => c.slug === slug);
      const type = BRICK_TYPE_VARIANTS.find((t) => t.slug === slug);
      const size = HOUSE_SIZE_VARIANTS.find((s) => s.slug === slug);
      const v = city ?? type ?? size;
      return { id: p, title: v ? v.title : p, desc: v ? v.description : "" };
    }
    const m = toolById.get(p)!;
    return { id: p, title: m.title as string, desc: m.desc as string };
  });
  const body = [
    `<p class="cep-intro">Free construction quantity, BOQ and cost calculators for ${esc(name)} — bricks, concrete, steel, masonry, finishes, earthworks and more.</p>`,
    `<section><h2>Calculators for ${esc(name)}</h2>${linkList(items)}</section>`,
    popularToolsBlock(),
  ].join("\n");
  return {
    title: `Construction Calculators for ${name} | Civil Estimation Pro`,
    description: `Free construction quantity, BOQ and cost calculators for ${name} — bricks, concrete, steel, masonry, finishes and earthworks.`,
    canonicalPath: route.canonicalPath,
    h1: `Construction Calculators for ${name}`,
    body,
    jsonLd: [
      { "@context": "https://schema.org", "@type": "WebPage", name: `Construction Calculators for ${name}`, url: absUrl(route.canonicalPath) },
      breadcrumbJsonLd([
        { name: "Home", item: SITE_BASE },
        { name, item: absUrl(route.canonicalPath) },
      ]),
    ],
  };
}

function staticPage(route: RouteEntry): PageMeta {
  const id = route.path.slice(1);
  const meta = STATIC_META[id];
  if (!meta) throw new Error(`[prerender] no STATIC_META for /${id}`);
  const extra =
    id === "standards"
      ? `<section><h2>Standards references</h2>${linkList(
          ["is-codes-reference", "pakistan-building-codes", "uae-construction-standards", "morth-irc-specs"].map((tid) => {
            const s = STANDARDS_SEO[tid];
            return { id: tid, title: s.title, desc: s.description };
          }),
        )}</section>`
      : "";
  return {
    title: meta.title,
    description: meta.description,
    canonicalPath: route.canonicalPath,
    h1: meta.h1,
    body: [`<p class="cep-intro">${esc(meta.intro)}</p>`, extra, popularToolsBlock()].join("\n"),
    jsonLd: [
      { "@context": "https://schema.org", "@type": "WebPage", name: meta.title, description: meta.description, url: absUrl(route.canonicalPath) },
      breadcrumbJsonLd([
        { name: "Home", item: SITE_BASE },
        { name: meta.h1, item: absUrl(route.canonicalPath) },
      ]),
    ],
  };
}

/** Minimal markdown -> HTML for content/blog/*.md bodies. Top-level "#" becomes
 * <h2> (the page <h1> is the post title); raw-HTML lines pass through with
 * className -> class. The SPA renders the full markdown on hydration. */
function markdownToHtml(md: string): string {
  const lines = md.split("\n");
  const out: string[] = [];
  let inUl = false;
  let inOl = false;
  let inPre = false;
  const closeLists = () => {
    if (inUl) { out.push("</ul>"); inUl = false; }
    if (inOl) { out.push("</ol>"); inOl = false; }
  };
  const inline = (s: string) =>
    esc(s)
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, t, u) => `<a href="${esc(u)}">${esc(t)}</a>`);
  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    if (line.trim() === "```") {
      closeLists();
      inPre = !inPre;
      out.push(inPre ? "<pre>" : "</pre>");
      continue;
    }
    if (inPre) { out.push(esc(line)); continue; }
    if (line.trim() === "") { closeLists(); continue; }
    if (line.startsWith("<")) { closeLists(); out.push(line.replace(/className=/g, "class=")); continue; }
    const h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) {
      closeLists();
      const level = Math.min(h[1].length + 1, 4); // "#" -> h2, keeps one <h1> per page
      out.push(`<h${level}>${inline(h[2])}</h${level}>`);
      continue;
    }
    const ul = line.match(/^[-*]\s+(.*)$/);
    if (ul) {
      if (!inUl) { closeLists(); out.push("<ul>"); inUl = true; }
      out.push(`<li>${inline(ul[1])}</li>`);
      continue;
    }
    const ol = line.match(/^\d+[.)]\s+(.*)$/);
    if (ol) {
      if (!inOl) { closeLists(); out.push("<ol>"); inOl = true; }
      out.push(`<li>${inline(ol[1])}</li>`);
      continue;
    }
    closeLists();
    out.push(`<p>${inline(line)}</p>`);
  }
  closeLists();
  if (inPre) out.push("</pre>");
  return out.join("\n");
}

function blogPostPage(route: RouteEntry): PageMeta {
  const slug = route.path.split("/").pop()!;
  const post = loadBlogPosts().find((p) => p.slug === slug);
  if (!post) throw new Error(`[prerender] no blog post for ${route.path}`);
  const title = `${post.title} | Civil Estimation Pro Blog`;
  return {
    title,
    description: post.excerpt,
    canonicalPath: route.canonicalPath,
    h1: post.title,
    body: [
      `<p class="cep-meta">${esc(post.category)} · ${esc(new Date(post.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }))} · By ${esc(post.author)}</p>`,
      `<p class="cep-intro">${esc(post.excerpt)}</p>`,
      markdownToHtml(post.body),
      `<p><a href="${esc(href("/blog"))}">Back to all posts</a></p>`,
      popularToolsBlock(),
    ].join("\n"),
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: post.title,
        description: post.excerpt,
        author: { "@type": "Person", name: post.author },
        datePublished: post.date,
        url: absUrl(route.canonicalPath),
        mainEntityOfPage: absUrl(route.canonicalPath),
      },
      breadcrumbJsonLd([
        { name: "Home", item: SITE_BASE },
        { name: "Blog", item: absUrl("/blog") },
        { name: post.title, item: absUrl(route.canonicalPath) },
      ]),
    ],
  };
}

function blogListingPage(route: RouteEntry): PageMeta {
  const posts = loadBlogPosts();
  const cards = posts
    .map(
      (p) =>
        `<li><a href="${esc(href(`/blog/${p.slug}`))}">${esc(p.title)}</a><p>${esc(p.excerpt)}</p><p class="cep-meta">${esc(p.category)} · ${esc(new Date(p.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }))} · By ${esc(p.author)}</p></li>`,
    )
    .join("");
  return {
    title: STATIC_META.blog.title,
    description: STATIC_META.blog.description,
    canonicalPath: route.canonicalPath,
    h1: STATIC_META.blog.h1,
    body: [`<p class="cep-intro">${esc(STATIC_META.blog.intro)}</p>`, `<ul class="cep-links">${cards}</ul>`, popularToolsBlock()].join("\n"),
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "Blog",
        name: "Civil Estimation Pro Blog",
        url: absUrl(route.canonicalPath),
        blogPost: posts.map((p) => ({ "@type": "BlogPosting", headline: p.title, url: absUrl(`/blog/${p.slug}`), datePublished: p.date })),
      },
      breadcrumbJsonLd([
        { name: "Home", item: SITE_BASE },
        { name: "Blog", item: absUrl(route.canonicalPath) },
      ]),
    ],
  };
}

function estimatePage(route: RouteEntry): PageMeta {
  const m = route.path.match(/^\/estimate\/(\d+(?:\.\d+)?-(?:marla|kanal))-house-construction-cost-(.+)$/);
  if (!m) throw new Error(`[prerender] bad estimate route ${route.path}`);
  const sizeSlug = m[1];
  const citySlug = m[2];
  const sizeLabel = sizeSlug.replace("-marla", " Marla").replace("-kanal", " Kanal");
  const cityLabel = citySlug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  const house = toolById.get("house")!;
  const guide = TOOL_GUIDES["house"];
  const faqs = faqsForTool("house", house.title as string, house.desc as string);
  const title = `${sizeLabel} House Construction Cost in ${cityLabel} | Civil Estimation Pro`;
  const description = `House construction cost for a ${sizeLabel.toLowerCase()} house in ${cityLabel} — grey structure, finishes and add-ons in PKR. Price your exact plot with the free estimator.`;
  const body = [
    `<p class="cep-intro">${esc(description)}</p>`,
    guide ? guideBody(guide) : "",
    faqBody(faqs),
    `<section><h2>Price your house</h2><p><a href="${esc(href("/house"))}">Open the House Construction Cost Estimator</a> and enter your plot size, city and finish level for an exact figure.</p></section>`,
    relatedLinks(guide),
  ].join("\n");
  return {
    title,
    description,
    canonicalPath: route.canonicalPath,
    h1: `${sizeLabel} House Construction Cost in ${cityLabel}`,
    body,
    jsonLd: [
      webAppJsonLd(`${house.title as string} | Civil Estimation Pro`, house.desc as string, absUrl(route.canonicalPath)),
      ...(guide ? [howToJsonLd(`How to use ${house.title as string}`, guide.workedExample.steps)!] : []),
      faqJsonLd(faqs),
      breadcrumbJsonLd([
        { name: "Home", item: SITE_BASE },
        { name: "House Construction Cost Estimator", item: absUrl("/house") },
        { name: `${sizeLabel} House in ${cityLabel}`, item: absUrl(route.canonicalPath) },
      ]),
    ],
  };
}

function homePage(route: RouteEntry): PageMeta {
  const categories = [...new Set(ALL_MODULES.map((m) => m.category as string))];
  const sections = categories
    .map((cat) => {
      const group = CATEGORY_TO_GROUP[cat];
      const tools = ALL_MODULES.filter((m) => (m.category as string) === cat).map((m) => ({
        id: m.id as string,
        title: m.title as string,
        desc: m.desc as string,
      }));
      const heading = group
        ? `<h2><a href="${esc(href(`/calculators/${group}`))}">${esc(cat)}</a></h2>`
        : `<h2>${esc(cat)}</h2>`;
      return `<section>${heading}${linkList(tools)}</section>`;
    })
    .join("\n");
  const posts = loadBlogPosts();
  return {
    title: "Civil Estimation Pro | BOQ & Construction Cost Calculators",
    description:
      "Civil Estimation Pro: free construction quantity, BOQ and cost estimation calculators for concrete, steel, masonry, finishes, earthworks and more.",
    canonicalPath: "/",
    h1: "Estimate quantities and costs in minutes, not days",
    body: [
      `<p class="cep-intro">Calculators for concrete, steel, masonry, finishes, earthworks and roads, plus a guided workflow that turns your measurements into a priced Bill of Quantities.</p>`,
      sections,
      `<section><h2>From the blog</h2><ul class="cep-links">${posts
        .map((p) => `<li><a href="${esc(href(`/blog/${p.slug}`))}">${esc(p.title)}</a><p>${esc(p.excerpt)}</p></li>`)
        .join("")}</ul></section>`,
      `<section><h2>Browse by category</h2><ul class="cep-links">${Object.entries(CATEGORY_SLUG_TO_CATEGORY)
        .map(([slug, label]) => `<li><a href="${esc(href(`/category/${slug}`))}">${esc(label)} Calculators</a></li>`)
        .join("")}</ul></section>`,
    ].join("\n"),
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "Civil Estimation Pro",
        url: SITE_BASE,
        description:
          "Free construction quantity, BOQ and cost estimation calculators for concrete, steel, masonry, finishes, earthworks and more.",
      },
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Civil Estimation Pro",
        url: SITE_BASE,
        email: "support@civilestimationpro.com",
      },
    ],
  };
}

function toolsHubPage(route: RouteEntry): PageMeta {
  const categories = [...new Set(ALL_MODULES.map((m) => m.category as string))];
  const sections = categories
    .map((cat) => {
      const tools = ALL_MODULES.filter((m) => (m.category as string) === cat).map((m) => ({
        id: m.id as string,
        title: m.title as string,
        desc: m.desc as string,
      }));
      return `<section><h2>${esc(cat)}</h2>${linkList(tools)}</section>`;
    })
    .join("\n");
  return {
    title: "All Calculators | Civil Estimation Pro",
    description: `All ${TOOL_IDS.length} free construction calculators from Civil Estimation Pro — concrete, steel, masonry, finishes, earthworks, roads and more.`,
    canonicalPath: "/tools",
    h1: "All Calculators",
    body: [`<p class="cep-intro">All ${TOOL_IDS.length} free construction calculators — quantities, materials and costs, no sign-up needed.</p>`, sections].join("\n"),
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "All Calculators",
        url: absUrl("/tools"),
        hasPart: ALL_MODULES.map((m) => ({ "@type": "WebApplication", name: m.title as string, url: absUrl(`/${m.id as string}`) })),
      },
      breadcrumbJsonLd([
        { name: "Home", item: SITE_BASE },
        { name: "All Calculators", item: absUrl("/tools") },
      ]),
    ],
  };
}

function pageFor(route: RouteEntry): PageMeta {
  switch (route.kind) {
    case "home":
      return homePage(route);
    case "tool":
    case "seo-form":
    case "legacy-slug":
      return toolPage(route);
    case "brick-variant": {
      const slug = route.path.split("/").pop()!;
      const city = CITY_VARIANTS.find((c) => c.slug === slug);
      if (city) return brickPage(route, { kind: "city", data: city });
      const type = BRICK_TYPE_VARIANTS.find((t) => t.slug === slug);
      if (type) return brickPage(route, { kind: "type", data: type });
      const size = HOUSE_SIZE_VARIANTS.find((s) => s.slug === slug);
      if (size) return brickPage(route, { kind: "size", data: size });
      throw new Error(`[prerender] unknown brick variant ${route.path}`);
    }
    case "group": {
      if (route.path === "/calculators/standards") {
        // The SPA renders the standards hub here but canonicalises it onto
        // /standards (StandardsReferencePage SEO_BY_COUNTRY.All).
        return staticPage({ ...route, path: "/standards", canonicalPath: "/standards" });
      }
      const group = route.path.split("/").pop()!;
      return categoryPage(route, GROUP_TO_CATEGORY[group], route.path);
    }
    case "category": {
      const slug = route.path.split("/").pop()!;
      return categoryPage(route, CATEGORY_SLUG_TO_CATEGORY[slug]);
    }
    case "country":
      return countryPage(route, route.path.slice(1));
    case "static":
      if (route.path === "/blog") return blogListingPage(route);
      return staticPage(route);
    case "blog-post":
      return blogPostPage(route);
    case "estimate":
      return estimatePage(route);
    case "tools-hub":
      return toolsHubPage(route);
    default:
      throw new Error(`[prerender] unhandled kind ${(route as RouteEntry).kind} for ${route.path}`);
  }
}

/* ------------------------------------------------------------------ */
/* Template transform                                                  */
/* ------------------------------------------------------------------ */

/** Split an HTML document into the parts around #root's inner content.
 * Returns null when the structure is not as expected. */
function splitRoot(html: string): { before: string; inner: string; after: string } | null {
  const rootStart = html.indexOf('<div id="root"');
  if (rootStart === -1) return null;
  const rootOpenEnd = html.indexOf(">", rootStart) + 1;
  // #root is the last <div> before </body> (vite hoists the module <script>
  // into <head>, so it cannot be used as the anchor after #root).
  const bodyCloseIdx = html.indexOf("</body>", rootOpenEnd);
  if (bodyCloseIdx === -1) return null;
  const rootCloseIdx = html.lastIndexOf("</div>", bodyCloseIdx);
  if (rootCloseIdx <= rootOpenEnd) return null;
  return {
    before: html.slice(0, rootOpenEnd),
    inner: html.slice(rootOpenEnd, rootCloseIdx),
    after: html.slice(rootCloseIdx),
  };
}

/** Minimal first-paint styling for the static shell (design system:
 * Mona Sans, amber #F2A413, ink #1F1D1A, light theme). The app's own
 * stylesheet takes over on mount; this only makes the pre-hydration and
 * no-JS view readable. */
const PRERENDER_STYLE = `<style id="cep-prerender">
.cep-static{font-family:"Mona Sans",system-ui,-apple-system,"Segoe UI",sans-serif;color:#1F1D1A;background:#fff;max-width:880px;margin:0 auto;padding:24px 20px 64px;line-height:1.6}
.cep-static h1{font-size:32px;line-height:1.2;font-weight:800;letter-spacing:-.02em;margin:8px 0 16px}
.cep-static h2{font-size:22px;font-weight:700;margin:32px 0 12px}
.cep-static h3{font-size:18px;font-weight:700;margin:24px 0 8px}
.cep-static a{color:#885202;text-decoration:underline;text-underline-offset:3px}
.cep-static .cep-crumbs{font-size:13px;color:#6b675f;margin-bottom:8px}
.cep-static .cep-crumbs a{color:#6b675f}
.cep-static .cep-intro{font-size:18px;color:#3d3a34}
.cep-static .cep-meta{font-size:13px;color:#6b675f}
.cep-static .cep-links{list-style:none;padding:0;display:grid;gap:12px}
.cep-static .cep-links li{border:1px solid #ead9b8;border-radius:12px;padding:12px 16px;background:#FFF9EF}
.cep-static .cep-links a{font-weight:700;text-decoration:none;color:#1F1D1A}
.cep-static .cep-links a:hover{color:#885202;text-decoration:underline}
.cep-static .cep-links p{margin:4px 0 0;font-size:14px;color:#6b675f}
.cep-static table{border-collapse:collapse;width:100%;margin:12px 0}
.cep-static th,.cep-static td{border:1px solid #e5ddd0;padding:8px 10px;text-align:left;font-size:14px}
.cep-static th{background:#FFF3D6}
.cep-static details{border:1px solid #e5ddd0;border-radius:10px;padding:10px 14px;margin:8px 0}
.cep-static summary{font-weight:700;cursor:pointer}
.cep-static .cep-foot{margin-top:48px;padding-top:16px;border-top:1px solid #e5ddd0;font-size:13px;color:#6b675f}
.cep-static .cep-foot a{color:#6b675f}
</style>`;

function breadcrumbsHtml(route: RouteEntry, h1: string): string {
  const crumbs: { label: string; path?: string }[] = [{ label: "Home", path: "/" }];
  const segs = route.path.split("/").filter(Boolean);
  if (segs.length === 1) {
    // Single-segment page: only the current page follows Home.
  } else if (segs[0] === "calculators" && segs.length >= 2) {
    crumbs.push({ label: "Calculators", path: "/calculators" });
    if (segs.length === 3) {
      const toolId = route.toolId ?? "";
      const mod = toolById.get(toolId);
      if (mod) crumbs.push({ label: mod.title as string, path: `/${toolId}` });
    }
  } else if (segs[0] === "brick-calculator") {
    crumbs.push({ label: "Brick Calculator", path: "/brick-calculator" });
  } else if (segs[0] === "blog") {
    crumbs.push({ label: "Blog", path: "/blog" });
  } else if (segs[0] === "category") {
    crumbs.push({ label: "Categories", path: "/tools" });
  } else if (segs[0] === "estimate") {
    crumbs.push({ label: "House Construction Cost Estimator", path: "/house" });
  }
  const inner = crumbs
    .map((c) => (c.path ? `<a href="${esc(href(c.path))}">${esc(c.label)}</a>` : esc(c.label)))
    .join(" › ");
  return `<nav class="cep-crumbs" aria-label="Breadcrumb">${inner} › ${esc(h1)}</nav>`;
}

/**
 * vite base is "./", so the built index.html references ./assets/... and
 * ./fonts/... — correct at the site root, broken one level down. Rewrite
 * them to depth-relative paths (../assets/...), which resolve on both the
 * GitHub Pages project page and the custom domain.
 */
function rewriteAssetPaths(html: string, depth: number): string {
  if (depth === 0) return html;
  const prefix = "../".repeat(depth);
  return html.replaceAll("./assets/", `${prefix}assets/`).replaceAll("./fonts/", `${prefix}fonts/`);
}

function renderPage(template: string, route: RouteEntry, meta: PageMeta): string {
  const depth = route.path === "/" ? 0 : route.path.split("/").filter(Boolean).length;
  let html = rewriteAssetPaths(template, depth);

  // <title> + meta description (the template's home values are replaced).
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${esc(meta.title)}</title>`);
  html = html.replace(
    /<meta name="description" content="[^"]*" \/>/,
    `<meta name="description" content="${esc(meta.description)}" />`,
  );

  // Head extras: canonical, OG/Twitter, hreflang, JSON-LD, static styling.
  const headExtras = [
    `<link rel="canonical" href="${esc(absUrl(meta.canonicalPath))}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="Civil Estimation Pro" />`,
    `<meta property="og:title" content="${esc(meta.title)}" />`,
    `<meta property="og:description" content="${esc(meta.description)}" />`,
    `<meta property="og:url" content="${esc(absUrl(meta.canonicalPath))}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(meta.title)}" />`,
    `<meta name="twitter:description" content="${esc(meta.description)}" />`,
    ...(meta.hreflang ?? []).map(
      (h) => `<link rel="alternate" hreflang="${esc(h.lang)}" href="${esc(h.href)}" />`,
    ),
    `<script type="application/ld+json">${JSON.stringify(meta.jsonLd)}</script>`,
    PRERENDER_STYLE,
  ].join("\n    ");
  if (!html.includes("</head>")) throw new Error(`[prerender] template has no </head> for ${route.path}`);
  html = html.replace("</head>", `    ${headExtras}\n  </head>`);

  // Replace the boot placeholder inside #root with the static page. The
  // #root div itself and the module <script> tags are untouched, so React
  // mounts over this content exactly as on the home page.
  const split = splitRoot(html);
  if (!split) throw new Error(`[prerender] template has no #root for ${route.path}`);
  if (!split.inner.includes("cep-boot")) {
    throw new Error(`[prerender] unexpected #root content in template for ${route.path}`);
  }
  const staticInner = `<main class="cep-static" data-prerendered="true">${breadcrumbsHtml(route, meta.h1)}<h1>${esc(meta.h1)}</h1>${meta.body}<footer class="cep-foot"><a href="${esc(href("/"))}">Civil Estimation Pro</a> — free construction calculators. <a href="${esc(href("/tools"))}">All calculators</a></footer></main>`;
  html = split.before + staticInner + split.after;
  return html;
}

/* ------------------------------------------------------------------ */
/* Main                                                                */
/* ------------------------------------------------------------------ */

function main(): void {
  const templatePath = path.join(DIST, "index.html");
  if (!fs.existsSync(templatePath)) {
    console.error("[prerender] dist/index.html not found — run `vite build` first.");
    process.exit(1);
  }
  let template = fs.readFileSync(templatePath, "utf8");
  if (!template.includes('<div id="root"') || !template.includes('type="module"')) {
    console.error("[prerender] template is missing #root or the module script — refusing to prerender.");
    process.exit(1);
  }
  if (template.includes('data-prerendered="true"')) {
    // A previous (partial) prerender run already overwrote dist/index.html
    // with a prerendered home page. Restore the boot placeholder from the
    // SOURCE index.html so re-running postbuild without a vite build is
    // safe (a normal `npm run build` never hits this — vite rebuilds dist).
    const srcSplit = splitRoot(fs.readFileSync(path.join(ROOT, "index.html"), "utf8"));
    const dstSplit = splitRoot(template);
    if (!srcSplit || !dstSplit || !srcSplit.inner.includes("cep-boot")) {
      console.error("[prerender] dist/index.html looks already prerendered and the boot placeholder cannot be restored — re-run `vite build`.");
      process.exit(1);
    }
    template = dstSplit.before + srcSplit.inner + dstSplit.after;
    console.log("[prerender] dist/index.html was already prerendered — restored the boot placeholder from index.html");
  }

  const routes = buildRoutes();
  const counts = new Map<string, number>();
  let totalBytes = 0;

  // Tools with no SPECIFIC_FAQS get SEOHead's fallback Q&A (reported once).
  const noFaq = TOOL_IDS.filter((id) => !(SPECIFIC_FAQS[id] && SPECIFIC_FAQS[id].length > 0));
  if (noFaq.length > 0) {
    console.log(`[prerender] tools with no SPECIFIC_FAQS (SEOHead fallback Q&A used): ${noFaq.join(", ")}`);
  }
  const noGuide = TOOL_IDS.filter((id) => !TOOL_GUIDES[id]);
  if (noGuide.length > 0) {
    console.log(`[prerender] tools with no TOOL_GUIDES entry (no HowTo/guide body): ${noGuide.join(", ")}`);
  }

  for (const route of routes) {
    const meta = pageFor(route);
    const html = renderPage(template, route, meta);

    // Self-checks: exactly one <h1>, title/canonical present, SPA boot
    // tags intact, no unresolved ./assets references at depth > 0.
    const h1Count = (html.match(/<h1[\s>]/g) ?? []).length;
    if (h1Count !== 1) throw new Error(`[prerender] ${route.path}: expected 1 <h1>, found ${h1Count}`);
    if (!html.includes(`<title>${esc(meta.title)}</title>`)) throw new Error(`[prerender] ${route.path}: title missing`);
    if (!html.includes(`rel="canonical" href="${esc(absUrl(meta.canonicalPath))}"`)) throw new Error(`[prerender] ${route.path}: canonical missing`);
    if (!html.includes('id="root"') || !html.includes('type="module"')) throw new Error(`[prerender] ${route.path}: SPA boot tags missing`);
    const depth = route.path === "/" ? 0 : route.path.split("/").filter(Boolean).length;
    // NB: "../assets/" contains "./assets/" as a substring (from index 1),
    // so the check must require the "./" NOT to be preceded by another ".".
    if (depth > 0 && /(?<!\.)\.\/(assets|fonts)\//.test(html)) throw new Error(`[prerender] ${route.path}: unresolved ./assets/ or ./fonts/ reference`);
    // Every rewritten asset must exist in dist (guards against a bad prefix).
    // Resolve the relative URL against the page's own directory.
    const pageDir = path.join(DIST, route.path);
    for (const m of html.matchAll(/(?:src|href)="((?:\.\.\/)+(?:assets|fonts)\/[^"]+)"/g)) {
      const resolved = path.resolve(pageDir, m[1]);
      if (!fs.existsSync(resolved)) throw new Error(`[prerender] ${route.path}: asset missing: ${m[1]}`);
    }

    const outPath = route.path === "/" ? path.join(DIST, "index.html") : path.join(DIST, route.path, "index.html");
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, html);
    totalBytes += Buffer.byteLength(html);
    counts.set(route.kind, (counts.get(route.kind) ?? 0) + 1);
  }

  console.log(`[prerender] wrote ${routes.length} prerendered pages (${(totalBytes / 1024).toFixed(0)} kB total) to dist/`);
  for (const [kind, n] of [...counts.entries()].sort()) {
    console.log(`[prerender]   ${kind}: ${n}`);
  }
}

main();
