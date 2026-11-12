import React from 'react';
import { motion } from 'framer-motion';

export interface CalcInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  unit?: string;
  placeholder?: string;
  delay?: number;
}

export function CalcInput({ 
  label, 
  value, 
  onChange, 
  unit, 
  placeholder, 
  className = '', 
  delay = 0,
  ...props 
}: CalcInputProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut", delay }}
      className={`flex flex-col gap-1.5 ${className}`}
    >
      <label className="text-txt-secondary dark:text-txt-tertiary text-xs font-black uppercase tracking-[0.2em] mb-1">
        {label}
      </label>
      <div className="relative flex items-center">
        <><label htmlFor="a11y-input-581" className="sr-only">{label}</label>
        <input id="a11y-input-581"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full bg-surface-hover/80 dark:bg-ink/50 border border-ui-borderSubtle dark:border-ink-600 rounded-xl py-3 px-4 min-h-[48px] text-txt-primary dark:text-white font-bold text-sm placeholder:text-txt-tertiary dark:placeholder:text-txt-tertiary focus:outline-none focus:border-accent-800 focus:ring-4 focus:ring-accent-500/10 transition-all ${
            unit ? 'pr-16' : ''
          }`}
          inputMode={props.type === 'number' ? 'decimal' : props.inputMode}
          {...props}
        /></>
        {unit && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-accent-800 dark:text-accent-400 text-xs font-black uppercase tracking-wider bg-accent-50 dark:bg-accent-900/30 px-2 py-1 rounded-lg select-none pointer-events-none border border-accent-100 dark:border-accent-800/50">
            {unit}
          </span>
        )}
      </div>
    </motion.div>
  );
}
