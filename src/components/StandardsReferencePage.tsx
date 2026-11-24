import { Button } from './ui/Button';
import { GlobalFAQ, getCombinedFaqs } from './ui/GlobalFAQ';
import { SEO, SITE_WEB_APP } from "./SEO";
import { getSiteUrl } from "../seo/siteConfig";
import { TOOL_GUIDES } from "../seo/toolGuides";
import { ToolArticleWidget } from "./ui/ToolArticleWidget";
import { getEffectivePathname } from "../lib/toolRoutes";
import React, { useState, useEffect } from "react";
import { Search, BookOpen, ShieldCheck, ArrowRight, Download, Eye, X } from "lucide-react";
import { createPortal } from "react-dom";


export interface StandardEntry {
  id: string;
  code: string;
  title: string;
  country: "India" | "Pakistan" | "UAE";
  category: string;
  description: string;
  toolIds: string[];
  toolNames: string[];
  /** Only bcp-2021.pdf is hosted in public/assets/standards/ — every other
   *  entry has no pdfLink, so no PDF button is shown for it. */
  pdfLink?: string;
  /** Publishing body / source of the scope and year. */
  source: string;
  /** Year of the edition, when verified. Omitted when the year is not verified. */
  year?: number;
  lastVerified: string;
}

const LV = "2026-11-12";

export const standardsData: StandardEntry[] = [
  { id: "is-456", code: "IS 456:2000", title: "Plain and Reinforced Concrete", country: "India", category: "Concrete", description: "The primary Indian Standard code of practice for general structural use of plain and reinforced concrete. Covers design clauses, material specifications, and workmanship.", toolIds: ["mix-design", "house"], toolNames: ["Concrete Mix Design Calculator", "House Estimator"], source: "Bureau of Indian Standards (BIS)", year: 2000, lastVerified: LV },
  { id: "is-800", code: "IS 800:2007", title: "General Construction in Steel", country: "India", category: "Steel", description: "Code of practice for general construction in steel, using the limit state design method for structural steel detailing.", toolIds: ["metal-weight", "house"], toolNames: ["Steel & Metal Weight Calculator", "House Estimator"], source: "Bureau of Indian Standards (BIS)", year: 2007, lastVerified: LV },
  { id: "is-10262", code: "IS 10262:2019", title: "Concrete Mix Proportioning", country: "India", category: "Concrete", description: "Guidelines for proportioning of concrete mixes to achieve specified characteristics like workability, compressive strength, and durability.", toolIds: ["mix-design"], toolNames: ["Concrete Mix Design Calculator"], source: "Bureau of Indian Standards (BIS)", year: 2019, lastVerified: LV },
  { id: "is-1200", code: "IS 1200", title: "Method of Measurement", country: "India", category: "Quantity", description: "Standardizes the method of measurement of building and civil engineering works for preparation of estimates and bills of quantities. Plaster deductions: under 0.5 m² none, 0.5–3 m² one face, over 3 m² both faces.", toolIds: ["house", "qs-workflow"], toolNames: ["House Estimator", "BOQ Generator"], source: "Bureau of Indian Standards (BIS)", lastVerified: LV },
  { id: "is-1893", code: "IS 1893 (Part 1):2016", title: "Earthquake Resistant Design of Structures", country: "India", category: "Seismic", description: "Criteria for earthquake resistant design of structures — seismic zones, design spectrum and base shear. Part 1 covers general provisions and buildings.", toolIds: ["house", "mix-design"], toolNames: ["House Estimator", "Concrete Mix Design Calculator"], source: "Bureau of Indian Standards (BIS)", year: 2016, lastVerified: LV },
  { id: "is-13920", code: "IS 13920:2016", title: "Ductile Design and Detailing of RC Structures", country: "India", category: "Seismic", description: "Ductile design and detailing of reinforced concrete structures subjected to seismic forces — companion to IS 1893 for seismic zones III, IV and V.", toolIds: ["mix-design", "house"], toolNames: ["Concrete Mix Design Calculator", "House Estimator"], source: "Bureau of Indian Standards (BIS)", year: 2016, lastVerified: LV },
  { id: "is-383", code: "IS 383:2016", title: "Coarse and Fine Aggregate for Concrete", country: "India", category: "Concrete", description: "Specification for coarse and fine aggregates from natural sources for concrete, including grading zones for sand.", toolIds: ["mix-design"], toolNames: ["Concrete Mix Design Calculator"], source: "Bureau of Indian Standards (BIS)", year: 2016, lastVerified: LV },
  { id: "is-1786", code: "IS 1786:2008", title: "High Strength Deformed Steel Bars (TMT)", country: "India", category: "Steel", description: "Specification for high strength deformed steel bars and wires for concrete reinforcement — the TMT bars used in RCC work.", toolIds: ["metal-weight", "house"], toolNames: ["Steel & Metal Weight Calculator", "House Estimator"], source: "Bureau of Indian Standards (BIS)", year: 2008, lastVerified: LV },
  { id: "is-875", code: "IS 875", title: "Design Loads for Buildings and Structures", country: "India", category: "Design", description: "Code of practice for design loads (other than earthquake) — dead, imposed, wind, snow and special loads, in five parts.", toolIds: ["house", "mix-design"], toolNames: ["House Estimator", "Concrete Mix Design Calculator"], source: "Bureau of Indian Standards (BIS)", lastVerified: LV },
  { id: "is-1904", code: "IS 1904:1986", title: "Foundations in Soils — General Requirements", country: "India", category: "Geotechnical", description: "Code of practice for design and construction of foundations in soils — general requirements for shallow and deep foundations.", toolIds: ["house", "earthworks"], toolNames: ["House Estimator", "Earthworks & Excavation Calculator"], source: "Bureau of Indian Standards (BIS)", year: 1986, lastVerified: LV },
  { id: "is-3370", code: "IS 3370", title: "Concrete Structures for Storage of Liquids", country: "India", category: "Concrete", description: "Code of practice for concrete structures for the storage of liquids — water tanks, reservoirs and similar structures.", toolIds: ["house", "mix-design"], toolNames: ["House Estimator", "Concrete Mix Design Calculator"], source: "Bureau of Indian Standards (BIS)", lastVerified: LV },
  { id: "is-516", code: "IS 516:2021", title: "Hardened Concrete — Methods of Test", country: "India", category: "Concrete", description: "Methods of tests for strength of concrete — cube and beam testing, the basis for 28-day compressive strength results.", toolIds: ["mix-design"], toolNames: ["Concrete Mix Design Calculator"], source: "Bureau of Indian Standards (BIS)", year: 2021, lastVerified: LV },
  { id: "is-269", code: "IS 269:2015", title: "Ordinary Portland Cement, 33 Grade", country: "India", category: "Concrete", description: "Specification for 33 grade ordinary Portland cement — chemical and physical requirements.", toolIds: ["mix-design"], toolNames: ["Concrete Mix Design Calculator"], source: "Bureau of Indian Standards (BIS)", year: 2015, lastVerified: LV },
  { id: "is-8112", code: "IS 8112:2013", title: "Ordinary Portland Cement, 43 Grade", country: "India", category: "Concrete", description: "Specification for 43 grade ordinary Portland cement.", toolIds: ["mix-design"], toolNames: ["Concrete Mix Design Calculator"], source: "Bureau of Indian Standards (BIS)", year: 2013, lastVerified: LV },
  { id: "is-12269", code: "IS 12269:2013", title: "Ordinary Portland Cement, 53 Grade", country: "India", category: "Concrete", description: "Specification for 53 grade ordinary Portland cement — the grade most commonly used in RCC work.", toolIds: ["mix-design"], toolNames: ["Concrete Mix Design Calculator"], source: "Bureau of Indian Standards (BIS)", year: 2013, lastVerified: LV },
  { id: "is-4031", code: "IS 4031", title: "Methods of Physical Tests for Cement", country: "India", category: "Concrete", description: "Methods of physical tests for hydraulic cement — fineness, setting time, soundness and strength.", toolIds: ["mix-design"], toolNames: ["Concrete Mix Design Calculator"], source: "Bureau of Indian Standards (BIS)", lastVerified: LV },
  { id: "is-1077", code: "IS 1077:1992", title: "Common Burnt Clay Building Bricks", country: "India", category: "Masonry", description: "Specification for common burnt clay building bricks — dimensions, classes and compressive strength.", toolIds: ["house"], toolNames: ["House Estimator"], source: "Bureau of Indian Standards (BIS)", year: 1992, lastVerified: LV },
  { id: "is-2212", code: "IS 2212:1991", title: "Brick Work — Code of Practice", country: "India", category: "Masonry", description: "Code of practice for brick work — bonding, mortar, joints and workmanship for brick masonry.", toolIds: ["house"], toolNames: ["House Estimator"], source: "Bureau of Indian Standards (BIS)", year: 1991, lastVerified: LV },
  { id: "is-1905", code: "IS 1905:1987", title: "Structural Use of Unreinforced Masonry", country: "India", category: "Masonry", description: "Code of practice for structural use of unreinforced masonry — design of load-bearing masonry walls.", toolIds: ["house"], toolNames: ["House Estimator"], source: "Bureau of Indian Standards (BIS)", year: 1987, lastVerified: LV },
  { id: "is-2250", code: "IS 2250:1981", title: "Preparation and Use of Masonry Mortars", country: "India", category: "Masonry", description: "Code of practice for preparation and use of masonry mortars — mixes, mixing and application.", toolIds: ["house"], toolNames: ["House Estimator"], source: "Bureau of Indian Standards (BIS)", year: 1981, lastVerified: LV },
  { id: "is-1343", code: "IS 1343:2012", title: "Prestressed Concrete — Code of Practice", country: "India", category: "Concrete", description: "Code of practice for prestressed concrete — design and construction of prestressed members.", toolIds: ["mix-design"], toolNames: ["Concrete Mix Design Calculator"], source: "Bureau of Indian Standards (BIS)", year: 2012, lastVerified: LV },
  { id: "is-4326", code: "IS 4326:2013", title: "Earthquake Resistant Design of Masonry Buildings", country: "India", category: "Seismic", description: "Code of practice for earthquake resistant design and construction of masonry buildings.", toolIds: ["house"], toolNames: ["House Estimator"], source: "Bureau of Indian Standards (BIS)", year: 2013, lastVerified: LV },
  { id: "is-13828", code: "IS 13828:1993", title: "Improving Earthquake Resistance of Low Strength Masonry", country: "India", category: "Seismic", description: "Guidelines for improving earthquake resistance of low strength masonry buildings.", toolIds: ["house"], toolNames: ["House Estimator"], source: "Bureau of Indian Standards (BIS)", year: 1993, lastVerified: LV },
  { id: "is-15988", code: "IS 15988:2013", title: "Seismic Evaluation of Existing Buildings", country: "India", category: "Seismic", description: "Seismic evaluation and strengthening of existing reinforced concrete buildings.", toolIds: ["house"], toolNames: ["House Estimator"], source: "Bureau of Indian Standards (BIS)", year: 2013, lastVerified: LV },
  { id: "is-16700", code: "IS 16700:2023", title: "Structural Safety of Tall Concrete Buildings", country: "India", category: "Design", description: "Criteria for structural safety of tall concrete buildings — additional requirements beyond IS 456 and IS 1893.", toolIds: ["house", "mix-design"], toolNames: ["House Estimator", "Concrete Mix Design Calculator"], source: "Bureau of Indian Standards (BIS)", year: 2023, lastVerified: LV },
  { id: "is-2062", code: "IS 2062:2011", title: "Hot Rolled Steel for General Structural Purposes", country: "India", category: "Steel", description: "Specification for hot rolled medium and high tensile structural steel.", toolIds: ["metal-weight"], toolNames: ["Steel & Metal Weight Calculator"], source: "Bureau of Indian Standards (BIS)", year: 2011, lastVerified: LV },
  { id: "is-2386", code: "IS 2386", title: "Methods of Test for Aggregates", country: "India", category: "Concrete", description: "Methods of test for aggregates for concrete — particle size, shape, specific gravity and deleterious materials, in eight parts.", toolIds: ["mix-design"], toolNames: ["Concrete Mix Design Calculator"], source: "Bureau of Indian Standards (BIS)", lastVerified: LV },
  { id: "is-9103", code: "IS 9103:1999", title: "Concrete Admixtures — Specification", country: "India", category: "Concrete", description: "Specification for concrete admixtures — accelerators, retarders, water reducers and air-entraining agents.", toolIds: ["mix-design"], toolNames: ["Concrete Mix Design Calculator"], source: "Bureau of Indian Standards (BIS)", year: 1999, lastVerified: LV },
  { id: "is-1199", code: "IS 1199:2018", title: "Fresh Concrete — Methods of Sampling and Testing", country: "India", category: "Concrete", description: "Methods of sampling and analysis of fresh concrete, including the slump test for workability.", toolIds: ["mix-design"], toolNames: ["Concrete Mix Design Calculator"], source: "Bureau of Indian Standards (BIS)", year: 2018, lastVerified: LV },
  { id: "is-2502", code: "IS 2502:1963", title: "Bending and Fixing of Bars for Concrete Reinforcement", country: "India", category: "Steel", description: "Code of practice for bending and fixing of bars for concrete reinforcement — bar bending schedules.", toolIds: ["metal-weight"], toolNames: ["Steel & Metal Weight Calculator"], source: "Bureau of Indian Standards (BIS)", year: 1963, lastVerified: LV },
  { id: "morth", code: "MoRTH Specifications (5th Rev.)", title: "Specifications for Road & Bridge Works", country: "India", category: "Infrastructure", description: "Ministry of Road Transport and Highways specifications — the standard for highway construction, earthwork, pavement layers and bridge works in India.", toolIds: ["earthworks"], toolNames: ["Earthworks & Excavation Calculator"], source: "Ministry of Road Transport & Highways, India (MoRTH)", year: 2013, lastVerified: LV },
  { id: "irc-37", code: "IRC:37-2018", title: "Flexible Pavement Design", country: "India", category: "Infrastructure", description: "Guidelines for the design of flexible pavements, calculating traffic loadings (msa), and determining layer thicknesses for bituminous roads.", toolIds: ["earthworks"], toolNames: ["Earthworks & Excavation Calculator"], source: "Indian Roads Congress (IRC)", year: 2018, lastVerified: LV },
  { id: "irc-6", code: "IRC:6-2017", title: "Road Bridges — Loads and Load Combinations", country: "India", category: "Infrastructure", description: "Standard specifications and code of practice for road bridges — loads, forces and load combinations for bridge design.", toolIds: ["earthworks"], toolNames: ["Earthworks & Excavation Calculator"], source: "Indian Roads Congress (IRC)", year: 2017, lastVerified: LV },
  { id: "irc-58", code: "IRC:58-2015", title: "Rigid Pavement Design", country: "India", category: "Infrastructure", description: "Guidelines for the design of plain jointed rigid pavements for highways.", toolIds: ["earthworks"], toolNames: ["Earthworks & Excavation Calculator"], source: "Indian Roads Congress (IRC)", year: 2015, lastVerified: LV },
  { id: "irc-112", code: "IRC:112-2020", title: "Concrete Road Bridges — Code of Practice", country: "India", category: "Infrastructure", description: "Code of practice for concrete road bridges — limit state design of bridge superstructures and substructures.", toolIds: ["earthworks"], toolNames: ["Earthworks & Excavation Calculator"], source: "Indian Roads Congress (IRC)", year: 2020, lastVerified: LV },
  { id: "irc-sp20", code: "IRC:SP:20-2002", title: "Rural Roads Manual", country: "India", category: "Infrastructure", description: "Rural roads manual — planning, design, construction and maintenance of rural roads.", toolIds: ["earthworks"], toolNames: ["Earthworks & Excavation Calculator"], source: "Indian Roads Congress (IRC)", year: 2002, lastVerified: LV },
  // Repo-grounded MoRTH/IRC references (descriptions quote what the repo
  // itself cites — no edition year claimed where the repo gives none):
  // IRC:66 — the gradient engine is an "AASHTO / IRC:66" engine and cites
  // the IRC:66 sag-curve comfort check (src/lib/gradientCalc.ts).
  { id: "irc-66", code: "IRC:66", title: "Geometric Design — Vertical Curves", country: "India", category: "Infrastructure", description: "Geometric design standard for vertical curves and gradients — cited by the gradient engine for the sag-curve comfort check (L ≥ A·V²/46.5).", toolIds: ["gradient-calculator"], toolNames: ["Gradient & Slope Calculator"], source: "Indian Roads Congress (IRC)", lastVerified: LV },
  // MoRTH Cl. 401/406 — the sieve spec database lists "MoRTH GSB / WMM
  // (IRC:37 / MoRTH Cl. 401/406)" (src/data/sieveSpecs.ts).
  { id: "morth-401-406", code: "MoRTH Cl. 401 / 406", title: "Granular Sub-Base & Wet Mix Macadam", country: "India", category: "Infrastructure", description: "Granular pavement layers — Granular Sub-Base (Clause 401) and Wet Mix Macadam (Clause 406) gradation envelopes, checked against IRC:37 / MoRTH.", toolIds: ["master-sieve"], toolNames: ["Master Sieve Analysis Calculator"], source: "Ministry of Road Transport & Highways, India (MoRTH)", lastVerified: LV },
  // MoRTH bituminous-mix tables — envelopes are "MoRTH, verbatim" in the
  // pavement-mix engine (src/lib/pavementMixCalc.ts) and the minimum
  // bitumen contents are stated in the site FAQ (src/components/ui/GlobalFAQ.tsx).
  { id: "morth-mixes", code: "MoRTH Tables 500-10 / 500-17 · Cl. 515", title: "Bituminous Mix Gradations & Bitumen Content", country: "India", category: "Infrastructure", description: "MoRTH gradation envelopes for pavement mixes — GSB Grade I Table 400-1, DBM Grades 1–2 Table 500-10, SMA Clause 515, Bituminous Concrete Grades 1–2 Table 500-17. Minimum bitumen: 4.5% DBM, 5.8% SMA, 5.0% bituminous concrete.", toolIds: ["pavement-mix"], toolNames: ["Pavement Mix & Aggregate Gradation Calculator"], source: "Ministry of Road Transport & Highways, India (MoRTH)", lastVerified: LV },
  { id: "bcp-2021", code: "BCP-2021", title: "Building Code of Pakistan", country: "Pakistan", category: "Building", description: "Seismic provisions and general building construction guidelines for structural, fire, and life safety in Pakistan. Formulated by the PEC.", toolIds: ["house", "staircase-calculator"], toolNames: ["House Estimator", "Staircase Calculator"], pdfLink: "/assets/standards/bcp-2021.pdf", source: "Pakistan Engineering Council (PEC)", year: 2021, lastVerified: LV },
  { id: "nha-specs", code: "NHA Specs", title: "NHA General Specifications", country: "Pakistan", category: "Infrastructure", description: "Standard specifications for road and bridge works by the National Highway Authority (NHA) of Pakistan, detailing earthwork, sub-base, and asphalt provisions.", toolIds: ["earthworks"], toolNames: ["Earthworks & Excavation Calculator"], source: "National Highway Authority, Pakistan (NHA)", lastVerified: LV },
  { id: "pec-bidding", code: "PEC Documents", title: "Standard Bidding Documents", country: "Pakistan", category: "Management", description: "Pakistan Engineering Council (PEC) standard guidelines for procurement of civil works, contracting, and BOQ formulations.", toolIds: ["qs-workflow"], toolNames: ["BOQ Generator"], source: "Pakistan Engineering Council (PEC)", lastVerified: LV },
  { id: "lda-bylaws", code: "LDA Regulations", title: "LDA Building & Zoning Regulations", country: "Pakistan", category: "Building", description: "Lahore Development Authority building and zoning regulations — plot coverage, setbacks, height limits and approval procedure for Lahore. These are local bylaws, not a national code.", toolIds: ["house"], toolNames: ["House Estimator"], source: "Lahore Development Authority (LDA)", lastVerified: LV },
  { id: "dha-bylaws", code: "DHA Bye-Laws", title: "DHA Building Control Bye-Laws", country: "Pakistan", category: "Building", description: "Defence Housing Authority building control bye-laws — construction rules, setbacks and approvals inside DHA housing schemes. These are local bylaws, not a national code.", toolIds: ["house"], toolNames: ["House Estimator"], source: "Defence Housing Authority (DHA)", lastVerified: LV },
  { id: "dbc", code: "DBC", title: "Dubai Building Code", country: "UAE", category: "Building", description: "Comprehensive code designed to unify building design across Dubai, focusing on structural stability, safety, sustainability, and accessibility.", toolIds: ["house", "beam-design"], toolNames: ["House Estimator", "RCC Beam Design Tool (IS 456)"], source: "Dubai Municipality", lastVerified: LV },
  { id: "adibc", code: "ADIBC", title: "Abu Dhabi International Building Code", country: "UAE", category: "Building", description: "Based on the International Building Code (IBC) with tailored amendments for the Emirate of Abu Dhabi to regulate commercial and residential construction.", toolIds: ["house"], toolNames: ["House Estimator"], source: "Department of Municipalities and Transport, Abu Dhabi", lastVerified: LV },
  { id: "uae-fire", code: "UAE FLSC 2018", title: "UAE Fire and Life Safety Code", country: "UAE", category: "Safety", description: "Mandatory civil defence requirements for fire protection systems, egress strategies, and facade safety across all Emirates.", toolIds: ["qs-workflow"], toolNames: ["BOQ Generator"], source: "UAE Civil Defence (Ministry of Interior)", year: 2018, lastVerified: LV },
];

/**
 * Per-country SEO for the routes that render this page
 * (/is-codes-reference → India; /pakistan-building-codes → Pakistan;
 * /uae-construction-standards → UAE). /morth-irc-specs renders the same
 * component but in "morth-irc" mode (see MORTH_SEO below): it used to
 * render the identical IS-codes page and canonicalise to
 * /is-codes-reference, which is why the route showed the wrong content.
 * The MoRTH/IRC page now has its own title, description and canonical.
 * Pakistan and UAE canonicalise to their own route.
 */
const SEO_BY_COUNTRY: Record<string, { title: string; description: string; canonicalPath?: string; h1Main: string; h1Accent: string; h1Suffix: string }> = {
  India: {
    title: "Indian Standards & Codes Reference",
    description: "Indian Standard codes and MoRTH/IRC specifications — IS 456, IS 800, IS 10262 and highway specs, with scope, clauses and linked calculators.",
    canonicalPath: "/is-codes-reference",
    h1Main: "Indian",
    h1Accent: "Standards & Codes",
    h1Suffix: "",
  },
  Pakistan: {
    title: "Pakistan Building Codes Reference",
    description: "Building Code of Pakistan, NHA specifications and LDA/DHA bylaws — seismic provisions, zoning rules and approval requirements for building in Pakistan.",
    canonicalPath: "/pakistan-building-codes",
    h1Main: "Pakistan",
    h1Accent: "Building Codes",
    h1Suffix: "",
  },
  UAE: {
    title: "UAE Construction Standards Reference",
    description: "Dubai Building Code, Abu Dhabi International Building Code and UAE Fire & Life Safety Code — the construction standards behind our UAE calculators.",
    canonicalPath: "/uae-construction-standards",
    h1Main: "UAE",
    h1Accent: "Construction Standards",
    h1Suffix: "",
  },
  All: {
    title: "Engineering Standards & Codes Hub",
    description: "A reference library of civil engineering standards and building codes for India, Pakistan and the UAE — IS codes, MoRTH, BCP and Dubai Municipality.",
    canonicalPath: "/standards",
    h1Main: "Engineering",
    h1Accent: "Standards & Codes",
    h1Suffix: "Hub",
  },
};

/** The MoRTH/IRC subset of standardsData shown in "morth-irc" mode. */
const MORTH_IRC_IDS = new Set([
  "morth", "irc-37", "irc-6", "irc-58", "irc-112", "irc-sp20",
  "irc-66", "morth-401-406", "morth-mixes",
]);

/** SEO for /morth-irc-specs — its own title/description/canonical. */
const MORTH_SEO = {
  title: "MoRTH & IRC Specifications Guide",
  description: "MoRTH Specifications for Road and Bridge Works (5th Rev., 2013) and IRC codes — IRC:37-2018 flexible pavements, IRC:58-2015 rigid pavements, IRC:6-2017 bridge loads and IRC:112-2020 concrete bridges, with scope and linked calculators.",
  canonicalPath: "/morth-irc-specs",
  h1Main: "MoRTH & IRC",
  h1Accent: "Specifications",
  h1Suffix: "",
};

const MORTH_FAQS = [
  { question: "Which code governs flexible pavement design in India?", answer: "IRC:37-2018, Guidelines for the Design of Flexible Pavements — it sets the pavement crust (GSB, WMM, DBM, BC) from subgrade CBR and traffic in millions of standard axles (MSA). The Road Pavement Estimator on this site uses IRC:37-2018 / MoRTH layer practice for quantities; thickness is guidance, not a design." },
  { question: "What are the MoRTH Specifications for Road and Bridge Works?", answer: "The Ministry of Road Transport & Highways specifications (5th Revision, 2013) — the standard for highway construction in India, covering earthwork, granular and bituminous pavement layers and bridge works. The granular and bituminous clauses (e.g. Cl. 401 GSB, Cl. 406 WMM, Tables 500-10/500-17) are what our sieve and pavement-mix tools check against." },
  { question: "What is the difference between IRC:37 and IRC:58?", answer: "IRC:37-2018 designs flexible (bituminous) pavements; IRC:58-2015 designs plain jointed rigid (concrete) pavements. A rigid-pavement slab must be designed per IRC:58-2015 (cumulative fatigue damage CFD ≤ 1.0) by a pavement engineer — our Rigid Pavement Estimator is quantities only." },
];

/**
 * FAQs for the non-MoRTH standards pages — one set per page, because
 * the old single set led with a Pakistan question on the Indian and
 * UAE pages too. Each set is grounded in that page's own standards
 * entries above. The FAQPage JSON-LD below is built from the same
 * list the visible accordion shows (see pageFaqs).
 */
const IS_STANDARDS_FAQS = [
  { question: "What is IS 456?", answer: "IS 456:2000 is the primary Indian Standard code of practice for plain and reinforced concrete — design clauses, material specifications and workmanship for general structural use. It is published by the Bureau of Indian Standards (BIS)." },
  { question: "What is the difference between IS 456 and IS 10262?", answer: "IS 456 is the code of practice for designing reinforced concrete structures; IS 10262 is the guideline for proportioning the concrete mix itself (cement, sand, aggregate and water) to hit a target strength." },
  { question: "Why do some standards have no PDF?", answer: "Only the Building Code of Pakistan PDF is hosted on this site. Other codes are copyrighted publications — their full text must be bought or accessed from the publishing body (BIS, IRC, PEC or NHA)." },
];

const PAK_STANDARDS_FAQS = [
  { question: "Which code governs house construction in Pakistan?", answer: "The Building Code of Pakistan (BCP-2021), formulated by the PEC, with local bylaws on top — for example the LDA Building & Zoning Regulations in Lahore or the DHA bye-laws inside DHA schemes." },
  { question: "Do local bylaws apply on top of the Building Code of Pakistan?", answer: "Yes. BCP-2021 is the national code, and local bylaws sit on top of it — the LDA Building & Zoning Regulations cover plot coverage, setbacks, height limits and approval procedure in Lahore, and the DHA building control bye-laws govern construction inside DHA schemes. Those are local bylaws, not a national code." },
  { question: "Why do some standards have no PDF?", answer: "Only the Building Code of Pakistan PDF is hosted on this site. Other codes are copyrighted publications — their full text must be bought or accessed from the publishing body (BIS, IRC, PEC or NHA)." },
];

const UAE_STANDARDS_FAQS = [
  { question: "Which code governs building construction in Dubai?", answer: "The Dubai Building Code (DBC), published by Dubai Municipality — one code unifying building design across Dubai, covering structural stability, safety, sustainability and accessibility." },
  { question: "What is the Abu Dhabi International Building Code?", answer: "The Abu Dhabi International Building Code (ADIBC) is based on the International Building Code (IBC), with tailored amendments for the Emirate of Abu Dhabi." },
  { question: "What fire safety code applies in the UAE?", answer: "The UAE Fire and Life Safety Code of Practice (2018), issued by Civil Defence — mandatory requirements for fire protection systems, egress and facade safety across all Emirates." },
];

const HUB_STANDARDS_FAQS = [
  { question: "What standards does this library cover?", answer: "Indian Standards (IS 456, IS 800, IS 10262, IS 1200 and others), MoRTH Specifications and IRC codes for roads, the Building Code of Pakistan (BCP-2021) with NHA specifications and LDA/DHA bylaws, and the UAE codes — Dubai Building Code, Abu Dhabi International Building Code and the UAE Fire and Life Safety Code." },
  { question: "What is the difference between IS 456 and IS 10262?", answer: "IS 456 is the code of practice for designing reinforced concrete structures; IS 10262 is the guideline for proportioning the concrete mix itself (cement, sand, aggregate and water) to hit a target strength." },
  { question: "Why do some standards have no PDF?", answer: "Only the Building Code of Pakistan PDF is hosted on this site. Other codes are copyrighted publications — their full text must be bought or accessed from the publishing body (BIS, IRC, PEC or NHA)." },
];

export type StandardsMode = "is-codes" | "morth-irc";

/**
 * Detect the mode from the URL when no explicit mode prop is given.
 * App.tsx passes initialActiveCountry="India" for BOTH /is-codes-reference
 * and /morth-irc-specs, so the country prop cannot distinguish them — the
 * route itself is the discriminator. Uses getEffectivePathname() so hash
 * deep links (#/morth-irc-specs, after the 404.html redirect) work too.
 * App may also pass initialMode="morth-irc" directly; the prop wins.
 */
function detectModeFromUrl(): StandardsMode | null {
  if (typeof window === "undefined") return null;
  return getEffectivePathname().split("/").includes("morth-irc-specs") ? "morth-irc" : null;
}

export default function StandardsReferencePage({ onNavigate, initialActiveCountry = "All", initialMode }: { onNavigate?: (id: string) => void, initialActiveCountry?: string, initialMode?: StandardsMode }) {
  // Mode is DERIVED on every render from the prop (or the URL) — never
  // captured once in a useState initializer. In-app navigation reuses
  // this component across the four standards routes, and an initializer
  // would keep the mode of the first route visited (stale MoRTH /
  // IS-codes) whenever React reuses the mounted instance. App passes
  // initialMode explicitly per route; the URL is the fallback for
  // direct loads and the /standards hub.
  const mode: StandardsMode = initialMode ?? detectModeFromUrl() ?? "is-codes";
  const isMorth = mode === "morth-irc";
  const [activeCountry, setActiveCountry] = useState(initialActiveCountry);
  // The country filter is user state, but its starting value comes from
  // the route — resync when the route changes, so the Pakistan / UAE
  // pages cannot keep India's filter from the previous route.
  useEffect(() => { setActiveCountry(initialActiveCountry); }, [initialActiveCountry]);
  const [searchTerm, setSearchTerm] = useState("");
  const [yearFilter, setYearFilter] = useState<string>("All");
  const [viewPdfUrl, setViewPdfUrl] = useState<string | null>(null);
  const seo = isMorth ? MORTH_SEO : (SEO_BY_COUNTRY[initialActiveCountry] ?? SEO_BY_COUNTRY.All);
  // The visible FAQ list for this page — one set per route, selected
  // by mode and country. The FAQPage JSON-LD below is built from this
  // same list via getCombinedFaqs.
  const pageFaqs = isMorth
    ? MORTH_FAQS
    : initialActiveCountry === "Pakistan"
      ? PAK_STANDARDS_FAQS
      : initialActiveCountry === "UAE"
        ? UAE_STANDARDS_FAQS
        : initialActiveCountry === "India"
          ? IS_STANDARDS_FAQS
          : HUB_STANDARDS_FAQS;

  /**
   * The guide toolId for THIS route — derived from the same route props
   * as `mode` above, never from the user-editable country filter state
   * (`activeCountry`): clicking a filter pill must not swap the guide.
   * App.tsx passes initialMode explicitly per route and the URL is the
   * fallback (detectModeFromUrl), so mode wins over country:
   *   morth-irc mode            -> "morth-irc-specs" (both IS-codes and
   *                                MoRTH routes pass country "India")
   *   country "Pakistan"        -> "pakistan-building-codes"
   *   country "UAE"             -> "uae-construction-standards"
   *   country "India"           -> "is-codes-reference"
   *   hub (country "All", /standards, no props) -> undefined: no guide
   *                                exists for the hub, so no widget and
   *                                no HowTo are rendered there.
   * All four ids have a verified R3A guide with workedExample.steps in
   * TOOL_GUIDES (src/seo/toolGuides.ts).
   */
  const standardsToolId: string | undefined = isMorth
    ? "morth-irc-specs"
    : initialActiveCountry === "Pakistan"
      ? "pakistan-building-codes"
      : initialActiveCountry === "UAE"
        ? "uae-construction-standards"
        : initialActiveCountry === "India"
          ? "is-codes-reference"
          : undefined;
  // Per-tool HowTo steps, SEOHead pattern: the worked-example steps
  // from this route's own verified guide, if one exists — never invented.
  const guideSteps: string[] = standardsToolId
    ? TOOL_GUIDES[standardsToolId]?.workedExample?.steps ?? []
    : [];

  const countries = ["All", "India", "Pakistan", "UAE"];
  const years = ["All", ...Array.from(new Set(standardsData.map((s) => s.year).filter((y): y is number => y != null))).sort((a, b) => b - a).map(String)];

  const filteredStandards = standardsData.filter(std => {
    // MoRTH/IRC mode shows only the MoRTH/IRC subset — never the IS codes.
    const matchesMode = !isMorth || MORTH_IRC_IDS.has(std.id);
    const matchesCountry = activeCountry === "All" || std.country === activeCountry;
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = std.code.toLowerCase().includes(searchLower) || std.title.toLowerCase().includes(searchLower);
    const matchesYear = yearFilter === "All" || (std.year != null && String(std.year) === yearFilter);
    return matchesMode && matchesCountry && matchesSearch && matchesYear;
  });

  return (
    <div className="min-h-screen bg-[#FAF8F5] font-sans pb-24">
      <SEO
        title={seo.title}
        description={seo.description}
        canonicalUrl={seo.canonicalPath ? `${getSiteUrl()}${seo.canonicalPath}` : undefined}
        schema={{
          "@context": "https://schema.org",
          "@graph": [
            SITE_WEB_APP,
            ...(guideSteps.length > 0
              ? [
                  {
                    "@type": "HowTo",
                    "name": `How to use ${seo.title}`,
                    "step": guideSteps.map((text) => ({ "@type": "HowToStep", "text": text })),
                  },
                ]
              : []),
            {
              "@type": "FAQPage",
              "mainEntity": getCombinedFaqs("standards-reference", pageFaqs).map((f) => ({
                "@type": "Question",
                "name": f.question,
                "acceptedAnswer": { "@type": "Answer", "text": f.answer },
              })),
            },
          ],
        }}
      />
      {/* Header Section */}
      <div className="bg-[#FAF8F5] border-b border-[#E8E4D9] pt-20 pb-16 px-6 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full bg-[#E8E4D9]/20 blur-[120px] pointer-events-none"></div>

        <div className="w-full md:max-w-7xl md:mx-auto flex flex-col items-center text-center relative z-10 px-4 md:px-0">
          <BookOpen className="w-12 h-12 text-[#B39B72] mb-6" />
          <h1 className="md: lg: text-[#4A443B] mb-4 relative text-xl font-semibold text-txt-primary tracking-tight mb-6">
            {seo.h1Main} <span className="text-[#B39B72]">{seo.h1Accent}</span>{seo.h1Suffix ? ` ${seo.h1Suffix}` : ""}
          </h1>
          <p className="text-[#8B8476] max-w-2xl mb-10 text-base font-normal text-txt-secondary leading-relaxed">
            {isMorth
              ? "MoRTH Specifications for Road and Bridge Works and the Indian Roads Congress codes behind our pavement, bridge and earthworks calculators — flexible and rigid pavement design, bridge loads, granular and bituminous layers, and rural roads."
              : "A comprehensive reference library of the civil engineering standards, specifications, and building codes powering our estimation tools across key international markets."}
          </p>

          <div className="w-full max-w-xl relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A39D93]" />
            <><label htmlFor="a11y-input-9" className="sr-only">{isMorth ? "Search MoRTH / IRC specs (e.g. 'IRC:37')..." : "Search by code (e.g. 'IS 456') or title..."}</label>
<input id="a11y-input-9"
              type="text"
              placeholder={isMorth ? "Search MoRTH / IRC specs (e.g. 'IRC:37')..." : "Search by code (e.g. 'IS 456') or title..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-surface-default border border-[#E8E4D9] rounded-full py-4 pl-12 pr-4 text-[#4A443B] placeholder-[#A39D93] focus:outline-none focus:ring-2 focus:ring-accent-500 focus:outline-none focus:ring-[#B39B72]/50 shadow-brand-sm overflow-hidden"
            /></>
          </div>
        </div>
      </div>

      <div className="w-full md:max-w-7xl md:mx-auto px-6 pt-10">
        {/* Country + Year Filters */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
          <label className="text-sm font-bold text-txt-secondary">Year:</label>
          <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)} className="px-4 py-2.5 bg-surface-default border border-[#E8E4D9] rounded-full text-base font-medium text-[#4A443B] outline-none">
            {years.map((y) => (<option key={y} value={y}>{y === "All" ? "All years" : y}</option>))}
          </select>
          <span className="text-sm text-txt-tertiary">{filteredStandards.length} standard(s) shown</span>
        </div>
        {/* Country filter — hidden in MoRTH/IRC mode: every entry there is
            Indian by definition, so the pills would only re-show IS codes. */}
        {!isMorth && (
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
          {countries.map(country => (
            <Button
              key={country}
              onClick={() => setActiveCountry(country)}
              className={`px-5 py-2.5 rounded-full text-base font-medium transition-all shadow-brand-sm
                ${activeCountry === country 
                  ? 'bg-ink text-white shadow-brand-md' 
                  : 'bg-surface-default text-[#8B8476] border border-[#E8E4D9] hover:bg-[#F2EFE9] hover:text-[#4A443B]'
                }`}
            >
              {country}
            </Button>
          ))}
        </div>
        )}
        {isMorth && (
          <p className="text-center text-sm text-txt-tertiary mb-12">Showing {filteredStandards.length} MoRTH / IRC specification(s) — use the search box or year filter to narrow them down.</p>
        )}

        {/* Standards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 rounded-full transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-brand-lg shadow-brand-sm">
          {filteredStandards.length > 0 ? (
            filteredStandards.map(std => (
              <div 
                key={std.id} 
                className="w-full bg-surface-default border border-[#E8E4D9] rounded-2xl p-4 sm:p-6 flex flex-col group hover:border-[#B39B72] hover:shadow-brand-lg transition-all duration-300 overflow-hidden"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="font-mono text-base font-medium bg-accent-50 text-accent-800 border border-accent-100 px-3 py-1 rounded-lg">
                    {std.code}
                  </div>
                  <div className="flex items-center gap-1.5 text-sm uppercase tracking-wider font-bold text-[#A39D93] bg-[#FAF8F5] px-2 py-1 rounded border border-[#E8E4D9]">
                    <ShieldCheck className="w-3 h-3 text-[#B39B72]" />
                    {std.country}
                  </div>
                </div>

                <div className="mb-2">
                   <span className={`text-sm inline-block uppercase font-bold tracking-widest mb-2 px-2 py-0.5 rounded-full ${
                      std.category === 'Concrete' ? 'bg-accent-50 text-accent-800' :
                      std.category === 'Steel' ? 'bg-surface-hover text-txt-secondary' :
                      std.category === 'Building' ? 'bg-accent-50 text-accent-800' :
                      std.category === 'Infrastructure' ? 'bg-ui-success text-ui-successText' :
                      std.category === 'Safety' ? 'bg-ui-error text-ui-errorText' :
                      'bg-accent-50 text-accent-800'
                   }`}>
                    {std.category}
                   </span>
                   <h3 className="text-[#4A443B] group-hover:text-accent-800 transition-colors text-lg font-medium text-txt-primary mb-4">
                    {std.title}
                   </h3>
                </div>

                <p className="text-[#8B8476] mb-2 flex-grow text-base font-normal text-txt-secondary leading-relaxed">
                  {std.description}
                </p>
                <p className="text-xs text-[#A39D93] mb-6">Source: {std.source}{std.year ? ` · Edition ${std.year}` : ""} · Verified {std.lastVerified}{std.pdfLink ? "" : " · Full text from the publishing body — no PDF hosted here"}</p>

                {std.pdfLink && (
                  <div className="mb-6 flex gap-2 flex-wrap">
                    <Button
                      onClick={() => setViewPdfUrl(std.pdfLink ?? null)}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-[#F2EFE9] hover:bg-ink-700 hover:text-txt-primary border border-[#E8E4D9] rounded-full text-base font-medium text-[#4A443B] transition-colors active:scale-95 hover:-translate-y-0.5 hover:shadow-brand-lg shadow-brand-sm"
                    >
                      <Eye className="w-4 h-4" />
                      Read PDF
                    </Button>
                    <a
                      href={std.pdfLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="inline-flex items-center gap-2 px-3 py-2 bg-surface-default hover:bg-[#F2EFE9] border border-[#E8E4D9] rounded-lg text-base font-medium text-[#6A6458] transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </a>
                  </div>
                )}

                <div className="pt-5 border-t border-[#E8E4D9]">
                  <p className="text-[#A39D93] uppercase tracking-widest mb-3 text-base font-normal text-txt-secondary leading-relaxed">Integrations</p>
                  <div className="flex flex-wrap gap-2">
                    {std.toolNames.map((tool, idx) => (
                      <Button
                        key={idx}
                        onClick={() => onNavigate?.(std.toolIds[idx])}
                        className="text-base font-medium px-2.5 py-1.5 bg-[#FAF8F5] hover:bg-accent-50 hover:text-accent-800 border border-[#E8E4D9] hover:border-accent-200 rounded-full text-[#6A6458] transition-colors flex items-center gap-1.5 cursor-pointer active:scale-95 hover:-translate-y-0.5 hover:shadow-brand-lg shadow-brand-sm"
                      >
                        {tool}
                        <ArrowRight className="w-3 h-3 opacity-50" />
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            ))
          ) : (
             <div className="col-span-full py-20 text-center">
               <BookOpen className="w-12 h-12 text-[#A39D93] mx-auto mb-4" />
               <h3 className="text-[#6A6458] mb-2 text-lg font-medium text-txt-primary mb-4">No standards found</h3>
               <p className="text-[#A39D93] text-base font-normal text-txt-secondary leading-relaxed">Try adjusting your search term or country filter.</p>
             </div>
          )}
        </div>

        {/* Bottom CTA */}
        <div className="w-full mt-20 bg-surface-default border border-[#E8E4D9] rounded-2xl p-4 sm:p-8 md:p-5 sm:p-12 text-center md:max-w-4xl md:mx-auto shadow-brand-sm overflow-hidden">
           <h2 className="md: text-[#4A443B] mb-4 text-xl font-semibold text-txt-primary tracking-tight">Ready to put these standards into practice?</h2>
           <p className="w-full text-[#8B8476] mb-8 md:max-w-xl md:mx-auto text-base font-normal text-txt-secondary leading-relaxed px-4 md:px-0">Access 75+ professional civil engineering calculators and tools that automatically apply these specific country codes to your estimates.</p>
           <Button onClick={() => {
              if (onNavigate) {
                 onNavigate('home');
              } else {
                 window.location.href = '/#tools';
              }
           }} className="px-8 py-4 bg-ink hover:bg-ink-700 text-white font-bold rounded-full transition-all shadow-brand-md hover:shadow-brand-lg active:scale-95 hover:-translate-y-0.5">
             Explore All Tools
           </Button>
        </div>
      </div>

      <div className="w-full md:max-w-7xl md:mx-auto px-6">
        {/* Guide article — same position as ModuleWrapper (App.tsx):
            below the main content, above the FAQ. Only the four routed
            pages have a guide; the /standards hub renders none. */}
        {standardsToolId && (
          <ToolArticleWidget toolId={standardsToolId} toolName={seo.title} />
        )}
        <GlobalFAQ
          moduleId="standards-reference"
          faqs={pageFaqs}
        />
      </div>

      {viewPdfUrl && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-[#FAF8F5]/90 backdrop-blur-sm p-4 sm:p-8">
          <div className="bg-surface-default rounded-2xl w-full max-w-5xl h-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative border border-[#E8E4D9]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E4D9] bg-[#FAF8F5]">
              <h2 className="text-[#4A443B] text-xl font-semibold text-txt-primary tracking-tight mb-4">Reading Mode</h2>
              <div className="flex items-center gap-3">
                <a
                  href={viewPdfUrl}
                  download
                  className="flex items-center gap-2 px-4 py-2 bg-surface-default border border-[#E8E4D9] text-[#4A443B] hover:bg-[#F2EFE9] font-semibold rounded-xl transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download
                </a>
                <Button
                  onClick={() => setViewPdfUrl(null)}
                  className="p-2 text-[#A39D93] hover:text-[#4A443B] hover:bg-[#E8E4D9]/50 rounded-full transition-colors active:scale-95 hover:-translate-y-0.5 hover:shadow-brand-lg shadow-brand-sm"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
            <div className="flex-1 bg-[#F2EFE9] overflow-hidden relative">
               <iframe
                  src={viewPdfUrl}
                  className="w-full h-full border-none"
                  title="PDF Viewer"
               />
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
