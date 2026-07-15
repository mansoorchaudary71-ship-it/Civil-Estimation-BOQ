import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateProgressPDF = async (phases: any[], metrics: any, sCurveBase64?: string, histogramBase64?: string) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, pageWidth, 40, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text(`Site Progress Report`, 14, 22);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(new Date().toLocaleDateString(), pageWidth - 14, 22, { align: "right" });

  let currentY = 50;
  
  // Executive Summary
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Executive Summary", 14, currentY);
  
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(14, currentY + 3, pageWidth - 14, currentY + 3);
  
  currentY += 10;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  
  const perfStatus = metrics.daysAheadBehind >= 0 ? "Ahead of Schedule" : Math.abs(metrics.daysAheadBehind) <= 7 ? "Slightly Behind Schedule (Amber)" : "Significantly Behind Schedule (Red)";
  
  doc.text(`Overall Progress: ${metrics.overallProgress.toFixed(1)}%`, 14, currentY);
  doc.text(`Schedule Status: ${Math.abs(metrics.daysAheadBehind)} days ${perfStatus}`, 14, currentY + 6);
  doc.text(`Total Budget: $${metrics.totalBudget.toLocaleString()}`, 14, currentY + 12);
  doc.text(`Actual Cost: $${metrics.totalCost.toLocaleString()}`, 14, currentY + 18);
  doc.text(`Cost Variance: $${(metrics.totalBudget - metrics.totalCost).toLocaleString()}`, 14, currentY + 24);
  doc.text(`SPI (Schedule Perf Index): ${metrics.SPI.toFixed(2)}`, 14, currentY + 30);
  doc.text(`CPI (Cost Perf Index): ${metrics.CPI.toFixed(2)}`, 14, currentY + 36);
  
  currentY += 45;

  // S-Curve & Histogram
  if (sCurveBase64) {
    if (currentY > 200) { doc.addPage(); currentY = 20; }
    doc.text("Project S-Curve (Planned vs Actual)", 14, currentY);
    doc.addImage(sCurveBase64, "PNG", 14, currentY + 5, 180, 80);
    currentY += 95;
  }
  
  if (histogramBase64) {
    if (currentY > 200) { doc.addPage(); currentY = 20; }
    doc.text("Resource & Burn Histogram", 14, currentY);
    doc.addImage(histogramBase64, "PNG", 14, currentY + 5, 180, 80);
    currentY += 95;
  }

  // Phase Table
  if (currentY > 240) { doc.addPage(); currentY = 20; }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Phase Breakdown", 14, currentY);
  doc.line(14, currentY + 3, pageWidth - 14, currentY + 3);
  
  currentY += 8;

  const tableData = phases.map(p => [
    p.name,
    `${p.progress}%`,
    p.startDate,
    p.endDate,
    `$${p.budget}`,
    `$${p.actualCost}`
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['Phase', 'Progress', 'Start Date', 'End Date', 'Budget', 'Actual Cost']],
    body: tableData,
    theme: "grid",
    styles: { font: "helvetica", fontSize: 9 },
    headStyles: { fillColor: [15, 23, 42] }
  });
  
  currentY = (doc as any).lastAutoTable.finalY + 15;

  // Add photos if space permits or on new pages
  doc.addPage();
  currentY = 20;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Site Photo Evidence", 14, currentY);
  doc.line(14, currentY + 3, pageWidth - 14, currentY + 3);
  
  currentY += 10;
  
  for (const phase of phases) {
    if (phase.photos && phase.photos.length > 0) {
      if (currentY > 240) { doc.addPage(); currentY = 20; }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(phase.name, 14, currentY);
      currentY += 5;
      
      let xOffset = 14;
      for (let i = 0; i < phase.photos.length; i++) {
        if (xOffset > 150) {
            xOffset = 14;
            currentY += 45;
        }
        if (currentY > 250) {
            doc.addPage();
            currentY = 20;
            xOffset = 14;
        }
        // Very basic photo add
        try {
            doc.addImage(phase.photos[i], "JPEG", xOffset, currentY, 40, 40);
        } catch(e) {}
        xOffset += 45;
      }
      currentY += 50;
    }
  }

  doc.save(`Progress_Report_${new Date().toISOString().split('T')[0]}.pdf`);
};

export const exportToMSProject = (phases: any[]) => {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<Project xmlns="http://schemas.microsoft.com/project">
    <Name>Enhanced Progress Tracked Project</Name>
    <Tasks>
`;
    phases.forEach((p, idx) => {
        xml += `
        <Task>
            <UID>${idx + 1}</UID>
            <ID>${idx + 1}</ID>
            <Name>${p.name}</Name>
            <Start>${p.startDate}T08:00:00</Start>
            <Finish>${p.endDate}T17:00:00</Finish>
            <PercentComplete>${p.progress}</PercentComplete>
            <Cost>${p.actualCost}</Cost>
        </Task>`;
    });
    xml += `
    </Tasks>
</Project>`;

    const blob = new Blob([xml], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Project_Export_${new Date().toISOString().split('T')[0]}.xml`;
    a.click();
};

export const exportToCSV = (phases: any[]) => {
    let csv = "Phase Name,Start Date,End Date,Progress %,Planned Budget ($),Actual Cost ($),Planned Workers,Actual Workers\n";
    phases.forEach(p => {
        csv += `"${p.name}","${p.startDate}","${p.endDate}",${p.progress},${p.budget},${p.actualCost},${p.workersPlanned || 0},${p.workersActual || 0}\n`;
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Progress_Gantt_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
};
