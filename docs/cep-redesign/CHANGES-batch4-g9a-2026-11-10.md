# Batch 4 G9a — House & QS Core Tools — Dribbble-Amber Restyle

**Date:** 2026-11-10 · **Branch:** `design/dribbble-amber-redesign` · **Base commit:** `11fd3a0` (G8)

## Scope (8 files, 6,111 lines)
HouseEstimator, ConstructionCostSummary, AdvancedBoqGenerator, BOQGenerator,
MasterQuantityEstimator, RateAnalysis, LiveBOQ, QuickRoughEstimation.

## What changed
- **796 sweep replacements** + blanket `amber-N` → `accent-N` (0 remaining).
- **Charts (hand-fixed, palette: primary #F2A413, 2nd #1F1D1A, muted #6B6862, amber-700 #B07006, teal #0F766E):**
  - HouseEstimator cost data — every per-category hex remapped by hue family into the 5-colour
    palette (blues → ink/teal/amber-700/muted, greens → teal, warm ambers/oranges/pink/violet → amber,
    grays → muted/ink, reds → amber-700); the 4 invisible white `#FFFFFF` slices → `#B07006`;
    summary donut — Grey Structure `#64748b` → `#6B6862`, Finishing `#8b5cf6` → `#F2A413`,
    Boundary Wall `#10b981` → `#1F1D1A` (fallbacks `#64748b`/`#8b5cf6` remapped the same);
    Recharts grids `#E2E8F0` → `#E7E4DE`, axis fills `#64748B` → `#6B6862`, ticks `#94A3B8` → `#6B6862`,
    cursor `#F8FAFC` → `#F4F2EE`.
  - ConstructionCostSummary `COLORS` (6) → `["#F2A413", "#1F1D1A", "#B07006", "#6B6862", "#0F766E", "#F2A413"]`.
  - AdvancedBoqGenerator `CHART_COLORS` (material/labor) → `['#F2A413', '#1F1D1A']`.
  - RateAnalysis chart colours → palette; tooltip `backgroundColor #0f172a` → `#1F1D1A`,
    `borderColor #1e293b` → `#6B6862`; warm-paper `bg-[#FAFAF8]` → `bg-surface-default`,
    `hover:bg-[#FDFCF9]` → `hover:bg-surface-hover`.
- **BOQGenerator violet accent card → amber** (GeotechnicalCalculator precedent):
  `border-l-[#6B46C1]` → `border-l-accent-500`, icon `text-[#6B46C1]` → `text-accent-800`,
  gradient `from-[#6B46C1] to-orange-500` → `from-accent-500 to-accent-700`.
- **Double focus rings collapsed (before sweep):** `focus:ring-blue-500 focus:outline-none
  focus:ring-{indigo,purple,teal,emerald,blue}…` ×47 → single `focus:ring-accent-500`.
- **Form tints:** `accent-blue-500` ×5 → `accent-accent-600` (ConstructionCostSummary, LiveBOQ);
  `accent-violet-600` ×2 → `accent-accent-600` (HouseEstimator range slider + its tour selector string).
- **Leftovers (hand-fixed):** HouseEstimator icon chip `bg-teal-50 text-teal-700` → `bg-accent-50
  text-accent-800`; custom-rate colour map — cement `bg-stone-500/bg-stone-50` → `bg-ink-600/
  bg-surface-hover`, crush `bg-neutral-500/bg-neutral-50` → `bg-ink-600/bg-surface-hover`,
  finish labor `bg-teal-50` → `bg-accent-50`; LiveBOQ export buttons `hover:border-red-500/50` →
  `hover:border-ui-errorText/50`, `hover:border-green-500/50` → `hover:border-ui-successText/50`;
  gray pass (`border-gray-300` ×2, `border-gray-100` ×3, `border-gray-200` ×1, `bg-gray-50/50` ×1).

## Verification
- Class audit: **0 old colour utilities** in scope; 0 `dark:text-txt-inverse`; 0 `text-accent-500/600`;
  0 `bg-accent-500/600` + white text. Remaining hexes are system colours only.
- `rm -rf dist && npm run build` — **exit 0**.
- `npx tsc --noEmit` — only the 3 pre-existing errors (Dashboard.tsx 1218–1219 `yOffset`;
  Contact.tsx 222 `ShieldCheck`).

## Not changed
Content, features, routes, SEO, logic, calculations, rates, and all estimator formulas are untouched.
No file outside the 8 in scope was modified.
