# CHANGES — Batch 4 G1: Masonry & finishes tools (Dribbble-style, amber)

**Date:** 10 November 2026 · **Branch:** `design/dribbble-amber-redesign` · **Base commit:** `13a19e0` (Batch 3)
**Status:** G1 complete and verified. Awaiting confirmation before G2 (materials hub).

## What G1 does

Restyles the 12 masonry & finishes tool files in the Dribbble-amber system. **No content, routes, SEO, formulas, or tool logic changed.**

## Files changed — 11 modified, 0 deleted

- `src/components/calculators/BrickCalculator.tsx` (832 lines)
- `src/components/calculators/BrickCalculatorContent.tsx` (441)
- `src/components/modules/Brickwork9InchModule.tsx` (425)
- `src/components/modules/MasterFinishesWorkspace.tsx` (407)
- `src/components/modules/InteriorsFinishes.tsx` (857)
- `src/components/calculators/FinishesEstimator.tsx` (633)
- `src/components/modules/CountertopModule.tsx` (255)
- `src/components/calculators/PlywoodEstimator.tsx` (402)
- `src/components/calculators/PrecastWallEstimator.tsx` (337)
- `src/components/modules/PrecastWallCalculator.tsx` (310)
- `src/components/modules/ConcreteMasonryHub.tsx` (105)
- `src/components/pages/BrickCalculatorPage.tsx` — **0 changes** (already fully tokenised in Batch 3; included in the sweep as a safety net)

## The mapping (applied everywhere)

Same system as Batches 2–3: blue/indigo solids → ink, blue links → `accent-800`, slate → warm tokens, emerald/red/yellow → semantic tokens, decorative colours → spec amber, cool shadows → warm. ~580 scripted replacements + hand-edits below.

## Hand-edits (beyond the sweep)

- **InteriorsFinishes — dead classes removed:** five `[#252834]/90` and one `[#1A1C24]` bare arbitrary-value classes (no property prefix — they generated no CSS) were deleted; the indigo grid-line pattern (`#6366f1`) is now a subtle warm-ink grid (`rgba(31,29,26,0.14)`).
- **BrickCalculator — currency toggle contrast fix:** the selected currency pill was white text on amber-500 (**2.08:1, fails AA**) — now a dark ink pill (`bg-ink text-white border-ink`), matching the active-pill pattern everywhere else. The delete button's dark hover is now `ui-error/20`.
- **PlywoodEstimator — dark results panel:** the orange CTA is now dark ink; the "Total Sheets / Gross Area / Coverage Grid" labels are `accent-200` (light amber on the dark panel, unchanged in role); the coverage-grid fills and legend dot are `accent-500/80`.
- **InteriorsFinishes inputs:** the duplicated `focus:ring-amber-500` / `focus:border-amber-500` leftovers are now `accent-500` (the global amber focus ring).

## Verification (10 Nov 2026)

- `npm run build` — **exit 0** (vite + esbuild server bundle; the 6.69 MB chunk warning is pre-existing)
- `npx tsc --noEmit` — **zero errors in G1 files**; only the 3 pre-existing errors elsewhere (Dashboard.tsx 1218–1219 ScrollReveal `yOffset`, Contact.tsx 222 `ShieldCheck`)
- Grep audit of G1 scope: **0 remaining** old colour utilities (`blue-/indigo-/primary-/slate-/emerald-/red-/rose-/yellow-/orange-/purple-/violet-/pink-/amber-` Tailwind, incl. `border-/ring-/from-/to-` variants) and **0** `dark:text-txt-inverse`
- Brick page intact: title "Brick Calculator Pakistan, India" still in the built JS bundle; sitemap still lists all 17 brick URLs

## Deliberately NOT changed in G1

- No formulas, rates, or calculation logic (the brick engine `src/lib/brickCalc.ts` is untouched).
- The hub's `Calculators.tsx` bricks/blocks tab shell was done in Batch 3; G1 restyles the tab-content modules themselves (`Brickwork9InchModule` etc.).
- No live visual preview: the browser runtime refuses localhost URLs, so verification is build + tsc + built-bundle inspection + class audit. Check the deployed preview yourself after merging (brick calculator, finishes workspace, plywood estimator, dark mode).

## Merge instructions

1. On branch `design/dribbble-amber-redesign`, apply the patch (`git apply cep-redesign-batch4-g1.patch`) **or** unzip `cep-redesign-batch4-g1-UPLOAD-TO-REPO-ROOT.zip` at the repo root (it contains only the changed files, folders at the top level).
2. `npm install --ignore-scripts` then `npm run build` — expect exit 0.
3. Merge the branch into `main` when G1 looks right; G2 builds on this branch. The patch applies on top of Batch 3 (commit `13a19e0`).

## PR description (draft)

> **feat(ui): Dribbble-style masonry & finishes tools (Batch 4 G1)**
>
> Restyles the masonry & finishes tools — brick calculator, brickwork module, finishes workspace, interiors finishes, finishes estimator, countertop, plywood, precast wall and the masonry hub — in the Dribbble design language with the construction-amber accent.
>
> - Currency toggle: selected pill is now dark ink (the old white-on-amber failed contrast)
> - Plywood results panel: dark CTA, light-amber labels, amber grid fills
> - Interiors finishes: dead colour classes removed, grid lines warmed
>
> No content, routes, SEO, formulas, or tool logic changed. Verified: `npm run build` exit 0, `tsc` clean on changed files, zero old colour utilities left in the G1 scope. Next: G2 (materials hub).
