const fs = require('fs');

// 1. App.tsx
let appFile = fs.readFileSync('src/App.tsx', 'utf-8');
if (!appFile.includes('TopsoilEstimator')) {
  appFile = appFile.replace(
    'import { RoofPitchCalculator } from "./components/calculators/RoofPitchCalculator";',
    'import { RoofPitchCalculator } from "./components/calculators/RoofPitchCalculator";\nimport { TopsoilEstimator } from "./components/calculators/TopsoilEstimator";'
  );
  appFile = appFile.replace(
    '    case "roof-calculator":',
    '    case "topsoil-estimator":\n      return <ModuleWrapper id={activeModule} onNavigate={onNavigate} title="TopsoilEstimator"><TopsoilEstimator /></ModuleWrapper>;\n    case "roof-calculator":'
  );
  fs.writeFileSync('src/App.tsx', appFile);
  console.log("Patched App.tsx");
}

// 2. Dashboard.tsx
let dbFile = fs.readFileSync('src/components/Dashboard.tsx', 'utf-8');
if (!dbFile.includes('topsoil-estimator')) {
  dbFile = dbFile.replace(
    '{ id: "roof-calculator",',
    '{ id: "topsoil-estimator", title: "Top Soil & Landscaping", desc: "Calculate loose volume, weight, standard bags, and truckloads.", category: "Structural & Concrete Geometry", icon: Shovel, styleStyle: "glass", colorClass: "bg-white/80 backdrop-blur-md text-[var(--primary-dark)]" },\n { id: "roof-calculator",'
  );
  fs.writeFileSync('src/components/Dashboard.tsx', dbFile);
  console.log("Patched Dashboard.tsx");
}
