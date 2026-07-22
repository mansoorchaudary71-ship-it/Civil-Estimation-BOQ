const fs = require('fs');
let file = fs.readFileSync('src/components/Dashboard.tsx', 'utf-8');

if (!file.includes('plywood-estimator')) {
  file = file.replace(
    '{ id: "formwork",',
    '{ id: "plywood-estimator", title: "Plywood & Formwork", desc: "Calculate shuttering sheets, wastage, and cost.", category: "Structural & Concrete Geometry", icon: Layers, isNew: true, styleStyle: "glass", colorClass: "bg-white/80 backdrop-blur-md text-[var(--primary-dark)]" },\n { id: "formwork",'
  );
  
  fs.writeFileSync('src/components/Dashboard.tsx', file);
  console.log("Patched Dashboard.tsx");
} else {
  console.log("Dashboard.tsx already patched");
}
