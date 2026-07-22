const fs = require('fs');
let file = fs.readFileSync('src/components/calculators/SolarWaterHeaterCalculator.tsx', 'utf-8');

file = file.replace(
`  useEffect(() => {
    // Math
    const demandLPD = occupants * usagePerPerson;
    
    // Q = m * c * dT
    // m = demandLPD (since 1L water = 1kg)
    // c = 4.184 kJ/kgC
    // dT = targetTemp - inletTemp
    const deltaT = targetTemp - inletTemp;
    const energyRequiredKJ = demandLPD * 4.184 * deltaT;
    const energyRequiredKWh = energyRequiredKJ / 3600;
    
    // Collector Area = Q / (Irradiance * Efficiency)
    const effFactor = efficiency / 100;
    const areaM2 = energyRequiredKWh / (solarRadiation * effFactor);
    
    // Tank Capacity (Rule of thumb: 1.5x daily demand)
    const tankLiters = demandLPD * 1.5;

    // Economics
    const dailySavings = energyRequiredKWh * energyCost;
    const annualSavings = dailySavings * 365;

    setResult({
      totalDemand: demandLPD > 0 ? demandLPD : 0,
      collectorArea: areaM2 > 0 && areaM2 < Infinity ? areaM2 : 0,
      tankCapacity: tankLiters > 0 ? tankLiters : 0,
      annualSavings: annualSavings > 0 ? annualSavings : 0
    });
  }, [occupants, usagePerPerson, solarRadiation, targetTemp, inletTemp, efficiency, energyCost]);`,
`  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await fetch('/api/tools/solar-water-heater', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            occupants,
            usagePerPerson,
            targetTemp,
            inletTemp,
            solarRadiation,
            efficiency,
            energyCost
          })
        });
        const data = await res.json();
        if (data.totalDemand !== undefined) {
          setResult({
            totalDemand: data.totalDemand > 0 ? data.totalDemand : 0,
            collectorArea: data.collectorArea > 0 && data.collectorArea < Infinity ? data.collectorArea : 0,
            tankCapacity: data.tankCapacity > 0 ? data.tankCapacity : 0,
            annualSavings: data.annualSavings > 0 ? data.annualSavings : 0
          });
        }
      } catch (err) {
        console.error("Failed to calculate solar water heater sizing", err);
      }
    };
    fetchResults();
  }, [occupants, usagePerPerson, solarRadiation, targetTemp, inletTemp, efficiency, energyCost]);`
);

fs.writeFileSync('src/components/calculators/SolarWaterHeaterCalculator.tsx', file);
console.log("Patched SolarWaterHeaterCalculator.tsx");
