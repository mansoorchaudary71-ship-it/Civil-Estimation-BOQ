const fs = require('fs');
let file = fs.readFileSync('src/components/modules/SlabEstimator.tsx', 'utf-8');

if (!file.includes('SmartSuggestionBadge')) {
  file = file.replace(
    'import { ResultCard } from "../ui/ResultCard";',
    'import { ResultCard } from "../ui/ResultCard";\nimport { SmartSuggestionBadge } from "../ui/SmartSuggestionBadge";'
  );
  
  file = file.replace(
    '                  title="Total Steel Weight"\n                  value={results.totalSteelWeight.toFixed(2)}\n                  unit="kg"\n                  variant="primary"',
    '                  title="Total Steel Weight"\n                  value={results.totalSteelWeight.toFixed(2)}\n                  unit="kg"\n                  variant="primary"\n                  description={<div className="mt-2"><SmartSuggestionBadge label="Calculate Steel Weight" to="metal-weight" className="bg-indigo-100/50" /></div>}'
  );
  
  fs.writeFileSync('src/components/modules/SlabEstimator.tsx', file);
  console.log("Patched SlabEstimator.tsx");
}
