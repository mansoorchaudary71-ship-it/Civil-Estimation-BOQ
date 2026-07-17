const fs = require('fs');

let fileStr = fs.readFileSync('src/App.tsx', 'utf8');

// Remove import Sidebar
fileStr = fileStr.replace(/import Sidebar from "\.\/components\/Sidebar";\n/g, '');

// Remove isSidebarOpen state
fileStr = fileStr.replace(/const \[isSidebarOpen, setIsSidebarOpen\] = useState\(\(\) => \{ const saved = localStorage\.getItem\("isSidebarOpen"\); return saved !== null \? JSON\.parse\(saved\) : false; \}\); useEffect\(\(\) => \{ localStorage\.setItem\("isSidebarOpen", JSON\.stringify\(isSidebarOpen\)\); \}, \[isSidebarOpen\]\);\n/g, '');

// Remove setIsSidebarOpen(false); calls
fileStr = fileStr.replace(/setIsSidebarOpen\(false\);\n/g, '');
fileStr = fileStr.replace(/setIsSidebarOpen\(false\);/g, '');

// Remove Sidebar component
fileStr = fileStr.replace(/<Sidebar[\s\S]*?\/>\n/g, '');

// Update Dashboard props
fileStr = fileStr.replace(/onOpenSidebar=\{\(\) => setIsSidebarOpen\(true\)\}/g, '');

fs.writeFileSync('src/App.tsx', fileStr);
console.log("Updated App.tsx");
