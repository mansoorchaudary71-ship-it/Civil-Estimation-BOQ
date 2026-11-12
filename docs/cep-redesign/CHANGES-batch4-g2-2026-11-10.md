# CHANGES — Batch 4 G2: Materials hub tools (Dribbble-style, amber)

**Date:** 10 November 2026 · **Branch:** `design/dribbble-amber-redesign` · **Base commit:** `b460ef3` (Batch 4 G1)
**Status:** G2 complete and verified. Awaiting confirmation before G3 (RCC & structural).

## What G2 does

Restyles the 11 materials-hub tool files in the Dribbble-amber system. **No content, routes, SEO, formulas, or tool logic changed.**

## Files changed — 11 modified, 0 deleted

- `src/components/calculators/ConcreteCalculator.tsx` (17 lines — re-export wrapper)
- `src/components/calculators/EarthworkCalculator.tsx` (16 — re-export wrapper)
- `src/components/modules/AggregateBlendingCalculator.tsx` (441)
- `src/components/modules/AggregateChart.tsx` (39 — Recharts grading curve)
- `src/components/modules/AggregateTestsCalculator.tsx` (336)
- `src/components/modules/MasterSieveAnalysis.tsx` (388 — incl. inline Recharts gradation curve)
- `src/components/calculators/MetalWeightCalculator.tsx` (17 — re-export wrapper)
- `src/components/modules/MetalWeightCalculator.tsx` (601)
- `src/components/modules/UnitConverter.tsx` (701 — incl. Recharts conversion chart)
- `src/components/calculators/TopsoilEstimator.tsx` (362)
- `src/components/modules/TopSoilFillCalculator.tsx` (308)
- (`src/components/modules/Calculators.tsx` hub shell was already done in Batch 3 — not touched again.)

## The mapping (applied everywhere)

Same system as Batches 2–3 and G1: blue/indigo solids → ink, blue links → `accent-800`, slate → warm tokens, emerald/red/yellow → semantic tokens, decorative colours → spec amber, cool shadows → warm. ~300 scripted replacements + hand-edits below.

## Hand-edits (beyond the sweep)

- **Charts restyled to the spec palette** (amber primary, ink secondary, muted tertiary, teal 4th):
  - `AggregateChart` (grading curve): Upper Limit rose → amber-700 dashed; Lower Limit blue → ink dashed; Blended % emerald → amber-500 solid; grid/axes slate → muted `#6B6862`; tooltip navy → warm ink `#1F1D1A` with `#F5F2EC` text.
  - `MasterSieveAnalysis` inline gradation curve: same mapping (Actual Gradation → amber-500); D10/D30/D60 reference lines slate → muted.
  - `UnitConverter` conversion chart: single fuchsia series → amber-500 line, amber-400 active dot, ink dot stroke; grid/axes/tooltip warmed the same way.
- **MasterSieveAnalysis — local orange accent replaced:** the tool's own `#F26B1D` orange (badge, icons, focus rings, result banner, button text) is now spec amber; the banner copy on the amber background is now dark ink (the old light-orange text on orange failed contrast). Three bare `[#151821]` dead classes removed (same pattern as G1).
- **Category icon colours collapsed:** steel-shape and unit-converter category tiles (purple/violet/pink/teal) are now `accent-700` on `accent-50` tints.
- **TopSoilFillCalculator — main CTA:** the amber-600 button is now a dark ink pill (primary CTAs are dark, per the spec).
- **TopsoilEstimator — dark results panel:** the orange CTA is now dark ink; "Total Loose Volume" label is `accent-200`.
- **Notice banners:** concrete `text-orange-900` → `text-accent-900`; earthwork `text-yellow-900` → `text-ui-warningText`.

## Deliberately kept

- `text-emerald-300` in TopsoilEstimator (line ~326): a light-green success label **on a dark results panel** — the correct dark-panel success treatment (same as the Batch 2 calculation display). Not a leftover.
- No formulas, rates, or calculation logic touched (sieve/gradation math, steel weight `d²/162.28`, conversion factors unchanged).

## Verification (10 Nov 2026)

- `npm run build` — **exit 0** (vite + esbuild server bundle; the 6.69 MB chunk warning is pre-existing)
- `npx tsc --noEmit` — **zero errors in G2 files**; only the 3 pre-existing errors elsewhere (Dashboard.tsx 1218–1219 ScrollReveal `yOffset`, Contact.tsx 222 `ShieldCheck`)
- Grep audit of G2 scope: **0 remaining** old colour utilities (`blue-/indigo-/primary-/slate-/emerald-/red-/rose-/yellow-/orange-/purple-/violet-/pink-/amber-` Tailwind, incl. `border-/ring-/from-/to-` variants) and **0** `dark:text-txt-inverse`; the only old hexes left are the intentional warm chart values (`#6B6862`, `#1F1D1A`, `#F5F2EC`, `#B07006`, `#F2A413`, `#F5B731`)
- No live visual preview: the browser runtime refuses localhost URLs, so verification is build + tsc + built-bundle inspection + class audit. Check the deployed preview yourself after merging (sieve analysis curve, metal weight, unit converter, dark mode).

## Merge instructions

1. On branch `design/dribbble-amber-redesign`, apply the patch (`git apply cep-redesign-batch4-g2.patch`) **or** unzip `cep-redesign-batch4-g2-UPLOAD-TO-REPO-ROOT.zip` at the repo root (it contains only the changed files, folders at the top level).
2. `npm install --ignore-scripts` then `npm run build` — expect exit 0.
3. Merge the branch into `main` when G2 looks right; G3 builds on this branch. The patch applies on top of G1 (commit `b460ef3`).

## PR description (draft)

> **feat(ui): Dribbble-style materials hub tools (Batch 4 G2)**
>
> Restyles the materials hub — concrete, earthwork, aggregate blending/tests, sieve analysis, metal weight, unit converter, topsoil — in the Dribbble design language with the construction-amber accent.
>
> - Grading and conversion charts use the spec palette (amber primary, ink limits, muted grid, warm tooltip)
> - Sieve analysis's local orange accent is now spec amber; banner copy is dark ink
> - Category icon colours collapse to one amber system; main CTAs are dark ink
>
> No content, routes, SEO, formulas, or tool logic changed. Verified: `npm run build` exit 0, `tsc` clean on changed files, zero old colour utilities left in the G2 scope. Next: G3 (RCC & structural).
