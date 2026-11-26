# Brick Calculator — Competitor Benchmark (Leg 1, CEP Mega-Round)

- **Date:** 26 November 2026
- **Live head benchmarked against:** `96632ed` (Round 5)
- **Our pages read (brief read only, not edited):** `src/components/calculators/BrickCalculator.tsx`, `src/lib/brickCalc.ts`, `src/components/calculators/BrickCalculatorContent.tsx`, `src/components/pages/BrickCalculatorPage.tsx`, `src/seo/brickProgrammatic.ts`, `src/components/calculators/BrickWallVisualizer.tsx`
- **Method:** each competitor page fetched with `browser.open` on 26 Nov 2026 (text extraction). Where a page is a JavaScript calculator, the text fetch shows only its labels/fields/content — interactive behaviour (defaults, validation, live results) could not be observed from the fetch. Anything not visible in the fetch is marked **unverified**, never "absent". No competitor text, tables or images are copied here — this document describes features only, in our own words.
- **House rules applied:** brick count N = V_wall / V_brick_with_mortar; dry mortar = wet × 1.33; cement bag = 0.0347 m³ per 50 kg; openings deducted from gross area; wastage added on top.

## Fetch status

| # | Competitor | URL | Fetch result |
|---|---|---|---|
| 1 | Omni Calculator | https://www.omnicalculator.com/construction/brick | ✅ Loaded — full article text (139 lines), incl. formula, steps, 5 FAQs, update date |
| 2 | Enviraj | https://enviraj.com/online-tools/brick-calculator.html | ⚠️ Loaded but thin — only 18 lines: field labels + empty results table. Calculator is JS-driven; defaults, dropdown values, validation, FAQ/content (if any) not visible |
| 3 | Glen-Gery | https://www.glengery.com/brick-calculator | ✅ Loaded — full page (193 lines), incl. all 18 brick sizes with per-sq-ft rates |
| 4 | Tameer.ai | https://www.tameer.ai/brick-calculator | ✅ Loaded — full page (94 lines), incl. guide + 5 FAQs (FAQ block appears twice in the fetch — 5 unique questions) |
| 5 | Marshmoor Bricks | https://marshmoorbricks.com/resources/brick-calculator/ | ⚠️ Loaded but thin — only 24 lines: intro, 2 wall fields, bond-type selector, contact block. Outputs, bond options, FAQ/content (if any) not visible |
| 6 | Vision Build Construction | https://visionbuildconstruction.com.pk/bricks-calculator.php | ✅ Loaded — full page (103 lines), incl. all fields, outputs, how-to, 4 FAQs |
| 7 | Muzdoor | https://www.muzdoor.com/calculators/brick-calculator | ⚠️ Loaded but thin — 95 lines, mostly site footer/nav. Only form field labels visible; outputs, results, FAQ/content (if any) not visible |
| 8 | Avenir Developments | https://avenirdevelopments.com/calculators/brick-quantity-calculator/ | ✅ Loaded — full page (153 lines), incl. default result, visuals description, plot-size table, 5 FAQs |

Supplementary web searches (26 Nov 2026) for Enviraj, Marshmoor, Muzdoor and Glen-Gery returned other sites' calculators, not usable detail on the four target pages — so no search-derived feature was credited to any competitor. All "unverified" cells below come from the direct fetch only.

**Accuracy note on the default wall (10 ft × 10 ft, 9 in, 5% wastage):** ours reports 873 bricks before wastage / 917 to order (exact volume method). Avenir's page shows 903 before wastage / 950 to order for the same wall — it uses the rounded 9.0 bricks/sq ft thumb rule instead of the exact figure. Vision quotes 13.5 bricks per CFT as its headline rate. These are different methods/roundings, not errors to "fix" by copying — the rebuild should keep the exact method and show the thumb rule alongside it (as our content table already does).

---

## 1. Feature matrix

Legend: ✅ present (seen in fetch) · ❌ absent (seen to be missing / not present in fetched page) · ◐ partial · **? unverified** (could not be seen in the text fetch — JS calculator, hidden tab, or truncated extraction).

### 1.1 Inputs — wall geometry

| Feature | Omni | Enviraj | Glen-Gery | Tameer | Marshmoor | Vision | Muzdoor | Avenir | **Ours (CEP)** |
|---|---|---|---|---|---|---|---|---|---|
| Wall length × height | ✅ | ✅ (ft) | ✅ (via wall area; L×H explained in text) | ✅ | ✅ (m) | ✅ | ✅ (ft/in) | ✅ | ✅ |
| Total wall-area mode (enter area directly) | ✅ | ? | ✅ (primary mode: enter wall area) | ❌ | ? | ❌ | ? | ? | ✅ (sq ft / m²) |
| Multiple walls (named, different sizes) | ❌ | ? | ❌ | ❌ | ? | ◐ count multiplier only ("Number of Walls", same size) | ? | ? | ✅ multi-wall project, per-wall size/thickness/openings + per-wall breakdown |
| Wall thickness presets | ◐ single / double stack only | ✅ (dropdown; values ?) | ❌ (face-brick only; thickness varies by product, not an input) | ◐ single / double wall type | ? | ✅ (inches) | ✅ | ✅ (9 in in default; other thicknesses ?) | ✅ 115 / 230 / 345 / 457 mm + custom |
| Reverse mode: bricks → area covered | ❌ | ? | ✅ ("wall area your quantity will cover") | ❌ | ? | ❌ | ? | ❌ | ❌ |
| Gable / non-rectangular wall | ❌ | ? | ❌ | ❌ | ? | ❌ | ? | ❌ | ❌ |
| Curved wall guidance | ❌ | ? | ❌ | ✅ (text guidance: average radius + 10–15% wastage) | ? | ❌ | ? | ❌ | ✅ (FAQ only, no input) |

### 1.2 Units and unit switching

| Feature | Omni | Enviraj | Glen-Gery | Tameer | Marshmoor | Vision | Muzdoor | Avenir | **Ours** |
|---|---|---|---|---|---|---|---|---|---|
| Length units offered | ? (not stated in fetched text) | ft only (as fetched) | ft only (as fetched) | ✅ m / ft / yd wall; mm / in brick | m only (as fetched) | ✅ unit system selector (values ?) | ✅ ft / in (length), in (height), cm (brick) | ft / in (as fetched) | ✅ ft / in / m / cm / mm / yd |
| Unit switch converts entered values (not just relabels) | ? | ? | ❌ n/a | ? | ? | ? | ? | ? | ✅ (values converted at full precision; round-trip verified 917 → 917) |
| Area units (sq ft / m²) | ? | ? | sq ft | ? | ? | sq ft | ? | sq ft | ✅ sq ft / m² in area mode |
| Brick-size units switchable | ✅ (brick dims editable) | ? | ❌ (inches only) | ✅ mm / in | ? | in only (as fetched) | cm (as fetched) | in (as fetched; "More options" per FAQ) | ✅ custom brick in mm or in |

### 1.3 Brick types, sizes and presets

| Feature | Omni | Enviraj | Glen-Gery | Tameer | Marshmoor | Vision | Muzdoor | Avenir | **Ours** |
|---|---|---|---|---|---|---|---|---|---|
| Brick size presets | ❌ (free dims only, as fetched) | ? (thickness dropdown only seen) | ✅ 18 US face-brick sizes with photos + pcs/ft² each | ❌ (free dims only) | ◐ bond-type presets + custom size option | ❌ (free dims only, in) | ? (free L/W/H in cm) | ? (default 9×4.5×3 in; custom under "More options" per FAQ) | ✅ 9 presets: PK Awwal, PK 2¾″, IN modular, IN non-modular, US standard, UAE clay, AAC block, hollow block, custom |
| Custom brick size | ✅ (L/H + joint editable) | ? | ❌ | ✅ (L/W/H + joint) | ✅ ("simple custom brick size calculator") | ✅ (L/W/H in) | ✅ (L/W/H in cm) | ✅ (per FAQ) | ✅ (mm or in) |
| Brick-type content (grades, Awwal/Doam, fly ash, machine-made…) | ❌ | ? | ✅ product catalogue per size (colour/finish, "find the perfect colour") | ◐ Awwal vs Doam, regional price note | ? | ❌ | ? | ❌ | ✅ "Brick types compared" section (Awwal / Doam / machine-made / fly ash) + 4 type programmatic pages |
| Blocks (AAC / hollow concrete) as first-class options | ❌ | ? | ❌ | ❌ | ? | ❌ | ? | ❌ | ✅ AAC 600×200×150 + hollow block 400×200×200 presets |
| Per-size pcs/ft² or pcs/m² shown on the preset | ❌ | ? | ✅ every size shows pcs/ft² | ❌ | ? | ❌ | ? | ❌ | ◐ shown in results + content table (per sq ft / per 100 sq ft / per m²), not on the preset picker itself |

### 1.4 Bond patterns

| Feature | Omni | Enviraj | Glen-Gery | Tameer | Marshmoor | Vision | Muzdoor | Avenir | **Ours** |
|---|---|---|---|---|---|---|---|---|---|
| Bond selector | ❌ | ? | ❌ | ❌ | ✅ ("Brick Layout / Bond Type" selector; option list ?) | ❌ | ? | ✅ English bond in default result | ✅ stretcher / English / Flemish |
| Bond changes the brick count | n/a | n/a | n/a | n/a | ? | n/a | n/a | ❌ explicitly: "Bond pattern does not change the count" | ❌ explicitly: count identical for all three (stated in FAQ + content) |
| Bond drawn visually | ❌ | ? | ❌ | ❌ | ? | ❌ | ? | ✅ bond drawing + stretcher/header faces + wall section | ✅ to-scale course-by-course elevation: stretcher/header faces per bond, openings cut out |
| Bond explained (strength / use) | ❌ | ? | ❌ | ❌ | ? | ❌ | ? | ❌ | ✅ per-bond note + FAQ ("stretcher vs English vs Flemish") |

### 1.5 Openings deduction

| Feature | Omni | Enviraj | Glen-Gery | Tameer | Marshmoor | Vision | Muzdoor | Avenir | **Ours** |
|---|---|---|---|---|---|---|---|---|---|
| Openings deducted at all | ❌ (not in fetched text) | ? | ◐ manual only: text says "subtract the area of any openings" — no field seen | ❌ | ? | ✅ total openings area (sq ft) | ? | ✅ (0 sq ft in default; "Doors and windows" in visuals) | ✅ |
| Per-opening list (door/window, size, count) | ❌ | ? | ❌ | ❌ | ? | ❌ (total area only) | ? | ? | ✅ per-opening list (door / window / other + count), per wall in multi mode |
| Total-area openings mode | ❌ | ? | ❌ | ❌ | ? | ✅ | ? | ? | ✅ (per wall, either mode) |
| Openings shown in the wall drawing | ❌ | ? | ❌ | ❌ | ? | ❌ | ? | ✅ (doors/windows in drawing) | ✅ (openings cut out of the elevation) |
| Validation: openings larger than wall | ? | ? | ❌ | ❌ | ? | ? | ? | ? | ✅ error message with both areas |
| Surveying rule noted (small openings) | ❌ | ? | ❌ | ❌ | ? | ❌ | ? | ❌ | ✅ FAQ notes the <0.5 m² plastering rule vs full deduction for brick quantity |

### 1.6 Mortar joint and wastage

| Feature | Omni | Enviraj | Glen-Gery | Tameer | Marshmoor | Vision | Muzdoor | Avenir | **Ours** |
|---|---|---|---|---|---|---|---|---|---|
| Mortar joint thickness editable | ✅ ("Brick details") | ? | ◐ fixed 3/8″ in the published pcs/ft² (paver noted "without joint") | ✅ (mm) | ✅ 10 mm default stated | ❌ (not a field in fetch) | ? | ✅ 10 mm in default result | ✅ editable mm, default 10 |
| Wastage % editable | ✅ | ? | ❌ advisory only ("add a wastage allowance") | ✅ | ? | ❌ advisory only (guide: "add 5–10% extra") | ? | ✅ 5% in default result | ✅ pills 0/5/10/15 + custom; applies to bricks and mortar |
| Wastage shown separately (before vs after) | ✅ ("two numbers") | ? | ❌ | ✅ (bricks needed / wastage / total) | ? | ❌ | ? | ✅ (903 before / 950 to order) | ✅ (before + wastage bricks + to order) |

### 1.7 Mortar / cement / sand by mix ratio

| Feature | Omni | Enviraj | Glen-Gery | Tameer | Marshmoor | Vision | Muzdoor | Avenir | **Ours** |
|---|---|---|---|---|---|---|---|---|---|
| Mortar volume (wet / dry) | ✅ wet + dry volume | ✅ mortar ft³ (wet/dry ?) | ❌ | ❌ | ? | ❌ (volume only via wall volume) | ? | ✅ wet mortar 14.8 cft (dry ?) | ✅ wet + dry, m³ and cft |
| Mix ratio selectable | ✅ | ? (ratio field seen on Muzdoor, not Enviraj) | ❌ | ❌ | ? | ✅ cement:sand parts | ✅ ("Ratio" field) | ✅ 1:6 in default result | ✅ presets 1:3 / 1:4 / 1:5 / 1:6 + custom parts |
| Cement bags | ✅ (bag size editable) | ✅ kg (bags ?) | ❌ | ❌ | ? | ✅ 50 kg bags | ? | ✅ 50 kg bags | ✅ bags (ceil) + kg; bag size editable (50 kg default, 0.0347 m³/bag) |
| Sand quantity | ✅ | ✅ ft³ | ❌ | ❌ | ? | ✅ cft | ? | ✅ cft | ✅ cft + m³ |
| Dry-volume factor shown / explained | ✅ (dry volume step) | ? | ❌ | ❌ | ? | ? | ? | ? | ✅ ×1.33 explained in formula section; ×1.15 frog allowance also shown |
| Mix guide table (cement/sand per m³ dry mortar) | ❌ | ? | ❌ | ❌ | ? | ❌ | ? | ❌ | ✅ 1:3–1:6 table, engine-computed |
| Cement per 1,000 bricks rule | ✅ FAQ: ~120 kg cement + 0.4 m³ sand per 1,000 bricks at 1:5 | ? | ❌ | ❌ | ? | ◐ headline rates: 0.042 bags/CFT (1:4), 0.23 sand CFT/CFT | ? | ❌ | ◐ FAQ rule of thumb (~0.06 bags/CFT at 1:4, ~0.07 at 1:3); not a per-1,000-bricks figure |

### 1.8 Cost

| Feature | Omni | Enviraj | Glen-Gery | Tameer | Marshmoor | Vision | Muzdoor | Avenir | **Ours** |
|---|---|---|---|---|---|---|---|---|---|
| Brick cost | ✅ price per brick → brick cost | ? | ✅ price/sq ft + price/1,000 from wall area + budget | ✅ price per brick (PKR) → brick cost | ? | ✅ price per brick (PKR) → brick cost | ? | ❌ (no cost in fetched page) | ✅ editable rate per 1,000 |
| Cement cost | ❌ (mortar quantities only, no prices) | ? | ❌ | ❌ | ? | ✅ cement bag price (PKR) | ? | ❌ | ✅ editable rate per bag |
| Sand cost | ❌ | ? | ❌ | ❌ | ? | ✅ sand price (PKR/CFT) | ? | ❌ | ✅ editable rate per cft (PKR/INR) or m³ (AED) |
| Labour cost | ❌ | ? | ❌ | ❌ | ? | ❌ | ? | ❌ | ❌ (explicitly excluded; "materials only") |
| Total cost | ◐ bricks only | ? | ◐ brick cost only (per sq ft / per 1,000) | ◐ bricks only | ? | ✅ materials total (bricks + cement + sand) | ? | ❌ | ✅ materials total (bricks + cement + sand) |
| Currencies | ? (not stated in fetch) | ? | USD implied (US site) | PKR only | GBP implied (UK site) | PKR only | PKR implied (PK site) | PKR implied | ✅ PKR / INR / AED switcher, per-currency editable rates |
| Indicative / live rates prefilled | ❌ (user enters price) | ? | ❌ | ❌ (user enters price) | ? | ❌ (user enters prices) | ? | ❌ | ✅ indicative defaults (PKR 20,000/1,000, cement 1,550/bag, sand 50/cft; INR 10,000/400/80; AED cement 25) + per-city rates on city pages |
| Budget mode (enter budget → qty / price) | ❌ | ? | ✅ price per sq ft and per 1,000 from wall area + budget | ❌ | ? | ❌ | ? | ❌ | ❌ |

### 1.9 Outputs — quantity expressions

| Feature | Omni | Enviraj | Glen-Gery | Tameer | Marshmoor | Vision | Muzdoor | Avenir | **Ours** |
|---|---|---|---|---|---|---|---|---|---|
| Bricks to order (with wastage) | ✅ | ✅ nos | ✅ | ✅ | ? | ✅ | ? | ✅ 950 | ✅ |
| Bricks before wastage | ✅ | ? | ❌ | ✅ | ? | ? | ? | ✅ 903 | ✅ |
| Bricks per sq ft | ✅ FAQ (~5/sq ft, US sizes) | ? | ✅ pcs/ft² per size | ◐ per m² in FAQ (57/m² for 9″, 28/m² for 4½″) | ? | ◐ per CFT (13.5/CFT headline) | ? | ✅ 9.0/sq ft | ✅ per sq ft + per m² (+ per 100 sq ft in content table) |
| Bricks per m² | ? | ? | ❌ | ✅ (FAQ) | ? | ❌ | ? | ❌ | ✅ |
| Bricks per 1,000 / per 100 sq ft | ? | ? | ◐ price per 1,000 (cost, not qty) | ❌ | ? | ❌ | ? | ❌ | ◐ per 100 sq ft in content table; no "bricks per 1,000" quantity output |
| Bricks per CFT | ❌ | ? | ❌ | ❌ | ? | ✅ 13.5/CFT headline | ? | ❌ | ◐ engine helper exists (`bricksPerArea().perCft`); not shown in calculator results |
| Packs / pallets / trucks to order | ❌ | ? | ❌ | ❌ | ? | ❌ | ? | ❌ | ❌ |
| Wall volume / areas shown | ✅ (area-based method) | ? | ✅ wall area | ✅ (area-based method) | ? | ✅ wall volume CFT + net area sq ft | ? | ✅ gross/net area | ✅ gross / openings / net area (m² + sq ft), wall volume (m³ + cft) |
| Courses count | ❌ | ? | ❌ | ❌ | ? | ❌ | ? | ❌ | ❌ (visualiser draws courses but does not report a course count) |
| Step-by-step working shown | ◐ formula + steps in text | ? | ❌ | ❌ | ? | ❌ | ? | ◐ result breakdown list | ✅ full breakdown list + formula section |

### 1.10 Visuals

| Feature | Omni | Enviraj | Glen-Gery | Tameer | Marshmoor | Vision | Muzdoor | Avenir | **Ours** |
|---|---|---|---|---|---|---|---|---|---|
| Wall diagram / elevation | ✅ 1 static image (wall under construction with dimensions) | ❌ | ❌ | ❌ | ? | ❌ | ? | ✅ wall elevation + section through wall + stretcher/header faces | ✅ to-scale elevation, courses drawn from real brick + joint sizes |
| Bond drawing | ❌ | ? | ❌ | ❌ | ? | ❌ | ? | ✅ | ✅ (in the elevation itself, per selected bond) |
| Product photos | ❌ | ? | ✅ photo per brick size (18) | ❌ | ? | ❌ | ? | ❌ | ❌ |
| "Try it on your house" / visual design tool | ❌ | ? | ✅ virtual design tool ("try on" brick) | ❌ | ? | ❌ | ? | ❌ | ❌ |
| Where-to-buy / supplier finder | ❌ | ? | ✅ "Where to Buy" distributor finder | ◐ platform CTA (construction marketplace) | ✅ contact/phone prominent (merchant site) | ◐ contact details + address | ◐ marketplace CTAs | ◐ offices/contact (builder site) | ❌ |

### 1.11 Content depth

| Feature | Omni | Enviraj | Glen-Gery | Tameer | Marshmoor | Vision | Muzdoor | Avenir | **Ours** |
|---|---|---|---|---|---|---|---|---|---|
| How-to / steps section | ✅ (4 steps + mortar steps) | ? | ✅ (Step 1 select brick, Step 2 calculate) | ✅ guide (sizes, single vs double, wastage) | ? | ✅ "How to Use" list | ? | ❌ (no guide section in fetch) | ✅ "How the calculator works" (4 steps) |
| Formula shown | ✅ area method: bricks = (L×H)/((l+t)×(h+t)) | ? | ❌ | ❌ | ? | ❌ | ? | ❌ | ✅ full volume method + mortar chain, all 9 lines |
| Worked example | ❌ | ? | ❌ | ❌ | ? | ❌ | ? | ◐ default 10×10 wall doubles as the example | ✅ 10×10 wall worked through + door variant (21 sq ft → ~725 bricks) |
| Reference tables | ❌ | ? | ✅ pcs/ft² per size (18 rows) | ❌ | ? | ✅ headline rates (bricks/CFT, bags/CFT, sand/CFT) | ? | ✅ bricks by plot size (5 Marla–2 Kanal) | ✅ 5 tables: brick sizes, bricks/area by thickness, mix guide, city rates (8 cities), house sizes (external/internal/boundary/total) |
| Bricks-by-house/plot-size table | ❌ | ? | ❌ | ❌ | ? | ❌ | ? | ✅ 5 Marla–2 Kanal, Q4 2026 cost model | ✅ 5 Marla / 7 Marla / 10 Marla / 1 Kanal (external + internal + boundary + total) |
| Brick rates by city | ❌ | ? | ❌ | ◐ text: Lahore vs Karachi vary; Awwal vs Doam | ? | ❌ | ? | ◐ cost model dated Q4 2026, no city table | ✅ city rates table + 8 city programmatic pages with sourced rates |
| Brick types compared | ❌ | ? | ◐ via product catalogue | ◐ Awwal vs Doam | ? | ❌ | ? | ❌ | ✅ dedicated section + 4 type pages |
| Glossary | ❌ | ? | ❌ | ❌ | ? | ❌ | ? | ❌ | ✅ glossary section |
| FAQ count (unique questions, as fetched) | 5 | 0 seen (?) | 0 | 5 | 0 seen (?) | 4 | 0 seen (?) | 5 | **14** |
| Last-updated date shown | ✅ updated 2026-08-07 (published 2015-12-08) | ? | ? | ? | ? | ? | ? | ◐ cost model dated Q4 2026 | ✅ "Last updated: 20 November 2026" |
| Ratings / reviews shown | ❌ | ? | ❌ | ✅ 4.8/5 (1,250 reviews) | ? | ✅ 4.9/5 (156 ratings) | ? | ❌ | ❌ (no rating shown; reviewer credit exists in site config — verify before claiming) |

### 1.12 Schema / JSON-LD (presence)

| Feature | Omni | Enviraj | Glen-Gery | Tameer | Marshmoor | Vision | Muzdoor | Avenir | **Ours** |
|---|---|---|---|---|---|---|---|---|---|
| JSON-LD present (any type) | ? (not visible in text fetch; "Additional Details" block suggests structured data) | ? | ? | ? (rating display suggests AggregateRating, not confirmed) | ? | ? (rating display suggests AggregateRating, not confirmed) | ? | ? (business details suggest LocalBusiness, not confirmed) | ✅ confirmed in source: WebApplication + HowTo + FAQPage + BreadcrumbList + Organization |
| FAQPage schema | ? | ? | ? | ? | ? | ? | ? | ? | ✅ 14 questions |
| HowTo schema | ? | ? | ? | ? | ? | ? | ? | ? | ✅ 4 steps |
| BreadcrumbList / hreflang | ? | ? | ? | ? | ? | ? | ? | ? | ✅ BreadcrumbList + hreflang en-PK / en-IN / en-AE / x-default |
| Programmatic variants (city / type / size pages) | ❌ | ? | ◐ per-product pages (not calculator variants) | ❌ | ? | ❌ | ? | ❌ | ✅ 8 city + 4 type + 4 house-size variants |

### 1.13 Page speed / mobile UX (observations — text fetch only, no live render)

| Feature | Omni | Enviraj | Glen-Gery | Tameer | Marshmoor | Vision | Muzdoor | Avenir | **Ours** |
|---|---|---|---|---|---|---|---|---|---|
| Text-fetch readability | Full article readable | Calculator-only, no content | Full page readable; 18 product images listed | Full page readable | Calculator-only, no content | Full page readable | Mostly nav/footer; calculator labels only | Full page readable | n/a (source read, not fetched) |
| Mobile-UX evidence in fetch | ? (not observable from text fetch) | ? | ? | ? | ? | ? | ? | ? | Live-verified Rounds 1–5 at 360/390 px (per project record); not re-checked in this leg |
| Calculator usable without scrolling past long content | ✅ tool first (content below, as fetched) | ✅ tool only | ✅ tool first | ✅ tool first | ✅ tool only | ✅ tool first | ? | ✅ result first ("Bricks to order" headline) | ✅ tool first, content below |
| Result headline ("bricks to order" up front) | ❌ (two numbers in results, per text) | ? | ❌ (three modes, no headline seen) | ✅ ("Bricks Required" block) | ? | ✅ ("Bricks Required") | ? | ✅ "950 bricks" headline | ✅ headline result card |
| Export / save / share | ? | ? | ❌ | ❌ | ? | ❌ | ? | ❌ | ✅ PDF, print, copy, share, CSV/Excel, save + calculation history, reset |

### 1.14 Regional coverage

| Region | Omni | Enviraj | Glen-Gery | Tameer | Marshmoor | Vision | Muzdoor | Avenir | **Ours** |
|---|---|---|---|---|---|---|---|---|---|
| Pakistan | ❌ (US sizes) | ✅ (IN/PK-style ft tool; site is Indian) | ❌ | ✅ primary (PK, PKR, Lahore/Karachi, Awwal) | ❌ | ✅ primary (PK, PKR, Islamabad) | ✅ primary (PK, PKR, Karachi) | ✅ primary (PK, PKR, Lahore/Islamabad/Rawalpindi) | ✅ primary (PK, PKR, 4 PK city pages, PBS rates) |
| India | ❌ | ✅ (Indian site, ft + IS-style tool) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ (INR, IS 1077 presets, Delhi/Mumbai pages) |
| UAE / Gulf | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ◐ Dubai associate office only | ✅ (AED, BS EN 771-1 preset, Dubai/Abu Dhabi pages) |
| UK | ❌ | ❌ | ❌ | ❌ | ✅ primary (UK metric brick 215×65, 10 mm joint) | ❌ | ❌ | ❌ | ◐ partial: 215×102.5×65 mm size exists but is labelled UAE clay; no UK preset, no GBP |
| US | ✅ primary (US sizes, $ pricing) | ❌ | ✅ primary (US face brick, ASTM) | ❌ | ❌ | ❌ | ❌ | ❌ | ◐ partial: US standard preset exists; no USD currency |

---

## 2. Best of each — the single best feature to take from each competitor

1. **Omni — mortar as an opt-in second stage with its own steps.** The "Want to see the materials for your mortar? Yes/No" gate plus a 5-step mortar walkthrough is the clearest onboarding pattern in the set. Take: a collapsed/optional mortar section for first-time users (ours shows everything at once).
2. **Enviraj — radical simplicity.** Three inputs (length, height, thickness) and a four-column result table (bricks / mortar / cement / sand). Take: a "quick mode" — the simplest possible path for a user who wants one number in 10 seconds. (Caveat: most of this page is unverified; the take is the *shape*, not a confirmed feature set.)
3. **Glen-Gery — per-size pcs/ft² with a photo for every size.** 18 sizes, each showing its exact coverage rate next to a product photo. Take: show the coverage rate (pcs/sq ft and pcs/m²) directly on each brick preset in the picker, so the user sees the consequence of the choice before calculating.
4. **Tameer — unit switching on both sides of the calculator.** Wall units (m/ft/yd) *and* brick-size units (mm/in) are switchable. Take: nothing new to build (ours already does this) — instead, take the *guide* structure: single vs double wall explained in three lines with per-sq-ft rates, which is tighter than our equivalent section.
5. **Marshmoor — bond-first layout.** Bond type is a first-class selector next to wall dimensions, not buried in advanced options. Take: move the bond selector up beside brick size (ours already has it, but its placement/prominence is worth matching) and offer a "custom size instead of a preset bond" escape hatch in one line. (Caveat: bond options and outputs unverified.)
6. **Vision — headline rate chips + full materials cost in PKR.** "13.5 bricks per CFT / 0.042 bags per CFT / 0.23 sand CFT per CFT" as a persistent header, plus brick + cement + sand prices feeding one materials total. Take: a persistent rate strip above the results (bricks/CFT, bags/CFT, sand/CFT for the current thickness/mix) — ours has the numbers but never surfaces them as a strip.
7. **Muzdoor — mixed-unit inputs (feet + inches for length, cm for brick size).** Accepting ft/in and cm side by side matches how Pakistani users actually measure. Take: a ft+in composite entry for wall length/height (ours forces one unit at a time). (Caveat: most of this page is unverified; outputs and behaviour not seen.)
8. **Avenir — result-first page with plot-size table and section drawing.** "950 bricks — for a 10 ft × 10 ft wall…" as the headline, a wall section through the wall, and a bricks-by-plot-size table from a dated cost model. Take: the section-through-the-wall view (ours has elevation only) and the dated-model labelling ("Q4 2026 cost model") for the house-size table.

---

## 3. Gaps in our current calculator

Ordered by likely user/SEO value. "Gap" means missing or weaker than the best competitor; it does not mean our calculator is wrong — on engine depth, content depth, FAQ count and schema it already leads the set.

1. **No packs / pallets / trucks to order.** Nobody in the set shows this either (all 8: unverified or absent), so it is a gap vs *user need*, not vs a competitor — but it is the most obvious ordering feature missing everywhere. A buyer orders packs, not loose bricks. Add: packs of 400/500 (region-dependent, user-editable pack size) + pallets/trucks where the count justifies it.
2. **No labour cost.** No competitor prices labour either (Vision totals materials only; Glen-Gery prices bricks only). Same logic as #1: it is the missing half of a "total cost" answer. Add: optional labour rate (per sq ft / per 1,000 bricks / per day) with a clear "materials only" default so the existing total is not misread.
3. **No reverse / budget modes.** Glen-Gery alone has both: bricks → area covered, and budget → price per sq ft / per 1,000. Ours is one-directional (wall → bricks). Add both as secondary modes.
4. **No gable / curved-wall input.** Only Tameer handles curves (text guidance, +10–15% wastage) and nobody handles gables in this set. Ours covers curves in an FAQ only. Add: gable-end triangle input (base × rise) and a curved-wall mode (average radius / centre-line length) with the higher wastage preset applied.
5. **No persistent rate strip.** Vision's headline chips (bricks/CFT, bags/CFT, sand/CFT) are glanceable; ours buries the same figures in the breakdown. Add: a strip above results showing bricks/CFT, cement bags/CFT and sand CFT/CFT for the current thickness + mix (engine-computed, never hand-typed).
6. **Preset picker hides the consequence.** Glen-Gery shows pcs/ft² on every size; ours shows per-sq-ft only after calculating. Add: pcs/sq ft + pcs/m² on each preset row.
7. **No UK preset / GBP, no USD.** UK coverage is Marshmoor-only in this set and US coverage is Omni/Glen-Gery-only; ours has a US preset but no USD, and the 215 mm size is labelled UAE, not UK. Add: UK clay preset (215×102.5×65, BS EN 771-1) + GBP, and USD currency — or explicitly scope the page to PK/IN/UAE and say so.
8. **Mortar section is always fully expanded.** Omni's opt-in mortar gate is better onboarding for first-time users. Add: mortar/cost sections collapsed by default on small screens, expanding on demand (results unchanged).
9. **No course count output.** The visualiser draws courses but never reports the number; no competitor reports it either, but it is a one-line engine output (wall height ÷ course height) that masons ask for. Add to the breakdown.
10. **No bricks-per-1,000 quantity output / per-CFT in results.** The engine helper (`bricksPerArea().perCft`) exists but is not surfaced; Omni's FAQ gives cement/sand per 1,000 bricks. Add: bricks per CFT + cement/sand per 1,000 bricks lines to the breakdown.
11. **No "quick mode".** Enviraj's three-input shape is the fastest path in the set. Add: a quick mode (length × height × thickness → bricks only) above the full calculator, or a one-tap "just bricks" toggle that hides mortar/cost.
12. **No section-through-the-wall view.** Avenir has it; ours has elevation only. Add: a small section diagram (wall thickness with brick leaves / bond) beside the elevation.
13. **No ft+in composite entry.** Muzdoor accepts ft/in side by side. Add: optional ft+in entry for length/height (parse `10'6"` style input).
14. **No rating/review display.** Tameer (4.8/5, 1,250) and Vision (4.9/5, 156) show one; ours shows none. Add only if a genuine rating exists — do not invent one. (Reviewer credit exists in site config; verify before using.)
15. **No product photos / where-to-buy.** Glen-Gery (photos + distributor finder) and Marshmoor (merchant contact) monetise the intent; ours has no supplier path. Lower priority; needs a real supplier relationship, not a UI change.
16. **House-size table is less specific than Avenir's.** Ours splits external/internal/boundary/total (better); Avenir labels its model "Q4 2026 cost model" (better provenance). Add the model/date label to our table, not new numbers.

### What we already lead on (do not regress)

- Engine: volume method with frog allowance (×1.15) and dry factor (×1.33); multi-wall projects; per-wall openings; area mode; 6 length units with true value conversion; custom mix; editable bag size.
- Content: 10 sections, 5 engine-computed tables, worked example with door variant, 14 FAQs (most in the set — next best is 5).
- Schema: WebApplication + HowTo + FAQPage + BreadcrumbList + Organization, hreflang, 16 programmatic variants (8 city / 4 type / 4 house-size).
- Exports: PDF, print, copy, share, CSV/Excel, save + history, reset — no competitor in the set shows any of these.
- Visuals: to-scale course-by-course elevation with bond-correct stretcher/header faces and openings cut out — the strongest drawing in the set (Avenir's static bond/section drawing is second).

---

## 4. "Best-of-all-8" specification — strict superset the rebuild must implement

Everything ours already does, plus the best of each competitor. Items marked **[NEW]** are not in our current calculator; **[KEEP]** must not regress.

### Calculator inputs
- **[KEEP]** Three modes: single wall, multi-wall project (named walls, per-wall size/thickness/openings, per-wall breakdown), total wall area (sq ft / m²).
- **[KEEP]** Length units ft / in / m / cm / mm / yd with true value conversion on switch; area units sq ft / m²; brick-size units mm / in.
- **[NEW]** ft+in composite entry for wall length/height (Muzdoor-style; parse `10'6"`).
- **[NEW]** Quick mode: length × height × thickness → bricks only, three inputs, above the full calculator (Enviraj shape).
- **[KEEP]** Thickness presets 115 / 230 / 345 / 457 mm + custom.
- **[NEW]** Reverse mode: bricks → wall area covered (Glen-Gery).
- **[NEW]** Budget mode: wall area + budget → price per sq ft and per 1,000 (Glen-Gery).
- **[NEW]** Gable-end input (base × rise triangle) and curved-wall mode (centre-line length from average radius) with 10–15% wastage preset (Tameer guidance, as an input not just an FAQ).
- **[KEEP]** Brick presets: PK Awwal, PK 2¾″, IN modular, IN non-modular, US standard, UAE clay, AAC block, hollow block, custom.
- **[NEW]** UK clay preset (215×102.5×65, BS EN 771-1) + GBP currency; USD currency (Marshmoor / Omni / Glen-Gery coverage).
- **[NEW]** Coverage rate on every preset row: pcs/sq ft + pcs/m² (Glen-Gery).
- **[KEEP]** Bond selector (stretcher / English / Flemish) with per-bond note; count unchanged by bond (stated).
- **[KEEP]** Openings: per-opening list (door/window/other + count) or total-area mode, per wall; openings-larger-than-wall validation.
- **[KEEP]** Mortar joint editable (default 10 mm); wastage pills 0/5/10/15 + custom, applied to bricks and mortar, shown split before/after.
- **[KEEP]** Mix presets 1:3 / 1:4 / 1:5 / 1:6 + custom parts; cement bag size editable (50 kg default).
- **[NEW]** Mortar section collapsed by default on small screens, expandable on demand (Omni's opt-in gate); results unchanged.

### Outputs
- **[KEEP]** Bricks before wastage / wastage bricks / bricks to order; bricks per sq ft + per m²; gross / openings / net area (m² + sq ft); wall volume (m³ + cft); wet + dry mortar (m³ + cft); cement bags + kg; sand (cft + m³).
- **[NEW]** Rate strip above results: bricks/CFT, cement bags/CFT, sand CFT/CFT for current thickness + mix (Vision-style, engine-computed).
- **[NEW]** Bricks per CFT in results (surface the existing `bricksPerArea().perCft` helper); cement + sand per 1,000 bricks (Omni FAQ figure, engine-computed).
- **[NEW]** Course count in the breakdown (wall height ÷ course height).
- **[NEW]** Packs to order (editable pack size, default 500; 400 for UK facing) + pallets/trucks where the count justifies it.
- **[KEEP]** Cost: brick / cement / sand rates editable per currency (PKR / INR / AED + new GBP / USD); materials total.
- **[NEW]** Optional labour cost (rate per sq ft / per 1,000 / per day), off by default; total shown as materials-only unless labour is entered.
- **[KEEP]** Full step-by-step breakdown; formula section with all 9 lines (volume method, ×1.15 frog, ×1.33 dry, 0.0347 m³/bag).

### Visuals
- **[KEEP]** To-scale course-by-course elevation with bond-correct faces and openings cut out; per-wall preview in multi mode; schematic square in area mode.
- **[NEW]** Section through the wall (thickness, leaves, bond) beside the elevation (Avenir).
- **[NEW]** Brick preset thumbnails or schematic face drawings (Glen-Gery photos, without copying their images — own drawings).
- **[KEEP]** No supplier / where-to-buy UI until a real supplier relationship exists (do not fake one).

### Content
- **[KEEP]** 10 sections: how it works, formula, worked example (10×10 + door variant), brick sizes, mortar mix + thickness, brick types compared, city rates, house sizes, glossary, FAQ.
- **[KEEP]** 5 engine-computed tables (brick sizes, bricks/area by thickness incl. thumb rule, mix guide, city rates, house sizes with external/internal/boundary/total).
- **[NEW]** Dated-model label on the house-size table (Avenir-style "Q4 2026 cost model" provenance) and on city rates.
- **[NEW]** Single-vs-double wall explainer in three lines with per-sq-ft rates (Tameer shape).
- **[KEEP]** 14 FAQs; add FAQs for the new modes (packs, labour, reverse/budget, gable/curved, UK/US) only when the features ship — do not add FAQ text for unbuilt features.
- **[NEW]** Rating display only if a genuine rating exists (Tameer/Vision pattern) — never invent one.
- **[KEEP]** Last-updated date; WebApplication + HowTo + FAQPage + BreadcrumbList + Organization JSON-LD; hreflang en-PK / en-IN / en-AE / x-default (+ en-GB / en-US when UK/US ship); 16 programmatic variants.

### Exports, save, mobile
- **[KEEP]** PDF, print, copy, share, CSV/Excel, save + calculation history, reset.
- **[KEEP]** Phone-width layout verified live at 360/390 px before any claim of "done" (project rule); result headline ("bricks to order") visible without scrolling past content.

### Explicitly out of scope for the rebuild
- Copying any competitor's text, tables, images or prices.
- Changing vite base `"./"` (correct as-is), the Mona Sans / #F2A413 / #1F1D1A design system, or the engine constants (N = V_wall/V_brick_with_mortar, dry ×1.33, bag 0.0347 m³).
- Replacing the exact volume method with any competitor's rounded thumb rule (9.0/sq ft, 13.5/CFT) — show thumb rules alongside, never instead.
- Invented rates, reviews, pack sizes or supplier links.

---

## 5. What could not be verified

- **Enviraj:** everything except the three field labels and the four-column result headings (bricks / mortar / cement / sand). Thickness dropdown values, brick-size options, joint/wastage/mix/cost fields, openings, FAQ, content, schema, mobile behaviour — all unverified. Needs a live-browser check (JS calculator).
- **Marshmoor:** everything except wall height/length (m), the bond-type selector's existence, the custom-size option, the 215×65 + 10 mm default, and round-up behaviour. Bond option list, outputs (count? packs? mortar? cost?), FAQ, content, schema — all unverified. Needs a live-browser check.
- **Muzdoor:** everything except form labels (unit, length ft/in, height in, thickness, ratio, brick L/W/H cm). Outputs, results, cost, FAQ, content, schema, mobile behaviour — all unverified. Needs a live-browser check.
- **Schema/JSON-LD for all 8 competitors:** not visible in text fetches. Tameer/Vision ratings and Avenir business details *suggest* structured data but do not confirm it; all schema cells are marked "?" accordingly. Needs a view-source / rich-results check in a live browser.
- **Page speed / mobile UX for all 8 competitors:** not observable from a text fetch. No load-time, layout-shift or phone-width claim is made in this document.
- **Glen-Gery calculator interactivity:** the three calculation modes and the openings instruction are visible, but the actual input fields, wastage field (if any), and result rendering are JS-driven and were not observed. The "no wastage field" and "no mortar" cells rest on the fetched text, not on a live interaction.
- **Avenir "More options" (custom brick size):** asserted only by its own FAQ text in the fetch; the control itself was not observed.
- **Our rating:** no rating is shown on our page; whether a genuine rating/review exists in site config was not confirmed in this leg — verify before adding one.
