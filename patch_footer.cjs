const fs = require('fs');
let content = fs.readFileSync('src/components/Footer.tsx', 'utf-8');

const target = `<label className="text-[11px] font-bold tracking-[0.2em] uppercase text-blue-200/50 mb-3 block pl-2">
                  Professional Updates
                </label>`;

const replacement = `<label className="text-[11px] font-bold tracking-[0.2em] uppercase text-blue-200/50 mb-1.5 block pl-2">
                  Professional Updates
                </label>
                <p className="text-[13px] text-blue-100/60 mb-4 pl-2 leading-relaxed">
                  Receive updates on new estimation tools and industry insights.
                </p>`;

content = content.replace(target, replacement);

fs.writeFileSync('src/components/Footer.tsx', content);
