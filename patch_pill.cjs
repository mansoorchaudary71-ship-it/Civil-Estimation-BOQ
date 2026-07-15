const fs = require('fs');
const file = 'src/components/HeroSection.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `          {/* Pill-shaped Tab */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
            <div className="bg-white rounded-full px-8 py-3 shadow-sm border border-slate-100 flex items-center justify-center">
              <span className="text-xs sm:text-sm font-bold text-slate-600 uppercase tracking-widest whitespace-nowrap">
                Trusted by global practitioners and firms
              </span>
            </div>
          </div>`;

const replaceStr = `          {/* Pill-shaped Tab */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
            <div className="bg-white rounded-full px-10 py-3.5 shadow-md ring-1 ring-black/5 flex items-center justify-center">
              <span className="text-xs sm:text-sm font-extrabold text-slate-700 uppercase tracking-widest whitespace-nowrap">
                Trusted by global practitioners and firms
              </span>
            </div>
          </div>`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replaceStr);
  fs.writeFileSync(file, content);
  console.log("Patched pill");
} else {
  console.log("Not found");
}
