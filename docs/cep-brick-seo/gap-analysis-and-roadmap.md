# CEP Brick Calculator — Gap Analysis + Roadmap (2026-11-10)

Sources: repo inspection of ~/workspace/cep/Civil-Estimation-BOQ-main/ + competitor audit
~/workspace/cep-competitor-audit-brick-calculator.md (5 sites, fetched 2026-11-10).
Backlink counts/DR for the five were NOT verifiable from any free readable source — no
numbers are used anywhere below. Meta descriptions, canonical, hreflang, OG/Twitter,
JSON-LD types, CWV and mobile-friendliness were NOT observable from text fetch for any
competitor and are labelled as such in the audit.

## BLOCKER (must fix first — nothing else ranks until this is true)
- **civilestimationpro.com does not resolve.** Live browser check 2026-11-10 12:17 PKT,
  two loads: DNS_PROBE_STARTED / name not resolved. No public/CNAME in repo, so GitHub
  Pages custom domain is not configured in-repo. robots.txt + all sitemaps reference
  https://civilestimationpro.com/ — every canonical/sitemap URL is currently dead.
  Manual step for the user (see launch checklist): register/point the domain, add CNAME
  file, enable Pages custom domain + Enforce HTTPS. Until then, use the github.io URL
  as canonical OR fix the domain first. This package assumes civilestimationpro.com
  WILL be the canonical host (as robots/sitemap already claim); if the user prefers
  the github.io host, one constant change is needed (src/seo/siteConfig.ts SITE_URL).

## Verified facts used by the build (all sourced, Nov 2026)
- **Brick sizes:** PK standard 9"×4.5"×3" (nominal 230×115×75 mm; kiln sizes vary ±3 mm)
  — confirmed by Tameer, VisionBuild, Avenir + repo's existing 230×110×75 preset.
  India IS 1077: modular 190×90×90, non-modular 230×110×70 (civilsitevisit/testbook).
  UAE clay brick 215×102.5×65 mm, BS EN 771-1 (civiltechnologist, rib-software).
  Nominal size = actual + one mortar joint; estimate with nominal size.
- **Thumb rules (competitors agree):** 9" wall ≈ 9 bricks/sq ft (≈13.5 bricks/CFT);
  4.5" wall ≈ 4.5 bricks/sq ft (≈6.75/CFT); 13.5" ≈ 13.6/sq ft. Wastage 5–10%.
- **Mortar:** 1:4 standard, 1:3 load-bearing, 1:6 foundation/partition (VisionBuild FAQ).
  Dry mortar = wet × 1.33. Cement 50 kg bag = 0.0347 m³. Joint 10 mm.
- **PK rates (indicative, Nov 2026 — labelled as such on every page):**
  Awwal/1000: Lahore PKR 16,500–19,000 (checkprice.pk kiln rates) / PBS Aug 2026 survey
  Lahore 23,355; Islamabad 27,016; Rawalpindi 26,694; Karachi 22,000; Faisalabad 21,000;
  Peshawar 20,105; Multan 16,533. Doam/1000 ≈ 12,000–17,000. Cement 50 kg PKR
  1,500–1,650 retail (checkprice/propertydealer, Nov 2026); sand PKR 35–75/cft by type
  (Ravi 45–60, Chenab 60–75, pillarstone Lahore 35). Defaults used: cement 1,550/bag,
  sand 50/cft, brick per city = PBS survey figure where available (Lahore 23,355 etc.),
  else supplier-range midpoint. Every rate is user-editable; pages say "indicative —
  confirm with your supplier".
- **India rates (indicative, Nov 2026):** red clay ₹6–12/pc (metro ₹8–12); Delhi clay
  ₹11–13/pc (todaypricerates Nov 2026); fly ash ₹4–8. Defaults: Delhi ₹11, Mumbai ₹10.
  Cement India ~₹400/bag — NOT verified in this research; India pages use a clearly
  labelled placeholder default (₹400) the user must confirm, OR leave cement price
  editable with no hard claim. Decision: default ₹400/bag, labelled "indicative — confirm".
- **UAE rates:** NO grounded clay-brick per-1000 AED price found. UAE clay bricks are
  mostly imported; the common walling unit is concrete blocks: hollow block 4" AED
  1.50–2.50, 6" AED 2.00–3.50, 8" AED 2.80–4.50; AAC AED 3.50–5.50; thermal block
  ~AED 4.40 (fyind/arnifi/woodenboxtrading, 2026). Decision: UAE pages ship with the
  calculator in AED, brick price input empty with a prompt ("enter your supplier's
  rate — clay bricks are import-priced in the UAE") and the grounded block rates shown
  as context. Quantities (bricks/cement/sand) are complete; cost appears once a rate
  is entered. This is honest and still useful.
- **Formula (standard quantity-surveying method, same as repo's existing module):**
  N = V_wall / V_brick_with_mortar; wet mortar = V_wall − N×V_brick (×1.15 frog
  allowance, as the existing module does); dry mortar = wet × 1.33; cement bags =
  V_cement / 0.0347 (rounded up); sand = dry mortar × sand share. Wastage applied
  to bricks AND mortar (existing module does 10% each; new calculator makes % adjustable,
  default 5% bricks / 5% mortar per Avenir's default).

## Gap analysis table
| # | Feature / practice | Competitors with it | CEP has it? | Priority | Effort |
|---|---|---|---|---|---|
| 1 | Dedicated /brick-calculator page + URL | All 5 | NO (brick only inside hub) | High | Med |
| 2 | Clean (non-hash) crawlable URLs | All 5 (server-rendered) | NO (HashRouter, /#/…) | High | Med |
| 3 | Per-page title / meta / OG / Twitter | All 5 (titles+H1 observed) | NO (generic index.html only) | High | Low |
| 4 | JSON-LD (WebApplication, FAQPage, BreadcrumbList, Organization) | Inferred only (ratings shown) — types NOT verified | Partial (JsonLd.tsx exists, unused for brick) | High | Low |
| 5 | FAQ block (PAA-style) | Tameer 5, VisionBuild 4, Avenir 5 | NO | High | Low |
| 6 | Cost output (bricks + cement + sand + total) | VisionBuild (full), Tameer (bricks only) | NO (quantities only) | High | Low |
| 7 | Currency PKR/INR/AED | NONE | NO | Med | Low |
| 8 | Openings (doors/windows) deduction | VisionBuild, Avenir | NO (raw area number only) | High | Low |
| 9 | Wall thickness 4.5"/9"/13.5" choice | All PK sites | NO (fixed 9") | High | Low |
| 10 | Brick presets PK/IN/UAE + custom size | Tameer (custom L/H/W), Avenir (custom) | NO (2 presets only) | High | Low |
| 11 | Wastage % input (adjustable) | Avenir (5% default) | NO (fixed 10% toggle) | Med | Low |
| 12 | PDF / print / share / copy results | NONE | NO | High | Low–Med |
| 13 | Worked example on load (live numbers) | Avenir (10×10 ft → 950 bricks) | NO (empty until input) | High | Low |
| 14 | Formula shown as equations | NONE | Partial (small breakdown) | High | Low |
| 15 | Plot/house-size brick table (5 Marla…1 Kanal) | Avenir only | NO | Med | Low |
| 16 | Brick-type comparison (Awwal/Doam/machine/fly-ash) | NONE | NO | Med | Low |
| 17 | City rates + programmatic city/type/size pages | NONE (no templating on any of the 5) | NO (guide doc only, not built) | High | Med |
| 18 | Author/reviewer byline + last-updated date | NONE on calculator pages | NO | Med | Low |
| 19 | Embeddable widget (backlink generator) | NONE | NO | Low | Med |
| 20 | Sitemap lists real calculator URLs | Tameer, Avenir, VisionBuild | NO (lists non-existent flat URLs; no brick URL) | High | Low |
| 21 | Live custom domain | All 5 | NO (NXDOMAIN, no CNAME) | High | Low (manual) |
| 22 | Backlink profile replication | NOT verifiable for any of the 5 | N/A | Med | Ongoing |
| 23 | Duplicate brick logic (module + hub tab) | N/A | YES — merge | Med | Low |
| 24 | Video / glossary | NONE | NO | Low | Low |
| 25 | Breadcrumb navigation | Avenir (hub structure) | Partial | Med | Low |

## What NONE of the five do well (CEP's lead opportunities)
PDF/print/share/save; cost-per-1000 table + city rate tables; currency toggle; explicit
formula equations; brick-type comparison; author byline + last-updated; hreflang/regional
targeting; embeddable widget; video; glossary. CEP will ship ALL of the first six in
this package; widget + video stay in the 90-day plan.

## Prioritized roadmap
**P0 — Ship first (this package):** #21 domain (manual), #2 clean URLs, #1 brick page,
#3 per-page meta, #4 JSON-LD, #5 FAQ, #6 cost, #8 openings, #9 thickness, #10 presets,
#12 export/share, #13 worked example, #14 formulas, #20 sitemap.
**P1 — This package (content depth):** #7 currency, #11 wastage input, #15 plot table,
#16 type comparison, #17 programmatic starter set (6 cities + 4 types + 4 sizes),
#18 byline + last-updated, #25 breadcrumb, #23 dedupe.
**P2 — 90-day plan (docs only, no code):** #19 widget, #22 backlink replication
(free checkers: MrKeyword, Outrank.so), directories/forums/guest posts/HARO,
YouTube/LinkedIn/Facebook distribution, rate-report linkable assets. #24 video/glossary
as content tasks.
**Explicitly NOT in this package:** Next.js migration (PROGRAMMATIC_SEO_GUIDE.md
recommends it; out of scope — the BrowserRouter + 404-fallback + Helmet approach works
on GitHub Pages without a migration); full prerender/SSG (same reason; listed as
follow-up); paid tools or paid links; invented backlink numbers.

## Implementation decisions (for the user to see)
- **Routing:** main.tsx HashRouter → BrowserRouter; index.html gets the
  spa-github-pages restore script (pairs with existing public/404.html). App.tsx
  initializer reads pathname first, hash as legacy fallback. Brick page id
  "brick-calculator" added to ALL_MODULES + App switch; programmatic variants are
  parsed from the 2nd/3rd path segment inside BrickCalculatorPage (no new router).
- **Design system:** brief says navy #0A0F1E / amber #F59E0B / Syne / DM Sans; the repo
  actually ships Inter + brand blue #0056D2 + slate dark + amber accents. New code is
  built to the REPO's live tokens (Inter, #0056D2 primary, amber accent) — no silent
  rebrand. If the user wants the Syne/DM Sans/navy-amber system, that's a separate
  rebrand task.
- **Rates:** every rate is an editable input with a grounded indicative default +
  source + date label. No rate is presented as a live quote.
- **Dedupe:** new shared engine (src/lib/brickCalc.ts) + shared UI
  (src/components/calculators/BrickCalculator.tsx). The dedicated page and the hub's
  bricks tab both render it. Brickwork9InchModule is LEFT untouched (used by
  MasterQuantityEstimator BOQ flows) — documented, not deleted.
- **Related calculators:** only verified tool ids are linked: calculators (Concrete +
  Plaster hub), master-finishes (Plaster/Paint/Flooring), master-quantity, house,
  master-rcc. There are no standalone plaster/tile/paint tool pages in this repo, so
  no links to them are invented.
- **hreflang:** en-PK (self) / en-IN / en-AE + x-default on the brick page, pointing
  to the regional programmatic variants as regional equivalents (same calculator,
  localised rates/currency). Implemented via Helmet.
