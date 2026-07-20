const fs = require('fs');
const file = 'src/components/ui/GlobalSettingsToggle.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldGrid = `            <div className="grid grid-cols-3 gap-1.5">
              {[
                { val: "light", icon: <Sun className="w-4 h-4 mx-auto mb-1" />, label: "Light" },
                { val: "dark", icon: <Moon className="w-4 h-4 mx-auto mb-1" />, label: "Dark" },
                { val: "system", icon: <Monitor className="w-4 h-4 mx-auto mb-1" />, label: "Auto" }
              ].map(({ val, icon, label }) => {`;

const newGrid = `            <div className="grid grid-cols-3 gap-1.5 mb-2">
              {[
                { val: "light", icon: <Sun className="w-4 h-4 mx-auto mb-1" />, label: "Light" },
                { val: "dark", icon: <Moon className="w-4 h-4 mx-auto mb-1" />, label: "Dark" },
                { val: "system", icon: <Monitor className="w-4 h-4 mx-auto mb-1" />, label: "Auto" }
              ].map(({ val, icon, label }) => {`;

content = content.replace(oldGrid, newGrid);

const oldMapEnd = `                  </button>
                );
              })}
            </div>`;

const newMapEnd = `                  </button>
                );
              })}
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { val: "modern", icon: <div className="w-4 h-4 mx-auto mb-1 rounded bg-zinc-200 border border-zinc-400" />, label: "Modern" },
                { val: "engineering-blueprint", icon: <div className="w-4 h-4 mx-auto mb-1 rounded bg-blue-800 border border-blue-400" />, label: "Blueprint" },
                { val: "high-contrast", icon: <div className="w-4 h-4 mx-auto mb-1 rounded bg-black border border-yellow-400" />, label: "Contrast" }
              ].map(({ val, icon, label }) => {
                const isActive = settings.theme === val;
                return (
                  <button
                    key={val}
                    onClick={() => { updateSettings({ theme: val as Theme }); setIsOpen(false); }}
                    className={\`py-2 px-1 text-[10px] font-bold rounded-lg transition-colors flex flex-col items-center justify-center \${
                      isActive
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 ring-1 ring-amber-600/20 dark:ring-amber-500/20"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    }\`}
                  >
                    {icon}
                    {label}
                  </button>
                );
              })}
            </div>`;

content = content.replace(oldMapEnd, newMapEnd);

fs.writeFileSync(file, content);
console.log('Patched GlobalSettingsToggle');
