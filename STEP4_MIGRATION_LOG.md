# Step 4 — Tool Template and Migration (Leg 5) — Log

Date: 2026-11-26. Working copy only: `~/workspace/cep-fix/audit-work/`.
Nothing pushed. Live head remains 96632ed (Round 5).

## 1. The template (one canonical component)

**New file: `src/components/ui/ToolPageTemplate.tsx`** — reuses existing
code wherever it exists (ToolHeader, ToolLayout, Breadcrumb,
CodeComplianceBadge, TOOL_FORMULAS, TOOL_REFERENCES, Button, toast,
html2pdf, `global-print-action`, BOQContext/`fill-boq`/`sendToBoq`).
It exports:

- `ToolBreadcrumb` — Home / Calculators / Category / Tool (uses the
  existing `src/components/Breadcrumb.tsx`).
- `ToolStandardsBadge` — first verified code reference from
  TOOL_REFERENCES (12 tool ids) else the site-wide standards list already
  used by every ToolPageFooter (`IS Codes · NBC · ACI · BS · MORTH`) —
  reused, never invented per tool.
- `ToolInputsCard` / `ToolResultsCard` — identical spacing/radius/border;
  results are `lg:sticky lg:top-24` on desktop, stacked on mobile.
  `ToolLayoutResults` was given the same sticky treatment, so the two
  tools already on ToolLayout (RetainingWall, MasterQuantity) get it too.
  Brick results were already sticky (`sticky top-6`); Plywood's results
  column got `lg:sticky lg:top-24 lg:self-start`.
- `ToolEmptyState`, `ToolSkeleton`.
- `ToolFormulaSection` — renders `TOOL_FORMULAS[toolId]` verbatim.
  66/75 tools have one. The 9 without render nothing (never invented):
  `ai, calculators, is-codes-reference, morth-irc-specs,
  pakistan-building-codes, projects, qs-workflow, tracker,
  uae-construction-standards` — **for step 5**.
- `ToolActionsBar` — the canonical actions row, always in this order:
  **Copy, Print, PDF, Excel, Add to BOQ, Share**. Copy/Print/PDF/Share
  reuse the ToolHeader implementations (DOM-scraped summary,
  `global-print-action`, html2pdf on `.tool-card`, navigator.share with
  clipboard fallback). Excel / Add to BOQ delegate to the tool's OWN
  button (`/excel|xlsx/i`, `/boq/i`) when the tool has one; otherwise the
  button stays visible but **disabled with a `title` reason**.
  - `EXCEL_CAPABLE_TOOL_IDS` (12): bbs-generator, boq, boq-templates,
    brick-calculator, cost-summary, house, marla-converter,
    measurement-sheet, mix-design, pakistan-cost-calculator, takeoff,
    unit-converter. (StructuralExportBar-only tools are NOT in this set —
    that bar has Copy/Print/PDF/Send-to-BOQ but no Excel button.)
  - `BOQ_CAPABLE_TOOL_IDS` (27): tools calling `useBOQ().addItem`,
    dispatching `fill-boq`, calling `exportBOQToPDF` or `sendToBoq`
    (localStorage BOQ inbox), or publishing `__currentRoadBOQItems`.
    `boq` / `boq-templates` excluded (they ARE the BOQ workspace).
    10 of the 27 are PDF-only (`exportBOQToPDF` — anti-termite,
    building-setback, far-fsi, mep-calculator, metal-weight,
    rainwater-harvesting, reinforcement, roof-calculator, solar-roof,
    solar-water-heater): the bar delegates to their BOQ-PDF button.
  - Excel disabled on 63 tools, BOQ disabled on 48 tools — **flagged for
    step 5** (see per-tool table below).

**`src/App.tsx` — ModuleWrapper** now composes the template for the 66
wrapped tools, in order: breadcrumb → ToolHeader (H1, description,
unit + currency selectors) → standards badge → tool content → formula
section → actions row → ModuleSummaryDashboard → ProTips → Related
calculators → FAQ → SEO article → Feedback → Discussion → ToolPageFooter.
(The below-fold order was reordered Related → FAQ → Article to match the
template spec §5; all sections are the pre-existing central components,
75/75 FAQ and JSON-LD untouched.)

**Standalone pages** (9 tool ids) import the same pieces directly:
- `BrickCalculatorPage`, `MixDesignCalculatorPage`: calculator wrapped
  in `global-form-card-wrapper` + FormulaSection + ActionsBar.
- `MarlaConverterPage`, `PakistanCostCalculatorPage`: root gets
  `tool-page-standalone` (44px rule scope) + FormulaSection + ActionsBar
  before the SEO content. (The alias `cost-guide-pakistan` renders the
  Pakistan page with the canonical `pakistan-cost-calculator` id.)
- `StandardsReferencePage` (4 ids): breadcrumb (guarded on `onNavigate`)
  + ActionsBar after the header. No formula section (none verified);
  Excel/BOQ disabled with reasons.

**`src/index.css`**: 44px min-height for text/number inputs, selects and
textareas inside `.global-form-card-wrapper` and `.tool-page-standalone`
at every width (mobile already padded them to ~48px below 768px).
Buttons deliberately excluded (pill toggles are 28–36px by design).
`overflow-x: clip` on html/body already existed — kept.

## 2. Hex + raw gray/slate elimination (codemod `/tmp/leg5/codemod.py`)

988 replacements across 90 files (281 Tailwind arbitrary-hex values,
153 raw gray/slate/white utilities, 509 quoted hex strings, 83 bare hex
in template literals / print CSS / gradients). Mapping rules:

- Class context → design-token classes. Neutrals use semantic `txt-*` /
  `surface-*` / `border-*` (dark-mode adaptive); brand amber/blue use
  the fixed scales (`accent-500` bg, `accent-700` text); near-whites →
  `surface-hover`/`surface-active`; light gray text on dark surfaces
  (`text-gray-200`) → `text-white/80` (never a dark token).
- JS string / style / SVG / chart-palette / email-HTML contexts →
  `rgb(R, G, B)` literals with the EXACT original colour (SVG, canvas,
  recharts and email clients cannot consume CSS vars). No behaviour
  change in those contexts.
- One codemod bug found and fixed in review: `text-gray-200` first
  became the invalid `text-text-white/80` (28 occurrences, 14 files) —
  repaired to `text-white/80`, verified 0 remaining.
- `prose-slate` → `prose-ink` was reverted: the typography plugin is not
  installed (no `.prose` in built CSS), so the class is inert either way.

Hex counts — top 10 files, before → after (all 0 after):

| File | Before | After |
|---|---|---|
| modules/ShareMenu.tsx | 57 | 0 |
| modules/HouseEstimator.tsx | 48 | 0 |
| modules/IsolatedFootingCalculator.tsx | 42 | 0 |
| modules/ProjectManager.tsx | 33 | 0 |
| modules/ReinforcementVisualizer.tsx | 28 | 0 |
| modules/Takeoff.tsx | 21 | 0 |
| modules/SiteProgressTracker.tsx | 19 | 0 |
| modules/MasterSieveAnalysis.tsx | 18 | 0 |
| modules/RetainingWallCalculator.tsx | 16 | 0 |
| modules/RateAnalysis.tsx | 15 | 0 |

Totals in migrated scope: modules+calculators+pages 481 → 0;
ui+App+ToolPageFooter 186 → 0; utils+lib 45 → 0; ToolCard 99 → 0
(ToolCard/Dashboard home hex was converted too where mechanical).
Remaining raw gray/slate utilities in migrated scope: 0.
`text-white` kept deliberately: it is a named Tailwind utility (not
hex) and stays white in both themes, which is correct on ink/amber
surfaces — mapping it to `text-txt-inverse` would have been invisible
in dark mode (inverse flips to ink).

**Deliberate exclusions (not tool pages):**
- `Dashboard.tsx` + `RecentEstimates.tsx`: the home-page category theme
  system (`getCategoryTheme`) is a deliberate multi-hue palette
  (indigo/teal/violet/pink/amber/blue) with no token equivalent;
  converting it would re-hue the home category coding. Their hex is
  unchanged.
- `src/index.css` / `src/styles/tokens.css`: global CSS (incl. the
  `index.css:1110` dark-mode safety net, which is now mostly redundant
  but harmless) — not tool files.
- `src/components/auth/`, `src/components/seo/`: 0 hex, untouched.

## 3. Duplicates deleted (0 importers verified first, incl. scripts/)

- `src/components/calculators/HouseEstimator.tsx` (dead; live one is in
  modules/)
- `src/components/RelatedCalculators.tsx` (dead; live one is in
  calculators/ — and it carried the bad links, see §4)
- `src/components/BottomNavBar.tsx` (dead)
- `src/components/ui/BottomNavBar.tsx` (dead)

`src/context/` vs `src/contexts/` both live — NOT merged, per brief.
No Round 3.1/4-deleted file was re-added (only new files this leg:
`ToolPageTemplate.tsx` and this log).

## 4. Link / routing follow-ups

- `Footer.tsx:103,149,177` — `href="#/"`, `href="#/${l.id}"` ×2 →
  clean paths via `hrefFor()` (`getBasename()` + `/${id}`), same
  onClick interception as TopNavbar. Doc comment updated (`#/route` →
  `/route`).
- `GoalTabs.tsx:120` — same fix.
- `Blog.tsx` — post cards are now real `<a href="/blog/<slug>">` links
  (basename-prefixed, SPA-intercepted); the single-post view reads the
  slug from the pathname first (`getEffectivePathname()`, basename-aware)
  with the legacy `#/blog/<slug>` hash as fallback; back button uses
  `navigate('/blog')`. Prerender already serves the full post at the
  clean URL. 0 hash links remain in Footer/GoalTabs/Blog.
- `RelatedCalculators.tsx` bad links (`/steel-weight/…`,
  `/marla-to-sq-ft`, `/brick-wall-calculator`): those lived in the DEAD
  `components/RelatedCalculators.tsx` — removed with the file. The LIVE
  `calculators/RelatedCalculators.tsx` was already clean (real `/<id>`
  links) and its 4 remaining hex values were converted by the codemod
  (`bg-white` → `bg-surface-default`, `border-[#E2E8F0]` →
  `border-border-color`, `bg-[#F2A413]` → `bg-accent-500`,
  `text-[#111827]` → `text-txt-primary`).
- In-article links in `content/blog/how-to-calculate-rcc-slab-quantity.md`
  (found by the run-2 smoke, 5 × `#/dashboard` — all lazily pointed at
  the home page): BBS Generator → `/bbs-generator`, RCC Slab Estimator
  → `/master-rcc`, Professional BOQ Generator → `/boq`, Concrete Mix
  Design → `/mix-design`, House Construction Cost Estimator → `/house`.
  The other two posts had 0 hash links. Prerendered post file verified
  clean after rebuild.

## 5. Preserved (verified, not undone)

- Round 6 toggle fix: `App.tsx:789` converter guard
  (`closest('[data-local-units]')` return), `SettingsContext` default
  `'SI'`, Plywood two-way sync + `data-local-units`, Brick
  `data-local-units`. Brick was migrated to the template with its engine
  and behaviour intact (no engine edits).
- Steps 2+3: CNAME still absent, SITE_URL github.io host, vendor chunks,
  AnimatePresence wait-mode removed, 249 routes prerendered (build
  postbuild output unchanged). Untouched: `vite.config.ts`, `scripts/`,
  `package.json`, `public/CNAME`, `src/seo/siteConfig.ts`, prerender /
  sitemap scripts. Design system unchanged (Mona Sans, #F2A413, #1F1D1A,
  base `"./"`).

## 6. Gates (run after final edits)

- `npm run build` — exit 0 (249 prerendered pages; sitemap 195 URLs,
  0 new, 0 dropped).
- `npx tsc --noEmit` — exit 0.
- `npm run test:routes` — 16/16 pass.
- `npx tsx --test "src/lib/__tests__/*.test.ts"` — 448/448 pass.

## 7. Headless smoke

Script: `~/workspace/cep-fix/headless-check/leg5-smoke.mjs` (local dist
server, playwright-core chromium — scripted Chromium cannot reach
github.io). Sample: 18 tools across categories + the 4 previously-gated
tools (brick, mix-design, house, plywood) at 360/390/768/1280px, plus a
dark-mode render check (`.dark` on `<html>`) on brick/house/plywood and
clean-URL checks for a blog post, the blog listing and the standards
page.

**Run 1 (before the fixes in §7.1):** 0 horizontal scroll on all 18
tools at all 4 widths; breadcrumb present on all 16 ModuleWrapper
tools; actions order exactly `Copy|Print|PDF|Excel|Add to BOQ|Share` on
all 18; formula presence matched expectation on all 18 (incl.
qs-workflow correctly absent); Excel/BOQ disabled states matched the
registries on all 18; zero page/console errors anywhere. Dark mode on
brick/house/plywood: card `rgb(42, 38, 34)`, h1 `rgb(245, 242, 236)`,
body `rgb(31, 29, 26)`, no h-scroll, no errors.

**§7.1 — failures found in run 1 and fixed:**
1. `marla-converter`, `pakistan-cost-calculator`: no breadcrumb — the
   two standalone pages had none. Fixed: `ToolBreadcrumb` added to both
   (via `useNavigate`, `toolId` set). `tsc` caught a missing required
   `toolId` prop on first attempt — fixed, `tsc` clean.
2. "Inputs under 44px" on mix-design (checkbox 16px, range 34px),
   house (checkbox 1px ×3, range 18px), retaining-wall (checkbox 20px),
   master-rcc (radio 16px), solar-roof (checkbox 16px) — all were
   checkbox/radio/range inputs, NOT text/number/select/textarea. The
   44px rule covers only text/number/select/textarea (their labels
   provide the touch target for the small native controls; a 44px-tall
   checkbox would be a visual defect, not an improvement). The smoke
   script's check was narrowed to the covered types (and extended to
   select/textarea, which it had not been measuring). **Zero text /
   number / select / textarea inputs under 44px on any of the 18 tools.**
3. Blog-post check measured the wrong page: a direct goto to the nested
   `/blog/<slug>` URL on the local server serves `dist/index.html` (the
   prerendered home page) as the SPA shell, and vite base `"./"` then
   makes its relative `./assets/*` script 404, so React never mounted
   and the static home page was measured. This is a **local test-server
   artifact, not a site bug** — live, the prerendered post file's
   `../../assets` path resolves, and the script's console filter had
   hidden the resource error. The check now navigates in-app from
   `/blog` (clicking the post card), which exercises the real Blog
   pathname path. The blog-listing check (React mounted) already passed:
   post links are clean `/blog/<slug>`, 0 hash links.

**Run 2 (after fixes):** **FAILURES: [] — 0 failures.** All 18 tools: no
h-scroll at 360/390/768/1280, breadcrumb present on all 18 (incl. the
two newly-breadcrumbed standalone pages), actions order exact on all
18, formula presence matched on all 18, Excel/BOQ disabled states
matched on all 18, zero text/number/select/textarea inputs under 44px
on any tool, zero page/console errors. Dark mode unchanged (card
`rgb(42, 38, 34)`, h1 `rgb(245, 242, 236)`, body `rgb(31, 29, 26)`).
Standards page: breadcrumb true, actions order exact, 0 hash links.
Blog listing: post links clean `/blog/<slug>`, 0 hash links.
Blog post (in-app navigation): URL
`/blog/how-to-calculate-rcc-slab-quantity`, h1 the post title, no
h-scroll, no errors — **but 5 `href="#/…"` links remained**. They were
in the article markdown itself, not in Blog.tsx:
`content/blog/how-to-calculate-rcc-slab-quantity.md` linked
`#/dashboard` five times. Fixed by pointing each at its real tool
route (see §4): BBS Generator → `/bbs-generator`, RCC Slab Estimator
→ `/master-rcc`, Professional BOQ Generator → `/boq`, Concrete Mix
Design → `/mix-design`, House Construction Cost Estimator → `/house`.
Rebuilt (prerendered post now 0 `#/dashboard`), gates re-run green,
targeted blog re-check: **0 hash links**, all 5 tool links clean, no
h-scroll, no errors. Final gates after this last fix: `npm run build`
exit 0 (249 pages), `npx tsc --noEmit` exit 0, `npm run test:routes`
16/16, unit tests 448/448.

## 8. Per-tool migration status (all 75)

Template path: 66 via ModuleWrapper, 5 via standalone pages
(brick-calculator, mix-design, marla-converter, pakistan-cost-calculator,
cost-guide-pakistan alias), 4 via StandardsReferencePage. **0 tools NOT
migrated.** Formula/Excel/BOQ columns are the live registries in
`ToolPageTemplate.tsx` (Excel 12 yes / 63 disabled; BOQ 27 yes / 48
disabled — `boq`/`boq-templates` disabled by design, they ARE the BOQ
workspace).

| Tool id | Template path | Formula | Excel | Add to BOQ |
|---|---|---|---|---|
| aggregate-blending | ModuleWrapper | yes | disabled | disabled |
| aggregate-tests | ModuleWrapper | yes | disabled | disabled |
| ai | ModuleWrapper | NO — step 5 | disabled | disabled |
| anti-termite | ModuleWrapper | yes | disabled | yes |
| area-space-calculator | ModuleWrapper | yes | disabled | yes |
| bbs-generator | ModuleWrapper | yes | yes | yes |
| beam-design | ModuleWrapper | yes | disabled | disabled |
| boq | ModuleWrapper | yes | yes | disabled (is BOQ) |
| boq-templates | ModuleWrapper | yes | yes | disabled (is BOQ) |
| brick-calculator | BrickCalculatorPage | yes | yes | disabled |
| building-setback-calculator | ModuleWrapper | yes | disabled | yes |
| calculators | ModuleWrapper | NO — step 5 | disabled | disabled |
| cbr-test | ModuleWrapper | yes | disabled | disabled |
| chainage | ModuleWrapper | yes | disabled | yes |
| column-design | ModuleWrapper | yes | disabled | disabled |
| cost-guide-pakistan | PakistanCostCalculatorPage (alias) | yes | disabled | disabled |
| cost-summary | ModuleWrapper | yes | yes | yes |
| direct-shear | ModuleWrapper | yes | disabled | disabled |
| door-window-schedule | ModuleWrapper | yes | disabled | disabled |
| earthworks | ModuleWrapper | yes | disabled | disabled |
| far-fsi-calculator | ModuleWrapper | yes | disabled | yes |
| formwork | ModuleWrapper | yes | disabled | yes |
| geotechnical | ModuleWrapper | yes | disabled | disabled |
| gradient-calculator | ModuleWrapper | yes | disabled | disabled |
| house | ModuleWrapper | yes | yes | disabled |
| infra-mep-engine | ModuleWrapper | yes | disabled | yes |
| interiors-finishes | ModuleWrapper | yes | disabled | yes |
| is-codes-reference | StandardsReferencePage | NO — step 5 | disabled | disabled |
| isolated-footing | ModuleWrapper | yes | disabled | yes |
| labour-calculator | ModuleWrapper | yes | disabled | disabled |
| marla-converter | MarlaConverterPage | yes | yes | disabled |
| master-finishes | ModuleWrapper | yes | disabled | disabled |
| master-quantity | ModuleWrapper | yes | disabled | disabled |
| master-rcc | ModuleWrapper | yes | disabled | yes |
| master-sieve | ModuleWrapper | yes | disabled | disabled |
| material-takeoff | ModuleWrapper | yes | disabled | yes |
| measurement-sheet | ModuleWrapper | yes | yes | yes |
| mep-calculator | ModuleWrapper | yes | disabled | yes |
| metal-weight | ModuleWrapper | yes | disabled | yes |
| mix-design | MixDesignCalculatorPage | yes | yes | disabled |
| morth-irc-specs | StandardsReferencePage | NO — step 5 | disabled | disabled |
| pakistan-building-codes | StandardsReferencePage | NO — step 5 | disabled | disabled |
| pakistan-cost-calculator | PakistanCostCalculatorPage | yes | yes | disabled |
| pavement-mix | ModuleWrapper | yes | disabled | disabled |
| permeability-test | ModuleWrapper | yes | disabled | disabled |
| pile-foundation | ModuleWrapper | yes | disabled | disabled |
| plywood-estimator | ModuleWrapper | yes | disabled | yes |
| precast-wall | ModuleWrapper | yes | disabled | yes |
| prestressed-concrete | ModuleWrapper | yes | disabled | disabled |
| projects | ModuleWrapper | NO — step 5 | disabled | disabled |
| qs-workflow | ModuleWrapper | NO — step 5 | disabled | disabled |
| quick-estimation | ModuleWrapper | yes | disabled | disabled |
| raft-foundation | ModuleWrapper | yes | disabled | disabled |
| rainwater-harvesting | ModuleWrapper | yes | disabled | yes |
| rates | ModuleWrapper | yes | disabled | disabled |
| reinforcement | ModuleWrapper | yes | disabled | yes |
| retaining-wall | ModuleWrapper | yes | disabled | yes |
| road-pavement | ModuleWrapper | yes | disabled | yes |
| roof-calculator | ModuleWrapper | yes | disabled | yes |
| room-area-calculator | ModuleWrapper | yes | disabled | disabled |
| soil-mechanics-lab | ModuleWrapper | yes | disabled | disabled |
| solar-roof | ModuleWrapper | yes | disabled | yes |
| solar-water-heater | ModuleWrapper | yes | disabled | yes |
| staircase-calculator | ModuleWrapper | yes | disabled | disabled |
| staircase-design-reference | ModuleWrapper | yes | disabled | disabled |
| takeoff | ModuleWrapper | yes | yes | disabled |
| topsoil-estimator | ModuleWrapper | yes | disabled | disabled |
| tracker | ModuleWrapper | NO — step 5 | disabled | disabled |
| uae-construction-standards | StandardsReferencePage | NO — step 5 | disabled | disabled |
| unit-converter | ModuleWrapper | yes | yes | disabled |
| universal-structural-geometry | ModuleWrapper | yes | disabled | yes |
| ventilation-checker | ModuleWrapper | yes | disabled | disabled |
| volume-estimator | ModuleWrapper | yes | disabled | yes |
| wastewater-calculator | ModuleWrapper | yes | disabled | disabled |
| water-tank-design | ModuleWrapper | yes | disabled | disabled |

## 9. For step 5 (flagged, not done here)

- Excel export for the 63 tools without it (notably the 10
  StructuralExportBar-only tools: beam-design, column-design,
  isolated-footing, pile-foundation, prestressed-concrete,
  raft-foundation, retaining-wall, staircase-calculator,
  universal-structural-geometry, water-tank-design — their bar has no
  Excel button; wiring GenericExportButtons data through them is real
  per-tool work, not a template change).
- Add to BOQ for the 48 tools without it (their results have no BOQ
  line mapping yet; the central bar delegates to a tool's own BOQ
  button when one exists).
- Verified formula text for the 9 tools in §1 (mostly reference / hub /
  workspace pages, not calculators — do not invent formulas).
- Per-tool inputs/results slot migration: the template slots
  (`ToolInputsCard` / `ToolResultsCard`) exist and are used by the
  ToolLayout tools; the other tools keep their own internal input/result
  layout inside the template chrome. Restructuring each tool's JSX into
  the slots is follow-up work per tool (Brick's rebuild in step 6 is the
  natural place to do the first full slot migration).
- Home-page category palette (`Dashboard.tsx` / `RecentEstimates.tsx`)
  still uses hex — deliberate, see §2; revisit only if a token palette
  for category hues is designed.
