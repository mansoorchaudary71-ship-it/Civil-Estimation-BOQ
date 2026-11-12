# CHANGES — Batch 4 G4: Steel, BBS & geometry tools (Dribbble-amber redesign)

Branch: `design/dribbble-amber-redesign`
Commit: `feat(ui): restyle steel, BBS & geometry tools in Dribbble-amber system (Batch 4 G4)`
Date: 2026-11-10

## Scope
10 files (3,196 lines) — the steel/BBS/geometry tool group from the Step 2 mapping
plan (§6, G4). All 10 files changed.

| File | Lines | Changes |
|---|---|---|
| src/components/modules/BarBendingSchedule.tsx | 568 | 96 sweep + button shadow |
| src/components/modules/ReinforcementVisualizer.tsx | 702 | 26 sweep + rebar cross-section SVG restyled |
| src/components/modules/SteelReinforcementHub.tsx | 81 | 5 sweep |
| src/components/InteractiveSteelCalculator.tsx | 232 | 20 sweep |
| src/components/modules/UniversalStructuralGeometryEngine.tsx | 588 | 43 sweep + button shadow |
| src/components/modules/ShapeVisualizer.tsx | 252 | 2 sweep + per-shape rainbow collapsed to amber |
| src/components/modules/GradientCalculator.tsx | 266 | 20 sweep + curve-requirement card → semantic success |
| src/components/modules/CageEstimator.tsx | 244 | 32 sweep + duplicate rings + dark-panel text conflicts |
| src/components/modules/PrestressedConcreteEstimator.tsx | 243 | 27 sweep + pink theme card → amber |
| src/components/modules/PileFoundationCalculator.tsx | 20 | 7 sweep |

## What changed
- **Sweep** (278 replacements via the Batch 3 sweep script, same rules as Batches 1–G3):
  indigo/blue/primary solids → ink, indigo/blue tints → accent tints, slate → warm
  surface/text/border tokens, emerald/green → ui-success, rose/red → ui-error,
  orange/violet/purple/pink/Tailwind-amber → accent, teal solids → spec teal #0F766E.
- **ShapeVisualizer (one shape at a time):** the renderer shows a single shape per
  selection, so its per-shape rainbow (blue beams, emerald cylinder, teal 3D box,
  orange trapezoid, pink ellipse, cyan stadium, fuchsia capsule, lime parallelogram,
  indigo pentagon) was decorative only. All shapes now draw in amber #F2A413 with
  the same face-opacity structure (0.1/0.2/0.3/0.4 — the 3D box keeps its
  0.4/0.2/0.3 face shading, the cylinder keeps its 0.4 top).
- **ReinforcementVisualizer (rebar cross-section SVG):** concrete block fill #f1f5f9
  → #F4F2EE, stroke #64748b → #6B6862; hatch + arrow marker #94a3b8/#334155 →
  #6B6862; stirrup/tie + hooks + cover indication blue #3b82f6 → #F2A413; top/bottom
  bars red #ef4444/#7f1d1d → amber #F2A413 with #855307 stroke (same steel
  treatment as the G3 footing meshes); dimension lines #334155 → #6B6862, labels
  #1e293b → #1F1D1A, info text #475569 → #6B6862. Dead bare `[#1e293b]` class on
  the canvas container removed (it generated no CSS).
- **GradientCalculator:** the "Curve Requirement" card's teal state (shown when a
  vertical curve is required) → semantic success tokens (`bg-ui-success`,
  `border-ui-successBorder`, `text-ui-successText`; badge
  `bg-ui-successBorder text-ui-successText`).
- **CageEstimator:** 6 inputs carried duplicate conflicting focus rings
  (`focus:ring-accent-500` + `focus:ring-emerald-500`) → emerald copy removed.
  The dark-green results panel (`bg-ui-successText`) had conflicting
  `text-txt-primary` on the panel and heading plus a stray `st` class fragment →
  panel text is now white, heading keeps `text-emerald-100`, stray `st` removed
  (also on the "Detailed Breakdown" heading).
- **PrestressedConcreteEstimator:** its pink theme card (light mode was already
  accent) → dark-mode pink `dark:bg-pink-900/20` → `dark:bg-accent-500/10`,
  `dark:border-pink-900` → `dark:border-accent-700/40`,
  `text-pink-800 dark:text-pink-200` → `text-accent-800 dark:text-accent-300`;
  "Final Effective Stress" label `text-pink-500` → `text-accent-800`; row
  dividers `border-slate-50` → `border-border-color`.
- **Button shadows:** `shadow-blue-200` (BarBendingSchedule) → `shadow-accent-200`;
  `shadow-indigo-600/30` (UniversalStructuralGeometryEngine) →
  `shadow-accent-500/30`.

## Unchanged by design
- No calculation logic, formulas, routes, copy, SEO, or tool behaviour changed.
  (No konva is used in these files — the visualisers are plain SVG; the konva
  canvases named in the Step 2 plan live in other groups.)
- **Kept intentionally:** `text-emerald-100` / `text-emerald-200` on CageEstimator's
  dark-green results panel — light green on dark green is the correct dark-panel
  success treatment (same decision as G2's TopsoilEstimator `text-emerald-300`).
- `text-accent-700` on icons only (4.06:1 passes the 3:1 UI-component threshold).

## Verification
- `npm run build` — exit 0 (vite ~42s + esbuild server bundle; 6.69 MB chunk
  warning is pre-existing).
- `npx tsc --noEmit` — only the 3 pre-existing errors (Dashboard.tsx 1218–1219
  ScrollReveal `yOffset`, Contact.tsx 222 missing `ShieldCheck`); **zero in G4 files**.
- G4 scope grep: **0 old colour utilities** except the two intentional emerald
  texts above; **0** `dark:text-txt-inverse`; **0** `text-accent-500/600`; **0**
  `bg-accent-500/600 + text-white` combos. Remaining hardcoded hexes are the
  intentional warm SVG values (#F2A413, #6B6862, #1F1D1A, #855307, #F4F2EE).
- No live visual preview possible (browser refuses localhost) — verification is
  build + tsc + bundle inspection + class audit, as in previous batches.

## Files changed (10)
- src/components/InteractiveSteelCalculator.tsx
- src/components/modules/BarBendingSchedule.tsx
- src/components/modules/CageEstimator.tsx
- src/components/modules/GradientCalculator.tsx
- src/components/modules/PileFoundationCalculator.tsx
- src/components/modules/PrestressedConcreteEstimator.tsx
- src/components/modules/ReinforcementVisualizer.tsx
- src/components/modules/ShapeVisualizer.tsx
- src/components/modules/SteelReinforcementHub.tsx
- src/components/modules/UniversalStructuralGeometryEngine.tsx

## PR description (draft)
**feat(ui): restyle steel, BBS & geometry tools in Dribbble-amber system (Batch 4 G4)**

Restyles the steel/BBS/geometry tool group (BarBendingSchedule,
ReinforcementVisualizer, SteelReinforcementHub, InteractiveSteelCalculator,
UniversalStructuralGeometryEngine, ShapeVisualizer, GradientCalculator,
CageEstimator, PrestressedConcreteEstimator, PileFoundationCalculator) in the
Dribbble-amber design system from the approved spec.

- ShapeVisualizer's per-shape rainbow collapses to one amber system (one shape
  is shown at a time, so the colours were decorative only); face shading kept
  via opacity.
- ReinforcementVisualizer's rebar cross-section SVG: concrete warm grey, steel
  amber, dimensions muted — same steel treatment as the G3 footing meshes.
- Curve-requirement card uses semantic success tokens; prestressed tool's pink
  theme card is now amber; duplicate focus rings and conflicting dark-panel text
  cleaned in CageEstimator.
- No logic, formulas, routes, copy, or SEO changed.

**Testing:** `npm run build` exit 0; `npx tsc --noEmit` clean except the 3
pre-existing errors (Dashboard ScrollReveal `yOffset`, Contact `ShieldCheck`);
class audit of the 10 changed files: 0 old colour utilities except two intentional
emerald texts on a dark panel, 0 contrast traps.

## Merge steps
1. `git checkout design/dribbble-amber-redesign`
2. `git apply cep-redesign-batch4-g4.patch` (or unzip
   `cep-redesign-batch4-g4-UPLOAD-TO-REPO-ROOT.zip` at the repo root — applies on
   top of Batch 4 G3)
3. `npm install --ignore-scripts && npm run build`
4. Merge into main when green.
