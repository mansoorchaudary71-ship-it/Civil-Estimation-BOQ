const fs = require('fs');
let content = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

content = content.replace(/category: "Quantity Estimation"/g, 'category: "Quantity Takeoff & Costing"');
content = content.replace(/category: "Concrete"/g, 'category: "Structural & Concrete Geometry"');
content = content.replace(/category: "Structural Design"/g, 'category: "Structural & Concrete Geometry"');
content = content.replace(/category: "Architectural"/g, 'category: "Masonry, Surfaces & Finishes"');
content = content.replace(/category: "Geotechnical"/g, 'category: "Geotechnical & Soil Lab Suite"');
content = content.replace(/category: "Road Pavement"/g, 'category: "Infrastructure & Highway Engineering"');
content = content.replace(/category: "MEP"/g, 'category: "MEP, Energy & Landscaping"');
content = content.replace(/category: "Resources"/g, 'category: "Quantity Takeoff & Costing"');
content = content.replace(/category: "Standards"/g, 'category: "Structural & Concrete Geometry"');

fs.writeFileSync('src/components/Dashboard.tsx', content);
console.log('Categories updated!');
