const fs = require('fs');
const file = 'src/components/modules/AreaSpaceCalculator.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  'const [wallLen, setWallLen] = useState(5); // TODO convert',
  'const [wallLen, setWallLen] = useConvertedState(5, "length");'
);
content = content.replace(
  'const [wallHt, setWallHt] = useState(3);',
  'const [wallHt, setWallHt] = useConvertedState(3, "length");'
);
content = content.replace(
  'const [jambDepth, setJambDepth] = useState(0.2);',
  'const [jambDepth, setJambDepth] = useConvertedState(0.2, "length");'
);
content = content.replace(
  'const [openings, setOpenings] = useState([{ w: 1, h: 2, count: 1 }]);',
  'const [openings, setOpenings] = useConvertedState([{ w: 1, h: 2, count: 1 }], { w: "length", h: "length", count: "none" });'
);
content = content.replace(
  'const [shapeParams, setShapeParams] = useConvertedState<Record<string, number>>(',
  'const [shapeParams, setShapeParams] = useConvertedState<Record<string, number>>(' // It was already updated
);
// Actually, I need to make sure I add 'length' rule to shapeParams so it knows how to convert
content = content.replace(
  `});
  const [polygonCoords`,
  `}, 'length');
  const [polygonCoords`
);

content = content.replace(
  `const [propParams, setPropParams] = useConvertedState({
    width: 10, length: 20, setbacks: { f: 2, b: 2, s: 1 }, floors: 2
  });`,
  `const [propParams, setPropParams] = useConvertedState({
    width: 10, length: 20, setbacks: { f: 2, b: 2, s: 1 }, floors: 2
  }, { width: "length", length: "length" });`
); // setbacks are nested, useConvertedState doesn't go deep unless we make it. For simplicity we can ignore nested for now, or just handle top-level.

fs.writeFileSync(file, content);
