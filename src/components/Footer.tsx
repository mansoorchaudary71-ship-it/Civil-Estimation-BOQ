import React from 'react';
import { Building2, Globe, ArrowUp, Mail } from 'lucide-react';
import NewsletterSignupCard from './NewsletterSignupCard';
import { ModuleId } from './Dashboard';

const SOCIAL_LINKS = [
  { name: 'Twitter', href: '#', icon: <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.008 4.076H5.03z" /></svg> },
  { name: 'LinkedIn', href: '#', icon: <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" /></svg> },
  { name: 'GitHub', href: '#', icon: <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg> },
  { name: 'Contact', href: 'mailto:support@civilestimation.pro', icon: <Mail className="w-[18px] h-[18px]" /> }
];

export default function Footer({ activeModule, onNavigate }: { activeModule?: ModuleId, onNavigate?: (id: ModuleId) => void }) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative w-full bg-white dark:bg-[#030712] border-t border-slate-200/50 dark:border-slate-800/50 pt-24 pb-8 overflow-hidden mt-auto font-sans">
      {/* Premium Glow effect in the background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-px bg-gradient-to-r from-transparent via-orange-500/30 to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-orange-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative w-full max-w-[1200px] mx-auto px-6 lg:px-8">
        
        {/* Newsletter Section */}
        <div className="mb-24 relative z-10">
          <NewsletterSignupCard />
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-12 gap-x-8 gap-y-16 mb-20">
          
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-4 lg:col-span-4 flex flex-col pr-0 lg:pr-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-xl bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-slate-900 shadow-sm">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
                Civil Estimation
              </span>
            </div>
            <p className="text-[15px] text-slate-500 dark:text-slate-400 leading-relaxed mb-8 max-w-[320px]">
              The intelligent estimation engine for modern civil engineers. Instantly calculate quantities, automate pricing, and win more bids.
            </p>
            
            <div className="flex items-center gap-4">
              {SOCIAL_LINKS.map((link) => (
                <a 
                  key={link.name} 
                  href={link.href}
                  target={link.href.startsWith("mailto") ? "_self" : "_blank"}
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                  aria-label={link.name}
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Product */}
          <div className="col-span-1 lg:col-span-2">
            <h4 className="font-semibold text-sm text-slate-900 dark:text-white mb-6 tracking-wide">Product</h4>
            <ul className="space-y-4 text-[15px] text-slate-500 dark:text-slate-400">
              <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Roadmap</a></li>
              <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors inline-flex items-center gap-2">Changelog <span className="px-1.5 py-0.5 rounded-md text-[11px] font-bold bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400">New</span></a></li>
            </ul>
          </div>

          {/* Resources */}
          <div className="col-span-1 lg:col-span-2">
            <h4 className="font-semibold text-sm text-slate-900 dark:text-white mb-6 tracking-wide">Resources</h4>
            <ul className="space-y-4 text-[15px] text-slate-500 dark:text-slate-400">
              <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">API</a></li>
              <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Support</a></li>
              <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Blog</a></li>
            </ul>
          </div>

          {/* Company */}
          <div className="col-span-1 lg:col-span-2">
            <h4 className="font-semibold text-sm text-slate-900 dark:text-white mb-6 tracking-wide">Company</h4>
            <ul className="space-y-4 text-[15px] text-slate-500 dark:text-slate-400">
              <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="col-span-1 lg:col-span-2">
            <h4 className="font-semibold text-sm text-slate-900 dark:text-white mb-6 tracking-wide">Legal</h4>
            <ul className="space-y-4 text-[15px] text-slate-500 dark:text-slate-400">
              <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Terms</a></li>
              <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Cookies</a></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="w-full pt-8 border-t border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center gap-3 order-2 md:order-1 group">
            <Globe className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
            <select className="bg-transparent border-none text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-sm focus:ring-0 cursor-pointer outline-none transition-colors appearance-none pr-4 relative">
              <option value="en">English (US)</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="es">Español</option>
            </select>
          </div>

          <p className="text-sm text-slate-500 dark:text-slate-400 order-3 md:order-2">
            © {new Date().getFullYear()} Civil Estimation Pro. All rights reserved.
          </p>

          <button 
            onClick={scrollToTop}
            className="order-1 md:order-3 flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors group"
          >
            Back to top
            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center group-hover:bg-slate-200 dark:group-hover:bg-slate-800 transition-colors">
              <ArrowUp className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </button>
        </div>

      </div>
    </footer>
  );
}
