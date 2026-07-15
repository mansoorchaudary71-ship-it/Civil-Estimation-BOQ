import React from "react";
import { Helmet } from "react-helmet-async";

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl?: string;
  schema?: Record<string, any>;
}

export const SEO: React.FC<SEOProps> = ({ title, description, keywords, canonicalUrl, schema }) => {
  const fullTitle = `${title} | Civil Estimation Pro`;

  const defaultSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Civil Estimation Pro",
    "description": "Advanced estimators for live construction rate analysis, house estimating, and comprehensive BOQ calculators.",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "All"
  };
  
  const finalSchema = schema || defaultSchema;

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

      <script type="application/ld+json">
        {JSON.stringify(finalSchema)}
      </script>
    </Helmet>
  );
};
