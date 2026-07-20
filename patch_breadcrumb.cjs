const fs = require('fs');
let file = fs.readFileSync('src/App.tsx', 'utf8');

const importTarget = `import { ToolHeader } from "./components/ui/ToolHeader";`;
const importReplacement = `import { ToolHeader } from "./components/ui/ToolHeader";
import Breadcrumb from "./components/Breadcrumb";`;
file = file.replace(importTarget, importReplacement);

const returnTarget = `  return (
    <div className="flex-1 flex flex-col relative w-full bg-transparent">
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col">
        <ToolHeader id={id} title={actualTitle} themeType={themeType} subtitle={subtitle} icon={Icon} onNavigate={onNavigate} />`;

const returnReplacement = `  return (
    <div className="flex-1 flex flex-col relative w-full bg-transparent">
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col">
        <div className="pt-6 -mb-4 relative z-10 print:hidden">
          <Breadcrumb items={[
            { label: 'Home', onClick: () => onNavigate('home'), isHome: true },
            { label: category },
            { label: actualTitle }
          ]} />
        </div>
        <ToolHeader id={id} title={actualTitle} themeType={themeType} subtitle={subtitle} icon={Icon} onNavigate={onNavigate} />`;

file = file.replace(returnTarget, returnReplacement);

fs.writeFileSync('src/App.tsx', file);
console.log("Done patching breadcrumb.");
