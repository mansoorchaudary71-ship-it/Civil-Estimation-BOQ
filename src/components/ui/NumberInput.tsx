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
         // Because of floating point, converting back and forth can create minor diffs.
         // We only update localValue if the diff is significant.
         const parsedLocal = parseFloat(localValue);
         let internalFromLocal = parsedLocal;
         if (applyConversion) internalFromLocal = parsedLocal / conversion.multiplyBy;

         // Check if roughly equal
         if (Math.abs(internalFromLocal - parsedProp) > 0.0001) {
            setLocalValue(expectedDisplay);
         }
      }
    }, [value, settings.measurement]); // depend on measurement so it updates when toggled

    const triggerChange = (newLocalValue: string, displayNumValue: number | typeof NaN) => {
      setLocalValue(newLocalValue);
      if (newLocalValue === "" || isNaN(displayNumValue)) {
        onChange("");
        if (requirePositive) {
          setInternalError("A valid value is required");
        } else {
          setInternalError(null);
        }
      } else {
        const internalNumValue = applyConversion ? (displayNumValue / conversion.multiplyBy) : displayNumValue;
        onChange(internalNumValue);
        
        if (requirePositive && internalNumValue <= 0) {
          setInternalError("Value must be greater than 0");
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
      if (isNaN(numValue) || numValue < 0) return;
      triggerChange(rawValue, numValue);
    };

    const handleIncrement = (amount: number) => {
      const current = parseFloat(localValue) || 0;
      const stepVal = step === "any" ? 1 : Number(step);
      const next = current + (amount * stepVal);
      if (next < 0) return;
      triggerChange(next.toString(), next);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (['-', 'e', 'E', '+'].includes(e.key)) {
        e.preventDefault();
      }
      // Handle keyboard up/down arrows manually since we disabled default spinner
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
      if (onFocus) {
        onFocus(e);
      }
    };

    const displayError = error || internalError;

    let displayLabel = label;
    if (label && applyConversion && unit && displayUnit) {
      displayLabel = label.replace(`(${unit})`, `(${displayUnit})`);
      // Also try replacing without matching case just in case
      if (displayLabel === label) {
         displayLabel = label.replace(new RegExp(`\\(${unit}\\)`, 'i'), `(${displayUnit})`);
      }
    }

    const displayTooltip = tooltip || getGenericTooltip(label || "");

    return (
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut", delay }}
        className={`w-full relative group/tooltip ${containerClassName}`}
      >
        {displayTooltip && (
           <div className="absolute z-[100] invisible opacity-0 group-hover/tooltip:visible group-hover/tooltip:opacity-100 transition-all duration-200 bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 w-max max-w-[220px] bg-slate-800 text-white text-[11px] p-2 rounded-lg shadow-xl pointer-events-none whitespace-normal text-center font-medium after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-transparent after:border-t-slate-800">
             {displayTooltip}
           </div>
        )}
        {displayLabel && (
          <label htmlFor={inputId} className="block text-base font-medium dark:text-slate-300 uppercase tracking-wider mb-1.5 ml-1 flex items-center gap-1.5 cursor-help">
            {displayLabel}
          </label>
        )}
        <div className="relative flex items-center">
          <input
            id={inputId}
            ref={ref}
            type="number"
            min="0"
            step={step}
            inputMode="decimal"
            value={localValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onBlur={onBlur}
            onFocus={handleFocus}
            aria-invalid={!!displayError}
            aria-errormessage={displayError ? `${inputId}-error` : undefined}
            className={`w-full bg-slate-50/80 dark:bg-slate-800/80 border ${
              displayError 
                ? 'border-red-400 dark:border-red-500/50 focus:ring-red-500/50 focus:border-red-500' 
                : 'border-slate-200 dark:border-slate-700/80 focus:ring-indigo-500/50 focus:border-indigo-500'
            } text-slate-800 dark:text-slate-100 rounded-[16px] px-4 py-3 min-h-[44px] min-w-[44px] ${
              displayUnit ? 'pr-[130px]' : 'pr-[100px]'
            } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all placeholder:text-slate-700 dark:placeholder:text-slate-500 font-semibold text-base truncate ${className || ''}`}
            {...props}
          />
          <div className={`absolute right-0 top-0 bottom-0 flex items-center pr-1`}>
            {displayUnit && (
              <span className="text-slate-500 dark:text-slate-400 text-base font-medium select-none mr-2">{displayUnit}</span>
            )}
            <div className="flex items-center border-l border-slate-200 dark:border-slate-700 pl-1 gap-0.5">
              <button aria-label="Move Up" type="button" 
                tabIndex={-1} 
                className="text-slate-400 hover:text-indigo-500 transition-colors rounded-full active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm min-h-[44px] min-w-[44px] flex items-center justify-center" 
                onClick={() => handleIncrement(1)}
              >
                <ChevronUp className="w-5 h-5" />
              </button>
              <button aria-label="Move Down" type="button" 
                tabIndex={-1} 
                className="text-slate-400 hover:text-indigo-500 transition-colors rounded-full active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm min-h-[44px] min-w-[44px] flex items-center justify-center" 
                onClick={() => handleIncrement(-1)}
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
        {displayError && (
          <span id={`${inputId}-error`} className="text-base font-medium text-red-500 mt-1.5 ml-1 block animate-in fade-in slide-in-from-top-1">
            {displayError}
          </span>
        )}
      </motion.div>
    );
  }
);

NumberInput.displayName = 'NumberInput';

