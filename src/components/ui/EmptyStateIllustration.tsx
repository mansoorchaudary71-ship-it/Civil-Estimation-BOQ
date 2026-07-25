import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateIllustrationProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export default function EmptyStateIllustration({
  icon: Icon,
  title,
  description,
  action
}: EmptyStateIllustrationProps) {
  return (
    <div className="w-full bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-8 md:p-12 flex flex-col items-center justify-center text-center shadow-sm">
      <div className="w-16 h-16 md:w-20 md:h-20 bg-white dark:bg-slate-800 rounded-2xl md:rounded-[1.5rem] flex items-center justify-center mb-5 text-slate-400 dark:text-slate-500 shadow-sm border border-slate-100 dark:border-slate-700">
        <Icon className="w-8 h-8 md:w-10 md:h-10" />
      </div>
      <h4 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white mb-2">
        {title}
      </h4>
      <p className="max-w-xs md:max-w-sm text-sm md:text-base text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
        {description}
      </p>
      {action && (
        <div className="mt-2">
          {action}
        </div>
      )}
    </div>
  );
}
