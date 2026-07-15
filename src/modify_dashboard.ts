import * as fs from 'fs';
import * as path from 'path';

const filePath = path.join(process.cwd(), 'src/components/Dashboard.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// Update main container
content = content.replace(
  'className="flex-1 overflow-y-auto px-4 py-6 pb-12 w-full max-w-lg mx-auto"',
  'className="flex-1 overflow-y-auto px-4 md:px-8 py-6 md:py-10 pb-12 w-full max-w-7xl mx-auto"'
);

// Update grid container
content = content.replace(
  '<div className="grid grid-cols-2 gap-4">',
  '<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">'
);

// Update MARKET RATES span
content = content.replace(
  /className="col-span-2 relative bg-white([^"]*?) group"/g,
  (match, p1) => {
    if (match.includes('MARKET RATES')) {
      return `className="col-span-2 lg:col-span-2 relative bg-white${p1} group"`;
    }
    return match;
  }
);
content = content.replace(
  'className="col-span-2 relative bg-white p-6 rounded-[32px] border border-gray-100 flex justify-between items-center text-left hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(15,23,42,0.05)] transition-all overflow-hidden group"',
  'className="col-span-2 lg:col-span-2 relative bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 flex justify-between items-center text-left hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(15,23,42,0.05)] transition-all overflow-hidden group"'
);

// Update HOUSE ESTIMATOR
content = content.replace(
  'className="col-span-2 relative bg-gradient-to-br   p-5 rounded-[32px] border border-blue-500 flex flex-col text-left hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(37,99,235,0.4)] transition-all overflow-hidden group min-h-[140px]"',
  'className="col-span-2 lg:col-span-2 relative bg-gradient-to-br   p-6 md:p-8 rounded-[32px] border border-blue-500 flex flex-col text-left hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(37,99,235,0.4)] transition-all overflow-hidden group min-h-[160px]"'
);

// Update 2D TAKEOFF
content = content.replace(
  'className="col-span-2 relative bg-white p-6 rounded-[32px] border border-gray-100 flex justify-between items-center text-left hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(15,23,42,0.05)] transition-all overflow-hidden group"',
  'className="col-span-2 lg:col-span-2 relative bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 flex justify-between items-center text-left hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(15,23,42,0.05)] transition-all overflow-hidden group"'
);

// Update AI ASSISTANT
content = content.replace(
  'className="col-span-2 relative bg-[#09090b] p-6 rounded-[32px] border border-[#27272a] flex justify-between items-center text-left hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(15,23,42,0.3)] transition-all overflow-hidden group mt-2"',
  'className="col-span-2 md:col-span-3 lg:col-span-4 relative bg-[#09090b] p-6 md:p-8 rounded-[32px] border border-[#27272a] flex justify-between items-center text-left hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(15,23,42,0.3)] transition-all overflow-hidden group lg:mt-4"'
);

fs.writeFileSync(filePath, content, 'utf-8');
