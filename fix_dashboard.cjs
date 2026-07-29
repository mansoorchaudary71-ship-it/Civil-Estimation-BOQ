const fs = require('fs');

let content = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

// Replace history button
content = content.replace(
  /<Button onClick=\{\(\) => setIsRecentOpen\(true\)\} className="fixed right-6 bottom-6 z-50 !w-14 !h-14 !rounded-full !bg-indigo-600 !text-white shadow-2xl hover:!bg-indigo-700 hover:scale-105 active:scale-95 transition-all focus:outline-none focus:ring-4 focus:ring-indigo-500\/30 group !p-0" title="Calculation History">/g,
  `<button onClick={() => setIsRecentOpen(true)} className="fixed right-6 bottom-6 z-50 w-14 h-14 rounded-full bg-indigo-600 text-white shadow-2xl hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all focus:outline-none focus:ring-4 focus:ring-indigo-500/30 group p-0 flex items-center justify-center" title="Calculation History">`
);
content = content.replace(/<\/span><\/Button>/g, '</span></button>');

// Replace close button
content = content.replace(
  /<Button onClick=\{\(\) => setIsAiChatOpen\(false\)\} className="p-2.5 rounded-full bg-surface-default\/80 hover:bg-slate-100 text-txt-tertiary transition-all duration-300 active:scale-95 hover:-translate-y-0.5 shadow-sm border border-ui-borderSubtle\/50" >/g,
  `<button onClick={() => setIsAiChatOpen(false)} className="p-2.5 rounded-full bg-surface-default/80 hover:bg-slate-100 text-slate-500 transition-all duration-300 active:scale-95 hover:-translate-y-0.5 shadow-sm border border-ui-borderSubtle/50" >`
);
content = content.replace(/<X className="w-5 h-5" \/> <\/Button>/g, '<X className="w-5 h-5" /> </button>');

// Replace Ask button
content = content.replace(
  /<Button variant="premium" className="ml-2 !rounded-full !w-12 !h-12 !p-0" aria-label="Ask" rightIcon=\{<ArrowUpRight className="w-5 h-5 text-white" \/>\}/g,
  `<Button variant="premium" className="ml-2 rounded-full w-12 h-12 p-0 min-h-[48px] shrink-0" aria-label="Ask" rightIcon={<ArrowUpRight className="w-5 h-5 text-white" />}`
);

// We need to also clean up the second ArrowUpRight in the ask button since we use rightIcon? Actually, wait, let me check the existing string.
// Let's not touch the Ask button if it's already using variant="premium" - the only issue is `!rounded-full !w-12`. `Button` component accepts className which overrides things. But `!w-12 !h-12 !p-0` is okay.

fs.writeFileSync('src/components/Dashboard.tsx', content);

