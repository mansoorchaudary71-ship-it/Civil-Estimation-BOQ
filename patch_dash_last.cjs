const fs = require('fs');
let file = fs.readFileSync('src/components/Dashboard.tsx', 'utf-8');

if (!file.includes('CashFlowTimeline')) {
  file = file.replace(/import SummaryStatsWidget from "\.\/SummaryStatsWidget";/, "import SummaryStatsWidget from \"./SummaryStatsWidget\";\nimport { CashFlowTimeline } from \"./ui/CashFlowTimeline\";");

  const target = `<SummaryStatsWidget />`;
  const replacement = `<SummaryStatsWidget />
            <div className="mt-8 mb-8">
              <CashFlowTimeline totalCost={6850000} />
            </div>`;
            
  file = file.replace(target, replacement);
  fs.writeFileSync('src/components/Dashboard.tsx', file);
  console.log("Patched dash!");
}
