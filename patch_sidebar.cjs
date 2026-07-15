const fs = require('fs');
const file = 'src/components/Sidebar.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `      {
        id: "ai-assistant-tool",
        label: "AI Estimator Assistant",
        icon: Sparkles,
        subTools: []
      },`;

const replaceStr = `      {
        id: "ai-assistant-tool",
        label: "AI Estimator Assistant",
        icon: Sparkles,
        subTools: []
      },
      {
        id: "team-collaboration",
        label: "Team Collaboration",
        icon: Users,
        subTools: []
      },`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replaceStr);
  fs.writeFileSync(file, content);
  console.log("Patched Sidebar");
} else {
  console.log("Could not find target string in Sidebar.tsx");
}
