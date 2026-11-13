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
fs.copyFileSync(indexHtml, notFoundHtml);
console.log("[copy-404] dist/404.html generated from dist/index.html");
