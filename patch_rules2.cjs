const fs = require('fs');
const file = 'firestore.rules';
let content = fs.readFileSync(file, 'utf8');

const oldGet = `allow get: if isSignedIn() && existing().memberIds.hasAny([request.auth.uid]);`;
const newGet = `allow get: if isSignedIn() && (existing().memberIds.hasAny([request.auth.uid]) || existing().shareLinkEnabled == true);`;

if (content.includes(oldGet)) {
  content = content.replace(oldGet, newGet);
  fs.writeFileSync(file, content);
  console.log("Patched get rule");
}
