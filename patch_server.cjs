const fs = require('fs');
let file = fs.readFileSync('server.ts', 'utf-8');

if (!file.includes('/api/tools/plywood-calculator')) {
  const route = `
  app.post("/api/tools/plywood-calculator", (req, res) => {
    try {
      const { 
        inputMode, // 'area' or 'dimensions'
        totalArea, // gross surface area
        length,
        width,
        sheetWidth,
        sheetLength,
        thickness,
        wastagePercent,
        costPerSheet
      } = req.body;

      // Calculate net area
      let netArea = 0;
      if (inputMode === 'dimensions') {
        netArea = Number(length) * Number(width);
      } else {
        netArea = Number(totalArea);
      }
      
      const sheetArea = Number(sheetWidth) * Number(sheetLength);
      const grossAreaRequired = netArea * (1 + (Number(wastagePercent) / 100));
      const totalSheets = Math.ceil(grossAreaRequired / sheetArea);
      const wastageArea = grossAreaRequired - netArea;
      const totalCost = totalSheets * Number(costPerSheet);
      const sheetVolume = sheetArea * (Number(thickness) / 1000); // converting mm to m

      res.json({
        netArea,
        grossAreaRequired,
        sheetArea,
        totalSheets,
        wastageArea,
        totalCost,
        sheetVolume
      });
    } catch (err) {
      res.status(500).json({ error: "Calculation failed" });
    }
  });
`;

  file = file.replace(
    'app.get("/api/health", (req, res) => {',
    route + '\n  app.get("/api/health", (req, res) => {'
  );
  
  fs.writeFileSync('server.ts', file);
  console.log("Patched server.ts");
}
