const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if (file.endsWith('.tsx') || file.endsWith('.ts')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('./src');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    content = content.replace(/className=(["`'])([^"`']*?)\1/g, (match, quote, classNames) => {
        if ((classNames.includes('bg-indigo-600') || classNames.includes('bg-indigo-500') || classNames.includes('bg-indigo-700') || 
             classNames.includes('bg-purple-600') || classNames.includes('bg-purple-500') || classNames.includes('bg-purple-700') ||
             classNames.includes('bg-pink-600') || classNames.includes('bg-blue-600')) 
            && (classNames.includes('text-slate-900') || classNames.includes('text-slate-800') || classNames.includes('text-[#1E293B]') || classNames.includes('text-slate-700'))) {
            
            return `className=${quote}${classNames.replace(/text-slate-900/g, 'text-white')
                                            .replace(/text-slate-800/g, 'text-white')
                                            .replace(/text-\[#1E293B\]/g, 'text-white')
                                            .replace(/text-slate-700/g, 'text-white')}${quote}`;
        }
        return match;
    });

    if (content !== original) {
        fs.writeFileSync(file, content);
        console.log(`Updated ${file}`);
    }
});
