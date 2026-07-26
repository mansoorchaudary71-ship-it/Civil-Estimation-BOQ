const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('import ScrollProgressBar')) {
  code = code.replace(
    /import SectionNavigator from "\.\/components\/ui\/SectionNavigator";/,
    'import SectionNavigator from "./components/ui/SectionNavigator";\nimport ScrollProgressBar from "./components/ui/ScrollProgressBar";'
  );

  code = code.replace(
    /<SectionNavigator \/>/,
    '<SectionNavigator />\n      <ScrollProgressBar />'
  );

  fs.writeFileSync('src/App.tsx', code);
}
