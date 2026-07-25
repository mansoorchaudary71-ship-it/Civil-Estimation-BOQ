const fs = require('fs');
let content = fs.readFileSync('src/components/RecentEstimates.tsx', 'utf8');

const regex = /\{filteredEstimates\.length === 0 \? \([\s\S]*?<\/button>\s*<\/div>\s*\) : \(/;

const rep2 = `{filteredEstimates.length === 0 ? (
            <EmptyStateIllustration
              icon={Search}
              title="No matching projects"
              description="Try adjusting your search or category filters."
              action={
                <button
                  onClick={() => { setSearchTerm(''); setActiveCategory('All'); }}
                  className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-medium shadow-sm hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
                >
                  Clear Filters
                </button>
              }
            />
          ) : (`;

if (regex.test(content)) {
  content = content.replace(regex, rep2);
  fs.writeFileSync('src/components/RecentEstimates.tsx', content);
  console.log('target2 replaced successfully');
} else {
  console.log('target2 not found via regex');
}
