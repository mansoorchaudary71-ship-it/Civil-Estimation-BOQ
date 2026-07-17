import React, { useState } from "react";
import {
  Search,
  X,
  Hammer,
  Sparkles,
  Map as MapIcon,
  Square,
  Box,
  ArrowRightLeft,
  Weight,
  Zap,
  LineChart,
  Layers,
  Calculator,
  Mountain,
  Route,
  Droplet,
  Home,
  ShieldCheck,
  Users,
  Sun,
  Triangle,
} from "lucide-react";
export type ModuleId = string;
import { motion, AnimatePresence } from "framer-motion";
import { ALL_MODULES } from "./Dashboard";

export const ALL_TOOLS = [
  {
    id: "qs-workflow",
    title: "Guided QS Workflow",
    icon: <Layers className="w-4 h-4" />,
  },
  { id: "ai", title: "AI Assistant", icon: <Sparkles className="w-4 h-4" /> },
  {
    id: "labour-calculator",
    title: "Labour & Workforce",
    icon: <Users className="w-4 h-4" />,
  },
  { id: "takeoff", title: "2D Takeoff", icon: <MapIcon className="w-4 h-4" /> },
  {
    id: "retaining-wall",
    title: "Retaining Wall Estimator",
    icon: <ShieldCheck className="w-4 h-4" />,
  },
  {
    id: "isolated-footing",
    title: "Isolated Footing Calculator",
    icon: <Box className="w-4 h-4" />,
  },
  {
    id: "area-space-calculator",
    title: "Plot Area Calculator",
    icon: <Square className="w-4 h-4" />,
  },
  {
    id: "volume-estimator",
    title: "Volume Estimator",
    icon: <Box className="w-4 h-4" />,
  },
  {
    id: "unit-converter",
    title: "Universal Unit Converter",
    icon: <ArrowRightLeft className="w-4 h-4" />,
  },
  {
    id: "metal-weight",
    title: "Metal Weight Calculator",
    icon: <Weight className="w-4 h-4" />,
  },
  {
    id: "mep-calculator",
    title: "Energy & MEP Calculators",
    icon: <Zap className="w-4 h-4" />,
  },
  {
    id: "rainwater-harvesting",
    title: "Rainwater Harvesting",
    icon: <Droplet className="w-4 h-4" />,
  },
  {
    id: "gradient-calculator",
    title: "Gradient & Slope Calculator",
    icon: <LineChart className="w-4 h-4" />,
  },
  {
    id: "master-rcc",
    title: "Master RCC Estimator",
    icon: <Layers className="w-4 h-4" />,
  },
  {
    id: "master-quantity",
    title: "Master Quantity Estimator",
    icon: <Calculator className="w-4 h-4" />,
  },
  {
    id: "calculators",
    title: "Construction Material Estimator",
    icon: <Hammer className="w-4 h-4" />,
  },
  {
    id: "earthworks",
    title: "Earthworks",
    icon: <Mountain className="w-4 h-4" />,
  },
  {
    id: "chainage",
    title: "Road Earthworks",
    icon: <Route className="w-4 h-4" />,
  },
  {
    id: "geotechnical",
    title: "Geotechnical & Soil Tests",
    icon: <Droplet className="w-4 h-4" />,
  },
  {
    id: "road-pavement",
    title: "Road & Pavement Estimator",
    icon: <Route className="w-4 h-4" />,
  },
  {
    id: "interiors-finishes",
    title: "Interiors & Finishes",
    icon: <Box className="w-4 h-4" />,
  },
  { id: "house", title: "House Estimator", icon: <Home className="w-4 h-4" /> },
  {
    id: "formwork",
    title: "Formwork & Scaffold",
    icon: <Layers className="w-4 h-4" />,
  },
  {
    id: "rates",
    title: "Market Rates",
    icon: <LineChart className="w-4 h-4" />,
  },
  {
    id: "ventilation-checker",
    title: "Ventilation & Lighting Checker",
    icon: <Sun className="w-4 h-4" />,
  },
  {
    id: "door-window-schedule",
    title: "Door & Window Schedule",
    icon: <Square className="w-4 h-4" />,
  },
  {
    id: "staircase-design-reference",
    title: "Staircase Design Reference",
    icon: <Triangle className="w-4 h-4" />,
  },
  {
    id: "far-fsi-calculator",
    title: "FAR/FSI Calculator",
    icon: <Layers className="w-4 h-4" />,
  },
  {
    id: "building-setback-calculator",
    title: "Building Setback Calculator",
    icon: <ArrowRightLeft className="w-4 h-4" />,
  },
  {
    id: "room-area-calculator",
    title: "Room Area Calculator",
    icon: <Square className="w-4 h-4" />,
  },
];

interface MobileToolsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectModule: (id: ModuleId) => void;
}

export default function MobileToolsSheet({
  isOpen,
  onClose,
  onSelectModule,
}: MobileToolsSheetProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState(0);

  const categories = React.useMemo(() => {
    return [
      "All",
      ...Array.from(
        new Set(ALL_MODULES.map((m) => m.category).filter(Boolean)),
      ),
    ];
  }, []);

  const activeCategory = categories[activeTab];
  const searchWords = searchTerm.toLowerCase().split(/\s+/).filter(Boolean);

  const filteredTools = ALL_TOOLS.filter((tool) => {
    const fullMod = ALL_MODULES.find((m) => m.id === tool.id);

    // Category check
    const matchesCategory =
      activeCategory === "All" || fullMod?.category === activeCategory;
    if (!matchesCategory) return false;

    // Search check
    if (searchWords.length === 0) return true;
    return searchWords.every(
      (word) =>
        tool.title.toLowerCase().includes(word) ||
        fullMod?.desc?.toLowerCase().includes(word) ||
        fullMod?.category?.toLowerCase().includes(word),
    );
  });

  const handleDragEnd = (e: any, { offset, velocity }: any) => {
    const swipeThreshold = 50;
    if (offset.x < -swipeThreshold && activeTab < categories.length - 1) {
      setActiveTab((prev) => prev + 1);
    } else if (offset.x > swipeThreshold && activeTab > 0) {
      setActiveTab((prev) => prev - 1);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#F5F5F7] backdrop-blur-sm z-[60] md:hidden"
            onClick={onClose}
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={(e, { offset, velocity }) => {
              if (offset.y > 100 || velocity.y > 500) {
                onClose();
              }
            }}
            className="w-full fixed bottom-0 left-0 right-0 z-[70] md:hidden flex flex-col bg-white/90 backdrop-blur-2xl border-t border-slate-200 dark:border-slate-700/50 shadow-[0_-8px_30px_rgba(15,23,42,0.12)] rounded-t-[32px] will-change-transform overflow-hidden"
            style={{ maxHeight: "85vh", height: "85vh" }}
          >
            <div className="flex justify-center pt-3 pb-2 w-full touch-none cursor-grab active:cursor-grabbing">
              <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
            </div>

            <div className="px-6 pb-2 pt-1 flex items-center justify-between shrink-0">
              <h2 className="text-xl font-semibold text-slate-900 tracking-tight mb-4">
                Tools Directory
              </h2>
              <button className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-200 transition-colors text-base font-semibold active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
                onClick={onClose}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 pb-2 pt-2 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-full relative flex flex-1 items-center h-[46px] bg-white rounded-[50px] border border-slate-200 shadow-sm transition-all overflow-hidden focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100">
                  <Search className="w-4 h-4 text-slate-600 ml-4 absolute" />
                  <><label htmlFor="a11y-input-7" className="sr-only">Search tools & calculations...</label>
<input id="a11y-input-7"
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search tools & calculations..."
                    className="w-full h-full bg-transparent border-none outline-none focus:ring-0 text-sm font-medium text-slate-700 placeholder:text-slate-600 pl-10 pr-3 rounded-full"
                  /></>
                </div>
              </div>
            </div>

            <div className="w-full overflow-x-auto hide-scrollbar px-6 py-2 shrink-0 border-b border-slate-100">
              <div className="flex items-center gap-2">
                {categories.map((cat, idx) => (
                  <button
                    key={cat}
                    onClick={() => setActiveTab(idx)}
                    className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      activeTab === idx
                        ? "bg-white text-slate-900 shadow-md"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-x-hidden relative rounded-full transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm">
              <motion.div
                className="h-full overflow-y-auto px-6 pb-8 pt-4"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                dragDirectionLock
                onDragEnd={handleDragEnd}
                animate={{ x: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <div className="flex flex-col gap-2">
                  <AnimatePresence mode="popLayout">
                    {filteredTools.map((tool) => (
                      <motion.button
                        key={tool.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => {
                          onSelectModule(tool.id as ModuleId);
                          onClose();
                        }}
                        className="group relative flex items-center gap-4 w-full p-3.5 bg-bg-card/80 rounded-[24px] border border-transparent shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-200 text-left active:scale-95 flex-wrap"
                      >
                        <div className="w-full flex-shrink-0 w-12 h-12 rounded-[14px] bg-white border border-slate-100 flex items-center justify-center text-slate-700 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-colors shadow-sm relative z-10 overflow-hidden">
                          {typeof tool.icon === "function"
                            ? (() => {
                                const Icon = tool.icon as any;
                                return <Icon className="w-6 h-6" />;
                              })()
                            : React.isValidElement(tool.icon) &&
                              React.cloneElement(
                                tool.icon as React.ReactElement,
                                { className: "w-5 h-5" } as any,
                              )}
                        </div>
                        <div className="flex-1 min-w-0 relative z-10">
                          <h4 className="leading-snug truncate group-hover:text-indigo-600 transition-colors text-lg font-medium text-slate-800 mb-4">
                            {tool.title}
                          </h4>
                          <p className="truncate mt-0.5 text-base font-normal text-slate-600 leading-relaxed">
                            {ALL_MODULES.find((m) => m.id === tool.id)
                              ?.category || "Tool"}
                          </p>
                        </div>
                      </motion.button>
                    ))}
                  </AnimatePresence>
                  {filteredTools.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-10 text-slate-500 font-medium"
                    >
                      <div className="bg-slate-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Search className="w-5 h-5 text-slate-600" />
                      </div>
                      No tools found in {activeCategory}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
