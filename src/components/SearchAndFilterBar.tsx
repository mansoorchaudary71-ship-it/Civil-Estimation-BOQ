import React, { useEffect, useRef, useState } from "react";
import { Search, Sparkles } from "lucide-react";

export interface SearchAndFilterBarProps {
  categories: { name: string; count: number }[];
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  totalFilteredCount: number;
  allTools?: { id: string; name: string; category: string }[];
  onSelectModule?: (id: string, inputs?: any) => void;
}

export default function SearchAndFilterBar({
  categories,
  activeCategory,
  setActiveCategory,
  searchTerm,
  setSearchTerm,
  totalFilteredCount,
  allTools = [],
  onSelectModule,
}: SearchAndFilterBarProps) {
  const popularSearches = ["Concrete Volume", "Steel Weight", "Cost Estimate"];
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [showSuggestions, setShowSuggestions] = useState(false);

  const getSuggestions = () => {
    if (!searchTerm.trim() || !allTools.length) return [];
    const term = searchTerm.toLowerCase();
    return allTools
      .filter(
        (tool) =>
          tool.name.toLowerCase().includes(term) ||
          tool.category.toLowerCase().includes(term)
      )
      .slice(0, 6);
  };

  const suggestions = getSuggestions();

  useEffect(() => {
    const activeTab = tabRefs.current[activeCategory];
    if (activeTab && activeTab.parentElement) {
      const container = activeTab.parentElement;
      const scrollLeft = activeTab.offsetLeft - container.offsetWidth / 2 + activeTab.offsetWidth / 2;
      container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
  }, [activeCategory]);

  return (
    <div id="tools" className="sticky top-[60px] z-40 bg-[#f8f9fa]/95 backdrop-blur-xl border-b border-slate-200/60 py-3 sm:py-4 w-full shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
      <div className="md:max-w-7xl md:mx-auto px-4 w-full flex flex-col gap-3 sm:gap-4">
        
        {/* Search Bar */}
        <div className="w-full max-w-2xl mx-auto md:mx-0">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none z-10">
              <Search className="w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors duration-300" />
            </div>
            <><label htmlFor="a11y-input-8" className="sr-only">Search tools, materials, or calculations...</label>
<input id="a11y-input-8"
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Search tools, materials, or calculations..."
              className="relative w-full bg-white border border-slate-200 hover:border-slate-300 rounded-2xl py-3.5 pl-12 pr-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all shadow-sm text-[15px] sm:text-base font-medium"
            /></>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="w-full absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                {suggestions.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => {
                      if (onSelectModule) {
                        setSearchTerm("");
                        setShowSuggestions(false);
                        onSelectModule(tool.id);
                      } else {
                        setSearchTerm(tool.name);
                        setShowSuggestions(false);
                      }
                    }}
                    className="w-full text-left px-5 py-3.5 hover:bg-slate-50 border-b border-slate-50 last:border-0 flex items-center justify-between transition-colors group/item"
                  >
                    <span className="text-[15px] font-medium text-slate-700 group-hover/item:text-blue-600 transition-colors">{tool.name}</span>
                    <span className="text-[11px] font-bold tracking-wider uppercase text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">{tool.category}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
             
          {/* Popular Chips (hidden mobile, visible md+) */}
          <div className="hidden md:flex items-center gap-2 mt-3 pl-1">
            <span className="text-sm font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" /> Popular:
            </span>
            {popularSearches.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => setSearchTerm(chip)}
                className="text-[13px] font-medium text-slate-600 bg-white hover:bg-blue-50 hover:text-blue-700 px-3 py-1.5 rounded-full transition-colors border border-slate-200 shadow-sm"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="relative w-full mt-1 md:mt-2">
          {/* Right fade gradient overlay for mobile scroll indicator */}
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#f8f9fa] to-transparent pointer-events-none z-10 md:hidden" />
          <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-[#f8f9fa] to-transparent pointer-events-none z-10 md:hidden" />
             
          <div className="flex gap-2 sm:gap-3 overflow-x-auto scrollbar-hide relative items-center pb-3 px-1 filter-tab-row snap-x snap-mandatory pt-1">
            {categories.map((cat) => {
              const isActive = activeCategory === cat.name;
              return (
                 <button
                  key={cat.name}
                  ref={(el) => { tabRefs.current[cat.name] = el; }}
                  onClick={() => setActiveCategory(cat.name)}
                  className={`
                    relative flex items-center justify-center flex-shrink-0 gap-2.5 px-5 py-2.5 rounded-full whitespace-nowrap transition-all duration-300 snap-start
                    ${isActive 
                      ? "bg-slate-900 text-white shadow-md border border-slate-800" 
                      : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200 shadow-sm"}
                  `}
                >
                  <span className={`text-[14px] sm:text-[15px] ${isActive ? 'font-semibold' : 'font-medium'} transition-all duration-300`}>{cat.name}</span>
                  <span 
                    className={`
                      flex items-center justify-center px-2 py-0.5 text-[12px] font-bold rounded-full transition-colors duration-300
                      ${isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}
                    `}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Count Line */}
        <div className="text-[13px] sm:text-sm font-medium text-slate-500 pl-1 pb-2">
          Showing <span className="text-slate-900 font-bold">{totalFilteredCount}</span> tools in <span className="text-blue-600 font-bold">{activeCategory}</span>
        </div>

      </div>
    </div>
  );
}

