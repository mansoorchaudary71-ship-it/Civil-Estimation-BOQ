const fs = require('fs');
let code = fs.readFileSync('./src/utils/GlobalReportEngine.tsx', 'utf8');

code = code.replace(
  /doc\.setFillColor\(15,\s*23,\s*42\);\s+doc\.rect\(0,\s*0,\s*pageWidth,\s*45,\s*"F"\);/,
  `if (safeData.theme === "Minimalist") {
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, pageWidth, 45, "F");
      doc.setDrawColor(226, 232, 240);
      doc.line(0, 45, pageWidth, 45);
    } else {
      doc.setFillColor(15, 23, 42); 
      doc.rect(0, 0, pageWidth, 45, "F");
    }`
);

code = code.replace(
  /doc\.setTextColor\(255,\s*255,\s*255\);\s+doc\.setFont\("helvetica",\s*"bold"\);\s+doc\.setFontSize\(22\);/,
  `doc.setTextColor(safeData.theme === "Minimalist" ? 15 : 255, safeData.theme === "Minimalist" ? 23 : 255, safeData.theme === "Minimalist" ? 42 : 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);`
);

code = code.replace(
  /doc\.setFontSize\(9\);\s+doc\.setTextColor\(255,\s*255,\s*255\);/,
  `doc.setFontSize(9);
    doc.setTextColor(safeData.theme === "Minimalist" ? 100 : 255, safeData.theme === "Minimalist" ? 116 : 255, safeData.theme === "Minimalist" ? 139 : 255);`
);

code = code.replace(
  /autoTable\(doc,\s*\{\s*startY:\s*currentY,[\s\S]*?head:\s*\[\["S\.No",\s*"Item Description",\s*"Qty",\s*"Unit",\s*"Rate \(Rs\)",\s*"Amount \(Rs\)"\]\],[\s\S]*?margin:\s*\{\s*left:\s*14,\s*right:\s*14\s*\},[\n\r]*\s*\n\s*\}\);/,
  `autoTable(doc, {
      startY: currentY,
      head: [["S.No", "Item Description", "Qty", "Unit", "Rate (Rs)", "Amount (Rs)"]],
      body: tableBody,
      theme: safeData.theme === "Minimalist" ? "plain" : "grid",
      headStyles: {
        fillColor: safeData.theme === "Minimalist" ? [255, 255, 255] : [249, 250, 251],
        textColor: [17, 24, 39],
        font: "helvetica",
        fontStyle: "bold",
        lineWidth: safeData.theme === "Minimalist" ? 0 : 0.1,
        lineColor: [229, 231, 235],
      },
      alternateRowStyles: safeData.theme === "Minimalist" ? undefined : { fillColor: [250, 250, 250] },
      styles: {
        font: "helvetica",
        fontSize: safeData.theme === "Condensed" ? 8 : 9,
        cellPadding: safeData.theme === "Condensed" ? 2 : 4,
        lineColor: [229, 231, 235],
        lineWidth: safeData.theme === "Minimalist" ? 0 : 0.1,
      },
      columnStyles: {
        0: { cellWidth: 30 },
        2: { halign: "center", cellWidth: 20 },
        3: { halign: "center", cellWidth: 15 },
        4: { halign: "right", cellWidth: 25 },
        5: { halign: "right", cellWidth: 35, fontStyle: "bold", textColor: [15, 23, 42] },
      },
      margin: { left: 14, right: 14 },
    });`
);

fs.writeFileSync('./src/utils/GlobalReportEngine.tsx', code);
