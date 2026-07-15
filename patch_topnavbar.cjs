const fs = require('fs');
const file = 'src/components/TopNavbar.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace('import { User } from "lucide-react";', 'import { User } from "lucide-react";\nimport { useNavigate } from "react-router-dom";');

const targetStr = `  const { settings, toggleTheme } = useSettings();`;
const replaceStr = `  const { settings, toggleTheme } = useSettings();
  const navigate = useNavigate();`;

content = content.replace(targetStr, replaceStr);

const clickStr = `onClick={() => onNavigate && onNavigate("home")}`;
const newClickStr = `onClick={() => onNavigate ? onNavigate("home") : navigate("/")}`;
content = content.replace(clickStr, newClickStr);

const authStr = `onClick={() => user ? (onOpenProfile && onOpenProfile()) : (onOpenAuth && onOpenAuth())}`;
const newAuthStr = `onClick={() => user ? (onOpenProfile ? onOpenProfile() : null) : (onOpenAuth ? onOpenAuth() : window.dispatchEvent(new CustomEvent("open-login-modal")))}`;
content = content.replace(authStr, newAuthStr);

fs.writeFileSync(file, content);
console.log("Patched TopNavbar");
