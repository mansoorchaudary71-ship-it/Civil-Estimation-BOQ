import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
  isHome?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center space-x-1 sm:space-x-1.5 text-sm max-w-full overflow-x-auto py-2 scrollbar-hide" aria-label="Breadcrumb">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div key={item.label + index} className="flex items-center whitespace-nowrap">
            {index > 0 && (
              <ChevronRight className="w-4 h-4 text-slate-600 mx-0.5 sm:mx-1 shrink-0" />
            )}
            
            {isLast ? (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-100 shadow-sm transition-colors">
                {item.isHome && <Home className="w-3.5 h-3.5" />}
                {item.label}
              </span>
            ) : (
              <button onClick={item.onClick}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-all text-base font-semibold active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
              >
                {item.isHome && <Home className="w-3.5 h-3.5" />}
                {item.label}
              </button>
            )}
          </div>
        );
      })}
    </nav>
  );
}
