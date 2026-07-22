const fs = require('fs');
let file = fs.readFileSync('src/components/Dashboard.tsx', 'utf-8');

if (!file.includes('roof-calculator')) {
  file = file.replace(
    '{ id: "plywood-estimator",',
    '{ id: "roof-calculator", title: "Roof Pitch & Area", desc: "Calculate slope, rafter length, and total roof surface area.", category: "Structural & Concrete Geometry", icon: Triangle, styleStyle: "glass", colorClass: "bg-white/80 backdrop-blur-md text-[var(--primary-dark)]" },\n { id: "plywood-estimator",'
  );
  
  fs.writeFileSync('src/components/Dashboard.tsx', file);
  console.log("Patched Dashboard.tsx");
} else {
  console.log("Dashboard.tsx already patched");
}
