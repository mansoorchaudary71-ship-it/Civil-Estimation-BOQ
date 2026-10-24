import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2, Check } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'premium' | 'link' | 'bare';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  isSuccess?: boolean;
  loadingText?: string;
  successText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

/**
 * Button
 * - Flat, Coursera-style filled primary + hairline outline secondary.
 * - No hover "lift" (it shifted layout and fought with grid hover states).
 * - `type="button"` by default: previously every <Button> inside a <form> submitted it.
 * - Ripple + shimmer removed (extra state per button, noisy on a data-heavy app).
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size = 'md',
      isLoading = false,
      isSuccess = false,
      loadingText = 'Processing...',
      successText = 'Success!',
      leftIcon,
      rightIcon,
      fullWidth = false,
      children,
      disabled,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'relative inline-flex items-center justify-center font-semibold rounded-brand whitespace-nowrap select-none ' +
      'transition-colors duration-200 ease-out active:translate-y-px ' +
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 ' +
      'focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950';

    const sizeStyles = {
      sm: 'min-h-[40px] px-4 text-sm gap-1.5',
      md: 'min-h-[44px] px-5 text-[15px] gap-2',
      lg: 'min-h-[52px] px-7 text-base gap-2',
      xl: 'min-h-[56px] px-8 text-lg gap-2.5',
    };

    const variantStyles = {
      primary: 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 shadow-sm',
      // legacy name kept: used across the app. Same brand fill, no gradient / lift.
      premium: 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 shadow-sm',
      secondary:
        'bg-primary-50 text-primary-700 hover:bg-primary-100 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700',
      outline:
        'bg-transparent border border-primary-600 text-primary-600 hover:bg-primary-50 ' +
        'dark:border-primary-400 dark:text-primary-300 dark:hover:bg-primary-600/15',
      ghost:
        'bg-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white',
      danger: 'bg-rose-600 text-white hover:bg-rose-700 shadow-sm',
      bare: '',
      link: 'bg-transparent min-h-0 px-0 text-primary-600 hover:underline underline-offset-4 dark:text-primary-300',
    };

    // Most existing call sites (~540) pass no `variant` and style the button entirely with their
    // own `bg-*` / `text-*` classes. Applying the filled-primary variant underneath would leak
    // `hover:bg-primary-700` / `text-white` into them, so those callers get a "bare" button.
    const cls = typeof className === 'string' ? className : '';
    const callerStyled =
      /(^|\s)bg-/.test(cls) ||
      /(^|\s)text-(?!(xs|sm|base|lg|xl|[2-9]xl|left|right|center|justify|wrap|nowrap|ellipsis|clip)(\s|$))/.test(cls);
    const resolved = variant ?? (callerStyled ? 'bare' : 'primary');
    const busy = isLoading || isSuccess;
    const stateStyles =
      disabled || isLoading ? 'opacity-60 cursor-not-allowed active:translate-y-0' : 'cursor-pointer';

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || busy}
        aria-busy={isLoading || undefined}
        className={cn(
          baseStyles,
          sizeStyles[size],
          variantStyles[resolved],
          fullWidth && 'w-full',
          stateStyles,
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin shrink-0" aria-hidden="true" />
        ) : isSuccess ? (
          <Check className="w-5 h-5 shrink-0" aria-hidden="true" />
        ) : (
          leftIcon && <span className="shrink-0 inline-flex">{leftIcon}</span>
        )}

        <span className="inline-flex items-center justify-center gap-2">
          {isLoading ? loadingText : isSuccess ? successText : children}
        </span>

        {!busy && rightIcon && <span className="shrink-0 inline-flex">{rightIcon}</span>}
      </button>
    );
  }
);
Button.displayName = 'Button';
export { Button };
export default Button;
