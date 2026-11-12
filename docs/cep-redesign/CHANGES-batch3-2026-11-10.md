# CHANGES — Batch 3: Pages (Dribbble-style, amber)

**Date:** 10 November 2026 · **Branch:** `design/dribbble-amber-redesign` · **Base commit:** `8987488` (Batch 2)
**Status:** Batch 3 complete and verified. Awaiting confirmation before Batch 4 (tools, G1–G10).

## What Batch 3 does

Restyles every **page** in the Dribbble-amber system: home, the tool-page shell, category hubs, the calculators hub, all static pages, home sections, and auth pages. **No content, routes, SEO, or tool logic changed.** Tool interiors are Batch 4+.

## Files changed — 34 modified, 0 deleted

- **Home:** `src/components/Dashboard.tsx`, `HeroSection.tsx`, `CategoryHub.tsx`, `ToolCard.tsx`
- **Tool shell:** `src/App.tsx` (designed 404 only), `src/seo/CalculatorPageShell.tsx`, `src/seo/DynamicToolPage.tsx`
- **Hubs:** `src/components/modules/Calculators.tsx` (tab bar + hub shell only — its tab-content modules are Batch 4)
- **Home sections:** `GoalTabs.tsx`, `AIEstimatorBanner.tsx`, `SocialProofSection.tsx`, `LandingSections.tsx`, `SummaryStatsWidget.tsx`, `WorkspaceSection.tsx`, `NewsletterSignupCard.tsx`, `PostLoginDashboard.tsx`, `RecentEstimates.tsx`, `RecentSidebar.tsx`, `EstimationWorkflow.tsx`, `PricingBackgroundWrapper.tsx`
- **Static pages (11):** `src/components/pages/AboutUs.tsx`, `Blog.tsx`, `BrickCalculatorPage.tsx`, `Careers.tsx`, `Contact.tsx`, `JoinProject.tsx`, `LegalPages.tsx`, `MarlaConverterPage.tsx`, `PakistanCostCalculatorPage.tsx`, `PricingPage.tsx`, `TeamCollaboration.tsx`
- **Auth:** `src/components/auth/AuthModal.tsx`, `ProfileSettings.tsx`
- **Footer:** `src/components/Footer.tsx` (two-row restructure)

## The mapping (applied everywhere)

Same system as Batch 2: blue/indigo solids → ink, blue links → `accent-800`, slate → warm tokens, emerald/red/yellow → semantic tokens, decorative colours → spec amber, hardcoded hex backgrounds (`#FFFFFF`, `#F0F4F8`, `#F5F5F7`, `#FFC000`, `#4338CA`, `#EC4899`, `#D97706`, `#BE185D`) → tokens, cool `rgba(15,23,42,…)` / `rgba(163,177,198,…)` shadows → warm. ~1,100 scripted replacements + hand-edits below.

## Flagship changes (hand-edited)

- **HeroSection** — top gradient is now an amber tint (`from-accent-50`) fading to white; accent word is `accent-800`; pill search has an amber focus ring; trending pills are white with warm borders; facts tiles and the product-preview card are tokenised. H1 stays 56px (spec display).
- **CategoryHub** — the six pastel section bands (cream/blue/green/pink/purple/sky) are **removed**: sections are now white with a hairline top divider, per Dribbble. Grid gap is 36px (spec); section padding 64px desktop.
- **ToolCard** — the five per-category colours (orange/blue/purple/green/indigo) collapse to **one amber system** (`#855307` icon + amber glow); `getCategorySpec` keeps its signature for SmartSearch. Card radius is 12px; the "New" badge is dark; the Popular flame is amber-700.
- **Footer — two-row restructure** — brand block moves **first** (logo left, Dribbble pattern); link-group headings are 16px bold; social icons are dark circles (`bg-ink`, white icon); footer background is white (was a grey tint). **All 24 links, legal links, newsletter, disclaimer and back-to-top are kept.**
- **404 — designed** — the plain "Module not found" div in `App.tsx` is now a real page: big Mona Sans 404, muted copy, a dark "Back to home" pill and a "Search calculators" pill (opens global search), in the 1024px content column.
- **Dashboard (home)** — the "Premium Ambient Background" (purple/blue/orange blurred blobs + dot pattern) is **removed from both the logged-out and logged-in branches**; page background is white; the logged-in "Pro." accent is amber-800; the AI-chat modal blobs and icon tile are warmed; chat bubbles are warm dark / white.
- **CalculatorPageShell (SEO template)** — H1 is 32px (spec inner H1); breadcrumb links are amber-800; related cards are 12px radius with amber hover; related grid gap is 36px. Container stays `max-w-7xl` (calculators need the width).
- **PricingPage** — page background is white; the 14-day trial banner is dark ink; the pricing wrapper's mint/teal/indigo blobs are now warm amber/success tints.
- **PakistanCostCalculatorPage** — fixed two pre-existing contrast bugs in the construction-type selector: the unselected label was light-grey text on white (nearly invisible) and the selected label was amber-500 (fails AA); now `text-txt-primary` / `text-accent-800`. Also fixed the related-tools card title hover (`amber-50` → `accent-800`) and the navy→white results gradient (now ink→white).
- **EstimationWorkflow** — the final purple CTA button is now a dark ink pill (primary CTAs are dark, per the spec).

## Decisions applied

- **ALL_MODULES `colorClass` is dead data** — the 65 entries carry `colorClass` (e.g. `bg-indigo-600 text-white shadow-lg`) but **no component renders it** (verified by grep; ToolCard uses `getCategorySpec` instead). Left as-is: removing 65 fields is a cleanup, not a restyle, and it changes nothing visually.
- **Unused components NOT restyled** (legacy list): `PremiumHero.tsx`, `modules/MintroHero.tsx`, `modules/MobileLandingPage.tsx`, `ExcelPromo.tsx` — nothing imports them. If they are revived, restyle them then.
- **Calculators.tsx hub shell is done in Batch 3** — so G2 (Batch 4) skips this file; its tab-content modules (Brickwork9InchModule etc.) are still G1/G2.
- **Container stays `max-w-[1400px]`** (CEP's own width, per the plan); tool shell stays `max-w-7xl` (working width for calculators).

## Method

Hand-edits to the 7 flagship files (asserted exact-match script, `/tmp/batch3_hand.py` + `batch3_hand2.py`), then a scripted sweep (`/tmp/batch3_sweep.py`, Batch 2's script with two fixes: `dark:text-slate-100/200` now maps to `dark:text-txt-primary` instead of the Batch 2 bug `dark:text-txt-inverse`, plus hardcoded-hex rules), then a second targeted pass for gradient/`border-amber` leftovers the sweep doesn't cover, then a full `git diff` review. Three more pre-existing contrast bugs fixed in review (PakistanCostCalculatorPage selector, related-tools hover, PricingPage dark navy background).

## Verification (10 Nov 2026)

- `npm run build` — **exit 0** (vite + esbuild server bundle; the 6.69 MB chunk warning is pre-existing)
- `npx tsc --noEmit` — **zero errors in Batch 3 files**; only the 3 pre-existing errors elsewhere (Dashboard.tsx 1218–1219 ScrollReveal `yOffset`, Contact.tsx 222 `ShieldCheck`)
- Grep audit of Batch 3 scope: **0 remaining** old colour utilities (`blue-/indigo-/primary-/slate-/emerald-/red-/rose-/yellow-/orange-/purple-/violet-/pink-/amber-` Tailwind, incl. `border-/ring-/from-/to-` variants)
- Built CSS checked: old pink (234 76 137) **absent**; indigo/blue rgb **absent**; remaining cool-slate values come from `src/components/modules/` (76 files — Batch 4 scope), not from Batch 3 files
- Contrast: same verified pairs as Batch 1/2; the fixed selector labels are now `text-txt-primary` / `text-accent-800` (6.49:1)

## Deliberately NOT changed in Batch 3

- Tool interiors (`src/components/modules/` except the Calculators hub shell) — Batch 4, groups G1–G10.
- `ALL_MODULES` `colorClass` values (dead data — see above).
- The unused components listed above.
- No live visual preview: the browser runtime refuses localhost URLs, so verification is build + tsc + built-bundle inspection + class audit. Check the deployed preview yourself after merging (home, a tool page, the 404, dark mode, mobile menu).

## Merge instructions

1. On branch `design/dribbble-amber-redesign`, apply the patch (`git apply cep-redesign-batch3.patch`) **or** unzip `cep-redesign-batch3-UPLOAD-TO-REPO-ROOT.zip` at the repo root (it contains only the changed files, folders at the top level).
2. `npm install --ignore-scripts` then `npm run build` — expect exit 0.
3. Merge the branch into `main` when Batch 3 looks right; Batch 4 builds on this branch. The patch applies on top of Batch 2 (commit `8987488`).

## PR description (draft)

> **feat(ui): Dribbble-style pages with construction amber (Batch 3)**
>
> Restyles all pages — home, tool-page shell, category hubs, calculators hub, all static pages, home sections and auth — in the Dribbble design language with the construction-amber accent.
>
> - Hero: amber-tint gradient, amber accent word, pill search with amber focus ring
> - Category sections lose their pastel bands: white with hairline dividers, 36px grid gaps
> - Tool cards: one amber system replaces the five per-category colours; 12px radius
> - Footer restructured to Dribbble's two-row pattern (brand first, 16px bold headings, dark-circle socials); all links kept
> - Designed 404 page (big 404, dark "Back to home" pill, search pill)
> - Ambient colour blobs removed from home and pricing; trial banner is dark ink
> - Fixes three pre-existing contrast bugs found in review (selector labels, card hover, results gradient)
>
> No content, routes, SEO, or tool logic changed. Verified: `npm run build` exit 0, `tsc` clean on changed files, zero old colour utilities left in the pages scope. Next: Batch 4 (tools, G1–G10).
