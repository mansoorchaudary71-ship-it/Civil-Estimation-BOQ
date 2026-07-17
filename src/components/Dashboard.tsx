import { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Calculator,
 Sparkles,
 Route,
 Waves,
 Paintbrush,
 Home,
 TrendingUp,
 Hammer,
 Layers,
 Map,
 Grid2X2,
 Box,
 ArrowRightLeft,
 HardHat,
 Scaling,
 Container,
 Repeat,
 Anvil,
 Building2,
 Building,
 Shovel,
 Pickaxe,
 Cone,
 Droplet,
 Ruler,
 FolderOpen,
 ClipboardList,
 Maximize2,
 FileSpreadsheet,
 Zap,
 LineChart,
 Sun,
 BarChart,
 ShieldCheck,
 Users, Activity, BookOpen, FileText,
 Triangle,
 Bug,
 Layout,
 Square,
 Bookmark,
 X,
 ArrowUpRight,
} from "lucide-react";
import { SEO } from "./SEO";
import SearchAndFilterBar from "./SearchAndFilterBar";
import HeroSection from "./HeroSection";
import SocialProofSection from "./SocialProofSection";
import WorkspaceSection from "./WorkspaceSection";
import SummaryStatsWidget from "./SummaryStatsWidget";

import { HowItWorksSection,
 FeatureComparisonSection,
} from "./LandingSections";

import { useSettings } from "../context/SettingsContext";
import ToolCard from "./ToolCard";
import { ScrollReveal } from "./ui/ScrollReveal";
import { useRecentTools } from "../hooks/useRecentTools";
import { History } from "lucide-react";

import AIEstimatorBanner from "./AIEstimatorBanner";

function formatTimeAgo(timestamp: number) {
 const diff = Date.now() - timestamp;
 const minutes = Math.floor(diff / 60000);
 if (minutes < 1) return 'Just now';
 if (minutes < 60) return `${minutes}m ago`;
 const hours = Math.floor(minutes / 60);
 if (hours < 24) return `${hours}h ago`;
 const days = Math.floor(hours / 24);
 return `${days}d ago`;
}

export type ModuleId = string;
export const ALL_MODULES = [
 // 🚀 Guided Workflows
 {
 id: "qs-workflow",
 title: "Guided QS Workflow",
 desc: "Walks users through a complete sequence: Project Setup, Drawings, Substructure, Superstructure, Masonry, Services, BOQ Compilation, and final Report.",
 category: "Quantity Estimation",
 icon: Activity, BookOpen, FileText,
 styleStyle: "solid",
 colorClass: "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30",
 difficulty: "Intermediate",
 estimatedTime: "~20 mins",
 isNew: true,
 isPopular: true,
 },

 {
 id: "house",
 title: "House Estimator",
 desc: "Calculate complete residential construction costs from excavation to finishing. Contractors benefit by getting an accurate Civil Estimation Pro material breakdown instantly.",
 category: "Quantity Estimation",
 icon: Home,
 premium: true,
 styleStyle: "glass",
 colorClass:
 "bg-white/80 backdrop-blur-md text-[var(--primary-dark)] ",
 difficulty: "Advanced",
 estimatedTime: "~15 mins",
 isPopular: true,
 },
 {
 id: "takeoff",
 title: "Plan Measure",
 desc: "Area & linear extraction.",
 category: "Quantity Estimation",
 icon: Ruler,
 styleStyle: "solid",
 colorClass:
 "bg-[var(--accent-purple)] text-slate-900 shadow-[0_8px_30px_rgba(115,103,240,0.3)]",
 iconClass: "text-slate-900 opacity-90",
 difficulty: "Advanced",
 estimatedTime: "~10 mins",
 isPopular: true,
 },
 {
 id: "rates",
 title: "Live DB Rates",
 desc: "Centralized database for local market prices.",
 category: "Quantity Estimation",
 icon: TrendingUp,
 styleStyle: "glass",
 colorClass:
 "bg-white/80 backdrop-blur-md text-[var(--primary-dark)] ",
 difficulty: "Beginner",
 estimatedTime: "~1 min",
 isPopular: true,
 },
 {
 id: "ai",
 title: "AI Assistant",
 desc: "Ask anything about construction",
 category: "Quantity Estimation",
 icon: Sparkles,
 premium: true,
 styleStyle: "solid",
 colorClass: "bg-[var(--primary-dark)] text-slate-900 shadow-lg",
 iconClass: "text-slate-900 opacity-90",
 difficulty: "Beginner",
 estimatedTime: "~1 min",
 isNew: true,
 },

 // 📦 QUANTITY ESTIMATOR
 {
 id: "quick-estimation",
 title: "Quick Rough Estimation",
 desc: "Get a lightning-fast preliminary budget and timeline in under 5 seconds based on simple inputs.",
 category: "Quantity Estimation",
 icon: Calculator,
 styleStyle: "solid",
 colorClass: "bg-indigo-600 text-white shadow-lg",
 difficulty: "Beginner",
 estimatedTime: "~1 min",
 isNew: true,
 },
 {
 id: "master-quantity",
 title: "Master Quantity & Estimation",
 desc: "23 comprehensive calculators for specialized construction items.",
 category: "Quantity Estimation",
 icon: ClipboardList,
 styleStyle: "solid",
 colorClass:
 "bg-[var(--accent-blue)] text-[var(--primary-dark)] shadow-[0_8px_30px_rgba(0,207,232,0.3)]",
 iconClass: "text-[var(--primary-dark)] opacity-90",
 difficulty: "Advanced",
 estimatedTime: "~20 mins",
 },
 {
 id: "material-takeoff",
 title: "Material Takeoff Sheet",
 desc: "Auto-calculate cement, sand, aggregate, block, and finishing material quantities based on built-up area and floors.",
 category: "Quantity Estimation",
 icon: Calculator,
 styleStyle: "solid",
 colorClass: "bg-blue-500 text-slate-900 shadow-lg",
 difficulty: "Beginner",
 estimatedTime: "~3 mins",
 isNew: true,
 },
 {
 id: "cost-summary",
 title: "Cost Summary Sheet",
 desc: "Consolidate structural, finishing, and labour costs into a master cost summary with overhead and contingency calculations.",
 category: "Quantity Estimation",
 icon: ClipboardList,
 styleStyle: "solid",
 colorClass: "bg-emerald-600 text-slate-900 shadow-lg",
 difficulty: "Beginner",
 estimatedTime: "~6 mins",
 isNew: true,
 },
 {
 id: "measurement-sheet",
 title: "Measurement Sheet Calculator",
 desc: "Interactive civil engineering measurement sheet with auto-calculating sections for excavation, PCC, RCC, and finishes.",
 category: "Quantity Estimation",
 icon: ClipboardList,
 styleStyle: "solid",
 colorClass: "bg-[#FFFFFF] text-slate-900 shadow-lg",
 difficulty: "Beginner",
 estimatedTime: "~5 mins",
 isNew: true,
 },
 {
 id: "boq",
 title: "Professional BOQ Generator",
 desc: "Calculate and format standardized Bills of Quantities for construction projects. Quantity surveyors rely on Civil Estimation Pro to export precise, itemized cost documents.",
 category: "Quantity Estimation",
 icon: ClipboardList,
 styleStyle: "solid",
 colorClass: "bg-blue-600 text-white shadow-lg",
 difficulty: "Advanced",
 estimatedTime: "~5 mins",
 isNew: true,
 },
 {
 id: "interiors-finishes",
 title: "Interiors & Finishes",
 desc: "Tiles, painting, doors, wood framing, and termite treatments.",
 category: "Quantity Estimation",
 icon: Paintbrush,
 styleStyle: "glass",
 colorClass:
 "bg-white/80 backdrop-blur-md text-[var(--primary-dark)] ",
 difficulty: "Beginner",
 estimatedTime: "~3 mins",
 },
 {
 id: "area-space-calculator",
 title: "Plot Area Calculator",
 desc: "Calculate dimensional areas, RERA property spaces, plots, and roof material.",
 category: "Quantity Estimation",
 icon: Scaling,
 styleStyle: "glass",
 colorClass:
 "bg-white/80 backdrop-blur-md text-[var(--primary-dark)] ",
 difficulty: "Intermediate",
 estimatedTime: "~3 mins",
 },
 {
 id: "volume-estimator",
 title: "Volume & Tank Capacity",
 desc: "Calculate volumes, tank capacity & surface area.",
 category: "Quantity Estimation",
 icon: Container,
 styleStyle: "glass",
 colorClass:
 "bg-white/80 backdrop-blur-md text-[var(--primary-dark)] ",
 difficulty: "Intermediate",
 estimatedTime: "~3 mins",
 },
 {
 id: "metal-weight",
 title: "Metal Weight",
 desc: "Calculate section weights of steel profiles.",
 category: "Quantity Estimation",
 icon: Anvil,
 styleStyle: "glass",
 colorClass:
 "bg-white/80 backdrop-blur-md text-[var(--primary-dark)] ",
 difficulty: "Intermediate",
 estimatedTime: "~3 mins",
 },
 {
 id: "unit-converter",
 title: "Unit Converter",
 desc: "Convert units across 15 engineering categories.",
 category: "Quantity Estimation",
 icon: Repeat,
 styleStyle: "glass",
 colorClass:
 "bg-white/80 backdrop-blur-md text-[var(--primary-dark)] ",
 difficulty: "Beginner",
 estimatedTime: "~1 min",
 },
 // 📊 ANALYSIS & TOOLS
 {
 id: "projects",
 title: "Project Manager",
 desc: "Group calculations by project, view aggregated costs and timelines.",
 category: "Quantity Estimation",
 icon: FolderOpen,
 styleStyle: "solid",
 colorClass: "bg-indigo-600 text-white shadow-lg",
 difficulty: "Beginner",
 estimatedTime: "~1 min",
 isNew: true,
 },
 {
 id: "tracker",
 title: "Site Progress Tracker",
 desc: "Track construction timelines, visual Gantt charts, budget burn, and photo updates.",
 category: "Quantity Estimation",
 icon: BarChart,
 styleStyle: "glass",
 colorClass:
 "bg-white/80 backdrop-blur-md text-[var(--primary-dark)] ",
 difficulty: "Beginner",
 estimatedTime: "~3 mins",
 isNew: true,
 },
 {
 id: "labour-calculator",
 title: "Labour & Workforce",
 desc: "Calculate labour cost, worker allocation, and daily burn rates for your project.",
 category: "Quantity Estimation",
 icon: Users,
 styleStyle: "glass",
 colorClass:
 "bg-white/80 backdrop-blur-md text-[var(--primary-dark)] ",
 difficulty: "Intermediate",
 estimatedTime: "~2 mins",
 isNew: true,
 },

 // 🏗️ CONCRETE TECH
 {
 id: "master-rcc",
 title: "Master RCC Estimator",
 desc: "This Civil Estimation Pro tool calculates quantities for slabs, columns, beams, and staircases. Structural engineers benefit from instant concrete and steel volume outputs.",
 category: "Concrete",
 icon: Building2,
 styleStyle: "solid",
 colorClass:
 "bg-[var(--accent-teal)] text-slate-900 shadow-[0_8px_30px_rgba(32,201,151,0.3)]",
 iconClass: "text-slate-900 opacity-90",
 difficulty: "Advanced",
 estimatedTime: "~10 mins",
 isPopular: true,
 },
 {
 id: "calculators",
 title: "Construction Material",
 desc: "Accurate estimations for concrete, bricks, steel, blocks, mortar.",
 category: "Concrete",
 icon: HardHat,
 styleStyle: "solid",
 colorClass:
 "bg-gradient-to-br from-indigo-500 to-cyan-500 text-slate-900 shadow-[0_8px_30px_rgba(99,102,241,0.3)]",
 iconClass: "text-slate-900 opacity-90",
 difficulty: "Beginner",
 estimatedTime: "~2 mins",
 isPopular: true,
 },
 // 📝 RESOURCES
 {
 id: "boq-templates",
 title: "BOQ Templates",
 desc: "Downloadable Bill of Quantities templates in Excel format.",
 category: "Resources",
 icon: FileText,
 styleStyle: "solid",
 colorClass: "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30",
 difficulty: "Beginner",
 estimatedTime: "Download",
 isPopular: true,
 },
 // ✨ ARCHITECTURAL REFERENCES & SPACE PLANNING
 {
 id: "room-area-calculator",
 title: "Room Area Calculator",
 desc: "Calculate net vs gross area and check NBC/RERA minimum room size compliance.",
 category: "Architectural",
 icon: Square,
 styleStyle: "glass",
 colorClass:
 "bg-white/80 backdrop-blur-md text-[var(--primary-dark)] ",
 difficulty: "Beginner",
 estimatedTime: "~2 mins",
 isNew: true,
 },
 {
 id: "building-setback-calculator",
 title: "Building Setback Calculator",
 desc: "Auto-calculate front, rear setbacks, and side margins given plot size and zone.",
 category: "Architectural",
 icon: ArrowRightLeft,
 styleStyle: "glass",
 colorClass:
 "bg-white/80 backdrop-blur-md text-[var(--primary-dark)] ",
 difficulty: "Beginner",
 estimatedTime: "~3 mins",
 isNew: true,
 },
 {
 id: "far-fsi-calculator",
 title: "FAR/FSI Calculator",
 desc: "Determine maximum permissible built-up area and floors based on FAR/FSI allowance.",
 category: "Architectural",
 icon: Building,
 styleStyle: "glass",
 colorClass:
 "bg-white/80 backdrop-blur-md text-[var(--primary-dark)] ",
 difficulty: "Beginner",
 estimatedTime: "~2 mins",
 isNew: true,
 },
 {
 id: "staircase-design-reference",
 title: "Staircase Design Reference",
 desc: "Validate riser-going ergonomics, headroom clearance, and minimum stair widths.",
 category: "Architectural",
 icon: Triangle,
 styleStyle: "glass",
 colorClass:
 "bg-white/80 backdrop-blur-md text-[var(--primary-dark)] ",
 difficulty: "Intermediate",
 estimatedTime: "~4 mins",
 isNew: true,
 },
 {
 id: "door-window-schedule",
 title: "Door & Window Schedule",
 desc: "Generate schedules and calculate required lintel sizes for building openings.",
 category: "Architectural",
 icon: Layout,
 styleStyle: "glass",
 colorClass:
 "bg-white/80 backdrop-blur-md text-[var(--primary-dark)] ",
 difficulty: "Beginner",
 estimatedTime: "~5 mins",
 isNew: true,
 },
 {
 id: "ventilation-checker",
 title: "Ventilation & Lighting Checker",
 desc: "Check if window and ventilation areas meet minimum NBC requirements based on floor area.",
 category: "Architectural",
 icon: Sun,
 styleStyle: "glass",
 colorClass:
 "bg-white/80 backdrop-blur-md text-[var(--primary-dark)] ",
 difficulty: "Beginner",
 estimatedTime: "~2 mins",
 isNew: true,
 },
 {
 id: "bbs-generator",
 title: "BBS Generator",
 desc: "Calculate core steel reinforcement cutting lengths and bend deductions. Civil engineers use this Civil Estimation Pro generator to output standardized bar schedules.",
 category: "Concrete",
 icon: FileSpreadsheet,
 styleStyle: "glass",
 colorClass:
 "bg-white/80 backdrop-blur-md text-[var(--primary-dark)] ",
 difficulty: "Advanced",
 estimatedTime: "~10 mins",
 },
 {
 id: "reinforcement",
 title: "Reinforcement Detailing Visualizer",
 desc: "Interactive 2D rebar detailing for beams, columns & slabs with IS 456 checks.",
 category: "Concrete",
 icon: Layers,
 styleStyle: "glass",
 colorClass:
 "bg-white/80 backdrop-blur-md text-[var(--primary-dark)] ",
 difficulty: "Intermediate",
 estimatedTime: "~3 mins",
 isNew: true,
 },
 {
 id: "isolated-footing",
 title: "Isolated Footing Calculator",
 desc: "Detailed estimations for concrete, steel mesh, excavation and working space.",
 category: "Concrete",
 icon: Box,
 styleStyle: "glass",
 colorClass:
 "bg-white/80 backdrop-blur-md text-[var(--primary-dark)] ",
 difficulty: "Intermediate",
 estimatedTime: "~3 mins",
 isNew: true,
 },
 {
 id: "retaining-wall",
 title: "Retaining Wall Estimator",
 desc: "Calculate structural stability, concrete volume, and rebar for cantilever walls. Civil Estimation Pro helps engineers output safe material quantities for earth-retaining structures.",
 category: "Concrete",
 icon: ShieldCheck,
 styleStyle: "glass",
 colorClass:
 "bg-white/80 backdrop-blur-md text-[var(--primary-dark)] ",
 difficulty: "Advanced",
 estimatedTime: "~5 mins",
 isNew: true,
 },
 {
 id: "staircase-calculator",
 title: "Staircase Calculator",
 desc: "Calculate concrete and steel material for stairs.",
 category: "Concrete",
 icon: Layers,
 styleStyle: "glass",
 colorClass:
 "bg-white/80 backdrop-blur-md text-[var(--primary-dark)] ",
 difficulty: "Intermediate",
 estimatedTime: "~5 mins",
 },
 {
 id: "aggregate-tests",
 title: "Aggregate Tests",
 desc: "Calculate impact, crushing, abrasion values and water absorption.",
 category: "Concrete",
 icon: Box,
 styleStyle: "glass",
 colorClass:
 "bg-white/80 backdrop-blur-md text-[var(--primary-dark)] ",
 difficulty: "Intermediate",
 estimatedTime: "~4 mins",
 },
 {
 id: "formwork",
 title: "Formwork & Scaffold",
 desc: "Shuttering and scaffolding material computations.",
 category: "Concrete",
 icon: Hammer,
 styleStyle: "glass",
 colorClass:
 "bg-white/80 backdrop-blur-md text-[var(--primary-dark)] ",
 difficulty: "Intermediate",
 estimatedTime: "~4 mins",
 },

 // 🌱 SOIL TESTS
 {
 id: "geotechnical",
 title: "Geotechnical & Soil Tests",
 desc: "Process lab data for water content, Specific Gravity, LL, and CBR.",
 category: "Geotechnical",
 icon: Cone,
 styleStyle: "glass",
 colorClass:
 "bg-white/80 backdrop-blur-md text-[var(--primary-dark)] ",
 difficulty: "Intermediate",
 estimatedTime: "~5 mins",
 },
 {
 id: "cbr-test",
 title: "CBR Test Calculator",
 desc: "Calculate CBR with smart interactive load-penetration curve plotting.",
 category: "Geotechnical",
 icon: Activity, BookOpen, FileText,
 styleStyle: "glass",
 colorClass:
 "bg-white/80 backdrop-blur-md text-[var(--primary-dark)] ",
 difficulty: "Intermediate",
 estimatedTime: "~5 mins",
 isNew: true,
 },
 {
 id: "aggregate-blending",
 title: "Aggregate Blending",
 desc: "Blend 2 to 4 stockpiles to meet target grading specifications.",
 category: "Geotechnical",
 icon: Layers,
 styleStyle: "glass",
 colorClass:
 "bg-white/80 backdrop-blur-md text-[var(--primary-dark)] ",
 difficulty: "Advanced",
 estimatedTime: "~10 mins",
 },
 {
 id: "direct-shear",
 title: "Direct Shear Test",
 desc: "Calculate cohesion and friction angle using Mohr-Coulomb failure regression.",
 category: "Geotechnical",
 icon: Layers,
 styleStyle: "glass",
 colorClass:
 "bg-white/80 backdrop-blur-md text-[var(--primary-dark)] ",
 difficulty: "Intermediate",
 estimatedTime: "~3 mins",
 isNew: true,
 },
 {
 id: "permeability-test",
 title: "Permeability Calculator",
 desc: "Constant head and falling head permeability testing computation.",
 category: "Geotechnical",
 icon: Droplet,
 styleStyle: "glass",
 colorClass:
 "bg-white/80 backdrop-blur-md text-[var(--primary-dark)] ",
 difficulty: "Intermediate",
 estimatedTime: "~2 mins",
 isNew: true,
 },

 // ⚡ MEP
 {
 id: "mep-calculator",
 title: "Energy & MEP Calculators",
 desc: "Estimate solar capacity, water heating, and AC sizing.",
 category: "MEP",
 icon: Zap,
 styleStyle: "glass",
 colorClass:
 "bg-white/80 backdrop-blur-md text-[var(--primary-dark)] ",
 difficulty: "Intermediate",
 estimatedTime: "~5 mins",
 isNew: true,
 },
 {
 id: "solar-roof",
 title: "Solar Roof Calculator",
 desc: "Estimate required solar system size, panels, and ROI.",
 category: "MEP",
 icon: Sun,
 styleStyle: "glass",
 colorClass:
 "bg-white/80 backdrop-blur-md text-[var(--primary-dark)] ",
 difficulty: "Beginner",
 estimatedTime: "~2 mins",
 isNew: true,
 },
 {
 id: "rainwater-harvesting",
 title: "Rainwater Harvesting",
 desc: "Calculate collectible rainwater volume and recommend tank sizes.",
 category: "MEP",
 icon: Droplet,
 styleStyle: "glass",
 colorClass:
 "bg-white/80 backdrop-blur-md text-[var(--primary-dark)] ",
 difficulty: "Beginner",
 estimatedTime: "~3 mins",
 isNew: true,
 },

 {
 id: "cost-guide-pakistan",
 title: "Construction Cost Guide Pakistan 2025",
 desc: "Latest material and labor rates overview for 2025.",
 category: "Resources",
 icon: BookOpen,
 styleStyle: "glass",
 colorClass: "bg-white/80 backdrop-blur-md text-emerald-600",
 difficulty: "Beginner",
 estimatedTime: "Read",
 isNew: true,
 },
 {
 id: "blog",
 title: "Civil Engineering Blog",
 desc: "Articles, tutorials, and case studies on modern construction.",
 category: "Resources",
 icon: FileText,
 styleStyle: "glass",
 colorClass: "bg-white/80 backdrop-blur-md text-slate-800",
 difficulty: "Beginner",
 estimatedTime: "Read",
 },
// 🛣️ ROAD CONSTRUCTION
 {
 id: "road-pavement",
 title: "Road & Pavement Estimator",
 desc: "Calculate material quantities for flexible and rigid pavement layers. Highway engineers use this Civil Estimation Pro tool to output exact asphalt volumes.",
 category: "Road Pavement",
 icon: Route,
 styleStyle: "glass",
 colorClass:
 "bg-white/80 backdrop-blur-md text-[var(--primary-dark)] ",
 difficulty: "Advanced",
 estimatedTime: "~15 mins",
 },
 {
 id: "earthworks",
 title: "Earthworks & Excavation",
 desc: "Calculate precise cut, fill, and site preparation volumes for varied terrain. Surveyors use this Civil Estimation Pro tool to generate accurate excavation tonnage reports.",
 category: "Road Pavement",
 icon: Shovel,
 styleStyle: "glass",
 colorClass:
 "bg-white/80 backdrop-blur-md text-[var(--primary-dark)] ",
 difficulty: "Intermediate",
 estimatedTime: "~5 mins",
 },
 {
 id: "chainage",
 title: "Chainage Volume",
 desc: "Road highway chainage extraction calculations.",
 category: "Road Pavement",
 icon: Map,
 styleStyle: "glass",
 colorClass:
 "bg-white/80 backdrop-blur-md text-[var(--primary-dark)] ",
 difficulty: "Intermediate",
 estimatedTime: "~5 mins",
 },
 {
 id: "gradient-calculator",
 title: "Gradient & Slope",
 desc: "Dynamic bidirectional slope and elevation calculator.",
 category: "Road Pavement",
 icon: Maximize2,
 styleStyle: "glass",
 colorClass:
 "bg-white/80 backdrop-blur-md text-[var(--primary-dark)] ",
 difficulty: "Beginner",
 estimatedTime: "~2 mins",
 },
 {
 id: "anti-termite",
 title: "Anti-Termite Calculator",
 desc: "Calculate pre-construction termite chemical emulsion and concentrate requirements.",
 category: "Road Pavement",
 icon: Bug,
 styleStyle: "glass",
 colorClass:
 "bg-white/80 backdrop-blur-md text-[var(--primary-dark)] ",
 difficulty: "Beginner",
 estimatedTime: "~2 mins",
 isNew: true,
 },

 {
 id: "master-sieve",
 title: "Master Sieve Analysis",
 desc: "Dynamic gradation validator driven by specification databases.",
 category: "Road Pavement",
 icon: LineChart,
 styleStyle: "glass",
 colorClass:
 "bg-white/80 backdrop-blur-md text-[var(--primary-dark)] ",
 difficulty: "Advanced",
 estimatedTime: "~8 mins",
 },
 // 📚 STANDARDS
 {
 id: "is-codes-reference",
 title: "IS Codes Reference",
 desc: "Comprehensive database of Indian Standard codes for civil engineering.",
 category: "Standards",
 icon: BookOpen,
 styleStyle: "glass",
 colorClass: "bg-white/80 backdrop-blur-md text-slate-900",
 difficulty: "Beginner",
 estimatedTime: "Read",
 },
 {
 id: "morth-irc-specs",
 title: "MORTH/IRC Specifications",
 desc: "Ministry of Road Transport and Highways & Indian Roads Congress specs.",
 category: "Standards",
 icon: BookOpen,
 styleStyle: "glass",
 colorClass: "bg-white/80 backdrop-blur-md text-slate-900",
 difficulty: "Intermediate",
 estimatedTime: "Read",
 },
 {
 id: "pakistan-building-codes",
 title: "Pakistan Building Codes",
 desc: "Building Code of Pakistan (BCP) requirements and guidelines.",
 category: "Standards",
 icon: BookOpen,
 styleStyle: "glass",
 colorClass: "bg-white/80 backdrop-blur-md text-emerald-600",
 difficulty: "Intermediate",
 estimatedTime: "Read",
 },
 {
 id: "uae-construction-standards",
 title: "UAE Construction Standards",
 desc: "Dubai Municipality and Abu Dhabi building codes and regulations.",
 category: "Standards",
 icon: BookOpen,
 styleStyle: "glass",
 colorClass: "bg-white/80 backdrop-blur-md text-emerald-600",
 difficulty: "Advanced",
 estimatedTime: "Read",
 },

 // 🏢 STRUCTURAL DESIGN
 {
 id: "beam-design",
 title: "Beam Design Tool",
 desc: "Limit State Method including deflection, shear design, and anchorage per IS 456:2000.",
 category: "Structural Design",
 icon: Layers,
 styleStyle: "glass",
 colorClass:
 "bg-white/80 backdrop-blur-md text-[var(--primary-dark)] ",
 difficulty: "Advanced",
 estimatedTime: "~10 mins",
 isNew: true,
 },
 {
 id: "column-design",
 title: "Column Design Tool",
 desc: "Short/slender check and axial + biaxial bending capacity per IS 456 & 13920.",
 category: "Structural Design",
 icon: Building2,
 styleStyle: "glass",
 colorClass:
 "bg-white/80 backdrop-blur-md text-[var(--primary-dark)] ",
 difficulty: "Advanced",
 estimatedTime: "~10 mins",
 isNew: true,
 },
 {
 id: "raft-foundation",
 title: "Raft Foundation Designer",
 desc: "Design raft thickness, reinforcement, and check settlement per IS 2950.",
 category: "Structural Design",
 icon: Grid2X2,
 styleStyle: "glass",
 colorClass:
 "bg-white/80 backdrop-blur-md text-[var(--primary-dark)] ",
 difficulty: "Advanced",
 estimatedTime: "~15 mins",
 isNew: true,
 },
 {
 id: "water-tank-design",
 title: "Water Tank Design",
 desc: "Crack width checks for overhead/underground tanks per IS 3370.",
 category: "Structural Design",
 icon: Waves,
 styleStyle: "glass",
 colorClass:
 "bg-white/80 backdrop-blur-md text-[var(--primary-dark)] ",
 difficulty: "Advanced",
 estimatedTime: "~12 mins",
 isNew: true,
 },
 {
 id: "pile-foundation",
 title: "Pile Foundation Calculator",
 desc: "Friction & end bearing pile capacity, group efficiency per IS 2911.",
 category: "Structural Design",
 icon: Pickaxe,
 styleStyle: "glass",
 colorClass:
 "bg-white/80 backdrop-blur-md text-[var(--primary-dark)] ",
 difficulty: "Advanced",
 estimatedTime: "~8 mins",
 isNew: true,
 },
 {
 id: "prestressed-concrete",
 title: "Pre-stressed Concrete Estimator",
 desc: "Tendon layout and prestress losses per IS 1343:2012.",
 category: "Structural Design",
 icon: Layers,
 styleStyle: "glass",
 colorClass:
 "bg-white/80 backdrop-blur-md text-[var(--primary-dark)] ",
 difficulty: "Advanced",
 estimatedTime: "~10 mins",
 isNew: true,
 },

 ];

interface DashboardProps {
 onSelectModule: (id: string, layoutId?: string) => void;
 onOpenSidebar?: () => void;
 onOpenSettings?: () => void;
 onOpenAuth?: () => void;
 previousModule?: string | null;
}

export const getCategoryTheme = (category: string, id: string) => {
 if (id === "ai") {
 return {
 textRaw: "text-[#4338CA] [#818CF8]",
 text: "text-slate-900",
 bg: "bg-[#4338CA] [#4338CA]",
 stroke: "stroke-[#4338CA]",
 baseHex: "#4338CA",
 border: "border-[#4338CA] [#4338CA]",
 };
 }

 switch (category) {
 case "Concrete Tech":
 return {
 textRaw: "text-[#0D9488]",
 text: "text-slate-900",
 bg: "bg-[#0D9488]",
 stroke: "stroke-[#0D9488]",
 baseHex: "#0D9488",
 border: "border-[#0D9488]",
 };
 case "Quantity Estimator":
 return {
 textRaw: "text-[#6B46C1] [#9F7AEA]",
 text: "text-slate-900",
 bg: "bg-[#6B46C1] [#6B46C1]",
 stroke: "stroke-[#6B46C1]",
 baseHex: "#6B46C1",
 border: "border-[#6B46C1] [#6B46C1]",
 };
 case "Structural Design":
 return {
 textRaw: "text-[#BE185D] [#F472B6]",
 text: "text-slate-900",
 bg: "bg-[#BE185D] [#BE185D]",
 stroke: "stroke-[#BE185D]",
 baseHex: "#BE185D",
 border: "border-[#BE185D] [#BE185D]",
 };
 case "Road Construction":
 return {
 textRaw: "text-slate-900 [#2DD4BF]",
 text: "text-slate-900",
 bg: "bg-[#FFFFFF] [#FFFFFF]",
 stroke: "stroke-[#FFFFFF]",
 baseHex: "#FFFFFF",
 border: "border-[#FFFFFF] [#FFFFFF]",
 };
 case "Soil Tests":
 return {
 textRaw: "text-[#D97706] [#FBBF24]",
 text: "text-slate-900",
 bg: "bg-[#D97706] [#D97706]",
 stroke: "stroke-[#D97706]",
 baseHex: "#D97706",
 border: "border-[#D97706] [#D97706]",
 };
 case "MEP":
 return {
 textRaw: "text-[#2563EB] [#60A5FA]",
 text: "text-slate-900",
 bg: "bg-[#2563EB] [#2563EB]",
 stroke: "stroke-[#2563EB]",
 baseHex: "#2563EB",
 border: "border-[#2563EB] [#2563EB]",
 };
 case "Architectural References & Space Planning":
 return {
 textRaw: "text-[#EC4899] [#F472B6]",
 text: "text-slate-900",
 bg: "bg-[#EC4899] [#EC4899]",
 stroke: "stroke-[#EC4899]",
 baseHex: "#EC4899",
 border: "border-[#EC4899] [#EC4899]",
 };
 case "Analysis & Tools":
 return {
 textRaw: "text-[#4338CA] [#818CF8]",
 text: "text-slate-900",
 bg: "bg-[#4338CA] [#4338CA]",
 stroke: "stroke-[#4338CA]",
 baseHex: "#4338CA",
 border: "border-[#4338CA] [#4338CA]",
 };
 default:
 return {
 textRaw: "text-[#4338CA] [#818CF8]",
 text: "text-slate-900",
 bg: "bg-[#4338CA] [#4338CA]",
 stroke: "stroke-[#4338CA]",
 baseHex: "#4338CA",
 border: "border-slate-500 ",
 };
 }
};

const ToolsSkeleton = () => (
 <div className="flex flex-col gap-8 w-full animate-pulse">
 {[1, 2].map((group) => (
 <div key={`skeleton-group-${group}`} className="flex flex-col gap-5">
 <div className="h-8 w-48 bg-slate-200 rounded-lg"></div>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
 {[1, 2, 3, 4, 5].map((card) => (
 <div key={`skeleton-card-${card}`} className="w-full bg-white [#1e1e1e] rounded-[24px] p-4 sm:p-6 h-[180px] border border-slate-100 flex flex-col gap-4 shadow-sm overflow-hidden">
 <div className="flex items-center gap-3">
 <div className="w-12 h-12 rounded-xl bg-slate-100 shrink-0"></div>
 <div className="flex flex-col gap-2 flex-1">
 <div className="w-3/4 h-3.5 bg-slate-100 rounded-full"></div>
 <div className="w-1/2 h-2.5 bg-slate-50 rounded-full"></div>
 </div>
 </div>
 <div className="flex flex-col gap-2 mt-2">
 <div className="w-full h-2.5 bg-slate-50 rounded-full"></div>
 <div className="w-5/6 h-2.5 bg-slate-50 rounded-full"></div>
 <div className="w-4/6 h-2.5 bg-slate-50 rounded-full"></div>
 </div>
 </div>
 ))}
 </div>
 </div>
 ))}
 </div>
);

export default function Dashboard({
 onSelectModule,
 previousModule,
}: DashboardProps) {
 const { user } = useAuth();
 const { settings, trackToolUse } = useSettings();
 const { recentTools, addRecentTool } = useRecentTools();
 const [searchTerm, setSearchTerm] = useState("");
 const [activeCategory, setActiveCategory] = useState("All Tools");
 const [isAiChatOpen, setIsAiChatOpen] = useState(false);
 const [aiMessage, setAiMessage] = useState("");
 const [isComputing, setIsComputing] = useState(true);

 useEffect(() => {
 setIsComputing(true);
 const t = setTimeout(() => setIsComputing(false), 350);
 return () => clearTimeout(t);
 }, [searchTerm, activeCategory]);

 const [aiMessages, setAiMessages] = useState<
 { role: string; content: string }[]
 >([
 {
 role: "system",
 content:
 "Hi there! I am your AI assistant. Ask me anything about calculations, materials, or which tool to use.",
 },
 ]);
 const chatEndRef = useRef<HTMLDivElement>(null);

 const handleSelect = (id: string, inputsOrLayoutId?: any, explicitLayoutId?: string) => {
    let layoutId = explicitLayoutId;
    let inputs = undefined;
    if (typeof inputsOrLayoutId === 'string') {
       layoutId = inputsOrLayoutId;
    } else if (inputsOrLayoutId) {
       inputs = inputsOrLayoutId;
    }
    if (trackToolUse) trackToolUse(id);
    addRecentTool(id, inputs);
    onSelectModule(id, layoutId);
  };

 useEffect(() => {
 if (isAiChatOpen && chatEndRef.current) {
 chatEndRef.current.scrollIntoView({ behavior: "smooth" });
 }
 }, [aiMessages, isAiChatOpen]);

 useEffect(() => {
 if (
 previousModule &&
 ![
 "home",
 "my-estimates",
 "pricing",
 "about",
 "careers",
 "contact",
 "blog",
 ].includes(previousModule)
 ) {
 const prevMod = ALL_MODULES.find((m) => m.id === previousModule);
 if (prevMod) {
 setActiveCategory("All Tools");
 setTimeout(() => {
 const elm = document.getElementById(`module-card-${previousModule}`);
 if (elm) {
 elm.scrollIntoView({ behavior: "smooth", block: "center" });
 }
 }, 100);
 }
 }
 }, [previousModule]);

 const categories = ["All Tools", "My Tools", ...Array.from(new Set(ALL_MODULES.map(m => m.category)))];

 const filteredModules = [...ALL_MODULES]
 .filter((m) => {
 // 1. Search Filter
 const searchWords = searchTerm.toLowerCase().split(/\s+/).filter(Boolean);
 const matchesSearch =
 searchWords.length === 0 ||
 searchWords.every(
 (word) =>
 m.title.toLowerCase().includes(word) ||
 m.desc.toLowerCase().includes(word) ||
 m.category.toLowerCase().includes(word),
 );

 // 2. Category Filter
 let matchesCategory = true;
 if (activeCategory === "My Tools") {
 matchesCategory = settings.favoriteTools?.includes(m.id) ?? false;
 } else {
 matchesCategory =
 activeCategory === "All Tools" || m.category === activeCategory;
 }

 return matchesSearch && matchesCategory;
  });

 const totalFilteredCount = filteredModules.length;

 const groupsToDisplay: string[] = [];
 const groupedModules: Record<string, typeof ALL_MODULES> = {};

 filteredModules.forEach((mod) => {
 const groupName = mod.category;

 if (!groupedModules[groupName]) {
 groupedModules[groupName] = [];
 groupsToDisplay.push(groupName);
 }
 groupedModules[groupName].push(mod);
 });

 // Handle particle creation purely via CSS in a style tag directly
 return (
 <>
 <style>{`
 /* One UI signature scrollbar */
 ::-webkit-scrollbar { width: 6px; height: 6px; }
 ::-webkit-scrollbar-track { background: transparent; }
 ::-webkit-scrollbar-thumb { background: rgba(15,23,42,0.15); border-radius: 10px; }
 `}</style>
 <div className="relative w-full flex flex-col font-sans bg-[#f8f9fa] text-slate-900 border-none">
  <div 
    className="relative w-full flex flex-col overflow-hidden bg-white"
  >
    <div className="absolute inset-0 z-0 pointer-events-none opacity-60">
      <div 
        className="absolute top-[-10%] left-[-10%] w-[80%] h-[50%] mix-blend-multiply filter blur-[80px] rounded-full" 
        style={{ background: 'radial-gradient(circle, #E0C3FC 0%, transparent 70%)' }}
      />
      <div 
        className="absolute top-[20%] right-[-20%] w-[70%] h-[60%] mix-blend-multiply filter blur-[80px] rounded-full" 
        style={{ background: 'radial-gradient(circle, #FFC3A0 0%, transparent 70%)' }}
      />
      <div 
        className="absolute bottom-[-10%] left-[10%] w-[80%] h-[50%] mix-blend-multiply filter blur-[80px] rounded-full" 
        style={{ background: 'radial-gradient(circle, #FFD194 0%, transparent 70%)' }}
      />
    </div>
    <div className="relative z-10 flex flex-col w-full">
 <SEO
 title="Dashboard"
 description="Civil Estimation Pro: Advanced estimators for live construction rate analysis, house estimating, and comprehensive BOQ calculators."
 canonicalUrl="https://civilestimationpro.com"
 />

 {!user ? (
 <div className="w-full flex flex-col pt-0 pb-0 bg-[#F8F9FB] overflow-x-hidden border-0 rounded-none">
 <HeroSection onStart={() => handleSelect('house')} />
 <ScrollReveal><SocialProofSection /></ScrollReveal>
 <ScrollReveal yOffset={30}><HowItWorksSection /></ScrollReveal>
 <ScrollReveal yOffset={30}><FeatureComparisonSection /></ScrollReveal>
 <div className="w-full bg-slate-50/50 pb-0 pt-4 -mt-8 relative z-10  border-t border-slate-200/60 shadow-[0_-8px_30px_rgba(0,0,0,0.04)] overflow-visible">
 {/* Premium Ambient Background */}
 <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]" 
 style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'1\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'1.5\'/%3E%3C/g%3E%3C/svg%3E")' }} 
 />
 <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.08] mix-blend-multiply overflow-hidden">
 <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full filter blur-[100px]" style={{ background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)' }} />
 <div className="absolute top-[20%] right-[-10%] w-[60%] h-[60%] rounded-full filter blur-[100px]" style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)' }} />
 <div className="absolute bottom-[-10%] left-[20%] w-[60%] h-[60%] rounded-full filter blur-[100px]" style={{ background: 'radial-gradient(circle, #f97316 0%, transparent 70%)' }} />
 </div>
 <div className="w-full relative z-10 overflow-visible flex flex-col">
 <div className="flex flex-col gap-10 w-full" id="tools-section">
 <div className="w-full md:max-w-[1400px] md:mx-auto px-4"><SearchAndFilterBar
 categories={categories.map(catName => ({
 name: catName,
 count: catName === 'All Tools' ? ALL_MODULES.length : ALL_MODULES.filter(m => m.category === catName).length
 }))}
 activeCategory={activeCategory}
 setActiveCategory={setActiveCategory}
 searchTerm={searchTerm}
 setSearchTerm={setSearchTerm}
 totalFilteredCount={totalFilteredCount}
 allTools={ALL_MODULES.map(m => ({ id: m.id, name: m.title, category: m.category }))}
 onSelectModule={handleSelect}
                  />
                </div>
 <div className="flex flex-col w-full">
 {isComputing ? <ToolsSkeleton /> : groupsToDisplay.map((groupName, index) => {
 const toolsInGroup = groupedModules[groupName];
 if (!toolsInGroup || toolsInGroup.length === 0) return null;
 return (
 <div key={groupName} className={`w-full flex flex-col py-12 md:py-20 ${index % 3 === 0 ? 'bg-[#F4F1EA]' : index % 3 === 1 ? 'bg-[#F0F5FF]' : 'bg-[#D9E6DD]'}`}>
<div className="w-full md:max-w-[1400px] md:mx-auto px-4 flex flex-col gap-5">
<h2 className="px-2 flex items-center gap-2 text-xl font-semibold text-slate-800 tracking-tight mb-4">
 {groupName}
 <span className="text-sm font-normal px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-500 shadow-sm">{toolsInGroup.length}</span>
 </h2>
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
 {toolsInGroup.map((mod) => (
 <div key={mod.id} id={`module-card-${mod.id}`}>
 <ToolCard mod={mod} onSelect={handleSelect} layoutId={`card-${groupName || 'group'}-${mod.id}`} categoryColor={index % 3 === 0 ? '#F4F1EA' : index % 3 === 1 ? '#F0F5FF' : '#D9E6DD'} />
 </div>
 ))}
 </div>
</div>
</div>
            );
          })}
 </div>
 <div className="w-full md:max-w-[1400px] md:mx-auto px-4 py-8"><AIEstimatorBanner onOpenChat={() => setIsAiChatOpen(true)} /></div>
 </div>
 </div>
 </div>
 </div>
 ) : (
 <>
 <div className="flex-shrink-0 h-[30vh] lg:h-[35vh] w-full flex flex-col justify-end px-6 xl:px-12 pb-8 relative overflow-hidden bg-[#f8f9fa]">
 <div className="absolute top-[-50%] left-[-10%] w-[70%] h-[150%] rounded-full bg-blue-600/10 blur-[80px] pointer-events-none"></div>
 <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[100%] rounded-full bg-blue-600/5 blur-[80px] pointer-events-none"></div>
 <div className="w-full md:max-w-[1400px] md:mx-auto z-10 flex flex-col items-start gap-1 px-4 md:px-0">
 <h1 className="leading-tight text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800 tracking-tight">Civil Estimation</h1>
 <h1 className="leading-tight text-3xl md:text-4xl lg:text-5xl font-bold text-indigo-700 tracking-tight mb-2">Pro.</h1>
 <p className="md: max-w-lg mb-2 text-base font-normal text-slate-600 leading-relaxed">Welcome back, {user.displayName?.split(' ')[0] || 'Engineer'}.</p>
 </div>
 </div>

 <div className="w-full bg-slate-50/50  relative overflow-visible shadow-[0_-8px_30px_rgba(163,177,198,0.2)] border-t border-slate-200/60 pb-0 tools-section">
 {/* Premium Ambient Background */}
 <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]" 
 style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'1\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'1.5\'/%3E%3C/g%3E%3C/svg%3E")' }} 
 />
 <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.08] mix-blend-multiply overflow-hidden">
 <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full filter blur-[100px]" style={{ background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)' }} />
 <div className="absolute top-[20%] right-[-10%] w-[60%] h-[60%] rounded-full filter blur-[100px]" style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)' }} />
 <div className="absolute bottom-[-10%] left-[20%] w-[60%] h-[60%] rounded-full filter blur-[100px]" style={{ background: 'radial-gradient(circle, #f97316 0%, transparent 70%)' }} />
 </div>
 <div className="w-full z-10 overflow-visible flex flex-col pt-4">
 <div className="mb-12 w-full md:max-w-[1400px] md:mx-auto px-4">
 <SummaryStatsWidget />
            <WorkspaceSection onSelect={handleSelect} />
 </div>

 {/* Recently Used section */}
 <div className="mb-12 flex flex-col gap-5 w-full md:max-w-[1400px] md:mx-auto px-4">
 <h2 className="md: flex items-center gap-3 text-xl font-semibold text-slate-900 tracking-tight mb-4">
 <History className="w-6 h-6 text-indigo-500" />
 Recent Tools
 </h2>
 {recentTools.length > 0 ? (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
 {recentTools.map(t => {
 const m = ALL_MODULES.find(mod => mod.id === t.id);
 if (!m) return null;
 return (
 <div key={`recent-${t.id}`} className="relative group bg-[#F0F4F8] rounded-2xl p-4 hover:-translate-y-1.5 hover:scale-[1.02] transition-all flex flex-col gap-3 shadow-[4px_4px_10px_rgba(163,177,198,0.3),-4px_-4px_10px_rgba(255,255,255,0.9)] hover:shadow-[6px_6px_15px_rgba(163,177,198,0.4),-6px_-6px_15px_rgba(255,255,255,1)]">
 <div className="flex items-center gap-2">
 <div className="w-full w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-white shadow-sm border border-slate-100 text-indigo-600 overflow-hidden">
 {m.icon && <m.icon className="w-4 h-4" strokeWidth={1.5} />}
 </div>
 <div className="flex flex-col">
 <h3 className="line-clamp-2 group-hover:text-indigo-900 transition-colors text-lg font-medium text-slate-800 mb-4">{m.title}</h3>
 <span className="text-sm font-normal text-slate-500">
 {formatTimeAgo(t.timestamp)}
 </span>
 </div>
 </div>
 <button onClick={() => handleSelect(t.id, t.lastInputs)} className="w-full mt-2 bg-white/70 backdrop-blur-md hover:bg-white text-slate-600 hover:text-blue-700 transition-colors py-1.5 rounded-full text-base font-medium border border-white/20 flex justify-center items-center gap-2 shadow-sm active:scale-95 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2 overflow-hidden">
 Resume
 </button>
 </div>
 );
 })}
 </div>
 ) : (
 <div className="p-4 sm:p-8 md:p-8 bg-[#F0F4F8] shadow-[inset_4px_4px_8px_rgba(163,177,198,0.3),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] rounded-3xl flex flex-col items-center justify-center text-center border-none overflow-hidden">
 <History className="w-10 h-10 text-slate-600 mb-3" />
 <p className="text-base font-normal text-slate-600 leading-relaxed">Start using tools to see your history here.</p>
 </div>
 )}
 </div>

 {settings.favoriteTools && settings.favoriteTools.length > 0 && (
 <div className="mb-12 flex flex-col gap-5 w-full md:max-w-[1400px] md:mx-auto px-4">
 <h2 className="flex items-center gap-3 text-xl font-semibold text-slate-800 tracking-tight mb-4">
 <Bookmark className="w-6 h-6 text-indigo-500" fill="transparent" strokeWidth={2.5} />
 Personalized Shortcuts
 </h2>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
 {settings.favoriteTools.map((toolId, index) => {
 const mod = ALL_MODULES.find(m => m.id === toolId);
 if (!mod) return null;
 return (
 <div key={`fav-${mod.id}`} id={`module-card-${mod.id}`}>
 <ToolCard mod={mod} onSelect={handleSelect} layoutId={`card-fav-${mod.id}`} categoryColor={'#f8fafc'} />
 </div>
 );
 })}
 </div>
 </div>
 )}
 <div className="w-full overflow-visible flex flex-col mt-4">
 {/* Quick Overview Row */}
 <div className="w-full md:max-w-[1400px] md:mx-auto px-4"><section className="mb-8">
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
 <div className="bg-blue-600 text-white rounded-3xl p-5 shadow-lg shadow-blue-500/10 overflow-hidden">
 <div className="text-sm opacity-80 uppercase font-semibold tracking-wider">Active Project</div>
 <div className="text-xl font-bold mt-1 truncate">Disposal Well A</div>
 </div>
 <div className="w-full bg-white/70 backdrop-blur-md rounded-3xl p-5 shadow-sm border border-white/20 overflow-hidden">
 <div className="text-sm text-slate-500 uppercase font-semibold tracking-wider">Recent Estimate</div>
 <div className="text-xl font-bold mt-1 text-slate-800 truncate">Rs 1.2M</div>
 </div>
 <div className="w-full bg-white/70 backdrop-blur-md rounded-3xl p-5 shadow-sm border border-white/20 overflow-hidden">
 <div className="text-sm text-slate-500 uppercase font-semibold tracking-wider">Saved BOQs</div>
 <div className="text-xl font-bold mt-1 text-slate-800 truncate">14</div>
 </div>
 <div className="w-full bg-white/70 backdrop-blur-md rounded-3xl p-5 shadow-sm border border-white/20 overflow-hidden">
 <div className="text-sm text-slate-500 uppercase font-semibold tracking-wider">Tools Used</div>
 <div className="text-xl font-bold mt-1 text-slate-800 truncate">8</div>
 </div>
 </div>
 </section></div>
<div className="flex flex-col gap-10 w-full" id="tools-section">
 <div className="w-full md:max-w-[1400px] md:mx-auto px-4"><SearchAndFilterBar
 categories={categories.map(catName => ({
 name: catName,
 count: catName === 'All Tools' ? ALL_MODULES.length : ALL_MODULES.filter(m => m.category === catName).length
 }))}
 activeCategory={activeCategory}
 setActiveCategory={setActiveCategory}
 searchTerm={searchTerm}
 setSearchTerm={setSearchTerm}
 totalFilteredCount={totalFilteredCount}
 allTools={ALL_MODULES.map(m => ({ id: m.id, name: m.title, category: m.category }))}
 onSelectModule={handleSelect}
                  />
                </div>
 <div className="flex flex-col w-full">
 {isComputing ? <ToolsSkeleton /> : groupsToDisplay.map((groupName, index) => {
 const toolsInGroup = groupedModules[groupName];
 if (!toolsInGroup || toolsInGroup.length === 0) return null;
 return (
 <div key={groupName} className={`w-full flex flex-col py-12 md:py-20 ${index % 3 === 0 ? 'bg-[#F4F1EA]' : index % 3 === 1 ? 'bg-[#F0F5FF]' : 'bg-[#D9E6DD]'}`}>
<div className="w-full md:max-w-[1400px] md:mx-auto px-4 flex flex-col gap-5">
<h2 className="px-2 flex items-center gap-2 text-xl font-semibold text-slate-800 tracking-tight mb-4">
 {groupName}
 <span className="text-sm font-normal px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-500 shadow-sm">{toolsInGroup.length}</span>
 </h2>
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 tool-card-grid">
 {toolsInGroup.map((mod) => (
 <div key={mod.id} id={`module-card-${mod.id}`}>
 <ToolCard mod={mod} onSelect={handleSelect} layoutId={`card-${groupName || 'group'}-${mod.id}`} categoryColor={index % 3 === 0 ? '#F4F1EA' : index % 3 === 1 ? '#F0F5FF' : '#D9E6DD'} />
 </div>
 ))}
 </div>
</div>
</div>
            );
          })}
 </div>
          <div className="w-full md:max-w-[1400px] md:mx-auto px-4 py-8"><AIEstimatorBanner onOpenChat={() => setIsAiChatOpen(true)} /></div>
 </div>
 </div>
 </div>
 </div>
 </>
 )}
 </div>

 {/* AI Chat Bottom Sheet Modal */}
 <div
 className={`fixed inset-0 z-50 transition-all duration-500 ${isAiChatOpen ? "opacity-100 visible pointer-events-auto" : "opacity-0 invisible pointer-events-none"}`}
 >
 {/* Backdrop */}
 <div
 className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
 onClick={() => setIsAiChatOpen(false)}
 />

 {/* Bottom Sheet Modal */}
 <div
 className={`fixed bottom-0 left-0 right-0 h-[80vh] md:h-[70vh] bg-white/90 backdrop-blur-2xl shadow-[0_-20px_60px_rgba(15,23,42,0.2)] rounded-t-[40px] transform transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] flex flex-col border-t border-white/50 overflow-hidden ${isAiChatOpen ? "translate-y-0" : "translate-y-full"}`}
 >
 {/* Premium Ambient Backgrounds inside Modal */}
 <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-60">
 <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-400/20 rounded-full blur-[100px] animate-pulse"></div>
 <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-400/20 rounded-full blur-[80px] animate-[pulse_4s_cubic-bezier(0.4,0,0.6,1)_infinite]"></div>
 <div className="absolute top-[30%] left-[30%] w-[40%] h-[40%] bg-purple-400/10 rounded-full blur-[80px] animate-[pulse_6s_cubic-bezier(0.4,0,0.6,1)_infinite]"></div>
 </div>

 {/* Drag handle */}
 <div
 className="w-full flex justify-center pt-5 pb-3 shrink-0 cursor-pointer relative z-10"
 onClick={() => setIsAiChatOpen(false)}
 >
 <div className="w-16 h-1.5 rounded-full bg-slate-300 hover:bg-slate-400 transition-colors shadow-inner" />
 </div>

 <div className="px-6 flex items-center justify-between pb-4 border-b border-slate-200/50 relative z-10 bg-white/40">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-600/20">
 <Sparkles className="w-5 h-5 text-white" strokeWidth={1.5} />
 </div>
 <div className="flex flex-col">
 <h3 className="text-lg font-bold text-slate-800 tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
 AI Estimator
 </h3>
 <span className="text-[11px] font-semibold text-indigo-700 uppercase tracking-wider mt-0.5">Premium Copilot</span>
 </div>
 </div>
 <button
 onClick={() => setIsAiChatOpen(false)}
 className="p-2.5 rounded-full bg-white/80 hover:bg-slate-100 text-slate-500 transition-all duration-300 active:scale-95 hover:-translate-y-0.5 shadow-sm border border-slate-200/50"
 >
 <X className="w-5 h-5" />
 </button>
 </div>

 {/* Chat area */}
 <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-6 md:max-w-4xl md:mx-auto w-full relative z-10">
 {aiMessages.map((msg, i) => (
 <div
 key={i}
 className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
 >
 {msg.role === "system" && (
 <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shrink-0 mr-3 mt-1 shadow-md shadow-blue-600/20">
 <Sparkles className="w-4 h-4 text-white" strokeWidth={1.5} />
 </div>
 )}
 <div
 className={`px-5 py-3.5 max-w-[85%] text-[15px] font-medium leading-relaxed shadow-sm backdrop-blur-md ${msg.role === "user" ? "bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-[24px] rounded-tr-[8px] shadow-slate-900/10" : "bg-white/80 border border-slate-200/60 text-slate-700 rounded-[24px] rounded-tl-[8px] shadow-slate-200/50"}`}
 >
 {msg.content}
 </div>
 </div>
 ))}
 <div ref={chatEndRef} className="h-4" />
 </div>

 {/* Input area */}
 <div className="p-4 sm:p-6 pt-4 shrink-0 w-full md:max-w-4xl md:mx-auto bg-white/60 backdrop-blur-xl border-t border-slate-200/50 relative z-10">
 <div className="relative group">
 <div className="absolute -inset-[1px] bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 rounded-full opacity-30 group-focus-within:opacity-100 blur-[4px] transition-all duration-500"></div>
 <div className="w-full relative flex items-center bg-white/90 backdrop-blur-md rounded-full px-5 py-2 border border-slate-200/50 shadow-inner overflow-hidden">
 <><label htmlFor="a11y-input-1" className="sr-only">Ask your assistant...</label>
<input id="a11y-input-1"
 type="text"
 value={aiMessage}
 onChange={(e) => setAiMessage(e.target.value)}
 onKeyDown={(e) => {
 if (e.key === "Enter" && aiMessage.trim()) {
 setAiMessages((prev) => [
 ...prev,
 { role: "user", content: aiMessage.trim() },
 ]);
 setAiMessage("");
 setTimeout(() => {
 setAiMessages((prev) => [
 ...prev,
 {
 role: "system",
 content:
 "I can help with that. Could you provide a bit more context about the materials or calculator you need?",
 },
 ]);
 }, 1000);
 }
 }}
 placeholder="Ask your AI Assistant..."
 className="w-full bg-transparent border-none outline-none text-base text-slate-800 px-2 py-2.5 placeholder:text-slate-400 rounded-full"
 /></>
 <button aria-label="ArrowUpRight" className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-600/30 text-white rounded-full transition-all hover:scale-105 active:scale-95 ml-2 shrink-0 flex items-center justify-center relative overflow-hidden group/send"
 onClick={() => {
 if (aiMessage.trim()) {
 setAiMessages((prev) => [
 ...prev,
 { role: "user", content: aiMessage.trim() },
 ]);
 setAiMessage("");
 setTimeout(() => {
 setAiMessages((prev) => [
 ...prev,
 {
 role: "system",
 content:
 "I can help with that. Could you provide a bit more context about the materials or calculator you need?",
 },
 ]);
 }, 1000);
 }
 }}
 >
 <div className="absolute inset-0 bg-white/20 -translate-x-[150%] skew-x-12 group-hover/send:animate-[shimmer_1.5s_infinite]"></div>
 <ArrowUpRight className="w-5 h-5 relative z-10" />
 </button>
 </div>
 </div>
        </div>
      </div>
    </div>
  </div>
  </div>
  </>
  );
}

