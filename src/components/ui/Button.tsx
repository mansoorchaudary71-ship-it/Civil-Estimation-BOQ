import React, { ButtonHTMLAttributes, forwardRef, useState, useEffect } from 'react';
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

    const baseStyles = "relative overflow-hidden inline-flex items-center justify-center font-bold rounded-2xl transition-all duration-200 ease-out transform-gpu active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";
    
    const sizeStyles = {
      sm: "h-10 px-5 text-sm",
      md: "h-12 px-6 text-base",
      lg: "h-14 px-8 text-lg",
      xl: "h-16 px-10 text-lg"
    };

    const variantStyles = {
      primary: "bg-primary-600 hover:bg-primary-700 text-white dark:bg-primary-500 dark:hover:bg-primary-400 shadow-sm hover:shadow-md hover:-translate-y-0.5",
      secondary: "bg-secondary-100 hover:bg-secondary-200 text-primary-800 dark:bg-secondary-800 dark:hover:bg-secondary-700 dark:text-white shadow-sm hover:-translate-y-0.5",
      outline: "bg-transparent border-2 border-ui-borderDefault hover:border-ui-borderStrong text-txt-primary shadow-sm hover:-translate-y-0.5",
      ghost: "bg-transparent hover:bg-surface-hover text-txt-secondary hover:text-txt-primary",
      danger: "bg-ui-error hover:bg-red-600 text-white shadow-sm hover:shadow-md hover:-translate-y-0.5",
      premium: "bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-400 hover:to-accent-500 text-white shadow-lg hover:shadow-xl hover:-translate-y-1 border-none transition-all",
    };

    const widthStyles = fullWidth ? "w-full" : "";
    const stateStyles = (disabled || isLoading) ? "opacity-70 cursor-not-allowed transform-none hover:shadow-none hover:-translate-y-0 active:scale-100" : "cursor-pointer";

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
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : isSuccess ? (
            <Check className="w-5 h-5 animate-in zoom-in spin-in-12 duration-300 ease-out transform-gpu" />
          ) : leftIcon}
          
          {(isLoading || isSuccess) ? (
             <span>{isLoading ? loadingText : isSuccess ? successText : children}</span>
          ) : (
             <span>{children}</span>
          )}
          
          {!isLoading && !isSuccess && rightIcon}
        </span>

        {isRippling && !disabled && !isLoading && !isSuccess && (
          <span
            className="absolute bg-surface-default/30 rounded-full animate-[ripple_0.6s_linear]"
            style={{
              left: coords.x,
              top: coords.y,
              transform: 'translate(-50%, -50%) scale(0)',
              width: 100,
              height: 100,
            }}
          />
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
