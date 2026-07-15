const fs = require('fs');
const path = require('path');

const walk = (dir) => {
  let list = fs.readdirSync(dir);
  let results = [];
  list.forEach((file) => {
    let filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      results = results.concat(walk(filePath));
    } else {
      results.push(filePath);
    }
  });
  return results;
};

const mapReplacements = [
  { file: 'AreaCalculator.tsx', mapStr: 'shapes.map((s) => {', newMapStr: 'shapes.map((s, idx) => {', passIndex: true },
  { file: 'VolumeEstimator.tsx', mapStr: 'shapes.map((s) => {', newMapStr: 'shapes.map((s, idx) => {', passIndex: true },
  { file: 'MasterRccStructure.tsx', mapStr: 'tabs.map((tab) => {', newMapStr: 'tabs.map((tab, idx) => {', passIndex: true },
  { file: 'GeotechnicalCalculator.tsx', mapStr: 'tabs.map((tab) => {', newMapStr: 'tabs.map((tab, idx) => {', passIndex: true },
  { file: 'MetalWeightCalculator.tsx', mapStr: 'profiles.map((p) => {', newMapStr: 'profiles.map((p, idx) => {', passIndex: true },
  { file: 'RoadPavementEstimator.tsx', mapStr: 'tabs.map((tab) => {', newMapStr: 'tabs.map((tab, idx) => {', passIndex: true },
  { file: 'ColumnEstimator.tsx', mapStr: 'shapes.map((s) => {', newMapStr: 'shapes.map((s, idx) => {', passIndex: true },
  { file: 'UnitConverter.tsx', mapStr: 'categories.map((c) => {', newMapStr: 'categories.map((c, idx) => {', passIndex: true },
  { file: 'Calculators.tsx', mapStr: 'calculatorCategories.map((type) => {', newMapStr: 'calculatorCategories.map((type, idx) => {', passIndex: true },
  { file: 'Calculators.tsx', mapStr: 'tabs.map((tab) => {', newMapStr: 'tabs.map((tab, idx) => {', passIndex: true },
  { file: 'AggregateTestsCalculator.tsx', mapStr: 'tabs.map((tab) => {', newMapStr: 'tabs.map((tab, idx) => {', passIndex: true },
];

const files = walk('./src/components').filter(f => f.endsWith('.tsx'));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Cleanup incorrect manual assignments from my previous broken script
  content = content.replace(/<ColorfulTab\s*index=\{\d+\}/gs, '<ColorfulTab');

  // Assign index={idx} only if we can find the exact map string
  const filename = path.basename(file);
  const replacements = mapReplacements.filter(r => r.file === filename);
  
  if (replacements.length > 0) {
    replacements.forEach(r => {
      content = content.replace(r.mapStr, r.newMapStr);
    });
    // Add index={idx} to all ColorfulTabs in these files (assuming 1-2 per file inside map)
    content = content.replace(/<ColorfulTab/g, '<ColorfulTab index={idx}');
  } else {
    // For files not in the mapReplacements (which means they have hardcoded tabs)
    // we'll assign sequential indices
    let idxCounter = 0;
    content = content.replace(/<ColorfulTab/g, () => {
      let result = `<ColorfulTab index={${idxCounter}}`;
      idxCounter++;
      return result;
    });
  }

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed', file);
  }
});
