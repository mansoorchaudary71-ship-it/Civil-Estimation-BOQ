const fs = require('fs');
let content = fs.readFileSync('src/components/boq/MasterBOQDrawer.tsx', 'utf8');

if (!content.includes('import EmptyStateIllustration')) {
  content = content.replace("import { motion, AnimatePresence } from 'framer-motion';", "import { motion, AnimatePresence } from 'framer-motion';\nimport EmptyStateIllustration from '../ui/EmptyStateIllustration';");
}

const regex = /\{items\.length === 0 \? \([\s\S]*?<\/div>\s*\) : \(/;

const rep = `{items.length === 0 ? (
                <EmptyStateIllustration
                  icon={FileText}
                  title="Your BOQ is empty"
                  description="Start adding items from the calculators to build your master bill of quantities."
                />
              ) : (`;

if (regex.test(content)) {
  content = content.replace(regex, rep);
  fs.writeFileSync('src/components/boq/MasterBOQDrawer.tsx', content);
  console.log('target replaced successfully');
} else {
  console.log('target not found via regex');
}
