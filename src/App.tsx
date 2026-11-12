import AppDownloadBanner from "./components/ui/AppDownloadBanner";

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
import BrickCalculatorPage from "./components/pages/BrickCalculatorPage";
import Footer from "./components/Footer";
import SmoothScroll from "./components/ui/SmoothScroll";
import SkipToContent from "./components/ui/SkipToContent";
import LoadingScreen from "./components/ui/LoadingScreen";
import ScrollToTop from "./components/ui/ScrollToTop";
import SectionNavigator from "./components/ui/SectionNavigator";
import ScrollProgressBar from "./components/ui/ScrollProgressBar";
import ReadingTimeIndicator from "./components/ui/ReadingTimeIndicator";
import BackButton from "./components/ui/BackButton";
import { ToolHeader } from "./components/ui/ToolHeader";
import ModuleSummaryDashboard from "./components/ui/ModuleSummaryDashboard";
import Breadcrumb from "./components/Breadcrumb";
import { Toaster } from "react-hot-toast";
import { ProductTour } from "./components/ui/ProductTour";

import { ThemeProvider } from "./context/ThemeContext";
import { BOQProvider } from "./context/BOQContext";
import MasterBOQDrawer from "./components/boq/MasterBOQDrawer";
import FloatingBOQButton from "./components/ui/FloatingBOQButton";
import { FileText } from "lucide-react";
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
import MasterFinishesWorkspace from "./components/modules/MasterFinishesWorkspace";
import QuickRoughEstimation from "./components/modules/QuickRoughEstimation";
import MasterQuantityEstimator from "./components/modules/MasterQuantityEstimator";
import HouseEstimator from "./components/modules/HouseEstimator";
import MaterialTakeoffSheet from "./components/modules/MaterialTakeoffSheet";
import ConstructionCostSummary from "./components/modules/ConstructionCostSummary";
import MeasurementSheetCalculator from "./components/modules/MeasurementSheetCalculator";
import BOQGenerator from "./components/modules/BOQGenerator";
import Takeoff from "./components/modules/Takeoff";
import RateAnalysis from "./components/modules/RateAnalysis";
import FinishesEstimator from "./components/calculators/FinishesEstimator";
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
import { SolarWaterHeaterCalculator } from "./components/calculators/SolarWaterHeaterCalculator";
import { RoofPitchCalculator } from "./components/calculators/RoofPitchCalculator";
import { TopsoilEstimator } from "./components/calculators/TopsoilEstimator";
import { WastewaterCalculator } from "./components/calculators/WastewaterCalculator";
import { PavementMixGradation } from "./components/calculators/PavementMixGradation";
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
import UniversalStructuralGeometryEngine from "./components/modules/UniversalStructuralGeometryEngine";
import MasterSoilMechanicsLabSuite from "./components/modules/MasterSoilMechanicsLabSuite";
import MasterInfrastructureMEPEngine from "./components/modules/MasterInfrastructureMEPEngine";
import { ErrorBoundary } from "./components/ErrorBoundary";
import SEOHead from "./components/SEOHead";
import { PrecastWallEstimator } from "./components/calculators/PrecastWallEstimator";
import { PlywoodEstimator } from "./components/calculators/PlywoodEstimator";



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
        // Never hijack Esc while typing, inside a menu/listbox, or when a dialog is open:
        // it used to throw users out of the tool (losing their inputs) from any field.
        const t = e.target as HTMLElement | null;
        const typing = !!t && (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable);
        const activeModals = document.querySelectorAll('[role="dialog"], [role="listbox"], [role="menu"], .modal-overlay, [data-modal]');
        if (typing || activeModals.length > 0 || e.defaultPrevented) {
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
        <SEOHead toolId={id} toolName={actualTitle} category={category} description={subtitle} />
        <ToolHeader id={id} title={actualTitle} themeType={themeType} subtitle={subtitle} icon={Icon} onNavigate={onNavigate} />
        <div className="global-form-card-wrapper w-full flex-1">
          <ErrorBoundary onNavigate={onNavigate} fallbackModuleId="home">
            {children}
          </ErrorBoundary>
        </div>
        
        <div className="mt-12 space-y-8 pb-16 print:hidden">
          <ModuleSummaryDashboard moduleId={id} />
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

    case "brick-calculator":
      return <BrickCalculatorPage />;

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
      return <ModuleWrapper id={activeModule} onNavigate={onNavigate} title="FinishesEstimator"><FinishesEstimator /></ModuleWrapper>;

    case "plywood-estimator":
      return <ModuleWrapper id={activeModule} onNavigate={onNavigate} title="PlywoodEstimator"><PlywoodEstimator /></ModuleWrapper>;
    case "precast-wall":
      return <ModuleWrapper id={activeModule} onNavigate={onNavigate} title="PrecastWallEstimator"><PrecastWallEstimator /></ModuleWrapper>;
    case "area-space-calculator":
      return <ModuleWrapper id={activeModule} onNavigate={onNavigate} title="AreaSpaceCalculator"><AreaSpaceCalculator /></ModuleWrapper>;

    case "volume-estimator":
      return <ModuleWrapper id={activeModule} onNavigate={onNavigate} title="VolumeEstimator"><VolumeEstimator /></ModuleWrapper>;

    case "metal-weight":
      return <ModuleWrapper id={activeModule} onNavigate={onNavigate} title="MetalWeightCalculator"><MetalWeightCalculator /></ModuleWrapper>;

    case "unit-converter":
      return <ModuleWrapper id={activeModule} onNavigate={onNavigate} title="UnitConverter"><UnitConverter /></ModuleWrapper>;

    case "master-finishes":
      return <ModuleWrapper id={activeModule} onNavigate={onNavigate} title="MasterFinishesWorkspace"><MasterFinishesWorkspace /></ModuleWrapper>;
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

    case "pavement-mix":
      return <ModuleWrapper id={activeModule} onNavigate={onNavigate} title="Pavement Mix Gradation"><PavementMixGradation /></ModuleWrapper>;
    case "wastewater-calculator":
      return <ModuleWrapper id={activeModule} onNavigate={onNavigate} title="WastewaterCalculator"><WastewaterCalculator /></ModuleWrapper>;
    case "topsoil-estimator":
      return <ModuleWrapper id={activeModule} onNavigate={onNavigate} title="TopsoilEstimator"><TopsoilEstimator /></ModuleWrapper>;
    case "roof-calculator":
      return <ModuleWrapper id={activeModule} onNavigate={onNavigate} title="RoofPitchCalculator"><RoofPitchCalculator /></ModuleWrapper>;
    case "solar-water-heater":
      return <ModuleWrapper id={activeModule} onNavigate={onNavigate} title="SolarWaterHeaterCalculator"><SolarWaterHeaterCalculator /></ModuleWrapper>;

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

    case "infra-mep-engine":
      return <ModuleWrapper id={activeModule} onNavigate={onNavigate} title="MasterInfrastructureMEPEngine"><MasterInfrastructureMEPEngine /></ModuleWrapper>;

    case "soil-mechanics-lab":
      return <ModuleWrapper id={activeModule} onNavigate={onNavigate} title="MasterSoilMechanicsLabSuite"><MasterSoilMechanicsLabSuite /></ModuleWrapper>;

    case "universal-structural-geometry":
      return <ModuleWrapper id={activeModule} onNavigate={onNavigate} title="UniversalStructuralGeometryEngine"><UniversalStructuralGeometryEngine /></ModuleWrapper>;

    case "door-window-schedule":
      return <ModuleWrapper id={activeModule} onNavigate={onNavigate} title="DoorWindowSchedule"><DoorWindowSchedule /></ModuleWrapper>;

    case "ventilation-checker":
      return <ModuleWrapper id={activeModule} onNavigate={onNavigate} title="VentilationChecker"><VentilationChecker /></ModuleWrapper>;

    default:
      return (
        <div className="mx-auto w-full max-w-[1024px] px-4 py-24 text-center">
          <p className="text-7xl font-extrabold tracking-tight text-txt-primary">404</p>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-txt-primary">This page doesn&rsquo;t exist</h1>
          <p className="mx-auto mt-2 max-w-md text-txt-secondary">
            The tool or page you&rsquo;re looking for was moved or never existed. Search for a calculator, or go back home.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="h-12 rounded-full bg-ink px-6 text-[15px] font-bold text-white shadow-brand-sm transition-colors hover:bg-ink-700"
            >
              Back to home
            </button>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('open-global-search'))}
              className="h-12 rounded-full border border-ui-borderStrong bg-surface-default px-6 text-[15px] font-bold text-txt-primary transition-colors hover:bg-surface-hover"
            >
              Search calculators
            </button>
          </div>
        </div>
      );
  }
}


/** Pages that are not calculators but are reachable via the URL hash (#/pricing, #/blog ...). */
const STATIC_PAGES = ["home", "my-estimates", "about", "careers", "contact", "blog", "pricing", "privacy", "terms", "cookies"];
const idFromPath = (pathname: string) => pathname.replace(/^\/+/, "").split("/")[0] || "home";
const pathFromId = (id: string) => (id === "home" ? "/" : `/${id}`);
const isKnownRoute = (id: string) => STATIC_PAGES.includes(id) || ALL_TOOLS.some((t) => t.id === id);

export default function App() {
  const { addRecentTool } = useRecentTools();
  const [searchTerm, setSearchTerm] = useState("");
  const [isBOQOpen, setIsBOQOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const [activeModule, setActiveModule] = useState<ModuleId>(() => {
    // Clean URLs (BrowserRouter): read the real path first. Legacy hash links
    // (#/tool-id) still work as a fallback.
    const path = window.location.pathname && window.location.pathname !== "/"
      ? window.location.pathname
      : (window.location.hash.replace(/^#/, "") || "/");
    if (path.startsWith("/join/") || window.location.hash.startsWith("#/join/")) {
      return "join-project";
    }
    if (path.startsWith("/team") || window.location.hash.startsWith("#/team")) {
      return "team-collaboration";
    }
    const fromUrl = idFromPath(path);
    return (isKnownRoute(fromUrl) ? fromUrl : "home") as ModuleId;
  });

  useEffect(() => {
    if (location.pathname.startsWith('/join/')) {
      setActiveModule('join-project');
    } else if (location.pathname === '/team') {
      setActiveModule('team-collaboration');
    } else {
      const id = idFromPath(location.pathname);
      if (isKnownRoute(id)) setActiveModule((prev) => (prev === id ? prev : id));
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
    const handleGoHome = () => { setPreviousModule(activeModule); setActiveModule("home"); navigate("/"); };
    const handleOpenProfile = () => { setIsProfileOpen(true); };
    const handleNavigateModule = (e: Event) => {
      const ce = e as CustomEvent;
      // Callers dispatch either a bare id ("rates") or { moduleId: "rates" }; the object form used to
      // become the active module itself and rendered "Module not found".
      const id = typeof ce.detail === "string" ? ce.detail : ce.detail?.moduleId;
      if (!id) return;
      setPreviousModule(activeModule);
      setActiveModule(id);
      navigate(pathFromId(id));
    };
    window.addEventListener("navigate-module", handleNavigateModule);
    window.addEventListener("go-home", handleGoHome);
    window.addEventListener("open-profile", handleOpenProfile);
    return () => {
      window.removeEventListener("navigate-module", handleNavigateModule);
      window.removeEventListener("go-home", handleGoHome);
      window.removeEventListener("open-profile", handleOpenProfile);
    };
  }, [activeModule, navigate]);

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
          target.classList.add('!border-ui-errorBorder', '!ring-2', '!ring-ui-errorText', '!bg-ui-error', '!text-ui-errorText');
        } else {
          target.setCustomValidity("");
          target.classList.remove('!border-ui-errorBorder', '!ring-2', '!ring-ui-errorText', '!bg-ui-error', '!text-ui-errorText');
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
          target.classList.remove('!border-ui-errorBorder', '!ring-2', '!ring-ui-errorText', '!bg-ui-error', '!text-ui-errorText');
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
          targetInput.classList.add('ring-2', 'ring-accent-500', 'ring-offset-2', 'transition-all');
          setTimeout(() => {
             targetInput?.classList.remove('ring-2', 'ring-accent-500', 'ring-offset-2');
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
    navigate(pathFromId(id));
        
    // Track tools that are calculators/modules (not home or pages)
    if (id !== "home" && id !== "about" && id !== "careers" && id !== "contact" && id !== "blog" && id !== "pricing" && id !== "privacy" && id !== "terms" && id !== "cookies") {
      const existing = JSON.parse(localStorage.getItem('cep_recent_tools') || '[]').find((t: any) => t.id === id);
      if (existing) {
        addRecentTool(id, existing.lastInputs);
      } else {
        addRecentTool(id);
      }
    }
  };

  return (
    <SmoothScroll>
      <SkipToContent />
      <LoadingScreen />
      <ScrollToTop isHome={activeModule === "home"} />
      <SectionNavigator />
      <ScrollProgressBar />
      <BackButton isVisible={activeModule !== "home"} onNavigate={() => handleSelectModule("home")} />
      <ThemeProvider>
      <SettingsProvider>
        <HouseSpecsProvider>
          <MarketRatesProvider>
            <TakeoffProvider>
              <BOQProvider>
          <ProjectProvider>
                <div className="flex flex-col min-h-screen w-full bg-surface-hover dark:bg-ink-900 font-sans text-txt-primary dark:text-txt-primary transition-colors duration-300">
                  <Toaster position="bottom-right" />
                  <AppDownloadBanner />
                  <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
                  <PrintPreviewModal isOpen={isPrintPreviewOpen} onClose={() => setIsPrintPreviewOpen(false)} />
                  <GlobalSearchModal isOpen={isGlobalSearchOpen} onClose={() => setIsGlobalSearchOpen(false)} onNavigate={handleSelectModule} />
                  

                  
                  <ProductTour />
                  
                  <TopNavbar
                    
                    onOpenAuth={() => setIsAuthOpen(true)}
                    onOpenProfile={() => setIsProfileOpen(true)}
                    onNavigate={handleSelectModule}
                  />

                  <div className="flex flex-1 relative w-full pb-24 md:pb-0">
                    
                    <motion.main 
                      id="main-content"
                      tabIndex={-1}
                      initial="hidden"
                      animate="show"
                      variants={{
                        hidden: { opacity: 0 },
                        show: {
                          opacity: 1,
                          transition: { staggerChildren: 0.15, delayChildren: 0.1 }
                        }
                      }}
                      className="flex-1 flex flex-col bg-transparent relative w-full transition-all duration-300"
                    >
                      <ReadingTimeIndicator activeModule={activeModule} />
                      <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } } }} className="w-full flex-1 flex flex-col relative transition-all duration-300">
                        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } } }} className="flex-1 flex flex-col relative w-full transition-colors duration-300">
                          <AnimatePresence mode="wait">
                            <motion.div
                              key={activeModule}
                              initial="hidden"
                              animate="show"
                              exit="exit"
                              variants={{
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1], staggerChildren: 0.15 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } }
}}
                              className="flex-1 flex flex-col relative w-full"
                            >
                              {STATIC_PAGES.includes(activeModule) ? (
                                                                <motion.div ref={scrollRef} className="flex-1 flex flex-col relative w-full overflow-visible" variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.15 } } }}>
                                  <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } } }} className="flex flex-col relative w-full">
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
                                  </motion.div>
                                  <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } } }}>
                                    <Footer  onNavigate={handleSelectModule} />
                                  </motion.div>
                                </motion.div>
                              ) : (
                                <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } } }} className="flex-1 flex flex-col relative w-full bg-transparent">
                                  <div className="w-full flex-1 flex flex-col">
                                    <div className="global-form-card-wrapper w-full flex-1">
                                      {renderModule(activeModule, handleSelectModule)}
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </motion.div>
                          </AnimatePresence>
                        </motion.div>
                      </motion.div>
                    </motion.main>
                  </div>
                </div>
              </ProjectProvider>
          <MasterBOQDrawer isOpen={isBOQOpen} onClose={() => setIsBOQOpen(false)} />
          <FloatingBOQButton onClick={() => setIsBOQOpen(true)} />
          </BOQProvider>
            </TakeoffProvider>
          </MarketRatesProvider>
        </HouseSpecsProvider>
      </SettingsProvider>
      </ThemeProvider>
    </SmoothScroll>
  );
}
