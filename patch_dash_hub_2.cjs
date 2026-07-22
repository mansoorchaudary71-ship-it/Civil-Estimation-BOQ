const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

const startIdx = code.indexOf('<div className="flex flex-col w-full">');
if (startIdx !== -1) {
    const endStr = '<div className="w-full md:max-w-[1400px] md:mx-auto px-4 py-8"><AIEstimatorBanner';
    const endIdx = code.indexOf(endStr);
    
    if (endIdx !== -1) {
        const replacement = '<CategoryHub groupedModules={groupedModules} groupsToDisplay={groupsToDisplay} handleSelect={handleSelect} isComputing={isComputing} />\n                ';
        code = code.substring(0, startIdx) + replacement + code.substring(endIdx);
        fs.writeFileSync('src/components/Dashboard.tsx', code);
    } else {
        console.log("end not found");
    }
} else {
    console.log("start not found");
}
