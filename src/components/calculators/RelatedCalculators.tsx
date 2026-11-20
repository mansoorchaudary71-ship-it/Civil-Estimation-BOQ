import React from 'react';
import { ALL_MODULES } from '../Dashboard';
import { GROUP_TO_CATEGORY } from '../../lib/toolRoutes';

interface RelatedCalculatorsProps {
  /** Dashboard category label of the current tool (e.g. "Quantity Takeoff & Costing"). */
  category: string;
  /** Tool id of the current page (App passes the active module id). */
  currentSlug: string;
}

/**
 * Related-calculators grid, built only on REAL routes.
 *
 * The old version linked to slugs from src/data/*Data.json
 * (/calculators/<category>/<slug>) and to /calculators/<raw category> —
 * none of those URLs resolve, so 3 of the 4 rendered links 404'd on every
 * wrapped tool page. This version links to /<toolId> for related tools
 * (same Dashboard category, current tool excluded) and to
 * /calculators/<group> only with a real GROUP_TO_CATEGORY key. The JSON
 * files are untouched (another wave decides their fate); they are simply
 * no longer used as link targets.
 */
const CATEGORY_TO_GROUP: Record<string, string> = Object.fromEntries(
  Object.entries(GROUP_TO_CATEGORY).map(([group, cat]) => [cat, group]),
);

export function RelatedCalculators({ category, currentSlug }: RelatedCalculatorsProps) {
  const sameCategory = ALL_MODULES.filter(
    (m) => m.category === category && m.id !== currentSlug,
  );
  const otherTools = ALL_MODULES.filter(
    (m) => m.category !== category && m.id !== currentSlug,
  );

  // Up to 4 sequential links: same-category tools first, topped up from
  // other categories so the grid never renders half-empty.
  const sequentialItems = [...sameCategory, ...otherTools].slice(0, 4);
  const sequentialLinks = sequentialItems.map((item) => ({
    label: 'Similar Calculation',
    title: item.title,
    url: `/${item.id}`,
  }));

  // 2 cross-pollination links: deterministically picked from other
  // categories (seeded on the current id so the choice is stable).
  const crossLinks: { label: string; title: string; url: string }[] = [];
  if (otherTools.length > 0) {
    const seed = currentSlug.length % otherTools.length;
    for (let k = 0; k < 2; k++) {
      const item = otherTools[(seed + k) % otherTools.length];
      if (item && !crossLinks.some((l) => l.url === `/${item.id}`)) {
        crossLinks.push({
          label: 'Related Tool',
          title: item.title,
          url: `/${item.id}`,
        });
      }
    }
  }

  // Category hub link — only when the category maps to a real group key.
  // Master hub is the calculators hub tool (bare /calculators now resolves
  // to it instead of home).
  const group = CATEGORY_TO_GROUP[category];
  const categoryHubLinks = [
    ...(group
      ? [
          {
            label: 'Category Hub',
            title: `Back to All ${category}`,
            url: `/calculators/${group}`,
          },
        ]
      : []),
    {
      label: 'Master Hub',
      title: 'View All Civil Engineering Estimation Tools',
      url: '/calculators',
    },
  ];

  return (
    <section className="mt-16 bg-surface-hover rounded-2xl p-8 sm:p-10 border border-ui-borderSubtle shadow-brand-sm overflow-hidden">
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-txt-primary tracking-tight mb-4">Silo Link Grid: Continue Exploring</h2>
        <p className="mt-2 text-base font-normal text-txt-secondary leading-relaxed">Discover sequential tools, categorical hubs, and related structural estimators.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* Render sequential links (exact 4) */}
        {sequentialLinks.map((link, idx) => (
          <a key={`seq-${idx}`} href={link.url} className="w-full group p-5 bg-surface-default rounded-2xl border border-ui-borderSubtle hover:border-accent-400 hover:bg-accent-50 hover:shadow-brand-md transition-all flex flex-col overflow-hidden">
            <span className="text-base font-medium text-accent-800 uppercase tracking-wider mb-2">{link.label}</span>
            <span className="text-sm sm:text-base font-medium group-hover:text-accent-800 capitalize leading-snug">{link.title}</span>
          </a>
        ))}

        {/* Render Cross Pollination links (exact 2) */}
        {crossLinks.map((link, idx) => (
          <a key={`cross-${idx}`} href={link.url} className="w-full group p-5 bg-surface-default rounded-2xl border border-ui-borderSubtle hover:border-ui-successText hover:bg-ui-success hover:shadow-brand-md transition-all flex flex-col overflow-hidden">
            <span className="text-base font-medium text-ui-successText uppercase tracking-wider mb-2">{link.label}</span>
            <span className="text-sm sm:text-base font-medium group-hover:text-ui-successText capitalize leading-snug">{link.title}</span>
          </a>
        ))}

        {/* Render Category Hubs */}
        {categoryHubLinks.map((link, idx) => (
          <a key={`hub-${idx}`} href={link.url} className="group px-4 py-3 bg-ink rounded-2xl border border-ink hover:bg-ink-700 shadow-brand-lg shadow-accent-600/30 transition-all flex flex-col justify-center items-start overflow-hidden">
            <span className="text-base font-medium text-white/80 uppercase tracking-wider mb-2">{link.label}</span>
            <span className="text-base font-medium text-white capitalize leading-snug">{link.title}</span>
          </a>
        ))}
      </div>
    </section>
  );
}
