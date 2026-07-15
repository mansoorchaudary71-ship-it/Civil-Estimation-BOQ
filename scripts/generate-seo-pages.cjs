const fs = require('fs');
const path = require('path');

function generatePages() {
  const dashboardPath = path.join(__dirname, '../src/components/Dashboard.tsx');
  const appPath = path.join(__dirname, '../src/App.tsx');
  const outputDir = path.join(__dirname, '../src/pages/generated');

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 1. Extract ALL_MODULES from Dashboard.tsx
  const dashboardContent = fs.readFileSync(dashboardPath, 'utf8');
  const modulesMatch = dashboardContent.match(/export const ALL_MODULES = (\[[\s\S]*?\]);/);
  
  let modules = [];
  if (modulesMatch) {
    try {
      // Evaluate the array (replacing icons with strings to avoid eval errors)
      let arrayStr = modulesMatch[1].replace(/icon: [a-zA-Z0-9_]+,?/g, '');
      arrayStr = arrayStr.replace(/import.*?\\n/g, '');
      modules = eval(arrayStr);
    } catch (e) {
      console.error("Failed to parse ALL_MODULES", e);
      return;
    }
  }

  // 2. Extract mappings from App.tsx
  const appContent = fs.readFileSync(appPath, 'utf8');
  const appLines = appContent.split('\n');
  
  const componentToFileMap = {};
  appLines.forEach(line => {
    const importMatch = line.match(/import\s+([A-Z][a-zA-Z0-9]+)\s+from\s+["']\.\/components\/modules\/(.*?)["']/);
    if (importMatch) {
      componentToFileMap[importMatch[1]] = importMatch[2];
    }
  });

  const idToComponentMap = {};
  appLines.forEach(line => {
    // Match line: {activeModule === "tracker" && <ModuleWrapper ...><SiteProgressTracker /></ModuleWrapper>}
    const match = line.match(/\{activeModule === ["'](.*?)["'].*?<ModuleWrapper.*?>\s*<([A-Z][a-zA-Z0-9]+)[\s>]/);
    if (match) {
      idToComponentMap[match[1]] = match[2];
    }
  });

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

  // Generate individual pages
  const validTools = modules.filter(m => idToComponentMap[m.id]);
  
  validTools.forEach(tool => {
    const componentName = idToComponentMap[tool.id];
    // Fallback to componentName if we couldn't parse the import
    let componentPath = componentToFileMap[componentName] || componentName;
    if (componentPath === 'Calculators') {
      componentPath = 'Calculators';
    }
    const schema = generateSchema(tool);
    const keywords = generateKeywords(tool.title, tool.category);
    
    // Capitalize tool ID for the page component name
    const pageComponentName = tool.id
      .split('-')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('') + 'Page';

    const code = `import React from 'react';
import { Helmet } from 'react-helmet-async';
import ${componentName} from '../../components/modules/${componentPath}';

export default function ${pageComponentName}() {
  const schema = ${JSON.stringify(schema, null, 2)};
  
  return (
    <div className="w-full flex-1 flex flex-col items-center">
      <Helmet>
        <title>${tool.title} | Free Online Civil Engineering Calculator</title>
        <meta name="description" content="${tool.desc}" />
        <meta name="keywords" content="${keywords}" />
        <link rel="canonical" href="https://civilestimation.pro/tools/${tool.id}" />
        <script type="application/ld+json">
          {\`${JSON.stringify(schema)}\`}
        </script>
      </Helmet>
      
      <main className="w-full max-w-7xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">${tool.title}</h1>
          <p className="text-slate-600 dark:text-slate-300">${tool.desc}</p>
        </header>
        
        <div className="bg-transparent">
          <${componentName} />
        </div>
      </main>
    </div>
  );
}
`;
    const fileName = `${tool.id}.tsx`;
    fs.writeFileSync(path.join(outputDir, fileName), code);
    console.log(`Generated SEO page for (${tool.id}): ${fileName}`);
  });

  // Generate routes.tsx
  const routeExports = validTools.map(tool => {
    const pageComp = tool.id.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('') + 'Page';
    return `import ${pageComp} from './${tool.id}';`;
  }).join('\n');

  const routeObjects = validTools.map(tool => {
    const pageComp = tool.id.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('') + 'Page';
    return `  { path: '/tools/${tool.id}', element: <${pageComp} /> },`;
  }).join('\n');

  const routerCode = `import React from 'react';
${routeExports}

export const seoRoutes = [
${routeObjects}
];
`;

  fs.writeFileSync(path.join(outputDir, 'routes.tsx'), routerCode);
  console.log('Generated routes.tsx configuration.');
}

generatePages();
