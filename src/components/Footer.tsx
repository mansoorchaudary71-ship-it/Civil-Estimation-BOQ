import React, { useState, useEffect } from 'react';
import { MessageSquare, Code, Briefcase, MailPlus, ShieldCheck, Users, Mail, ArrowRight } from 'lucide-react';
import { ModuleId } from './Dashboard';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';


const SOCIAL_LINKS = [
  {
    name: 'LinkedIn',
    href: '#',
    icon: (
      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    )
  },
  {
    name: 'Twitter',
    href: '#',
    icon: (
      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
      </svg>
    )
  },
  {
    name: 'Contact',
    href: 'mailto:support@civilestimation.pro',
    icon: <MessageSquare className="w-4 h-4" />
  }
];

export default function Footer({ activeModule, onNavigate }: { activeModule?: ModuleId, onNavigate?: (id: ModuleId) => void }) {
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await fetch('/api/updates/count');
        if (!res.ok) {
          return;
        }
        const text = await res.text();
        if (!text) return;
        const data = JSON.parse(text);
        if (data.success && typeof data.count === 'number') {
          setSubscriberCount(data.count);
        }
      } catch (err) {
        // Silently ignore fetch errors in environments without the backend
      }
    };
    fetchCount();
  }, []);

  const handleSubscribe = async () => {
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    setIsSubscribing(true);
    try {
      const response = await fetch('/api/updates/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const text = await response.text();
      let data = {};
      if (text) {
        try {
          data = JSON.parse(text);
        } catch(e) {
          console.error("Invalid JSON from newsletter subscribe", text);
        }
      }
      
      if (response.ok && (data as any).success) {
        toast.success(`Subscribed successfully with ${email}`, {
          style: {
            borderRadius: '12px',
            background: '#1e293b',
            color: '#fff',
            fontSize: '14px',
            padding: '12px 16px',
          },
          iconTheme: {
            primary: '#10b981',
            secondary: '#fff',
          },
        });
        setEmail("");
        setSubscriberCount(prev => (prev !== null ? prev + 1 : 1));
      } else {
        throw new Error((data as any).error || 'Failed to subscribe');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred. Please try again.');
    } finally {
      setIsSubscribing(false);
    }
  };

  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
  };


  return (
    <footer className="relative bg-[#051120] border-t border-blue-900/50 pt-24 pb-12 overflow-hidden font-sans">
      {/* Animated Background Lines */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ x: [0, -1000], opacity: [0.3, 0.5, 0.3] }}
          transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
          className="absolute top-0 left-0 w-[200%] h-[1px] bg-gradient-to-r from-transparent via-blue-400/30 to-transparent"
        />
        <motion.div 
          animate={{ y: [0, 1000], opacity: [0.1, 0.3, 0.1] }}
          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
          className="absolute top-0 left-1/3 w-[1px] h-[200%] bg-gradient-to-b from-transparent via-blue-400/20 to-transparent"
        />
         <motion.div 
          animate={{ y: [-1000, 0], opacity: [0.1, 0.3, 0.1] }}
          transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
          className="absolute top-0 right-1/4 w-[1px] h-[200%] bg-gradient-to-b from-transparent via-[#d4af37]/20 to-transparent"
        />
      </div>
      
      {/* Glow Effects */}
      <div className="absolute -top-[200px] left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
        <motion.div 
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
                        className={`text-[15px] font-medium transition-all duration-300 flex items-center gap-2 group ${activeModule === id ? 'text-[#d4af37] underline decoration-2 underline-offset-4' : 'text-blue-100/70 hover:text-white hover:underline decoration-2 hover:underline-offset-4'}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full bg-[#d4af37] opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 ${activeModule === id ? 'opacity-100 translate-x-0' : ''}`}></span>
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
                        className={`text-[15px] font-medium transition-all duration-300 flex items-center gap-2 group ${activeModule === id ? 'text-blue-400 underline decoration-2 underline-offset-4' : 'text-blue-100/70 hover:text-white hover:underline decoration-2 hover:underline-offset-4'}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full bg-blue-400 opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 ${activeModule === id ? 'opacity-100 translate-x-0' : ''}`}></span>
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
        {/* Bottom Bar */}
        <motion.div 
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-20 pt-8 border-t border-blue-400/10 flex flex-col md:flex-row items-center justify-between gap-6 relative"
        >
          {/* Subtle animated line on top of border */}
          <motion.div 
            className="absolute top-0 left-1/4 h-[1px] bg-gradient-to-r from-transparent via-[#d4af37] to-transparent w-1/2"
            animate={{ opacity: [0, 1, 0], left: ['0%', '50%', '100%'] }}
            transition={{ duration: 3, ease: "easeInOut", repeat: Infinity, repeatDelay: 5 }}
          />

          <p className="text-blue-100/50 text-[14px] font-medium">
            © {new Date().getFullYear()} Civil Estimation Pro. All rights reserved.
          </p>
          
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
            <span className="text-blue-100/60 text-[13px] font-semibold tracking-wide">SYSTEMS OPERATIONAL</span>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
