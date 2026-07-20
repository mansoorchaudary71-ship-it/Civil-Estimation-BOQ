const fs = require('fs');
const file = '/app/applet/src/components/Footer.tsx';
let content = fs.readFileSync(file, 'utf8');

const target1 = `                      <span className={\`absolute bottom-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-[#d4af37]/0 via-[#d4af37] to-[#d4af37]/0 -translate-x-[101%] group-hover:translate-x-0 transition-transform duration-500 ease-out \${activeModule === id ? 'translate-x-0' : ''}\`}></span>`;
const replace1 = `                      <span className={\`absolute bottom-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-transparent via-[#d4af37] to-transparent -translate-x-[100%] group-hover:translate-x-0 transition-transform duration-500 ease-out \${activeModule === id ? 'translate-x-0' : ''}\`}></span>`;

const target2 = `                      <span className={\`absolute bottom-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-blue-400/0 via-blue-400 to-blue-400/0 -translate-x-[101%] group-hover:translate-x-0 transition-transform duration-500 ease-out \${activeModule === id ? 'translate-x-0' : ''}\`}></span>`;
const replace2 = `                      <span className={\`absolute bottom-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-transparent via-blue-400 to-transparent -translate-x-[100%] group-hover:translate-x-0 transition-transform duration-500 ease-out \${activeModule === id ? 'translate-x-0' : ''}\`}></span>`;

const target3 = `                <span className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-[#d4af37]/0 via-[#d4af37] to-[#d4af37]/0 -translate-x-[101%] group-hover:translate-x-0 transition-transform duration-500 ease-out"></span>`;
const replace3 = `                <span className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#d4af37] to-transparent -translate-x-[100%] group-hover:translate-x-0 transition-transform duration-500 ease-out"></span>`;

const target4 = `                <span className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-blue-400/0 via-blue-400 to-blue-400/0 -translate-x-[101%] group-hover:translate-x-0 transition-transform duration-500 ease-out"></span>`;
const replace4 = `                <span className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-400 to-transparent -translate-x-[100%] group-hover:translate-x-0 transition-transform duration-500 ease-out"></span>`;

content = content.replace(target1, replace1);
content = content.replace(target2, replace2);
content = content.replace(target3, replace3);
content = content.replace(target4, replace4);

fs.writeFileSync(file, content);
console.log('Fixed Footer.tsx hover effects');
