# Not-Matched List — Dribbble-Amber Restyle

**Date:** 2026-11-11 · **Branch:** `design/dribbble-amber-redesign`

Everything below was deliberately **not** changed, with the reason. Anything not listed here
was restyled — the site-wide audit is 0 old colour utilities outside these items.

## 1. Extra themes in `src/index.css` (38 audit hits)
- `@media print` rules (lines ~261, ~386): selectors like `.bg-slate-50`, `.text-slate-100`
  that strip backgrounds and force dark text when printing. They target class names as
  printed, not as styled — leave them.
- `html.theme-blueprint` block: the engineering-blueprint theme (blue grid, blue surfaces).
- `html.theme-high-contrast` block: black/yellow high-contrast theme.
- Reason: extra themes are out of scope; only the default theme was restyled.

## 2. Print stylesheet in `src/components/ui/PrintPreviewModal.tsx` (3 lines: 49, 51, 76)
- Selectors (`.bg-slate-50`, `.text-indigo-600`, `.text-amber-500`, …) that restyle tool
  content for print. The modal's own UI was fully restyled (44 replacements); only the
  embedded print CSS was left alone.

## 3. Per-tab palette in `src/components/ui/UniversalTabs.tsx` (6 lines: 25–45)
- `COLOR_PALETTE`: red / emerald / purple / orange / teal borders and text, one colour per
  tab. Intentional — the tabs are distinguished by colour by design. (The tab bar's
  `dark:shadow-slate-900/20` in the JSX was fixed.)

## 4. CageEstimator dark panels (2 hits)
- `text-emerald-100` / `text-emerald-200` on dark panels (lines 200, 203). Light green text
  on a dark panel is readable and intentional (G2/G4 precedent).

## 5. `dark:bg-[#151821]` ×3 (arbitrary hex, not a Tailwind colour)
- `UniversalTabs.tsx:67`, `UniversalUI.tsx:12`, `:42`. A very dark navy used for dark-mode
  surfaces. Left as-is: it is a dark-theme shade choice, not an old brand colour, and it
  cannot be verified visually in this environment.

## 6. Token definitions & comments in `src/styles/tokens.css`
- The `accent-*` scale itself, the `ui-*` semantic tokens, and the comments explaining them
  (including the words "amber" in comments). These *define* the new system.

## 7. `var(--primary-dark)` (live token)
- Defined in `tokens.css` (`rgb(0 55 134)` light mode, `rgb(194 218 255)` dark mode) and used
  for text throughout the dashboard and glass cards. Left alone — it is a current token,
  not a dead one. (The undefined `var(--accent-*)` refs *were* fixed in G11.)

## 8. Neutral shadows & `shadow-2xl` (size, not colour)
- `rgba(0, 0, 0, 0.06)` / `rgba(0, 0, 0, 0.1)` in two tooltip shadows: neutral black at low
  opacity, standard shadow colour, not a brand colour.
- `shadow-2xl` (e.g. `CalculationHistory.tsx`): a shadow *size* utility, not a colour —
  nothing to map.

## 9. Deleted files (in the cumulative patch, not in the zip)
- `src/components/ui/CustomCursor.tsx` — deleted in Batch 2.
- `src/design-tokens.css` — deleted in Batch 1 (tokens moved to `src/styles/tokens.css`).
- Delete both in GitHub when merging; the cumulative `.patch` records the deletions.
