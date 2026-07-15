const fs = require('fs');
let content = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

// Replace the container gap
content = content.replace(
  /<div className="flex flex-col gap-8 w-full mt-2">/g,
  '<div className="flex flex-col w-full">'
);

// Replace the map wrapper
const regex1 = /<div key=\{groupName\} className=\{\`w-full flex flex-col py-10 \\\$\{index % 2 === 0 \? 'bg-\\[#F4F1EA\\]' : 'bg-transparent'\}\`\}>/g;
content = content.replace(regex1, `<div key={groupName} className={\`w-full flex flex-col py-12 md:py-20 \${index % 3 === 0 ? 'bg-[#F4F1EA]' : index % 3 === 1 ? 'bg-[#F0F5FF]' : 'bg-[#F6F7F9]'}\`}>`);

fs.writeFileSync('src/components/Dashboard.tsx', content);
