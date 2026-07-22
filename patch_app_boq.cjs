const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('const [isBOQOpen, setIsBOQOpen] = useState(false);')) {
  code = code.replace(
    'const [searchTerm, setSearchTerm] = useState("");',
    'const [searchTerm, setSearchTerm] = useState("");\n  const [isBOQOpen, setIsBOQOpen] = useState(false);'
  );
  fs.writeFileSync('src/App.tsx', code);
}
