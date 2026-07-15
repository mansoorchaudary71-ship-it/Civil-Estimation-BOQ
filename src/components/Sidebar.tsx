import { useState, useEffect } from "react";
import { cn } from "../lib/utils";
import { useAuth } from "../contexts/AuthContext";
import { 
  Search, Settings, X, ChevronDown, User, LogOut, 
  Home, Layers, Calculator, Building2, Zap, Route, 
  FlaskConical, MapPin, Ruler, Boxes, Sun, Truck, Mountain,
  Sparkles, Droplet,
  LayoutDashboard,
  Users, Grid2X2, Waves, Pickaxe,
  Building, Square, ArrowRightLeft, Layout, Triangle, Activity
} from "lucide-react";

export type ModuleId = string;

interface SidebarProps {
  activeModule: ModuleId;
  onSelectModule: (id: ModuleId) => void;
  isOpen?: boolean;
  onClose?: () => void;
  onOpenAuth?: () => void;
  onOpenProfile?: () => void;
}

type SubTool = {
  id: string;
  label: string;
};

type PrimaryTool = {
  id: ModuleId;
  label: string;
  icon: any;
  subTools: SubTool[];
};

type MainCategory = {
  id: string;
  label: string;
  icon: any;
  tools: PrimaryTool[];
};

const SIDEBAR_DATA: MainCategory[] = [
  {
    id: "team",
    label: "Team & Projects",
    icon: Users,
    tools: [
      {
        id: "team-collaboration",
        label: "Team Collaboration",
        icon: Users,
        subTools: []
      }
    ]
  },
  {
    id: "structural-design",
    label: "Structural Design",
    icon: Building2,
    tools: [
      {
        id: "beam-design",
        label: "Beam Design Tool",
        icon: Layers,
        subTools: []
      },
      {
        id: "column-design",
        label: "Column Design Tool",
        icon: Building2,
        subTools: []
      },
      {
        id: "raft-foundation",
        label: "Raft Foundation",
        icon: Grid2X2,
        subTools: []
      },
      {
        id: "water-tank-design",
        label: "Water Tank Design",
        icon: Waves,
        subTools: []
      },
      {
        id: "pile-foundation",
        label: "Pile Foundation",
        icon: Pickaxe,
        subTools: []
      },
      {
        id: "prestressed-concrete",
        label: "Pre-stressed Concrete",
        icon: Layers,
        subTools: []
      }
    ]
  },
  {
    id: "concrete-tech",
    label: "Concrete Tech",
    icon: Building2,
    tools: [
      {
        id: "concrete-masonry-hub",
        label: "Concrete & Masonry Hub",
        icon: Layers,
        subTools: [
          { id: "cmh-slab", label: "Slab Calculator" },
          { id: "cmh-column", label: "Column Calculator" },
          { id: "cmh-beam", label: "Beam Calculator" },
          { id: "cmh-foundation", label: "Foundation" },
          { id: "cmh-retaining", label: "Retaining Wall" },
        ]
      },
      {
        id: "steel-hub",
        label: "Steel & Reinforcement Hub",
        icon: Zap,
        subTools: [
          { id: "steel-bbs", label: "BBS Generator" },
          { id: "steel-weight", label: "Section Weight" },
          { id: "steel-estimation", label: "Bar Estimation" },
          { id: "steel-cage", label: "Cage Estimator" },
          { id: "steel-detail", label: "Detailing Visualizer" },
          { id: "steel-formwork", label: "Formwork & Scaffold" },
        ]
      },
      {
        id: "aggregate-tests",
        label: "Aggregate Tests",
        icon: FlaskConical,
        subTools: [
          { id: "at-impact", label: "Impact Value" },
          { id: "at-crushing", label: "Crushing Value" },
          { id: "at-abrasion", label: "Abrasion Value" },
          { id: "at-water", label: "Water Absorption" },
        ]
      }
    ]
  },
  {
    id: "project-costing",
    label: "Project Costing",
    icon: Users,
    tools: [
      {
        id: "labour-calculator",
        label: "Labour & Workforce",
        icon: Users,
        subTools: []
      }
    ]
  },
  {
    id: "quantity-estimator",
    label: "Quantity Estimator",
    icon: Calculator,
    tools: [
      {
        id: "qs-workflow",
        label: "Guided QS Workflow",
        icon: Activity,
        subTools: []
      },
      {
        id: "house",
        label: "House Estimator",
        icon: Home,
        subTools: [
          { id: "he-grey", label: "Grey Structure" },
          { id: "he-finishing", label: "Finishing Works" },
        ]
      },
      {
        id: "area-space-calculator",
        label: "Plot Area Calculator",
        icon: MapPin,
        subTools: [
          { id: "asc-shape", label: "2D Shape Calc" },
          { id: "asc-property", label: "Property Area" },
          { id: "asc-plot", label: "Plot Measure" },
          { id: "asc-roof", label: "Roof & Pitch" },
        ]
      },
      {
        id: "volume-estimator",
        label: "Volume & Tank Capacity",
        icon: Boxes,
        subTools: [
          { id: "vt-underground", label: "Underground Tank" },
          { id: "vt-overhead", label: "Overhead Tank" },
          { id: "vt-standard", label: "Standard Volumes" },
        ]
      }
    ]
  },
  {
    id: "architectural-references",
    label: "Space Planning",
    icon: Layout,
    tools: [
      {
        id: "room-area-calculator",
        label: "Room Area Calculator",
        icon: Square,
        subTools: []
      },
      {
        id: "building-setback-calculator",
        label: "Building Setback Calculator",
        icon: ArrowRightLeft,
        subTools: []
      },
      {
        id: "far-fsi-calculator",
        label: "FAR/FSI Calculator",
        icon: Building,
        subTools: []
      },
      {
        id: "staircase-design-reference",
        label: "Staircase Design Reference",
        icon: Triangle,
        subTools: []
      },
      {
        id: "door-window-schedule",
        label: "Door & Window Schedule",
        icon: Layout,
        subTools: []
      },
      {
        id: "ventilation-checker",
        label: "Ventilation & Lighting",
        icon: Sun,
        subTools: []
      }
    ]
  },
  {
    id: "mep",
    label: "MEP",
    icon: Zap,
    tools: [
      {
        id: "mep-calculator",
        label: "Energy & MEP Calculators",
        icon: Zap,
        subTools: [
          { id: "mep-water", label: "Water Heating" },
          { id: "mep-ac", label: "AC Sizing" },
        ]
      },
      {
        id: "rainwater-harvesting",
        label: "Rainwater Harvesting",
        icon: Droplet,
        subTools: []
      },
      {
        id: "solar-roof",
        label: "Solar Roof Calculator",
        icon: Sun,
        subTools: [
          { id: "sr-system", label: "System Size" },
          { id: "sr-panel", label: "Panel Count" },
          { id: "sr-roi", label: "ROI Calculator" },
        ]
      }
    ]
  },
  {
    id: "road-construction",
    label: "Road Construction",
    icon: Route,
    tools: [
      {
        id: "earthworks",
        label: "Earthworks Suite",
        icon: Mountain,
        subTools: [
          { id: "ew-general", label: "General Earthwork" },
          { id: "ew-chainage", label: "Road Chainage & Mass Haul" },
          { id: "ew-grid", label: "Grid Method" },
          { id: "ew-slope", label: "Slope Stability" },
        ]
      },
      {
        id: "road-pavement",
        label: "Road & Pavement Estimator",
        icon: Truck,
        subTools: [
          { id: "rp-flexible", label: "Flexible Pavement" },
          { id: "rp-rigid", label: "Rigid Pavement" },
          { id: "rp-sewerage", label: "Sewerage" },
        ]
      }
    ]
  },
  {
    id: "soil-tests",
    label: "Soil Tests",
    icon: FlaskConical,
    tools: [
      {
        id: "soil-lab-suite",
        label: "Soil & Materials Lab",
        icon: Layers,
        subTools: [
          { id: "sl-index", label: "Index Properties" },
          { id: "sl-gradation", label: "Gradation" },
          { id: "sl-strength", label: "Strength & Permeability" },
          { id: "sl-aggregates", label: "Road Aggregates" },
        ]
      }
    ]
  }
];

export default function Sidebar({
  activeModule,
  onSelectModule,
  isOpen,
  onClose,
  onOpenAuth,
  onOpenProfile,
}: SidebarProps) {
  const { user, logOut, signInWithGoogle } = useAuth();
  const isAuthenticated = !!user;
  
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [expandedTool, setExpandedTool] = useState<ModuleId | null>(null);
  const [activeSubTool, setActiveSubTool] = useState<string | null>(null);
  
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // Clear auth error after 5 seconds
  useEffect(() => {
    if (authError) {
      const timer = setTimeout(() => setAuthError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [authError]);

  const handleGoogleSignIn = async () => {
    try {
      setAuthError(null);
      setIsAuthLoading(true);
      await signInWithGoogle();
      onClose?.();
    } catch (error: any) {
      console.error(error);
      if (error?.code === 'auth/popup-blocked') {
        setAuthError("Popup blocked. Please open this app in a new tab to sign in.");
      } else {
        setAuthError(error?.message || "Failed to sign in.");
      }
    } finally {
      setIsAuthLoading(false);
    }
  };

  useEffect(() => {
    let foundTool = null;
    let foundCategory = null;
    for (const category of SIDEBAR_DATA) {
      const tool = category.tools.find(t => t.id === activeModule);
      if (tool) {
        foundTool = tool;
        foundCategory = category;
        break;
      }
    }
    
    if (foundTool && foundCategory) {
      setExpandedCategory(foundCategory.id);
      setExpandedTool(foundTool.id);
      
      setActiveSubTool(prev => {
        if (foundTool.subTools.some(st => st.id === prev)) {
           return prev;
        }
        return foundTool.subTools[0]?.id || null;
      });
    }
  }, [activeModule]);

  const handleSelectStandalone = (id: ModuleId) => {
    onSelectModule(id);
    setExpandedCategory(null);
    setExpandedTool(null);
    setActiveSubTool(null);
    if (window.innerWidth < 1024) onClose?.();
  };

  const handleSelectSubTool = (toolId: ModuleId, subToolId: string) => {
    setActiveSubTool(subToolId);
    onSelectModule(toolId);
    if (window.innerWidth < 1024) onClose?.();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-[#F5F5F7] backdrop-blur-sm z-[100] transition-opacity lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Main Drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-[110] transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col w-[85vw] max-w-[320px] bg-white/70  backdrop-blur-xl border-r border-slate-200/50  h-[100dvh] shadow-2xl lg:relative lg:translate-x-0 lg:w-full lg:max-w-[300px]",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header Row */}
        <div className="flex items-center justify-between px-6 py-5 shrink-0 lg:hidden">
          <div className="text-xl font-semibold tabular-nums tracking-tight tracking-tighter text-slate-900 dark:text-white uppercase">
            Esti<span className="text-indigo-600">Pro</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-900 lg:hidden">
            <button onClick={onClose} aria-label="Close menu" className="w-full hover:text-slate-500 transition-colors bg-white/50 backdrop-blur-sm p-2 rounded-full shadow-sm text-base font-semibold active:scale-95 hover:-translate-y-0.5 overflow-hidden">
              <X className="w-5 h-5 stroke-[2]" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <nav className="flex-1 overflow-y-auto w-full px-4 py-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          
          {/* Top Search bar as in 2nd image */}
          <div className="flex items-center gap-3 w-full mb-8 mt-2 px-2">
            <button 
              onClick={() => {
                handleSelectStandalone("home");
                setTimeout(() => {
                   document.getElementById('search-bar-container')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                   const input = document.querySelector('#search-bar-container input') as HTMLInputElement;
                   if (input) input.focus();
                }, 300);
              }}
              className="flex-1 flex items-center justify-between h-[46px] px-5 rounded-full border border-[#ff9f43] [#ff7f50] text-[#ff9f43] [#ff7f50] bg-transparent hover:bg-[#ff9f43]/5[#ff7f50]/10 transition-colors active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
            >
              <span className="text-sm font-medium opacity-80">Search tools.</span>
            </button>
            <button aria-label="Search" 
              onClick={() => {
                handleSelectStandalone("home");
                setTimeout(() => {
                   document.getElementById('search-bar-container')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                   const input = document.querySelector('#search-bar-container input') as HTMLInputElement;
                   if (input) input.focus();
                }, 300);
              }}
              className="w-[46px] h-[46px] shrink-0 rounded-full border border-[#ff9f43] [#ff7f50] text-[#ff9f43] [#ff7f50] flex items-center justify-center hover:bg-[#ff9f43]/5[#ff7f50]/10 transition-colors active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
            >
              <Search className="w-5 h-5" strokeWidth={2.5} />
            </button>
          </div>

          {/* Standalone Items */}
          <div className="flex flex-col mb-6 px-1">
            <button
              onClick={() => handleSelectStandalone("home")}
              className={cn(
                "flex items-center gap-4 px-3 py-3 w-full rounded-[20px] transition-all duration-300",
                activeModule === "home"
                  ? "bg-white dark:bg-slate-800/60"
                  : "hover:bg-slate-50/50"
              )}
            >
              <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-slate-900 shadow-sm bg-[#54a0ff]")}>
                <LayoutDashboard className="w-5 h-5 rounded-full transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm" strokeWidth={2} />
              </div>
              <span className={cn(
                "flex-1 text-left text-base font-medium tracking-tight",
                activeModule === "home" ? "text-slate-900 dark:text-white font-semibold" : "text-slate-700 "
              )}>Dashboard</span>
            </button>
            <button
              onClick={() => handleSelectStandalone("takeoff")}
              className={cn(
                "flex items-center gap-4 px-3 py-3 w-full rounded-[20px] transition-all duration-300",
                activeModule === "takeoff"
                  ? "bg-white dark:bg-slate-800/60"
                  : "hover:bg-slate-50/50"
              )}
            >
              <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-slate-900 shadow-sm bg-[#1dd1a1]")}>
                <Layers className="w-5 h-5 rounded-full transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm" strokeWidth={2} />
              </div>
              <span className={cn(
                "flex-1 text-left text-base font-medium tracking-tight",
                activeModule === "takeoff" ? "text-slate-900 dark:text-white font-semibold" : "text-slate-700 "
              )}>2D Takeoff</span>
            </button>
            <button
              onClick={() => handleSelectStandalone("ai")}
              className={cn(
                "flex items-center gap-4 px-3 py-3 w-full rounded-[20px] transition-all duration-300",
                activeModule === "ai"
                  ? "bg-white dark:bg-slate-800/60"
                  : "hover:bg-slate-50/50"
              )}
            >
              <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-slate-900 shadow-sm bg-[#8b6cff]")}>
                 <Sparkles className="w-5 h-5 rounded-full transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm" strokeWidth={2} />
              </div>
              <span className={cn(
                "flex-1 text-left text-base font-medium tracking-tight",
                activeModule === "ai" ? "text-slate-900 dark:text-white font-semibold" : "text-slate-700 "
              )}>AI Civil Assistant</span>
            </button>
          </div>

          <div className="w-full h-px bg-slate-200/50 mb-6" />

          <div className="flex flex-col gap-2 pb-6">
            <h3 className="px-4 text-sm uppercase st mb-3 text-lg font-medium text-slate-800 mb-4">Core Estimators</h3>
            
            {SIDEBAR_DATA.map((category, idx) => {
              const isCategoryExpanded = expandedCategory === category.id;
              
              return (
                <div key={category.id} className="flex flex-col mb-1">
                  {/* Category Header */}
                  <button 
                    onClick={() => setExpandedCategory(isCategoryExpanded ? null : category.id)}
                    className="flex justify-between items-center px-4 py-3 w-full group rounded-full transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
                  >
                    <span className="text-base font-medium uppercase tracking-wider group-hover:text-slate-800 transition-colors">
                      {category.label}
                    </span>
                    <ChevronDown className={cn("w-4 h-4 text-slate-600 transition-transform duration-300", isCategoryExpanded && "rotate-180")} />
                  </button>

                  {/* Primary Tools */}
                  {isCategoryExpanded && (
                    <div className="flex flex-col gap-1 mt-1 mb-3 animate-in slide-in-from-top-2 fade-in duration-200 px-2">
                      {category.tools.map((tool, tIdx) => {
                        const isToolExpanded = expandedTool === tool.id;
                        
                        let iconBg = 'bg-[#8b6cff]';
                        switch (category.label) {
                          case "Concrete Tech": iconBg = "bg-[#E55A2B]"; break;
                          case "Quantity Estimator": iconBg = "bg-[#6B46C1]"; break;
                          case "Road Construction": iconBg = "bg-[#FFFFFF]"; break;
                          case "Structural Design": iconBg = "bg-[#BE185D]"; break;
                          case "Soil Tests": iconBg = "bg-[#D97706]"; break;
                          case "MEP": iconBg = "bg-[#2563EB]"; break;
                          case "Analysis & Tools": iconBg = "bg-[#4338CA]"; break;
                        }

                        return (
                          <div key={tool.id} className="flex flex-col">
                            <button 
                              onClick={() => {
                                setExpandedTool(isToolExpanded ? null : tool.id);
                              }}
                              className={cn(
                                "flex items-center gap-4 px-3 py-3 w-full rounded-[20px] transition-all",
                                isToolExpanded || activeModule === tool.id
                                  ? "bg-white dark:bg-slate-800/60"
                                  : "hover:bg-slate-50/50"
                              )}
                            >
                              <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-slate-900 shadow-sm", iconBg)}>
                                <tool.icon className="w-5 h-5 rounded-full transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm" strokeWidth={2} />
                              </div>
                              <span className={cn(
                                "flex-1 text-left text-base font-medium tracking-tight",
                                isToolExpanded || activeModule === tool.id ? "text-slate-900 dark:text-white font-semibold" : "text-slate-700 "
                              )}>
                                {tool.label}
                              </span>
                              {tool.subTools.length > 0 && (
                                <ChevronDown className={cn("w-4 h-4 transition-transform duration-300 opacity-50 text-slate-600", isToolExpanded && "rotate-180")} />
                              )}
                            </button>

                            {/* Sub-tools list */}
                            {tool.subTools.length > 0 && (
                              <div 
                                className={cn(
                                  "flex flex-col ml-[28px] pl-6 border-l-2 border-slate-200 dark:border-slate-700 overflow-hidden transition-all duration-300",
                                  isToolExpanded ? "max-h-[500px] mt-2 mb-2 opacity-100 py-1" : "max-h-0 opacity-0"
                                )}
                              >
                                {tool.subTools.map(subTool => {
                                  const isSubActive = activeSubTool === subTool.id;
                                  return (
                                    <button
                                      key={subTool.id}
                                      onClick={() => handleSelectSubTool(tool.id, subTool.id)}
                                      className={cn(
                                        "text-left py-2.5 text-sm transition-all relative group",
                                        isSubActive 
                                          ? "text-slate-900 dark:text-white font-medium" 
                                          : "text-slate-500  hover:text-slate-800"
                                      )}
                                    >
                                      {isSubActive && (
                                        <span className="w-full absolute left-[-26px] top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white/70 backdrop-blur-md border border-white/20 shadow-sm transition-all duration-300 active:scale-95 hover:-translate-y-0.5 overflow-hidden" />
                                      )}
                                      <span className="relative z-10 transition-transform duration-200 block group-hover:translate-x-1">
                                        {subTool.label}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-200/50 bg-white/50 backdrop-blur-md shrink-0">
          {isAuthenticated ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 mb-1 px-2">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold overflow-hidden border border-indigo-200 shadow-sm">
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt="User Profile Details Avatar" title="User Avatar" loading="lazy" className="w-full h-full object-cover" />
                  ) : (
                    <span>{user?.displayName?.[0]?.toUpperCase() || <User className="w-5 h-5" />}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-normal text-slate-600 leading-relaxed">{user?.displayName || "User"}</p>
                  <p className="truncate text-base font-normal text-slate-600 leading-relaxed">{user?.email}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { onClose?.(); onOpenProfile?.(); }}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-full text-base font-medium bg-bg-card border border-slate-200 dark:border-slate-700 shadow-sm hover:bg-slate-50 transition-colors active:scale-95 hover:-translate-y-0.5"
                >
                  <Settings className="w-4 h-4" /> Account
                </button>
                <button
                  onClick={async () => { await logOut(); onClose?.(); }}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-full text-base font-medium text-red-600 bg-bg-card border border-slate-200 dark:border-slate-700 shadow-sm hover:bg-red-50 hover:border-red-100 transition-colors active:scale-95 hover:-translate-y-0.5"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <button onClick={() => { onClose?.(); onOpenAuth?.(); }}
                className="w-full flex items-center justify-center gap-3 py-3 rounded-full text-slate-700 bg-bg-card border border-slate-200 dark:border-slate-700 shadow-sm hover:bg-slate-50 transition-colors text-base font-semibold active:scale-95 hover:-translate-y-0.5"
              >
                Sign In / Register
              </button>
            </div>
          )}
        </div>

      </aside>
    </>
  );
}

