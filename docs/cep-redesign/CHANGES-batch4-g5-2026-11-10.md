# CHANGES — Batch 4 G5: Foundations & earthworks tools (Dribbble-amber redesign)

Branch: `design/dribbble-amber-redesign`
Commit: `feat(ui): restyle foundations & earthworks tools in Dribbble-amber system (Batch 4 G5)`
Date: 2026-11-10

## Scope
12 files (3,073 lines) — the foundations/earthworks tool group from the Step 2
mapping plan (§6, G5). All 12 files changed.

| File | Lines | Changes |
|---|---|---|
| src/components/modules/Earthworks.tsx | 76 | 7 sweep |
| src/components/modules/EarthworksBase.tsx | 501 | 48 sweep + gray pass + duplicate rings |
| src/components/modules/GridEarthwork.tsx | 327 | 34 sweep + gray pass |
| src/components/modules/ChainageVolume.tsx | 529 | 84 sweep + Mass Haul Curve + duplicate rings + stray class |
| src/components/modules/TrenchExcavation.tsx | 290 | 19 sweep + gray pass + tooltip bug + title gradient |
| src/components/modules/WaterTankDesign.tsx | 21 | 9 sweep + pink theme card → amber |
| src/components/modules/ManholeModule.tsx | 385 | 21 sweep + gray pass + duplicate rings + gauge ring |
| src/components/modules/RetainingWallCalculator.tsx | 429 | 140 sweep + cross-section SVG + dark-mode safe/unsafe borders |
| src/components/modules/SlopeStability.tsx | 170 | 26 sweep |
| src/components/modules/AntiTermiteCalculator.tsx | 163 | 12 sweep + cyan water panel → amber |
| src/components/modules/BuildingSetbackCalculator.tsx | 109 | 10 sweep + purple icon → amber |
| src/components/modules/FarFsiCalculator.tsx | 73 | 10 sweep |

## What changed
- **Sweep** (420 replacements via the Batch 3 sweep script, same rules as Batches 1–G4):
  indigo/blue/primary solids → ink, indigo/blue tints → accent tints, slate → warm
  surface/text/border tokens, emerald/green → ui-success, rose/red → ui-error,
  orange/violet/purple/pink/Tailwind-amber → accent, teal solids → spec teal #0F766E.
- **Gray pass (G5-wide, ~115 replacements):** the sweep covers slate but not gray,
  and four files (EarthworksBase, GridEarthwork, TrenchExcavation, ManholeModule)
  are built on gray utilities. Mapped: `border-gray-100/50/200` →
  `border-border-color`, `border-gray-300` → `border-ui-borderDefault`,
  `bg-gray-50(/50|/30)` → `bg-surface-default(/50|/30)`, `bg-gray-100(/80)` →
  `bg-surface-hover(/80)`, `dark:text-gray-300` → `dark:text-txt-secondary`,
  `dark:text-gray-400` → `dark:text-txt-tertiary`, `divide-gray-100` /
  `divide-slate-50` → `divide-border-color`, `bg-gray-900` → `bg-ink`,
  `border-t-gray-900` → `border-t-ink`, `from-gray-900` → `from-ink`,
  `to-slate-800` → `to-ink-700`.
- **Duplicate focus rings (G5-wide):** inputs in ChainageVolume, EarthworksBase,
  ManholeModule and TrenchExcavation carried both `focus:ring-accent-500` and a
  second `focus:ring-teal-500/50` / `focus:ring-emerald-500/50` /
  `focus:ring-violet-500/50` (plus `focus:border-teal-500` /
  `focus:border-emerald-500`) — the second copy removed; the global
  `:focus-visible` amber ring plus `focus:ring-accent-500` remain.
- **ChainageVolume — Mass Haul Curve (Recharts Area, single series):** gradient
  stops amber-600 #d97706 → #F2A413 and indigo-600 #4f46e5 → amber-600 #D98F0B
  (lighter top → darker bottom, kept in the amber family); Area stroke #4f46e5 →
  #F2A413; axis ticks #64748b → #6B6862; tooltip border #e2e8f0 → #E7E4DE with a
  warm shadow; ReferenceLine #94a3b8 → #6B6862. **Pre-existing bug fixed:** the
  tooltip label was white (`#FFFFFF`) on the default white tooltip — invisible —
  now ink #1F1D1A.
- **RetainingWallCalculator — cross-section SVG:** wall fills #cbd5e1 → #E7E4DE,
  strokes #475569 → #6B6862; dimension lines/labels #64748b → #6B6862. **Kept
  intentionally:** soil dots #d2b48c and ground lines #8b5a2b (material colours,
  same decision as the G3 footing diagram). Safe/unsafe cards were already
  semantic in light mode; their dark-mode borders/text now use the semantic
  tokens too (`dark:border-emerald-500/20` → `dark:border-ui-successBorder/20`,
  `dark:border-rose-500/20` → `dark:border-ui-errorBorder/20`,
  `dark:text-rose-300` → `dark:text-ui-errorBorder`,
  `dark:border-rose-800/50|/30` → `dark:border-ui-errorBorder/50|/30`).
- **TrenchExcavation:** title gradient `from-teal-600 to-ui-successText` →
  `from-accent-800 to-accent-600`; icon tile `bg-teal-50 text-teal-700` →
  `bg-accent-50 text-accent-800`; decorative blur blob `bg-teal-500/10` →
  `bg-accent-500/10`; Info-icon hover `hover:text-teal-500` →
  `hover:text-accent-700`; dark intro panel gradient `from-gray-900 to-slate-800`
  → `from-ink to-ink-700`. **Pre-existing bug fixed:** the tooltip was ink text
  (`text-txt-primary`) on a dark tooltip background — invisible in light mode —
  now white text.
- **AntiTermiteCalculator — water panel:** cyan theme (`bg-cyan-50`,
  `border-cyan-200`, `text-cyan-900/700/500`, `text-cyan-600/70`) → amber
  (`bg-accent-50`, `border-accent-200`, `text-accent-900/800/700`,
  `text-accent-800/70`); the heading's conflicting `text-txt-primary` removed.
- **WaterTankDesign:** pink theme card (same pattern as the G4 prestressed card)
  → amber, light and dark.
- **ManholeModule — gauge ring:** the circular/rectangular manhole diagram ring
  is coloured via `currentColor` (`text-teal-200`) → `text-accent-300`; its
  dimension label `text-teal-700` → `text-accent-800`.
- **BuildingSetbackCalculator:** purple `ArrowLeftRight` icon → `text-accent-700`.
- **Stray class fragment:** ChainageVolume "Material Behaviors" heading had a
  dead `st` class (same pattern as G3/G4) → removed.

## Unchanged by design
- No calculation logic, formulas, routes, copy, SEO, or tool behaviour changed.
- Soil browns in the retaining-wall SVG (#8b5a2b, #d2b48c) are material colours, kept.
- `text-accent-700` on icons only (4.06:1 passes the 3:1 UI-component threshold).

## Verification
- `npm run build` — exit 0 (vite ~42s + esbuild server bundle; 6.69 MB chunk
  warning is pre-existing).
- `npx tsc --noEmit` — only the 3 pre-existing errors (Dashboard.tsx 1218–1219
  ScrollReveal `yOffset`, Contact.tsx 222 missing `ShieldCheck`); **zero in G5 files**.
- G5 scope grep: **0 old colour utilities**; **0** `dark:text-txt-inverse`;
  **0** `text-accent-500/600`; **0** `bg-accent-500/600 + text-white` combos.
  Remaining hardcoded hexes are the intentional warm values (#6B6862, #E7E4DE,
  #F2A413, #D98F0B, #1F1D1A) plus the kept soil tones.
- No live visual preview possible (browser refuses localhost) — verification is
  build + tsc + bundle inspection + class audit, as in previous batches.

## Files changed (12)
- src/components/modules/AntiTermiteCalculator.tsx
- src/components/modules/BuildingSetbackCalculator.tsx
- src/components/modules/ChainageVolume.tsx
- src/components/modules/Earthworks.tsx
- src/components/modules/EarthworksBase.tsx
- src/components/modules/FarFsiCalculator.tsx
- src/components/modules/GridEarthwork.tsx
- src/components/modules/ManholeModule.tsx
- src/components/modules/RetainingWallCalculator.tsx
- src/components/modules/SlopeStability.tsx
- src/components/modules/TrenchExcavation.tsx
- src/components/modules/WaterTankDesign.tsx

## PR description (draft)
**feat(ui): restyle foundations & earthworks tools in Dribbble-amber system (Batch 4 G5)**

Restyles the foundations/earthworks tool group (Earthworks, EarthworksBase,
GridEarthwork, ChainageVolume, TrenchExcavation, WaterTankDesign, ManholeModule,
RetainingWallCalculator, SlopeStability, AntiTermiteCalculator,
BuildingSetbackCalculator, FarFsiCalculator) in the Dribbble-amber design system
from the approved spec.

- The sweep's gray gap is closed: four files built on gray utilities now use the
  warm surface/border/text tokens.
- Mass Haul Curve and retaining-wall cross-section SVG use the spec palette;
  soil browns kept as material colours.
- Cyan water panel, pink theme card and purple icon collapse to amber; duplicate
  focus rings removed; two pre-existing invisible-text bugs fixed (white tooltip
  label, ink-on-dark tooltip).
- No logic, formulas, routes, copy, or SEO changed.

**Testing:** `npm run build` exit 0; `npx tsc --noEmit` clean except the 3
pre-existing errors (Dashboard ScrollReveal `yOffset`, Contact `ShieldCheck`);
class audit of the 12 changed files: 0 old colour utilities, 0 contrast traps.

## Merge steps
1. `git checkout design/dribbble-amber-redesign`
2. `git apply cep-redesign-batch4-g5.patch` (or unzip
   `cep-redesign-batch4-g5-UPLOAD-TO-REPO-ROOT.zip` at the repo root — applies on
   top of Batch 4 G4)
3. `npm install --ignore-scripts && npm run build`
4. Merge into main when green.
