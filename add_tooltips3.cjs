const fs = require('fs');
const path = require('path');

const dir = 'src/components/modules';
const files = fs.readdirSync(dir);

let filesModified = 0;

const tooltips = [
  { keywords: ['Cover'], std: 'IS', code: '456:2000', desc: 'Nominal cover to meet durability requirements (Table 16).' },
  { keywords: ['Mix', 'Concrete Grade'], std: 'IS', code: '456:2000', desc: 'Nominal mix proportions and minimum grade of concrete (Table 5).' },
  { keywords: ['Steel Grade', 'Yield Strength', 'Fy'], std: 'IS', code: '1786:2008', desc: 'High strength deformed steel bars and wires for concrete reinforcement.' },
  { keywords: ['Bearing', 'SBC'], std: 'IS', code: '1904:1986', desc: 'Design and construction of foundations in soils: General requirements.' },
  { keywords: ['Live Load', 'Imposed', 'Surcharge'], std: 'IS', code: '875 (Part 2)', desc: 'Imposed loads for residential and commercial buildings.' },
  { keywords: ['Dead Load', 'Unit Weight'], std: 'IS', code: '875 (Part 1)', desc: 'Unit weights of building materials and stored materials.' },
  { keywords: ['Wind'], std: 'IS', code: '875 (Part 3)', desc: 'Basic wind speed map for structural design.' },
  { keywords: ['Seismic', 'Earthquake'], std: 'IS', code: '1893:2016', desc: 'Criteria for earthquake resistant design of structures.' },
  { keywords: ['Dia', 'Diameter'], std: 'IS', code: '1786:2008', desc: 'Standard diameters for high strength deformed steel bars.' },
  { keywords: ['Spacing', 'c/c'], std: 'IS', code: '456:2000', desc: 'Maximum spacing of shear reinforcement in beams and columns.' },
  { keywords: ['Friction'], std: 'IS', code: '1904:1986', desc: 'Coefficient of friction for sliding resistance of foundations.' },
  { keywords: ['Soil Type', 'Soil Class'], std: 'IS', code: '1498:1970', desc: 'Classification and identification of soils for general engineering purposes.' },
  { keywords: ['CBR'], std: 'IRC', code: '37:2018', desc: 'Guidelines for the design of flexible pavements.' },
  { keywords: ['Traffic'], std: 'IRC', code: '37:2018', desc: 'Commercial vehicles per day for pavement design thickness.' },
  { keywords: ['Bitumen'], std: 'IS', code: '73:2013', desc: 'Paving Bitumen - Specification (Viscosity Grading).' },
  { keywords: ['Asphalt'], std: 'IRC', code: '37:2018', desc: 'Design of flexible pavements.' }
];

files.forEach(file => {
  if (!file.endsWith('.tsx')) return;
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Let's replace label="..." for InputGroup where it doesn't already have a tooltip
  // We match label="some string"
  content = content.replace(/label="([^"]+)"/g, (match, text) => {
    if (match.includes('CodeTooltip')) return match;
    for (const tt of tooltips) {
      for (const kw of tt.keywords) {
        if (text.toLowerCase().includes(kw.toLowerCase())) {
           return `label={<span className="flex items-center gap-1">${text} <CodeTooltip standard="${tt.std}" code="${tt.code}" description="${tt.desc}" /></span>}`;
        }
      }
    }
    return match;
  });

  // Let's replace label={`some string ${var}`}
  content = content.replace(/label=\{`([^`]+)`\}/g, (match, text) => {
    if (match.includes('CodeTooltip')) return match;
    for (const tt of tooltips) {
      for (const kw of tt.keywords) {
        if (text.toLowerCase().includes(kw.toLowerCase())) {
           // We need to wrap it in a fragment or span
           return `label={<span className="flex items-center gap-1">{\`${text}\`} <CodeTooltip standard="${tt.std}" code="${tt.code}" description="${tt.desc}" /></span>}`;
        }
      }
    }
    return match;
  });

  // Let's replace <label className="...">text</label>
  content = content.replace(/(<label[^>]*?>)([^<]+)(<\/label>)/gi, (match, p1, p2, p3) => {
    if (match.includes('CodeTooltip')) return match;
    // Don't modify if it's too long or has no text
    if (p2.trim().length === 0 || p2.length > 50) return match;

    for (const tt of tooltips) {
      for (const kw of tt.keywords) {
        if (p2.toLowerCase().includes(kw.toLowerCase())) {
           return `${p1}<span className="flex items-center gap-1">${p2} <CodeTooltip standard="${tt.std}" code="${tt.code}" description="${tt.desc}" /></span>${p3}`;
        }
      }
    }
    return match;
  });

  if (content !== originalContent) {
    if (!content.includes('import { CodeTooltip }')) {
       const lastImportIndex = content.lastIndexOf('import ');
       if (lastImportIndex !== -1) {
          const endOfLastImport = content.indexOf('\n', lastImportIndex);
          content = content.substring(0, endOfLastImport) + '\nimport { CodeTooltip } from "../ui/CodeTooltip";' + content.substring(endOfLastImport);
       } else {
          content = 'import { CodeTooltip } from "../ui/CodeTooltip";\n' + content;
       }
    }
    fs.writeFileSync(filePath, content);
    filesModified++;
  }
});

console.log(`Modified ${filesModified} files.`);
