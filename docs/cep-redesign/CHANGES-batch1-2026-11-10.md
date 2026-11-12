# CHANGES — Batch 1: Tokens, fonts, global layout (Dribbble-style, amber)

**Date:** 10 November 2026 · **Branch:** `design/dribbble-amber-redesign` · **Base:** baseline snapshot of `Civil-Estimation-BOQ-main` (includes the merged brick calculator)
**Status:** Batch 1 complete and verified. Awaiting confirmation before Batch 2 (shared components).

## What Batch 1 does

Replaces the site's design foundation — colour tokens, typeface, type scale, focus rings, and global layout styles — with the approved Dribbble-style system (construction amber instead of Dribbble pink). **No content, routes, SEO, or tool logic changed.** No component file touched yet: buttons, cards, tool interiors, header, and footer are Batch 2–4+.

## Files changed

| File | Change |
|---|---|
| `.gitignore` | Adds `dist/` (build output was not ignored; keeps the branch clean) |
| `src/styles/tokens.css` | Rewritten: amber accent scale replaces pink 1:1; new warm-charcoal `ink` scale; warm neutral scale; white page background; warm borders; semantic colours per spec (success/error/warning distinct from amber, blue kept for info only); radii 12/16/pill; warm shadows; dark-mode warm charcoal |
| `src/styles/mona-sans.css` | **New.** `@font-face` for self-hosted Mona Sans (variable, 200–900) |
| `public/fonts/MonaSans.woff2` | **New.** Latin-subset variable font (101 KB), reused from the Easy Grade Tool premium redesign |
| `public/fonts/MonaSans-OFL.txt` | **New.** SIL Open Font License 1.1 |
| `tailwind.config.js` | `fontFamily.sans` → Mona Sans, Inter fallback; new `ink` colour; `borderRadius.card/media/pill`; comments updated (blue = info-only) |
| `src/index.css` | Base layer token-driven (body, surfaces, inputs 12px radius, labels, headings, result badge/metric); focus-visible = 2px amber-500 ring + dark outer ring; selection amber; hero gradient → warm neutrals; type scale per spec (display 56, H1 48, H2 32, H3 24, H4 20, button/nav weight 700, badge 11px); `--font-primary` → Mona Sans |
| `index.html` | Mona Sans preload; theme-color → amber `#F2A413` (light) / ink `#1F1D1A` (dark); body classes → white / warm charcoal |
| `src/main.tsx` | Imports `mona-sans.css` |
| `src/design-tokens.css` | **Deleted** — unused (imported nowhere; held the old navy/amber/Cyan + Clash Display/Satoshi system) |

## Decisions applied (from the Step 2 plan; the user started Batch 1 without answering the four open questions, so the plan's recommendations were used)

1. **Blue's fate:** blue survives ONLY as the info/semantic colour. The `primary`/`indigo`/`blue` scales still resolve to blue so the 1,000+ legacy usages keep rendering; Batch 4+ re-points them file by file. CTAs, links and focus move to ink/amber in Batch 2+.
2. **CustomCursor:** NOT touched in Batch 1 — decision deferred to Batch 2 (removal proposed).
3. **Footer:** NOT touched in Batch 1 — restructure to the two-row Dribbble pattern is Batch 3.
4. **G9 size:** NOT a Batch 1 question — decided at Batch 4 time (split into G9a/G9b if a batch gets too big).

## Important: use `accent-*`, never Tailwind's built-in `amber-*`

The spec amber scale lives in the `accent` utilities (`bg-accent-500` = `#F2A413`). Tailwind's default `amber-*` palette is different hex values — do not use it anywhere in this redesign.

## Verification (10 Nov 2026)

- `npm install --ignore-scripts` (865 packages; plain install fails on better-sqlite3 vs Node 24 — pre-existing)
- `npm run build` — **exit 0** (vite 36s + esbuild server bundle; the 6.69 MB chunk warning is pre-existing)
- `npx tsc --noEmit` — **zero errors in Batch 1 files**; only the 3 pre-existing errors elsewhere (Dashboard.tsx 1228–1229 ScrollReveal `yOffset`, Contact.tsx 222 `ShieldCheck`)
- Built CSS checked: `font-family: Mona Sans, Inter, …` present; amber-500 (242 164 19), accent-800 (133 83 7), accent-100 (254 239 195), ink (31 29 26) present; **old pink (234 76 137) absent**; focus-visible amber ring present; `dist/fonts/` contains MonaSans.woff2 + OFL; `dist/index.html` theme-color amber/ink
- Contrast (computed): dark text on amber-500 8.08:1; ink on white 16.81:1; muted #6B6862 on white 5.55:1; tertiary #78726A on white 4.76:1; amber-800 on white 6.49:1; white on ink 16.81:1; amber-500 on ink 8.08:1 — all AA

## Not verified (same limitation as before)

No live visual preview: the browser runtime refuses localhost URLs, so verification is build + tsc + built-bundle inspection. Check the deployed preview yourself after merging (home, a tool page, dark mode).

## Deliberately NOT changed in Batch 1

- Header/nav, footer, buttons, cards, tabs, modals, tool interiors, charts (Batch 2–4+)
- `--header-h` stays 72px (TopNavbar's current height; Dribbble's 92px is recorded in the spec, not mandated)
- Extra dark-mode themes (high-contrast / modern / engineering-blueprint) keep their existing overrides
- `hero-mesh-gradient` class kept (re-pointed to warm neutrals) — it is unused by any component today
- Scrollbar colours and the `.dark` safety-net overrides (neutral, follow tokens)

## Merge instructions

1. On branch `design/dribbble-amber-redesign`, apply the patch (`git apply cep-redesign-batch1.patch`) **or** unzip `cep-redesign-batch1-UPLOAD-TO-REPO-ROOT.zip` at the repo root (it contains only the changed/new files, folders at the top level) and delete `src/design-tokens.css` by hand.
2. `npm install --ignore-scripts` then `npm run build` — expect exit 0.
3. Merge the branch into `main` when Batch 1 looks right; Batch 2 builds on this branch.

## PR description (draft)

> **feat(ui): Dribbble-style design tokens with construction amber (Batch 1)**
>
> Restyles the site's design foundation to Dribbble's design language with a construction-amber accent replacing Dribbble pink.
>
> - Amber accent scale replaces the pink scale 1:1; new warm-charcoal ink scale; warm neutrals; white page background
> - Mona Sans self-hosted (OFL) as the primary typeface, Inter as fallback
> - Type scale per spec (display 56, H1 48, H2 32, H3 24), button/nav weight 700, badge 11px
> - Focus ring: 2px amber-500 + dark outer ring (AA); inputs 12px radius with amber-800 focus border
> - Blue survives only as the info/semantic colour; dark mode moves to warm charcoal
> - Deletes the unused `src/design-tokens.css`
>
> No content, routes, SEO, or tool logic changed. Verified: `npm run build` exit 0, `tsc` clean on changed files. Next: Batch 2 (shared components).
