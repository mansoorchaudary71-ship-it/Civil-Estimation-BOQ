const fs = require('fs');
let content = fs.readFileSync('src/components/modules/Takeoff.tsx', 'utf8');

const importReplacement = `import { useState, useRef, useEffect, useCallback } from "react";`;
content = content.replace(importReplacement, `import { useState, useRef, useEffect, useCallback } from "react";`); // already there? yes.

const stateAdditions = `  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [isMiddleMousePanning, setIsMiddleMousePanning] = useState(false);`;
content = content.replace(`  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });`, stateAdditions);

const useEffectSpaceAdditions = `  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && e.target === document.body) {
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
  }, []);`;

content = content.replace(`  useEffect(() => {
    if (!localStorage.getItem("takeoff_tutorial_seen")) {`, useEffectSpaceAdditions + `\n  useEffect(() => {
    if (!localStorage.getItem("takeoff_tutorial_seen")) {`);


const mouseDownReplacement = `  const handleMouseDown = (e: any) => {
    if (e.evt.button === 1) {
      setIsMiddleMousePanning(true);
      return;
    }
    if (mode === "select" || mode === "pan" || isSpacePressed) return;
    const pos = getLogicalPos(e);
    if (!pos) return;
    setDrawingPoints((prev) => [...prev, pos]);
  };`;

content = content.replace(/  const handleMouseDown = \(e: any\) => \{\n    if \(mode === "select" \|\| mode === "pan"\) return;\n    \/\* Middle click pan override \*\/ if \(e\.evt\.button === 1\) return;\n    const pos = getLogicalPos\(e\);\n    if \(!pos\) return;\n    setDrawingPoints\(\(prev\) => \[\.\.\.prev, pos\]\);\n  \};/, mouseDownReplacement);

const mouseUpAddition = `  const handleMouseUp = (e: any) => {
    if (e.evt.button === 1) {
      setIsMiddleMousePanning(false);
    }
  };`;

content = content.replace(`  const handleFinishDrawing = useCallback(() => {`, mouseUpAddition + `\n  const handleFinishDrawing = useCallback(() => {`);


const stageReplacement = `<Stage
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
              >`;

content = content.replace(/<Stage[\s\S]*?className=\{[\s\S]*?\n\s*\}\n\s*>/, stageReplacement);


fs.writeFileSync('src/components/modules/Takeoff.tsx', content);
