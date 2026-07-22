const fs = require('fs');
let file = fs.readFileSync('src/components/ui/CashFlowTimeline.tsx', 'utf-8');

file = file.replace(/name: `Month \${index \+ 1}`,/g, "name: `Month ${index + 1}`,");
// Just let it be string interpolated normally... actually let's re-write the file entirely to be safe and clean since sed/regex in node can be messy.

