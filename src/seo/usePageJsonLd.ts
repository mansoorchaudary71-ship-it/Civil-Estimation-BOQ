import { useEffect } from "react";

/**
 * usePageJsonLd — the ONE JSON-LD node for the current page.
 *
 * WHY NOT HELMET: react-helmet-async appends inline
 * `<script type="application/ld+json">` tags to <head> and never removes
 * them on in-app navigation (verified headlessly 2026-11-23: navigating
 * aggregate-blending → brick → cbr-test on one page accumulated
 * FAQPage blocks 1 → 2 → 3, and WebApplications the same way; the
 * stale scripts carry no data-react-helmet marker). Fresh loads are
 * clean, so the bug only shows after in-app navigation.
 *
 * This hook manages a single `<script id="cep-jsonld">` node instead:
 * every page that emits structured data writes its whole set here, so
 * exactly one set exists at all times. Cleanup removes the node only
 * while it still holds THIS page's content — with AnimatePresence the
 * previous page unmounts after the next one mounts, so an
 * unconditional remove would delete the new page's JSON-LD.
 *
 * Callers: SEOHead (ModuleWrapper tools), CalculatorPageShell
 * (brick / mix-design), SEO (standalone pages incl. home). The house
 * tool's extra SoftwareApplication keeps its own id-managed node
 * (useSchema, id="dynamic-schema") — it never held a FAQPage after
 * the Round 3 dedup, so it cannot duplicate one.
 */
export function usePageJsonLd(data: unknown) {
  const json = JSON.stringify(data);
  useEffect(() => {
    if (typeof document === "undefined") return;
    let el = document.getElementById("cep-jsonld") as HTMLScriptElement | null;
    if (!el) {
      el = document.createElement("script");
      el.id = "cep-jsonld";
      el.type = "application/ld+json";
      document.head.appendChild(el);
    }
    el.textContent = json;
    return () => {
      const cur = document.getElementById("cep-jsonld");
      if (cur && cur.textContent === json) cur.remove();
    };
  }, [json]);
}
