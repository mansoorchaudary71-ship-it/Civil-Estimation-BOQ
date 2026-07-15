import React, { useState } from "react";
import { Search, BookOpen, ShieldCheck, ArrowRight, Download, Eye, X } from "lucide-react";
import { createPortal } from "react-dom";

export const standardsData = [
  {
    id: "is-456",
    code: "IS 456:2000",
    title: "Plain and Reinforced Concrete",
    country: "India",
    category: "Concrete",
    description: "The primary Indian Standard code of practice for general structural use of plain and reinforced concrete. Covers design clauses, material specifications, and workmanship.",
    toolIds: ["concrete-advanced", "house"],
    toolNames: ["Concrete Mix Design", "House Estimator"],
    pdfLink: "/assets/standards/is-456.pdf"
  },
  {
    id: "is-800",
    code: "IS 800:2007",
    title: "General Construction in Steel",
    country: "India",
    category: "Steel",
    description: "Code of practice for general construction in steel, transitioning from working stress method to limit state design method for structural steel detailing.",
    toolIds: ["interactive-steel", "house"],
    toolNames: ["Interactive Steel Calculator", "House Estimator"],
    pdfLink: "/assets/standards/is-800.pdf"
  },
  {
    id: "is-10262",
    code: "IS 10262:2019",
    title: "Concrete Mix Proportioning",
    country: "India",
    category: "Concrete",
    description: "Guidelines for proportioning of concrete mixes to achieve specified characteristics like workability, compressive strength, and durability.",
    toolIds: ["concrete-advanced"],
    toolNames: ["Concrete Mix Design"],
    pdfLink: "/assets/standards/is-10262.pdf"
  },
  {
    id: "is-1200",
    code: "IS 1200",
    title: "Method of Measurement",
    country: "India",
    category: "Quantity",
    description: "Standardizes the method of measurement of building and civil engineering works for preparation of estimates and bills of quantities.",
    toolIds: ["house", "qs-workflow"],
    toolNames: ["House Estimator", "BOQ Generator"],
    pdfLink: "/assets/standards/is-1200.pdf"
  },
  {
    id: "bcp-2021",
    code: "BCP-2021",
    title: "Building Code of Pakistan",
    country: "Pakistan",
    category: "Building",
    description: "Seismic provisions and general building construction guidelines for structural, fire, and life safety in Pakistan. Formulated by the PEC.",
    toolIds: ["house", "staircase-calculator"],
    toolNames: ["House Estimator", "Staircase Calculator"],
    pdfLink: "/assets/standards/bcp-2021.pdf"
  },
  {
    id: "nha-specs",
    code: "NHA Specs",
    title: "NHA General Specifications",
    country: "Pakistan",
    category: "Infrastructure",
    description: "Standard specifications for road and bridge works by the National Highway Authority (NHA) of Pakistan, detailing earthwork, sub-base, and asphalt provisions.",
    toolIds: ["earthwork-advanced"],
    toolNames: ["Earthwork"],
    pdfLink: "/assets/standards/nha-specs.pdf"
  },
  {
    id: "pec-bidding",
    code: "PEC Documents",
    title: "Standard Bidding Documents",
    country: "Pakistan",
    category: "Management",
    description: "Pakistan Engineering Council (PEC) standard guidelines for procurement of civil works, contracting, and BOQ formulations.",
    toolIds: ["qs-workflow"],
    toolNames: ["BOQ Generator"],
    pdfLink: "/assets/standards/pec-bidding.pdf"
  },
  {
    id: "dbc",
    code: "DBC",
    title: "Dubai Building Code",
    country: "UAE",
    category: "Building",
    description: "Comprehensive code designed to unify building design across Dubai, focusing on structural stability, safety, sustainability, and accessibility.",
    toolIds: ["house", "lintel-design-tool"],
    toolNames: ["House Estimator", "Lintel Scheduler"],
    pdfLink: "/assets/standards/dbc.pdf"
  },
  {
    id: "adibc",
    code: "ADIBC",
    title: "Abu Dhabi International Building Code",
    country: "UAE",
    category: "Building",
    description: "Based on the International Building Code (IBC) with tailored amendments for the Emirate of Abu Dhabi to regulate commercial and residential construction.",
    toolIds: ["house"],
    toolNames: ["House Estimator"],
    pdfLink: "/assets/standards/adibc.pdf"
  },
  {
    id: "uae-fire",
    code: "UAE FLSC",
    title: "UAE Fire and Life Safety Code",
    country: "UAE",
    category: "Safety",
    description: "Mandatory civil defense requirements for fire protection systems, egress strategies, and facade safety across all Emirates.",
    toolIds: ["qs-workflow"],
    toolNames: ["BOQ Generator"],
    pdfLink: "/assets/standards/uae-fire.pdf"
  },
  {
    id: "morth",
    code: "MORTH",
    title: "Specifications for Road & Bridge Works",
    country: "International",
    category: "Infrastructure",
    description: "Ministry of Road Transport and Highways (MORTH) specifications serving as the backbone for highway estimations, pavement design, and testing.",
    toolIds: ["earthwork-advanced"],
    toolNames: ["Earthwork"],
    pdfLink: "/assets/standards/morth.pdf"
  },
  {
    id: "irc-37",
    code: "IRC:37-2018",
    title: "Flexible Pavement Design",
    country: "International",
    category: "Infrastructure",
    description: "Guidelines for the design of flexible pavements, calculating traffic loadings (msa), and determining layer thicknesses for bituminous roads.",
    toolIds: ["earthwork-advanced"],
    toolNames: ["Earthwork"],
    pdfLink: "/assets/standards/irc-37.pdf"
  }
];

export default function StandardsReferencePage({ onNavigate, initialActiveCountry = "All" }: { onNavigate?: (id: string) => void, initialActiveCountry?: string }) {
  const [activeCountry, setActiveCountry] = useState(initialActiveCountry);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewPdfUrl, setViewPdfUrl] = useState<string | null>(null);

  const countries = ["All", "India", "Pakistan", "UAE", "International"];

  const filteredStandards = standardsData.filter(std => {
    const matchesCountry = activeCountry === "All" || std.country === activeCountry;
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = std.code.toLowerCase().includes(searchLower) || std.title.toLowerCase().includes(searchLower);
    return matchesCountry && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#FAF8F5] font-sans pb-24">
      {/* Header Section */}
      <div className="bg-[#FAF8F5] border-b border-[#E8E4D9] pt-20 pb-16 px-6 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full bg-[#E8E4D9]/20 blur-[120px] pointer-events-none"></div>

        <div className="w-full md:max-w-7xl md:mx-auto flex flex-col items-center text-center relative z-10 px-4 md:px-0">
          <BookOpen className="w-12 h-12 text-[#B39B72] mb-6" />
          <h1 className="md: lg: text-[#4A443B] mb-4 relative text-xl font-semibold text-slate-800 tracking-tight mb-6">
            Engineering <span className="text-[#B39B72]">Standards & Codes</span> Hub
          </h1>
          <p className="text-[#8B8476] max-w-2xl mb-10 text-base font-normal text-slate-600 leading-relaxed">
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
              className="w-full bg-white border border-[#E8E4D9] rounded-full py-4 pl-12 pr-4 text-[#4A443B] placeholder-[#A39D93] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-[#B39B72]/50 shadow-sm overflow-hidden"
            /></>
          </div>
        </div>
      </div>

      <div className="w-full md:max-w-7xl md:mx-auto px-6 pt-10">
        {/* Country Filter */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
          {countries.map(country => (
            <button
              key={country}
              onClick={() => setActiveCountry(country)}
              className={`px-5 py-2.5 rounded-full text-base font-medium transition-all shadow-sm
                ${activeCountry === country 
                  ? 'bg-amber-500 text-slate-900 shadow-md' 
                  : 'bg-white text-[#8B8476] border border-[#E8E4D9] hover:bg-[#F2EFE9] hover:text-[#4A443B]'
                }`}
            >
              {country}
            </button>
          ))}
        </div>

        {/* Standards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 rounded-full transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm">
          {filteredStandards.length > 0 ? (
            filteredStandards.map(std => (
              <div 
                key={std.id} 
                className="w-full bg-white border border-[#E8E4D9] rounded-2xl p-4 sm:p-6 flex flex-col group hover:border-[#B39B72] hover:shadow-lg transition-all duration-300 overflow-hidden"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="font-mono text-base font-medium bg-amber-50 text-amber-600 border border-amber-100 px-3 py-1 rounded-lg">
                    {std.code}
                  </div>
                  <div className="flex items-center gap-1.5 text-sm uppercase tracking-wider font-bold text-[#A39D93] bg-[#FAF8F5] px-2 py-1 rounded border border-[#E8E4D9]">
                    <ShieldCheck className="w-3 h-3 text-[#B39B72]" />
                    {std.country}
                  </div>
                </div>

                <div className="mb-2">
                   <span className={`text-sm inline-block uppercase font-bold tracking-widest mb-2 px-2 py-0.5 rounded-full ${
                      std.category === 'Concrete' ? 'bg-blue-50 text-blue-600' :
                      std.category === 'Steel' ? 'bg-slate-100 text-slate-600' :
                      std.category === 'Building' ? 'bg-amber-50 text-amber-600' :
                      std.category === 'Infrastructure' ? 'bg-emerald-50 text-emerald-600' :
                      std.category === 'Safety' ? 'bg-rose-50 text-rose-600' :
                      'bg-indigo-50 text-indigo-600'
                   }`}>
                    {std.category}
                   </span>
                   <h3 className="text-[#4A443B] group-hover:text-amber-600 transition-colors text-lg font-medium text-slate-800 mb-4">
                    {std.title}
                   </h3>
                </div>

                <p className="text-[#8B8476] mb-6 flex-grow text-base font-normal text-slate-600 leading-relaxed">
                  {std.description}
                </p>

                {std.pdfLink && (
                  <div className="mb-6 flex gap-2 flex-wrap">
                    <button
                      onClick={() => setViewPdfUrl(std.pdfLink)}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-[#F2EFE9] hover:bg-amber-500 hover:text-slate-900 border border-[#E8E4D9] rounded-full text-base font-medium text-[#4A443B] transition-colors active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
                    >
                      <Eye className="w-4 h-4" />
                      Read PDF
                    </button>
                    <a
                      href={std.pdfLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="inline-flex items-center gap-2 px-3 py-2 bg-white hover:bg-[#F2EFE9] border border-[#E8E4D9] rounded-lg text-base font-medium text-[#6A6458] transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </a>
                  </div>
                )}

                <div className="pt-5 border-t border-[#E8E4D9]">
                  <p className="text-[#A39D93] uppercase tracking-widest mb-3 text-base font-normal text-slate-600 leading-relaxed">Integrations</p>
                  <div className="flex flex-wrap gap-2">
                    {std.toolNames.map((tool, idx) => (
                      <button
                        key={idx}
                        onClick={() => onNavigate?.(std.toolIds[idx])}
                        className="text-base font-medium px-2.5 py-1.5 bg-[#FAF8F5] hover:bg-amber-50 hover:text-amber-600 border border-[#E8E4D9] hover:border-amber-200 rounded-full text-[#6A6458] transition-colors flex items-center gap-1.5 cursor-pointer active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
                      >
                        {tool}
                        <ArrowRight className="w-3 h-3 opacity-50" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))
          ) : (
             <div className="col-span-full py-20 text-center">
               <BookOpen className="w-12 h-12 text-[#A39D93] mx-auto mb-4" />
               <h3 className="text-[#6A6458] mb-2 text-lg font-medium text-slate-800 mb-4">No standards found</h3>
               <p className="text-[#A39D93] text-base font-normal text-slate-600 leading-relaxed">Try adjusting your search term or country filter.</p>
             </div>
          )}
        </div>

        {/* Bottom CTA */}
        <div className="w-full mt-20 bg-white border border-[#E8E4D9] rounded-3xl p-4 sm:p-8 md:p-5 sm:p-12 text-center md:max-w-4xl md:mx-auto shadow-sm overflow-hidden">
           <h2 className="md: text-[#4A443B] mb-4 text-xl font-semibold text-slate-900 tracking-tight">Ready to put these standards into practice?</h2>
           <p className="w-full text-[#8B8476] mb-8 md:max-w-xl md:mx-auto text-base font-normal text-slate-600 leading-relaxed px-4 md:px-0">Access 55+ professional civil engineering calculators and tools that automatically apply these specific country codes to your estimates.</p>
           <button onClick={() => {
              if (onNavigate) {
                 onNavigate('home');
              } else {
                 window.location.href = '/#tools';
              }
           }} className="px-8 py-4 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-full transition-all shadow-md hover:shadow-lg active:scale-95 hover:-translate-y-0.5">
             Explore All Tools
           </button>
        </div>
      </div>

      {viewPdfUrl && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-[#FAF8F5]/90 backdrop-blur-sm p-4 sm:p-8">
          <div className="bg-white rounded-2xl w-full max-w-5xl h-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative border border-[#E8E4D9]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E4D9] bg-[#FAF8F5]">
              <h2 className="text-[#4A443B] text-xl font-semibold text-slate-900 tracking-tight mb-4">Reading Mode</h2>
              <div className="flex items-center gap-3">
                <a
                  href={viewPdfUrl}
                  download
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E8E4D9] text-[#4A443B] hover:bg-[#F2EFE9] font-semibold rounded-xl transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download
                </a>
                <button
                  onClick={() => setViewPdfUrl(null)}
                  className="p-2 text-[#A39D93] hover:text-[#4A443B] hover:bg-[#E8E4D9]/50 rounded-full transition-colors active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
                >
                  <X className="w-5 h-5" />
                </button>
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
