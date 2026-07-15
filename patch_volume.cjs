const fs = require('fs');
const file = 'src/components/modules/VolumeEstimator.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  'import React, { useState, useMemo } from "react";',
  'import React, { useState, useMemo } from "react";\nimport { useConvertedState } from "../../hooks/useUnitChange";'
);

const varsToConvert = [
  'length', 'width', 'height', 'side', 'radius', 'topRadius', 'bottomRadius',
  'base', 'topWidth', 'bottomWidth', 'depth',
  'outerDiameter', 'innerDiameter', 'slopedHeight', 'outletLength', 'outletWidth'
];

varsToConvert.forEach(v => {
  const cap = v.charAt(0).toUpperCase() + v.slice(1);
  content = content.replace(
    `const [${v}, set${cap}] = useState("");`,
    `const [${v}, set${cap}] = useConvertedState("", "length");`
  );
});

content = content.replace(
  'const [baseArea, setBaseArea] = useState("");',
  'const [baseArea, setBaseArea] = useConvertedState("", "area");'
);
content = content.replace(
  'const [basePerimeter, setBasePerimeter] = useState("");',
  'const [basePerimeter, setBasePerimeter] = useConvertedState("", "length");'
);
content = content.replace(
  'const [deadStorageDepth, setDeadStorageDepth] = useState("");',
  'const [deadStorageDepth, setDeadStorageDepth] = useConvertedState("", "length");'
);

fs.writeFileSync(file, content);
