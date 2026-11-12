import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { SITE_NAME, SITE_URL } from "./siteConfig";
import { ChevronRight } from "lucide-react";

export interface RelatedCalculatorLink {
  id: string;
  title: string;
  desc: string;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface CalculatorPageShellProps {
  title: string;
  description: string;
  canonical: string;
  keywords?: string[];
  /** absolute OG image URL; defaults to the site OG image when set */
  ogImage?: string;
  hreflang?: { lang: string; href: string }[];
  /** one or more JSON-LD objects */
  jsonLd: object | object[];
  breadcrumbs: BreadcrumbItem[];
  h1: string;
  intro?: string;
  related: RelatedCalculatorLink[];
  lastUpdated: string;
  children: React.ReactNode;
}

/**
 * Reusable SEO page shell for calculators. Other calculators adopt it by passing
 * their own title/description/canonical/jsonLd/related links — no per-page
 * Helmet or breadcrumb code needed.
 */
export default function CalculatorPageShell({
  title,
  description,
  canonical,
  keywords,
  ogImage,
  hreflang,
  jsonLd,
  breadcrumbs,
  h1,
  intro,
  related,
  lastUpdated,
  children,
}: CalculatorPageShellProps) {
  const jsonLdArray = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-8">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        {keywords && keywords.length > 0 && (
          <meta name="keywords" content={keywords.join(", ")} />
        )}
        <link rel="canonical" href={canonical} />
        {hreflang?.map((h) => (
          <link key={h.lang} rel="alternate" hrefLang={h.lang} href={h.href} />
        ))}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonical} />
        {ogImage && <meta property="og:image" content={ogImage} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        {ogImage && <meta name="twitter:image" content={ogImage} />}
        {jsonLdArray.map((obj, i) => (
          <script key={i} type="application/ld+json">
            {JSON.stringify(obj)}
          </script>
        ))}
      </Helmet>

      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex flex-wrap items-center gap-1 text-sm text-txt-secondary">
          {breadcrumbs.map((crumb, i) => (
            <li key={crumb.label} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="w-4 h-4 text-txt-tertiary" />}
              {crumb.href ? (
                <Link to={crumb.href} className="hover:text-accent-800 hover:underline">
                  {crumb.label}
                </Link>
              ) : (
                <span aria-current="page" className="font-medium text-txt-primary">
                  {crumb.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>

      <header className="mb-8">
        <h1 className="text-[32px] leading-[1.2] font-bold tracking-tight text-txt-primary">
          {h1}
        </h1>
        {intro && (
          <p className="mt-3 text-lg leading-relaxed text-txt-secondary max-w-3xl">
            {intro}
          </p>
        )}
        <p className="mt-3 text-sm text-txt-tertiary">
          Last updated: {lastUpdated} · Free · No sign-up
        </p>
      </header>

      {children}

      {related.length > 0 && (
        <section aria-labelledby="related-calculators-heading" className="mt-14">
          <h2
            id="related-calculators-heading"
            className="text-2xl font-bold text-txt-primary mb-4"
          >
            Related calculators
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-9">
            {related.map((rel) => (
              <Link
                key={rel.id}
                to={`/${rel.id}`}
                className="block bg-surface-default border border-border-color rounded-card p-5 hover:border-accent-300 hover:shadow-brand-md transition-all"
              >
                <h3 className="font-semibold text-txt-primary">{rel.title}</h3>
                <p className="text-sm text-txt-secondary mt-1">{rel.desc}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <p className="sr-only">
        {SITE_NAME} — {SITE_URL}
      </p>
    </div>
  );
}
