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
    
    // Replace text-slate-[789]00 with text-white when they co-occur with certain bg colors
    // We look for 'bg-xxxx' followed by 'text-xxxx' within the same string literal.
    
    // Simpler: Just find the exact patterns: 'bg-purple-600 text-slate-900', etc.
    // Or we replace independently in any string literal or template chunk that contains BOTH
    
    content = content.replace(/(['"`])([^'"`]*?)\1/g, (match, quote, inner) => {
        if ((inner.includes('bg-indigo-600') || inner.includes('bg-indigo-500') || inner.includes('bg-indigo-700') || 
             inner.includes('bg-purple-600') || inner.includes('bg-purple-500') || inner.includes('bg-purple-700') ||
             inner.includes('bg-[#1E293B]') || inner.includes('bg-pink-600') || inner.includes('bg-blue-600')) 
            && (inner.includes('text-slate-900') || inner.includes('text-slate-800') || inner.includes('text-slate-700') || inner.includes('text-[#1E293B]'))) {
            
            return quote + inner.replace(/text-slate-900/g, 'text-white')
                                .replace(/text-slate-800/g, 'text-white')
                                .replace(/text-slate-700/g, 'text-white')
                                .replace(/text-\[#1E293B\]/g, 'text-white') + quote;
        }
        return match;
    });

    if (content !== original) {
        fs.writeFileSync(file, content);
        console.log(`Updated ${file}`);
    }
});
