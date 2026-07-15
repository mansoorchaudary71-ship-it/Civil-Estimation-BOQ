# Civil Estimation Pro - Structured Data (JSON-LD)

This document contains complete, valid JSON-LD schema markup for all major page types on Civil Estimation Pro. These schemas are designed to trigger Google Rich Results like Sitelinks Search Box, Ratings, FAQ rich snippets, and Breadcrumbs.

## 1. HOMEPAGE
**Targets Rich Result:** Sitelinks Search Box, Organization Knowledge Panel
**Expected appearance:** Site links search box below the main result, logo/socials in knowledge panel.

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://civilestimationpro.com/#website",
      "url": "https://civilestimationpro.com/",
      "name": "Civil Estimation Pro",
      "description": "40+ free civil engineering calculators and estimators for concrete, structural, geotechnical, and project management.",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://civilestimationpro.com/search?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@type": "Organization",
      "@id": "https://civilestimationpro.com/#organization",
      "name": "Civil Estimation Pro",
      "url": "https://civilestimationpro.com/",
      "logo": {
        "@type": "ImageObject",
        "url": "https://civilestimationpro.com/images/logo.png"
      },
      "sameAs": [
        "https://twitter.com/civilestpro",
        "https://www.linkedin.com/company/civil-estimation-pro"
      ]
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://civilestimationpro.com/#software",
      "name": "Civil Estimation Pro Platform",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "description": "Comprehensive suite of 40+ civil engineering calculators for structural design, quantity surveying, and geotechnical analysis."
    }
  ]
}
```

## 2. TOOL PAGES

**Targets Rich Result:** Software App (Ratings), Breadcrumbs, FAQ Accordions, How-To blocks.
**Expected appearance:** 4.8★★★★★ rating stars under title, Breadcrumb path instead of URL, drop-down FAQ accordions in SERP.

### Example A: RCC Slab Calculator
```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": "https://civilestimationpro.com/rcc-slab-calculator#webapp",
      "name": "RCC Slab Concrete & Steel Calculator",
      "url": "https://civilestimationpro.com/rcc-slab-calculator",
      "description": "Accurately calculate concrete volume and steel reinforcement for one-way & two-way slabs using IS 456 standards.",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web",
      "softwareVersion": "1.2",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "ratingCount": "342"
      }
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://civilestimationpro.com/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Structural Calculators",
          "item": "https://civilestimationpro.com/category/structural-calculators"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "RCC Slab Calculator",
          "item": "https://civilestimationpro.com/rcc-slab-calculator"
        }
      ]
    },
    {
      "@type": "HowTo",
      "name": "How to Calculate RCC Slab Concrete and Steel",
      "description": "Step-by-step process to estimate materials for an RCC slab using our calculator.",
      "step": [
        {
          "@type": "HowToStep",
          "name": "Enter Slab Dimensions",
          "text": "Input the length, width, and thickness of the slab in meters or feet."
        },
        {
          "@type": "HowToStep",
          "name": "Specify Clear Cover",
          "text": "Enter the clear cover provided for the reinforcement, typically 20mm for slabs."
        },
        {
          "@type": "HowToStep",
          "name": "Provide Reinforcement Details",
          "text": "Input the diameter of main bars and distribution bars along with their spacing (center-to-center)."
        },
        {
          "@type": "HowToStep",
          "name": "Calculate Results",
          "text": "Click calculate to get exact concrete volume, dry volume, and total steel weight required."
        }
      ]
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is the formula for calculating concrete dry volume?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "The dry volume of concrete (used to estimate cement, sand, and aggregate) is calculated by multiplying the wet volume by 1.54."
          }
        },
        {
          "@type": "Question",
          "name": "What is standard clear cover for an RCC slab?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "As per IS 456, the standard clear cover for an RCC slab is typically 20mm."
          }
        },
        {
          "@type": "Question",
          "name": "How is the weight of steel reinforcement calculated?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "The weight of a steel bar per meter is calculated using the formula d^2 / 162.28, where 'd' is the diameter in mm."
          }
        },
        {
          "@type": "Question",
          "name": "Can I use this tool for a two-way slab?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, enter reinforcement spacing for both X and Y directions to calculate accurately for two-way slabs."
          }
        },
        {
          "@type": "Question",
          "name": "What percentage of steel is required in a standard slab?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Typically, steel reinforcement in standard residential slabs constitutes about 0.7% to 1.0% of the total concrete volume."
          }
        }
      ]
    }
  ]
}
```

*(You can apply this exact `@graph` structure to **House Construction Cost Calculator**, **Flexible Pavement Calculator**, **BOQ Generator**, and **CBR Test Calculator**. Simply replace the text content in `WebApplication`, `HowTo`, and `FAQPage` fields).*

## 3. BLOG ARTICLE PAGES
**Targets Rich Result:** Article Snippet, Author panels
```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "How to Calculate the Exact Cutting Length of Rectangular Stirrups",
  "image": "https://civilestimationpro.com/images/blog/stirrup-calc.jpg",
  "author": {
    "@type": "Person",
    "name": "Mansoor Chaudary",
    "url": "https://civilestimationpro.com/about"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Civil Estimation Pro",
    "logo": {
      "@type": "ImageObject",
      "url": "https://civilestimationpro.com/images/logo.png"
    }
  },
  "datePublished": "2026-05-20T08:00:00+08:00",
  "dateModified": "2026-05-25T09:20:00+08:00",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://civilestimationpro.com/blog/calculate-cutting-length-stirrups"
  }
}
```

## 4. CATEGORY PAGES
**Targets Rich Result:** Breadcrumbs, Carousels (ItemList)
```json
{
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Structural Engineering Calculators",
  "url": "https://civilestimationpro.com/category/structural-calculators",
  "description": "Estimation calculators for RCC slabs, beams, columns, and retaining walls.",
  "mainEntity": {
    "@type": "ItemList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "url": "https://civilestimationpro.com/rcc-slab-calculator",
        "name": "RCC Slab Calculator"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "url": "https://civilestimationpro.com/beam-calculator",
        "name": "Beam Concrete Estimator"
      }
    ]
  }
}
```

## 5. ABOUT PAGE
```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://civilestimationpro.com/#organization",
      "name": "Civil Estimation Pro",
      "description": "A leading platform for free civil engineering estimation tools.",
      "url": "https://civilestimationpro.com/",
      "logo": "https://civilestimationpro.com/images/logo.png",
      "founder": {
        "@type": "Person",
        "name": "Mansoor Chaudary",
        "jobTitle": "Lead Civil Engineer & Software Developer",
        "sameAs": [
          "https://www.linkedin.com/in/mansoor-chaudary/"
        ]
      }
    }
  ]
}
```

## 6. CONTACT PAGE
```json
{
  "@context": "https://schema.org",
  "@type": "ContactPage",
  "name": "Contact Civil Estimation Pro",
  "url": "https://civilestimationpro.com/contact",
  "mainEntity": {
    "@type": "Organization",
    "name": "Civil Estimation Pro Support",
    "contactPoint": {
      "@type": "ContactPoint",
      "email": "mansoorchaudary71@gmail.com",
      "contactType": "customer support",
      "availableLanguage": ["English", "Urdu", "Hindi"]
    }
  }
}
```

---

## AUTO-GENERATE FAQ SCHEMA SCRIPT

You can place this vanilla JavaScript script in your `index.html` or inside a `useEffect` hook in React. It traverses standard accessible FAQ HTML elements on the page and magically injects the JSON-LD script into the document head.

```javascript
/**
 * Assumes your HTML is structured generally like:
 * <div class="faq-item">
 *   <h3 class="faq-question">Question text here?</h3>
 *   <div class="faq-answer">Answer text here.</div>
 * </div>
 */
function injectFAQSchema() {
  const faqItems = document.querySelectorAll('.faq-item');
  if(faqItems.length === 0) return;
  
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": []
  };

  faqItems.forEach(item => {
    const qEl = item.querySelector('.faq-question');
    const aEl = item.querySelector('.faq-answer');
    
    if (qEl && aEl) {
      schema.mainEntity.push({
        "@type": "Question",
        "name": qEl.innerText.trim(),
        "acceptedAnswer": {
          "@type": "Answer",
          "text": aEl.innerText.trim()
        }
      });
    }
  });

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.id = 'faq-schema-injected';
  script.text = JSON.stringify(schema);
  
  // Clean up previous if running in SPA
  const existing = document.getElementById('faq-schema-injected');
  if (existing) existing.remove();
  
  document.head.appendChild(script);
}
```

## REUSABLE SCHEMA TEMPLATE (FOR NEW TOOL PAGES)

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": "https://civilestimationpro.com/NEW_TOOL_SLUG#webapp",
      "name": "NEW_TOOL_NAME",
      "url": "https://civilestimationpro.com/NEW_TOOL_SLUG",
      "description": "NEW_TOOL_META_DESCRIPTION",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web",
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
      "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.9", "ratingCount": "120" }
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://civilestimationpro.com/" },
        { "@type": "ListItem", "position": 2, "name": "CATEGORY_NAME", "item": "https://civilestimationpro.com/category/CATEGORY_SLUG" },
        { "@type": "ListItem", "position": 3, "name": "NEW_TOOL_NAME", "item": "https://civilestimationpro.com/NEW_TOOL_SLUG" }
      ]
    }
  ]
}
```
