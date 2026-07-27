import React, { forwardRef } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'premium' | 'subtle' | 'accent' | 'outlined' | 'gradientBorder';
  hoverEffect?: 'none' | 'lift' | 'glow' | 'liftAndGlow';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  gradientAccent?: 'none' | 'blue' | 'orange' | 'teal' | 'purple';
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = 'default',
      hoverEffect = 'lift',
      padding = 'md',
      gradientAccent = 'none',
      children,
      ...props
    },
    ref
  ) => {
    // Structural & Base Styling (Uniform radius, padding logic, structural baseline)
    const baseStyles = "relative rounded-2xl bg-surface-default overflow-hidden transition-all duration-300";

    const paddingStyles = {
      none: "",
      sm: "p-4",
      md: "p-6 sm:p-8",
      lg: "p-8 sm:p-10",
      xl: "p-10 sm:p-12",
    };

    const variantStyles = {
      default: "border border-ui-borderSubtle shadow-sm",
      subtle: "border border-transparent bg-surface-hover",
      outlined: "border-2 border-ui-borderSubtle shadow-none bg-transparent",
      premium: "border border-ui-borderDefault shadow-md bg-surface-default dark:bg-slate-900",
      accent: "border border-accent-200 dark:border-accent-800 shadow-sm bg-accent-50/30 dark:bg-accent-900/10",
      gradientBorder: "shadow-sm bg-surface-default dark:bg-slate-900",
    };

    const hoverStyles = {
      none: "",
      lift: "hover:-translate-y-1 hover:shadow-lg hover:border-ui-borderDefault",
      glow: "hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] hover:border-primary-300",
      liftAndGlow: "hover:-translate-y-1 hover:shadow-[0_10px_25px_rgba(59,130,246,0.15)] hover:border-primary-300",
    };

    const accentGradients = {
      none: "",
      blue: "bg-gradient-to-r from-blue-500 to-indigo-600",
      orange: "bg-gradient-to-r from-orange-400 to-orange-600",
      teal: "bg-gradient-to-r from-teal-400 to-emerald-500",
      purple: "bg-gradient-to-r from-purple-500 to-pink-600",
    };

    // Wrapper for gradient border if active
    if (variant === 'gradientBorder') {
      return (
        <div 
          className={cn(
            "relative p-[1px] rounded-2xl overflow-hidden transition-all duration-300", 
            hoverStyles[hoverEffect],
            className
          )}
          ref={ref}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary-200 via-ui-borderSubtle to-accent-200 opacity-50"></div>
          <div className={cn("relative h-full w-full rounded-[15px]", variantStyles[variant], paddingStyles[padding])} {...props}>
             {gradientAccent !== 'none' && (
                <div className={cn("absolute top-0 left-0 w-full h-1 opacity-80", accentGradients[gradientAccent])} />
             )}
            {children}
          </div>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], hoverStyles[hoverEffect], paddingStyles[padding], className)}
        {...props}
      >
        {gradientAccent !== 'none' && (
          <div className={cn("absolute top-0 left-0 w-full h-1 opacity-80", accentGradients[gradientAccent])} />
        )}
        {children}
      </div>
    );
  }
);
Card.displayName = 'Card';

// Card Sub-components for better typographic hierarchy and layout
export const CardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 mb-5", className)} {...props} />
  )
);
CardHeader.displayName = "CardHeader";

export const CardTitle = forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-xl font-bold tracking-tight text-txt-primary leading-tight", className)} {...props} />
  )
);
CardTitle.displayName = "CardTitle";

export const CardDescription = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-txt-secondary leading-relaxed", className)} {...props} />
  )
);
CardDescription.displayName = "CardDescription";

export const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex-1", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";

export const CardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center mt-6 pt-5 border-t border-ui-borderSubtle", className)} {...props} />
  )
);
CardFooter.displayName = "CardFooter";

export default Card;
