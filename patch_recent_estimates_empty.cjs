const fs = require('fs');
let content = fs.readFileSync('src/components/RecentEstimates.tsx', 'utf8');

const EmptyIllustration = `
<svg width="200" height="150" viewBox="0 0 200 150" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-6 opacity-80">
  <rect x="40" y="30" width="120" height="90" rx="12" fill="#E2E8F0" />
  <rect x="55" y="45" width="60" height="8" rx="4" fill="#CBD5E1" />
  <rect x="55" y="65" width="90" height="6" rx="3" fill="#F1F5F9" />
  <rect x="55" y="85" width="70" height="6" rx="3" fill="#F1F5F9" />
  <path d="M125 75C125 88.8071 113.807 100 100 100C86.1929 100 75 88.8071 75 75C75 61.1929 86.1929 50 100 50C113.807 50 125 61.1929 125 75Z" fill="#3B82F6" fillOpacity="0.1"/>
  <circle cx="100" cy="75" r="20" stroke="#3B82F6" strokeWidth="4" />
  <line x1="114" y1="89" x2="134" y2="109" stroke="#3B82F6" strokeWidth="6" strokeLinecap="round" />
  <circle cx="130" cy="115" r="6" fill="#60A5FA" />
  <circle cx="60" cy="115" r="4" fill="#94A3B8" />
  <circle cx="45" cy="15" r="8" fill="#CBD5E1" />
</svg>
`;

const oldEmpty = `<div className="w-full w-16 h-16 bg-white rounded-[24px] flex items-center justify-center mb-4 text-slate-700 shadow-inner overflow-hidden">
            <FolderOpen className="w-8 h-8" />
          </div>`;

content = content.replace(oldEmpty, EmptyIllustration);

fs.writeFileSync('src/components/RecentEstimates.tsx', content);
