const fs = require('fs');
let content = fs.readFileSync('src/components/calculators/FinishesEstimator.tsx', 'utf8');

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
    'const { settings, updateSettings, formatCurrency } = useSettings();',
    'const { settings, updateSettings, formatCurrency } = useSettings();\n  const { addItem } = useBOQ();'
  );
}

// Add export function
content = content.replace(
  'const showToast = (msg: string) => {',
  `const handleExportToBOQ = () => {
    if (results.cement > 0) addItem({ name: 'Cement (Finishes)', quantity: results.cement, unit: 'bags', rate: settings.rates.cement || 1200, category: 'Masonry & Finishes' });
    if (results.sand > 0) addItem({ name: 'Sand (Finishes)', quantity: results.sand, unit: 'cft', rate: settings.rates.sand || 40, category: 'Masonry & Finishes' });
    if (results.bricks > 0) addItem({ name: 'Bricks (Masonry)', quantity: results.bricks, unit: 'pcs', rate: settings.rates.bricks || 15, category: 'Masonry & Finishes' });
    if (results.blocks > 0) addItem({ name: 'Blocks (Masonry)', quantity: results.blocks, unit: 'pcs', rate: (settings.rates.bricks || 15) * 3, category: 'Masonry & Finishes' });
    if (results.paint > 0) addItem({ name: 'Wall Paint', quantity: results.paint, unit: 'Liters', rate: 1200, category: 'Masonry & Finishes' });
    if (results.tiles > 0) addItem({ name: 'Tiles', quantity: results.tiles, unit: 'Boxes', rate: 1500, category: 'Masonry & Finishes' });
    showToast("Exported to BOQ!");
  };
  const showToast = (msg: string) => {`
);

// Replace button onClick
content = content.replace(
  'onClick={() => showToast("Exported to BOQ!")}',
  'onClick={handleExportToBOQ}'
);

// Wrap return in SEOHead
content = content.replace(
  '<div className="w-full max-w-7xl mx-auto py-8 px-4 font-sans text-slate-900">',
  '<SEOHead title="Masonry & Finishes Estimator | Civil Estimation Pro" description="Calculate complete masonry, plaster, flooring, and paint quantities." divisionName="Masonry, Surfaces & Finishes" toolName="Masonry & Finishes Estimator">\n<div className="w-full max-w-7xl mx-auto py-8 px-4 font-sans text-slate-900">'
);
content = content.replace(
  '</AnimatePresence>\n\n        </div>',
  '</AnimatePresence>\n\n        </div>'
);

content = content.replace(
  '    </div>\n  );\n}',
  '    </div>\n    </SEOHead>\n  );\n}'
);

fs.writeFileSync('src/components/calculators/FinishesEstimator.tsx', content);
console.log('FinishesEstimator patched');
