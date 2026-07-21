const fs = require('fs');
const file = 'src/components/RecentEstimates.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /<motion\.div\s+layoutId={`recent-\${est\.id}`}[\s\S]*?className={`group relative col-span-1 bg-bg-card p-4 md:p-4 rounded-\[24px\] transition-all duration-300 flex flex-col items-center text-center border-2 \${est\.theme\.border} cursor-pointer hover:-translate-y-1\.5 shadow-sm hover:shadow-xl overflow-hidden \${dragOverId === est\.id \? "!border-indigo-500 shadow-indigo-500\/20" : ""} \${draggedId === est\.id \? "opacity-50" : "opacity-100"}`}/;

const newMotionDiv = `<motion.div
                    layoutId={\`recent-\${est.id}\`}
                    key={est.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, est.id)}
                    onDragOver={(e) => handleDragOver(e as unknown as React.DragEvent, est.id)}
                    onDrop={handleDrop}
                    whileHover={{ scale: 1.02, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    className={\`group relative col-span-1 bg-bg-card p-4 md:p-4 rounded-[24px] transition-all duration-300 flex flex-col items-center text-center border-2 \${est.theme.border} cursor-pointer shadow-sm hover:shadow-xl overflow-hidden \${dragOverId === est.id ? "!border-indigo-500 shadow-indigo-500/20" : ""} \${draggedId === est.id ? "opacity-50" : "opacity-100"}\`}`;

content = content.replace(regex, newMotionDiv);
fs.writeFileSync(file, content);
console.log('patched RecentEstimates');
