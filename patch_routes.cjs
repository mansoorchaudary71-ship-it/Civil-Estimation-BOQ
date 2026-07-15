const fs = require('fs');
const file = 'src/routes.jsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `  {
    path: "/about",`;
    
const replaceStr = `  {
    path: "/team",
    async lazy() {
      const { default: TeamCollaboration } = await import("./components/pages/TeamCollaboration");
      return { element: <TeamCollaboration /> };
    }
  },
  {
    path: "/join/:projectId/:shareToken",
    async lazy() {
      const { default: JoinProject } = await import("./components/pages/JoinProject");
      return { element: <JoinProject /> };
    }
  },
  {
    path: "/about",`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replaceStr);
  fs.writeFileSync(file, content);
  console.log("Patched routes");
} else {
  console.log("Could not find target string");
}
