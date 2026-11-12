# Batch 4 G9b — QS / BOQ Support Tools — Dribbble-Amber Restyle

**Date:** 2026-11-10 · **Branch:** `design/dribbble-amber-redesign` · **Base commit:** `f27da0a` (G9a)

## Scope (8 files, 3,783 lines)
Takeoff, QSWorkflow, MaterialTakeoffDashboard, MaterialTakeoffSheet,
MeasurementSheetCalculator, InteriorsFinishes, CostTrendChart, CostBreakdownChart.

## What changed
- **293 sweep replacements** + blanket `amber-N` → `accent-N` (0 remaining).
- **Charts (hand-fixed, palette: primary #F2A413, 2nd #1F1D1A, muted #6B6862, amber-700 #B07006, teal #0F766E):**
  - Takeoff category colours — Foundation Strip `#f59e0b` → `#F2A413`, Column Pad `#8b5cf6` → `#F2A413`,
    Brick Wall `#ef4444` → `#B07006`, RCC Slab `#06b6d4` → `#0F766E`, Road Section `#64748b` → `#6B6862`;
    takeoff SVG — strokes/fills `#3b82f6` → `#F2A413`, mode colours `#10b981` → `#0F766E`,
    `#f97316` → `#F2A413`, `#ef4444` → `#B07006`, darks `#18181b`/`#27272a` → `#1F1D1A`
    (white `#ffffff` fill kept).
  - QSWorkflow `COLORS` (5) → `['#F2A413', '#1F1D1A', '#B07006', '#6B6862', '#0F766E']`;
    print stylesheet `color: #0F172A` → `#1F1D1A`.
  - CostTrendChart (D3) — area gradient stops `#8b5cf6`/`#3b82f6` → `#F2A413` (opacities kept);
    line strokes + dot fill `#8b5cf6` → `#F2A413`; axis colour `#94a3b8` → `#6B6862`;
    tooltip background `#1e293b` → `#1F1D1A`, value colour `#a78bfa` → `#F2A413`.
  - CostBreakdownChart `COLORS` (5) → `["#F2A413", "#1F1D1A", "#B07006", "#6B6862", "#0F766E"]`;
    tooltip fallbacks `#0f172a` → `#1F1D1A`, `#334155` → `#6B6862`.
- **Double focus rings collapsed (before sweep):** the G1 leftover `focus:ring-accent-500
  focus:outline-none focus:ring-accent-500` ×21 in InteriorsFinishes (the original sweep had mapped
  both rings instead of collapsing them) plus current `focus:ring-blue-500 …` doubles ×3 →
  single `focus:ring-accent-500`.
- **InteriorsFinishes gradient headings (G1 leftovers):** `from-emerald-500 via-teal-500
  to-cyan-500` ×3 → `from-accent-500 via-accent-600 to-accent-700`.
- **Leftovers (hand-fixed):** Takeoff mode toggle `border-emerald-500` → `border-ui-successText`,
  add button `bg-emerald-600 hover:bg-emerald-500 text-txt-primary` → `bg-ui-successText text-white`
  (dark text on the dark success solid was unreadable), delete `hover:text-red-400` →
  `hover:text-ui-errorText`; QSWorkflow dropzone `border-emerald-500` → `border-ui-successText`,
  MEP icon `text-sky-500` → `text-accent-700`; MaterialTakeoffDashboard status dot
  `border-rose-500` → `border-ui-errorText`, `dark:border-rose-500/20` → `dark:border-ui-errorText/20`,
  `dark:border-yellow-600/20` → `dark:border-ui-warningText/20`; InteriorsFinishes error pill
  `border-rose-400` → `border-ui-errorText`.

## Verification
- Class audit: **0 old colour utilities** in scope; 0 `dark:text-txt-inverse`; 0 `text-accent-500/600`;
  0 `bg-accent-500/600` + white text. Remaining hexes are system colours only (plus the kept
  white `#ffffff` SVG fill in Takeoff).
- `rm -rf dist && npm run build` — **exit 0**.
- `npx tsc --noEmit` — only the 3 pre-existing errors (Dashboard.tsx 1218–1219 `yOffset`;
  Contact.tsx 222 `ShieldCheck`).

## Not changed
Content, features, routes, SEO, logic, calculations, and all QS/BOQ formulas are untouched.
No file outside the 8 in scope was modified.
