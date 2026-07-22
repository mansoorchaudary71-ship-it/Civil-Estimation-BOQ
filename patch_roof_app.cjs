const fs = require('fs');
let file = fs.readFileSync('src/App.tsx', 'utf-8');

if (!file.includes('RoofPitchCalculator')) {
  file = file.replace(
    'import { SolarWaterHeaterCalculator } from "./components/calculators/SolarWaterHeaterCalculator";',
    'import { SolarWaterHeaterCalculator } from "./components/calculators/SolarWaterHeaterCalculator";\nimport { RoofPitchCalculator } from "./components/calculators/RoofPitchCalculator";'
  );
  
  file = file.replace(
    '    case "solar-water-heater":',
    '    case "roof-calculator":\n      return <ModuleWrapper id={activeModule} onNavigate={onNavigate} title="RoofPitchCalculator"><RoofPitchCalculator /></ModuleWrapper>;\n    case "solar-water-heater":'
  );
  
  fs.writeFileSync('src/App.tsx', file);
  console.log("Patched App.tsx");
} else {
  console.log("App.tsx already patched");
}
