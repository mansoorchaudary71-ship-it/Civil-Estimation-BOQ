# Batch 4 G7 — Geotech & Soil Lab Tools — Dribbble-Amber Restyle

**Date:** 2026-11-10 · **Branch:** `design/dribbble-amber-redesign` · **Base commit:** `e25b9b5` (G6)

## Scope (9 files, 3,180 lines)
GeotechnicalCalculator, MasterSoilMechanicsLabSuite, SoilLabSuite, CbrTestCalculator,
DirectShearTestCalculator, PermeabilityCalculator, MoistureGravityCalculator,
StaircaseCalculator, StaircaseDesignReference.

## What changed
- **372 sweep replacements** + blanket `amber-N` → `accent-N` (0 remaining).
- **Charts (hand-fixed, palette: primary #F2A413, 2nd #1F1D1A, muted #6B6862, amber-700 #B07006, teal #0F766E):**
  - MasterSoilMechanicsLabSuite — passing Line `#4f46e5` → `#F2A413`; N=25 ReferenceLine `#ef4444` → `#B07006`;
    moisture Line `#10b981` → `#1F1D1A`; CBR ReferenceLines 2.5/5.0 `#6366f1` → `#6B6862` dashed;
    load Line `#f59e0b` → `#F2A413`; shear Line `#10b981` → `#F2A413`.
  - CbrTestCalculator — area gradient stops `#6366f1` → `#F2A413`; grid `#e2e8f0` → `#E7E4DE`;
    origin-correction ReferenceLine `#f59e0b` → `#B07006` (label fill `#f59e0b` → `#B07006`);
    2.5/5.0 ReferenceLines `#10b981` → `#6B6862`; 2.5/5.0 ReferenceDots fill `#10b981` → `#F2A413`;
    load Line `#6366f1` → `#F2A413`.
  - DirectShearTestCalculator — grid `#e2e8f0` → `#E7E4DE`; axis label fills `#64748b` → `#6B6862`;
    Line `#6366f1` → `#F2A413`; marker fills `#f59e0b` → `#F2A413`, `#ef4444` → `#B07006`.
  - StaircaseCalculator SVG stair profile — dimension strokes `#f59e0b` → `#F2A413`,
    dimension text fills `#d97706` → `#B07006`.
- **Double focus rings collapsed (before sweep):** `focus:ring-blue-500 focus:outline-none
  focus:ring-indigo-500/50` (×15), `/20` (×1), plain (×5) → single `focus:ring-accent-500`.
- **Leftovers (hand-fixed):** StaircaseDesignReference safe-state `text-teal-700` ×5 → `ui-successText`
  ("✓ Pass" spans + CheckCircle2 icons); unsafe `border-rose-600` → `border-ui-errorText`;
  fail-state headings `text-orange-900` ×2 → `ui-errorText`; "All Clear" badge
  `text-teal-800` → `ui-successText`; CbrTestCalculator PASS/FAIL badge rebuilt as tint + semantic
  text (`bg-emerald-500 text-txt-primary border-emerald-600` → `bg-ui-success text-ui-successText
  border-ui-successBorder`; rose equivalent → `bg-ui-error text-ui-errorText border-ui-errorBorder`)
  — the sweep would have put dark ink text on the dark `ui-successText`/`ui-errorText` solid;
  result-card gradients `to-teal-50/30` → `to-ui-success/30`, `to-red-50/30` → `to-ui-error/30`;
  MoistureGravityCalculator wash `bg-emerald-500/10` → `bg-ui-success/10` (light tint, not solid);
  GeotechnicalCalculator violet accent `border-l-[#6B46C1]` → `border-l-accent-500` and gradient
  text `from-[#6B46C1] to-orange-500` → `from-accent-500 to-accent-700`.

## Verification
- Class audit: **0 old colour utilities** in scope; 0 `dark:text-txt-inverse`; 0 `text-accent-500/600`;
  0 `bg-accent-500/600` + white text. Remaining hexes are system colours only
  (`#F2A413`, `#1F1D1A`, `#6B6862`, `#B07006`, `#E7E4DE`).
- `rm -rf dist && npm run build` — **exit 0**.
- `npx tsc --noEmit` — only the 3 pre-existing errors (Dashboard.tsx 1218–1219 `yOffset`;
  Contact.tsx 222 `ShieldCheck`).

## Not changed
Content, features, routes, SEO, logic, calculations, and all lab-test formulas are untouched.
No file outside the 9 in scope was modified.
