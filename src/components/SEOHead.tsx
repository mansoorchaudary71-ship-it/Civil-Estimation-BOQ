import React from 'react';
import { Helmet } from 'react-helmet-async';
import { GROUP_TO_CATEGORY, pathFromId } from '../lib/toolRoutes';
import { getSiteUrl } from '../seo/siteConfig';
import { usePageJsonLd } from '../seo/usePageJsonLd';
import { TOOL_GUIDES } from '../seo/toolGuides';
import { SPECIFIC_FAQS } from './ui/GlobalFAQ';

/**
 * Dashboard category label -> /calculators/<group> key (the real group
 * landing URL). Two groups share one label ("Structural & Concrete
 * Geometry" is both `concrete` and `structural-design`); the first key
 * wins, which is the group the sitemap lists first.
 */
const CATEGORY_TO_GROUP: Record<string, string> = Object.fromEntries(
  Object.entries(GROUP_TO_CATEGORY).map(([group, category]) => [category, group])
);

interface SEOHeadProps {
  toolId: string;
  toolName: string;
  category: string;
  description: string;
  /**
   * Explicit canonical path (e.g. "/brick-calculator/lahore"). When omitted
   * the canonical is the tool's real short-form route, pathFromId(toolId).
   * The host is NOT part of this prop: it is derived at runtime from
   * window.location.origin + getBasename() (see getSiteUrl), so the
   * canonical points at the host actually serving the page.
   */
  canonicalPath?: string;
}

export default function SEOHead({ toolId, toolName, category, description, canonicalPath }: SEOHeadProps) {
  const fullTitle = `${toolName} | Civil Estimation Pro`;
  /**
   * Canonical / OG / JSON-LD base is the runtime host (see getSiteUrl in
   * src/seo/siteConfig.ts): on the live GitHub Pages project page this is
   * https://mansoorchaudary71-ship-it.github.io/Civil-Estimation-BOQ, and
   * on the custom domain it becomes civilestimationpro.com once DNS is
   * fixed. Never hardcode the host here — the custom domain does not
   * resolve (DNS NXDOMAIN), so a hardcoded canonical points at a dead host.
   */
  const siteUrl = getSiteUrl();
  const canonicalUrl = `${siteUrl}${canonicalPath ?? pathFromId(toolId)}`;
  // Breadcrumb item 2 must be a real route: the /calculators/<group>
  // landing for this tool's Dashboard category. The old
  // /categories/<slug> URL never existed as a route (and its slug kept
  // raw "&" and "," characters). Categories with no group map to home.
  const categoryGroup = CATEGORY_TO_GROUP[category];
  const categoryUrl = categoryGroup ? `${siteUrl}/calculators/${categoryGroup}` : siteUrl;

  // FAQPage: use ALL of the tool's real SPECIFIC_FAQS — no slice cap.
  // Google requires FAQ content to be visible on the page for rich
  // results, and GlobalFAQ renders exactly these entries, so the
  // JSON-LD matches what the user sees (15 tools have more than 7
  // specific questions; the old slice(0, 7) truncated them). The
  // generic template questions GlobalFAQ appends visibly are page
  // furniture, not tool-specific knowledge, so they stay out of the
  // structured data. The single templated Q&A stays only as a fallback
  // for tools with no specific FAQs; every ModuleWrapper tool has an
  // entry now, so it is unreachable in practice (brick / mix-design use
  // their shell pages, marla / pakistan-cost / standards use standalone
  // pages with their own FAQPage — see those files).
  const specificFaqs = SPECIFIC_FAQS[toolId] ?? [];
  const faqMainEntity =
    specificFaqs.length > 0
      ? specificFaqs.map((f) => ({
          "@type": "Question",
          "name": f.question,
          "acceptedAnswer": { "@type": "Answer", "text": f.answer },
        }))
      : [
          {
            "@type": "Question",
            "name": `What is the ${toolName} used for?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": description
            }
          }
        ];

  // Per-tool HowTo steps: the worked-example steps from the tool's own
  // verified guide (TOOL_GUIDES), if one exists. Empty for tools with
  // no guide — those emit no HowTo block (HowTo-pending).
  const guideSteps: string[] = TOOL_GUIDES[toolId]?.workedExample?.steps ?? [];

  const jsonLdData = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": fullTitle,
      "description": description,
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "All",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "url": canonicalUrl
    },
    // HowTo: per-tool steps ONLY where they exist — the worked-example
    // steps from the tool's own verified guide (src/seo/toolGuides.ts),
    // which the ToolArticleWidget renders visibly on the same page, so
    // the JSON-LD matches visible content. Tools with no guide are
    // HowTo-pending: no HowTo block is emitted rather than inventing
    // steps (the old generic 3-step template is gone). Brick and
    // mix-design do not use this component — their shell pages carry
    // their own specific HowTo. Specific HowTo coverage: 75/75 —
    // every tool now has a verified guide (Round 3 merge).
    ...(guideSteps.length > 0
      ? [
          {
            "@context": "https://schema.org",
            "@type": "HowTo",
            "name": `How to use ${toolName}`,
            "step": guideSteps.map((text) => ({ "@type": "HowToStep", "text": text })),
          },
        ]
      : []),
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqMainEntity
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": siteUrl
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": category,
          "item": categoryUrl
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": toolName,
          "item": canonicalUrl
        }
      ]
    }
  ];

  // Single managed JSON-LD node for this page (see usePageJsonLd).
  // Must run before the return so the node is written on mount and
  // replaced — never accumulated — on in-app navigation.
  usePageJsonLd(jsonLdData);

  return (
    <>
      <Helmet>
        <title>{fullTitle}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={fullTitle} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
        {/* No <script> here on purpose: Helmet never removes inline
            JSON-LD scripts on in-app navigation (they accumulate), so
            the structured data is written by usePageJsonLd into the
            single #cep-jsonld node instead — see that hook. */}
      </Helmet>
      
      {/* Dynamic Breadcrumbs rendered to the DOM as well */}
      <nav className="flex items-center space-x-2 text-xs text-txt-tertiary dark:text-txt-tertiary mb-4 overflow-x-auto whitespace-nowrap">
        <a href="/" className="hover:text-accent-800 transition-colors">Home</a>
        <span>›</span>
        <span className="truncate">{category}</span>
        <span>›</span>
        <span className="text-txt-primary dark:text-txt-primary font-medium truncate">{toolName}</span>
      </nav>
    </>
  );
}
