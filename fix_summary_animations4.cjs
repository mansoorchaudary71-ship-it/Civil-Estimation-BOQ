const fs = require('fs');

let content = fs.readFileSync('src/components/ui/MaterialSummary.tsx', 'utf8');

content = content.replace(
  /controls\.start\(\{\n\s*opacity: \[0\.6, 1\],\n\s*y: \[10, 0\],\n\s*transition: \{ duration: 0\.4, ease: "easeOut" \}\n\s*\}\);/,
  `controls.set({ opacity: 0, y: 15, scale: 0.98 });
      controls.start({
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] }
      });`
);

fs.writeFileSync('src/components/ui/MaterialSummary.tsx', content);
