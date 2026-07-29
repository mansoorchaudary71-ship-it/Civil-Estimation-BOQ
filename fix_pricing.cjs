const fs = require('fs');

let content = fs.readFileSync('src/components/pages/PricingPage.tsx', 'utf8');

content = content.replace(
  /<Button className="w-full py-3 px-4 rounded-xl font-bold border-2 border-ui-borderSubtle dark:border-slate-700 hover:border-ui-borderDefault dark:hover:border-slate-600 transition-colors text-txt-secondary dark:text-slate-300">/g,
  '<Button variant="outline" size="md" fullWidth>'
);

content = content.replace(
  /<Button className="w-full py-3\.5 px-4 rounded-xl font-bold bg-slate-900 dark:bg-amber-500 hover:bg-slate-800 dark:hover:bg-amber-400 text-txt-primary dark:text-white shadow-md transition-all hover:shadow-lg hover:-translate-y-0\.5">/g,
  '<Button variant="primary" size="lg" fullWidth>'
);

content = content.replace(
  /<Button className="w-full py-3 px-4 rounded-xl font-bold bg-indigo-50 dark:bg-indigo-500\/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500\/30 hover:bg-indigo-100 dark:hover:bg-indigo-500\/20 transition-colors">/g,
  '<Button variant="secondary" size="md" fullWidth>'
);

fs.writeFileSync('src/components/pages/PricingPage.tsx', content);

