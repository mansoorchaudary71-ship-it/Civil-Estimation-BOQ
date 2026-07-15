export function formatNumberMask(value: string | number): string {
  if (value === undefined || value === null) return '';
  const strValue = value.toString().replace(/,/g, '');
  const numValue = parseFloat(strValue);
  if (isNaN(numValue)) return strValue;
  return new Intl.NumberFormat('en-US').format(numValue);
}

export function parseNumberMask(value: string): number {
  return parseFloat(value.replace(/,/g, '')) || 0;
}
