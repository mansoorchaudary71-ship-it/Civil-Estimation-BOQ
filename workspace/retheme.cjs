const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.css')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('./src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Replace text-indigo-something, bg-indigo-something with our new colors.
  // For highlights: text-indigo-600 -> text-[#1A1A1A] (or #EDED78 depending on context)
  // Let's systematically replace common colors based on the user's instructions.
  
  // "All primary buttons → background #1A1A1A, text #EDED78, border-radius 999px"
  // "All focus rings / input outlines → 2px solid #EDED78"
  // "OLD purple (#6366f1 or similar indigo) → NEW #EDED78 for highlights, #1A1A1A for dark surfaces"
  
  // Let's replace 'bg-indigo-600 text-white' -> 'bg-[#1A1A1A] text-[#EDED78]'
  content = content.replace(/bg-indigo-600\s+text-white/g, 'bg-[#1A1A1A] text-[#EDED78] rounded-full');
  content = content.replace(/bg-indigo-600\s+hover:bg-indigo-700\s+text-white/g, 'bg-[#1A1A1A] hover:bg-black text-[#EDED78] rounded-full');
  content = content.replace(/bg-indigo-[0-9]{3}\s+hover:bg-indigo-[0-9]{3}\s+text-white/g, 'bg-[#1A1A1A] hover:bg-black text-[#EDED78] rounded-full');
  
  // Update border-radius to rounded-full for the replaced buttons (often it was rounded-xl or rounded-lg)
  content = content.replace(/(bg-\[\#1A1A1A\][^"']*)rounded-(md|lg|xl|2xl|3xl)/g, '$1 rounded-full');

  // Any remaining bg-indigo-600
  content = content.replace(/bg-indigo-600(?!\])/g, 'bg-[#EDED78]');
  content = content.replace(/bg-blue-600(?!\])/g, 'bg-[#EDED78]');
  content = content.replace(/bg-indigo-50(?!\])/g, 'bg-[#F0F0C0]');
  content = content.replace(/bg-indigo-100(?!\])/g, 'bg-[#F0F0C0]');
  
  // Replace text-indigo-600
  content = content.replace(/text-indigo-600(?!\])/g, 'text-[#1A1A1A]');
  content = content.replace(/text-blue-600(?!\])/g, 'text-[#1A1A1A]');
  content = content.replace(/text-indigo-500(?!\])/g, 'text-[#1A1A1A]');
  
  // Focus rings
  content = content.replace(/focus:ring-indigo-[0-9]{3}(\/[0-9]{2})?/g, 'focus:ring-[#EDED78]/50');
  content = content.replace(/focus:border-indigo-[0-9]{3}/g, 'focus:border-[#EDED78]');

  // Replace old green CTA gradients
  content = content.replace(/from-lime-400\s+to-emerald-500/g, 'bg-[#1A1A1A]');
  content = content.replace(/from-emerald-400\s+to-teal-500/g, 'bg-[#1A1A1A]');

  // general gradients to dark if it was a hero card
  content = content.replace(/bg-gradient-to-r\s+from-blue-600\s+via-indigo-600\s+to-violet-600/g, 'bg-[#1A1A1A] text-[#EDED78]');
  content = content.replace(/bg-gradient-to-br\s+from-blue-600\s+to-indigo-600/g, 'bg-[#1A1A1A]');
  content = content.replace(/from-blue-600/g, '');
  content = content.replace(/to-indigo-[0-9]{3}/g, '');
  content = content.replace(/via-indigo-[0-9]{3}/g, '');
  
  // Tool icon circles -> background #F0F0C0, icon color #5C5C00
  // text-indigo-600 inside circles might have been replaced to text-[#1A1A1A] above, 
  // Let's modify a specific pattern if it exists, or let it be text-[#1A1A1A].
  // The request says "Tool icon circles → background #F0F0C0, icon color #5C5C00"
  
  // Let's find specific ones like "bg-[#F0F0C0] text-[#1A1A1A]" and replace with text-[#5C5C00].
  content = content.replace(/bg-\[\#F0F0C0\]\s+text-\[\#1A1A1A\]/g, 'bg-[#F0F0C0] text-[#5C5C00]');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated: ' + file);
  }
});
