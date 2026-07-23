const fs = require('fs');

let file = fs.readFileSync('src/components/calculators/PavementMixGradation.tsx', 'utf-8');

file = file.replace(
  `<Line 
                    type="monotone" 
                    dataKey="blended" 
                    name="Blended Mix" 
                    stroke="#8b5cf6" 
                    strokeWidth={3} 
                    dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                    activeDot={{ r: 6 }}
                  />`,
  `<Line 
                    type="monotone" 
                    dataKey="blended" 
                    name="Blended Mix" 
                    stroke="#8b5cf6" 
                    strokeWidth={3} 
                    dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                    activeDot={{ r: 6 }}
                    isAnimationActive={true}
                    animationDuration={500}
                    animationEasing="ease-in-out"
                  />`
);

fs.writeFileSync('src/components/calculators/PavementMixGradation.tsx', file);
console.log("Patched animation");
