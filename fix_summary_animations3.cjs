const fs = require('fs');

let content = fs.readFileSync('src/components/ui/MaterialSummary.tsx', 'utf8');

// Replace the chart container with a motion.div using controls
content = content.replace(
  /<motion\.div initial=\{\{ opacity: 0, x: 20 \}\} animate=\{\{ opacity: 1, x: 0 \}\} transition=\{\{ duration: 0\.5, delay: 0\.2 \}\}/,
  '<motion.div animate={controls}'
);

fs.writeFileSync('src/components/ui/MaterialSummary.tsx', content);
