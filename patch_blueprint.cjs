const fs = require('fs');
const file = 'firebase-blueprint.json';
let data = JSON.parse(fs.readFileSync(file, 'utf8'));

data.entities.Project.properties.shareLinkEnabled = { "type": "boolean" };
data.entities.Project.properties.shareToken = { "type": "string" };
data.entities.Project.properties.shareRole = { "type": "string" };
data.entities.Project.properties.lastUsedShareToken = { "type": "string" };

fs.writeFileSync(file, JSON.stringify(data, null, 2));
console.log("Patched blueprint");
