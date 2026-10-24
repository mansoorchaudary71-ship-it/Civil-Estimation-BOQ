import React, { useEffect, useMemo, useRef, useState } from "react";
import { Search, Sparkles, X } from "lucide-react";

/**
 * Sticky search + category filter bar (Dribbble tag-page pattern: search on top, pill filters beneath,
 * result count, everything stays pinned while the grid scrolls).
 *
 * Fixes vs. previous bar
 *  - `sticky top-[60px]` assumed a 60px header, but the header was 64-80px, so the bar either hid under it
 *    or floated with a gap. It now pins to the shared `--header-h` token.
 *  - Hard-coded light colours (#f8f9fa) had no dark variant.
 *  - Suggestions were only reachable by mouse. Added combobox/listbox semantics and arrow-key navigation.
 *  - Suggestions closed on a 200ms blur timer (race with click). Uses mouse-down selection instead.
 *  - Tapping a category now also shows the active state via aria-pressed; count line is aria-live.
 */

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

const POPULAR = ["Concrete Volume", "Steel Weight", "Cost Estimate"];

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
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(-1);

  // "/" focuses the search (GitHub/Dribbble convention) unless the user is already typing.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement as HTMLElement | null;
      const typing = !!el && (/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) || el.isContentEditable);
      if (e.key === "/" && !typing && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const suggestions = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term || !allTools.length) return [];
    return allTools
      .filter((t) => t.name.toLowerCase().includes(term) || t.category.toLowerCase().includes(term))
      .slice(0, 6);
  }, [searchTerm, allTools]);

  useEffect(() => setIdx(-1), [searchTerm]);

  // keep the active pill in view
  useEffect(() => {
    const tab = tabRefs.current[activeCategory];
    const row = tab?.parentElement;
    if (tab && row) {
      row.scrollTo({ left: tab.offsetLeft - row.offsetWidth / 2 + tab.offsetWidth / 2, behavior: "smooth" });
    }
  }, [activeCategory]);

  const choose = (tool: { id: string; name: string }) => {
    setOpen(false);
    if (onSelectModule) {
      setSearchTerm("");
      onSelectModule(tool.id);
    } else {
      setSearchTerm(tool.name);
    }
  };

  const onInputKey = (e: React.KeyboardEvent) => {
    if (!suggestions.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setIdx((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIdx((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === "Enter" && idx >= 0) {
      e.preventDefault();
      choose(suggestions[idx]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const showList = open && suggestions.length > 0;

  return (
    <div
      id="tools"
      className="sticky top-[var(--header-h)] z-40 w-full border-b border-ui-borderSubtle bg-surface-default/95 backdrop-blur-md scroll-mt-[var(--header-h)]"
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-3 sm:py-4">
        {/* Search */}
        <div className="w-full max-w-2xl">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-txt-tertiary" aria-hidden="true" />
            <label htmlFor="tool-search" className="sr-only">
              Search tools, materials, or calculations
            </label>
            <input
              id="tool-search"
              ref={inputRef}
              type="text"
              role="combobox"
              aria-expanded={showList}
              aria-controls="tool-search-list"
              aria-autocomplete="list"
              aria-activedescendant={idx >= 0 ? `tool-opt-${idx}` : undefined}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              onBlur={() => setOpen(false)}
              onKeyDown={onInputKey}
              placeholder="Search tools, materials, or calculations…"
              autoComplete="off"
              className="h-12 w-full rounded-full border border-ui-borderDefault bg-surface-default pl-12 pr-11 text-base text-txt-primary placeholder:text-txt-tertiary shadow-none focus:border-primary-600 focus:ring-4 focus:ring-primary-600/15"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  inputRef.current?.focus();
                }}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-txt-tertiary hover:bg-surface-hover hover:text-txt-primary"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            )}

            {showList && (
              <ul
                id="tool-search-list"
                role="listbox"
                className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-ui-borderSubtle bg-surface-default shadow-brand-lg animate-in fade-in slide-in-from-top-2 duration-150"
              >
                {suggestions.map((tool, i) => (
                  <li
                    key={tool.id}
                    id={`tool-opt-${i}`}
                    role="option"
                    aria-selected={i === idx}
                    // mousedown fires before the input's blur, so the click is never lost
                    onMouseDown={(e) => {
                      e.preventDefault();
                      choose(tool);
                    }}
                    onMouseEnter={() => setIdx(i)}
                    className={`flex cursor-pointer items-center justify-between gap-3 px-4 py-3 ${
                      i === idx ? "bg-surface-hover" : ""
                    }`}
                  >
                    <span className="text-[15px] font-medium text-txt-primary">{tool.name}</span>
                    <span className="shrink-0 rounded-full bg-surface-hover px-2.5 py-1 text-xs font-semibold text-txt-secondary">
                      {tool.category}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-3 hidden items-center gap-2 md:flex">
            <span className="flex items-center gap-1.5 text-sm font-semibold text-txt-tertiary">
              <Sparkles className="h-3.5 w-3.5 text-primary-600" aria-hidden="true" /> Popular:
            </span>
            {POPULAR.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => setSearchTerm(chip)}
                className="h-8 rounded-full border border-ui-borderSubtle bg-surface-default px-3 text-[13px] font-medium text-txt-secondary transition-colors hover:border-primary-600 hover:text-primary-700"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        {/* Category pills */}
        <div className="relative -mx-4">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-6 bg-gradient-to-r from-[rgb(var(--color-bg-surface))] to-transparent md:hidden" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-[rgb(var(--color-bg-surface))] to-transparent md:hidden" />
          <div role="group" aria-label="Filter by category" className="scrollbar-hide flex items-center gap-2 overflow-x-auto px-4 py-1 md:flex-wrap md:overflow-visible">
            {categories.map((cat) => {
              const on = activeCategory === cat.name;
              return (
                <button
                  key={cat.name}
                  type="button"
                  ref={(el) => {
                    tabRefs.current[cat.name] = el;
                  }}
                  aria-pressed={on}
                  onClick={() => setActiveCategory(cat.name)}
                  className={`flex h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-4 text-sm font-semibold transition-colors ${
                    on
                      ? "border-primary-600 bg-primary-600 text-white"
                      : "border-ui-borderDefault bg-surface-default text-txt-secondary hover:border-primary-600 hover:text-primary-700"
                  }`}
                >
                  {cat.name}
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-bold tabular-nums ${
                      on ? "bg-white/20 text-white" : "bg-surface-hover text-txt-secondary"
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <p className="text-sm text-txt-tertiary" role="status" aria-live="polite">
          Showing <strong className="font-bold text-txt-primary">{totalFilteredCount}</strong> tools in{" "}
          <strong className="font-bold text-primary-600">{activeCategory}</strong>
        </p>
      </div>
    </div>
  );
}
