const fs = require('fs');
const file = 'src/components/HeroSection.tsx';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('import { Button }')) {
  code = code.replace("import { motion } from 'framer-motion';", "import { motion } from 'framer-motion';\nimport { Button } from './ui/Button';");
}

code = code.replace(/<button[\s\S]*?onClick=\{\(\) => onNavigate\("quick-rough"\)\}[\s\S]*?>[\s\S]*?Quick Estimate[\s\S]*?<\/button>/, '<Button variant="premium" size="lg" onClick={() => onNavigate("quick-rough")} rightIcon={<ArrowRight className="w-5 h-5" />}>Start Quick Estimate</Button>');

code = code.replace(/<button[\s\S]*?onClick=\{\(\) => document\.getElementById\("workflow"\)\?.scrollIntoView\(\{ behavior: "smooth" \}\)\}[\s\S]*?>[\s\S]*?See How It Works[\s\S]*?<\/button>/, '<Button variant="outline" size="lg" onClick={() => document.getElementById("workflow")?.scrollIntoView({ behavior: "smooth" })}>See How It Works</Button>');


fs.writeFileSync(file, code);
