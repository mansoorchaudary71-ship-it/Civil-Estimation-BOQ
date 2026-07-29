const fs = require('fs');

let content = fs.readFileSync('src/components/BottomNavBar.tsx', 'utf8');

// The bottom nav buttons have very specific inline styles that might be complex to completely replace with standard sizes,
// but let's replace the `active:scale-95 text-base font-semibold hover:-translate-y-0.5` class with proper variants or let's just leave the mobile nav if it's meant to be custom grid items.
content = content.replace(/active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm/g, 'shadow-sm hover:shadow-md hover:-translate-y-0.5');
content = content.replace(/active:scale-95 text-base font-semibold hover:-translate-y-0.5/g, 'text-base font-semibold hover:-translate-y-0.5');

fs.writeFileSync('src/components/BottomNavBar.tsx', content);

