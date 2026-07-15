const fs = require('fs');
const file = 'src/components/Sidebar.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `const SIDEBAR_DATA: MainCategory[] = [`;

const replaceStr = `const SIDEBAR_DATA: MainCategory[] = [
  {
    id: "team",
    label: "Team & Projects",
    icon: Users,
    tools: [
      {
        id: "team-collaboration",
        label: "Team Collaboration",
        icon: Users,
        subTools: []
      }
    ]
  },`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replaceStr);
  fs.writeFileSync(file, content);
  console.log("Patched Sidebar");
} else {
  console.log("Could not find target string in Sidebar.tsx");
}
