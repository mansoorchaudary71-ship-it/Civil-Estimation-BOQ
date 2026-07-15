import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Search,
  Loader2,
  Sparkles,
  Mic,
  X,
  Clock,
  Box,
  ArrowUpRight,
  TrendingUp,
  History,
} from "lucide-react";
import { ALL_MODULES } from "./Dashboard";
import { motion, AnimatePresence } from "framer-motion";
import Fuse from "fuse.js";

interface SmartSearchProps {
  onSelect: (id: string, query?: string) => void;
}

interface SearchResult {
  toolId: string;
  toolName: string;
  category: string;
  desc: string;
}

const SUGGESTED_SEARCHES = [
  "How much concrete for 1000 sqft?",
  "Calculate steel for column",
  "Brick wall estimation",
  "Asphalt road quantities",
];

import { getCategorySpec } from "./ToolCard";

export default function SmartSearch({ onSelect }: SmartSearchProps) {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [localResults, setLocalResults] = useState<SearchResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const fuse = useMemo(
    () =>
      new Fuse(ALL_MODULES, {
        keys: ["title", "desc", "category"],
        threshold: 0.4,
        includeScore: true,
      }),
    [],
  );

  useEffect(() => {
    const history = JSON.parse(
      localStorage.getItem("smart_search_recent") || "[]",
    );
    setRecentSearches(history.slice(0, 4));
  }, []);

  const saveRecentSearch = (term: string) => {
    if (!term.trim()) return;
    const history = JSON.parse(
      localStorage.getItem("smart_search_recent") || "[]",
    );
    const newHistory = [
      term,
      ...history.filter((h: string) => h !== term),
    ].slice(0, 4);
    localStorage.setItem("smart_search_recent", JSON.stringify(newHistory));
    setRecentSearches(newHistory);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleFocusSearch = () => {
      inputRef.current?.focus();
      setShowDropdown(true);
      setIsFocused(true);
    };
    window.addEventListener("focus-search", handleFocusSearch);
    return () => window.removeEventListener("focus-search", handleFocusSearch);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in another input/textarea
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setShowDropdown(true);

    if (value.trim().length > 0) {
      const results = fuse
        .search(value)
        .slice(0, 5)
        .map((res) => ({
          toolId: res.item.id,
          toolName: res.item.title,
          category: res.item.category,
          desc: res.item.desc,
        }));
      setLocalResults(results);
    } else {
      setLocalResults([]);
    }
  };

  const handleSelectTool = (toolId: string) => {
    saveRecentSearch(
      query || ALL_MODULES.find((m) => m.id === toolId)?.title || "",
    );
    setShowDropdown(false);
    setIsFocused(false);
    onSelect(toolId, query);
    setQuery("");
  };

  const handleSelectQuery = (q: string) => {
    saveRecentSearch(q);
    setQuery(q);
    inputRef.current?.focus();
    // Pre-fill search and perform search
    const results = fuse
      .search(q)
      .slice(0, 5)
      .map((res) => ({
        toolId: res.item.id,
        toolName: res.item.title,
        category: res.item.category,
        desc: res.item.desc,
      }));
    setLocalResults(results);
    setShowDropdown(true);
  };

  const clearSearch = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuery("");
    setLocalResults([]);
    inputRef.current?.focus();
  };

  const startVoiceSearch = (e: React.MouseEvent) => {
    e.stopPropagation();
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice search is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setShowDropdown(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      setIsListening(false);
      handleSelectQuery(transcript);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const isCompletelyEmpty = query.length >= 2 && localResults.length === 0;

  const popularTools = ALL_MODULES.filter((m) => m.isPopular).slice(0, 4);

  return (
    <div className="relative w-full z-50 font-sans" ref={dropdownRef}>
      <div
        className={`flex items-center w-full h-[60px] md:h-[70px] bg-white  backdrop-blur-xl border transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] ${isFocused || showDropdown ? "ring-4 ring-[#FFFFFF]/20 border-[#FFFFFF] bg-white  shadow-[0_8px_30px_rgb(99,102,241,0.1)]" : "border-slate-200  hover:border-slate-300"}`}
        onClick={() => inputRef.current?.focus()}
      >
        <div className="pl-6 md:pl-8 pr-4 flex items-center justify-center h-full">
          {isSearching ? (
            <Loader2 className="w-5 h-5 md:w-6 md:h-6 text-indigo-500 animate-spin" />
          ) : (
            <Search
              className={`w-5 h-5 md:w-6 md:h-6 transition-colors duration-300 ${isFocused || query ? "text-indigo-500" : "text-slate-600 "}`}
            />
          )}
        </div>
        <label htmlFor="smart-search-input" className="sr-only">Search tools, materials, or calculations...</label>
<input
          id="smart-search-input"
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            setIsFocused(true);
            setShowDropdown(true);
          }}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          placeholder="Search tools, materials, or calculations..."
          className="w-full h-full bg-transparent border-none outline-none text-base md:text-lg font-semibold text-slate-800 placeholder-slate-500 px-2 cursor-text rounded-full"
        />

        {/* Keyboard Shortcut Hint */}
        {!query && !isFocused && (
          <div className="hidden md:flex items-center justify-center mr-4">
            <span className="flex items-center justify-center w-6 h-6 rounded bg-slate-100 border border-slate-200 text-slate-600 text-base font-medium font-mono">
              /
            </span>
          </div>
        )}

        <div className="mr-3 pr-2 flex items-center gap-2">
          <AnimatePresence>
            {query && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={clearSearch}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-600 hover:text-slate-600 transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </motion.button>
            )}
          </AnimatePresence>
          <div className="h-6 w-[1px] bg-slate-200 mx-1 hidden sm:block"></div>
          <button aria-label="Mic"
            type="button"
            onClick={startVoiceSearch}
            className={`p-3 rounded-full transition-all duration-300 ${isListening ? "bg-red-50 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-pulse" : "hover:bg-[#FFFFFF]/10  text-slate-600  hover:text-indigo-500"}`}
          >
            <Mic className="w-5 h-5 rounded-full transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="w-full absolute top-[calc(100%+8px)] left-0 right-0 bg-white backdrop-blur-xl rounded-[32px] border border-slate-200 shadow-[0_12px_40px_-12px_rgba(15,23,42,0.15)] overflow-hidden z-50 flex flex-col"
          >
            <div className="overflow-y-auto max-h-[65vh] p-3 md:p-4 pb-6 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
              {!query ? (
                /* EMPTY STATE (NO QUERY) */
                <div className="space-y-6">
                  {recentSearches.length > 0 && (
                    <div>
                      <div className="px-3 py-2 text-base font-medium uppercase tracking-wider text-slate-600 flex items-center gap-2">
                        <History className="w-3.5 h-3.5" /> Recent Searches
                      </div>
                      <div className="flex flex-wrap gap-2 px-3 mt-1">
                        {recentSearches.map((rec, i) => (
                          <button
                            key={i}
                            onClick={() => handleSelectQuery(rec)}
                            className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 text-sm font-medium px-4 py-2 rounded-full transition-colors flex items-center gap-2 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
                          >
                            <Clock className="w-3.5 h-3.5 text-slate-600" />
                            {rec}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="px-3 py-2 text-base font-medium uppercase tracking-wider text-slate-600 flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Try
                      Asking AI...
                    </div>
                    <div className="space-y-1 mt-1">
                      {SUGGESTED_SEARCHES.map((sugg, i) => (
                        <button
                          key={i}
                          onClick={() => handleSelectQuery(sugg)}
                          className="w-full text-left px-4 py-3 rounded-full hover:bg-[#FFFFFF]/10 text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors flex items-center justify-between group active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
                        >
                          <span>"{sugg}"</span>
                          <ArrowUpRight className="w-4 h-4 text-slate-700 group-hover:text-indigo-400 transition-colors" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="px-3 py-2 text-base font-medium uppercase tracking-wider text-slate-600 flex items-center gap-2">
                      <TrendingUp className="w-3.5 h-3.5 text-amber-500" />{" "}
                      Popular Tools
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 px-1">
                      {popularTools.map((mod) => {
                        const theme = getCategorySpec(mod.category);
                        return (
                          <div
                            key={mod.id}
                            onClick={() => handleSelectTool(mod.id)}
                            className={`group cursor-pointer flex items-center gap-3 bg-transparent hover:bg-slate-50   border-2 border-transparent hover:border-indigo-200 p-3 rounded-[32px] transition-all duration-200`}
                          >
                            <div
                              className={`w-10 h-10 shrink-0 rounded-[32px] flex items-center justify-center bg-indigo-50 text-indigo-600 group-hover:bg-[#FFFFFF] group-hover:text-slate-900 transition-colors duration-300`}
                            >
                              {mod.icon ? (
                                <mod.icon className="w-5 h-5" />
                              ) : (
                                <Box className="w-5 h-5" />
                              )}
                            </div>
                            <div className="flex-1 w-full text-left">
                              <h4 className="text-lg font-medium text-slate-800 mb-4">
                                {mod.title}
                              </h4>
                              <p className="line-clamp-1 text-base font-normal text-slate-600 leading-relaxed">
                                {mod.category}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                /* RESULTS STATE */
                <div className="space-y-4">
                  {localResults.length > 0 && (
                    <div>
                      <div className="px-3 py-2 text-base font-medium uppercase tracking-wider text-slate-600">
                        Calculators & Tools
                      </div>
                      <div className="space-y-1 mt-1">
                        {localResults.map((result, idx) => {
                          const fullModuleData = ALL_MODULES.find(
                            (m) => m.id === result.toolId,
                          );
                          const theme = getCategorySpec(result.category);
                          return (
                            <div
                              key={`local-${idx}`}
                              onClick={() => handleSelectTool(result.toolId)}
                              className={`group cursor-pointer flex items-center gap-4 bg-transparent hover:bg-slate-50   border-2 border-transparent hover:border-indigo-200 p-3 md:p-4 rounded-[32px] transition-all duration-200`}
                            >
                              <div
                                className={`w-12 h-12 shrink-0 rounded-[32px] flex items-center justify-center bg-indigo-50 text-indigo-600 group-hover:bg-[#FFFFFF] group-hover:text-slate-900 transition-transform duration-300 shadow-sm border border-indigo-100 group-hover:border-transparent`}
                              >
                                {fullModuleData?.icon ? (
                                  <fullModuleData.icon className="w-6 h-6" />
                                ) : (
                                  <Box className="w-6 h-6" />
                                )}
                              </div>

                              <div className="flex-1 w-full text-left">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                                  <h4 className="group-hover: transition-colors text-lg font-medium text-slate-800 mb-4">
                                    {result.toolName}
                                  </h4>
                                  <span className="hidden sm:inline bg-slate-100 text-slate-500 text-base font-medium px-2 py-0.5 rounded-full whitespace-nowrap">
                                    {result.category}
                                  </span>
                                </div>
                                <p className="line-clamp-2 text-base font-normal text-slate-600 leading-relaxed">
                                  {result.desc}
                                </p>
                              </div>
                              <ArrowUpRight className="hidden sm:block w-5 h-5 text-slate-700 group-hover:text-indigo-500 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {isCompletelyEmpty && (
                    <div className="text-center py-12 px-4">
                      <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="w-8 h-8 text-slate-700" />
                      </div>
                      <h3 className="mb-2 text-lg font-medium text-slate-800 mb-4">
                        No exact match
                      </h3>
                      <p className="w-full md:max-w-sm md:mx-auto mb-6 text-base font-normal text-slate-600 leading-relaxed px-4 md:px-0">
                        We don't have a dedicated template for "{query}". Try
                        asking the AI Assistant instead.
                      </p>
                      <button
                        onClick={() => handleSelectTool("ai")}
                        className="bg-white border border-[#FFFFFF] text-slate-900 font-bold py-3 px-6 rounded-full inline-flex items-center gap-2 shadow-[0_8px_16px_rgba(15,23,42,0.15)] transition-all hover:bg-[#FFFFFF] hover:-translate-y-0.5 w-full sm:w-auto justify-center active:scale-95 overflow-hidden"
                      >
                        <Sparkles className="w-5 h-5 text-amber-400" />
                        Calculate with AI
                      </button>
                    </div>
                  )}

                  {!isCompletelyEmpty && (
                    <div className="pt-2 border-t border-slate-100 mt-2">
                      <button
                        onClick={() => handleSelectTool("ai")}
                        className="w-full text-left px-4 py-3 rounded-full hover:bg-[#FFFFFF]/10 text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors flex items-center justify-between group bg-slate-50 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
                      >
                        <span className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-indigo-500" />
                          Can't find it? Ask AI to calculate "{query}"
                        </span>
                        <ArrowUpRight className="w-4 h-4 text-indigo-300 group-hover:text-indigo-500 transition-colors" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Fixed Footer of Dropdown */}
            {!query && (
              <div className="border-t border-slate-100 p-4 bg-slate-50 flex items-center justify-between text-sm font-medium text-slate-600">
                <span>Civil Estimation Pro Search Engine</span>
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-indigo-400" /> AI Powered
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
