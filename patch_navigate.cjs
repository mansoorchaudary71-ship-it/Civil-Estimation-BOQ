const fs = require('fs');
let file = fs.readFileSync('src/App.tsx', 'utf-8');

if (!file.includes('navigate-module')) {
  file = file.replace(
    'window.addEventListener("go-home", handleGoHome);',
    'const handleNavigateModule = (e: Event) => { const ce = e as CustomEvent; setPreviousModule(activeModule); setActiveModule(ce.detail); };\n    window.addEventListener("navigate-module", handleNavigateModule);\n    window.addEventListener("go-home", handleGoHome);'
  );
  
  file = file.replace(
    'window.removeEventListener("go-home", handleGoHome);',
    'window.removeEventListener("navigate-module", handleNavigateModule);\n      window.removeEventListener("go-home", handleGoHome);'
  );
  
  fs.writeFileSync('src/App.tsx', file);
  console.log("Patched App.tsx for navigate-module");
}
