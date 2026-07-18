const fs = require('fs');

let content = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

if (!content.includes('framer-motion')) {
  content = 'import { motion } from "framer-motion";\n' + content;
}

// Fix toolsInGroup map
content = content.replace(/toolsInGroup\.map\(\(mod\)\s*=>/g, 'toolsInGroup.map((mod, modIdx) =>');

// Replace the div wrapping ToolCard
content = content.replace(
  /<div\s+key=\{mod\.id\}\s+id=\{`module-card-\$\{mod\.id\}`\}\s+className="flex flex-col h-full">/g,
  `<motion.div
    key={mod.id}
    id={\`module-card-\${mod.id}\`}
    className="flex flex-col h-full"
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.4, delay: modIdx * 0.05 }}
  >`
);

// Replace fav-mod.id div wrapping ToolCard
content = content.replace(
  /<div\s+key=\{`fav-\$\{mod\.id\}`\}\s+id=\{`module-card-\$\{mod\.id\}`\}\s+className="flex flex-col h-full">/g,
  `<motion.div
    key={\`fav-\${mod.id}\`}
    id={\`module-card-\${mod.id}\`}
    className="flex flex-col h-full"
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.4, delay: index * 0.05 }}
  >`
);

// Now we need to replace the closing `</div>` for these specifically.
// We can do this by regex on the ToolCard block.
content = content.replace(
  /(<ToolCard[^>]*\/>\s*)<\/div>/g,
  '$1</motion.div>'
);

fs.writeFileSync('src/components/Dashboard.tsx', content);
console.log("Patched Dashboard.tsx");
