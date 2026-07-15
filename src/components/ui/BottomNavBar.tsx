import React from 'react';
import { Home, History, Save, Share2, Printer } from 'lucide-react';

interface BottomNavBarProps {
  onHome?: () => void;
  onHistory?: () => void;
  onSave?: () => void;
  onShare?: () => void;
  onPrint?: () => void;
}

export function BottomNavBar({ onHome, onHistory, onSave, onShare, onPrint }: BottomNavBarProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50 px-2 sm:px-6 pb-2 pt-2 sm:pb-safe flex items-center justify-between h-16 transition-colors"
      role="navigation"
      aria-label="Bottom Navigation Bar"
    >
      <div className="flex items-center justify-between w-full max-w-md mx-auto">
        <NavItem icon={<Home className="w-5 h-5" />} label="Home" onClick={onHome} />
        <NavItem icon={<History className="w-5 h-5" />} label="History" onClick={onHistory} />
        
        <div className="relative -top-5">
          <button
            onClick={onSave}
            className="flex items-center justify-center w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
            aria-label="Save Project"
            role="button"
          >
            <Save className="w-6 h-6" />
          </button>
        </div>

        <NavItem icon={<Share2 className="w-5 h-5" />} label="Share" onClick={onShare} />
        <NavItem icon={<Printer className="w-5 h-5" />} label="Print" onClick={onPrint} />
      </div>
    </nav>
  );
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

function NavItem({ icon, label, onClick }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center p-2 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500 rounded-xl transition-colors min-w-[64px]"
      aria-label={label}
      role="button"
    >
      {icon}
      <span className="text-[10px] font-medium mt-1">{label}</span>
    </button>
  );
}
