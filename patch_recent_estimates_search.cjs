const fs = require('fs');
let content = fs.readFileSync('src/components/RecentEstimates.tsx', 'utf8');

const EmptyIllustration = `
<svg width="200" height="150" viewBox="0 0 200 150" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-6 opacity-80">
  <rect x="50" y="20" width="100" height="110" rx="12" fill="#F1F5F9" />
  <rect x="65" y="40" width="70" height="8" rx="4" fill="#CBD5E1" />
  <rect x="65" y="60" width="50" height="6" rx="3" fill="#E2E8F0" />
  <rect x="65" y="80" width="60" height="6" rx="3" fill="#E2E8F0" />
  <rect x="65" y="100" width="40" height="6" rx="3" fill="#E2E8F0" />
  <circle cx="130" cy="110" r="25" fill="#3B82F6" fillOpacity="0.1" />
  <circle cx="130" cy="110" r="15" stroke="#3B82F6" strokeWidth="3" />
  <line x1="140" y1="120" x2="155" y2="135" stroke="#3B82F6" strokeWidth="4" strokeLinecap="round" />
  <path d="M70 120 L80 110 L90 120" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
</svg>
`;

const oldEmpty = `<div className="w-full w-16 h-16 bg-white rounded-[24px] flex items-center justify-center mb-4 text-slate-700 shadow-inner overflow-hidden">
                <Search className="w-8 h-8" />
              </div>`;

content = content.replace(oldEmpty, EmptyIllustration);

fs.writeFileSync('src/components/RecentEstimates.tsx', content);
