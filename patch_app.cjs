const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

const oldHandleSelect = `  const handleSelectModule = (id: ModuleId) => {
    setPreviousModule(activeModule);
    setActiveModule(id);
    setIsSidebarOpen(false);`;

const newHandleSelect = `  const [activeLayoutId, setActiveLayoutId] = useState<string | null>(null);

  const handleSelectModule = (id: ModuleId, layoutId?: string) => {
    setPreviousModule(activeModule);
    setActiveLayoutId(layoutId || \`module-\${id}\`);
    setActiveModule(id);
    setIsSidebarOpen(false);`;

content = content.replace(oldHandleSelect, newHandleSelect);

const oldAnimate = `<motion.div
                              key={activeModule}
                              layoutId={\`module-\${activeModule}\`}
                              initial={{ opacity: 0, y: 15 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -15 }}
                              transition={{ duration: 0.3, ease: "easeInOut" }}
                              className="flex-1 flex flex-col min-h-0 relative w-full h-full"
                            >`;

const newAnimate = `<motion.div
                              key={activeModule}
                              layoutId={activeLayoutId || \`module-\${activeModule}\`}
                              initial={{ opacity: 0, y: 15 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -15 }}
                              transition={{ duration: 0.3, ease: "easeInOut" }}
                              className="flex-1 flex flex-col min-h-0 relative w-full h-full"
                            >`;

content = content.replace(oldAnimate, newAnimate);

fs.writeFileSync('src/App.tsx', content);
console.log("Patched App.tsx for activeLayoutId");
