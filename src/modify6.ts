import * as fs from 'fs';
import * as path from 'path';

const filePath = path.join(process.cwd(), 'src/components/modules/Calculators.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

content = content.replace(
  /<div className="p-8 w-full h-full text-slate-900 overflow-y-auto">\s*<div className="bg-white border border-slate-200 rounded-xl p-6 min-h-full flex flex-col">\s*<div className="mb-6">\s*<h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Core Calculators<\/h2>\s*<\/div>/g,
  `<div className="w-full h-full overflow-y-auto bg-slate-50 text-slate-900 font-sans p-6 md:p-8">
      <div className="max-w-7xl mx-auto h-full flex flex-col">
        <div className="mb-6">
          <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight  text-white bg-clip-text text-transparent pb-2">
            Core Calculators
          </h1>
          <p className="text-slate-500 mt-2 text-base font-medium">
            Accurate estimations for concrete, bricks, and steel requirements.
          </p>
        </div>`
);

content = content.replace(
  /\{activeTab === "concrete" && \(/g,
  `<div className="bg-white/70 backdrop-blur-md p-6 md:p-8 rounded-[2rem] shadow-[0_10px_40px_rgb(0,0,0,0.04)] border border-white/20 flex-1 relative overflow-hidden transition-all duration-300">\n        {activeTab === "concrete" && (`
);

content = content.replace(
  /bg-slate-50 border border-slate-200 rounded-xl p-6/g,
  'bg-white/70 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-sm'
);

content = content.replace(
  /w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-2\.5 text-sm/g,
  'w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 font-medium'
);

// We need to add a closing div right before the end of the return statement
content = content.replace(
  /\s*<\/div>\n\s*<\/div>\n\s*\);\n}/g,
  `\n        </div>\n      </div>\n    </div>\n  );\n}`
);

fs.writeFileSync(filePath, content, 'utf-8');
