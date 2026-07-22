const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('import SEOHead')) {
  code = code.replace(
    'import { ErrorBoundary } from "./components/ErrorBoundary";',
    'import { ErrorBoundary } from "./components/ErrorBoundary";\nimport SEOHead from "./components/SEOHead";'
  );
}

if (!code.includes('<SEOHead')) {
  code = code.replace(
    '<div className="flex-1 flex flex-col relative w-full bg-transparent">\n      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col">',
    '<div className="flex-1 flex flex-col relative w-full bg-transparent">\n      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col">\n        <SEOHead toolId={id} toolName={actualTitle} category={category} description={subtitle} />'
  );
}

fs.writeFileSync('src/App.tsx', code);
