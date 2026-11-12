import React from 'react';
import { Building2, ArrowUp, Mail } from 'lucide-react';
import NewsletterSignupCard from './NewsletterSignupCard';
import { ModuleId } from './Dashboard';

/**
 * Footer - Coursera-style dense, scannable link directory.
 *
 * Fixes vs. previous footer
 *  - 14 links were `href="#"` (dead; jumped to top and changed the router hash). All are real routes now.
 *  - Social icons pointed at "#" with target=_blank. They render only when a real URL is configured
 *    (VITE_SOCIAL_TWITTER / _LINKEDIN / _GITHUB), plus the working mailto link.
 *  - The language <select> did nothing (no i18n exists), which is a misleading control. Removed.
 *  - Links are real anchors (`#/route`) so open-in-new-tab and copy-link work.
 *  - Global `footer h4 { text-transform: uppercase !important }` / `footer a { font-size !important }`
 *    CSS fought this component; that CSS was removed in index.css.
 */

type FooterLink = { label: string; id: string; badge?: string };

const COLUMNS: { title: string; links: FooterLink[] }[] = [
  {
    title: 'Popular tools',
    links: [
      { label: 'House Estimator', id: 'house' },
      { label: 'RCC Core Quantities', id: 'master-rcc' },
      { label: 'Steel Weight', id: 'metal-weight' },
      { label: 'BOQ Generator', id: 'boq' },
      { label: 'Rate Analysis', id: 'rates' },
      { label: 'Unit Converter', id: 'unit-converter' },
    ],
  },
  {
    title: 'Structural design',
    links: [
      { label: 'Beam Design', id: 'beam-design' },
      { label: 'Column Design', id: 'column-design' },
      { label: 'Isolated Footing', id: 'isolated-footing' },
      { label: 'Retaining Wall', id: 'retaining-wall' },
      { label: 'Bar Bending Schedule', id: 'bbs-generator' },
      { label: 'Geotechnical', id: 'geotechnical' },
    ],
  },
  {
    title: 'Quantity & costing',
    links: [
      { label: 'Guided QS Workflow', id: 'qs-workflow', badge: 'New' },
      { label: 'Quantity Takeoff', id: 'takeoff' },
      { label: 'Material Takeoff Sheet', id: 'material-takeoff' },
      { label: 'Cost Summary', id: 'cost-summary' },
      { label: 'Measurement Sheet', id: 'measurement-sheet' },
      { label: 'Quick Rough Estimate', id: 'quick-estimation' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', id: 'about' },
      { label: 'Careers', id: 'careers' },
      { label: 'Blog', id: 'blog' },
      { label: 'Pricing', id: 'pricing' },
      { label: 'Contact', id: 'contact' },
      { label: 'My Estimates', id: 'my-estimates' },
    ],
  },
];

const LEGAL: FooterLink[] = [
  { label: 'Privacy', id: 'privacy' },
  { label: 'Terms', id: 'terms' },
  { label: 'Cookies', id: 'cookies' },
];

const env = (import.meta as any).env ?? {};
const SUPPORT_EMAIL = env.VITE_SUPPORT_EMAIL as string | undefined;
const SOCIAL = [
  { name: 'X (Twitter)', href: env.VITE_SOCIAL_TWITTER as string | undefined, path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.008 4.076H5.03z' },
  { name: 'LinkedIn', href: env.VITE_SOCIAL_LINKEDIN as string | undefined, path: 'M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z' },
  { name: 'GitHub', href: env.VITE_SOCIAL_GITHUB as string | undefined, path: 'M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z' },
].filter((s) => !!s.href);

export default function Footer({ onNavigate }: { activeModule?: ModuleId; onNavigate?: (id: ModuleId) => void }) {
  const go = (id: string) => (e: React.MouseEvent) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    if (onNavigate) onNavigate(id);
    else window.dispatchEvent(new CustomEvent('navigate-module', { detail: id }));
  };

  const linkClass =
    'inline-flex items-center gap-2 py-1 text-[15px] text-txt-secondary hover:text-accent-800 dark:hover:text-accent-400 hover:underline underline-offset-4 transition-colors';

  return (
    <footer className="w-full mt-auto bg-surface-default border-t border-border-color">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 pt-14 pb-8">
        <div className="mb-14">
          <NewsletterSignupCard />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-10">
          {/* Brand + contact (Coursera puts the app/social block in the last column) */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <a href="#/" onClick={go('home')} className="inline-flex items-center gap-2.5 mb-3" aria-label="Civil Estimation Pro - home">
              <span className="w-9 h-9 rounded-lg bg-ink text-white flex items-center justify-center">
                <Building2 className="w-5 h-5" aria-hidden="true" />
              </span>
              <span className="font-bold text-txt-primary leading-tight">
                Civil Estimation <span className="text-accent-800 dark:text-accent-400">PRO</span>
              </span>
            </a>
            <p className="text-sm text-txt-secondary max-w-xs">
              Quantity, BOQ and cost estimation calculators for civil engineers, contractors and students.
            </p>
            <ul className="mt-4 flex items-center gap-2">
              {SUPPORT_EMAIL && (
                <li>
                  <a
                    href={`mailto:${SUPPORT_EMAIL}`}
                    aria-label="Email support"
                    className="w-9 h-9 rounded-full bg-ink text-white flex items-center justify-center hover:bg-ink-700 transition-colors"
                  >
                    <Mail className="w-4 h-4" aria-hidden="true" />
                  </a>
                </li>
              )}
              {SOCIAL.map((s) => (
                <li key={s.name}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${s.name} (opens in a new tab)`}
                    className="w-9 h-9 rounded-full bg-ink text-white flex items-center justify-center hover:bg-ink-700 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d={s.path} />
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h2 className="text-base font-bold tracking-tight text-txt-primary mb-3">{col.title}</h2>
              <ul>
                {col.links.map((l) => (
                  <li key={l.id}>
                    <a href={`#/${l.id}`} onClick={go(l.id)} className={linkClass}>
                      {l.label}
                      {l.badge && (
                        <span className="px-1.5 py-0.5 rounded-md text-xs font-bold bg-accent-100 text-accent-800 dark:bg-accent-600/20 dark:text-accent-400">
                          {l.badge}
                        </span>
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

        </div>

        <div className="mt-12 pt-6 border-t border-border-color flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-txt-secondary space-y-1">
            <p>&copy; {new Date().getFullYear()} Civil Estimation Pro. All rights reserved.</p>
            <p className="max-w-2xl text-[13px] text-txt-secondary">
              Estimates are algorithmically generated from benchmark rates and standard assumptions. They do not replace a BOQ
              certified by a licensed engineer or quantity surveyor.
            </p>
          </div>
          <div className="flex items-center gap-5">
            <ul className="flex items-center gap-4">
              {LEGAL.map((l) => (
                <li key={l.id}>
                  <a href={`#/${l.id}`} onClick={go(l.id)} className="text-sm text-txt-secondary hover:text-accent-800 dark:hover:text-accent-400 hover:underline underline-offset-4">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="inline-flex items-center gap-2 h-10 px-3 rounded-lg text-sm font-semibold text-txt-primary dark:text-txt-primary hover:bg-surface-active/60 dark:hover:bg-ink-700 transition-colors"
            >
              Back to top <ArrowUp className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
