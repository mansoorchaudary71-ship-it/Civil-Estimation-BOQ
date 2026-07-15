// Generate sitemap.xml
import fs from 'fs';
import path from 'path';

const tools = [
  "tracker", "projects", "labour-calculator", "boq", "retaining-wall",
  "mix-design", "isolated-footing", "calculators", "reinforcement",
  "house", "area-calculator", "property-area", "volume-estimator",
  "unit-converter", "metal-weight", "mep-calculator", "rainwater-harvesting",
  "master-rcc", "staircase-calculator", "bbs-generator", "master-quantity",
  "earthworks", "road-pavement", "chainage", "interiors-finishes",
  "formwork", "gradient-calculator", "takeoff", "rates", "ai",
  "geotechnical", "master-sieve", "aggregate-blending", "aggregate-tests",
  "solar-roof", "cbr-test", "permeability-test", "direct-shear", "roof-pitch", "anti-termite"
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>https://civilestimationpro.com/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <xhtml:link rel="alternate" hreflang="en" href="https://civilestimationpro.com/" />
    <xhtml:link rel="alternate" hreflang="ur" href="https://civilestimationpro.com/" />
    <xhtml:link rel="alternate" hreflang="hi" href="https://civilestimationpro.com/" />
  </url>
${tools.map(tool => `  <url>
    <loc>https://civilestimationpro.com/tools/${tool}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <xhtml:link rel="alternate" hreflang="en" href="https://civilestimationpro.com/tools/${tool}" />
    <xhtml:link rel="alternate" hreflang="ur" href="https://civilestimationpro.com/tools/${tool}" />
    <xhtml:link rel="alternate" hreflang="hi" href="https://civilestimationpro.com/tools/${tool}" />
  </url>`).join('\n')}
</urlset>`;

fs.writeFileSync(path.join(process.cwd(), 'public', 'sitemap.xml'), sitemap);
console.log('Sitemap generated!');
