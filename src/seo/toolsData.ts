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
    id: "brick-calculator",
    slug: "brick-calculator",
    category: "Masonry",
    title: "Brick Calculator Pakistan, India & UAE | Civil Estimation Pro",
    description:
      "Free brick calculator for Pakistan, India & UAE. Bricks, cement bags, sand & total cost in PKR, INR or AED — with openings, wastage & local rates.",
    keywords: [
      "brick calculator",
      "brick calculator Pakistan",
      "bricks calculator",
      "brick quantity calculator",
      "how many bricks",
      "brick cost calculator",
      "brick calculator India",
      "brick calculator UAE",
    ],
    componentName: "BrickCalculatorPage",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "Brick Calculator",
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Web",
      url: "https://civilestimationpro.com/brick-calculator",
      description:
        "Free brick calculator for Pakistan, India & UAE. Bricks, cement bags, sand & total cost in PKR, INR or AED.",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      featureList: [
        "Wall length, height and thickness (4.5, 9 and 13.5 inch)",
        "Doors and windows deduction",
        "Pakistani, Indian and UAE brick sizes plus custom size",
        "Cement bags and sand quantity",
        "Cost in PKR, INR and AED",
        "PDF download, print, share and copy results",
      ],
    },
  },
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
