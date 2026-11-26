/**
 * Single source of truth for the site's canonical host and organisation.
 *
 * IMPORTANT (Leg 3, 2026-11-26): civilestimationpro.com does NOT resolve
 * (DNS NXDOMAIN, last checked 2026-11-12), and public/CNAME was deleted
 * in the same change — while it shipped, GitHub Pages redirected the
 * github.io URL to the dead domain and nothing opened. SITE_URL is
 * therefore the LIVE GitHub Pages project-page host, and every canonical,
 * OG and JSON-LD URL in the app derives from it (directly, or at runtime
 * via getSiteUrl(), which returns the origin actually serving the page).
 * The static sitemaps/robots.txt already use this same host, so host,
 * canonicals and sitemaps cannot disagree. WHEN DNS IS FIXED, flip this
 * ONE constant back to https://civilestimationpro.com, re-add
 * public/CNAME with that host, and flip the static sitemaps/robots.txt
 * to match — nothing else needs to change.
 */
import { getBasename } from "../lib/toolRoutes";

export const SITE_URL = "https://mansoorchaudary71-ship-it.github.io/Civil-Estimation-BOQ";
export const SITE_NAME = "Civil Estimation Pro";
export const SITE_TAGLINE = "BOQ & Construction Cost Calculators";
// Contact mailbox (a mailto: address, not a canonical host): unchanged.
// It only becomes reachable once the domain's MX records exist; the
// address itself stays valid as the published contact either way.
export const CONTACT_EMAIL = "support@civilestimationpro.com";

/**
 * Runtime canonical base: the origin actually serving this page, plus the
 * project-page subpath when hosted under one (e.g.
 * https://mansoorchaudary71-ship-it.github.io/Civil-Estimation-BOQ).
 * Falls back to SITE_URL outside a browser (build-time / tests).
 */
export function getSiteUrl(): string {
  if (typeof window === "undefined") return SITE_URL;
  return `${window.location.origin}${getBasename()}`;
}

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

/**
 * Organization block with the runtime host (see getSiteUrl). Prefer this
 * over ORGANIZATION_JSON_LD when emitting JSON-LD from a page, so the
 * `url` points at the host actually serving the page.
 */
export function getOrganizationJsonLd() {
  return { ...ORGANIZATION_JSON_LD, url: getSiteUrl() };
}
