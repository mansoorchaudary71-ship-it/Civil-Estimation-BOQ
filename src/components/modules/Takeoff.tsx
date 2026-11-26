import { Button } from '../ui/Button';
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
import { useTakeoff, SAMPLE_BOQ } from "../../../src/context/TakeoffContext";
import { getRates } from "../../lib/rates";
import { analyseMix, MIXES } from "../../lib/rateAnalysis";
import { generatePDFReport, generateExcelReport, getMappedQty } from "../../utils/reports";
import toast from "react-hot-toast";

/**
 * Assembly rates priced from the dated PK rate table (2026-11-12) via the
 * CPWD rate-analysis engine — material + 1% water + 15% CPOH, labour
 * excluded, so verify before tendering. Steel comes straight from rates.ts
 * (270 PKR/kg). Excavation / formwork / road-course rates have NO source in
 * rates.ts, so the old example values are kept and labelled as examples in
 * the export bar — they are not market rates.
 */
const PK_TABLE = getRates("PK");
const PK_IN = {
  cementPerBag: PK_TABLE.rates.cementPerBag ?? 1450,
  sandPerCft: PK_TABLE.rates.sandPerCft ?? 90,
  crushPerCft: PK_TABLE.rates.crushPerCft ?? 90,
  steelPerKg: PK_TABLE.rates.steelPerKg ?? 270,
  labour: 0,
  equipment: 0,
};
const PCC148_RATE = Math.round(analyseMix(MIXES.find((m) => m.id === "pcc148")!, PK_IN).finalRate);
const RCC124_RATE = Math.round(analyseMix(MIXES.find((m) => m.id === "rcc124")!, { ...PK_IN, steelKgPerM3: 100 }).finalRate);
const BRICKWORK_RATE = Math.round(
  analyseMix(MIXES.find((m) => m.id === "brickwork14")!, PK_IN).finalRate
  + 500 * ((PK_TABLE.rates.bricksPer1000 ?? 23355) / 1000), // ~500 bricks per m³
);
const PLASTER_RATE = Math.round(analyseMix(MIXES.find((m) => m.id === "plaster14")!, PK_IN).finalRate / 10);
const STEEL_RATE = PK_TABLE.rates.steelPerKg ?? 270;

/** Step 5: safe parse for the `recent_blueprints` localStorage value.
 *  The old code did a bare JSON.parse and handed the result straight to
 *  state — a corrupt value (or a non-array, e.g. a string) crashed the
 *  Recent Blueprints list at render time (.map on a non-array). Only a
 *  validated array of {name, dataUrl, date} entries is ever accepted;
 *  anything else loads as an empty list. */
export function parseRecentBlueprints(
  raw: string | null,
): { name: string; dataUrl: string; date: string }[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (b): b is { name: string; dataUrl: string; date: string } =>
        !!b &&
        typeof b === "object" &&
        typeof (b as { name?: unknown }).name === "string" &&
        typeof (b as { dataUrl?: unknown }).dataUrl === "string",
    );
  } catch {
    return [];
  }
}

const ASSEMBLIES = [
  {
    id: "asm-foundation",
    name: "Foundation Strip",
    icon: "🏗️",
    color: "rgb(242, 164, 19)",
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
        { desc: "Excavation", unit: "m³", rate: 12.5, qtyOverride: vol, isManualOverride: true, linkedMeasurementIds: [id], status: "measured" as const },
        { desc: "PCC Base", unit: "m³", rate: PCC148_RATE, qtyOverride: l * w * 0.15, isManualOverride: true, linkedMeasurementIds: [id], status: "measured" as const },
        { desc: "RCC Foundation", unit: "m³", rate: RCC124_RATE, qtyOverride: l * (w-0.2) * (d-0.15), isManualOverride: true, linkedMeasurementIds: [id], status: "measured" as const },
      ];
    },
  },
  {
    id: "asm-colpad",
    name: "Column Pad",
    icon: "⏹️",
    color: "rgb(242, 164, 19)",
    inputs: [
      { key: "side", label: "Side (m)", type: "number", placeholder: "e.g. 1.2" },
      { key: "depth", label: "Depth (m)", type: "number", placeholder: "e.g. 1.5" },
      { key: "rccDepth", label: "RCC Depth (m)", type: "number", placeholder: "e.g. 0.4" },
    ],
    generateBoq: (id: string, inputs: any) => {
      const s = parseFloat(inputs.side || "0");
      const d = parseFloat(inputs.depth || "0");
      const rd = parseFloat(inputs.rccDepth || "0.4");
      return [
        { desc: "Excavation", unit: "m³", rate: 12.5, qtyOverride: s * s * d, isManualOverride: true, linkedMeasurementIds: [id], status: "measured" as const },
        { desc: "PCC Pad", unit: "m³", rate: PCC148_RATE, qtyOverride: s * s * 0.1, isManualOverride: true, linkedMeasurementIds: [id], status: "measured" as const },
        { desc: "RCC Footing", unit: "m³", rate: RCC124_RATE, qtyOverride: (s-0.2) * (s-0.2) * rd, isManualOverride: true, linkedMeasurementIds: [id], status: "measured" as const },
      ];
    },
  },
  {
    id: "asm-brickwall",
    name: "Brick Wall",
    icon: "🧱",
    color: "rgb(176, 112, 6)",
    inputs: [
      { key: "length", label: "Length (m)", type: "number", placeholder: "e.g. 5" },
      { key: "height", label: "Height (m)", type: "number", placeholder: "e.g. 3" },
      { key: "thick", label: "Thickness (m)", type: "number", placeholder: "e.g. 0.23" },
      { key: "sides", label: "Plaster sides (1 or 2)", type: "number", placeholder: "e.g. 2" },
    ],
    generateBoq: (id: string, inputs: any) => {
      const l = parseFloat(inputs.length || "0");
      const h = parseFloat(inputs.height || "0");
      const t = parseFloat(inputs.thick || "0");
      const sides = parseFloat(inputs.sides || "2");
      return [
        { desc: "Brick Masonry", unit: "m³", rate: BRICKWORK_RATE, qtyOverride: l * h * t, isManualOverride: true, linkedMeasurementIds: [id], status: "measured" as const },
        { desc: `Plastering (${sides} side${sides === 1 ? "" : "s"})`, unit: "m²", rate: PLASTER_RATE, qtyOverride: l * h * sides, isManualOverride: true, linkedMeasurementIds: [id], status: "measured" as const },
      ];
    },
  },
  {
    id: "asm-slab",
    name: "RCC Slab",
    icon: "⬜",
    color: "rgb(15, 118, 110)",
    inputs: [
      { key: "area", label: "Area (m²)", type: "number", placeholder: "e.g. 20" },
      { key: "thick", label: "Thickness (m)", type: "number", placeholder: "e.g. 0.15" },
      { key: "steelKgM3", label: "Steel (kg/m³, 80–120)", type: "number", placeholder: "e.g. 100" },
    ],
    generateBoq: (id: string, inputs: any) => {
      const a = parseFloat(inputs.area || "0");
      const t = parseFloat(inputs.thick || "0");
      const steelKg = parseFloat(inputs.steelKgM3 || "100");
      return [
        { desc: "RCC for Slab", unit: "m³", rate: RCC124_RATE, qtyOverride: a * t, isManualOverride: true, linkedMeasurementIds: [id], status: "measured" as const },
        { desc: "Steel Reinforcement", unit: "kg", rate: STEEL_RATE, qtyOverride: a * t * steelKg, isManualOverride: true, linkedMeasurementIds: [id], status: "measured" as const },
        { desc: "Formwork", unit: "m²", rate: 10.0, qtyOverride: a, isManualOverride: true, linkedMeasurementIds: [id], status: "measured" as const },
      ];
    },
  },
  {
    id: "asm-road",
    name: "Road Section",
    icon: "🛣️",
    color: "rgb(107, 104, 98)",
    inputs: [
      { key: "length", label: "Length (m)", type: "number", placeholder: "e.g. 100" },
      { key: "width", label: "Width (m)", type: "number", placeholder: "e.g. 7" },
    ],
    generateBoq: (id: string, inputs: any) => {
      const l = parseFloat(inputs.length || "0");
      const w = parseFloat(inputs.width || "0");
      const area = l * w;
      return [
        { desc: "Subgrade Preparation", unit: "m²", rate: 5.5, qtyOverride: area, isManualOverride: true, linkedMeasurementIds: [id], status: "measured" as const },
        { desc: "Subbase Course", unit: "m³", rate: 35.0, qtyOverride: area * 0.2, isManualOverride: true, linkedMeasurementIds: [id], status: "measured" as const },
        { desc: "Asphalt Wearing Course", unit: "m³", rate: 25.0, qtyOverride: area * 0.05, isManualOverride: true, linkedMeasurementIds: [id], status: "measured" as const }, // qty is a volume (area x 0.05 m) — was wrongly labelled m²
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
    setBoqItems,
    addMeasurement,
    removeMeasurement,
    scalePxPerUnit,
    setScalePxPerUnit,
    unitName,
    setUnitName,
    addBoqItems,
    undo,
    redo,
    canUndo,
    canRedo,
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

  // Esc closes the welcome modal (the App-level Esc handler skips
  // navigation while a [role="dialog"] is open, so this is the only Esc path).
  useEffect(() => {
    if (!showTutorial) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeTutorial();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showTutorial]);

  const handleLoadDemo = () => {
    // Clearly-labelled SAMPLE — the page loads with no blueprint ("No file
    // loaded" empty state); this is opt-in, and Clear blueprint below
    // removes it again (Step 5).
    setFilename("Sample Blueprint (demo — not a real plan)");
    const img = new Image();
    img.src = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MDAiIGhlaWdodD0iNjAwIiBzdHlsZT0iYmFja2dyb3VuZDojZmZmIj48cmVjdCB4PSIxMDAiIHk9IjEwMCIgd2lkdGg9IjYwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSIxMCIvPjxyZWN0IHg9IjQwMCIgeT0iMTAwIiB3aWR0aD0iMTAiIGhlaWdodD0iNDAwIiBmaWxsPSIjMDAwIi8+PHRleHQgeD0iMjUwIiB5PSIzMDAiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjI0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Sb29tIDE8L3RleHQ+PHRleHQgeD0iNTUwIiB5PSIzMDAiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjI0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Sb29tIDI8L3RleHQ+PGxpbmUgeDE9IjIwMCIgeTE9IjE1MCIgeDI9IjIwMCIgeTI9IjQ1MCIgc3Ryb2tlPSIjY2NjIiBzdHJva2UtZGFzaGFycmF5PSI1LDUiLz48dGV4dCB4PSIyMjAiIHk9IjI1MCIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM2NjYiPjEwbTwvdGV4dD48L3N2Zz4=";
    img.onload = () => {
      setImage(img);
      setStageScale(1);
      setStagePos({ x: 0, y: 0 });
    };
  };

  // Step 5: clear the loaded blueprint (upload or sample) back to the
  // neutral empty state — image, measurements, BOQ lines and scale all
  // reset, so a stale scale can never leak into the next blueprint.
  const handleClearBlueprint = () => {
    setImage(null);
    setFilename("No file loaded");
    setMeasurements([]);
    setBoqItems([]);
    setStageScale(1);
    setStagePos({ x: 0, y: 0 });
    setScalePxPerUnit(1);
    setUnitName("m");
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
    setRecentBlueprints(parseRecentBlueprints(localStorage.getItem("recent_blueprints")));
  }, []);

  const saveRecentBlueprint = (name: string, dataUrl: string) => {
    try {
      let recent = parseRecentBlueprints(localStorage.getItem("recent_blueprints"));
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
        color: "rgb(242, 164, 19)",
        name: `Line ${measurements.length + 1}`,
      };
      addMeasurement(newMeasurement);
    } else if (mode === "area") {
      if (drawingPoints.length > 2) {
        const newMeasurement: Measurement = {
          id: crypto.randomUUID(),
          type: "area",
          points: [...drawingPoints],
          color: "rgb(242, 164, 19)",
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
  // Keyboard equivalent of dragging an assembly onto the canvas: Enter/Space
  // on a focused assembly card opens its Configure prompt placed at the
  // centre of the visible canvas (HTML5 drag-and-drop is mouse-only, and the
  // cards were plain <div>s with no focusable element at all).
  const handleAssemblyKeyActivate = (assemblyId: string) => {
    const assemblyDef = ASSEMBLIES.find((a) => a.id === assemblyId);
    if (!assemblyDef) return;
    const initialInputs: Record<string, string> = {};
    assemblyDef.inputs.forEach((inp) => (initialInputs[inp.key] = ""));
    const cx = (dimensions.width / 2 - stagePos.x) / stageScale;
    const cy = (dimensions.height / 2 - stagePos.y) / stageScale;
    setAssemblyPrompt({
      visible: true,
      pos: { x: cx, y: cy },
      assemblyId,
      inputs: initialInputs,
    });
  };
  const handleCreateAssembly = () => {
    if (!assemblyPrompt) return;
    const asmDef = ASSEMBLIES.find((a) => a.id === assemblyPrompt.assemblyId);
    if (!asmDef) return;
    // Validate every input: dimensions must be present and > 0, and the
    // RCC footing offsets must stay positive (w - 0.2, d - 0.15): the 0.2 m
    // is the column/footing allowance and 0.15 m is the PCC bed, so a strip
    // narrower than 0.2 m or shallower than 0.15 m has no RCC volume at all.
    for (const inp of asmDef.inputs) {
      const v = parseFloat(assemblyPrompt.inputs[inp.key] ?? "");
      if (!isFinite(v) || v <= 0) { toast.error(`Enter a valid ${inp.label} (must be over 0).`); return; }
    }
    if (asmDef.id === "asm-foundation") {
      const w = parseFloat(assemblyPrompt.inputs.width);
      const d = parseFloat(assemblyPrompt.inputs.depth);
      if (w <= 0.2) { toast.error("Foundation width must be over 0.2 m — the RCC volume is (w − 0.2 m column allowance) × (d − 0.15 m PCC bed)."); return; }
      if (d <= 0.15) { toast.error("Foundation depth must be over 0.15 m — the 0.15 m PCC bed sits below the RCC."); return; }
    }
    if (asmDef.id === "asm-colpad") {
      const s = parseFloat(assemblyPrompt.inputs.side);
      if (s <= 0.2) { toast.error("Column pad side must be over 0.2 m (RCC is (side − 0.2 m)² × depth)."); return; }
    }
    if (asmDef.id === "asm-brickwall") {
      const sides = parseFloat(assemblyPrompt.inputs.sides);
      if (sides !== 1 && sides !== 2) { toast.error("Plaster sides must be 1 or 2."); return; }
    }
    if (asmDef.id === "asm-slab") {
      const steelKg = parseFloat(assemblyPrompt.inputs.steelKgM3);
      if (steelKg < 80 || steelKg > 120) { toast.error("Slab steel must be 80–120 kg/m³."); return; }
    }
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
    <div className="flex flex-col h-full text-txt-primary p-3 sm:p-6 lg:p-8">
      <div className="flex-1 bg-surface-default border border-ui-borderSubtle rounded-2xl flex flex-col overflow-hidden relative">
        {/* Header */}
        <div className="px-6 py-4 border-b border-ui-borderSubtle flex flex-wrap gap-2 justify-between items-center bg-surface-default">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-txt-tertiary">
            2D Takeoff Engine
          </h2>
          <div className="flex gap-2 items-center">
            <span className="px-2 py-0.5 rounded bg-accent-500/10 border border-accent-500/20 text-accent-800 text-xs">
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
              className="px-2 py-0.5 bg-surface-default border border-ui-borderSubtle text-txt-secondary text-xs rounded outline-none hover:border-ui-borderDefault focus:border-ink transition-colors cursor-pointer"
            >
              <option value="metric">Metric (m, m², m³)</option>
              <option value="imperial">Imperial (ft, sq.ft, cu.ft)</option>
            </select>
          </div>
        </div>
        {/* Toolbar Inner */}
        <div className="min-h-12 h-auto py-2 border-b border-ui-borderSubtle bg-transparent/50 flex flex-wrap gap-2 items-center justify-between px-4 shrink-0 w-full text-xs">
          <div className="flex flex-wrap items-center gap-4 min-w-0">
            <div className="text-txt-primary font-medium truncate max-w-[200px]">
              {filename}
            </div>
            {!image && (
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs bg-surface-default border border-ui-borderSubtle hover:bg-surface-active text-txt-secondary px-3 py-1.5 rounded transition-colors" title="Upload a local image file">
                  <Upload className="w-[14px] h-[14px]" /> Upload Image Blueprint
                  <><label htmlFor="a11y-input-515" className="sr-only">Input</label>
<input id="a11y-input-515" type="file"
                    accept="image/*"
                    className="hidden rounded-full"
                    onChange={handleImageUpload}
                  /></>
                </label>
                <Button onClick={handleLoadDemo}
                  className="flex items-center gap-2 cursor-pointer text-xs bg-accent-50 border border-accent-200 hover:bg-accent-100 text-accent-800 px-3 py-1.5 rounded transition-colors rounded-full active:scale-95 hover:-translate-y-0.5 hover:shadow-brand-lg shadow-brand-sm"
                  title="Load a sample blueprint to try the features"
                >
                  Try Sample
                </Button>
              </div>
            )}
            {image && (
              <Button onClick={handleClearBlueprint}
                className="flex items-center gap-2 cursor-pointer text-xs bg-surface-default border border-ui-borderSubtle hover:bg-surface-active text-txt-secondary px-3 py-1.5 rounded transition-colors"
                title="Remove the loaded blueprint and return to the empty state"
              >
                <Trash2 className="w-[14px] h-[14px]" /> Clear blueprint
              </Button>
            )}
            <div className="h-4 w-px bg-surface-active" />
            <div className="flex items-center gap-1">
              <Button
                onClick={() => setMode("select")}
                className={`p-1.5 rounded border ${mode === "select" ? "bg-surface-active border-ui-borderStrong text-txt-primary" : "border-transparent text-txt-secondary  hover:bg-surface-hover"}`}
                title="Select"
              >
                <MousePointer2 className="w-[14px] h-[14px] rounded-full transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-brand-lg shadow-brand-sm" />
              </Button>
              <Button
                onClick={() => setMode("pan")}
                className={`p-1.5 rounded border ${mode === "pan" ? "bg-surface-active border-ui-borderStrong text-txt-primary" : "border-transparent text-txt-secondary  hover:bg-surface-hover"}`}
                title="Pan"
              >
                <Move className="w-[14px] h-[14px] rounded-full transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-brand-lg shadow-brand-sm" />
              </Button>
            </div>
            <div className="h-4 w-px bg-surface-active" />
            <div className="flex items-center gap-1">
              <Button
                onClick={() => {
                  setMode("scale");
                  setDrawingPoints([]);
                }}
                className={`p-1.5 rounded border ${mode === "scale" ? "bg-surface-active border-ui-successText text-ui-successText" : "border-transparent text-txt-secondary  hover:bg-surface-hover hover:text-ui-successText"}`}
                title="Set Scale"
              >
                <Ruler className="w-[14px] h-[14px] rounded-full transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-brand-lg shadow-brand-sm" />
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setStageScale((s) => s / 1.2)}
              className="p-1.5 text-txt-secondary hover:text-txt-primary rounded hover:bg-surface-hover rounded-full transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-brand-lg shadow-brand-sm"
              title="Zoom Out"
            >
              <ZoomOut className="w-[14px] h-[14px]" />
            </Button>
            <div className="font-mono text-txt-primary w-12 text-center text-xs" title="Current Zoom">
              {Math.round(stageScale * 100)}%
            </div>
            <Button
              onClick={() => setStageScale((s) => s * 1.2)}
              className="p-1.5 text-txt-secondary hover:text-txt-primary rounded hover:bg-surface-hover rounded-full transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-brand-lg shadow-brand-sm"
              title="Zoom In"
            >
              <ZoomIn className="w-[14px] h-[14px]" />
            </Button>
          </div>
        </div>
        {/* Main Workspace */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden relative">
          {/* Left Measurement Tools */}
          <div className="w-full lg:w-12 border-b lg:border-b-0 lg:border-r border-ui-borderSubtle bg-transparent flex flex-row lg:flex-col items-center py-2 lg:py-4 gap-3 shrink-0">
            <Button
              onClick={() => {
                setMode("area");
                setDrawingPoints([]);
              }}
              className={`w-8 h-8 rounded flex items-center justify-center cursor-pointer text-xs font-bold transition-colors ${mode === "area" ? "bg-accent-500/20 text-accent-400 border border-accent-600/30" : "text-txt-secondary  hover:text-txt-primary hover:bg-surface-hover"}`}
              title="Area Takeoff"
            >
              <Square className="w-[14px] h-[14px] rounded-full transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-brand-lg shadow-brand-sm" />
            </Button>
            <Button
              onClick={() => {
                setMode("line");
                setDrawingPoints([]);
              }}
              className={`w-8 h-8 rounded flex items-center justify-center cursor-pointer text-xs font-bold transition-colors ${mode === "line" ? "bg-accent-500/20 text-accent-400 border border-accent-500/30" : "text-txt-secondary  hover:text-txt-primary hover:bg-surface-hover"}`}
              title="Line Takeoff"
            >
              <Activity className="w-[14px] h-[14px] rounded-full transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-brand-lg shadow-brand-sm" />
            </Button>
          </div>
          {/* Assemblies Sidebar */}
          <div className="w-full lg:w-56 border-b lg:border-b-0 lg:border-r border-ui-borderSubtle bg-transparent/50 flex flex-col shrink-0 max-h-[260px] lg:max-h-none">
            <div className="h-10 border-b border-ui-borderSubtle flex items-center px-4 bg-surface-default/30">
              <span className="text-xs font-semibold uppercase text-txt-secondary tracking-wider flex-1">
                Smart Assemblies
              </span>
            </div>
            <div className="flex-1 p-3 space-y-3 overflow-y-auto">
              <div className="text-xs text-txt-secondary pb-1">
                Drag and drop onto canvas:
              </div>
              {ASSEMBLIES.map((asm) => (
                <div
                  key={asm.id}
                  draggable
                  tabIndex={0}
                  role="button"
                  aria-label={`${asm.name}: drag onto the canvas, or press Enter to place it at the canvas centre`}
                  onDragStart={(e) => {
                    e.dataTransfer.setData("assemblyId", asm.id);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleAssemblyKeyActivate(asm.id);
                    }
                  }}
                  className="p-3 bg-surface-default border border-ui-borderSubtle rounded cursor-grab active:cursor-grabbing hover:border-ui-borderStrong focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 transition-all group"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="w-6 h-6 rounded bg-surface-default border border-ui-borderSubtle flex items-center justify-center group-hover:border-ui-borderStrong transition-colors"
                      style={{ color: asm.color }}
                    >
                      {asm.icon}
                    </div>
                    <span
                      className="text-xs font-semibold text-txt-primary flex-1 truncate"
                      title={asm.name}
                    >
                      {asm.name}
                    </span>
                    <GripVertical className="w-3 h-3 text-txt-tertiary group-hover:text-txt-secondary transition-colors" />
                  </div>
                  <p className="text-xs text-txt-secondary mt-2 leading-tight">
                    Drop to generate BOQ for this assembly.
                  </p>
                </div>
              ))}
            </div>
          </div>
          {/* Canvas Area */}
          <div
            ref={containerRef}
            className="relative bg-transparent border border-dashed border-ui-borderSubtle m-4 rounded-2xl bg-[radial-gradient(#1F1D1A_1px,transparent_1px)] bg-[size:20px_20px] overflow-hidden shrink-0 h-[380px] lg:h-auto lg:flex-1"
            tabIndex={0}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {!image && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
                <div className="flex flex-col items-center text-txt-tertiary mb-8 opacity-80">
                  <Layers className="w-12 h-12 mb-4" />
                  <span className="text-sm mb-4">
                    Upload a blueprint image to start
                  </span>
                  <Button onClick={handleLoadDemo}
                    className="pointer-events-auto flex items-center gap-2 cursor-pointer text-sm font-bold bg-accent-50 border border-accent-200 hover:bg-accent-100 text-accent-800 px-6 py-3 rounded-full transition-all shadow-brand-sm hover:shadow-brand-md active:scale-95 hover:-translate-y-0.5"
                  >
                    Try Sample Blueprint
                  </Button>
                </div>
                {recentBlueprints.length > 0 && (
                  <div className="pointer-events-auto w-full max-w-sm z-10 bg-surface-default border border-ui-borderSubtle rounded-2xl p-4 shadow-brand-sm opacity-90 hover:opacity-100 transition-opacity overflow-hidden">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-txt-tertiary mb-3 border-b border-border-color pb-2">Recent Blueprints</h3>
                    <div className="flex flex-col gap-2">
                       {recentBlueprints.map((b, i) => (
                         <Button key={i} onClick={() => handleLoadRecent(b)} className="px-4 py-2 border border-border-color rounded text-left hover:bg-accent-50 flex justify-between items-center group transition-colors rounded-full active:scale-95 hover:-translate-y-0.5 hover:shadow-brand-lg shadow-brand-sm">
                           <span className="truncate flex-1 text-sm text-white/80 group-hover:text-accent-800 font-medium">{b.name}</span>
                           <span className="text-xs uppercase font-bold text-white/80 group-hover:text-accent-800">Load</span>
                         </Button>
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
                              stroke="rgb(242, 164, 19)"
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
                            fill="rgb(255, 255, 255)"
                            y={18 / stageScale}
                            offsetX={
                              20 / stageScale
                            } /* approximate centering */
                          />
                          {isLinked && (
                            <Group x={12 / stageScale} y={-12 / stageScale}>
                              <Circle
                                radius={5 / stageScale}
                                fill="rgb(242, 164, 19)"
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
                              fill="rgb(242, 164, 19)"
                              stroke="rgb(31, 29, 26)"
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
                            ? "rgb(15, 118, 110)"
                            : mode === "area"
                              ? "rgb(242, 164, 19)"
                              : "rgb(242, 164, 19)"
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
                              ? "rgb(15, 118, 110)"
                              : mode === "area"
                                ? "rgb(242, 164, 19)"
                                : "rgb(242, 164, 19)"
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
                          stroke="rgb(176, 112, 6)"
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
                          fill="rgb(255, 255, 255)"
                          stroke="rgb(31, 29, 26)"
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
              <div className="absolute inset-0 bg-ink/60 flex items-center justify-center z-50">
                <div className="bg-surface-default border border-ui-borderSubtle rounded-2xl p-4 sm:p-4 sm:p-4 sm:p-6 max-w-sm w-full shadow-2xl overflow-hidden">
                  <h3 className="text-sm font-semibold mb-4 text-txt-primary">
                    Set Measurement Scale
                  </h3>
                  <p className="text-xs text-txt-secondary mb-4">
                    Line length on drawing is
                    <span className="font-mono text-ui-successText">
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
                      className="flex-1 bg-surface-default border border-ui-borderSubtle rounded p-2 text-xs text-txt-primary uppercase font-mono focus:outline-none focus:border-ui-successText whitespace-nowrap rounded-full"
                    /></>
                    <select
                      value={scaleInputUnit}
                      onChange={(e) => setScaleInputUnit(e.target.value)}
                      className="w-20 bg-surface-default border border-ui-borderSubtle rounded p-2 text-xs text-center text-txt-primary focus:outline-none focus:border-ui-successText"
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
                    <Button
                      onClick={() => {
                        setScalePrompt({ visible: false, pxLen: 0 });
                        setMode("select");
                      }}
                      className="px-3 py-1.5 text-xs text-txt-secondary hover:text-txt-primary transition-colors border border-transparent rounded-full active:scale-95 hover:-translate-y-0.5 hover:shadow-brand-lg shadow-brand-sm"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        const realVal = parseFloat(scaleInputValue);
                        if (realVal > 0 && scalePrompt.pxLen > 0) {
                          setScalePxPerUnit(scalePrompt.pxLen / realVal);
                          setUnitName(scaleInputUnit || "units");
                        } else {
                          toast.error("Draw a longer scale line and enter a real-world length over 0 — a zero scale makes every measurement divide by zero.");
                        }
                        setScalePrompt({ visible: false, pxLen: 0 });
                        setMode("select");
                      }}
                      className="px-3 py-1.5 text-xs bg-ui-successText text-white rounded transition-colors rounded-full active:scale-95 hover:-translate-y-0.5 hover:shadow-brand-lg shadow-brand-sm"
                    >
                      Save Scale
                    </Button>
                  </div>
                </div>
              </div>
            )}
            {/* Assembly Prompt Overlay */}
            {assemblyPrompt && (
              <div className="absolute inset-0 bg-ink/60 flex items-center justify-center z-50">
                <div className="bg-surface-default border border-ui-borderSubtle rounded-2xl p-4 sm:p-4 sm:p-4 sm:p-6 max-w-sm w-full shadow-2xl overflow-hidden">
                  {(() => {
                    const asmDef = ASSEMBLIES.find(
                      (a) => a.id === assemblyPrompt.assemblyId,
                    );
                    return (
                      <>
                        <h3 className="text-sm font-semibold mb-2 text-txt-primary flex items-center gap-2">
                          <span style={{ color: asmDef?.color }}>
                            {asmDef?.icon}
                          </span>
                          Configure Assembly
                        </h3>
                        <p className="text-xs text-txt-secondary mb-5">
                          Provide dimensions for
                          <span className="font-medium text-txt-primary">
                            {asmDef?.name}
                          </span>
                          to generate BOQ sub-items automatically.
                        </p>
                        <div className="flex flex-col gap-3 mb-5">
                          {asmDef?.inputs.map((inp) => (
                            <div key={inp.key}>
                              <label className="block text-xs font-semibold uppercase tracking-wider text-txt-secondary mb-1.5">
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
                                className="w-full bg-surface-default border border-ui-borderSubtle rounded p-2 text-xs text-txt-primary focus:outline-none focus:border-ink rounded-full"
                              /></>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-end gap-2 text-xs">
                          <Button
                            onClick={() => setAssemblyPrompt(null)}
                            className="px-4 py-2 text-txt-secondary hover:text-txt-primary transition-colors border border-transparent rounded rounded-full active:scale-95 hover:-translate-y-0.5 hover:shadow-brand-lg shadow-brand-sm"
                          >
                            Cancel
                          </Button>
                          <Button onClick={handleCreateAssembly}
                            className="px-4 py-2 bg-ink hover:bg-ink-700 text-white font-medium rounded transition-colors rounded-full active:scale-95 hover:-translate-y-0.5 hover:shadow-brand-lg shadow-brand-sm"
                          >
                            Generate BOQ
                          </Button>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            )}
            {/* Enter/Escape Helper */}
            {drawingPoints.length > 0 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-transparent/80 border border-ui-borderSubtle rounded-full px-4 py-1.5 text-xs text-txt-secondary backdrop-blur-sm pointer-events-none flex gap-4 shadow-brand-lg">
                <span>
                  <kbd className="bg-surface-default px-1.5 rounded border border-ui-borderSubtle mr-1">
                    Click
                  </kbd>
                  point
                </span>
                <span>
                  <kbd className="bg-surface-default px-1.5 rounded border border-ui-borderSubtle mr-1">
                    Enter
                  </kbd>
                  finish
                </span>
                <span>
                  <kbd className="bg-surface-default px-1.5 rounded border border-ui-borderSubtle mr-1">
                    Esc
                  </kbd>
                  cancel
                </span>
              </div>
            )}
          </div>
          {/* Right Panel */}
          <div className="w-full lg:w-64 border-t lg:border-t-0 lg:border-l border-ui-borderSubtle bg-transparent/50 flex flex-col shrink-0 max-h-[320px] lg:max-h-none">
            <div className="h-10 border-b border-ui-borderSubtle flex items-center px-4 bg-surface-default/30">
              <span className="text-xs font-semibold uppercase text-txt-secondary tracking-wider flex-1">
                Takeoffs
              </span>
              <span className="text-xs text-accent-800 bg-accent-500/10 px-1.5 py-0.5 rounded border border-accent-500/20">
                {measurements.length}
              </span>
            </div>
            <div className="flex-1 p-3 space-y-2 overflow-y-auto">
              {measurements.length === 0 && (
                <div className="text-xs text-center text-txt-secondary mt-8 p-4 border border-dashed border-ui-borderSubtle rounded">
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
                    className="p-2 bg-surface-default border border-ui-borderSubtle rounded relative overflow-hidden group flex flex-col gap-1.5"
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
                            className="bg-surface-default border border-ink text-xs text-txt-primary rounded px-1.5 py-0.5 outline-none w-full min-w-0 rounded-full"
                            
                            onClick={(e) => e.stopPropagation()}
                          /></>
                        ) : (
                          <span
                            className="text-xs font-medium text-txt-primary truncate cursor-text hover:text-accent-400 focus:text-accent-400 flex-1 outline-none"
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
                          className="text-xs font-mono font-medium bg-surface-default px-1.5 py-0.5 rounded border border-ui-borderSubtle"
                          style={{ color: m.color }}
                        >
                          {primaryStr}
                        </span>
                        {secondaryStr && (
                          <span className="text-xs font-mono text-txt-secondary">
                            ({secondaryStr})
                          </span>
                        )}
                      </div>
                    </div>
                    {linkedBoqs.length > 0 ? (
                      <div className="pl-2 flex flex-col gap-1 mt-1">
                        <span className="text-xs text-txt-secondary font-medium uppercase tracking-wider">
                          Linked To:
                        </span>
                        {linkedBoqs.map((item) => (
                          <div
                            key={item.id}
                            className="text-xs text-accent-400 font-mono truncate leading-tight"
                          >
                            {item.id} - {item.desc}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="pl-2 mt-1">
                        <span className="text-xs text-txt-secondary italic">
                          Unlinked
                        </span>
                      </div>
                    )}
                    <div className="pl-2 flex justify-between items-center mt-1 pt-1 border-t border-ui-borderSubtle">
                      <span className="text-xs text-txt-secondary uppercase">
                        {m.type}
                      </span>
                      <Button
                        onClick={() => removeMeasurement(m.id)}
                        className="text-txt-secondary hover:text-ui-errorText opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      
      {showTutorial && (
        <div
          className="fixed inset-0 bg-ink/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 font-sans"
          role="dialog"
          aria-modal="true"
          aria-label="Welcome to 2D Takeoff Engine"
        >
          <div className="bg-surface-default border border-ui-borderSubtle rounded-2xl max-w-lg w-full shadow-2xl p-4 sm:p-4 sm:p-4 sm:p-6 overflow-y-auto max-h-[90vh] relative overflow-hidden">
            <Button onClick={closeTutorial} className="absolute right-4 top-4 p-2 text-txt-tertiary hover:text-txt-secondary transition-colors rounded-full hover:bg-surface-hover active:scale-95 hover:-translate-y-0.5 hover:shadow-brand-lg shadow-brand-sm">
              <X className="w-5 h-5"/>
            </Button>
            <h2 className="text-xl font-bold text-txt-primary mb-6">Welcome to 2D Takeoff Engine</h2>
            
            <div className="space-y-6 mb-8">
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-accent-50 text-accent-800 flex items-center justify-center font-bold shrink-0 border border-accent-100">1</div>
                <div>
                  <h4 className="font-semibold text-txt-primary mb-1">Upload your blueprint image</h4>
                  <p className="text-sm text-txt-secondary">Add any floor plan (JPG, PNG, PDF exported as image) or try the demo.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-ui-success text-ui-successText flex items-center justify-center font-bold shrink-0 border border-ui-successBorder">2</div>
                <div>
                  <h4 className="font-semibold text-txt-primary mb-1">Set the scale</h4>
                  <p className="text-sm text-txt-secondary">Click the ruler tool, draw a line over a known dimension, and set its real-world length.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-accent-50 text-accent-800 flex items-center justify-center font-bold shrink-0 border border-accent-100">3</div>
                <div>
                  <h4 className="font-semibold text-txt-primary mb-1">Measure and extract</h4>
                  <p className="text-sm text-txt-secondary">Draw lines/areas to extract material quantities or drop Smart Assemblies onto the canvas.</p>
                </div>
              </div>
            </div>

            <Button onClick={closeTutorial} className="w-full py-3 bg-ink hover:bg-ink-700 text-white font-semibold rounded-full transition-colors shadow-brand-sm active:scale-95 hover:-translate-y-0.5">
              Get Started
            </Button>
          </div>
        </div>
      )}
      
      <div className="mt-4 bg-surface-default border border-ui-borderSubtle rounded-2xl p-4 shadow-brand-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-bold text-txt-primary mr-2">
            BOQ: {boqItems.length} item(s) · PKR {boqItems.reduce((sum, it) => sum + getMappedQty(it, measurements, scalePxPerUnit, unitName) * it.rate, 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </span>
          <Button onClick={undo} disabled={!canUndo} className="px-3 py-1.5 bg-surface-hover rounded-full text-xs font-bold disabled:opacity-40">Undo</Button>
          <Button onClick={redo} disabled={!canRedo} className="px-3 py-1.5 bg-surface-hover rounded-full text-xs font-bold disabled:opacity-40">Redo</Button>
          <Button onClick={() => { addBoqItems(SAMPLE_BOQ); toast.success("Sample BOQ loaded — marked SAMPLE, replace it with your own measurements."); }} className="px-3 py-1.5 bg-surface-hover rounded-full text-xs font-bold">Load sample BOQ</Button>
          <Button onClick={() => {
            const lines = [["Item", "Description", "Unit", "Qty", "Rate (PKR)", "Amount (PKR)", "Status", "Sheet"]];
            boqItems.forEach((it) => {
              const q = getMappedQty(it, measurements, scalePxPerUnit, unitName);
              lines.push([it.id, it.desc, it.unit, q.toFixed(2), String(it.rate), (q * it.rate).toFixed(2), it.status ?? "assumed", it.sheetRef ?? ""]);
            });
            const csv = lines.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
            const blob = new Blob([csv], { type: "text/csv" });
            const aEl = document.createElement("a");
            aEl.href = URL.createObjectURL(blob);
            aEl.download = "takeoff-boq.csv";
            aEl.click();
            URL.revokeObjectURL(aEl.href);
            toast.success("Takeoff BOQ CSV downloaded");
          }} className="px-3 py-1.5 bg-surface-hover rounded-full text-xs font-bold">Export CSV</Button>
          <Button onClick={async () => {
            try {
              await generatePDFReport(boqItems, measurements, scalePxPerUnit, unitName, { projectName: filename, projectId: "", clientName: "", siteLocation: "", date: new Date().toLocaleDateString() }, "PKR ");
              toast.success("Takeoff BOQ PDF downloaded");
            } catch (e) { console.error(e); toast.error("PDF export failed"); }
          }} className="px-3 py-1.5 bg-ink text-white rounded-full text-xs font-bold">Export PDF</Button>
          <Button onClick={async () => {
            try {
              await generateExcelReport(boqItems, measurements, scalePxPerUnit, unitName, { projectName: filename, projectId: "", clientName: "", siteLocation: "", date: new Date().toLocaleDateString() }, "PKR ");
              toast.success("Takeoff BOQ Excel downloaded");
            } catch (e) { console.error(e); toast.error("Excel export failed"); }
          }} className="px-3 py-1.5 bg-surface-hover rounded-full text-xs font-bold">Export Excel</Button>
        </div>
        <p className="text-xs text-txt-tertiary mt-2 break-words">
          Rates: PCC/RCC/brickwork/plaster/steel priced from the dated PK table ({PK_TABLE.lastUpdated}, {PK_TABLE.source}) via rate analysis (material + 1% water + 15% CPOH, labour excluded). Excavation, formwork and road-course rates are example values — verify against your market before tendering. Work is saved on this device (localStorage) and restores on reload.
        </p>
      </div>
      <CalculationHistory
        calculatorId="takeoff"
        currentInputs={{ measurements, boqItems, scale: scalePxPerUnit, unit: unitName }}
        currentResults={{ total: boqItems.reduce((sum, it) => sum + getMappedQty(it, measurements, scalePxPerUnit, unitName) * it.rate, 0) }}
        onRestore={(ins) => {
          if (Array.isArray(ins.measurements)) setMeasurements(ins.measurements as typeof measurements);
          if (Array.isArray(ins.boqItems)) setBoqItems(ins.boqItems as typeof boqItems);
          if (ins.scale != null && !Number.isNaN(Number(ins.scale))) setScalePxPerUnit(Number(ins.scale));
          if (typeof ins.unit === "string") setUnitName(ins.unit);
        }}
      />
    </div>
  );
}
