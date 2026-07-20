const fs = require('fs');
const file = 'src/components/Dashboard.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add import for RecentSidebar
if (!content.includes('import RecentSidebar')) {
    content = content.replace('import { useRecentTools } from "../hooks/useRecentTools";', 'import { useRecentTools } from "../hooks/useRecentTools";\nimport RecentSidebar from "./RecentSidebar";');
}

// Add state
const statePattern = 'const [isAiChatOpen, setIsAiChatOpen] = useState(false);';
if (!content.includes('const [isRecentOpen, setIsRecentOpen]')) {
    content = content.replace(statePattern, statePattern + '\n const [isRecentOpen, setIsRecentOpen] = useState(false);');
}

// Add floating button and RecentSidebar
const returnPattern = '<div className="flex flex-col min-h-screen w-full relative overflow-x-hidden bg-[#F8F9FB]">';
const replacement = `
<div className="flex flex-col min-h-screen w-full relative overflow-x-hidden bg-[#F8F9FB]">
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
`;

if (!content.includes('<RecentSidebar')) {
    content = content.replace(returnPattern, replacement);
}

fs.writeFileSync(file, content);
console.log('Added RecentSidebar to Dashboard');
