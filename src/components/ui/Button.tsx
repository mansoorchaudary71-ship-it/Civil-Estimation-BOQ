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
 * Button — Dribbble-style (Batch 2)
 * - Dark ink pill primary; amber-tint secondary; white/border outline; ghost.
 * - No hover "lift" (it shifted layout and fought with grid hover states).
 * - `type="button"` by default: previously every <Button> inside a <form> submitted it.
 * - Ripple + shimmer removed (extra state per button, noisy on a data-heavy app).
 * - Focus ring comes from the global :focus-visible rule (amber + dark ring);
 *   no per-button ring classes here.
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
      'relative inline-flex items-center justify-center font-semibold rounded-pill whitespace-nowrap select-none ' +
      'transition-colors duration-200 ease-out active:translate-y-px ' +
      'focus-visible:outline-none';

    const sizeStyles = {
      sm: 'min-h-[40px] px-4 text-sm gap-1.5',
      md: 'min-h-[44px] px-5 text-[15px] gap-2',
      lg: 'min-h-[52px] px-7 text-base gap-2',
      xl: 'min-h-[56px] px-8 text-lg gap-2.5',
    };

    const variantStyles = {
      primary: 'bg-ink text-white hover:bg-ink-700 active:bg-ink-900 shadow-brand-sm',
      // legacy name kept: used across the app. Same ink fill as primary.
      premium: 'bg-ink text-white hover:bg-ink-700 active:bg-ink-900 shadow-brand-sm',
      secondary:
        'bg-accent-50 text-accent-900 hover:bg-accent-100',
      outline:
        'bg-surface-default border border-ui-borderStrong text-txt-primary hover:bg-secondary-100',
      ghost:
        'bg-transparent text-txt-secondary hover:bg-secondary-100 hover:text-txt-primary',
      danger: 'bg-ui-errorText text-white hover:bg-ui-errorText/85 shadow-brand-sm',
      bare: '',
      link: 'bg-transparent min-h-0 px-0 text-accent-800 hover:underline underline-offset-4 dark:text-accent-400',
    };

    // Most existing call sites (~540) pass no `variant` and style the button entirely with their
    // own `bg-*` / `text-*` classes. Applying the filled-primary variant underneath would leak
    // `hover:bg-ink-700` / `text-white` into them, so those callers get a "bare" button.
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
