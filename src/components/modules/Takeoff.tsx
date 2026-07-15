import { CalculationHistory } from "../ui/CalculationHistory";

import { useState, useRef, useEffect, useCallback } from "react";
import { GlobalSettingsToggle } from "../ui/GlobalSettingsToggle";
import { useGlobalSettings } from "../../context/SettingsContext";

import {
  Layers,
  MousePointer2,
  ZoomIn,
  ZoomOut,
  Move,
  Ruler,
  Activity,
  Square,
  Upload,
  Trash2,
  Check,
  X,
  GripVertical,
} from "lucide-react";
import {
  Stage,
  Layer,
  Image as KonvaImage,
  Line,
  Circle,
  Text as KonvaText,
  Group,
} from "react-konva";
import {
  Point,
  MeasurementType,
  Measurement,
  getDistance,
  calculateLength,
  calculateArea,
  formatDualMeasurement,
  convertLength,
} from "../../../src/utils/measurements";
import { useTakeoff } from "../../../src/context/TakeoffContext";
const ASSEMBLIES = [
  {
    id: "asm-foundation",
    name: "Foundation Strip",
    icon: "🏗️",
    color: "#f59e0b",
    inputs: [
      { key: "length", label: "Length (m)", type: "number", placeholder: "e.g. 10" },
      { key: "width", label: "Width (m)", type: "number", placeholder: "e.g. 0.6" },
      { key: "depth", label: "Depth (m)", type: "number", placeholder: "e.g. 1.0" },
    ],
    generateBoq: (id: string, inputs: any) => {
      const l = parseFloat(inputs.length || "0");
      const w = parseFloat(inputs.width || "0");
      const d = parseFloat(inputs.depth || "0");
      const vol = l * w * d;
      return [
        { desc: "Excavation", unit: "m³", rate: 12.5, qtyOverride: vol, linkedMeasurementIds: [id] },
        { desc: "PCC Base", unit: "m³", rate: 85.0, qtyOverride: l * w * 0.15, linkedMeasurementIds: [id] },
        { desc: "RCC Foundation", unit: "m³", rate: 140.0, qtyOverride: l * (w-0.2) * (d-0.15), linkedMeasurementIds: [id] },
      ];
    },
  },
  {
    id: "asm-colpad",
    name: "Column Pad",
    icon: "⏹️",
    color: "#8b5cf6",
    inputs: [
      { key: "side", label: "Side (m)", type: "number", placeholder: "e.g. 1.2" },
      { key: "depth", label: "Depth (m)", type: "number", placeholder: "e.g. 1.5" },
    ],
    generateBoq: (id: string, inputs: any) => {
      const s = parseFloat(inputs.side || "0");
      const d = parseFloat(inputs.depth || "0");
      return [
        { desc: "Excavation", unit: "m³", rate: 12.5, qtyOverride: s * s * d, linkedMeasurementIds: [id] },
        { desc: "PCC Pad", unit: "m³", rate: 85.0, qtyOverride: s * s * 0.1, linkedMeasurementIds: [id] },
        { desc: "RCC Footing", unit: "m³", rate: 140.0, qtyOverride: (s-0.2) * (s-0.2) * 0.4, linkedMeasurementIds: [id] },
      ];
    },
  },
  {
    id: "asm-brickwall",
    name: "Brick Wall",
    icon: "🧱",
    color: "#ef4444",
    inputs: [
      { key: "length", label: "Length (m)", type: "number", placeholder: "e.g. 5" },
      { key: "height", label: "Height (m)", type: "number", placeholder: "e.g. 3" },
      { key: "thick", label: "Thickness (m)", type: "number", placeholder: "e.g. 0.23" },
    ],
    generateBoq: (id: string, inputs: any) => {
      const l = parseFloat(inputs.length || "0");
      const h = parseFloat(inputs.height || "0");
      const t = parseFloat(inputs.thick || "0");
      return [
        { desc: "Brick Masonry", unit: "m³", rate: 110.0, qtyOverride: l * h * t, linkedMeasurementIds: [id] },
        { desc: "Plastering (2 sides)", unit: "m²", rate: 15.0, qtyOverride: l * h * 2, linkedMeasurementIds: [id] },
      ];
    },
  },
  {
    id: "asm-slab",
    name: "RCC Slab",
    icon: "⬜",
    color: "#06b6d4",
    inputs: [
      { key: "area", label: "Area (m²)", type: "number", placeholder: "e.g. 20" },
      { key: "thick", label: "Thickness (m)", type: "number", placeholder: "e.g. 0.15" },
    ],
    generateBoq: (id: string, inputs: any) => {
      const a = parseFloat(inputs.area || "0");
      const t = parseFloat(inputs.thick || "0");
      return [
        { desc: "RCC for Slab", unit: "m³", rate: 150.0, qtyOverride: a * t, linkedMeasurementIds: [id] },
        { desc: "Steel Reinforcement", unit: "kg", rate: 1.2, qtyOverride: a * t * 100, linkedMeasurementIds: [id] },
        { desc: "Formwork", unit: "m²", rate: 10.0, qtyOverride: a, linkedMeasurementIds: [id] },
      ];
    },
  },
  {
    id: "asm-road",
    name: "Road Section",
    icon: "🛣️",
    color: "#64748b",
    inputs: [
      { key: "length", label: "Length (m)", type: "number", placeholder: "e.g. 100" },
      { key: "width", label: "Width (m)", type: "number", placeholder: "e.g. 7" },
    ],
    generateBoq: (id: string, inputs: any) => {
      const l = parseFloat(inputs.length || "0");
      const w = parseFloat(inputs.width || "0");
      const area = l * w;
      return [
        { desc: "Subgrade Preparation", unit: "m²", rate: 5.5, qtyOverride: area, linkedMeasurementIds: [id] },
        { desc: "Subbase Course", unit: "m³", rate: 35.0, qtyOverride: area * 0.2, linkedMeasurementIds: [id] },
        { desc: "Asphalt Wearing Course", unit: "m²", rate: 25.0, qtyOverride: area * 0.05, linkedMeasurementIds: [id] },
      ];
    },
  },
];
type Mode = "select" | "pan" | "line" | "area" | "scale";
export default function Takeoff() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<any>(null);
  const { currentUnit, setCurrentUnit } = useGlobalSettings();
  const {
    boqItems,
    measurements,
    setMeasurements,
    addMeasurement,
    removeMeasurement,
    scalePxPerUnit,
    setScalePxPerUnit,
    unitName,
    setUnitName,
    addBoqItems,
  } = useTakeoff();
  useEffect(() => {
    const isGlobalMetric = currentUnit === "Metric";
    const isLocalMetric = ["m", "cm", "mm"].includes(unitName);
    if (isGlobalMetric && !isLocalMetric) {
      const factor = convertLength(1, unitName, "m");
      if (factor) {
        setScalePxPerUnit(scalePxPerUnit / factor);
        setUnitName("m");
      }
    } else if (!isGlobalMetric && isLocalMetric) {
      const factor = convertLength(1, unitName, "ft");
      if (factor) {
        setScalePxPerUnit(scalePxPerUnit / factor);
        setUnitName("ft");
      }
    }
  }, [currentUnit]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [filename, setFilename] = useState("No file loaded");
  const [mode, setMode] = useState<Mode>("select");
  const [drawingPoints, setDrawingPoints] = useState<Point[]>([]);
  const [mousePos, setMousePos] = useState<Point | null>(null);
  const [snapPoint, setSnapPoint] = useState<Point | null>(null);
  const [stageScale, setStageScale] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [isMiddleMousePanning, setIsMiddleMousePanning] = useState(false);
  /* Scale related */ const [scalePrompt, setScalePrompt] = useState<{
    visible: boolean;
    pxLen: number;
  }>({ visible: false, pxLen: 0 });
  const [scaleInputValue, setScaleInputValue] = useState("");
  const [scaleInputUnit, setScaleInputUnit] = useState("m");
  const [assemblyPrompt, setAssemblyPrompt] = useState<{
    visible: boolean;
    pos: Point;
    assemblyId: string;
    inputs: Record<string, string>;
  } | null>(null);
  const [editingMeasurementId, setEditingMeasurementId] = useState<
    string | null
  >(null);
  const [editingMeasurementName, setEditingMeasurementName] = useState("");
  const [showTutorial, setShowTutorial] = useState(false);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setIsSpacePressed(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        setIsSpacePressed(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);
  useEffect(() => {
    if (!localStorage.getItem("takeoff_tutorial_seen")) {
      setShowTutorial(true);
    }
  }, []);

  const closeTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem("takeoff_tutorial_seen", "true");
  };

  const handleLoadDemo = () => {
    setFilename("Demo Blueprint");
    const img = new Image();
    img.src = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MDAiIGhlaWdodD0iNjAwIiBzdHlsZT0iYmFja2dyb3VuZDojZmZmIj48cmVjdCB4PSIxMDAiIHk9IjEwMCIgd2lkdGg9IjYwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSIxMCIvPjxyZWN0IHg9IjQwMCIgeT0iMTAwIiB3aWR0aD0iMTAiIGhlaWdodD0iNDAwIiBmaWxsPSIjMDAwIi8+PHRleHQgeD0iMjUwIiB5PSIzMDAiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjI0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Sb29tIDE8L3RleHQ+PHRleHQgeD0iNTUwIiB5PSIzMDAiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjI0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Sb29tIDI8L3RleHQ+PGxpbmUgeDE9IjIwMCIgeTE9IjE1MCIgeDI9IjIwMCIgeTI9IjQ1MCIgc3Ryb2tlPSIjY2NjIiBzdHJva2UtZGFzaGFycmF5PSI1LDUiLz48dGV4dCB4PSIyMjAiIHk9IjI1MCIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM2NjYiPjEwbTwvdGV4dD48L3N2Zz4=";
    img.onload = () => {
      setImage(img);
      setStageScale(1);
      setStagePos({ x: 0, y: 0 });
    };
  };

  const handleRenameMeasurement = (id: string) => {
    if (!editingMeasurementName.trim()) {
      setEditingMeasurementId(null);
      return;
    }
    setMeasurements((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, name: editingMeasurementName.trim() } : m,
      ),
    );
    setEditingMeasurementId(null);
  };
  useEffect(() => {
    if (!containerRef.current) return;
    const updateSize = () => {
      setDimensions({
        width: containerRef.current!.offsetWidth,
        height: containerRef.current!.offsetHeight,
      });
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);
  const [recentBlueprints, setRecentBlueprints] = useState<{name: string, dataUrl: string, date: string}[]>([]);
  
  useEffect(() => {
    try {
      const recent = JSON.parse(localStorage.getItem("recent_blueprints") || "[]");
      setRecentBlueprints(recent);
    } catch(e) {}
  }, []);

  const saveRecentBlueprint = (name: string, dataUrl: string) => {
    try {
      const recentStr = localStorage.getItem("recent_blueprints") || "[]";
      let recent = JSON.parse(recentStr);
      recent = recent.filter((r: any) => r.name !== name);
      recent.unshift({ name, dataUrl, date: new Date().toISOString() });
      recent = recent.slice(0, 3);
      localStorage.setItem("recent_blueprints", JSON.stringify(recent));
      setRecentBlueprints(recent);
    } catch(e) {
      console.warn("Could not save to localStorage", e);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFilename(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const img = new Image();
      img.src = dataUrl;
      img.onload = () => {
        setImage(img);
        setStageScale(1);
        setStagePos({ x: 0, y: 0 });
        saveRecentBlueprint(file.name, dataUrl);
      };
    };
    reader.readAsDataURL(file);
  };

  const handleLoadRecent = (b: {name: string, dataUrl: string}) => {
    setFilename(b.name);
    const img = new Image();
    img.src = b.dataUrl;
    img.onload = () => {
      setImage(img);
      setStageScale(1);
      setStagePos({ x: 0, y: 0 });
    };
  };
  const getLogicalPos = (e: any): Point | null => {
    const stage = e.target.getStage();
    if (!stage) return null;
    const pointerPos = stage.getPointerPosition();
    if (!pointerPos) return null;
    const transform = stage.getAbsoluteTransform().copy();
    transform.invert();
    return transform.point(pointerPos);
  };
  const handleMouseDown = (e: any) => {
    if (e.evt.button === 1) {
      setIsMiddleMousePanning(true);
      return;
    }
    if (mode === "select" || mode === "pan" || isSpacePressed) return;
    const rawPos = getLogicalPos(e);
    if (!rawPos) return;

    let closest: Point | null = null;
    let minDistance = 15 / stageScale;
    const allPoints = [...drawingPoints];
    measurements.forEach(m => {
      allPoints.push(...m.points);
    });
    for (const p of allPoints) {
      const d = getDistance(rawPos, p);
      if (d < minDistance) {
        minDistance = d;
        closest = p;
      }
    }
    const pos = closest || rawPos;

    setDrawingPoints((prev) => [...prev, pos]);
  };
  const handleMouseMove = (e: any) => {
    if (mode === "select" || mode === "pan") {
      setSnapPoint(null);
      return;
    }
    const rawPos = getLogicalPos(e);
    if (!rawPos) return;

    let closest: Point | null = null;
    let minDistance = 15 / stageScale;
    const allPoints = [...drawingPoints];
    measurements.forEach(m => {
      allPoints.push(...m.points);
    });
    for (const p of allPoints) {
      const d = getDistance(rawPos, p);
      if (d < minDistance) {
        minDistance = d;
        closest = p;
      }
    }

    if (closest) {
      setSnapPoint(closest);
      setMousePos(closest);
    } else {
      setSnapPoint(null);
      setMousePos(rawPos);
    }
  };
  const handleMouseUp = (e: any) => {
    if (e.evt.button === 1) {
      setIsMiddleMousePanning(false);
    }
  };
  const handleFinishDrawing = useCallback(() => {
    if (drawingPoints.length < 2) {
      setDrawingPoints([]);
      setMousePos(null);
      return;
    }
    if (mode === "scale") {
      const len = getDistance(drawingPoints[0], drawingPoints[1]);
      setScalePrompt({ visible: true, pxLen: len });
      setMode("select");
    } else if (mode === "line") {
      const newMeasurement: Measurement = {
        id: crypto.randomUUID(),
        type: "line",
        points: [...drawingPoints],
        color: "#3b82f6",
        name: `Line ${measurements.length + 1}`,
      };
      addMeasurement(newMeasurement);
    } else if (mode === "area") {
      if (drawingPoints.length > 2) {
        const newMeasurement: Measurement = {
          id: crypto.randomUUID(),
          type: "area",
          points: [...drawingPoints],
          color: "#f97316",
          name: `Area ${measurements.length + 1}`,
        };
        addMeasurement(newMeasurement);
      }
    }
    setDrawingPoints([]);
    setMousePos(null);
  }, [drawingPoints, mode]);
  const handleWheel = (e: any) => {
    e.evt.preventDefault();
    const scaleBy = 1.1;
    const stage = e.target.getStage();
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };
    let newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    newScale = Math.max(0.1, Math.min(newScale, 10));
    setStageScale(newScale);
    setStagePos({
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    });
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const assemblyId = e.dataTransfer.getData("assemblyId");
    if (!assemblyId || !stageRef.current) return;
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const pointerPos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    const stage = stageRef.current;
    if (!stage) return;
    stage.setPointersPositions(e);
    const transform = stage.getAbsoluteTransform().copy();
    transform.invert();
    const logicalPos = transform.point(pointerPos);
    const assemblyDef = ASSEMBLIES.find((a) => a.id === assemblyId);
    if (!assemblyDef) return;
    const initialInputs: Record<string, string> = {};
    assemblyDef.inputs.forEach((inp) => (initialInputs[inp.key] = ""));
    setAssemblyPrompt({
      visible: true,
      pos: logicalPos,
      assemblyId,
      inputs: initialInputs,
    });
  };
  const handleCreateAssembly = () => {
    if (!assemblyPrompt) return;
    const asmDef = ASSEMBLIES.find((a) => a.id === assemblyPrompt.assemblyId);
    if (!asmDef) return;
    const measurementId = crypto.randomUUID();
    const meta = { ...assemblyPrompt.inputs, assemblyId: asmDef.id };
    /* Add measurement marker */ const newMeasurement: Measurement = {
      id: measurementId,
      type: "assembly",
      color: asmDef.color,
      points: [assemblyPrompt.pos],
      name: `${asmDef.name} (Dropped)`,
      metadata: meta,
    };
    addMeasurement(newMeasurement);
    /* Add sub-items to BOQ */ const boqs = asmDef.generateBoq(
      measurementId,
      assemblyPrompt.inputs,
    );
    addBoqItems(boqs);
    setAssemblyPrompt(null);
  };
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        handleFinishDrawing();
      } else if (e.key === "Escape") {
        setDrawingPoints([]);
        setMousePos(null);
        setMode("select");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleFinishDrawing]);
  return (
    <div className="flex flex-col h-full text-slate-900 p-8">
      <div className="flex-1 bg-white border border-slate-200 rounded-[24px] flex flex-col overflow-hidden relative">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-white">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            2D Takeoff Engine
          </h2>
          <div className="flex gap-2 items-center">
            <span className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[10px]">
              Scale: 1px = {(1 / scalePxPerUnit).toFixed(4)} {unitName}
            </span>
            <select
              value={
                ["m", "cm", "mm"].includes(unitName)
                  ? "metric"
                  : ["ft", "in", "yd"].includes(unitName)
                    ? "imperial"
                    : "metric"
              }
              onChange={(e) => {
                const targetSystem = e.target.value;
                const currentSystem = ["m", "cm", "mm"].includes(unitName)
                  ? "metric"
                  : ["ft", "in", "yd"].includes(unitName)
                    ? "imperial"
                    : "metric";
                if (targetSystem === currentSystem) return;
                const newUnit = targetSystem === "imperial" ? "ft" : "m";
                const factor = convertLength(1, unitName, newUnit);
                if (factor) {
                  const newScale = scalePxPerUnit / factor;
                  setScalePxPerUnit(newScale);
                  setUnitName(newUnit);
                  setCurrentUnit(
                    targetSystem === "imperial" ? "Imperial" : "Metric",
                  );
                }
              }}
              className="px-2 py-0.5 bg-white border border-slate-200 text-slate-700 text-[10px] rounded outline-none hover:border-slate-300 focus:border-blue-500 transition-colors cursor-pointer"
            >
              <option value="metric">Metric (m, m², m³)</option>
              <option value="imperial">Imperial (ft, sq.ft, cu.ft)</option>
            </select>
          </div>
        </div>
        {/* Toolbar Inner */}
        <div className="h-12 border-b border-slate-200 bg-transparent/50 flex items-center justify-between px-4 shrink-0 w-full text-xs">
          <div className="flex items-center gap-4">
            <div className="text-slate-800 font-medium truncate max-w-[200px]">
              {filename}
            </div>
            {!image && (
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs bg-white border border-slate-200 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded transition-colors" title="Upload a local image file">
                  <Upload className="w-[14px] h-[14px]" /> Upload Image Blueprint
                  <><label htmlFor="a11y-input-515" className="sr-only">Input</label>
<input id="a11y-input-515" type="file"
                    accept="image/*"
                    className="hidden rounded-full"
                    onChange={handleImageUpload}
                  /></>
                </label>
                <button onClick={handleLoadDemo}
                  className="flex items-center gap-2 cursor-pointer text-xs bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded transition-colors rounded-full active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
                  title="Load a sample blueprint to try the features"
                >
                  Try Demo
                </button>
              </div>
            )}
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-1">
              <button
                onClick={() => setMode("select")}
                className={`p-1.5 rounded border ${mode === "select" ? "bg-slate-200 border-slate-400 text-slate-800" : "border-transparent text-slate-700  hover:bg-slate-100"}`}
                title="Select"
              >
                <MousePointer2 className="w-[14px] h-[14px] rounded-full transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm" />
              </button>
              <button
                onClick={() => setMode("pan")}
                className={`p-1.5 rounded border ${mode === "pan" ? "bg-slate-200 border-slate-400 text-slate-800" : "border-transparent text-slate-700  hover:bg-slate-100"}`}
                title="Pan"
              >
                <Move className="w-[14px] h-[14px] rounded-full transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm" />
              </button>
            </div>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setMode("scale");
                  setDrawingPoints([]);
                }}
                className={`p-1.5 rounded border ${mode === "scale" ? "bg-slate-200 border-emerald-500 text-emerald-400" : "border-transparent text-slate-700  hover:bg-slate-100 hover:text-emerald-400"}`}
                title="Set Scale"
              >
                <Ruler className="w-[14px] h-[14px] rounded-full transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm" />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setStageScale((s) => s / 1.2)}
              className="p-1.5 text-slate-700 hover:text-slate-800 rounded hover:bg-slate-100 rounded-full transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
              title="Zoom Out"
            >
              <ZoomOut className="w-[14px] h-[14px]" />
            </button>
            <div className="font-mono text-slate-900 w-12 text-center text-[10px]" title="Current Zoom">
              {Math.round(stageScale * 100)}%
            </div>
            <button
              onClick={() => setStageScale((s) => s * 1.2)}
              className="p-1.5 text-slate-700 hover:text-slate-800 rounded hover:bg-slate-100 rounded-full transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
              title="Zoom In"
            >
              <ZoomIn className="w-[14px] h-[14px]" />
            </button>
          </div>
        </div>
        {/* Main Workspace */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Left Measurement Tools */}
          <div className="w-12 border-r border-slate-200 bg-transparent flex flex-col items-center py-4 gap-3 shrink-0">
            <button
              onClick={() => {
                setMode("area");
                setDrawingPoints([]);
              }}
              className={`w-8 h-8 rounded flex items-center justify-center cursor-pointer text-xs font-bold transition-colors ${mode === "area" ? "bg-blue-500/20 text-orange-400 border border-blue-600/30" : "text-slate-700  hover:text-slate-900 hover:bg-slate-100"}`}
              title="Area Takeoff"
            >
              <Square className="w-[14px] h-[14px] rounded-full transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm" />
            </button>
            <button
              onClick={() => {
                setMode("line");
                setDrawingPoints([]);
              }}
              className={`w-8 h-8 rounded flex items-center justify-center cursor-pointer text-xs font-bold transition-colors ${mode === "line" ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" : "text-slate-700  hover:text-slate-900 hover:bg-slate-100"}`}
              title="Line Takeoff"
            >
              <Activity className="w-[14px] h-[14px] rounded-full transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm" />
            </button>
          </div>
          {/* Assemblies Sidebar */}
          <div className="w-56 border-r border-slate-200 bg-transparent/50 flex flex-col shrink-0">
            <div className="h-10 border-b border-slate-200 flex items-center px-4 bg-white/30">
              <span className="text-[10px] font-semibold uppercase text-slate-700 tracking-wider flex-1">
                Smart Assemblies
              </span>
            </div>
            <div className="flex-1 p-3 space-y-3 overflow-y-auto">
              <div className="text-[10px] text-slate-700 pb-1">
                Drag and drop onto canvas:
              </div>
              {ASSEMBLIES.map((asm) => (
                <div
                  key={asm.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("assemblyId", asm.id);
                  }}
                  className="p-3 bg-white border border-slate-200 rounded cursor-grab active:cursor-grabbing hover:border-slate-400 transition-all group"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="w-6 h-6 rounded bg-white border border-slate-200 flex items-center justify-center group-hover:border-slate-400 transition-colors"
                      style={{ color: asm.color }}
                    >
                      {asm.icon}
                    </div>
                    <span
                      className="text-xs font-semibold text-slate-900 flex-1 truncate"
                      title={asm.name}
                    >
                      {asm.name}
                    </span>
                    <GripVertical className="w-3 h-3 text-slate-300 group-hover:text-slate-700 transition-colors" />
                  </div>
                  <p className="text-[9px] text-slate-700 mt-2 leading-tight">
                    Drop to generate BOQ for this assembly.
                  </p>
                </div>
              ))}
            </div>
          </div>
          {/* Canvas Area */}
          <div
            ref={containerRef}
            className="flex-1 relative bg-transparent border border-dashed border-slate-200 m-4 rounded-[16px] bg-[radial-gradient(#27272a_1px,transparent_1px)] bg-[size:20px_20px] overflow-hidden"
            tabIndex={0}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {!image && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
                <div className="flex flex-col items-center text-slate-400 mb-8 opacity-80">
                  <Layers className="w-12 h-12 mb-4" />
                  <span className="text-sm mb-4">
                    Upload a blueprint image to start
                  </span>
                  <button onClick={handleLoadDemo}
                    className="pointer-events-auto flex items-center gap-2 cursor-pointer text-sm font-bold bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 px-6 py-3 rounded-full transition-all shadow-sm hover:shadow-md active:scale-95 hover:-translate-y-0.5"
                  >
                    Try Demo Blueprint
                  </button>
                </div>
                {recentBlueprints.length > 0 && (
                  <div className="pointer-events-auto w-full max-w-sm z-10 bg-white border border-slate-200 rounded-[16px] p-4 shadow-sm opacity-90 hover:opacity-100 transition-opacity overflow-hidden">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 border-b border-slate-100 pb-2">Recent Blueprints</h3>
                    <div className="flex flex-col gap-2">
                       {recentBlueprints.map((b, i) => (
                         <button key={i} onClick={() => handleLoadRecent(b)} className="px-4 py-2 border border-slate-100 rounded text-left hover:bg-blue-50 flex justify-between items-center group transition-colors rounded-full active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm">
                           <span className="truncate flex-1 text-sm text-slate-700 group-hover:text-blue-700 font-medium">{b.name}</span>
                           <span className="text-[10px] uppercase font-bold text-slate-400 group-hover:text-blue-500">Load</span>
                         </button>
                       ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            {dimensions.width > 0 && dimensions.height > 0 && (
              <Stage
                ref={stageRef}
                width={dimensions.width}
                height={dimensions.height}
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onDragEnd={(e) => {
                  if (e.target === e.target.getStage()) {
                    setStagePos({ x: e.target.x(), y: e.target.y() });
                  }
                }}
                draggable={mode === "pan" || isSpacePressed || isMiddleMousePanning}
                scaleX={stageScale}
                scaleY={stageScale}
                x={stagePos.x}
                y={stagePos.y}
                className={
                  mode === "pan" || isSpacePressed || isMiddleMousePanning
                    ? "cursor-grab active:cursor-grabbing"
                    : mode !== "select"
                      ? "cursor-crosshair"
                      : "cursor-default"
                }
              >
                <Layer>
                  {image && <KonvaImage image={image} opacity={0.8} />}
                  {/* Render Completed Measurements */}
                  {measurements.map((m) => {
                    const flatPoints = m.points.flatMap((p) => [p.x, p.y]);
                    const isArea = m.type === "area";
                    const isAssembly = m.type === "assembly";
                    const isLinked = boqItems.some((item) =>
                      item.linkedMeasurementIds?.includes(m.id),
                    );
                    if (isAssembly) {
                      const asmDef = ASSEMBLIES.find(
                        (a) => a.id === m.metadata?.assemblyId,
                      );
                      return (
                        <Group key={m.id} x={m.points[0].x} y={m.points[0].y}>
                          <Circle
                            radius={15 / stageScale}
                            fill={m.color}
                            opacity={0.2}
                          />
                          <Circle radius={2 / stageScale} fill={m.color} />
                          {isLinked && (
                            <Circle
                              radius={18 / stageScale}
                              stroke="#3b82f6"
                              strokeWidth={2 / stageScale}
                              dash={[4 / stageScale, 4 / stageScale]}
                            />
                          )}
                          <KonvaText
                            text={asmDef?.icon || "📦"}
                            fontSize={14 / stageScale}
                            offsetX={7 / stageScale}
                            offsetY={7 / stageScale}
                          />
                          <KonvaText
                            text={m.name}
                            fontSize={10 / stageScale}
                            fill="#fff"
                            y={18 / stageScale}
                            offsetX={
                              20 / stageScale
                            } /* approximate centering */
                          />
                          {isLinked && (
                            <Group x={12 / stageScale} y={-12 / stageScale}>
                              <Circle
                                radius={5 / stageScale}
                                fill="#3b82f6"
                              />
                              <KonvaText
                                text="🔗"
                                fontSize={6 / stageScale}
                                offsetX={3 / stageScale}
                                offsetY={3 / stageScale}
                              />
                            </Group>
                          )}
                        </Group>
                      );
                    }
                    return (
                      <Group key={m.id}>
                        <Line
                          points={flatPoints}
                          stroke={m.color}
                          strokeWidth={(isLinked ? 3 : 2) / stageScale}
                          fill={isArea ? `${m.color}33` : undefined}
                          closed={isArea}
                          tension={0}
                          dash={
                            isLinked
                              ? [6 / stageScale, 4 / stageScale]
                              : undefined
                          }
                        />
                        {isLinked && m.points.length > 0 && (
                          <Group x={m.points[0].x} y={m.points[0].y}>
                            <Circle
                              radius={6 / stageScale}
                              fill="#3b82f6"
                              stroke="#18181b"
                              strokeWidth={2 / stageScale}
                            />
                            <KonvaText
                              text="🔗"
                              fontSize={8 / stageScale}
                              offsetX={4 / stageScale}
                              offsetY={4 / stageScale}
                            />
                          </Group>
                        )}
                      </Group>
                    );
                  })}
                  {drawingPoints.length > 0 && (
                    <>
                      <Line
                        points={drawingPoints.flatMap((p) => [p.x, p.y])}
                        stroke={
                          mode === "scale"
                            ? "#10b981"
                            : mode === "area"
                              ? "#f97316"
                              : "#3b82f6"
                        }
                        strokeWidth={2 / stageScale}
                      />
                      {mousePos && (
                        <Line
                          points={[
                            drawingPoints[drawingPoints.length - 1].x,
                            drawingPoints[drawingPoints.length - 1].y,
                            mousePos.x,
                            mousePos.y,
                          ]}
                          stroke={
                            mode === "scale"
                              ? "#10b981"
                              : mode === "area"
                                ? "#f97316"
                                : "#3b82f6"
                          }
                          strokeWidth={2 / stageScale}
                          dash={[5 / stageScale, 5 / stageScale]}
                        />
                      )}
                      {/* Vertex circles */}
                      {/* Snap Indicator */}
                      {snapPoint && (
                        <Circle
                          x={snapPoint.x}
                          y={snapPoint.y}
                          radius={6 / stageScale}
                          stroke="#ef4444"
                          strokeWidth={2 / stageScale}
                          fill="rgba(239, 68, 68, 0.2)"
                        />
                      )}
                      
                      {drawingPoints.map((p, i) => (
                        <Circle
                          key={i}
                          x={p.x}
                          y={p.y}
                          radius={3 / stageScale}
                          fill="#ffffff"
                          stroke="#27272a"
                          strokeWidth={1 / stageScale}
                        />
                      ))}
                    </>
                  )}
                </Layer>
              </Stage>
            )}
            {/* Scale Prompt Overlay */}
            {scalePrompt.visible && (
              <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center z-50">
                <div className="bg-white border border-slate-200 rounded-[16px] p-4 sm:p-4 sm:p-4 sm:p-6 max-w-sm w-full shadow-2xl overflow-hidden">
                  <h3 className="text-sm font-semibold mb-4 text-slate-900">
                    Set Measurement Scale
                  </h3>
                  <p className="text-xs text-slate-700 mb-4">
                    Line length on drawing is
                    <span className="font-mono text-emerald-400">
                      {scalePrompt.pxLen.toFixed(1)} px
                    </span>
                    . What is the real-world distance?
                  </p>
                  <div className="flex gap-2 mb-4">
                    <><label htmlFor="a11y-input-516" className="sr-only">e.g. 10</label>
<input id="a11y-input-516"
                      type="number" inputMode="decimal"
                      placeholder="e.g. 10"
                      value={scaleInputValue}
                      onChange={(e) => setScaleInputValue(e.target.value)}
                      className="flex-1 bg-white border border-slate-200 rounded p-2 text-xs text-slate-800 uppercase font-mono focus:outline-none focus:border-emerald-500 whitespace-nowrap rounded-full"
                    /></>
                    <select
                      value={scaleInputUnit}
                      onChange={(e) => setScaleInputUnit(e.target.value)}
                      className="w-20 bg-white border border-slate-200 rounded p-2 text-xs text-center text-slate-800 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="m">m</option>
                      <option value="cm">cm</option>
                      <option value="mm">mm</option>
                      <option value="ft">ft</option>
                      <option value="in">in</option>
                      <option value="yd">yd</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setScalePrompt({ visible: false, pxLen: 0 });
                        setMode("select");
                      }}
                      className="px-3 py-1.5 text-xs text-slate-700 hover:text-slate-800 transition-colors border border-transparent rounded-full active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        const realVal = parseFloat(scaleInputValue);
                        if (realVal > 0) {
                          setScalePxPerUnit(scalePrompt.pxLen / realVal);
                          setUnitName(scaleInputUnit || "units");
                        }
                        setScalePrompt({ visible: false, pxLen: 0 });
                        setMode("select");
                      }}
                      className="px-3 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-slate-800 rounded transition-colors rounded-full active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
                    >
                      Save Scale
                    </button>
                  </div>
                </div>
              </div>
            )}
            {/* Assembly Prompt Overlay */}
            {assemblyPrompt && (
              <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center z-50">
                <div className="bg-white border border-slate-200 rounded-[16px] p-4 sm:p-4 sm:p-4 sm:p-6 max-w-sm w-full shadow-2xl overflow-hidden">
                  {(() => {
                    const asmDef = ASSEMBLIES.find(
                      (a) => a.id === assemblyPrompt.assemblyId,
                    );
                    return (
                      <>
                        <h3 className="text-sm font-semibold mb-2 text-slate-900 flex items-center gap-2">
                          <span style={{ color: asmDef?.color }}>
                            {asmDef?.icon}
                          </span>
                          Configure Assembly
                        </h3>
                        <p className="text-xs text-slate-700 mb-5">
                          Provide dimensions for
                          <span className="font-medium text-slate-800">
                            {asmDef?.name}
                          </span>
                          to generate BOQ sub-items automatically.
                        </p>
                        <div className="flex flex-col gap-3 mb-5">
                          {asmDef?.inputs.map((inp) => (
                            <div key={inp.key}>
                              <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                                {inp.label}
                              </label>
                              <><label htmlFor="a11y-input-517" className="sr-only">Input</label>
<input id="a11y-input-517"
                                type={inp.type || "text"}
                                placeholder={inp.placeholder || ""}
                                value={assemblyPrompt.inputs[inp.key]}
                                onChange={(e) =>
                                  setAssemblyPrompt((prev) =>
                                    prev
                                      ? {
                                          ...prev,
                                          inputs: {
                                            ...prev.inputs,
                                            [inp.key]: e.target.value,
                                          },
                                        }
                                      : null,
                                  )
                                }
                                className="w-full bg-white border border-slate-200 rounded p-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 rounded-full"
                              /></>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-end gap-2 text-xs">
                          <button
                            onClick={() => setAssemblyPrompt(null)}
                            className="px-4 py-2 text-slate-700 hover:text-slate-800 transition-colors border border-transparent rounded rounded-full active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
                          >
                            Cancel
                          </button>
                          <button onClick={handleCreateAssembly}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded transition-colors rounded-full active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
                          >
                            Generate BOQ
                          </button>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            )}
            {/* Enter/Escape Helper */}
            {drawingPoints.length > 0 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-transparent/80 border border-slate-200 rounded-full px-4 py-1.5 text-[10px] text-slate-700 backdrop-blur-sm pointer-events-none flex gap-4 shadow-lg">
                <span>
                  <kbd className="bg-white px-1.5 rounded border border-slate-200 mr-1">
                    Click
                  </kbd>
                  point
                </span>
                <span>
                  <kbd className="bg-white px-1.5 rounded border border-slate-200 mr-1">
                    Enter
                  </kbd>
                  finish
                </span>
                <span>
                  <kbd className="bg-white px-1.5 rounded border border-slate-200 mr-1">
                    Esc
                  </kbd>
                  cancel
                </span>
              </div>
            )}
          </div>
          {/* Right Panel */}
          <div className="w-64 border-l border-slate-200 bg-transparent/50 flex flex-col shrink-0">
            <div className="h-10 border-b border-slate-200 flex items-center px-4 bg-white/30">
              <span className="text-[10px] font-semibold uppercase text-slate-700 tracking-wider flex-1">
                Takeoffs
              </span>
              <span className="text-[10px] text-blue-500 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">
                {measurements.length}
              </span>
            </div>
            <div className="flex-1 p-3 space-y-2 overflow-y-auto">
              {measurements.length === 0 && (
                <div className="text-[10px] text-center text-slate-700 mt-8 p-4 border border-dashed border-slate-200 rounded">
                  No takeoffs recorded.
                  <br />
                  Set scale, then draw lines or drop assemblies.
                </div>
              )}
              {measurements.map((m) => {
                let primaryStr = "N/A",
                  secondaryStr = null;
                if (m.type === "area" || m.type === "line") {
                  const numVal =
                    m.type === "area"
                      ? calculateArea(m.points, scalePxPerUnit)
                      : calculateLength(m.points, scalePxPerUnit);
                  const formatted = formatDualMeasurement(
                    numVal,
                    unitName,
                    m.type,
                  );
                  primaryStr = formatted.primary;
                  secondaryStr = formatted.secondary;
                }
                const linkedBoqs = boqItems.filter((item) =>
                  item.linkedMeasurementIds?.includes(m.id),
                );
                return (
                  <div
                    key={m.id}
                    className="p-2 bg-white border border-slate-200 rounded relative overflow-hidden group flex flex-col gap-1.5"
                  >
                    <div
                      className="absolute top-0 left-0 h-full w-1"
                      style={{ backgroundColor: m.color }}
                    ></div>
                    <div className="pl-2 flex justify-between items-start gap-2 pr-2 pt-1">
                      <div className="flex gap-1.5 items-center min-w-0 flex-1 mt-1">
                        {m.type === "line" && (
                          <Activity
                            className="w-[14px] h-[14px] shrink-0"
                            style={{ color: m.color }}
                          />
                        )}
                        {m.type === "area" && (
                          <Square
                            className="w-[14px] h-[14px] shrink-0"
                            style={{ color: m.color }}
                          />
                        )}
                        {m.type === "assembly" && (
                          <Layers
                            className="w-[14px] h-[14px] shrink-0"
                            style={{ color: m.color }}
                          />
                        )}
                        {editingMeasurementId === m.id ? (
                          <><label htmlFor="a11y-input-518" className="sr-only">Input</label>
<input id="a11y-input-518"
                            type="text"
                            value={editingMeasurementName}
                            onChange={(e) =>
                              setEditingMeasurementName(e.target.value)
                            }
                            onBlur={() => handleRenameMeasurement(m.id)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter")
                                handleRenameMeasurement(m.id);
                              if (e.key === "Escape")
                                setEditingMeasurementId(null);
                            }}
                            className="bg-white border border-blue-500 text-xs text-slate-800 rounded px-1.5 py-0.5 outline-none w-full min-w-0 rounded-full"
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                          /></>
                        ) : (
                          <span
                            className="text-xs font-medium text-slate-800 truncate cursor-text hover:text-blue-400 focus:text-blue-400 flex-1 outline-none"
                            title="Click to rename"
                            onClick={() => {
                              setEditingMeasurementName(m.name);
                              setEditingMeasurementId(m.id);
                            }}
                          >
                            {m.name}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-0.5 shrink-0 mt-1">
                        <span
                          className="text-[10px] font-mono font-medium bg-white px-1.5 py-0.5 rounded border border-slate-200"
                          style={{ color: m.color }}
                        >
                          {primaryStr}
                        </span>
                        {secondaryStr && (
                          <span className="text-[9px] font-mono text-slate-700">
                            ({secondaryStr})
                          </span>
                        )}
                      </div>
                    </div>
                    {linkedBoqs.length > 0 ? (
                      <div className="pl-2 flex flex-col gap-1 mt-1">
                        <span className="text-[9px] text-slate-700 font-medium uppercase tracking-wider">
                          Linked To:
                        </span>
                        {linkedBoqs.map((item) => (
                          <div
                            key={item.id}
                            className="text-[10px] text-blue-400 font-mono truncate leading-tight"
                          >
                            {item.id} - {item.desc}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="pl-2 mt-1">
                        <span className="text-[9px] text-slate-700 italic">
                          Unlinked
                        </span>
                      </div>
                    )}
                    <div className="pl-2 flex justify-between items-center mt-1 pt-1 border-t border-slate-200">
                      <span className="text-[9px] text-slate-700 uppercase">
                        {m.type}
                      </span>
                      <button
                        onClick={() => removeMeasurement(m.id)}
                        className="text-slate-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      
      {showTutorial && (
        <div className="absolute inset-0 bg-[#F5F5F7] backdrop-blur-sm flex items-center justify-center z-[100] p-4 font-sans">
          <div className="bg-white border border-slate-200 rounded-[24px] max-w-lg w-full shadow-2xl p-4 sm:p-4 sm:p-4 sm:p-6 overflow-y-auto max-h-[90vh] relative overflow-hidden">
            <button onClick={closeTutorial} className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-100 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm">
              <X className="w-5 h-5"/>
            </button>
            <h2 className="text-xl font-bold text-slate-900 mb-6">Welcome to 2D Takeoff Engine</h2>
            
            <div className="space-y-6 mb-8">
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0 border border-blue-100">1</div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">Upload your blueprint image</h4>
                  <p className="text-sm text-slate-600">Add any floor plan (JPG, PNG, PDF exported as image) or try the demo.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0 border border-emerald-100">2</div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">Set the scale</h4>
                  <p className="text-sm text-slate-600">Click the ruler tool, draw a line over a known dimension, and set its real-world length.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0 border border-blue-100">3</div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">Measure and extract</h4>
                  <p className="text-sm text-slate-600">Draw lines/areas to extract material quantities or drop Smart Assemblies onto the canvas.</p>
                </div>
              </div>
            </div>

            <details className="mb-6 group">
               <summary className="text-sm cursor-pointer font-medium text-blue-600 hover:text-blue-700 list-none flex items-center gap-2 p-3 bg-slate-50 rounded-[24px] border border-slate-200 shadow-sm text-slate-800 rounded-[16px] border border-slate-200 overflow-hidden">
                 ▶ Watch Video Tutorial
               </summary>
               <div className="mt-3 aspect-video bg-slate-100 rounded-[16px] overflow-hidden border border-slate-200">
                 <iframe width="100%" height="100%" src="https://www.youtube.com/embed/dQw4w9WgXcQ" title="Video Tutorial" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="border-0"></iframe>
               </div>
            </details>

            <button onClick={closeTutorial} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full transition-colors shadow-sm active:scale-95 hover:-translate-y-0.5">
              Get Started
            </button>
          </div>
        </div>
      )}
      
      <CalculationHistory
        calculatorId="takeoff"
        currentInputs={{}}
        currentResults={{}}
        onRestore={() => {}}
      />
    </div>
  );
}
