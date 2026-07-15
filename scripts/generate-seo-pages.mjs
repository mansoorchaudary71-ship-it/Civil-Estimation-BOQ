import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// A subset of tools to demonstrate programmatic generation
const tools = [
  { id: "tracker", title: "Site Progress Tracker", desc: "Track construction timelines, visual Gantt charts, budget burn, and photo updates.", category: "Analysis & Tools" },
  { id: "labour-calculator", title: "Labour & Workforce", desc: "Calculate labour cost, worker allocation, and daily burn rates for your project.", category: "Project Costing" },
  { id: "boq", title: "Professional BOQ Generator", desc: "Create, format, and export professional Bills of Quantities and itemized estimates.", category: "Quantity Estimator" },
  { id: "retaining-wall", title: "Retaining Wall Estimator", desc: "Calculate stability factors, concrete volume, and reinforcement for cantilever retaining walls.", category: "Concrete Tech" },
  { id: "mix-design", title: "Concrete Mix Design", desc: "IS 10262 performance-based concrete mix calculator and report generator.", category: "Concrete Tech" },
  { id: "isolated-footing", title: "Isolated Footing Calculator", desc: "Detailed estimations for concrete, steel mesh, excavation and working space.", category: "Concrete Tech" },
  // ... adding a few to show standard implementation
];

const generateKeywords = (title, category) => {
  return `free online ${title.toLowerCase()}, ${category.toLowerCase()} software, civil engineering calculator, construction estimation app`;
};

const generateSchema = (tool) => {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": tool.title,
    "description": tool.desc,
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };
};

const generateReactRoutePage = (tool) => {
  const schema = generateSchema(tool);
  const keywords = generateKeywords(tool.title, tool.category);
  
  return `import React from 'react';
import { Helmet } from 'react-helmet-async';
import { ToolWrapper } from '../components/ToolWrapper';
// Assume specific tool component gets imported
import ToolComponent from '../components/modules/${tool.id}';

export default function ${tool.id.replace(/-./g, x => x[1].toUpperCase())}Page() {
  const schema = ${JSON.stringify(schema, null, 2)};
  
  return (
    <>
      <Helmet>
        <title>${tool.title} | Free Online Civil Engineering Calculator</title>
        <meta name="description" content="${tool.desc}" />
        <meta name="keywords" content="${keywords}" />
        <link rel="canonical" href="https://civilestimation.pro/tools/${tool.id}" />
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      </Helmet>
      
      <ToolWrapper title="${tool.title}" category="${tool.category}">
        <ToolComponent />
      </ToolWrapper>
    </>
  );
}
`;
};

function main() {
  const outputDir = path.join(__dirname, '..', 'src', 'pages', 'generated');
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  tools.forEach(tool => {
    const code = generateReactRoutePage(tool);
    const fileName = `${tool.id}.tsx`;
    fs.writeFileSync(path.join(outputDir, fileName), code);
    console.log(`Generated SEO page: ${fileName}`);
  });

  // Generate an index route file for React Router
  const routeExports = tools.map(tool => {
    const componentName = `${tool.id.replace(/-./g, x => x[1].toUpperCase())}Page`;
    return `import ${componentName} from './${tool.id}';`;
  }).join('\n');

  const routeObjects = tools.map(tool => {
    const componentName = `${tool.id.replace(/-./g, x => x[1].toUpperCase())}Page`;
    return `  { path: '/tools/${tool.id}', element: <${componentName} /> },`;
  }).join('\n');

  const routerCode = `import React from 'react';\n${routeExports}\n\nexport const seoRoutes = [\n${routeObjects}\n];\n`;

  fs.writeFileSync(path.join(outputDir, 'routes.tsx'), routerCode);
  console.log('Generated routes.tsx configuration.');
}

main();
