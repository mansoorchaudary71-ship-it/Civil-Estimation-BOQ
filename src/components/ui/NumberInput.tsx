import React, { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { getImperialConversion } from '../../utils/autoConverter';
import { motion } from 'framer-motion';

const getGenericTooltip = (label: string): string | null => {
  if (!label) return null;
  const l = label.toLowerCase();
  
  if (l.includes("cover")) return "Clear cover to the reinforcement, typically 20-50mm depending on exposure.";
  if (l.includes("fck") || l.includes("concrete mix")) return "Characteristic compressive strength of concrete in MPa.";
  if (l.includes("fy") || l.includes("steel (fy)")) return "Yield strength of steel reinforcement in MPa.";
  if (l.includes("clear span")) return "Distance between inner faces of supports.";
  if (l.includes("effective span")) return "Center to center distance of supports or clear span plus effective depth.";
  if (l.includes("density")) return "Mass per unit volume (e.g., 2400-2500 kg/m³ for RCC).";
  if (l.includes("bar dia") || l.includes("diameter")) return "Diameter of reinforcement steel bars in mm.";
  if (l.includes("spacing")) return "Center to center distance between rebars or ties.";
  if (l.includes("mix ratio")) return "Ratio of Cement:Sand:Aggregate or mortar proportions.";
  if (l.includes("wastage")) return "Allowance percentage for material wasted during construction.";
  if (l.includes("surcharge")) return "Additional external load applied over the surface area.";
  if (l.includes("factored")) return "Design load multiplied by limit state safety factor.";
  if (l.includes("depth") || l.includes("height") || l.includes("width") || l.includes("length") || l.includes("area") || l.includes("thickness") || l.includes("rate") || l.includes("price") || l.includes("cost") || l.includes("time") || l.includes("volume") || l.includes("load") || l.includes("elevation") || l.includes("gradient") || l.includes("speed")) return `Specify the ${label.toLowerCase()} in the given unit.`;

  return `Enter required value for ${label}.`;
};

export interface NumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  label?: string;
  unit?: string;
  value: number | string;
  onChange: (value: number | "") => void;
  requirePositive?: boolean;
  error?: string;
  containerClassName?: string;
  step?: string | number;
  delay?: number;
  tooltip?: React.ReactNode;
}

export const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  ({ className, containerClassName = '', label, unit, value, onChange, requirePositive = false, error, id, onBlur, onFocus, step = "any", delay = 0, tooltip, ...props }, ref) => {
    const { settings } = useSettings();
    const isImperial = settings.measurement === 'FPS';
    const conversion = getImperialConversion(unit);
    const applyConversion = isImperial && conversion;

    const displayUnit = applyConversion ? conversion.targetUnit : unit;
    
    // Convert internal value -> display value
    const getDisplayValue = (val: number | string) => {
      if (val === "" || val === null || val === undefined) return "";
      const num = Number(val);
      if (isNaN(num)) return "";
      if (applyConversion) {
        return Number((num * conversion.multiplyBy).toFixed(4)).toString();
      }
      return num.toString();
    };

    const inputId = id || (label ? label.replace(/\s+/g, '-').toLowerCase() : undefined);
    
    const [localValue, setLocalValue] = useState<string>(getDisplayValue(value));
    const [internalError, setInternalError] = useState<string | null>(null);

    useEffect(() => {
      const parsedProp = (value === "" || value === null || value === undefined) ? NaN : Number(value);
      const expectedDisplay = getDisplayValue(value);
      
      if (value === "") {
         if (localValue !== "") setLocalValue("");
      } else if (!isNaN(parsedProp)) {
         const parsedLocal = parseFloat(localValue);
         let internalFromLocal = parsedLocal;
         if (applyConversion) internalFromLocal = parsedLocal / conversion.multiplyBy;

         if (Math.abs(internalFromLocal - parsedProp) > 0.0001) {
            setLocalValue(expectedDisplay);
         }
      }
    }, [value, settings.measurement]);

    const triggerChange = (newLocalValue: string, displayNumValue: number | typeof NaN) => {
      setLocalValue(newLocalValue);
      if (newLocalValue === "" || isNaN(displayNumValue)) {
        onChange("");
        if (requirePositive) {
          setInternalError("Required");
        } else {
          setInternalError(null);
        }
      } else {
        const internalNumValue = applyConversion ? (displayNumValue / conversion.multiplyBy) : displayNumValue;
        onChange(internalNumValue as any);
        
        if (requirePositive && (internalNumValue as number) <= 0) {
          setInternalError("> 0 required");
        } else {
          setInternalError(null);
        }
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;
      if (rawValue === "") {
        triggerChange("", NaN);
        return;
      }
      const numValue = parseFloat(rawValue);
      if (isNaN(numValue)) return;
      triggerChange(rawValue, numValue);
    };

    const handleIncrement = (amount: number) => {
      const current = parseFloat(localValue) || 0;
      const stepVal = step === "any" ? 1 : Number(step);
      const next = current + (amount * stepVal);
      if (requirePositive && next < 0) return;
      triggerChange(next.toString(), next);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (['e', 'E', '+'].includes(e.key)) {
        e.preventDefault();
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        handleIncrement(1);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        handleIncrement(-1);
      }
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      e.target.select();
      if (onFocus) onFocus(e);
    };

    const displayError = error || internalError;
    const displayTooltip = tooltip || getGenericTooltip(label || "");

    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay }}
        className={`w-full relative group/field ${containerClassName}`}
      >
        {label && (
          <label htmlFor={inputId} className="block text-[10px] sm:text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-[0.2em] mb-2.5 ml-1 cursor-help flex items-center gap-1.5 group-hover/field:text-indigo-600 dark:group-hover/field:text-indigo-400 transition-colors">
            {label}
          </label>
        )}
        
        <div className="relative flex items-center group/input">
          <input
            id={inputId}
            ref={ref}
            type="number"
            step={step}
            inputMode="decimal"
            value={localValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onBlur={onBlur}
            onFocus={handleFocus}
            aria-invalid={!!displayError}
            className={`w-full bg-slate-50/80 dark:bg-slate-800/50 border ${
              displayError 
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' 
                : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/10'
            } text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-2xl px-5 py-4 min-h-[56px] ${
              displayUnit ? 'pr-28' : 'pr-16'
            } focus:outline-none focus:ring-4 transition-all font-bold text-base shadow-sm group-hover/input:shadow-md ${className || ''}`}
            {...props}
          />

          <div className="absolute right-3 flex items-center gap-2">
            {displayUnit && (
              <span className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest select-none pr-3 border-r border-slate-200 dark:border-slate-700">
                {displayUnit}
              </span>
            )}
            <div className="flex flex-col -gap-1">
              <button 
                type="button" tabIndex={-1}
                className="p-1 text-slate-400 hover:text-indigo-600 transition-colors active:scale-90"
                onClick={() => handleIncrement(1)}
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button 
                type="button" tabIndex={-1}
                className="p-1 text-slate-400 hover:text-indigo-600 transition-colors active:scale-90"
                onClick={() => handleIncrement(-1)}
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {displayError && (
          <span className="text-[10px] font-bold text-red-500 mt-1.5 ml-2 block uppercase tracking-wider animate-in fade-in slide-in-from-top-1">
            {displayError}
          </span>
        )}
      </motion.div>
    );
  }
);

NumberInput.displayName = 'NumberInput';

