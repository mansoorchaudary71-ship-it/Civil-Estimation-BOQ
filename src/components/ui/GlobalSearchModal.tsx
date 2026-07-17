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
  
  const results = ALL_MODULES.filter((mod) => {
    if (searchWords.length === 0) return false;
    return searchWords.every(
      (word) => 
        mod.title.toLowerCase().includes(word) || 
        mod.desc.toLowerCase().includes(word) || 
        mod.category.toLowerCase().includes(word)
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
            <span key={i} className="text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-500/20 px-0.5 rounded">{part}</span> : 
            part;
        })}
      </>
    );
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-start justify-center pt-[10vh] sm:pt-[15vh] px-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-[2rem] sm:rounded-[32px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] border border-white/40 dark:border-slate-800 overflow-hidden flex flex-col animate-in slide-in-from-top-8 sm:zoom-in-95 duration-300">
        
        {/* Search Input Area */}
        <div className="p-6 sm:p-8 flex items-center gap-4 border-b border-slate-100/50 dark:border-slate-800/50">
          <Search className="w-6 h-6 text-indigo-500 shrink-0" strokeWidth={2.5} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search tools, materials..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:ring-0 tracking-tight"
          />
          <button 
            onClick={onClose}
            className="p-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-2xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors shrink-0"
          >
            <X className="w-5 h-5" strokeWidth={2.5} />
          </button>
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar max-h-[60vh]">
          {searchWords.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center">
              <div className="w-20 h-20 rounded-[24px] bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center mb-5 shadow-sm border border-slate-100 dark:border-slate-800">
                <Search className="w-8 h-8 text-slate-300 dark:text-slate-600" strokeWidth={2} />
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-bold text-lg tracking-tight">Type anything to start searching...</p>
            </div>
          ) : results.length > 0 ? (
            <div className="p-4 sm:p-6 flex flex-col gap-3">
              <div className="px-3 pb-2">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                  {results.length} result{results.length !== 1 && "s"} found
                </p>
              </div>
              {results.map((mod) => (
                <button
                  key={mod.id}
                  onClick={() => {
                    onNavigate(mod.id);
                    onClose();
                  }}
                  className="group flex items-start gap-5 p-4 sm:p-5 rounded-3xl bg-slate-50/50 hover:bg-indigo-50/50 dark:bg-slate-800/30 dark:hover:bg-indigo-900/20 border border-transparent hover:border-indigo-100 dark:hover:border-indigo-800/50 transition-all duration-300 text-left w-full hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/5"
                >
                  <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-center shrink-0 text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300">
                    <mod.icon className="w-6 h-6" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 overflow-hidden pt-1">
                    <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 mb-1.5 group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors tracking-tight">
                      {highlightMatch(mod.title, searchWords)}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 font-medium">
                      {highlightMatch(mod.desc, searchWords)}
                    </p>
                  </div>
                  <div className="shrink-0 w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-indigo-600 text-slate-400 group-hover:text-white transition-all duration-300 mt-2 shadow-sm">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center flex flex-col items-center justify-center">
               <div className="w-20 h-20 rounded-[24px] bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center mb-5 shadow-sm border border-slate-100 dark:border-slate-800">
                <Search className="w-8 h-8 text-slate-300 dark:text-slate-600 opacity-50" strokeWidth={2} />
              </div>
              <p className="text-slate-600 dark:text-slate-300 font-bold text-lg tracking-tight">No results found for "{searchTerm}"</p>
              <p className="text-slate-400 dark:text-slate-500 text-sm mt-2 font-medium">Try searching for materials like "concrete", "steel", or tools like "calculator".</p>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
