const fs = require('fs');

function addExport(file, tableMatcher, insertMatcher, tableId, filename) {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  
  if (content.includes('GenericExportButtons')) return;

  // Add import
  const importStatement = 'import { GenericExportButtons } from "../ui/GenericExportButtons";\n';
  // Try finding last import
  const lastImportIndex = content.lastIndexOf('import ');
  if (lastImportIndex !== -1) {
    const endOfImport = content.indexOf('\n', lastImportIndex);
    content = content.slice(0, endOfImport + 1) + importStatement + content.slice(endOfImport + 1);
  } else {
    content = importStatement + content;
  }

  // Add id to table
  content = content.replace(tableMatcher, `<table id="${tableId}" ${tableMatcher.substring(6)}`);

  // Add component
  const exportMarkup = `\n<div className="flex justify-end mb-4"><GenericExportButtons tableId="${tableId}" filename="${filename}" /></div>\n`;
  content = content.replace(insertMatcher, exportMarkup + insertMatcher);

  fs.writeFileSync(file, content);
  console.log(`Updated ${file}`);
}

addExport(
  '/app/applet/src/components/modules/ConstructionCostSummary.tsx',
  '<table className="w-full text-left border-collapse">',
  '<div className="overflow-x-auto">',
  'cost-summary-table',
  'Cost_Summary'
);

addExport(
  '/app/applet/src/components/modules/MeasurementSheetCalculator.tsx',
  '<table className="w-full text-left border-collapse min-w-[800px]">',
  '<div className="p-0 overflow-x-auto">',
  'measurement-sheet-table',
  'Measurement_Sheet'
);

addExport(
  '/app/applet/src/components/modules/EarthworksBase.tsx',
  '<table className="w-full text-left border-collapse">',
  '<div className="overflow-x-auto">',
  'earthworks-table',
  'Earthworks_Base'
);

addExport(
  '/app/applet/src/components/modules/MaterialTakeoffSheet.tsx',
  '<table className="w-full text-left border-collapse">',
  '<div className="overflow-x-auto">',
  'material-takeoff-table',
  'Material_Takeoff'
);

addExport(
  '/app/applet/src/components/modules/WashroomEstimator.tsx',
  '<table className="boq-table-print-breaks w-full text-left text-sm">',
  '<div className="flex-1 overflow-auto p-4">',
  'washroom-table',
  'Washroom_Estimate'
);

