const fs = require('fs');
let content = fs.readFileSync('src/components/Footer.tsx', 'utf-8');

content = content.replace(
  `className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 relative"`,
  `className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-12 relative"`
);

const newColumn = `            {/* Column 3: Site Map */}
            <div>
              <h4 className="text-white font-bold mb-8 text-[15px] uppercase tracking-widest flex items-center gap-3">
                <span className="w-8 h-[2px] bg-gradient-to-r from-purple-400 to-transparent"></span>
                Site Map
              </h4>
              <ul className="space-y-4">
                {['my-estimates', 'blog', 'contact'].map((id) => {
                  const labels: any = { 'my-estimates': 'Recent Estimates', blog: 'Blog', contact: 'Contact' };
                  return (
                    <li key={id}>
                      <button 
                        onClick={() => onNavigate?.(id as ModuleId)}
                        className={\`text-[15px] font-medium transition-all duration-300 flex items-center gap-2 group \${activeModule === id ? 'text-purple-400 underline decoration-2 underline-offset-4' : 'text-blue-100/70 hover:text-white hover:translate-x-1'}\`}
                      >
                        <span className={\`w-1.5 h-1.5 rounded-full bg-purple-400 opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 \${activeModule === id ? 'opacity-100 translate-x-0' : ''}\`}></span>
                        <span className="relative z-10">{labels[id]}</span>                  
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
            
            {/* Column 4: Legal */}`;

content = content.replace(`{/* Column 3: Legal */}`, newColumn.replace('{/* Column 4: Legal */}', '{/* Column 4: Legal */}'));

// Rename remaining columns properly.
content = content.replace(`{/* Column 4: Legal */}`, `            {/* Column 4: Legal */}`);
content = content.replace(`{/* Column 4: Contact */}`, `{/* Column 5: Contact */}`);

fs.writeFileSync('src/components/Footer.tsx', content);
