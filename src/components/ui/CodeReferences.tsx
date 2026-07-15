import React, { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp, Info } from 'lucide-react';

interface CodeReference {
  id: string;
  code: string;
  clause?: string;
  description: string;
}

const TOOL_REFERENCES: Record<string, CodeReference[]> = {
  "master-quantity": [
    { id: "1", code: "IS 456:2000", clause: "Clause 26.5.2", description: "Development Length & Reinforcement requirements" },
    { id: "2", code: "SP 34:1987", clause: "Section 4", description: "Detailing of reinforced concrete structures" },
    { id: "3", code: "IS 875", clause: "Parts 1-5", description: "Design Loads (Other than Earthquake)" }
  ],
  "concrete-masonry-hub": [
    { id: "1", code: "IS 456:2000", clause: "Section 3", description: "Design of concrete members" },
    { id: "2", code: "IS 1904:1986", clause: "General", description: "Design and Construction of Foundations in Soils" },
    { id: "3", code: "IS 6403:1981", clause: "General", description: "Determination of Bearing Capacity of Shallow Foundations" },
    { id: "4", code: "Terzaghi", clause: "Theory", description: "Bearing Capacity equations" },
    { id: "5", code: "Rankine/Coulomb", clause: "Theory", description: "Earth Pressure for Retaining Walls" }
  ],
  "steel-hub": [
    { id: "1", code: "IS 2502:1963", clause: "General", description: "Code of Practice for Bending and Fixing of Bars" },
    { id: "2", code: "SP 34:1987", clause: "Section 4.2", description: "Handbook on Concrete Reinforcement and Detailing" },
    { id: "3", code: "IS 1786:2008", clause: "Parameters", description: "High strength deformed steel bars and wires" }
  ],
  "mix-design": [
    { id: "1", code: "IS 10262:2019", clause: "General", description: "Concrete Mix Proportioning - Guidelines" },
    { id: "2", code: "ACI 211.1", clause: "Chapter 6", description: "Standard Practice for Selecting Proportions" },
    { id: "3", code: "BS 8500-1:2015", clause: "General", description: "Concrete - Method of specifying and guidance for the specifier" }
  ],
  "road-pavement": [
    { id: "1", code: "IRC:37-2018", clause: "General", description: "Guidelines for the Design of Flexible Pavements" },
    { id: "2", code: "IRC:58-2015", clause: "General", description: "Guidelines for the Design of Plain Jointed Rigid Pavements" },
    { id: "3", code: "MORTH", clause: "Section 500", description: "Specifications for Road and Bridge Works 2001" }
  ],
  "earthworks": [
    { id: "1", code: "IS 1200", clause: "Part 27", description: "Method of measurement of building and civil engineering works - Earthwork" },
    { id: "2", code: "IS 3764", clause: "Safety", description: "Excavation Work - Code of Safety" },
    { id: "3", code: "Prismoidal", clause: "Formula", description: "Volume calculation methodology" }
  ],
  "soil-lab-suite": [
    { id: "1", code: "IS 2720", clause: "Respective Parts", description: "Methods of test for soils" },
    { id: "2", code: "ASTM D2487", clause: "USCS", description: "Standard Practice for Classification of Soils for Engineering Purposes" }
  ],
  "cbr-test": [
    { id: "1", code: "IS 2720", clause: "Part 16", description: "Laboratory Determination of CBR" }
  ],
  "permeability-test": [
    { id: "1", code: "IS 2720", clause: "Part 17", description: "Laboratory Determination of Permeability" }
  ],
  "direct-shear": [
    { id: "1", code: "IS 2720", clause: "Part 13", description: "Direct Shear Test" }
  ],
  "house": [
    { id: "1", code: "NBC 2016", clause: "General", description: "National Building Code of India" },
    { id: "2", code: "CPWD", clause: "DSR", description: "Analysis of Rates for Building Works" },
    { id: "3", code: "IS 1200", clause: "All Parts", description: "Measurement of Building and Civil Engineering Works" }
  ],
  "boq": [
    { id: "1", code: "IS 1200", clause: "General", description: "Method of Measurement" },
    { id: "2", code: "FIDIC", clause: "Red Book", description: "Conditions of Contract for Construction" },
    { id: "3", code: "NEC4", clause: "ECC", description: "Engineering and Construction Contract" }
  ],
  "mep-calculator": [
    { id: "1", code: "IS 3854", clause: "General", description: "Switches for domestic and similar purposes" },
    { id: "2", code: "NBC 2016", clause: "Part 8", description: "Building Services" },
    { id: "3", code: "ASHRAE", clause: "Fundamentals", description: "Handbook - Fundamentals" }
  ],
  "rainwater-harvesting": [
    { id: "1", code: "NBC 2016", clause: "Part 9", description: "Plumbing Services" }
  ],
  "solar-roof": [
    { id: "1", code: "IEC 61215", clause: "General", description: "Terrestrial photovoltaic (PV) modules" },
    { id: "2", code: "IS 16169", clause: "General", description: "Guidelines for PV systems" },
    { id: "3", code: "Net Metering", clause: "Guidelines", description: "Local Net Metering rules" }
  ]
};

export function CodeReferences({ moduleId }: { moduleId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  
  const references = TOOL_REFERENCES[moduleId];
  
  // If there are no references defined for this module, don't render the section
  if (!references || references.length === 0) return null;

  return (
    <div className="w-full mt-4 mb-6 border border-slate-200 dark:border-slate-700/50 rounded-xl bg-white dark:bg-slate-800/80 overflow-hidden shadow-sm">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 text-white dark:text-slate-200 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
      >
        <span className="flex items-center gap-2 font-bold text-sm uppercase tracking-wider text-slate-600 dark:text-slate-400">
          <BookOpen className="w-4 h-4 text-indigo-500" />
          Code References & Standards
        </span>
        {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      
      {isOpen && (
        <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700/50">
          <ul className="space-y-3">
            {references.map((ref) => (
              <li key={ref.id} className="flex items-start gap-3">
                <div className="group relative flex items-center justify-center p-1.5 mt-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-indigo-100 hover:text-indigo-600 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400 cursor-help transition-colors">
                  <Info className="w-3.5 h-3.5" />
                  
                  {/* Tooltip */}
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-[130%] min-w-[200px] w-max max-w-xs p-2.5 bg-slate-800 text-white text-xs font-medium rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 pointer-events-none before:absolute before:content-[''] before:bottom-[-4px] before:left-1/2 before:-translate-x-1/2 before:border-[5px] before:border-transparent before:border-t-slate-800">
                     {ref.description}
                  </div>
                </div>
                
                <div className="flex-1">
                  <span className="font-bold text-slate-900 dark:text-white mr-1.5">[{ref.code}]</span>
                  {ref.clause && (
                    <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mr-2">
                       {ref.clause}
                    </span>
                  )}
                  <span className="text-sm text-slate-600 dark:text-slate-300 hidden md:inline">
                    — {ref.description}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
