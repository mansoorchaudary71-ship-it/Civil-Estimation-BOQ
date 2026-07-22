const fs = require('fs');
let file = fs.readFileSync('server.ts', 'utf-8');

if (!file.includes('/api/tools/pavement-gradation')) {
  const route = `
  app.post("/api/tools/pavement-gradation", (req, res) => {
    try {
      const { propA, propB, propC, aggA, aggB, aggC, specs } = req.body;
      
      // Calculate blended passing for each sieve
      const blended = aggA.map((valA, i) => {
        const valB = aggB[i];
        const valC = aggC[i];
        const blendedVal = (Number(propA) * Number(valA)) + (Number(propB) * Number(valB)) + (Number(propC) * Number(valC));
        
        const spec = specs[i];
        let status = 'pass';
        if (spec) {
          if (blendedVal < spec.min || blendedVal > spec.max) {
            status = 'fail';
          }
        }
        
        return {
          blendedValue: blendedVal,
          status,
          min: spec ? spec.min : null,
          max: spec ? spec.max : null
        };
      });
      
      const allPass = blended.every(b => b.status === 'pass' || !b.min);

      res.json({
        blended,
        allPass,
        success: true
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Gradation Calculation failed" });
    }
  });
`;

  file = file.replace(
    'app.get("/api/health", (req, res) => {',
    route + '\n  app.get("/api/health", (req, res) => {'
  );
  
  fs.writeFileSync('server.ts', file);
  console.log("Patched server.ts for pavement");
} else {
  console.log("server.ts already patched");
}
