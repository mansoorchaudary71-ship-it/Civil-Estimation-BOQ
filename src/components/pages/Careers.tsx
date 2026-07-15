import React from 'react';
import { Briefcase, Mail, Sparkles } from 'lucide-react';
import { SEO } from '../SEO';

export default function Careers() {
  return (
    <div className="w-full md:max-w-4xl md:mx-auto space-y-12 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 px-4 md:px-0">
      <SEO 
        title="Careers | Civil Estimation Pro" 
        description="Join our team and help build the future of construction software." 
      />

      <div className="text-center space-y-6">
        <div className="inline-flex items-center justify-center p-4 bg-purple-50 dark:bg-purple-900/30 rounded-3xl mb-2 shadow-[0_8px_16px_-6px_rgba(168,85,247,0.2)] overflow-hidden">
          <Briefcase className="w-8 h-8 text-purple-600 dark:text-purple-400" strokeWidth={1.5} />
        </div>
        <h1 className="text-2xl md:text-xl font-semibold text-slate-900 dark:text-white tracking-tight">
          Join Our Team
        </h1>
        <p className="w-full text-lg text-slate-500 dark:text-slate-400 md:max-w-2xl md:mx-auto px-4 md:px-0">
          Help us build the software that's literally building the world. We are always looking for passionate engineers, designers, and innovators.
        </p>
      </div>

      {/* Empty State */}
      <div className="bg-bg-card rounded-[3rem] p-10 md:p-16 border border-slate-200 dark:border-slate-700 shadow-sm text-center relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl opacity-50 mix-blend-screen pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl opacity-50 mix-blend-screen pointer-events-none" />
        
        <div className="w-full relative z-10 md:max-w-xl md:mx-auto flex flex-col items-center px-4 md:px-0">
          <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 border border-slate-200 dark:border-slate-700">
            <Sparkles className="w-8 h-8 text-slate-400 dark:text-slate-500" strokeWidth={1.5} />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
            We aren't actively hiring right now.
          </h2>
          <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed mb-10">
            While we don't have any open positions at the moment, we're always excited to connect with talented individuals who share our vision. 
          </p>

          <div className="w-full bg-white dark:bg-slate-800/50 rounded-3xl p-4 sm:p-4 sm:p-4 sm:p-8 border border-slate-200 dark:border-slate-700/50 flex flex-col items-center text-center shadow-inner overflow-hidden">
            <div className="w-12 h-12 bg-bg-card rounded-2xl flex items-center justify-center shadow-sm border border-slate-200 dark:border-slate-700 mb-5 overflow-hidden">
              <Mail className="w-6 h-6 text-slate-600 dark:text-slate-400" strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Send us your resume anyway!
            </h3>
            <p className="w-full text-slate-500 dark:text-slate-400 mb-6 text-sm md:max-w-sm md:mx-auto px-4 md:px-0">
              Drop us a line with your portfolio or CV, and we'll keep you in mind for future opportunities.
            </p>
            <a 
              href="mailto:careers@civilpro.com" 
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-slate-900 border border-slate-800 dark:bg-white dark:border-white text-slate-900 dark:text-white font-bold rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-md hover:shadow-lg w-full md:w-auto justify-center overflow-hidden"
            >
              careers@civilpro.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
