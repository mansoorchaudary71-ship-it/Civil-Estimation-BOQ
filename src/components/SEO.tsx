import React from "react";
import { Helmet } from "react-helmet-async";
import { usePageJsonLd } from "../seo/usePageJsonLd";

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl?: string;
  schema?: Record<string, any>;
}

/**
 * The site-level WebApplication node. Standalone pages that render a
 * visible FAQ (Marla, Pakistan cost, Standards, home) build their
 * FAQPage JSON-LD from the same visible questions and combine it with
 * this node in a @graph, so each page emits exactly one script with
 * one WebApplication and one FAQPage — instead of the old pattern
 * (default WebApplication only, FAQPage missing entirely).
 */
export const SITE_WEB_APP = {
  "@type": "WebApplication",
  "name": "Civil Estimation Pro",
  "description": "Advanced estimators for live construction rate analysis, house estimating, and comprehensive BOQ calculators.",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "All"
};

export const SEO: React.FC<SEOProps> = ({ title, description, keywords, canonicalUrl, schema }) => {
  const fullTitle = `${title} | Civil Estimation Pro`;

  const defaultSchema = {
    "@context": "https://schema.org",
    ...SITE_WEB_APP
  };
  
  const finalSchema = schema || defaultSchema;

  // Single managed JSON-LD node for this page (see usePageJsonLd):
  // Helmet never removes inline JSON-LD scripts on in-app navigation,
  // so the structured data is written here instead of in <Helmet>.
  usePageJsonLd(finalSchema);

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      <meta property="og:type" content="website" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />

      {/* No <script> here on purpose — see usePageJsonLd above. */}
    </Helmet>
  );
};
