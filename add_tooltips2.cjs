const fs = require('fs');
const path = require('path');

const dir = 'src/components/modules';
const files = fs.readdirSync(dir);

let filesModified = 0;

files.forEach(file => {
  if (!file.endsWith('.tsx')) return;
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  const replaceLabel = (searchText, standard, code, desc) => {
    // For label=""
    const regex1 = new RegExp(`label="([^"]*?${searchText}[^"]*?)"`, 'g');
    content = content.replace(regex1, (match, p1) => {
      if (match.includes('CodeTooltip')) return match;
      return `label={<span className="flex items-center">${p1} <CodeTooltip standard="${standard}" code="${code}" description="${desc}" /></span>}`;
    });

    // For <label>...</label>
    const regex2 = new RegExp(`(<label[^>]*?>)([^<]*?${searchText}[^<]*?)(<\\/label>)`, 'gi');
    content = content.replace(regex2, (match, p1, p2, p3) => {
      if (match.includes('CodeTooltip')) return match;
      return `${p1}<span className="flex items-center">${p2} <CodeTooltip standard="${standard}" code="${code}" description="${desc}" /></span>${p3}`;
    });
  };

  replaceLabel('Mix Ratio', 'IS', '456:2000', 'Nominal mix proportions for ordinary concrete (Table 9).');
  replaceLabel('Dead Load', 'IS', '875 (Part 1)', 'Unit weights of building materials and stored materials.');
  replaceLabel('Wind Speed', 'IS', '875 (Part 3)', 'Basic wind speed map for structural design.');
  replaceLabel('Soil Type', 'IS', '1498:1970', 'Classification and identification of soils for general engineering purposes.');
  replaceLabel('SBC', 'IS', '1904:1986', 'Safe Bearing Capacity recommendations for shallow foundations.');
  replaceLabel('Seismic Zone', 'IS', '1893:2016', 'Criteria for earthquake resistant design of structures.');
  replaceLabel('Water Cement Ratio', 'IS', '456:2000', 'Maximum water-cement ratio for different environmental exposures (Table 5).');
  replaceLabel('Bar Diameter', 'IS', '1786:2008', 'Standard diameters for high strength deformed steel bars.');
  replaceLabel('Stirrup Spacing', 'IS', '456:2000', 'Maximum spacing of shear reinforcement in beams and columns.');

  if (content !== originalContent) {
    if (!content.includes('import { CodeTooltip }')) {
       const lastImportIndex = content.lastIndexOf('import ');
       const endOfLastImport = content.indexOf('\n', lastImportIndex);
       content = content.substring(0, endOfLastImport) + '\nimport { CodeTooltip } from "../ui/CodeTooltip";' + content.substring(endOfLastImport);
    }
    fs.writeFileSync(filePath, content);
    filesModified++;
  }
});

console.log(`Modified ${filesModified} files.`);
// Additional ones
filesModified = 0;
files.forEach(file => {
  if (!file.endsWith('.tsx')) return;
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  const replaceLabel = (searchText, standard, code, desc) => {
    const regex1 = new RegExp(`label="([^"]*?${searchText}[^"]*?)"`, 'g');
    content = content.replace(regex1, (match, p1) => {
      if (match.includes('CodeTooltip')) return match;
      return `label={<span className="flex items-center">${p1} <CodeTooltip standard="${standard}" code="${code}" description="${desc}" /></span>}`;
    });

    const regex2 = new RegExp(`(<label[^>]*?>)([^<]*?${searchText}[^<]*?)(<\\/label>)`, 'gi');
    content = content.replace(regex2, (match, p1, p2, p3) => {
      if (match.includes('CodeTooltip')) return match;
      return `${p1}<span className="flex items-center">${p2} <CodeTooltip standard="${standard}" code="${code}" description="${desc}" /></span>${p3}`;
    });
  };

  replaceLabel('Brick Quality', 'IS', '1077:1992', 'Common burnt clay building bricks specification.');
  replaceLabel('Cement Type', 'IS', '269 / 1489', 'Ordinary Portland Cement (OPC) or Portland Pozzolana Cement (PPC).');
  replaceLabel('Bitumen Grade', 'IS', '73:2013', 'Paving Bitumen - Specification (Viscosity Grading).');
  replaceLabel('CBR', 'IRC', '37:2018', 'Guidelines for the design of flexible pavements.');
  replaceLabel('Traffic Volume', 'IRC', '37:2018', 'Commercial vehicles per day for pavement design thickness.');
  replaceLabel('Slump', 'IS', '456:2000', 'Recommended slumps for various concrete works (Clause 7.1).');
  replaceLabel('Deflection', 'IS', '456:2000', 'Control of deflection (Span to depth ratios).');

  if (content !== originalContent) {
    if (!content.includes('import { CodeTooltip }')) {
       const lastImportIndex = content.lastIndexOf('import ');
       const endOfLastImport = content.indexOf('\n', lastImportIndex);
       content = content.substring(0, endOfLastImport) + '\nimport { CodeTooltip } from "../ui/CodeTooltip";' + content.substring(endOfLastImport);
    }
    fs.writeFileSync(filePath, content);
    filesModified++;
  }
});
console.log(`Modified ${filesModified} files.`);
