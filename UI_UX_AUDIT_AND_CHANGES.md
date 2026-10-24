# UI/UX audit and rectification — Civil Estimation Pro

Reference patterns: **Coursera** (header with Explore mega-menu + search + CTA, goal tabs, dense footer, flat blue primary)
and **Dribbble** (search-first hero with trending pills, sticky filter pills, image-first cards with hover reveal).
Note: dribbble.com/tags/website-header is JavaScript-rendered and could not be read directly, so the Dribbble
patterns come from its well-known layout, not a pixel copy. No Coursera/Dribbble copy, logos or assets were used.

## IMPORTANT: verification status
I could not run `npm install`/`vite build` (no network in my sandbox), so **nothing was rendered in a browser**.
What was verified: all 293 `.ts/.tsx` files parse with the TypeScript parser; `tailwind.config.js` loads;
text contrast ratios were computed. What was NOT verified: visual appearance, runtime behaviour, `tsc` type-check.
Please run `npm install && npm run lint && npm run build` and click through before merging.

## Root-cause bugs found (and fixed)
| # | Problem | Evidence | Fix |
|---|---------|----------|-----|
| 1 | Theme CSS variables used by Tailwind (`--color-bg-surface`, `--color-text-*`, `--color-border-*`, ...) were **never defined** | 188 files `bg-surface-default`, 215 files `txt-*`, 180 files `ui-border*` | New `src/styles/tokens.css` (light + dark), config uses `rgb(var(--x) / <alpha-value>)` so `/50` opacity modifiers also work |
| 2 | `bg-bg-card` (66 uses) not in Tailwind config | no background rendered | Added `bg.card` colour |
| 3 | `animate-in`, `fade-in`, `zoom-in-95`, `slide-in-from-*` used ~240 times but `tailwindcss-animate` not installed | `plugins: []` | Dependency-free inline plugin in `tailwind.config.js` |
| 4 | `overflow-x: hidden` on html/body/#root makes them scroll containers, which **breaks every `position: sticky`** | filter bar, sticky headers | switched to `overflow-x: clip` |
| 5 | Two competing theme providers; the unused one ran last and overwrote the saved theme with "system" on load; also a flash of light theme | `ThemeContext` vs `SettingsContext` | `ThemeProvider` made inert; pre-paint script in `index.html` reads `app-settings` |
| 6 | "Modern" and "Blueprint" themes were in the toggle cycle but their CSS classes were never applied (looked like Light) | `SettingsContext.applyTheme` | classes now applied |
| 7 | Nav "Features" link → route doesn't exist → "Module not found" | `TopNavbar` | real links |
| 8 | **Pricing page unreachable** (missing from static page list) | `App.tsx` | added |
| 9 | App navigation was state-only: no deep links, Back button leaves the site, nav items could not be real links | `activeModule` in sessionStorage | URL (`#/tool-id`) now stays in sync; Back/Forward and shared links work |
| 10 | `Esc` anywhere (even while typing in a field) sent the user Home, losing inputs | `App.tsx` | ignored in inputs/menus/dialogs |
| 11 | Skip-link used `href="#main-content"`, which breaks HashRouter | `SkipToContent` | focuses `<main>` programmatically |
| 12 | `navigate-module` event sent `{moduleId}` from Earthworks but handler expected a string | `EarthworksBase` | both shapes accepted |
| 13 | Tool cards showed invented data ("Accuracy 98.5%", "Saves 1.2k+", fake difficulty from `id.length % 3`) and popped a full-screen modal 500ms after hover | `ToolCard` | removed; uses real `difficulty` / `estimatedTime` |
| 14 | Cards were clickable `<div>`s (not keyboard/screen-reader accessible, no ctrl-click) | `ToolCard` | real link with stretched hit-area |
| 15 | Hero: fake avatars hot-linked from pravatar.cc, unverifiable "99.9% accuracy / 10,000+ professionals", dead "See How It Works" button, Tailwind-v4-only utilities (`rotate-x-*`, `perspective-*`) doing nothing | `HeroSection` | rewritten |
| 16 | Footer: 14 dead `href="#"` links, non-functional language `<select>`, placeholder social links | `Footer` | rewritten; social/email icons only render if configured |
| 17 | `Button` inside forms defaulted to submit; hover "lift" shifted layout; ripple/shimmer state per button | `Button` | `type="button"` default, flat style, no lift |
| 18 | Custom cursor was invisible (undefined colour) and re-rendered React on every mouse move | `CustomCursor` | rAF + ref, real colour, off for touch/reduced-motion |
| 19 | Global `!important` CSS fought components (`footer a`, `footer h4`, `[class*="card"] p`, `button` weight) | `index.css` | removed |
| 20 | Infinite animated page-background gradient + full-page backdrop-blur | `App.tsx` | static background |
| 21 | Old and new page overlapped during transitions | `AnimatePresence` | `mode="wait"` |
| 22 | 231 uses of 9–11px text | 66 files | raised to 12px (`text-xs`) |
| 23 | Duplicate font loading (`<link>` + `@import`), 9 font weights | `index.html`, `index.css` | single request, 5 weights |
| 24 | Three competing palettes (coral/orange in nav+hero+footer, indigo buttons, amber/cyan tokens) | many | one brand blue (+ pink accent); `indigo-*` and `blue-*` utilities remapped to it |
| 25 | 57 hard-coded light-only backgrounds had no dark variant | `bg-[#F0F4F8]` etc. | CSS safety net in `index.css` |

## Replicated patterns
* **Header** (`TopNavbar.tsx`): logo link · Explore mega-menu (categories → tools, built from `ALL_MODULES`) · search pill (opens the existing Ctrl/Cmd+K modal) · My Estimates / Pricing / Blog · Log In + "Join for Free". Mobile: accessible drawer with category accordion. Constant height, hairline border on scroll.
* **Hero** (`HeroSection.tsx`): left-aligned value prop, search with "Trending" pills, factual stats (tool count from catalogue), static product preview.
* **Goal tabs** (`GoalTabs.tsx`, new): Coursera-style "What brings you here today?" with arrow-key tabs.
* **Landing order**: Hero → goals → tool catalogue → proof / how-it-works / comparison (tools were previously below four marketing sections).
* **Filter bar** (`SearchAndFilterBar.tsx`): sticky under the header (`--header-h`), combobox search with arrow keys, pill filters, live result count.
* **Cards** (`ToolCard.tsx`): Dribbble-style thumbnail, hover reveal, save toggle, meta row.
* **Footer** (`Footer.tsx`): Coursera-style link directory with real routes.
* **All tools**: fixed through the shared layers (tokens, Button, ToolHeader, global CSS, min text size). The 97 calculator modules were **not individually redesigned**.

## Needs YOUR decision (I did not change these)
1. `SocialProofSection` testimonials (Michael R., Sarah K., David T., 5.0 stars): confirm they are real, otherwise remove (misleading endorsements can breach consumer-protection rules).
2. Three other files still hot-link pravatar/unsplash images (`grep -rn "pravatar\|unsplash" src`).
3. 3 remaining `href="#"` and 21 files using native `alert/confirm/prompt` (replace with toasts/modals).
4. Set `VITE_SUPPORT_EMAIL`, `VITE_SOCIAL_*` in `.env` to show those footer icons.
5. Brand colour: change `--color-primary-*` in `src/styles/tokens.css` to re-theme everything in one place.
6. The `Button` default variant: callers that pass their own `bg-*`/`text-*` get an unstyled base ("bare"); others get the filled primary.

## Merge steps
1. Copy the files from this zip over your repo (same paths). New: `src/styles/tokens.css`, `src/components/GoalTabs.tsx`.
2. `npm install && npm run lint && npm run build`, then check light + dark, 375px, 768px and 1280px.
3. Roll back any single file with `git checkout -- <path>` if you dislike a change.
