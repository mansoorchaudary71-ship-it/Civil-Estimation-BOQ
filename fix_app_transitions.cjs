const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// replace variants for hidden/show to be smooth
content = content.replace(/variants=\{\{\n\s*hidden: \{ opacity: 0, y: 15 \},\n\s*show: \{\s*opacity: 1,\s*y: 0,\s*transition: \{\s*duration: 0.3,\s*ease: "easeInOut",\s*staggerChildren: 0.15\s*\}\s*\},\n\s*exit: \{\s*opacity: 0,\s*y: -15,\s*transition: \{ duration: 0.3, ease: "easeInOut" \}\s*\}\s*\}\}/g, 
`variants={{
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1], staggerChildren: 0.15 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } }
}}`);

content = content.replace(/variants=\{\{ hidden: \{ opacity: 0, y: 20 \}, show: \{ opacity: 1, y: 0, transition: \{ duration: 0.5, ease: "easeOut" \} \} \}\}/g, 
`variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } } }}`);

content = content.replace(/variants=\{\{ hidden: \{ opacity: 0, y: 20 \}, show: \{ opacity: 1, y: 0, transition: \{ duration: 0.4 \} \} \}\}/g, 
`variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } } }}`);


fs.writeFileSync('src/App.tsx', content);

