/**
 * Single source of truth for the site's canonical host and organisation.
 *
 * IMPORTANT: civilestimationpro.com did NOT resolve (DNS NXDOMAIN) when
 * checked on 2026-11-10, and still does not. SITE_URL below is therefore
 * only the FALLBACK / intended custom-domain host — never use it directly
 * for a canonical, OG or JSON-LD URL. Use getSiteUrl() instead: it derives
 * the base from the runtime origin (window.location.origin + the hosting
 * subpath from getBasename()), so on the live GitHub Pages project page
 * canonicals point at the host that actually serves the page, and on the
 * custom domain they point at it once DNS is fixed. When/if DNS is fixed,
 * nothing needs to change — getSiteUrl() will return the custom domain
 * automatically. The static sitemaps/robots.txt are the only place a host
 * is still written out literally (public/sitemap*.xml, public/robots.txt);
 * flip those back to civilestimationpro.com when DNS resolves.
 */
import { getBasename } from "../lib/toolRoutes";

export const SITE_URL = "https://civilestimationpro.com";
export const SITE_NAME = "Civil Estimation Pro";
export const SITE_TAGLINE = "BOQ & Construction Cost Calculators";
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
