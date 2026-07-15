import React from 'react';
import { Package, Blocks, MountainSnow, Diamond, Container } from 'lucide-react';
import { formatNumberMask } from '../../lib/formatUtils';

export interface TakeoffCosts {
  cement: number;
  steel: number;
  bricks: number;
  sand: number;
  crush: number;
}

export interface TakeoffRates {
  cement: number;
  steel: number;
  bricks: number;
  sand: number;
  crush: number;
}

interface MaterialTakeoffDashboardProps {
  costs: TakeoffCosts;
  rates: TakeoffRates;
}

export function MaterialTakeoffDashboard({ costs, rates }: MaterialTakeoffDashboardProps) {
  // Reverse quantities from total costs & rates
  const qCement = rates.cement > 0 ? Math.ceil(costs.cement / rates.cement) : 0;
  const qSteel = rates.steel > 0 ? costs.steel / rates.steel : 0;
  const qSteelTons = qSteel / 1000;
  const qBricks = rates.bricks > 0 ? Math.ceil(costs.bricks / rates.bricks) : 0;
  const qSand = rates.sand > 0 ? Math.ceil(costs.sand / rates.sand) : 0;
  const qCrush = rates.crush > 0 ? Math.ceil(costs.crush / rates.crush) : 0;

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 lg:p-4 sm:p-8 shadow-sm overflow-hidden">
      <div className="mb-6 flex flex-col gap-1">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Container className="w-5 h-5 text-indigo-500" />
          Material Takeoff (MTO) Dashboard
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Raw material quantities reverse-calculated from current BOQ totals.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* Cement */}
        <MTOItem 
          icon={<Package className="w-6 h-6 text-emerald-500" />} 
          name="Portland Cement" 
          quantity={formatNumberMask(qCement)} 
          unit="Bags" 
          bgColor="bg-emerald-50 dark:bg-emerald-500/10" 
          borderColor="border-emerald-100 dark:border-emerald-500/20"
        />

        {/* Steel */}
        <MTOItem 
          icon={<div className="w-6 h-6 rounded-full border-4 border-rose-500" />} 
          name="Grade 60 Steel" 
          quantity={qSteelTons > 0 ? qSteelTons.toFixed(2) : '0.00'} 
          unit="Tons" 
          bgColor="bg-rose-50 dark:bg-rose-500/10" 
          borderColor="border-rose-100 dark:border-rose-500/20"
        />

        {/* Bricks */}
        <MTOItem 
          icon={<Blocks className="w-6 h-6 text-amber-500" />} 
          name="A-Class Bricks" 
          quantity={formatNumberMask(qBricks)} 
          unit="Units" 
          bgColor="bg-amber-50 dark:bg-amber-500/10" 
          borderColor="border-amber-100 dark:border-amber-500/20"
        />

        {/* Sand */}
        <MTOItem 
          icon={<MountainSnow className="w-6 h-6 text-yellow-600" />} 
          name="Ravi/Chenab Sand" 
          quantity={formatNumberMask(qSand)} 
          unit="Cft" 
          bgColor="bg-yellow-50 dark:bg-yellow-600/10" 
          borderColor="border-yellow-100 dark:border-yellow-600/20"
        />

        {/* Crush */}
        <MTOItem 
          icon={<Diamond className="w-6 h-6 text-slate-600 dark:text-slate-400" />} 
          name="Margalla Crush" 
          quantity={formatNumberMask(qCrush)} 
          unit="Cft" 
          bgColor="bg-slate-100 dark:bg-slate-800" 
          borderColor="border-slate-200 dark:border-slate-700"
        />

      </div>
    </div>
  );
}

function MTOItem({ icon, name, quantity, unit, bgColor, borderColor }: any) {
  return (
    <div className={`p-4 rounded-2xl flex items-center gap-4 border ${bgColor} ${borderColor} transition-all hover:scale-[1.02]`}>
      <div className="w-full shrink-0 p-3 bg-white dark:bg-slate-900 rounded-xl shadow-sm overflow-hidden">
        {icon}
      </div>
      <div>
        <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-0.5">{name}</div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl font-semibold text-slate-800 tabular-nums text-slate-800 dark:text-white leading-none">{quantity}</span>
          <span className="text-base font-medium dark:text-slate-300">{unit}</span>
        </div>
      </div>
    </div>
  );
}
