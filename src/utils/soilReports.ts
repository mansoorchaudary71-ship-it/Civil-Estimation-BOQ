import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface SoilReportDetails {
  projectName: string;
  clientName: string;
  labName: string;
  sampleId: string;
  depth: string;
  testedBy: string;
  date: string;
}

export const generateGeotechReportPDF = async (
  testType: string,
  details: SoilReportDetails,
  results: { label: string, value: string }[],
  interpretation: string,
  chartBase64?: string
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;

  // 1. Header (Dark Navy Blue)
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, pageWidth, 40, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text(`Geotechnical Lab Report`, 14, 22);
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(details.labName || "Central Soils Laboratory", pageWidth - 14, 22, { align: "right" });
  
  // Tag
  doc.setFillColor(13, 148, 136); // Teal Tag
  doc.rect(14, 28, 85, 6, "F");
  doc.setFontSize(9);
  doc.text(`Test Method: ${testType}`, 16, 32.5);

  let currentY = 50;

  // 2. Project Details
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Sample Information", 14, currentY);
  
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(14, currentY + 3, pageWidth - 14, currentY + 3);
  
  currentY += 10;
  doc.setFontSize(10);
  doc.setTextColor(50, 50, 50);
  
  const entries = [
    { label: "Project Name:", value: details.projectName },
    { label: "Client Name:", value: details.clientName },
    { label: "Sample ID:", value: details.sampleId },
    { label: "Depth:", value: details.depth },
    { label: "Tested By:", value: details.testedBy },
    { label: "Date of Testing:", value: details.date }
  ];

  let isLeft = true;
  for (const entry of entries) {
    if(!entry.value) continue;
    const x = isLeft ? 14 : pageWidth / 2 + 5;
    doc.setFont("helvetica", "bold");
    doc.text(entry.label, x, currentY);
    doc.setFont("helvetica", "normal");
    doc.text(entry.value, x + doc.getTextWidth(entry.label) + 2, currentY);
    
    if (!isLeft) currentY += 8;
    isLeft = !isLeft;
  }
  if (!isLeft) currentY += 8;

  currentY += 10;

  // 3. Results Results Table
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Test Results", 14, currentY);
  doc.line(14, currentY + 3, pageWidth - 14, currentY + 3);
  
  currentY += 8;
  
  autoTable(doc, {
    startY: currentY,
    body: results.map(r => [r.label, r.value]),
    theme: "grid",
    styles: { font: "helvetica", fontSize: 11, cellPadding: 5 },
    columnStyles: {
      0: { fontStyle: "bold", fillColor: [248, 250, 252], textColor: [30, 41, 59], cellWidth: 100 },
      1: { textColor: [15, 23, 42] },
    },
    margin: { left: 14, right: 14 },
  });

  currentY = (doc as any).lastAutoTable.finalY + 15;

  // 4. Chart / Graph
  if (chartBase64) {
    if (currentY > pageHeight - 120) {
      doc.addPage();
      currentY = 20;
    }
    // Try to center the chart
    doc.addImage(chartBase64, "PNG", 30, currentY, 150, 90);
    currentY += 100;
  }

  // 5. Interpretation
  if (interpretation) {
    if (currentY > pageHeight - 50) {
        doc.addPage();
        currentY = 20;
    }
    doc.setFillColor(243, 244, 246);
    // Dynamic height based on lines
    const lines = doc.splitTextToSize(interpretation, pageWidth - 36);
    doc.rect(14, currentY, pageWidth - 28, Math.max(40, lines.length * 6 + 20), "F");
    
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.setFont("helvetica", "bold");
    doc.text("Result Interpretation & Classification", 18, currentY + 8);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    
    doc.text(lines, 18, currentY + 18);
  }
  
  // Footer text
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.setFont("helvetica", "normal");
  doc.text(
    "* This is a computer-generated preliminary report based on provided input values.",
    14,
    pageHeight - 15,
  );

  doc.save(`LabReport_${testType.replace(/\s+/g,'_')}_${details.sampleId || 'Sample'}.pdf`);
};
