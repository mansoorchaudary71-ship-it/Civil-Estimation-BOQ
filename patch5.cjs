const fs = require('fs');
let content = fs.readFileSync('src/components/ToolCard.tsx', 'utf8');

const oldIcon = `        <motion.div 
            animate={{ scale: hov ? 1.1 : 1, rotate: hov ? [0, -5, 5, 0] : 0 }}
           transition={{ duration: 0.4, ease: "easeOut" }}
           className="text-slate-800"
        >
          <IconComponent size={32} strokeWidth={1.5} />
        </motion.div>`;

const newIcon = `        <motion.div 
            animate={{ scale: hov ? 1.1 : 1, rotate: hov ? [0, -5, 5, 0] : 0 }}
           transition={{ duration: 0.4, ease: "easeOut" }}
           className="shadow-sm rounded-[14px]"
        >
          <KnockoutBadge icon={IconComponent} uniqueId={mod.id} className="text-slate-900 drop-shadow-sm" />
        </motion.div>`;

if (content.includes(oldIcon)) {
  content = content.replace(oldIcon, newIcon);
  fs.writeFileSync('src/components/ToolCard.tsx', content);
  console.log("Replaced successfully!");
} else {
  // Let's try with regex to ignore whitespace
  const regex = /<motion\.div\s*animate=\{\{\s*scale:\s*hov\s*\?\s*1\.1\s*:\s*1,\s*rotate:\s*hov\s*\?\s*\[0,\s*-5,\s*5,\s*0\]\s*:\s*0\s*\}\}\s*transition=\{\{\s*duration:\s*0\.4,\s*ease:\s*"easeOut"\s*\}\}\s*className="text-slate-800"\s*>\s*<IconComponent\s*size=\{32\}\s*strokeWidth=\{1\.5\}\s*\/>\s*<\/motion\.div>/g;
  if (regex.test(content)) {
    content = content.replace(regex, newIcon);
    fs.writeFileSync('src/components/ToolCard.tsx', content);
    console.log("Replaced successfully with regex!");
  } else {
    console.log("Still failed to find match");
  }
}
