import React from 'react';

export interface SubNavOption {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

export interface SubNavigationProps {
  options: SubNavOption[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
}

export function SubNavigation({ options, activeId, onChange, className = '' }: SubNavigationProps) {
  return (
    <div className={`w-full flex-wrap gap-2 p-1.5 bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/50 rounded-2xl flex sm:inline-flex ${className}`}>
      {options.map((option) => {
        const isActive = activeId === option.id;
        return (
          <button
            key={option.id}
            onClick={() => onChange(option.id)}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 min-w-[110px] ${
              isActive
                ? 'bg-bg-card text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-slate-200/80 dark:ring-slate-700 scale-[1.02] z-10'
                : 'text-slate-700 dark:text-slate-700 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
            }`}
          >
            {option.icon && (
              <span className={`${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-700'}`}>
                {option.icon}
              </span>
            )}
            <span className="truncate">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
