const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

if (!content.includes('BOQProvider')) {
  // Add imports
  content = content.replace(
    'import { ThemeProvider } from "./context/ThemeContext";',
    'import { ThemeProvider } from "./context/ThemeContext";\nimport { BOQProvider } from "./contexts/BOQContext";\nimport MasterBOQDrawer from "./components/boq/MasterBOQDrawer";\nimport { FileText } from "lucide-react";'
  );

  // Add state for drawer
  content = content.replace(
    'const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);',
    'const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);\n  const [isBOQOpen, setIsBOQOpen] = useState(false);'
  );

  // Wrap with BOQProvider and add drawer + button
  content = content.replace(
    '<ProjectProvider>',
    '<BOQProvider>\n          <ProjectProvider>'
  );
  content = content.replace(
    '</ProjectProvider>',
    '</ProjectProvider>\n          <MasterBOQDrawer isOpen={isBOQOpen} onClose={() => setIsBOQOpen(false)} />\n          <button onClick={() => setIsBOQOpen(true)} className="fixed bottom-6 right-6 p-4 bg-indigo-600 text-white rounded-full shadow-xl hover:bg-indigo-700 hover:scale-105 transition-all z-40 flex items-center justify-center"><FileText size={24}/></button>\n          </BOQProvider>'
  );

  fs.writeFileSync('src/App.tsx', content);
  console.log('App patched');
}
