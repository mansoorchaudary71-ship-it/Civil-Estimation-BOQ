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
    <div className="w-full bg-surface-hover/50 dark:bg-ink/50 border border-ui-borderSubtle dark:border-ink rounded-2xl p-8 md:p-12 flex flex-col items-center justify-center text-center shadow-brand-sm">
      <div className="w-16 h-16 md:w-20 md:h-20 bg-surface-default dark:bg-ink rounded-2xl md:rounded-[1.5rem] flex items-center justify-center mb-5 text-txt-tertiary dark:text-txt-tertiary shadow-brand-sm border border-border-color dark:border-ink-600">
        <Icon className="w-8 h-8 md:w-10 md:h-10" />
      </div>
      <h4 className="text-lg md:text-xl font-bold text-txt-primary dark:text-white mb-2">
        {title}
      </h4>
      <p className="max-w-xs md:max-w-sm text-sm md:text-base text-txt-tertiary dark:text-txt-tertiary leading-relaxed mb-6">
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
