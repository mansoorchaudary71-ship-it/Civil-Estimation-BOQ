const fs = require('fs');

if (fs.existsSync('src/components/Dashboard.tsx')) {
  let content = fs.readFileSync('src/components/Dashboard.tsx', 'utf-8');

  // Verify the component exists
  if (content.includes('CashFlowTimeline')) {
     console.log("Dashboard already contains CashFlowTimeline");
  } else {
     content = content.replace(/import SummaryStatsWidget from "\.\/SummaryStatsWidget";/, "import SummaryStatsWidget from \"./SummaryStatsWidget\";\nimport { CashFlowTimeline } from \"./ui/CashFlowTimeline\";");
     
     const target = `<SummaryStatsWidget />
            <WorkspaceSection onSelect={handleSelect} />`;
     const replacement = `<SummaryStatsWidget />
            <div className="mt-8 mb-8">
              <CashFlowTimeline totalCost={6850000} />
            </div>
            <WorkspaceSection onSelect={handleSelect} />`;

     if (content.includes(target)) {
       content = content.replace(target, replacement);
     }
     
     fs.writeFileSync('src/components/Dashboard.tsx', content);
     console.log("Patched Dashboard");
  }
}
