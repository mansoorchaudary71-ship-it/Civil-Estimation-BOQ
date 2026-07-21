const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

if (!code.includes('id: "soil-mechanics-lab"')) {
  code = code.replace(
    '{ id: "geotechnical",',
    `{
        id: "soil-mechanics-lab",
        title: "Master Soil Mechanics & Geotech Lab Suite",
        desc: "Combine all 12 competitor soil testing tools into a clean, 3-submodule laboratory portal including physical, field density, shear strength and permeability.",
        category: "Geotechnical & Soil Lab Suite",
        icon: Beaker,
        styleStyle: "solid",
        colorClass: "bg-indigo-600 text-white shadow-[0_8px_30px_rgba(79,70,229,0.3)]",
        iconClass: "text-white opacity-90",
        difficulty: "Advanced",
        estimatedTime: "~20 mins",
        isPopular: true,
      },
      { id: "geotechnical",`
  );
}

// ensure Beaker is imported
if (!code.includes('Beaker,')) {
    code = code.replace('import {', 'import { Beaker,');
}

fs.writeFileSync('src/components/Dashboard.tsx', code);
