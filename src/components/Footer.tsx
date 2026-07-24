import React from 'react';
import { MessageSquare, Building2 } from 'lucide-react';
import NewsletterSignupCard from './NewsletterSignupCard';
import { ModuleId } from './Dashboard';

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
  return (
    <footer className="w-full bg-[#fcfcfc] dark:bg-[#0a0a0a] border-t border-gray-200/60 dark:border-white/5 pt-16 pb-8 md:pt-24 font-sans text-[#1a1a1a] dark:text-gray-100">
      <div className="w-full max-w-7xl mx-auto px-6 md:px-8">
        
        {/* Newsletter Section */}
        <div className="mb-16 md:mb-24">
          <NewsletterSignupCard />
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10 md:gap-8 mb-16">
          
          {/* Brand Column */}
          <div className="col-span-2 lg:col-span-2 flex flex-col pr-4 md:pr-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-[14px] bg-[#ff5722] flex items-center justify-center text-white shadow-md">
                <Building2 size={20} />
              </div>
              <span className="font-bold text-xl text-gray-900 dark:text-white tracking-tight">
                Civil Estimation <span className="text-[#ff5722]">Pro</span>
              </span>
            </div>
            <p className="text-[15px] text-gray-500 dark:text-gray-400 leading-relaxed mb-8 max-w-sm">
              Professional-grade quantity surveying and civil engineering estimation tools built for modern construction teams.
            </p>
            
            <div className="flex items-center gap-4">
              {SOCIAL_LINKS.map((link) => (
                <a 
                  key={link.name} 
                  href={link.href}
                  target={link.href.startsWith("mailto") ? "_self" : "_blank"}
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-gray-50 dark:bg-white/5 border border-gray-200/80 dark:border-white/10 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
                  aria-label={link.name}
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Tools */}
          <div className="flex flex-col">
            <h4 className="font-semibold text-[15px] text-gray-900 dark:text-white mb-6">Calculators</h4>
            <ul className="space-y-4 text-[14px] text-gray-500 dark:text-gray-400 font-medium">
              <li><a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Concrete Volume</a></li>
              <li><a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Steel Reinforcement</a></li>
              <li><a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Earthwork Cut/Fill</a></li>
              <li><a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Masonry Blocks</a></li>
              <li><a href="#" className="text-[#ff5722] hover:text-[#f4511e] transition-colors">View all tools &rarr;</a></li>
            </ul>
          </div>

          {/* Services */}
          <div className="flex flex-col">
            <h4 className="font-semibold text-[15px] text-gray-900 dark:text-white mb-6">Services</h4>
            <ul className="space-y-4 text-[14px] text-gray-500 dark:text-gray-400 font-medium">
              <li><a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Quantity Takeoff</a></li>
              <li><a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">BOQ Generation</a></li>
              <li><a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Cost Analysis</a></li>
              <li><a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Structural Design</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div className="flex flex-col">
            <h4 className="font-semibold text-[15px] text-gray-900 dark:text-white mb-6">Resources</h4>
            <ul className="space-y-4 text-[14px] text-gray-500 dark:text-gray-400 font-medium">
              <li><a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">API Reference</a></li>
              <li><a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Engineering Standards</a></li>
              <li><a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Help Center</a></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="w-full pt-8 border-t border-gray-200/80 dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-[13px] text-gray-500 dark:text-gray-400 font-medium">
          <p>© {new Date().getFullYear()} Civil Estimation Pro. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Cookie Policy</a>
          </div>
        </div>
        
      </div>
    </footer>
  );
}
