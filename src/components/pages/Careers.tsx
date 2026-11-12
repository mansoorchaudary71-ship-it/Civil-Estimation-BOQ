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
        <div className="inline-flex items-center justify-center p-4 bg-accent-50 dark:bg-accent-900/20 rounded-2xl mb-2 shadow-[0_8px_16px_-6px_rgba(168,85,247,0.2)] overflow-hidden">
          <Briefcase className="w-8 h-8 text-accent-700 dark:text-accent-400" strokeWidth={1.5} />
        </div>
        <h1 className="text-2xl md:text-xl font-semibold text-txt-primary dark:text-white tracking-tight">
          Join Our Team
        </h1>
        <p className="w-full text-lg text-txt-tertiary dark:text-txt-tertiary md:max-w-2xl md:mx-auto px-4 md:px-0">
          Help us build the software that's literally building the world. We are always looking for passionate engineers, designers, and innovators.
        </p>
      </div>

      {/* Empty State */}
      <div className="bg-bg-card rounded-2xl p-10 md:p-16 border border-ui-borderSubtle dark:border-ink-600 shadow-brand-sm text-center relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-accent-500/20 rounded-full blur-3xl opacity-50 mix-blend-screen pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl opacity-50 mix-blend-screen pointer-events-none" />
        
        <div className="w-full relative z-10 md:max-w-xl md:mx-auto flex flex-col items-center px-4 md:px-0">
          <div className="w-20 h-20 bg-surface-default dark:bg-ink rounded-full flex items-center justify-center mb-6 border border-ui-borderSubtle dark:border-ink-600">
            <Sparkles className="w-8 h-8 text-txt-tertiary dark:text-txt-tertiary" strokeWidth={1.5} />
          </div>
          <h2 className="text-xl font-semibold text-txt-primary dark:text-white mb-4">
            We aren't actively hiring right now.
          </h2>
          <p className="text-lg text-txt-tertiary dark:text-txt-tertiary leading-relaxed mb-10">
            While we don't have any open positions at the moment, we're always excited to connect with talented individuals who share our vision. 
          </p>

          <div className="w-full bg-surface-default dark:bg-ink/50 rounded-2xl p-4 sm:p-4 sm:p-4 sm:p-8 border border-ui-borderSubtle dark:border-ink-600/50 flex flex-col items-center text-center shadow-inner overflow-hidden">
            <div className="w-12 h-12 bg-bg-card rounded-2xl flex items-center justify-center shadow-brand-sm border border-ui-borderSubtle dark:border-ink-600 mb-5 overflow-hidden">
              <Mail className="w-6 h-6 text-txt-secondary dark:text-txt-tertiary" strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-bold text-txt-primary dark:text-white mb-2">
              Send us your resume anyway!
            </h3>
            <p className="w-full text-txt-tertiary dark:text-txt-tertiary mb-6 text-sm md:max-w-sm md:mx-auto px-4 md:px-0">
              Drop us a line with your portfolio or CV, and we'll keep you in mind for future opportunities.
            </p>
            <a 
              href="mailto:careers@civilpro.com" 
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-ink border border-ink dark:bg-surface-default dark:border-white text-txt-primary dark:text-white font-bold rounded-xl hover:bg-ink dark:hover:bg-surface-hover transition-all shadow-brand-md hover:shadow-brand-lg w-full md:w-auto justify-center overflow-hidden"
            >
              careers@civilpro.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
