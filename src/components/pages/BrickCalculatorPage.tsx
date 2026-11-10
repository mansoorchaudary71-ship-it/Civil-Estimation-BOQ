import React, { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import BrickCalculator from "../calculators/BrickCalculator";
import BrickCalculatorContent, {
  BRICK_CONTENT_LAST_UPDATED,
} from "../calculators/BrickCalculatorContent";
import CalculatorPageShell from "../../seo/CalculatorPageShell";
import { SITE_URL, ORGANIZATION_JSON_LD } from "../../seo/siteConfig";
import {
  parseBrickVariant,
  type BrickVariant,
} from "../../seo/brickProgrammatic";
import {
  BRICK_FAQS,
  BRICK_PRESETS,
  type BrickInputs,
} from "../../lib/brickCalc";

const RELATED = [
  {
    id: "calculators",
    title: "Construction Material Calculator",
    desc: "Concrete, bricks, steel, blocks and mortar in one place.",
  },
  {
    id: "master-finishes",
    title: "Complete Finishes Workspace",
    desc: "Plaster, paint, flooring and finishes for the same walls.",
  },
  {
    id: "master-quantity",
    title: "Master Quantity Estimator",
    desc: "Full quantity takeoff for the whole project, not just one wall.",
  },
  {
    id: "house",
    title: "House Construction Cost Calculator",
    desc: "Grey structure and finishing cost for a full house in PKR.",
  },
  {
    id: "master-rcc",
    title: "Master RCC Estimator",
    desc: "Concrete, steel and formwork for slabs, beams and columns.",
  },
];

const MAIN_TITLE = "Brick Calculator Pakistan, India & UAE | Civil Estimation Pro";
const MAIN_DESCRIPTION =
  "Free brick calculator for Pakistan, India & UAE. Bricks, cement bags, sand & total cost in PKR, INR or AED — with openings, wastage & local rates.";
const MAIN_KEYWORDS = [
  "brick calculator",
  "brick calculator Pakistan",
  "bricks calculator",
  "brick quantity calculator",
  "how many bricks",
  "brick cost calculator",
  "brick calculator India",
  "brick calculator UAE",
  "cement bags calculator",
  "brickwork estimator",
];

function hreflangFor(variant: BrickVariant): { lang: string; href: string }[] {
  const main = `${SITE_URL}/brick-calculator`;
  return [
    { lang: "en-PK", href: `${SITE_URL}/brick-calculator/lahore` },
    { lang: "en-IN", href: `${SITE_URL}/brick-calculator/delhi` },
    { lang: "en-AE", href: `${SITE_URL}/brick-calculator/dubai` },
    { lang: "x-default", href: main },
  ];
}

function buildJsonLd(variant: BrickVariant, title: string, description: string, canonical: string) {
  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Brick Calculator",
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    url: canonical,
    description,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Wall length, height and thickness (4.5, 9 and 13.5 inch)",
      "Doors and windows deduction",
      "Pakistani, Indian and UAE brick sizes plus custom size",
      "Cement bags and sand quantity",
      "Cost in PKR, INR and AED",
      "PDF download, print, share and copy results",
    ],
  };
  const faqPage = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: BRICK_FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  const breadcrumbItems: { "@type": "ListItem"; position: number; name: string; item?: string }[] = [
    { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "Calculators", item: `${SITE_URL}/calculators` },
    { "@type": "ListItem", position: 3, name: title },
  ];
  if (variant.kind !== "main") {
    breadcrumbItems.splice(2, 0, {
      "@type": "ListItem",
      position: 3,
      name: "Brick Calculator",
      item: `${SITE_URL}/brick-calculator`,
    });
    breadcrumbItems[3].position = 4;
  }
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems,
  };
  return [webApp, faqPage, breadcrumb, ORGANIZATION_JSON_LD];
}

/** Prefill for the calculator from the variant (currency, rates, brick preset). */
function initialInputs(variant: BrickVariant): Partial<BrickInputs> {
  if (variant.kind === "city") {
    const c = variant.data;
    const preset = BRICK_PRESETS.find((p) => p.id === c.brickPresetId) ?? BRICK_PRESETS[0];
    return {
      currency: c.currency,
      brick: preset,
      rates: {
        brickPer1000: c.brickPer1000,
        cementPerBag: c.cementPerBag,
        sandPerUnit: c.sandPerUnit,
      },
    };
  }
  if (variant.kind === "type") {
    const preset =
      BRICK_PRESETS.find((p) => p.id === variant.data.presetId) ?? BRICK_PRESETS[0];
    return { brick: preset };
  }
  return {};
}

function ratesNoteFor(variant: BrickVariant): string | undefined {
  if (variant.kind === "city") {
    return `Indicative rates for ${variant.data.name} — ${variant.data.rateDate}. Source: ${variant.data.rateSource} Confirm with your supplier.`;
  }
  if (variant.kind === "type") {
    return `Indicative rate: ${variant.data.pricePer1000Range}. Confirm with your supplier.`;
  }
  return undefined;
}

export default function BrickCalculatorPage() {
  const location = useLocation();
  const variant = useMemo(
    () => parseBrickVariant(location.pathname),
    [location.pathname],
  );

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, [location.pathname]);

  const canonical =
    variant.kind === "main"
      ? `${SITE_URL}/brick-calculator`
      : `${SITE_URL}/brick-calculator/${
          variant.kind === "city"
            ? variant.data.slug
            : variant.kind === "type"
              ? variant.data.slug
              : variant.data.slug
        }`;

  const title =
    variant.kind === "main" ? MAIN_TITLE : variant.data.title;
  const description =
    variant.kind === "main" ? MAIN_DESCRIPTION : variant.data.description;
  const h1 =
    variant.kind === "main"
      ? "Brick Calculator"
      : variant.kind === "city"
        ? `Brick Calculator ${variant.data.name}`
        : variant.kind === "type"
          ? `${variant.data.name} Calculator`
          : `Bricks for a ${variant.data.name}`;
  const intro =
    variant.kind === "main"
      ? "Calculate bricks, cement bags, sand and total cost for any wall — in PKR, INR or AED. Deduct doors and windows, pick your brick size and mortar mix, and download the result as a PDF."
      : variant.kind === "city"
        ? variant.data.intro
        : variant.data.intro;

  const breadcrumbs =
    variant.kind === "main"
      ? [
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculators" },
          { label: "Brick Calculator" },
        ]
      : [
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculators" },
          { label: "Brick Calculator", href: "/brick-calculator" },
          {
            label:
              variant.kind === "city"
                ? variant.data.name
                : variant.kind === "type"
                  ? variant.data.name
                  : variant.data.name,
          },
        ];

  return (
    <CalculatorPageShell
      title={title}
      description={description}
      canonical={canonical}
      keywords={variant.kind === "main" ? MAIN_KEYWORDS : undefined}
      hreflang={hreflangFor(variant)}
      jsonLd={buildJsonLd(variant, title, description, canonical)}
      breadcrumbs={breadcrumbs}
      h1={h1}
      intro={intro}
      related={RELATED}
      lastUpdated={BRICK_CONTENT_LAST_UPDATED}
    >
      <BrickCalculator
        key={canonical}
        initial={initialInputs(variant)}
        ratesNote={ratesNoteFor(variant)}
      />
      <BrickCalculatorContent variant={variant} />
    </CalculatorPageShell>
  );
}
