const fs = require('fs');
let content = fs.readFileSync('src/components/Dashboard.tsx', 'utf-8');

// Replace totalCost={6850000} with totalCost={grandTotal}
if (content.includes('totalCost={6850000}')) {
  // Let's see if grandTotal exists in this file
  if (content.includes('const grandTotal =')) {
    content = content.replace('totalCost={6850000}', 'totalCost={grandTotal}');
    fs.writeFileSync('src/components/Dashboard.tsx', content);
    console.log("Updated totalCost successfully.");
  } else {
    // maybe it is available in context or something? Let's search
    console.log("grandTotal variable not found in Dashboard.tsx");
  }
}

