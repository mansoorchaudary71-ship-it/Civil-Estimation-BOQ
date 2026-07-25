const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /<motion\.main[^>]*id="main-content"[\s\S]*?>/m,
  `<motion.main 
                      id="main-content" 
                      initial="hidden"
                      animate="show"
                      variants={{
                        hidden: { opacity: 0 },
                        show: {
                          opacity: 1,
                          transition: { staggerChildren: 0.15, delayChildren: 0.1 }
                        }
                      }}
                      className="flex-1 flex flex-col bg-transparent relative w-full transition-all duration-300"
                    >`
);

code = code.replace(
  /<div className="w-full flex-1 flex flex-col relative transition-all duration-300">/,
  `<motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } } }} className="w-full flex-1 flex flex-col relative transition-all duration-300">`
);

code = code.replace(
  /<\/main>/, // wait, it was changed to </motion.main>
  `</motion.main>`
);

code = code.replace(
  /<\/div>\s*<\/div>\s*<\/motion\.main>/,
  `</motion.div>\n                    </motion.main>`
);

// We should also replace the inner div
code = code.replace(
  /<div className="flex-1 flex flex-col relative w-full transition-colors duration-300 md:bg-white\/50 dark:md:bg-slate-900\/50 md:backdrop-blur-sm">/,
  `<motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } } }} className="flex-1 flex flex-col relative w-full transition-colors duration-300 md:bg-white/50 dark:md:bg-slate-900/50 md:backdrop-blur-sm">`
);

code = code.replace(
  /<\/AnimatePresence>\s*<\/div>/,
  `</AnimatePresence>\n                        </motion.div>`
);

fs.writeFileSync('src/App.tsx', code);
