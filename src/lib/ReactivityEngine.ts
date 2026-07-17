export class ReactivityEngine {
  private static instance: ReactivityEngine;
  private currentMeasurement: 'SI' | 'FPS' = 'SI';
  private currentCurrency: string = 'PKR';
  private exchangeRates: Record<string, number> = {
    PKR: 1, USD: 1/278, INR: 1/3.33, AED: 1/75, SAR: 1/74, GBP: 1/350, BDT: 1/2.3, LKR: 1/0.9, EUR: 1/300
  };
  private currencySymbols: Record<string, string> = {
    PKR: 'Rs', USD: '$', INR: '₹', AED: 'AED', SAR: 'SAR', GBP: '£', BDT: '৳', LKR: 'Rs', EUR: '€'
  };

  private constructor() {
    this.init();
  }

  public static getInstance(): ReactivityEngine {
    if (!ReactivityEngine.instance) {
      ReactivityEngine.instance = new ReactivityEngine();
    }
    return ReactivityEngine.instance;
  }

  private init() {
    if (typeof window === 'undefined') return;

    window.addEventListener('units-changed', (e: any) => {
      this.handleMeasurementChange(e.detail.measurement);
    });

    window.addEventListener('currency-changed', (e: any) => {
      this.handleCurrencyChange(e.detail.currency);
    });
  }

  private setReactInputValue(element: HTMLInputElement | HTMLTextAreaElement, value: string) {
    let nativeSetter: any = null;
    if (element instanceof HTMLInputElement) {
       nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
    } else if (element instanceof HTMLTextAreaElement) {
       nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
    }
    
    if (nativeSetter) {
      nativeSetter.call(element, value);
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      element.value = value;
      element.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  private handleMeasurementChange(newSystem: 'SI' | 'FPS') {
    if (this.currentMeasurement === newSystem) return;
    const oldSystem = this.currentMeasurement;
    this.currentMeasurement = newSystem;

    const inputs = document.querySelectorAll<HTMLInputElement>('input[data-unit-type]');
    inputs.forEach(input => {
      const type = input.getAttribute('data-unit-type');
      if (!input.value || isNaN(Number(input.value))) return;
      
      const val = parseFloat(input.value);
      let newVal = val;

      if (type === 'length') {
        if (oldSystem === 'SI' && newSystem === 'FPS') newVal = val * 3.28084;
        else if (oldSystem === 'FPS' && newSystem === 'SI') newVal = val / 3.28084;
      } else if (type === 'length-small') {
        if (oldSystem === 'SI' && newSystem === 'FPS') newVal = val / 25.4;
        else if (oldSystem === 'FPS' && newSystem === 'SI') newVal = val * 25.4;
      } else if (type === 'area') {
        if (oldSystem === 'SI' && newSystem === 'FPS') newVal = val * 10.7639;
        else if (oldSystem === 'FPS' && newSystem === 'SI') newVal = val / 10.7639;
      } else if (type === 'volume') {
        if (oldSystem === 'SI' && newSystem === 'FPS') newVal = val * 35.3147;
        else if (oldSystem === 'FPS' && newSystem === 'SI') newVal = val / 35.3147;
      } else if (type === 'weight') {
        if (oldSystem === 'SI' && newSystem === 'FPS') newVal = val * 2.20462;
        else if (oldSystem === 'FPS' && newSystem === 'SI') newVal = val / 2.20462;
      } else if (type === 'density') {
        if (oldSystem === 'SI' && newSystem === 'FPS') newVal = val * 0.062428;
        else if (oldSystem === 'FPS' && newSystem === 'SI') newVal = val / 0.062428;
      }

      const precision = type === 'length-small' ? 2 : 4;
      this.setReactInputValue(input, Number(newVal.toFixed(precision)).toString());
    });

    const labels = document.querySelectorAll<HTMLElement>('[data-unit-label]');
    labels.forEach(label => {
      const type = label.getAttribute('data-unit-label');
      if (type === 'length') label.textContent = newSystem === 'SI' ? 'm' : 'ft';
      else if (type === 'length-small') label.textContent = newSystem === 'SI' ? 'mm' : 'in';
      else if (type === 'area') label.textContent = newSystem === 'SI' ? 'm²' : 'sq.ft';
      else if (type === 'volume') label.textContent = newSystem === 'SI' ? 'm³' : 'cu.ft';
      else if (type === 'weight') label.textContent = newSystem === 'SI' ? 'kg' : 'lbs';
      else if (type === 'density') label.textContent = newSystem === 'SI' ? 'kg/m³' : 'lbs/ft³';
    });
  }

  private handleCurrencyChange(newCurrency: string) {
    if (this.currentCurrency === newCurrency) return;
    const oldCurrency = this.currentCurrency;
    this.currentCurrency = newCurrency;

    const oldRate = this.exchangeRates[oldCurrency] || 1;
    const newRate = this.exchangeRates[newCurrency] || 1;
    const conversionFactor = newRate / oldRate;

    const inputs = document.querySelectorAll<HTMLInputElement>('input[data-currency-field="true"]');
    inputs.forEach(input => {
      if (!input.value || isNaN(Number(input.value))) return;
      const val = parseFloat(input.value);
      const newVal = val * conversionFactor;
      this.setReactInputValue(input, Number(newVal.toFixed(2)).toString());
    });

    const symbols = document.querySelectorAll<HTMLElement>('[data-currency-symbol="true"]');
    symbols.forEach(symbol => {
      symbol.textContent = this.currencySymbols[newCurrency] || newCurrency;
    });
    
    const labels = document.querySelectorAll<HTMLElement>('[data-currency-label="true"]');
    labels.forEach(label => {
      label.textContent = newCurrency;
    });
  }

  public syncCurrentState(measurement: 'SI' | 'FPS', currency: string) {
    this.currentMeasurement = measurement;
    this.currentCurrency = currency;
  }
}

export function initReactivity() {
  if (typeof window !== 'undefined') {
    ReactivityEngine.getInstance();
  }
}
