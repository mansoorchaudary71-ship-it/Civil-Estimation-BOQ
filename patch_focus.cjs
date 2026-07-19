const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');

const target = `@layer base {
  html, body {
    overflow-x: hidden;
  }
  body {
    @apply antialiased subpixel-antialiased text-slate-900 dark:text-slate-50 bg-slate-50 dark:bg-slate-950 transition-colors duration-300 font-sans;
  }
}`;

const replacement = `@layer base {
  html, body {
    overflow-x: hidden;
  }
  body {
    @apply antialiased subpixel-antialiased text-slate-900 dark:text-slate-50 bg-slate-50 dark:bg-slate-950 transition-colors duration-300 font-sans;
  }

  /* Global Accessibility Focus Ring */
  *:focus-visible {
    @apply outline-none ring-2 ring-blue-600 dark:ring-blue-400 ring-offset-2 ring-offset-white dark:ring-offset-slate-950;
  }
}`;

if (css.includes(target)) {
  css = css.replace(target, replacement);
  fs.writeFileSync('src/index.css', css);
  console.log("Success");
} else {
  console.log("Not found! Here is what we have:");
  console.log(css.substring(0, 500));
}
