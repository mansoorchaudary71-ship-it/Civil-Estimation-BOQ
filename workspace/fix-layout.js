const fs = require('fs');
const path = require('path');

const dirs = ['src/components/modules', 'src/components/ui'];

dirs.forEach(dir => {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));

    for (const file of files) {
        const filePath = path.join(dir, file);
        let content = fs.readFileSync(filePath, 'utf8');
        let original = content;

        // 1. Remove rigid width/height constraints that distort tabs/results
        // We shouldn't blindly remove ALL w-12, h-full etc as they might be used for icons/layouts.
        // But the user specifically mentioned tabs and result cards wrapping.
        // Replacing `break-all` and `break-words` with `whitespace-nowrap`:
        content = content.replace(/\bbreak-all\b/g, 'whitespace-nowrap');
        content = content.replace(/\bbreak-words\b/g, 'whitespace-nowrap');

        // 2. Prevent awkward wrapping of numerical values and units
        // Target big text elements and labels in result cards
        content = content.replace(/className="([^"]*\btext-(?:lg|xl|2xl|3xl|4xl|5xl)\b[^"]*)"/g, (match, classes) => {
            if (!classes.includes('whitespace-nowrap')) {
                return `className="${classes.trim()} whitespace-nowrap"`;
            }
            return match;
        });
        content = content.replace(/className="([^"]*\btext-(?:xs|sm)\b[^"]*\buppercase\b[^"]*)"/g, (match, classes) => {
            if (!classes.includes('whitespace-nowrap')) {
                return `className="${classes.trim()} whitespace-nowrap"`;
            }
            return match;
        });

        // 3. Flexible Flexbox/Grid on result cards
        // Find grid containers containing cards and change them to flex flex-wrap
        // A common pattern is grid grid-cols-X gap-Y for the result sections.
        // We can replace generic grid layouts for these result cards to flex layouts.
        
        // This regex finds <div className="... grid grid-cols-... "> right before a result card div.
        content = content.replace(/className="([^"]*\bgrid\b[^"]*\bgrid-cols-\d\b[^"]*)"(>\s*<div className="[^"]*(p-[3456]|p-8)[^"]*(rounded-2xl|rounded-3xl|rounded-xl)[^"]*)/g, (match, gridClasses, nextDiv) => {
            // Replace grid-related Tailwind classes with flex properties
            let newClasses = gridClasses
                .replace(/\bgrid\b/g, 'flex flex-wrap')
                .replace(/\bgrid-cols-\d\b/g, '')
                .replace(/\b(w-full)?\s*sm:grid-cols-\d\b/g, '')
                .replace(/\bmd:grid-cols-\d\b/g, '')
                .replace(/\blg:grid-cols-\d\b/g, '')
                .replace(/\bxl:grid-cols-\d\b/g, '')
                .replace(/\s+/g, ' ').trim();
            // Ensure gap is present, items-center
            if (!newClasses.includes('gap-')) newClasses += ' gap-4';
            return `className="${newClasses} items-center justify-center w-full"${nextDiv}`;
        });

        // 4. Update the actual result card classes
        // Give them flex-grow, min-w-fit, whitespace-nowrap, proper padding
        content = content.replace(/className="([^"]*(?:bg-white|bg-slate-\d+|bg-gray-\d+|bg-[a-z]+-50\/?[0-9]*)[^"]*(?:rounded-2xl|rounded-3xl|rounded-xl|rounded-\[1\.5rem\])[^"]*)"/g, (match, classes) => {
            // We want to target boxes that look like result cards
            if (classes.includes('flex flex-col items-center text-center') || classes.includes('shadow') || classes.includes('border')) {
                let newClasses = classes;
                if (!newClasses.includes('flex-1') && !newClasses.includes('flex-auto')) newClasses += ' flex-1 min-w-[fit-content] whitespace-nowrap';
                
                // Normalizing padding to px-4 py-3 as requested (if p-5 or p-6 is used, we can leave it or replace it)
                // Actually the user stated: "using w-auto or min-w-fit and balanced padding (px-4 py-3) so they look proportionate"
                newClasses = newClasses.replace(/\bp-[4568]\b/g, 'px-4 py-3');
                
                // Ensure proper flex layout inside the box
                if (!newClasses.includes('flex') && !newClasses.includes('block')) {
                    newClasses += ' flex flex-col items-center justify-center gap-2 text-center';
                }
                
                // Remove rigid widths/heights from these cards
                newClasses = newClasses.replace(/\bw-(12|16|20|24|32|40|48|56|64)\b/g, 'w-auto');
                newClasses = newClasses.replace(/\bh-(12|16|20|24|32|40|48|56|64|full)\b/g, 'h-auto');

                // Cleanup spaces
                newClasses = newClasses.replace(/\s+/g, ' ').trim();
                return `className="${newClasses}"`;
            }
            return match;
        });

        if (content !== original) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Updated ${file}`);
        }
    }
});
