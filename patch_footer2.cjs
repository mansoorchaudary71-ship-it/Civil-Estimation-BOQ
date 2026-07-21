const fs = require('fs');
const file = 'src/components/Footer.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /<motion\.div\s+className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-12 relative"[\s\S]*?(?=\{\/\* Bottom Bar \*\/)/;

const newSection = `<motion.div 
          className="relative"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {/* Brand Row */}
          <motion.div variants={itemVariants} className="mb-16">
            <motion.div 
              whileHover={{ scale: 1.01 }}
              className="flex items-center gap-3 mb-6 cursor-pointer group w-fit"
              onClick={() => onNavigate?.('house')}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-[#d4af37] to-[#b38f26] rounded-2xl flex items-center justify-center shadow-lg shadow-[#d4af37]/20 group-hover:shadow-[#d4af37]/40 transition-shadow duration-500 relative overflow-hidden">
                <div className="absolute inset-0 bg-white/20 w-full h-full -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></div>
                <Briefcase className="w-6 h-6 text-white relative z-10" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-blue-200 transition-all duration-300">
                Civil Estimation <span className="text-[#d4af37]">Pro</span>
              </span>
            </motion.div>
            <p className="text-blue-100/80 text-[16px] leading-relaxed max-w-2xl font-medium">
              The ultimate precision engineering and estimation ecosystem designed to accelerate structural and material workflows.
            </p>
          </motion.div>

          {/* 4-Column Grid */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 relative">
            
            {/* Column 1: Links */}
            <div>
              <h4 className="text-white font-bold mb-8 text-[15px] uppercase tracking-widest flex items-center gap-3">
                <span className="w-8 h-[2px] bg-gradient-to-r from-[#d4af37] to-transparent"></span>
                Links
              </h4>
              <ul className="space-y-4">
                {['house', 'boq', 'settings', 'rates'].map((id) => {
                  const labels: any = { house: 'Dashboard', boq: 'BOQ Generator', settings: 'Settings', rates: 'Rate Analysis' };
                  return (
                    <li key={id}>
                      <button 
                        onClick={() => onNavigate?.(id as ModuleId)}
                        className={\`text-[15px] font-medium transition-all duration-300 flex items-center gap-2 group \${activeModule === id ? 'text-[#d4af37] underline decoration-2 underline-offset-4' : 'text-blue-100/70 hover:text-white hover:underline decoration-2 hover:underline-offset-4'}\`}
                      >
                        <span className={\`w-1.5 h-1.5 rounded-full bg-[#d4af37] opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 \${activeModule === id ? 'opacity-100 translate-x-0' : ''}\`}></span>
                        <span className="relative z-10">{labels[id]}</span>                    
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Column 2: Resources */}
            <div>
              <h4 className="text-white font-bold mb-8 text-[15px] uppercase tracking-widest flex items-center gap-3">
                <span className="w-8 h-[2px] bg-gradient-to-r from-blue-400 to-transparent"></span>
                Resources
              </h4>
              <ul className="space-y-4">
                {['volume', 'beam', 'slab', 'steel'].map((id) => {
                  const labels: any = { volume: 'Volume Check', beam: 'Beam Design', slab: 'Slab Tools', steel: 'Steel Weight' };
                  return (
                    <li key={id}>
                      <button 
                        onClick={() => onNavigate?.(id as ModuleId)}
                        className={\`text-[15px] font-medium transition-all duration-300 flex items-center gap-2 group \${activeModule === id ? 'text-blue-400 underline decoration-2 underline-offset-4' : 'text-blue-100/70 hover:text-white hover:underline decoration-2 hover:underline-offset-4'}\`}
                      >
                        <span className={\`w-1.5 h-1.5 rounded-full bg-blue-400 opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 \${activeModule === id ? 'opacity-100 translate-x-0' : ''}\`}></span>
                        <span className="relative z-10">{labels[id]}</span>                    
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Column 3: Legal */}
            <div>
              <h4 className="text-white font-bold mb-8 text-[15px] uppercase tracking-widest flex items-center gap-3">
                <span className="w-8 h-[2px] bg-gradient-to-r from-slate-400 to-transparent"></span>
                Legal
              </h4>
              <div className="space-y-4 flex flex-col items-start">
                <a href="#" className="flex items-center gap-3 text-[14px] text-blue-100/60 hover:text-white hover:underline decoration-2 hover:underline-offset-4 transition-colors group">
                  <ShieldCheck className="w-4 h-4 group-hover:text-[#d4af37] transition-colors relative z-10" />
                  <span className="relative z-10">Privacy Policy</span>                
                </a>
                <a href="#" className="flex items-center gap-3 text-[14px] text-blue-100/60 hover:text-white hover:underline decoration-2 hover:underline-offset-4 transition-colors group">
                  <ShieldCheck className="w-4 h-4 group-hover:text-[#d4af37] transition-colors relative z-10" />
                  <span className="relative z-10">Terms of Service</span>                
                </a>
                <a href="#" className="flex items-center gap-3 text-[14px] text-blue-100/60 hover:text-white hover:underline decoration-2 hover:underline-offset-4 transition-colors group">
                  <Code className="w-4 h-4 group-hover:text-blue-400 transition-colors relative z-10" />
                  <span className="relative z-10">API Documentation</span>                
                </a>
              </div>
            </div>

            {/* Column 4: Contact */}
            <div>
              <h4 className="text-white font-bold mb-8 text-[15px] uppercase tracking-widest flex items-center gap-3">
                <span className="w-8 h-[2px] bg-gradient-to-r from-emerald-400 to-transparent"></span>
                Contact
              </h4>
              
              <div className="flex gap-4 mb-8">
                {SOCIAL_LINKS.map((link) => (
                  <motion.a 
                    key={link.name}
                    whileHover={{ y: -5, scale: 1.15, rotate: link.name === 'LinkedIn' ? -5 : link.name === 'Twitter' ? 5 : 0 }}
                    whileTap={{ scale: 0.95 }}
                    href={link.href}
                    title={link.name}
                    className="w-10 h-10 rounded-full bg-[#0A1A2F] border border-blue-400/20 flex items-center justify-center text-blue-300 hover:bg-[#d4af37] hover:text-[#051120] hover:border-transparent transition-all duration-300 hover:shadow-[0_0_15px_rgba(212,175,55,0.4)]"
                  >
                    {link.icon}
                  </motion.a>
                ))}
              </div>
              
              <div className="relative group mt-2">
                <label className="text-[11px] font-bold tracking-[0.2em] uppercase text-blue-200/50 mb-3 block">
                  Professional Updates
                </label>
                <div className="relative flex items-end gap-3 border-b border-blue-400/20 pb-3 focus-within:border-[#d4af37] transition-colors duration-500">
                  <div className="text-blue-200/40 group-focus-within:text-[#d4af37] transition-colors pb-1">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    placeholder="Your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent border-none p-0 text-[14px] text-white placeholder-blue-200/30 focus:outline-none focus:ring-0 font-medium"
                  />
                  <motion.button 
                    whileHover={{ x: 5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSubscribe} 
                    disabled={isSubscribing || !email}
                    className="text-[#d4af37] hover:text-white transition-colors duration-300 pb-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 font-semibold text-[13px]"
                  >
                    {isSubscribing ? (
                      <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <>
                        <span>Join</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
              {subscriberCount !== null && (
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[11px] text-blue-200/50 font-medium flex items-center gap-2 mt-3"
                >
                  <Users className="w-3 h-3" /> {subscriberCount.toLocaleString()} professionals joined
                </motion.p>
              )}
            </div>
            
          </motion.div>
        </motion.div>
        `;

content = content.replace(regex, newSection);
fs.writeFileSync(file, content);
console.log('patched3');
