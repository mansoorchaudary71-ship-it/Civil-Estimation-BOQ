const fs = require('fs');
const file = 'src/components/modules/AggregateBlendingCalculator.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace lazy import with regular import
content = content.replace('import React, { useState, useEffect, useMemo, lazy, Suspense } from "react";', 'import React, { useState, useEffect, useMemo } from "react";\nimport AggregateChart from "./AggregateChart";');
content = content.replace('const LazyAggregateChart = lazy(() => import("./AggregateChart"));', '');

// Replace usage
content = content.replace(/<Suspense fallback=\{[^}]+\}>\s*<LazyAggregateChart data=\{chartData\} \/>\s*<\/Suspense>/g, '<AggregateChart data={chartData} />');

fs.writeFileSync(file, content);
