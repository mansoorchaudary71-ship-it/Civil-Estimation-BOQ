const fs = require('fs');
let file = fs.readFileSync('server.ts', 'utf-8');

if (!file.includes('/api/tools/solar-water-heater')) {
  const route = `
  app.post("/api/tools/solar-water-heater", (req, res) => {
    try {
      const { 
        occupants,
        usagePerPerson, // LPD
        targetTemp, // C
        inletTemp, // C
        solarRadiation, // kWh/m2/day
        efficiency, // %
        energyCost // $ per kWh
      } = req.body;

      // Calculations
      const totalDemand = Number(occupants) * Number(usagePerPerson);
      
      const deltaT = Number(targetTemp) - Number(inletTemp);
      const energyRequiredKJ = totalDemand * 4.184 * deltaT;
      const energyRequiredKWh = energyRequiredKJ / 3600;
      
      const effFactor = Number(efficiency) / 100;
      const collectorArea = energyRequiredKWh / (Number(solarRadiation) * effFactor);
      
      const tankCapacity = totalDemand * 1.5;
      
      const dailySavings = energyRequiredKWh * Number(energyCost);
      const annualSavings = dailySavings * 365;

      res.json({
        totalDemand,
        collectorArea,
        tankCapacity,
        annualSavings
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
