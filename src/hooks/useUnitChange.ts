import { useEffect, useState } from 'react';
import { useSettings, MeasurementSystem } from '../context/SettingsContext';

export function useUnitChange(callback: (newUnit: MeasurementSystem) => void) {
  useEffect(() => {
    const handleUnitChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ measurement: MeasurementSystem }>;
      if (customEvent.detail && customEvent.detail.measurement) {
        callback(customEvent.detail.measurement);
      }
    };
    window.addEventListener('units-changed', handleUnitChange);
    return () => {
      window.removeEventListener('units-changed', handleUnitChange);
    };
  }, [callback]);
}

type ConversionType = 'length' | 'area' | 'volume' | 'weight' | 'none';

const SI_TO_FPS = {
  length: 3.28084, // m to ft
  area: 10.76391,  // m2 to sq.ft
  volume: 35.31467,// m3 to cu.ft
  weight: 2.20462, // kg to lbs
  none: 1
};

const FPS_TO_SI = {
  length: 1 / 3.28084,
  area: 1 / 10.76391,
  volume: 1 / 35.31467,
  weight: 1 / 2.20462,
  none: 1
};

export function useConvertedState<T>(
  initialState: T,
  conversionRules?: T extends number | string ? ConversionType : (Record<keyof T, ConversionType> | ConversionType)
) {
  const [state, setState] = useState<T>(initialState);
  
  useUnitChange((newUnit) => {
    setState(prevState => {
      const isNowMetric = newUnit === 'SI';
      const factorMap = isNowMetric ? FPS_TO_SI : SI_TO_FPS;

      if (typeof prevState === 'number' || (typeof prevState === 'string' && !isNaN(Number(prevState)) && prevState.trim() !== '')) {
        const cType = (conversionRules as ConversionType) || 'none';
        if (cType !== 'none') {
          const num = Number(prevState);
          const converted = Number((num * factorMap[cType]).toFixed(3));
          return (typeof prevState === 'string' ? converted.toString() : converted) as unknown as T;
        }
        return prevState;
      }

      if (typeof prevState === 'object' && prevState !== null && !Array.isArray(prevState)) {
        const newState = { ...prevState } as any;
        for (const key in newState) {
          if (typeof newState[key] === 'number' || (typeof newState[key] === 'string' && !isNaN(Number(newState[key])) && String(newState[key]).trim() !== '')) {
            let cType: ConversionType = 'none';
            if (typeof conversionRules === 'string') {
              cType = conversionRules;
            } else if (conversionRules && (conversionRules as any)[key]) {
              cType = (conversionRules as any)[key];
            }
            if (cType !== 'none') {
              const num = Number(newState[key]);
              const converted = Number((num * factorMap[cType]).toFixed(3));
              newState[key] = typeof newState[key] === 'string' ? converted.toString() : converted;
            }
          }
        }
        return newState;
      }
      
      if (Array.isArray(prevState)) {
        const newState = [...prevState] as any;
        for (let i = 0; i < newState.length; i++) {
          if (typeof newState[i] === 'object' && newState[i] !== null) {
            for (const key in newState[i]) {
              if (typeof newState[i][key] === 'number' || (typeof newState[i][key] === 'string' && !isNaN(Number(newState[i][key])) && String(newState[i][key]).trim() !== '')) {
                let cType: ConversionType = 'none';
                if (typeof conversionRules === 'string') {
                  cType = conversionRules;
                } else if (conversionRules && (conversionRules as any)[key]) {
                  cType = (conversionRules as any)[key];
                }
                if (cType !== 'none') {
                  const num = Number(newState[i][key]);
                  const converted = Number((num * factorMap[cType]).toFixed(3));
                  newState[i][key] = typeof newState[i][key] === 'string' ? converted.toString() : converted;
                }
              }
            }
          }
        }
        return newState;
      }

      return prevState;
    });
  });

  return [state, setState] as const;
}
