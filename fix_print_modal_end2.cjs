const fs = require('fs');
const file = '/app/applet/src/components/ui/PrintPreviewModal.tsx';
let content = fs.readFileSync(file, 'utf8');

// Find the iframe end
const iframeEnd = 'title="Print Preview PDF"\n            />\n          </motion.div>\n        </div>';
const startIndex = content.indexOf(iframeEnd);
if (startIndex !== -1) {
    const startOfReplace = startIndex + iframeEnd.length;
    const correctEnd = `
      </div>
    </motion.div>
  </motion.div>
  )}
  </AnimatePresence>,
  document.body
);
}
`;
    content = content.substring(0, startOfReplace) + correctEnd;
    fs.writeFileSync(file, content);
    console.log('Fixed end correctly.');
} else {
    console.log('Could not find iframe end');
}
