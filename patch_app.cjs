const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('import MasterSoilMechanicsLabSuite')) {
  code = code.replace(
    'import UniversalStructuralGeometryEngine from "./components/modules/UniversalStructuralGeometryEngine";',
    'import UniversalStructuralGeometryEngine from "./components/modules/UniversalStructuralGeometryEngine";\nimport MasterSoilMechanicsLabSuite from "./components/modules/MasterSoilMechanicsLabSuite";'
  );
}

if (!code.includes('case "soil-mechanics-lab"')) {
  code = code.replace(
    '    case "universal-structural-geometry":',
    '    case "soil-mechanics-lab":\n      return <ModuleWrapper id={activeModule} onNavigate={onNavigate} title="MasterSoilMechanicsLabSuite"><MasterSoilMechanicsLabSuite /></ModuleWrapper>;\n\n    case "universal-structural-geometry":'
  );
}

fs.writeFileSync('src/App.tsx', code);
