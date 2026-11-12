# Batch 4 G8 — MEP / Energy / Water / Solar Tools — Dribbble-Amber Restyle

**Date:** 2026-11-10 · **Branch:** `design/dribbble-amber-redesign` · **Base commit:** `b8a25f2` (G7)

## Scope (10 files, 4,745 lines)
SolarRoofCalculator, SolarWaterHeaterCalculator (calculators/), RainwaterHarvesting,
WastewaterCalculator (calculators/), SewerageEstimator, RoofPitchCalculator (calculators/),
WashroomEstimator, DetailedRoomEstimators, HouseSpecs, AdvancedSpecs.

## What changed
- **558 sweep replacements** + blanket `amber-N` → `accent-N` (0 remaining).
- **SVG diagrams (hand-fixed):**
  - RainwaterHarvesting house+tank — sky blues `#0284c7`/`#0ea5e9` → teal `#0F766E` (water);
    roof `#f1f5f9` → `#F4F2EE`, tank `#f8fafc` → `#F4F2EE`, filter `#cbd5e1` → `#E7E4DE`,
    strokes `#64748b`/`#475569`/`#94a3b8` → `#6B6862`, darks `#334155` → `#1F1D1A`.
  - SewerageEstimator trench section — dimension strokes/text `#64748b`/`#475569`/`#94a3b8` → `#6B6862`;
    pipe `#b45309` → `#B07006`; backfill hatch `#d97706` → `#B07006`; manhole fill `#f3f4f6` → `#F4F2EE`,
    `#1e293b` → `#1F1D1A`; bedding dots `#9ca3af`/`#6b7280`/`#4b5563` → `#6B6862`; ground lines
    `#84cc16` → `#1F1D1A` (main) and `#4d7c0f` → `#6B6862` (secondary). **Soil-pattern dots
    `#d4af37` / `#8b4513` / `#a0522d` KEPT as material colours (G5 precedent).**
  - RoofPitchCalculator roof diagram — slopes `#f97316` → `#F2A413` (strokes), "Rafter" label
    `#f97316` → `#B07006`; rise line+text `#38bdf8` → `#0F766E`; angle arc `#fbbf24` → `#F2A413`,
    angle text `#fbbf24` → `#B07006`; span text `#cbd5e1` → `#6B6862`; overhang text `#f87171` → `#B07006`.
- **Double focus rings collapsed (before sweep):** `focus:ring-blue-500 focus:outline-none
  focus:ring-{purple,emerald,amber,cyan,indigo,blue}…` ×32 → single `focus:ring-accent-500`.
- **HouseSpecs theme map collapsed deliberately** (`bgColors`): red → `bg-ui-error/10
  border-ui-errorBorder text-ui-errorText`, gray → neutral surface tokens, teal/amber/indigo/sky/
  fuchsia → `bg-accent-500/10 border-accent-500/20 text-accent-800` (sections keep their icons/titles).
- **SewerageEstimator cyan results section → accent:** `text-cyan-900/800/700/600` → `text-accent-800`,
  `bg-cyan-50` → `bg-accent-50`, `border-cyan-200` → `border-accent-200`; teal icon chip
  `bg-teal-50 text-teal-600` → `bg-accent-50 text-accent-800` (same in AdvancedSpecs);
  dead bare `[#252834]/90` ×5 removed.
- **Leftovers (hand-fixed):** RainwaterHarvesting Annual Yield panel sky → accent
  (`bg-sky-50` → `bg-accent-50`, `border-sky-100` → `border-accent-100`, texts → `text-accent-800`,
  Droplet icon → `text-accent-700`); HouseSpecs icons `text-sky-500`/`text-cyan-500` → `text-accent-700`;
  WastewaterCalculator teal button `bg-teal-700 border-teal-700 hover:bg-teal-700` → `bg-ink border-ink
  hover:bg-ink-700`, validation `border-rose-300 focus:border-rose-500` → `border-ui-errorBorder
  focus:border-ui-errorText` (×2), invalid-input alert rebuilt as `bg-ui-error border-ui-errorBorder
  text-ui-errorText` (was light-red text on a dark-red wash); SolarRoof capacity indicator exceeding
  branch → `bg-ui-error/10 border-ui-errorBorder`; SolarWaterHeater "Estimated Savings"
  `text-emerald-900` → `text-ui-successText`; gray pass (SewerageEstimator `border-gray-200` ×23,
  `bg-gray-50/50` ×30, `border-gray-100` ×11, `border-gray-50` ×7; HouseSpecs/AdvancedSpecs grays).
- **Sweep fix (also in this commit):** `divide-*` utilities now keep their `divide-` prefix
  (the reconstructed sweep had mapped them to `border-*`). This corrects one G6 regression:
  DoorWindowSchedule:77 `divide-y border-border-color` → `divide-y divide-border-color`.

## Verification
- Class audit: **0 old colour utilities** in scope (sky included); 0 `dark:text-txt-inverse`;
  0 `text-accent-500/600`; 0 `bg-accent-500/600` + white text. Remaining hexes are system colours
  plus the 3 kept soil-pattern dots.
- `rm -rf dist && npm run build` — **exit 0**.
- `npx tsc --noEmit` — only the 3 pre-existing errors (Dashboard.tsx 1218–1219 `yOffset`;
  Contact.tsx 222 `ShieldCheck`).

## Not changed
Content, features, routes, SEO, logic, calculations, and all estimator formulas are untouched.
No file outside the 10 in scope was modified, except the one-line DoorWindowSchedule divide fix above.
