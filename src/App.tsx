
import { ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import TeamCollaboration from "./components/pages/TeamCollaboration";
import JoinProject from "./components/pages/JoinProject";
import Dashboard, { ALL_MODULES as ALL_TOOLS } from "./components/Dashboard";
import TopNavbar from "./components/TopNavbar";
import RecentEstimates from "./components/RecentEstimates";
import AboutUs from "./components/pages/AboutUs";
import Careers from "./components/pages/Careers";
import Contact from "./components/pages/Contact";
import Blog from "./components/pages/Blog";
import LegalPages from "./components/pages/LegalPages";
import PricingPage from "./components/pages/PricingPage";
import Footer from "./components/Footer";
import SmoothScroll from "./components/ui/SmoothScroll";
import SkipToContent from "./components/ui/SkipToContent";
import LoadingScreen from "./components/ui/LoadingScreen";
import CustomCursor from "./components/ui/CustomCursor";
import ScrollToTop from "./components/ui/ScrollToTop";
import { ToolHeader } from "./components/ui/ToolHeader";
import { Toaster } from "react-hot-toast";
import { ProductTour } from "./components/ui/ProductTour";

import { ThemeProvider } from "./context/ThemeContext";
import { SettingsProvider } from "./context/SettingsContext";
import { HouseSpecsProvider } from "./context/HouseSpecsContext";
import { MarketRatesProvider } from "./context/MarketRatesContext";
import { TakeoffProvider } from "./context/TakeoffContext";
import { ProjectProvider } from "./context/ProjectContext";
import { useRecentTools } from "./hooks/useRecentTools";
import { useAuth } from "./contexts/AuthContext";


import { CodeReferences } from "./components/ui/CodeReferences";
import { ProTipsWidget } from "./components/ui/ProTipsWidget";



import { ToolArticleWidget } from "./components/ui/ToolArticleWidget";

import { RelatedCalculators } from "./components/calculators/RelatedCalculators";
import DiscussionWidget from "./components/DiscussionWidget";

import { GlobalFAQ } from "./components/ui/GlobalFAQ";
import { FeedbackWidget } from "./components/ui/FeedbackWidget";
import ToolPageFooter from "./components/ToolPageFooter";
import PrintPreviewModal from "./components/ui/PrintPreviewModal";
import GlobalSearchModal from "./components/ui/GlobalSearchModal";
import AuthModal from "./components/auth/AuthModal";

type ModuleId = string;
import QSWorkflow from "./components/modules/QSWorkflow";
import QuickRoughEstimation from "./components/modules/QuickRoughEstimation";
import MasterQuantityEstimator from "./components/modules/MasterQuantityEstimator";
import HouseEstimator from "./components/modules/HouseEstimator";
import MaterialTakeoffSheet from "./components/modules/MaterialTakeoffSheet";
import ConstructionCostSummary from "./components/modules/ConstructionCostSummary";
import MeasurementSheetCalculator from "./components/modules/MeasurementSheetCalculator";
import BOQGenerator from "./components/modules/BOQGenerator";
import Takeoff from "./components/modules/Takeoff";
import RateAnalysis from "./components/modules/RateAnalysis";
import InteriorsFinishes from "./components/modules/InteriorsFinishes";
import AreaSpaceCalculator from "./components/modules/AreaSpaceCalculator";
import VolumeEstimator from "./components/modules/VolumeEstimator";
import MetalWeightCalculator from "./components/modules/MetalWeightCalculator";
import UnitConverter from "./components/modules/UnitConverter";
import AIAssistant from "./components/modules/AIAssistant";
import MasterRccCore from "./components/modules/MasterRccCore";
import Calculators from "./components/modules/Calculators";
import BarBendingSchedule from "./components/modules/BarBendingSchedule";
import ReinforcementVisualizer from "./components/modules/ReinforcementVisualizer";
import IsolatedFootingCalculator from "./components/modules/IsolatedFootingCalculator";
import RetainingWallCalculator from "./components/modules/RetainingWallCalculator";
import StaircaseCalculator from "./components/modules/StaircaseCalculator";
import AggregateTestsCalculator from "./components/modules/AggregateTestsCalculator";
import FormworkEstimator from "./components/modules/FormworkEstimator";
import RoadPavementEstimator from "./components/modules/RoadPavementEstimator";
import Earthworks from "./components/modules/Earthworks";
import ChainageVolume from "./components/modules/ChainageVolume";
import GradientCalculator from "./components/modules/GradientCalculator";
import AntiTermiteCalculator from "./components/modules/AntiTermiteCalculator";
import GeotechnicalCalculator from "./components/modules/GeotechnicalCalculator";
import CbrTestCalculator from "./components/modules/CbrTestCalculator";
import MasterSieveAnalysis from "./components/modules/MasterSieveAnalysis";
import AggregateBlendingCalculator from "./components/modules/AggregateBlendingCalculator";
import DirectShearTestCalculator from "./components/modules/DirectShearTestCalculator";
import PermeabilityCalculator from "./components/modules/PermeabilityCalculator";
import EnergyMepCalculator from "./components/modules/EnergyMepCalculator";
import SolarRoofCalculator from "./components/modules/SolarRoofCalculator";
import RainwaterHarvesting from "./components/modules/RainwaterHarvesting";
import ProjectManager from "./components/modules/ProjectManager";
import SiteProgressTracker from "./components/modules/SiteProgressTracker";
import LabourCalculator from "./components/modules/LabourCalculator";
import BeamDesignTool from "./components/modules/BeamDesignTool";
import ColumnDesignTool from "./components/modules/ColumnDesignTool";
import RaftFoundationDesigner from "./components/modules/RaftFoundationDesigner";
import WaterTankDesign from "./components/modules/WaterTankDesign";
import PileFoundationCalculator from "./components/modules/PileFoundationCalculator";
import PrestressedConcreteEstimator from "./components/modules/PrestressedConcreteEstimator";
import RoomAreaCalculator from "./components/modules/RoomAreaCalculator";
import BuildingSetbackCalculator from "./components/modules/BuildingSetbackCalculator";
import FarFsiCalculator from "./components/modules/FarFsiCalculator";
import StaircaseDesignReference from "./components/modules/StaircaseDesignReference";
import DoorWindowSchedule from "./components/modules/DoorWindowSchedule";
import VentilationChecker from "./components/modules/VentilationChecker";
import { ErrorBoundary } from "./components/ErrorBoundary";



const ModuleWrapper = ({ id, title, onNavigate, children }: { id: string, title: string, onNavigate: (id: string) => void, children: React.ReactNode }) => {
  const toolInfo = ALL_TOOLS.find(t => t.id === id);
  const category = toolInfo?.category || "General";
  const actualTitle = toolInfo?.title || title;
  const subtitle = toolInfo?.desc || "Standard Engineering Tool";
  const Icon = toolInfo?.icon;

  let themeType: 'default' | 'earth' | 'steel' | 'ocean' | 'emerald' | 'sunset' = 'default';
  if (category.includes('Geotechnical') || category.includes('Earthworks') || category.includes('Soil')) {
    themeType = 'earth';
  } else if (category.includes('Steel') || category.includes('RCC') || category.includes('Reinforcement') || category.includes('Structural')) {
    themeType = 'steel';
  } else if (category.includes('Water') || category.includes('Plumbing')) {
    themeType = 'ocean';
  } else if (category.includes('Energy') || category.includes('Solar') || category.includes('Sustainability') || category.includes('Environmental')) {
    themeType = 'emerald';
  } else if (category.includes('Architecture') || category.includes('Finishes') || category.includes('Interiors')) {
    themeType = 'sunset';
  }


  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Enter or Cmd+Enter to calculate results
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        const buttons = Array.from(document.querySelectorAll('button'));
        const calcBtn = buttons.find(b => 
          b.textContent?.toLowerCase().includes('calculate') || 
          b.textContent?.toLowerCase().includes('recalculate')
        );
        if (calcBtn) {
          calcBtn.click();
        }
      }

      // Esc to return to the dashboard
      if (e.key === 'Escape') {
        const activeModals = document.querySelectorAll('[role="dialog"], .modal-overlay, [data-modal]');
        if (activeModals.length > 0) {
          return;
        }
        onNavigate('home');
      }
    };
    
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [onNavigate]);

  return (

    <div className="flex-1 flex flex-col relative w-full bg-transparent">
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col">
        <ToolHeader id={id} title={actualTitle} themeType={themeType} subtitle={subtitle} icon={Icon} onNavigate={onNavigate} />
        <div className="global-form-card-wrapper w-full flex-1">
          <ErrorBoundary onNavigate={onNavigate} fallbackModuleId="home">
            {children}
          </ErrorBoundary>
        </div>
        
        <div className="mt-12 space-y-8 pb-16 print:hidden">
          <ProTipsWidget moduleId={id} />
          <ToolArticleWidget toolName={actualTitle} />
          <GlobalFAQ moduleId={id} />
          <RelatedCalculators category={category} currentSlug={id} />
          <FeedbackWidget toolName={actualTitle} />
          <DiscussionWidget moduleId={id} toolName={actualTitle} />
          <ToolPageFooter 
            toolName={actualTitle} 
            standards={["IS Codes", "NBC", "ACI", "BS", "MORTH"]} 
            formulaDescription="Estimations are calculated based on standard civil engineering formulas and latest regional guidelines."
            difficulty="Intermediate"
            lastUpdated={new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            category={category}
          />
        </div>
      </div>
      <div className="w-full shrink-0">
         <Footer activeModule={id} onNavigate={onNavigate} />
      </div>

      {/* Floating Back to Dashboard Button */}
      <button
        onClick={() => onNavigate('home')}
        aria-label="Back to dashboard"
        title="Back to Dashboard"
        className="group fixed bottom-6 right-6 md:bottom-8 md:right-8 w-14 h-14 flex items-center justify-center rounded-full bg-indigo-700 text-white shadow-[0_8px_20px_-4px_rgba(67,56,202,0.5)] backdrop-blur-xl z-[85] transition-all duration-200 ease-out hover:scale-105 hover:bg-indigo-800 hover:shadow-[0_12px_25px_-4px_rgba(67,56,202,0.7)] active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-700 focus:ring-offset-2 print:hidden overflow-hidden"
      >
        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 mix-blend-overlay rounded-full" />
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent translate-y-full group-hover:-translate-y-full transition-transform duration-500 ease-in-out" />
        <ArrowLeft className="w-5 h-5 relative z-10 transition-transform duration-200 ease-out group-hover:-translate-x-1" strokeWidth={2.5} />
      </button>
    </div>
  );
};


function renderModule(activeModule: string, onNavigate: (id: string) => void) {
  switch (activeModule) {

    case "qs-workflow":
      return <ModuleWrapper id={activeModule} onNavigate={onNavigate} title="QSWorkflow"><QSWorkflow /></ModuleWrapper>;

    case "quick-estimation":
      return <ModuleWrapper id={activeModule} onNavigate={onNavigate} title="QuickRoughEstimation"><QuickRoughEstimation /></ModuleWrapper>;

    case "master-quantity":
      return <ModuleWrapper id={activeModule} onNavigate={onNavigate} title="MasterQuantityEstimator"><MasterQuantityEstimator /></ModuleWrapper>;

    case "house":
      return <ModuleWrapper id={activeModule} onNavigate={onNavigate} title="HouseEstimator"><HouseEstimator /></ModuleWrapper>;

    case "material-takeoff":
      return <ModuleWrapper id={activeModule} onNavigate={onNavigate} title="MaterialTakeoffSheet"><MaterialTakeoffSheet /></ModuleWrapper>;

    case "cost-summary":
      return <ModuleWrapper id={activeModule} onNavigate={onNavigate} title="ConstructionCostSummary"><ConstructionCostSummary /></ModuleWrapper>;

    case "measurement-sheet":
      return <ModuleWrapper id={activeModule} onNavigate={onNavigate} title="MeasurementSheetCalculator"><MeasurementSheetCalculator /></ModuleWrapper>;

    case "boq":
      return <ModuleWrapper id={activeModule} onNavigate={onNavigate} title="BOQGenerator"><BOQGenerator /></ModuleWrapper>;

    case "takeoff":
      return <ModuleWrapper id={activeModule} onNavigate={onNavigate} title="Takeoff"><Takeoff /></ModuleWrapper>;

    case "rates":
      return <ModuleWrapper id={activeModule} onNavigate={onNavigate} title="RateAnalysis"><RateAnalysis /></ModuleWrapper>;

    case "interiors-finishes":
      return <ModuleWrapper id={activeModule} onNavigate={onNavigate} title="InteriorsFinishes"><InteriorsFinishes /></ModuleWrapper>;

    case "area-space-calculator":
      return <ModuleWrapper id={activeModule} onNavigate={onNavigate} title="AreaSpaceCalculator"><AreaSpaceCalculator /></ModuleWrapper>;

    case "volume-estimator":
      return <ModuleWrapper id={activeModule} onNavigate={onNavigate} title="VolumeEstimator"><VolumeEstimator /></ModuleWrapper>;

    case "metal-weight":
      return <ModuleWrapper id={activeModule} onNavigate={onNavigate} title="MetalWeightCalculator"><MetalWeightCalculator /></ModuleWrapper>;

    case "unit-converter":
      return <ModuleWrapper id={activeModule} onNavigate={onNavigate} title="UnitConverter"><UnitConverter /></ModuleWrapper>;

    case "ai":
      return <ModuleWrapper id={activeModule} onNavigate={onNavigate} title="AIAssistant"><AIAssistant /></ModuleWrapper>;

    case "master-rcc":
      return <ModuleWrapper id={activeModule} onNavigate={onNavigate} title="MasterRccCore"><MasterRccCore /></ModuleWrapper>;

    case "calculators":
      return <ModuleWrapper id={activeModule} onNavigate={onNavigate} title="Calculators"><Calculators /></ModuleWrapper>;

    case "bbs-generator":
      return <ModuleWrapper id={activeModule} onNavigate={onNavigate} title="BarBendingSchedule"><BarBendingSchedule /></ModuleWrapper>;

    case "reinforcement":
      return <ModuleWrapper id={activeModule} onNavigate={onNavigate} title="ReinforcementVisualizer"><ReinforcementVisualizer /></ModuleWrapper>;

    case "isolated-footing":
      return <ModuleWrapper id={activeModule} onNavigate={onNavigate} title="IsolatedFootingCalculator"><IsolatedFootingCalculator /></ModuleWrapper>;

    case "retaining-wall":
      return <ModuleWrapper id={activeModule} onNavigate={onNavigate} title="RetainingWallCalculator"><RetainingWallCalculator /></ModuleWrapper>;

    case "staircase-calculator":
      return <ModuleWrapper id={activeModule} onNavigate={onNavigate} title="StaircaseCalculator"><StaircaseCalculator /></ModuleWrapper>;

    case "aggregate-tests":
      return <ModuleWrapper id={activeModule} onNavigate={onNavigate} title="AggregateTestsCalculator"><AggregateTestsCalculator /></ModuleWrapper>;

    case "formwork":
      return <ModuleWrapper id={activeModule} onNavigate={onNavigate} title="FormworkEstimator"><FormworkEstimator /></ModuleWrapper>;

    case "road-pavement":
      return <ModuleWrapper id={activeModule} onNavigate={onNavigate} title="RoadPavementEstimator"><RoadPavementEstimator /></ModuleWrapper>;

    case "earthworks":
      return <ModuleWrapper id={activeModule} onNavigate={onNavigate} title="Earthworks"><Earthworks /></ModuleWrapper>;

    case "chainage":
      return <ModuleWrapper id={activeModule} onNavigate={onNavigate} title="ChainageVolume"><ChainageVolume /></ModuleWrapper>;

    case "gradient-calculator":
      return <ModuleWrapper id={activeModule} onNavigate={onNavigate} title="GradientCalculator"><GradientCalculator /></ModuleWrapper>;

    case "anti-termite":
      return <ModuleWrapper id={activeModule} onNavigate={onNavigate} title="AntiTermiteCalculator"><AntiTermiteCalculator /></ModuleWrapper>;

    case "geotechnical":
      return <ModuleWrapper id={activeModule} onNavigate={onNavigate} title="GeotechnicalCalculator"><GeotechnicalCalculator /></ModuleWrapper>;

    case "cbr-test":
      return <ModuleWrapper id={activeModule} onNavigate={onNavigate} title="CbrTestCalculator"><CbrTestCalculator /></ModuleWrapper>;

    case "master-sieve":
      return <ModuleWrapper id={activeModule} onNavigate={onNavigate} title="MasterSieveAnalysis"><MasterSieveAnalysis /></ModuleWrapper>;

    case "aggregate-blending":
      return <ModuleWrapper id={activeModule} onNavigate={onNavigate} title="AggregateBlendingCalculator"><AggregateBlendingCalculator /></ModuleWrapper>;

    case "direct-shear":
      return <ModuleWrapper id={activeModule} onNavigate={onNavigate} title="DirectShearTestCalculator"><DirectShearTestCalculator /></ModuleWrapper>;

    case "permeability-test":
      return <ModuleWrapper id={activeModule} onNavigate={onNavigate} title="PermeabilityCalculator"><PermeabilityCalculator /></ModuleWrapper>;

    case "mep-calculator":
      return <ModuleWrapper id={activeModule} onNavigate={onNavigate} title="EnergyMepCalculator"><EnergyMepCalculator /></ModuleWrapper>;

    case "solar-roof":
      return <ModuleWrapper id={activeModule} onNavigate={onNavigate} title="SolarRoofCalculator"><SolarRoofCalculator /></ModuleWrapper>;

    case "rainwater-harvesting":
      return <ModuleWrapper id={activeModule} onNavigate={onNavigate} title="RainwaterHarvesting"><RainwaterHarvesting /></ModuleWrapper>;

    case "projects":
      return <ModuleWrapper id={activeModule} onNavigate={onNavigate} title="ProjectManager"><ProjectManager /></ModuleWrapper>;

    case "tracker":
      return <ModuleWrapper id={activeModule} onNavigate={onNavigate} title="SiteProgressTracker"><SiteProgressTracker /></ModuleWrapper>;

    case "labour-calculator":
      return <ModuleWrapper id={activeModule} onNavigate={onNavigate} title="LabourCalculator"><LabourCalculator /></ModuleWrapper>;

    case "beam-design":
      return <ModuleWrapper id={activeModule} onNavigate={onNavigate} title="BeamDesignTool"><BeamDesignTool /></ModuleWrapper>;

    case "column-design":
      return <ModuleWrapper id={activeModule} onNavigate={onNavigate} title="ColumnDesignTool"><ColumnDesignTool /></ModuleWrapper>;

    case "raft-foundation":
      return <ModuleWrapper id={activeModule} onNavigate={onNavigate} title="RaftFoundationDesigner"><RaftFoundationDesigner /></ModuleWrapper>;

    case "water-tank-design":
      return <ModuleWrapper id={activeModule} onNavigate={onNavigate} title="WaterTankDesign"><WaterTankDesign /></ModuleWrapper>;

    case "pile-foundation":
      return <ModuleWrapper id={activeModule} onNavigate={onNavigate} title="PileFoundationCalculator"><PileFoundationCalculator /></ModuleWrapper>;

    case "prestressed-concrete":
      return <ModuleWrapper id={activeModule} onNavigate={onNavigate} title="PrestressedConcreteEstimator"><PrestressedConcreteEstimator /></ModuleWrapper>;

    case "room-area-calculator":
      return <ModuleWrapper id={activeModule} onNavigate={onNavigate} title="RoomAreaCalculator"><RoomAreaCalculator /></ModuleWrapper>;

    case "building-setback-calculator":
      return <ModuleWrapper id={activeModule} onNavigate={onNavigate} title="BuildingSetbackCalculator"><BuildingSetbackCalculator /></ModuleWrapper>;

    case "far-fsi-calculator":
      return <ModuleWrapper id={activeModule} onNavigate={onNavigate} title="FarFsiCalculator"><FarFsiCalculator /></ModuleWrapper>;

    case "staircase-design-reference":
      return <ModuleWrapper id={activeModule} onNavigate={onNavigate} title="StaircaseDesignReference"><StaircaseDesignReference /></ModuleWrapper>;

    case "door-window-schedule":
      return <ModuleWrapper id={activeModule} onNavigate={onNavigate} title="DoorWindowSchedule"><DoorWindowSchedule /></ModuleWrapper>;

    case "ventilation-checker":
      return <ModuleWrapper id={activeModule} onNavigate={onNavigate} title="VentilationChecker"><VentilationChecker /></ModuleWrapper>;

    default:
      return <div className="p-8 text-center text-slate-500">Module not found</div>;
  }
}


export default function App() {
  const { addRecentTool } = useRecentTools();
  const [searchTerm, setSearchTerm] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  const [activeModule, setActiveModule] = useState<ModuleId>(() => {
    const hash = window.location.hash;
    if (hash.startsWith("#/join/")) {
      return "join-project";
    }
    if (hash.startsWith("#/team")) {
      return "team-collaboration";
    }
    const saved = sessionStorage.getItem("activeModule");
    return (saved as ModuleId) || "home";
  });

  useEffect(() => {
    if (location.pathname.startsWith('/join/')) {
      setActiveModule('join-project');
    } else if (location.pathname === '/team') {
      setActiveModule('team-collaboration');
    }
  }, [location]);

  useEffect(() => {
    sessionStorage.setItem("activeModule", activeModule);
  }, [activeModule]);

  const [previousModule, setPreviousModule] = useState<ModuleId | null>(null);
    const [isMobileToolsOpen, setIsMobileToolsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState(false);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);

  useEffect(() => {
    const handlePrintAction = () => {
      setIsPrintPreviewOpen(true);
    };
    const handleGlobalSearchAction = () => {
      setIsGlobalSearchOpen(true);
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsGlobalSearchOpen(true);
      }
    };
    window.addEventListener("global-print-action", handlePrintAction);
    window.addEventListener("open-global-search", handleGlobalSearchAction);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("global-print-action", handlePrintAction);
      window.removeEventListener("open-global-search", handleGlobalSearchAction);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
  const [expandedCategory, setExpandedCategory] = useState<string | null>("Core Estimators");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { user, logOut } = useAuth();

  useEffect(() => {
    const handleOpenAuth = () => setIsAuthOpen(true);
    window.addEventListener("open-login-modal", handleOpenAuth);
    return () => window.removeEventListener("open-login-modal", handleOpenAuth);
  }, []);

  useEffect(() => {
    // Force Scroll-to-Top on Load
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
    
    // Safety fallback: sometimes nested scrollable containers keep their scroll
    setTimeout(() => {
      window.scrollTo(0, 0);
      if (scrollRef.current) scrollRef.current.scrollTo(0, 0);
      const mainContent = document.getElementById('main-content');
      if (mainContent) mainContent.scrollTo(0, 0);
    }, 10);
    setTimeout(() => {
      window.scrollTo(0, 0);
      document.querySelectorAll('.overflow-y-auto, .overflow-y-scroll').forEach(el => {
        el.scrollTop = 0;
      });
    }, 100);
  }, [activeModule]);

  useEffect(() => {
    const handleGoHome = () => { setPreviousModule(activeModule); setActiveModule("home"); };
    const handleOpenProfile = () => { setIsProfileOpen(true); };
    window.addEventListener("go-home", handleGoHome);
    window.addEventListener("open-profile", handleOpenProfile);
    return () => {
      window.removeEventListener("go-home", handleGoHome);
      window.removeEventListener("open-profile", handleOpenProfile);
    };
  }, [activeModule]);

  // Global input validation for numeric fields
  useEffect(() => {
    const setNativeValue = (element: HTMLInputElement, value: string) => {
        const valueSetter = Object.getOwnPropertyDescriptor(element, 'value')?.set;
        const prototype = Object.getPrototypeOf(element);
        const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;

        if (valueSetter && valueSetter !== prototypeValueSetter) {
            prototypeValueSetter?.call(element, value);
        } else {
            valueSetter?.call(element, value);
        }
    };

    const validateNumericInput = (target: HTMLInputElement) => {
      if (target.tagName === 'INPUT' && (target.type === 'number' || target.inputMode === 'decimal' || target.inputMode === 'numeric')) {
        // Skip validation for specific fields that might allow negative values
        if (target.id.includes('temperature') || target.name.includes('temperature') || target.className.includes('allow-negative')) return;
        
        const val = parseFloat(target.value);
        if (val < 0) {
          target.setCustomValidity("Please enter a valid, non-negative value.");
          target.reportValidity();
          target.classList.add('!border-red-500', '!ring-2', '!ring-red-500', '!bg-red-50', '!text-red-700');
        } else {
          target.setCustomValidity("");
          target.classList.remove('!border-red-500', '!ring-2', '!ring-red-500', '!bg-red-50', '!text-red-700');
        }
      }
    };

    const handleInput = (e: Event) => validateNumericInput(e.target as HTMLInputElement);
    
    const handleFocusOut = (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (target.tagName === 'INPUT' && (target.type === 'number' || target.inputMode === 'decimal' || target.inputMode === 'numeric')) {
        if (target.id.includes('temperature') || target.name.includes('temperature') || target.className.includes('allow-negative')) return;

        const val = parseFloat(target.value);
        if (val < 0) {
          // Auto-correct to absolute value on blur
          setNativeValue(target, Math.abs(val).toString());
          target.dispatchEvent(new Event('input', { bubbles: true }));
          target.setCustomValidity("");
          target.classList.remove('!border-red-500', '!ring-2', '!ring-red-500', '!bg-red-50', '!text-red-700');
        }
      }
    };

    const handleUnitsChanged = (e: Event) => {
      const customEvent = e as CustomEvent;
      const newMeasurement = customEvent.detail?.measurement;
      if (!newMeasurement) return;

      const inputs = document.querySelectorAll('input[type="number"], input[inputmode="decimal"], input[inputmode="numeric"]');
      
      inputs.forEach((input) => {
        const target = input as HTMLInputElement;
        const val = parseFloat(target.value);
        if (isNaN(val) || val === 0) return;

        const identifiers = (target.id + " " + target.name + " " + target.placeholder + " " + target.className).toLowerCase();
        
        if (
          identifiers.includes('price') || 
          identifiers.includes('cost') || 
          identifiers.includes('rate') || 
          identifiers.includes('percent') || 
          identifiers.includes('ratio') || 
          identifiers.includes('count') || 
          identifiers.includes('quantity') ||
          identifiers.includes('days') ||
          identifiers.includes('hours') ||
          identifiers.includes('year') ||
          identifiers.includes('month') ||
          identifiers.includes('bag')
        ) {
          return;
        }
        
        let factor = 1;
        
        if (identifiers.includes('volume') || identifiers.includes('cubic')) {
           factor = newMeasurement === 'SI' ? (1 / 35.3147) : 35.3147;
        } else if (identifiers.includes('area') || identifiers.includes('sq') || identifiers.includes('square')) {
           factor = newMeasurement === 'SI' ? (1 / 10.7639) : 10.7639;
        } else if (identifiers.includes('weight') || identifiers.includes('mass') || identifiers.includes('kg') || identifiers.includes('lbs')) {
           factor = newMeasurement === 'SI' ? (1 / 2.20462) : 2.20462;
        } else {
           factor = newMeasurement === 'SI' ? 0.3048 : 3.28084;
        }
        
        const newVal = Number((val * factor).toFixed(3));
        setNativeValue(target, newVal.toString());
        target.dispatchEvent(new Event('input', { bubbles: true }));
      });
    };

    document.addEventListener('input', handleInput, true);
    document.addEventListener('focusout', handleFocusOut, true);
    window.addEventListener('units-changed', handleUnitsChanged);

    return () => {
      document.removeEventListener('input', handleInput, true);
      document.removeEventListener('focusout', handleFocusOut, true);
      window.removeEventListener('units-changed', handleUnitsChanged);
    };
  }, []);

  
  useEffect(() => {
    const handleToolSearchFocus = (e: Event) => {
      const customEvent = e as CustomEvent;
      const term = customEvent.detail?.term?.toLowerCase();
      if (!term) return;

      // Find the best input to focus
      setTimeout(() => {
        const inputs = Array.from(document.querySelectorAll('input, textarea, select'));
        let targetInput = null;
        
        for (const input of inputs) {
          const el = input as HTMLInputElement;
          const identifiers = [el.name, el.id, el.placeholder, el.className].join(' ').toLowerCase();
          
          // Check if any search word is in the input's identifiers
          const words = term.split(/\s+/).filter(Boolean);
          if (words.some((word: string) => identifiers.includes(word))) {
            targetInput = el;
            break;
          }
        }
        
        if (!targetInput && inputs.length > 0) {
           // Fallback to first visible input
           targetInput = inputs.find((el: any) => el.type !== 'hidden' && el.style.display !== 'none');
        }

        if (targetInput) {
          (targetInput as HTMLElement).focus();
          
          // Optional: highlight it temporarily
          const originalClass = targetInput.className;
          targetInput.classList.add('ring-2', 'ring-indigo-500', 'ring-offset-2', 'transition-all');
          setTimeout(() => {
             targetInput?.classList.remove('ring-2', 'ring-indigo-500', 'ring-offset-2');
          }, 2000);
        }
      }, 500); // Wait for module render
    };
    
    window.addEventListener('tool-search-focus', handleToolSearchFocus);
    return () => window.removeEventListener('tool-search-focus', handleToolSearchFocus);
  }, []);

  const [activeLayoutId, setActiveLayoutId] = useState<string | null>(null);


  const handleSelectModule = (id: ModuleId, layoutId?: string) => {
    setPreviousModule(activeModule);
    setActiveLayoutId(layoutId || `module-${id}`);
    setActiveModule(id);
        
    // Track tools that are calculators/modules (not home or pages)
    if (id !== "home" && id !== "about" && id !== "careers" && id !== "contact" && id !== "blog" && id !== "pricing" && id !== "privacy" && id !== "terms" && id !== "cookies") {
      addRecentTool(id);
    }
  };

  return (
    <SmoothScroll>
      <SkipToContent />
      <LoadingScreen />
      <CustomCursor />
      <ScrollToTop isHome={activeModule === "home"} />
      <ThemeProvider>
      <SettingsProvider>
        <HouseSpecsProvider>
          <MarketRatesProvider>
            <TakeoffProvider>
              <ProjectProvider>
                <div className="flex flex-col min-h-screen w-full bg-gradient-to-br from-slate-50 via-[#f8fafc] to-blue-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-500">
                  <Toaster position="bottom-right" />
                  <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
                  <PrintPreviewModal isOpen={isPrintPreviewOpen} onClose={() => setIsPrintPreviewOpen(false)} />
                  <GlobalSearchModal isOpen={isGlobalSearchOpen} onClose={() => setIsGlobalSearchOpen(false)} onNavigate={handleSelectModule} />
                  
                  {/* Persistent, Universal "Back to Dashboard" Component */}
                  <AnimatePresence>
                    {activeModule !== "home" && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8, x: -20 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.8, x: -20 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        onClick={() => handleSelectModule('home')}
                        aria-label="Back to dashboard"
                        title="Back to Dashboard"
                        className="fixed top-20 left-4 sm:top-24 sm:left-6 z-50 flex items-center justify-center w-12 h-12 rounded-full bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.1)] border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-md transition-all duration-300 ease-out hover:scale-105 hover:bg-white dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 hover:shadow-[0_8px_25px_-4px_rgba(67,56,202,0.15)] active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 print:hidden"
                      >
                        <ArrowLeft className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1" strokeWidth={2.5} />
                      </motion.button>
                    )}
                  </AnimatePresence>
                  
                  <ProductTour />
                  
                  <TopNavbar
                    onOpenAuth={() => setIsAuthOpen(true)}
                    onOpenProfile={() => setIsProfileOpen(true)}
                    onNavigate={handleSelectModule}
                  />

                  <div className="flex flex-1 relative w-full">
                    
                    <main id="main-content" className="flex-1 flex flex-col bg-transparent relative w-full transition-all duration-300">
                      <div className="w-full flex-1 flex flex-col relative transition-all duration-300">
                        <div className="flex-1 flex flex-col relative w-full transition-colors duration-300 md:bg-white/50 dark:md:bg-slate-900/50 md:backdrop-blur-sm">
                          <AnimatePresence>
                            <motion.div
                              key={activeModule}
                              layoutId={activeLayoutId || `module-${activeModule}`}
                              initial={{ opacity: 0, y: 15 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -15 }}
                              transition={{ duration: 0.3, ease: "easeInOut" }}
                              className="flex-1 flex flex-col relative w-full"
                            >
                              {["home", "my-estimates", "about", "careers", "contact", "blog", "privacy", "terms", "cookies"].includes(activeModule) ? (
                                <div ref={scrollRef} className="flex-1 flex flex-col relative w-full overflow-visible">
                                  <div className="flex flex-col relative w-full">
                                    {activeModule === "home" && <Dashboard previousModule={previousModule} onSelectModule={handleSelectModule}  onOpenSettings={() => setIsSettingsOpen(true)} onOpenAuth={() => setIsAuthOpen(true)} />}
                                    {activeModule === "my-estimates" && <RecentEstimates onSelectModule={handleSelectModule} />}
                                    {activeModule === "pricing" && <PricingPage />}
                                    {activeModule === "about" && <div className="p-8 pt-12"><AboutUs /></div>}
                                    {activeModule === "careers" && <div className="p-8 pt-12"><Careers /></div>}
                                    {activeModule === "contact" && <div className="p-8 pt-12"><Contact /></div>}
                                    {activeModule === "blog" && <div className="p-8 pt-12"><Blog /></div>}
                                    {activeModule === "privacy" && <LegalPages page="privacy" onNavigate={handleSelectModule} />}
                                    {activeModule === "terms" && <LegalPages page="terms" onNavigate={handleSelectModule} />}
                                    {activeModule === "cookies" && <LegalPages page="cookies" onNavigate={handleSelectModule} />}
                                    <Footer activeModule={activeModule} onNavigate={handleSelectModule} />
                                  </div>
                                </div>
                              ) : (
                                <div className="flex-1 flex flex-col relative w-full bg-transparent">
                                  <div className="w-full flex-1 flex flex-col">
                                    <div className="global-form-card-wrapper w-full flex-1">
                                      {renderModule(activeModule, handleSelectModule)}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </motion.div>
                          </AnimatePresence>
                        </div>
                      </div>
                    </main>
                  </div>
                </div>
              </ProjectProvider>
            </TakeoffProvider>
          </MarketRatesProvider>
        </HouseSpecsProvider>
      </SettingsProvider>
      </ThemeProvider>
    </SmoothScroll>
  );
}
