const fs = require('fs');
const content = `import React, { ButtonHTMLAttributes, forwardRef, useState, useEffect } from 'react';
import { Loader2, Check } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'premium';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  isSuccess?: boolean;
  loadingText?: string;
  successText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      isSuccess = false,
      loadingText = "Processing...",
      successText = "Success!",
      leftIcon,
      rightIcon,
      fullWidth = false,
      children,
      disabled,
      onClick,
      ...props
    },
    ref
  ) => {
    const [coords, setCoords] = useState({ x: -1, y: -1 });
    const [isRippling, setIsRippling] = useState(false);

    useEffect(() => {
      if (coords.x !== -1 && coords.y !== -1) {
        setIsRippling(true);
        const timeout = setTimeout(() => setIsRippling(false), 600);
        return () => clearTimeout(timeout);
      }
    }, [coords]);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      setCoords({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      if (onClick) {
        onClick(e);
      }
    };

    const baseStyles = "relative overflow-hidden inline-flex items-center justify-center font-semibold rounded-[14px] transition-all duration-300 ease-out transform-gpu active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";
    
    // Standardise sizes for mobile-friendly tap targets (min 44px for standard)
    const sizeStyles = {
      sm: "min-h-[40px] px-4 text-sm gap-1.5",
      md: "min-h-[48px] px-6 text-base gap-2",
      lg: "min-h-[56px] px-8 text-lg gap-2",
      xl: "min-h-[64px] px-10 text-xl gap-2.5"
    };

    const variantStyles = {
      primary: "bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-500 dark:hover:bg-indigo-400 shadow-[0_4px_14px_rgba(79,70,229,0.25)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.3)] hover:-translate-y-0.5",
      secondary: "bg-slate-100 hover:bg-slate-200 text-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white shadow-sm hover:shadow-md hover:-translate-y-0.5",
      outline: "bg-transparent border-2 border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600 text-slate-700 dark:text-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:bg-slate-50 dark:hover:bg-slate-800/50",
      ghost: "bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900 dark:hover:bg-slate-800 dark:text-slate-400 dark:hover:text-slate-100",
      danger: "bg-rose-600 hover:bg-rose-700 text-white shadow-[0_4px_14px_rgba(225,29,72,0.25)] hover:shadow-[0_6px_20px_rgba(225,29,72,0.3)] hover:-translate-y-0.5",
      premium: "bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white shadow-[0_4px_14px_rgba(99,102,241,0.25)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.3)] hover:-translate-y-1 border-none",
    };

    const widthStyles = fullWidth ? "w-full" : "";
    const stateStyles = (disabled || isLoading) ? "opacity-60 cursor-not-allowed transform-none hover:shadow-none hover:-translate-y-0 active:scale-100" : "cursor-pointer";

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading || isSuccess}
        onClick={handleClick}
        className={cn(baseStyles, sizeStyles[size], variantStyles[variant], widthStyles, stateStyles, className)}
        {...props}
      >
        {variant === 'premium' && !disabled && !isLoading && !isSuccess && (
           <div className="absolute inset-0 -translate-x-full hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
        )}
        <span className="relative z-10 flex items-center justify-center gap-2">
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin shrink-0" />
          ) : isSuccess ? (
            <Check className="w-5 h-5 animate-in zoom-in spin-in-12 duration-300 ease-out transform-gpu shrink-0" />
          ) : leftIcon && (
             <span className="shrink-0">{leftIcon}</span>
          )}
          
          {(isLoading || isSuccess) ? (
             <span>{isLoading ? loadingText : isSuccess ? successText : children}</span>
          ) : (
             <span>{children}</span>
          )}
          
          {!isLoading && !isSuccess && rightIcon && (
             <span className="shrink-0">{rightIcon}</span>
          )}
        </span>
        {isRippling && !disabled && !isLoading && !isSuccess && (
          <span
            className="absolute bg-white/30 rounded-full animate-[ripple_0.6s_ease-out]"
            style={{
              left: coords.x,
              top: coords.y,
              transform: 'translate(-50%, -50%) scale(0)',
              width: 150,
              height: 150,
            }}
          />
        )}
      </button>
    );
  }
);
Button.displayName = 'Button';
export { Button };
`;

fs.writeFileSync('src/components/ui/Button.tsx', content);
