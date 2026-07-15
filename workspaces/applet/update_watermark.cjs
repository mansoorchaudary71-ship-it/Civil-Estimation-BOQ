const fs = require('fs');

// 1. Update pdfGenerator.ts
let pdfGen = fs.readFileSync('src/utils/pdfGenerator.ts', 'utf8');
if (!pdfGen.includes('watermark?: "DRAFT"')) {
    pdfGen = pdfGen.replace(/theme\?: "Professional" \| "Minimalist" \| "Condensed";/g,
                           'theme?: "Professional" | "Minimalist" | "Condensed";\n  watermark?: "DRAFT" | "CONFIDENTIAL" | "NONE";');
    pdfGen = pdfGen.replace(/theme,\n    paperSize/g, 'theme,\n    watermark,\n    paperSize');
    fs.writeFileSync('src/utils/pdfGenerator.ts', pdfGen);
    console.log('Updated pdfGenerator.ts');
}

// 2. Update GlobalReportEngine.tsx interface
let eng = fs.readFileSync('src/utils/GlobalReportEngine.tsx', 'utf8');
if (!eng.includes('watermark?: "DRAFT"')) {
    eng = eng.replace(/theme\?: "Professional" \| "Minimalist" \| "Condensed";/g,
                      'theme?: "Professional" | "Minimalist" | "Condensed";\n  watermark?: "DRAFT" | "CONFIDENTIAL" | "NONE";');
    
    // 3. Update GlobalReportEngine.tsx rendering logic (add before return doc;)
    const watermarkLogic = `
    if (safeData.watermark && safeData.watermark !== "NONE") {
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(80);
        doc.setTextColor(230, 230, 230);
        doc.setFont("helvetica", "bold");
        doc.text(safeData.watermark, pageWidth / 2, pageHeight / 2, {
          angle: 45,
          align: "center",
          baseline: "middle",
        });
      }
    }
    return doc;`;
    
    eng = eng.replace(/return doc;/, watermarkLogic);
    fs.writeFileSync('src/utils/GlobalReportEngine.tsx', eng);
    console.log('Updated GlobalReportEngine.tsx');
}

// 4. Update PrintPreviewModal.tsx
let modal = fs.readFileSync('src/components/ui/PrintPreviewModal.tsx', 'utf8');
if (!modal.includes('const [watermark, setWatermark]')) {
    modal = modal.replace(/const \[theme, setTheme\] = useState<"Professional" \| "Minimalist" \| "Condensed">\("Professional"\);/,
        `const [theme, setTheme] = useState<"Professional" | "Minimalist" | "Condensed">("Professional");
  const [watermark, setWatermark] = useState<"DRAFT" | "CONFIDENTIAL" | "NONE">("NONE");`);
    
    modal = modal.replace(/const renderPdf = async \(brandState: boolean, currentSize: "a4" \| "legal", currentTheme: "Professional" \| "Minimalist" \| "Condensed"\) => \{/,
        'const renderPdf = async (brandState: boolean, currentSize: "a4" | "legal", currentTheme: "Professional" | "Minimalist" | "Condensed", currentWatermark: "DRAFT" | "CONFIDENTIAL" | "NONE") => {');

    modal = modal.replace(/renderPdf\(useBranding, paperSize, theme\);/, 'renderPdf(useBranding, paperSize, theme, watermark);');
    
    modal = modal.replace(/payload\.theme = currentTheme;/, 'payload.theme = currentTheme;\n            payload.watermark = currentWatermark;');

    modal = modal.replace(/<select\s+value=\{theme\}/, 
        `<select
                 value={watermark}
                 onChange={(e) => setWatermark(e.target.value as "DRAFT" | "CONFIDENTIAL" | "NONE")}
                 className="bg-white border border-[#E8E4D9] text-[#4A443B] text-sm font-semibold rounded-xl px-3 py-2 outline-none cursor-pointer"
               >
                 <option value="NONE">No Watermark</option>
                 <option value="DRAFT">Draft</option>
                 <option value="CONFIDENTIAL">Confidential</option>
               </select>

               <select
                 value={theme}`);

    fs.writeFileSync('src/components/ui/PrintPreviewModal.tsx', modal);
    console.log('Updated PrintPreviewModal.tsx');
}
