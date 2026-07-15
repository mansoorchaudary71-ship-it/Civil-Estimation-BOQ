const fs = require('fs');
let content = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

// Replace the groupsToDisplay.map line and the inner div
content = content.replace(
  /<div key=\{groupName\} className=\{`flex flex-col gap-5 py-8 px-4 sm:px-6 md:px-8 rounded-\[32px\] \$\{index % 2 === 0 \? 'bg-\[#F4F1EA\]' : 'bg-transparent'\}\`\}>/g,
  '<div key={groupName} className={`flex flex-col gap-5 py-10 px-4 sm:px-8 md:px-10 -mx-4 sm:-mx-8 md:-mx-10 rounded-[32px] ${index % 2 === 0 ? \\'bg-[#F4F1EA]\\' : \\'bg-transparent\\'}`}>\n'
);

fs.writeFileSync('src/components/Dashboard.tsx', content);
