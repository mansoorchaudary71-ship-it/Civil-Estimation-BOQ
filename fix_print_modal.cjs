const fs = require('fs');
const file = '/app/applet/src/components/ui/PrintPreviewModal.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add imports
if (!content.includes('import { motion, AnimatePresence }')) {
    content = content.replace('import { createPortal } from "react-dom";', 'import { createPortal } from "react-dom";\nimport { motion, AnimatePresence } from "framer-motion";');
}

// Remove early return
content = content.replace('if (!isOpen) return null;\n', '');

// Replace return statement
const oldReturn = `  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 sm:p-8 animate-in fade-in duration-200">
      <div className="bg-slate-100 dark:bg-slate-800 w-full max-w-5xl h-full max-h-[90vh] rounded-2xl sm:rounded-[32px] shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-200">`;

const newReturn = `  // Render null if not in browser to avoid SSR issues
  if (typeof window === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 sm:p-8"
        >
          <motion.div 
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            className="bg-slate-100 dark:bg-slate-800 w-full max-w-5xl h-full max-h-[90vh] rounded-2xl sm:rounded-[32px] shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-700 relative"
          >
            {/* Animated shimmer effect on modal load */}
            <motion.div
              initial={{ x: '-100%', opacity: 0 }}
              animate={{ x: '100%', opacity: [0, 0.5, 0] }}
              transition={{ duration: 1.5, ease: "easeInOut", delay: 0.3 }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none z-50"
            />
`;

content = content.replace(oldReturn, newReturn);

// Now we need to close the AnimatePresence at the end
// The end of the file looks like:
//         </div>
//       </div>
//     </div>,
//     document.body
//   );
// }

const oldEnd = `        </div>
      </div>
    </div>,
    document.body
  );
}`;

const newEnd = `        </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}`;

content = content.replace(oldEnd, newEnd);

// Also add a smooth fade to the paper iframe itself
const oldPaper = `<div className={\`w-full bg-white shadow-xl rounded-sm overflow-hidden shrink-0 transition-all duration-300 mx-auto \${orientation === 'portrait' ? 'max-w-[210mm] min-h-[297mm]' : 'max-w-[297mm] min-h-[210mm]'}\`}>`;
const newPaper = `<motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.4 }}
            className={\`w-full bg-white shadow-xl rounded-sm overflow-hidden shrink-0 transition-all duration-500 mx-auto \${orientation === 'portrait' ? 'max-w-[210mm] min-h-[297mm]' : 'max-w-[297mm] min-h-[210mm]'}\`}
          >`;
content = content.replace(oldPaper, newPaper);

const oldPaperEnd = `              title="Print Preview PDF"
            />
          </div>
        </div>`;
const newPaperEnd = `              title="Print Preview PDF"
            />
          </motion.div>
        </div>`;
content = content.replace(oldPaperEnd, newPaperEnd);


fs.writeFileSync(file, content);
console.log('Fixed PrintPreviewModal.tsx to use framer-motion');
