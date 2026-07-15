const fs = require('fs');
let content = fs.readFileSync('src/components/modules/Takeoff.tsx', 'utf8');

const stateAdditions = `  const [mousePos, setMousePos] = useState<Point | null>(null);
  const [snapPoint, setSnapPoint] = useState<Point | null>(null);`;
content = content.replace(`  const [mousePos, setMousePos] = useState<Point | null>(null);`, stateAdditions);

const mouseDownReplacement = `  const handleMouseDown = (e: any) => {
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
  };`;
content = content.replace(/  const handleMouseDown = \(e: any\) => \{\n    if \(e\.evt\.button === 1\) \{\n      setIsMiddleMousePanning\(true\);\n      return;\n    \}\n    if \(mode === "select" \|\| mode === "pan" \|\| isSpacePressed\) return;\n    const pos = getLogicalPos\(e\);\n    if \(!pos\) return;\n    setDrawingPoints\(\(prev\) => \[\.\.\.prev, pos\]\);\n  \};/, mouseDownReplacement);

const mouseMoveReplacement = `  const handleMouseMove = (e: any) => {
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
  };`;
content = content.replace(/  const handleMouseMove = \(e: any\) => \{\n    if \(mode === "select" \|\| mode === "pan"\) return;\n    const pos = getLogicalPos\(e\);\n    setMousePos\(pos\);\n  \};/, mouseMoveReplacement);

fs.writeFileSync('src/components/modules/Takeoff.tsx', content);
