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
      <label className="text-[#94A3B8] text-xs font-medium uppercase tracking-wide">
        {label}
      </label>
      <div className="relative flex items-center">
        <><label htmlFor="a11y-input-581" className="sr-only">Input</label>
<input id="a11y-input-581"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.12)] rounded-lg py-3 px-4 min-h-[44px] text-[#F1F5F9] text-sm placeholder:text-[#475569] focus:outline-none focus:border-[#F59E0B] focus:ring-[3px] focus:ring-[rgba(245,158,11,0.15)] transition-all ${
            unit ? 'pr-16' : ''
          }`}
          inputMode={props.type === 'number' ? 'decimal' : props.inputMode}
          {...props}
        /></>
        {unit && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#F59E0B] text-xs font-semibold bg-[rgba(245,158,11,0.1)] px-2 py-1 rounded select-none pointer-events-none">
            {unit}
          </span>
        )}
      </div>
    </motion.div>
  );
}
