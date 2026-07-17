const fs = require('fs');

function updateFile(file, regex, replacement) {
  let fileStr = fs.readFileSync(file, 'utf8');
  fileStr = fileStr.replace(regex, replacement);
  fs.writeFileSync(file, fileStr);
}

// ToolHeader
updateFile('src/components/ui/ToolHeader.tsx', /<div className="md:max-w-7xl md:mx-auto w-full flex flex-col gap-8 px-4 md:px-0">/, '<div className="w-full flex flex-col gap-8">');

// DoorWindowSchedule
updateFile('src/components/modules/DoorWindowSchedule.tsx', /<div className="w-full md:max-w-5xl md:mx-auto space-y-6 px-4 md:px-0">/, '<div className="w-full space-y-6">');

console.log("Updated components layout constraints");
