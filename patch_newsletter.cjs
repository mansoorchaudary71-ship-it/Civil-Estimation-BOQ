const fs = require('fs');
const file = 'src/components/Footer.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldNewsletter = `<div className="relative group mt-2">
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
              </div>`;

const newNewsletter = `<div className="relative group mt-2">
                <label className="text-[11px] font-bold tracking-[0.2em] uppercase text-blue-200/50 mb-3 block pl-2">
                  Professional Updates
                </label>
                <div className="relative flex items-center gap-3 bg-[#0A1A2F]/50 hover:bg-[#0A1A2F]/80 focus-within:bg-[#0A1A2F] border border-blue-400/10 focus-within:border-blue-400/30 rounded-full py-1.5 pl-4 pr-1.5 transition-all duration-400 shadow-inner">
                  <div className="text-blue-200/40 group-focus-within:text-[#d4af37] transition-colors duration-300">
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
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSubscribe} 
                    disabled={isSubscribing || !email}
                    className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-300 hover:bg-[#d4af37] hover:text-[#051120] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300 shrink-0"
                  >
                    {isSubscribing ? (
                      <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <ArrowRight className="w-4 h-4" />
                    )}
                  </motion.button>
                </div>
              </div>`;

content = content.replace(oldNewsletter, newNewsletter);
fs.writeFileSync(file, content);
console.log('Newsletter patched');
