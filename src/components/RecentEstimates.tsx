import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ModuleId } from "./Dashboard";
import {
  Clock,
  FolderOpen,
  ArrowRight,
  Loader2,
  GripVertical,
  FileText,
  Search,
} from "lucide-react";
import {
  getMyEstimates,
  updateEstimateStatus,
  updateEstimateOrders,
} from "../lib/estimates";
import { useAuth } from "../contexts/AuthContext";
import { ALL_MODULES, getCategoryTheme } from "./Dashboard";

interface Estimate {
  id: string;
  title: string;
  date: string;
  type: ModuleId;
  typeLabel: string;
  color: string;
  icon: any;
  progress: number;
  status: string;
  order?: number;
  desc: string;
  theme: any;
}

const mapCalculatorToModule = (calcId: string): ModuleId => {
  const mapping: Record<string, ModuleId> = {
    area_v1: "area-calculator",
    volume_v1: "volume-estimator",
    unit_converter_v1: "unit-converter",
    metal_weight_v1: "metal-weight",
    rcc_slab_v1: "master-rcc",
    column_v1: "column-estimator",
    staircase_v1: "staircase-calculator",
    master_qty_v1: "master-quantity",
    calculators_v1: "calculators",
    ai_assistant_v1: "ai",
    earthworks_v1: "earthworks",
    grid_earthwork_v1: "earthworks",
    trench_excavation_v1: "earthworks",
    chainage_v1: "chainage",
    road_estimator_v1: "road-pavement",
    rigid_pavement_v1: "road-pavement",
    sewerage_v1: "earthworks",
    formwork_estimator_v1: "formwork",
    finishing_estimator_v1: "interiors-finishes",
    house_estimator_v1: "house",
    rate_analysis_v1: "rates",
  };
  return mapping[calcId] || "calculators";
};

export default function RecentEstimates({
  onSelectModule,
}: {
  onSelectModule: (id: ModuleId, layoutId?: string) => void;
}) {
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [loading, setLoading] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setEstimates([]);
      return;
    }
    const loadEstimates = async () => {
      setLoading(true);
      try {
        const data = (await getMyEstimates()) as any[] | null;
        if (data) {
          const formatted = data
            .sort((a: any, b: any) => {
              if (a.order !== undefined && b.order !== undefined)
                return a.order - b.order;
              if (a.order !== undefined) return -1;
              if (b.order !== undefined) return 1;
              return b.createdAt - a.createdAt;
            })
            .map((d: any) => {
              const modId = mapCalculatorToModule(
                d.payload?.calculatorId || "",
              );
              const modInfo =
                ALL_MODULES.find((m) => m.id === modId) || ALL_MODULES[0];
              const theme = getCategoryTheme(modInfo.category, modInfo.id);

              return {
                id: d.id,
                title: d.name,
                desc:
                  d.type && d.type !== "material_calculation"
                    ? d.type
                    : modInfo.title,
                date: new Date(d.createdAt).toLocaleDateString(),
                type: modId,
                typeLabel: modInfo.category,
                color: theme.bg,
                icon: modInfo.icon,
                progress: 100,
                status: d.status || "To Do",
                order: d.order,
                theme: theme,
              };
            });
          setEstimates(formatted);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadEstimates();
  }, [user]);

  const handleStatusChange = async (
    e: React.ChangeEvent<HTMLSelectElement>,
    id: string,
  ) => {
    e.stopPropagation();
    const newStatus = e.target.value;
    setEstimates((prev) =>
      prev.map((est) => (est.id === id ? { ...est, status: newStatus } : est)),
    );
    try {
      await updateEstimateStatus(id, newStatus);
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    setDragOverId(targetId);
    if (!draggedId || draggedId === targetId) return;

    const originalEstimates = [...estimates];
    const draggedIndex = originalEstimates.findIndex(
      (est) => est.id === draggedId,
    );
    const targetIndex = originalEstimates.findIndex(
      (est) => est.id === targetId,
    );

    if (draggedIndex !== -1 && targetIndex !== -1) {
      const newEstimates = [...originalEstimates];
      const [draggedItem] = newEstimates.splice(draggedIndex, 1);
      newEstimates.splice(targetIndex, 0, draggedItem);
      setEstimates(newEstimates);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDraggedId(null);
    setDragOverId(null);

    try {
      if (estimates.length > 0) {
        await updateEstimateOrders(
          estimates.map((est, idx) => ({ id: est.id, order: idx })),
        );
      }
    } catch (err) {
      console.error("Failed to update estimate order", err);
    }
  };

  const categories = ["All", ...Array.from(new Set(estimates.map(e => e.typeLabel)))];

  const filteredEstimates = estimates.filter(est => {
    const matchesCategory = activeCategory === "All" || est.typeLabel === activeCategory;
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      est.title.toLowerCase().includes(searchLower) ||
      est.typeLabel.toLowerCase().includes(searchLower) ||
      est.date.toLowerCase().includes(searchLower);
    return matchesCategory && matchesSearch;
  });

  if (!user) {
    return (
      <div className="flex-1 w-full md:max-w-7xl md:mx-auto flex flex-col font-sans mb-auto px-4 md:px-0">
        <div className="mb-8 flex flex-col items-center justify-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-500 text-center mt-6">
          <h1 className="md: text-slate-900 dark:text-white flex items-center justify-center gap-2 text-xl font-semibold text-slate-800 tracking-tight mb-6">
            My Projects
          </h1>
          <p className="mt-1 text-base font-normal text-slate-600 leading-relaxed">
            Manage your saved construction projects and estimates
          </p>
        </div>
        <div className="w-full bg-bg-card opacity-90 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-[2rem] p-5 sm:p-8 md:p-10 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-full w-16 h-16 bg-white rounded-[24px] flex items-center justify-center mb-4 text-slate-700 shadow-inner overflow-hidden">
            <FolderOpen className="w-8 h-8" />
          </div>
          <h4 className="mb-1 text-lg font-medium text-slate-800 mb-4">
            Sign in to save estimates
          </h4>
          <p className="max-w-sm mb-6 text-base font-normal text-slate-600 leading-relaxed">
            Your saved estimates will appear here once you sign in and start
            estimating.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 py-20 w-full flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="flex-1 w-full md:max-w-7xl md:mx-auto flex flex-col font-sans pb-12 px-4 md:px-0">
      <div className="mb-8 flex flex-col items-center justify-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-500 text-center mt-6">
        <h1 className="md: text-slate-900 dark:text-white flex items-center justify-center gap-2 text-xl font-semibold text-slate-800 tracking-tight mb-6">
          My Projects
        </h1>
        <p className="mt-1 text-base font-normal text-slate-600 leading-relaxed">
          Manage your saved construction projects and estimates
        </p>
      </div>

      {estimates.length === 0 ? (
        <div className="w-full bg-bg-card opacity-90 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-[2rem] p-5 sm:p-8 md:p-10 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-full w-16 h-16 bg-white rounded-[24px] flex items-center justify-center mb-4 text-slate-700 shadow-inner overflow-hidden">
            <FolderOpen className="w-8 h-8" />
          </div>
          <h4 className="mb-1 text-lg font-medium text-slate-800 mb-4">
            No Projects Yet
          </h4>
          <p className="max-w-sm mb-6 text-base font-normal text-slate-600 leading-relaxed">
            Create a new estimate from the modules globally to see it appear
            here.
          </p>
        </div>
      ) : (
        <>
          <div className="w-full mb-8 flex flex-col md:flex-row gap-4 items-center justify-between animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="relative w-full md:w-96 shrink-0">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search projects, dates, or categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm text-sm font-medium"
                />
             </div>
             
             <div className="flex items-center gap-2 overflow-x-auto w-full pb-2 md:pb-0 scrollbar-hide px-1">
               {categories.map(cat => (
                 <button
                   key={cat}
                   onClick={() => setActiveCategory(cat)}
                   className={`whitespace-nowrap px-5 py-2.5 rounded-full text-[14px] font-medium transition-all duration-300 shadow-sm ${
                     activeCategory === cat 
                       ? 'bg-slate-900 text-white border-slate-800 dark:bg-white dark:text-slate-900 dark:border-white shadow-md' 
                       : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700'
                   }`}
                 >
                   {cat}
                 </button>
               ))}
             </div>
          </div>
          
          {filteredEstimates.length === 0 ? (
            <div className="w-full bg-bg-card opacity-90 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-[2rem] p-5 sm:p-8 md:p-10 flex flex-col items-center justify-center text-center shadow-sm">
              <div className="w-full w-16 h-16 bg-white rounded-[24px] flex items-center justify-center mb-4 text-slate-700 shadow-inner overflow-hidden">
                <Search className="w-8 h-8" />
              </div>
              <h4 className="mb-1 text-lg font-medium text-slate-800 mb-4">
                No matching projects
              </h4>
              <p className="max-w-sm mb-6 text-base font-normal text-slate-600 leading-relaxed">
                Try adjusting your search or category filters.
              </p>
              <button 
                onClick={() => { setSearchTerm(''); setActiveCategory('All'); }}
                className="px-6 py-2.5 bg-slate-900 text-white rounded-full font-medium shadow-sm hover:bg-slate-800 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
              {filteredEstimates.map((est: any) => {
                const Icon = est.icon;

                return (
                  <motion.div
                    layoutId={`recent-${est.id}`}
                    key={est.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, est.id)}
                    onDragOver={(e) => handleDragOver(e as unknown as React.DragEvent, est.id)}
                    onDrop={handleDrop}
                    whileHover={{ scale: 1.02, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    className={`group relative col-span-1 bg-bg-card p-4 md:p-4 rounded-[24px] transition-all duration-300 flex flex-col items-center text-center border-2 ${est.theme.border} cursor-pointer shadow-sm hover:shadow-xl overflow-hidden ${dragOverId === est.id ? "!border-indigo-500 shadow-indigo-500/20" : ""} ${draggedId === est.id ? "opacity-50" : "opacity-100"}`}
                    onClick={() => onSelectModule(est.type, `recent-${est.id}`)}
                    style={{ minHeight: "150px" }}
                  >
                    {/* Drag Handle Top Left */}
                    <div
                      className="absolute top-4 left-4 z-20 cursor-grab text-slate-700 hover:text-slate-500 p-1"
                      onPointerDown={(e) => e.stopPropagation()}
                    >
                      <GripVertical className="w-5 h-5" />
                    </div>

                    {/* Status Selector Top Right */}
                    <div className="absolute top-4 right-4 z-20">
                      <select
                        value={est.status}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => handleStatusChange(e, est.id)}
                        className={`text-base font-medium rounded-[24px] px-2 py-1.5 border-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50 cursor-pointer shadow-sm transition-colors ${
                          est.status === "Completed"
                            ? "bg-green-100 text-green-700  "
                            : est.status === "In Progress"
                              ? "bg-amber-100 text-amber-700  "
                              : "bg-slate-100 text-slate-600  "
                        }`}
                      >
                        <option value="To Do">To Do</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>

                    <div className="relative z-10 w-full flex-1 flex flex-col items-center mt-6">
                      <div className="relative w-14 h-14 md:w-16 md:h-16 flex items-center justify-center mb-4 shrink-0">
                        <div
                          className={`absolute inset-0 rounded-full ${est.theme.bg} opacity-20 blur-[12px] md:blur-[16px] transition-transform duration-500 group-hover:scale-150 group-active:scale-100`}
                        />
                        <Icon
                          className={`relative z-10 w-7 h-7 md:w-8 md:h-8 ${est.theme.textRaw} transition-all duration-300 group-hover:scale-110 group-active:scale-95 group-active:rotate-12`}
                          strokeWidth={2.5}
                        />
                      </div>

                      <div
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[24px] border ${est.theme.border} bg-white dark:bg-slate-800 shadow-sm text-sm md:text-base font-medium tracking-[0.1em] uppercase ${est.theme.textRaw} mb-4`}
                      >
                        <span className="truncate">{est.typeLabel}</span>
                      </div>

                      <h3 className="md: text-slate-900 dark:text-white mb-2 leading-[1.2] text-lg font-medium text-slate-800 mb-4">
                        {est.title}
                      </h3>

                      <div className="flex flex-col items-center mt-auto">
                        <p className="md: whitespace-nowrap overflow-hidden text-ellipsis mb-1 text-base font-normal text-slate-600 leading-relaxed">
                          <FileText className="w-3 h-3 inline mr-1 opacity-70" />{" "}
                          {est.desc}
                        </p>
                        <p className="text-base font-normal text-slate-600 leading-relaxed">
                          Saved: {est.date}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
