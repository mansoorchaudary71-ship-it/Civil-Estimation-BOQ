const fs = require('fs');
let content = fs.readFileSync('src/components/modules/Takeoff.tsx', 'utf8');

const snapVisuals = `                      {/* Snap Indicator */}
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
                      
                      {drawingPoints.map((p, i) => (`;

content = content.replace(`                      {drawingPoints.map((p, i) => (`, snapVisuals);

fs.writeFileSync('src/components/modules/Takeoff.tsx', content);
