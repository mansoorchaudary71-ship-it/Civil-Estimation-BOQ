const fs = require('fs');
const file = 'src/components/Dashboard.tsx';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('import { Button }')) {
  code = "import { Button } from './ui/Button';\n" + code;
}
if (!code.includes('ArrowRight')) {
  code = "import { ArrowRight } from 'lucide-react';\n" + code;
}

fs.writeFileSync(file, code);
