import fs from 'fs';
console.log("CWD:", process.cwd());
console.log("Files:", fs.readdirSync(process.cwd()));
console.log("src Files:", fs.existsSync('./src') ? fs.readdirSync('./src') : 'No src');
