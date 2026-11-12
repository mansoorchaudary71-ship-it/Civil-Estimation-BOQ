# Batch 4 G6 — Roads & Infrastructure Tools — Dribbble-Amber Restyle

**Date:** 2026-11-10 · **Branch:** `design/dribbble-amber-redesign` · **Base commit:** `8b560a4` (G5)

## Scope (12 files, 4,833 lines)
RoadEstimator, RoadPavementEstimator, RigidPavementEstimator, AsphaltPavingCalculator,
PavementMixGradation (calculators/), MasterInfrastructureMEPEngine, EnergyMepCalculator,
VentilationChecker, DoorWindowSchedule, RoomAreaCalculator, AreaSpaceCalculator, VolumeEstimator.

## What changed
- **~701 sweep replacements** (reconstructed sweep — see note below) + blanket `amber-N` → `accent-N` (0 remaining).
- **Charts (hand-fixed, palette logic per G2 AggregateChart):**
  - PavementMixGradation gradation curve — grid `#e2e8f0` → `#E7E4DE`, axis `#64748b` → `#6B6862`,
    Lower Spec `#ef4444` → `#1F1D1A` dashed, Upper Spec `#ef4444` → `#B07006` dashed,
    Blended Mix `#8b5cf6` → `#F2A413`.
  - MasterInfrastructureMEPEngine ROI line — single-series `#10b981` → `#F2A413`.
  - VolumeEstimator pipe cross-section SVG — outer circle `#e2e8f0`/`#94a3b8` → `#F4F2EE`/`#6B6862`
    (dark `dark:fill-slate-700` → `dark:fill-ink-700`, `dark:stroke-slate-500` → `dark:stroke-ink-400`,
    inner `dark:fill-slate-900` → `dark:fill-ink-900`); Outer Dia. `#ef4444` → `#F2A413`,
    Inner Dia. `#3b82f6` → `#1F1D1A`, Wall Thick. `#10b981` → `#0F766E` (inner fill `#ffffff` kept).
- **Dead classes removed:** AsphaltPavingCalculator bare `[#1A1C24]/80` (×3) and bare
  `[0_8px_30px_rgba(15,23,42,0.2)]` (×3); EnergyMepCalculator bare `[#252834]/90` (×3).
  Asphalt shadow warmed `rgba(15,23,42,0.04)` → `rgba(31,29,26,0.04)`.
- **Leftovers (hand-fixed):** `ring-slate-400` ×25 → `ring-accent-500`; `text-rose-900` ×8 → `ui-errorText`;
  `text-emerald-900` ×2, `text-teal-900` ×1 → `ui-successText`; VentilationChecker safe-state
  `text-teal-700` → `ui-successText` (icon + copy), unsafe stays `ui-errorText`; header Wind icon
  `text-cyan-600` → `text-accent-700`; vent-safe icon `text-cyan-500` → `ui-successText`;
  duplicate `focus:ring-cyan-500` deleted (×2, accent-500 already present); safe panel
  `bg-teal-50`/`border-teal-200` → `bg-accent-50`/`border-accent-200`; DoorWindowSchedule add-entry
  button `text-teal-700 bg-teal-50` → `text-accent-800 bg-accent-50`; PavementMixGradation badge
  `text-rose-400` → `ui-errorText`, slider tints `accent-purple-600`/`accent-indigo-500` →
  `accent-accent-600`, dark input `placeholder-slate-500` → `placeholder-white/40`;
  RoomAreaCalculator compliance banner `dark:border-emerald-800` → `dark:border-ui-successText`,
  `dark:border-rose-800` → `dark:border-ui-errorText`; VolumeEstimator shape colour map —
  Trap Dumper `text-cyan-500 bg-cyan-100` and Prism `text-lime-500 bg-lime-100` (with their
  `dark:` washes) → `text-accent-800 bg-accent-100 dark:bg-accent-500/20`, Tri Dumper
  `text-accent-600` → `text-accent-800` (map already repeats accent-800; icons differ per shape);
  RigidPavementEstimator dark MaterialSummary panel — `bg-gray-50/5` → `bg-white/5`,
  `border-gray-100/10` → `border-white/10`, `text-gray-400` → `text-white/60`,
  `text-gray-300` → `text-white/80`, `text-gray-200` → `text-white`;
  gray pass — `border-gray-200` ×20 → `border-border-color`, `bg-gray-50/50` ×20 →
  `bg-surface-default/50`, `dark:text-gray-300` ×47 → `dark:text-txt-secondary`,
  `dark:text-gray-400` ×1 → `dark:text-txt-tertiary`, `border-gray-100/50` → `border-border-color`.
- **Contrast traps fixed:** `text-accent-600` ×2 → `text-accent-800` (DoorWindowSchedule Columns icon,
  VolumeEstimator Tri Dumper).

## Verification
- Class audit: **0 old colour utilities** in scope; 0 `dark:text-txt-inverse`; 0 `text-accent-500/600`;
  0 `bg-accent-500/600` + white text. Remaining hexes are system colours only
  (`#F2A413`, `#1F1D1A`, `#6B6862`, `#0F766E`, `#ffffff`, `#F4F2EE`, `#E7E4DE`, `#B07006`).
- `rm -rf dist && npm run build` — **exit 0**.
- `npx tsc --noEmit` — only the 3 pre-existing errors (Dashboard.tsx 1218–1219 `yOffset`;
  Contact.tsx 222 `ShieldCheck`).

## Process note — sweep script rebuilt
`/tmp/batch3_sweep.py` was lost in a VM replacement between batches. It was **reconstructed
from the documented Batch 2/3 rules** and saved durably at `~/workspace/cep-redesign/sweep.py`
(also copied to `/tmp/batch3_sweep.py`). Validated by an idempotency run over the already-restyle
Batch 2/3 + G1–G5 files: the only extra hits are genuine misses the original left
(`hover:border-orange-300`, `focus:ring-indigo-500`) and deliberate exceptions that are NOT
re-run (UniversalTabs' per-tab `COLOR_PALETTE`, PrintPreviewModal's print CSS, index.css theme
blocks). Two refinements vs the original: semantic **solid borders are left for hand review**
(the original left `border-red-600`/`border-emerald-600` in the palette) and yellow maps only
bg-tint / text / border-200. Per-group diff review is now an explicit step, to catch any
palette-like collapse.

## Not changed
Content, features, routes, SEO, logic, calculations, and the RigidPavementEstimator DLC/PQC
volumes are untouched. No file outside the 12 in scope was modified.
