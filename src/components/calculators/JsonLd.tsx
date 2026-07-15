import React from 'react';

interface JsonLdProps {
  category: string;
  data: any;
}

export function JsonLd({ category, data }: JsonLdProps) {
  const generateFAQs = () => {
    let faqs: any[] = [];

    switch (category) {
      case 'metal':
        faqs = [
          {
            "@type": "Question",
            "name": `How to calculate the weight of a ${data.diameter_mm}mm ${data.profile.toLowerCase()}?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": `To calculate the weight of a ${data.diameter_mm}mm ${data.profile.toLowerCase()} that is ${data.length_m}m long, we use standard density formulas. The theoretical weight is ${data.weight_kg} kg.`
            }
          },
          {
            "@type": "Question",
            "name": `What density is used for steel bar mass per meter calculation?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": `The standard density of steel used in our engineering calculators is 7850 kg/m³. This established constant ensures accurate estimations for structural steel mass.`
            }
          }
        ];
        break;
      case 'concrete':
        faqs = [
          {
            "@type": "Question",
            "name": `How many cement bags are in ${data.volume_cft} CFT of ${data.mix_ratio} concrete?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": `Based on standard material takeoff calculations, preparing ${data.volume_cft} CFT of ${data.mix_ratio} nominal mix concrete naturally requires approximately ${data.cement_bags_required} standard 50kg bags of cement.`
            }
          },
          {
            "@type": "Question",
            "name": `Why do we multiply by 1.54 for civil engineering concrete calculations?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": `We consistently multiply the wet volume by a factor of 1.54 to account for the void spaces inherent in dry raw materials (cement, fine sand, and coarse aggregate) and their subsequent shrinkage when mixed with water.`
            }
          }
        ];
        break;
      case 'house':
        faqs = [
          {
            "@type": "Question",
            "name": `What is the estimated grey structure cost for a ${data.plot_size_marla} marla ${data.stories.toLowerCase()} story house?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": `For a detailed covered area of ${data.covered_area_sqft} sq ft, the base grey structure benchmark cost is calculated directly by multiplying this foundational area with current market baseline rates (e.g., Rs. ${data.grey_structure_rate_per_sqft} per sq ft).`
            }
          },
          {
            "@type": "Question",
            "name": `What exactly does the grey structure include in terms of raw material calculation?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": `A typical grey structure entails major foundational work, masonry brickwork, RCC slab casting, internal and external base plastering, and essential concealed electrical and plumbing conduits devoid of final cosmetic finish.`
            }
          }
        ];
        break;
      case 'earthworks':
        faqs = [
          {
            "@type": "Question",
            "name": `How is the trench excavation volume precisely calculated for a ${data.length_ft}ft trench?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": `We accurately calculate the undisturbed bank volume first (${data.bank_volume_cft} CFT), then stringently apply an empirical swell factor of ${data.swell_factor} to establish the increased loose volume (${data.loose_volume_cft.toFixed(2)} CFT), prioritizing logistical and hauling optimization.`
            }
          },
          {
            "@type": "Question",
            "name": `How many total hauling trips are mechanically required for ${data.length_ft}ft trenches?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": `Deploying fleet vehicles with a set hauling capacity of ${data.truck_capacity_cft} CFT, clearing out the excavated loose soil will strictly demand a total of ${data.total_hauling_trips} hauling trips.`
            }
          }
        ];
        break;
    }
    return faqs;
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "name": data.target_keyword || "Civil Engineering Calculator",
        "applicationCategory": "BusinessApplication/EngineeringTool",
        "operatingSystem": "All",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.9",
          "ratingCount": "128"
        }
      },
      {
        "@type": "FAQPage",
        "mainEntity": generateFAQs()
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
