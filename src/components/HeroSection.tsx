import React, { useState } from "react";
import { ArrowRight, Search, FileSpreadsheet, Calculator, Layers, Ruler, CheckCircle2 } from "lucide-react";
import { Button } from "./ui/Button";

/**
 * Landing hero.
 * Patterns: Coursera (left-aligned value prop, one primary CTA, goal-oriented entry points)
 *           Dribbble (search-first hero with "trending" tag pills).
 *
 * Fixes vs. previous hero
 *  - Removed unverifiable claims ("99.9% Accuracy", "Trusted by 10,000+") and hotlinked pravatar.cc
 *    stock avatars presented as real users (trust + privacy + availability risk).
 *  - "See How It Works" had no handler (dead button); it now scrolls to the section.
 *  - min-h-screen + absolutely-positioned "Scroll" indicator overlapped content on short screens.
 *  - rotate-x-[12deg] / perspective-[...] are Tailwind v4 utilities and silently did nothing on v3.
 *  - Heavy scroll-linked parallax removed (jank on mobile, ignored prefers-reduced-motion).
 */

const TRENDING: { id: string; label: string }[] = [
  { id: "house", label: "House cost estimate" },
  { id: "metal-weight", label: "Steel weight" },
  { id: "master-rcc", label: "RCC quantities" },
  { id: "boq", label: "BOQ generator" },
  { id: "unit-converter", label: "Unit converter" },
];

const goTo = (id: string) => window.dispatchEvent(new CustomEvent("navigate-module", { detail: id }));

export default function HeroSection({ onStart, toolCount = 60 }: { onStart: () => void; toolCount?: number }) {
  const [query, setQuery] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent("set-tool-search", { detail: query.trim() }));
  };

  const facts = [
    { icon: Calculator, value: `${toolCount}+`, label: "calculators & workflows" },
    { icon: FileSpreadsheet, value: "Excel + PDF", label: "export ready BOQs" },
    { icon: Layers, value: "Metric & imperial", label: "units supported" },
  ];

  return (
    <section
      aria-labelledby="hero-title"
      className="relative w-full overflow-hidden bg-gradient-to-b from-accent-50 via-white to-white dark:from-ink-800 dark:via-ink dark:to-ink pt-[calc(var(--header-h)+2.5rem)] pb-16 md:pb-24"
    >
      <div className="relative max-w-[1240px] mx-auto px-4 sm:px-6 grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
        {/* Copy */}
        <div className="lg:col-span-7 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-accent-900 dark:text-accent-300 bg-accent-100/70 dark:bg-accent-500/20 rounded-full px-3 py-1 mb-5">
            <CheckCircle2 className="w-4 h-4" aria-hidden="true" /> Built on standard quantity-surveying formulas
          </p>

          <h1
            id="hero-title"
            className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold tracking-tight leading-[1.1] text-txt-primary"
          >
            Estimate quantities and costs{" "}
            <span className="text-accent-800 dark:text-accent-400">in minutes, not days</span>
          </h1>

          <p className="mt-5 text-lg text-txt-secondary max-w-xl">
            Calculators for concrete, steel, masonry, finishes, earthworks and roads, plus a guided workflow that
            turns your measurements into a priced Bill of Quantities.
          </p>

          {/* Dribbble-style search + trending pills */}
          <form onSubmit={submit} role="search" className="mt-8 max-w-xl">
            <label htmlFor="hero-search" className="sr-only">
              Search calculators
            </label>
            <div className="flex items-center rounded-full border border-ui-borderDefault bg-surface-default pl-5 pr-1.5 h-14 shadow-brand-sm focus-within:border-accent-800 focus-within:ring-4 focus-within:ring-accent-500/15 transition">
              <Search className="w-5 h-5 text-txt-tertiary shrink-0" aria-hidden="true" />
              <input
                id="hero-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="What do you need to calculate?"
                autoComplete="off"
                className="flex-1 min-w-0 h-full bg-transparent border-0 shadow-none focus:ring-0 focus:outline-none px-3 text-base text-txt-primary placeholder:text-txt-tertiary"
              />
              <Button type="submit" className="rounded-full h-11 min-h-0 px-5">
                Search
              </Button>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-txt-secondary mr-1">Trending:</span>
              {TRENDING.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => goTo(t.id)}
                  className="h-9 px-3.5 rounded-full border border-border-color bg-surface-default text-sm font-medium text-txt-primary hover:border-accent-800 hover:text-accent-800 dark:hover:text-accent-400 transition-colors"
                >
                  {t.label}
                </button>
              ))}
            </div>
          </form>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Button size="lg" onClick={onStart} rightIcon={<ArrowRight className="w-5 h-5" aria-hidden="true" />}>
              Start a house estimate
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
            >
              See how it works
            </Button>
          </div>

          <dl className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl">
            {facts.map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-lg bg-surface-default border border-border-color text-accent-800 dark:text-accent-400 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" aria-hidden="true" />
                </span>
                <div>
                  <dt className="font-bold text-txt-primary leading-tight">{value}</dt>
                  <dd className="text-sm text-txt-secondary leading-tight">{label}</dd>
                </div>
              </div>
            ))}
          </dl>
        </div>

        {/* Product preview (static, decorative) */}
        <div className="lg:col-span-5 hidden md:block animate-in fade-in slide-in-from-bottom-8 duration-700" aria-hidden="true">
          <div className="rounded-2xl border border-border-color bg-surface-default shadow-brand-lg overflow-hidden">
            <div className="h-11 px-4 flex items-center gap-2 border-b border-border-color bg-surface-hover">
              <span className="w-3 h-3 rounded-full bg-secondary-300 dark:bg-ink-500" />
              <span className="w-3 h-3 rounded-full bg-secondary-300 dark:bg-ink-500" />
              <span className="w-3 h-3 rounded-full bg-secondary-300 dark:bg-ink-500" />
              <span className="ml-3 text-xs font-semibold text-txt-secondary">RCC Slab · Quantity takeoff</span>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { k: "Concrete", v: "12.4 m³" },
                  { k: "Steel", v: "1,046 kg" },
                  { k: "Cement", v: "89 bags" },
                ].map((m) => (
                  <div key={m.k} className="rounded-xl border border-border-color p-3">
                    <p className="text-xs font-semibold text-txt-secondary">{m.k}</p>
                    <p className="mt-1 text-lg font-bold tabular-nums text-txt-primary">{m.v}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-xl border border-border-color divide-y divide-border-color">
                {[
                  ["Excavation", "38.2 m³"],
                  ["PCC 1:4:8", "2.1 m³"],
                  ["RCC 1:2:4", "12.4 m³"],
                  ["Brick masonry", "21.7 m³"],
                ].map(([a, b]) => (
                  <div key={a} className="flex items-center justify-between px-4 py-2.5 text-sm">
                    <span className="flex items-center gap-2 text-txt-secondary">
                      <Ruler className="w-4 h-4 text-accent-800 dark:text-accent-400" /> {a}
                    </span>
                    <span className="font-semibold tabular-nums text-txt-primary">{b}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-txt-secondary">Illustrative sample values.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
