const fs = require('fs');
const file = '/app/applet/src/components/Footer.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldCoreLink = `                    <button 
                      onClick={() => onNavigate?.(id as ModuleId)}
                      className={\`text-[15px] font-medium transition-all duration-300 flex items-center gap-2 group \${activeModule === id ? 'text-[#d4af37]' : 'text-blue-100/70 hover:text-white'}\`}
                    >
                      <span className={\`w-1.5 h-1.5 rounded-full bg-[#d4af37] opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 \${activeModule === id ? 'opacity-100 translate-x-0' : ''}\`}></span>
                      {labels[id]}
                    </button>`;

const newCoreLink = `                    <button 
                      onClick={() => onNavigate?.(id as ModuleId)}
                      className={\`relative pb-1 overflow-hidden text-[15px] font-medium transition-all duration-300 flex items-center gap-2 group \${activeModule === id ? 'text-[#d4af37]' : 'text-blue-100/70 hover:text-white'}\`}
                    >
                      <span className={\`w-1.5 h-1.5 rounded-full bg-[#d4af37] opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 \${activeModule === id ? 'opacity-100 translate-x-0' : ''}\`}></span>
                      <span className="relative z-10">{labels[id]}</span>
                      <span className={\`absolute bottom-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-[#d4af37]/0 via-[#d4af37] to-[#d4af37]/0 -translate-x-[101%] group-hover:translate-x-0 transition-transform duration-500 ease-out \${activeModule === id ? 'translate-x-0' : ''}\`}></span>
                    </button>`;

const oldToolLink = `                    <button 
                      onClick={() => onNavigate?.(id as ModuleId)}
                      className={\`text-[15px] font-medium transition-all duration-300 flex items-center gap-2 group \${activeModule === id ? 'text-blue-400' : 'text-blue-100/70 hover:text-white'}\`}
                    >
                      <span className={\`w-1.5 h-1.5 rounded-full bg-blue-400 opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 \${activeModule === id ? 'opacity-100 translate-x-0' : ''}\`}></span>
                      {labels[id]}
                    </button>`;

const newToolLink = `                    <button 
                      onClick={() => onNavigate?.(id as ModuleId)}
                      className={\`relative pb-1 overflow-hidden text-[15px] font-medium transition-all duration-300 flex items-center gap-2 group \${activeModule === id ? 'text-blue-400' : 'text-blue-100/70 hover:text-white'}\`}
                    >
                      <span className={\`w-1.5 h-1.5 rounded-full bg-blue-400 opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 \${activeModule === id ? 'opacity-100 translate-x-0' : ''}\`}></span>
                      <span className="relative z-10">{labels[id]}</span>
                      <span className={\`absolute bottom-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-blue-400/0 via-blue-400 to-blue-400/0 -translate-x-[101%] group-hover:translate-x-0 transition-transform duration-500 ease-out \${activeModule === id ? 'translate-x-0' : ''}\`}></span>
                    </button>`;

const oldLegalLinks = `            <div className="space-y-4 pt-4 border-t border-blue-400/10">
              <a href="#" className="flex items-center gap-3 text-[14px] text-blue-100/60 hover:text-white transition-colors group">
                <ShieldCheck className="w-4 h-4 group-hover:text-[#d4af37] transition-colors" />
                Privacy Policy & Terms
              </a>
              <a href="#" className="flex items-center gap-3 text-[14px] text-blue-100/60 hover:text-white transition-colors group">
                <Code className="w-4 h-4 group-hover:text-blue-400 transition-colors" />
                API Documentation
              </a>
            </div>`;

const newLegalLinks = `            <div className="space-y-4 pt-4 border-t border-blue-400/10 flex flex-col items-start">
              <a href="#" className="relative pb-1 overflow-hidden flex items-center gap-3 text-[14px] text-blue-100/60 hover:text-white transition-colors group">
                <ShieldCheck className="w-4 h-4 group-hover:text-[#d4af37] transition-colors relative z-10" />
                <span className="relative z-10">Privacy Policy & Terms</span>
                <span className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-[#d4af37]/0 via-[#d4af37] to-[#d4af37]/0 -translate-x-[101%] group-hover:translate-x-0 transition-transform duration-500 ease-out"></span>
              </a>
              <a href="#" className="relative pb-1 overflow-hidden flex items-center gap-3 text-[14px] text-blue-100/60 hover:text-white transition-colors group">
                <Code className="w-4 h-4 group-hover:text-blue-400 transition-colors relative z-10" />
                <span className="relative z-10">API Documentation</span>
                <span className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-blue-400/0 via-blue-400 to-blue-400/0 -translate-x-[101%] group-hover:translate-x-0 transition-transform duration-500 ease-out"></span>
              </a>
            </div>`;

content = content.replace(oldCoreLink, newCoreLink);
content = content.replace(oldToolLink, newToolLink);
content = content.replace(oldLegalLinks, newLegalLinks);

fs.writeFileSync(file, content);
console.log('Successfully updated Footer.tsx');
