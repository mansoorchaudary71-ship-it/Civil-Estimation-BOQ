# Competitor Benchmark & Brick Calculator Upgrade — Phase A Research

**Date:** 2026-11-20 · **Author:** research agent (Phase A, read-only)
**Scope:** 8 competitor brick-calculator pages (fetched fresh via `browser.open` on 2026-11-20, all 8 returned page text) vs the repo's current implementation in `~/workspace/cep-fix/audit-work/`.
**Background read first:** `~/workspace/cep-competitor-audit-brick-calculator.md` (2026-11-10, 5 sites). Every competitor claim below was re-verified fresh; where the Nov 10 audit and today's fetch disagree, today's fetch wins and the difference is noted.
**House rules used to check formulas** (`AGENTS.md` in this working copy): steel `W = d²/162.28`; concrete dry `×1.54`; mortar dry `×1.33`; brick `N = V_wall / V_brick_with_mortar` (joint added to all three brick dims); cement bag `0.0347 m³` per 50 kg bag, round up.

## Method & evidence limits — read this first

- All 8 URLs fetched successfully on 2026-11-20. Fetched text is the evidence; anything not visible in it is marked **not observed**, never invented.
- **JS-rendered calculator forms are a real limit.** OmniCalculator, Glen-Gery and (partly) Marshmoor render their calculator widgets in JS; the text extraction captures the surrounding copy, headings, FAQs and (for Glen-Gery) the preset list, but **not the live form fields, defaults, or result values**. Where the task brief asserted a feature (e.g. Glen-Gery "bond pattern options, waste factor presets"), I checked it against the fetched text and say so explicitly when it is **not evidenced**.
- **Meta descriptions, canonicals, hreflang, OG/Twitter, JSON-LD types, Core Web Vitals and true mobile layout are not observable from a text fetch for any site.** Do not treat "not observed" as "absent" for those items; the matrix scores only what the fetched DOM/text shows.
- **Ratings are displayed text, not verified schema.** Tameer shows "4.8/5 (1250 reviews)", VisionBuild "4.9/5 (156 ratings)". Whether AggregateRating JSON-LD exists behind them is unverified.
- Cross-checks done by hand against house rules: CEP's own worked example (10 ft × 10 ft, 9″ wall, 1:4, 5% wastage → 873 bricks before wastage, 917 to order, 5 cement bags, 21.8 cft sand) is consistent with `N = V_wall / V_brick_with_mortar` (wall 2.14 m³ ÷ 0.00245 m³ per brick-with-joint ≈ 873). Avenir's live default for the *same* wall is 903 before wastage / 950 to order — see §4 "Do NOT copy" (Avenir's figure comes from its rounded 9.0 bricks/sq ft thumb rule, ~3.4% above the exact geometry).

---

## 1. Per-competitor findings (fresh, 2026-11-20)

### 1.1 OmniCalculator — https://www.omnicalculator.com/construction/brick

- **Title (observed):** "Brick Calculator" (page heading; full title tag not captured). Published 2015-12-08, **updated 2026-08-07** — the freshest-dated calculator copy in the set.
- **Inputs (from the how-to copy; live form fields not captured in text extraction):** wall type — single stack vs double stack (double = cavity sandwich with insulation); wall length **and height, or total area** (an area-entry mode); expandable **"Brick details"** section — brick dimensions + mortar joint thickness; **wastage %**; **price per brick**.
- **Mortar feature (progressive disclosure — the standout):** answering "Yes" to *"Want to see the materials for your mortar?"* expands a brick-mortar calculator: shows mortar volume, wastage on mortar, **mortar mix ratio selector**, cement and sand quantities, and a **cement bag size input** (user enters the bag size available on the market) to get bag count. This is the best progressive-disclosure pattern in the set: the basic brick count stays simple; mortar/cost only appears on request.
- **Formula shown — explicit, and it is the FACE-AREA method, not the volume method:**
  `bricks needed = (L × H) / ((l + t) × (h + t))` where L/H = wall length/height, l/h = brick length/height, t = joint thickness. Step-by-step instructions repeat it (add joint to brick length and height, multiply, divide wall area by that product). **House-rule check:** this is algebraically equivalent to the repo's volume method *for a single-leaf wall* (the thickness cancels when you count face bricks × skins), but it is **not** the repo's stated `N = V_wall / V_brick_with_mortar`. For multi-leaf / thick walls OmniCalculator handles it via the single/double-stack selector (double = 2× the face count). Both are correct; the volume method is more general and should stay the repo's canonical formula. OmniCalculator shows no dry-volume factor in the fetched text (no 1.33 or 1.54 visible).
- **Defaults:** not observable in the fetched text (JS form). No default wall size is stated in the copy.
- **Unit handling:** OmniCalculator as a platform offers per-field unit switching on every field (the brief's claim); **not directly evidenced in this fetch** — the extracted text shows no unit labels. Mark as *plausible, not verified from this fetch*.
- **Cost:** price per brick → cost of bricks only (no cement/sand cost in the fetched text).
- **Export/share/print:** none observed.
- **SEO content:** ~1,300 words of guide copy (how it works, how to use, mortar feature, other considerations) + **5 FAQs** (bricks per sq ft — "≈5 per sq ft with standard 7.5″ × 3.5″ bricks"; how to calculate; how to build a wall; bricks for a wall — "≈38 bricks per foot length for an 8-foot wall"; cement for 1,000 bricks — "≈120 kg cement + ≈0.4 m³ sand for a 1:5 mix"). One diagram image (brick wall under construction with dimensions). Internal links to the mortar calculator, tile/grout calculators, concrete calculator. No worked numeric example with a full wall; no tables; no plot-size content; no PK/IN/AE localisation (US/UK brick sizes: 7.5″ × 3.5″, 9.5″ × 2.75″).
- **Interactive features:** expandable sections ("Brick details", mortar toggle). No visualizer, no bond selector, no openings input observed.
- **Mobile:** not measurable from text fetch. OmniCalculator pages are generally responsive; not evidenced here.

### 1.2 Enviraj — https://enviraj.com/online-tools/brick-calculator.html

- **Fetched text is only 18 lines** (page crawled 2026-11-13). The calculator is a minimal JS widget; almost no supporting copy was captured.
- **Inputs observed:** Wall Length (ft), Wall Height (ft), **Wall Thickness** (a select — options not captured). No brick-size input, no joint input, no wastage input, no openings, no ratio input visible in the fetch.
- **Outputs observed:** a results table — **Bricks (Nos) | Mortar (ft³) | Cement (Kg) | Sand (ft³)** — all showing 0 at rest. Notably: cement is given in **kg** (not bags) and mortar/sand in **ft³**; the brief's "CFT/m³ conversions" claim is **not evidenced** in the fetched text (no m³ anywhere in the extraction).
- **Formulas:** none shown on the page. No wet/dry mortar math visible; no formula block, no FAQ, no guide, no worked example, no tables, no cost, no export. A backup web search for Enviraj-specific formula detail returned only other sites' calculators — **no usable Enviraj evidence**, so nothing further is claimed.
- **Verdict:** the thinnest page in the set along with Muzdoor. Its only distinguishing features are (a) a thickness select and (b) cement in kg. Everything else the brief attributes to it (wet/dry math, CFT/m³ conversions) is **unverified — fetch returned too little text**.

### 1.3 Glen-Gery — https://www.glengery.com/brick-calculator

- **Title (observed):** "Brick Calculator: Bricks Needed & Cost Per Sq Ft | Glen-Gery". H1 same.
- **Three calculation modes (stated in copy):** (1) amount of face brick needed based on wall area; (2) the wall area a given quantity of brick will cover (reverse mode); (3) price per sq ft and price per thousand based on wall area and budget. **The reverse and price-per-sq-ft modes are unique in this set** — no other competitor offers them.
- **Inputs — Step 1, brick size presets (18 visual presets, each with a photo and a pcs/ft² rate):** Modular (default) 2-1/4″ × 7-5/8″, 6.86 pcs/ft²; Standard 2-1/4″ × 8″, 6.55; Engineer Modular 2-3/4″ × 7-5/8″, 5.76; Queen 2-3/4″ × 7-5/8″, 5.76; Engineer Standard 2-3/4″ × 8″, 5.50; Handmade Oversize 2-3/4″ × 8-1/2″, 5.19; Builder Special 2-13/16″ × 8-5/8″, 5.02; King 2-5/8″ × 9-5/8″, 4.80; Norman 2-1/4″ × 11-5/8″, 4.57; Econo/Closure 3-5/8″ × 7-5/8″, 4.50; Modular Paver 3-5/8″ × 7-5/8″ (with 3/8″ joint), 4.50; 4x8 Paver 4″ × 8″ (without joint), 4.50; Summit 1-5/8″ × 17-5/8″, 4.00; Corso 1-9/16″ × 19-11/16″, 3.68; Saxon 2-1/4″ × 15-5/8″, 3.43; Utility 3-5/8″ × 11-5/8″, 3.00; Roman Maximus 1-5/8″ × 23-5/8″, 3.00; Titan 3-5/8″ × 15-5/8″, 2.25. This is the **richest preset library in the set** and the only one with a per-size pcs/ft² rate printed on the preset itself. Thickness "may vary — view more details here" (link to product pages).
- **Step 2 (form fields) not captured in text extraction** (JS widget): the copy instructs "multiply length × height (feet)" and "be sure to subtract the area of any openings (e.g. doors or windows)" — so openings are handled **manually by the user**, not as a calculator input.
- **Bond pattern options / waste factor presets: NOT evidenced.** The fetched text contains no bond selector and no wastage control; the only wastage mention is the disclaimer "add a wastage allowance" and "check the quantity with your mason". The brief's claim on these two points is **not supported by the fetch** — do not spec them as Glen-Gery features.
- **Formula:** none shown as an equation; the method is the per-size pcs/ft² rate × wall area (face-area method with a precomputed rate).
- **Cost:** price per sq ft and per thousand from wall area + budget (mode 3). No cement/sand/mortar output at all.
- **Export/share/print:** none observed. CTAs are commercial: "Find the Perfect Color" (product browser), a virtual design tool ("try on" brick on a home photo), "Where to Buy" (distributor finder). The virtual try-on tool is a distinctive brand feature, not a calculator feature.
- **SEO content:** thin — ~150 words of calculator copy, no FAQ, no guide sections, no worked example, no tables beyond the preset list. The preset list itself is the content.
- **Mobile:** not measurable from text fetch.

### 1.4 Tameer.ai — https://www.tameer.ai/brick-calculator

Re-verified fresh 2026-11-20; matches the Nov 10 audit with no material change.

- **Title (observed):** "Brick Calculator Pakistan - Calculate Bricks | Tameer.ai".
- **Inputs:** wall units toggle **m / ft / yd**; wall type **Single / Double**; wall length (L), wall height (H); brick-size units **mm / in**; brick length/height/width; **mortar joint thickness (t)**. **No openings input, no wastage % input, no number-of-walls input.**
- **Defaults:** not stated in the extraction (fields appear blank/validated with ✓ marks).
- **Outputs:** Bricks needed; brick wastage; total bricks needed; price per brick (PKR); cost of bricks (PKR). **No cement, no sand, no total project cost.**
- **Formula:** no explicit equation. Rates stated: ~57 bricks/m² (9″ wall), ~28 bricks/m² (4.5″ wall); ~4.5–5 bricks/sq ft (4.5″), ~9–10 bricks/sq ft (9″). **House-rule check:** 57/m² for a 9″ wall is consistent with the exact geometry (9″ wall ≈ 8.7/sq ft ≈ 94/m²? — no: 8.7/sq ft × 10.764 = ~94/m²). **Wait — 57 bricks/m² cannot be a 9″ wall by the volume method.** 57/m² ≈ 5.3/sq ft, which is the *face* count for a single leaf, not a 9″ (double-leaf) wall. Tameer appears to quote the single-leaf face rate while labelling it 9″, or to count one leaf of a 9″ wall. Either way the label is confusing and the number does **not** reconcile with CEP's exact 8.7/sq ft (93.6/m²) for a 9″ wall. Flagged in §4 (do NOT copy the 57/m² figure as a 9″ rate). The 4.5″ figure (28/m² ≈ 2.6/sq ft) is likewise well below CEP's exact 4.4/sq ft (47/m²) — Tameer seems to be quoting *per-leaf face* counts or a different brick size. Treat Tameer's per-m² rates as **unreliable**.
- **Wastage/cost guidance:** "add 5–10% wastage"; prices vary by region (Lahore vs Karachi) and quality (Awwal vs Doam). Mortar joint "typically 10 mm or 0.5″" — note 0.5″ (12.7 mm) ≠ 10 mm; the page conflates the two. Curved walls: +10–15%.
- **SEO content:** guide (~230 words: Awwal sizes, single vs double wall, wastage/cost) + **5 FAQs** (what a brick calculator is; bricks per sq m; standard PK size 9″×4.5″×3″ / 225×112.5×75 mm; wastage 5–10%; curved walls). **Rating displayed: 4.8/5 (1,250 reviews)** — schema type unverified. ~450 words total. No formula block, no worked example, no cost-per-1,000 table, no brick-type comparison.
- **Export/share/print:** none observed. Trust: marketplace brand claim ("Pakistan's 1st Zero Commission Construction Platform"), phone +92 322 0001263.
- **Unit handling:** best in the PK group (m/ft/yd + mm/in toggles).

### 1.5 Marshmoor Bricks — https://marshmoorbricks.com/resources/brick-calculator/

Re-verified fresh 2026-11-20; unchanged from Nov 10 audit.

- **Title/H1 (observed):** "Free Brick Calculator - Marshmoor Bricks".
- **Inputs:** Wall Height (m), Wall Length (m); **Brick Layout / Bond Type selector** ("Select Type" — the option list was **not captured** in the extraction, so which bonds are offered is unverified); link to a separate custom-brick-size calculator.
- **Defaults:** UK house brick **215 mm long × 65 mm high, 10 mm mortar joint**, pre-entered. Always rounds up to the nearest brick.
- **Outputs:** brick count only. No cement, no sand, no cost, no wastage input, no openings.
- **Multi-wall / project summing / instant quote / summary export: NOT evidenced.** The fetched text shows a single wall-height/length form and no summing, quote or export feature. The brief's claims on those points are **not supported by the fetch**.
- **Formula:** none shown. **Contractor-friendly UX claim: not evidenced** beyond the short intro ("speak to our experts before committing to a quantity") and phone/email contact.
- **SEO content:** thinnest in the set — ~90–120 words, no FAQ, no guide, no worked example. Catalogue product pages (not this page) carry full per-brick specs.
- **Export/share/print:** none observed.

### 1.6 VisionBuild Construction — https://visionbuildconstruction.com.pk/bricks-calculator.php

Re-verified fresh 2026-11-20; matches Nov 10 audit, with one correction (see below).

- **Title/H1 (observed):** "Free Bricks Calculator Pakistan | Brick Mortar Cement Sand Cost PKR | Vision Build Construction".
- **Inputs:** Unit System toggle; **Number of Walls** (multi-wall multiplier — the only competitor with a wall-count input); Wall Length, Wall Height, **Wall Thickness (inches)**; **Openings Area (sq ft)**; Brick Length/Width/Height (inch); Brick Price (PKR/brick); Cement Bag Price (PKR); Sand Price (PKR/CFT); **Cement:Sand mortar ratio as two parts inputs**.
- **Reference rates displayed on page:** 13.5 bricks/CFT (9″ wall); 0.042 cement bags/CFT (1:4); 0.23 sand CFT/CFT. **House-rule check:** 13.5 bricks/CFT — CEP's exact figure is ~11.6 bricks/CFT for a 9″ wall (873 bricks ÷ 75.5 CFT). 13.5 is the commonly quoted thumb rule; it over-counts by ~16% against exact geometry. It is a *safe* over-order rule, not an exact figure — do not present it as exact. The 0.042 bags/CFT at 1:4 is consistent with CEP's FAQ rule of thumb (~0.06 bags/CFT at 1:4 including 5% wastage? — no: CEP's FAQ says ~0.06 bags/CFT at 1:4; VisionBuild says 0.042. These differ because CEP's 0.06 includes the 1.15 frog allowance and wastage on mortar, VisionBuild's 0.042 apparently does not. Both are thumb rules; the calculator's exact computation is what matters. Flagged in §4.)
- **Outputs:** Wall Volume (CFT), Net Wall Area (sq ft), Bricks Required, Cement Bags (50 kg), Sand Volume (CFT), Mortar Ratio, and a **cost breakdown: bricks / cement / sand / material-only / total estimated cost (materials)** in PKR. The most complete cost output among the PK competitors.
- **Formula:** no full equation shown; rates only.
- **SEO content:** "How to Use" (4 bullets) + **4 FAQs** (bricks per sq ft — repeats the 13.5/CFT and 6.75/sq ft figures; standard size 9×4.5×3″ plus 9×4.5×2.75″ variant; cement per CFT 0.042 bags at 1:4, 0.056 at 1:3; mortar ratio 1:4 general / 1:3 load-bearing / 1:6 foundation). **Rating displayed: 4.9/5 (156 ratings)** — schema unverified. ~400 words. No worked example, no formula block, no cost-per-1,000 table.
- **Correction vs Nov 10 audit:** the Nov 10 audit said "no wastage input (guidance only)"; today's fetch confirms guidance only ("Add 5–10% extra") — no wastage field observed. Confirmed.
- **Export/share/print:** none observed. Business identity: Bhara Kahu, Islamabad; +92 302 3873103; visionbuildc@gmail.com.

### 1.7 Muzdoor — https://www.muzdoor.com/calculators/brick-calculator

Re-verified fresh 2026-11-20; unchanged from Nov 10 audit.

- **Title/H1 (observed):** "Brick Calculator - Muzdoor.com".
- **Inputs (labels only):** Unit; Length (feet, inch); Height/Depth (inch); Wall Thickness; Ratio; Size of Brick — Length/Width/Height (cm). Mixed units (ft/in for wall, cm for brick). No defaults stated; no openings, no wastage, no cost inputs observed.
- **Outputs:** **not observed** — no result values captured in the extraction (results area empty or not rendered in text).
- **Formula:** none shown. **Metric/imperial volume in m³ & ft³, cement in kg/bags, sand in CFT/tons: NOT evidenced** — none of those outputs appear in the fetched text. The brief's claims for Muzdoor are **not supported by the fetch**.
- **SEO content:** <100 words of visible copy (excluding footer); no FAQ, no guide, no worked example. Strongest formal business identity in the PK group (Register of Firms 2014-15/0790, NTN 7160801-5, SRB SNTN S7160801-5; Anum Estate, Suite #611, Shahrah-e-Faisal, Karachi 75400; +92 330-689-3667; support@muzdoor.com; LinkedIn/Facebook/YouTube). Sitemap lastmod 2026-08-17 (stale).
- **Export/share/print:** none observed.

### 1.8 Avenir Developments — https://avenirdevelopments.com/calculators/brick-quantity-calculator/

Re-verified fresh 2026-11-20; matches Nov 10 audit, with two corrections (see below).

- **Title/H1 (observed):** "Brick Quantity Calculator: Exact Bricks for Any Wall or House Size".
- **Inputs (observed):** wall length/height (ft), wall thickness (in, 9″ default), **bond type selector** (English bond shown as the selected value), doors/windows area, brick size (default 9×4.5×3″), joint (10 mm), wastage % (default 5%), mortar mix (default **1:6**), plus "More options" for custom size. **Correction 1 vs the brief:** the fetched text evidences **English bond only** as the selected bond; a Stretcher/Flemish selector is **not observed** in the extraction (the Nov 10 audit likewise recorded only English bond + the diagram). Do not claim Avenir offers a three-bond selector on this evidence.
- **Live SVG wall visualizer — evidenced:** the fetched text contains the diagram's labels — "Section through the wall", "Wall elevation", "Stretcher face", "Header face", "Bricks across 2 (9 in wall)", "To scale", "Doors and windows", dimensions "10 ft × 10 ft" — i.e. a to-scale wall elevation + section drawing that updates with the inputs, with stretcher/header faces labelled. This is the **only visualizer in the set** and the strongest interactive feature among all 8.
- **Default live example (instant results on load):** 10 ft × 10 ft wall, 9″ thick, English bond, 5% wastage → **950 bricks to order (903 before wastage), 9.0 bricks/sq ft, 3 bags cement, 17 cft sand, 14.8 cft wet mortar**, gross 100 sq ft, openings 0, net 100 sq ft, mix 1:6. **Correction 2 — arithmetic check vs house rules:** 903 before wastage implies 9.03 bricks/sq ft, but exact geometry (CEP engine) gives 873 (8.7/sq ft). Avenir's 903 comes from its rounded 9.0/sq ft thumb rule, and its wet mortar 14.8 cft is well below CEP's ~19.5 cft for the same wall at 1:4 (different mix 1:6 explains part, not all — Avenir's mortar appears to be computed from a per-sq-ft allowance rather than wall-volume-minus-brick-volume). Avenir itself disclaims: "Planning estimate, not a quotation. Bond pattern does not change the count." Its numbers are internally consistent with its own thumb rules but **not exact** by the house method. See §4.
- **Plot-size presets — evidenced:** "Bricks by plot size, Avenir cost model Q4 2026" table: 5 Marla (1,950 sq ft covered) 37,000–43,000; 8 Marla (2,800 sq ft) 53,000–61,500; 10 Marla (3,200 sq ft) 61,000–70,500; 1 Kanal (5,900 sq ft) 112,000–130,000; 2 Kanal (10,750 sq ft) 204,500–236,500. Dated quarterly cost model — the strongest freshness signal in the set.
- **Cost:** no price input and no cost output on the calculator (only brick-count ranges by plot size).
- **SEO content:** **5 FAQs** (standard size 9×4.5×3″ / 229×114×76 mm, kiln variation; bricks for a 5 Marla house 37,000–43,000, 10 Marla 61,000–70,500, 1 Kanal 112,000–130,000; bricks per sq ft — 9 for 9″, 4.5 for 4.5″, 13.6 for 13.5″; accuracy; mortar estimate — 10×10 ft wall at 1:6 → ~3 bags cement, 17 cft sand). ~450–500 words. Business block (Lahore + Islamabad offices, UAN +92 300 110 1807, hours, price range PKR $$$). No formula block, no worked-example section beyond the live default.
- **Export/share/print:** none observed.
- **Technical tables: partially evidenced** — the plot-size table is a real table; a separate "technical tables" set (e.g. bricks per sq ft by thickness) exists only inside FAQ answers, not as tables.

---

## 2. Current CEP implementation — audit (read-only)

Files read: `src/lib/brickCalc.ts`, `src/components/calculators/BrickCalculator.tsx`, `src/components/calculators/BrickCalculatorContent.tsx`, `src/components/pages/BrickCalculatorPage.tsx`, `src/seo/brickProgrammatic.ts`. (Also confirmed: route registered in `src/lib/toolRoutes.ts` and `src/App.tsx`; 17 brick URLs in `public/sitemap.xml`; `REVIEWER` byline in `src/seo/siteConfig.ts`.)

### Engine — `src/lib/brickCalc.ts`
- **Method (house rules, verified by reading the code):** metric internally; `N = V_wall / V_brick_with_mortar` (joint added to all three brick dims); wet mortar = wall volume − brick volume, **× 1.15 frog allowance**; dry mortar = wet **× 1.33**; cement bags = cement volume ÷ **0.0347 m³**, rounded up; sand in m³ + cft (×35.3147). Wastage % applied to bricks (ceiled) and to dry mortar. `calcBrickworkFromArea()` variant for the finishes workspace. **Note:** the 1.15 frog factor is a repo choice, not in `AGENTS.md`; it is disclosed on-page ("× 1.15 for frog filling") — keep it, but keep disclosing it.
- **Verified default example:** `defaultBrickInputs()` = 10 ft × 10 ft, 230 mm, 5% wastage, 1:4, PK Awwal — the FAQ states 873 before wastage / 917 to order, 5 bags, 21.8 cft sand. Matches the 75-tool audit's "correct math" verdict.
- **Brick presets (8):** Pakistani Awwal 230×110×75; Pakistani 2¾″ 230×114×70; Indian modular 190×90×90 (IS 1077); Indian non-modular 230×110×70; UAE clay 215×102.5×65 (BS EN 771-1); AAC block 600×200×150; hollow concrete block 400×200×200; custom (L/W/H in mm). Each with standard + note. **No US brick preset** (US 7.5″×3.5″×2.25″ is absent — a gap vs OmniCalculator/Glen-Gery).
- **Thickness presets (4):** 4½″/115 mm partition; 9″/230 mm external-load-bearing; 13½″/345 mm foundations; custom (mm input). **No 18″/457 mm preset.**
- **Currencies:** PKR / INR / AED with per-currency sand unit (cft for PKR/INR, m³ for AED) and editable rates. Default rates: PKR brick 20,000/1,000, cement 1,550/bag, sand 50/cft; INR 10,000 / 400 / 80; AED brick **null** (honestly blank — no verified UAE per-1,000 price), cement 25, sand null.
- **FAQs in engine (10, shared with JSON-LD):** 9″ wall count; PK standard size; formula; wastage; cement bags per CFT (0.06 bags/CFT at 1:4, 0.07 at 1:3 — note: this **differs from VisionBuild's 0.042**; CEP's includes frog + wastage, see §4); mortar mix guidance; 5 marla house (35,000–45,000); brick price per 1,000 in PK 2026 (PBS Aug 2026: Lahore 23,355, Islamabad 27,016, Karachi 22,000; Doam 12,000–17,000); openings deduction; accuracy disclaimer.

### Calculator component — `src/components/calculators/BrickCalculator.tsx`
- **Modes:** single wall only (L × H). **No multi-wall mode, no total-area mode, no wall-count multiplier** (VisionBuild has the count; OmniCalculator has the area mode; Glen-Gery has the reverse mode).
- **Units:** length unit toggle **m / ft only** — no yd, no cm/mm for wall dims, no in. Switching the toggle does **not** convert the entered numbers (it only relabels the unit; the numeric value stays). **No per-field unit switchers.**
- **Openings:** full per-opening editor — add door (default 3 × 7) / window (default 4 × 4), each with type (door/window/other), length, height, count, remove button. Deducted from gross area. **Stronger than every competitor** (only VisionBuild and Avenir deduct openings at all, and both use a single total-area field).
- **Brick & mortar:** preset select + custom size (L/W/H mm); joint mm input (default 10); **wastage as a free number input only (default 5, max 50) — no 0/5/10/15% pills**; mix presets 1:3 load-bearing / 1:4 general / 1:6 partitions / custom parts inputs. **No 1:5 preset.**
- **Cost estimator:** always visible (not collapsible); currency switcher PKR/INR/AED that **resets all three rates to that currency's defaults** (overwrites user-entered rates — a UX wart to fix in Phase B: preserve user rates per currency); brick per 1,000, cement per bag, sand per unit inputs; itemised bricks/cement/sand + total (materials only); "enter the missing rate" prompt when incomplete; labour/transport/taxes excluded note.
- **Results (sticky panel, instant on typing):** total bricks to order (primary card) with before-wastage count + bricks/sq ft; cement bags (50 kg) + dry mortar m³; sand cft + m³; net wall area m² with gross − openings; wall volume m³ with wet mortar m³; cost breakdown; **"How this was calculated" step list mirroring live inputs** (wall volume, brick-with-joint size, bricks formula, dry mortar ×1.33 ×1.15 frog, cement ÷0.0347). **No wall volume in ft³ shown** (only m³) — VisionBuild shows CFT; PK users think in CFT.
- **Export/share/print:** Copy result (plain-text BOQ summary), Share (Web Share API with clipboard fallback), Print (`window.print()`), **Download PDF via jsPDF** (text summary + rates note + disclaimer). **This is the only export capability in the entire 9-site set** — every competitor scores ✗ here.
- **Missing:** no visualizer of any kind; no bond-pattern selector; no Reset to Defaults button; no worked-example block inside the calculator (it lives in the content below); no multi-wall; no US brick preset; no 18″ thickness; no 1:5 mix; no yd/cm/mm wall units; no per-field unit switchers.

### Page & content — `BrickCalculatorPage.tsx`, `BrickCalculatorContent.tsx`, `brickProgrammatic.ts`
- **Title/meta (main):** "Brick Calculator Pakistan, India & UAE | Civil Estimation Pro"; description "Free brick calculator for Pakistan, India & UAE. Bricks, cement bags, sand & total cost in PKR, INR or AED — with openings, wastage & local rates." Keywords list (10). **Single h1** ("Brick Calculator" on main; variant h1s on programmatic pages). Intro paragraph. `lastUpdated` = "10 November 2026" shown on page.
- **JSON-LD (built in the page):** WebApplication (with featureList incl. PDF/print/share/copy), FAQPage (all 10 FAQs), BreadcrumbList, Organization. **No HowTo schema** (the how-it-works section is an ordered list, not marked up). Hreflang: en-PK → Lahore, en-IN → Delhi, en-AE → Dubai, x-default → main.
- **Content sections (main page):** How it works (4-step ordered list + nominal-size warning); Formula (9-line mono block: wall volume, net area, brick-with-mortar, bricks, wastage, wet mortar ×1.15 frog, dry ×1.33, cement ÷0.0347, sand); **Worked example** (10×10 ft wall, full numbers at 1:4 and 1:6, plus a door-deduction variant: 3×7 ft door → 79 sq ft → ~690 before wastage / 725 to order); Brick sizes & standards table (5 rows); Mortar mix & wall thickness (exact per-sq-ft figures 4.4 / 8.7 / 13.1 vs thumb rules 4.5 / 9 / 13.6); Brick types compared table (Awwal / Doam / machine-made / fly ash with indicative prices + wastage); City rates table (all 8 cities, linked to city pages); **House-size table** (5 Marla 39,300; 7 Marla 47,300; 10 Marla 58,300; 1 Kanal 82,300 — totals incl. 5% wastage, split external/internal/boundary, with a stated method: double-storey, 70% covered area/floor, 9″ external, 4½″ internal, 7 ft boundary wall, parapet included); Glossary (7 terms incl. English bond, frog, nominal size, Marla/Kanal); FAQ accordion (10 Q&As, first open); Sources & review block (reviewer byline from `siteConfig.ts`, sources IS 1077 / BS EN 771-1 / PBS Aug 2026 / Nov 2026 market guides, disclaimer that this is a planning estimate, not a certified BOQ).
- **Programmatic SEO (16 variant URLs + main = 17 in sitemap):** 8 cities (Lahore 23,355; Karachi 22,000; Islamabad 27,016; Rawalpindi 26,694 — PBS Aug 2026; Delhi; Mumbai; Dubai + Abu Dhabi with brick price honestly blank), 4 brick types (Awwal, Doam, machine-made, fly ash), 4 house sizes (5/7/10 Marla, 1 Kanal). Each variant has unique title/description/intro/local note or method, and prefills the calculator (currency, rates, brick preset). **No competitor in this set has any programmatic calculator surface at all.**
- **Related calculators:** 5 links (Construction Material Calculator, Master Finishes, Master Quantity, House Cost, Master RCC).

---

## 3. Comparison matrix

Legend: ✓ = present & evidenced · ◐ = partial / limited · ✗ = absent or not evidenced. "n/o" = not observable from text fetch (JS form / page source needed). Evidence notes are one line; detail is in §1–2.

| Capability | CEP (current) | OmniCalculator | Enviraj | Glen-Gery | Tameer | Marshmoor | VisionBuild | Muzdoor | Avenir |
|---|---|---|---|---|---|---|---|---|---|
| Inputs: L × H wall | ✓ | ✓ (or total area) | ✓ ft only | ✓ (area) | ✓ | ✓ m only | ✓ + wall count | ✓ | ✓ |
| Inputs: wall thickness | ✓ 4 presets + custom | ◐ single/double stack only | ✓ select (options n/o) | ✗ (face brick only) | ◐ Single/Double type | ✗ | ✓ inches input | ✓ input | ✓ in, 9″ default |
| Inputs: brick size presets | ✓ 8 (PK/IN/AE/AAC/block) | ◐ custom dims only | ✗ | ✓ 18 US sizes + pcs/ft² | ◐ custom dims only | ✓ UK 215×65 default | ◐ custom dims only | ◐ custom dims (cm) | ◐ PK default + custom |
| Inputs: joint thickness | ✓ mm, default 10 | ✓ expandable section | ✗ | ◐ 3/8″ implied in rates | ✓ mm/in | ✓ 10 mm default | ✗ (not observed) | ✗ | ✓ 10 mm |
| Inputs: openings deduction | ✓ per-opening W×H×count | ✗ (not observed) | ✗ | ◐ manual subtraction advised | ✗ | ✗ | ◐ single total area (sq ft) | ✗ | ◐ single total area |
| Inputs: wastage | ◐ number input, default 5, no pills | ✓ % input | ✗ | ✗ (advice only) | ◐ guidance 5–10%, no input | ✗ | ◐ guidance 5–10%, no input | ✗ | ✓ % input, default 5 |
| Inputs: mortar mix | ✓ 1:3/1:4/1:6 + custom | ✓ ratio selector (expandable) | ✗ | ✗ | ✗ | ✗ | ✓ parts inputs | ◐ "Ratio" input | ✓ 1:6 default |
| Inputs: unit switching | ◐ m/ft toggle, no conversion | ◐ per-field claimed, n/o | ✗ (ft only) | ✗ (ft only) | ✓ m/ft/yd + mm/in | ✗ (m only) | ◐ unit-system toggle | ◐ mixed ft/in + cm | ✗ (ft/in only) |
| Formula shown | ✓ full 9-line block + live steps | ✓ face-area equation | ✗ | ✗ (rate × area) | ✗ (rates only) | ✗ | ✗ (rates only) | ✗ | ✗ (rates only) |
| Brick count output | ✓ net + wastage + to-order | ✓ net + wastage | ✓ count only | ✓ count (face) | ✓ net + wastage + total | ✓ count only, rounds up | ✓ count | n/o (results not captured) | ✓ 903 → 950 to order |
| Cement output | ✓ bags (50 kg) + kg implied | ✓ via mortar section | ✓ kg only | ✗ | ✗ | ✗ | ✓ bags (50 kg) | n/o | ✓ bags (50 kg) |
| Sand output | ✓ cft + m³ | ✓ via mortar section | ✓ ft³ | ✗ | ✗ | ✗ | ✓ CFT | n/o | ✓ cft |
| Mortar volume (wet/dry) | ✓ wet + dry m³ | ✓ volume (factor n/o) | ◐ mortar ft³ only | ✗ | ✗ | ✗ | ✗ (not shown) | n/o | ◐ wet cft only |
| Cost estimator | ✓ itemised, 3 currencies | ◐ brick cost only | ✗ | ◐ price/ft² + per-1,000 (reverse mode) | ◐ brick cost only (PKR) | ✗ | ✓ itemised PKR total | ✗ | ✗ |
| Bond patterns | ✗ | ✗ | ✗ | ✗ (not evidenced) | ✗ | ◐ selector present, options n/o | ✗ | ✗ | ◐ English bond shown; other bonds n/o |
| Visualizer | ✗ | ◐ 1 static diagram image | ✗ | ◐ 18 preset photos | ✗ | ✗ | ✗ | ✗ | ✓ live to-scale SVG elevation + section |
| Multi-wall / project | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ (not evidenced) | ◐ wall-count multiplier | ✗ | ✗ |
| Reverse / area modes | ✗ | ◐ area-entry mode | ✗ | ✓ area-from-qty + price modes | ✗ | ✗ | ✗ | ✗ | ✗ |
| Export / print / PDF | ✓ Copy + Share + Print + jsPDF | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Worked example | ✓ 10×10 ft, 1:4 + 1:6 + door variant | ✗ (steps only) | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ◐ live default = example, no separate section |
| FAQ | ✓ 10 Q&As + FAQPage JSON-LD | ✓ 5 Q&As | ✗ | ✗ | ✓ 5 Q&As | ✗ | ✓ 4 Q&As | ✗ | ✓ 5 Q&As |
| Reference tables | ✓ sizes, types, city rates, house sizes | ✗ | ✗ | ◐ preset rate list | ✗ | ✗ | ✗ | ✗ | ✓ plot-size ranges (Q4 2026) |
| Plot / house-size presets | ✓ 4 house sizes (computed, method stated) | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ 5 plot sizes (ranges, cost model) |
| Programmatic variants | ✓ 16 URLs (cities/types/sizes) | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| JSON-LD | ✓ WebApplication + FAQPage + BreadcrumbList + Organization | n/o | n/o | n/o | n/o (rating displayed) | n/o | n/o (rating displayed) | n/o | n/o (FAQ + business data displayed) |
| Reviewer byline / sources | ✓ reviewer + sources listed | ◐ sources not shown in fetch | ✗ | ✗ | ✗ | ✗ | ✗ | ◐ business registration only | ◐ business identity, no author |
| Last-updated / freshness | ✓ "10 November 2026" on page | ✓ updated 2026-08-07 | ✗ | ✗ | ◐ sitemap lastmod only | ✗ (stale crawl) | ◐ sitemap lastmod 2026-10-19 | ✗ (sitemap Aug 2026) | ✓ "Q4 2026 cost model" |
| Mobile UX (from DOM) | n/o (responsive classes; not measured) | n/o | n/o | n/o | n/o | n/o | n/o | n/o | n/o (hub claims mobile works) |

**Honest scoreboard (counting only evidenced ✓/◐ on calculator + content features, not n/o items):** CEP leads outright on breadth (formula transparency, openings, export, programmatic SEO, tables, FAQ depth). Avenir is the closest single-page rival (visualizer + live default + plot table + FAQ). VisionBuild is the closest PK rival on outputs/cost. OmniCalculator leads on progressive disclosure and the explicit equation. Glen-Gery leads on presets and reverse/price modes. The other four are thin single-purpose widgets.

---

## 4. Gap analysis

### What each competitor does better than CEP today
- **OmniCalculator:** (1) progressive disclosure — mortar/cost hidden behind "Want to see the materials for your mortar?" and "Brick details", so the first screen stays simple; CEP shows all four sections + cost at once. (2) An explicit equation in the copy (`bricks = (L×H)/((l+t)×(h+t))`) — CEP has the formula block, but OmniCalculator's is shorter and appears before the how-to. (3) Area-entry mode (enter total area instead of L×H). (4) Customisable cement bag size (CEP hard-codes the 50 kg / 0.0347 m³ bag). (5) Fresher visible update date (2026-08-07 vs CEP 10 Nov 2026 — CEP is actually fresher; OmniCalculator's *displayed* date is the point: CEP already shows one, keep it).
- **Enviraj:** cement in **kg** as well as bags (CEP shows bags only; kg is useful for buying loose cement). Otherwise nothing — it is behind CEP on every other axis.
- **Glen-Gery:** (1) 18 visual brick-size presets with a photo and a printed pcs/ft² rate each — CEP's preset list is text-only. (2) Reverse mode (quantity → area covered) and price-per-sq-ft / per-thousand mode. (3) Commercial next steps (colour browser, virtual try-on, distributor finder) — out of scope for CEP's brand, but the *pattern* (preset = image + rate) is worth borrowing.
- **Tameer:** unit toggles m/ft/yd for walls and mm/in for bricks — wider than CEP's m/ft. (2) Curved-wall guidance (+10–15%) — a genuinely useful FAQ CEP lacks. (3) A displayed 4.8/5 (1,250 reviews) rating — CEP shows no rating; do not invent one (see §6).
- **Marshmoor:** a bond-type selector exists (options unverified) — CEP has none. Its "always rounds up" promise is already CEP behaviour (ceiled counts + ceiled bags).
- **VisionBuild:** (1) Number-of-Walls multiplier — the simplest multi-wall feature, cheaper to build than full multi-wall rows. (2) Wall volume and sand in **CFT** as primary units — CEP shows m³ first; PK users think in CFT. (3) Thumb-rule reference chips on the page (13.5 bricks/CFT, 0.042 bags/CFT, 0.23 sand CFT/CFT) — quick-scan anchors CEP's page lacks above the fold. (4) Displayed 4.9/5 (156 ratings).
- **Muzdoor:** nothing on the calculator itself; only its formal business identity (registration numbers) exceeds CEP's E-E-A-T presentation — and CEP already has a reviewer byline + sources, which Muzdoor lacks on-page.
- **Avenir:** (1) **Live to-scale SVG wall elevation + section** with stretcher/header faces, bond label, "bricks across 2 (9 in wall)", doors/windows marked — the single biggest feature gap. (2) Instant default result on load (CEP also pre-loads 10×10 ft, so this is a tie in effect — but Avenir *presents* the default as a worked example with a one-line plain-English summary, which reads better than CEP's result cards alone). (3) Plot-size table with a **dated quarterly cost model (Q4 2026)** — CEP's house-size table is computed with a stated method, which is more transparent, but Avenir's dated model signals freshness better. (4) Bond selector with a structural note ("Bond pattern does not change the count") — CEP has the English-bond glossary entry but no selector.

### What CEP already does better than each competitor
- **vs OmniCalculator:** full volume-method formula with wet/dry mortar (×1.33) and frog allowance; per-opening deduction (OmniCalculator has none observed); 3-currency cost with cement + sand (OmniCalculator: brick cost only, mortar section only); export (Copy/Share/Print/PDF — OmniCalculator has none); 10 FAQs vs 5; city rates, house-size and brick-type tables; 16 programmatic pages; PK/IN/AE localisation (OmniCalculator is US/UK sizes only).
- **vs Enviraj:** everything — CEP has presets, joint, wastage, mix, openings, cost, export, formula, FAQ, tables. Enviraj's only edge is cement in kg.
- **vs Glen-Gery:** cement/sand/mortar outputs (Glen-Gery: none); openings deduction; wastage + mix controls; formula; FAQ; worked example; export; PK/IN/AE sizes and currencies (Glen-Gery is US face-brick only, no mortar at all).
- **vs Tameer:** cement + sand + itemised total cost (Tameer: brick cost only); openings; custom brick sizes + AAC/block presets; mix ratios; export; formula block; worked example; 10 FAQs vs 5; city/house-size tables; programmatic pages. Tameer's per-m² rates (57/m² for 9″) do not reconcile with exact geometry — see §6.
- **vs Marshmoor:** everything except the bond selector: CEP has mortar, cost, wastage, openings, FAQ, formula, worked example, export, tables, programmatic pages. Marshmoor outputs a bare brick count.
- **vs VisionBuild:** per-opening W×H×count editor (VisionBuild: one total-area field); wastage as a live input (VisionBuild: guidance only); 8 brick presets incl. AAC/blocks (VisionBuild: free dims only); 3 currencies (VisionBuild: PKR only); formula block + worked example + 10 FAQs (VisionBuild: 4, no formula/worked example); export (VisionBuild: none); programmatic pages; brick-type and house-size tables.
- **vs Muzdoor:** everything observable — Muzdoor's outputs were not even captured in the fetch; CEP has the full stack plus content, FAQ, export and programmatic pages.
- **vs Avenir:** itemised cost in 3 currencies (Avenir: no cost at all); export (Avenir: none); explicit formula + worked example with two mixes and a door variant (Avenir: live default only); 10 FAQs vs 5; brick-type comparison, city-rates and sizes tables (Avenir: plot table only); 16 programmatic pages; AAC/block presets; per-opening editor (Avenir: total area only); exact geometry instead of rounded thumb rules (Avenir 903 vs CEP 873 for the same wall — CEP is the accurate one; see §6).

---

## 5. "Best-of-All-8" specification (Phase B build target)

House style (non-negotiable): `accent-*` tokens, primary **#F2A413**, never Tailwind `amber-*`; primary buttons dark ink; dark text on amber; **Mona Sans**; mobile-first; instant results (no calculate button); single h1 per page; keep the existing `CalculatorPageShell` + JSON-LD pattern.

### 5.1 Calculation modes (segmented control, top of the calculator; state preserved when switching)
1. **Single Wall** (default; today's mode): L × H × thickness, openings, brick, joint, wastage, mix, rates.
2. **Multi-Wall Room Project:** a repeatable wall list — each row: name (Wall 1…n, editable), L, H, thickness, openings (per wall, same editor as today). "Add wall" button; per-row remove; a project total row (bricks, cement, sand, cost) plus per-wall subtotals. Mortar/brick presets, joint, wastage, mix and rates are shared project-level settings (one set, applied to all walls) to keep the UI manageable. *Source: VisionBuild's wall-count multiplier is the minimal version; this spec goes one step further to per-wall rows because walls in a real room differ in size — no competitor does per-wall rows, this is a deliberate lead, not a copy.*
3. **Total Wall Area:** a single area input (m² or ft², unit switcher) + thickness; skips L×H. *Source: OmniCalculator's area-entry mode; Glen-Gery's area-based mode.*
- Mode switching must not lose already-entered values (keep Single-Wall values in state; Area mode derives from them when possible, and vice versa).

### 5.2 Wall thickness presets
4½″/114 mm half-brick (partition/internal) · 9″/229 mm single (external/load-bearing, default) · 13½″/343 mm 1.5-brick (foundations/heavy load-bearing) · **18″/457 mm double (new — thick foundation / retaining walls; no competitor offers it, but the task brief requires it and the engine already accepts any mm value)** · Custom (mm input). Keep the existing per-preset "use" line. Note the existing preset labels say "115 mm" for 4½″ (114.3 mm exact) and "230 mm" for 9″ (228.6 mm exact) — keep the rounded labels; the engine already uses the rounded mm values, which is consistent with the worked example.

### 5.3 Openings deduction
Keep the existing per-opening editor (door/window/other, W × H × count, add/remove) — it is already best-in-class. **Add:** a "total area" quick mode (single sq ft/m² field, as VisionBuild and Avenir do) as a toggle next to the per-opening list, for users who already know the total opening area. The two modes are mutually exclusive per wall (entering a total clears the list and vice versa, with a one-line note). Deduct every opening in full for brick quantity (per `AGENTS.md` plastering rules, the <0.5 m² no-deduction rule applies to **plastering only** — do not apply it here; the existing FAQ already says this correctly).

### 5.4 Brick size presets (extend the existing 8)
Keep all 8 existing presets. **Add US standard 7½″ × 3½″ × 2¼″ (190.5 × 88.9 × 57.2 mm)** — *source: OmniCalculator's FAQ ("standard 7.5″ × 3.5″ bricks, ≈5 per sq ft") and Glen-Gery's Modular family.* Label it "US standard — 7½″ × 3½″ × 2¼″" with a note that US face-brick work is usually a single leaf (veneer) and the calculator counts full wall volume, so a veneer user should use the 4½″-equivalent thickness. Keep custom L/W/H (mm). **Mortar joint thickness:** default 10 mm; also show the 3/8″ (9.5 mm) equivalent in the label, since Glen-Gery's rates assume a 3/8″ joint — the input stays in mm (existing behaviour), with a small "10 mm ≈ 3/8″" hint. Keep the per-preset standard + note lines (they are a CEP strength).

### 5.5 Bond pattern selector (new)
Stretcher / English / Flemish (segmented control or select, placed in the Brick & mortar section next to the visualizer). Each option carries a one-line structural note: **Stretcher** — single-leaf / half-brick walls only, fastest to lay; **English** — strongest common bond for 9″ walls, alternate stretcher/header courses (existing glossary definition); **Flemish** — alternate stretcher/header in each course, decorative face, same strength class as English for 9″ walls. **The count does not change with bond** (Avenir states this explicitly and it follows from the volume method — the volume of brickwork is bond-independent). Say so in a caption under the selector: "Bond changes the look and the drawing, not the brick count." The selector drives only the SVG drawing (§5.8). *Source: Avenir's bond selector + note; Marshmoor's bond selector (options unverified).*

### 5.6 Universal unit switchers (new; the biggest UX gap)
- **Wall dimensions:** ft / in (combined ft+in entry is out of scope; a single unit per field is enough), m / cm / mm, yd. One switcher per field group (length/height share one switcher; openings inherit it, as today) — **and switching converts the entered numbers** (today's m/ft toggle only relabels; fix that as part of this item). *Source: Tameer (m/ft/yd + mm/in) is the model; OmniCalculator's per-field switching is the aspiration.*
- **Brick dims:** mm / in switcher on the custom-size fields (Tameer does this).
- **Results:** show both systems everywhere it matters — wall volume in **m³ and ft³** (VisionBuild shows CFT; CEP today shows m³ only), sand in cft **and** m³ (already done), cement in bags **and kg** (Enviraj shows kg; 1 bag = 50 kg, so kg = bags × 50 — trivial, do it), area in m² and sq ft.
- **State preservation:** switching units never clears or resets any other field (contrast with today's currency switcher, which overwrites rates — fix that too: store rates per currency and restore them on switch-back).

### 5.7 Wastage pills (new)
Replace the bare number input with pills **0% / 5% (default) / 10% / 15% + Custom** (number input appears when Custom is picked). Guidance under the pills: "5% — good Awwal/machine-made, straight wall; 10% — kiln bricks, cut work, many openings; 15% — curved walls (Tameer: +10–15% for curved work)". Keep applying wastage to bricks and to dry mortar, as today. *Source: no competitor has pills — Tameer/VisionBuild only advise 5–10% in text; this is a deliberate lead.*

### 5.8 Live SVG wall & bond-pattern visualizer (new — the headline feature)
- A to-scale SVG elevation of the wall (length × height) with: brick courses drawn to scale (course height = brick height + joint), stretcher/header faces per the selected bond, the selected thickness shown as "bricks across N" (Avenir shows "Bricks across 2 (9 in wall)"), openings drawn as hatched/empty rectangles at proportional positions (first opening centred, additional openings distributed — a schematic, not a floor plan; label it "schematic — opening positions indicative"), and dimension lines (L across the top, H down the side).
- **Single-brick + mortar joint dimension callout:** a small inset (or a labelled detail next to the elevation) showing one brick with its joint: "230 × 110 × 75 mm + 10 mm joint → 240 × 120 × 85 mm nominal". This callout updates with the selected preset/joint. *Source: Avenir's elevation/section drawing (stretcher/header faces, "to scale", section through the wall) + OmniCalculator's dimensioned diagram image.*
- Updates live with dimensions, thickness, openings and bond (re-render on every input change, same as the results panel). On mobile it sits directly under the inputs, above the results; on desktop in the results column above the result cards. Pure inline SVG (no image assets, no new dependency). Add `aria-label` describing the wall ("Wall elevation, 10 ft by 10 ft, 9 in thick, English bond, 1 door opening") for accessibility.
- **Do not** claim the drawing is a construction drawing: caption "Schematic elevation — not to scale for construction. Bond changes the drawing, not the count."

### 5.9 Full material & cost breakdown (extend the existing results panel)
Keep everything the panel already shows, plus:
- **Bricks:** net (before wastage) · wastage bricks (count + %) · **total to order, rounded up** (already ceiled — keep). Show bricks per sq ft **and** per m² (already computed in the engine; per-m² is not displayed today).
- **Areas/volumes:** gross area, openings area, net area (already shown, m² — add sq ft); **masonry volume in ft³ and m³** (add ft³); wet mortar + **dry mortar (×1.33)** with both volumes in m³ and ft³ (today only m³, and dry mortar appears only as a description line under Cement — promote it to its own row).
- **Cement:** bags (50 kg, rounded up) **+ kg** (new); bag size **customisable** (OmniCalculator lets the user enter the market bag size — add a bag-size input defaulting to 50 kg; the 0.0347 m³/bag constant scales linearly: volume per bag = kg × 0.0347/50; keep 50 kg as the default and the FAQ's 0.0347 figure tied to it).
- **Sand:** cft + m³ (already shown); keep.
- **Mortar ratios:** **1:3 / 1:4 / 1:5 (new) / 1:6** + custom. 1:5 is the gap (OmniCalculator's FAQ uses a 1:5 mix for its cement-per-1,000-bricks figure; CEP jumps 1:4 → 1:6). Labels: 1:3 load-bearing, 1:4 general (standard), 1:5 general-lean, 1:6 partitions/lean.
- **Cost estimator (collapsible — new behaviour):** wrap the existing currency + rates + itemised cost block in a `<details>`-style collapsible section, default **expanded** on desktop / **collapsed** on mobile (progressive disclosure, after OmniCalculator). Keep the three editable rates (brick per 1,000 / cement per bag / sand per unit), the itemised lines and the materials-only total, the "enter the missing rate" prompt, and the labour/transport/taxes exclusion. **Fix the currency-switch rate overwrite** (§5.6). Keep the indicative-rates note with source + date; keep UAE brick price blank with the prompt (do not invent a UAE per-1,000 price).
- **Currency:** keep PKR/INR/AED; sand unit follows currency (cft for PKR/INR, m³ for AED) as today.

### 5.10 Copy BOQ, Print/Save PDF Summary, Reset to Defaults (extend existing)
- **Copy BOQ:** keep the existing Copy button, but expand the copied text into a proper BOQ-style summary: wall spec (mode, dims, thickness, bond), openings, brick preset + joint, mix, then a table-like list — bricks net/wastage/to-order, cement bags + kg, sand cft + m³, wet/dry mortar, itemised cost + total, rates note, disclaimer. (Today's copy is 6 lines; the BOQ version should mirror the full results panel.)
- **Print / Save PDF Summary:** keep Print and the jsPDF download; extend the PDF to the same BOQ content as Copy (today's PDF is the 6-line summary only). Filename stays `brick-estimate-civil-estimation-pro.pdf`.
- **Reset to Defaults (new):** a button that restores the 10 ft × 10 ft, 9″, Awwal, 10 mm joint, 5% wastage, 1:4, PKR default example (i.e. `defaultBrickInputs()`), clearing openings and custom sizes. Place it next to Copy/Share/Print. No competitor has this; it is cheap and removes the "how do I get back?" problem after experimenting.
- Keep Share (Web Share API + clipboard fallback).

### 5.11 Live formula + step-by-step worked example mirroring current inputs (extend existing)
- Keep the existing "How this was calculated" live step list in the results panel; extend it to include the openings deduction line (gross − openings = net, with live numbers) and the wastage line (net bricks × (1 + wastage) = to-order). It already mirrors live inputs — the openings/wastage lines close the two gaps.
- Keep the content section's worked example (10×10 ft, 1:4 and 1:6, door variant). **Add a second worked line** for the 1:5 mix (since 1:5 becomes a preset): same wall at 1:5 → compute from the engine in Phase B and print the exact bags/sand (do not hand-compute here). Keep the "try it above — the calculator is pre-loaded with exactly this wall" cross-reference, and make the worked example's numbers **generated from the same engine** in Phase B if feasible (single source of truth; today they are hard-coded prose that happens to match).

### 5.12 Reference tables (extend existing content)
Keep all existing tables (sizes, types, city rates, house sizes). **Add:**
- **Bricks per sq ft & per 100 sq ft by thickness** — computed from the engine for the PK Awwal brick (10 mm joint), exact figures with the thumb rule alongside: 4½″ ≈ 4.4 (thumb 4.5) · 9″ ≈ 8.7 (thumb 9) · 13½″ ≈ 13.1 (thumb 13.6) · 18″ ≈ 17.5 (thumb 18, to verify from engine in Phase B). Label the exact column "exact (this calculator)" and the thumb column "contractor's thumb rule (rounds up — safe)". *Source: the exact figures already exist in the Mortar-mix section prose; tabulating them answers "bricks per sq ft" queries directly. Glen-Gery's per-size pcs/ft² list is the model for presenting rates as a table.*
- **Mortar mix ratios guide** — table: mix | use | cement bags per m³ dry mortar (computed: 1:3 ≈ 9.6, 1:4 ≈ 7.7, 1:5 ≈ 6.4, 1:6 ≈ 5.5 — **verify from the engine in Phase B, do not hard-code these figures without checking**; the 1:3/1:4 values are consistent with the existing FAQ's 0.06/0.07 bags-per-CFT rules but must be recomputed, not copied from this paragraph) | sand per m³. *Source: no competitor has this table; it consolidates the mix guidance already in the FAQ + content.*
- **Standard house / plot-size estimates** — keep the existing house-size table; **add the plot-size framing Avenir uses** (5 Marla / 8 Marla / 10 Marla / 1 Kanal / 2 Kanal with covered area) as a column or a companion table, and add the **8 Marla and 2 Kanal rows** CEP lacks (compute with the same stated method as the existing rows; do not copy Avenir's ranges — Avenir's ranges use a different covered-area basis: 5 Marla 1,950 sq ft covered vs CEP's 787 sq ft/floor × 2 floors = 1,575 sq ft; the difference is method, not error — state CEP's method and keep CEP's numbers).
- Keep the glossary; **add "Stretcher bond", "Flemish bond" and "Single/double stack"** entries when the bond selector lands (the English-bond entry already exists).

### 5.13 FAQ, JSON-LD, title/meta (extend existing)
- **FAQ:** keep the 10 existing Q&As. **Add 4:** (a) "How many bricks are in 1 square foot of a 9-inch wall?" (exact 8.7, thumb 9 — answers the top PAA query; Avenir/OmniCalculator both carry it); (b) "What is the difference between stretcher, English and Flemish bond?" (with the "bond does not change the count" note); (c) "How do I calculate bricks for a curved wall?" (average radius × height, +10–15% wastage — Tameer's answer, which is sound); (d) "How many bricks will I need for a wall of a given area?" (area mode + reverse: qty → area, after Glen-Gery). Keep the FAQPage JSON-LD in sync (it is generated from the same `BRICK_FAQS` array — extend the array, do not hand-write a second copy).
- **JSON-LD:** keep WebApplication + FAQPage + BreadcrumbList + Organization. **Add HowTo** (the 4-step how-it-works list is already an ordered list — mark it up as HowTo with the same steps; no new copy needed). Do **not** add AggregateRating — CEP has no reviews; inventing a rating would be fake social proof (§6).
- **Title/meta:** keep the main title/description (they already cover PK/IN/AE + cost + openings). No change needed for the main page. For programmatic pages, no change. **Add** `HowTo` to the page's JSON-LD builder only.
- **Single h1:** already the case — preserve it through the rebuild (the visualizer and new sections must use h2/h3, never a second h1).

### 5.14 Disagreements between competitors / house rules — which source wins
| Disagreement | Winner | Why |
|---|---|---|
| Brick count method: volume (`N = V_wall / V_brick_with_mortar`, CEP) vs face-area (`(L×H)/((l+t)×(h+t))`, OmniCalculator) | **CEP volume method stays canonical** | Equivalent for single-leaf walls; the volume method generalises to any thickness and is the repo's house rule (`AGENTS.md`). Show the face-area form in the FAQ as an alternative check, not as the engine. |
| Bricks per sq ft, 9″ wall: CEP exact 8.7 vs Avenir 9.0 vs Tameer ~9–10 vs VisionBuild 13.5/CFT (≈ 10.1/sq ft of face? no — 13.5/CFT is a volume rate, not a face rate) | **CEP exact 8.7 (per sq ft of wall face), thumb 9** | 8.7 is exact geometry for 230×110×75 + 10 mm joint. 9.0/9–10 are safe round-ups. 13.5/CFT is a different unit (per cubic foot of wall volume): 873 ÷ 75.5 CFT ≈ 11.6/CFT exact, so 13.5 over-counts ~16% — usable as a safe thumb rule, never as the computed figure. Present exact + thumb side by side (§5.12) and label which is which. |
| Bricks per m², 9″ wall: Tameer 57/m² | **Reject Tameer's 57/m²** | 8.7/sq ft × 10.764 = ~94/m². 57/m² ≈ 5.3/sq ft is a single-leaf face rate mislabelled as a 9″ rate. Do not copy. |
| Cement bags per CFT at 1:4: CEP FAQ ~0.06 vs VisionBuild 0.042 | **Both are thumb rules; the engine's exact computation wins** | The difference is the frog allowance (×1.15) + wastage on mortar in CEP's figure. Keep CEP's 0.06 in the FAQ (it matches the engine's output for the worked example: 5 bags ÷ 75.5 CFT ≈ 0.066) and do not adopt 0.042. |
| Dry mortar factor: CEP ×1.33 (house rule) vs other sites' ×1.52 (seen in search results for brickcal.com, not in the 8 fetched pages) vs ×1.27 (superdevtools, search only) | **House rule ×1.33 wins** | It is the repo's stated rule and matches the standard QS convention for mortar. Do not change it because a search-result page uses 1.52. |
| Mortar default mix: CEP 1:4 vs Avenir 1:6 | **CEP 1:4 stays the default** | 1:4 is the general-brickwork standard in PK/IN (VisionBuild, CEP FAQ, Tameer all agree); Avenir's 1:6 is its own house choice for its cost model. Keep 1:4 default; offer 1:6 as a preset. |
| Wet mortar for the 10×10 ft wall: CEP ~19.5 cft (1:4, frog ×1.15) vs Avenir 14.8 cft (1:6) | **CEP's figure, computed from wall-volume-minus-brick-volume** | Avenir's is a per-sq-ft allowance, not a volume difference, and is mix-dependent. Do not "correct" CEP toward Avenir. |
| Cement bag size: 50 kg everywhere in PK/IN vs OmniCalculator's user-entered bag size vs US 94 lb bags | **50 kg default + user-editable bag size (§5.9)** | 50 kg is the PK/IN/AE standard; making it editable adopts OmniCalculator's flexibility without breaking the default. |
| House-size totals: CEP 5 Marla 39,300 vs Avenir 5 Marla 37,000–43,000 | **Both are defensible; keep CEP's computed figure + stated method** | Avenir's range overlaps CEP's point figure. The difference is covered area basis (CEP 70% × 2 floors; Avenir ~1,950 sq ft covered). Keep CEP's method visible; do not copy Avenir's ranges. |
| "Bricks per 1,000" UAE price | **Leave blank (current behaviour)** | No verified source was found in the Nov 10 research or today. An invented UAE price would be worse than a blank field with a prompt. |
| Bond pattern effect on count | **No effect (Avenir's note is correct)** | Volume method is bond-independent. The selector is presentational only. |

---

## 6. Do NOT copy

- **Tameer's per-m² rates (57/m² for 9″, 28/m² for 4.5″).** They do not reconcile with exact geometry (§5.14) and appear to mislabel single-leaf face rates as full-wall rates. Do not quote them anywhere.
- **VisionBuild's 13.5 bricks/CFT as an exact figure.** It is a safe thumb rule that over-counts ~16% against exact geometry. It may be mentioned only as "contractor's thumb rule (rounds up)", never as the calculator's output.
- **Avenir's 903/950 for the 10×10 ft wall.** Rounded thumb-rule arithmetic (9.0/sq ft), ~3.4% above the exact 873/917. Do not "align" CEP's worked example to Avenir's numbers; CEP's are the accurate ones.
- **Tameer's "mortar typically 10 mm or 0.5 inches".** 0.5″ is 12.7 mm, not 10 mm. Keep 10 mm (with the 3/8″ ≈ 9.5 mm equivalence noted in §5.4) and do not repeat the conflation.
- **Any displayed aggregate rating (Tameer 4.8/5 from 1,250 reviews; VisionBuild 4.9/5 from 156 ratings).** CEP has no collected reviews. Adding a rating or AggregateRating JSON-LD without real reviews is fake social proof. Do not add one in Phase B.
- **Glen-Gery's US-only framing.** Its 18 presets, pcs/ft² rates and 3/8″ joints are correct for US face brick but are not a substitute for PK/IN/AE sizes. Borrow the *pattern* (photo + rate on the preset), not the sizes — and only add the single US preset specified in §5.4.
- **Marshmoor's "speak to our experts before committing" as a substitute for accuracy.** Fine as a disclaimer pattern; not a reason to soften CEP's exact figures.
- **Invented rates.** No competitor in this set publishes a verifiable UAE clay-brick per-1,000 price; CEP's blank-with-prompt is the honest behaviour. Likewise do not copy any competitor's city rate without a source — CEP's PBS Aug 2026 figures are sourced; keep them and their dates.
- **Muzdoor's mixed-unit input pattern (ft/in wall + cm brick) without conversion.** It is confusing, not a feature. CEP's unit switchers (§5.6) must convert values on switch.
- **Any competitor's "last updated" freshness claim.** Avenir's "Q4 2026 cost model" is its own model; CEP must keep its own "Last updated" date current in Phase B (bump it when the page ships) rather than borrowing Avenir's label.
- **Search-result-only claims.** The backup searches surfaced other calculators' figures (e.g. a ×1.52 dry-mortar factor, 60 bricks/m² single-skin) from sites **not in the assigned 8**. None of those figures were adopted; they are noted only in §5.14 where they conflict with house rules.

---

## 7. Phase B handover notes (for the builder)

1. **Engine first:** the spec's new items that touch maths are small — 1:5 mix (preset only, engine already takes any `[1, n]`), 18″ thickness (preset only), US brick preset (data only), custom bag size (scale `CEMENT_BAG_M3` by kg/50), kg display (bags × 50), ft³ volume (×35.3147, already a constant), multi-wall mode (sum `calcBrickwork` per wall; shared settings), area mode (call `calcBrickworkFromArea`). No formula changes. The 1.15 frog factor and ×1.33 dry factor stay exactly as they are.
2. **Visualizer is the only genuinely new component.** Pure inline SVG, no dependency. Reuse the existing results-panel sticky column on desktop. Keep it schematic and labelled as such.
3. **Do not regress:** openings editor, 8 presets, jsPDF/Copy/Share/Print, 10 FAQs + JSON-LD sync, 16 programmatic variants, city/house-size tables, single h1, `accent-*` / #F2A413 / Mona Sans / dark-ink buttons.
4. **Fix the two known UX warts while in there:** (a) the m/ft toggle must convert values on switch; (b) the currency switcher must not overwrite user-entered rates (store per currency).
5. **Verify before shipping:** the 10×10 ft default must still read 873 / 917 / 5 bags / 21.8 cft sand at 1:4 after the rebuild; the 1:5 and 1:6 worked-example numbers must be generated from the engine, not hand-typed; the new per-sq-ft/per-100-sq-ft table and the mix-ratio table must be computed from the engine.
6. **Evidence file:** this document is the audit trail. Competitor claims are traceable to the 2026-11-20 fetches summarised in §1; anything marked "not observed" / "n/o" was not verifiable from a text fetch and must be re-checked in a live browser before being asserted as fact.
