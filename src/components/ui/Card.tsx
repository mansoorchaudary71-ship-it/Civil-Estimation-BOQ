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
    const baseStyles = "relative rounded-card bg-surface-default overflow-hidden transition-all duration-300";

    const paddingStyles = {
      none: "",
      sm: "p-4",
      md: "p-6 sm:p-8",
      lg: "p-8 sm:p-10",
      xl: "p-10 sm:p-12",
    };

    const variantStyles = {
      default: "border border-ui-borderSubtle shadow-brand-sm",
      subtle: "border border-transparent bg-surface-hover",
      outlined: "border-2 border-ui-borderSubtle shadow-none bg-transparent",
      premium: "border border-ui-borderDefault shadow-brand-md bg-surface-default",
      accent: "border border-accent-200 shadow-brand-sm bg-accent-50/30",
      gradientBorder: "shadow-brand-sm bg-surface-default",
    };

    const hoverStyles = {
      none: "",
      lift: "hover:-translate-y-1 hover:shadow-brand-lg hover:border-ui-borderDefault",
      glow: "hover:shadow-[0_0_20px_rgba(242,164,19,0.15)] hover:border-accent-300",
      liftAndGlow: "hover:-translate-y-1 hover:shadow-[0_10px_25px_rgba(242,164,19,0.15)] hover:border-accent-300",
    };

    const accentGradients = {
      none: "",
      // Gradient names are kept for API compatibility; all render in the amber system.
      blue: "bg-gradient-to-r from-accent-500 to-accent-600",
      orange: "bg-gradient-to-r from-accent-300 to-accent-600",
      teal: "bg-gradient-to-r from-[#14B8A6] to-[#0F766E]",
      purple: "bg-gradient-to-r from-accent-400 to-accent-700",
    };

    // Wrapper for gradient border if active
    if (variant === 'gradientBorder') {
      return (
        <div 
          className={cn(
            "relative p-[1px] rounded-card overflow-hidden transition-all duration-300", 
            hoverStyles[hoverEffect],
            className
          )}
          ref={ref}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-accent-200 via-ui-borderSubtle to-accent-200 opacity-50"></div>
          <div className={cn("relative h-full w-full rounded-[11px]", variantStyles[variant], paddingStyles[padding])} {...props}>
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
