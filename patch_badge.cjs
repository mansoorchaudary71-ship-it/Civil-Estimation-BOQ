const fs = require('fs');
let content = fs.readFileSync('src/components/Footer.tsx', 'utf-8');

const target = `<p className="text-blue-100/50 text-[14px] font-medium">
            © {new Date().getFullYear()} Civil Estimation Pro. All rights reserved.
          </p>`;

const replacement = `<div className="flex flex-col md:flex-row items-center gap-3">
            <p className="text-blue-100/50 text-[14px] font-medium text-center md:text-left">
              © {new Date().getFullYear()} Civil Estimation Pro. All rights reserved.
            </p>
            <span className="px-2 py-0.5 rounded border border-blue-400/20 bg-blue-400/5 text-blue-300/80 text-[11px] font-mono font-semibold tracking-wider">
              v1.0.0
            </span>
          </div>`;

content = content.replace(target, replacement);

fs.writeFileSync('src/components/Footer.tsx', content);
