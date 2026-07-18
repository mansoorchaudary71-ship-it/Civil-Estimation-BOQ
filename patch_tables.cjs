const fs = require('fs');
const files = [
  'src/components/modules/AdvancedBoqGenerator.tsx',
  'src/components/modules/LiveBOQ.tsx',
  'src/components/modules/HouseEstimator.tsx',
  'src/components/modules/BOQGenerator.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    // Replace all instances of `<table className="w-full` with `<table className="boq-table-print-breaks w-full`
    // Ensure we don't add it multiple times
    content = content.replace(/<table className="(?!(?:.*?)boq-table-print-breaks)([^"]*)"/g, '<table className="boq-table-print-breaks $1"');
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
});
