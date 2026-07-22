const fs = require('fs');

// 1. App.tsx
let appFile = fs.readFileSync('src/App.tsx', 'utf-8');
if (!appFile.includes('WastewaterCalculator')) {
  appFile = appFile.replace(
    'import { TopsoilEstimator } from "./components/calculators/TopsoilEstimator";',
    'import { TopsoilEstimator } from "./components/calculators/TopsoilEstimator";\nimport { WastewaterCalculator } from "./components/calculators/WastewaterCalculator";'
  );
  appFile = appFile.replace(
    '    case "topsoil-estimator":',
    '    case "wastewater-calculator":\n      return <ModuleWrapper id={activeModule} onNavigate={onNavigate} title="WastewaterCalculator"><WastewaterCalculator /></ModuleWrapper>;\n    case "topsoil-estimator":'
  );
  fs.writeFileSync('src/App.tsx', appFile);
  console.log("Patched App.tsx");
}

// 2. Dashboard.tsx
let dbFile = fs.readFileSync('src/components/Dashboard.tsx', 'utf-8');
if (!dbFile.includes('wastewater-calculator')) {
  dbFile = dbFile.replace(
    '{ id: "topsoil-estimator",',
    '{ id: "wastewater-calculator", title: "Wastewater Testing (BOD/COD)", desc: "Calculate BOD₅ and COD with standard dilution and titration procedures.", category: "Environmental Engineering", icon: Droplets, styleStyle: "glass", colorClass: "bg-white/80 backdrop-blur-md text-[var(--primary-dark)]" },\n { id: "topsoil-estimator",'
  );
  fs.writeFileSync('src/components/Dashboard.tsx', dbFile);
  console.log("Patched Dashboard.tsx");
}
