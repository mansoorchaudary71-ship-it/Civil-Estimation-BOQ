const fs = require('fs');

let file = fs.readFileSync('src/components/modules/UniversalStructuralGeometryEngine.tsx', 'utf-8');

// Add WarningIcon import if not present
if (!file.includes('AlertTriangle')) {
  file = file.replace(/import {([^}]+)} from 'lucide-react';/, "import {$1, AlertTriangle} from 'lucide-react';");
}

const validationFunc = `
  const getValidations = () => {
    const warnings = [];
    if (activeTab === 'rectangular') {
      if (inputs.rectL <= 0 || inputs.rectW <= 0 || inputs.rectD <= 0) warnings.push("Dimensions must be greater than zero.");
      if (inputs.rectD > inputs.rectW * 5) warnings.push("Unusual aspect ratio: depth is more than 5x the width.");
      if (inputs.rectW > inputs.rectD * 5) warnings.push("Unusual aspect ratio: width is more than 5x the depth.");
      if (inputs.rectStirrupSpacing >= inputs.rectL) warnings.push("Stirrup spacing is larger than or equal to total length.");
      if (inputs.rectStirrupSpacing <= 0) warnings.push("Stirrup spacing must be greater than zero.");
    } else if (activeTab === 'circular') {
      if (inputs.circDia <= 0 || inputs.circH <= 0) warnings.push("Dimensions must be greater than zero.");
      if (inputs.circH > inputs.circDia * 20) warnings.push("Unusual slenderness: height is more than 20x the diameter.");
      if (inputs.circTiePitch <= 0) warnings.push("Tie pitch must be greater than zero.");
    } else if (activeTab === 'tube') {
      if (inputs.tubeOD <= 0 || inputs.tubeID <= 0 || inputs.tubeL <= 0) warnings.push("Dimensions must be greater than zero.");
      if (inputs.tubeID >= inputs.tubeOD) warnings.push("Inner diameter cannot be greater than or equal to outer diameter.");
      if (inputs.tubeOD > 0 && inputs.tubeID > 0 && (inputs.tubeOD - inputs.tubeID) < 0.05) warnings.push("Wall thickness is critically thin (< 50mm).");
    } else if (activeTab === 'precast') {
      if (inputs.wallL <= 0 || inputs.wallTotalH <= 0 || inputs.panelH <= 0 || inputs.panelThick <= 0) warnings.push("Dimensions must be greater than zero.");
      if (inputs.panelH >= inputs.wallTotalH) warnings.push("Panel height is greater than or equal to total wall height.");
      if (inputs.wallTotalH > inputs.panelThick * 40) warnings.push("High slenderness ratio: consider thicker panels or intermediate supports.");
      if (inputs.postSpacing <= 0) warnings.push("Post spacing must be greater than zero.");
    } else if (activeTab === 'staircase') {
      if (inputs.stairRise <= 0 || inputs.stairGoing <= 0 || inputs.stairSteps <= 0 || inputs.stairWidth <= 0 || inputs.stairWaist <= 0) warnings.push("Dimensions must be greater than zero.");
      if (inputs.stairRise > 0.25) warnings.push("Stair rise exceeds typical maximum (250mm).");
      if (inputs.stairGoing < 0.20) warnings.push("Stair going is below typical minimum (200mm).");
    } else if (activeTab === 'roof') {
      if (inputs.roofSpan <= 0 || inputs.roofRise <= 0 || inputs.roofRun <= 0) warnings.push("Dimensions must be greater than zero.");
      if (inputs.roofRise > inputs.roofSpan) warnings.push("Roof rise is unusually steep relative to span.");
    }
    return warnings;
  };
  const currentWarnings = getValidations();
`;

// Insert after `const calcBattens = ...`
file = file.replace(/const calcBattens = [^\n]+\n/, match => match + "\n" + validationFunc + "\n");

const warningUI = `
          {currentWarnings.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }} 
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 flex flex-col gap-2"
            >
              {currentWarnings.map((warn, i) => (
                <div key={i} className="flex items-start gap-3 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 p-4 rounded-xl border border-amber-200 dark:border-amber-800/50">
                  <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                  <p className="text-sm font-medium">{warn}</p>
                </div>
              ))}
            </motion.div>
          )}
`;

// Insert the warning UI after the AnimatePresence block for activeTab inputs
// Find `</AnimatePresence>` and `</div>` inside Geometry Parameters
file = file.replace(/(<\/AnimatePresence>\s*<\/div>)/, match => "</AnimatePresence>" + warningUI + "\n        </div>");

fs.writeFileSync('src/components/modules/UniversalStructuralGeometryEngine.tsx', file);
