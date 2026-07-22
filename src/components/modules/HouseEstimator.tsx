import ThumbRuleDistributionEngine from "../ui/ThumbRuleDistributionEngine";
import FormulaTransparencyCard from "../ui/FormulaTransparencyCard";
import React, { useState, useMemo, useReducer, useEffect } from "react";
import { useAutoSave } from "../../hooks/useAutoSave";
import { UniversalTabs } from "../ui/UniversalTabs";
import { CIVIL_CONSTANTS } from "../../utils/unitConverter";
import { GlobalSettingsToggle } from "../ui/GlobalSettingsToggle";
import { ResultCard } from "../ui/ResultCard";
import { MaterialSummary } from "../ui/MaterialSummary";
import { DetailedRoomEstimators } from "./DetailedRoomEstimators";
import { motion, AnimatePresence, useAnimation, Reorder } from "framer-motion";
import {
  Home,
  Layers,
  PaintRoller,
  Sliders,
  LayoutDashboard,
  Settings,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  Share2,
  Download,
  Database,
  RotateCcw,
  AlertCircle,
  ArrowRight,
  Spline,
  Calculator,
  Briefcase,
  X,
  CheckCircle2,
  Trash2,
  GripVertical,
  Copy,
  FolderPlus
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { StyledChart } from "../ui/EstimateVisualizer";
import { useMarketRates } from "../../context/MarketRatesContext";
import { useSettings } from "../../context/SettingsContext";

import AdvancedSpecs, { SpecsState, initialSpecs } from "./AdvancedSpecs";
import GlobalSettingsModal from "./GlobalSettingsModal";
import MasterRccStructure from "./MasterRccStructure";
import MasterQuantityEstimator from "./MasterQuantityEstimator";
import { CalculationHistory } from "../ui/CalculationHistory";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import UnitToggleGroup from "../ui/UnitToggleGroup";
import { MaskedInput } from "../ui/MaskedInput";
import { useSchema } from "../../hooks/useSchema";
import { GlobalFAQ } from "../ui/GlobalFAQ";
import { ToolGuidedTour, TourStep } from "../ui/ToolGuidedTour";
import { CodeTooltip } from "../ui/CodeTooltip";
import { GenericExportButtons } from "../ui/GenericExportButtons";

const HOUSE_TOUR_STEPS: TourStep[] = [
  {
    targetSelector: '#tour-house-area',
    title: 'Covered Area',
    content: 'Enter the total covered area for a single floor to begin your estimation.',
    placement: 'bottom'
  },
  {
    targetSelector: '#tour-room-height',
    title: 'Room Height',
    content: 'Adjust the standard height of your rooms. This affects the quantities of brickwork and plaster.',
    placement: 'bottom'
  },
  {
    targetSelector: 'input[type="range"].accent-violet-600',
    title: 'Finish Quality',
    content: 'Select between Standard, Premium, or Luxury finishes to see how it impacts your final cost.',
    placement: 'bottom'
  }
];

function AnimatedTableRow({ 
  item, 
  formatCurrency, 
  roundQuantity,
  selected,
  onSelect,
  onDuplicate,
  note,
  onNoteChange
}: { 
  item: any, 
  formatCurrency: (val: number) => string, 
  roundQuantity?: boolean,
  selected?: boolean,
  onSelect?: (name: string) => void,
  onDuplicate?: (item: any) => void,
  note?: string,
  onNoteChange?: (note: string) => void
}) {
  const controls = useAnimation();
  
  React.useEffect(() => {
    controls.start({
      backgroundColor: ["rgba(99, 102, 241, 0.25)", "rgba(255, 255, 255, 0)"],
      transition: { duration: 1.5, ease: "easeOut" }
    });
  }, [item.quantity, item.value, controls]);

  return (
    <Reorder.Item
      as="tr"
      value={item.name}
      initial={{ backgroundColor: "rgba(255, 255, 255, 0)" }}
      animate={controls}
      className={`transition-colors border-b border-transparent hover:bg-slate-50/50 group ${selected ? 'bg-indigo-50/40' : ''}`}
    >
      <td className="px-6 py-4 font-semibold text-slate-700 group">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-3 cursor-pointer select-none text-sm font-medium text-slate-700 mb-1 block">
            <GripVertical className="w-4 h-4 text-slate-600 cursor-grab active:cursor-grabbing hover:text-slate-600" />
            {onSelect && (
              <><label htmlFor="a11y-input-261" className="sr-only">Input</label>
<motion.input initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} id="a11y-input-261" 
                type="checkbox" 
                checked={selected}
                onChange={() => onSelect(item.name)}
                className="w-4 h-4 text-indigo-600 bg-white border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
              /></>
            )}
            <span>{item.name}</span>
          </label>
          {onDuplicate && (
            <button 
              onClick={() => onDuplicate(item)}
              className="opacity-0 group-hover:opacity-100 p-1 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-all rounded-full active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
              title="Duplicate Item"
            >
              <Copy className="w-4 h-4" />
            </button>
          )}
        </div>
      </td>
      <td className="px-6 py-4 text-center font-bold text-slate-600">
        {typeof item.quantity === "number"
          ? (roundQuantity ? Math.round(item.quantity).toLocaleString('en-US') : item.quantity.toLocaleString('en-US', { maximumFractionDigits: 1 }))
          : item.quantity}
        {item.rate && (
          <div className="text-sm font-normal text-slate-700 mt-0.5 font-mono">
            @ {formatCurrency(item.rate)}/{item.unit}
          </div>
        )}
      </td>
      <td className="px-6 py-4 text-center font-medium text-slate-700">
        {item.unit}
      </td>
      <td className="px-6 py-4 hidden md:table-cell">
        <><label htmlFor="a11y-input-262" className="sr-only">Add note...</label>
<motion.input initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} id="a11y-input-262" 
          type="text"
          value={note || ""}
          onChange={(e) => onNoteChange?.(e.target.value)}
          placeholder="Add note..."
          className="w-full min-w-[120px] bg-transparent border-0 border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:ring-0 text-sm text-slate-600 transition-colors px-0 py-1 placeholder:text-slate-700 focus:outline-none rounded-full"
        /></>
      </td>
      <td className="px-6 py-4 text-right font-bold text-slate-800">
        {formatCurrency(item.value)}
      </td>
    </Reorder.Item>
  );
}
type GeometryState = {
  plotSizeUnit: "marla" | "sqyd" | "sqft";
  plotSizeValue: string;
  coveredAreaSqft: string;
  roomHeight: string;
  stories: number;
  rooms: {
    bedrooms: number;
    washrooms: number;
    kitchens: number;
    drawingDining: number;
  };
  roomAreas: {
    bedrooms: string;
    washrooms: string;
    kitchens: string;
    drawingDining: string;
  };
  roomAreaUnit: "sqft" | "sqm" | "sqyd";
};
type GeometryAction =
  | { type: "SET_PLOT_SIZE_UNIT"; payload: "marla" | "sqyd" | "sqft" }
  | { type: "SET_PLOT_SIZE_VALUE"; payload: string }
  | { type: "SET_COVERED_AREA_SQFT"; payload: string }
  | { type: "SET_ROOM_HEIGHT"; payload: string }
  | { type: "SET_STORIES"; payload: number }
  | { type: "SET_ROOMS"; payload: Partial<GeometryState["rooms"]> }
  | { type: "INCREMENT_ROOM"; payload: keyof GeometryState["rooms"] }
  | { type: "DECREMENT_ROOM"; payload: keyof GeometryState["rooms"] }
  | {
      type: "SET_ROOM_AREA";
      payload: { room: keyof GeometryState["roomAreas"]; area: string };
    }
  | { type: "SET_ROOM_AREA_UNIT"; payload: "sqft" | "sqm" | "sqyd" }
  | { type: "RESTORE_ALL"; payload: GeometryState };
const initialGeometry: GeometryState = {
  plotSizeUnit: "marla",
  plotSizeValue: "5",
  coveredAreaSqft: "900",
  roomHeight: "10.5",
  stories: 2,
  rooms: { bedrooms: 3, washrooms: 3, kitchens: 1, drawingDining: 1 },
  roomAreas: {
    bedrooms: "150",
    washrooms: "45",
    kitchens: "100",
    drawingDining: "220",
  },
  roomAreaUnit: "sqft",
};
function geometryReducer(
  state: GeometryState,
  action: GeometryAction,
): GeometryState {
  switch (action.type) {
    case "SET_PLOT_SIZE_UNIT":
      return { ...state, plotSizeUnit: action.payload };
    case "SET_PLOT_SIZE_VALUE":
      return { ...state, plotSizeValue: action.payload };
    case "SET_COVERED_AREA_SQFT":
      return { ...state, coveredAreaSqft: action.payload };
    case "SET_ROOM_HEIGHT":
      return { ...state, roomHeight: action.payload };
    case "SET_STORIES":
      return { ...state, stories: action.payload };
    case "SET_ROOMS":
      return { ...state, rooms: { ...state.rooms, ...action.payload } };
    case "INCREMENT_ROOM":
      return {
        ...state,
        rooms: {
          ...state.rooms,
          [action.payload]: state.rooms[action.payload] + 1,
        },
      };
    case "DECREMENT_ROOM":
      return {
        ...state,
        rooms: {
          ...state.rooms,
          [action.payload]: Math.max(0, state.rooms[action.payload] - 1),
        },
      };
    case "SET_ROOM_AREA":
      return {
        ...state,
        roomAreas: {
          ...state.roomAreas,
          [action.payload.room]: action.payload.area,
        },
      };
    case "SET_ROOM_AREA_UNIT":
      return { ...state, roomAreaUnit: action.payload };
    case "RESTORE_ALL":
      return { ...action.payload };
    default:
      return state;
  }
}
function useSortedData(data: any[], order: string[]) {
  return useMemo(() => {
    if (order.length === 0) return data;
    const map = new Map();
    data.forEach(item => map.set(item.name, item));
    const result: any[] = [];
    order.forEach(name => {
      if (map.has(name)) {
        result.push(map.get(name));
        map.delete(name);
      }
    });
    data.forEach(item => {
      if (map.has(item.name)) result.push(item);
    });
    return result;
  }, [data, order]);
}

export default function HouseEstimator() {
  const {
    marketRates,
    customRates,
    rates,
    setCustomRate,
    resetCustomRates,
    isCustomRate,
  } = useMarketRates();
  const { formatCurrency, settings, convertAmount, updateSettings } = useSettings();
  const isSI = settings.measurement === "SI";
  const [geoState, dispatch] = useReducer(geometryReducer, initialGeometry);
  const [projectDetails, setProjectDetails] = useState({
    projectName: "",
    clientName: "",
    siteLocation: "",
  });
  const location = useLocation();
  const [hasParsedRoute, setHasParsedRoute] = useState(false);

  // Parse pSEO routing 
  useEffect(() => {
    if (hasParsedRoute) return;
    
    // e.g., /estimate/5-Marla-house-construction-cost-Lahore
    const match = location.pathname.match(/\/estimate\/(\d+(?:\.\d+)?)-([^-]+)-house-construction-cost-(.+)/i);
    if (match) {
      const value = parseFloat(match[1]);
      const unit = match[2]; // Marla, Sq.Ft, Sq.Yd
      const city = match[3];

      let parsedUnit = "Marla";
      if (unit.toLowerCase().includes("sq")) {
        if (unit.toLowerCase().includes("yd") || unit.toLowerCase().includes("yard")) {
          parsedUnit = "Sq.Yd";
        } else {
          parsedUnit = "Sq.Ft";
        }
      }

      dispatch({ type: "SET_PLOT_SIZE_UNIT", payload: parsedUnit.toLowerCase() as any });
      dispatch({ type: "SET_PLOT_SIZE_VALUE", payload: value.toString() });
      setProjectDetails((prev) => ({
        ...prev,
        siteLocation: city.replace(/-/g, " "),
      }));
      setHasParsedRoute(true);
    }
  }, [location.pathname, hasParsedRoute]);

  useSchema({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "name": "House Estimator Calculator by Civil Estimation Pro",
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "Web",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "PKR"
        },
        "description": "Generate highly accurate civil engineering estimates and BOQs in seconds. Features standard NBC Pakistan 2021 compliance.",
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.8",
          "ratingCount": "124"
        }
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "What engineering formulas does this tool use?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "It strictly uses internationally recognized civil engineering formulas relevant to the quantity estimation field, compliant with standards like NBC."
            }
          }
        ]
      }
    ]
  });

  const [itemNotes, setItemNotes] = useState<Record<string, string>>({});
  const [deletedItems, setDeletedItems] = useState<Set<string>>(new Set());
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [duplicatedItems, setDuplicatedItems] = useState<any[]>([]);
  const [foundationOrder, setFoundationOrder] = useState<string[]>([]);
  const [superstructureOrder, setSuperstructureOrder] = useState<string[]>([]);
  const [finishingOrder, setFinishingOrder] = useState<string[]>([]);

  const handleDuplicateRow = (item: any, section: string) => {
    const baseName = item.name.replace(/\s\(Copy \d+\)$/, '');
    const newItem = {
      ...item,
      name: `${baseName} (Copy ${Math.floor(Math.random() * 1000)})`, // Unique name for Reorder.Item
      _section: section,
      _id: Date.now()
    };
    setDuplicatedItems((prev) => [...prev, newItem]);
  };

  const handleNoteChange = (name: string, note: string) => {
    setItemNotes((prev) => ({ ...prev, [name]: note }));
  };

  const handleLoadTemplate = (type: "grey" | "finishing", templateName: string) => {
    let newItems: any[] = [];
    if (type === "grey") {
      if (templateName === "residential") {
        newItems = [
          { name: "Porch Column Footings", value: 45000, color: "#9ca3af", quantity: 4, unit: "Nos", rate: 11250, _section: "foundation", _id: Date.now() + 1 },
          { name: "Septic Tank", value: 65000, color: "#6b7280", quantity: 1, unit: "Lump Sum", rate: 65000, _section: "foundation", _id: Date.now() + 2 }
        ];
      } else if (templateName === "commercial") {
        newItems = [
          { name: "Basement Excavation", value: 250000, color: "#4b5563", quantity: 5000, unit: "Cft", rate: 50, _section: "foundation", _id: Date.now() + 1 },
          { name: "Pile Foundations", value: 450000, color: "#374151", quantity: 12, unit: "Nos", rate: 37500, _section: "foundation", _id: Date.now() + 2 },
          { name: "Steel Structure Core", value: 850000, color: "#1f2937", quantity: 5, unit: "Tons", rate: 170000, _section: "superstructure", _id: Date.now() + 3 }
        ];
      }
    } else {
      if (templateName === "residential") {
        newItems = [
          { name: "Kitchen Cabinets", value: 180000, color: "#10b981", quantity: 1, unit: "Lump Sum", rate: 180000, _section: "finishing", _id: Date.now() + 1 },
          { name: "Wardrobes", value: 220000, color: "#FFFFFF", quantity: 3, unit: "Nos", rate: 73333, _section: "finishing", _id: Date.now() + 2 },
          { name: "Aluminum Windows", value: 150000, color: "#FFFFFF", quantity: 250, unit: "Sq.ft", rate: 600, _section: "finishing", _id: Date.now() + 3 }
        ];
      } else if (templateName === "commercial") {
        newItems = [
          { name: "Glass Partitions", value: 350000, color: "#3b82f6", quantity: 500, unit: "Sq.ft", rate: 700, _section: "finishing", _id: Date.now() + 1 },
          { name: "Grid False Ceiling", value: 120000, color: "#2563eb", quantity: 1500, unit: "Sq.ft", rate: 80, _section: "finishing", _id: Date.now() + 2 },
          { name: "HVAC Ducting", value: 450000, color: "#1d4ed8", quantity: 1, unit: "Lump Sum", rate: 450000, _section: "finishing", _id: Date.now() + 3 },
          { name: "Network Cabling", value: 85000, color: "#1e40af", quantity: 40, unit: "Points", rate: 2125, _section: "finishing", _id: Date.now() + 4 }
        ];
      }
    }
    
    setDuplicatedItems(prev => [...prev, ...newItems]);
  };

  const handleToggleSelect = (name: string) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  const handleDeleteSelected = () => {
    setDeletedItems((prev) => {
      const next = new Set(prev);
      selectedItems.forEach((item) => next.add(item));
      return next;
    });
    setSelectedItems(new Set());
  };

  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [specs, setSpecs] = useState<SpecsState>(initialSpecs);
  const [isSpecsAccordionOpen, setIsSpecsAccordionOpen] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "grey" | "finishing" | "summary" | "rcc" | "master" | "rates"
  >("summary");
  const [isMathOpen, setIsMathOpen] = useState(false);
  const [finishQuality, setFinishQuality] = useState<number>(1);
  /* 1: Standard, 2: Premium, 3: Luxury */ const [
    isGlobalSettingsOpen,
    setIsGlobalSettingsOpen,
  ] = useState(false);
  /* Master Unit System Toggle */ const masterUnit =
    settings.measurement === "SI" ? "metric" : "imperial";
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [roomConfigs, setRoomConfigs] = useState({
    bedroom: { length: 14, width: 12, height: 10, wardrobeLength: 6 },
    washroom: { length: 8, width: 6, wcType: "Wall Hung", showerSetup: "Glass Enclosure", vanity: "Standard" },
    kitchen: { length: 12, width: 10, counterLength: 15, cabinets: "UV/Acrylic", backsplash: "Ceramic" },
    livingRoom: { length: 16, width: 14, featureWall: "Yes", chandelierPoints: 1 },
    basement: { depth: 10, retainingWall: "RCC 9-Inch" }
  });

  // Auto-save House Estimator States
  useAutoSave('house-estimator-geo', geoState, (saved) => dispatch({ type: 'RESTORE_ALL', payload: saved }));
  useAutoSave('house-estimator-details', projectDetails, setProjectDetails);
  useAutoSave('house-estimator-specs', specs, setSpecs);
  useAutoSave('house-estimator-quality', finishQuality, setFinishQuality);
  useAutoSave('house-estimator-rooms', roomConfigs, setRoomConfigs);

  const [activeRoomTab, setActiveRoomTab] = useState<"bedroom"|"washroom"|"kitchen"|"living"|"basement">("bedroom");
  
  /* International Market Settings */
  const [currencyRate, setCurrencyRate] = useState("PKR");
  const [designStandard, setDesignStandard] = useState("NBC Pakistan 2021");
  const [foundationType, setFoundationType] = useState("Strip Foundation");
  const [structuralSystem, setStructuralSystem] = useState("RCC Framed Structure");
  const [seismicZone, setSeismicZone] = useState("Zone 2B");
  
  /* Boundary Wall State */ const [
    includeBoundaryWall,
    setIncludeBoundaryWall,
  ] = useState(false);
  const [bwLength, setBwLength] = useState(100);
  /* feet */ const [bwHeight, setBwHeight] = useState(6);
  /* feet */ const [bwGateSize, setBwGateSize] = useState(12);
  /* feet */ const plotAreaSqft = useMemo(() => {
    const val = parseFloat(geoState.plotSizeValue) || 0;
    if (geoState.plotSizeUnit === "marla") return val * 225;
    if (geoState.plotSizeUnit === "sqyd") return val * 9;
    return val;
  }, [geoState.plotSizeUnit, geoState.plotSizeValue]);
  const coveredAreaSqft = useMemo(() => {
    return parseFloat(geoState.coveredAreaSqft) || 0;
  }, [geoState.coveredAreaSqft]);
  const builtUpArea = coveredAreaSqft * geoState.stories;
  const estimates = useMemo(() => {
    let steelSeismicMultiplier = 1;
    let concreteSeismicMultiplier = 1;

    switch (seismicZone) {
      case "Zone 4":
        steelSeismicMultiplier = 1.2;
        concreteSeismicMultiplier = 1.1;
        break;
      case "Zone 3":
        steelSeismicMultiplier = 1.1;
        concreteSeismicMultiplier = 1.05;
        break;
      case "Zone 2B":
        steelSeismicMultiplier = 1.05;
        break;
      default:
        steelSeismicMultiplier = 1.0;
        concreteSeismicMultiplier = 1.0;
    }

    let steelMulti = steelSeismicMultiplier;
    let concreteMulti = concreteSeismicMultiplier;
    let brickMulti = 1.0;

    if (structuralSystem === "Load bearing masonry") {
      steelMulti *= 0.4;
      concreteMulti *= 0.8;
      brickMulti *= 1.5;
    } else if (structuralSystem === "Steel frame") {
      steelMulti *= 2.5;
      concreteMulti *= 0.3;
      brickMulti *= 0.5;
    }

    if (foundationType === "Raft Foundation") {
      concreteMulti *= 1.5;
      steelMulti *= 1.3;
    } else if (foundationType === "Pile Foundation") {
      concreteMulti *= 2.0;
      steelMulti *= 1.8;
    }

    const stories = geoState.stories;
    const roomHeight = parseFloat(geoState.roomHeight) || 10.5;
    /* Step 1: Generate Standard Assumptions */ const totalWallLength =
      coveredAreaSqft * 0.15;
    const wallThickness = 0.75;
    /* 9 inches */ const slabThickness = 0.5;
    /* 6 inches */ const foundationDepth = foundationType === "Pile Foundation" ? 15 : foundationType === "Raft Foundation" ? 4 : 3;
    const foundationWidth = 3;
    const openingDeduction = 0.85;
    /* Step 2: Apply Exact Formulas // 1. Excavation */ const excavationVolumeCft =
      totalWallLength * foundationWidth * foundationDepth;
    /* 2. Brickwork */ const totalHeight =
      roomHeight * stories + foundationDepth;
    const brickworkVolume =
      totalWallLength * totalHeight * wallThickness * openingDeduction * brickMulti;
    const totalBricksNos = Math.ceil(brickworkVolume * 13.5);
    const brickworkDryMortar = brickworkVolume * 0.3;
    const cementBw = (1 / 5) * brickworkDryMortar;
    const sandBw = (4 / 5) * brickworkDryMortar;
    /* 3. RCC */ const slabVolume = coveredAreaSqft * slabThickness * stories;
    const rcWetVolume = slabVolume * 1.25 * concreteMulti;
    /* Slab + 25% for beams/columns */ const rccDryVolume = rcWetVolume * CIVIL_CONSTANTS.DRY_CONCRETE_FACTOR;
    const cementRcc = (1 / 7) * rccDryVolume;
    const sandRcc = (2 / 7) * rccDryVolume;
    const crushRcc = (4 / 7) * rccDryVolume;
    /* 4. Steel */ const steelKgResult = slabVolume * 1.25 * 0.015 * 222.2 * steelMulti;
    const steelMetricTons = steelKgResult / 1000;
    /* 5. Plastering */ const plasterArea =
      totalWallLength * (roomHeight * stories) * 2 * openingDeduction;
    const plasterWetVol = plasterArea * (0.5 / 12);
    const plasterDryVol = plasterWetVol * 1.27;
    const cementPlaster = (1 / 5) * plasterDryVol;
    const sandPlaster = (4 / 5) * plasterDryVol;
    /* Totals */ const cementBagsTotal = Math.ceil(
      (cementBw + cementRcc + cementPlaster) / 1.25,
    );
    const sandCftTotal = Math.ceil(sandBw + sandRcc + sandPlaster);
    const crushCftTotal = Math.ceil(crushRcc);
    const steelKg = Math.ceil(steelKgResult);
    const bricksCount = totalBricksNos;
    /* Grey Structure Costs */ const costCement =
      cementBagsTotal * rates.cement;
    const costSteel = steelKg * rates.steel;
    const costBricks = bricksCount * rates.bricks;
    const costSand = sandCftTotal * rates.sand;
    const costCrush = crushCftTotal * rates.crush;
    const costLabor = builtUpArea * rates.laborGrey;
    const totalGrey =
      costCement + costSteel + costBricks + costSand + costCrush + costLabor;
    /* Finishing Costs Multiplier */ const qualityMultiplier =
      finishQuality === 1 ? 1 : finishQuality === 2 ? 1.6 : 2.5;
    const finishRate = rates.laborFinish * qualityMultiplier;
    const baseMepPct = 0.2;
    const extraWashrooms = Math.max(
      0,
      geoState.rooms.washrooms - geoState.rooms.bedrooms,
    );
    const mepMultiplier =
      1 + extraWashrooms * 0.05 + geoState.rooms.kitchens * 0.05;
    const costTiles = builtUpArea * (finishRate * 0.35);
    /* 35% of finishing */ const costPaint = builtUpArea * (finishRate * 0.2);
    /* 20% */ const costWoodwork =
      builtUpArea * (finishRate * 0.25) * (1 + geoState.rooms.bedrooms * 0.02);
    /* 25% + bonus for bedrooms */ const costMep =
      builtUpArea * (finishRate * baseMepPct) * mepMultiplier;
    /* Roof Treatment & Insulation Cost */ let roofMultiplier = 1;
    if (specs?.roofInsulation?.includes("Premium")) roofMultiplier = 1.6;
    if (specs?.roofInsulation?.includes("Luxury")) roofMultiplier = 2.5;
    const roofArea =
      geoState.stories > 0 ? builtUpArea / geoState.stories : builtUpArea;
    const costRoofing = roofArea * (finishRate * 0.15) * roofMultiplier;
    const totalFinishing =
      costTiles + costPaint + costWoodwork + costMep + costRoofing;
    /* Boundary Wall Calculations */ const bwNetLength = Math.max(
      0,
      bwLength - bwGateSize,
    );
    const bwArea = bwNetLength * bwHeight;
    /* sqft */ const bwVolume = bwArea * 0.75;
    /* assuming 9-inch wall // Boundary Wall Materials */ const bwBricks =
      Math.ceil(bwVolume * 13.5);
    const bwDryMortar = bwVolume * 0.3;
    const bwCementBags = Math.ceil((bwDryMortar * 0.2) / 1.25);
    /* 1:4 ratio approx -> 20% dry mortar, divide by 1.25 cft/bag */ const bwSandCft =
      Math.ceil(bwDryMortar * 0.8);
    const bwExcavation = Math.ceil(bwNetLength * 2 * 1.5);
    /* 2 ft deep, 1.5 ft wide */ const bwLaborCost = bwArea * rates.laborGrey;
    /* simple labor estimate */ const costBwCement =
      bwCementBags * rates.cement;
    const costBwBricks = bwBricks * rates.bricks;
    const costBwSand = bwSandCft * rates.sand;
    const bwTotalCost = includeBoundaryWall
      ? costBwCement + costBwBricks + costBwSand + bwLaborCost
      : 0;
    /* Additional Technical Base Requirements for Grey Structure */ const termiteAreaSqft =
      coveredAreaSqft;
    const polytheneAreaSqft = coveredAreaSqft;
    const waterTankCost = 150000;
    /* Extrapolated quantities & prices for add-ons */ const excavationVolTotal =
      Math.ceil(excavationVolumeCft) + (includeBoundaryWall ? bwExcavation : 0);
    const costExcavation = excavationVolTotal * (rates.laborGrey * 0.15);
    /* est factor */ const costTermite = termiteAreaSqft * 12;
    /* estimated Rs 12/sqft */ const costPolythene = polytheneAreaSqft * 8;
    /* estimated Rs 8/sqft */ const costWaterTank = includeBoundaryWall
      ? waterTankCost
      : 0;
    const trueTotalGrey =
      totalGrey + costExcavation + costTermite + costPolythene + costWaterTank;
    return {
      cementBags: cementBagsTotal + (includeBoundaryWall ? bwCementBags : 0),
      steelKg: steelKg,
      bricksCount: bricksCount + (includeBoundaryWall ? bwBricks : 0),
      sandCft: sandCftTotal + (includeBoundaryWall ? bwSandCft : 0),
      crushCft: crushCftTotal,
      excavationCft:
        Math.ceil(excavationVolumeCft) +
        (includeBoundaryWall ? bwExcavation : 0),
      steelTons: steelMetricTons,
      termiteAreaSqft,
      polytheneAreaSqft,
      costTerms: { costExcavation, costTermite, costPolythene, costWaterTank },
      costCement,
      costSteel,
      costBricks,
      costSand,
      costCrush,
      costLabor,
      totalGrey: trueTotalGrey,
      costTiles,
      costPaint,
      costWoodwork,
      costMep,
      costRoofing,
      totalFinishing,
      costBoundaryWall: bwTotalCost,
      totalCost: trueTotalGrey + totalFinishing + bwTotalCost,
    };
  }, [
    coveredAreaSqft,
    builtUpArea,
    finishQuality,
    rates,
    geoState,
    specs,
    includeBoundaryWall,
    bwLength,
    bwHeight,
    bwGateSize,
    foundationType,
    structuralSystem,
    seismicZone,
  ]);
  const greyFoundationData = [
    {
      name: "Excavation & Backfilling",
      value: estimates.costTerms.costExcavation,
      color: "#78716c",
      quantity: estimates.excavationCft,
      unit: "Cft",
      rate: rates.laborGrey * 0.15,
    },
    {
      name: "Termite Treatment",
      value: estimates.costTerms.costTermite,
      color: "#f97316",
      quantity: estimates.termiteAreaSqft,
      unit: "Sq.ft",
      rate: 12,
    },
  ];
  if (includeBoundaryWall) {
    greyFoundationData.push({
      name: "Water Tank (UG & OH)",
      value: estimates.costTerms.costWaterTank,
      color: "#3b82f6",
      quantity: 1,
      unit: "Lump Sum",
      rate: estimates.costTerms.costWaterTank,
    });
  }
  const greySuperstructureData = [
    {
      name: `Cement${isCustomRate("cement") ? "*" : ""}`,
      value: estimates.costCement,
      color: "#94a3b8",
      quantity: estimates.cementBags,
      unit: "Bags",
      rate: rates.cement,
      isCustom: isCustomRate("cement"),
    },
    {
      name: `Steel${isCustomRate("steel") ? "*" : ""}`,
      value: estimates.costSteel,
      color: "#334155",
      quantity: parseFloat(estimates.steelTons.toFixed(2)),
      unit: "Tons",
      rate: rates.steel * 1000,
      isCustom: isCustomRate("steel"),
    },
    {
      name: `Bricks${isCustomRate("bricks") ? "*" : ""}`,
      value: estimates.costBricks,
      color: "#b91c1c",
      quantity: estimates.bricksCount,
      unit: "Nos",
      rate: rates.bricks,
      isCustom: isCustomRate("bricks"),
    },
    {
      name: `Sand${isCustomRate("sand") ? "*" : ""}`,
      value: estimates.costSand,
      color: "#fcd34d",
      quantity: estimates.sandCft,
      unit: "Cft",
      rate: rates.sand,
      isCustom: isCustomRate("sand"),
    },
    {
      name: `Crush${isCustomRate("crush") ? "*" : ""}`,
      value: estimates.costCrush,
      color: "#a3a3a3",
      quantity: estimates.crushCft,
      unit: "Cft",
      rate: rates.crush,
      isCustom: isCustomRate("crush"),
    },
    {
      name: "Polythene Sheet & DPC",
      value: estimates.costTerms.costPolythene,
      color: "#6ee7b7",
      quantity: estimates.polytheneAreaSqft,
      unit: "Sq.ft",
      rate: 8,
    },
    {
      name: `Labor${isCustomRate("laborGrey") ? "*" : ""}`,
      value: estimates.costLabor,
      color: "#FFFFFF",
      quantity: builtUpArea,
      unit: "Sq.ft",
      rate: rates.laborGrey,
      isCustom: isCustomRate("laborGrey"),
    },
  ];
  greyFoundationData.push(...duplicatedItems.filter(i => i._section === 'foundation'));
  greySuperstructureData.push(...duplicatedItems.filter(i => i._section === 'superstructure'));

  let greyCostData = [...greyFoundationData, ...greySuperstructureData].filter(
    (item) => !deletedItems.has(item.name)
  );
  const filteredTotalGrey = greyCostData.reduce((acc, item) => acc + item.value, 0);

  const qualityMultiplier =
    finishQuality === 1 ? 1 : finishQuality === 2 ? 1.6 : 2.5;
  const finishRate = rates.laborFinish * qualityMultiplier;
  let roofMultiplier = 1;
  if (specs?.roofInsulation?.includes("Premium")) roofMultiplier = 1.6;
  if (specs?.roofInsulation?.includes("Luxury")) roofMultiplier = 2.5;
  let finishingCostData = [
    {
      name: `Tiles & Floor${isCustomRate("laborFinish") ? "*" : ""}`,
      value: estimates.costTiles,
      color: "#FFFFFF",
      quantity: builtUpArea,
      unit: "Sq.ft",
      rate: finishRate * 0.35,
      isCustom: isCustomRate("laborFinish"),
    },
    {
      name: `Paint & Ceiling${isCustomRate("laborFinish") ? "*" : ""}`,
      value: estimates.costPaint,
      color: "#ec4899",
      quantity: builtUpArea,
      unit: "Sq.ft",
      rate: finishRate * 0.2,
      isCustom: isCustomRate("laborFinish"),
    },
    {
      name: `Woodwork${isCustomRate("laborFinish") ? "*" : ""}`,
      value: estimates.costWoodwork,
      color: "#8b5cf6",
      quantity: builtUpArea,
      unit: "Sq.ft",
      rate: finishRate * 0.25 * (1 + geoState.rooms.bedrooms * 0.02),
      isCustom: isCustomRate("laborFinish"),
    },
    {
      name: `Electric & Plumbing${isCustomRate("laborFinish") ? "*" : ""}`,
      value: estimates.costMep,
      color: "#10b981",
      quantity: builtUpArea,
      unit: "Sq.ft",
      rate: estimates.costMep / builtUpArea,
      isCustom: isCustomRate("laborFinish"),
    },
    {
      name: `Roofing & Insulation${isCustomRate("laborFinish") ? "*" : ""}`,
      value: estimates.costRoofing,
      color: "#f59e0b",
      quantity:
        geoState.stories > 0 ? builtUpArea / geoState.stories : builtUpArea,
      unit: "Sq.ft",
      rate: finishRate * 0.15 * roofMultiplier,
      isCustom: isCustomRate("laborFinish"),
    },
  ].filter((item) => !deletedItems.has(item.name));
  
  finishingCostData.push(...duplicatedItems.filter(i => i._section === 'finishing' && !deletedItems.has(i.name)));

  const sortedFoundationData = useSortedData(greyFoundationData.filter(i => !deletedItems.has(i.name)), foundationOrder);
  const sortedSuperstructureData = useSortedData(greySuperstructureData.filter(i => !deletedItems.has(i.name)), superstructureOrder);
  const sortedFinishingCostData = useSortedData(finishingCostData, finishingOrder);

  const filteredTotalFinishing = finishingCostData.reduce((acc, item) => acc + item.value, 0);

  const handleExportCSV = (type: "grey" | "finishing") => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Category,Material / Item,Quantity,Unit,Notes,Amount\n";
    
    const escapeCsv = (str: any) => `"${String(str || "").replace(/"/g, '""')}"`;
    
    if (type === "grey") {
      sortedFoundationData.forEach((item) => {
        csvContent += `${escapeCsv("Foundation Work")},${escapeCsv(item.name)},${escapeCsv(typeof item.quantity === "number" ? item.quantity.toLocaleString('en-US') : item.quantity)},${escapeCsv(item.unit)},${escapeCsv(itemNotes[item.name])},${escapeCsv(formatCurrency(item.value))}\n`;
      });
      sortedSuperstructureData.forEach((item) => {
        csvContent += `${escapeCsv("Above-Ground Work (Walls & Roof)")},${escapeCsv(item.name)},${escapeCsv(typeof item.quantity === "number" ? item.quantity.toLocaleString('en-US') : item.quantity)},${escapeCsv(item.unit)},${escapeCsv(itemNotes[item.name])},${escapeCsv(formatCurrency(item.value))}\n`;
      });
      csvContent += `${escapeCsv("Total")},${escapeCsv("Total Grey Structure")},-,-,-,${escapeCsv(formatCurrency(filteredTotalGrey))}\n`;
    } else {
      sortedFinishingCostData.forEach((item) => {
        csvContent += `${escapeCsv("Finishing Works")},${escapeCsv(item.name)},${escapeCsv(typeof item.quantity === "number" ? Math.round(item.quantity).toLocaleString('en-US') : item.quantity)},${escapeCsv(item.unit)},${escapeCsv(itemNotes[item.name])},${escapeCsv(formatCurrency(item.value))}\n`;
      });
      csvContent += `${escapeCsv("Total")},${escapeCsv("Total Finishing Works")},-,-,-,${escapeCsv(formatCurrency(filteredTotalFinishing))}\n`;
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${type}_structure_boq.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  const summaryData = [
    { name: "Grey Structure", value: filteredTotalGrey, color: "#64748b" },
    {
      name: "Finishing Works",
      value: filteredTotalFinishing,
      color: "#8b5cf6",
    },
  ];
  if (includeBoundaryWall) {
    summaryData.push({
      name: "Boundary Wall",
      value: estimates.costBoundaryWall,
      color: "#10b981",
    });
  }
  
  const currentTotalCost = filteredTotalGrey + filteredTotalFinishing + (includeBoundaryWall ? estimates.costBoundaryWall : 0);
  

  const combinedCostData = useMemo(() => {
    const data: any[] = [];
    greyCostData.forEach((d) =>
      data.push({
        name: d.name.replace(/\*/g, ""),
        value: convertAmount(d.value),
        category: "Grey Structure",
        color: d.color || "#64748b",
      })
    );
    finishingCostData.forEach((d) =>
      data.push({
        name: d.name.replace(/\*/g, ""),
        value: convertAmount(d.value),
        category: "Finishing Works",
        color: d.color || "#8b5cf6",
      })
    );
    return data.sort((a, b) => b.value - a.value);
  }, [greyCostData, finishingCostData, convertAmount]);

  const getQualityLabel = (val: number) => {
    switch (val) {
      case 1:
        return "Standard";
      case 2:
        return "Premium";
      case 3:
        return "Luxury";
      default:
        return "Standard";
    }
  };

  const pdfExportPayload = useMemo(() => {
    const customTableData = [...greyCostData, ...finishingCostData].map(d => ({
      item: d.name.replace(/\*/g, ''),
      quantityStr: typeof d.quantity === 'number' ? Math.round(d.quantity).toLocaleString('en-US') : d.quantity,
      unitStr: d.unit,
      rate: d.rate,
      cost: d.value,
      color: d.color
    }));
    
    return {
      inputs: {
        "Project Name": projectDetails.projectName || "-",
        "Client Name": projectDetails.clientName || "-",
        "Plot Size": `${geoState.plotSizeValue} ${geoState.plotSizeUnit.toUpperCase()}`,
        "Covered Area": `${geoState.coveredAreaSqft} Sq.Ft`,
        "Stories": geoState.stories,
        "Finish Grade": getQualityLabel(finishQuality),
        "Total Built-up Area": `${builtUpArea.toFixed(0)} sq.ft`
      },
      breakdown: {
        "Total Cost": estimates.totalCost.toFixed(2),
        "Grey Structure": estimates.totalGrey.toFixed(2),
        "Finishing": estimates.totalFinishing.toFixed(2)
      },
      customTableData
    };
  }, [greyCostData, finishingCostData, geoState, finishQuality, projectDetails, builtUpArea, estimates]);

  return (
    <div className="w-full h-full bg-transparent text-slate-900 font-sans p-6 md:p-8">
      <Helmet>
        <title>House Construction Cost Estimator | Civil Estimation Pro</title>
        <meta name="description" content="Calculate your exact house construction cost with real-time BOQ generation. Features NBC Pakistan standards, Marla/Sq.Ft inputs, and precise material estimates." />
      </Helmet>
      <ToolGuidedTour steps={HOUSE_TOUR_STEPS} tourId="house-estimator" />
      <div className="w-full max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pb-24 px-4 md:px-0">
        

        <div className="space-y-8 w-full">
        <div className="flex flex-wrap gap-6 sm:gap-8 w-full items-start">
          {/* Main Controls Overlay */}
          <section className="flex-1 min-w-[min(100%,380px)] w-full flex flex-col space-y-6 flex flex-col">
            {/* Quick Estimate Base Controls */}
            <div className="tool-card p-6 space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-blue-50 text-indigo-600 rounded-[24px] overflow-hidden">
                  <Home className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 tracking-tight mb-4">
                    Quick Estimate
                  </h2>
                  <p className="tracking-wide text-base font-normal text-slate-600 leading-relaxed">
                    Basic Configuration
                  </p>
                </div>
              </div>

              {/* City Location */}
              <div>
                <label className="block uppercase tracking-widest mb-1.5 ml-1 text-sm font-medium text-slate-700 mb-1">
                  City / Location
                </label>
                <><label htmlFor="a11y-input-263" className="sr-only">e.g. DHA Phase 6</label>
<motion.input initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} id="a11y-input-263"
                  type="text"
                  value={projectDetails.siteLocation}
                  onChange={(e) =>
                    setProjectDetails({
                      ...projectDetails,
                      siteLocation: e.target.value,
                    })
                  }
                  className="calc-input px-4 py-3 text-base font-medium w-full outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50 transition-all shadow-sm rounded-full"
                  placeholder="e.g. DHA Phase 6"
                /></>
              </div>

              {/* Plot Size */}
              <div>
                <label className="block uppercase tracking-widest mb-1.5 ml-1 group flex items-center gap-1 w-fit cursor-help text-sm font-medium text-slate-700 mb-1">
                  Plot Size 
                  <span className="relative">
                    <AlertCircle className="w-3.5 h-3.5 text-slate-600" />
                    <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-max px-3 py-1.5 bg-white text-slate-900 dark:text-white text-sm rounded-[16px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all border border-slate-200 shadow-sm overflow-hidden">
                      Total land area limits the maximum covered area
                    </span>
                  </span>
                </label>
                <div className="flex flex-col gap-3">
                  <MaskedInput
                    value={geoState.plotSizeValue}
                    onValueChange={(val) =>
                      dispatch({
                        type: "SET_PLOT_SIZE_VALUE",
                        payload: val,
                      })
                    }
                    className="calc-input px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-medium shadow-sm w-full"
                    placeholder="0"
                  />
                  <div className="w-full">
                    <UnitToggleGroup
                      units={[
                        { id: "marla", label: "Marla" },
                        { id: "sqyd", label: "Sq.Yd" },
                        { id: "sqft", label: "Sq.Ft" },
                      ]}
                      activeUnit={geoState.plotSizeUnit}
                      onChange={(u) =>
                        dispatch({
                          type: "SET_PLOT_SIZE_UNIT",
                          payload: u as any,
                        })
                      }
                      size="md"
                    />
                  </div>
                </div>
              </div>

              {/* Stories & Rooms Config */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase tracking-wider mb-2 text-sm font-medium text-slate-700 mb-1">
                    Stories
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        dispatch({
                          type: "SET_STORIES",
                          payload: Math.max(1, geoState.stories - 1),
                        })
                      }
                      className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 flex items-center justify-center transition-all duration-300 active:scale-95 hover:-translate-y-0.5"
                    >
                      -
                    </button>
                    <span className="font-bold text-lg w-6 text-center">
                      {geoState.stories}
                    </span>
                    <button
                      onClick={() =>
                        dispatch({
                          type: "SET_STORIES",
                          payload: geoState.stories + 1,
                        })
                      }
                      className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 flex items-center justify-center transition-all duration-300 active:scale-95 hover:-translate-y-0.5"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Finish Quality */}
              <div className="pt-4 border-t border-slate-100 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                   <div className="p-2 bg-violet-50 text-violet-600 rounded-[24px] overflow-hidden">
                     <Sliders className="w-4 h-4" />
                   </div>
                   <h3 className="text-lg font-medium text-slate-800 mb-4">Finish Quality</h3>
                </div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-xl font-semibold tabular-nums tracking-tight text-violet-600 tracking-tighter whitespace-nowrap">
                    {getQualityLabel(finishQuality)}
                  </span>
                  <span className="text-base font-medium uppercase tracking-wider">
                    x
                    {finishQuality === 1
                      ? "1.0"
                      : finishQuality === 2
                        ? "1.6"
                        : "2.5"}
                    Rate
                  </span>
                </div>
                <><label htmlFor="a11y-input-264" className="sr-only">Input</label>
<motion.input initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} id="a11y-input-264"
                  type="range"
                  min="1"
                  max="3"
                  step="1"
                  value={finishQuality}
                  onChange={(e) => setFinishQuality(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-violet-600"
                /></>
                <div className="flex justify-between text-sm uppercase tracking-widest text-slate-500 font-bold mt-2">
                  <span>Std</span> <span>Prem</span> <span>Lux</span>
                </div>
              </div>
            </div>

            {/* International & Structural Setup */}
            <div className="tool-card p-6 space-y-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-teal-50 text-teal-600 rounded-[24px] overflow-hidden">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 tracking-tight mb-4">
                    International & Structural Defaults
                  </h2>
                  <p className="tracking-wide text-base font-normal text-slate-600 leading-relaxed">
                    Market, Foundation, System
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block uppercase tracking-widest mb-1.5 ml-1 text-sm font-medium text-slate-700 mb-1">Market Currency</label>
                  <motion.select initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
                    value={currencyRate}
                    onChange={(e) => {
                      const market = e.target.value;
                      setCurrencyRate(market);
                      if (market === "CUSTOM") return;
                      updateSettings({ currency: market as any });
                      const marketPresets: Record<string, any> = {
                        PKR: { cement: 1450, steel: 280, bricks: 18, sand: 90, crush: 250, laborGrey: 500, laborFinish: 600 },
                        INR: { cement: 380, steel: 65, bricks: 8, sand: 45, crush: 80, laborGrey: 250, laborFinish: 350 },
                        USD: { cement: 15, steel: 1, bricks: 0.6, sand: 2, crush: 4, laborGrey: 45, laborFinish: 55 },
                        GBP: { cement: 8, steel: 1.5, bricks: 0.8, sand: 1.5, crush: 3, laborGrey: 35, laborFinish: 45 },
                        AED: { cement: 18, steel: 3, bricks: 2, sand: 5, crush: 10, laborGrey: 30, laborFinish: 40 },
                        SAR: { cement: 18, steel: 3, bricks: 2, sand: 4, crush: 9, laborGrey: 25, laborFinish: 35 },
                        BDT: { cement: 500, steel: 100, bricks: 12, sand: 30, crush: 80, laborGrey: 300, laborFinish: 400 },
                        LKR: { cement: 2000, steel: 400, bricks: 25, sand: 150, crush: 300, laborGrey: 800, laborFinish: 1000 }
                      };
                      const pst = marketPresets[market];
                      if(pst) {
                        setCustomRate("cement", pst.cement);
                        setCustomRate("steel", pst.steel);
                        setCustomRate("bricks", pst.bricks);
                        setCustomRate("sand", pst.sand);
                        setCustomRate("crush", pst.crush);
                        setCustomRate("laborGrey", pst.laborGrey);
                        setCustomRate("laborFinish", pst.laborFinish);
                      }
                    }}
                    className="calc-input px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-teal-500/30 transition-all font-medium shadow-sm w-full"
                  >
                    {["PKR", "INR", "USD", "GBP", "AED", "SAR", "BDT", "LKR", "CUSTOM"].map(c => <option key={c} value={c}>{c}</option>)}
                  </motion.select>
                </div>

                <div>
                  <label className="block uppercase tracking-widest mb-1.5 ml-1 text-sm font-medium text-slate-700 mb-1">Design Standard</label>
                  <motion.select initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
                     value={designStandard}
                     onChange={(e) => setDesignStandard(e.target.value)}
                     className="calc-input px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-teal-500/30 transition-all font-medium shadow-sm w-full"
                  >
                     <option>NBC Pakistan 2021</option>
                     <option>NBC India 2016</option>
                     <option>IS 456</option>
                     <option>BS 8110</option>
                     <option>ACI 318</option>
                     <option>Dubai Municipality Stds</option>
                  </motion.select>
                </div>

                <div>
                  <label className="block uppercase tracking-widest mb-1.5 ml-1 text-sm font-medium text-slate-700 mb-1">Foundation Type</label>
                  <motion.select initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
                     value={foundationType}
                     onChange={(e) => setFoundationType(e.target.value)}
                     className="calc-input px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-teal-500/30 transition-all font-medium shadow-sm w-full"
                  >
                     <option>Strip Foundation</option>
                     <option>Raft Foundation</option>
                     <option>Pile Foundation</option>
                  </motion.select>
                </div>

                <div>
                  <label className="block uppercase tracking-widest mb-1.5 ml-1 text-sm font-medium text-slate-700 mb-1">Structural System</label>
                  <motion.select initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
                     value={structuralSystem}
                     onChange={(e) => setStructuralSystem(e.target.value)}
                     className="calc-input px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-teal-500/30 transition-all font-medium shadow-sm w-full"
                  >
                     <option>RCC Framed Structure</option>
                     <option>Load bearing masonry</option>
                     <option>Steel frame</option>
                  </motion.select>
                </div>

                <div>
                  <label className="block uppercase tracking-widest mb-1.5 ml-1 text-sm font-medium text-slate-700 mb-1"><span className="flex items-center">Seismic Zone <CodeTooltip standard="IS" code="1893:2016" description="Criteria for earthquake resistant design of structures." /></span></label>
                  <motion.select initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
                     value={seismicZone}
                     onChange={(e) => setSeismicZone(e.target.value)}
                     className="calc-input px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-teal-500/30 transition-all font-medium shadow-sm w-full"
                  >
                     <option>Zone 1</option>
                     <option>Zone 2</option>
                     <option>Zone 2B</option>
                     <option>Zone 3</option>
                     <option>Zone 4</option>
                  </motion.select>
                </div>
              </div>
            </div>

            {/* Advanced Customization Accordion */}
            <div className="tool-card p-6">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setIsAccordionOpen(!isAccordionOpen)}
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-slate-50 text-slate-600 rounded-[24px] overflow-hidden">
                    <Settings className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-semibold text-slate-900 tracking-tight mb-4">
                    Advanced Customization
                  </h2>
                </div>
                <div className="p-2 bg-transparent text-slate-500 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                  {isAccordionOpen ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </div>
              </div>
              
              {isAccordionOpen && (
                <div className="mt-6 pt-6 border-t border-slate-100 space-y-6 animate-in slide-in-from-top-4 fade-in duration-300">
                  {/* Room Setup Button Trigger */}
                  <div className="flex justify-between items-center bg-indigo-50 p-4 rounded-[24px] border border-indigo-100 overflow-hidden">
                    <div>
                      <h3 className="text-indigo-900 text-lg font-medium text-slate-800 mb-4">Room Configuration</h3>
                      <p className="text-indigo-600 uppercase tracking-wide text-base font-normal text-slate-600 leading-relaxed">Customize layout specifics</p>
                    </div>
                    <button 
                      onClick={() => setIsRoomModalOpen(true)} 
                      className="text-base font-medium bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-full transition-all shadow-sm active:scale-95 flex items-center gap-1 hover:-translate-y-0.5"
                    >
                      Open Rooms <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Covered Area */}
                  <div>
                    <label className="block uppercase tracking-widest mb-1.5 ml-1 flex items-center gap-1 cursor-help group w-fit text-sm font-medium text-slate-700 mb-1">
                      Covered Area (Per Floor)
                      <span className="relative">
                        <AlertCircle className="w-3.5 h-3.5 text-slate-600" />
                        <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-max max-w-[200px] whitespace-normal px-3 py-1.5 bg-white text-slate-900 dark:text-white text-sm rounded-[16px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 text-center border border-slate-200 shadow-sm overflow-hidden">
                          Total floor area constructed for a single story. Must be less than plot size.
                        </span>
                      </span>
                    </label>
                    <div className="relative">
                      <label htmlFor="tour-house-area" className="sr-only">0</label>
<input
                        id="tour-house-area"
                        type="number" inputMode="decimal"
                        value={geoState.coveredAreaSqft}
                        onChange={(e) =>
                          dispatch({
                            type: "SET_COVERED_AREA_SQFT",
                            payload: e.target.value,
                          })
                        }
                        className="w-full calc-input px-4 py-3 pr-16 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500/30 font-medium shadow-sm rounded-full"
                        placeholder="0" 
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-base font-medium pointer-events-none">
                        {isSI ? "SQ.M" : "SQ.FT"}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block uppercase tracking-widest mb-1.5 ml-1 text-sm font-medium text-slate-700 mb-1">
                      Room Height (ft)
                    </label>
                    <label htmlFor="tour-room-height" className="sr-only">Input</label>
<input
                      id="tour-room-height"
                      type="number" inputMode="decimal"
                      step="0.5"
                      value={geoState.roomHeight}
                      onChange={(e) =>
                        dispatch({
                          type: "SET_ROOM_HEIGHT",
                          payload: e.target.value,
                        })
                      }
                      className="w-full calc-input px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500/20 font-medium text-sm shadow-sm rounded-full"
                    />
                  </div>
                  
                  <AdvancedSpecs
                    specs={specs}
                    setSpecs={setSpecs}
                    isOpen={isSpecsAccordionOpen}
                    setIsOpen={setIsSpecsAccordionOpen}
                  />

                  {/* Boundary Wall Module */}
                  <div className="pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <h2 className="text-xl font-semibold text-slate-900 tracking-tight mb-4">
                          Boundary Wall
                        </h2>
                        <span className="text-sm font-medium text-slate-500">
                          Include exterior boundary wall
                        </span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer text-sm font-medium text-slate-700 mb-1 block">
                        <><label htmlFor="a11y-input-265" className="sr-only">Input</label>
<motion.input initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} id="a11y-input-265"
                          type="checkbox"
                          className="sr-only peer text-base font-normal"
                          checked={includeBoundaryWall}
                          onChange={() =>
                            setIncludeBoundaryWall(!includeBoundaryWall)
                          }
                        /></>
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 focus:ring-blue-500 focus:outline-none peer-focus:ring-indigo-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                    {includeBoundaryWall && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-4 mt-4 border-t border-slate-100 animate-in fade-in slide-in-from-top-4 duration-300">
                        <div>
                          <label className="block uppercase tracking-widest mb-1.5 text-sm font-medium text-slate-700 mb-1">
                            Length (ft)
                          </label>
                          <><label htmlFor="a11y-input-266" className="sr-only">Input</label>
<motion.input initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} id="a11y-input-266"
                            type="number" inputMode="decimal"
                            value={bwLength || ""}
                            onChange={(e) => setBwLength(parseFloat(e.target.value))}
                            className="w-full bg-slate-50 border border-slate-200 rounded-full px-3 py-2 text-slate-700 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50 focus:outline-none"
                          /></>
                        </div>
                        <div>
                          <label className="block uppercase tracking-widest mb-1.5 text-sm font-medium text-slate-700 mb-1">
                            Height (ft)
                          </label>
                          <><label htmlFor="a11y-input-267" className="sr-only">Input</label>
<motion.input initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} id="a11y-input-267"
                            type="number" inputMode="decimal"
                            value={bwHeight || ""}
                            onChange={(e) => setBwHeight(parseFloat(e.target.value))}
                            className="w-full bg-slate-50 border border-slate-200 rounded-full px-3 py-2 text-slate-700 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50 focus:outline-none"
                          /></>
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
              {!showResults && (
                <button
                   onClick={() => setShowResults(true)}
                   className="w-full sm:flex-1 flex flex-row items-center justify-center gap-2 bg-white text-slate-900 dark:text-white border border-slate-200 outline-none font-bold px-8 py-4 rounded-full hover:bg-slate-50 transition-all active:scale-95 shadow-sm hover:-translate-y-0.5 overflow-hidden"
                >
                   Compute Total Cost
                </button>
              )}
            </div>
            
            <div className="flex items-center justify-between p-4 bg-indigo-50 border border-indigo-100 rounded-[16px] mt-4">
               <div>
                  <h4 className="text-indigo-900 text-lg font-medium text-slate-800 mb-4">Live BOQ</h4>
                  <p className="text-indigo-600/80 text-base font-normal text-slate-600 leading-relaxed">Real-time table view as you adjust parameters</p>
               </div>
               <label className="relative inline-flex items-center cursor-pointer text-sm font-medium text-slate-700 mb-1 block">
                 <><label htmlFor="a11y-input-268" className="sr-only">Input</label>
<motion.input initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} id="a11y-input-268"
                   type="checkbox"
                   className="sr-only peer text-base font-normal"
                   checked={showResults}
                   onChange={(e) => setShowResults(e.target.checked)}
                 /></>
                 <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 shadow-inner"></div>
               </label>
            </div>
          
            {showResults && (
              <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pt-8 border-t border-[var(--border-color)]">
                {/* Visual Summary */}
            <div className="tool-card p-6 sm:p-8 mb-2">
              <h3 className="mb-6 text-lg font-medium text-slate-800 mb-4">
                Cost Breakdown Visuals
              </h3>
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div
                  className="w-full md:w-1/2 h-80 relative"
                  id="export-chart-target"
                >
                  <StyledChart 
                    data={summaryData.map(d => ({ ...d, fill: d.color }))}
                    type="pie"
                    title="Cost Breakdown"
                    valueFormatter={(val) => formatCurrency(val, false)}
                  />
                </div>
                <div className="w-full md:w-1/2 h-80 relative mt-4 md:mt-0 pt-8 border-t md:border-t-0 md:border-l border-slate-100/60 pl-0 md:pl-8">
                  <StyledChart 
                    data={combinedCostData.map(d => ({ ...d, fill: d.color })).slice(0, 10)}
                    type="bar"
                    title="Top Metrics"
                    valueFormatter={(val) => formatCurrency(val, true)}
                  />
                </div>
              </div>
            </div>

            {/* Detailed Mathematical Breakdown Accordion */}
            <div className="tool-card p-6 sm:p-8 mb-8">
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => setIsMathOpen(!isMathOpen)}
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-slate-50 text-slate-600 rounded-[24px] overflow-hidden">
                    <Calculator className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-slate-800 mb-4">View Detailed Mathematical Breakdown</h3>
                    <p className="text-base font-normal text-slate-600 leading-relaxed">Access raw math derivations and master rate sheets</p>
                  </div>
                </div>
                <div className="p-2 bg-transparent text-slate-500 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors shrink-0">
                  {isMathOpen ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </div>
              </div>

              {isMathOpen && (
                <div className="mt-8 pt-8 border-t border-slate-100 animate-in fade-in slide-in-from-top-4 duration-300">
                  {/* Segmented Control & Actions */}
                  <div className="flex flex-col sm:flex-row gap-4 items-center justify-between relative mb-6">
                    <div className="flex overflow-x-auto gap-2 p-1 border-b border-slate-100 w-full sm:w-fit [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                      <UniversalTabs tabs={[{id: "grey", label: "Basic Structure", icon: <Layers className="w-[18px] h-[18px]" />}]} activeTab={activeTab === "grey" ? "grey" : ""} onTabChange={() => setActiveTab("grey")} />
                      <UniversalTabs tabs={[{id: "finishing", label: "Finishing", icon: <PaintRoller className="w-[18px] h-[18px]" />}]} activeTab={activeTab === "finishing" ? "finishing" : ""} onTabChange={() => setActiveTab("finishing")} />
                      <UniversalTabs tabs={[{id: "rcc", label: "RCC Detailed", icon: <Spline className="w-[18px] h-[18px]" />}]} activeTab={activeTab === "rcc" ? "rcc" : ""} onTabChange={() => setActiveTab("rcc")} />
                      <UniversalTabs tabs={[{id: "master", label: "Master Quantities", icon: <Calculator className="w-[18px] h-[18px]" />}]} activeTab={activeTab === "master" ? "master" : ""} onTabChange={() => setActiveTab("master")} />
                      <UniversalTabs tabs={[{id: "rates", label: "Material Rates", icon: <Database className="w-[18px] h-[18px]" />}]} activeTab={activeTab === "rates" ? "rates" : ""} onTabChange={() => setActiveTab("rates")} />
                    </div>
                  </div>
                  <div className="relative overflow-hidden transition-all duration-300">
                    {activeTab === "grey" && (
                    <div className="animate-in fade-in slide-in-from-right-8 duration-500 h-full flex flex-col">
                      <MaterialSummary
                        title="Grey Structure Breakdown"
                        totalLabel="Total Grey Structure Cost"
                        totalValue={formatCurrency(filteredTotalGrey)}
                        totalUnit=""
                        relatedToolIds={['brickwork', 'concrete-mix']}
                        onRecalculate={() => {}}
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-4 mt-6">
                           <ResultCard
                              title="Cement"
                              value={estimates.cementBags.toFixed(0)}
                              unit="bags"
                              variant="neutral"
                              description={formatCurrency(estimates.costCement)}
                              status="normal"
                              comparisonText="8% more than average"
                              explanation="The total volume of cement required for foundation, walls, roof, and plaster work. Store in a damp-proof area."
                           />
                           <ResultCard
                              title="Steel"
                              value={(estimates.steelKg / 1000).toFixed(1)}
                              unit="tons"
                              variant="primary"
                              description={formatCurrency(estimates.costSteel)}
                              status="high"
                              comparisonText="5% over typical limit"
                              explanation="High-tensile Grade 60 steel required for structural integrity of the roof, columns, and foundations. Verify the BBS for exact usage."
                           />
                           <ResultCard
                              title="Bricks"
                              value={`${(estimates.bricksCount / 1000).toFixed(0)}k`}
                              unit="qty"
                              variant="warning"
                              description={formatCurrency(estimates.costBricks)}
                              status="normal"
                              secondaryUnit="pallets"
                              secondaryValue={Math.ceil(estimates.bricksCount / 500)}
                           />
                           <ResultCard
                              title="Sand"
                              value={isSI ? (estimates.sandCft / 35.3147).toFixed(1) : estimates.sandCft.toFixed(0)}
                              unit={isSI ? "m³" : "cft"}
                              variant="neutral"
                              description={formatCurrency(estimates.costSand)}
                              secondaryUnit={isSI ? "cft" : "m³"}
                              secondaryValue={isSI ? estimates.sandCft : (estimates.sandCft / 35.3147)}
                              explanation="Required for concrete mortar joints and wall plastering. Silt content should be tested on-site."
                           />
                           <ResultCard
                              title="Crush"
                              value={isSI ? (estimates.crushCft / 35.3147).toFixed(1) : estimates.crushCft.toFixed(0)}
                              unit={isSI ? "m³" : "cft"}
                              variant="neutral"
                              description={formatCurrency(estimates.costCrush)}
                              secondaryUnit={isSI ? "cft" : "m³"}
                              secondaryValue={isSI ? estimates.crushCft : (estimates.crushCft / 35.3147)}
                           />
                        </div>
                      </MaterialSummary>

                      <div className="w-full h-[320px] mt-8 mb-4 border border-slate-100 rounded-[24px] bg-slate-50/30 p-2 sm:p-4 overflow-hidden">
                        <StyledChart 
                          data={greyCostData.map(d => ({ ...d, fill: d.color }))}
                          type="pie"
                          title="Grey Structure Cost Distribution"
                          valueFormatter={(val) => formatCurrency(val, false)}
                        />
                      </div>

                      <div className="flex items-center justify-between mt-8 mb-4">
                        <h3 className="text-lg font-medium text-slate-800 mb-4">
                          Detailed Exact BOQ
                        </h3>
                        <div className="flex items-center gap-3 relative">
                          <div className="relative group/template">
                            <button className="flex items-center gap-2 bg-slate-50 text-slate-700 px-3 py-1.5 rounded-full hover:bg-slate-100 transition-colors text-base font-semibold active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm">
                              <FolderPlus className="w-4 h-4" />
                              Load Template
                              <ChevronDown className="w-4 h-4" />
                            </button>
                            <div className="w-full absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-lg opacity-0 invisible group-hover/template:opacity-100 group-hover/template:visible transition-all z-20 overflow-hidden">
                              <button onClick={() => handleLoadTemplate("grey", "residential")} className="w-full text-left px-4 py-2 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 text-sm font-medium transition-colors border-b border-slate-100 rounded-full active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm">Residential House</button>
                              <button onClick={() => handleLoadTemplate("grey", "commercial")} className="w-full text-left px-4 py-2 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 text-sm font-medium transition-colors rounded-full active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm">Commercial Office</button>
                            </div>
                          </div>
                          {selectedItems.size > 0 && (
                            <button onClick={handleDeleteSelected}
                              className="flex items-center gap-2 bg-red-50 text-red-600 px-3 py-1.5 rounded-full hover:bg-red-100 transition-colors text-base font-semibold active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete Selected ({selectedItems.size})
                            </button>
                          )}
                          <button
                            onClick={() => handleExportCSV("grey")}
                            className="flex items-center gap-2 text-sm bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full font-semibold hover:bg-indigo-100 transition-colors active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
                          >
                            <Download className="w-4 h-4" />
                            Export CSV
                          </button>
                        </div>
                      </div>
                      <div className="border border-slate-200 rounded-[24px] overflow-y-auto max-h-[400px] bg-white shadow-sm mb-8 relative hide-scrollbar">
                        <table className="boq-table-print-breaks w-full text-sm text-left relative whitespace-nowrap md:whitespace-normal">
                          <thead className="bg-slate-100 text-slate-600 border-b border-slate-200 uppercase text-sm tracking-wider sticky top-0 z-10 shadow-sm before:content-[''] before:absolute before:inset-0 before:bg-slate-100 before:-z-10">
                            <tr>
                              <th className="px-6 py-4 font-bold">
                                Material / Item
                              </th>
                              <th className="px-6 py-4 font-bold text-center">
                                Quantity
                              </th>
                              <th className="px-6 py-4 font-bold text-center">
                                Unit
                              </th>
                              <th className="px-6 py-4 font-bold text-left hidden md:table-cell w-1/4">
                                Notes
                              </th>
                              <th className="px-6 py-4 font-bold text-right">
                                Amount (Rs)
                              </th>
                            </tr>
                          </thead>
                          <Reorder.Group as="tbody" values={sortedFoundationData.map(i => i.name)} onReorder={setFoundationOrder} className="text-slate-800 divide-y divide-slate-100">
                            <tr className="bg-transparent/50">
                              <td
                                colSpan={5}
                                className="px-6 py-2.5 text-base font-medium uppercase tracking-wider text-slate-700"
                              >
                                Foundation Work
                              </td>
                            </tr>
                            {sortedFoundationData.map((item) => (
                              <AnimatedTableRow 
                                key={`f-${item.name}`} 
                                item={item} 
                                formatCurrency={formatCurrency}
                                selected={selectedItems.has(item.name)}
                                onSelect={handleToggleSelect}
                                onDuplicate={(item) => handleDuplicateRow(item, 'foundation')}
                                note={itemNotes[item.name]}
                                onNoteChange={(note) => handleNoteChange(item.name, note)}
                              />
                            ))}
                          </Reorder.Group>
                          <Reorder.Group as="tbody" values={sortedSuperstructureData.map(i => i.name)} onReorder={setSuperstructureOrder} className="text-slate-800 divide-y divide-slate-100">
                            <tr className="bg-transparent/50">
                              <td
                                colSpan={5}
                                className="px-6 py-2.5 text-base font-medium uppercase tracking-wider text-slate-700"
                              >
                                Above-Ground Work (Walls & Roof)
                              </td>
                            </tr>
                            {sortedSuperstructureData.map((item) => (
                              <AnimatedTableRow 
                                key={`s-${item.name}`} 
                                item={item} 
                                formatCurrency={formatCurrency}
                                selected={selectedItems.has(item.name)}
                                onSelect={handleToggleSelect}
                                onDuplicate={(item) => handleDuplicateRow(item, 'superstructure')}
                                note={itemNotes[item.name]}
                                onNoteChange={(note) => handleNoteChange(item.name, note)}
                              />
                            ))}
                          </Reorder.Group>
                          <tfoot className="sticky bottom-0 bg-slate-100 border-t-2 border-slate-300 shadow-[0_-4px_6px_-1px_rgba(15,23,42,0.05)]">
                            <tr>
                              <td className="px-6 py-4 font-extrabold text-slate-800 uppercase tracking-widest text-sm">
                                Total Grey Structure
                              </td>
                              <td className="px-6 py-4 text-center font-bold text-slate-600">
                                -
                              </td>
                              <td className="px-6 py-4 text-center font-medium text-slate-700">
                                -
                              </td>
                              <td className="px-6 py-4 text-left font-medium text-slate-700 hidden md:table-cell">
                                -
                              </td>
                              <td className="px-6 py-4 text-right font-extrabold text-indigo-700 text-lg shadow-inner">
                                {formatCurrency(greyCostData.reduce((acc, item) => acc + item.value, 0))}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                      <div className="flex-1 min-h-[250px] w-full relative mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={greyCostData.map((d) => ({
                              ...d,
                              value: convertAmount(d.value),
                            }))}
                            margin={{ top: 20, right: 10, left: 0, bottom: 5 }}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              vertical={false}
                              stroke="#E2E8F0"
                            />
                            <XAxis
                              dataKey="name"
                              axisLine={false}
                              tickLine={false}
                              tick={{
                                fill: "#64748B",
                                fontSize: 10,
                                fontWeight: 600,
                              }}
                            />
                            <YAxis
                              axisLine={false}
                              tickLine={false}
                              tick={{ fill: "#94A3B8", fontSize: 10 }}
                              tickFormatter={(val) =>
                                `${settings.currency === "PKR" ? "RS" : settings.currency} ${(val / 1000).toFixed(0)}k`
                              }
                            />
                            <Tooltip
                              cursor={{ fill: "#F8FAFC" }}
                              contentStyle={{
                                borderRadius: "12px",
                                border: "1px solid #E2E8F0",
                                boxShadow: "0 10px 30px rgba(15,23,42,0.05)",
                                fontWeight: "bold",
                              }}
                              formatter={(value: any) =>
                                formatCurrency(value, false)
                              }
                            />
                            <Bar
                              dataKey="value"
                              radius={[6, 6, 0, 0]}
                              maxBarSize={60}
                            >
                              {greyCostData.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={entry.color}
                                />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                  {activeTab === "finishing" && (
                    <div className="animate-in fade-in slide-in-from-left-8 duration-500 h-full flex flex-col">
                      <MaterialSummary
                        title="Finishing Breakdown"
                        totalLabel="Total Finishing Cost"
                        totalValue={formatCurrency(filteredTotalFinishing)}
                        totalUnit=""
                        subtitle={`Based on ${getQualityLabel(finishQuality)} Grade settings (${specs.flooringType}, ${specs.wardrobeMaterial})`}
                        relatedToolIds={['interiors-finishes', 'master-quantity']}
                        onRecalculate={() => {}}
                      >
                         <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4 mt-6">
                            {finishingCostData.map((item, idx) => (
                               <ResultCard
                                  key={idx}
                                  title={item.name}
                                  value={formatCurrency(item.value)}
                                  unit=""
                                  variant="neutral"
                               />
                            ))}
                         </div>
                      </MaterialSummary>

                      <div className="w-full h-[320px] mt-8 mb-4 border border-slate-100 rounded-[24px] bg-slate-50/30 p-2 sm:p-4 overflow-hidden">
                        <StyledChart 
                          data={finishingCostData.map(d => ({ ...d, fill: d.color }))}
                          type="pie"
                          title="Finishing Works Cost Distribution"
                          valueFormatter={(val) => formatCurrency(val, false)}
                        />
                      </div>

                      <div className="flex items-center justify-between mt-8 mb-4">
                        <h3 className="text-lg font-medium text-slate-800 mb-4">
                          Detailed Exact BOQ
                        </h3>
                        <div className="flex items-center gap-3 relative">
                          <div className="relative group/template">
                            <button className="flex items-center gap-2 bg-slate-50 text-slate-700 px-3 py-1.5 rounded-full hover:bg-slate-100 transition-colors text-base font-semibold active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm">
                              <FolderPlus className="w-4 h-4" />
                              Load Template
                              <ChevronDown className="w-4 h-4" />
                            </button>
                            <div className="w-full absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-lg opacity-0 invisible group-hover/template:opacity-100 group-hover/template:visible transition-all z-20 overflow-hidden">
                              <button onClick={() => handleLoadTemplate("finishing", "residential")} className="w-full text-left px-4 py-2 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 text-sm font-medium transition-colors border-b border-slate-100 rounded-full active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm">Residential House</button>
                              <button onClick={() => handleLoadTemplate("finishing", "commercial")} className="w-full text-left px-4 py-2 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 text-sm font-medium transition-colors rounded-full active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm">Commercial Office</button>
                            </div>
                          </div>
                          {selectedItems.size > 0 && (
                            <button onClick={handleDeleteSelected}
                              className="flex items-center gap-2 bg-red-50 text-red-600 px-3 py-1.5 rounded-full hover:bg-red-100 transition-colors text-base font-semibold active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete Selected ({selectedItems.size})
                            </button>
                          )}
                          <button
                            onClick={() => handleExportCSV("finishing")}
                            className="flex items-center gap-2 text-sm bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full font-semibold hover:bg-indigo-100 transition-colors active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
                          >
                            <Download className="w-4 h-4" />
                            Export CSV
                          </button>
                        </div>
                      </div>
                      <div className="border border-slate-200 rounded-[24px] overflow-y-auto max-h-[400px] bg-white shadow-sm mb-8 relative hide-scrollbar">
                        <table className="boq-table-print-breaks w-full text-sm text-left relative whitespace-nowrap md:whitespace-normal">
                          <thead className="bg-slate-100 text-slate-600 border-b border-slate-200 uppercase text-sm tracking-wider sticky top-0 z-10 shadow-sm before:content-[''] before:absolute before:inset-0 before:bg-slate-100 before:-z-10">
                            <tr>
                              <th className="px-6 py-4 font-bold">
                                Material / Item
                              </th>
                              <th className="px-6 py-4 font-bold text-center">
                                Quantity
                              </th>
                              <th className="px-6 py-4 font-bold text-center">
                                Unit
                              </th>
                              <th className="px-6 py-4 font-bold text-left hidden md:table-cell w-1/4">
                                Notes
                              </th>
                              <th className="px-6 py-4 font-bold text-right">
                                Amount (Rs)
                              </th>
                            </tr>
                          </thead>
                          <Reorder.Group as="tbody" values={sortedFinishingCostData.map(i => i.name)} onReorder={setFinishingOrder} className="text-slate-800 divide-y divide-slate-100">
                            {sortedFinishingCostData.map((item) => (
                              <AnimatedTableRow 
                                key={item.name} 
                                item={item} 
                                formatCurrency={formatCurrency}
                                roundQuantity={true}
                                selected={selectedItems.has(item.name)}
                                onSelect={handleToggleSelect}
                                onDuplicate={(item) => handleDuplicateRow(item, 'finishing')}
                                note={itemNotes[item.name]}
                                onNoteChange={(note) => handleNoteChange(item.name, note)}
                              />
                            ))}
                          </Reorder.Group>
                          <tfoot className="sticky bottom-0 bg-slate-100 border-t-2 border-slate-300 shadow-[0_-4px_6px_-1px_rgba(15,23,42,0.05)]">
                            <tr>
                              <td className="px-6 py-4 font-extrabold text-slate-800 uppercase tracking-widest text-sm">
                                Total Finishing Works
                              </td>
                              <td className="px-6 py-4 text-center font-bold text-slate-600">
                                -
                              </td>
                              <td className="px-6 py-4 text-center font-medium text-slate-700">
                                -
                              </td>
                              <td className="px-6 py-4 text-left font-medium text-slate-700 hidden md:table-cell">
                                -
                              </td>
                              <td className="px-6 py-4 text-right font-extrabold text-indigo-700 text-lg shadow-inner">
                                {formatCurrency(finishingCostData.reduce((acc, item) => acc + item.value, 0))}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                      <div className="flex-1 min-h-[250px] w-full relative mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={finishingCostData.map((d) => ({
                              ...d,
                              value: convertAmount(d.value),
                            }))}
                            margin={{ top: 20, right: 10, left: 0, bottom: 5 }}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              vertical={false}
                              stroke="#E2E8F0"
                            />
                            <XAxis
                              dataKey="name"
                              axisLine={false}
                              tickLine={false}
                              tick={{
                                fill: "#64748B",
                                fontSize: 10,
                                fontWeight: 600,
                              }}
                            />
                            <YAxis
                              axisLine={false}
                              tickLine={false}
                              tick={{ fill: "#94A3B8", fontSize: 10 }}
                              tickFormatter={(val) =>
                                `${settings.currency === "PKR" ? "RS" : settings.currency} ${(val / 1000).toFixed(0)}k`
                              }
                            />
                            <Tooltip
                              cursor={{ fill: "#F8FAFC" }}
                              contentStyle={{
                                borderRadius: "12px",
                                border: "1px solid #E2E8F0",
                                boxShadow: "0 10px 30px rgba(15,23,42,0.05)",
                                fontWeight: "bold",
                              }}
                              formatter={(value: any) =>
                                formatCurrency(value, false)
                              }
                            />
                            <Bar
                              dataKey="value"
                              radius={[6, 6, 0, 0]}
                              maxBarSize={60}
                            >
                              {finishingCostData.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={entry.color}
                                />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                  {activeTab === "rcc" && (
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 h-full flex flex-col pt-4">
                      <MasterRccStructure isEmbedded={true} />
                    </div>
                  )}
                  {activeTab === "master" && (
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 h-full flex flex-col pt-4">
                      <MasterQuantityEstimator isEmbedded={true} />
                    </div>
                  )}
                  {activeTab === "rates" && (
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 h-full flex flex-col text-left">
                      <div className="flex items-center gap-4 mb-6 flex-wrap">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-[24px] overflow-hidden">
                          <Database className="w-6 h-6" />
                        </div>
                        <div>
                          <h2 className="text-xl font-semibold text-slate-900 tracking-tight mb-4">
                            Configure Material Rates
                          </h2>
                          <p className="mt-1 text-base font-normal text-slate-600 leading-relaxed">
                            Review market rates and override with custom vendor quotes
                            if needed.
                          </p>
                        </div>
                      </div>
                      <div className="flex-1 overflow-auto border border-slate-200 rounded-[24px] mb-6">
                        <table className="boq-table-print-breaks w-full text-sm text-left">
                          <thead className="bg-slate-100 text-slate-600 border-b border-slate-200 uppercase text-sm tracking-wider sticky top-0 z-10">
                            <tr>
                              <th className="px-6 py-4 font-bold">Material Item</th>
                              <th className="px-6 py-4 font-bold">Current Market Rate</th>
                              <th className="px-6 py-4 font-bold bg-indigo-50/50 text-indigo-700">Your Custom Rate</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-slate-100">
                            {(
                              [
                                { key: "cement", name: "Cement (Per Bag)", color: "bg-stone-500", bg: "bg-stone-50" },
                                { key: "steel", name: "Steel 60-Grade (Per Kg)", color: "bg-slate-700", bg: "bg-transparent" },
                                { key: "bricks", name: "Bricks A-Class (Per 1000)", color: "bg-blue-500", bg: "bg-blue-50" },
                                { key: "sand", name: "Sand (Per Cft)", color: "bg-amber-400", bg: "bg-amber-50" },
                                { key: "crush", name: "Crush (Per Cft)", color: "bg-neutral-500", bg: "bg-neutral-50" },
                                { key: "laborGrey", name: "Grey Labor (Per Sq.ft)", color: "bg-emerald-500", bg: "bg-emerald-50" },
                                { key: "laborFinish", name: "Finish Labor (Per Sq.ft)", color: "bg-teal-500", bg: "bg-teal-50" },
                              ] as const
                            ).map((item) => (
                              <tr key={item.key} className="hover:bg-transparent/80 transition-colors group">
                                <td className="px-6 py-4 font-bold text-slate-700">
                                  <div className="flex items-center gap-3">
                                    <div className={`flex items-center justify-center w-8 h-8 rounded-[24px] ${item.bg} group-hover:scale-110 transition-transform`}>
                                      <div className={`w-3 h-3 rounded-full ${item.color} shadow-sm`}></div>
                                    </div>
                                    <span>{item.name}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 font-bold text-slate-700">
                                  {formatCurrency(item.key === "bricks" ? marketRates[item.key] * 1000 : marketRates[item.key])}
                                </td>
                                <td className="px-6 py-3 bg-indigo-50/30">
                                  <div className="relative flex items-center">
                                    <span className="absolute left-3 text-slate-700 font-bold mb-0.5">
                                      {settings.currency === "PKR" ? "Rs" : "$"}
                                    </span>
                                    <><label htmlFor="a11y-input-269" className="sr-only">Default</label>
<motion.input initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} id="a11y-input-269"
                                      type="number" inputMode="decimal"
                                      min="0"
                                      step="any"
                                      className={`w-full bg-white border ${customRates[item.key] !== undefined ? "border-indigo-300 ring-2 ring-indigo-500/20 text-indigo-700 font-bold" : "border-slate-200 text-slate-800"} rounded-[24px] py-2 pl-10 pr-3 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50 transition-all`}
                                      placeholder="Default"
                                      value={customRates[item.key] !== undefined ? (item.key === "bricks" ? customRates[item.key]! * 1000 : customRates[item.key]) : ""}
                                      onChange={(e) => {
                                        const val = e.target.value ? parseFloat(e.target.value) : null;
                                        if (val !== null && val < 0) return;
                                        setCustomRate(item.key, val !== null && item.key === "bricks" ? val / 1000 : val);
                                      }}
                                    /></>
                                  </div>
                                  {customRates[item.key] !== undefined && (
                                    <div className="text-sm text-indigo-600 font-medium mt-1 ml-1 truncate rounded-full">Custom rate active</div>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="flex flex-col sm:flex-row items-center justify-between mt-auto gap-4 pt-4 border-t border-slate-100">
                        <button
                          onClick={() => {
                            if(window.confirm("Are you sure you want to reset all inputs? This action cannot be undone.")) resetCustomRates();
                          }}
                          className="flex items-center gap-2 text-slate-700 font-bold hover:text-slate-800 px-4 py-2 rounded-full hover:bg-slate-100 transition-colors w-full sm:w-auto justify-center active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
                        >
                          <RotateCcw className="w-4 h-4" /> Reset Defaults
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        
              </div>
            )}
</section>
          
          {/* Results Area */}
          {showResults && (
            <section className="flex-1 min-w-[min(100%,350px)] lg:max-w-[500px] w-full shrink-0 relative hidden lg:block">
              <div className="sticky top-6 z-10 bg-[var(--bg-card)]/50 backdrop-blur-2xl border border-[var(--border-color)] rounded-[2.5rem] p-4 sm:p-6 lg:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.08)] flex flex-col items-start gap-8">
              <div className="flex flex-col gap-4">
                <div className="p-4 bg-slate-50 rounded-[24px] border border-slate-200 shadow-sm text-slate-800 border border-slate-100 rounded-[24px] overflow-hidden">
                  <Calculator className="w-8 h-8 text-slate-600" />
                </div>
                <div>
                  <h3 className="uppercase st mb-1.5 text-sm text-lg font-medium text-slate-800 mb-4">Total Estimated Cost</h3>
                  <p className="text-2xl sm:text-2xl break-all tabular-nums tracking-tighter text-slate-900 dark:text-white drop-shadow-sm text-base font-normal text-slate-600 leading-relaxed">{formatCurrency(currentTotalCost)}</p>
                  <p className="mt-2 max-w-[200px] text-base font-normal text-slate-600 leading-relaxed">Rates based on current regional market — verify with local suppliers.</p>
                </div>
              </div>
              <div className="flex flex-col gap-4 mt-6 w-full pt-6 border-t border-[var(--border-color)]">
                <div>
                  <div className="text-slate-500 text-base font-medium uppercase tracking-wider text-sm mb-0.5">Basic Structure</div>
                  <div className="text-lg font-bold tabular-nums text-slate-900 dark:text-white">{formatCurrency(filteredTotalGrey)}</div>
                </div>
                <div className="w-px h-8 bg-border-color self-center hidden sm:block"></div>
                <div>
                  <div className="text-slate-500 text-base font-medium uppercase tracking-wider text-sm mb-0.5">Finishings</div>
                  <div className="text-lg font-bold tabular-nums text-slate-900 dark:text-white">{formatCurrency(filteredTotalFinishing)}</div>
                </div>
              </div>
            </div>

            </section>
        )}
      </div>
    </div>
  </div>
  
  <GlobalSettingsModal
        isOpen={isGlobalSettingsOpen}
        onClose={() => setIsGlobalSettingsOpen(false)}
      />

      {/* Room Customization Modal */}
      {isRoomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#F5F5F7] backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 tracking-tight mb-4">Advanced Room Specs</h2>
                <p className="text-base font-normal text-slate-600 leading-relaxed">Configure exact dimensions and features per room</p>
              </div>
              <button onClick={() => setIsRoomModalOpen(false)} className="w-full p-2 bg-white border border-slate-200 text-slate-500 hover:bg-slate-100 rounded-full transition-colors active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm overflow-hidden">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex border-b border-slate-100 overflow-x-auto no-scrollbar">
               {(["bedroom", "washroom", "kitchen", "living", "basement"] as const).map(tab => (
                 <button
                   key={tab}
                   onClick={() => setActiveRoomTab(tab)}
                   className={`px-6 py-4 text-base font-medium uppercase tracking-wider whitespace-nowrap border-b-2 transition-colors ${
                     activeRoomTab === tab 
                     ? "border-indigo-600 text-indigo-700 bg-indigo-50/50" 
                     : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                   }`}
                 >
                   {tab === "living" ? "Drawing/Living" : tab}
                 </button>
               ))}
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/30 rounded-full transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                
                {activeRoomTab === "bedroom" && (
                  <>
                    <div className="p-4 calc-input flex flex-col gap-2">
                       <label className="uppercase tracking-widest text-sm font-medium text-slate-700 mb-1 block">Typical Length (ft)</label>
                       <><label htmlFor="a11y-input-270" className="sr-only">Input</label>
<motion.input initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} id="a11y-input-270" type="number" inputMode="decimal" value={roomConfigs.bedroom.length} onChange={e => setRoomConfigs(p => ({...p, bedroom: {...p.bedroom, length: Number(e.target.value)}}))} className="w-full bg-slate-50 border border-slate-200 rounded-full px-4 py-2 text-base font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500 focus:outline-none" /></>
                    </div>
                    <div className="p-4 calc-input flex flex-col gap-2">
                       <label className="uppercase tracking-widest text-sm font-medium text-slate-700 mb-1 block">Typical Width (ft)</label>
                       <><label htmlFor="a11y-input-271" className="sr-only">Input</label>
<motion.input initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} id="a11y-input-271" type="number" inputMode="decimal" value={roomConfigs.bedroom.width} onChange={e => setRoomConfigs(p => ({...p, bedroom: {...p.bedroom, width: Number(e.target.value)}}))} className="w-full bg-slate-50 border border-slate-200 rounded-full px-4 py-2 text-base font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500 focus:outline-none" /></>
                    </div>
                    <div className="p-4 calc-input flex flex-col gap-2">
                       <label className="uppercase tracking-widest text-sm font-medium text-slate-700 mb-1 block">Ceiling Height (ft)</label>
                       <><label htmlFor="a11y-input-272" className="sr-only">Input</label>
<motion.input initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} id="a11y-input-272" type="number" inputMode="decimal" value={roomConfigs.bedroom.height} onChange={e => setRoomConfigs(p => ({...p, bedroom: {...p.bedroom, height: Number(e.target.value)}}))} className="w-full bg-slate-50 border border-slate-200 rounded-full px-4 py-2 text-base font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500 focus:outline-none" /></>
                    </div>
                    <div className="p-4 calc-input flex flex-col gap-2">
                       <label className="uppercase tracking-widest text-sm font-medium text-slate-700 mb-1 block">Wardrobe Length (ft)</label>
                       <><label htmlFor="a11y-input-273" className="sr-only">Input</label>
<motion.input initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} id="a11y-input-273" type="number" inputMode="decimal" value={roomConfigs.bedroom.wardrobeLength} onChange={e => setRoomConfigs(p => ({...p, bedroom: {...p.bedroom, wardrobeLength: Number(e.target.value)}}))} className="w-full bg-slate-50 border border-slate-200 rounded-full px-4 py-2 text-base font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500 focus:outline-none" /></>
                    </div>
                  </>
                )}

                {activeRoomTab === "washroom" && (
                  <>
                    <div className="p-4 calc-input flex flex-col gap-2">
                       <label className="uppercase tracking-widest text-sm font-medium text-slate-700 mb-1 block">Length (ft)</label>
                       <><label htmlFor="a11y-input-274" className="sr-only">Input</label>
<motion.input initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} id="a11y-input-274" type="number" inputMode="decimal" value={roomConfigs.washroom.length} onChange={e => setRoomConfigs(p => ({...p, washroom: {...p.washroom, length: Number(e.target.value)}}))} className="w-full bg-slate-50 border border-slate-200 rounded-full px-4 py-2 text-base font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500 focus:outline-none" /></>
                    </div>
                    <div className="p-4 calc-input flex flex-col gap-2">
                       <label className="uppercase tracking-widest text-sm font-medium text-slate-700 mb-1 block">Width (ft)</label>
                       <><label htmlFor="a11y-input-275" className="sr-only">Input</label>
<motion.input initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} id="a11y-input-275" type="number" inputMode="decimal" value={roomConfigs.washroom.width} onChange={e => setRoomConfigs(p => ({...p, washroom: {...p.washroom, width: Number(e.target.value)}}))} className="w-full bg-slate-50 border border-slate-200 rounded-full px-4 py-2 text-base font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500 focus:outline-none" /></>
                    </div>
                    <div className="p-4 calc-input flex flex-col gap-2">
                       <label className="uppercase tracking-widest text-sm font-medium text-slate-700 mb-1 block">Commode / WC Type</label>
                       <motion.select initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} value={roomConfigs.washroom.wcType} onChange={e => setRoomConfigs(p => ({...p, washroom: {...p.washroom, wcType: e.target.value}}))} className="w-full bg-slate-50 border border-slate-200 rounded-[24px] px-4 py-2 text-base font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500 focus:outline-none overflow-hidden">
                         <option>Floor Mounted (Asian)</option>
                         <option>Floor Mounted (Western)</option>
                         <option>Wall Hung (Concealed)</option>
                       </motion.select>
                    </div>
                    <div className="p-4 calc-input flex flex-col gap-2">
                       <label className="uppercase tracking-widest text-sm font-medium text-slate-700 mb-1 block">Shower Setup</label>
                       <motion.select initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} value={roomConfigs.washroom.showerSetup} onChange={e => setRoomConfigs(p => ({...p, washroom: {...p.washroom, showerSetup: e.target.value}}))} className="w-full bg-slate-50 border border-slate-200 rounded-[24px] px-4 py-2 text-base font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500 focus:outline-none overflow-hidden">
                         <option>Standard Mixer</option>
                         <option>Glass Enclosure</option>
                         <option>Jacuzzi Tub</option>
                       </motion.select>
                    </div>
                    <div className="p-4 calc-input flex flex-col gap-2">
                       <label className="uppercase tracking-widest text-sm font-medium text-slate-700 mb-1 block">Vanity / Basin</label>
                       <motion.select initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} value={roomConfigs.washroom.vanity} onChange={e => setRoomConfigs(p => ({...p, washroom: {...p.washroom, vanity: e.target.value}}))} className="w-full bg-slate-50 border border-slate-200 rounded-[24px] px-4 py-2 text-base font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500 focus:outline-none overflow-hidden">
                         <option>Standard Ceramic</option>
                         <option>Custom PVC Vanity</option>
                         <option>Corian Marble Top</option>
                       </motion.select>
                    </div>
                  </>
                )}

                {activeRoomTab === "kitchen" && (
                  <>
                    <div className="p-4 calc-input flex flex-col gap-2">
                       <label className="uppercase tracking-widest text-sm font-medium text-slate-700 mb-1 block">Length (ft)</label>
                       <><label htmlFor="a11y-input-276" className="sr-only">Input</label>
<motion.input initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} id="a11y-input-276" type="number" inputMode="decimal" value={roomConfigs.kitchen.length} onChange={e => setRoomConfigs(p => ({...p, kitchen: {...p.kitchen, length: Number(e.target.value)}}))} className="w-full bg-slate-50 border border-slate-200 rounded-full px-4 py-2 text-base font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500 focus:outline-none" /></>
                    </div>
                    <div className="p-4 calc-input flex flex-col gap-2">
                       <label className="uppercase tracking-widest text-sm font-medium text-slate-700 mb-1 block">Width (ft)</label>
                       <><label htmlFor="a11y-input-277" className="sr-only">Input</label>
<motion.input initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} id="a11y-input-277" type="number" inputMode="decimal" value={roomConfigs.kitchen.width} onChange={e => setRoomConfigs(p => ({...p, kitchen: {...p.kitchen, width: Number(e.target.value)}}))} className="w-full bg-slate-50 border border-slate-200 rounded-full px-4 py-2 text-base font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500 focus:outline-none" /></>
                    </div>
                    <div className="p-4 calc-input flex flex-col gap-2">
                       <label className="uppercase tracking-widest text-sm font-medium text-slate-700 mb-1 block">Countertop (Length ft)</label>
                       <><label htmlFor="a11y-input-278" className="sr-only">Input</label>
<motion.input initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} id="a11y-input-278" type="number" inputMode="decimal" value={roomConfigs.kitchen.counterLength} onChange={e => setRoomConfigs(p => ({...p, kitchen: {...p.kitchen, counterLength: Number(e.target.value)}}))} className="w-full bg-slate-50 border border-slate-200 rounded-full px-4 py-2 text-base font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500 focus:outline-none" /></>
                    </div>
                    <div className="p-4 calc-input flex flex-col gap-2">
                       <label className="uppercase tracking-widest text-sm font-medium text-slate-700 mb-1 block">Cabinets Material</label>
                       <motion.select initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} value={roomConfigs.kitchen.cabinets} onChange={e => setRoomConfigs(p => ({...p, kitchen: {...p.kitchen, cabinets: e.target.value}}))} className="w-full bg-slate-50 border border-slate-200 rounded-[24px] px-4 py-2 text-base font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500 focus:outline-none overflow-hidden">
                         <option>Lasani Wood</option>
                         <option>UV/Acrylic</option>
                         <option>Solid Ash/Oak</option>
                       </motion.select>
                    </div>
                    <div className="p-4 calc-input flex flex-col gap-2">
                       <label className="uppercase tracking-widest text-sm font-medium text-slate-700 mb-1 block">Backsplash</label>
                       <motion.select initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} value={roomConfigs.kitchen.backsplash} onChange={e => setRoomConfigs(p => ({...p, kitchen: {...p.kitchen, backsplash: e.target.value}}))} className="w-full bg-slate-50 border border-slate-200 rounded-[24px] px-4 py-2 text-base font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500 focus:outline-none overflow-hidden">
                         <option>Ceramic Tiles</option>
                         <option>Glass/Mosaic</option>
                         <option>Corian Full Wall</option>
                       </motion.select>
                    </div>
                  </>
                )}

                {activeRoomTab === "living" && (
                  <>
                    <div className="p-4 calc-input flex flex-col gap-2">
                       <label className="uppercase tracking-widest text-sm font-medium text-slate-700 mb-1 block">Length (ft)</label>
                       <><label htmlFor="a11y-input-279" className="sr-only">Input</label>
<motion.input initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} id="a11y-input-279" type="number" inputMode="decimal" value={roomConfigs.livingRoom.length} onChange={e => setRoomConfigs(p => ({...p, livingRoom: {...p.livingRoom, length: Number(e.target.value)}}))} className="w-full bg-slate-50 border border-slate-200 rounded-full px-4 py-2 text-base font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500 focus:outline-none" /></>
                    </div>
                    <div className="p-4 calc-input flex flex-col gap-2">
                       <label className="uppercase tracking-widest text-sm font-medium text-slate-700 mb-1 block">Width (ft)</label>
                       <><label htmlFor="a11y-input-280" className="sr-only">Input</label>
<motion.input initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} id="a11y-input-280" type="number" inputMode="decimal" value={roomConfigs.livingRoom.width} onChange={e => setRoomConfigs(p => ({...p, livingRoom: {...p.livingRoom, width: Number(e.target.value)}}))} className="w-full bg-slate-50 border border-slate-200 rounded-full px-4 py-2 text-base font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500 focus:outline-none" /></>
                    </div>
                    <div className="p-4 calc-input flex flex-col gap-2">
                       <label className="uppercase tracking-widest text-sm font-medium text-slate-700 mb-1 block">Feature Wall Setup</label>
                       <motion.select initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} value={roomConfigs.livingRoom.featureWall} onChange={e => setRoomConfigs(p => ({...p, livingRoom: {...p.livingRoom, featureWall: e.target.value}}))} className="w-full bg-slate-50 border border-slate-200 rounded-[24px] px-4 py-2 text-base font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500 focus:outline-none overflow-hidden">
                         <option>None</option>
                         <option>Yes (Wallpaper/Paint)</option>
                         <option>Yes (Wood Paneling / Marble)</option>
                       </motion.select>
                    </div>
                    <div className="p-4 calc-input flex flex-col gap-2">
                       <label className="uppercase tracking-widest text-sm font-medium text-slate-700 mb-1 block">Chandelier Points</label>
                       <><label htmlFor="a11y-input-281" className="sr-only">Input</label>
<motion.input initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} id="a11y-input-281" type="number" inputMode="decimal" value={roomConfigs.livingRoom.chandelierPoints} onChange={e => setRoomConfigs(p => ({...p, livingRoom: {...p.livingRoom, chandelierPoints: Number(e.target.value)}}))} className="w-full bg-slate-50 border border-slate-200 rounded-full px-4 py-2 text-base font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500 focus:outline-none" /></>
                    </div>
                  </>
                )}

                {activeRoomTab === "basement" && (
                  <>
                    <div className="p-4 calc-input flex flex-col gap-2">
                       <label className="uppercase tracking-widest text-sm font-medium text-slate-700 mb-1 block">Excavation Depth (ft)</label>
                       <><label htmlFor="a11y-input-282" className="sr-only">Input</label>
<motion.input initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} id="a11y-input-282" type="number" inputMode="decimal" value={roomConfigs.basement.depth} onChange={e => setRoomConfigs(p => ({...p, basement: {...p.basement, depth: Number(e.target.value)}}))} className="w-full bg-slate-50 border border-slate-200 rounded-full px-4 py-2 text-base font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500 focus:outline-none" /></>
                    </div>
                    <div className="p-4 calc-input flex flex-col gap-2">
                       <label className="uppercase tracking-widest text-sm font-medium text-slate-700 mb-1 block">Retaining Wall Spec</label>
                       <motion.select initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} value={roomConfigs.basement.retainingWall} onChange={e => setRoomConfigs(p => ({...p, basement: {...p.basement, retainingWall: e.target.value}}))} className="w-full bg-slate-50 border border-slate-200 rounded-[24px] px-4 py-2 text-base font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500 focus:outline-none overflow-hidden">
                         <option>Standard Brick 13.5-inch</option>
                         <option>RCC 9-Inch</option>
                         <option>RCC 12-Inch Heavy</option>
                       </motion.select>
                    </div>
                  </>
                )}
                
              </div>
            </div>
            
            <div className="p-4 sm:p-6 border-t border-slate-100 bg-white">
               <button onClick={() => setIsRoomModalOpen(false)} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-full transition-all shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] active:scale-95 flex justify-center items-center gap-2 hover:-translate-y-0.5">
                 <CheckCircle2 className="w-5 h-5" /> Save Detail Configurations
               </button>
            </div>
          </div>
        </div>
      )}

      <section className="w-full max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 my-12 px-4 md:px-0" aria-label="Popular Estimates">
        <h3 className="md: text-slate-900 dark:text-white text-center mb-6 text-lg font-medium text-slate-800 mb-4">
          Popular Construction Estimates
        </h3>
        <div className="flex flex-wrap justify-center gap-3">
          {[
            { size: "5", unit: "Marla", city: "Lahore" },
            { size: "10", unit: "Marla", city: "Islamabad" },
            { size: "1", unit: "Kanal", city: "Karachi" },
            { size: "3", unit: "Marla", city: "Rawalpindi" },
            { size: "7", unit: "Marla", city: "Faisalabad" },
          ].map((route) => (
            <a
              key={`${route.size}-${route.unit}-${route.city}`}
              href={`/estimate/${route.size}-${route.unit}-house-construction-cost-${route.city}`}
              className="px-4 py-2 bg-bg-card border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-full hover:bg-slate-50 hover:shadow-sm transition-all"
            >
              {route.size} {route.unit} House Cost in {route.city}
            </a>
          ))}
        </div>
      </section>

      <ThumbRuleDistributionEngine totalCost={estimates.totalCost} />
      <FormulaTransparencyCard 
        title="House Estimator Formula Logic"
        formulas={[
          { name: "Total Cost", formula: "Grey Structure + Finishing", variables: { Grey: formatCurrency(estimates.totalGrey), Finishing: formatCurrency(estimates.totalFinishing) }, result: formatCurrency(estimates.totalCost) }
        ]}
      />
      <CalculationHistory
        calculatorId="house_estimator_v1"
        estimationName="Complete House Estimator"
        currentInputs={{ activeTab, finishQuality }}
        currentResults={{ 
          totalCost: estimates.totalCost.toFixed(2),
          totalGrey: estimates.totalGrey.toFixed(2),
          totalFinishing: estimates.totalFinishing.toFixed(2)
        }}
        summaryGeneration={(inputs, res) => `Total Cost: ${res.totalCost}`}
        onRestore={(inputs) => {
          if (inputs.activeTab) setActiveTab(inputs.activeTab);
          if (inputs.finishQuality) setFinishQuality(inputs.finishQuality);
        }}
        savePayload={pdfExportPayload}
      />
    </div>
  );
}
