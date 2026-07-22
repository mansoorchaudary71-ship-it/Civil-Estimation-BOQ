const fs = require('fs');
let file = fs.readFileSync('src/App.tsx', 'utf-8');

if (!file.includes('PlywoodEstimator')) {
  file = file.replace(
    'import { PrecastWallEstimator } from "./components/calculators/PrecastWallEstimator";',
    'import { PrecastWallEstimator } from "./components/calculators/PrecastWallEstimator";\nimport { PlywoodEstimator } from "./components/calculators/PlywoodEstimator";'
  );
  
  file = file.replace(
    '    case "precast-wall":',
    '    case "plywood-estimator":\n      return <ModuleWrapper id={activeModule} onNavigate={onNavigate} title="PlywoodEstimator"><PlywoodEstimator /></ModuleWrapper>;\n    case "precast-wall":'
  );
  
  fs.writeFileSync('src/App.tsx', file);
  console.log("Patched App.tsx");
} else {
  console.log("App.tsx already patched");
}
