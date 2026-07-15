import { Navigate } from 'react-router-dom';
import React, { Suspense } from 'react';
import { ToolLoadingSkeleton } from './components/ui/ToolLoadingSkeleton';

const QSWorkflow = React.lazy(() => import("./components/modules/QSWorkflow"));
const QuickRoughEstimation = React.lazy(() => import("./components/modules/QuickRoughEstimation"));
const MasterQuantityEstimator = React.lazy(() => import("./components/modules/MasterQuantityEstimator"));
const HouseEstimator = React.lazy(() => import("./components/modules/HouseEstimator"));
const MaterialTakeoffSheet = React.lazy(() => import("./components/modules/MaterialTakeoffSheet"));
const ConstructionCostSummary = React.lazy(() => import("./components/modules/ConstructionCostSummary"));
const MeasurementSheetCalculator = React.lazy(() => import("./components/modules/MeasurementSheetCalculator"));
const BOQGenerator = React.lazy(() => import("./components/modules/BOQGenerator"));
const Takeoff = React.lazy(() => import("./components/modules/Takeoff"));
const RateAnalysis = React.lazy(() => import("./components/modules/RateAnalysis"));
const InteriorsFinishes = React.lazy(() => import("./components/modules/InteriorsFinishes"));
const AreaSpaceCalculator = React.lazy(() => import("./components/modules/AreaSpaceCalculator"));
const VolumeEstimator = React.lazy(() => import("./components/modules/VolumeEstimator"));
const MetalWeightCalculator = React.lazy(() => import("./components/modules/MetalWeightCalculator"));
const UnitConverter = React.lazy(() => import("./components/modules/UnitConverter"));
const AIAssistant = React.lazy(() => import("./components/modules/AIAssistant"));
const MasterRccCore = React.lazy(() => import("./components/modules/MasterRccCore"));
const Calculators = React.lazy(() => import("./components/modules/Calculators"));
const BarBendingSchedule = React.lazy(() => import("./components/modules/BarBendingSchedule"));
const ReinforcementVisualizer = React.lazy(() => import("./components/modules/ReinforcementVisualizer"));
const IsolatedFootingCalculator = React.lazy(() => import("./components/modules/IsolatedFootingCalculator"));
const RetainingWallCalculator = React.lazy(() => import("./components/modules/RetainingWallCalculator"));
const StaircaseCalculator = React.lazy(() => import("./components/modules/StaircaseCalculator"));
const AggregateTestsCalculator = React.lazy(() => import("./components/modules/AggregateTestsCalculator"));
const FormworkEstimator = React.lazy(() => import("./components/modules/FormworkEstimator"));
const RoadPavementEstimator = React.lazy(() => import("./components/modules/RoadPavementEstimator"));
const Earthworks = React.lazy(() => import("./components/modules/Earthworks"));
const ChainageVolume = React.lazy(() => import("./components/modules/ChainageVolume"));
const GradientCalculator = React.lazy(() => import("./components/modules/GradientCalculator"));
const AntiTermiteCalculator = React.lazy(() => import("./components/modules/AntiTermiteCalculator"));
const GeotechnicalCalculator = React.lazy(() => import("./components/modules/GeotechnicalCalculator"));
const CbrTestCalculator = React.lazy(() => import("./components/modules/CbrTestCalculator"));
const MasterSieveAnalysis = React.lazy(() => import("./components/modules/MasterSieveAnalysis"));
const AggregateBlendingCalculator = React.lazy(() => import("./components/modules/AggregateBlendingCalculator"));
const DirectShearTestCalculator = React.lazy(() => import("./components/modules/DirectShearTestCalculator"));
const PermeabilityCalculator = React.lazy(() => import("./components/modules/PermeabilityCalculator"));
const EnergyMepCalculator = React.lazy(() => import("./components/modules/EnergyMepCalculator"));
const SolarRoofCalculator = React.lazy(() => import("./components/modules/SolarRoofCalculator"));
const RainwaterHarvesting = React.lazy(() => import("./components/modules/RainwaterHarvesting"));
const ProjectManager = React.lazy(() => import("./components/modules/ProjectManager"));
const SiteProgressTracker = React.lazy(() => import("./components/modules/SiteProgressTracker"));
const LabourCalculator = React.lazy(() => import("./components/modules/LabourCalculator"));
const BeamDesignTool = React.lazy(() => import("./components/modules/BeamDesignTool"));
const ColumnDesignTool = React.lazy(() => import("./components/modules/ColumnDesignTool"));
const RaftFoundationDesigner = React.lazy(() => import("./components/modules/RaftFoundationDesigner"));
const WaterTankDesign = React.lazy(() => import("./components/modules/WaterTankDesign"));
const PileFoundationCalculator = React.lazy(() => import("./components/modules/PileFoundationCalculator"));
const PrestressedConcreteEstimator = React.lazy(() => import("./components/modules/PrestressedConcreteEstimator"));
const RoomAreaCalculator = React.lazy(() => import("./components/modules/RoomAreaCalculator"));
const BuildingSetbackCalculator = React.lazy(() => import("./components/modules/BuildingSetbackCalculator"));
const FarFsiCalculator = React.lazy(() => import("./components/modules/FarFsiCalculator"));
const DoorWindowSchedule = React.lazy(() => import("./components/modules/DoorWindowSchedule"));
const VentilationChecker = React.lazy(() => import("./components/modules/VentilationChecker"));

const LazyTool = ({ children }) => (
  <Suspense fallback={<ToolLoadingSkeleton />}>
    {children}
  </Suspense>
);



/* 
 * NOTE: This is a routing configuration array designed for React Router v6.
 * You can load these routes directly into createBrowserRouter() or useRoutes().
 * 
 * Example usage:
 * const router = createBrowserRouter(routes);
 * return <RouterProvider router={router} />;
 */

export const routes = [
  {
    path: "/",
    async lazy() {
      const { default: Dashboard } = await import("./components/Dashboard");
      return { element: <Dashboard /> };
    }
  },
  {
    path: "/team",
    async lazy() {
      const { default: TeamCollaboration } = await import("./components/pages/TeamCollaboration");
      return { element: <TeamCollaboration /> };
    }
  },
  {
    path: "/join/:projectId/:shareToken",
    async lazy() {
      const { default: JoinProject } = await import("./components/pages/JoinProject");
      return { element: <JoinProject /> };
    }
  },
  {
    path: "/about",
    async lazy() {
      const { default: AboutUs } = await import("./components/pages/AboutUs");
      return { element: <AboutUs /> };
    }
  },
  {
    path: "/pricing",
    async lazy() {
      const { default: PricingPage } = await import("./components/pages/PricingPage");
      return { element: <PricingPage /> };
    }
  },
  {
    path: "/standards",
    async lazy() {
      const { default: StandardsReferencePage } = await import("./components/StandardsReferencePage");
      return { element: <StandardsReferencePage /> };
    }
  },

  // Legacy route redirect
  {
    path: "/tools/*",
    element: <Navigate to="/calculators" replace />
  },
  {
    path: "/calculators",
    async lazy() {
      // In a real implementation setup, this could go to an overarching 'All Tools' view
      const { default: Dashboard } = await import("./components/Dashboard");
      return { element: <Dashboard /> };
    }
  },

  /**
   * Tool Routes (Hierarchical & Keyword-Rich)
   */
  {
    path: "/calculators/quantity-estimation",
    children: [
      { path: "guided-qs-workflow-tool", element: <LazyTool><QSWorkflow /></LazyTool> },
      { path: "quick-rough-estimator", element: <LazyTool><QuickRoughEstimation /></LazyTool> },
      { path: "master-quantity-estimator", element: <LazyTool><MasterQuantityEstimator /></LazyTool> },
      { path: "area-plot-converter-marla-kanal", async lazy() { const { default: MarlaConverterPage } = await import("./components/pages/MarlaConverterPage"); return { element: <MarlaConverterPage /> }; } },
      { path: "house-construction-cost-calculator", async lazy() { const { default: PakistanCostCalculatorPage } = await import("./components/pages/PakistanCostCalculatorPage"); return { element: <PakistanCostCalculatorPage /> }; } },
      { path: "material-takeoff-generator", element: <LazyTool><MaterialTakeoffSheet /></LazyTool> },
      { path: "cost-summary-generator", element: <LazyTool><ConstructionCostSummary /></LazyTool> },
      { path: "measurement-sheet-calculator", element: <LazyTool><MeasurementSheetCalculator /></LazyTool> },
      { path: "boq-generator", element: <LazyTool><BOQGenerator /></LazyTool> },
      { path: "plan-measure-tool", element: <LazyTool><Takeoff /></LazyTool> },
      { path: "live-rates-calculator", element: <LazyTool><RateAnalysis /></LazyTool> },
      { path: "interiors-finishes-estimator", element: <LazyTool><InteriorsFinishes /></LazyTool> },
      { path: "area-space-calculator", element: <LazyTool><AreaSpaceCalculator /></LazyTool> },
      { path: "volume-tank-capacity-calculator", element: <LazyTool><VolumeEstimator /></LazyTool> },
      { path: "metal-weight-calculator", element: <LazyTool><MetalWeightCalculator /></LazyTool> },
      { path: "unit-converter-tool", element: <LazyTool><UnitConverter /></LazyTool> },
      { path: "ai-assistant-tool", element: <LazyTool><AIAssistant /></LazyTool> },
      { path: "project-manager-tool", element: <LazyTool><ProjectManager /></LazyTool> },
      { path: "site-progress-tracker-tool", element: <LazyTool><SiteProgressTracker /></LazyTool> },
      { path: "labour-workforce-estimator", element: <LazyTool><LabourCalculator /></LazyTool> },
    ]
  },
  {
    path: "/calculators/concrete",
    children: [
      { path: "master-rcc-estimator", element: <LazyTool><MasterRccCore /></LazyTool> },
      { path: "construction-material-calculator", element: <LazyTool><Calculators /></LazyTool> },
      
      { path: "bbs-generator", element: <LazyTool><BarBendingSchedule /></LazyTool> },
      { path: "reinforcement-detailing-visualizer-tool", element: <LazyTool><ReinforcementVisualizer /></LazyTool> },
      { path: "isolated-footing-calculator", element: <LazyTool><IsolatedFootingCalculator /></LazyTool> },
      { path: "retaining-wall-estimator", element: <LazyTool><RetainingWallCalculator /></LazyTool> },
      { path: "staircase-calculator", element: <LazyTool><StaircaseCalculator /></LazyTool> },
      { path: "aggregate-tests-calculator", element: <LazyTool><AggregateTestsCalculator /></LazyTool> },
      { path: "formwork-scaffold-estimator", element: <LazyTool><FormworkEstimator /></LazyTool> },
    ]
  },
  {
    path: "/calculators/road-pavement",
    children: [
      { path: "road-pavement-estimator", element: <LazyTool><RoadPavementEstimator /></LazyTool> },
      { path: "earthworks-excavation-calculator", element: <LazyTool><Earthworks /></LazyTool> },
      { path: "chainage-volume-calculator", element: <LazyTool><ChainageVolume /></LazyTool> },
      { path: "gradient-slope-calculator", element: <LazyTool><GradientCalculator /></LazyTool> },
      { path: "anti-termite-calculator", element: <LazyTool><AntiTermiteCalculator /></LazyTool> },
    ]
  },
  {
    path: "/calculators/geotechnical",
    children: [
      { path: "sieve-analysis-grading-calculator", element: <LazyTool><MasterSieveAnalysis /></LazyTool> },
      { path: "geotechnical-soil-tests-calculator", element: <LazyTool><GeotechnicalCalculator /></LazyTool> },
      { path: "cbr-test-calculator", element: <LazyTool><CbrTestCalculator /></LazyTool> },
      { path: "aggregate-blending-calculator", element: <LazyTool><AggregateBlendingCalculator /></LazyTool> },
      { path: "direct-shear-test-calculator", element: <LazyTool><DirectShearTestCalculator /></LazyTool> },
      { path: "permeability-calculator", element: <LazyTool><PermeabilityCalculator /></LazyTool> },
    ]
  },
  {
    path: "/calculators/mep",
    children: [
      { path: "energy-mep-calculator", element: <LazyTool><EnergyMepCalculator /></LazyTool> },
      { path: "solar-roof-calculator", element: <LazyTool><SolarRoofCalculator /></LazyTool> },
      { path: "rainwater-harvesting-calculator", element: <LazyTool><RainwaterHarvesting /></LazyTool> },
    ]
  },
  {
    path: "/calculators/structural-design",
    children: [
      { path: "beam-design-tool", element: <LazyTool><BeamDesignTool /></LazyTool> },
      { path: "column-design-tool", element: <LazyTool><ColumnDesignTool /></LazyTool> },
      { path: "raft-foundation-calculator", element: <LazyTool><RaftFoundationDesigner /></LazyTool> },
      { path: "water-tank-design-calculator", element: <LazyTool><WaterTankDesign /></LazyTool> },
      { path: "pile-foundation-calculator", element: <LazyTool><PileFoundationCalculator /></LazyTool> },
      { path: "prestressed-concrete-estimator", element: <LazyTool><PrestressedConcreteEstimator /></LazyTool> },
    ]
  },
  {
    path: "/calculators/architectural",
    children: [
      { path: "room-area-calculator", element: <LazyTool><RoomAreaCalculator /></LazyTool> },
      { path: "building-setback-calculator", element: <LazyTool><BuildingSetbackCalculator /></LazyTool> },
      { path: "far-fsi-calculator", element: <LazyTool><FarFsiCalculator /></LazyTool> },
      { path: "door-window-schedule-generator", element: <LazyTool><DoorWindowSchedule /></LazyTool> },
      { path: "ventilation-lighting-checker-tool", element: <LazyTool><VentilationChecker /></LazyTool> },
    ]
  }
];

/**
 * Demo component depicting how a generic ToolRenderer might consume the toolId 
 * while maintaining the correct React Router context.
 */
function ToolRenderer({ toolId }) {
  // Real implementation would render the specific <ModuleRenderer id={toolId} />
  // alongside ToolSEOMeta dynamically fetching the right headers.
  return <div data-tool-id={toolId}>Implementing Tool...</div>;
}
