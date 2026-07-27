import React from 'react';
import { cn } from '../../lib/utils';
import { motion, HTMLMotionProps } from 'framer-motion';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'premium' | 'interactive' | 'glass';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  asMotion?: boolean;
  motionProps?: HTMLMotionProps<"div">;
}

export function Card({
  className,
  children,
  variant = 'default',
  padding = 'md',
  asMotion = false,
  motionProps = {},
  ...props
}: CardProps) {
  const baseStyles = "relative rounded-2xl overflow-hidden transition-all duration-300";
  
  const variants = {
    default: "bg-white border border-slate-200 shadow-sm",
    premium: "bg-gradient-to-b from-white to-slate-50 border border-slate-200 shadow-md",
    interactive: "bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-slate-300 cursor-pointer group",
    glass: "bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]",
  };

  const paddings = {
    none: "",
    sm: "p-4 sm:p-5",
    md: "p-6 sm:p-8",
    lg: "p-8 sm:p-10",
  };

  const combinedClasses = cn(
    baseStyles,
    variants[variant],
    paddings[padding],
    className
  );

  if (asMotion) {
    return (
      <motion.div className={combinedClasses} {...motionProps} {...(props as any)}>
        {children}
      </motion.div>
    );
  }

  return (
    <div className={combinedClasses} {...props}>
      {children}
    </div>
  );
}

// Sub-components for better hierarchy
export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex flex-col space-y-1.5 mb-6", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("text-xl font-bold leading-none tracking-tight text-slate-900", className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm text-slate-500 leading-relaxed", className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("relative", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex items-center pt-6 mt-auto", className)} {...props}>
      {children}
    </div>
  );
}
