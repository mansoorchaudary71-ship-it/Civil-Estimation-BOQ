const fs = require('fs');
let file = fs.readFileSync('src/components/ui/CashFlowTimeline.tsx', 'utf-8');

file = file.replace(/name: \\`Month \\\${index \+ 1}\\`,/g, "name: `Month ${index + 1}`,");
file = file.replace(/tickFormatter={\(value\) => \\`\\\${\(value \/ 1000000\)\.toFixed\(1\)}M\\`}/g, "tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}");
file = file.replace(/key={\\`cell-\\\${index}\\`}/g, "key={`cell-${index}`}");

fs.writeFileSync('src/components/ui/CashFlowTimeline.tsx', file);
