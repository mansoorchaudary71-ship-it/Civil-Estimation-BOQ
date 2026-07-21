const fs = require('fs');
let content = fs.readFileSync('src/components/calculators/ConcreteCalculator.tsx', 'utf8');

// Add imports
if (!content.includes('useBOQ')) {
  content = content.replace(
    'import { useSettings } from \'../../context/SettingsContext\';',
    'import { useSettings } from \'../../context/SettingsContext\';\nimport { useBOQ } from \'../../context/BOQContext\';\nimport SEOHead from \'../seo/SEOHead\';'
  );
}

// Add hook
if (!content.includes('const { addItem } = useBOQ();')) {
  content = content.replace(
    'const { settings, formatCurrency } = useSettings();',
    'const { settings, formatCurrency } = useSettings();\n  const { addItem } = useBOQ();'
  );
}

// Check where to inject export logic
// Wait, I will just wrap with SEOHead for now.
content = content.replace(
  '<div className="w-full max-w-7xl mx-auto py-8 px-4">',
  '<SEOHead title="Concrete Calculator | Civil Estimation Pro" description="Calculate concrete volume, cement, sand, and aggregate." divisionName="Structural & Concrete Geometry" toolName="Concrete Calculator">\n<div className="w-full max-w-7xl mx-auto py-8 px-4">'
);
content = content.replace(
  '    </div>\n  );\n}',
  '    </div>\n    </SEOHead>\n  );\n}'
);

fs.writeFileSync('src/components/calculators/ConcreteCalculator.tsx', content);
console.log('ConcreteCalculator patched');
