import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Bookmark, CircleCheck, Compass, Clock, MapPin } from 'lucide-react';
import { cn } from "../../lib/utils";

// Types
export type PaginationStyle = 'classic' | 'counter' | 'dots';

export interface ProjectCard {
  id: string;
  image: string;
  status: string;
  category: string;
  title: string;
  metrics: string;
  inspectorName: string;
  inspectorAvatar: string;
  date: string;
}

// Dummy Data
export const PROJECT_DATA: ProjectCard[] = [
  {
    id: "proj-1",
    image: "https://images.unsplash.com/photo-1541888086425-d81bb19240f5?auto=format&fit=crop&q=80&w=800",
    status: "APPROVED",
    category: "CONCRETE WORKS",
    title: "Foundation Slab Alpha",
    metrics: "Total Volume: 125.5 m³",
    inspectorName: "Mansoor C.",
    inspectorAvatar: "https://i.pravatar.cc/150?u=mansoor",
    date: "12 Oct 2023"
  },
  {
    id: "proj-2",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=800",
    status: "PENDING",
    category: "BRICKWORK",
    title: "Perimeter Wall Sector 4",
    metrics: "Area: 450 sq.m",
    inspectorName: "Ali R.",
    inspectorAvatar: "https://i.pravatar.cc/150?u=ali",
    date: "14 Oct 2023"
  },
  {
    id: "proj-3",
    image: "https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?auto=format&fit=crop&q=80&w=800",
    status: "VERIFIED",
    category: "SITE LAYOUT",
    title: "Highway Extension B",
    metrics: "Distance: 2.4 km",
    inspectorName: "Sarah K.",
    inspectorAvatar: "https://i.pravatar.cc/150?u=sarah",
    date: "18 Oct 2023"
  },
  {
    id: "proj-4",
    image: "https://images.unsplash.com/photo-1621847466847-19eb7b37000e?auto=format&fit=crop&q=80&w=800",
    status: "IN PROGRESS",
    category: "STEEL FIXING",
    title: "Retaining Wall Rebar",
    metrics: "Weight: 14.2 Tons",
    inspectorName: "Tariq M.",
    inspectorAvatar: "https://i.pravatar.cc/150?u=tariq",
    date: "20 Oct 2023"
  },
  {
    id: "proj-5",
    image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80&w=800",
    status: "APPROVED",
    category: "EARTHWORKS",
    title: "Basement Excavation",
    metrics: "Volume: 8,500 m³",
    inspectorName: "Mansoor C.",
    inspectorAvatar: "https://i.pravatar.cc/150?u=mansoor",
    date: "22 Oct 2023"
  }
];

interface ProjectCarouselProps {
  className?: string;
}

export function ProjectCarousel({ className }: ProjectCarouselProps) {
  const [paginationStyle, setPaginationStyle] = useState<PaginationStyle>('counter');
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleNext = () => {
    setActiveIndex((prev) => Math.min(prev + 1, PROJECT_DATA.length - 1));
  };

  const handlePrev = () => {
    setActiveIndex((prev) => Math.max(prev - 1, 0));
  };

  // Scroll the container to match active index
  useEffect(() => {
    if (containerRef.current) {
      const container = containerRef.current;
      const cards = container.querySelectorAll('.carousel-card');
      if (cards[activeIndex]) {
        const card = cards[activeIndex] as HTMLElement;
        const containerCenter = container.offsetWidth / 2;
        const cardCenter = card.offsetLeft + card.offsetWidth / 2;
        container.scrollTo({
          left: cardCenter - containerCenter,
          behavior: 'smooth'
        });
      }
    }
  }, [activeIndex]);

  const handleScroll = () => {
    if (containerRef.current) {
      const container = containerRef.current;
      const scrollCenter = container.scrollLeft + container.offsetWidth / 2;
      const cards = container.querySelectorAll('.carousel-card');
      
      let closestIndex = activeIndex;
      let minDistance = Infinity;

      cards.forEach((card, index) => {
        const c = card as HTMLElement;
        const cardCenter = c.offsetLeft + c.offsetWidth / 2;
        const distance = Math.abs(cardCenter - scrollCenter);
        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = index;
        }
      });

      if (closestIndex !== activeIndex) {
        setActiveIndex(closestIndex);
      }
    }
  };

  return (
    <div className={cn("relative w-full flex flex-col gap-6 py-8 isolate font-sans", className)}>
      
      {/* Header Controls */}
      <div className="flex items-center justify-between px-6 md:px-12 z-10 w-full mb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
            <Compass className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 tracking-tight">
            Recent Projects
          </h2>
        </div>

        {/* Pagination Style Toggle */}
        <div className="flex items-center bg-slate-100/80 p-1 rounded-full backdrop-blur-md border border-slate-200/50 shadow-inner">
          <button
            onClick={() => setPaginationStyle('classic')}
            className={cn("px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-300", paginationStyle === 'classic' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}
          >
            Classic
          </button>
          <button
            onClick={() => setPaginationStyle('counter')}
            className={cn("px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-300", paginationStyle === 'counter' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}
          >
            Counter
          </button>
          <button
            onClick={() => setPaginationStyle('dots')}
            className={cn("px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-300", paginationStyle === 'dots' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}
          >
            Dots
          </button>
        </div>
      </div>

      {/* Cards Container */}
      <div 
        ref={containerRef}
        className="flex w-full overflow-x-auto gap-6 px-6 md:px-12 pb-10 pt-4 snap-x snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        onScroll={handleScroll}
      >
        {PROJECT_DATA.map((project, idx) => {
          const isActive = activeIndex === idx;

          return (
            <motion.div
              key={project.id}
              className={cn(
                "carousel-card shrink-0 snap-center w-[300px] md:w-[350px] flex flex-col rounded-[2.5rem] bg-white border border-slate-100 shadow-xl overflow-hidden transition-all duration-500 ease-out",
                isActive ? "opacity-100 scale-100 shadow-2xl" : "opacity-60 scale-95 hover:opacity-80"
              )}
            >
              {/* Card Image Header */}
              <div className="relative h-56 w-full overflow-hidden">
                <div className="absolute inset-0 bg-slate-900/10 z-10"></div>
                <img 
                  src={project.image} 
                  alt={project.title} 
                  className="w-full h-full object-cover transition-transform duration-700 ease-out hover:scale-105"
                />
                <div className="absolute top-4 left-4 z-20">
                  <span className={cn(
                    "px-3 py-1 text-[10px] uppercase font-bold tracking-wider rounded-full shadow-sm backdrop-blur-md",
                    project.status === "APPROVED" ? "bg-emerald-500/90 text-white" :
                    project.status === "PENDING" ? "bg-amber-500/90 text-white" :
                    project.status === "VERIFIED" ? "bg-blue-500/90 text-white" :
                    "bg-slate-800/90 text-white"
                  )}>
                    {project.status}
                  </span>
                </div>
                <div className="absolute top-4 right-4 z-20">
                  <button aria-label="Bookmark" className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-slate-900 transition-colors">
                    <Bookmark className="w-4 h-4 fill-current" />
                  </button>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 md:p-8 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                  <span className="text-[10px] font-bold tracking-widest text-indigo-500 uppercase">
                    {project.category}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2 leading-tight">
                  {project.title}
                </h3>
                <p className="text-sm font-medium text-slate-500 mb-6">
                  {project.metrics}
                </p>

                {/* Footer / User info */}
                <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-3">
                    <img src={project.inspectorAvatar} alt="Inspector" className="w-8 h-8 rounded-full shadow-sm ring-2 ring-white" />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-900">{project.inspectorName}</span>
                      <span className="text-[10px] font-medium text-slate-400">Inspector</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                    <Clock className="w-3 h-3" />
                    {project.date}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col items-center mt-2 relative w-full h-24">
        <div className="flex items-center justify-center gap-6 h-12">
          {/* We only show Arrows next to Counter and Classic, or keep them anyway */}
          <button aria-label="ChevronLeft" 
            onClick={handlePrev}
            disabled={activeIndex === 0}
            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 transition-all z-20"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="relative flex items-center justify-center min-w-[120px]">
            <AnimatePresence mode="wait">
              {paginationStyle === 'classic' && (
                <motion.div 
                  key="classic"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-center gap-2 text-sm font-bold text-slate-700"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-lg">
                    {activeIndex + 1}
                  </div>
                  <span className="opacity-50 mx-1">of</span>
                  <span>{PROJECT_DATA.length}</span>
                </motion.div>
              )}

              {paginationStyle === 'counter' && (
                <motion.div 
                  key="counter"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="flex items-end gap-1 font-black tracking-tighter"
                >
                  <span className="text-5xl text-rose-500 leading-none" style={{ background: 'linear-gradient(to right, #f43f5e, #e11d48)', WebkitBackgroundClip: 'text', color: 'transparent' }}>
                    {String(activeIndex + 1).padStart(2, '0')}
                  </span>
                  <span className="text-xl text-slate-300 mb-1">
                    {String(PROJECT_DATA.length).padStart(2, '0')}
                  </span>
                </motion.div>
              )}

              {paginationStyle === 'dots' && (
                <motion.div 
                  key="dots"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="flex items-center gap-2"
                >
                  {PROJECT_DATA.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveIndex(idx)}
                      className={cn(
                        "transition-all duration-300 rounded-full",
                        activeIndex === idx ? "w-6 h-2 bg-slate-800 shadow-md" : "w-2 h-2 bg-slate-200 hover:bg-slate-400"
                      )}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button aria-label="ChevronRight" 
            onClick={handleNext}
            disabled={activeIndex === PROJECT_DATA.length - 1}
            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 transition-all z-20"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <p className="mt-4 text-[11px] font-semibold text-slate-400 tracking-wider">
          {activeIndex + 1}-{Math.min(activeIndex + 3, PROJECT_DATA.length)} of {PROJECT_DATA.length} civil projects • <span className="text-slate-300">swipe to navigate</span>
        </p>
      </div>

    </div>
  );
}
