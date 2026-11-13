import { Button } from './/Button';
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { ALL_MODULES } from '../Dashboard';
import { BBS_FAQS } from "../../lib/bbsCalc";
import { BEAM_FAQS } from "../../lib/beamDesign";
import { COLUMN_FAQS } from "../../lib/columnDesign";
import { FOOTING_FAQS } from "../../lib/footingCalc";
import { GEOMETRY_FAQS } from "../../lib/geometryCalc";
import { METAL_FAQS } from "../../lib/metalWeightCalc";
import { PILE_FAQS } from "../../lib/pileCalc";
import { PRESTRESS_FAQS } from "../../lib/prestressCalc";
import { RAFT_FAQS } from "../../lib/raftCalc";
import { REINFORCEMENT_FAQS } from "../../lib/reinforcementCalc";
import { RETAINING_FAQS } from "../../lib/retainingWallCalc";
import { STAIRCASE_FAQS } from "../../lib/staircaseCalc";
import { WATER_TANK_FAQS } from "../../lib/waterTankCalc";


export interface FAQItem {
  question: string;
  answer: string;
}

const BOQ_FAQS: FAQItem[] = [
  {
    question: "What is a BOQ?",
    answer: "A Bill of Quantities lists every work item with its unit, quantity and rate, so a contractor can price the job and the client can compare tenders on the same quantities."
  },
  {
    question: "How is quantity measured?",
    answer: "Nos × Length × Width × Depth from the drawings, per IS 1200. Enter the dimensions and the quantity fills itself; type the quantity directly to override it (marked manual)."
  },
  {
    question: "What does the tax line mean?",
    answer: "The tax rate is labelled by region — Sales Tax (PK) 18%, GST (IN) 18%, VAT (UAE) 5%. It is a contract setting, not a universal rate."
  },
  {
    question: "What is a rate-free tender export?",
    answer: "A BOQ with quantities but no rates, issued to bidders so each prices the same quantities in their own words."
  },
];

/**
 * SPECIFIC_FAQS — keyed by REAL tool id (the same id passed as `moduleId`
 * from App.tsx's ModuleWrapper). The old keys ("concrete", "cbr",
 * "topsoil", "area") never matched a real moduleId, so tools only ever
 * got the 5 generic questions. If a tool has no entry here it still gets
 * the generic set; add new entries under the tool's real id.
 * Entries marked `.map(...)` reuse the FAQ const from the tool's
 * src/lib/* engine (no import cycle: engines never import components).
 * "boq" and "boq-templates" render the same BOQGenerator, so they share BOQ_FAQS.
 */
const SPECIFIC_FAQS: Record<string, FAQItem[]> = {
  "topsoil-estimator": [
    {
      question: "What is Bulking (Swell) Factor?",
      answer: "When earth is excavated, it loosens and expands. A factor of 1.25 means the soil requires 25% more volume in the truck than it occupied in the ground."
    },
    {
      question: "How much topsoil per m2?",
      answer: "Volume = area x depth. At 15 cm depth, 1 m2 needs 0.15 m3 net — order about 10% more for settling."
    },
    {
      question: "Bags vs bulk — which is cheaper?",
      answer: "Bulk is almost always cheaper per m3; bags suit small areas and hard access. This calculator compares both when you enter rates."
    },
    {
      question: "What settling allowance should I use?",
      answer: "About 10% for topsoil (it settles after spreading and watering); use 15% for loose, fluffy material."
    },
    {
      question: "How heavy is a cubic metre of topsoil?",
      answer: "About 1,200 kg/m3 for topsoil; compost about 600, sand about 1,600, gravel about 1,700 kg/m3."
    },
    {
      question: "How many truckloads?",
      answer: "Ordered volume divided by truck capacity, rounded up — a 10 m3 truck carries about 12 tonnes of topsoil."
    },
  ],
  "master-rcc": [
    {
      question: "How is RCC concrete quantity calculated?",
      answer: "Concrete volume is length × width × thickness for a slab, cross-section × height for a column, and length × width × depth for a beam — all in metres, giving cubic metres (m³). Staircase concrete is the waist-slab volume plus the triangular step volume. The wet volume is then multiplied by 1.54 to get the dry volume used for material breakdowns."
    },
    {
      question: "Why is wet concrete volume multiplied by 1.54?",
      answer: "Dry volume is about 54% more than wet volume because dry ingredients contain voids that water and compaction fill. So 1 m³ of placed (wet) concrete needs 1.54 m³ of dry materials — cement, sand and aggregate — before the mix is split by ratio. The same rule applies to mortar, but with 1.33 instead of 1.54."
    },
    {
      question: "How much steel is needed per cubic metre of concrete?",
      answer: "As a thumb rule, a slab needs about 1.0% steel by volume (≈ 78 kg/m³), a beam about 1.5% (≈ 118 kg/m³), a column about 2.0% (≈ 157 kg/m³) and a footing about 0.8% (≈ 63 kg/m³). These are planning figures only — the exact steel comes from the bar bending schedule for the member, and the design must come from a structural engineer."
    },
    {
      question: "How is shuttering (formwork) area calculated?",
      answer: "Slab shuttering is the soffit area (length × width) plus the slab edges, 2 × (length + width) × thickness. Beam shuttering is (2 × depth + width) × length — two sides plus the soffit. Column shuttering is the perimeter × height, 2 × (length + width) × height. Footing shuttering is 2 × (length + width) × depth."
    },
    {
      question: "What is effective depth, and how is it calculated?",
      answer: "Effective depth d is the distance from the compression face to the centre of the main steel: d = D − (clear cover + φ/2), where D is the total thickness and φ is the diameter of the main bar. For a 150 mm slab with 20 mm cover and 10 mm bars, d = 150 − (20 + 5) = 125 mm. It is the depth that actually resists bending, so bar cutting lengths must use d, not the full thickness."
    },
    {
      question: "What is the difference between a nominal mix and a design mix?",
      answer: "A nominal mix (for example 1:2:4 for M15 or 1:1.5:3 for M20) uses fixed proportions from IS 456 Table 9 and is allowed only up to grade M20. A design mix is proportioned for a target strength by laboratory trial (IS 10262) and is required for M25 and above, or whenever durability or exposure conditions govern. This estimator uses nominal mixes; use the mix-design calculator for higher grades."
    },
    {
      question: "How much wastage should I add for concrete and steel?",
      answer: "Add 5% wastage to concrete and steel quantities as a default for a normal site, and up to 10% where cutting, handling losses or complex shapes are expected. Wastage is applied to the ordered quantity, not to the theoretical volume — order 5% more bags and bars than the calculation shows."
    },
    {
      question: "How many cement bags are in one cubic metre of concrete?",
      answer: "It depends on the mix. For 1 m³ of M15 (1:2:4), dry volume is 1.54 m³, cement is 1.54 ÷ 7 = 0.22 m³, which is 0.22 ÷ 0.0347 ≈ 6.34 bags — 7 bags to order. For M20 (1:1.5:3) it is 1.54 ÷ 5.5 = 0.28 m³, about 8.07 bags — 9 bags to order with 5% wastage. One 50 kg bag of cement is 0.0347 m³, and bag counts are always rounded up."
    },
  ],
  "calculators": [
    {
      question: "What is the difference between the 1.54 and 1.33 factors?",
      answer: "Use 1.54 for concrete: dry concrete volume is wet volume × 1.54. Use 1.33 for mortar (brickwork joints and plaster): dry mortar volume is wet volume × 1.33. Both account for voids in the dry ingredients, but concrete contains coarse aggregate with larger voids, so its factor is bigger. Mixing them up under- or over-counts cement by about 15%."
    },
    {
      question: "How many cement bags are needed per cubic metre of concrete?",
      answer: "For 1 m³ of M15 (1:2:4), dry volume is 1.54 m³ and cement is 1.54 ÷ 7 = 0.22 m³, which is 0.22 ÷ 0.0347 ≈ 6.34 bags — 7 bags to order. For M20 (1:1.5:3) it is 1.54 ÷ 5.5 = 0.28 m³, about 8.07 bags — 9 bags to order with 5% wastage. One 50 kg bag of cement is 0.0347 m³, and bag counts are always rounded up."
    },
    {
      question: "What is a nominal mix, and when can I use one?",
      answer: "A nominal mix uses fixed cement:sand:aggregate proportions from IS 456 Table 9 — 1:2:4 is M15, 1:1.5:3 is M20, 1:1:2 is M25 as a nominal label. Nominal mixes are permitted only up to M20. For M25 and above, or for severe exposure, you need a design mix proportioned by laboratory trial (IS 10262). This calculator labels its mixes as nominal and links to the mix-design calculator for higher grades."
    },
    {
      question: "How is the water-cement ratio chosen?",
      answer: "The water-cement ratio is governed by both strength and durability: the lower of the two governs. As a guide, keep it between 0.40 and 0.60 for ordinary site-mixed concrete, and never above the maximum for the exposure condition (for example 0.55 for mild exposure, 0.50 for moderate, 0.45 for severe per IS 456). Water is calculated from the unrounded cement mass, not from the rounded-up bag count."
    },
    {
      question: "How much wastage should I add for bricks and mortar?",
      answer: "Add 5% wastage as the default for bricks and mortar on a straightforward wall, and 10% for hand-made kiln bricks, curved or cut work, or walls with many openings. The calculator applies the same percentage you choose to both bricks and mortar — the old fixed 10% is now editable, so enter the figure that matches your site."
    },
    {
      question: "How is steel weight calculated?",
      answer: "Steel weight is diameter squared divided by 162.28, in kg per metre: a 12 mm bar weighs 144 ÷ 162.28 = 0.887 kg/m, a 16 mm bar 1.578 kg/m and a 20 mm bar 2.465 kg/m. Multiply the unit weight by the total bar length in metres. One 12 m stock bar of 12 mm steel therefore weighs about 10.65 kg."
    },
    {
      question: "Do I deduct doors and windows from brick quantity?",
      answer: "Yes — deduct the full area of every opening from the gross wall area before calculating brick volume. A door or window is a hole, not brickwork. (For plastering, different rules apply: openings under 0.5 m² need no deduction, 0.5–3 m² are deducted on one face only, and over 3 m² on both faces plus jambs — but for brick quantity, deduct every opening.)"
    },
    {
      question: "How is plaster quantity calculated?",
      answer: "Plaster area is the wall area minus opening deductions, times the plaster thickness for wet volume, then × 1.33 for dry volume. The dry volume is split by the mix ratio — for 1:4, cement is one fifth and sand four fifths — and cement volume ÷ 0.0347 m³ gives the number of 50 kg bags, rounded up. Standard internal plaster is 12 mm thick at a 1:4 mix."
    },
  ],
  "formwork": [
    {
      question: "How is formwork (shuttering) area calculated?",
      answer: "Column shuttering is the perimeter × height, 2 × (length + width) × height. Beam shuttering is (2 × depth + width) × length — two sides plus the soffit. Slab shuttering is the soffit area (length × width) plus the edges, 2 × (length + width) × thickness. Footing shuttering is 2 × (length + width) × depth. Add up every member, then divide by the repetition factor and add wastage."
    },
    {
      question: "What does the repetition factor do?",
      answer: "Shuttering is reused: the same plywood and props serve several pours. If the repetition factor is 4, the effective area — the area you actually buy material for — is the total area divided by 4, plus wastage. A factor of 1 means every pour needs new material; a factor of 6 is common for standardised column and slab shuttering on a large project."
    },
    {
      question: "How many plywood sheets do I need?",
      answer: "One standard 4'×8' plywood sheet covers 32 sq ft. Divide the effective area (in sq ft) by 32 and round up. If you set a plywood reuse count, the sheets to buy are divided by that count too — sheets are often reused more times than the full shuttering set, because a sheet can be re-cut and re-used after the props and battens are struck."
    },
    {
      question: "How are battens and steel props estimated?",
      answer: "Battens are estimated at 2.5 running feet per sq ft of effective area, and steel props at 1.5 props per m² of effective area. Both are unsourced site rules of thumb, not code values — the calculator labels them as editable assumptions, and you can override the props figure by entering a prop spacing instead (props per m² = 1 ÷ spacing²)."
    },
    {
      question: "What consumables does formwork need?",
      answer: "Nails at 0.075 kg/m² of formwork area, binding wire at 0.075 kg/m², and shuttering oil at 0.065 L/m². Beam bottom planks run 1 Rft per Rft of beam length, and centering plates are counted as one per 4 ft of slab or footing edge perimeter. These are planning rates — check them against your site's actual consumption on the first pour."
    },
    {
      question: "What is the thumb-rule cross-check?",
      answer: "A rough site check per covered sq ft of slab soffit: 0.02 plywood sheets, 0.04 Rft of battens, 0.02 kg of nails, 0.24 Rft of beam bottom planks, 0.16 ballies, 0.08 clamps and 0.006 L of oil. If the area-based calculation and the thumb rule disagree wildly, re-check your dimensions and repetition factor before ordering."
    },
    {
      question: "How much wastage should I allow for formwork?",
      answer: "Allow 5% wastage as the default — cutting, damaged sheets and edge trimming. Use up to 10–15% for irregular shapes, many openings, or first-time shuttering crews. Wastage is applied to the effective area (after the repetition factor), not to the total area."
    },
    {
      question: "When can formwork be removed (de-shuttering)?",
      answer: "Striking times depend on the member and the concrete strength reached, not on a fixed number of days — follow IS 456 and your structural engineer's instruction. As a guide, vertical formwork (columns, beam sides) is typically struck after 16–24 hours, slab soffits after about 7 days, and beam soffits and props after 14–21 days, longer for long spans. Never strike props early to reuse them on the next floor."
    },
  ],
  "aggregate-tests": [
    {
      question: "What is the Aggregate Impact Value (AIV)?",
      answer: "AIV = W3 ÷ (W2 − W1) × 100, where W3 is the weight passing the 2.36 mm sieve after 15 blows in the impact testing machine (IS 2386 Part IV). Up to 10% is exceptionally strong, up to 20% strong, up to 30% satisfactory for road surfacing, up to 45% satisfactory for non-wearing concrete — above 45% the aggregate is unsuitable for concrete."
    },
    {
      question: "What is the Aggregate Crushing Value (ACV)?",
      answer: "ACV uses the same formula as AIV — W3 ÷ (W2 − W1) × 100 — but W3 is the weight passing 2.36 mm after a 40-tonne crushing load instead of impact blows (IS 2386 Part IV). Up to 30% is suitable for a wearing course, up to 45% for a base course, and above 45% it is unsuitable."
    },
    {
      question: "How is the Los Angeles abrasion value calculated?",
      answer: "LA = loss ÷ original weight × 100, where the loss is the material worn away in the rotating drum with steel balls (IS 2386 Part IV). The loss is either the weight passing the 1.70 mm sieve, or the original weight minus the weight retained on 1.70 mm — pick the right mode in the calculator, because entering a retained weight as 'passing' silently reads as about 76% loss and a false UNSUITABLE verdict."
    },
    {
      question: "Why does the calculator ask for two trials?",
      answer: "IS 2386 requires the mean of two trials to be reported for impact, crushing, abrasion and water absorption. A single trial can be skewed by one weak particle or a sieving error. Enter both trials and the calculator reports the mean; the second trial is optional, but a report based on one trial should say so."
    },
    {
      question: "What is water absorption, and why does it matter?",
      answer: "Water absorption = (SSD weight − oven-dry weight) ÷ oven-dry weight × 100 (IS 2386 Part III). It measures how porous the aggregate is. Up to 2% is good quality; 2–5% is acceptable only with engineer approval for non-structural use; above 5% the aggregate is highly porous and flagged. Porous aggregate drinks mix water, so it changes the effective water-cement ratio and the workability of the concrete."
    },
    {
      question: "What are bulk and apparent specific gravity?",
      answer: "Bulk specific gravity = oven-dry weight ÷ (SSD weight − weight in water); apparent specific gravity = oven-dry weight ÷ (oven-dry weight − weight in water). The normal range for concrete aggregate is 2.5–3.0. A value outside that range should be flagged and re-checked — it usually means a weighing or SSD-surface-drying error, or an unusual rock type."
    },
    {
      question: "How much aggregate do I need for a test sample?",
      answer: "About 350 g of aggregate passing 12.5 mm and retained on 10 mm for the impact and crushing tests (IS 2386 Part IV). The LA abrasion test uses a graded sample, usually 5,000 g in total. Water absorption needs about 2 kg of aggregate, soaked for 24 hours (IS 2386 Part III)."
    },
    {
      question: "What does 'suitable for wearing course' mean?",
      answer: "It is the layer mapping from the test result: the wearing course is the top road layer, so it needs the strongest aggregate (AIV ≤ 20–30%, ACV ≤ 30%, LA ≤ 30%). Weaker aggregate that fails the wearing-course limit may still be suitable for a base course or for non-wearing concrete — the calculator lists every layer each result qualifies for, instead of a bare pass/fail."
    },
  ],
  "pavement-mix": [
    {
      question: "What is a blended gradation?",
      answer: "A blended gradation is the combined % passing for each sieve when several stockpiles are mixed: blended = (proportion of A × A's passing) + (proportion of B × B's passing) + (proportion of C × C's passing) + (filler × filler's passing). The blend must fall inside the specification envelope (lower and upper bound) for every sieve that has a band."
    },
    {
      question: "What are the MoRTH envelopes used here?",
      answer: "GSB Grade I follows MoRTH Table 400-1; DBM Grades 1 and 2 follow MoRTH Table 500-10; SMA follows MoRTH Clause 515; Bituminous Concrete Grades 1 and 2 follow MoRTH Table 500-17. Only the sieves this tool tracks are shown — the full MoRTH tables also list intermediate sieves (13.2, 1.18, 0.6 and 0.15 mm) that are not part of the blend."
    },
    {
      question: "What does the Auto-blend button do?",
      answer: "It runs a grid search in 5% steps over the A/B/C proportions (with your filler fixed) and picks the combination whose blended curve is closest to the middle of every specification band — the lowest RMSE versus the band mid. It is a starting point for the laboratory job mix formula, not a substitute for trial mixes and Marshall testing."
    },
    {
      question: "Why does a sieve show '—' instead of PASS or FAIL?",
      answer: "A dash means that sieve has no specification band for the chosen mix — for example, the 75 mm sieve has no band in DBM Grade 1. No band means no verdict: the tool never defaults to 'pass' when there is nothing to check against. Only sieves with a lower or upper bound can pass or fail."
    },
    {
      question: "What is RMSE versus the band mid?",
      answer: "It is the root-mean-square distance between your blended curve and the middle of each specification band, in percentage points. A lower RMSE means the curve sits closer to the centre of every band, leaving the most room for production variation. Two blends can both pass while one has a much better (lower) RMSE."
    },
    {
      question: "What is a Job Mix Formula (JMF)?",
      answer: "The JMF is the approved target gradation for production — your blended curve, once the laboratory has verified it with trial mixes. MoRTH allows the production gradation to deviate from the JMF target by a tolerance per sieve: ±8 points at 26.5 mm, ±7 at 19 mm, ±6 at 9.5 mm, ±5 at 4.75 mm, ±4 at 2.36 mm, and ±2 at 0.3 and 0.075 mm. The JMF table shows your target and its allowed range."
    },
    {
      question: "How much bitumen does the mix need?",
      answer: "The MoRTH minimum is 4.5% of the mix for DBM, 5.8% for SMA, and 5.0% for Bituminous Concrete (typical 5.2% for Grading 1 and 5.4% for Grading 2). The exact content is fixed by Marshall mix design in the laboratory, not by this calculator — enter the laboratory figure to get the bitumen quantity for your paved area. GSB is unbound, so no bitumen applies."
    },
    {
      question: "How are mix quantities calculated for a road stretch?",
      answer: "Total mix = area × layer thickness × 2.35 t/m³ (compacted density). That total is split by your proportions into aggregate tonnes per bin, and by the bitumen content into kilograms of bitumen. Enter the paved area and the layer thickness and the calculator shows each quantity — check the density against your laboratory's compacted density if it differs."
    },
  ],
  "direct-shear": [
    {
      question: "What if cohesion comes out negative?",
      answer: "Theoretically, soil cannot have negative cohesion. We bound the bottom limit of 'c' to 0 if the linear fit forces a negative intercept."
    },
    {
      question: "What does R² tell me about the shear envelope?",
      answer: "R² measures how well the straight Mohr–Coulomb line fits your test points. R² ≥ 0.95 is the usual gate — below that, repeat the test; the fitted c and φ are not reliable."
    },
    {
      question: "Is the bearing capacity in the PDF a design value?",
      answer: "No. It is a labelled Terzaghi estimate (γ = 18 kN/m³, Df = 1.0 m, B = 1.5 m, FoS = 3) using φ-derived Nc/Nq/Nγ. Foundation design needs a geotechnical engineer and site-specific data."
    },
  ],
  "precast-wall": [
    {
      question: "Why do we add 1 to the post count?",
      answer: "A linear wall segment requires a starting post and an ending post. For n bays, you need n+1 posts. If it's a closed loop enclosure, n posts = n bays."
    },
    {
      question: "What is a precast boundary wall?",
      answer: "A precast boundary wall is made off-site in a factory: concrete panels are cast in moulds and then slotted between precast posts on site. The posts sit in concrete footings, and the panels stack to the wall height. Because the panels are factory-made, the finish is consistent and the site work is mostly assembly — a 30 m wall can go up in a day or two once the footings have cured."
    },
    {
      question: "How many posts does a precast wall need?",
      answer: "The number of spans is the effective wall length divided by the panel width, rounded up. For an open run, posts are spans plus one — one at each end. For a closed loop, such as a rectangular plot, posts equal spans, because the last post is also the first. A 30 m open wall with 2 m panels has 15 spans and 16 posts; a closed 140 m rectangle has 70 spans and 70 posts."
    },
    {
      question: "How many panels are needed for a precast wall?",
      answer: "Panels per span are the wall height divided by the panel height, rounded up, and total panels are panels per span times the number of spans. A 2.4 m high wall with 0.3 m high panels needs 8 panels per span. A 30 m wall with 2 m panels therefore needs 120 panels, and 126 to order at 5% wastage. If the height is not a multiple of the panel height, the top panel is cut — the calculator warns you."
    },
    {
      question: "What footing does a precast wall need?",
      answer: "Each post normally sits in an isolated pad footing — for example 0.45 × 0.45 m in plan and 0.6 m deep. A strip footing runs the full wall length and is used where the soil is poor or the wall is tall. A PCC bed is a thin blinding layer under the pads. The footing concrete is wet volume × 1.54 for dry volume, split 1:2:4 into cement, sand and aggregate, with cement bags rounded up."
    },
    {
      question: "Is a precast wall cheaper than a brick boundary wall?",
      answer: "It depends on the length and the height. Precast is usually cheaper and much faster for long, straight runs, because the factory panels replace bricklaying, plastering and curing time. Brick is more flexible for short runs, curves and walls with many gates or level changes, and it is easier to repair in small sections. Compare the two with the same length and height — this calculator gives the precast side of that comparison."
    },
    {
      question: "How tall can a precast boundary wall be?",
      answer: "Most residential precast walls are 1.8 to 2.4 m high. Above 3 m the wind load and the footing size grow quickly, and the posts need a structural check — the calculator warns you above 3 m. Taller walls also need deeper footings and sometimes a reinforced strip rather than isolated pads."
    },
    {
      question: "How is the cost of a precast wall worked out?",
      answer: "Cost is posts × post rate, plus order panels × panel rate, plus footing concrete × concrete rate, plus labour per running metre, plus transport. For a 30 m × 2.4 m open wall with 2.0 × 0.3 m panels, 1:2:4 footings and labour at Rs 150 per metre, the total is about Rs 152,628 — about Rs 5,088 per running metre and Rs 2,120 per square metre. Post, panel and labour rates vary by supplier and city, so treat them as indicative and confirm with a quote."
    },
    {
      question: "Do I need a gate opening in a precast wall?",
      answer: "Yes — deduct the gate width from the wall length before calculating spans, or the panel count will be too high. A 3 m gate on a 30 m wall leaves 27 m of wall, which is 14 spans instead of 15. The calculator has a gate deduction field for exactly this, and it also warns you if the panels you order cover more length than the wall needs."
    },
    {
      question: "How many precast panels are needed for a 100 ft wall?",
      answer: "Divide the wall length by the panel width to get spans, then multiply by the panels per span (wall height divided by panel height, rounded up). A 100 ft wall with 6 ft panel spacing and 8 ft height needs 17 spans and 8 panels per span, or 136 panels before wastage. Add 5% for breakage and cutting."
    },
    {
      question: "What size is a standard precast panel?",
      answer: "A common Pakistan/India precast panel is 2,130 mm long, 300 mm high and 50 mm thick, with 150 × 150 mm prestressed H-columns. This calculator defaults to 2.0 m spacing and 0.3 m panel height, and lets you change both."
    },
    {
      question: "How much wastage should I add for precast panels?",
      answer: "Add 5% for panels and posts on a normal site — transport and handling breakage, plus cutting at ends and corners. Use 10% if the site is rough, access is poor, or the wall has many returns and gates."
    },
    {
      question: "Can I use this calculator for a closed rectangular plot?",
      answer: "Yes — choose the closed-rectangle layout and enter the plot perimeter as the wall length. The calculator then uses spans posts instead of spans + 1, and deducts any gate length you enter."
    },
  ],
  "cbr-test": [
    {
      question: "What if the curve is concave upwards initially?",
      answer: "This happens due to surface irregularities. The curve must be corrected by drawing a tangent at the point of greatest slope to intersect the load axis."
    },
    {
      question: "Why is 5.0mm CBR sometimes higher?",
      answer: "Usually the 2.5mm CBR is higher. If 5.0mm is higher, the test should be repeated. If the second test also shows 5.0mm > 2.5mm, the 5.0mm value is accepted."
    },
  ],
  "area-space-calculator": [
    {
      question: "How is an irregular plot calculated?",
      answer: "Irregular land is measured by breaking the polygon into adjacent triangles (Geometric Triangulation). By measuring the 4 boundaries and one diagonal cross-section, Heron's formula is applied to each triangle for perfect accuracy."
    },
    {
      question: "What is RERA Carpet Area?",
      answer: "According to the Real Estate (Regulation and Development) Act (RERA), the carpet area is the net usable floor area of an apartment, excluding external walls, balconies, terraces, and service shafts, but including the area covered by internal partition walls."
    },
    {
      question: "How does the Roof Pitch Multiplier work?",
      answer: "A sloped roof has a larger surface area than its horizontal footprint. The calculator divides the horizontal area (plus overhangs) by the cosine of the pitch angle to give the true sloped area required for roofing materials."
    },
    {
      question: "How do I measure an irregular plot?",
      answer: "Measure the four boundaries and one diagonal, then split the plot into two triangles and apply Heron's formula to each. The diagonal must be shorter than the sum of each adjacent pair of sides and longer than their difference — otherwise the triangle is impossible and the calculator will tell you."
    },
    {
      question: "What is the difference between RERA carpet area and built-up area?",
      answer: "RERA carpet area is the net usable floor area including internal partition walls. Built-up area adds the external walls and balcony. Super built-up area adds a share of common areas through a loading factor. A 100 m² carpet flat with 10% internal walls, 5% external walls, a 10 m² balcony and 20% common area becomes 110 m² RERA carpet, 115 m² plinth, 125 m² built-up and 150 m² super built-up."
    },
    {
      question: "How are doors and windows deducted for plastering (IS 1200)?",
      answer: "Openings under 0.5 m² are not deducted. Openings from 0.5 to 3 m² are deducted on one face only — the full opening area, not half of it. Openings over 3 m² are deducted on both faces, and the jambs, soffits and sills are added back. The thresholds are in square metres and are converted when you switch to feet."
    },
    {
      question: "How is roof pitch area calculated?",
      answer: "True roof area = (floor area + perimeter × overhang) ÷ cos(pitch angle). A 150 m² floor with a 50 m perimeter, 0.6 m overhang and 30° pitch has a horizontal area of 180 m² and a true sloped area of about 207.85 m² — the pitch multiplier is 1 ÷ cos(30°) = 1.155."
    },
    {
      question: "How do I convert square feet to marla and kanal?",
      answer: "One marla is 272.25 sq ft (25.293 m²) and one kanal is 20 marla (5,445 sq ft). Divide square feet by 272.25 for marla, or by 5,445 for kanal. This calculator shows every result in m², sq ft, sq yd, marla and kanal."
    },
    {
      question: "Can I send the result to my BOQ?",
      answer: "Yes. The Generate BOQ button adds the computed area to your BOQ at the current tab's quantity, so the plaster, paint or flooring area flows straight into the estimate."
    },
  ],
  "house": [
    {
      question: "What engineering formulas does this tool use?",
      answer: "It strictly uses internationally recognized civil engineering formulas relevant to the quantity estimation field, compliant with standards like NBC Pakistan 2021."
    },
    {
      question: "How accurate is the material estimation?",
      answer: "Our engine uses standard volume conversions (e.g., 1.54 for concrete dry volume) to compute exact material breakdowns matching professional BOQs."
    },
    {
      question: "Does it support different Plot Units like Marla and Sq.Yd?",
      answer: "Yes, the calculation automatically scales whether you input your plot in Marlas, Square Yards, or Square Feet."
    },
    {
      question: "Can I adjust the market rates?",
      answer: "Absolutely. Click on 'View Market Rates' to customize the cost per unit for cement, steel, bricks, and labor."
    },
  ],
  "aggregate-blending": [
    {
      question: "Why blend aggregates?",
      answer: "No single stockpile usually meets a grading envelope; blending two or more stockpiles fills the gaps and improves packing and workability."
    },
    {
      question: "How does trial-and-error blending work?",
      answer: "Pick proportions, check the blended % passing against the envelope on the critical sieves, and adjust the stockpile that controls the failing sieve."
    },
    {
      question: "What are the critical sieves?",
      answer: "The sieves where the envelope is tightest — usually the top size, the 4.75 mm split and the 0.075 mm fines limit."
    },
    {
      question: "What is blended specific gravity?",
      answer: "G_blend = 100 / sum(P_i / G_i) — the weighted harmonic mean of the stockpile Gs values."
    },
    {
      question: "What is the 0.45-power chart?",
      answer: "Plotting % passing against (size/max size)^0.45 gives the maximum-density line; a blend close to it packs best."
    },
    {
      question: "What if no blend can pass?",
      answer: "The optimiser reports the least-violating blend — then change stockpiles, crush or screen a fraction, or relax the target grading."
    },
  ],
  "ai": [
    {
      question: "Is this an AI chatbot?",
      answer: "No. It is a rule-based local estimator: it reads the plot size, floors, city and finish from your sentence with fixed patterns, then runs the same quantity and cost formulas as the other calculators. No model and no API key are involved."
    },
    {
      question: "What should I type?",
      answer: "Include a plot size and a city, for example '5 marla house in Lahore, G+1, standard finish'. Without a plot size it cannot estimate."
    },
    {
      question: "How accurate is it?",
      answer: "It is a first-pass budget figure from thumb-rule quantities and the dated rate table. Confirm quantities from drawings and rates from your contractor before ordering."
    },
  ],
  "anti-termite": [
    {
      question: "How much chemical is needed per square metre?",
      answer: "For soil under floors and plinth fill, IS 6313-2:2022 prescribes 5 litres of diluted emulsion per square metre. Trench bottoms are also 5 L/m² of trench-bottom area, trench sides are 7.5 litres per linear metre of trench, and RCC vertical surfaces in contact with soil are 7.5 L/m²."
    },
    {
      question: "What is the 7.5 litres per linear metre rule?",
      answer: "The trench-sides dose in IS 6313-2:2022 is 7.5 litres of diluted emulsion per linear metre of trench (to 30 cm depth) — not per square metre of wall area. Multiplying perimeter × depth × 7.5 under-doses by about 50% and is a safety-critical error this calculator does not make."
    },
    {
      question: "Chlorpyrifos vs Bifenthrin vs Imidacloprid?",
      answer: "All three are used for soil treatment at label dilutions (Chlorpyrifos 20% EC and Bifenthrin 2.5% EC at 1:19; Imidacloprid 30.5% SC at about 1:475). Chlorpyrifos is restricted or banned in several jurisdictions and its registration status in Punjab, Pakistan is unverified — this calculator does not recommend a chemical. Use only a product registered for soil treatment in your province/state and follow its label."
    },
    {
      question: "How is anti-termite treatment done in stages?",
      answer: "In stages: trench bottom (5 L/m²), trench sides (7.5 L per linear metre), soil under the floor and plinth fill (5 L/m²), optionally an external periphery apron (7.5 L/m) and RCC vertical surfaces (7.5 L/m²). This calculator breaks every stage out so you can check each one."
    },
    {
      question: "What does anti-termite treatment cost per sq ft?",
      answer: "It depends on the chemical, its price per litre, pack size and labour. Enter your concentrate price per litre and labour rate per m² and this calculator gives a line-item cost — never priced at zero when a rate is unknown."
    },
    {
      question: "Is post-construction treatment different?",
      answer: "Yes. Post-construction treatment drills and injects chemical through the floor and around the plinth instead of treating open trenches and soil before concreting. Quantities are site-specific — get a licensed pest-control operator to survey the building."
    },
  ],
  "bbs-generator": BBS_FAQS.map((f) => ({ question: f.q, answer: f.a })),
  "beam-design": BEAM_FAQS.map((f) => ({ question: f.q, answer: f.a })),
  "boq": BOQ_FAQS,
  "boq-templates": BOQ_FAQS,
  "chainage": [
    {
      question: "What is chainage notation?",
      answer: "Chainage is distance along a road, written km+m — e.g. 1+200 means 1200 m from the start."
    },
    {
      question: "Trapezoidal vs Simpson's rule?",
      answer: "Trapezoidal uses the average of two end areas; Simpson's 1/3 rule uses the mid area too and is more accurate for curved ground — but it needs equal spacing and an odd station count."
    },
    {
      question: "What is a mass-haul curve?",
      answer: "Cumulative cut-minus-fill plotted against chainage; its peaks and troughs show where material moves and where borrow or spoil is needed."
    },
    {
      question: "What are swell and shrinkage?",
      answer: "Excavated soil bulks up (swell, about 15%) and compacted fill shrinks (about 10%) — volumes must be corrected before balancing cut and fill."
    },
    {
      question: "What is free haul?",
      answer: "The distance material can be hauled within the excavation rate; beyond it, overhaul is charged per m3-km."
    },
  ],
  "column-design": COLUMN_FAQS.map((f) => ({ question: f.q, answer: f.a })),
  "cost-summary": [
    {
      question: "What is overhead & profit?",
      answer: "The contractor's margin for site overheads (supervision, transport, tools) plus profit — typically 15% of the subtotal, adjustable 5–25%."
    },
    {
      question: "What contingency % should I use?",
      answer: "5% for a normal house (2–10% range). Raise it for old buildings, difficult soil or monsoon work."
    },
    {
      question: "How is cost per sqft calculated?",
      answer: "Grand total (subtotal + overhead + contingency + tax) divided by the covered area."
    },
    {
      question: "Why are the default amounts labelled 'example'?",
      answer: "They were hardcoded demo figures, not computed from your inputs. Enter your own quantities × rates — or import quantities from the Material Takeoff sheet."
    },
  ],
  "door-window-schedule": [
    {
      question: "What are the standard door sizes for a main door, bedroom and bathroom?",
      answer: "Typical leaf sizes are: main door 1,067 × 2,134 mm (3.5 × 7 ft), bedroom door 914 × 2,134 mm (3 × 7 ft), bathroom door 686 × 2,134 mm (2.25 × 7 ft), and double doors 1,524 × 2,134 mm. These are typical sizes — always confirm against the architectural drawing."
    },
    {
      question: "What is the difference between leaf size, frame size and masonry opening?",
      answer: "The leaf is the moving shutter. The frame-outer size is the leaf plus the frame section on each side (and a head for doors). The masonry opening is the frame-outer size plus about 10 mm clearance per side so the frame can be fixed and packed. Lintel length is the masonry opening width plus 150 mm bearing on each side."
    },
    {
      question: "How long should a lintel be over a door or window?",
      answer: "Lintel length = masonry opening width + 300 mm (150 mm bearing on each side). For a 1.2 m door the masonry opening is about 1.42 m, so the lintel is about 1.72 m long. The lintel section used here is 150 mm deep × wall thickness."
    },
    {
      question: "What sill heights are used for windows in different rooms?",
      answer: "Typical sill heights are: living and bedroom 750–900 mm, kitchen 1,050–1,200 mm (above the counter), bathroom 1,500 mm (for privacy). Ventilators sit higher, around 1,800 mm. Confirm on the drawing — sill height affects light, privacy and furniture placement."
    },
    {
      question: "How much hardware does each door need?",
      answer: "One hardware set per shutter: typically 3 hinges, 1 lockset with handles, 1 tower bolt and 1 door stopper for a single door. Sliding windows need rollers and a latch per shutter. This schedule counts one set per unit quantity."
    },
    {
      question: "What does a door and window schedule contain?",
      answer: "A schedule lists every door and window by mark — D1, D2, W1 — with its room, leaf size, frame-outer size, masonry opening, clear width, sill height, lintel length, frame length, glass area, hardware sets and cost. It is the document the carpenter, the mason and the supplier all work from."
    },
    {
      question: "Can I export the schedule?",
      answer: "Yes. Export a CSV for your BOQ or spreadsheet, download a PDF for the site, or copy and share the summary. The CSV keeps per-unit area and total area in separate columns so the two are never confused."
    },
    {
      question: "Are the sizes standard or custom?",
      answer: "Both. The presets are standard leaf sizes — main door 1,067 × 2,134 mm, bedroom 914 × 2,134 mm, bathroom 686 × 2,134 mm — but every row is editable, and you can add custom rows in metres, feet or millimetres."
    },
  ],
  "earthworks": [
    {
      question: "Average-end-area vs prismoidal?",
      answer: "Average-end-area V = L x (A1+A2)/2 is simple but approximate; prismoidal V = L/6 x (A1+4Am+A2) needs a measured mid area and is exact for a prismoid."
    },
    {
      question: "What is swell vs shrinkage?",
      answer: "Loose excavated soil occupies more volume (swell); compacted fill occupies less (shrinkage). Both are applied to the solid volume."
    },
    {
      question: "Grid vs chainage method?",
      answer: "Grid (borrow-pit) suits area levelling from a level grid; chainage suits linear works like roads and canals."
    },
    {
      question: "How is trench backfill calculated?",
      answer: "Backfill = trench volume minus pipe volume minus bedding volume; spoil is the excavated volume bulked by the swell factor."
    },
    {
      question: "Is the slope tool a Bishop analysis?",
      answer: "No — it is an infinite-slope screening calculation. Real slope design needs slip-circle analysis in dedicated software."
    },
  ],
  "geotechnical": [
    {
      question: "What is water content of soil?",
      answer: "Water content w = (wet mass minus dry mass) / dry mass x 100, from oven-dry weights (IS 2720 Pt 2)."
    },
    {
      question: "How is specific gravity measured?",
      answer: "With a pycnometer: Gs = (W2-W1) / [(W2-W1) - (W3-W4)] using dry soil and water weights."
    },
    {
      question: "Liquid limit vs plastic limit?",
      answer: "LL is the water content at 25 blows in the Casagrande cup; PL is the water content at which a 3 mm thread crumbles. PI = LL - PL."
    },
    {
      question: "When is a CBR of 5% enough?",
      answer: "IRC:37 needs about 5% CBR for subgrade under heavy traffic; lighter traffic can accept less — always check the pavement design."
    },
    {
      question: "Soaked vs unsoaked CBR?",
      answer: "Soaked CBR (4 days soaking) is the design value for pavements; unsoaked CBR is a quicker index test."
    },
    {
      question: "What is Proctor OMC?",
      answer: "The optimum moisture content at which a soil reaches its maximum dry density under a given compactive effort."
    },
  ],
  "gradient-calculator": [
    {
      question: "What is gradient vs camber?",
      answer: "Gradient is the longitudinal slope along the road; camber (crossfall) is the transverse slope that drains water to the edges."
    },
    {
      question: "What does the K-value mean?",
      answer: "K = curve length divided by grade change (m per %). A bigger K is a flatter, longer curve with better sight distance."
    },
    {
      question: "Crest vs sag curve?",
      answer: "A crest curve is a summit (sight distance governs); a sag curve is a valley (headlight distance and comfort govern)."
    },
    {
      question: "What is stopping sight distance?",
      answer: "The distance a driver needs to see, react and stop — it grows with design speed and sets the minimum crest curve length."
    },
    {
      question: "What is the minimum curve length?",
      answer: "At least the length from the K-value and SSD check; sag curves also need a comfort check (L >= A x V squared / 46.5)."
    },
  ],
  "infra-mep-engine": [
    {
      question: "Where did the earthworks and roads tabs go?",
      answer: "They were removed from this tool because they duplicated the dedicated Earthworks and Road calculators. This engine now covers only MEP and green energy — solar, solar water heating, AC and rainwater — using the same shared engines as the standalone tools, so the numbers agree everywhere."
    },
    {
      question: "Why do the numbers differ from the old version of this tool?",
      answer: "The old version re-implemented every sub-calculator a third time with different constants: solar used 4.5 peak sun hours with no battery depth-of-discharge, AC used 337 BTU/m² (about 35–50% oversized vs the ENERGY STAR chart), and rainwater used 5% of yield with no demand input. All four cards now call the shared engines, so they match the standalone solar, water-heater, AC and rainwater tools exactly."
    },
    {
      question: "How do I add a result to the BOQ?",
      answer: "Use the 'Add to BOQ' button on any card. Nothing is added automatically."
    },
  ],
  "interiors-finishes": [
    {
      question: "How much cement and sand are needed for 12 mm plaster per 100 m²?",
      answer: "At 12 mm and a 1:4 mix, 100 m² of plaster is 1.2 m³ wet, about 1.6 m³ dry (× 1.33). That splits into 0.32 m³ of cement — 10 bags of 50 kg — and 1.28 m³ of sand (about 45 cft). Add 5% wastage and 10% more for uneven walls."
    },
    {
      question: "Do I deduct doors and windows from plastering — what are the IS 1200 rules?",
      answer: "Yes, with tiers: openings under 0.5 m² are not deducted; openings from 0.5 to 3 m² are deducted on one face only; openings over 3 m² are deducted on both faces, and the jambs, soffits and sills are added back. This calculator applies those rules per opening."
    },
    {
      question: "How many litres of paint are needed for a 12×10 ft room with 2 coats?",
      answer: "A 12 × 10 ft room, 10 ft high, has about 41 m² of wall plus 11 m² of ceiling — about 52 m² paintable. At 11 m² per litre per coat and 2 coats, that is about 10 litres, plus primer at about 8 litres. Add 10% wastage on porous or new plaster."
    },
    {
      question: "How many tiles and boxes are needed for a room, including skirting?",
      answer: "Divide the floor area by the effective tile area (tile size plus grout gap), add wastage, and count skirting strips separately — skirting is cut strips, not whole floor tiles. A 20 m² floor with 600 × 600 mm tiles at 7% wastage needs about 59 floor tiles plus 6 skirting tiles, or 17 boxes of 4."
    },
    {
      question: "What wastage should I add for diagonal tile laying?",
      answer: "Diagonal laying wastes 14%, herringbone 16%, brick-bond 10% and straight laying 7%. The extra waste comes from the triangular cuts at every edge. Buy the boxes the calculator shows — you cannot buy part of a box."
    },
    {
      question: "What is the difference between internal and external plaster thickness?",
      answer: "Internal plaster is usually 12 mm thick at a 1:4 mix; external plaster is usually 20 mm at 1:4 or 1:6, because it must resist rain and weather. Ceilings are plastered at 6–10 mm. Thicker plaster uses proportionally more cement and sand."
    },
    {
      question: "How accurate is this finishes calculator?",
      answer: "The quantities follow standard quantity-surveying formulas: IS 1200 opening deductions for plaster, coverage-based paint maths, effective tile area with pattern wastage, and dry-mortar conversion at 1.33. The quantities are reliable if your measurements are; the rates are editable starting points — confirm them with your supplier before ordering."
    },
    {
      question: "Can I use feet instead of metres?",
      answer: "Yes. Switch the unit toggle and every length, area and rate converts — the values are converted, not reset, so nothing you entered is lost."
    },
    {
      question: "Which rooms does this calculator cover?",
      answer: "Any single room: bedroom, living room, kitchen, bathroom or a whole floor entered as one room. For a whole house, use the Master Finishes Workspace, which handles all seven finishing trades together."
    },
    {
      question: "Can I export the result to my BOQ?",
      answer: "Yes. Each tab you open can be exported to the BOQ at your rates, and you can copy, print or download a PDF of the full result."
    },
    {
      question: "Why is the brick cost shown per 1,000 bricks?",
      answer: "Bricks are sold per 1,000 in Pakistan and India. The calculator divides the per-1,000 rate by 1,000 before multiplying by the brick count, so the cost is correct — an earlier version of this tool multiplied the full per-1,000 rate by every brick and overstated the cost a thousand times."
    },
  ],
  "isolated-footing": FOOTING_FAQS.map((f) => ({ question: f.q, answer: f.a })),
  "master-finishes": [
    {
      question: "How many bricks are needed for a 10 × 10 ft wall?",
      answer: "For a 10 × 10 ft wall, 230 mm thick, built with standard 9 × 4.5 × 3 inch bricks and a 10 mm mortar joint in 1:4 mortar with 5% wastage, you need 873 bricks before wastage and 917 bricks to order, plus 5 bags of cement and about 21.8 cft of sand. The brick count comes from dividing the wall volume by the volume of one brick with its mortar joint."
    },
    {
      question: "How is mortar calculated for brickwork?",
      answer: "Wet mortar is the wall volume minus the volume of the bricks themselves. Dry mortar is wet mortar × 1.33, to allow for voids and shrinkage. Cement is dry mortar ÷ (1 + sand parts) for the mix ratio, and bags are cement volume ÷ 0.0347, rounded up. Mortar is always worked out from the brick count before wastage is added — adding wastage bricks first inflates the mortar."
    },
    {
      question: "How are doors and windows deducted for plastering?",
      answer: "Under IS 1200, openings under 0.5 m² are not deducted at all. Openings from 0.5 to 3 m² are deducted on one face only, at the full opening area. Openings over 3 m² are deducted on both faces, and the jambs, soffits and sills are added back. This calculator applies the rule opening by opening, so a room with a door and a window is deducted correctly on each face."
    },
    {
      question: "How much paint covers one litre?",
      answer: "Coverage depends on the paint and the surface. Typical figures are economy emulsion about 9.5 m² per litre per coat, standard emulsion about 11 m² per litre, premium about 12.5 m² per litre, and exterior weather-shield about 9 m² per litre. Rough or uneven plaster absorbs more paint, so the calculator adds a wastage allowance. One coat of primer is applied at roughly 9 m² per litre, and wall putty is estimated at about 1.1 m² per kg."
    },
    {
      question: "How many tiles do I need for a room, including wastage?",
      answer: "Divide the floor area by the effective tile area — tile length plus grout joint, times tile width plus grout joint — then add pattern wastage: 7% for straight laying, 10% for brick-bond, 14% for diagonal and 16% for herringbone. Skirting tiles are counted separately as cut strips, never folded into the floor area. For a 5 × 4 m room with 600 × 600 mm tiles laid straight at 10% wastage, the result is 61 floor tiles plus 6 skirting tiles, or 17 boxes of 4."
    },
    {
      question: "Does countertop thickness matter in the calculation?",
      answer: "Yes. The slab volume is the gross countertop area multiplied by the thickness, so a 20 mm slab and a 30 mm slab need different amounts of stone. The calculator also deducts the sink cut-out (0.6 × 0.45 m) and the hob cut-out (0.6 × 0.5 m), adds skirting along the wall edge, and works out the edge-polish length from the exposed perimeter."
    },
    {
      question: "Can formwork plywood be reused, and does reuse change the sheet count?",
      answer: "Formwork plywood can typically be reused 4 to 8 times depending on the grade and care. Reuse divides the number of sheets you need to buy for formwork — but only for formwork. Fixed surfaces such as panelling and furniture are not divided by the reuse factor: a panelling job that needs 19 sheets needs 19 sheets however many times the formwork ply is reused."
    },
    {
      question: "What is the difference between carpet, built-up and super built-up area?",
      answer: "Carpet area is the net usable floor area inside the walls. Built-up area adds the wall thickness. Super built-up area adds a share of common areas — lobbies, stairs and lifts — through a loading factor, typically 20–30%. A 20 m² carpet room with 230 mm walls is about 23.5 m² built-up, and about 28.2 m² super built-up at a 20% loading factor. The loading factor is an assumption, so the calculator labels it as one."
    },
  ],
  "master-quantity": [
    {
      question: "How do the 23 calculators link together?",
      answer: "Each calculator's outputs (e.g. excavation volume) feed the next stage (backfill, footing) in dependency order, computed in one pass — so changing an early input updates the whole chain."
    },
    {
      question: "Does Imperial mode give the same quantities as SI?",
      answer: "Yes. Imperial inputs are converted to metric before computing and results are converted back, so a 10×10 ft wall gives the same brick count as a 3.048×3.048 m wall."
    },
    {
      question: "How are plaster openings deducted?",
      answer: "By the IS 1200 rule: openings under 0.5 m² are not deducted, 0.5–3 m² deduct one face, over 3 m² deduct both faces (plus jambs, soffits and sills)."
    },
    {
      question: "Is there a cost?",
      answer: "Quantities are shown here; multiply by the dated rates shown under the results (cement/steel from the CEP rate table) or send the quantities to the BOQ Generator for a priced bill."
    },
  ],
  "master-sieve": [
    {
      question: "What do D10, D30 and D60 mean?",
      answer: "The sieve sizes at which 10%, 30% and 60% of the sample passes — read off the gradation curve by log-interpolation."
    },
    {
      question: "Cu vs Cc?",
      answer: "Cu = D60/D10 measures the spread of sizes; Cc = D30 squared / (D10 x D60) measures the shape of the curve. Well-graded sand needs Cu >= 6 and 1 <= Cc <= 3."
    },
    {
      question: "What are the well-graded criteria?",
      answer: "Gravel: Cu >= 4 and 1 <= Cc <= 3 (GW). Sand: Cu >= 6 and 1 <= Cc <= 3 (SW). Otherwise GP/SP."
    },
    {
      question: "What is fineness modulus?",
      answer: "FM = sum of cumulative % retained on the 4.75/2.36/1.18/0.6/0.3/0.15 mm sieves divided by 100. Fine sand 2.2-2.6, medium 2.6-2.9, coarse 2.9-3.2."
    },
    {
      question: "What are IS 383 zones?",
      answer: "IS 383 divides fine aggregate into Zones I-IV by grading envelope; Zone II is the usual concrete sand."
    },
    {
      question: "When do I need a hydrometer test?",
      answer: "For fines (passing 75 um) — sieve analysis cannot grade silt and clay; use hydrometer / sedimentation."
    },
  ],
  "material-takeoff": [
    {
      question: "How accurate is a thumb-rule takeoff?",
      answer: "Within about ±10–20% for a standard house. Thumb rules (0.40 bags cement, 3.5 kg steel, 10 bricks per sqft) assume 9-inch outer and 4.5-inch inner walls — confirm from drawings before ordering."
    },
    {
      question: "How many cement bags per sqft?",
      answer: "About 0.40 bags per sqft of built-up area: 0.25 for RCC, 0.05 for PCC and 0.10 for plaster — plus 2% wastage."
    },
    {
      question: "How much steel per sqft for a G+2 house?",
      answer: "About 3.5–4.0 kg per sqft for a normal RCC frame; seismic zones and longer spans push it higher. This sheet uses 3.5 kg/sqft."
    },
    {
      question: "What wastage should I add?",
      answer: "Bricks 5%, tiles 10%, cement 2%, steel 3%, paint 5%, sand/aggregate 3% — applied to the ordered quantity, not the theoretical quantity."
    },
  ],
  "measurement-sheet": [
    {
      question: "How is measurement done?",
      answer: "Each row is Nos × Length × Width × Depth from the drawing, per IS 1200. Volume needs 3 dimensions, area needs 2 — a row missing dimensions is incomplete and shows no quantity."
    },
    {
      question: "What is abstracting?",
      answer: "Collecting the measured quantities into a bill — here, sending the sheet to the BOQ Generator, where each line is priced by quantity × rate."
    },
    {
      question: "What deductions apply for openings in plaster?",
      answer: "IS 1200: under 0.5 m² no deduction, 0.5–3 m² deduct one face, over 3 m² deduct both faces and add jambs, soffits and sills."
    },
  ],
  "mep-calculator": [
    {
      question: "What is included in an MEP estimate?",
      answer: "Mechanical, electrical and plumbing: solar PV sizing, solar water heating, AC sizing, electrical load with breaker and cable sizing, and plumbing fixture units with pipe sizing. This hub covers all five — the old version had only the first three, and no electrical or plumbing scope at all."
    },
    {
      question: "How many BTU per square foot for AC in Pakistan?",
      answer: "Use the ENERGY STAR chart, not a flat BTU/ft² rule: a 100–150 sq ft room needs 5,000 BTU/h, 150–250 sq ft needs 6,000, 250–300 needs 7,000, and so on — then adjust for ceiling height, sun exposure, extra people (+600 BTU each over 2) and kitchens (+4,000 BTU). The old 5 BTU/ft³ rule and the 337 BTU/m² rule are both retired."
    },
    {
      question: "What size breaker do I need for a 5 kW load?",
      answer: "About 40 A on a 230 V single-phase supply at 0.9 power factor (demand 5 kW → 24 A, × 1.25 continuous-load factor = 30 A → next standard size 32 A; a 5.95 kW demand load needs a 40 A breaker with 6 mm² copper cable). This calculator works it out from your appliance list."
    },
    {
      question: "How are plumbing fixture units calculated?",
      answer: "Each fixture gets a water-supply fixture unit (WSFU): WC flush tank 3, flush valve 10, basin 1, bath/shower 2, kitchen sink 2, washing machine 3, dishwasher 2. Total WSFU gives the design flow (Hunter's-curve approximation Q = 0.25 × √WSFU L/s for small systems), and the pipe is sized so velocity stays under 2 m/s."
    },
    {
      question: "What is the difference between connected load and demand load?",
      answer: "Connected load is everything switched on at once; demand load applies a diversity factor to each appliance (not everything runs together). Breakers and cables are sized on demand load — sizing on connected load wastes money on oversized cable."
    },
    {
      question: "Do I need a licensed electrician to finalise this?",
      answer: "Yes. This is a planning estimate using IEC 60364-5-52 cable tables. Final breaker, cable and DB design must be checked by a licensed electrician against your actual cable runs, grouping and local regulations."
    },
  ],
  "metal-weight": METAL_FAQS.map((f) => ({ question: f.q, answer: f.a })),
  "pile-foundation": PILE_FAQS.map((f) => ({ question: f.q, answer: f.a })),
  "plywood-estimator": [
    {
      question: "How many plywood sheets do I need for a 10 × 3 m wall, both faces?",
      answer: "The contact area is 10 × 3 × 2 faces = 60 m². At 10% wastage the gross area is 66 m², and a standard 8 × 4 ft sheet (2.44 × 1.22 m) covers 2.98 m², so you need 22.17 sheets — 23 sheets to buy. The same wall at 5% wastage needs 22 sheets. Wastage covers cutting, joints and damaged corners."
    },
    {
      question: "What is the standard plywood sheet size?",
      answer: "The standard sheet is 8 × 4 ft (2.44 × 1.22 m), covering 2.98 m². A 6 × 3 ft sheet (1.83 × 0.91 m) covers 1.67 m², and a 7 × 4 ft sheet covers about 2.61 m². This calculator has presets for all three and a custom size, and it converts imperial labels to metric dimensions before calculating, so an 8 × 4 ft sheet is never treated as 8 × 4 metres."
    },
    {
      question: "How many times can shuttering plywood be reused?",
      answer: "Film-faced shuttering plywood is typically reused 4 to 8 times, depending on the grade, the care taken in stripping, and whether the faces are oiled. Commercial ply used as formwork is usually reused fewer times. The calculator lets you set reuse from 1 to 8, and it only divides the sheet count by reuse for formwork — fixed surfaces such as panelling are not divided, because you cannot reuse a sheet that stays in the building."
    },
    {
      question: "What is the difference between MR, BWR and BWP plywood?",
      answer: "MR (moisture resistant) is interior grade, for furniture and dry areas. BWR (boiling water resistant) is for kitchens, bathrooms and semi-exposed work. BWP (boiling water proof, marine grade) is for exterior and wet work. For formwork, film-faced shuttering ply is the usual choice because the phenolic film gives a smooth concrete finish and survives repeated use. The grade changes the price and the reuse count, not the sheet area."
    },
    {
      question: "How is plywood quantity calculated for a slab?",
      answer: "The slab soffit is length × width, and the beam sides add (2 × beam depth + beam width) × beam length. The beam lengths come from the spacing: secondary beams are (length ÷ spacing + 1) × width, and primary beams are (width ÷ spacing + 1) × length. Openings are deducted from the contact area, and wastage is added before the sheet count is worked out."
    },
    {
      question: "How is the volume of plywood calculated?",
      answer: "One sheet's volume is its area times its thickness divided by 1,000, in cubic metres. A standard 8 × 4 ft sheet at 12 mm is 2.98 × 0.012 = 0.036 m³. The total order volume is the number of sheets to buy times one sheet's volume. Volume matters when you are paying by the cubic foot or arranging transport."
    },
    {
      question: "How much wastage should I allow for plywood?",
      answer: "Typical wastage is 5% for large flat areas such as a general surface or a slab, 10% for walls and beams where cutting is heavier, and up to 15% for columns and small, irregular pieces. The calculator suggests a wastage preset for each element type, and you can override it. Wastage between 0% and 30% is accepted; anything above that is usually a sign the sheet size does not suit the job."
    },
    {
      question: "Why did the old plywood calculator show a blank result?",
      answer: "The old tool sent the dimensions to a server endpoint that does not exist on a static site, so the request failed silently and the results panel stayed blank with no error. This version does all the maths in the browser, so it works on GitHub Pages and anywhere else the site is hosted, with no server needed."
    },
    {
      question: "How many 4×8 plywood sheets are needed for a 10×10 ft room?",
      answer: "A 10 × 10 ft floor is 100 sq ft. With 5% wastage the gross area is 105 sq ft and one 8 × 4 ft sheet covers 32 sq ft, so 105 ÷ 32 = 3.28 — buy 4 sheets. For a wall of the same size with both faces formed, double the area first."
    },
    {
      question: "Which plywood thickness is used for formwork vs flooring?",
      answer: "Formwork and shuttering usually use 18 mm (¾ in) film-faced or HDO/MDO plywood; 12 mm suits light formwork and wall panelling; flooring and roofing commonly use 18–21 mm. Thicker sheets cost more per sheet but span further between supports."
    },
    {
      question: "How much area does one plywood sheet cover?",
      answer: "One 2.44 × 1.22 m sheet covers 2.98 m² (about 32 sq ft). One 1.83 × 0.91 m sheet covers 1.66 m² (about 18 sq ft). Always divide the gross area (net + wastage) by the sheet area and round up — you cannot buy part of a sheet."
    },
    {
      question: "Plywood vs OSB vs MDF for shuttering?",
      answer: "Film-faced plywood is the standard for shuttering: it is strong, reusable and gives a smooth concrete finish. OSB is cheaper but swells with water and is rarely reused. MDF is not suitable for wet formwork at all — it is an interior board for furniture and panelling."
    },
  ],
  "prestressed-concrete": PRESTRESS_FAQS.map((f) => ({ question: f.q, answer: f.a })),
  "projects": [
    {
      question: "Where are my projects saved?",
      answer: "On this device, in your browser (localStorage). There is no account and no server — if you clear browser data, export the project file first."
    },
    {
      question: "How do I share a project?",
      answer: "Use Share to copy or download the project file (.json) and send it to the other person; they open Project Manager and import it."
    },
    {
      question: "What is a version snapshot?",
      answer: "A frozen copy of the project's estimates at one point in time, so you can compare options (for example before and after a rate change) without losing the earlier numbers."
    },
  ],
  "qs-workflow": [
    {
      question: "What is a QS workflow?",
      answer: "The quantity surveyor's sequence: project info → drawings → take quantities off dimensions (IS 1200) → price them into a BOQ → report. This wizard follows that order."
    },
    {
      question: "What is IS 1200 measurement?",
      answer: "The Indian Standard method of measurement for building works — quantities are measured Nos × L × W × D from drawings, with standard deductions for openings."
    },
    {
      question: "How is the BOQ total calculated?",
      answer: "Each line is quantity × rate; lines sum to the subtotal, and the report shows cost per sqft against your plinth area."
    },
    {
      question: "Can I export to Excel?",
      answer: "Yes — Step 7 downloads the BOQ as CSV, which opens directly in Excel, and you can copy it as TSV."
    },
    {
      question: "What wastage should I add?",
      answer: "Bricks 5%, tiles 10%, cement 2%, steel 3%, paint 5% — add it to the ordered quantity in the BOQ Generator."
    },
  ],
  "quick-estimation": [
    {
      question: "What is the construction cost per sqft in Lahore in 2026?",
      answer: "Grey structure is about Rs 2,800–3,200/sqft and a standard finished house about Rs 4,800/sqft (grey 3,000 + finish 1,800) before the city multiplier. This is a thumb-rule starting point, not a quotation."
    },
    {
      question: "What is the difference between grey and finishing cost?",
      answer: "Grey is the structure — foundations, walls, slabs, plaster. Finishing adds flooring, doors/windows, paint, fixtures and MEP. Labour is a share of the total (15%), not an extra charge on top."
    },
    {
      question: "How accurate is a thumb-rule estimate?",
      answer: "Within roughly ±10–20% for a standard house on normal soil. Foundation depth, spans, imported finishes and the marla standard (225 vs 272.25 sqft) all move the total — use the BOQ Generator for a formal estimate."
    },
    {
      question: "Marla 225 vs 272.25 — which one applies?",
      answer: "Societies (DHA, Bahria, LDA schemes) use 225 sqft per marla; Punjab revenue records use 272.25 sqft. Use the toggle above and check your plot papers — the same 5-marla plot differs by ~17% in cost."
    },
  ],
  "raft-foundation": RAFT_FAQS.map((f) => ({ question: f.q, answer: f.a })),
  "rainwater-harvesting": [
    {
      question: "How much rainwater can I collect from my roof?",
      answer: "Annual yield = roof area (m²) × annual rainfall (mm) × runoff coefficient × filter efficiency. A 100 m² concrete roof in Lahore (628 mm rain) collects about 48,000 litres a year. One millimetre of rain on one square metre is one litre."
    },
    {
      question: "What size tank do I need?",
      answer: "Take the larger of two numbers: 5% of the lesser of annual yield and annual demand (the BS 8515 rule) and your daily use × dry-spell days (default 21). Then round up to a standard tank size (500–10,000 L). For a family of 4 in Lahore that is usually a 5,000 L tank."
    },
    {
      question: "What is the 5% rule (BS 8515)?",
      answer: "BS 8515 / BS EN 16941-1 sizes a rainwater tank at 5% of the lesser of annual yield and annual demand — not 5% (or 8%) of yield alone. Without a demand input the rule cannot be applied, which is why this calculator asks how much water you use."
    },
    {
      question: "How much rainfall does Lahore/Karachi get?",
      answer: "Long-term averages used here: Lahore 628 mm, Karachi 174 mm, Islamabad 1,143 mm, Multan 186 mm, Quetta 244 mm, Dubai 94 mm, Mumbai 2,213 mm, Delhi 797 mm. They are averages — verify with PMD/IMD data for your district before sizing a tank."
    },
    {
      question: "Is harvested rainwater drinkable?",
      answer: "Not without treatment and testing. Use harvested rainwater for flushing, washing, gardening and cleaning. For drinking it must be filtered and disinfected to drinking-water standards and tested regularly."
    },
    {
      question: "Rainwater harvesting vs recharge pit?",
      answer: "A storage tank saves water for use; a recharge pit puts monsoon water back into the ground. If your roof yield covers under 20% of demand, or payback on water savings alone is over 20 years, a recharge pit is often the better investment — this calculator warns you when that is the case."
    },
  ],
  "rates": [
    {
      question: "What is rate analysis?",
      answer: "Breaking one unit of work (e.g. 1 m³ of 1:2:4 concrete) into materials, labour, equipment, water charges and overhead, so the rate per unit is built up from quantities — not guessed."
    },
    {
      question: "What are water charges and CPOH?",
      answer: "CPWD adds 1% water charges on the prime cost, then 15% CPOH (contractor's profit and overhead) on prime + water. At 2026 PK rates the 1:2:4 PCC rate is Rs 18,223/m³ with CPWD, or Rs 18,042/m³ without water."
    },
    {
      question: "How many cement bags per m³ of 1:2:4 concrete?",
      answer: "About 6.34 bags (CPWD reference 6.4) — dry volume 1.54 m³, cement is 1/7 of it, one bag is 0.0347 m³. Order 7 bags."
    },
    {
      question: "RMC vs site mix?",
      answer: "Site mix is priced here. Ready-mix concrete is usually 10–20% dearer but saves labour and gives consistent strength — compare both before choosing."
    },
  ],
  "reinforcement": REINFORCEMENT_FAQS.map((f) => ({ question: f.q, answer: f.a })),
  "retaining-wall": RETAINING_FAQS.map((f) => ({ question: f.q, answer: f.a })),
  "road-pavement": [
    {
      question: "What are GSB, WMM, DBM and BC?",
      answer: "Granular sub-base, wet-mix macadam, dense bituminous macadam and bituminous concrete — the layers of a flexible pavement, bottom to top."
    },
    {
      question: "How is asphalt tonnage calculated?",
      answer: "Tonnage = length x width x thickness x density. MoRTH densities: BC 2355, DBM 2370, BM 2160 kg/m3."
    },
    {
      question: "How much wastage should I add?",
      answer: "About 5% for granular layers, 3% for bituminous layers, 10% for asphalt on irregular areas (15% hand-laid)."
    },
    {
      question: "What is the difference between flexible and rigid pavement?",
      answer: "Flexible pavements spread load through granular and bituminous layers; rigid (concrete) pavements spread it through slab bending."
    },
    {
      question: "Is the rigid pavement output a design?",
      answer: "No — it is a quantity estimate only. Slab thickness and joints must be designed per IRC:58-2015 by a pavement engineer."
    },
  ],
  "room-area-calculator": [
    {
      question: "What is the RERA definition of carpet area?",
      answer: "Under RERA, carpet area is the net usable floor area of an apartment, excluding external walls, balconies, terraces and service shafts, but including the area covered by internal partition walls. It is the area you actually live in — not the area you pay for including common spaces."
    },
    {
      question: "What is the difference between carpet, built-up and super built-up area?",
      answer: "Carpet area is the net usable area inside the walls. Built-up area adds the wall thickness (and balcony). Super built-up area adds a share of common areas — lobbies, stairs, lifts — through a loading factor, typically 20–30%. A 12 m² carpet room with 230 mm walls is about 15.4 m² built-up."
    },
    {
      question: "What is the minimum bedroom and bathroom size per NBC?",
      answer: "Per NBC 2016 Part 3, a habitable room needs at least 9.5 m² with a minimum width of 2.4 m, a kitchen at least 5.0 m² and 1.8 m wide, and a bathroom with WC at least 2.8 m². Note: BIS replaced NBC 2016 with NBCS 2026 (SP 7:2026) on 30 April 2026 — the NBCS 2026 minima have not been verified against SP 7:2026, so confirm the current code."
    },
    {
      question: "How many marla is a 12 × 10 ft room?",
      answer: "A 12 × 10 ft room is 120 sq ft, which is 120 ÷ 272.25 = 0.44 marla. One marla is 272.25 sq ft (25.293 m²) and one kanal is 20 marla (5,445 sq ft). Use the unit selector on this page to convert any area."
    },
    {
      question: "What is the loading factor in super built-up area?",
      answer: "The loading factor is the percentage added to the built-up area for common spaces — corridors, stairs, lifts and lobbies. A 25% loading factor turns 100 m² of built-up area into 125 m² of super built-up area. It varies by project; ask the builder for the exact factor in the sale agreement."
    },
    {
      question: "How do I convert a super built-up area back to carpet area?",
      answer: "Use the reverse mode: enter the super built-up area, the wall thickness and the loading factor, and the calculator recovers the built-up and carpet areas. It is an approximation, because the loading factor is an assumption — but it is the same maths a builder uses when quoting a super built-up figure."
    },
  ],
  "soil-mechanics-lab": [
    {
      question: "What is the Proctor test?",
      answer: "It finds the optimum moisture content (OMC) and maximum dry density (MDD) of a soil under standard compactive effort (IS 2720 Pt 7)."
    },
    {
      question: "What is relative compaction?",
      answer: "Field dry density divided by laboratory MDD x 100. Embankments usually need >= 95% (subgrade) to 97-98% (base)."
    },
    {
      question: "What does UCS tell me?",
      answer: "Unconfined compressive strength qu = P/Ac; undrained shear strength cu = qu/2 for saturated clay."
    },
    {
      question: "When is vane shear used?",
      answer: "For soft, saturated clays in the field or lab where an undisturbed sample is hard to test in triaxial shear."
    },
    {
      question: "What is free swell index?",
      answer: "The volume increase of oven-dry soil in water, as a % — an index of expansiveness (IS 1498)."
    },
  ],
  "solar-roof": [
    {
      question: "How many solar panels do I need for 600 units?",
      answer: "About 9 × 545 W panels (4.91 kWp) in Lahore at 5.0 peak sun hours and 14% system losses. The sizing is: daily demand (600 ÷ 30.4 = 19.7 kWh/day) ÷ PSH ÷ derate = required kWp, then panels = ceil(required kWp × 1000 ÷ panel wattage)."
    },
    {
      question: "What is the cost of a 5 kW solar system in Pakistan?",
      answer: "At the indicative Nov 2026 rates used here (panels PKR 90/W, inverter PKR 25,000/kVA, battery PKR 65,000/kWh, mounting, wiring, labour and contingency), a 4.91 kWp hybrid system with a 28.8 kWh battery costs about PKR 3.5 million — and the battery is about two-thirds of that. An on-grid system without a battery costs far less. Confirm every rate with your supplier."
    },
    {
      question: "How does net metering export rate affect payback?",
      answer: "Exported units are credited at only about 20% of the import tariff (NEPRA buyback ≈ PKR 9–11/kWh vs ~PKR 50 import). The old 100% default overstated savings by about 2× on exported units. Payback is best when you use most of what you generate — oversizing a system to export is a poor return."
    },
    {
      question: "On-grid vs hybrid vs off-grid — which is right?",
      answer: "On-grid is cheapest (no battery) but stops in a power cut. Hybrid adds a battery for backup and costs the most. Off-grid is for sites with no grid connection at all. Most homes in Pakistan choose hybrid; most in the UAE choose on-grid."
    },
    {
      question: "How much roof area does a 5 kW system need?",
      answer: "About 30 m² for 9 × 545 W panels, including 30% spacing for access and shading (each panel is about 2.58 m²). This calculator checks your available roof area and tells you the maximum system that fits."
    },
    {
      question: "What is the payback period for solar in Lahore/Karachi/Dubai?",
      answer: "It depends on tariff, export credit, battery size and tariff escalation. With the defaults here, a hybrid system pays back in roughly 9–11 years; an on-grid system pays back much faster because there is no battery to buy. The calculator shows simple payback, NPV, IRR and LCOE so you can compare properly — including an inverter replacement in year 12."
    },
  ],
  "solar-water-heater": [
    {
      question: "How many litres of hot water per person?",
      answer: "Plan on 50 litres per person per day for a domestic solar water heater in Pakistan, India and the UAE. The old 40 L/person figure used by one of our tools is retired — 50 L is now the single value used across all MEP tools."
    },
    {
      question: "Flat plate vs evacuated tube?",
      answer: "Flat-plate (selective) collectors run at about 50% yearly efficiency and cost less; evacuated-tube collectors run at about 65% and perform better in winter and cold climates, but cost more per m². This calculator prices both."
    },
    {
      question: "What is solar fraction?",
      answer: "The share of the year's hot-water energy the sun provides. A solar fraction of 0.6 means the sun covers 60% and a backup heater (electric or gas) covers the other 40% — mostly in winter and on cloudy days. Typical design range is 0.5–0.7."
    },
    {
      question: "What size tank for a family of 4?",
      answer: "A family of 4 needs 200 L/day. The tank is the larger of 1.5 × daily demand (300 L) and 60 L per m² of collector — for a 7 m² collector that is about 418 L, rounded up to the 500 L standard size."
    },
    {
      question: "How much does a solar water heater cost in Pakistan?",
      answer: "It depends on collector area and tank size. Indicative rates used here are PKR 45,000/m² for flat-plate and PKR 60,000/m² for evacuated tube, plus about PKR 800 per litre of tank and 10% installation. Enter your supplier's rates to price your own system — costs are never hardcoded in USD."
    },
  ],
  "staircase-calculator": STAIRCASE_FAQS.map((f) => ({ question: f.q, answer: f.a })),
  "staircase-design-reference": [
    {
      question: "What is the 2R+G rule?",
      answer: "Blondel's comfort rule: twice the riser plus the going should be 600–650 mm (NBC/Blondel). Some references use the narrower 600–640 mm band; this tool accepts 600–650 mm and notes the variant. A 170 mm riser with a 280 mm going gives 620 mm."
    },
    {
      question: "How many risers can one flight have?",
      answer: "NBC 2016 Part 4 limits a single flight to 12 risers for residential stairs and 15 for commercial stairs. More risers need a landing and a second flight."
    },
    {
      question: "How high should the handrail be?",
      answer: "800–900 mm measured vertically from the nosing line. Handrails are required on both sides for wide stairs and on open sides."
    },
    {
      question: "Why is the residential width 1.0 m here?",
      answer: "NBC 2016 Part 3 Table 5 allows 0.9 m for a residential stair, but 1.0 m is the practical minimum used on this site so furniture can be carried — it is stricter than the code minimum, not a code requirement."
    },
  ],
  "takeoff": [
    {
      question: "How does digital takeoff work?",
      answer: "Upload a drawing, set the scale from a known dimension, then draw lines and areas — or drop a Smart Assembly — and the BOQ fills itself from the measured quantities."
    },
    {
      question: "What if my drawing has no scale?",
      answer: "Draw a line over any dimension you know (for example a 10 m wall) and enter its real length; every later measurement uses that scale."
    },
    {
      question: "Why is a BOQ line marked assumed?",
      answer: "Lines typed in by hand or loaded from the sample are assumptions, not measurements. Only lines linked to a drawing measurement are measured."
    },
  ],
  "tracker": [
    {
      question: "What is Earned Value (EVM)?",
      answer: "Planned Value (PV) is the budget of work scheduled by the status date, Earned Value (EV) is the budget of work actually done, and Actual Cost (AC) is what was spent. SPI = EV/PV and CPI = EV/AC tell you if you are ahead or behind, and under or over budget."
    },
    {
      question: "What is EAC?",
      answer: "Estimate at Completion — the forecast final cost. The CPI method (BAC/CPI) assumes current cost performance continues; the atypical method assumes the remaining work goes to plan; the CPI×SPI method assumes both cost and schedule trends continue."
    },
    {
      question: "What does freezing a baseline do?",
      answer: "It snapshots the planned-value curve on the status date. Later S-curves draw the baseline as a dashed line, so slippage against the original plan is visible."
    },
  ],
  "unit-converter": [
    {
      question: "How many sq ft is one marla?",
      answer: "It depends on the standard: 225 sq ft (society standard, used in most housing societies) or 272.25 sq ft (Punjab revenue standard). The Marla unit here is the 225 sq ft society marla — use the Marla Converter page for the 272.25 standard."
    },
    {
      question: "How do I convert cubic metres to cubic feet?",
      answer: "Multiply by 35.3147 — 1 m³ = 35.3147 cu ft. The Volume quick pair does this for you."
    },
    {
      question: "What is 1 m³ of concrete in bags of cement?",
      answer: "A 1:2:4 mix needs about 6.34 bags of cement per m³ (plus 2% wastage). Use the Rate Analysis tool for the full breakdown."
    },
  ],
  "universal-structural-geometry": GEOMETRY_FAQS.map((f) => ({ question: f.q, answer: f.a })),
  "ventilation-checker": [
    {
      question: "How many air changes per hour does a bedroom need?",
      answer: "Planning target: 4 air changes per hour (ACH) for bedrooms and living rooms, 6 for offices and classrooms, 8 for bathrooms (exhaust) and 10 for kitchens (exhaust). At 4 ACH the whole room's air is replaced every 15 minutes."
    },
    {
      question: "How do I calculate CFM from room size?",
      answer: "CFM = room volume (m³) × ACH × 0.5886. For example a 60 m³ bedroom at 4 ACH needs 240 m³/h, which is about 141 CFM. This calculator shows the same airflow in m³/h and CFM."
    },
    {
      question: "What is the NBC window-area rule?",
      answer: "The window (glazing) area is commonly taken as 1/10 of floor area in dry-hot climates, 1/8 in intermediate climates and 1/6 in wet-hot climates, with openable area at least 50% of the required glazing. The exact clause number in the Pakistan Building Code / NBC 2016 Part 8 is still to be verified — this calculator labels the ratios as applicable guidance, not a quoted clause."
    },
    {
      question: "ASHRAE 62.1 vs ACH — which should I use?",
      answer: "Both, for different things. ASHRAE 62.1 (Vbz = Rp × people + Ra × area) gives the OUTDOOR air rate for health; the ACH method gives the TOTAL supply air rate for comfort and air movement. They are different quantities — this calculator shows both and warns you not to compare them directly."
    },
    {
      question: "What size exhaust fan for a bathroom/kitchen?",
      answer: "Size the fan to the ACH airflow and round up to a standard fan size. A 60 m³ bathroom at 8 ACH needs about 480 m³/h (≈ 283 CFM) — a 300 CFM fan. A kitchen at 10 ACH needs more; this calculator picks the standard size for you."
    },
    {
      question: "What is the minimum window area for a kitchen?",
      answer: "At least 1.0 m² of glazing for a kitchen and 0.3 m² for a bathroom/WC, even when the floor-area ratio would give a smaller number. The openable area must still be at least half of the required glazing."
    },
  ],
  "volume-estimator": [
    {
      question: "What is the difference between gross and usable tank capacity?",
      answer: "Gross capacity is the total volume of the tank. Usable capacity subtracts the freeboard (the empty space kept at the top, usually 100–150 mm) and the dead storage (water below the outlet that cannot flow out). A 3 × 2 × 2 m tank has a gross capacity of 12,000 L but only about 9,600 L is usable."
    },
    {
      question: "How do I size a domestic water tank for a family?",
      answer: "Multiply the number of people by the per-person daily demand (about 100 L for domestic use) and by the days of storage you want (usually 2). Six people × 100 L × 2 days = 1,200 L — the next standard size up is 1,500 L. Enter your family size in the tank mode to size it automatically."
    },
    {
      question: "What is the volume of a partially filled horizontal cylinder?",
      answer: "For a horizontal cylinder filled to depth h, the cross-section is a circular segment: A = r²·arccos((r−h)/r) − (r−h)·√(2rh−h²), and volume = A × length. This calculator computes the fill volume when you enter a fill percentage for a horizontal cylinder."
    },
    {
      question: "How many litres is 1 cubic metre?",
      answer: "1 m³ = 1,000 litres = 35.3147 cu ft. One cubic foot is 28.3168 litres, which is 7.48052 US gallons or 6.22884 imperial gallons. Use the gallon toggle to switch between US and imperial gallons."
    },
    {
      question: "How do I calculate the weight of a volume of material?",
      answer: "Weight = volume × density. Select the material — water 1,000 kg/m³, concrete 2,400 kg/m³, steel 7,850 kg/m³, dry sand 1,600 kg/m³ — or enter a custom density (for example cement 1,440 kg/m³ or aggregate 1,500 kg/m³). The weight is shown for every shape, not just pipes."
    },
    {
      question: "Why did the triangular dumper return zero before?",
      answer: "The old code had a commented-out parabolic cone branch that swallowed the triangular dumper header, so the dumper returned 0 and the parabolic cone used the wrong surface area. Both shapes now compute correctly from a clean switch — a 4 × 3 × 5 m triangular dumper is 30.00 m³ with a surface area of 68.06 m²."
    },
    {
      question: "Can I add the volume to my BOQ?",
      answer: "Yes. The Add to BOQ button adds the computed volume to your BOQ, so a tank or footing volume flows straight into the estimate."
    },
  ],
  "wastewater-calculator": [
    {
      question: "What are the PEQS limits for BOD and COD?",
      answer: "Punjab Environmental Quality Standards (inland discharge): BOD 80 mg/L, COD 150 mg/L, TSS 200 mg/L. For discharge to a sewer the limits are BOD 250 mg/L and COD 400 mg/L. The old 'Safe <30 BOD / <250 COD' bands were wrong and are retired."
    },
    {
      question: "What is the difference between BOD and COD?",
      answer: "BOD₅ measures the oxygen micro-organisms consume in 5 days — the biodegradable part. COD measures all chemically oxidisable matter, including non-biodegradable substances. COD is always higher than BOD; a COD/BOD ratio of 1.5–3.0 is normal for biodegradable wastewater, over 3.5 means it is largely non-biodegradable."
    },
    {
      question: "What dilution should I use for a BOD test?",
      answer: "Choose a sample volume so the final DO stays above 1.0 mg/L and the DO depletion is at least 2.0 mg/L (APHA 5210B). If the final DO falls below 1.0, use a smaller sample; if depletion is under 2.0, use a larger one. This calculator flags both failures by name."
    },
    {
      question: "Does this calculator need the internet or a server?",
      answer: "No. All BOD/COD maths runs in your browser. The old version fetched /api/tools/wastewater-testing/bod and .../cod, which existed only in the development server — on the live static site every load failed. That dependency is removed."
    },
    {
      question: "What is a sewerage design?",
      answer: "Sizing the pipes, septic tank and soak pits that carry wastewater away — see the Sewerage Design tab. It starts from design flow (population × 120 L/day × peak factor), sizes the pipe by Manning's equation, then sizes the septic tank to IS 2470 minimums and the soak pit at a fixed 1.5 m diameter."
    },
    {
      question: "Where do I send a sample for a real test?",
      answer: "To an EPA-certified laboratory. This calculator checks your lab numbers against PEQS limits; it does not replace a certified test. Bring the sample in a clean, sealed bottle, keep it cool, and test it as soon as possible."
    },
    {
      question: "What is self-cleansing velocity?",
      answer: "The minimum flow velocity that keeps solids moving instead of settling in the pipe — 0.6 m/s for sanitary sewers. This calculator reports the minimum slope that achieves 0.6 m/s for your pipe size and material (for a 300 mm concrete pipe at 1:200 the velocity is 0.97 m/s, and the minimum slope is about 1 in 520)."
    },
    {
      question: "How is a sewer pipe sized?",
      answer: "Design flow first: population × wastewater per person (default 120 L/day) × peak factor (3.0 under 1,000 people). Then pick the smallest standard diameter whose full-bore Manning capacity carries that flow at a velocity of 0.6–2.5 m/s. Capacity alone is not enough — a pipe that is too flat will silt up."
    },
    {
      question: "What is the minimum septic tank size?",
      answer: "IS 2470 minimums: 1,000 litres liquid volume, 0.75 m minimum width, 1.0 m minimum liquid depth, plus 0.3 m freeboard, with length about twice the width. A 5-person house calculates to 900 L, so the 1,000 L minimum applies — this calculator enforces it."
    },
    {
      question: "Soak pit vs dispersion trench?",
      answer: "Both dispose of septic effluent into the soil. A soak pit is a 1.2–1.5 m diameter pit 3–4 m deep (deeper pits are split into several); a dispersion trench is a long shallow trench (about 1.0 m deep × 0.6 m wide). Trenches suit high water tables and flat sites; pits suit deep, permeable soil. This calculator sizes both."
    },
    {
      question: "When does sewerage design need a licensed engineer?",
      answer: "Always for a real installation. Pipe gradients, invert levels, manhole spacing, structural bedding class and septic/soak-pit siting depend on ground conditions, water table and local by-laws. This tool is a planning estimate — get the design checked and approved before building."
    },
    {
      question: "What is Manning's n?",
      answer: "The roughness coefficient in Manning's equation. Typical values: uPVC/HDPE 0.009, concrete 0.013, cast iron 0.014, clay 0.015. A rougher pipe (higher n) flows slower at the same slope, so it needs a steeper gradient or a larger diameter."
    },
  ],
  "water-tank-design": WATER_TANK_FAQS.map((f) => ({ question: f.q, answer: f.a })),
};

;

interface GlobalFAQProps {
  faqs?: FAQItem[];
  moduleId?: string; 
}

export function GlobalFAQ({ faqs = [], moduleId }: GlobalFAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);

  const moduleDef = ALL_MODULES.find(m => m.id === moduleId);

  const formatToolTitle = (t: string) => t.replace(/^(Calculate|Find) /, '');

  const specificFaqs = moduleId ? (SPECIFIC_FAQS[moduleId] || []) : [];

  const genericFaqs = moduleDef ? [
    {
      question: `Is the ${formatToolTitle(moduleDef.title)} free to use?`,
      answer: `Yes, all core calculation features for the ${moduleDef.title.toLowerCase()} are completely free for all users.`
    },
    {
      question: `How accurate are the results from the ${formatToolTitle(moduleDef.title)}?`,
      answer: `Estimations follow standard civil engineering formulas and practices. Always verify critical computations.`
    },
    {
      question: `Can I use this ${moduleDef.category.toLowerCase()} tool on my mobile phone?`,
      answer: `Absolutely. The ${formatToolTitle(moduleDef.title)} is fully responsive and optimized for seamless use on smartphones and tablets.`
    },
    {
      question: `What engineering formulas does this tool use?`,
      answer: `It strictly uses internationally recognized civil engineering formulas relevant to the ${moduleDef.category.toLowerCase()} field.`
    },
    {
      question: `How do I save my ${formatToolTitle(moduleDef.title)} calculations?`,
      answer: `Use the Quick Actions menu to export a detailed PDF report or copy the data to your clipboard. Premium users can save directly to their dashboard.`
    }
  ] : [];

  // Filter out any duplicates based on question exact match (or we can just append)
  const combinedFaqsMap = new Map();
  [...faqs, ...specificFaqs, ...genericFaqs].forEach(f => {
    if(!combinedFaqsMap.has(f.question)) {
      combinedFaqsMap.set(f.question, f);
    }
  });
  const combinedFaqs = Array.from(combinedFaqsMap.values());
  const displayedFaqs = showAll ? combinedFaqs : combinedFaqs.slice(0, 2);

  return (
    <section className="w-full bg-surface-default rounded-2xl p-4 sm:p-4 sm:p-4 sm:p-6 md:p-4 sm:p-4 sm:p-4 sm:p-8 border border-border-color shadow-brand-sm overflow-hidden" aria-label="Frequently Asked Questions">
      <h2 className="text-xl md:text-2xl font-bold text-txt-primary tracking-tight mb-6">
        Frequently Asked Questions
      </h2>
      <div className="space-y-4">
        {displayedFaqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div 
              key={index}
              className="w-full border border-ui-borderSubtle rounded-2xl bg-surface-default/80 backdrop-blur-xl overflow-hidden shadow-brand-sm hover:shadow transition-shadow"
            >
              <Button className="w-full text-left px-6 py-4 md:py-5 flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-accent-500 focus:outline-none focus:ring-accent-500/20 rounded-full transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-brand-lg shadow-brand-sm"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${index}`}
              >
                <span className="font-semibold text-txt-primary text-lg pr-8">
                  {faq.question}
                </span>
                <ChevronDown 
                  className={`w-5 h-5 text-txt-tertiary transform transition-transform duration-300 ${isOpen ? 'rotate-180 text-accent-800' : ''}`}
                />
              </Button>
              
              <div 
                id={`faq-answer-${index}`}
                className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100 pb-5' : 'max-h-0 opacity-0 overflow-hidden'}`}
                aria-hidden={!isOpen}
              >
                <div className="px-6 text-txt-secondary leading-relaxed">
                  {faq.answer}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {combinedFaqs.length > 2 && (
        <div className="text-center mt-8">
          <Button
            onClick={() => setShowAll(!showAll)}
            className="px-6 py-3 bg-ink hover:bg-ink-700 text-white font-bold rounded-full transition-colors shadow-brand-sm active:scale-95 hover:-translate-y-0.5"
          >
            {showAll ? 'Show Less' : `Show all ${combinedFaqs.length} questions`}
          </Button>
        </div>
      )}
    </section>
  );
}
