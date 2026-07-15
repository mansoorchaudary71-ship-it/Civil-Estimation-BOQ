import React from 'react';
import { Blocks, MountainSnow, Box, Hammer } from 'lucide-react';

interface CategoryCardProps {
  title: string;
  subtitle: string;
  rating: string;
  icon: React.ReactNode;
}

function CategoryCard({ title, subtitle, rating, icon }: CategoryCardProps) {
  return (
    <div className="w-full group relative flex flex-col justify-between w-56 h-56 bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-4 sm:p-4 sm:p-6 shadow-sm border border-slate-100 dark:border-slate-800 hover:-translate-y-1 hover:shadow-md transition-all duration-300 cursor-pointer shrink-0 overflow-hidden">
      
      {/* Top-Right Badge: Pill format, absolute positioning */}
      <div className="absolute top-6 right-6">
        <span className="bg-blue-50 dark:bg-blue-500/10 text-orange-400 text-xs font-semibold px-2.5 py-1 rounded-full">
          {rating}
        </span>
      </div>

      {/* Middle Section: Iconography, vertically centered */}
      <div className="flex-1 flex flex-col justify-center mt-4 text-slate-800 dark:text-slate-200">
        {icon}
      </div>

      {/* Bottom Section: Title & Subtitle */}
      <div className="flex flex-col gap-1 mt-auto">
        <h3 className="text-slate-900 dark:text-white font-bold text-lg leading-tight">
          {title}
        </h3>
        <p className="text-slate-400 dark:text-slate-500 text-sm font-medium">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

const CATEGORIES = [
  {
    title: "Concrete Estimator",
    subtitle: "12 Calculators",
    rating: "4.9",
    icon: <Box className="w-8 h-8" strokeWidth={1.5} />,
  },
  {
    title: "Brickwork",
    subtitle: "8 Calculators",
    rating: "4.8",
    icon: <Blocks className="w-8 h-8" strokeWidth={1.5} />,
  },
  {
    title: "Steel Works",
    subtitle: "15 Calculators",
    rating: "4.9",
    icon: <Hammer className="w-8 h-8" strokeWidth={1.5} />,
  },
  {
    title: "Earthworks",
    subtitle: "5 Calculators",
    rating: "4.7",
    icon: <MountainSnow className="w-8 h-8" strokeWidth={1.5} />,
  }
];

export function ToolCategoryCards() {
  return (
    <div className="w-full">
      {/* Horizontally scrollable flex container with gap */}
      <div className="flex gap-4 overflow-x-auto pb-6 pt-2 snap-x px-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {CATEGORIES.map((cat, idx) => (
          <div key={idx} className="snap-start">
            <CategoryCard 
              title={cat.title}
              subtitle={cat.subtitle}
              rating={cat.rating}
              icon={cat.icon}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
