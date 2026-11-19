import React from "react";
import { Bookmark, BookmarkCheck, ArrowUpRight, Box, Clock, Flame, Sparkles } from "lucide-react";
import { useSettings } from "../context/SettingsContext";
import { cn } from "../lib/utils";
import { getToolImage, getShortCategory } from "../lib/toolImages";

/**
 * ToolCard - photo-first card.
 *
 *  - Soft tinted card with an inset rounded cover image (what the tool is about: bricks, concrete, rebar...).
 *  - Category badge on the image, three colour-coded pills below (highlight / time / difficulty).
 *  - Brand colour: #885202.
 *  - Hover (pointer devices): card lifts and scales slightly, shadow deepens, image zooms gently.
 *    Honors prefers-reduced-motion.
 *
 * Accessibility / behaviour kept from the previous card:
 *  - The title is a real link with a stretched hit-area (`after:absolute after:inset-0`), so ctrl/cmd-click works.
 *  - The save button sits above the stretched link.
 *  - Only real catalogue data is shown (difficulty, estimatedTime, isNew, isPopular) - nothing is invented.
 */

export const BRAND = "#885202";

// getCategorySpec keeps its signature for SmartSearch; it always returns the brand spec.
const CAT_COLORS: Record<string, { c: string; glow: string }> = {
  DEFAULT: { c: BRAND, glow: "rgba(136,82,2,0.14)" },
};
export const getCategorySpec = (_category: string) => CAT_COLORS["DEFAULT"];

/** 1-3 filled bars, like a signal meter. */
function LevelBars({ level }: { level: 1 | 2 | 3 }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" className="shrink-0">
      {[0, 1, 2].map((i) => (
        <rect
          key={i}
          x={1 + i * 4.5}
          y={9 - i * 3.5}
          width="3"
          height={4 + i * 3.5}
          rx="1"
          fill="currentColor"
          opacity={i < level ? 1 : 0.35}
        />
      ))}
    </svg>
  );
}

const levelOf = (d?: string): 1 | 2 | 3 => {
  const v = (d || "").toLowerCase();
  if (v.startsWith("adv") || v.startsWith("exp")) return 3;
  if (v.startsWith("int") || v.startsWith("med")) return 2;
  return 1;
};

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

  // Hover "pop" only where hover exists (avoids sticky hover on touch screens).
  const pop =
    "[@media(hover:hover)]:hover:-translate-y-2 [@media(hover:hover)]:hover:scale-[1.03] [@media(hover:hover)]:hover:z-10 " +
    "[@media(hover:hover)]:hover:shadow-[0_26px_44px_-14px_rgba(136,82,2,0.50)] " +
    "focus-within:-translate-y-1 focus-within:shadow-[0_18px_34px_-12px_rgba(136,82,2,0.45)] " +
    "motion-reduce:transform-none motion-reduce:transition-none";

  const pill = "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[13px] font-semibold leading-none";

  return (
    <article
      id={`module-card-${mod.id}`}
      className={cn(
        "group relative flex h-full flex-col rounded-[28px] p-2.5",
        "border border-[#885202]/15 bg-[#FBF0DC] dark:border-white/10 dark:bg-[#2b1d0e]",
        "shadow-[0_2px_10px_-4px_rgba(136,82,2,0.25)] will-change-transform",
        "transition-[transform,box-shadow] duration-300 ease-out",
        pop
      )}
    >
      {/* Cover image */}
      <div className="relative aspect-[16/10] overflow-hidden rounded-[20px] bg-[#e9d3a8]">
        <img
          src={getToolImage(mod)}
          alt=""
          width={400}
          height={250}
          loading="lazy"
          decoding="async"
          draggable={false}
          className="h-full w-full object-cover transition-transform duration-500 ease-out [@media(hover:hover)]:group-hover:scale-110 motion-reduce:transition-none"
        />

        {/* Save - sits above the stretched link */}
        <button
          type="button"
          onClick={toggleFavorite}
          aria-pressed={saved}
          aria-label={saved ? `Remove ${mod.title} from saved tools` : `Save ${mod.title}`}
          className="absolute left-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-[#FFF6E6]/95 text-[#885202] shadow-sm backdrop-blur transition-colors hover:bg-white"
        >
          {saved ? <BookmarkCheck size={18} aria-hidden="true" /> : <Bookmark size={18} aria-hidden="true" />}
        </button>

        {/* Hover affordance (pointer devices only) */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-3 right-3 hidden h-10 w-10 translate-y-2 items-center justify-center rounded-full bg-[#885202] text-white opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 [@media(hover:hover)]:flex"
        >
          <ArrowUpRight size={20} />
        </span>

        {/* Category badge */}
        <span className="absolute right-3 top-3 inline-flex max-w-[60%] items-center gap-1.5 rounded-full bg-[#FFF1D6]/95 px-3 py-1.5 text-[13px] font-semibold text-[#6b3f00] shadow-sm backdrop-blur">
          <Icon size={15} strokeWidth={2.2} aria-hidden="true" className="shrink-0" />
          <span className="truncate">{getShortCategory(mod.category)}</span>
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col px-2.5 pb-2 pt-4">
        <h3 className="text-[19px] font-bold leading-snug tracking-tight text-[#3a2200] line-clamp-2 dark:text-[#fbeed6]">
          <a
            href={`#/${mod.id}`}
            onClick={open}
            className="after:absolute after:inset-0 after:rounded-[28px] after:content-[''] focus:outline-none focus-visible:after:ring-2 focus-visible:after:ring-[#885202]"
          >
            {mod.title}
          </a>
        </h3>
        <p className="mt-1.5 text-[14.5px] leading-snug text-[#6b4a1f] line-clamp-2 dark:text-[#d9c19a]">
          {mod.desc || "Engineering calculator."}
        </p>

        <div className="mt-auto pt-4">
          <div className="flex flex-wrap gap-1.5">
            {(mod.isPopular || mod.isNew) && (
              <span className={cn(pill, "bg-[#F4C36A] text-[#3a2200]")}>
                {mod.isPopular ? (
                  <Flame size={14} aria-hidden="true" className="shrink-0" />
                ) : (
                  <Sparkles size={14} aria-hidden="true" className="shrink-0" />
                )}
                {mod.isPopular ? "Popular" : "New"}
              </span>
            )}
            {mod.estimatedTime && (
              <span className={cn(pill, "bg-[#E7D2AF] text-[#4d2f00] dark:bg-[#4a3519] dark:text-[#f3dcb0]")}>
                <Clock size={14} aria-hidden="true" className="shrink-0" />
                {mod.estimatedTime.replace(/^~\s*/, "")}
              </span>
            )}
            {mod.difficulty && (
              <span className={cn(pill, "bg-[#885202] text-white")}>
                <LevelBars level={levelOf(mod.difficulty)} />
                {mod.difficulty}
              </span>
            )}
          </div>

        </div>
      </div>
    </article>
  );
}
