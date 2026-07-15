const fs = require('fs');
const file = 'package.json';
let content = fs.readFileSync(file, 'utf8');
const pkg = JSON.parse(content);

pkg.homepage = ".";
pkg.scripts.predeploy = "npm run build";
pkg.scripts.deploy = "gh-pages -d dist";

fs.writeFileSync(file, JSON.stringify(pkg, null, 2));
console.log("Patched package.json");
