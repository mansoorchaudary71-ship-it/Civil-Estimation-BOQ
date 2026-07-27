const fs = require('fs');

function fix(file) {
  let c = fs.readFileSync(file, 'utf8');
  // ensure motion div has whileHover={{ y: -6, transition: { duration: 0.2, ease: "easeOut" } }}
  // let's do simple text replacements for basic Tailwind classes where needed
  // ToolCard.tsx uses <motion.div ...> as the root. Let's just inject `whileHover={{ y: -6 }}` if it's not there.
  c = c.replace(/className="relative flex flex-col h-full/g, 'whileHover={{ y: -6 }} className="relative flex flex-col h-full transform-gpu ease-out');
  fs.writeFileSync(file, c);
}

fix('src/components/ToolCard.tsx');

