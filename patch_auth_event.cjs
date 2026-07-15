const fs = require('fs');
const file = 'src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `  const { user, logOut } = useAuth();`;
const replaceStr = `  const { user, logOut } = useAuth();

  useEffect(() => {
    const handleOpenAuth = () => setIsAuthOpen(true);
    window.addEventListener("open-login-modal", handleOpenAuth);
    return () => window.removeEventListener("open-login-modal", handleOpenAuth);
  }, []);`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replaceStr);
  fs.writeFileSync(file, content);
  console.log("Patched Auth Event listener");
}
