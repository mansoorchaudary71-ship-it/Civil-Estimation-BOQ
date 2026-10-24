import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Menu, Search, X, Building2, ArrowRight, ChevronRight } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { ALL_MODULES } from "./Dashboard";
import { Button } from "./ui/Button";

/**
 * TopNavbar
 * Pattern sources
 *  - Coursera: logo · "Explore" mega-menu · wide search · Log In / Join for Free
 *  - Dribbble: quiet white bar, hairline border that appears on scroll, pill search, clear active state
 *
 * UX fixes vs. the previous header
 *  - "Features" pointed at a route that does not exist ("Module not found"); links now target real pages.
 *  - Items are real <a href> (ctrl/cmd-click, middle-click, copy link, screen-reader "link" role).
 *  - The logo was a clickable <div> (not focusable); it is now a link.
 *  - Constant height (the bar used to jump 80px -> 64px on scroll and shift the page).
 *  - Mobile drawer: Esc to close, scroll lock, aria-modal, tools reachable (before: only 2 links).
 *  - Tool catalogue is reachable from the header in one click (Explore).
 */

type NavProps = {
  onNavigate?: (id: string) => void;
  onOpenAuth?: () => void;
  onOpenProfile?: () => void;
};

const PRIMARY_LINKS: { id: string; label: string }[] = [
  { id: "my-estimates", label: "My Estimates" },
  { id: "pricing", label: "Pricing" },
  { id: "blog", label: "Blog" },
];

const hrefFor = (id: string) => (id === "home" ? "#/" : `#/${id}`);

export default function TopNavbar({ onNavigate, onOpenAuth, onOpenProfile }: NavProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [activeCat, setActiveCat] = useState<string>("");
  const [mobileCat, setMobileCat] = useState<string | null>(null);
  const { user } = useAuth();
  const location = useLocation();
  const exploreRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentId = location.pathname.replace(/^\//, "").split("/")[0] || "home";

  /** Categories in catalogue order, with their tools. */
  const categories = useMemo(() => {
    const map = new Map<string, typeof ALL_MODULES>();
    ALL_MODULES.forEach((m) => {
      if (!map.has(m.category)) map.set(m.category, []);
      map.get(m.category)!.push(m);
    });
    return Array.from(map.entries()).map(([name, tools]) => ({ name, tools }));
  }, []);

  useEffect(() => {
    if (!activeCat && categories.length) setActiveCat(categories[0].name);
  }, [categories, activeCat]);

  const go = useCallback(
    (id: string) => {
      if (onNavigate) onNavigate(id);
      else window.dispatchEvent(new CustomEvent("navigate-module", { detail: id }));
      setMobileOpen(false);
      setExploreOpen(false);
    },
    [onNavigate]
  );

  /** Keep native link behaviour for new-tab gestures, intercept plain clicks for SPA navigation. */
  const linkClick = (id: string) => (e: React.MouseEvent) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    go(id);
  };

  const openSearch = () => {
    setMobileOpen(false);
    setExploreOpen(false);
    window.dispatchEvent(new CustomEvent("open-global-search"));
  };
  const openAuth = () => {
    setMobileOpen(false);
    if (onOpenAuth) onOpenAuth();
    else window.dispatchEvent(new CustomEvent("open-login-modal"));
  };

  // Header border appears on scroll (Dribbble) - height never changes.
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Esc closes menus (and returns focus), click-outside closes the mega menu.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (exploreOpen) {
        setExploreOpen(false);
        exploreRef.current?.querySelector<HTMLElement>("button[aria-haspopup]")?.focus();
      }
      if (mobileOpen) setMobileOpen(false);
    };
    const onDown = (e: MouseEvent) => {
      if (exploreOpen && exploreRef.current && !exploreRef.current.contains(e.target as Node)) setExploreOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [exploreOpen, mobileOpen]);

  // Lock page scroll behind the mobile drawer.
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  useEffect(
    () => () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    },
    []
  );

  const hoverOpen = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    if (window.matchMedia("(hover: hover)").matches) setExploreOpen(true);
  };
  const hoverClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setExploreOpen(false), 160);
  };

  const active = categories.find((c) => c.name === activeCat) ?? categories[0];
  const initial = (user?.displayName || user?.email || "U").trim().charAt(0).toUpperCase();
  const toolCount = ALL_MODULES.length;

  const linkBase = "relative inline-flex items-center h-10 px-3 rounded-lg text-[15px] font-semibold transition-colors";
  const linkIdle =
    "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800";
  const linkActive = "text-primary-600 dark:text-primary-300";

  const menuButton = (extra: string) => (
    <button
      type="button"
      onClick={() => setMobileOpen((v) => !v)}
      aria-label={mobileOpen ? "Close menu" : "Open menu"}
      aria-expanded={mobileOpen}
      aria-controls="mobile-menu"
      className={`w-11 h-11 rounded-full items-center justify-center text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 ${extra}`}
    >
      {mobileOpen ? <X className="w-6 h-6" aria-hidden="true" /> : <Menu className="w-6 h-6" aria-hidden="true" />}
    </button>
  );

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-[120] h-[var(--header-h)] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b transition-colors duration-200 ${
          isScrolled || exploreOpen ? "border-slate-200 dark:border-slate-800" : "border-transparent"
        }`}
      >
        <nav aria-label="Primary" className="max-w-[1400px] h-full mx-auto px-4 sm:px-6 flex items-center gap-2 lg:gap-4">
          {/* Logo */}
          <a
            href="#/"
            onClick={linkClick("home")}
            aria-label="Civil Estimation Pro - home"
            className="flex items-center gap-2.5 shrink-0 rounded-lg pr-2"
          >
            <span className="w-9 h-9 rounded-lg bg-primary-600 text-white flex items-center justify-center">
              <Building2 className="w-5 h-5" aria-hidden="true" />
            </span>
            <span className="hidden sm:flex flex-col leading-none">
              <span className="font-bold text-[17px] tracking-tight text-slate-900 dark:text-white">Civil Estimation</span>
              <span className="mt-1 text-xs font-bold tracking-[0.18em] text-primary-600 dark:text-primary-300">PRO</span>
            </span>
          </a>

          {/* Explore (mega menu) */}
          <div ref={exploreRef} className="relative hidden lg:block" onMouseEnter={hoverOpen} onMouseLeave={hoverClose}>
            <button
              type="button"
              aria-haspopup="true"
              aria-expanded={exploreOpen}
              aria-controls="explore-menu"
              onClick={() => setExploreOpen((v) => !v)}
              className={`${linkBase} gap-1.5 ${
                exploreOpen ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white" : linkIdle
              }`}
            >
              Explore
              <ChevronDown className={`w-4 h-4 transition-transform ${exploreOpen ? "rotate-180" : ""}`} aria-hidden="true" />
            </button>

            {exploreOpen && active && (
              <div
                id="explore-menu"
                className="absolute left-0 top-full mt-2 w-[760px] max-w-[calc(100vw-2rem)] rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-brand-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
              >
                <div className="grid grid-cols-[260px_1fr]">
                  <ul className="p-2 bg-slate-50 dark:bg-slate-950/60 border-r border-slate-200 dark:border-slate-800 max-h-[420px] overflow-y-auto">
                    {categories.map((c) => {
                      const on = c.name === active.name;
                      return (
                        <li key={c.name}>
                          <button
                            type="button"
                            onMouseEnter={() => setActiveCat(c.name)}
                            onFocus={() => setActiveCat(c.name)}
                            onClick={() => setActiveCat(c.name)}
                            aria-current={on ? "true" : undefined}
                            className={`w-full flex items-center justify-between gap-2 text-left px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                              on
                                ? "bg-white dark:bg-slate-800 text-primary-600 dark:text-primary-300 shadow-sm"
                                : "text-slate-700 dark:text-slate-300 hover:bg-white/70 dark:hover:bg-slate-800/60"
                            }`}
                          >
                            <span className="truncate">{c.name}</span>
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                              {c.tools.length}
                              <ChevronRight className="w-4 h-4" aria-hidden="true" />
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>

                  <div className="p-4 flex flex-col">
                    <p className="px-2 pb-2 text-xs font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400">
                      {active.name}
                    </p>
                    <ul className="grid grid-cols-2 gap-1 flex-1 content-start">
                      {active.tools.slice(0, 10).map((t) => {
                        const Icon = t.icon as React.ComponentType<{ className?: string }> | undefined;
                        return (
                          <li key={t.id}>
                            <a
                              href={hrefFor(t.id)}
                              onClick={linkClick(t.id)}
                              className="flex items-start gap-2.5 px-2 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                              <span className="mt-0.5 w-7 h-7 shrink-0 rounded-md bg-primary-50 dark:bg-slate-800 text-primary-600 dark:text-primary-300 flex items-center justify-center">
                                {Icon && <Icon className="w-4 h-4" />}
                              </span>
                              <span className="text-sm font-medium leading-snug text-slate-800 dark:text-slate-100 line-clamp-2">
                                {t.title}
                              </span>
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                    <a
                      href="#/"
                      onClick={(e) => {
                        linkClick("home")(e);
                        setTimeout(() => document.getElementById("tools")?.scrollIntoView({ behavior: "smooth" }), 250);
                      }}
                      className="mt-3 inline-flex items-center gap-1.5 self-start px-2 py-1.5 text-sm font-semibold text-primary-600 dark:text-primary-300 hover:underline underline-offset-4"
                    >
                      Browse all {toolCount} tools <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Search pill - Coursera/Dribbble: search is the primary header action */}
          <button
            type="button"
            onClick={openSearch}
            aria-label="Search tools"
            className="hidden md:flex flex-1 max-w-xl items-center gap-3 h-11 pl-4 pr-2 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/60 text-left text-[15px] text-slate-500 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-500 transition-colors"
          >
            <Search className="w-[18px] h-[18px] shrink-0" aria-hidden="true" />
            <span className="flex-1 truncate">Search {toolCount}+ calculators, formulas, materials…</span>
            <kbd className="hidden xl:inline-flex items-center h-7 px-2 rounded-md border border-slate-200 dark:border-slate-600 text-xs font-semibold text-slate-500 dark:text-slate-300 bg-slate-50 dark:bg-slate-900">
              Ctrl K
            </kbd>
          </button>

          {/* Primary links */}
          <ul className="hidden lg:flex items-center gap-1 ml-auto">
            {PRIMARY_LINKS.map((l) => {
              const on = currentId === l.id;
              return (
                <li key={l.id}>
                  <a
                    href={hrefFor(l.id)}
                    onClick={linkClick(l.id)}
                    aria-current={on ? "page" : undefined}
                    className={`${linkBase} ${on ? linkActive : linkIdle}`}
                  >
                    {l.label}
                    {on && (
                      <span className="absolute left-3 right-3 -bottom-[13px] h-0.5 rounded-full bg-primary-600 dark:bg-primary-300" />
                    )}
                  </a>
                </li>
              );
            })}
          </ul>

          {/* Auth */}
          <div className="hidden md:flex items-center gap-2 ml-auto lg:ml-2">
            {user ? (
              <button
                type="button"
                onClick={() => onOpenProfile?.()}
                aria-label="Open profile"
                className="w-10 h-10 rounded-full bg-primary-600 text-white font-bold text-sm flex items-center justify-center hover:bg-primary-700 transition-colors"
              >
                {initial}
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={openAuth}
                  className="h-10 px-3 rounded-lg text-[15px] font-semibold text-primary-600 dark:text-primary-300 hover:bg-primary-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Log In
                </button>
                <Button size="sm" onClick={openAuth}>
                  Join for Free
                </Button>
              </>
            )}
          </div>

          {/* Mobile actions */}
          <div className="flex items-center gap-1 ml-auto md:hidden">
            <button
              type="button"
              onClick={openSearch}
              aria-label="Search tools"
              className="w-11 h-11 rounded-full flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Search className="w-5 h-5" aria-hidden="true" />
            </button>
            {menuButton("flex")}
          </div>

          {/* Tablet (md to lg): no Explore menu, keep a compact drawer button */}
          <div className="hidden md:flex lg:hidden items-center">{menuButton("flex")}</div>
        </nav>
      </header>

      {/* Mobile / tablet drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[130] lg:hidden" role="dialog" aria-modal="true" aria-label="Menu" id="mobile-menu">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setMobileOpen(false)} aria-hidden="true" />
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white dark:bg-slate-900 shadow-2xl flex flex-col animate-in slide-in-from-right-8 fade-in duration-200">
            <div className="h-[var(--header-h)] shrink-0 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800">
              <span className="font-bold text-slate-900 dark:text-white">Menu</span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="w-11 h-11 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white"
              >
                <X className="w-6 h-6" aria-hidden="true" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
              <button
                type="button"
                onClick={openSearch}
                className="w-full flex items-center gap-3 h-12 px-4 rounded-full border border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-[15px]"
              >
                <Search className="w-5 h-5" aria-hidden="true" /> Search tools…
              </button>

              <div>
                <p className="px-1 pb-2 text-xs font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400">
                  Explore tools
                </p>
                <ul className="divide-y divide-slate-100 dark:divide-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                  {categories.map((c) => {
                    const open = mobileCat === c.name;
                    return (
                      <li key={c.name}>
                        <button
                          type="button"
                          aria-expanded={open}
                          onClick={() => setMobileCat(open ? null : c.name)}
                          className="w-full flex items-center justify-between gap-2 px-4 py-3.5 text-left text-[15px] font-semibold text-slate-800 dark:text-slate-100"
                        >
                          <span>{c.name}</span>
                          <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
                        </button>
                        {open && (
                          <ul className="bg-slate-50 dark:bg-slate-950/50 px-2 pb-2">
                            {c.tools.map((t) => (
                              <li key={t.id}>
                                <a
                                  href={hrefFor(t.id)}
                                  onClick={linkClick(t.id)}
                                  className="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800"
                                >
                                  {t.title}
                                </a>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>

              <ul className="space-y-1">
                {PRIMARY_LINKS.map((l) => (
                  <li key={l.id}>
                    <a
                      href={hrefFor(l.id)}
                      onClick={linkClick(l.id)}
                      aria-current={currentId === l.id ? "page" : undefined}
                      className={`flex items-center h-12 px-3 rounded-lg text-[16px] font-semibold ${
                        currentId === l.id
                          ? "bg-primary-50 text-primary-700 dark:bg-slate-800 dark:text-primary-300"
                          : "text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div
              className="shrink-0 p-4 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2"
              style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
            >
              {user ? (
                <Button
                  fullWidth
                  variant="outline"
                  onClick={() => {
                    setMobileOpen(false);
                    onOpenProfile?.();
                  }}
                >
                  My Profile
                </Button>
              ) : (
                <>
                  <Button fullWidth onClick={openAuth}>
                    Join for Free
                  </Button>
                  <Button fullWidth variant="outline" onClick={openAuth}>
                    Log In
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
