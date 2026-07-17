export const parseNum = (val: string | number | undefined | null): number => {
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (!val) return 0;
  return parseFloat(String(val)) || 0;
};

export const parseSafeNumber = (val: string | number | undefined | null, fallback: number = 0): number => {
  const parsed = parseNum(val);
  return isFinite(parsed) ? parsed : fallback;
};

export const isNumeric = (val: string | number | undefined | null): boolean => {
  if (val === null || val === undefined || val === '') return false;
  const num = Number(val);
  return !isNaN(num) && isFinite(num);
};

export const formatVolume = (val: number): string => {
  return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export const formatBags = (val: number): string => {
  return val.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

export const formatCost = (val: number): string => {
  try {
    const saved = localStorage.getItem('app-settings');
    let currency = 'PKR';
    let customRates: Record<string, number> = {};
    let customSymbols: Record<string, string> = {};
    if (saved) {
      const parsed = JSON.parse(saved);
      currency = parsed.currency || 'PKR';
      customRates = parsed.customExchangeRates || {};
      customSymbols = parsed.customCurrencySymbols || {};
    }
    const defaultSymbols: Record<string, string> = {
      PKR: 'Rs', USD: '$', INR: '₹', AED: 'AED', SAR: 'SAR', GBP: '£', BDT: '৳', LKR: 'Rs'
    };
    const defaultRates: Record<string, number> = {
      PKR: 1, USD: 1 / 278, INR: 1 / 3.33, AED: 1 / 75, SAR: 1 / 74, GBP: 1 / 350, BDT: 1 / 2.3, LKR: 1 / 0.9
    };
    const getExchangeRate = (curr: string) => customRates[curr] || defaultRates[curr] || 1;
    const symbol = customSymbols[currency] || defaultSymbols[currency] || 'Rs';
    const rate = getExchangeRate(currency);
    const amount = val * rate;
    const decimals = currency === 'PKR' ? 0 : 2;
    return `${symbol} ${amount.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
  } catch (e) {
    return `Rs ${val.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  }
};

export const formatNumber = (val: number, decimals: number = 2): string => {
  return val.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
};
