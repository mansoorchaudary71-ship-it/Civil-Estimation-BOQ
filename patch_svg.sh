cat /app/applet/src/components/modules/UniversalStructuralGeometryEngine.tsx | head -n 377 > temp.tsx
cat << 'INNER_EOF' >> temp.tsx
// --- SVG PREVIEWS ---
const SvgDefs = () => (
  <defs>
    <marker id="arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto-start-reverse">
      <path d="M 0 0 L 6 3 L 0 6 z" fill="currentColor" />
    </marker>
  </defs>
);

const RectangularSVG = ({ w, d }: { w: number, d: number }) => {
  const maxDim = Math.max(w, d) || 1;
  const scale = 50 / maxDim;
  const sw = Math.max(w * scale, 10);
  const sd = Math.max(d * scale, 10);

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full text-indigo-500 drop-shadow-md">
      <SvgDefs />
      <motion.rect 
        initial={false}
        animate={{ x: 50 - sw / 2, y: 50 - sd / 2, width: sw, height: sd }}
        fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="3" 
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />
      <motion.rect 
        initial={false}
        animate={{ x: 50 - sw / 2 + (sw > 16 ? 8 : 2), y: 50 - sd / 2 + (sd > 16 ? 8 : 2), width: Math.max(1, sw - (sw > 16 ? 16 : 4)), height: Math.max(1, sd - (sd > 16 ? 16 : 4)) }}
        fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 2" 
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />
      <motion.circle initial={false} animate={{ cx: 50 - sw/2 + (sw > 16 ? 10 : 3), cy: 50 - sd/2 + (sd > 16 ? 10 : 3), r: 2.5 }} fill="currentColor" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
      <motion.circle initial={false} animate={{ cx: 50 + sw/2 - (sw > 16 ? 10 : 3), cy: 50 - sd/2 + (sd > 16 ? 10 : 3), r: 2.5 }} fill="currentColor" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
      <motion.circle initial={false} animate={{ cx: 50 - sw/2 + (sw > 16 ? 10 : 3), cy: 50 + sd/2 - (sd > 16 ? 10 : 3), r: 2.5 }} fill="currentColor" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
      <motion.circle initial={false} animate={{ cx: 50 + sw/2 - (sw > 16 ? 10 : 3), cy: 50 + sd/2 - (sd > 16 ? 10 : 3), r: 2.5 }} fill="currentColor" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
      
      <motion.line initial={false} animate={{ x1: 50 - sw / 2, y1: 50 + sd / 2 + 10, x2: 50 + sw / 2, y2: 50 + sd / 2 + 10 }} stroke="currentColor" strokeWidth="1" markerStart="url(#arrow)" markerEnd="url(#arrow)" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
      <motion.text initial={false} animate={{ x: 50, y: 50 + sd / 2 + 18 }} textAnchor="middle" fontSize="6" fill="currentColor" fontWeight="bold" transition={{ type: "spring", stiffness: 300, damping: 30 }}>{w}m</motion.text>
      
      <motion.line initial={false} animate={{ x1: 50 + sw / 2 + 10, y1: 50 - sd / 2, x2: 50 + sw / 2 + 10, y2: 50 + sd / 2 }} stroke="currentColor" strokeWidth="1" markerStart="url(#arrow)" markerEnd="url(#arrow)" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
      <motion.text initial={false} animate={{ x: 50 + sw / 2 + 15, y: 50 }} textAnchor="start" alignmentBaseline="middle" fontSize="6" fill="currentColor" fontWeight="bold" transition={{ type: "spring", stiffness: 300, damping: 30 }}>{d}m</motion.text>
    </svg>
  );
};

const CircularSVG = ({ d }: { d: number }) => (
  <svg viewBox="0 0 100 100" className="w-full h-full text-indigo-500 drop-shadow-md">
    <SvgDefs />
    <motion.circle initial={false} animate={{ r: 35 }} cx="50" cy="50" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="3" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
    <motion.circle initial={false} animate={{ r: 28 }} cx="50" cy="50" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 2" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
    {[0, 60, 120, 180, 240, 300].map(angle => {
      const rad = (angle * Math.PI) / 180;
      return <motion.circle key={angle} cx={50 + 28 * Math.cos(rad)} cy={50 + 28 * Math.sin(rad)} r="3" fill="currentColor" transition={{ type: "spring", stiffness: 300, damping: 30 }} />;
    })}
    <motion.line initial={false} animate={{ x1: 15, y1: 50, x2: 85, y2: 50 }} stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
    <motion.line initial={false} animate={{ x1: 15, y1: 90, x2: 85, y2: 90 }} stroke="currentColor" strokeWidth="1" markerStart="url(#arrow)" markerEnd="url(#arrow)" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
    <motion.text initial={false} animate={{ x: 50, y: 98 }} textAnchor="middle" fontSize="6" fill="currentColor" fontWeight="bold" transition={{ type: "spring", stiffness: 300, damping: 30 }}>Ø {d}m</motion.text>
  </svg>
);

const HollowTubeSVG = ({ od, id }: { od: number, id: number }) => {
  const maxDim = Math.max(od, 0.001);
  const scale = 35 / maxDim;
  const rOD = od * scale;
  const rID = Math.max(id * scale, 0);
  
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full text-indigo-500 drop-shadow-md">
      <SvgDefs />
      <motion.circle initial={false} animate={{ r: rOD }} cx="50" cy="50" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="3" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
      <motion.circle initial={false} animate={{ r: rID }} cx="50" cy="50" fill="white" stroke="currentColor" strokeWidth="3" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
      <motion.circle initial={false} animate={{ r: (rOD + rID) / 2 }} cx="50" cy="50" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 2" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
      
      <motion.line initial={false} animate={{ x1: 50, y1: 50, x2: 50 + rOD, y2: 50 }} stroke="currentColor" strokeWidth="1" markerEnd="url(#arrow)" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
      <motion.text initial={false} animate={{ x: 50 + rOD / 2, y: 48 }} textAnchor="middle" fontSize="5" fill="currentColor" fontWeight="bold" transition={{ type: "spring", stiffness: 300, damping: 30 }}>OD {od}m</motion.text>

      <motion.line initial={false} animate={{ x1: 50, y1: 50, x2: 50, y2: 50 + rID }} stroke="currentColor" strokeWidth="1" markerEnd="url(#arrow)" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
      <motion.text initial={false} animate={{ x: 48, y: 50 + rID / 2 }} textAnchor="end" alignmentBaseline="middle" fontSize="5" fill="currentColor" fontWeight="bold" transition={{ type: "spring", stiffness: 300, damping: 30 }}>ID {id}m</motion.text>
    </svg>
  );
};

const PrecastWallSVG = ({ totalH, panelH }: { totalH: number, panelH: number }) => {
  const numPanels = Math.max(1, Math.min(6, Math.floor(totalH / (panelH || 1))));
  const panelHeightVisual = 60 / numPanels;
  
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full text-indigo-500 drop-shadow-md">
      <SvgDefs />
      <motion.rect initial={false} animate={{ x: 20, y: 10, width: 10, height: 75 }} fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
      <motion.rect initial={false} animate={{ x: 70, y: 10, width: 10, height: 75 }} fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
      {Array.from({length: numPanels}).map((_, i) => (
        <motion.rect key={i} initial={false} animate={{ x: 30, y: 85 - (i + 1) * panelHeightVisual, width: 40, height: panelHeightVisual - 2 }} fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="2" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
      ))}

      <motion.line initial={false} animate={{ x1: 85, y1: 10, x2: 85, y2: 85 }} stroke="currentColor" strokeWidth="1" markerStart="url(#arrow)" markerEnd="url(#arrow)" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
      <motion.text initial={false} animate={{ x: 88, y: 47.5 }} textAnchor="start" alignmentBaseline="middle" fontSize="5" fill="currentColor" fontWeight="bold" transition={{ type: "spring", stiffness: 300, damping: 30 }}>H {totalH}m</motion.text>
    </svg>
  );
};

const StaircaseSVG = ({ rise, going }: { rise: number, going: number }) => {
  const steps = 3;
  const ratio = (going || 1) / (rise || 1);
  const stepW = 60 / steps;
  const stepH = stepW / ratio;
  
  const pathData = `M 20,80 L 80,80 L 80,${80 - stepH} L ${80 - stepW},${80 - stepH} L ${80 - stepW},${80 - 2 * stepH} L ${80 - 2 * stepW},${80 - 2 * stepH} L ${80 - 2 * stepW},${80 - 3 * stepH} L 20,${80 - 3 * stepH} Z`;
  
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full text-indigo-500 drop-shadow-md">
      <SvgDefs />
      <motion.path 
        initial={false} 
        animate={{ d: pathData }} 
        fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" 
        transition={{ type: "spring", stiffness: 300, damping: 30 }} 
      />
      <motion.path 
        initial={false} 
        animate={{ d: `M 25,75 L 80,${75 - Math.min(60, 3 * stepH)}` }} 
        fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 2" 
        transition={{ type: "spring", stiffness: 300, damping: 30 }} 
      />

      <motion.line initial={false} animate={{ x1: 80 - stepW, y1: 80 - stepH - 5, x2: 80, y2: 80 - stepH - 5 }} stroke="currentColor" strokeWidth="1" markerStart="url(#arrow)" markerEnd="url(#arrow)" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
      <motion.text initial={false} animate={{ x: 80 - stepW / 2, y: 80 - stepH - 8 }} textAnchor="middle" fontSize="4" fill="currentColor" fontWeight="bold" transition={{ type: "spring", stiffness: 300, damping: 30 }}>{going}m (G)</motion.text>

      <motion.line initial={false} animate={{ x1: 85, y1: 80 - stepH, x2: 85, y2: 80 }} stroke="currentColor" strokeWidth="1" markerStart="url(#arrow)" markerEnd="url(#arrow)" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
      <motion.text initial={false} animate={{ x: 88, y: 80 - stepH / 2 }} textAnchor="start" alignmentBaseline="middle" fontSize="4" fill="currentColor" fontWeight="bold" transition={{ type: "spring", stiffness: 300, damping: 30 }}>{rise}m (R)</motion.text>
    </svg>
  );
};

const RoofPitchSVG = ({ rise, span }: { rise: number, span: number }) => {
  const maxDim = Math.max(span, rise * 2, 1);
  const scale = 60 / maxDim;
  const w = span * scale;
  const h = rise * scale;
  
  const cx = 50;
  const by = 80; // base y
  const pathData = `M ${cx},${by - h} L ${cx - w/2},${by} L ${cx + w/2},${by} Z`;
  
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full text-indigo-500 drop-shadow-md">
      <SvgDefs />
      <motion.path initial={false} animate={{ d: pathData }} fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
      <motion.path initial={false} animate={{ d: `M ${cx},${by - h} L ${cx},${by}` }} fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 2" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
      <motion.rect initial={false} animate={{ x: cx - w/2, y: by, width: w, height: 5 }} fill="none" stroke="currentColor" strokeWidth="2" transition={{ type: "spring", stiffness: 300, damping: 30 }} />

      <motion.line initial={false} animate={{ x1: cx - w/2, y1: by + 10, x2: cx + w/2, y2: by + 10 }} stroke="currentColor" strokeWidth="1" markerStart="url(#arrow)" markerEnd="url(#arrow)" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
      <motion.text initial={false} animate={{ x: cx, y: by + 18 }} textAnchor="middle" fontSize="5" fill="currentColor" fontWeight="bold" transition={{ type: "spring", stiffness: 300, damping: 30 }}>Span {span}m</motion.text>

      <motion.line initial={false} animate={{ x1: cx + w/2 + 5, y1: by - h, x2: cx + w/2 + 5, y2: by }} stroke="currentColor" strokeWidth="1" markerStart="url(#arrow)" markerEnd="url(#arrow)" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
      <motion.text initial={false} animate={{ x: cx + w/2 + 8, y: by - h/2 }} textAnchor="start" alignmentBaseline="middle" fontSize="5" fill="currentColor" fontWeight="bold" transition={{ type: "spring", stiffness: 300, damping: 30 }}>Rise {rise}m</motion.text>
    </svg>
  );
};
INNER_EOF
mv temp.tsx /app/applet/src/components/modules/UniversalStructuralGeometryEngine.tsx
