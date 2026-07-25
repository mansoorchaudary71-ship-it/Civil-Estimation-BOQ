const fs = require('fs');
let content = fs.readFileSync('src/components/boq/MasterBOQDrawer.tsx', 'utf8');

const EmptyIllustration = `
                <div className="text-center py-16 flex flex-col items-center justify-center">
                  <svg width="200" height="150" viewBox="0 0 200 150" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-6 opacity-80">
                    <rect x="40" y="25" width="120" height="100" rx="12" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="4" />
                    <rect x="55" y="45" width="40" height="8" rx="4" fill="#CBD5E1" />
                    <rect x="105" y="45" width="40" height="8" rx="4" fill="#CBD5E1" />
                    <rect x="55" y="65" width="90" height="4" rx="2" fill="#E2E8F0" />
                    <rect x="55" y="80" width="70" height="4" rx="2" fill="#E2E8F0" />
                    <rect x="55" y="95" width="80" height="4" rx="2" fill="#E2E8F0" />
                    <circle cx="100" cy="75" r="30" fill="#F97316" fillOpacity="0.1" />
                    <path d="M90 75 H110 M100 65 V85" stroke="#F97316" strokeWidth="3" strokeLinecap="round" />
                    <circle cx="140" cy="115" r="15" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="2" />
                    <circle cx="140" cy="115" r="3" fill="#94A3B8" />
                  </svg>
                  <p className="text-slate-500 font-medium text-lg mb-2">Your BOQ is empty</p>
                  <p className="text-slate-400 text-sm max-w-[250px]">Start adding items from the calculators to build your master bill of quantities.</p>
                </div>
`;

const oldEmpty = `<div className="text-center py-12 text-slate-400 font-medium">
                  Your BOQ is empty. Add items from the calculators.
                </div>`;

content = content.replace(oldEmpty, EmptyIllustration);

fs.writeFileSync('src/components/boq/MasterBOQDrawer.tsx', content);
