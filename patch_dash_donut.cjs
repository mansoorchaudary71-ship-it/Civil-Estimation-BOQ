const fs = require('fs');
let file = fs.readFileSync('src/components/Dashboard.tsx', 'utf-8');

if (!file.includes('MaterialCostDonutChart')) {
  file = file.replace(/import { CashFlowTimeline } from "\.\/ui\/CashFlowTimeline";/, "import { CashFlowTimeline } from \"./ui/CashFlowTimeline\";\nimport { MaterialCostDonutChart } from \"./ui/MaterialCostDonutChart\";");

  const target = `<div className="mt-8 mb-8">
              <CashFlowTimeline totalCost={6850000} />
            </div>`;
  const replacement = `<div className="mt-8 mb-8 grid grid-cols-1 xl:grid-cols-2 gap-8">
              <CashFlowTimeline totalCost={6850000} />
              <MaterialCostDonutChart />
            </div>`;
            
  file = file.replace(target, replacement);
  fs.writeFileSync('src/components/Dashboard.tsx', file);
  console.log("Patched dash!");
}
