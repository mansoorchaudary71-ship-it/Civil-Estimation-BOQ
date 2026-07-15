import React from 'react';
import { BookOpen, Layers, Bot, FileText, ChevronRight, X } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { ALL_MODULES as ALL_TOOLS } from '../Dashboard';

export function HelpGuideModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { settings } = useSettings();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col relative max-h-[90vh]">
        
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-full transition-colors">
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 md:p-8 border-b border-[var(--border-color)]">
          <h2 className="text-2xl font-bold flex items-center gap-3 text-[var(--text-primary)]">
            <BookOpen className="w-6 h-6 text-blue-500" />
            Quick Help Guide
          </h2>
          <p className="text-slate-500 mt-2 text-sm">
            You are set up as a <strong>{settings.role || 'User'}</strong> using <strong>{settings.measurement === 'SI' ? 'Metric' : 'Imperial'}</strong> units and <strong>{settings.currency}</strong>.
          </p>
        </div>

        <div className="overflow-y-auto p-6 md:p-8 space-y-6">
          <div>
            <h3 className="font-semibold text-[var(--text-primary)] mb-3 uppercase tracking-wider text-xs">Core Features</h3>
            <div className="space-y-3">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 shrink-0">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-medium text-sm text-[var(--text-primary)]">30+ Estimation Tools</h4>
                  <p className="text-xs text-slate-500">Find them on the home dashboard categorised by trade.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-medium text-sm text-[var(--text-primary)]">AI Assistant</h4>
                  <p className="text-xs text-slate-500">Click the sparkle icon on the search bar to ask AI for guidance.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-medium text-sm text-[var(--text-primary)]">Export BOQ</h4>
                  <p className="text-xs text-slate-500">Every tool allows exporting material breakdowns to PDF or Excel.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-[var(--border-color)]">
            <h3 className="font-semibold text-sm text-[var(--text-primary)] mb-1">Your Progress</h3>
            <p className="text-xs text-slate-500 mb-2">You've explored {settings.usedTools?.length || 0} out of {ALL_TOOLS.length} tools.</p>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${Math.min(100, ((settings.usedTools?.length || 0) / ALL_TOOLS.length) * 100)}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
