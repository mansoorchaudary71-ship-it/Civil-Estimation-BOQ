const fs = require('fs');
let content = fs.readFileSync('src/components/RecentEstimates.tsx', 'utf8');

// The easiest way is to use a regex to find the closing div of the map.
// </div>
//             );
//           })}
content = content.replace(
  '</div>\n            );\n          })}',
  '</motion.div>\n            );\n          })}'
);

if (!content.includes('motion/react')) {
  content = content.replace(
    'import React, { useState, useEffect } from "react";',
    'import React, { useState, useEffect } from "react";\nimport { motion } from "motion/react";'
  );
}

fs.writeFileSync('src/components/RecentEstimates.tsx', content);
console.log("Patched RecentEstimates.tsx");
