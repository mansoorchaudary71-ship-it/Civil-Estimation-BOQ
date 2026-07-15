const fs = require('fs');
let content = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

const importStatement = `import SummaryStatsWidget from "./SummaryStatsWidget";`;
content = content.replace(`import WorkspaceSection from "./WorkspaceSection";`, `import WorkspaceSection from "./WorkspaceSection";\n${importStatement}`);

const widgetPlacement = `          <div className="mb-12 w-full md:max-w-[1400px] md:mx-auto px-4">
            <SummaryStatsWidget />
          </div>`;

content = content.replace(
  `<div className="mb-12 w-full md:max-w-[1400px] md:mx-auto px-4">\n            <WorkspaceSection onSelect={handleSelect} />\n          </div>`,
  `<div className="mb-12 w-full md:max-w-[1400px] md:mx-auto px-4">\n            <SummaryStatsWidget />\n            <WorkspaceSection onSelect={handleSelect} />\n          </div>`
);

fs.writeFileSync('src/components/Dashboard.tsx', content);
