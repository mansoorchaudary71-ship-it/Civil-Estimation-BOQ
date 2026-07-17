const fs = require('fs');

let fileStr = fs.readFileSync('src/components/MobileToolsSheet.tsx', 'utf8');

fileStr = fileStr.replace(/import \{ ModuleId \} from "\.\/Sidebar";/g, 'export type ModuleId = string;');

fs.writeFileSync('src/components/MobileToolsSheet.tsx', fileStr);
console.log("Updated MobileToolsSheet.tsx");
