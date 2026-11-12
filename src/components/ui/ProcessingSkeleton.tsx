import React from 'react';

export interface ProcessingSkeletonProps {
  count?: number;
}

export function ProcessingSkeleton({ count = 4 }: ProcessingSkeletonProps) {
  return (
    <div className="w-full animate-in fade-in duration-700 ease-in-out">
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-ink"></span>
        </div>
        <p className="text-sm font-semibold text-accent-800 dark:text-accent-400 animate-pulse">
          Computing results...
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: count }).map((_, index) => (
          <div 
            key={index} 
            className="p-5 rounded-2xl border border-ui-borderSubtle/70 dark:border-ink bg-surface-default/40 dark:bg-ink/40 flex flex-col h-full overflow-hidden animate-[pulse_2s_ease-in-out_infinite] min-h-[140px] shadow-brand-sm transform transition-all duration-500"
            style={{ animationDelay: `${index * 150}ms` }}
          >
            <div className="flex items-start justify-between gap-3 mb-6">
              <div className="h-4 bg-surface-active dark:bg-ink rounded-md w-1/2"></div>
              <div className="w-10 h-10 bg-surface-active dark:bg-ink rounded-xl flex-shrink-0"></div>
            </div>
            <div className="mt-auto">
              <div className="h-8 bg-surface-active dark:bg-ink rounded-lg w-2/3 mb-3"></div>
              <div className="h-3 bg-surface-active dark:bg-ink rounded-sm w-1/3"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
