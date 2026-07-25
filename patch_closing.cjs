const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /<\/AnimatePresence>\s*<\/motion\.div>\s*<\/motion\.main>\s*<\/div>\s*<\/div>/m,
  `</AnimatePresence>\n                        </motion.div>\n                      </motion.div>\n                    </motion.main>\n                  </div>\n                </div>`
);

fs.writeFileSync('src/App.tsx', code);
