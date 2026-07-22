const fs = require('fs');
let file = fs.readFileSync('src/components/Dashboard.tsx', 'utf-8');

file = file.replace(/import \{ CashFlowTimeline \} from "\.\/ui\/CashFlowTimeline";\n/, "");
file = file.replace(/<CashFlowTimeline totalCost=\{6850000\} \/>/g, "");

fs.writeFileSync('src/components/Dashboard.tsx', file);
console.log("Patched dash to remove cashflow!");
