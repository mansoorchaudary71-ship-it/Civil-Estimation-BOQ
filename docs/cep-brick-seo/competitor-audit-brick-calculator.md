# Competitor Audit — Brick Calculator Pages (5 sites)
Audited 2026-11-10 via text fetch (browser.open) + sitemap/robots fetch + web search.
All claims are from what was observable in the fetched text. Anything not observable is marked NOT VERIFIED — no figures were invented.

---

## 1. TAMEER.AI — https://www.tameer.ai/brick-calculator

### A. On-page SEO
- **Title tag (observed):** "Brick Calculator Pakistan - Calculate Bricks | Tameer.ai"
- **Meta description:** NOT VERIFIED (not present in text extraction; page source not accessible via text fetch).
- **H1:** NOT OBSERVED in extraction (first heading captured is H2 "Brick Calculator Guide for Pakistan"). H1 likely exists in HTML but was not captured — do not assume its wording.
- **H2/H3 hierarchy (observed):** H2 "Brick Calculator Guide for Pakistan"; H3 "Understanding Brick Sizes (Awwal Class)"; H3 "Single vs. Double Bricks (9\" vs 4.5\" Walls)"; H3 "Wastage and Cost Estimation"; H2 "Frequently Asked Questions" (appears twice in extraction — once as section heading, once as the FAQ block heading).
- **Keyword placement:** "Brick Calculator Pakistan", "Pakistan", "Awwal", "boundary walls, partition walls, load-bearing walls", "Lahore vs Karachi", "Doam" in body copy. Slug is clean: /brick-calculator.
- **Image alt text:** NOT VERIFIED.
- **Internal links (observed on page):** "Help page", "Feedback" links; contact email shown. Calculator sibling pages exist per sitemap (cement, paint, tile, requirement calculators) but in-page links to them were not observed in extraction.
- **FAQ block:** Yes — 5 Q&As: what a brick calculator is; bricks per sq m (57 for 9", 28 for 4.5"); standard PK brick size (9"×4.5"×3" / 225×112.5×75 mm); wastage (add 5–10%); curved walls (+10–15%).
- **Approx. word count (visible text only):** ~450 words (guide ~230 + FAQ ~150 + form labels ~60).
- **Semantic/LSI terms:** Awwal (First Class), Doam, mortar joint, nominal size, bricks per sq ft / per sq m, boundary wall, partition wall, load-bearing wall, breakage, transportation, unloading.
- **PAA coverage:** FAQ overlaps PAA-style queries (bricks per sq m, standard size, wastage, curved wall). No separate "People Also Ask" block observed.

### B. Technical SEO
- **Schema types:** NOT VERIFIED from text fetch (JSON-LD not visible in extraction). INFERRED SIGNAL ONLY: page displays "Rating: 4.8/5 (1250 reviews)", which strongly suggests an AggregateRating (likely SoftwareApplication/WebApplication) — treat as unconfirmed until page source is checked.
- **Canonical / hreflang / OG / Twitter:** NOT VERIFIED.
- **Sitemap:** Yes — https://www.tameer.ai/sitemap.xml exists and is extensive. /brick-calculator listed (priority 0.8, changefreq monthly, lastmod 2026-11-10 — i.e. today). Also lists cement/paint/tile/requirement calculators, marketplace category pages (/search/cy-*), builders, projects, stores.
- **Robots:** Yes — detailed. Allows all public pages; disallows /api/, /marketplace/dashboard, /marketplace/registration, /builders/dashboard, /builders/registration, /ba/, /baVisits, /onboarding, /profile, /reset-password, /customer-leads, /leads-request, /chatbot, /payment-summary, /services. Separate ClaudeBot rules (public pages only). Declares Host and Sitemap.
- **Render method:** NOT VERIFIED (dynamic marketplace with /api/ routes and UUID slugs suggests a JS app/SSR setup; text extraction returned full content).
- **Core Web Vitals / mobile-friendliness:** NOT MEASURABLE via text fetch.
- **HTTPS:** Yes.

### C. Content
- **Sections below calculator:** Guide (brick sizes, single vs double wall, wastage/cost) + FAQ. No formula block, no cost-per-1000 table, no brick-type comparison table, no glossary, no worked example with numbers.
- **Brick sizes/standards:** Awwal 9"×4.5"×3"; mortar typically 10 mm or 0.5". No IS/NBC citation.
- **Wall thickness:** 4.5" (single, ~4.5–5 bricks/sq ft), 9" (double, ~9–10 bricks/sq ft), 13.5" (foundations/heavy load-bearing).
- **Mortar ratio:** Not stated. Mortar thickness input only.
- **Wastage:** 5–10%.
- **Cost:** Price-per-brick (PKR) input → cost of bricks. No per-1000-bricks table, no city rates.
- **Worked examples:** None with worked numbers.
- **Readability:** Short paragraphs, bullet lists, plain language. Depth is shallow (~450 words).
- **Freshness signals:** Sitemap lastmod today (2026-11-10). Privacy policy "Last updated: October 1, 2026". No visible "last updated" date on the calculator page itself.
- **E-E-A-T:** Brand claim "Pakistan's 1st Zero Commission Construction Platform connecting buyers with suppliers and builders"; phone +92 322 0001263; email shown. No author/reviewer byline, no sources cited.

### D. Programmatic SEO
- No /brick-calculator/{city} or /{brick-type} templated pages observed. Programmatic surface is the marketplace: /search/cy-{category} pages (dozens of categories), /builders/{slug}, /builders/projects/{uuid}, /marketplace/{uuid}, /marketplace/stores/{slug}. Calculators are a fixed set of 5 — no templating around them.

### E. Off-page SEO
- **Backlink profile:** NOT VERIFIABLE from free readable sources — no referring-domain/backlink numbers obtained; do not use any. (A web search for "tameer.ai backlinks referring domains" returned no data for this domain.)
- **Observable:** Meta advertising presence (privacy policy references Meta Custom Audiences / Conversions API / Meta Lead Ads); "pitch.tameer.ai" subdomain observed in certificate-transparency records. No directories, citations or social profiles observed on the calculator page itself.

### F. UI/UX
- **Inputs:** Wall units toggle (m / ft / yd); wall type Single/Double; wall length (L), wall height (H); brick size units (mm / in); brick length/height/width; mortar joint thickness (t). No openings input, no wastage % input (fixed guidance), no number-of-walls input.
- **Defaults:** Not stated in extraction (fields appear blank/with checkmarks).
- **Instant vs button:** Not determinable from text extraction.
- **Result breakdown:** Bricks needed; brick wastage; total bricks needed; price per brick (PKR); cost of bricks (PKR). NO cement, NO sand, NO total project cost.
- **PDF/print/share/save:** None observed.
- **Mobile layout:** NOT VERIFIABLE.
- **Trust elements:** 4.8/5 (1250 reviews) rating shown.
- **CTAs/ads:** No ad placement observed; "Help page" / "Feedback" links only.

### G. Calculator features / formulas
- **Formula shown on page:** NO explicit formula. Rates stated: ~57 bricks/m² (9" wall), ~28 bricks/m² (4.5" wall); ~4.5–5 bricks/sq ft (4.5"), ~9–10 bricks/sq ft (9"). Wastage 5–10% (guidance only, not an input). Mortar joint typically 10 mm / 0.5".
- **Outputs:** bricks needed, wastage bricks, total bricks, brick cost (PKR).

---

## 2. MARSHMOOR BRICKS — https://marshmoorbricks.com/resources/brick-calculator/

### A. On-page SEO
- **Title tag (observed):** "Free Brick Calculator - Marshmoor Bricks | Marshmoor Bricks"
- **Meta description:** NOT VERIFIED.
- **H1 (observed):** "Free Brick Calculator - Marshmoor Bricks" (extraction shows it as the top heading; title and H1 appear identical).
- **H2/H3:** "Wall Dimensions", "Brick Layout / Bond Type" (H3-level in extraction). No guide headings, no FAQ heading.
- **Keyword placement:** "free brick calculator", "UK house brick", "215mm Long x 65mm High", "10mm mortar joint". UK-focused; no PK/IN/AE terms.
- **Image alt text:** NOT VERIFIED.
- **Internal links (observed):** "Contact Us", email link; text references "our simple custom brick size calculator" (separate tool) and the brick catalogue (dozens of product pages per search results).
- **FAQ block:** NONE — browser.find for "FAQ" on the fetched page returned zero matches.
- **Approx. word count (visible text only):** ~90–120 words. Thinnest page of the five.
- **Semantic terms:** bond type, mortar joint, rounds up to the nearest brick, custom brick size.
- **PAA coverage:** None.

### B. Technical SEO
- **Schema types:** NOT VERIFIED.
- **Canonical / hreflang / OG / Twitter:** NOT VERIFIED.
- **Sitemap:** /sitemap.xml returns **404** ("404: Like the perfect partner, this page doesn't exist"). No XML sitemap found at the standard location.
- **Robots:** Minimal — `User-agent: *` / `Disallow:` (empty = allow all). No sitemap reference.
- **Render method:** NOT VERIFIED (content extracted fully; catalogue structure suggests WordPress/CMS).
- **Core Web Vitals / mobile-friendliness:** NOT MEASURABLE.
- **HTTPS:** Yes.

### C. Content
- **Sections below calculator:** None observed — calculator + one intro paragraph only.
- **Brick sizes/standards:** UK house brick 215 mm × 65 mm high, 10 mm mortar joint (defaults). Product catalogue pages carry full specs per brick (dimensions, tolerance range, freeze–thaw, water absorption, compressive strength, pack size) — e.g. 215×102.5×65 mm, T2/R1/F2, ≥20 N/mm².
- **Wall thickness / mortar ratio / wastage / cost:** Not covered on the calculator page. No cost output at all.
- **Worked examples / tables / comparisons:** None on the calculator page. Brick-type comparison exists only implicitly via the catalogue.
- **Readability:** Very short; plain.
- **Freshness signals:** Calculator page "Last Crawl: 121 days ago" per search results (stale); catalogue product pages crawled 2–12 days ago.
- **E-E-A-T:** Trade supplier identity (phone 01438 869100, info@marshmoorbricks.co.uk); per-product technical data sheets (PDFs per brick type). No author byline.

### D. Programmatic SEO
- No calculator variants by city/type. Programmatic surface is the **brick catalogue**: one page + one PDF data sheet per brick type (e.g. /pdfs/bricks-bourneville-buff-blend.pdf), each with unique spec tables — this is templated product content, not calculator content.

### E. Off-page SEO
- **Backlink profile:** NOT VERIFIABLE from free readable sources — no numbers obtained.
- **Observable:** UK brick supplier; catalogue PDFs (linkable assets); phone/email citations. No social profiles observed on the calculator page.

### F. UI/UX
- **Inputs:** Wall Height (m), Wall Length (m); Brick Layout / Bond Type selector ("Select Type"); link to a separate custom-brick-size calculator.
- **Defaults:** UK brick 215×65 mm, 10 mm joint pre-entered.
- **Instant vs button:** Not determinable from extraction.
- **Result breakdown:** Brick count only (rounds up to nearest brick). NO cement, NO sand, NO cost.
- **PDF/print/share/save:** None observed (PDFs exist for products, not for results).
- **Mobile layout:** NOT VERIFIABLE.
- **Trust elements:** "Speak to our experts before committing to a quantity" (human-expert angle). No ratings shown.
- **CTAs/ads:** Contact Us / phone. No ads observed.

### G. Calculator features / formulas
- **Formula shown on page:** NO formula. Only stated behaviour: defaults entered, always rounds up to nearest brick.
- **Outputs:** Number of bricks only.

---

## 3. VISION BUILD CONSTRUCTION — https://visionbuildconstruction.com.pk/bricks-calculator.php

### A. On-page SEO
- **Title tag (observed):** "Free Bricks Calculator Pakistan | Brick Mortar Cement Sand Cost PKR | Vision Build Construction"
- **Meta description:** NOT VERIFIED. (Page's own "Additional Details" description: "Free online bricks calculator for Pakistan. Calculate number of bricks, cement bags, sand volume and total cost in PKR for wall construction projects." — this is the visible description text, not confirmed as the meta tag.)
- **H1 (observed):** Same as title: "Free Bricks Calculator Pakistan | Brick Mortar Cement Sand Cost PKR | Vision Build Construction".
- **H2/H3:** H2 "How to Use Bricks Calculator"; H2 "Frequently Asked Questions". No H3s observed.
- **Keyword placement:** "Bricks Calculator Pakistan", "Brick Mortar Cement Sand Cost PKR", "brickwork", "9\" Wall", "1:4 Ratio" in visible copy. Slug /bricks-calculator.php (note plural "bricks").
- **Image alt text:** NOT VERIFIED.
- **Internal links (observed):** None captured on the page itself in extraction; homepage links a "Free Construction Calculators" hub (Marla, House Construction Cost, Marla↔Sq Ft, Kanal↔Marla, Land Converter, Concrete, Loan EMI). Sitemap lists ~50 pages (calculators, converters, material-prices, blog).
- **FAQ block:** Yes — 4 Q&As: bricks per sq ft in Pakistan (13.5/CFT for 9", 6.75/sq ft for 4.5"); standard brick size (9×4.5×3", also 9×4.5×2.75" variant); cement per CFT (0.042 bags at 1:4; 0.056 at 1:3); standard mortar ratio (1:4 general, 1:3 load-bearing, 1:6 foundation).
- **Approx. word count (visible text only):** ~400 words (how-to ~90 + FAQ ~200 + form labels ~120).
- **Semantic terms:** brickwork, CFT, mortar ratio, cement bags (50 kg), sand volume, openings area, wall volume, net wall area.
- **PAA coverage:** FAQ overlaps PAA queries (bricks per sq ft, standard size, cement per CFT, mortar ratio). No separate PAA block.

### B. Technical SEO
- **Schema types:** NOT VERIFIED from text fetch. INFERRED SIGNAL ONLY: page displays "Rating: 4.9/5 (156 ratings)" and "Price: 0 PKR" with a description — consistent with SoftwareApplication/WebApplication + AggregateRating + Offer markup; unconfirmed until page source is checked.
- **Canonical / hreflang / OG / Twitter:** NOT VERIFIED.
- **Sitemap:** Yes — /sitemap.xml exists, ~50+ URLs, all lastmod 2026-10-19 (bulk date). bricks-calculator.php priority 0.8, monthly. Also references sitemap.php in robots.
- **Robots:** Yes — Cloudflare-managed. `Content-Signal: search=yes, ai-train=no, use=reference`; blocks AI/training crawlers (Amazonbot, Applebot-Extended, Bytespider, CCBot, ClaudeBot, Diffbot, Google-Extended, GPTBot, etc.); Allow: /; disallows /cms/, /db.php, /.htaccess, /config.php. Sitemap: sitemap.php.
- **Render method:** Server-rendered PHP (.php URLs; full content in extraction).
- **Core Web Vitals / mobile-friendliness:** NOT MEASURABLE.
- **HTTPS:** Yes.

### C. Content
- **Sections below calculator:** "How to Use Bricks Calculator" (4 bullets) + FAQ. No formula block, no cost-per-1000 table, no brick-type comparison, no glossary, no worked example.
- **Brick sizes/standards:** PK standard 9×4.5×3"; variant 9×4.5×2.75" noted. No IS/NBC citation.
- **Wall thickness:** Input in inches; 9" and 4.5" referenced in FAQ.
- **Mortar ratio:** 1:4 standard, 1:3 load-bearing, 1:6 foundation. User-adjustable cement:sand parts.
- **Wastage:** Guidance only — "Add 5–10% extra bricks for wastage, breakage, and future repairs." Not an input.
- **Cost:** Brick price (PKR/brick), cement bag price, sand price (PKR/CFT) → cost breakdown: bricks, cement, sand, material-only, total estimated cost (materials).
- **Worked examples:** None.
- **Readability:** Short bullets; plain.
- **Freshness signals:** Sitemap lastmod 2026-10-19 for all pages (bulk, not per-page). No visible "last updated" on the calculator page.
- **E-E-A-T:** Business identity — Bhara Kahu, Islamabad; +92 302 3873103; visionbuildc@gmail.com; Mon–Sat 9:00–6:00. No author/reviewer byline, no sources cited.

### D. Programmatic SEO
- No /bricks-calculator/{city} or /{brick-type} templating observed. Calculators are individual .php pages (~20+ tools: marla, kanal, tile, paint, steel, block, plaster, concrete, roof, foundation, wastage, EMI, solar, etc.). material-prices.php is weekly — the only recurring-data page.

### E. Off-page SEO
- **Backlink profile:** NOT VERIFIABLE from free readable sources — no numbers obtained.
- **Observable:** Local business citations (address, phone, hours); material supply service. No social profiles or directories observed on the calculator page.

### F. UI/UX
- **Inputs:** Unit System toggle; Number of Walls; Wall Length, Wall Height, Wall Thickness (inches); Openings Area (sq ft); Brick Length/Width/Height (inch); Brick Price (PKR/brick); Cement Bag Price (PKR); Sand Price (PKR/CFT); Cement:Sand mortar ratio (parts inputs).
- **Defaults:** Reference rates shown: 13.5 bricks/CFT (9" wall), 0.042 cement bags/CFT (1:4), 0.23 sand CFT/CFT.
- **Instant vs button:** Not determinable from extraction.
- **Result breakdown:** Wall Volume (CFT), Net Wall Area (sq ft), Bricks Required, Cement Bags (50 kg), Sand Volume (CFT), Mortar Ratio, Cost Breakdown (bricks / cement / sand / material-only / total estimated cost).
- **PDF/print/share/save:** None observed.
- **Mobile layout:** NOT VERIFIABLE.
- **Trust elements:** 4.9/5 (156 ratings).
- **CTAs/ads:** None observed beyond the calculator.

### G. Calculator features / formulas
- **Rates stated (not a full formula):** 13.5 bricks per CFT (9" wall); 6.75 bricks per sq ft (4.5" wall); 0.042 cement bags (50 kg) per CFT at 1:4; 0.056 bags/CFT at 1:3; 0.23 sand CFT per CFT. Mortar ratios 1:4 / 1:3 / 1:6 by use.
- **Full formula as an equation:** NOT SHOWN on the page.
- **Outputs:** bricks, cement bags, sand volume, wall volume, net area, cost breakdown in PKR.

---

## 4. MUZDOOR — https://www.muzdoor.com/calculators/brick-calculator

### A. On-page SEO
- **Title tag (observed):** "Brick Calculator - Muzdoor.com"
- **Meta description:** NOT VERIFIED.
- **H1 (observed):** "Brick Calculator - Muzdoor.com" (same as title).
- **H2/H3:** "Brick Masonry Calculation" (H3-level in extraction). No guide headings, no FAQ heading.
- **Keyword placement:** Minimal visible copy — "Brick Masonry Calculation" only. No Pakistan/price/size terms in visible body text.
- **Image alt text:** NOT VERIFIED.
- **Internal links (observed):** Extensive footer: About Us, Leadership, Partners, How it Works, Blog, Newsletter; Services (Construction Consultation, Bidding, Cost Estimation, etc.); Policies (Privacy, Terms, Prohibited Products, Copyright, Advertisement); Support (FAQs, Help, Sitemap, Contact); Trades (Air Conditioner, Bathrooms, Electrical, Floor, etc.). Calculators hub at /calculators with 3 calculators (brick, cement-concrete, construction-cost-estimator).
- **FAQ block:** NONE on the page — "FAQ" appears only as a footer link ("Faqs"). browser.find for "FAQ" on the fetched page matched only the footer link.
- **Approx. word count (visible text only, excl. footer):** <100 words. Second-thinnest page of the five.
- **Semantic terms:** Brick Masonry Calculation; wall thickness; ratio; size of brick.
- **PAA coverage:** None.

### B. Technical SEO
- **Schema types:** NOT VERIFIED.
- **Canonical / hreflang / OG / Twitter:** NOT VERIFIED.
- **Sitemap:** Yes — /sitemap.xml exists, single flat file, all URLs lastmod 2026-08-17 (stale, ~3 months old). /calculators/brick-calculator priority 0.80. Also lists blog posts (incl. "construction-calculators", "evolution-of-construction-calculators", "boq-bill-of-quantities-investor-checklist") and knowledgebase pages.
- **Robots:** Yes — allow all; Sitemap declared.
- **Render method:** NOT VERIFIED (form labels extracted; likely server-rendered).
- **Core Web Vitals / mobile-friendliness:** NOT MEASURABLE.
- **HTTPS:** Yes.

### C. Content
- **Sections below calculator:** None observed — calculator form only.
- **Brick sizes/standards / wall thickness / mortar / wastage / cost:** No explanatory content at all on the page. (A separate service page, "Waterproofing and Roof Heat Proofing", mentions 7"/6"/5" brick thickness for heat — not on the calculator page.)
- **Worked examples / tables / comparisons / glossary:** None.
- **Readability:** N/A — almost no prose.
- **Freshness signals:** Sitemap lastmod 2026-08-17 (stale). Footer: "Beta Version 2.0", "Copyright © 2026".
- **E-E-A-T:** Strongest formal business identity of the PK sites: registered firm (Register of Firms Number 2014-15/0790, NTN 7160801-5, SRB SNTN S7160801-5); address Anum Estate, Suite #611, Shahrah-e-Faisal, Karachi 75400; phone +92 330-689-3667; support@muzdoor.com. Social: LinkedIn, Facebook, YouTube. No author byline on the calculator page.

### D. Programmatic SEO
- No calculator variants by city/type. Programmatic surface is services: /services/{trade} pages (dozens), /kaam/work-type/*, blog posts, knowledgebase tickets. Calculators are a fixed set of 3.

### E. Off-page SEO
- **Backlink profile:** NOT VERIFIABLE from free readable sources — no numbers obtained.
- **Observable:** Social profiles (LinkedIn company page, Facebook, YouTube); registered-business citations; blog content (BOQ checklist, construction calculators) as linkable assets. No directories observed.

### F. UI/UX
- **Inputs (observed labels):** Unit; Length (feet, inch); Height/Depth (inch); Wall Thickness; Ratio; Size of Brick — Length/Width/Height (cm). Mixed units (ft/in for wall, cm for brick).
- **Defaults:** Not stated in extraction.
- **Instant vs button:** Not determinable.
- **Result breakdown:** NOT OBSERVED in extraction (no output values captured — the results area rendered empty or was not captured).
- **PDF/print/share/save:** None observed.
- **Mobile layout:** NOT VERIFIABLE.
- **Trust elements:** Registration numbers, NTN, "Beta Version 2.0" label.
- **CTAs/ads:** None observed on the calculator itself.

### G. Calculator features / formulas
- **Formula shown on page:** NO formula observed.
- **Outputs:** NOT OBSERVED (no output values in the extracted text).
- **Inputs:** wall length/height, wall thickness, mortar ratio, brick size (cm).

---

## 5. AVENIR DEVELOPMENTS — https://avenirdevelopments.com/calculators/brick-quantity-calculator/

### A. On-page SEO
- **Title tag (observed):** "Brick Quantity Calculator: Exact Bricks for Any Wall or House Size"
- **Meta description:** NOT VERIFIED.
- **H1 (observed):** Same as title: "Brick Quantity Calculator: Exact Bricks for Any Wall or House Size".
- **H2/H3:** H2 "Frequently Asked Questions". Other headings in extraction are result/table labels, not H2/H3 content sections. No "how it works" or guide H2 observed.
- **Keyword placement:** "Brick Quantity Calculator", "Exact Bricks for Any Wall or House Size", "5 Marla", "10 Marla", "1 Kanal", "2 Kanal", "grey structure", "English bond", "Lahore, Islamabad and Rawalpindi". Slug /calculators/brick-quantity-calculator/ (note "quantity" — targets "brick quantity" phrasing).
- **Image alt text:** NOT VERIFIED. Page includes a wall diagram ("Section through the wall", "Wall elevation", "Stretcher face", "Header face", "Bricks across 2 (9 in wall)", "To scale") — the only visual explainer among the five.
- **Internal links (observed):** Calculators hub (/calculators/), Resources hub (/resources/), house-construction-cost pages, land-area-conversion calculator, LEED tool, flooring-costs guide; social links (Instagram, Facebook, YouTube, LinkedIn, Pinterest); office map links; international associates (Emirates Oasis Contracting, ARCAN Project Management, Dubai).
- **FAQ block:** Yes — 5 Q&As: standard brick size (9×4.5×3", ~229×114×76 mm; kiln variation, measure your bricks); bricks for a 5 Marla house (37,000–43,000; 10 Marla 61,000–70,500; 1 Kanal 112,000–130,000); bricks per sq ft of 9" wall (~9; 4.5" ~4.5; 13.5" ~13.6); accuracy (geometry-based; real size, openings, wastage matter most; planning estimate, not a quotation); mortar estimate (10×10 ft wall 1:6 → ~3 bags cement, 17 cft sand).
- **Approx. word count (visible text only):** ~450–500 words (FAQ ~250 + results/table ~120 + business info ~100).
- **Semantic terms:** English bond, stretcher face, header face, grey structure, covered area, wastage, wet mortar, mortar mix, planning estimate, DHA, LDA, CDA, RDA.
- **PAA coverage:** FAQ overlaps PAA queries (standard size, 5 Marla house bricks, bricks per sq ft, accuracy, mortar). No separate PAA block.

### B. Technical SEO
- **Schema types:** NOT VERIFIED from text fetch. INFERRED SIGNALS ONLY: page shows business data block (Business: Avenir Developments Lahore; Hours: Mo–Sa 10:00–19:00; Price Range: PKR $$$; Phone: +92-300-1101807) consistent with LocalBusiness/Organization markup; FAQ block consistent with FAQPage. Both unconfirmed until page source is checked.
- **Canonical / hreflang / OG / Twitter:** NOT VERIFIED. (WordPress site — SEO plugin output likely, but not observed.)
- **Sitemap:** Yes — sitemap index at /sitemap.xml listing post-sitemap.xml (lastmod 2026-09-24) and page-sitemap.xml (lastmod 2026-10-06). HTML sitemap page exists (/sitemap/) listing dated pages (brick calculator published June 2, 2025; calculators hub Nov 3, 2025).
- **Robots:** Yes — last updated 15 Aug 2026; disallows /wp-admin/, /*?s=, /search/; allows AI crawlers on / (GPTBot, ClaudeBot, Perplexity, Google-Extended, Applebot-Extended, Amazonbot, meta-externalagent); comments: do NOT add /author/ (those pages carry meta noindex); do NOT add Crawl-delay (Bing obeys it). Sitemap declared as sitemap_index.xml (note: /sitemap.xml also resolves to an index — minor inconsistency).
- **Render method:** WordPress (confirmed by /wp-admin/ in robots) — server-rendered.
- **Core Web Vitals / mobile-friendliness:** NOT MEASURABLE. Calculators hub states tools "run in your browser" and work on mobile (land-area page: "Does it work on mobile devices? Yes").
- **HTTPS:** Yes.

### C. Content
- **Sections below calculator:** Results breakdown + "Bricks by plot size" table (Avenir cost model Q4 2026) + FAQ. No formula block, no brick-type comparison table, no glossary.
- **Brick sizes/standards:** Standard 9×4.5×3" (~229×114×76 mm); notes kiln-to-kiln variation and advises measuring actual bricks; custom size under "More options".
- **Wall thickness:** 9" default; 4.5" and 13.5" rates given in FAQ.
- **Mortar ratio:** Default 1:6 (cement:sand). 10 mm joints.
- **Wastage:** Default 5% (adjustable via "More options").
- **Cost:** No price input and no cost output on the calculator. Cost appears only as brick-count ranges by plot size (5 Marla 37,000–43,000; 8 Marla 53,000–61,500; 10 Marla 61,000–70,500; 1 Kanal 112,000–130,000; 2 Kanal 204,500–236,500) from "Avenir cost model Q4 2026".
- **Worked examples:** Default live example: 10 ft × 10 ft wall, 9" thick, English bond, 5% wastage → 950 bricks to order (903 before wastage), 9.0 bricks/sq ft, 3 bags cement, 17 cft sand, 14.8 cft wet mortar.
- **Readability:** Short FAQ answers; disclaimer "Planning estimate, not a quotation. Bond pattern does not change the count."
- **Freshness signals:** STRONGEST of the five — "Avenir cost model Q4 2026"; "Construction rates reviewed every quarter… last reviewed in Q4 2026"; calculators hub FAQ on quarterly reviews; brick page "Last Updated: 35 days ago" per search results; HTML sitemap dates pages.
- **E-E-A-T:** STRONGEST of the five — real company with two offices (139 CCA DHA Phase 5 Lahore; 101 Luxus Mall Gulberg Greens Islamabad), UAN +92 300 110 1807, WhatsApp, email, hours; international associates in Dubai; building-byelaw citations (DHA/LDA/CDA/RDA); rate guides with confidence ratings and source registers (e.g. flooring guide register FLR-2026-09-26, "C means sources agree within a workable band"); calculators hub states Marla conventions (225 sq ft DHA vs 272.25 revenue) — demonstrates domain expertise. No individual author byline observed on the calculator page itself.

### D. Programmatic SEO
- No /brick-calculator/{city} templated pages observed. Programmatic-adjacent strengths: calculators hub (many tools), resources hub, cost guides by topic (e.g. /house-construction-cost/flooring-costs-in-pakistan/), city-specific rates (Lahore vs Islamabad/Rawalpindi +5%), Marla/Kanal conventions. Brick page itself is a single URL.

### E. Off-page SEO
- **Backlink profile:** NOT VERIFIABLE from free readable sources — no numbers obtained.
- **Observable:** Social profiles (Instagram, Facebook, YouTube, LinkedIn, Pinterest); Google Business/share link (share.google); Dubai associate links (outbound); quarterly rate guides as linkable assets. No directories observed.

### F. UI/UX
- **Inputs (observed):** Wall length/height (ft), wall thickness (in, 9" default), bond type (English bond selector with diagram), doors/windows area, brick size (default 9×4.5×3"), joint (10 mm), wastage % (default 5%), mortar mix (1:6) — plus "More options" for custom size. Default live result shown immediately (950 bricks for 10×10 ft wall).
- **Defaults:** 10 ft × 10 ft, 9 in, English bond, 5% wastage — results visible on load (instant results).
- **Instant vs button:** Instant — default result renders on page load; "Fix the highlighted field to see your result" validation message observed.
- **Result breakdown:** Bricks to order; before wastage; per sq ft of wall; cement for mortar (bags of 50 kg); sand for mortar (cft); gross wall area; doors/windows area; net wall area; brick size and joint; wastage %; wet mortar (cft); mortar mix. NO cost output.
- **PDF/print/share/save:** None observed. (Other Avenir tools offer "Share on WhatsApp" — not observed on this page.)
- **Mobile layout:** NOT VERIFIABLE from text fetch.
- **Trust elements:** Live worked example, plot-size table from own cost model, "planning estimate, not a quotation" honesty note, business identity block.
- **CTAs/ads:** No ads observed. Implicit CTA via phone/WhatsApp/consult.

### G. Calculator features / formulas
- **Rates stated (not a full equation):** ~9 bricks/sq ft (9" wall), ~4.5 (4.5"), ~13.6 (13.5"), before wastage, with 9×4.5×3" bricks and 10 mm joints. Default example: 100 sq ft gross − 0 openings = 100 sq ft net → 903 bricks before wastage → 950 with 5%. Wet mortar 14.8 cft; mix 1:6 → 3 bags cement (50 kg), 17 cft sand.
- **Full formula as an equation:** NOT SHOWN on the page.
- **Outputs:** bricks to order, pre-wastage count, bricks/sq ft, cement bags, sand cft, wet mortar cft, wall areas, mix ratio.

---

## CROSS-SITE SUMMARY — Strongest common practices

1. **FAQ block with PAA-style questions (3 of 5):** Tameer (5 Q&As), VisionBuild (4), Avenir (5). Marshmoor and Muzdoor have none — the single biggest on-page gap between the two groups.
2. **Aggregate rating displayed (2 of 5):** Tameer 4.8/5 (1,250 reviews); VisionBuild 4.9/5 (156 ratings). Strongly suggests review/rating schema; no other site shows one.
3. **Full material breakdown (2 of 5):** VisionBuild and Avenir output bricks + cement + sand. Tameer outputs bricks + cost only. Marshmoor outputs bricks only. Muzdoor outputs not observed.
4. **Openings deduction (2 of 5):** VisionBuild (Openings Area sq ft) and Avenir (doors/windows area). Tameer, Marshmoor, Muzdoor have no openings input.
5. **Local standards + thumb-rule numbers:** All PK sites use 9×4.5×3" and quote 13.5 bricks/CFT or ~9 bricks/sq ft (9" wall); 5–10% wastage guidance is near-universal.
6. **Plot/house-size table (1 of 5 — Avenir only):** Marla/Kanal brick-count ranges from a dated cost model (Q4 2026). Unique, high-value for "bricks for 5 marla house" queries.
7. **Live default example (1 of 5 — Avenir only):** Results visible on load (950 bricks for 10×10 ft wall) with a wall diagram (stretcher/header faces, bond, scale).
8. **Sitemap + robots hygiene:** Tameer (fresh lastmod today, detailed robots, sitemap declared), Avenir (sitemap index + HTML sitemap + maintained robots with AI-crawler rules), VisionBuild (full sitemap, Cloudflare content-signal robots). Marshmoor has NO sitemap.xml (404) and a bare robots file; Muzdoor's sitemap lastmod is ~3 months stale (2026-08-17).
9. **Calculator hubs / internal linking:** All five sit inside a calculators hub or sibling-tool set; Avenir's hub + resources hub is the most developed (topic guides, quarterly rates, byelaw citations).
10. **Freshness signals (1 of 5 strong — Avenir):** Quarterly rate reviews, "Q4 2026" cost model, dated pages. Others rely on bulk sitemap lastmod dates only.
11. **Real-business E-E-A-T (Avenir strongest):** offices, UAN/WhatsApp, Dubai associates, byelaw citations, confidence-rated rate guides. Muzdoor's registration numbers (NTN, Register of Firms) are also notable.
12. **Unit flexibility:** Tameer (m/ft/yd + mm/in) and VisionBuild (unit-system toggle) lead; Avenir ft/in; Muzdoor mixed ft/in + cm; Marshmoor metres only.

## What NONE of the five do well (gaps CEP can exploit)

- No PDF / print / share / save-results feature on any page.
- No cost-per-1,000-bricks table and no city rate tables (only Avenir's plot-size brick ranges; no prices).
- No currency toggle (PKR/INR/AED) — all are single-currency or no-cost.
- No explicit formula shown as an equation on any page (only implied per-CFT / per-sq-ft rates).
- No video, no glossary, no brick-type comparison table (Awwal vs Doam vs machine-made vs fly-ash etc.).
- No author/reviewer byline on any calculator page.
- No visible "last updated" date on any calculator page (Avenir's freshness lives on hub/guide pages, not the calculator).
- No hreflang observed anywhere (not verifiable, but no PK/IN/AE targeting signals seen).
- No embeddable widget / backlink-generating tool observed.
- Two of five (Marshmoor, Muzdoor) have effectively no supporting content — calculator only.

## NOT VERIFIED — read before using this audit

- **Meta descriptions, canonical tags, hreflang, Open Graph/Twitter cards, image alt text, JSON-LD schema types, Core Web Vitals, mobile-friendliness:** NOT observable from text fetch for ANY of the five. Do not assert any of these; they require page-source or Search Console / PageSpeed inspection.
- **Schema:** only inferred signals exist — Tameer and VisionBuild display aggregate ratings (suggesting rating schema); Avenir displays LocalBusiness-style data and an FAQ block (suggesting LocalBusiness/FAQPage). Types are UNCONFIRMED.
- **Backlink counts, referring domains, DR/DA, anchor distribution:** NOT VERIFIABLE from any free readable source consulted. A search for "tameer.ai backlinks referring domains" returned no data for the domain. No numbers are given anywhere in this report. Replicable free checks the parent can run in a live browser: MrKeyword free backlink checker (20 strongest referring domains, no account) and Outrank.so free checker (DataForSEO data).
- **H1 wording for Tameer:** not captured in extraction.
- **Muzdoor outputs:** not captured in extraction (results area empty or not rendered in text).
- **Word counts** are estimates from visible extracted text only; JS-rendered content may add more (especially Muzdoor/Marshmoor).

## Additional competitors surfaced during research (NOT in the assigned five — flag for parent)

Searches for the assigned pages also returned other ranking brick calculators worth auditing: pillarstone.pk/material-calculator/ (Lahore 2026 rates, 4-tab calculator), premiumconverters.com/brick-calculator (22 brick standards, 2D/3D visualizer, formula shown, author byline "Muhammad Salman Saleem"), useotools.com/brick-calculator-pakistan (PWD/IS 2212 methods, "How it was worked out" transparency), builders.easynowpk.com/tools/brick-calculator (city rates, 11.2 bricks/CFT, 1:6 mix), roznamaads.pk/tools/construction-bricks-calculator.html (Urdu guide, PKR 12,000–18,000 per 1,000 Awwal bricks), chtraders.com (bilingual, class-based pricing). Premium Converters and Useotools look particularly strong on formula transparency and should be audited before finalising CEP's calculator.
