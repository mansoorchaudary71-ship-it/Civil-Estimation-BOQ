import { Button } from './/Button';
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
    <div className={`w-full flex-wrap gap-2 p-1.5 bg-surface-hover/70 dark:bg-ink/50 border border-ui-borderSubtle/60 dark:border-ink-600/50 rounded-2xl flex sm:inline-flex ${className}`}>
      {options.map((option) => {
        const isActive = activeId === option.id;
        return (
          <Button
            key={option.id}
            onClick={() => onChange(option.id)}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 min-w-[110px] ${
              isActive
                ? 'bg-bg-card text-accent-800 dark:text-accent-400 shadow-brand-sm ring-1 ring-border-color/80 dark:ring-ink-600 scale-[1.02] z-10'
                : 'text-txt-secondary dark:text-txt-secondary hover:text-txt-primary dark:hover:text-txt-primary hover:bg-surface-active/50 dark:hover:bg-ink-600/50'
            }`}
          >
            {option.icon && (
              <span className={`${isActive ? 'text-accent-800 dark:text-accent-400' : 'text-txt-secondary dark:text-txt-secondary'}`}>
                {option.icon}
              </span>
            )}
            <span className="truncate">{option.label}</span>
          </Button>
        );
      })}
    </div>
  );
}
