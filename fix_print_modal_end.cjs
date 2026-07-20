const fs = require('fs');
const file = '/app/applet/src/components/ui/PrintPreviewModal.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetEnd = `</div>
      </div>
    </div>,
    document.body
  );
}`;

const newEnd = `        </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}`;

// it failed to replace earlier because the indentation was slightly off or newlines didn't match.
// I will use regex or find last index.
const lastComma = content.lastIndexOf(',\n    document.body');
if (lastComma !== -1) {
    const endStr = `        </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>`;
    const beforeComma = content.lastIndexOf('</motion.div>', lastComma);
    // actually, let's just rewrite the end
    // we know it ends with document.body); }
}

