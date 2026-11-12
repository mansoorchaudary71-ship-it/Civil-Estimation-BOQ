# Batch 4 G10 — Management / Misc + Standalone Tools — Dribbble-Amber Restyle

**Date:** 2026-11-10 · **Branch:** `design/dribbble-amber-redesign` · **Base commit:** `16b6743` (G9b)

## Scope (14 files, 6,774 lines)
AIAssistant, ProjectManager, SiteProgressTracker, LabourCalculator, GlobalSettingsModal,
SettingsModal, MintroHero (unused), MobileLandingPage, RelatedCalculators, MetalWeightCalculator,
UnitConverter, PlywoodEstimator, TopsoilEstimator, ShareMenu.

## What changed
- **740 sweep replacements** + blanket `amber-N` → `accent-N` (0 remaining).
- **Double focus rings collapsed (before sweep, 36):** `focus:ring-accent-500 focus:outline-none
  focus:ring-neutral-500` ×20 in MetalWeightCalculator (the original sweep had mapped the first
  ring to accent and left the neutral one), plus blue/indigo doubles in LabourCalculator ×6,
  GlobalSettingsModal ×7, SettingsModal ×3 → single `focus:ring-accent-500`.
- **Charts (hand-fixed, palette: primary #F2A413, 2nd #1F1D1A, muted #6B6862, amber-700 #B07006,
  teal #0F766E):**
  - ProjectManager — `COLORS` (6) → `['#F2A413', '#1F1D1A', '#B07006', '#6B6862', '#0F766E', '#F2A413']`;
    `chartColors` (3) → `['#F2A413', '#1F1D1A', '#B07006']`; cost Bar `#6366f1` → `#F2A413`;
    quantity Bar `#10b981` → `#1F1D1A`; cumulative-cost Line stroke + dot `#6366f1` → `#F2A413`
    (white dot outline kept); grids `#e2e8f0` → `#E7E4DE`, axis ticks `#64748b` → `#6B6862`,
    tooltip borders `#e2e8f0` → `#E7E4DE`, cursor fill `#f1f5f9` → `#F4F2EE`.
  - SiteProgressTracker EVM chart — Planned Value `#94a3b8` → `#6B6862`, Earned Value `#10b981` →
    `#F2A413`, Actual Cost `#f43f5e` → `#B07006` (gradient stops + strokes follow their series, so
    the three series stay distinct); workers chart — Planned `#94a3b8` → `#6B6862`, Actual
    `#6366f1` → `#F2A413`; Gantt track `#e2e8f0` → `#E7E4DE`.
  - UnitConverter chart — gold `#F5B731` → `#F2A413` (tooltip itemStyle + activeDot).
- **MintroHero (unused) navy theme → ink:** `primary '#0A0F1E'` → `'#1F1D1A'`, accent1 `#F59E0B` →
  `#F2A413`, accent2 `#8B5CF6` → `#B07006`, accent3 `#06B6D4` → `#0F766E`; avatar borders
  `border-[#0A0F1E]` → `border-ink`; glass cards `bg-[#0A0F1E]/80|/90` → `bg-ink/80|/90`;
  decorative blobs `to-cyan-500/20` → `to-accent-700/20`, `bg-cyan-500/20` → `bg-accent-500/20`,
  progress fill `bg-cyan-400` → `bg-accent-500`.
- **MobileLandingPage aurora blobs → warm wash:** lavender `#E0C3FC` → `#E7E4DE`, peach `#FFC3A0`
  → `#F2A413`, gold `#FFD194` → `#B07006` (blur + multiply kept); card ring `ring-slate-200` →
  `ring-border-color`.
- **ShareMenu exported email/share HTML (standalone artifact):** page bg `#f0f0f0` → `#F4F2EE`,
  row stripes `#f9f9f9` → `#F4F2EE`, borders `#ddd` → `#E7E4DE`, body text `#333`/`#333333` →
  `#1F1D1A`, header banner + table heads + PDF button `#282A65` → `#1F1D1A` (white text kept),
  total row `#E6F0FA` → `#F4F2EE`, footer `#888888` → `#6B6862`; per-material chart colours →
  palette (Cement `#60a5fa` → `#1F1D1A`, Sand `#fbbf24` → `#F2A413`, Aggregate `#94a3b8` →
  `#6B6862`, Water `#22d3ee` → `#0F766E`, Steel `#818cf8` → `#B07006`, Brick `#f43f5e` →
  `#F2A413`, Block `#fb923c` → `#B07006`, default `#cbd5e1` → `#6B6862`, fallback `#3B82F6` →
  `#F2A413`); share trigger `from-teal-500 to-ui-successText` → `from-accent-500 to-accent-700`
  (hover `accent-600/800`); all five share-option hovers → uniform `hover:bg-accent-50`,
  `hover:border-accent-200`, amber shadow `rgba(242,164,19,0.08)` (was per-brand tints); Excel /
  LinkedIn chips `bg-lime-100 text-lime-700`, `bg-sky-100 text-sky-600` → `bg-accent-50
  text-accent-800`.
- **Leftovers (hand-fixed):** AIAssistant chat shadows `shadow-slate-900/10` → `shadow-ink/10`,
  `shadow-slate-200/50` → `shadow-border-color/50`; ProjectManager success tile
  `shadow-emerald-500/20` → `shadow-ui-successText/20`, inflation range `accent-indigo-600` →
  `accent-accent-600`, empty state `text-gray-400` → `text-txt-tertiary`; SiteProgressTracker
  range `accent-indigo-600` → `accent-accent-600`; LabourCalculator role icon `text-sky-500` →
  `text-accent-700`, burn rate `text-rose-400` → `text-ui-errorText`, stat `text-sky-400` →
  `text-accent-700`; SettingsModal avatar gradient `from-sky-400` → `from-accent-500`;
  RelatedCalculators section `bg-[#f8fafc]` → `bg-surface-hover`, `hover:border-emerald-400` →
  `hover:border-ui-successText`; Plywood/Topsoil input focus borders `focus:border-emerald-500` →
  `focus:border-accent-500` (Topsoil success-ring input → `focus:border-ui-successText`);
  MetalWeightCalculator shape chips (zinc/stone/neutral/gray/sky) → neutral surface + accent
  chips; UnitConverter category chips (sky/cyan) → `text-accent-800 bg-accent-50`;
  LabourCalculator + GlobalSettingsModal arbitrary `bg-[#F5F5F7]` → `bg-surface-hover`.

## Verification
- Class audit: **0 old colour utilities** in scope; 0 `dark:text-txt-inverse`; 0 `text-accent-500/600`;
  0 `bg-accent-500/600` + white text. Remaining hexes are system colours only, plus the kept
  warm-cream tooltip text `#F5F2EC` (UnitConverter, on dark) and `#3A3630` (dark tooltip border,
  also used in other already-restyled files).
- `rm -rf dist && npm run build` — **exit 0**.
- `npx tsc --noEmit` — only the 3 pre-existing errors (Dashboard.tsx 1218–1219 `yOffset`;
  Contact.tsx 222 `ShieldCheck`).

## Not changed
Content, features, routes, SEO, logic, calculations, and all estimation formulas are untouched.
No file outside the 14 in scope was modified.
