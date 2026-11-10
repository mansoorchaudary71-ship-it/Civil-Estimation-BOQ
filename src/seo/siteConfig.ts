/**
 * Single source of truth for the site's canonical host and organisation.
 * IMPORTANT: civilestimationpro.com is referenced in robots.txt and the sitemaps,
 * but it did NOT resolve (DNS NXDOMAIN) when checked on 2026-11-10. Before launch,
 * either point the domain at GitHub Pages and add public/CNAME (included in this
 * package), or change SITE_URL below to the live github.io host and regenerate
 * the sitemap/canonical tags.
 */
export const SITE_URL = "https://civilestimationpro.com";
export const SITE_NAME = "Civil Estimation Pro";
export const SITE_TAGLINE = "BOQ & Construction Cost Calculators";
export const CONTACT_EMAIL = "support@civilestimationpro.com";

/** Reviewer shown on calculator pages (E-E-A-T byline). */
export const REVIEWER = {
  name: "Civil Estimation Pro Editorial Team",
  role: "Quantity Surveying & Estimation",
  note: "Formulas and rates on this page were checked against IS 1077, BS EN 771-1 and published Pakistan Bureau of Statistics survey data (see sources on the page).",
};

export const ORGANIZATION_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  description:
    "Civil Estimation Pro — free construction quantity, BOQ and cost estimation calculators for concrete, steel, masonry, finishes, earthworks and more.",
  email: CONTACT_EMAIL,
  sameAs: [] as string[],
};
