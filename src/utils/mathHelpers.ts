export const parseNum = (val: string | number | undefined | null): number => {
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (!val) return 0;
  return parseFloat(String(val)) || 0;
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
    if (saved) {
      const parsed = JSON.parse(saved);
      currency = parsed.currency || 'PKR';
    }
    const currencySymbols: Record<string, string> = {
      PKR: 'Rs', USD: '$', INR: '₹', AED: 'AED', SAR: 'SAR', GBP: '£', BDT: '৳'
    };
    const getExchangeRate = (curr: string) => {
      switch (curr) {
        case 'USD': return 1 / 278;
        case 'SAR': return 1 / 74;
        case 'INR': return 1 / 3.33;
        case 'AED': return 1 / 75;
        case 'GBP': return 1 / 350;
        case 'BDT': return 1 / 2.3;
        default: return 1;
      }
    };
    const symbol = currencySymbols[currency] || 'Rs';
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
