const fs = require('fs');
let file = fs.readFileSync('src/components/calculators/PrecastWallEstimator.tsx', 'utf-8');

if (!file.includes('SmartSuggestionBadge')) {
  file = file.replace(
    "import { FormulaAccordion, FormulaStep } from '../ui/FormulaAccordion';",
    "import { FormulaAccordion, FormulaStep } from '../ui/FormulaAccordion';\nimport { SmartSuggestionBadge } from '../ui/SmartSuggestionBadge';"
  );
  
  file = file.replace(
    '<div className="text-indigo-200 text-sm font-medium mb-1 flex items-center gap-1.5"><Box size={14}/> Footing Concrete</div>',
    '<div className="text-indigo-200 text-sm font-medium mb-1 flex items-center justify-between gap-1.5">\n                  <div className="flex items-center gap-1.5"><Box size={14}/> Footing Concrete</div>\n                  <SmartSuggestionBadge label="Calculate Materials &rarr;" to="calculators" className="!bg-white/20 !text-white hover:!bg-white hover:!text-indigo-900 border-white/30" />\n                </div>'
  );
  
  fs.writeFileSync('src/components/calculators/PrecastWallEstimator.tsx', file);
  console.log("Patched PrecastWallEstimator.tsx");
}
