const fs = require('fs');

let fileStr = fs.readFileSync('src/components/modules/AreaSpaceCalculator.tsx', 'utf8');

fileStr = fileStr.replace(/const \[wallLen, setWallLen\] = useConvertedState\(5, "length"\);/, 'const [wallLen, setWallLen] = useConvertedState<number>(5, "length");');
fileStr = fileStr.replace(/const \[wallHt, setWallHt\] = useConvertedState\(3, "length"\);/, 'const [wallHt, setWallHt] = useConvertedState<number>(3, "length");');
fileStr = fileStr.replace(/const \[jambDepth, setJambDepth\] = useConvertedState\(0\.2, "length"\);/, 'const [jambDepth, setJambDepth] = useConvertedState<number>(0.2, "length");');
fileStr = fileStr.replace(/const \[openings, setOpenings\] = useConvertedState\(\[\{ w: 1, h: 2, count: 1 \}\], \{ w: "length", h: "length", count: "none" \}\);/, 'const [openings, setOpenings] = useConvertedState<any[]>([{ w: 1, h: 2, count: 1 }], "length");');

fs.writeFileSync('src/components/modules/AreaSpaceCalculator.tsx', fileStr);
