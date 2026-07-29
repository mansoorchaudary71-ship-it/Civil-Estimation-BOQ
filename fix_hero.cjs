const fs = require('fs');

let content = fs.readFileSync('src/components/HeroSection.tsx', 'utf8');

// First button
content = content.replace(
  /<Button\s+onClick={onStart}\s+className="w-full sm:w-auto px-8 py-4 rounded-full bg-slate-900 dark:bg-surface-default text-white dark:text-txt-primary font-semibold text-lg hover:scale-105 active:scale-95 transition-all shadow-\[0_8px_30px_rgb\(0,0,0,0\.12\)\] hover:shadow-\[0_8px_30px_rgb\(0,0,0,0\.2\)\] dark:shadow-\[0_8px_30px_rgb\(255,255,255,0\.1\)\] flex items-center justify-center gap-2 group"\s*>\s*Start Estimating Free\s*<ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" \/>\s*<\/Button>/m,
  `<Button
            onClick={onStart}
            variant="premium"
            size="xl"
            className="w-full sm:w-auto group"
            rightIcon={<ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
          >
            Start Estimating for Free
          </Button>`
);

// Second button
content = content.replace(
  /<Button className="w-full sm:w-auto px-8 py-4 rounded-full bg-surface-default dark:bg-slate-800 text-txt-secondary dark:text-slate-300 font-semibold text-lg border border-ui-borderSubtle dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700\/50 hover:text-txt-primary dark:hover:text-white transition-all flex items-center justify-center gap-2 group shadow-sm hover:shadow-md">\s*<Play className="w-5 h-5 fill-slate-400 group-hover:fill-\[#f58145\] text-slate-400 group-hover:text-\[#f58145\] transition-colors" \/>\s*See How It Works\s*<\/Button>/m,
  `<Button
            variant="outline"
            size="xl"
            className="w-full sm:w-auto group bg-white dark:bg-slate-900"
            leftIcon={<Play className="w-5 h-5 fill-slate-400 group-hover:fill-indigo-500 text-slate-400 group-hover:text-indigo-500 transition-colors" />}
          >
            See How It Works
          </Button>`
);

fs.writeFileSync('src/components/HeroSection.tsx', content);

