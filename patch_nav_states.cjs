const fs = require('fs');

const cssPath = 'src/index.css';
let css = fs.readFileSync(cssPath, 'utf8');

const navStates = `
  /* Navigation Hover & Active */
  nav a:hover, [class*="nav"] a:hover, header a:hover {
    color: #0f172a; /* slate-900 */
    opacity: 1 !important;
  }
  .dark nav a:hover, .dark [class*="nav"] a:hover, .dark header a:hover {
    color: #f8fafc; /* slate-50 */
  }
  
  /* Inputs */
  input:focus, textarea:focus, select:focus {
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5); /* Focus ring */
    outline: none;
  }
`;

if (!css.includes('/* Navigation Hover & Active */')) {
  // insert before the end of the file or append
  css = css + '\n\n' + navStates;
  fs.writeFileSync(cssPath, css, 'utf8');
  console.log("Nav states added.");
}
