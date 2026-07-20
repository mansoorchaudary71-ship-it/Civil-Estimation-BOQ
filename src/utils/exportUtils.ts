export function exportToCSV(filename: string, headers: string[], rows: any[][]) {
  const processRow = (row: any[]) => {
    return row.map(cell => {
      if (cell === null || cell === undefined) return '';
      let cellString = cell.toString();
      // Escape quotes
      cellString = cellString.replace(/"/g, '""');
      // Quote strings containing commas, quotes, or newlines
      if (cellString.search(/("|,|\n)/g) >= 0) {
        cellString = `"${cellString}"`;
      }
      return cellString;
    }).join(',');
  };

  const csvContent = [
    headers,
    ...rows
  ].map(processRow).join('\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' }); // \uFEFF is BOM for Excel UTF-8 support
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  if (!filename.toLowerCase().endsWith('.csv')) {
    filename += '.csv';
  }
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportTableToCSV(tableId: string, filename: string) {
  const table = document.getElementById(tableId) as HTMLTableElement;
  if (!table) {
    console.error(`Table with id ${tableId} not found.`);
    return;
  }

  const headers: string[] = [];
  const rows: any[][] = [];

  // Parse headers
  const headerCells = table.querySelectorAll('thead th');
  headerCells.forEach(cell => {
    headers.push((cell.textContent || '').trim());
  });

  // Parse rows
  const bodyRows = table.querySelectorAll('tbody tr');
  bodyRows.forEach(tr => {
    const rowData: string[] = [];
    tr.querySelectorAll('td').forEach(td => {
      rowData.push((td.textContent || '').trim());
    });
    rows.push(rowData);
  });
  
  // If no headers were found in thead, maybe they are in the first tr
  if (headers.length === 0 && rows.length > 0) {
    headers.push(...rows[0]);
    rows.shift();
  }

  exportToCSV(filename, headers, rows);
}
