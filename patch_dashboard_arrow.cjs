const fs = require('fs');
const file = 'src/components/Dashboard.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/<button aria-label="ArrowUpRight" className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-600\/30 text-white rounded-full transition-all hover:scale-105 active:scale-95 ml-2 shrink-0 flex items-center justify-center relative overflow-hidden group\/send"/,
'<Button variant="premium" className="ml-2 !rounded-full !w-12 !h-12 !p-0" aria-label="Ask" rightIcon={<ArrowUpRight className="w-5 h-5 text-white" />}');

if(!code.includes('ArrowUpRight')) {
    code = "import { ArrowUpRight } from 'lucide-react';\n" + code;
}

fs.writeFileSync(file, code);
