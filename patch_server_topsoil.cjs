const fs = require('fs');
let file = fs.readFileSync('server.ts', 'utf-8');

if (!file.includes('/api/tools/topsoil-calculator')) {
  const route = `
  app.post("/api/tools/topsoil-calculator", (req, res) => {
    try {
      const { area, depth, density, compactionFactor } = req.body;
      const volumeNet = Number(area) * Number(depth);
      const volumeGross = volumeNet * (1 + (Number(compactionFactor) / 100));
      const weightKg = volumeGross * Number(density);
      const weightTons = weightKg / 1000;

      res.json({
        volumeNet,
        volumeGross,
        weightKg,
        weightTons
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
} else {
  console.log("server.ts already patched");
}
