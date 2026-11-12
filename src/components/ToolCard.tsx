import React from "react";
import { Bookmark, BookmarkCheck, ArrowRight, Box, Clock, Flame } from "lucide-react";
import { useSettings } from "../context/SettingsContext";
import { cn } from "../lib/utils";

/**
 * ToolCard - Dribbble "shot" card: visual thumbnail, quiet meta row, hover reveal, save button.
 *
 * Fixes vs. previous card
 *  - The whole card was a clickable <div> (not focusable, not a link, no ctrl/cmd-click).
 *    Now the title is a real link with a stretched hit-area (`after:absolute after:inset-0`).
 *  - A full-screen "quick view" modal opened after hovering 500ms. Scrolling past a card
 *    popped a modal over the page. Removed.
 *  - The modal (and card) showed made-up numbers: "Accuracy 98.5%", "Saves 1.2k+", "Usage High"
 *    for every tool, and a fake difficulty derived from `id.length % 3`. The catalogue already has
 *    real `difficulty` and `estimatedTime`; those are used and nothing is invented.
 *  - Button nested in a clickable div, 40px padding, 10px labels, and a shared framer `layoutId`
 *    that fought with the page transition are gone.
 */

// One amber system for every category (Dribbble has no per-category colours).
// getCategorySpec keeps its signature for SmartSearch; it always returns this spec.
const CAT_COLORS: Record<string, { c: string; glow: string }> = {
  DEFAULT: { c: "#855307", glow: "rgba(242,164,19,0.14)" },
};

// Exported: SmartSearch imports it.
export const getCategorySpec = (_category: string) => CAT_COLORS["DEFAULT"];

export default function ToolCard({
  mod,
  onSelect,
  layoutId,
}: {
  mod: any;
  onSelect: (id: string, layoutId?: string) => void;
  layoutId?: string;
  /** kept for backwards compatibility with existing callers; the card no longer uses it */
  categoryColor?: string;
}) {
  const { settings, updateSettings } = useSettings();
  if (!mod) return null;

  const cfg = getCategorySpec(mod.category);
  const favoriteTools: string[] = settings?.favoriteTools || [];
  const saved = favoriteTools.includes(mod.id);
  const Icon = mod.icon || Box;

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    updateSettings({
      favoriteTools: saved ? favoriteTools.filter((id) => id !== mod.id) : [...favoriteTools, mod.id],
    });
  };

  const open = (e: React.MouseEvent) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    onSelect(mod.id, layoutId || `module-${mod.id}`);
  };

  return (
    <article
      id={`module-card-${mod.id}`}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-card border border-ui-borderSubtle bg-surface-default",
        "transition-[box-shadow,border-color] duration-200 hover:border-ui-borderDefault hover:shadow-brand-md",
        "focus-within:border-accent-800 focus-within:shadow-brand-md"
      )}
    >
      {/* Thumbnail */}
      <div
        className="relative flex aspect-[16/9] items-center justify-center overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${cfg.glow} 0%, transparent 70%)` }}
      >
        <span
          className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-default shadow-brand-sm border border-ui-borderSubtle transition-transform duration-300 group-hover:scale-105"
          style={{ color: cfg.c }}
        >
          <Icon size={30} strokeWidth={1.8} aria-hidden="true" />
        </span>

        <div className="absolute left-3 top-3 flex gap-1.5">
          {mod.isNew && (
            <span className="rounded-full bg-ink px-2.5 py-1 text-xs font-bold text-white">New</span>
          )}
          {mod.isPopular && (
            <span className="inline-flex items-center gap-1 rounded-full bg-surface-default px-2.5 py-1 text-xs font-bold text-txt-primary border border-ui-borderSubtle">
              <Flame className="h-3 w-3 text-accent-700" aria-hidden="true" /> Popular
            </span>
          )}
        </div>

        {/* Save - sits above the stretched link */}
        <button
          type="button"
          onClick={toggleFavorite}
          aria-pressed={saved}
          aria-label={saved ? `Remove ${mod.title} from saved tools` : `Save ${mod.title}`}
          className="absolute z-10 right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-surface-default/95 border border-ui-borderSubtle text-txt-secondary hover:text-accent-800 hover:border-accent-800 transition-colors"
        >
          {saved ? (
            <BookmarkCheck size={18} className="text-accent-800" aria-hidden="true" />
          ) : (
            <Bookmark size={18} aria-hidden="true" />
          )}
        </button>

        {/* Hover reveal (pointer devices only; the title link is always available) */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 hidden translate-y-2 items-center justify-end bg-gradient-to-t from-black/35 to-transparent p-3 opacity-0 transition duration-200 group-hover:translate-y-0 group-hover:opacity-100 [@media(hover:hover)]:flex">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-default px-3.5 py-1.5 text-sm font-semibold text-txt-primary">
            Open tool <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-base font-semibold leading-snug text-txt-primary line-clamp-2">
          <a
            href={`#/${mod.id}`}
            onClick={open}
            className="after:absolute after:inset-0 after:content-[''] focus:outline-none"
          >
            {mod.title}
          </a>
        </h3>
        <p className="mt-1.5 text-sm text-txt-secondary line-clamp-2">{mod.desc || "Engineering calculator."}</p>

        <div className="mt-auto flex items-center justify-between gap-3 pt-4 text-[13px] text-txt-tertiary">
          <span className="flex min-w-0 items-center gap-1.5">
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: cfg.c }} aria-hidden="true" />
            <span className="truncate">{mod.category}</span>
          </span>
          <span className="flex shrink-0 items-center gap-3">
            {mod.difficulty && <span>{mod.difficulty}</span>}
            {mod.estimatedTime && (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                {mod.estimatedTime}
              </span>
            )}
          </span>
        </div>
      </div>
    </article>
  );
}
