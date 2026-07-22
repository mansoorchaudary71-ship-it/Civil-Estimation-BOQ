const fs = require('fs');
let file = fs.readFileSync('src/components/calculators/SolarWaterHeaterCalculator.tsx', 'utf-8');

if (!file.includes('FormulaAccordion')) {
  file = file.replace(
    "import { Sun, Users, Thermometer, Droplets, Battery, Zap, DollarSign, Calculator, Settings, AlertCircle, Info } from 'lucide-react';",
    "import { Sun, Users, Thermometer, Droplets, Battery, Zap, DollarSign, Calculator, Settings, AlertCircle, Info } from 'lucide-react';\nimport { FormulaAccordion, FormulaStep } from '../ui/FormulaAccordion';"
  );
  
  // Find where to inject the accordion.
  // Before: <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex gap-3 text-sm text-slate-600">
  
  const formulaSteps = `
          <FormulaAccordion 
            steps={[
              {
                id: 1,
                label: "1. Daily Hot Water Demand (Volume)",
                theoretical: "Demand (LPD) = Occupants × Usage per Person",
                applied: \`Demand = \${occupants} × \${usagePerPerson} = \${result.totalDemand.toLocaleString()} L/day\`
              },
              {
                id: 2,
                label: "2. Energy Required (Q)",
                theoretical: "Q (kJ) = m × c × ΔT\\nQ (kWh) = Q (kJ) / 3600\\nWhere:\\nm = Mass of water (Demand in kg, 1L ≈ 1kg)\\nc = Specific heat capacity (4.184 kJ/kg°C)\\nΔT = Target Temp - Cold Inlet Temp",
                applied: \`ΔT = \${targetTemp}°C - \${inletTemp}°C = \${targetTemp - inletTemp}°C\\nQ = \${result.totalDemand} kg × 4.184 × \${targetTemp - inletTemp}\\nQ = \${(result.totalDemand * 4.184 * (targetTemp - inletTemp)).toLocaleString(undefined, {maximumFractionDigits: 1})} kJ\\nQ = \${((result.totalDemand * 4.184 * (targetTemp - inletTemp)) / 3600).toLocaleString(undefined, {maximumFractionDigits: 2})} kWh\`
              },
              {
                id: 3,
                label: "3. Solar Collector Area",
                theoretical: "Area (m²) = Q (kWh) / (Solar Radiation × System Efficiency)",
                applied: \`Area = \${((result.totalDemand * 4.184 * (targetTemp - inletTemp)) / 3600).toLocaleString(undefined, {maximumFractionDigits: 2})} / (\${solarRadiation} × \${efficiency / 100})\\nArea = \${result.collectorArea.toFixed(2)} m²\`
              },
              {
                id: 4,
                label: "4. Recommended Tank Capacity",
                theoretical: "Tank Size = Daily Demand × 1.5\\n(Rule of thumb for thermal storage)",
                applied: \`Tank Size = \${result.totalDemand} × 1.5 = \${result.tankCapacity.toLocaleString()} L\`
              }
            ]} 
          />
`;
  
  file = file.replace(
    '<div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex gap-3 text-sm text-slate-600">',
    formulaSteps + '\n          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex gap-3 text-sm text-slate-600">'
  );
  
  fs.writeFileSync('src/components/calculators/SolarWaterHeaterCalculator.tsx', file);
  console.log("Patched!");
}
