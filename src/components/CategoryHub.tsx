import React from 'react';
import { motion } from 'framer-motion';
import ToolCard from './ToolCard';

interface CategoryHubProps {
  groupedModules: Record<string, any[]>;
  groupsToDisplay: string[];
  handleSelect: (id: string) => void;
  isComputing?: boolean;
}

const bgColors = ['bg-[#F4F1EA]', 'bg-[#F0F5FF]', 'bg-[#D9E6DD]', 'bg-[#FFF0F0]', 'bg-[#F3E8FF]', 'bg-[#E0F2FE]'];

export default function CategoryHub({ groupedModules, groupsToDisplay, handleSelect, isComputing }: CategoryHubProps) {
  if (isComputing) {
    return <div className="p-12 text-center text-slate-500">Loading modules...</div>;
  }

  return (
    <div className="flex flex-col w-full">
      {groupsToDisplay.map((groupName, index) => {
        const toolsInGroup = groupedModules[groupName];
        if (!toolsInGroup || toolsInGroup.length === 0) return null;
        
        const bgColor = bgColors[index % bgColors.length];
        
        return (
          <div key={groupName} className={`w-full flex flex-col py-12 md:py-20 ${bgColor}`}>
            <div className="w-full md:max-w-[1400px] md:mx-auto px-4 flex flex-col gap-5">
              <h2 className="px-2 flex items-center gap-2 text-2xl font-bold text-slate-800 tracking-tight mb-4">
                {groupName}
                <span className="text-sm font-normal px-3 py-1 rounded-full bg-white/50 border border-slate-200 text-slate-600 shadow-sm">
                  {toolsInGroup.length} Tools
                </span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 tool-card-grid">
                {toolsInGroup.map((mod, modIdx) => (
                  <motion.div
                    key={mod.id}
                    id={`module-card-${mod.id}`}
                    className="flex flex-col h-full"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.4, delay: modIdx * 0.05 }}
                  >
                    <ToolCard 
                      mod={mod} 
                      onSelect={handleSelect} 
                      layoutId={`card-${groupName || 'group'}-${mod.id}`} 
                      categoryColor={bgColor === 'bg-[#F4F1EA]' ? '#F4F1EA' : bgColor === 'bg-[#F0F5FF]' ? '#F0F5FF' : '#D9E6DD'} 
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
