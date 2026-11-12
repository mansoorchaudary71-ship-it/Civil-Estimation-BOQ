import { Button } from './/Button';
import React, { useState, useEffect, useRef } from "react";
import { Search, X, ArrowRight } from "lucide-react";
import { ALL_MODULES } from "../Dashboard";
import { createPortal } from "react-dom";


export default function GlobalSearchModal({ 
  isOpen, 
  onClose,
  onNavigate
}: { 
  isOpen: boolean; 
  onClose: () => void;
  onNavigate: (id: string) => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setSearchTerm("");
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const searchWords = searchTerm.toLowerCase().split(/\s+/).filter(Boolean);
  
  
  
  const unsupportedModules = [
    'boq-templates', 'cost-guide-pakistan', 'blog', 'is-codes-reference', 
    'morth-irc-specs', 'pakistan-building-codes', 'uae-construction-standards', 
    'quick-estimation', 'master-quantity'
  ];

  const results = ALL_MODULES.filter((mod) => {
    if (searchWords.length === 0) return false;
    if (unsupportedModules.includes(mod.id)) return false;
    
    // Deep metadata mapping for vast search

    const metadataMap: Record<string, string> = {
      "house": "bricks, cement, sand, aggregate, concrete, footing, slab, columns, layout, cost, residential, rate, total, estimate, area",
      "qs-workflow": "boq, quantity surveyor, sequence, project setup, drawings, substructure, superstructure, masonry, services",
      "takeoff": "area, linear, extraction, plan measure, blueprint, polygon, dimension, scale",
      "rates": "live db, market price, rate analysis, cost, database",
      "ai": "assistant, help, query, questions, generate, calculate, natural language",
      "material-takeoff": "sheet, total, materials, excel, export, summary, brickwork, plaster, block",
      "cost-summary": "summary, overall, final, cost, budget, chart, distribution",
      "measurement-sheet": "lxbxh, dimensions, item, deduction, total, measurement, format",
      "boq": "generator, bill of quantities, tender, document, itemized, rate, amount",
      "interiors-finishes": "paint, tiles, flooring, ceiling, plaster, putty, doors, windows, woodwork, glass",
      "area-space-calculator": "square, feet, meter, room, dimension, plot, land",
      "volume-estimator": "cubic, concrete, excavation, soil, earth, water, tank, capacity",
      "metal-weight": "steel, rebar, ms plate, angle, channel, section, kg, ton, density, d^2/162",
      "unit-converter": "feet, meters, inches, mm, cm, gallons, liters, conversion",
      "calculators": "formula, quick, math, structural, generic",
      "bbs-generator": "bar bending schedule, stirrup, cutting length, bend deduction, weight, rebar",
      "reinforcement": "visualizer, spacing, layout, rebar arrangement, grid, mesh",
      "isolated-footing": "trapezoidal, stepped, pad, concrete volume, steel, depth, foundation",
      "retaining-wall": "stem, base, heel, toe, concrete, stability, soil pressure, sliding",
      "staircase-calculator": "tread, riser, flight, landing, waist slab, concrete volume, steps",
      "aggregate-tests": "sieve analysis, f.m, fineness modulus, gradation, curve, coarse, fine",
      "formwork": "shuttering, ply, scaffolding, area, contact, props, boards, timber",
      "geotechnical": "soil, bearing capacity, water table, settlement, pressure",
      "cbr-test": "california bearing ratio, penetration, load, dial gauge, subgrade",
      "aggregate-blending": "mix proportion, trial, sieves, percentage, combine",
      "direct-shear": "cohesion, friction angle, failure envelope, normal stress, shear stress",
      "permeability-test": "constant head, falling head, coefficient, darcy, flow",
      "mep-calculator": "electrical, plumbing, hvac, load, duct, pipe, wire, current, voltage",
      "solar-roof": "panels, kw, inverter, battery, area, generation, efficiency, sunlight",
      "rainwater-harvesting": "catchment, runoff, tank size, rainfall, filter, capacity",
      "road-pavement": "asphalt, bitumen, base course, sub base, thickness, camber, volume",
      "earthworks": "cut, fill, trapezoidal, grid, contour, level, volume, excavation",
      "chainage": "profile, section, level, interval, earthwork volume",
      "gradient-calculator": "slope, rise, run, ratio, percentage, angle",
      "anti-termite": "chemical, spray, area, concentration, foundation treatment, soil",
      "master-sieve": "sieve size, passing, retained, astm, bs, is code",
      "beam-design": "flexure, shear, moment, ast, depth, neutral axis, width",
      "column-design": "axial, biaxial, slenderness, tie, main bar, pu, mu",
      "raft-foundation": "mat, bearing, uniform, thickness, punching shear",
      "water-tank-design": "ugwt, ohwt, hoop tension, base slab, wall thickness, capacity",
      "pile-foundation": "skin friction, end bearing, capacity, settlement, diameter, length",
      "prestressed-concrete": "tendon, losses, stress, anchorage, pre-tension, post-tension"
    };

    const metadata = (metadataMap[mod.id] || "").toLowerCase();
    
    return searchWords.every(
      (word) => 
        mod.title.toLowerCase().includes(word) || 
        mod.desc.toLowerCase().includes(word) || 
        mod.category.toLowerCase().includes(word) ||
        metadata.includes(word)
    );
  });

  const highlightMatch = (text: string, queries: string[]) => {
    if (!queries || queries.length === 0) return <>{text}</>;
    // Escape regex characters in queries to prevent syntax errors
    const escapedQueries = queries.map(q => q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const regex = new RegExp(`(${escapedQueries.join('|')})`, 'gi');
    const parts = text.split(regex);
    
    return (
      <>
        {parts.map((part, i) => {
          const isMatch = queries.some(q => q.toLowerCase() === part.toLowerCase());
          return isMatch ? 
            <span key={i} className="text-accent-800 dark:text-accent-400 font-semibold bg-accent-50 dark:bg-accent-500/20 px-1 rounded">{part}</span> : 
            part;
        })}
      </>
    );
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-start justify-center pt-[10vh] sm:pt-[15vh] px-4 bg-ink/40 dark:bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-2xl bg-surface-default/95 dark:bg-ink/95 backdrop-blur-2xl rounded-2xl sm:rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] border border-white/40 dark:border-ink overflow-hidden flex flex-col animate-in slide-in-from-top-8 sm:zoom-in-95 duration-300">
        
        {/* Search Input Area */}
        <div className="p-6 sm:p-8 flex items-center gap-4 border-b border-border-color/50 dark:border-ink/50">
          <Search className="w-6 h-6 text-accent-800 shrink-0" strokeWidth={2.5} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search tools, materials..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-xl sm:text-2xl font-medium text-txt-primary dark:text-txt-primary placeholder:text-txt-tertiary dark:placeholder:text-txt-tertiary focus:ring-0 tracking-tight"
          />
          <Button 
            onClick={onClose}
            className="p-3 bg-surface-default hover:bg-surface-hover rounded-2xl text-txt-tertiary hover:text-txt-secondary dark:hover:text-txt-primary transition-colors shrink-0"
          >
            <X className="w-5 h-5" strokeWidth={2.5} />
          </Button>
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto hide-scrollbar max-h-[60vh]">
          {searchWords.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center">
              <div className="w-20 h-20 rounded-2xl bg-surface-default/50 flex items-center justify-center mb-5 shadow-brand-sm border border-border-color dark:border-ink">
                <Search className="w-8 h-8 text-txt-tertiary dark:text-txt-secondary" strokeWidth={2} />
              </div>
              <p className="text-txt-tertiary dark:text-txt-tertiary font-medium text-lg tracking-tight">Type anything to start searching...</p>
            </div>
          ) : results.length > 0 ? (
            <div className="p-4 sm:p-6 flex flex-col gap-3">
              <div className="px-3 pb-2">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-txt-tertiary dark:text-txt-tertiary">
                  {results.length} result{results.length !== 1 && "s"} found
                </p>
              </div>
              {results.map((mod) => (
                <Button
                  key={mod.id}
                  onClick={() => {
                    // Navigate to the target module
                    onNavigate(mod.id);
                    
                    // Dispatch context transfer event for inputs inside the new module
                    setTimeout(() => {
                      window.dispatchEvent(new CustomEvent('tool-search-focus', { 
                        detail: { term: searchTerm, moduleId: mod.id } 
                      }));
                      
                      // Fix blank page issue: Scroll main container to top
                      const scrollableContainers = document.querySelectorAll('.overflow-y-auto, .overflow-y-scroll, main div');
                      scrollableContainers.forEach(el => {
                        el.scrollTo({ top: 0, behavior: "smooth" });
                      });
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }, 100);
                    
                    onClose();
                  }}
                  className="group flex items-start gap-5 p-4 sm:p-5 rounded-2xl bg-surface-hover/50 hover:bg-accent-50 dark:bg-ink/30 dark:hover:bg-accent-900/20 border border-transparent hover:border-accent-100 dark:hover:border-accent-800/50 transition-all duration-300 text-left w-full hover:-translate-y-1 hover:shadow-brand-lg hover:shadow-accent-500/5"
                >
                  <div className="w-14 h-14 rounded-2xl bg-surface-default dark:bg-ink shadow-brand-sm border border-border-color dark:border-ink-600 flex items-center justify-center shrink-0 text-txt-tertiary group-hover:text-accent-800 dark:group-hover:text-accent-400 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300">
                    <mod.icon className="w-6 h-6" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 overflow-hidden pt-1">
                    <h3 className="text-lg font-semibold text-txt-primary dark:text-txt-primary mb-1.5 group-hover:text-accent-800 dark:group-hover:text-accent-400 transition-colors tracking-tight">
                      {highlightMatch(mod.title, searchWords)}
                    </h3>
                    <p className="text-sm text-txt-tertiary dark:text-txt-tertiary leading-relaxed line-clamp-2 font-normal">
                      {highlightMatch(mod.desc, searchWords)}
                    </p>
                  </div>
                  <div className="shrink-0 w-10 h-10 rounded-full bg-surface-hover flex items-center justify-center group-hover:bg-ink-700 text-txt-tertiary group-hover:text-white transition-all duration-300 mt-2 shadow-brand-sm">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </Button>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center flex flex-col items-center justify-center">
               <div className="w-20 h-20 rounded-2xl bg-surface-default/50 flex items-center justify-center mb-5 shadow-brand-sm border border-border-color dark:border-ink">
                <Search className="w-8 h-8 text-txt-tertiary dark:text-txt-secondary opacity-50" strokeWidth={2} />
              </div>
              <p className="text-txt-secondary dark:text-txt-tertiary font-semibold text-lg tracking-tight">No results found for "{searchTerm}"</p>
              <p className="text-txt-tertiary dark:text-txt-tertiary text-sm mt-2 font-normal">Try searching for materials like "concrete", "steel", or tools like "calculator".</p>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
