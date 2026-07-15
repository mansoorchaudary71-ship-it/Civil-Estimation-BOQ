const fs = require('fs');

let content = fs.readFileSync('src/components/modules/IsolatedFootingCalculator.tsx', 'utf8');

// Ensure Accordion is imported
if (!content.includes('import { Accordion }')) {
  content = content.replace('import { UniversalTabs }', 'import { Accordion } from "../ui/Accordion";\nimport { UniversalTabs }');
}

// Find the inputs section
const startIdx = content.indexOf('              {/* Inputs */}');
const endIdx = content.indexOf('              <div className="lg:col-span-1 space-y-6">');

let inputsContent = content.substring(startIdx, endIdx);

let refactored = inputsContent
  .replace(
    /<div className="space-y-6">\s*<div>\s*<h3[^>]*>\s*Load & SBC Check\s*<\/h3>/g,
    '<div className="space-y-6">\n                <Accordion title="Dimensions & Load" defaultOpen={true}>\n                  <div className="space-y-6">\n                    <div>\n                      <h4 className="font-bold text-md mb-4 text-slate-700 pb-2">Load & SBC Check</h4>'
  )
  .replace(
    /<div>\s*<h3[^>]*>\s*Footing Details\s*<\/h3>/g,
    '<div>\n                      <h4 className="font-bold text-md mb-4 text-slate-700 pb-2">Footing Details</h4>'
  );

refactored = refactored.replace(
  /<div>\s*<h3[^>]*>\s*Column & Earthworks\s*<\/h3>/g,
  '                  </div>\n                </Accordion>\n\n                <Accordion title="Column & Earthworks">\n                  <div>'
);

refactored = refactored.replace(
  /<div>\s*<h3[^>]*>\s*Reinforcement Mesh\s*<\/h3>/g,
  '                  </div>\n                </Accordion>\n\n                <Accordion title="Reinforcement Mesh">\n                  <div>'
);

// We need to close the last Accordion. The original structure ends with:
//               </div>
// 
//               <div className="lg:col-span-1 space-y-6">
// So we just replace the last `</div>` inside `inputsContent` with `</div></Accordion></div>`.

const lastDivIndex = refactored.lastIndexOf('</div>');
refactored = refactored.substring(0, lastDivIndex) + '                  </div>\n                </Accordion>\n              </div>\n' + refactored.substring(lastDivIndex + 6);

content = content.replace(content.substring(startIdx, endIdx), refactored);

fs.writeFileSync('src/components/modules/IsolatedFootingCalculator.tsx', content);
