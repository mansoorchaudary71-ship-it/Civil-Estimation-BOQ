# CHANGES — Brick Calculator upgrade (2026-11-10)

Package: `cep-brick-calculator-UPLOAD-TO-REPO-ROOT.zip`
Merge: unzip at the repository root (folders are repo-relative). Then run
`npm install` (if needed) and `npm run build`. Do NOT delete any existing files.

## What this package does
Rebuilds the Brick Calculator as a dedicated, best-in-class page at
`/brick-calculator` (plus 16 programmatic variants), with clean URLs, per-page
SEO, JSON-LD, a sitemap fix, and a reusable page shell for the other calculators.

## New files
- `src/lib/brickCalc.ts` — calculation engine (pure functions) + brick presets
  (PK/IN/UAE + custom), thickness presets, currencies PKR/INR/AED, FAQ data.
  Formula: N = V_wall / V_brick_with_mortar; dry mortar = wet × 1.33;
  50 kg bag = 0.0347 m³. Verified by a node test on the 10×10 ft example
  (873 bricks before wastage, 917 to order at 5%; 5 bags cement + 21.8 cft sand
  at 1:4; 4 bags + 23.4 cft at 1:6).
- `src/seo/siteConfig.ts` — SITE_URL + Organisation data. **Read the note inside:
  civilestimationpro.com did NOT resolve (DNS NXDOMAIN, checked 2026-11-10).
  Either point the domain at GitHub Pages (CNAME file included) or change
  SITE_URL to the live github.io host.**
- `src/seo/brickProgrammatic.ts` — city (8), brick-type (4) and house-size (4)
  variants with indicative Nov 2026 rates + sources. House-size brick counts are
  computed from a stated method (see file), not copied from any competitor.
- `src/seo/CalculatorPageShell.tsx` — reusable SEO page shell (Helmet meta,
  canonical, OG/Twitter, hreflang, JSON-LD, breadcrumb, related calculators).
  Other calculators adopt it by passing their own props.
- `src/components/calculators/BrickCalculator.tsx` — the calculator UI: wall
  L/H/thickness (4.5"/9"/13.5"/custom), openings (doors/windows), brick presets
  + custom size, joint, wastage %, mix 1:3/1:4/1:6/custom, currency toggle,
  editable rates, instant results, sticky results panel, PDF (jsPDF), print,
  share, copy-result, and a live "how this was calculated" breakdown.
- `src/components/calculators/BrickCalculatorContent.tsx` — 1,500+ words of
  original content: how it works, formulas as equations, worked example (numbers
  match the calculator exactly), brick sizes/standards table, mortar guide,
  brick-type comparison, city rate table, house-size table, glossary, 10-Q FAQ
  accordion, sources + reviewer byline + last-updated date.
- `src/components/pages/BrickCalculatorPage.tsx` — the page: parses
  `/brick-calculator/<slug>` into main/city/type/size variants, sets per-variant
  Helmet meta + JSON-LD (WebApplication, FAQPage, BreadcrumbList, Organization)
  + hreflang (en-PK / en-IN / en-AE / x-default).
- `public/CNAME` — `civilestimationpro.com` (GitHub Pages custom domain; the
  user must still point DNS at GitHub Pages — see launch checklist).
- `docs/cep-brick-seo/90-day-offpage-plan.md` — the 90-day off-page plan.
- `docs/cep-brick-seo/CHANGES-brick-calculator-2026-11-10.md` — this file.

## Modified files
- `src/main.tsx` — HashRouter → BrowserRouter (clean, crawlable URLs).
- `index.html` — spa-github-pages restore script (pairs with existing
  public/404.html so deep links like /brick-calculator load on GitHub Pages).
- `src/App.tsx` — new `case "brick-calculator"` rendering BrickCalculatorPage;
  initial-route logic now reads `window.location.pathname` first (hash links
  still work as a fallback).
- `src/components/Dashboard.tsx` — new ALL_MODULES entry `brick-calculator`
  (appears on the dashboard; makes `isKnownRoute` pass).
- `src/components/modules/Calculators.tsx` — bricks tab now links to the full
  Brick Calculator page (`/brick-calculator`). The tab's own calculator is
  untouched (see known follow-ups).
- `src/seo/toolsData.ts` — added the `brick-calculator` registry entry.
- `public/sitemap.xml` — fixed a pre-existing defect (65 literal `\n` strings
  between `</url>` and `<url>`), added the brick page + 16 programmatic URLs
  (17 total). XML validated with a parser.

## Routing change — read before merging
This package switches the app from HashRouter (`/#/tool`) to BrowserRouter
(`/tool`). That is what makes the brick page (and every other tool) crawlable.
It relies on the existing `public/404.html` spa-github-pages redirect plus the
new restore script in `index.html`. After deploy, test in this order:
1. `/` loads. 2. `/brick-calculator` loads directly (fresh tab, not via click).
3. `/brick-calculator/lahore` loads directly. 4. Old `#/calculators` links still
   land on the right tool (fallback in App.tsx). If step 2 or 3 fails, the
   404.html/restore pair is the place to look — do not revert to HashRouter
   without telling the SEO work to stop, because hash URLs cannot rank.

## Verification done here
- `npm install --ignore-scripts` (full install fails on better-sqlite3 native
  build under Node 24 — pre-existing, unrelated to this package; vite build
  does not need it).
- Node test of `calcBrickwork` on the default example (numbers above).
- `npm run build` — EXIT 0 (vite build 44.7s + esbuild server bundle). The
  6.69 MB main-chunk warning and the Dashboard dynamic-import warning are
  pre-existing.
- `npx tsc --noEmit` — zero errors in this package's files. Three pre-existing
  errors remain elsewhere (Dashboard.tsx 1228–1229 ScrollReveal `yOffset`,
  Contact.tsx 222 missing `ShieldCheck`); vite build does not run tsc, so the
  build still passes.
- dist checks: CNAME, sitemap.xml (17 brick URLs), robots.txt, 404.html all
  present in dist; the restore script is in dist/index.html; the brick page
  code and title are in the built JS bundle.
- Not verified: a live browser render (the Muse browser refuses loopback URLs,
  so no localhost preview was possible) and the live domain (NXDOMAIN — see
  the blocker above). Test /brick-calculator directly after deploy.

## Design-system note
The brief says navy #0A0F1E / amber #F59E0B / Syne / DM Sans. The repo actually
ships Inter + brand blue #0056D2 + slate dark + amber accents. New code is built
to the REPO's live tokens — no silent rebrand. If the Syne/DM Sans/navy-amber
system is wanted, that is a separate rebrand task.

## Rates — how they work
Every rate is an editable input with a grounded indicative default (Nov 2026)
and a source label on the page. Pakistan brick figures are the Pakistan Bureau
of Statistics August 2026 city survey. UAE clay-brick per-1,000 price was NOT
found in any source — UAE pages leave the brick price blank with a prompt and
show verified hollow-block rates as context. Nothing is presented as a live quote.

## Known follow-ups (not in this package)
1. **Domain/DNS** — the blocker. civilestimationpro.com does not resolve; no
   CNAME existed before this package. Point DNS at GitHub Pages (A records
   185.199.108.153 / .109 / .110 / .111 + CNAME www → <user>.github.io) or use
   the github.io host (change SITE_URL + regenerate sitemap).
2. **Hub dedupe** — Calculators.tsx still contains its own BrickworkCalculator
   class AND renders Brickwork9InchModule (fixed 9") for the bricks tab, while
   MasterQuantityEstimator also uses the module. The public-facing brick
   experience is now the single new page; unifying the hub internals on the new
   engine is a separate, careful refactor (the hub feeds BOQ export/cart state).
3. **Sitemap deep URLs** — sitemap.xml still lists ~100 deep tool URLs
   (/calculators/concrete/...) that all resolve to category hubs (the App router
   takes the first path segment). The brick URLs added here are real routes.
   The right fix is a sitemap generator from ALL_MODULES ids.
4. **Prerendering** — pages are still client-rendered; Helmet sets meta at
   runtime. Google renders JS, but a static prerender (or the Next.js migration
   in PROGRAMMATIC_SEO_GUIDE.md) would strengthen crawling. Not attempted here
   because the repo has no prerender setup and the build is fragile.
5. **DynamicToolPage** (src/seo/) is still unwired scaffolding; the brick page
   does not use it. Wire it or remove it in a later cleanup.
6. **Backlink data** — referring-domain counts for the five competitors were not
   verifiable from any free source; the 90-day plan uses observable targets +
   free checkers (MrKeyword, Outrank.so) instead of invented numbers.
