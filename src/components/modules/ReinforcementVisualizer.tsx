import React, { useState, useRef } from "react";
import { CalculationHistory } from "../ui/CalculationHistory";
import {
  Download,
  CheckCircle,
  AlertTriangle,
  Maximize2,
  LayoutTemplate,
  FileImage,
} from "lucide-react";
import { MaterialSummary } from "../ui/MaterialSummary";

type ElementType = "Beam" | "Column" | "Slab";

export default function ReinforcementVisualizer() {
  const [type, setType] = useState<ElementType>("Beam");
  const [width, setWidth] = useState(300); // mm
  const [depth, setDepth] = useState(450); // mm
  const [cover, setCover] = useState(25); // mm

  const [topBarsCount, setTopBarsCount] = useState(2);
  const [topBarsDia, setTopBarsDia] = useState(16);

  const [bottomBarsCount, setBottomBarsCount] = useState(3);
  const [bottomBarsDia, setBottomBarsDia] = useState(20);

  const [stirrupDia, setStirrupDia] = useState(8);
  const [stirrupSpacing, setStirrupSpacing] = useState(150);

  const svgRef = useRef<SVGSVGElement>(null);

  const downloadSvg = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `reinforcement_${type.toLowerCase()}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadPng = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    // Scale up for better resolution
    const scale = 3;
    const paddingX = 100;
    const paddingY = 80;

    // Original viewBox dimensions
    const vWidth = width + paddingX * 2;
    const vHeight = depth + paddingY * 2;

    canvas.width = vWidth * scale;
    canvas.height = vHeight * scale;

    img.onload = () => {
      if (!ctx) return;
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0);
      const pngUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `reinforcement_${type.toLowerCase()}.png`;
      link.href = pngUrl;
      link.click();
    };
    img.src =
      "data:image/svg+xml;base64," +
      btoa(unescape(encodeURIComponent(svgData)));
  };

  // Compliance Checks
  const getMinCover = () => {
    if (type === "Slab") return 20;
    if (type === "Column") return 40;
    return 25; // Beam
  };

  const coverCheck =
    cover >= getMinCover()
      ? {
          pass: true,
          msg: `Cover ${cover}mm meets IS456 min ${getMinCover()}mm`,
        }
      : { pass: false, msg: `Cover too low! Min ${getMinCover()}mm required` };

  const activeWidth = width - 2 * cover - 2 * stirrupDia;

  const bottomClearSpacing =
    bottomBarsCount > 1
      ? (activeWidth - bottomBarsCount * bottomBarsDia) / (bottomBarsCount - 1)
      : activeWidth;

  const topClearSpacing =
    topBarsCount > 1
      ? (activeWidth - topBarsCount * topBarsDia) / (topBarsCount - 1)
      : activeWidth;

  const minSpacingAllowed = Math.max(bottomBarsDia, 25); // Simplified IS 456 max aggregate + 5mm or bar dia

  const spacingCheck =
    bottomClearSpacing >= minSpacingAllowed &&
    topClearSpacing >= minSpacingAllowed
      ? {
          pass: true,
          msg: `Clear spacing between bars is adequate (>= ${minSpacingAllowed}mm)`,
        }
      : {
          pass: false,
          msg: `Bars too close! Need ${minSpacingAllowed}mm, got ${Math.min(bottomClearSpacing, topClearSpacing).toFixed(1)}mm`,
        };

  // Calculate coordinates for SVG
  const paddingX = 100;
  const paddingY = 80;
  const vWidth = width + paddingX * 2;
  const vHeight = depth + paddingY * 2;

  const startX = paddingX;
  const startY = paddingY;

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500">
      <MaterialSummary
        title="Reinforcement Detailing"
        icon={<LayoutTemplate className="w-5 h-5" />}
        totalValue="—"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
          {/* Controls */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-50 rounded-[24px] border border-slate-200 shadow-sm text-slate-800 p-4 sm:p-6 rounded-[24px] border border-slate-200 overflow-hidden">
              <h3 className="text-lg font-bold text-slate-800 mb-4">
                Geometry Inputs
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">
                    Element Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as ElementType)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-[16px] focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500 outline-none"
                  >
                    <option value="Beam">Beam</option>
                    <option value="Column">Column</option>
                    <option value="Slab">Slab</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Width (mm)
                    </label>
                    <><label htmlFor="a11y-input-414" className="sr-only">Input</label>
<input id="a11y-input-414"
                      type="number" inputMode="decimal"
                      value={width}
                      onChange={(e) => setWidth(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-full outline-none"
                    /></>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Depth (mm)
                    </label>
                    <><label htmlFor="a11y-input-415" className="sr-only">Input</label>
<input id="a11y-input-415"
                      type="number" inputMode="decimal"
                      value={depth}
                      onChange={(e) => setDepth(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-full outline-none"
                    /></>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Clear Cover (mm)
                    </label>
                    <><label htmlFor="a11y-input-416" className="sr-only">Input</label>
<input id="a11y-input-416"
                      type="number" inputMode="decimal"
                      value={cover}
                      onChange={(e) => setCover(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-full outline-none"
                    /></>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-[24px] border border-slate-200 shadow-sm text-slate-800 p-4 sm:p-6 rounded-[24px] border border-slate-200 overflow-hidden">
              <h3 className="text-lg font-bold text-slate-800 mb-4">
                Reinforcement
              </h3>
              <div className="space-y-4">
                {type !== "Slab" && (
                  <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-200">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Top Bars Count
                      </label>
                      <><label htmlFor="a11y-input-417" className="sr-only">Input</label>
<input id="a11y-input-417"
                        type="number" inputMode="decimal"
                        value={topBarsCount}
                        onChange={(e) =>
                          setTopBarsCount(Number(e.target.value))
                        }
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-full outline-none"
                        min={2}
                      /></>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Top Bar Dia (mm)
                      </label>
                      <select
                        value={topBarsDia}
                        onChange={(e) => setTopBarsDia(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-[16px] outline-none"
                      >
                        {[8, 10, 12, 16, 20, 25, 32].map((d) => (
                          <option key={d} value={d}>
                            {d}mm
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-200">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {type === "Slab" ? "Main Bars" : "Bottom Bars"} Count
                    </label>
                    <><label htmlFor="a11y-input-418" className="sr-only">Input</label>
<input id="a11y-input-418"
                      type="number" inputMode="decimal"
                      value={bottomBarsCount}
                      onChange={(e) =>
                        setBottomBarsCount(Number(e.target.value))
                      }
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-full outline-none"
                      min={2}
                    /></>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Bottom Bar Dia
                    </label>
                    <select
                      value={bottomBarsDia}
                      onChange={(e) => setBottomBarsDia(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-[16px] outline-none"
                    >
                      {[8, 10, 12, 16, 20, 25, 32].map((d) => (
                        <option key={d} value={d}>
                          {d}mm
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {type !== "Slab" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Stirrup Dia (mm)
                      </label>
                      <select
                        value={stirrupDia}
                        onChange={(e) => setStirrupDia(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-[16px] outline-none"
                      >
                        {[8, 10, 12].map((d) => (
                          <option key={d} value={d}>
                            {d}mm
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Spacing (c/c)
                      </label>
                      <><label htmlFor="a11y-input-419" className="sr-only">Input</label>
<input id="a11y-input-419"
                        type="number" inputMode="decimal"
                        value={stirrupSpacing}
                        onChange={(e) =>
                          setStirrupSpacing(Number(e.target.value))
                        }
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-full outline-none"
                      /></>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div
                className={`p-4 rounded-[24px] border flex items-start gap-3 ${coverCheck.pass ? "bg-emerald-50 border-emerald-200 text-emerald-800   " : "bg-rose-50 border-rose-200 text-rose-800   "}`}
              >
                {coverCheck.pass ? (
                  <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="font-bold text-sm">
                    Cover Compliance (IS 456)
                  </h4>
                  <p className="text-xs mt-1 opacity-90">{coverCheck.msg}</p>
                </div>
              </div>

              {type !== "Slab" && (
                <div
                  className={`p-4 rounded-[24px] border flex items-start gap-3 ${spacingCheck.pass ? "bg-emerald-50 border-emerald-200 text-emerald-800   " : "bg-rose-50 border-rose-200 text-rose-800   "}`}
                >
                  {spacingCheck.pass ? (
                    <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h4 className="font-bold text-sm">Spacing Compliance</h4>
                    <p className="text-xs mt-1 opacity-90">
                      {spacingCheck.msg}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Visualization Viewer */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800 px-2">
                Cross Section Preview
              </h3>
              <div className="flex gap-2">
                <button onClick={downloadSvg}
                  className="px-3 py-1.5 bg-white text-indigo-600 text-sm font-bold border border-slate-200 rounded-full hover:bg-slate-50 transition flex items-center gap-2 transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
                >
                  <FileImage className="w-4 h-4" /> SVG
                </button>
                <button onClick={handleDownloadPng}
                  className="px-3 py-1.5 bg-indigo-600 text-white text-sm font-bold rounded-full hover:bg-indigo-700 transition flex items-center gap-2 shadow-sm transition-all duration-300 active:scale-95 hover:-translate-y-0.5"
                >
                  <Download className="w-4 h-4" /> PNG
                </button>
              </div>
            </div>

            <div className="flex-1 bg-white [#1e293b] border border-slate-200 rounded-[24px] overflow-hidden relative min-h-[400px] flex items-center justify-center p-4">
              <div
                className="absolute inset-0 pattern-grid-lg text-slate-100 pointer-events-none"
                style={{
                  backgroundSize: "20px 20px",
                  backgroundImage:
                    "radial-gradient(currentColor 1px, transparent 1px)",
                }}
              />

              <svg
                ref={svgRef}
                viewBox={`0 0 ${vWidth} ${vHeight}`}
                className="max-w-full max-h-[600px] drop-shadow-md relative z-10"
                xmlns="http://www.w3.org/2000/svg"
                style={{ backgroundColor: "white" }}
              >
                <defs>
                  <pattern
                    id="concrete-hatch"
                    width="40"
                    height="40"
                    patternUnits="userSpaceOnUse"
                    patternTransform="rotate(45)"
                  >
                    <path
                      d="M 0 0 L 0 40 M 10 0 L 10 40 M 20 0 L 20 40 M 30 0 L 30 40"
                      stroke="#94a3b8"
                      strokeWidth="0.5"
                      strokeDasharray="3 3"
                    />
                  </pattern>
                  <marker
                    id="arrow"
                    viewBox="0 0 10 10"
                    refX="5"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#334155" />
                  </marker>
                </defs>

                {/* Concrete Block */}
                <rect
                  x={startX}
                  y={startY}
                  width={width}
                  height={depth}
                  fill="#f1f5f9"
                  stroke="#64748b"
                  strokeWidth="2"
                />
                <rect
                  x={startX}
                  y={startY}
                  width={width}
                  height={depth}
                  fill="url(#concrete-hatch)"
                />

                {/* Stirrup/Tie (if not a slab) */}
                {type !== "Slab" && (
                  <rect
                    x={startX + cover}
                    y={startY + cover}
                    width={Math.max(10, width - 2 * cover)}
                    height={Math.max(10, depth - 2 * cover)}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth={stirrupDia}
                    rx={stirrupDia * 1.5}
                  />
                )}

                {/* Stirrup Hooks */}
                {type !== "Slab" && (
                  <path
                    d={`M ${startX + cover + stirrupDia * 1.5} ${startY + cover} L ${startX + cover + stirrupDia * 3 + 10} ${startY + cover + stirrupDia * 3 + 10} M ${startX + cover} ${startY + cover + stirrupDia * 1.5} L ${startX + cover + stirrupDia * 3 + 10} ${startY + cover + stirrupDia * 3 + 10}`}
                    stroke="#3b82f6"
                    strokeWidth={stirrupDia}
                    fill="none"
                  />
                )}

                {/* Top Bars */}
                {type !== "Slab" &&
                  Array.from({ length: topBarsCount }).map((_, i) => {
                    const barSpacing =
                      topBarsCount > 1
                        ? (width - 2 * cover - 2 * stirrupDia - topBarsDia) /
                          (topBarsCount - 1)
                        : 0;
                    const cx =
                      startX +
                      cover +
                      stirrupDia +
                      topBarsDia / 2 +
                      i * barSpacing;
                    const cy = startY + cover + stirrupDia + topBarsDia / 2;
                    return (
                      <circle
                        key={`t-${i}`}
                        cx={cx}
                        cy={cy}
                        r={topBarsDia / 2}
                        fill="#ef4444"
                        stroke="#7f1d1d"
                        strokeWidth="1"
                      />
                    );
                  })}

                {/* Bottom Bars */}
                {Array.from({ length: bottomBarsCount }).map((_, i) => {
                  const actualWidthForBars =
                    type === "Slab"
                      ? width - 2 * cover
                      : width - 2 * cover - 2 * stirrupDia;
                  const barSpacing =
                    bottomBarsCount > 1
                      ? (actualWidthForBars - bottomBarsDia) /
                        (bottomBarsCount - 1)
                      : 0;
                  const cx =
                    startX +
                    cover +
                    (type === "Slab" ? 0 : stirrupDia) +
                    bottomBarsDia / 2 +
                    i * barSpacing;
                  const cy =
                    startY +
                    depth -
                    cover -
                    (type === "Slab" ? 0 : stirrupDia) -
                    bottomBarsDia / 2;
                  return (
                    <circle
                      key={`b-${i}`}
                      cx={cx}
                      cy={cy}
                      r={bottomBarsDia / 2}
                      fill="#ef4444"
                      stroke="#7f1d1d"
                      strokeWidth="1"
                    />
                  );
                })}

                {/* Dimension Lines - Width */}
                <line
                  x1={startX}
                  y1={startY - 30}
                  x2={startX + width}
                  y2={startY - 30}
                  stroke="#334155"
                  strokeWidth="1.5"
                  markerStart="url(#arrow)"
                  markerEnd="url(#arrow)"
                />
                <line
                  x1={startX}
                  y1={startY - 40}
                  x2={startX}
                  y2={startY - 20}
                  stroke="#334155"
                  strokeWidth="1.5"
                />
                <line
                  x1={startX + width}
                  y1={startY - 40}
                  x2={startX + width}
                  y2={startY - 20}
                  stroke="#334155"
                  strokeWidth="1.5"
                />
                <text
                  x={startX + width / 2}
                  y={startY - 38}
                  textAnchor="middle"
                  fill="#1e293b"
                  fontSize="14"
                  fontWeight="bold"
                  fontFamily="sans-serif"
                >
                  {width} mm
                </text>

                {/* Dimension Lines - Depth */}
                <line
                  x1={startX + width + 30}
                  y1={startY}
                  x2={startX + width + 30}
                  y2={startY + depth}
                  stroke="#334155"
                  strokeWidth="1.5"
                  markerStart="url(#arrow)"
                  markerEnd="url(#arrow)"
                />
                <line
                  x1={startX + width + 20}
                  y1={startY}
                  x2={startX + width + 40}
                  y2={startY}
                  stroke="#334155"
                  strokeWidth="1.5"
                />
                <line
                  x1={startX + width + 20}
                  y1={startY + depth}
                  x2={startX + width + 40}
                  y2={startY + depth}
                  stroke="#334155"
                  strokeWidth="1.5"
                />
                <text
                  x={startX + width + 38}
                  y={startY + depth / 2}
                  dominantBaseline="middle"
                  fill="#1e293b"
                  fontSize="14"
                  fontWeight="bold"
                  fontFamily="sans-serif"
                >
                  {depth} mm
                </text>

                {/* Cover Indication */}
                <line
                  x1={startX - 30}
                  y1={startY + depth - cover}
                  x2={startX - 30}
                  y2={startY + depth}
                  stroke="#3b82f6"
                  strokeWidth="1.5"
                  markerStart="url(#arrow)"
                  markerEnd="url(#arrow)"
                />
                <line
                  x1={startX - 40}
                  y1={startY + depth - cover}
                  x2={startX}
                  y2={startY + depth - cover}
                  stroke="#3b82f6"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <line
                  x1={startX - 40}
                  y1={startY + depth}
                  x2={startX}
                  y2={startY + depth}
                  stroke="#3b82f6"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={startX - 38}
                  y={startY + depth - cover / 2}
                  dominantBaseline="middle"
                  textAnchor="end"
                  fill="#3b82f6"
                  fontSize="14"
                  fontWeight="bold"
                  fontFamily="sans-serif"
                >
                  C: {cover}
                </text>

                {/* Info Text */}
                <text
                  x="20"
                  y="30"
                  fill="#1e293b"
                  fontSize="16"
                  fontWeight="bold"
                  fontFamily="sans-serif"
                >
                  {type} Cross Section
                </text>
                <text
                  x="20"
                  y="55"
                  fill="#475569"
                  fontSize="12"
                  fontFamily="sans-serif"
                >
                  Main Bottom: {bottomBarsCount} - Ø{bottomBarsDia}
                </text>
                {type !== "Slab" && (
                  <text
                    x="20"
                    y="75"
                    fill="#475569"
                    fontSize="12"
                    fontFamily="sans-serif"
                  >
                    Main Top: {topBarsCount} - Ø{topBarsDia}
                  </text>
                )}
                {type !== "Slab" && (
                  <text
                    x="20"
                    y="95"
                    fill="#475569"
                    fontSize="12"
                    fontFamily="sans-serif"
                  >
                    Stirrups: Ø{stirrupDia} @ {stirrupSpacing} c/c
                  </text>
                )}
              </svg>
            </div>
          </div>
        </div>
      </MaterialSummary>
    
      <CalculationHistory
        calculatorId="reinforcementvisualizer"
        currentInputs={{}}
        currentResults={{}}
        estimationName="Reinforcement Visualizer"
      />
</div>
  );
}
