const fs = require('fs');
let content = fs.readFileSync('src/components/modules/UnitConverter.tsx', 'utf-8');

const target = `                    <motion.div
                      key={toValue || "0"}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 25 }}
                    >`;

const replacement = `                    <motion.div
                      key={toValue || "0"}
                      initial={{ rotateX: 90, opacity: 0 }}
                      animate={{ rotateX: 0, opacity: 1 }}
                      exit={{ rotateX: -90, opacity: 0 }}
                      transition={{ duration: 0.4, type: "spring", stiffness: 200, damping: 20 }}
                      style={{ transformOrigin: "center" }}
                    >`;

content = content.replace(target, replacement);

fs.writeFileSync('src/components/modules/UnitConverter.tsx', content);
