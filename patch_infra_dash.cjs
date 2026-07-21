const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

if (!code.includes('id: "infra-mep-engine"')) {
  code = code.replace(
    '{ id: "geotechnical",',
    `{
        id: "infra-mep-engine",
        title: "Master Infrastructure & MEP Engine",
        desc: "Earthworks, Pavement layers, Chainage Mass-Haul, Smart Solar & HVAC sizing all in one interactive suite.",
        category: "Infrastructure & Road Pavements",
        icon: Route,
        styleStyle: "solid",
        colorClass: "bg-emerald-600 text-white shadow-[0_8px_30px_rgba(16,185,129,0.3)]",
        iconClass: "text-white opacity-90",
        difficulty: "Advanced",
        estimatedTime: "~15 mins",
        isPopular: true,
      },
      { id: "geotechnical",`
  );
}

if (!code.includes('Route,')) {
    code = code.replace('import {', 'import { Route,');
}

fs.writeFileSync('src/components/Dashboard.tsx', code);
