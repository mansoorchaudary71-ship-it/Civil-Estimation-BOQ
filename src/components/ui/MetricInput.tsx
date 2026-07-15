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
          <label htmlFor={inputId} className="block text-base font-medium uppercase tracking-wider mb-1.5 ml-1">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            id={inputId}
            ref={ref}
            className={`w-full bg-slate-50/80 dark:bg-slate-800/80 border ${
              error 
                ? 'border-red-300 dark:border-red-500/50 focus:ring-red-500/50' 
                : 'border-slate-200 dark:border-slate-700/80 focus:ring-indigo-500/50 focus:border-indigo-500'
            } text-slate-800 dark:text-slate-100 rounded-xl px-4 py-3 min-h-[44px] ${
              unit ? 'pr-12' : ''
            } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all placeholder:text-slate-700 font-semibold text-sm ${className || ''}`}
            inputMode={props.type === 'number' ? 'decimal' : props.inputMode}
            {...props}
          />
          {unit && (
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <span className="text-slate-700 dark:text-slate-700 text-base font-medium select-none">{unit}</span>
            </div>
          )}
        </div>
        {error && <span className="text-sm font-medium text-red-500 mt-1.5 ml-1 block animate-in fade-in">{error}</span>}
      </motion.div>
    );
  }
);

MetricInput.displayName = 'MetricInput';
