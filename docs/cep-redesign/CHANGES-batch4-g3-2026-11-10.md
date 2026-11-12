# CHANGES — Batch 4 G3: RCC & structural tools (Dribbble-amber redesign)

Branch: `design/dribbble-amber-redesign`
Commit: `feat(ui): restyle RCC & structural tools in Dribbble-amber system (Batch 4 G3)`
Date: 2026-11-10

## Scope
11 files (4,855 lines) — the RCC & structural tool group from the Step 2 mapping plan
(§6, G3). 10 files changed; 1 file needed no changes (see below).

| File | Lines | Changes |
|---|---|---|
| src/components/modules/MasterRccCore.tsx | 378 | 44 sweep replacements |
| src/components/modules/MasterRccStructure.tsx | 68 | **0 — no changes needed** (layout-only classes; tab styling comes from UniversalTabs, restyled in Batch 2) |
| src/components/modules/BeamCalculator.tsx | 550 | 73 sweep + 1 dead-class removal |
| src/components/modules/BeamDesignTool.tsx | 359 | 30 sweep + safe/unsafe cards → semantic success/error |
| src/components/modules/ColumnEstimator.tsx | 627 | 102 sweep + violet accent → amber + conflict cleanup |
| src/components/modules/ColumnDesignTool.tsx | 316 | 16 sweep + Recharts grid + unsafe SVG → spec error |
| src/components/modules/SlabEstimator.tsx | 549 | 65 sweep + rebar chart palette + safety panel |
| src/components/modules/IsolatedFootingCalculator.tsx | 1,239 | 99 sweep + burnt-orange → amber + footing cross-section SVG restyled |
| src/components/modules/RaftFoundationDesigner.tsx | 36 | 9 sweep |
| src/components/modules/LintelDesignTool.tsx | 272 | 21 sweep + bearing-safe card → semantic success/error |
| src/components/modules/FormworkEstimator.tsx | 461 | 29 sweep + breakdown pie palette + tooltip |

## What changed
- **Sweep** (488 replacements via the Batch 3 sweep script, same rules as Batches 1–G2):
  indigo/blue/primary solids → ink, indigo/blue tints → accent tints, slate → warm
  surface/text/border tokens, emerald/green → ui-success, rose/red → ui-error,
  orange/violet/purple/pink/Tailwind-amber → accent, teal solids → spec teal #0F766E.
- **Teal = semantic "safe" state (G3-wide pre-pass, before the sweep):** the safe/unsafe
  check cards in BeamDesignTool (deflection + shear), ColumnDesignTool (isSafe) and
  LintelDesignTool (bearing) pair teal (safe) with rose (unsafe). All teal in those
  cards — and in SlabEstimator's "Precast Safety & Lifting" panel — now maps to the
  semantic success tokens (`bg-ui-success`, `border-ui-successBorder`,
  `text-ui-successText`); the rose side maps to the error tokens. The sweep's
  decorative-teal rules never fire on these files.
- **Charts/diagrams (spec palette: amber #F2A413 primary, ink #1F1D1A, muted #6B6862,
  amber-700 #B07006, teal #0F766E 4th series):**
  - SlabEstimator rebar breakdown: Main Bars indigo #6366f1 → #F2A413; Dist Bars
    teal #14b8a6 → #0F766E.
  - FormworkEstimator breakdown pie: Columns #f59e0b → #F2A413; Slabs #f43f5e →
    #1F1D1A; Beams #6366f1 → #6B6862. Tooltip: bg #1f2937 → #1F1D1A, border #374151 →
    #3A3630, text #f3f4f6 → #F5F2EC.
  - ColumnDesignTool Recharts grid #e2e8f0 → #E7E4DE; unsafe-state SVG rose #e11d48
    → spec error #B91C1C (white fill kept when safe).
  - IsolatedFootingCalculator cross-section SVG: concrete fills #cbd5e1 → #E7E4DE,
    concrete strokes #475569 → #6B6862, column fill #e2e8f0 → #F4F2EE, dimension
    lines/labels #64748b / #94a3b8 → #6B6862, centreline #cbd5e1 → #6B6862; bottom
    rebar mesh rose #f43f5e → #F2A413 with dots #1e1b4b → #855307; top mesh indigo
    #6366f1 → #1F1D1A with dots #312e81 → #6B6862 — the two meshes stay clearly
    distinct (amber vs ink). **Kept intentionally:** ground line + "G.L" label
    #8b5a2b and excavation-pit outline #d2b48c / fill rgba(139,90,43,0.05) — soil
    brown/tan, semantically correct for earth in the diagram.
- **Hand fixes:** ColumnEstimator note card violet `border-l-[#6B46C1]` →
  `border-l-accent-500`, icon → `text-accent-700`; IsolatedFootingCalculator burnt-
  orange pill `bg-[#E55A2B]/10 text-[#E55A2B]` → `bg-accent-500/10 text-accent-800`
  and `focus:ring-[#E55A2B]/50` → `focus:ring-accent-500/50`; steel-check icon rose
  `text-[#f43f5e]` → `text-accent-700`.
- **Contrast fixes (found in review):** sweep left `text-rose-900` ×11 in the
  safe/unsafe cards → `text-ui-errorText`; `text-amber-600` ℹ glyph (SlabEstimator)
  → `text-accent-800`; `text-accent-700/80` small "Tons" suffix (ColumnEstimator) →
  `text-accent-800/80`; leftover `border-gray-*` / `bg-gray-*` (sweep covers slate,
  not gray) → `border-border-color` / `border-ui-borderDefault` / `bg-surface-hover`
  / `bg-surface-active`; `to-orange-50` gradient end → `to-accent-100`;
  `text-orange-900` → `text-accent-900`; `shadow-indigo-500/30` →
  `shadow-accent-500/30`; delete-button `focus:ring-rose-500` → `ring-ui-errorText`.
- **Pre-existing mess cleaned:** ColumnEstimator safety-panel heading had a stray
  `st` class fragment plus conflicting `text-accent-700` + `text-txt-primary` and
  `mb-1` + `mb-4` → single `text-txt-primary`, `mb-4`; its crane-capacity value
  span had conflicting `text-txt-primary` + `text-accent-800` → `text-accent-800`
  only. BeamCalculator had a dead bare `[#1A1C24]/80` class (no property prefix —
  generates no CSS) → removed.

## Unchanged by design
- No calculation logic, formulas, routes, copy, SEO, or tool behaviour changed.
- MasterRccStructure.tsx: 0 changes (its own classes are layout-only; tabs render
  via UniversalTabs, already restyled in Batch 2).
- The footing SVG's soil colours (#8b5a2b, #d2b48c) are material colours, kept.
- `text-accent-700` on icons only (CopySlash, Spade, Grid2X2, Grid, ArrowDownToLine)
  — 4.06:1 passes the 3:1 UI-component threshold.

## Verification
- `npm run build` — exit 0 (vite 41.6s + esbuild server bundle; 6.69 MB chunk
  warning is pre-existing).
- `npx tsc --noEmit` — only the 3 pre-existing errors (Dashboard.tsx 1218–1219
  ScrollReveal `yOffset`, Contact.tsx 222 missing `ShieldCheck`); **zero in G3 files**.
- G3 scope grep: **0 old colour utilities** (slate/indigo/blue/emerald/green/rose/red/
  orange/purple/violet/pink/yellow/teal/cyan/fuchsia/lime/stone/gray/neutral/zinc);
  **0** `dark:text-txt-inverse`; **0** `text-accent-500/600`; **0**
  `bg-accent-500/600 + text-white` combos. Remaining hardcoded hexes are the
  intentional warm chart/diagram values (#6B6862, #E7E4DE, #F2A413, #855307,
  #1F1D1A, #F5F2EC, #B91C1C, #0F766E, #3A3630, #F4F2EE) plus the kept soil tones.
- No live visual preview possible (browser refuses localhost) — verification is
  build + tsc + bundle inspection + class audit, as in previous batches.

## Files changed (10)
- src/components/modules/BeamCalculator.tsx
- src/components/modules/BeamDesignTool.tsx
- src/components/modules/ColumnDesignTool.tsx
- src/components/modules/ColumnEstimator.tsx
- src/components/modules/FormworkEstimator.tsx
- src/components/modules/IsolatedFootingCalculator.tsx
- src/components/modules/LintelDesignTool.tsx
- src/components/modules/MasterRccCore.tsx
- src/components/modules/RaftFoundationDesigner.tsx
- src/components/modules/SlabEstimator.tsx

## PR description (draft)
**feat(ui): restyle RCC & structural tools in Dribbble-amber system (Batch 4 G3)**

Restyles the RCC & structural tool group (MasterRccCore, BeamCalculator,
BeamDesignTool, ColumnEstimator, ColumnDesignTool, SlabEstimator,
IsolatedFootingCalculator, RaftFoundationDesigner, LintelDesignTool,
FormworkEstimator) in the Dribbble-amber design system from the approved spec.

- Safe/unsafe check cards now use the semantic success/error tokens (was teal/rose).
- Rebar/breakdown charts and the footing cross-section SVG use the spec palette
  (amber primary, ink, muted, teal 4th series); the two rebar meshes stay distinct
  (amber vs ink). Soil colours in the footing diagram are kept as material colours.
- No logic, formulas, routes, copy, or SEO changed.

**Testing:** `npm run build` exit 0; `npx tsc --noEmit` clean except the 3
pre-existing errors (Dashboard ScrollReveal `yOffset`, Contact `ShieldCheck`);
class audit of the 10 changed files: 0 old colour utilities, 0 contrast traps.

## Merge steps
1. `git checkout design/dribbble-amber-redesign`
2. `git apply cep-redesign-batch4-g3.patch` (or unzip
   `cep-redesign-batch4-g3-UPLOAD-TO-REPO-ROOT.zip` at the repo root — applies on
   top of Batch 4 G2)
3. `npm install --ignore-scripts && npm run build`
4. Merge into main when green.
