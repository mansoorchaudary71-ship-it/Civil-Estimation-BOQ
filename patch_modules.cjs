const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

if (!code.includes('id: "master-finishes"')) {
  const newModule = `
  { id: "master-finishes", title: "Complete Finishes Workspace", desc: "Bricks, plaster, paint, flooring, countertops, woodwork, and carpet area in one seamless multi-tab interface.", category: "Masonry, Surfaces & Finishes", icon: Layers, styleStyle: "solid", colorClass: "bg-indigo-600 text-white shadow-lg", difficulty: "Intermediate", estimatedTime: "~4 mins" },`;
  
  code = code.replace(
    'export const ALL_MODULES = [',
    'export const ALL_MODULES = [' + newModule
  );
  
  fs.writeFileSync('src/components/Dashboard.tsx', code);
}
