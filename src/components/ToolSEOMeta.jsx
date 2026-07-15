import React from 'react';
import { Helmet } from 'react-helmet-async';

const BASE_URL = 'https://civilestimationpro.com';

const toolMetaConfig = {
  'concrete/mix-design-calculator': {
    title: 'Concrete Mix Design Calculator (IS 10262:2019) | Civil Estimation Pro',
    description: 'Design highly structured concrete mixes in accordance with IS 10262:2019 guidelines. Achieve specific workability and compressive strength safely.',
    keywords: 'concrete mix design calculator, IS 10262:2019 mix design, concrete mix proportioning, civil engineering tools'
  },
  'quantity-estimation/boq-generator': {
    title: 'Professional BOQ Generator | Quantity Surveyor Tools | Civil Estimation Pro',
    description: 'Instantly generate comprehensive Bills of Quantities (BOQ). The ultimate quantity surveyor tool to accurately estimate materials, rates, and detailed costing.',
    keywords: 'BOQ generator, bill of quantities calculator, quantity surveying tools, civil estimator, construction estimating software'
  },
  'quantity-estimation/house-construction-cost-calculator': {
    title: 'House Construction Cost Calculator Pakistan 2025 (PKR) | Civil Estimation Pro',
    description: 'Calculate up-to-date house construction costs in PKR. Factor in the latest 2025 labor rates, material costs, and standard workflows for precise estimates in Pakistan.',
    keywords: 'house construction cost calculator pakistan, 2025 construction cost pkr, residential building estimator, house estimator tool'
  },
  'geotechnical/sieve-analysis-grading-calculator': {
    title: 'Sieve Analysis & Grading Calculator (MORTH Compliant) | Civil Estimation Pro',
    description: 'Determine soil and aggregate gradation accurately. This calculation tool conforms to MORTH specifications to help ensure ideal road sub-base material performance.',
    keywords: 'sieve analysis calculator, MORTH gradation, aggregate blending tool, soil classification, geotechnical testing software'
  },
  'structural-design/pile-foundation-calculator': {
    title: 'Pile Foundation Calculator (IS 2911:2010) | Civil Estimation Pro',
    description: 'Engineer load-bearing pile foundations following IS 2911:2010 standards. Estimate steel reinforcements, concrete volume, and structural capacity accurately.',
    keywords: 'pile foundation calculator, IS 2911:2010 design, deep foundation estimator, structural engineering pile design'
  },
  'road-pavement/road-pavement-estimator': {
    title: 'Road & Pavement Estimator (MORTH Standards) | Civil Estimation Pro',
    description: 'Estimate material requirements for flexible and rigid road pavements. Ensure your highway structures adhere to MORTH flexible pavement and subgrade specifications.',
    keywords: 'road pavement estimator, MORTH flexible pavement, highway construction calculator, pavement design tool'
  },
  'quantity-estimation/area-space-calculator': {
    title: 'Plot Area Calculator — Irregular Land, RERA & IS Code Compliant | Civil Estimation Pro',
    description: 'Calculate irregular plot area using geometric triangulation, RERA carpet area, and IS Code opening deductions. Free online tool for civil engineers and quantity surveyors.',
    keywords: 'plot area calculator, irregular land area, RERA carpet area, geometric triangulation area, roof pitch multiplier',
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Plot Area Calculator — Civil Estimation Pro",
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "Web",
        "description": "Calculate irregular plot area using geometric triangulation, RERA carpet area, and IS Code opening deductions. Free online tool for civil engineers and quantity surveyors.",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        },
        "featureList": [
          "Irregular plot area by triangulation",
          "RERA carpet area calculation",
          "Roof pitch multi-factor correction",
          "IS Code opening deductions",
          "Real-time calculation"
        ],
        "screenshot": "https://civilestimationpro.com/og/area-space-calculator.png",
        "provider": {
          "@type": "Organization",
          "name": "Civil Estimation Pro",
          "url": "https://civilestimationpro.com"
        }
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "How do you calculate irregular plot area using triangulation?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "The diagonal triangulation method divides an irregular quadrilateral into two triangles using a measured diagonal. The area of each triangle is calculated using Heron's formula, then summed for the total plot area. Civil Estimation Pro automates this using the North, South, East, West sides and the NW-SE diagonal measurement."
            }
          },
          {
            "@type": "Question",
            "name": "What is RERA carpet area and how is it calculated?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "RERA carpet area is the net usable floor area excluding walls, balconies, and common areas, as defined under the Real Estate (Regulation and Development) Act. This calculator applies IS Code opening deductions to compute RERA-compliant carpet area from gross measurements."
            }
          }
        ]
      },
      {
        "@context": "https://schema.org",
        "@type": "HowTo",
        "name": "How to Calculate Irregular Plot Area Using Triangulation",
        "step": [
          { "@type": "HowToStep", "text": "Select your preferred unit of measurement (ft or meters)" },
          { "@type": "HowToStep", "text": "Measure and enter the North, South, East, and West side dimensions" },
          { "@type": "HowToStep", "text": "Measure the diagonal distance NW to SE and enter it" },
          { "@type": "HowToStep", "text": "Review the real-time triangulated area result" },
          { "@type": "HowToStep", "text": "Export the calculation to PDF or save for your records" }
        ]
      }
    ]
  }
};

const defaultMeta = {
  title: 'Civil Construction Calculator | Civil Estimation Pro',
  description: 'A professional estimation and calculation tool for civil engineers. Improve your workflows with instant results and reporting.',
  keywords: 'civil engineering tool, construction calculator, estimation software'
};

/**
 * Reusable SEO component for tool pages.
 * @param {Object} props
 * @param {string} props.toolPath - The exact path string to the tool, e.g., 'concrete/mix-design-calculator'
 * @param {string} props.toolName - The readable name of the tool (for structured data)
 */
export default function ToolSEOMeta({ toolPath, toolName = 'Civil Estimation Tool' }) {
  const meta = toolMetaConfig[toolPath] || defaultMeta;
  const canonicalUrl = `${BASE_URL}/calculators/${toolPath}`;

  const jsonLdData = meta.jsonLd || {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": toolName,
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "All",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": meta.description,
    "url": canonicalUrl
  };

  return (
    <Helmet>
      {/* Basic HTML Meta Tags */}
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      <meta name="keywords" content={meta.keywords} />

      {/* Canonical Link */}
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph Tags */}
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content="website" />

      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(jsonLdData)}
      </script>
    </Helmet>
  );
}
