const fs = require('fs');

function addExport(file, tableMatcher, insertMatcher, tableId, filename) {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  
  if (content.includes('GenericExportButtons')) return;

  const importStatement = 'import { GenericExportButtons } from "../ui/GenericExportButtons";\n';
  const lastImportIndex = content.lastIndexOf('import ');
  if (lastImportIndex !== -1) {
    const endOfImport = content.indexOf('\n', lastImportIndex);
    content = content.slice(0, endOfImport + 1) + importStatement + content.slice(endOfImport + 1);
  } else {
    content = importStatement + content;
  }

  content = content.replace(tableMatcher, `<table id="${tableId}" ${tableMatcher.substring(6)}`);

  const exportMarkup = `\n<div className="flex justify-end mb-4"><GenericExportButtons tableId="${tableId}" filename="${filename}" /></div>\n`;
  content = content.replace(insertMatcher, exportMarkup + insertMatcher);

  fs.writeFileSync(file, content);
  console.log(`Updated ${file}`);
}

addExport(
  '/app/applet/src/components/modules/DetailedRoomEstimators.tsx',
  '<table className="w-full text-left">',
  '<div className="overflow-x-auto">',
  'room-estimators-table',
  'Room_Estimators'
);

addExport(
  '/app/applet/src/components/modules/DoorWindowSchedule.tsx',
  '<table className="w-full text-left min-w-[1000px]">',
  '<div className="overflow-x-auto">',
  'door-window-table',
  'Door_Window_Schedule'
);

addExport(
  '/app/applet/src/components/modules/HouseEstimator.tsx',
  '<table className="w-full text-left border-collapse">',
  '<div className="overflow-x-auto">',
  'house-estimator-table',
  'House_Estimate'
);

