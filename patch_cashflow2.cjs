const fs = require('fs');
let file = fs.readFileSync('src/components/ui/CashFlowTimeline.tsx', 'utf-8');

file = file.replace(/name: \\`Month \\\${index \+ 1}\\`,/, "name: `Month ${index + 1}`,");
file = file.replace(/tickFormatter={\(value\) => \\`\\\${\(value \/ 1000000\)\.toFixed\(1\)}M\\`}/, "tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}");
file = file.replace(/key={\\`cell-\\\${index}\\`}/, "key={`cell-${index}`}");
file = file.replace(/\\\$/g, "$");
file = file.replace(/\\`/g, "`");

fs.writeFileSync('src/components/ui/CashFlowTimeline.tsx', file);
