import React from 'react';

const diameters = [6, 8, 10, 12, 16, 20, 25];

interface RelatedCalculatorsProps {
  diameter_mm: number;
  isMetric?: boolean;
}

export default function RelatedCalculators({ diameter_mm, isMetric = true }: RelatedCalculatorsProps) {
  const currentIndex = diameters.indexOf(diameter_mm);
  
  const prevSize = currentIndex > 0 ? diameters[currentIndex - 1] : null;
  const nextSize = currentIndex < diameters.length - 1 ? diameters[currentIndex + 1] : null;

  return (
    <section className="mt-12 bg-slate-50 rounded-[24px] p-4 sm:p-8 md:p-8 border border-slate-200 overflow-hidden">
      <h2 className="mb-6 text-xl font-semibold text-slate-900 tracking-tight mb-4">
        Quick Links & Related Calculators
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Next Size Down */}
        {prevSize ? (
          <a 
            href={`/steel-weight/weight-of-${prevSize}mm-steel-bar-${isMetric ? 'per-meter' : 'per-foot'}`}
            className="w-full group flex flex-col p-5 bg-white rounded-[24px] border border-slate-200 hover:border-indigo-400 hover:shadow-md hover:bg-slate-50 transition-all overflow-hidden"
          >
            <span className="text-base font-medium text-indigo-600 uppercase tracking-wider mb-1 group-hover:text-indigo-600">Smaller Bar</span>
            <span className="text-lg font-bold text-slate-800 leading-tight">Calculate {prevSize}mm Steel Weight</span>
          </a>
        ) : (
          <div className="p-5 bg-slate-100 rounded-[24px] border border-slate-200 opacity-50 flex items-center justify-center overflow-hidden">
            <span className="text-sm sm:text-base font-medium">Smallest Size</span>
          </div>
        )}
        
        {/* Next Size Up */}
        {nextSize ? (
          <a 
            href={`/steel-weight/weight-of-${nextSize}mm-steel-bar-${isMetric ? 'per-meter' : 'per-foot'}`}
            className="w-full group flex flex-col p-5 bg-white rounded-[24px] border border-slate-200 hover:border-indigo-400 hover:shadow-md hover:bg-slate-50 transition-all overflow-hidden"
          >
            <span className="text-base font-medium text-indigo-600 uppercase tracking-wider mb-1 group-hover:text-indigo-600">Larger Bar</span>
            <span className="text-lg font-bold text-slate-800 leading-tight">Calculate {nextSize}mm Steel Weight</span>
          </a>
        ) : (
          <div className="p-5 bg-slate-100 rounded-[24px] border border-slate-200 opacity-50 flex items-center justify-center overflow-hidden">
            <span className="text-sm sm:text-base font-medium">Largest Size</span>
          </div>
        )}

        {/* Horizontal Link 1 */}
        <a 
          href="/marla-to-sq-ft"
          className="w-full group flex flex-col p-5 bg-white rounded-[24px] border border-slate-200 hover:border-teal-400 hover:shadow-md hover:bg-slate-50 transition-all overflow-hidden"
        >
          <span className="text-base font-medium text-teal-500 uppercase tracking-wider mb-1 group-hover:text-teal-600">Land Area</span>
          <span className="text-lg font-bold text-slate-800 leading-tight">Marla to Sq Ft Calculator</span>
        </a>

        {/* Horizontal Link 2 */}
        <a 
          href="/brick-wall-calculator"
          className="w-full group flex flex-col p-5 bg-white rounded-[24px] border border-slate-200 hover:border-rose-400 hover:shadow-md hover:bg-slate-50 transition-all overflow-hidden"
        >
          <span className="text-base font-medium text-rose-500 uppercase tracking-wider mb-1 group-hover:text-rose-600">Masonry</span>
          <span className="text-lg font-bold text-slate-800 leading-tight">Brick Wall Calculator</span>
        </a>
      </div>
    </section>
  );
}
