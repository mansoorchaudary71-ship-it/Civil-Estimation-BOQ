const fs = require('fs');
let code = fs.readFileSync('src/components/ui/PrintPreviewModal.tsx', 'utf8');

// 1. Add theme state
code = code.replace(
  /const \[paperSize, setPaperSize\] = useState<"a4" \| "legal">\("a4"\);/,
  `const [paperSize, setPaperSize] = useState<"a4" | "legal">("a4");
  const [theme, setTheme] = useState<"Professional" | "Minimalist" | "Condensed">("Professional");`
);

// 2. Add theme to renderPdf function signature and effect dependencies
code = code.replace(
  /const renderPdf = async \(brandState: boolean, currentSize: "a4" \| "legal"\) => \{/,
  `const renderPdf = async (brandState: boolean, currentSize: "a4" | "legal", currentTheme: "Professional" | "Minimalist" | "Condensed") => {`
);

code = code.replace(
  /if \(isOpen\) renderPdf\(useBranding, paperSize\);\s*\}, \[(.*)\]\);/,
  `if (isOpen) renderPdf(useBranding, paperSize, theme);
  }, [useBranding, paperSize, customName, customLogo, theme, isOpen]);`
);


// 4. Pass down theme to generateProfessionalPDF
code = code.replace(
  /const pdf = await generateProfessionalPDF\(\{\s*\.\.\.payload,\s*branding:\s*brandingData,\s*paperSize:\s*currentSize\s*\}\);/,
  `const pdf = await generateProfessionalPDF({
            ...payload,
            branding: brandingData,
            paperSize: currentSize,
            theme: currentTheme
          });`
);

// 5. Add Theme UI
code = code.replace(
  /value=\{paperSize\}/,
  `value={theme}
                 onChange={(e) => setTheme(e.target.value as "Professional" | "Minimalist" | "Condensed")}
                 className="bg-white border border-[#E8E4D9] text-[#4A443B] text-sm font-semibold rounded-xl px-3 py-2 outline-none cursor-pointer"
               >
                 <option value="Professional">Professional Theme</option>
                 <option value="Minimalist">Minimalist</option>
                 <option value="Condensed">Condensed</option>
               </select>
               <select
                 value={paperSize}`
);

fs.writeFileSync('src/components/ui/PrintPreviewModal.tsx', code);
