# Integration Guide: Detailed Calculation Methodology

This guide explains how to integrate the newly instantiated `<DetailedCalculationDisplay />` component into all existing and future calculation modules within Civil Estimation Pro.

## 1. Import the Component

Inside any tool module (e.g., `src/components/modules/EarthworksBase.tsx`), import the component and the types at the top of your file:

```tsx
import { DetailedCalculationDisplay, CalcStep } from '../ui/DetailedCalculationDisplay';
```

## 2. Define the Calculation Steps

Generate an array of `CalcStep` objects mapping out your math as the user modifies inputs. You can place this right below your result calculations inside the component's render function or via a `useMemo` hook.

```tsx
// Inside your React component

const calcSteps: CalcStep[] = useMemo(() => {
  return [
    {
      stepName: "Calculate Base Volume (Wet/Dry)",
      equation: "Volume = Length × Width × Depth",
      variables: [
        { name: "Length", value: length, unit: "ft" },
        { name: "Width", value: width, unit: "ft" },
        { name: "Depth", value: depth, unit: "ft" }
      ],
      substitution: `Volume = ${length} × ${width} × ${depth}`,
      result: (length * width * depth).toFixed(2),
      resultUnit: "cft",
      insight: "The raw geometric volume represents wet mix. Standard civil thumb rules convert this to dry volume to account for shrinkage and moisture loss during curing (factor of 1.54 typically)."
    },
    // Add additional steps...
  ];
}, [length, width, depth]); 
```

## 3. Render in the Result Section

Place the component underneath your primary "Result display" cards (e.g., under the Earthworks results). 

```tsx
{/* Existing Result Cards */}
<section className="space-y-6">
  {/* <div className="result-cards">...</div> */}
</section>

{/* New Strict Methodology Integration */}
<DetailedCalculationDisplay 
  title="Calculation Methodology"
  subtitle="Step-by-step rigorous engineering derivation"
  steps={calcSteps} 
/>
```

## Global Strategy

To enforce this for any future calculators:
1. Make a unified `<CalculatorBase />` wrapper component. 
2. Pass the `steps: CalcStep[]` array as a prop directly to `<CalculatorBase />`.
3. The Base component structurally ensures every child tool automatically renders the `DetailedCalculationDisplay` with the "Samsung One UI Aesthetic" requirements provided globally, preventing the publishing of any tool lacking transparency. 
