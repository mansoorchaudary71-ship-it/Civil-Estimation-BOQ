const fs = require('fs');

let content = fs.readFileSync('src/components/PremiumHero.tsx', 'utf8');

content = content.replace(
  /<Button className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-md transition-all active:scale-95 text-base font-semibold hover:-translate-y-0\.5">\s*Start Estimating for Free\s*<ArrowRight className="w-4 h-4" \/>\s*<\/Button>/m,
  `<Button variant="premium" size="lg" className="w-full sm:w-auto px-8 group" rightIcon={<ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}>Start Estimating for Free</Button>`
);

content = content.replace(
  /<Button className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 bg-transparent border border-transparent hover:bg-slate-100 text-txt-secondary rounded-full transition-all active:scale-95 text-base font-semibold hover:-translate-y-0\.5 hover:shadow-lg shadow-sm">\s*View All Tools &gt;\s*<\/Button>/m,
  `<Button variant="outline" size="lg" className="w-full sm:w-auto px-8">Explore Tools</Button>`
);

fs.writeFileSync('src/components/PremiumHero.tsx', content);

