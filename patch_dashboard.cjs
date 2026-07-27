const fs = require('fs');
const file = 'src/components/Dashboard.tsx';
let code = fs.readFileSync(file, 'utf8');

// Add import
if (!code.includes('import { Button }')) {
  code = code.replace("import { motion, AnimatePresence } from 'framer-motion';", "import { motion, AnimatePresence } from 'framer-motion';\nimport { Button } from './ui/Button';");
}

code = code.replace(/<button onClick=\{\(\) => handleSelect\(t.id, t.lastInputs\)\}[\s\S]*?>/g, '<Button onClick={() => handleSelect(t.id, t.lastInputs)} variant="premium" size="sm" fullWidth rightIcon={<ArrowRight className="w-4 h-4" />}>');
code = code.replace(/<Button onClick=\{\(\) => handleSelect\(t.id, t.lastInputs\)\}[\s\S]*?>[\s\S]*?<\/button>/g, '<Button onClick={() => handleSelect(t.id, t.lastInputs)} variant="premium" size="sm" fullWidth rightIcon={<ArrowRight className="w-4 h-4" />}>\nOpen Calculator\n</Button>');


fs.writeFileSync(file, code);
