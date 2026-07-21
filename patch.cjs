const fs = require('fs');
const path = 'src/components/Dashboard.tsx';
let code = fs.readFileSync(path, 'utf8');
code = code.replace('id: "master-rcc",', `id: "universal-structural-geometry",
        title: "Universal Structural Geometry Engine",
        desc: "Combine Rectangular Columns, Round Columns, Concrete Tubes/Pipes, Staircases, Precast Compound Walls, and Roof Pitch into one interactive shape selector.",
        category: "Structural & Concrete Geometry",
        icon: Box,
        styleStyle: "solid",
        colorClass: "bg-indigo-600 text-white shadow-lg",
        iconClass: "text-white opacity-90",
        difficulty: "Advanced",
        estimatedTime: "~15 mins",
        isPopular: true,
      },
      {
        id: "master-rcc",`);
fs.writeFileSync(path, code);
