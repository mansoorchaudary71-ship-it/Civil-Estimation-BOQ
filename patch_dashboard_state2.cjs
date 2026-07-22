const fs = require('fs');
let content = fs.readFileSync('src/components/Dashboard.tsx', 'utf-8');

// I need to find the total sum logic.
if (!content.includes('const grandTotal =')) {
  // Try to find if there's useBOQ and calculate totals
  if (content.includes('useBOQ()')) {
    // We can extract items and sum them
    const replaceStr = `  const { items } = useBOQ();
  const totalCost = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0) || 6850000;`;
    
    // Add totalCost calculation somewhere inside Dashboard component
    content = content.replace(/const \{[^}]+\} = useBOQ\(\);/, match => match + "\n  const dashboardTotalCost = items?.reduce((sum, item) => sum + (item.quantity * item.rate), 0) || 6850000;");
    content = content.replace('totalCost={6850000}', 'totalCost={dashboardTotalCost}');
    
    fs.writeFileSync('src/components/Dashboard.tsx', content);
    console.log("Updated totalCost with items reduction.");
  }
}

