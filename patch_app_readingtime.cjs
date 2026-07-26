const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('import ReadingTimeIndicator')) {
  code = code.replace(
    /import ScrollProgressBar from "\.\/components\/ui\/ScrollProgressBar";/,
    'import ScrollProgressBar from "./components/ui/ScrollProgressBar";\nimport ReadingTimeIndicator from "./components/ui/ReadingTimeIndicator";'
  );

  code = code.replace(
    /<motion\.main\s*id="main-content"[\s\S]*?className="flex-1 flex flex-col bg-transparent relative w-full transition-all duration-300"\s*>/,
    match => `${match}\n                      <ReadingTimeIndicator activeModule={activeModule} />`
  );

  fs.writeFileSync('src/App.tsx', code);
}
