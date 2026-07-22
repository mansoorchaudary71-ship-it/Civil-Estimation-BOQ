const fs = require('fs');
let file = fs.readFileSync('src/App.tsx', 'utf-8');

if (!file.includes('PrecastWallEstimator')) {
  file = file.replace(
    'import SEOHead from "./components/SEOHead";',
    'import SEOHead from "./components/SEOHead";\nimport { PrecastWallEstimator } from "./components/calculators/PrecastWallEstimator";'
  );
  
  file = file.replace(
    '    case "area-space-calculator":',
    '    case "precast-wall":\n      return <ModuleWrapper id={activeModule} onNavigate={onNavigate} title="PrecastWallEstimator"><PrecastWallEstimator /></ModuleWrapper>;\n    case "area-space-calculator":'
  );
  
  fs.writeFileSync('src/App.tsx', file);
  console.log("Patched App.tsx");
} else {
  console.log("App.tsx already patched");
}
