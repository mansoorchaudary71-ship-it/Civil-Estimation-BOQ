const fs = require('fs');
let file = fs.readFileSync('src/components/Dashboard.tsx', 'utf-8');

if (!file.includes('precast-wall')) {
  file = file.replace(
    '        {\n          id: "calculators",',
    '        {\n          id: "precast-wall",\n          title: "Precast Wall Estimator",\n          desc: "Calculate panels, posts, footing concrete, and cost.",\n          category: "Quantity Takeoff & Costing",\n          icon: Layers,\n          new: true\n        },\n        {\n          id: "calculators",'
  );
  
  fs.writeFileSync('src/components/Dashboard.tsx', file);
  console.log("Patched Dashboard.tsx");
} else {
  console.log("Dashboard.tsx already patched");
}
