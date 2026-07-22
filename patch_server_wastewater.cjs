const fs = require('fs');
let file = fs.readFileSync('server.ts', 'utf-8');

if (!file.includes('/api/tools/wastewater-testing/bod')) {
  const route = `
  app.post("/api/tools/wastewater-testing/bod", (req, res) => {
    try {
      const { initialDO, finalDO, sampleVolume, bottleVolume } = req.body;
      const doDepletion = Number(initialDO) - Number(finalDO);
      if (doDepletion < 0) {
        return res.status(400).json({ error: "Final DO cannot be greater than Initial DO" });
      }
      if (Number(sampleVolume) <= 0 || Number(bottleVolume) <= 0) {
        return res.status(400).json({ error: "Volumes must be greater than zero" });
      }
      
      const p = Number(sampleVolume) / Number(bottleVolume);
      const bod = doDepletion / p;
      
      res.json({ bod, doDepletion, p, success: true });
    } catch (err) {
      res.status(500).json({ error: "BOD Calculation failed" });
    }
  });

  app.post("/api/tools/wastewater-testing/cod", (req, res) => {
    try {
      const { vBlank, vSample, normality, sampleVolume } = req.body;
      const diff = Number(vBlank) - Number(vSample);
      if (diff < 0) {
        return res.status(400).json({ error: "Sample titrant volume cannot be greater than blank titrant volume" });
      }
      if (Number(sampleVolume) <= 0) {
        return res.status(400).json({ error: "Sample volume must be greater than zero" });
      }
      
      const cod = (diff * Number(normality) * 8000) / Number(sampleVolume);
      
      res.json({ cod, diff, success: true });
    } catch (err) {
      res.status(500).json({ error: "COD Calculation failed" });
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
