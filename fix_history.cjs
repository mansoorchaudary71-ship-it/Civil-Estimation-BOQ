const fs = require('fs');

const file = 'src/components/RecentSidebar.tsx';
let content = fs.readFileSync(file, 'utf8');

// replace localstorage logic with useRecentTools
content = content.replace(
    'const [recentTools, setRecentTools] = useState<string[]>([]);',
    'const { recentTools } = useRecentTools();'
);

content = content.replace(
    `  useEffect(() => {
    const fetchRecent = () => {
      try {
        const history = JSON.parse(localStorage.getItem("recent_calculators") || "[]");
        setRecentTools(history);
      } catch (e) {
        setRecentTools([]);
      }
    };
    if (isOpen) {
      fetchRecent();
    }
    window.addEventListener("recent_calculators_updated", fetchRecent);
    return () => window.removeEventListener("recent_calculators_updated", fetchRecent);
  }, [isOpen]);`,
    ''
);

content = content.replace(
    'import { ALL_MODULES } from "./Dashboard";',
    'import { ALL_MODULES } from "./Dashboard";\nimport { useRecentTools } from "../hooks/useRecentTools";'
);

content = content.replace(
    'onNavigate: (id: string) => void;',
    'onNavigate: (id: string, inputs?: any) => void;'
);

content = content.replace(
    'recentTools.map((id, index) => {',
    'recentTools.map((tool, index) => {\n                  const id = tool.id;'
);

content = content.replace(
    'onNavigate(id);',
    'onNavigate(id, tool.lastInputs);'
);

fs.writeFileSync(file, content);
console.log('Fixed RecentSidebar to use useRecentTools');
