# Before / After Checklist — Dribbble-Amber Restyle

**Date:** 2026-11-11 · **Branch:** `design/dribbble-amber-redesign`

Use this after merging to verify the new look live. "Before" is the pre-redesign site
(base commit `f7a77a6`); "after" is this branch. No live preview was possible during the
work (the browser refuses localhost), so these are the checks to run on the deployed site.

## Global
- [ ] Header / nav: dark ink logo mark and buttons, amber accents only on active states.
- [ ] Font everywhere is Mona Sans (headings tight, body regular) — no Inter, no system font.
- [ ] Page backgrounds are warm white (`#FFFFFF` base, warm surfaces), never slate/blue-grey.
- [ ] Primary buttons are **dark ink** with white text; amber appears on pills, icons,
      active tabs and highlights — never as a solid button with white text.
- [ ] Focus rings are amber (`focus:ring-accent-500`) everywhere, single ring, no doubles.
- [ ] Dark mode: warm ink surfaces, amber accents, readable muted text (no cold slate).

## Tool pages (spot-check one per group)
- [ ] Masonry / finishes (G1): brick, plaster, paint, flooring tools — amber highlights.
- [ ] Materials hub (G2): aggregate, cement, steel tables — ink headers, amber totals.
- [ ] RCC / structural (G3): slab, beam, column calculators — charts in the 5-colour palette.
- [ ] Steel / BBS / geometry (G4): bar-bending, shape tools — no rainbow gradients.
- [ ] Foundations / earthworks (G5): footing, excavation — soil browns kept as material colours.
- [ ] Roads / infrastructure (G6): pavement, drainage — amber spec lines on charts.
- [ ] Geotech / soil lab (G7): CBR, sieve, moisture — PASS/FAIL badges are semantic tints.
- [ ] MEP / energy / water / solar (G8): no sky-blue diagrams; teal only as 4th chart series.
- [ ] House / QS / BOQ (G9a–G9b): cost donuts and bars in amber/ink/muted/amber-700/teal.
- [ ] Management / misc (G10): Project Manager charts, settings modals, share sheet — all warm.
- [ ] Dashboard (G11): tool tiles are ink / amber / teal (previously invisible — the old
      `var(--accent-*)` backgrounds were undefined and rendered transparent).

## Charts (any tool with a chart)
- [ ] Series colours are only `#F2A413`, `#1F1D1A`, `#6B6862`, `#B07006`, `#0F766E`.
- [ ] Gridlines are warm `#E7E4DE`, axis labels muted `#6B6862`.
- [ ] Tooltips are dark ink with light text.
- [ ] No blue/purple/green/rose series remain.

## Things that must NOT have changed
- [ ] All calculators give the same numbers as before (spot-check: brick count, steel weight,
      concrete volume, house estimate — formulas untouched).
- [ ] All routes work (`/brick-calculator`, tool pages, dashboard, pricing).
- [ ] SEO: titles, descriptions, JSON-LD, sitemap unchanged.
- [ ] Share / export / print: the BOQ email HTML is warm-toned; print preview modal works;
      PDF export unchanged in content.

## Known visual differences to expect (intended)
- [ ] The logo's SVG gradients are warmer (amber/ink instead of slate/orange).
- [ ] The MobileLandingPage aurora blobs are a warm amber wash instead of pastel lavender/peach.
- [ ] MintroHero (unused component) is ink-themed instead of navy.
- [ ] The high-contrast / blueprint themes in `index.css` are unchanged (out of scope).
- [ ] UniversalTabs keep their per-tab colours by design (see Not-Matched List).
