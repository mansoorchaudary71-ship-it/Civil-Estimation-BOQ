import React from 'react';
import metalData from '../../data/metalData.json';
import concreteData from '../../data/concreteData.json';
import houseData from '../../data/houseData.json';
import earthworkData from '../../data/earthworkData.json';

interface RelatedCalculatorsProps {
  category: string;
  currentSlug: string;
}

const CATEGORY_NAMES: Record<string, string> = {
  metal: "Steel & Metal Structure Calculators",
  concrete: "Concrete & RCC Volume Estimators",
  house: "Residential Construction & Grey Structure Estimators",
  earthworks: "Earthworks & Trench Excavation"
};

const CROSS_POLLINATION_MAP: Record<string, string[]> = {
  metal: ['concrete', 'house'],
  concrete: ['metal', 'earthworks'],
  house: ['concrete', 'earthworks'],
  earthworks: ['house', 'concrete']
};

export function RelatedCalculators({ category, currentSlug }: RelatedCalculatorsProps) {
  let currentDataList: any[] = [];
  switch (category) {
    case 'metal': currentDataList = metalData; break;
    case 'concrete': currentDataList = concreteData; break;
    case 'house': currentDataList = houseData; break;
    case 'earthworks': currentDataList = earthworkData; break;
  }

  // 4 sequential links (Next/Previous within the same category)
  const currentIdx = currentDataList.findIndex((d) => d.slug === currentSlug);
  const sequentialItems: any[] = [];
  
  if (currentIdx !== -1 && currentDataList.length > 1) {
    let startIdx = currentIdx - 2;
    let endIdx = currentIdx + 2;
    
    // Bounds adjustments
    if (startIdx < 0) {
      endIdx += Math.abs(startIdx);
      startIdx = 0;
    }
    if (endIdx >= currentDataList.length) {
      startIdx -= (endIdx - currentDataList.length + 1);
      endIdx = currentDataList.length - 1;
    }
    startIdx = Math.max(0, startIdx);
    
    // Collect specific neighbors
    for (let i = startIdx; i <= endIdx; i++) {
      if (i !== currentIdx && sequentialItems.length < 4) {
        sequentialItems.push(currentDataList[i]);
      }
    }
    
    // Fallback if we somehow didn't get 4 items
    if (sequentialItems.length < 4) {
      for (let i = 0; i < currentDataList.length; i++) {
        if (i !== currentIdx && !sequentialItems.includes(currentDataList[i])) {
          sequentialItems.push(currentDataList[i]);
          if (sequentialItems.length >= 4) break;
        }
      }
    }
  }

  const sequentialLinks = sequentialItems.map((item) => ({
    label: "Similar Calculation",
    title: item.target_keyword,
    url: `/calculators/${category}/${item.slug}`
  }));

  // 2 High-level category hub links
  const categoryHubLinks = [
    {
      label: "Category Hub",
      title: `Back to All ${CATEGORY_NAMES[category] || 'Calculators'}`,
      url: `/calculators/${category}`
    },
    {
      label: "Master Hub",
      title: "View All Civil Engineering Estimation Tools",
      url: "/calculators"
    }
  ];

  // 2 Cross-Pollination links
  const crossCategories = CROSS_POLLINATION_MAP[category] || ['concrete', 'metal'];
  const crossLinks = crossCategories.slice(0, 2).map((tgtCat) => {
    let tgtList: any[] = [];
    switch (tgtCat) {
      case 'metal': tgtList = metalData; break;
      case 'concrete': tgtList = concreteData; break;
      case 'house': tgtList = houseData; break;
      case 'earthworks': tgtList = earthworkData; break;
    }
    
    // Consistently pick an item based on the current slug's length so it's pseudo-random but SSR stable
    const seedIdx = currentSlug.length % tgtList.length;
    const targetItem = tgtList[seedIdx] || tgtList[0];
    
    return {
      label: "Related Tool",
      title: targetItem ? targetItem.target_keyword : `Explore ${CATEGORY_NAMES[tgtCat]}`,
      url: targetItem ? `/calculators/${tgtCat}/${targetItem.slug}` : `/calculators/${tgtCat}`
    };
  });

  return (
    <section className="mt-16 bg-[#f8fafc] rounded-[24px] p-8 sm:p-10 border border-slate-200 shadow-sm overflow-hidden">
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-slate-900 tracking-tight mb-4">Silo Link Grid: Continue Exploring</h2>
        <p className="mt-2 text-base font-normal text-slate-600 leading-relaxed">Discover sequential tools, categorical hubs, and related structural estimators.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* Render sequential links (exact 4) */}
        {sequentialLinks.map((link, idx) => (
          <a key={`seq-${idx}`} href={link.url} className="w-full group p-5 bg-white rounded-[24px] border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 hover:shadow-md transition-all flex flex-col overflow-hidden">
            <span className="text-base font-medium text-indigo-500 uppercase tracking-wider mb-2">{link.label}</span>
            <span className="text-sm sm:text-base font-medium group-hover:text-indigo-700 capitalize leading-snug">{link.title}</span>
          </a>
        ))}
        
        {/* Render Cross Pollination links (exact 2) */}
        {crossLinks.map((link, idx) => (
          <a key={`cross-${idx}`} href={link.url} className="w-full group p-5 bg-white rounded-[24px] border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 hover:shadow-md transition-all flex flex-col overflow-hidden">
            <span className="text-base font-medium text-emerald-500 uppercase tracking-wider mb-2">{link.label}</span>
            <span className="text-sm sm:text-base font-medium group-hover:text-emerald-700 capitalize leading-snug">{link.title}</span>
          </a>
        ))}

        {/* Render Category Hubs (exact 2) */}
        {categoryHubLinks.map((link, idx) => (
          <a key={`hub-${idx}`} href={link.url} className="group px-4 py-3 bg-indigo-600 rounded-[24px] border border-indigo-500 hover:bg-indigo-700 shadow-lg shadow-indigo-600/30 transition-all flex flex-col justify-center items-start overflow-hidden">
            <span className="text-base font-medium text-white/80 uppercase tracking-wider mb-2">{link.label}</span>
            <span className="text-base font-medium text-white capitalize leading-snug">{link.title}</span>
          </a>
        ))}
      </div>
    </section>
  );
}
