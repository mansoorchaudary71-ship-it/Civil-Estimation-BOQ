// Build-time SPA fallback for GitHub Pages (static hosting has no rewrites).
// Copies the built index.html to dist/404.html so ANY deep URL serves the app
// directly with its REAL path — no query-string redirect dance.
//
// This replaces the old public/404.html redirect script (spa-github-pages),
// which broke on project-page URLs: it assumed the app lives at the domain
// root (pathSegmentsToKeep = 0) and stripped the repo subpath, so every deep
// link landed on the wrong path. With 404.html === index.html, the app loads
// and src/lib/toolRoutes.ts resolves the real path to the right tool.
// The restore script in index.html is kept as a safety net for old shared
// links that already contain the ?/ form.
const fs = require("fs");
const path = require("path");

const dist = path.join(__dirname, "..", "dist");
const indexHtml = path.join(dist, "index.html");
const notFoundHtml = path.join(dist, "404.html");

if (!fs.existsSync(indexHtml)) {
  console.warn("[copy-404] dist/index.html not found — skipping 404.html generation.");
  process.exit(0);
}

// Deep-link redirect (2026-11-22): GitHub Pages serves 404.html for paths
// with no matching file. 2+-segment clean paths (e.g.
// /estimate/5-marla-house-construction-cost-lahore,
// /calculators/concrete/bbs-generator) CANNOT boot the app: with vite base
// "./", relative asset paths resolve under the deep path and the browser
// refuses every module script as text/html, so the page sits on
// "Loading calculators…" forever. Redirect those to the hash form, which
// boots from the root and lets the router apply the deep link (see
// getEffectivePathname() in src/lib/toolRoutes.ts). 1-segment paths boot
// fine via this SPA fallback, so they are left alone — and the redirect
// preserves the repo subpath (/Civil-Estimation-BOQ), unlike the old
// spa-github-pages script (removed 2026-11-12) which assumed the app lives
// at the domain root and stripped it. The script runs synchronously in
// <head>, before any module script is parsed.
const REDIRECT_SNIPPET =
  '<script>(function(){var p=window.location.pathname.split("/").filter(Boolean);' +
  'var base=(p.length&&p[0].toLowerCase()==="civil-estimation-boq")?[p[0]]:[];' +
  'var segs=base.length?p.slice(1):p;' +
  'if(segs.length>=2){var prefix=base.length?"/"+base[0]:"";' +
  'window.location.replace(prefix+"/#/"+segs.join("/"));}})();</script>';

let html = fs.readFileSync(indexHtml, "utf8");
if (!html.includes("window.location.replace(prefix")) {
  const headMatch = html.match(/<head[^>]*>/i);
  if (headMatch) {
    html = html.slice(0, headMatch.index + headMatch[0].length) + REDIRECT_SNIPPET + html.slice(headMatch.index + headMatch[0].length);
  } else {
    html = REDIRECT_SNIPPET + html;
  }
}
fs.writeFileSync(notFoundHtml, html);
console.log("[copy-404] dist/404.html generated from dist/index.html (deep-link redirect injected)");
