const fs = require('fs');
const file = 'src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /const location = useLocation\(\);[\s\S]*?}, \[activeModule\]\);/m;

const replacement = `const location = useLocation();
  const navigate = useNavigate();

  const [activeModule, setActiveModule] = useState<ModuleId>(() => {
    const hash = window.location.hash;
    if (hash.startsWith("#/join/")) {
      return "join-project";
    }
    if (hash.startsWith("#/team")) {
      return "team-collaboration";
    }
    const saved = sessionStorage.getItem("activeModule");
    return (saved as ModuleId) || "home";
  });

  useEffect(() => {
    if (location.pathname.startsWith('/join/')) {
      setActiveModule('join-project');
    } else if (location.pathname === '/team') {
      setActiveModule('team-collaboration');
    }
  }, [location]);

  useEffect(() => {
    sessionStorage.setItem("activeModule", activeModule);
  }, [activeModule]);`;

content = content.replace(regex, replacement);
fs.writeFileSync(file, content);
console.log("Patched App fix");
