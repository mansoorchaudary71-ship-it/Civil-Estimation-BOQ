import fs from 'fs';
let fin = fs.readFileSync('src/components/modules/FinishingEstimator.tsx', 'utf8');
fin = fin.replace('formatter={(value: number) => formatCurrency(value)}}', 'formatter={(value: number) => formatCurrency(value)}');
fs.writeFileSync('src/components/modules/FinishingEstimator.tsx', fin);
