# Batch 4 G11 — Remaining Site Files — Dribbble-Amber Restyle

**Date:** 2026-11-11 · **Branch:** `design/dribbble-amber-redesign` · **Base commit:** `0e03d78` (stragglers)

## Why this batch exists
After G10, a full site-wide audit (`src/`, same regex as every batch) still found **416 old
colour utilities in 61 files** that no batch scope had covered — shared chrome (navbar, footer,
search, BOQ drawer, error boundary, print preview), dashboard data, the logo, and small
components. G11 closes them, so the restyle now covers the whole site.

## Scope (66 files)
All 61 audit-hit files except the documented exceptions (below), plus 4 files whose only old
colours were `var(--accent-*)` references the class audit cannot see: AggregateBlendingCalculator,
CurrencySelector, PostLoginDashboard, WashroomEstimator.

## What changed
- **292 sweep replacements** (+ 44 in PrintPreviewModal's JSX tail, split-swept so its print
  stylesheet was untouched) + blanket `amber-N` → `accent-N` (0 remaining in code).
- **Undefined `var(--accent-*)` fixed (latent bug):** `--accent-purple`, `--accent-blue`,
  `--accent-teal` and `--accent-vibrant` are defined **nowhere** in the repo, so every element
  using them rendered with no background/colour at all. Mapped to real palette values:
  - Dashboard tool tiles — purple → `bg-accent-500 text-ink`, blue → `bg-ink text-white`,
    teal → `bg-[#0F766E] text-white` (shadows re-tinted to match: `rgba(242,164,19,0.3)`,
    `rgba(31,29,26,0.3)`, `rgba(15,118,110,0.3)`); icon colours follow their tiles. The AI
    card's `bg-[var(--primary-dark)] text-txt-primary` (dark text on dark blue, unreadable)
    → `bg-ink text-white` like its sibling solid cards. `var(--primary-dark)` itself is a
    **live token** (defined in `tokens.css`) and is left alone everywhere it is used for text.
  - AggregateBlendingCalculator (`--accent-vibrant` ×15) → `bg-accent-500/10`,
    `border-accent-500/20`, `text-accent-700`, `focus:ring-accent-500`,
    `focus:border-accent-500`, `accent-accent-600` (2 double rings collapsed after the swap).
  - PostLoginDashboard `text-[var(--accent-blue)]` ×2 → `text-accent-700`; WashroomEstimator
    gradient `from-[var(--accent-purple)]` → `from-accent-500`; CurrencySelector
    `hover:text-[var(--accent-vibrant)]` → `hover:text-accent-700`.
- **Dashboard leftovers:** gradient card `to-cyan-500` → `to-accent-700` (indigo shadow →
  amber); `shadow-indigo-600/30` ×2 → `shadow-accent-500/30`; `shadow-blue-500/10` →
  `shadow-accent-500/10`; `shadow-blue-600/20` ×2 → `shadow-accent-500/20`.
- **Range inputs:** `accent-sky-500` (PavementMixGradation), `accent-indigo-600` (PricingPage),
  `accent-indigo-500` (FormulaVisualizer) → `accent-accent-600`.
- **Real contrast trap fixed:** PricingPage badge `bg-accent-500 text-white` → `bg-accent-500
  text-ink`. (Two similar-looking matches — RecentSidebar, SmartSuggestionBadge — are NOT
  traps: white text applies only on `hover:bg-ink-700`, base state is dark text on the light
  tint.)
- **Logo SVG gradients → warm system:** slate `#475569/#0f172a/#94a3b8/#334155` →
  `#6B6862/#1F1D1A/#E7E4DE/#6B6862`; warm gradient `#ea580c → #f59e0b` → `#B07006 → #F2A413`;
  drop shadow `#0f172a` → `#1F1D1A`.
- **Leftovers (hand-fixed, 86):** App.tsx JS `classList` validation `!border-red-500` →
  `!border-ui-errorBorder`; ErrorBoundary dark error text/borders → `ui-errorText` tokens;
  MasterBOQDrawer placeholder/delete/shadow; ToolPageFooter dark-footer grays → white
  opacities (G6 precedent); RelatedCalculators teal/rose card labels + hover borders →
  accent; AboutUs success card (`to-white` → `to-surface-default`, teal borders →
  accent); CalculationExplanation + ResultItem colour maps (sky/teal → accent);
  SegmentedToggle JS colour object; SoilReportHeader teal button → ink primary;
  CodeTooltip/ListInput/MetricInput/NumberInput/EmptyState/SubNavigation/UniversalUI/
  GlobalSettingsToggle/FeedbackWidget/CodeComplianceBadge/MobileTypographyWrapper/
  DarkModeToggle/ProfileSettings/CurrencySelector — grey/teal/sky/cyan utilities →
  surface, border, ink and accent tokens per their context; NewsletterSignupCard stray
  red focus hex `#fa5c5c` (valid input focusing red) → `focus:border-accent-500`.

## Verification
- Site-wide audit: **0 old colour utilities outside the 4 documented exceptions**;
  0 `var(--accent-*)`; 0 `dark:text-txt-inverse`; 0 `text-accent-500/600`; 0 real
  `bg-accent-500/600` + white-text traps.
- `rm -rf dist && npm run build` — **exit 0**.
- `npx tsc --noEmit` — only the 3 pre-existing errors (Dashboard.tsx 1218–1219 `yOffset`;
  Contact.tsx 222 `ShieldCheck`).

## Deliberately NOT changed (not-matched list)
- `src/index.css` (38 hits): `@media print` rules + the `html.theme-blueprint` and
  `html.theme-high-contrast` theme blocks — extra themes are out of scope.
- `src/components/ui/PrintPreviewModal.tsx` print stylesheet (lines 49/51/76): selectors that
  restyle tool content for print; its modal UI was swept (44 replacements).
- `src/components/ui/UniversalTabs.tsx` per-tab `COLOR_PALETTE` (intentional multi-colour
  tabs); its JSX shadow was fixed.
- `src/components/modules/CageEstimator.tsx` `text-emerald-100/200` on dark panels
  (G2/G4 precedent).
- `src/styles/tokens.css`: token definitions and their comments (the amber scale lives here).
- `var(--primary-dark)`: a live token, used for text throughout; untouched.

## Not changed
Content, features, routes, SEO, logic, calculations, and all estimation formulas are untouched.
