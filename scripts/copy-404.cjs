// Build-time SPA fallback for GitHub Pages (static hosting has no rewrites).
//
// Step 3 (2026-11-26): every published route now has a real prerendered
// file (dist/<route>/index.html, see scripts/prerender.ts), so GitHub Pages
// serves it with HTTP 200 and never reaches this file for a known URL.
// 404.html therefore exists ONLY for genuinely unknown paths: it is a plain
// copy of the built index.html (no redirect snippet of any kind) whose
// #root placeholder carries a friendly "Page not found" message. The app
// boots from it and renders its own in-app 404 page for the unknown path.
//
// The old deep-link redirect (2+-segment clean paths -> #/... hash form)
// was REMOVED here: with vite base "./" those paths could not boot the app
// because relative asset paths resolved under the deep path — but the
// prerender fixes that at the source (each dist/<route>/index.html rewrites
// ./assets/ to depth-relative ../assets/), so the redirect is no longer
// needed and must not come back: it turned every deep clean URL into a
// hash URL that Google cannot index. The ?/ restore script in index.html
// is kept as a safety net for old shared links that already contain it.
const fs = require("fs");
const path = require("path");

const dist = path.join(__dirname, "..", "dist");
const indexHtml = path.join(dist, "index.html");
const notFoundHtml = path.join(dist, "404.html");

if (!fs.existsSync(indexHtml)) {
  console.warn("[copy-404] dist/index.html not found — skipping 404.html generation.");
  process.exit(0);
}

let html = fs.readFileSync(indexHtml, "utf8");

// Safety: refuse to ship a 404.html that still carries the old hash redirect.
if (html.includes("window.location.replace(prefix")) {
  console.error("[copy-404] dist/index.html still contains the old deep-link redirect — refusing to copy it into 404.html.");
  process.exit(1);
}

// A previous (partial) prerender run may have overwritten dist/index.html
// with a prerendered home page (title + canonical included). Restore the
// boot placeholder from the SOURCE index.html so 404.html never ships a
// page's title/meta. (A normal `npm run build` never hits this.)
if (html.includes('data-prerendered="true"')) {
  const srcHtml = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
  const sliceRoot = (h) => {
    const s = h.indexOf('<div id="root"');
    if (s === -1) return null;
    const openEnd = h.indexOf(">", s) + 1;
    const bodyClose = h.indexOf("</body>", openEnd);
    if (bodyClose === -1) return null;
    const close = h.lastIndexOf("</div>", bodyClose);
    if (close <= openEnd) return null;
    return { before: h.slice(0, openEnd), inner: h.slice(openEnd, close), after: h.slice(close) };
  };
  const src = sliceRoot(srcHtml);
  const dst = sliceRoot(html);
  if (!src || !dst || !src.inner.includes("cep-boot")) {
    console.error("[copy-404] dist/index.html looks already prerendered and the boot placeholder cannot be restored — re-run `vite build`.");
    process.exit(1);
  }
  html = dst.before + src.inner + dst.after;
  // The prerendered template also carries a page <title>/description/
  // canonical in <head>; restore the generic ones from the source file.
  const pick = (h, re) => { const m = h.match(re); return m ? m[0] : null; };
  const srcTitle = pick(srcHtml, /<title>[^<]*<\/title>/);
  const srcDesc = pick(srcHtml, /<meta name="description" content="[^"]*" \/>/);
  if (srcTitle) html = html.replace(/<title>[^<]*<\/title>/, srcTitle);
  if (srcDesc) html = html.replace(/<meta name="description" content="[^"]*" \/>/, srcDesc);
  html = html.replace(/<link rel="canonical"[^>]*>\n?/g, "");
  console.log("[copy-404] dist/index.html was already prerendered — restored the generic template from index.html");
}

// Friendly static message for genuinely unknown paths (and no-JS clients).
// React replaces this on mount with the in-app 404 page.
const NOT_FOUND_INNER =
  '<main class="cep-static" data-prerendered="true">' +
  "<h1>Page not found</h1>" +
  "<p>The page you asked for does not exist on Civil Estimation Pro. It may have moved, or the link may have a typo.</p>" +
  '<p><a href="./">Back to the home page</a> · <a href="./tools">Browse all calculators</a></p>' +
  "</main>";
const rootStart = html.indexOf('<div id="root"');
if (rootStart !== -1) {
  const rootOpenEnd = html.indexOf(">", rootStart) + 1;
  // #root is the last <div> before </body> (vite hoists the module <script>
  // into <head>, so it cannot be used as the anchor after #root).
  const bodyCloseIdx = html.indexOf("</body>", rootOpenEnd);
  const rootCloseIdx = bodyCloseIdx !== -1 ? html.lastIndexOf("</div>", bodyCloseIdx) : -1;
  if (rootCloseIdx > rootOpenEnd) {
    html = html.slice(0, rootOpenEnd) + NOT_FOUND_INNER + html.slice(rootCloseIdx);
  }
}

fs.writeFileSync(notFoundHtml, html);
console.log("[copy-404] dist/404.html generated from dist/index.html (plain SPA fallback, no redirect — known routes serve their own prerendered files)");
