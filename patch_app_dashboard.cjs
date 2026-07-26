const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('import ModuleSummaryDashboard')) {
  code = code.replace(
    /import { ToolHeader } from "\.\/components\/ui\/ToolHeader";/,
    'import { ToolHeader } from "./components/ui/ToolHeader";\nimport ModuleSummaryDashboard from "./components/ui/ModuleSummaryDashboard";'
  );

  code = code.replace(
    /<div className="mt-12 space-y-8 pb-16 print:hidden">/,
    '<div className="mt-12 space-y-8 pb-16 print:hidden">\n          <ModuleSummaryDashboard moduleId={id} />'
  );

  fs.writeFileSync('src/App.tsx', code);
}
