import { Button } from './ui/Button';
import { GlobalFAQ } from './ui/GlobalFAQ';
import React, { useState } from "react";
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
  { id: "is-456", code: "IS 456:2000", title: "Plain and Reinforced Concrete", country: "India", category: "Concrete", description: "The primary Indian Standard code of practice for general structural use of plain and reinforced concrete. Covers design clauses, material specifications, and workmanship.", toolIds: ["concrete-advanced", "house"], toolNames: ["Concrete Mix Design", "House Estimator"], source: "Bureau of Indian Standards (BIS)", year: 2000, lastVerified: LV },
  { id: "is-800", code: "IS 800:2007", title: "General Construction in Steel", country: "India", category: "Steel", description: "Code of practice for general construction in steel, using the limit state design method for structural steel detailing.", toolIds: ["interactive-steel", "house"], toolNames: ["Interactive Steel Calculator", "House Estimator"], source: "Bureau of Indian Standards (BIS)", year: 2007, lastVerified: LV },
  { id: "is-10262", code: "IS 10262:2019", title: "Concrete Mix Proportioning", country: "India", category: "Concrete", description: "Guidelines for proportioning of concrete mixes to achieve specified characteristics like workability, compressive strength, and durability.", toolIds: ["concrete-advanced"], toolNames: ["Concrete Mix Design"], source: "Bureau of Indian Standards (BIS)", year: 2019, lastVerified: LV },
  { id: "is-1200", code: "IS 1200", title: "Method of Measurement", country: "India", category: "Quantity", description: "Standardizes the method of measurement of building and civil engineering works for preparation of estimates and bills of quantities. Plaster deductions: under 0.5 m² none, 0.5–3 m² one face, over 3 m² both faces.", toolIds: ["house", "qs-workflow"], toolNames: ["House Estimator", "BOQ Generator"], source: "Bureau of Indian Standards (BIS)", lastVerified: LV },
  { id: "is-1893", code: "IS 1893 (Part 1):2016", title: "Earthquake Resistant Design of Structures", country: "India", category: "Seismic", description: "Criteria for earthquake resistant design of structures — seismic zones, design spectrum and base shear. Part 1 covers general provisions and buildings.", toolIds: ["house", "concrete-advanced"], toolNames: ["House Estimator", "Concrete Mix Design"], source: "Bureau of Indian Standards (BIS)", year: 2016, lastVerified: LV },
  { id: "is-13920", code: "IS 13920:2016", title: "Ductile Design and Detailing of RC Structures", country: "India", category: "Seismic", description: "Ductile design and detailing of reinforced concrete structures subjected to seismic forces — companion to IS 1893 for seismic zones III, IV and V.", toolIds: ["concrete-advanced", "house"], toolNames: ["Concrete Mix Design", "House Estimator"], source: "Bureau of Indian Standards (BIS)", year: 2016, lastVerified: LV },
  { id: "is-383", code: "IS 383:2016", title: "Coarse and Fine Aggregate for Concrete", country: "India", category: "Concrete", description: "Specification for coarse and fine aggregates from natural sources for concrete, including grading zones for sand.", toolIds: ["concrete-advanced"], toolNames: ["Concrete Mix Design"], source: "Bureau of Indian Standards (BIS)", year: 2016, lastVerified: LV },
  { id: "is-1786", code: "IS 1786:2008", title: "High Strength Deformed Steel Bars (TMT)", country: "India", category: "Steel", description: "Specification for high strength deformed steel bars and wires for concrete reinforcement — the TMT bars used in RCC work.", toolIds: ["interactive-steel", "house"], toolNames: ["Interactive Steel Calculator", "House Estimator"], source: "Bureau of Indian Standards (BIS)", year: 2008, lastVerified: LV },
  { id: "is-875", code: "IS 875", title: "Design Loads for Buildings and Structures", country: "India", category: "Design", description: "Code of practice for design loads (other than earthquake) — dead, imposed, wind, snow and special loads, in five parts.", toolIds: ["house", "concrete-advanced"], toolNames: ["House Estimator", "Concrete Mix Design"], source: "Bureau of Indian Standards (BIS)", lastVerified: LV },
  { id: "is-1904", code: "IS 1904:1986", title: "Foundations in Soils — General Requirements", country: "India", category: "Geotechnical", description: "Code of practice for design and construction of foundations in soils — general requirements for shallow and deep foundations.", toolIds: ["house", "earthwork-advanced"], toolNames: ["House Estimator", "Earthwork"], source: "Bureau of Indian Standards (BIS)", year: 1986, lastVerified: LV },
  { id: "is-3370", code: "IS 3370", title: "Concrete Structures for Storage of Liquids", country: "India", category: "Concrete", description: "Code of practice for concrete structures for the storage of liquids — water tanks, reservoirs and similar structures.", toolIds: ["house", "concrete-advanced"], toolNames: ["House Estimator", "Concrete Mix Design"], source: "Bureau of Indian Standards (BIS)", lastVerified: LV },
  { id: "is-516", code: "IS 516:2021", title: "Hardened Concrete — Methods of Test", country: "India", category: "Concrete", description: "Methods of tests for strength of concrete — cube and beam testing, the basis for 28-day compressive strength results.", toolIds: ["concrete-advanced"], toolNames: ["Concrete Mix Design"], source: "Bureau of Indian Standards (BIS)", year: 2021, lastVerified: LV },
  { id: "is-269", code: "IS 269:2015", title: "Ordinary Portland Cement, 33 Grade", country: "India", category: "Concrete", description: "Specification for 33 grade ordinary Portland cement — chemical and physical requirements.", toolIds: ["concrete-advanced"], toolNames: ["Concrete Mix Design"], source: "Bureau of Indian Standards (BIS)", year: 2015, lastVerified: LV },
  { id: "is-8112", code: "IS 8112:2013", title: "Ordinary Portland Cement, 43 Grade", country: "India", category: "Concrete", description: "Specification for 43 grade ordinary Portland cement.", toolIds: ["concrete-advanced"], toolNames: ["Concrete Mix Design"], source: "Bureau of Indian Standards (BIS)", year: 2013, lastVerified: LV },
  { id: "is-12269", code: "IS 12269:2013", title: "Ordinary Portland Cement, 53 Grade", country: "India", category: "Concrete", description: "Specification for 53 grade ordinary Portland cement — the grade most commonly used in RCC work.", toolIds: ["concrete-advanced"], toolNames: ["Concrete Mix Design"], source: "Bureau of Indian Standards (BIS)", year: 2013, lastVerified: LV },
  { id: "is-4031", code: "IS 4031", title: "Methods of Physical Tests for Cement", country: "India", category: "Concrete", description: "Methods of physical tests for hydraulic cement — fineness, setting time, soundness and strength.", toolIds: ["concrete-advanced"], toolNames: ["Concrete Mix Design"], source: "Bureau of Indian Standards (BIS)", lastVerified: LV },
  { id: "is-1077", code: "IS 1077:1992", title: "Common Burnt Clay Building Bricks", country: "India", category: "Masonry", description: "Specification for common burnt clay building bricks — dimensions, classes and compressive strength.", toolIds: ["house"], toolNames: ["House Estimator"], source: "Bureau of Indian Standards (BIS)", year: 1992, lastVerified: LV },
  { id: "is-2212", code: "IS 2212:1991", title: "Brick Work — Code of Practice", country: "India", category: "Masonry", description: "Code of practice for brick work — bonding, mortar, joints and workmanship for brick masonry.", toolIds: ["house"], toolNames: ["House Estimator"], source: "Bureau of Indian Standards (BIS)", year: 1991, lastVerified: LV },
  { id: "is-1905", code: "IS 1905:1987", title: "Structural Use of Unreinforced Masonry", country: "India", category: "Masonry", description: "Code of practice for structural use of unreinforced masonry — design of load-bearing masonry walls.", toolIds: ["house"], toolNames: ["House Estimator"], source: "Bureau of Indian Standards (BIS)", year: 1987, lastVerified: LV },
  { id: "is-2250", code: "IS 2250:1981", title: "Preparation and Use of Masonry Mortars", country: "India", category: "Masonry", description: "Code of practice for preparation and use of masonry mortars — mixes, mixing and application.", toolIds: ["house"], toolNames: ["House Estimator"], source: "Bureau of Indian Standards (BIS)", year: 1981, lastVerified: LV },
  { id: "is-1343", code: "IS 1343:2012", title: "Prestressed Concrete — Code of Practice", country: "India", category: "Concrete", description: "Code of practice for prestressed concrete — design and construction of prestressed members.", toolIds: ["concrete-advanced"], toolNames: ["Concrete Mix Design"], source: "Bureau of Indian Standards (BIS)", year: 2012, lastVerified: LV },
  { id: "is-4326", code: "IS 4326:2013", title: "Earthquake Resistant Design of Masonry Buildings", country: "India", category: "Seismic", description: "Code of practice for earthquake resistant design and construction of masonry buildings.", toolIds: ["house"], toolNames: ["House Estimator"], source: "Bureau of Indian Standards (BIS)", year: 2013, lastVerified: LV },
  { id: "is-13828", code: "IS 13828:1993", title: "Improving Earthquake Resistance of Low Strength Masonry", country: "India", category: "Seismic", description: "Guidelines for improving earthquake resistance of low strength masonry buildings.", toolIds: ["house"], toolNames: ["House Estimator"], source: "Bureau of Indian Standards (BIS)", year: 1993, lastVerified: LV },
  { id: "is-15988", code: "IS 15988:2013", title: "Seismic Evaluation of Existing Buildings", country: "India", category: "Seismic", description: "Seismic evaluation and strengthening of existing reinforced concrete buildings.", toolIds: ["house"], toolNames: ["House Estimator"], source: "Bureau of Indian Standards (BIS)", year: 2013, lastVerified: LV },
  { id: "is-16700", code: "IS 16700:2023", title: "Structural Safety of Tall Concrete Buildings", country: "India", category: "Design", description: "Criteria for structural safety of tall concrete buildings — additional requirements beyond IS 456 and IS 1893.", toolIds: ["house", "concrete-advanced"], toolNames: ["House Estimator", "Concrete Mix Design"], source: "Bureau of Indian Standards (BIS)", year: 2023, lastVerified: LV },
  { id: "is-2062", code: "IS 2062:2011", title: "Hot Rolled Steel for General Structural Purposes", country: "India", category: "Steel", description: "Specification for hot rolled medium and high tensile structural steel.", toolIds: ["interactive-steel"], toolNames: ["Interactive Steel Calculator"], source: "Bureau of Indian Standards (BIS)", year: 2011, lastVerified: LV },
  { id: "is-2386", code: "IS 2386", title: "Methods of Test for Aggregates", country: "India", category: "Concrete", description: "Methods of test for aggregates for concrete — particle size, shape, specific gravity and deleterious materials, in eight parts.", toolIds: ["concrete-advanced"], toolNames: ["Concrete Mix Design"], source: "Bureau of Indian Standards (BIS)", lastVerified: LV },
  { id: "is-9103", code: "IS 9103:1999", title: "Concrete Admixtures — Specification", country: "India", category: "Concrete", description: "Specification for concrete admixtures — accelerators, retarders, water reducers and air-entraining agents.", toolIds: ["concrete-advanced"], toolNames: ["Concrete Mix Design"], source: "Bureau of Indian Standards (BIS)", year: 1999, lastVerified: LV },
  { id: "is-1199", code: "IS 1199:2018", title: "Fresh Concrete — Methods of Sampling and Testing", country: "India", category: "Concrete", description: "Methods of sampling and analysis of fresh concrete, including the slump test for workability.", toolIds: ["concrete-advanced"], toolNames: ["Concrete Mix Design"], source: "Bureau of Indian Standards (BIS)", year: 2018, lastVerified: LV },
  { id: "is-2502", code: "IS 2502:1963", title: "Bending and Fixing of Bars for Concrete Reinforcement", country: "India", category: "Steel", description: "Code of practice for bending and fixing of bars for concrete reinforcement — bar bending schedules.", toolIds: ["interactive-steel"], toolNames: ["Interactive Steel Calculator"], source: "Bureau of Indian Standards (BIS)", year: 1963, lastVerified: LV },
  { id: "morth", code: "MoRTH Specifications (5th Rev.)", title: "Specifications for Road & Bridge Works", country: "India", category: "Infrastructure", description: "Ministry of Road Transport and Highways specifications — the standard for highway construction, earthwork, pavement layers and bridge works in India.", toolIds: ["earthwork-advanced"], toolNames: ["Earthwork"], source: "Ministry of Road Transport & Highways, India (MoRTH)", year: 2013, lastVerified: LV },
  { id: "irc-37", code: "IRC:37-2018", title: "Flexible Pavement Design", country: "India", category: "Infrastructure", description: "Guidelines for the design of flexible pavements, calculating traffic loadings (msa), and determining layer thicknesses for bituminous roads.", toolIds: ["earthwork-advanced"], toolNames: ["Earthwork"], source: "Indian Roads Congress (IRC)", year: 2018, lastVerified: LV },
  { id: "irc-6", code: "IRC:6-2017", title: "Road Bridges — Loads and Load Combinations", country: "India", category: "Infrastructure", description: "Standard specifications and code of practice for road bridges — loads, forces and load combinations for bridge design.", toolIds: ["earthwork-advanced"], toolNames: ["Earthwork"], source: "Indian Roads Congress (IRC)", year: 2017, lastVerified: LV },
  { id: "irc-58", code: "IRC:58-2015", title: "Rigid Pavement Design", country: "India", category: "Infrastructure", description: "Guidelines for the design of plain jointed rigid pavements for highways.", toolIds: ["earthwork-advanced"], toolNames: ["Earthwork"], source: "Indian Roads Congress (IRC)", year: 2015, lastVerified: LV },
  { id: "irc-112", code: "IRC:112-2020", title: "Concrete Road Bridges — Code of Practice", country: "India", category: "Infrastructure", description: "Code of practice for concrete road bridges — limit state design of bridge superstructures and substructures.", toolIds: ["earthwork-advanced"], toolNames: ["Earthwork"], source: "Indian Roads Congress (IRC)", year: 2020, lastVerified: LV },
  { id: "irc-sp20", code: "IRC:SP:20-2002", title: "Rural Roads Manual", country: "India", category: "Infrastructure", description: "Rural roads manual — planning, design, construction and maintenance of rural roads.", toolIds: ["earthwork-advanced"], toolNames: ["Earthwork"], source: "Indian Roads Congress (IRC)", year: 2002, lastVerified: LV },
  { id: "bcp-2021", code: "BCP-2021", title: "Building Code of Pakistan", country: "Pakistan", category: "Building", description: "Seismic provisions and general building construction guidelines for structural, fire, and life safety in Pakistan. Formulated by the PEC.", toolIds: ["house", "staircase-calculator"], toolNames: ["House Estimator", "Staircase Calculator"], pdfLink: "/assets/standards/bcp-2021.pdf", source: "Pakistan Engineering Council (PEC)", year: 2021, lastVerified: LV },
  { id: "nha-specs", code: "NHA Specs", title: "NHA General Specifications", country: "Pakistan", category: "Infrastructure", description: "Standard specifications for road and bridge works by the National Highway Authority (NHA) of Pakistan, detailing earthwork, sub-base, and asphalt provisions.", toolIds: ["earthwork-advanced"], toolNames: ["Earthwork"], source: "National Highway Authority, Pakistan (NHA)", lastVerified: LV },
  { id: "pec-bidding", code: "PEC Documents", title: "Standard Bidding Documents", country: "Pakistan", category: "Management", description: "Pakistan Engineering Council (PEC) standard guidelines for procurement of civil works, contracting, and BOQ formulations.", toolIds: ["qs-workflow"], toolNames: ["BOQ Generator"], source: "Pakistan Engineering Council (PEC)", lastVerified: LV },
  { id: "lda-bylaws", code: "LDA Regulations", title: "LDA Building & Zoning Regulations", country: "Pakistan", category: "Building", description: "Lahore Development Authority building and zoning regulations — plot coverage, setbacks, height limits and approval procedure for Lahore. These are local bylaws, not a national code.", toolIds: ["house"], toolNames: ["House Estimator"], source: "Lahore Development Authority (LDA)", lastVerified: LV },
  { id: "dha-bylaws", code: "DHA Bye-Laws", title: "DHA Building Control Bye-Laws", country: "Pakistan", category: "Building", description: "Defence Housing Authority building control bye-laws — construction rules, setbacks and approvals inside DHA housing schemes. These are local bylaws, not a national code.", toolIds: ["house"], toolNames: ["House Estimator"], source: "Defence Housing Authority (DHA)", lastVerified: LV },
  { id: "dbc", code: "DBC", title: "Dubai Building Code", country: "UAE", category: "Building", description: "Comprehensive code designed to unify building design across Dubai, focusing on structural stability, safety, sustainability, and accessibility.", toolIds: ["house", "lintel-design-tool"], toolNames: ["House Estimator", "Lintel Scheduler"], source: "Dubai Municipality", lastVerified: LV },
  { id: "adibc", code: "ADIBC", title: "Abu Dhabi International Building Code", country: "UAE", category: "Building", description: "Based on the International Building Code (IBC) with tailored amendments for the Emirate of Abu Dhabi to regulate commercial and residential construction.", toolIds: ["house"], toolNames: ["House Estimator"], source: "Department of Municipalities and Transport, Abu Dhabi", lastVerified: LV },
  { id: "uae-fire", code: "UAE FLSC 2018", title: "UAE Fire and Life Safety Code", country: "UAE", category: "Safety", description: "Mandatory civil defence requirements for fire protection systems, egress strategies, and facade safety across all Emirates.", toolIds: ["qs-workflow"], toolNames: ["BOQ Generator"], source: "UAE Civil Defence (Ministry of Interior)", year: 2018, lastVerified: LV },
];

export default function StandardsReferencePage({ onNavigate, initialActiveCountry = "All" }: { onNavigate?: (id: string) => void, initialActiveCountry?: string }) {
  const [activeCountry, setActiveCountry] = useState(initialActiveCountry);
  const [searchTerm, setSearchTerm] = useState("");
  const [yearFilter, setYearFilter] = useState<string>("All");
  const [viewPdfUrl, setViewPdfUrl] = useState<string | null>(null);

  const countries = ["All", "India", "Pakistan", "UAE"];
  const years = ["All", ...Array.from(new Set(standardsData.map((s) => s.year).filter((y): y is number => y != null))).sort((a, b) => b - a).map(String)];

  const filteredStandards = standardsData.filter(std => {
    const matchesCountry = activeCountry === "All" || std.country === activeCountry;
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = std.code.toLowerCase().includes(searchLower) || std.title.toLowerCase().includes(searchLower);
    const matchesYear = yearFilter === "All" || (std.year != null && String(std.year) === yearFilter);
    return matchesCountry && matchesSearch && matchesYear;
  });

  return (
    <div className="min-h-screen bg-[#FAF8F5] font-sans pb-24">
      {/* Header Section */}
      <div className="bg-[#FAF8F5] border-b border-[#E8E4D9] pt-20 pb-16 px-6 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full bg-[#E8E4D9]/20 blur-[120px] pointer-events-none"></div>

        <div className="w-full md:max-w-7xl md:mx-auto flex flex-col items-center text-center relative z-10 px-4 md:px-0">
          <BookOpen className="w-12 h-12 text-[#B39B72] mb-6" />
          <h1 className="md: lg: text-[#4A443B] mb-4 relative text-xl font-semibold text-txt-primary tracking-tight mb-6">
            Engineering <span className="text-[#B39B72]">Standards & Codes</span> Hub
          </h1>
          <p className="text-[#8B8476] max-w-2xl mb-10 text-base font-normal text-txt-secondary leading-relaxed">
            A comprehensive reference library of the civil engineering standards, specifications, and building codes powering our estimation tools across key international markets.
          </p>

          <div className="w-full max-w-xl relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A39D93]" />
            <><label htmlFor="a11y-input-9" className="sr-only">Search by code (e.g. 'IS 456') or title...</label>
<input id="a11y-input-9"
              type="text"
              placeholder="Search by code (e.g. 'IS 456') or title..."
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
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
          {countries.map(country => (
            <Button
              key={country}
              onClick={() => setActiveCountry(country)}
              className={`px-5 py-2.5 rounded-full text-base font-medium transition-all shadow-brand-sm
                ${activeCountry === country 
                  ? 'bg-ink text-txt-primary shadow-brand-md' 
                  : 'bg-surface-default text-[#8B8476] border border-[#E8E4D9] hover:bg-[#F2EFE9] hover:text-[#4A443B]'
                }`}
            >
              {country}
            </Button>
          ))}
        </div>

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
           <p className="w-full text-[#8B8476] mb-8 md:max-w-xl md:mx-auto text-base font-normal text-txt-secondary leading-relaxed px-4 md:px-0">Access 55+ professional civil engineering calculators and tools that automatically apply these specific country codes to your estimates.</p>
           <Button onClick={() => {
              if (onNavigate) {
                 onNavigate('home');
              } else {
                 window.location.href = '/#tools';
              }
           }} className="px-8 py-4 bg-ink hover:bg-accent-400 text-txt-primary font-bold rounded-full transition-all shadow-brand-md hover:shadow-brand-lg active:scale-95 hover:-translate-y-0.5">
             Explore All Tools
           </Button>
        </div>
      </div>

      <div className="w-full md:max-w-7xl md:mx-auto px-6">
        <GlobalFAQ
          moduleId="standards-reference"
          faqs={[
            { question: "Which code governs house construction in Pakistan?", answer: "The Building Code of Pakistan (BCP-2021), formulated by the PEC, with local bylaws on top — for example the LDA Building & Zoning Regulations in Lahore or the DHA bye-laws inside DHA schemes." },
            { question: "What is the difference between IS 456 and IS 10262?", answer: "IS 456 is the code of practice for designing reinforced concrete structures; IS 10262 is the guideline for proportioning the concrete mix itself (cement, sand, aggregate and water) to hit a target strength." },
            { question: "Why do some standards have no PDF?", answer: "Only the Building Code of Pakistan PDF is hosted on this site. Other codes are copyrighted publications — their full text must be bought or accessed from the publishing body (BIS, IRC, PEC or NHA)." },
          ]}
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
