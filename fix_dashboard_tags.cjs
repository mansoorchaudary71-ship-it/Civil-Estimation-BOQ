const fs = require('fs');
const file = 'src/components/Dashboard.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/<button\s*onClick=\{\(\) => setIsRecentOpen\(true\)\}[\s\S]*?>[\s\S]*?<\/Button>/g,
'<Button onClick={() => setIsRecentOpen(true)} className="fixed right-6 bottom-6 z-50 !w-14 !h-14 !rounded-full !bg-indigo-600 !text-white shadow-2xl hover:!bg-indigo-700 hover:scale-105 active:scale-95 transition-all focus:outline-none focus:ring-4 focus:ring-indigo-500/30 group !p-0" title="Calculation History"><History className="w-6 h-6 group-hover:-rotate-12 transition-transform" /><span className="absolute -top-1 -right-1 flex h-4 w-4"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span><span className="relative inline-flex rounded-full h-4 w-4 bg-indigo-500 border-2 border-white"></span></span></Button>');

code = code.replace(/<button onClick=\{\(\) => setIsAiChatOpen\(false\)\}[\s\S]*?>[\s\S]*?<\/Button>/g,
'<Button variant="ghost" onClick={() => setIsAiChatOpen(false)} className="!w-10 !h-10 !rounded-full !p-0 bg-white/80 hover:bg-slate-100 text-slate-500 shadow-sm border border-slate-200/50"><X className="w-5 h-5" /></Button>');

code = code.replace(/<button/g, '<Button');
code = code.replace(/<\/button>/g, '</Button>');

fs.writeFileSync(file, code);
