import React from 'react';
import { Helmet } from 'react-helmet-async';
import { pathFromId } from '../lib/toolRoutes';

interface SEOHeadProps {
  toolId: string;
  toolName: string;
  category: string;
  description: string;
  /**
   * Explicit canonical path (e.g. "/brick-calculator/lahore"). When omitted
   * the canonical is the tool's real short-form route, pathFromId(toolId)
   * — i.e. https://civilestimationpro.com/<toolId>. The old template
   * /calculators/<toolId> did NOT resolve for short-form ids (resolvePath
   * only accepts /calculators/<group>/<slug>), so those canonicals 404'd.
   */
  canonicalPath?: string;
}

export default function SEOHead({ toolId, toolName, category, description, canonicalPath }: SEOHeadProps) {
  const fullTitle = `${toolName} | Civil Estimation Pro`;
  const canonicalUrl = `https://civilestimationpro.com${canonicalPath ?? pathFromId(toolId)}`;

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
    {
      "@context": "https://schema.org",
      "@type": "HowTo",
      "name": `How to use ${toolName}`,
      "step": [
        { "@type": "HowToStep", "text": "Enter your required dimensions and specifications into the input fields." },
        { "@type": "HowToStep", "text": "Review the live calculated results in the output section." },
        { "@type": "HowToStep", "text": "Add the items to your BOQ or export the report." }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": `What is the ${toolName} used for?`,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": description
          }
        }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://civilestimationpro.com"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": category,
          "item": `https://civilestimationpro.com/categories/${category.replace(/\s+/g, '-').toLowerCase()}`
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
        <script type="application/ld+json">
          {JSON.stringify(jsonLdData)}
        </script>
      </Helmet>
      
      {/* Dynamic Breadcrumbs rendered to the DOM as well */}
      <nav className="flex items-center space-x-2 text-xs text-txt-tertiary dark:text-txt-tertiary mb-4 overflow-x-auto whitespace-nowrap">
        <a href="#" className="hover:text-accent-800 transition-colors">Home</a>
        <span>›</span>
        <span className="truncate">{category}</span>
        <span>›</span>
        <span className="text-txt-primary dark:text-txt-primary font-medium truncate">{toolName}</span>
      </nav>
    </>
  );
}
