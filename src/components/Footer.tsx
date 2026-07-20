import React, { useState, useEffect } from 'react';
import { MessageSquare, Code, Briefcase, MailPlus, ShieldCheck, Users, Mail } from 'lucide-react';
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
    <footer className="relative bg-[#0A2540] border-t border-blue-400/20 pt-20 pb-8 overflow-hidden font-sans">
      <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent pointer-events-none"></div>
      
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {/* Brand & Newsletter - Span 5 */}
          <motion.div variants={itemVariants} className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 bg-[#d4af37] rounded-xl flex items-center justify-center shadow-md shadow-[#d4af37]/20">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold tracking-tight text-white">
                  Civil Estimation <span className="text-[#d4af37]">Pro</span>
                </span>
              </div>
              <p className="text-blue-100 text-[15px] leading-relaxed max-w-md mb-8 font-medium">
                Professional-grade engineering and estimation tools designed to streamline your structural, material, and earthwork calculations.
              </p>
            </div>
            
            <div className="bg-white/5 rounded-3xl p-1.5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-blue-400/30 flex items-center transition-all duration-500 focus-within:ring-4 focus-within:ring-[#d4af37]/30 focus-within:border-[#d4af37] focus-within:shadow-[0_8px_30px_rgb(99,102,241,0.1)] group max-w-md">
              <div className="pl-4 text-blue-100">
                <Mail className="w-5 h-5" />
              </div>
              <input
                type="email"
                placeholder="Join our newsletter..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border-none py-3 px-3 text-[15px] text-white placeholder-slate-400 focus:outline-none focus:ring-0"
              />
              <button 
                onClick={handleSubscribe} 
                disabled={isSubscribing}
                className="h-11 px-6 bg-[#d4af37] text-[#0A2540] hover:bg-white rounded-full transition-colors duration-300 text-[14px] font-semibold tracking-wide shrink-0 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubscribing ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  'Subscribe'
                )}
              </button>
            </div>
            {subscriberCount !== null && (
              <p className="text-[13px] text-blue-100 font-medium flex items-center gap-2 mt-4 ml-2">
                <Users className="w-4 h-4" /> {subscriberCount} professionals have already joined
              </p>
            )}
          </motion.div>
          
          {/* Links Grid - Span 7 */}
          <motion.div variants={itemVariants} className="lg:col-span-7 grid grid-cols-2 md:grid-cols-4 gap-8">
            {/* Tools */}
            <div className="flex flex-col gap-6">
              <h3 className="text-[14px] font-bold text-white tracking-wide">Tools</h3>
              <ul className="flex flex-col space-y-4">
                {[
                  { name: 'BOQ Generator', id: 'house' },
                  { name: 'Mix Design', id: 'concrete-advanced' },
                  { name: 'Steel Estimator', id: 'steel-estimator' },
                  { name: 'Earthwork', id: 'earthwork-advanced' }
                ].map((link) => (
                  <li key={link.id}>
                    <button 
                      onClick={() => onNavigate?.(link.id as ModuleId)}
                      className="text-[14px] font-medium text-blue-100 hover:text-[#d4af37] hover:translate-x-1 transition-all duration-300 ease-out flex items-center gap-1 group"
                    >
                      {link.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Company */}
            <div className="flex flex-col gap-6">
              <h3 className="text-[14px] font-bold text-white tracking-wide">Company</h3>
              <ul className="flex flex-col space-y-4">
                {['About Us', 'Careers', 'Contact', 'Blog'].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-[14px] font-medium text-blue-100 hover:text-[#d4af37] hover:translate-x-1 transition-all duration-300 ease-out inline-block">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Legal */}
            <div className="flex flex-col gap-6">
              <h3 className="text-[14px] font-bold text-white tracking-wide">Legal</h3>
              <ul className="flex flex-col space-y-4">
                {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-[14px] font-medium text-blue-100 hover:text-[#d4af37] hover:translate-x-1 transition-all duration-300 ease-out inline-block">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Resources */}
            <div className="flex flex-col gap-6">
              <h3 className="text-[14px] font-bold text-white tracking-wide">Resources</h3>
              <ul className="flex flex-col space-y-4">
                {['Embed Calculator', 'Link Exchange', 'APIs', 'Help Center'].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-[14px] font-medium text-blue-100 hover:text-[#d4af37] hover:translate-x-1 transition-all duration-300 ease-out inline-block">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </motion.div>
        
        {/* Bottom Bar */}
        <motion.div 
          className="mt-16 pt-8 border-t border-blue-400/20 flex flex-col md:flex-row items-center justify-between gap-6"
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="text-[14px] font-medium text-blue-100">
            © {new Date().getFullYear()} Civil Estimation Pro. All rights reserved.
          </div>
          
          <div className="flex items-center gap-4">
            {SOCIAL_LINKS.map((link) => (
              <a 
                key={link.name} 
                href={link.href} 
                aria-label={link.name} 
                className="w-10 h-10 rounded-full bg-white/5 border border-blue-400/30 text-blue-100 flex items-center justify-center hover:bg-slate-100 hover:text-[#d4af37] hover:border-[#d4af37] transition-all duration-300 hover:scale-110 active:scale-95 shadow-sm"
              >
                {link.icon}
              </a>
            ))}
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
