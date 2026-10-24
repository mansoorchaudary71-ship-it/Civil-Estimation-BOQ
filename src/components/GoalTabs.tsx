import React, { useRef, useState } from "react";
import { ArrowRight, Clock } from "lucide-react";

/**
 * "What brings you here today?" - modelled on Coursera's goal selector.
 * Gives first-time visitors a task-first entry point instead of making them scan 80+ tools.
 * Tool metadata (title, time, difficulty) comes from the real catalogue; nothing is invented.
 */

type Mod = {
  id: string;
  title: string;
  desc?: string;
  icon?: any;
  difficulty?: string;
  estimatedTime?: string;
};

const GOALS: { key: string; label: string; blurb: string; ids: string[] }[] = [
  {
    key: "estimate",
    label: "Estimate a building",
    blurb: "Get a fast, defensible cost for a house or small project.",
    ids: ["house", "quick-estimation", "master-quantity", "cost-summary"],
  },
  {
    key: "takeoff",
    label: "Take off quantities",
    blurb: "Turn drawings into concrete, steel and masonry quantities.",
    ids: ["takeoff", "master-rcc", "volume-estimator", "bbs-generator"],
  },
  {
    key: "boq",
    label: "Price & prepare a BOQ",
    blurb: "Build a priced Bill of Quantities you can export and share.",
    ids: ["boq", "rates", "qs-workflow", "material-takeoff"],
  },
  {
    key: "site",
    label: "Check site & materials",
    blurb: "Quick conversions and checks while you are on site.",
    ids: ["metal-weight", "unit-converter", "earthworks", "aggregate-tests"],
  },
];

export default function GoalTabs({
  modules,
  onSelect,
}: {
  modules: Mod[];
  onSelect: (id: string) => void;
}) {
  const [active, setActive] = useState(GOALS[0].key);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    let next = -1;
    if (e.key === "ArrowRight") next = (index + 1) % GOALS.length;
    if (e.key === "ArrowLeft") next = (index - 1 + GOALS.length) % GOALS.length;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = GOALS.length - 1;
    if (next < 0) return;
    e.preventDefault();
    setActive(GOALS[next].key);
    tabRefs.current[GOALS[next].key]?.focus();
  };

  const goal = GOALS.find((g) => g.key === active) ?? GOALS[0];
  const tools = goal.ids.map((id) => modules.find((m) => m.id === id)).filter(Boolean) as Mod[];

  return (
    <section aria-labelledby="goal-title" className="w-full bg-white dark:bg-slate-950 py-12 md:py-16 border-y border-slate-200 dark:border-slate-800">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        <h2 id="goal-title" className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          What brings you here today?
        </h2>

        <div role="tablist" aria-label="Choose your goal" className="mt-5 flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {GOALS.map((g, i) => {
            const on = g.key === active;
            return (
              <button
                key={g.key}
                ref={(el) => {
                  tabRefs.current[g.key] = el;
                }}
                role="tab"
                id={`goal-tab-${g.key}`}
                aria-selected={on}
                aria-controls={`goal-panel-${g.key}`}
                tabIndex={on ? 0 : -1}
                onClick={() => setActive(g.key)}
                onKeyDown={(e) => onKeyDown(e, i)}
                className={`shrink-0 h-11 px-5 rounded-full border text-[15px] font-semibold transition-colors ${
                  on
                    ? "bg-primary-600 border-primary-600 text-white"
                    : "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-primary-600 hover:text-primary-700 dark:hover:text-primary-300"
                }`}
              >
                {g.label}
              </button>
            );
          })}
        </div>

        <div
          role="tabpanel"
          id={`goal-panel-${goal.key}`}
          aria-labelledby={`goal-tab-${goal.key}`}
          className="mt-6 animate-in fade-in duration-200"
          key={goal.key}
        >
          <p className="text-slate-600 dark:text-slate-300 mb-5">{goal.blurb}</p>
          <ul className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {tools.map((t) => {
              const Icon = t.icon as React.ComponentType<{ className?: string }> | undefined;
              return (
                <li key={t.id}>
                  <a
                    href={`#/${t.id}`}
                    onClick={(e) => {
                      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
                      e.preventDefault();
                      onSelect(t.id);
                    }}
                    className="group h-full flex flex-col rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 hover:border-primary-600 hover:shadow-brand-md transition"
                  >
                    <span className="w-10 h-10 rounded-lg bg-primary-50 dark:bg-slate-800 text-primary-600 dark:text-primary-300 flex items-center justify-center">
                      {Icon && <Icon className="w-5 h-5" />}
                    </span>
                    <span className="mt-3 font-semibold text-slate-900 dark:text-white leading-snug line-clamp-2">{t.title}</span>
                    <span className="mt-auto pt-3 flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="w-4 h-4" aria-hidden="true" />
                        {t.estimatedTime || "A few minutes"}
                      </span>
                      <ArrowRight className="w-4 h-4 text-primary-600 dark:text-primary-300 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
