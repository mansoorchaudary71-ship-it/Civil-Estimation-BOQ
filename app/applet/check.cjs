const fs = require('fs');
console.log("CWD:", process.cwd());
console.log("Files:", fs.readdirSync(process.cwd()));
console.log("src Files:", fs.existsSync('./src') ? fs.readdirSync('./src') : 'No src');
console.log("src/components Files:", fs.existsSync('./src/components') ? fs.readdirSync('./src/components') : 'No src/components');
