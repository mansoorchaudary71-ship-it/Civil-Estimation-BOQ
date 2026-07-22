const fs = require('fs');
let file = fs.readFileSync('server.ts', 'utf-8');

if (!file.includes('/api/tools/roof-calculator')) {
  const route = `
  app.post("/api/tools/roof-calculator", (req, res) => {
    try {
      const { span, rise, overhang, length } = req.body;
      const run = Number(span) / 2;
      const angleRad = Math.atan(Number(rise) / run);
      const angleDeg = angleRad * (180 / Math.PI);
      const hypotenuse = Math.sqrt(Math.pow(Number(rise), 2) + Math.pow(run, 2));
      const rafterLength = hypotenuse + Number(overhang);
      const pitchPercentage = (Number(rise) / run) * 100;
      const totalArea = 2 * (rafterLength * Number(length));

      res.json({
        run,
        angleDeg,
        rafterLength,
        pitchPercentage,
        totalArea,
        hypotenuse
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
