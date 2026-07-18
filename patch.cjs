const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf-8');
const target = `  /* Add page breaks where needed */
  .page-break-before {
    page-break-before: always !important;
    break-before: page !important;
  }
  .page-break-after {
    page-break-after: always !important;
    break-after: page !important;
  }
  .page-break-inside-avoid {
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }`;

const replacement = target + `
  
  /* Force page break after every 20 rows in BOQ tables */
  .boq-table-print-breaks tbody tr:nth-child(20n) {
    page-break-after: always !important;
    break-after: page !important;
  }`;

if (css.includes(target)) {
  css = css.replace(target, replacement);
  fs.writeFileSync('src/index.css', css);
  console.log("Patched successfully");
} else {
  console.log("Target not found");
}
