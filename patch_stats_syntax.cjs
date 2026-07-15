const fs = require('fs');
let content = fs.readFileSync('src/components/SummaryStatsWidget.tsx', 'utf8');

content = content.split('\\`\\${val / 1000}k\\`').join('`${val / 1000}k`');
content = content.split('\\`Rs \\${value.toLocaleString()}\\`').join('`Rs ${value.toLocaleString()}`');

fs.writeFileSync('src/components/SummaryStatsWidget.tsx', content);
