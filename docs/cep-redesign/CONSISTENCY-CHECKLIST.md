# Consistency Checklist — Dribbble-Amber Restyle (whole site)

**Date:** 2026-11-11 · **Branch:** `design/dribbble-amber-redesign` · **Verified against HEAD:** `c70bc05`

How to check each line: the command is given; expected result is **0** (or the stated value).

## 1. No old colour utilities anywhere in `src/`
```bash
grep -rhoE "(bg|text|border|ring|from|via|to|divide|placeholder|caret|accent|shadow)-(slate|indigo|blue|emerald|green|rose|red|orange|purple|violet|pink|yellow|teal|cyan|fuchsia|lime|stone|gray|neutral|zinc|sky)-(50|100|200|300|400|500|600|700|800|900|950)(/[0-9]+)?" src/ | wc -l
```
Expected: **96 hits, all inside the 4 documented exceptions** (`src/index.css` print +
blueprint/high-contrast themes, `PrintPreviewModal.tsx` print stylesheet,
`UniversalTabs.tsx` palette, `CageEstimator.tsx` intentional keeps). Zero anywhere else.

## 2. No Tailwind `amber-*` in code
```bash
grep -rn 'amber-[0-9]' src/ --include='*.tsx' --include='*.ts' | grep -v PrintPreviewModal
```
Expected: **0** (the single remaining match is a comment in `Logo.tsx` describing `#B07006`).

## 3. No `accent-<colour>-<n>` hybrids
```bash
grep -rn 'accent-sky\|accent-blue\|accent-violet\|accent-indigo\|accent-purple\|accent-teal\|accent-emerald\|accent-green\|accent-rose\|accent-red\|accent-orange\|accent-cyan\|accent-yellow\|accent-pink\|accent-lime\|accent-fuchsia' src/ | wc -l
```
Expected: **0**.

## 4. No undefined `var(--accent-*)`
```bash
grep -rn 'var(--accent' src/ | wc -l
```
Expected: **0**. (`var(--primary-dark)` is a live token and is intentionally kept.)

## 5. Contrast traps
```bash
grep -rn 'dark:text-txt-inverse' src/ | wc -l          # expected 0
grep -rn 'text-accent-[56]\b' src/ | wc -l              # expected 0
grep -rn 'bg-accent-[56][0-9]* text-white' src/ | grep -v 'hover:\|group-hover:' | wc -l  # expected 0
```
Rules: primary buttons are **dark ink**; dark text on amber (`8.08:1`); never white text on
amber-500 (`2.08:1` FAIL); amber text on light is **accent-800** (`6.49:1`); accent-700
(`4.06:1`) large/UI only.

## 6. One accent scale, one font
- Every accent uses the `accent-*` tokens (amber scale, primary `#F2A413`); no Tailwind `amber-*`.
- Font is **Mona Sans** (self-hosted `public/fonts/MonaSans.woff2`); no other display font.
- Semantic states use `ui-success` / `ui-error` / `ui-warning` / `ui-info` tokens, never raw
  green/red/yellow families.

## 7. Charts use the 5-colour palette only
Primary `#F2A413` · 2nd `#1F1D1A` · muted `#6B6862` · amber-700 `#B07006` · teal `#0F766E`.
Gridlines `#E7E4DE`, axis labels `#6B6862`, tooltip bg `#1F1D1A`. Soil browns (`#8b5a2b`,
`#d2b48c`) are kept as **material** colours, not UI colours.

## 8. Build & types
```bash
rm -rf dist && npm run build   # expected: exit 0
npx tsc --noEmit               # expected: only the 3 pre-existing errors
                               # (Dashboard.tsx 1218–1219 yOffset; Contact.tsx 222 ShieldCheck)
```

## 9. Scope
- **266 files changed** from base `f7a77a6` (Batch 1 → G11), `+7009 / −5743`.
- Content, features, routes, SEO, logic, calculations and all estimation formulas unchanged.
