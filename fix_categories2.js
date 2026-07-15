const fs = require('fs');
let content = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

const regex = /<div key=\{groupName\} className=\{`flex flex-col gap-5 py-8 px-4 sm:px-6 md:px-8 rounded-\[32px\] \$\{index % 2 === 0 \? 'bg-\[#F4F1EA\]' : 'bg-transparent'\}\`\}>/g;

content = content.replace(regex, `<div key={groupName} className={\`relative w-screen left-[50%] right-[50%] -ml-[50vw] -mr-[50vw] py-10 \${index % 2 === 0 ? 'bg-[#F4F1EA]' : 'bg-transparent'}\`}>
  <div className="w-full md:max-w-[1400px] md:mx-auto px-4 flex flex-col gap-5">`);

// Now we need to close the extra div for each map iteration.
// The end of the return statement is:
/*
                </div>
              </div>
            );
          })}
*/

content = content.replace(/<\/div>\n\s*<\/div>\n\s*\);\n\s*\}\)/g, '</div>\n  </div>\n</div>\n            );\n          })');

fs.writeFileSync('src/components/Dashboard.tsx', content);
