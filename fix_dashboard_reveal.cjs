const fs = require('fs');

let content = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

// Replace standard category mapping with ScrollReveal wrapper
// I will just use motion.div since they are already wrapped in motion.div but maybe we can make them better.
// Actually, they already have `whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }}`
// I will just change transition to use the premium cubic-bezier ease.
content = content.replace(/transition=\{\{ duration: 0.4, delay: modIdx \* 0.05 \}\}/g, 'transition={{ duration: 0.4, delay: modIdx * 0.05, ease: [0.16, 1, 0.3, 1] }}');
content = content.replace(/transition=\{\{ duration: 0.4, delay: index \* 0.05 \}\}/g, 'transition={{ duration: 0.4, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}');

fs.writeFileSync('src/components/Dashboard.tsx', content);

