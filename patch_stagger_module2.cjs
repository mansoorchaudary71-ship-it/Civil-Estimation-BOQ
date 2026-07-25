const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const replacement = `                                <motion.div ref={scrollRef} className="flex-1 flex flex-col relative w-full overflow-visible" variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.15 } } }}>
                                  <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } }} className="flex flex-col relative w-full">
                                    {activeModule === "home" && <Dashboard previousModule={previousModule} onSelectModule={handleSelectModule}  onOpenSettings={() => setIsSettingsOpen(true)} onOpenAuth={() => setIsAuthOpen(true)} />}
                                    {activeModule === "my-estimates" && <RecentEstimates onSelectModule={handleSelectModule} />}
                                    {activeModule === "pricing" && <PricingPage />}
                                    {activeModule === "about" && <div className="p-8 pt-12"><AboutUs /></div>}
                                    {activeModule === "careers" && <div className="p-8 pt-12"><Careers /></div>}
                                    {activeModule === "contact" && <div className="p-8 pt-12"><Contact /></div>}
                                    {activeModule === "blog" && <div className="p-8 pt-12"><Blog /></div>}
                                    {activeModule === "privacy" && <LegalPages page="privacy" onNavigate={handleSelectModule} />}
                                    {activeModule === "terms" && <LegalPages page="terms" onNavigate={handleSelectModule} />}
                                    {activeModule === "cookies" && <LegalPages page="cookies" onNavigate={handleSelectModule} />}
                                  </motion.div>
                                  <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } }}>
                                    <Footer activeModule={activeModule} onNavigate={handleSelectModule} />
                                  </motion.div>
                                </motion.div>`;

// Need to match exactly what we output before.
code = code.replace(
  /<motion\.div ref=\{scrollRef\} className="flex-1 flex flex-col relative w-full overflow-visible" variants=\{\{ hidden: \{ opacity: 0 \}, show: \{ opacity: 1 \} \}\}>\s*<motion\.div className="flex flex-col relative w-full" variants=\{\{ hidden: \{ opacity: 0, y: 20 \}, show: \{ opacity: 1, y: 0, transition: \{ duration: 0\.4 \} \} \}\}>\s*\{activeModule === "home"[^]*?<Footer activeModule=\{activeModule\} onNavigate=\{handleSelectModule\} \/>\s*<\/motion\.div>\s*<\/motion\.div>/m,
  replacement
);

fs.writeFileSync('src/App.tsx', code);
