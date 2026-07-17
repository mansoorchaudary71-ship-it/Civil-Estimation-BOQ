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

  // Replace label strings in InputGroup or similar generic label props
  content = content.replace(/label="([^"]*?Clear Cover[^"]*?)"/g, (match, p1) => {
    if (match.includes('CodeTooltip')) return match;
    return `label={<span className="flex items-center">${p1} <CodeTooltip standard="IS" code="456:2000" description="Nominal cover to meet durability requirements (Table 16)." /></span>}`;
  });

  content = content.replace(/label="([^"]*?Concrete Grade[^"]*?)"/g, (match, p1) => {
    if (match.includes('CodeTooltip')) return match;
    return `label={<span className="flex items-center">${p1} <CodeTooltip standard="IS" code="456:2000" description="Minimum grade of concrete for RCC is M20 (Table 5)." /></span>}`;
  });

  content = content.replace(/label="([^"]*?Steel Grade[^"]*?)"/g, (match, p1) => {
    if (match.includes('CodeTooltip')) return match;
    return `label={<span className="flex items-center">${p1} <CodeTooltip standard="IS" code="1786:2008" description="High strength deformed steel bars and wires for concrete reinforcement." /></span>}`;
  });

  content = content.replace(/label="([^"]*?Bearing Capacity[^"]*?)"/g, (match, p1) => {
    if (match.includes('CodeTooltip')) return match;
    return `label={<span className="flex items-center">${p1} <CodeTooltip standard="IS" code="1904:1986" description="Design and construction of foundations in soils: General requirements." /></span>}`;
  });

  content = content.replace(/label="([^"]*?Live Load[^"]*?)"/g, (match, p1) => {
    if (match.includes('CodeTooltip')) return match;
    return `label={<span className="flex items-center">${p1} <CodeTooltip standard="IS" code="875 (Part 2)" description="Imposed loads for residential and commercial buildings." /></span>}`;
  });

  // Handle standard <label> tags
  content = content.replace(/(<label[^>]*?>)([^<]*?Clear Cover[^<]*?)(<\/label>)/gi, (match, p1, p2, p3) => {
    if (match.includes('CodeTooltip')) return match;
    return `${p1}<span className="flex items-center">${p2} <CodeTooltip standard="IS" code="456:2000" description="Nominal cover to meet durability requirements (Table 16)." /></span>${p3}`;
  });

  content = content.replace(/(<label[^>]*?>)([^<]*?Concrete Grade[^<]*?)(<\/label>)/gi, (match, p1, p2, p3) => {
    if (match.includes('CodeTooltip')) return match;
    return `${p1}<span className="flex items-center">${p2} <CodeTooltip standard="IS" code="456:2000" description="Minimum grade of concrete for RCC is M20 (Table 5)." /></span>${p3}`;
  });

  content = content.replace(/(<label[^>]*?>)([^<]*?Steel Grade[^<]*?)(<\/label>)/gi, (match, p1, p2, p3) => {
    if (match.includes('CodeTooltip')) return match;
    return `${p1}<span className="flex items-center">${p2} <CodeTooltip standard="IS" code="1786:2008" description="High strength deformed steel bars and wires for concrete reinforcement." /></span>${p3}`;
  });

  content = content.replace(/(<label[^>]*?>)([^<]*?Bearing Capacity[^<]*?)(<\/label>)/gi, (match, p1, p2, p3) => {
    if (match.includes('CodeTooltip')) return match;
    return `${p1}<span className="flex items-center">${p2} <CodeTooltip standard="IS" code="1904:1986" description="Design and construction of foundations in soils: General requirements." /></span>${p3}`;
  });

  content = content.replace(/(<label[^>]*?>)([^<]*?Live Load[^<]*?)(<\/label>)/gi, (match, p1, p2, p3) => {
    if (match.includes('CodeTooltip')) return match;
    return `${p1}<span className="flex items-center">${p2} <CodeTooltip standard="IS" code="875 (Part 2)" description="Imposed loads for residential and commercial buildings." /></span>${p3}`;
  });


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
