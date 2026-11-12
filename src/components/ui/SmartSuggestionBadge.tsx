import { Button } from './/Button';
import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';


interface SmartSuggestionBadgeProps {
  label: string;
  to?: string; // This can be the module id, e.g. 'steel-weight'
  onClick?: () => void;
  className?: string;
  icon?: React.ReactNode;
}

export function SmartSuggestionBadge({
  label,
  to,
  onClick,
  className = "",
  icon
}: SmartSuggestionBadgeProps) {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onClick) {
      onClick();
    } else if (to) {
      if (to.startsWith('/')) {
         navigate(to);
      } else {
         window.dispatchEvent(new CustomEvent('navigate-module', { detail: to }));
      }
    }
  };

  return (
    <Button
      onClick={handleClick}
      className={`group inline-flex items-center gap-1.5 px-2.5 py-1 text-xs sm:text-xs font-medium rounded-full bg-accent-50 text-accent-800 hover:bg-ink-700 hover:text-white transition-colors duration-300 ease-in-out cursor-pointer whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-1 border border-accent-100 hover:border-accent-800 ${className}`}
      title={`Go to ${label}`}
      type="button"
    >
      {icon && <span className="opacity-80">{icon}</span>}
      <span>{label}</span>
      <ArrowRight size={12} className="transition-transform duration-300 group-hover:translate-x-0.5" />
    </Button>
  );
}
