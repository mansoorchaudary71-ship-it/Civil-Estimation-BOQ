export interface ToolSEOData {
  id: string;
  slug: string;
  category: string;
  title: string;
  description: string;
  keywords: string[];
  componentName: string;
  jsonLd: any;
}

export const toolsSeoRegistry: ToolSEOData[] = [
  {
    id: "aggregate-blending",
    slug: "aggregate-blending",
    category: "Geotechnical",
    title: "Aggregate Blending Calculator | Civil Estimation Pro",
    description: "Calculate and optimize aggregate blending for concrete and asphalt mixes accurately.",
    keywords: ["aggregate blending", "concrete mix", "asphalt mix design", "civil engineering tools"],
    componentName: "AggregateBlendingCalculator",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Aggregate Blending Calculator",
      "applicationCategory": "UtilitiesApplication",
      "operatingSystem": "Web",
      "description": "Calculate and optimize aggregate blending for concrete and asphalt mixes accurately.",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "featureList": [
        "Sieve analysis integration",
        "Multiple aggregate blending",
        "Real-time gradation curves"
      ]
    }
  },
  {
    id: "isolated-footing",
    slug: "isolated-footing",
    category: "Concrete",
    title: "Isolated Footing Design & Estimation | Civil Estimation Pro",
    description: "Design isolated footings and estimate concrete and steel reinforcement quantities instantly.",
    keywords: ["isolated footing calculator", "footing design", "concrete estimation", "structural engineering"],
    componentName: "IsolatedFootingCalculator",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Isolated Footing Calculator",
      "applicationCategory": "UtilitiesApplication",
      "operatingSystem": "Web",
      "description": "Design isolated footings and estimate concrete and steel reinforcement quantities instantly.",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      }
    }
  }
  // ... Add all 60+ tools here
];
