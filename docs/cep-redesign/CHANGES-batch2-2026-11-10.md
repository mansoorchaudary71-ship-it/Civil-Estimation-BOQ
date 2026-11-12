# CHANGES — Batch 2: Shared components (Dribbble-style, amber)

**Date:** 10 November 2026 · **Branch:** `design/dribbble-amber-redesign` · **Base commit:** `b4c0111` (Batch 1)
**Status:** Batch 2 complete and verified. Awaiting confirmation before Batch 3 (pages).

## What Batch 2 does

Restyles every shared component in the Dribbble-amber system. **No content, routes, SEO, or tool logic changed.** No page or tool file touched yet (Batch 3–4+).

## Files changed — 83 modified, 1 deleted

- **`src/components/ui/` — 74 files:** every shared component (buttons, inputs, cards, tabs, accordions, modals, tooltips, badges, results, charts, skeletons, search, navigation helpers)
- **Top-level components — 8 files:** `src/App.tsx` (CustomCursor removal only), `src/components/TopNavbar.tsx`, `Footer.tsx`, `SearchAndFilterBar.tsx`, `SmartSearch.tsx`, `GlobalBottomBar.tsx`, `BottomNavBar.tsx`, `MobileToolsSheet.tsx`
- **Deleted:** `src/components/ui/CustomCursor.tsx` (see below)

## The mapping (applied everywhere)

| Old | New |
|---|---|
| Blue/indigo solid fills (`bg-indigo-600`, `bg-blue-600`, `bg-primary-600`) — CTAs, active pills | `bg-ink` (dark), `hover:bg-ink-700`, `active:bg-ink-900` |
| Blue/indigo links (`text-indigo-600/700`, `text-blue-600`) | `text-accent-800` (+ underline on links), `dark:text-accent-400` |
| Blue/indigo tints (`bg-indigo-50/100`, `border-indigo-200`) | `bg-accent-50/100`, `border-accent-200` |
| Cool slate neutrals (`bg-slate-50/100`, `text-slate-500/600/700/900`, `border-slate-200/300`) | Token surfaces/text/borders (`bg-surface-hover`, `text-txt-secondary/primary`, `border-border-color`); light+dark pairs collapsed to one token class |
| Emerald/green (success) | `bg-ui-success`, `text-ui-successText`, `border-ui-successBorder` |
| Red/rose (error) | `bg-ui-error`, `text-ui-errorText`, `border-ui-errorBorder` |
| Yellow (warning) | `bg-ui-warning`, `text-ui-warningText`, `border-ui-warningBorder` |
| Orange/violet/purple/pink + Tailwind `amber-*` (decorative accents) | Spec amber (`accent-*`); text uses `accent-700/800` for contrast, never `accent-500` as text |
| Teal solids | `teal-700` `#0F766E` (spec 4th-series teal) |
| Default shadows (`shadow-sm/md/lg`) | `shadow-brand-sm/md/lg` (warm) |
| Cool `rgba(15,23,42,…)` / blue-glow `rgba(59,130,246,…)` shadows | Warm `rgba(31,29,26,…)` / amber-glow `rgba(242,164,19,…)` |

## Flagship components (hand-edited, not swept)

- **`ui/Button.tsx`** — variants rebuilt: primary/premium = dark ink pill (`rounded-pill`, 48px heights kept); secondary = amber tint (`bg-accent-50 text-accent-900`); outline = white + warm border + ink text; ghost = ink-on-hover; danger = error token; link = `accent-800` + underline (`dark:text-accent-400`); per-button focus-ring classes removed (the global `:focus-visible` amber+dark ring from Batch 1 handles it).
- **`ui/Card.tsx`** — `rounded-card` (12px); glow hovers now amber; gradient accents remapped into the amber system (names kept for API compat); `dark:` variants dropped (tokens adapt).
- **`ui/ToolLayout.tsx`** — wrapper `rounded-card` + `shadow-brand-sm`; the 5-colour `colorMap` (blue/indigo/violet/emerald/amber) collapses to one amber number-badge; `color` prop kept for API compat.
- **`ui/ToolHeader.tsx`** — icon tile ink; unit toggle active = dark pill; currency dropdown active item = amber; action buttons (Formulas/Print/Share/Save/Load/References) = white + warm border + ink text, active References = dark; share menu icons = semantic (WhatsApp success, Email amber, PDF error, More info-blue); tooltip = dark ink panel. Note: the `ThemeType` prop (`default | earth | steel | ocean | emerald | sunset`) is **dead API** — no caller passes it and the component never used it; the export is kept for compat, no theme collapse was needed.
- **`ui/DetailedCalculationDisplay.tsx`** — light surfaces tokenised; the Computation panel stays dark in both modes (dark code panel by design, `bg-ink`); result colours collapse to amber, except emerald (success) which keeps its green treatment.
- **`ui/MaterialSummary.tsx`** — chart palette `COLORS` → amber/ink/muted/teal; fixed a pre-existing bug: the action button had white text on a light tint (invisible in light mode) — now a dark ink button in both modes.
- **Charts** — `D3PieChart` palette → amber/ink/muted/teal/amber-600; `MaterialCostDonutChart` `CIVIL_COLORS` → amber/sand/warm-grey/ink/teal/muted; `MarketRatesTrendChart` lines → cement amber-500, steel ink, bricks amber-600, sand teal, crush muted; grids/ticks/tooltips → warm greys.
- **`TopNavbar.tsx`** — header search pill gains the round amber search button (dark magnifier, per the Dribbble search pattern); nav/logo/icon tiles tokenised.

## Decisions applied

- **CustomCursor REMOVED** (plan §7 recommendation): the custom cursor is deleted and its mount removed from `App.tsx`. If you want it back, say so — the file is in the patch history.
- **Footer:** restyled in its current structure only (tokens, colours, type). The two-row Dribbble restructure is **Batch 3**, as stated in the Batch 1 delivery.
- **Focus rings:** per-component `ring-blue-*`/`ring-primary-*` classes were replaced by `ring-accent-500` where kept, and Button relies on the global rule.

## Method

A scripted transformation (`/tmp/batch2_sweep.py`, kept out of the repo) applied the mapping above to 76 files (~1,400 replacements), followed by hand-edits to the flagship files and a full `git diff` review. Three real bugs found and fixed in the review (all pre-existing, all in Batch 2 scope):
1. `dark:text-txt-inverse` produced ink text in dark mode (invisible) in 47 places — fixed to `dark:text-txt-primary`.
2. `MaterialSummary` action button: white text on a light tint in light mode — now dark ink.
3. `CodeReferences` toggle + `CalculationHistory` drawer close button: white icons on white surfaces in light mode — now `text-txt-tertiary`.

## Verification (10 Nov 2026)

- `npm run build` — **exit 0** (vite + esbuild server bundle; the 6.69 MB chunk warning is pre-existing)
- `npx tsc --noEmit` — **zero errors in Batch 2 files**; only the 3 pre-existing errors elsewhere (Dashboard.tsx 1228–1229 ScrollReveal `yOffset`, Contact.tsx 222 `ShieldCheck`)
- Grep audit of Batch 2 scope: **0 remaining** `blue-/indigo-/primary-/slate-/emerald-/red-/rose-/yellow-/orange-/purple-/violet-/pink-/amber-` (Tailwind) utilities
- Built CSS checked: old pink (234 76 137) **absent**; amber + ink present; remaining cool-slate values in the built CSS come from `modules/` + `pages/` (Batch 3/4 scope), not from Batch 2 files
- Contrast: white on ink 16.81:1; dark on accent-500 8.08:1; accent-800 on white 6.49:1; success/error/warning tokens per spec

## Deliberately NOT changed in Batch 2

- `ui/PrintPreviewModal.tsx` — its print stylesheet forces print colours to `#333` (`.text-indigo-600, … { color: #333 !important }`); intentionally untouched.
- `rounded-2xl` radii on modals/dropdowns — kept at 16px (spec allows 16–24px for modals); card radii are 12px via `Card.tsx`/`ToolLayout.tsx`.
- Standalone `bg-white` classes on light surfaces — kept; Batch 3 reviews them per page.
- `UniversalUI.tsx` hardcoded `dark:bg-[#151821]` (2 places) — kept; listed for Batch 3.
- No live visual preview: the browser runtime refuses localhost URLs, so verification is build + tsc + built-bundle inspection + class audit. Check the deployed preview yourself after merging (home, a tool page, dark mode, mobile menu).

## Merge instructions

1. On branch `design/dribbble-amber-redesign`, apply the patch (`git apply cep-redesign-batch2.patch`) **or** unzip `cep-redesign-batch2-UPLOAD-TO-REPO-ROOT.zip` at the repo root (it contains only the changed/new files, folders at the top level) and delete `src/components/ui/CustomCursor.tsx` by hand.
2. `npm install --ignore-scripts` then `npm run build` — expect exit 0.
3. Merge the branch into `main` when Batch 2 looks right; Batch 3 builds on this branch.

## PR description (draft)

> **feat(ui): Dribbble-style shared components with construction amber (Batch 2)**
>
> Restyles all shared components — buttons, cards, inputs, tabs, accordions, modals, tooltips, badges, results, charts, header, footer, search and bottom bars — in the Dribbble design language with the construction-amber accent.
>
> - Primary buttons are dark ink pills; secondary buttons are amber tints; links are amber-800 with underline
> - Section-number and category colours collapse to one amber system; success/error/warning stay distinct (green/red/burnt-orange)
> - Charts use amber + ink + muted + teal series
> - Header search pill gains the round amber search button; custom cursor removed
> - Fixes three pre-existing invisible-text bugs found in review (dark-mode inverse text, white-on-light buttons)
>
> No content, routes, SEO, or tool logic changed. Verified: `npm run build` exit 0, `tsc` clean on changed files, zero old colour utilities left in the shared-component scope. Next: Batch 3 (pages, incl. designed 404).
