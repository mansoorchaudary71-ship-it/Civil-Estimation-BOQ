const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');

css = css.replace(/color: #64748b;/g, 'color: var(--color-text-secondary);');
css = css.replace(/color: #94a3b8;/g, 'color: var(--color-text-tertiary);');
css = css.replace(/color: #0f172a;/g, 'color: var(--color-text-primary);');
css = css.replace(/color: #f8fafc;/g, 'color: var(--color-text-inverse);');

// Fix trailing brace on nav block
css = css.replace(/  \}\}\n  \/\* Navigation Hover & Active \*\//g, '  }\n  /* Navigation Hover & Active */');

fs.writeFileSync('src/index.css', css);
