const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /import ScrollToTop from "\.\/components\/ui\/ScrollToTop";/,
  'import ScrollToTop from "./components/ui/ScrollToTop";\nimport SectionNavigator from "./components/ui/SectionNavigator";'
);

code = code.replace(
  /<ScrollToTop isHome=\{activeModule === "home"\} \/>/,
  '<ScrollToTop isHome={activeModule === "home"} />\n      <SectionNavigator />'
);

fs.writeFileSync('src/App.tsx', code);
