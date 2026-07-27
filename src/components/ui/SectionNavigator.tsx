import { Button } from './/Button';
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Hash } from "lucide-react";


export default function SectionNavigator() {
  const [isOpen, setIsOpen] = useState(false);
  const [sections, setSections] = useState<{ id: string; title: string; element: HTMLElement }[]>([]);
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "j") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      const mainContent = document.getElementById("main-content");
      if (mainContent) {
        // Query elements with ID starting with "section-"
        const headings = Array.from(mainContent.querySelectorAll("[id^='section-']"));
        const foundSections = headings.map(h => {
            // Check if it's a heading, or find a heading inside it
            let title = "";
            if (h.tagName.match(/^H[1-6]$/i)) {
                title = h.textContent?.replace(/\s+/g, ' ').trim() || "";
            } else {
                const innerHeading = h.querySelector("h1, h2, h3, h4, h5, h6");
                if (innerHeading) {
                    title = innerHeading.textContent?.replace(/\s+/g, ' ').trim() || "";
                } else {
                    title = h.id.replace("section-", "").replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
                }
            }
            
            // Clean up numbers like from span tags
            title = title.replace(/\d+$/, '').trim();

            return {
                id: h.id,
                title,
                element: h as HTMLElement
            };
        }).filter(s => s.title);
        setSections(foundSections);
      }
      setSearch("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const filteredSections = sections.filter(s => s.title.toLowerCase().includes(search.toLowerCase()));

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  // Ensure selected item is visible in list
  useEffect(() => {
    if (listRef.current) {
        const selectedEl = listRef.current.children[0]?.children[selectedIndex] as HTMLElement;
        if (selectedEl) {
            const containerHeight = listRef.current.clientHeight;
            const elementTop = selectedEl.offsetTop;
            const elementHeight = selectedEl.clientHeight;
            
            if (elementTop < listRef.current.scrollTop) {
                listRef.current.scrollTop = elementTop;
            } else if (elementTop + elementHeight > listRef.current.scrollTop + containerHeight) {
                listRef.current.scrollTop = elementTop + elementHeight - containerHeight;
            }
        }
    }
  }, [selectedIndex]);

  const handleNavigate = (element: HTMLElement) => {
    setIsOpen(false);
    
    let activeContainer: HTMLElement | Window = window;
    let maxScroll = window.scrollY || document.documentElement.scrollTop;
    const scrollableContainers = document.querySelectorAll('.overflow-y-auto, .overflow-y-scroll, main div, #main-content');
    
    for (let i = 0; i < scrollableContainers.length; i++) {
        const el = scrollableContainers[i] as HTMLElement;
        if (el.clientHeight >= window.innerHeight * 0.5 && el.scrollTop > maxScroll) {
            maxScroll = el.scrollTop;
            activeContainer = el;
        }
    }

    if (activeContainer instanceof HTMLElement && activeContainer.contains(element)) {
        // Calculate offset based on scroll container
        let elY = element.offsetTop - 80;
        
        // Adjust for fixed headers inside container
        const stickyHeader = activeContainer.querySelector('.sticky, .fixed');
        if (stickyHeader) {
           elY -= stickyHeader.clientHeight;
        }

        activeContainer.scrollTo({ top: Math.max(0, elY), behavior: "smooth" });
    } else {
         const y = element.getBoundingClientRect().top + window.scrollY - 80;
         window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, filteredSections.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredSections.length) % Math.max(1, filteredSections.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredSections.length > 0) {
        handleNavigate(filteredSections[selectedIndex].element);
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] sm:pt-[20vh] px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative w-full max-w-lg bg-surface-default dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-ui-borderSubtle dark:border-slate-800 flex flex-col max-h-[60vh]"
          >
            <div className="flex items-center px-4 py-3 border-b border-slate-100 dark:border-slate-800">
              <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Jump to section... (Type to filter)"
                className="flex-1 bg-transparent border-none focus:outline-none text-txt-primary dark:text-slate-200 text-lg placeholder-slate-400"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <div className="flex items-center gap-2 ml-3">
                <span className="hidden sm:inline-flex items-center justify-center px-1.5 py-0.5 rounded border border-ui-borderSubtle dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[10px] font-medium text-txt-tertiary uppercase tracking-widest">esc</span>
                <Button onClick={() => setIsOpen(false)} className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors">
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
            
            <div ref={listRef} className="flex-1 overflow-y-auto p-2 scroll-smooth">
              {filteredSections.length > 0 ? (
                <div className="flex flex-col space-y-1">
                  {filteredSections.map((section, idx) => (
                    <Button
                      key={section.id}
                      onClick={() => handleNavigate(section.element)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full text-left flex items-center px-3 py-3 rounded-xl transition-colors ${idx === selectedIndex ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-txt-secondary dark:text-slate-300'}`}
                    >
                      <Hash className={`w-4 h-4 mr-3 shrink-0 ${idx === selectedIndex ? 'text-indigo-500' : 'text-slate-400'}`} />
                      <span className="font-medium truncate">{section.title}</span>
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-12 text-center text-txt-tertiary">
                  No sections found matching "{search}"
                </div>
              )}
            </div>
            <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs text-txt-tertiary flex justify-between items-center">
                <span>Use <kbd className="px-1.5 py-0.5 rounded bg-surface-default dark:bg-slate-700 border border-ui-borderSubtle dark:border-slate-600 font-mono shadow-sm">↑</kbd> <kbd className="px-1.5 py-0.5 rounded bg-surface-default dark:bg-slate-700 border border-ui-borderSubtle dark:border-slate-600 font-mono shadow-sm">↓</kbd> to navigate</span>
                <span><kbd className="px-1.5 py-0.5 rounded bg-surface-default dark:bg-slate-700 border border-ui-borderSubtle dark:border-slate-600 font-mono shadow-sm">Enter</kbd> to select</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
