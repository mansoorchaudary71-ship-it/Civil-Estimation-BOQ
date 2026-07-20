const fs = require('fs');
const file = 'src/components/Dashboard.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = '<div className="relative w-full flex flex-col font-sans bg-[#f8f9fa] text-slate-900 border-none">';
const replacement = `
  <RecentSidebar isOpen={isRecentOpen} onClose={() => setIsRecentOpen(false)} onNavigate={handleSelect} />
  
  <button 
    onClick={() => setIsRecentOpen(true)}
    className="fixed right-6 bottom-6 z-50 flex items-center justify-center w-14 h-14 bg-indigo-600 text-white rounded-full shadow-2xl hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all focus:outline-none focus:ring-4 focus:ring-indigo-500/30 group"
    title="Calculation History"
  >
    <History className="w-6 h-6 group-hover:-rotate-12 transition-transform" />
    <span className="absolute -top-1 -right-1 flex h-4 w-4">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
      <span className="relative inline-flex rounded-full h-4 w-4 bg-indigo-500 border-2 border-white"></span>
    </span>
  </button>
<div className="relative w-full flex flex-col font-sans bg-[#f8f9fa] text-slate-900 border-none">
`;

if (!content.includes('<RecentSidebar isOpen={isRecentOpen}')) {
    content = content.replace(target, replacement);
    fs.writeFileSync(file, content);
    console.log('Fixed Dashboard return');
} else {
    console.log('Already fixed Dashboard return');
}

