import React, { useState, useEffect } from 'react';
import { formatNumberMask, parseNumberMask } from '../../lib/formatUtils';

interface MaskedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string | number;
  onValueChange: (rawValue: string) => void;
}

export function MaskedInput({ value, onValueChange, className, ...props }: MaskedInputProps) {
  const [displayValue, setDisplayValue] = useState(formatNumberMask(value));

  useEffect(() => {
    // If external value changes, sync the display value
    setDisplayValue(formatNumberMask(value));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawInput = e.target.value;
    // Allow ending with decimal
    if (rawInput.endsWith('.')) {
      setDisplayValue(rawInput);
      onValueChange(rawInput);
      return;
    }
    
    // Parse out everything but digits and decimals
    const numericValue = rawInput.replace(/[^0-9.]/g, '');
    
    setDisplayValue(formatNumberMask(numericValue));
    onValueChange(numericValue);
  };

  return (
    <><label htmlFor="a11y-input-584" className="sr-only">Input</label>
<input id="a11y-input-584"
      type="text"
      inputMode="decimal"
      value={displayValue}
      onChange={handleChange}
      className={className}
      {...props}
    /></>
  );
}
