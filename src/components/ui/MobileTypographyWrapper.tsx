import React, { ReactNode } from 'react';

interface MobileTypographyWrapperProps {
  children: ReactNode;
  className?: string;
}

/**
 * A wrapper component that enforces the mobile-first typography hierarchy.
 * By wrapping your main layout or specific sections in this component, you ensure 
 * consistent, highly legible font styles (similar to the Dribbble mobile app) 
 * cascade down to all native HTML elements without needing repetitive Tailwind classes.
 * 
 * Note: The base styles are already defined in index.css under @layer base,
 * so this wrapper simply ensures the container itself has the correct default text colors
 * and font family applied.
 */
export function MobileTypographyWrapper({ children, className = '' }: MobileTypographyWrapperProps) {
  return (
    <div 
      className={`
        font-sans antialiased text-gray-900 dark:text-gray-100
        selection:bg-indigo-100 selection:text-indigo-900
        dark:selection:bg-indigo-900 dark:selection:text-indigo-100
        ${className}
      `}
    >
      {/* 
        Elements like <h1>, <p>, and <button> inside here will automatically 
        inherit the @layer base styles defined in your global CSS.
      */}
      {children}
    </div>
  );
}
