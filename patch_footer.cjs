const fs = require('fs');
const file = 'src/components/Footer.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldImports = `import { MessageSquare, Code, Briefcase, MailPlus, ShieldCheck, Users, Mail } from 'lucide-react';`;
const newImports = `import { MessageSquare, Code, Briefcase, MailPlus, ShieldCheck, Users, Mail, ArrowRight } from 'lucide-react';`;

content = content.replace(oldImports, newImports);

const oldSubscribe = `<div className="relative max-w-md mt-4">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#d4af37]/30 to-blue-500/30 rounded-[32px] blur-md opacity-0 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-[#0A1A2F]/80 backdrop-blur-xl rounded-[32px] p-1.5 shadow-2xl border border-blue-400/20 flex items-center transition-all duration-500 focus-within:border-[#d4af37]/50 focus-within:shadow-[0_0_30px_rgba(212,175,55,0.15)] group">
                <div className="pl-5 text-blue-300 group-focus-within:text-[#d4af37] transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  placeholder="Enter email for professional updates..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent border-none py-3 px-4 text-[15px] text-white placeholder-blue-200/50 focus:outline-none focus:ring-0"
                />
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubscribe} 
                  disabled={isSubscribing}
                  className="h-12 px-7 bg-gradient-to-r from-[#d4af37] to-[#b38f26] text-[#051120] hover:shadow-lg hover:shadow-[#d4af37]/30 rounded-full transition-all duration-300 text-[14px] font-bold tracking-wide shrink-0 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center relative overflow-hidden"
                >
                  {isSubscribing ? (
                    <span className="w-5 h-5 border-2 border-[#051120]/30 border-t-[#051120] rounded-full animate-spin"></span>
                  ) : (
                    <>
                      <span className="relative z-10">Subscribe</span>
                      <div className="absolute inset-0 bg-white/20 w-full h-full -translate-x-full hover:translate-x-full transition-transform duration-700 ease-in-out"></div>
                    </>
                  )}
                </motion.button>
              </div>
              {subscriberCount !== null && (
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[13px] text-blue-200/70 font-medium flex items-center gap-2 mt-4 ml-4"
                >
                  <Users className="w-4 h-4 text-[#d4af37]" /> {subscriberCount.toLocaleString()} engineering professionals joined
                </motion.p>
              )}
            </div>`;

const newSubscribe = `<div className="relative max-w-md mt-6">
              <div className="relative group">
                <label className="text-[11px] font-bold tracking-[0.2em] uppercase text-blue-200/50 mb-3 block">
                  Professional Updates
                </label>
                <div className="relative flex items-end gap-4 border-b border-blue-400/20 pb-3 focus-within:border-[#d4af37] transition-colors duration-500">
                  <div className="text-blue-200/40 group-focus-within:text-[#d4af37] transition-colors pb-1">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    placeholder="Your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent border-none p-0 text-[16px] text-white placeholder-blue-200/30 focus:outline-none focus:ring-0 font-medium"
                  />
                  <motion.button 
                    whileHover={{ x: 5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSubscribe} 
                    disabled={isSubscribing || !email}
                    className="text-[#d4af37] hover:text-white transition-colors duration-300 pb-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-semibold text-[14px]"
                  >
                    {isSubscribing ? (
                      <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <>
                        <span>Join</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
              {subscriberCount !== null && (
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[12px] text-blue-200/50 font-medium flex items-center gap-2 mt-4"
                >
                  <Users className="w-3.5 h-3.5" /> {subscriberCount.toLocaleString()} professionals joined
                </motion.p>
              )}
            </div>`;

content = content.replace(oldSubscribe, newSubscribe);
fs.writeFileSync(file, content);
console.log('patched');
