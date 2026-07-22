const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('MasterFinishesWorkspace')) {
  // Add import
  code = code.replace(
    'import QSWorkflow from "./components/modules/QSWorkflow";',
    'import QSWorkflow from "./components/modules/QSWorkflow";\nimport MasterFinishesWorkspace from "./components/modules/MasterFinishesWorkspace";'
  );

  // Add to routing
  code = code.replace(
    'case "ai":',
    'case "master-finishes":\n      return <ModuleWrapper id={activeModule} onNavigate={onNavigate} title="MasterFinishesWorkspace"><MasterFinishesWorkspace /></ModuleWrapper>;\n    case "ai":'
  );

  fs.writeFileSync('src/App.tsx', code);
}
