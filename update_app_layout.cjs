const fs = require('fs');
let fileStr = fs.readFileSync('src/App.tsx', 'utf8');

fileStr = fileStr.replace(
  /<div className="flex-1 flex flex-col min-h-0 relative w-full bg-transparent overflow-x-hidden overflow-y-auto">\s*\{renderModule\(activeModule, handleSelectModule\)\}\s*<\/div>/g,
  `<div className="flex-1 flex flex-col min-h-0 relative w-full h-full overflow-y-auto overflow-x-hidden bg-transparent">
                                  <div className="max-w-7xl mx-auto w-full px-2 sm:px-4 md:px-8 flex-1 flex flex-col">
                                    <div className="global-form-card-wrapper w-full flex-1">
                                      {renderModule(activeModule, handleSelectModule)}
                                    </div>
                                  </div>
                                </div>`
);

fs.writeFileSync('src/App.tsx', fileStr);
console.log("Updated layout in App.tsx");
