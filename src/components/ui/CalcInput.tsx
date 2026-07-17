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
      <label className="text-slate-700 dark:text-slate-300 text-[10px] font-black uppercase tracking-[0.2em] mb-1">
        {label}
      </label>
      <div className="relative flex items-center">
        <><label htmlFor="a11y-input-581" className="sr-only">{label}</label>
        <input id="a11y-input-581"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 min-h-[48px] text-slate-900 dark:text-white font-bold text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all ${
            unit ? 'pr-16' : ''
          }`}
          inputMode={props.type === 'number' ? 'decimal' : props.inputMode}
          {...props}
        /></>
        {unit && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-700 dark:text-indigo-400 text-[10px] font-black uppercase tracking-wider bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-lg select-none pointer-events-none border border-indigo-100 dark:border-indigo-800/50">
            {unit}
          </span>
        )}
      </div>
    </motion.div>
  );
}
