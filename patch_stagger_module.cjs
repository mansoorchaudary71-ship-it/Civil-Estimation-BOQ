const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// replace the AnimatePresence inner motion.div
code = code.replace(
  /<motion\.div\s*key=\{activeModule\}\s*layoutId=\{activeLayoutId \|\| `module-\$\{activeModule\}`\}\s*initial=\{\{ opacity: 0, y: 15 \}\}\s*animate=\{\{ opacity: 1, y: 0 \}\}\s*exit=\{\{ opacity: 0, y: -15 \}\}\s*transition=\{\{ duration: 0\.3, ease: "easeInOut" \}\}\s*className="flex-1 flex flex-col relative w-full"\s*>/m,
  `<motion.div
                              key={activeModule}
                              layoutId={activeLayoutId || \`module-\${activeModule}\`}
                              initial="hidden"
                              animate="show"
                              exit="exit"
                              variants={{
                                hidden: { opacity: 0, y: 15 },
                                show: { 
                                  opacity: 1, 
                                  y: 0, 
                                  transition: { 
                                    duration: 0.3, 
                                    ease: "easeInOut",
                                    staggerChildren: 0.15 
                                  } 
                                },
                                exit: { 
                                  opacity: 0, 
                                  y: -15, 
                                  transition: { duration: 0.3, ease: "easeInOut" } 
                                }
                              }}
                              className="flex-1 flex flex-col relative w-full"
                            >`
);

// replace the wrapper inside
code = code.replace(
  /<div ref=\{scrollRef\} className="flex-1 flex flex-col relative w-full overflow-visible">/m,
  `<motion.div ref={scrollRef} className="flex-1 flex flex-col relative w-full overflow-visible" variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}>`
);
code = code.replace(
  /<div className="flex flex-col relative w-full">/m,
  `<motion.div className="flex flex-col relative w-full" variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } }}>`
);

// close tags
code = code.replace(
  /<Footer activeModule=\{activeModule\} onNavigate=\{handleSelectModule\} \/>\s*<\/div>\s*<\/div>/m,
  `<Footer activeModule={activeModule} onNavigate={handleSelectModule} />
                                  </motion.div>
                                </motion.div>`
);

// replace for non-listed modules
code = code.replace(
  /<div className="flex-1 flex flex-col relative w-full bg-transparent">\s*<div className="w-full flex-1 flex flex-col">\s*<div className="global-form-card-wrapper w-full flex-1">\s*\{renderModule\(activeModule, handleSelectModule\)\}\s*<\/div>\s*<\/div>\s*<\/div>/m,
  `<motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } }} className="flex-1 flex flex-col relative w-full bg-transparent">
                                  <div className="w-full flex-1 flex flex-col">
                                    <div className="global-form-card-wrapper w-full flex-1">
                                      {renderModule(activeModule, handleSelectModule)}
                                    </div>
                                  </div>
                                </motion.div>`
);

fs.writeFileSync('src/App.tsx', code);
