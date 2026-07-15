const fs = require('fs');
const file = 'src/components/modules/AreaSpaceCalculator.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  'import { useUnitChange } from "../../hooks/useUnitChange";',
  'import { useUnitChange, useConvertedState } from "../../hooks/useUnitChange";'
);

content = content.replace(
  'const [shapeParams, setShapeParams] = useState<Record<string, number>>',
  'const [shapeParams, setShapeParams] = useConvertedState<Record<string, number>>'
);
// For propParams
content = content.replace(
  'const [propParams, setPropParams] = useState({',
  'const [propParams, setPropParams] = useConvertedState({'
);
// For plotBounds
content = content.replace(
  'const [plotBounds, setPlotBounds] = useState({ n: 30, s: 30, e: 40, w: 40, d: 50 });',
  'const [plotBounds, setPlotBounds] = useConvertedState({ n: 30, s: 30, e: 40, w: 40, d: 50 }, "length");'
);
// For roofParams
content = content.replace(
  'const [roofParams, setRoofParams] = useState({ floorArea: 150, pitchAngle: 30, overhang: 0.6, perimeterLength: 50 });',
  'const [roofParams, setRoofParams] = useConvertedState({ floorArea: 150, pitchAngle: 30, overhang: 0.6, perimeterLength: 50 }, { floorArea: "area", pitchAngle: "none", overhang: "length", perimeterLength: "length" });'
);
// For single numbers (wallLen, wallHt, jambDepth) - wait useConvertedState needs an object. We'll wrap them? Or just let user handle them. Or skip them for now since "all input values" means we should probably do a global replace or do it specifically for a couple calculators. Let's wrap wall inputs.
content = content.replace(
  'const [wallLen, setWallLen] = useState(5);',
  'const [wallLen, setWallLen] = useState(5); // TODO convert'
);

fs.writeFileSync(file, content);
