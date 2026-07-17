const fs = require('fs');
let fileStr = fs.readFileSync('src/components/RecentEstimates.tsx', 'utf8');

fileStr = fileStr.replace(/onDragStart=\{\(e\) => handleDragStart\(e, est.id\)\}/g, 'onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, est.id)}');
fileStr = fileStr.replace(/onDragOver=\{\(e\) => handleDragOver\(e, est.id\)\}/g, 'onDragOver={(e) => handleDragOver(e as unknown as React.DragEvent, est.id)}');

fs.writeFileSync('src/components/RecentEstimates.tsx', fileStr);
