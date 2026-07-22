const fs = require('fs');

// 1. App.tsx
let appFile = fs.readFileSync('src/App.tsx', 'utf-8');
if (!appFile.includes('PavementMixGradation')) {
  appFile = appFile.replace(
    'import { WastewaterCalculator } from "./components/calculators/WastewaterCalculator";',
    'import { WastewaterCalculator } from "./components/calculators/WastewaterCalculator";\nimport { PavementMixGradation } from "./components/calculators/PavementMixGradation";'
  );
  appFile = appFile.replace(
    '    case "wastewater-calculator":',
    '    case "pavement-mix":\n      return <ModuleWrapper id={activeModule} onNavigate={onNavigate} title="Pavement Mix Gradation"><PavementMixGradation /></ModuleWrapper>;\n    case "wastewater-calculator":'
  );
  fs.writeFileSync('src/App.tsx', appFile);
  console.log("Patched App.tsx");
}

// 2. Dashboard.tsx
let dbFile = fs.readFileSync('src/components/Dashboard.tsx', 'utf-8');
if (!dbFile.includes('pavement-mix')) {
  dbFile = dbFile.replace(
    'import { Calculator, Droplets, HardHat',
    'import { Calculator, Droplets, Activity, HardHat'
  );
  
  if (!dbFile.includes('Activity,')) {
      dbFile = dbFile.replace(
          'import { Calculator, Droplets, ',
          'import { Calculator, Droplets, Activity, '
      );
  }

  dbFile = dbFile.replace(
    '{ id: "wastewater-calculator",',
    '{ id: "pavement-mix", title: "Pavement Mix Gradation", desc: "Aggregate blending and gradation curve plotting.", category: "Highway Engineering", icon: Activity, styleStyle: "glass", colorClass: "bg-white/80 backdrop-blur-md text-[var(--primary-dark)]" },\n { id: "wastewater-calculator",'
  );
  fs.writeFileSync('src/components/Dashboard.tsx', dbFile);
  console.log("Patched Dashboard.tsx");
}
