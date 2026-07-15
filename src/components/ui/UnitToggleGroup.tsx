import React from 'react';
import SegmentedToggle from './SegmentedToggle';

interface UnitToggleGroupProps {
  units: { id: string; label: string }[];
  activeUnit: string;
  onChange: (unit: string) => void;
  size?: 'sm' | 'md' | 'lg';
  colorTheme?: any;
}

export default function UnitToggleGroup({ 
  units, 
  activeUnit, 
  onChange, 
  size = 'md',
  colorTheme
}: UnitToggleGroupProps) {
  return (
    <SegmentedToggle
      options={units.map(u => ({ value: u.id, label: u.label }))}
      selectedValue={activeUnit}
      onChange={onChange}
      size={size}
      colorTheme={colorTheme}
    />
  );
}
