import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SmartSuggestionBadgeProps {
  label: string;
  to?: string;
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
    if (onClick) {
      e.preventDefault();
      onClick();
    } else if (to) {
      e.preventDefault();
      navigate(to);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`group inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] sm:text-xs font-medium rounded-full bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white transition-colors duration-300 ease-in-out cursor-pointer whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 border border-indigo-100 hover:border-indigo-600 ${className}`}
      title={`Go to ${label}`}
      type="button"
    >
      {icon && <span className="opacity-80">{icon}</span>}
      <span>{label}</span>
      <ArrowRight size={12} className="transition-transform duration-300 group-hover:translate-x-0.5" />
    </button>
  );
}
