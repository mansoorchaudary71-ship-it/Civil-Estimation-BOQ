const fs = require('fs');
let code = fs.readFileSync('src/components/calculators/FinishesEstimator.tsx', 'utf8');

code = code.replace(
`      plywoodSheets,
      studCount,
      cost: totalCost
    };`,
`      plywoodSheets,
      studCount,
      cEdgePolishingLength: parseFloat(cEdgePolishingLength) || 0,
      cost: totalCost
    };`
);

code = code.replace(
`if (results.plywoodSheets > 0) addItem({ name: 'Plywood (4x8)', quantity: results.plywoodSheets, unit: 'Sheets', rate: 4500, category: 'Masonry & Finishes' });`,
`if (results.plywoodSheets > 0) addItem({ name: 'Plywood (4x8)', quantity: results.plywoodSheets, unit: 'Sheets', rate: 4500, category: 'Masonry & Finishes' });
    if (results.cEdgePolishingLength > 0) addItem({ name: 'Countertop Edge Polishing', quantity: results.cEdgePolishingLength, unit: isImperial ? 'ft' : 'm', rate: 100, category: 'Masonry & Finishes' });`
);

fs.writeFileSync('src/components/calculators/FinishesEstimator.tsx', code);
console.log('Done patch 2');
