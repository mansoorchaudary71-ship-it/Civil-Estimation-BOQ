const fs = require('fs');
const file = 'src/components/HeroSection.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `        {/* Bottom Footer (Logo Cloud) */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="w-full mt-12 pt-16 pb-20 bg-pink-100 border-t border-gray-200/60 overflow-hidden"
        >
          <div className="max-w-7xl mx-auto px-4 md:px-8 text-center">
            <p className="mb-10 text-sm font-semibold text-slate-500 uppercase tracking-widest">Trusted by global practitioners and firms</p>
          </div>
          
          <div className="relative w-full overflow-hidden flex">`;

const replaceStr = `        {/* Bottom Footer (Logo Cloud) */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="w-full mt-16 pt-16 pb-20 bg-pink-100/50 relative"
        >
          {/* Pill-shaped Tab */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
            <div className="bg-white rounded-full px-8 py-3 shadow-sm border border-slate-100 flex items-center justify-center">
              <span className="text-xs sm:text-sm font-bold text-slate-600 uppercase tracking-widest whitespace-nowrap">
                Trusted by global practitioners and firms
              </span>
            </div>
          </div>
          
          <div className="relative w-full overflow-hidden flex">`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replaceStr);
  
  // Also update gradients to match new background opacity
  content = content.replace(
    'from-pink-100 to-transparent',
    'from-pink-100/50 to-transparent'
  );
  content = content.replace(
    'from-pink-100 to-transparent',
    'from-pink-100/50 to-transparent'
  );

  fs.writeFileSync(file, content);
  console.log("Patched HeroSection successfully");
} else {
  console.log("Could not find target string in HeroSection.tsx");
}
