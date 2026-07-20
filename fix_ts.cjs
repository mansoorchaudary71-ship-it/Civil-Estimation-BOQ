const fs = require('fs');

// Fix 1: LiveBOQ.tsx missing GenericExportButtons import
let liveBoq = fs.readFileSync('/app/applet/src/components/modules/LiveBOQ.tsx', 'utf8');
if (!liveBoq.includes('GenericExportButtons')) {
    // it says TS2304: Cannot find name 'GenericExportButtons'.
    // wait, it is in the file but not imported.
}
if (!liveBoq.includes('import { GenericExportButtons }')) {
    const importStr = 'import { GenericExportButtons } from "../ui/GenericExportButtons";\n';
    const lastImportIndex = liveBoq.lastIndexOf('import ');
    if (lastImportIndex !== -1) {
        const endOfImport = liveBoq.indexOf('\n', lastImportIndex);
        liveBoq = liveBoq.slice(0, endOfImport + 1) + importStr + liveBoq.slice(endOfImport + 1);
    } else {
        liveBoq = importStr + liveBoq;
    }
    fs.writeFileSync('/app/applet/src/components/modules/LiveBOQ.tsx', liveBoq);
    console.log('Fixed LiveBOQ.tsx');
}

// Fix 2: PrintPreviewModal.tsx TS error
let modal = fs.readFileSync('/app/applet/src/components/ui/PrintPreviewModal.tsx', 'utf8');
if (modal.includes('margin: [10, 10, 10, 10], // top, left, bottom, right')) {
    modal = modal.replace(
        'margin: [10, 10, 10, 10], // top, left, bottom, right',
        'margin: [10, 10, 10, 10] as [number, number, number, number], // top, left, bottom, right'
    );
    fs.writeFileSync('/app/applet/src/components/ui/PrintPreviewModal.tsx', modal);
    console.log('Fixed PrintPreviewModal.tsx');
}

