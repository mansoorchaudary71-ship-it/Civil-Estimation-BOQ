import React from 'react';
import { Calculator } from 'lucide-react';

export interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
}

export function EmptyState({
  title = "Ready for Calculation",
  message = "Enter dimensions to generate an estimate",
  icon = <Calculator className="w-12 h-12 text-txt-tertiary dark:text-txt-secondary" />
}: EmptyStateProps) {
  return (
    <div className="w-full flex justify-center items-center p-5 sm:p-8 md:p-12 border-2 border-dashed border-ui-borderSubtle dark:border-ink-600 rounded-2xl bg-surface-hover/50 dark:bg-ink/20 text-center animate-in fade-in duration-500 min-h-[300px] overflow-hidden">
      <div className="flex flex-col items-center max-w-sm">
        <div className="mb-4 bg-bg-card p-4 sm:p-6 rounded-full shadow-brand-sm ring-1 ring-border-color dark:ring-ink-600">
          {icon}
        </div>
        <h3 className="text-lg font-bold text-txt-primary dark:text-txt-primary mb-2">
          {title}
        </h3>
        <p className="text-sm font-medium text-txt-tertiary dark:text-txt-tertiary">
          {message}
        </p>
      </div>
    </div>
  );
}
