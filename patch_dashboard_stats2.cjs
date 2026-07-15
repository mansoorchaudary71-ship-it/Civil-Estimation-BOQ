const fs = require('fs');
let content = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

content = content.replace(
  /<WorkspaceSection onSelect=\{handleSelect\} \/>/g,
  `<SummaryStatsWidget />\n            <WorkspaceSection onSelect={handleSelect} />`
);

fs.writeFileSync('src/components/Dashboard.tsx', content);
