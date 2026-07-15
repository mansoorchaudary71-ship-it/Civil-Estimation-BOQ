const fs = require('fs');
const file = 'src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add imports
content = content.replace('import React, { useState, useEffect, useRef } from "react";', 'import React, { useState, useEffect, useRef } from "react";\nimport { useLocation, useNavigate } from "react-router-dom";\nimport TeamCollaboration from "./components/pages/TeamCollaboration";\nimport JoinProject from "./components/pages/JoinProject";');

// 2. Add hook usage and useEffect
const targetState = `  const [activeModule, setActiveModule] = useState<ModuleId>(() => {`;
const replaceState = `  const location = useLocation();
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
    } else {
      // Optional: sync activeModule to path if needed, but here we just handle specific routes
    }
  }, [location]);`;
content = content.replace(targetState, replaceState);

// 3. Render new modules
const renderTarget = `    case "pricing":
      return <PricingPage onNavigate={onNavigate} />;`;
const renderReplace = `    case "pricing":
      return <PricingPage onNavigate={onNavigate} />;
    case "team-collaboration":
      return <TeamCollaboration />;
    case "join-project":
      return <JoinProject />;`;
content = content.replace(renderTarget, renderReplace);

fs.writeFileSync(file, content);
console.log("Patched App routing");
