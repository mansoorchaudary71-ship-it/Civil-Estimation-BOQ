const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('import MasterInfrastructureMEPEngine')) {
  code = code.replace(
    'import MasterSoilMechanicsLabSuite from "./components/modules/MasterSoilMechanicsLabSuite";',
    'import MasterSoilMechanicsLabSuite from "./components/modules/MasterSoilMechanicsLabSuite";\nimport MasterInfrastructureMEPEngine from "./components/modules/MasterInfrastructureMEPEngine";'
  );
}

if (!code.includes('case "infra-mep-engine"')) {
  code = code.replace(
    '    case "soil-mechanics-lab":',
    '    case "infra-mep-engine":\n      return <ModuleWrapper id={activeModule} onNavigate={onNavigate} title="MasterInfrastructureMEPEngine"><MasterInfrastructureMEPEngine /></ModuleWrapper>;\n\n    case "soil-mechanics-lab":'
  );
}

fs.writeFileSync('src/App.tsx', code);
