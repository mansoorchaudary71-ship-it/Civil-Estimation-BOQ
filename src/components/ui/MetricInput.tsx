import React from 'react';
import { motion } from 'framer-motion';

export interface MetricInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  unit?: string;
  error?: string;
  containerClassName?: string;
  delay?: number;
}

export const MetricInput = React.forwardRef<HTMLInputElement, MetricInputProps>(
  ({ className, containerClassName = '', label, unit, error, id, delay = 0, ...props }, ref) => {
    const inputId = id || (label ? label.replace(/\s+/g, '-').toLowerCase() : undefined);
    
    return (
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut", delay }}
        className={`w-full ${containerClassName}`}
      >
        {label && (
          <label htmlFor={inputId} className="block text-xs sm:text-xs font-black text-txt-secondary dark:text-txt-tertiary uppercase tracking-[0.2em] mb-2 ml-1">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            id={inputId}
            ref={ref}
            className={`w-full bg-surface-default border ${
              error 
                ? 'border-ui-errorBorder dark:border-ui-errorText/50 focus:ring-ui-errorText/10' 
                : 'border-ui-borderSubtle dark:border-ink-600 focus:ring-accent-500/10 focus:border-accent-800'
            } text-txt-primary dark:text-white rounded-xl px-4 py-3 min-h-[48px] ${
              unit ? 'pr-12' : ''
            } focus:outline-none focus:ring-4 transition-all placeholder:text-txt-tertiary dark:placeholder:text-txt-tertiary font-bold text-sm ${className || ''}`}
            inputMode={props.type === 'number' ? 'decimal' : props.inputMode}
            {...props}
          />
          {unit && (
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <span className="text-txt-tertiary dark:text-txt-tertiary text-xs font-black uppercase tracking-wider select-none">{unit}</span>
            </div>
          )}
        </div>
        {error && <span className="text-sm font-medium text-ui-errorText mt-1.5 ml-1 block animate-in fade-in">{error}</span>}
      </motion.div>
    );
  }
);

MetricInput.displayName = 'MetricInput';
