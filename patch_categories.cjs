const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

code = code.replace(/category: "Infrastructure & Road Pavements"/g, 'category: "Infrastructure & Highway Engineering"');

fs.writeFileSync('src/components/Dashboard.tsx', code);
