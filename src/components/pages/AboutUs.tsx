import React from 'react';
import { Building2, Target, Zap, Users } from 'lucide-react';
import { SEO } from '../SEO';

export default function AboutUs() {
  return (
    <div className="w-full max-w-5xl mx-auto space-y-16 pb-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SEO 
        title="About Us | Civil Estimation Pro" 
        description="Our mission is to simplify civil engineering estimations with cutting-edge tools." 
      />

      {/* Hero Section */}
      <div className="text-center space-y-6 bg-white/50 dark:bg-slate-900/50 p-10 md:p-16 rounded-[3rem] border border-slate-200/50 dark:border-slate-800/50">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-blue-100/50 dark:bg-blue-900/30 text-indigo-600 dark:text-blue-400 mb-2 shadow-[0_8px_16px_-6px_rgba(37,99,235,0.2)] overflow-hidden">
          <Target className="w-8 h-8" strokeWidth={1.5} />
        </div>
        <h1 className="text-2xl md:text-2xl lg:text-6xl font-bold tracking-tight text-slate-900 dark:text-white tracking-tight leading-tight">
          Simplifying Civil <br className="hidden md:block"/> Engineering Estimations
        </h1>
        <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          We are on a mission to build the next generation of intuitive, fast, and precise estimation and takeoff tools for the modern construction professional.
        </p>
      </div>

      {/* Story / Background */}
      <div className="bg-bg-card rounded-[2.5rem] p-8 md:p-12 border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-16 opacity-5 pointer-events-none">
          <Building2 className="w-64 h-64 text-slate-900 dark:text-white" />
        </div>
        <div className="relative z-10 max-w-3xl">
          <h2 className="text-2xl md:text-xl font-bold text-slate-900 dark:text-white mb-6">Our Story</h2>
          <div className="space-y-6 text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            <p>
              It started with a simple observation: civil engineers, estimators, and contractors were spending entirely too much time on repetitive tasks, manual measurements, and complicated spreadsheets.
            </p>
            <p>
              Errors in quantity takeoffs and material estimations don't just cost time—they impact the bottom line of massive infrastructure projects. We realized the industry needed a digital platform that combined deep engineering logic with an incredibly fast, user-friendly interface.
            </p>
            <p>
              Today, Civil Estimation Pro bridges the gap between complex engineering calculations and intuitive software design, empowering teams to generate accurate estimates in minutes instead of hours.
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-gradient-to-b from-blue-50 to-white dark:from-blue-950/20 dark:to-slate-900 rounded-3xl p-6 md:p-8 text-center border border-blue-100 dark:border-blue-900/30 shadow-sm flex flex-col items-center justify-center transition-transform hover:-translate-y-1 duration-300 overflow-hidden">
          <div className="w-12 h-12 bg-bg-card rounded-2xl shadow-sm flex items-center justify-center mb-5 border border-blue-100 dark:border-slate-700 overflow-hidden">
            <Zap className="w-6 h-6 text-blue-500" />
          </div>
          <div className="text-xl font-semibold text-slate-900 dark:text-white mb-2">25+</div>
          <div className="text-sm md:text-base font-medium dark:text-slate-400 uppercase tracking-widest">Built-in Tools</div>
        </div>
        
        <div className="bg-gradient-to-b from-indigo-50 to-white dark:from-indigo-950/20 dark:to-slate-900 rounded-3xl p-6 md:p-8 text-center border border-indigo-100 dark:border-indigo-900/30 shadow-sm flex flex-col items-center justify-center transition-transform hover:-translate-y-1 duration-300 overflow-hidden">
          <div className="w-12 h-12 bg-bg-card rounded-2xl shadow-sm flex items-center justify-center mb-5 border border-indigo-100 dark:border-slate-700 overflow-hidden">
            <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          </div>
          <div className="text-xl font-semibold text-slate-900 dark:text-white mb-2">1000+</div>
          <div className="text-sm md:text-base font-medium dark:text-slate-400 uppercase tracking-widest">Estimates Gen.</div>
        </div>
        
        <div className="bg-gradient-to-b from-teal-50 to-white dark:from-teal-950/20 dark:to-slate-900 rounded-3xl p-6 md:p-8 text-center border border-teal-100 dark:border-teal-900/30 shadow-sm flex flex-col items-center justify-center transition-transform hover:-translate-y-1 duration-300 overflow-hidden">
          <div className="w-12 h-12 bg-bg-card rounded-2xl shadow-sm flex items-center justify-center mb-5 border border-teal-100 dark:border-slate-700 overflow-hidden">
            <Users className="w-6 h-6 text-teal-500" />
          </div>
          <div className="text-xl font-semibold text-slate-900 dark:text-white mb-2">500+</div>
          <div className="text-sm md:text-base font-medium dark:text-slate-400 uppercase tracking-widest">Engineers</div>
        </div>
        
        <div className="bg-gradient-to-b from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900 rounded-3xl p-6 md:p-8 text-center border border-slate-200 dark:border-slate-700/50 shadow-sm flex flex-col items-center justify-center transition-transform hover:-translate-y-1 duration-300 overflow-hidden">
          <div className="w-12 h-12 bg-bg-card rounded-2xl shadow-sm flex items-center justify-center mb-5 border border-slate-200 dark:border-slate-700 overflow-hidden">
            <svg className="w-6 h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          </div>
          <div className="text-xl font-semibold text-slate-900 dark:text-white mb-2">10x</div>
          <div className="text-sm md:text-base font-medium dark:text-slate-400 uppercase tracking-widest">Time Saved</div>
        </div>
      </div>
    </div>
  );
}
