const fs = require('fs');

let fileStr = fs.readFileSync('src/components/ui/ToolHeader.tsx', 'utf8');

// Fix html2pdf options orientation string
fileStr = fileStr.replace(/orientation: 'portrait'/g, 'orientation: "portrait" as const');

// Fix input.value
fileStr = fileStr.replace(/input\.value/g, '(input as HTMLInputElement).value');

fs.writeFileSync('src/components/ui/ToolHeader.tsx', fileStr);
