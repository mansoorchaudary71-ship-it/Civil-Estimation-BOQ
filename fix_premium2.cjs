const fs = require('fs');

let content = fs.readFileSync('src/components/ui/PremiumToolCard.tsx', 'utf8');

// replace some hardcoded shadow rules with tokens if present, or just leave as is, since standardizing means using standard tokens.
content = content.replace(/whileHover={{ scale: 1.01 }}/g, 'whileHover={{ y: -6, scale: 1.01, transition: { duration: 0.2, ease: "easeOut" } }}');
content = content.replace(/whileHover={{ scale: 1.02, y: -4 }}/g, 'whileHover={{ scale: 1.02, y: -6, transition: { duration: 0.2, ease: "easeOut" } }}');
content = content.replace(/whileHover={{ scale: 1.03, y: -2 }}/g, 'whileHover={{ scale: 1.03, y: -6, transition: { duration: 0.2, ease: "easeOut" } }}');

fs.writeFileSync('src/components/ui/PremiumToolCard.tsx', content);

