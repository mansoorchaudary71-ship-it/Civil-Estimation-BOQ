const fs = require('fs');
let file = fs.readFileSync('src/App.tsx', 'utf8');

const returnTarget = `<ToolHeader id={id} title={actualTitle} themeType={themeType} subtitle={subtitle} icon={Icon} onNavigate={onNavigate} />`;
const returnReplacement = `<div className="pt-6 pb-2 relative z-10 print:hidden">
          <Breadcrumb items={[
            { label: 'Home', onClick: () => onNavigate('home'), isHome: true },
            { label: category },
            { label: actualTitle }
          ]} />
        </div>
        <ToolHeader id={id} title={actualTitle} themeType={themeType} subtitle={subtitle} icon={Icon} onNavigate={onNavigate} />`;

file = file.replace(returnTarget, returnReplacement);
fs.writeFileSync('src/App.tsx', file);
console.log("Done patching breadcrumb return");
