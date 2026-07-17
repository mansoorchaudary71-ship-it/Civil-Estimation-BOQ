import React, { useState, useEffect } from 'react';
import { MessageSquare, Code, Briefcase, MailPlus, ShieldCheck, Users, Mail } from 'lucide-react';
import { ModuleId } from './Dashboard';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

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

  return (
    <motion.footer 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full overflow-hidden shrink-0 z-20 bg-gradient-to-b from-white to-slate-50 text-slate-600 pt-10 pb-12 px-6 border-t border-slate-200 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)]" 
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <div className="relative z-10 w-full md:max-w-7xl md:mx-auto flex flex-col gap-16 px-4 md:px-0">
        
        {/* Top Section: Brand & Newsletter */}
        <div className="flex flex-col lg:flex-row justify-between gap-12 lg:gap-8 items-start">
          
          {/* Brand & Market */}
          <div className="flex flex-col gap-6 max-w-md">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl tracking-tight text-slate-900 font-bold">
                Civil Estimation <span className="text-indigo-700">Pro</span>
              </h2>
            </div>
            <p className="text-[15px] font-medium leading-relaxed text-slate-500">
              Generate highly accurate engineering estimates in seconds. The complete toolkit for civil engineers driving standard workflows.
            </p>
            
            {/* Regions & Standards Card */}
            <div className="w-full mt-2 p-5 rounded-2xl bg-white/60 backdrop-blur-md border border-slate-200 shadow-sm overflow-hidden">
              <h3 className="text-[12px] uppercase tracking-widest font-bold text-slate-900 mb-4">Supported Regions & Standards</h3>
              
              <div className="flex flex-col gap-4">
                {/* Markets Row */}
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { name: 'Pakistan', flag: '🇵🇰' },
                    { name: 'India', flag: '🇮🇳' },
                    { name: 'UAE', flag: '🇦🇪' },
                    { name: 'Global', flag: '🌍' }
                  ].map(market => (
                    <span key={market.name} className="px-3 py-1.5 rounded-full bg-white/70 backdrop-blur-md border border-white/20 shadow-sm text-slate-700 font-medium flex items-center gap-1.5 hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 text-[13px] cursor-default overflow-hidden">
                      <span>{market.flag}</span>
                      {market.name}
                    </span>
                  ))}
                </div>

                {/* Compliance Badges */}
                <div className="flex flex-wrap gap-2">
                  {["IS Codes", "MORTH/IRC", "NBC", "RERA"].map(badge => (
                    <span key={badge} className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 font-medium flex items-center gap-1.5 hover:-translate-y-0.5 hover:bg-slate-200 transition-all duration-300 text-[12px] cursor-default uppercase tracking-wider">
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-700" />
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Newsletter Embedded Section */}
          <div className="flex flex-col gap-4 w-full lg:w-auto lg:min-w-[400px]">
            <h3 className="flex items-center gap-2 text-base font-bold text-slate-900">
              <MailPlus className="w-5 h-5 text-indigo-700" /> Stay Updated
            </h3>
            <p className="text-[14px] text-slate-500 flex items-center gap-2">
              Join our newsletter for new estimation tools and market updates.
              {subscriberCount !== null && (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[12px] font-medium border border-slate-200">
                  <Users className="w-3 h-3" />
                  {subscriberCount} joined
                </span>
              )}
            </p>
            <div className="flex flex-col sm:flex-row w-full gap-3 mt-1">
              <><label htmlFor="a11y-input-5" className="sr-only">Enter your professional email</label>
<input id="a11y-input-5" 
                type="email" 
                placeholder="Enter your professional email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full sm:flex-1 bg-white border border-slate-300 shadow-inner rounded-full py-3.5 px-5 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-[#FF5F15]/30 focus:border-[#FF5F15] transition-all duration-300 overflow-hidden"
              /></>
              <button onClick={handleSubscribe} 
                disabled={isSubscribing}
                className="px-8 py-3.5 bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-white rounded-full transition-all duration-300 shadow-lg hover:shadow-xl shadow-slate-900/20 hover:shadow-slate-900/30 text-[14px] font-semibold tracking-wide shrink-0 hover:-translate-y-0.5 active:scale-95 disabled:opacity-70 disabled:hover:-translate-y-0 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubscribing ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Subscribing...
                  </>
                ) : (
                  'Subscribe'
                )}
              </button>
            </div>
            <p className="text-[12px] text-slate-400 font-medium flex items-center gap-1.5 mt-2 ml-1">
              <ShieldCheck className="w-3.5 h-3.5" /> No spam. Unsubscribe anytime.
            </p>
          </div>
        </div>

        {/* Links Grid Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 pt-8 border-t border-slate-200">
          
          <div className="flex flex-col gap-4">
            <h3 className="text-[13px] uppercase tracking-widest font-bold text-slate-900">Tools</h3>
            <div className="flex flex-col space-y-3">
              {[
                { name: 'BOQ Generator', id: 'house' },
                { name: 'Concrete Mix Design', id: 'concrete-advanced' },
                { name: 'Steel Estimator', id: 'steel-estimator' },
                { name: 'Market Rates', id: 'rates' },
                { name: 'Earthwork', id: 'earthwork-advanced' }
              ].map((link) => (
                <button 
                  key={link.id} 
                  onClick={() => onNavigate?.(link.id as ModuleId)}
                  className="text-left text-[14px] font-medium text-slate-500 hover:text-indigo-700 transition-colors w-fit rounded-full"
                >
                  {link.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-[13px] uppercase tracking-widest font-bold text-slate-900">Company</h3>
            <div className="flex flex-col space-y-3">
              {['About Us', 'Careers', 'Contact', 'Blog'].map((link) => (
                <button key={link} className="text-left text-[14px] font-medium text-slate-500 hover:text-indigo-700 transition-colors w-fit rounded-full">
                  {link}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-[13px] uppercase tracking-widest font-bold text-slate-900">Legal</h3>
            <div className="flex flex-col space-y-3">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((link) => (
                <button key={link} className="text-left text-[14px] font-medium text-slate-500 hover:text-indigo-700 transition-colors w-fit rounded-full">
                  {link}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-[13px] uppercase tracking-widest font-bold text-slate-900">Resources</h3>
            <div className="flex flex-col space-y-3">
              {['Embed Calculator', 'Link Exchange', 'APIs'].map((link) => (
                <button key={link} className="text-left text-[14px] font-medium text-slate-500 hover:text-indigo-700 transition-colors w-fit rounded-full">
                  {link}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-8 text-center md:text-left">
             <p className="text-[14px] font-medium text-slate-500">
                © {new Date().getFullYear()} Civil Estimation Pro. All rights reserved.
             </p>
             <a href="mailto:support@civilestimation.pro" className="text-[14px] font-medium text-slate-500 hover:text-indigo-700 flex items-center gap-1.5 transition-colors">
                <Mail className="w-4 h-4" /> support@civilestimation.pro
             </a>
          </div>
          
          <div className="flex items-center gap-4 flex-wrap">
            <a href="#" aria-label="LinkedIn" className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-indigo-700 hover:border-slate-300 transition-all shadow-sm overflow-hidden">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
            <a href="#" aria-label="Twitter" className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-indigo-700 hover:border-slate-300 transition-all shadow-sm overflow-hidden">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
            </a>
            <a href="#" aria-label="Contact" className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-indigo-700 hover:border-slate-300 transition-all shadow-sm overflow-hidden">
              <MessageSquare className="w-4 h-4" />
            </a>
          </div>
        </div>

      </div>
    </motion.footer>
  );
}
